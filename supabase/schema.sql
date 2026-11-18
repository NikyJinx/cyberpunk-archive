-- ============================================================
--  NIGHT CITY ARCHIVE — setup Supabase
--  Incolla tutto nel "SQL Editor" di Supabase e premi RUN.
-- ============================================================

-- Tabella unica per NPC/fazioni/luoghi, tracce e impostazioni
create table if not exists public.records (
  id          text primary key,
  collection  text not null,            -- 'entries' | 'songs' | 'meta'
  data        jsonb not null default '{}'::jsonb,
  updated_at  timestamptz not null default now()
);
create index if not exists records_collection_idx on public.records (collection);

alter table public.records enable row level security;

-- ------------------------------------------------------------
--  RUOLO GM — righe segrete visibili solo ai master
--  (puoi rieseguire tutto il file: non cancella nessun dato)
-- ------------------------------------------------------------
-- righe "solo GM": NPC e appunti segreti, note del GM, mappe e token nascosti, tiri segreti
alter table public.records add column if not exists gm_only boolean not null default false;

-- elenco dei master (email degli account)
create table if not exists public.gm_users (
  email      text primary key,
  added_at   timestamptz not null default now()
);
alter table public.gm_users enable row level security;

-- vero se l'utente collegato è un master
create or replace function public.is_gm() returns boolean
  language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.gm_users
    where lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;
grant execute on function public.is_gm() to anon, authenticated;

-- ogni utente vede solo se stesso nell'elenco; i master vedono e gestiscono tutto l'elenco
drop policy if exists "gm_users_read" on public.gm_users;
create policy "gm_users_read" on public.gm_users
  for select to authenticated
  using (public.is_gm() or lower(email) = lower(coalesce(auth.jwt() ->> 'email', '')));

drop policy if exists "gm_users_write" on public.gm_users;
create policy "gm_users_write" on public.gm_users
  for all to authenticated using (public.is_gm()) with check (public.is_gm());

-- Chiunque abbia il link può LEGGERE, tranne le righe segrete (solo i master)
drop policy if exists "records_read" on public.records;
create policy "records_read" on public.records
  for select using (not gm_only or public.is_gm());

-- Solo gli utenti con login possono SCRIVERE; le righe segrete solo i master
drop policy if exists "records_insert" on public.records;
create policy "records_insert" on public.records
  for insert to authenticated with check (not gm_only or public.is_gm());

drop policy if exists "records_update" on public.records;
create policy "records_update" on public.records
  for update to authenticated
  using (not gm_only or public.is_gm()) with check (not gm_only or public.is_gm());

drop policy if exists "records_delete" on public.records;
create policy "records_delete" on public.records
  for delete to authenticated using (not gm_only or public.is_gm());

-- IL PRIMO MASTER va aggiunto qui (gli altri si aggiungono poi dalla pagina GM del sito).
-- Togli i due trattini all'inizio della riga e metti la tua email:
-- insert into public.gm_users (email) values ('la-tua-email@esempio.com') on conflict do nothing;

-- Bucket pubblico per immagini e audio
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do update set public = true;

drop policy if exists "media_read" on storage.objects;
create policy "media_read" on storage.objects
  for select using (bucket_id = 'media');

drop policy if exists "media_insert" on storage.objects;
create policy "media_insert" on storage.objects
  for insert to authenticated with check (bucket_id = 'media');

drop policy if exists "media_update" on storage.objects;
create policy "media_update" on storage.objects
  for update to authenticated using (bucket_id = 'media');

drop policy if exists "media_delete" on storage.objects;
create policy "media_delete" on storage.objects
  for delete to authenticated using (bucket_id = 'media');
