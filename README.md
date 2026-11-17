# NIGHT CITY ARCHIVE — sito della campagna Cyberpunk RED

Sito statico (HTML/CSS/JS, nessuna installazione) con:

- **Database** di NPC, fazioni, luoghi e oggetti: immagine, nome, alias, fazione, ruolo, stato (vivo/flatlined…), rapporto col party, luogo, tag, descrizione, note e **campi personalizzati illimitati** (Cyberware, Armi, Debiti…). Ricerca e filtri per tipo, fazione, stato. Le fazioni mostrano in automatico i membri.
- **Galleria immagini**: ogni scheda può avere più immagini (la prima è la copertina). Nel dossier si scorrono con le frecce a schermo, le frecce della tastiera o lo swipe sul telefono; clic per lo schermo intero.
- **Calendario** dal 2045: vista mese per mese, clic su un giorno per la pagina con gli eventi dettagliati (ora, tipo, luogo, NPC coinvolti con link al database). La "data in gioco" si imposta da ⚙ o dalla pagina del giorno.
- **Meteo** (manuale, giorno per giorno): 14 condizioni ispirate al DLC gratuito *Night City Weather* di R. Talsorian (sereno, smog, pioggia acida, pioggia di sangue, tempesta di cenere, vento radioattivo…) con icona e temperatura in °C. Si vede nelle celle del mese, nella pagina del giorno e in home accanto alla data in gioco. Condizioni e unità di misura si cambiano in cima a `js/app.js` (`WEATHER`, `TEMP_UNIT`).
- **Appunti**: note libere con categoria, tag, ricerca e note fissate in cima.
- **Tracce**: canzoni con copertina, testo, note; audio **caricato dal PC**, **da file nella cartella `music/`** o **link Suno** (con player Suno incorporato).
- Tutto **modificabile dal sito** (pulsanti *Nuovo*, *Modifica*, *Elimina*, e ⚙ per titolo/introduzione della home).
- **Backup** in un file JSON (⚙ → Esporta / Importa).

---

## 1. Due modalità di salvataggio

| | Locale (default) | Cloud (Supabase, gratis) |
|---|---|---|
| Dove stanno i dati | solo nel browser di chi li inserisce | database online condiviso |
| Chi vede | solo tu, su quel PC | tutti quelli con il link |
| Chi modifica | tu | solo chi ha fatto login |
| Configurazione | nessuna | ~10 minuti, una volta sola |

La modalità locale va bene per provare. **Per farlo vedere ai giocatori serve la modalità cloud**: prepara i dati in locale se vuoi, poi esporta il backup e reimportalo dopo aver attivato il cloud.

---

## 2. Attivare la modalità cloud (Supabase, piano gratuito)

1. Crea un account su <https://supabase.com> → **New project** (scegli una password per il database e la regione *Central EU*).
2. Nel progetto apri **SQL Editor** → **New query**, incolla tutto il contenuto di [`supabase/schema.sql`](supabase/schema.sql) e premi **Run**.
3. **Authentication → Users → Add user → Create new user**: inserisci la tua email e una password (spunta *Auto Confirm User*). Ripeti per ogni giocatore che deve poter modificare.
4. **Importante — blocca le registrazioni**: *Authentication → Sign In / Providers* → disattiva **Allow new users to sign up**. Così nessuno sconosciuto può crearsi un account e modificare il sito.
5. **Project Settings → API** (o *Data API*): copia **Project URL** e la chiave **anon public**, e incollale in [`js/config.js`](js/config.js):

   ```js
   supabaseUrl: "https://xxxxxxxx.supabase.co",
   supabaseAnonKey: "eyJhbGciOi...",
   ```

   La chiave *anon* è pensata per stare nel codice pubblico: la sicurezza la fanno le regole SQL del punto 2. **Non** usare mai la chiave *service_role*.
6. Apri il sito → ⚙ → **Accedi** con l'utente creato. Ora vedi i pulsanti di modifica.

Limiti del piano gratuito: 500 MB di database, 1 GB di file (immagini/audio), file fino a 50 MB. Un progetto gratuito **va in pausa dopo 7 giorni senza visite**: basta riattivarlo dal pannello Supabase (i dati restano).

> Le note sono leggibili da chiunque abbia il link: non scrivere nel database segreti del master che i giocatori non devono vedere.

---

## 3. Pubblicare il sito gratis

### Opzione A — Netlify Drop (la più semplice)
1. Vai su <https://app.netlify.com/drop> (account gratuito).
2. Trascina **l'intera cartella del sito** nella pagina.
3. Ottieni un indirizzo tipo `https://nome-a-caso.netlify.app` (lo puoi rinominare in *Site configuration → Change site name*).
4. Per aggiornare (es. nuove canzoni in `music/`): *Deploys* → trascina di nuovo la cartella.

### Opzione B — GitHub Pages
1. Crea un repository su GitHub e carica tutti i file (anche `.nojekyll`).
2. *Settings → Pages → Source: Deploy from a branch → main / root*.
3. Il sito sarà su `https://tuonome.github.io/nome-repo/`.

Anche **Cloudflare Pages** funziona allo stesso modo (carichi la cartella, nessuna build).

> Le modifiche fatte dal sito (NPC, tracce, immagini caricate) **non** richiedono di ripubblicare: vanno su Supabase. Ripubblichi solo se cambi i file (codice o la cartella `music/`).

---

## 4. Canzoni

- **Link Suno**: incolla il link della canzone (`https://suno.com/song/…`). Compare il pulsante *▶ Player Suno* e *Apri su Suno*. I link corti `suno.com/s/…` funzionano solo come link esterno: apri il link nel browser e copia l'indirizzo completo `…/song/…` per avere il player incorporato.
- **File caricato**: *Carica file* nel modulo — finisce su Supabase (cloud) o nel browser (locale).
- **File nella cartella `music/`**: copia l'mp3 in `music/` e scrivi `music/nome-file.mp3`. Viene pubblicato col sito (utile per file grandi o per non usare spazio Supabase).

Puoi mettere sia il link Suno sia il file audio sulla stessa traccia.

---

## 5. Provarlo sul PC

Apri `index.html` con Chrome o Edge (doppio clic). Se qualcosa non funziona aprendolo da file, avvia un piccolo server nella cartella:

```bash
python -m http.server 8000
```

e vai su <http://localhost:8000>.

---

## 6. Personalizzare

- **Ruoli, stati, tipi di record, rapporti**: in cima a [`js/app.js`](js/app.js) (`KINDS`, `ROLES`, `STATUSES`, `ATTITUDES`). Puoi aggiungere per esempio un tipo `{ id: "veicolo", label: "Veicolo", plural: "Veicoli", color: "var(--green)" }`.
- **Colori e font**: variabili all'inizio di [`css/style.css`](css/style.css).
- **Titolo, sottotitolo, introduzione**: direttamente dal sito, ⚙ → *Pagina iniziale*.

## Struttura

```
index.html          pagina unica
css/style.css       grafica
js/config.js        configurazione (Supabase)
js/store.js         salvataggio (locale / cloud)
js/app.js           interfaccia
supabase/schema.sql setup del database
music/              i tuoi file audio
```
