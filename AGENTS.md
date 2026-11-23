# Istruzioni per gli assistenti (Claude, Antigravity e altri)

Questo file spiega **come lavorare** su Night City Archive. Cosa fa il sito e cosa c'è in ogni file è nel [README](README.md): leggilo prima di modificare qualcosa.

## Il progetto in breve
- Sito della campagna di Cyberpunk RED, pubblicato con GitHub Pages da `main`: https://nikyjinx.github.io/cyberpunk-archive/
- **Statico, senza build**: niente npm, bundler o framework. HTML, CSS e JavaScript «classici» (non moduli ES).
- Dati su **Supabase** (tabella `records`, schema in `supabase/schema.sql`) oppure, con la configurazione vuota, nel browser (IndexedDB, «modalità locale»).
- Testi del sito, commenti e messaggi di commit **in italiano**. I nomi delle regole del manuale (Handgun, Death Save, Black ICE…) restano in inglese, come nel resto del sito.

## Come sono fatti i file
- `index.html` carica gli script **in ordine**: `js/config.js`, `store.js`, `dice.js` (CPR), `net.js` (NET), `roles.js` (RL), `cyberware.js` (CW), `market.js` (MK), `hq.js` (HQ), poi i file di `js/ui/` da `core.js` a `boot.js`.
- I file di `js/ui/` condividono costanti e funzioni nello scope globale: una `const` definita in `core.js` si usa in `map.js`. **Non trasformarli in moduli** e non cambiare l'ordine senza motivo. Un file nuovo va aggiunto a `index.html` nel punto giusto.
- I cataloghi (armi, cyberware, droghe, programmi…) sono in `js/market.js`, `js/cyberware.js` e `js/net.js`. Le voci custom degli utenti stanno invece nel database (record meta `markethb`, `cyberhb`, `nethb`; l'HQ della crew nel record meta `hq`; i disegni del layer GM della mappa nella collezione `mapgm`, solo GM). Nel record del personaggio: `wardrobe` (stili con immagine; i vestiti sono in `gear.items` con `cat: "vestiti"`), i veicoli in `gear.items` con `cat: "veicoli"` e `veh` (provenienza ruolo/comprato, upgrade), `agent` (app e abbonamenti), `expenses` (spese mensili); il cyberware non installato è in `cyber.slots.idle`.
- **Cache**: ogni volta che cambi un file JS o CSS, alza il numero `?v=NN` in **tutte** le righe di `index.html` (anche il CSS), altrimenti i browser dei giocatori tengono i file vecchi.

## Regole che non si toccano
- **`js/config.js`** contiene l'indirizzo Supabase e la chiave **anon** (pubblica per natura: la protezione la fanno le regole RLS del database). Non modificarlo e non svuotarlo nel repository.
- **Mai** la chiave `service_role` di Supabase, né altre chiavi segrete, nel codice o nei commit.
- **Mai** le email dei giocatori nel repository: è pubblico.
- Le cose segrete del GM (`gm_only`: nemici, architetture NET, note del GM…) non devono arrivare ai giocatori. Il canale in tempo reale è pubblico: per le righe segrete manda solo `{ t: "gm", col, id }`, mai il contenuto.
- Non cambiare lo schema del database senza dirlo esplicitamente: un cambio va fatto anche a mano su Supabase.
- Le password e gli accessi li inserisce sempre l'utente, non l'assistente.

## Flusso di lavoro
1. Parti da `main` aggiornato (`git pull`) e crea un branch: `feature/…` per le novità, `fix/…` per le correzioni, `docs/…` per la documentazione.
2. Fai la modifica e alza `?v=` in `index.html`.
3. **Prova sulla copia locale**, mai sul database vero (vedi sotto).
4. Fai provare l'utente. **Pubblica solo quando l'utente lo dice** («pusha», «pubblica»): commit, push, PR verso `main`, unione.
5. Dopo l'unione controlla il sito pubblicato (le pagine si aprono e la console non ha errori).
6. Il branch si elimina solo se l'utente lo vuole.

Due assistenti non devono lavorare sullo stesso branch nello stesso momento: si sovrascrivono le modifiche.

## Provare senza toccare il database vero
1. Copia `index.html`, `css/` e `js/` in una cartella fuori dal repository (ad esempio una cartella temporanea).
2. Nella **copia** di `js/config.js` lascia vuoti `supabaseUrl` e `supabaseAnonKey`: il sito parte in modalità locale e salva tutto nel browser.
3. Servi la copia con un server statico, ad esempio `python -m http.server 8765 --directory <cartella della copia>`, e apri http://localhost:8765
4. In modalità locale sei GM. Per vedere il sito come un giocatore, nella console del browser: `localStorage.setItem("nc-local-player", "1")` e ricarica (`localStorage.removeItem("nc-local-player")` per tornare GM).
5. Quando ricopi i file nella copia, **non sovrascrivere** il `config.js` della copia con quello del repository.

Controlla sempre la console del browser: nessun errore. Prova anche a larghezza telefono (375 px): niente scorrimento orizzontale.

## Stile del codice
- Segui lo stile dei file vicini: funzioni piccole, template string per l'HTML, `esc()` su **tutto** il testo che arriva da utenti o database.
- Per salvare un record: `Store.save(collezione, record)`, poi `upsert(state.<collezione>, salvato)` e `liveSend(collezione, salvato)`.
- Commenti brevi in italiano, solo dove spiegano un perché.
- Non aggiungere dipendenze esterne (librerie da CDN) senza chiederlo.
