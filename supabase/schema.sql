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

-- Chiunque abbia il link può LEGGERE
drop policy if exists "records_read" on public.records;
create policy "records_read" on public.records
  for select using (true);

-- Solo gli utenti con login possono SCRIVERE
drop policy if exists "records_insert" on public.records;
create policy "records_insert" on public.records
  for insert to authenticated with check (true);

drop policy if exists "records_update" on public.records;
create policy "records_update" on public.records
  for update to authenticated using (true) with check (true);

drop policy if exists "records_delete" on public.records;
create policy "records_delete" on public.records
  for delete to authenticated using (true);

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
