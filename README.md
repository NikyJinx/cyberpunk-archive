# ▲ NIGHT CITY ARCHIVE

**L'archivio digitale della nostra campagna di _Cyberpunk RED_.**
Dossier sugli NPC, fazioni e luoghi di Night City, la cronologia degli eventi giorno per giorno a partire dal 2045 con il meteo della città, gli appunti di gioco e la colonna sonora che abbiamo creato durante la campagna.

🌐 **Sito:** https://nikyjinx.github.io/cyberpunk-archive/

---

## Il progetto

Ogni sessione di una campagna lascia dietro di sé nomi, volti, debiti, tradimenti e canzoni. Questo sito nasce per raccoglierli in un unico posto, consultabile da tutto il gruppo, dal PC durante la sessione o dal telefono tra una giocata e l'altra.

L'archivio è pensato come un terminale trafugato dai server di Night City: interfaccia neon su fondo nero, scanline, effetti glitch e testi in stile log di sistema. Chiunque abbia il link può consultarlo, mentre solo i membri del gruppo con un account possono aggiungere o modificare i contenuti, direttamente dal sito.

## Sezioni

### 🗂 Database — `// NCPD_LEAKED_DB`
Schede per **personaggi del party (PG), NPC, fazioni, luoghi e oggetti**.
- Alias, fazione, ruolo (Solo, Netrunner, Fixer, Rockerboy…), stato (vivo, *flatlined*, disperso), rapporto con il party, luogo, tag, descrizione e note.
- **Campi personalizzati illimitati** per tutto il resto: cyberware, armi, debiti, contatti.
- **Galleria di immagini** per ogni scheda, con carosello sfogliabile tramite frecce, tastiera o swipe e visualizzazione a schermo intero.
- Le fazioni elencano automaticamente i propri membri. Ogni dossier mostra gli eventi del calendario in cui il personaggio è coinvolto.
- Ricerca libera e filtri per tipo, fazione e stato. I personaggi morti compaiono in bianco e nero, marchiati **FLATLINED**.

#### ◈ Cyberware ed equipaggiamento
Ogni PG e NPC ha una scheda **Cyberware**, organizzata come una scheda del personaggio:
- una **sagoma olografica** al centro, con i punti del corpo che si accendono dove ci sono impianti;
- slot per **cyberaudio, cyberocchi, cyberbracci, cybergambe, cyberware interno ed esterno, neuralware, borgware e fashionware**, più **slot personalizzati**;
- per ogni impianto costo, **perdita di umanità** e **umanità massima tolta**. Quest'ultima segue la regola standard (2, borgware 4, fashionware 0) ma si può cambiare impianto per impianto, per esempio per gli impianti modificati;
- impianti **installati** o solo **pianificati**, con i totali di costo, l'umanità attuale e massima, l'EMP effettiva e l'avviso di **cyberpsicosi**.

La scheda **Equipaggiamento** raccoglie eddies, armi, armature, oggetti e veicoli.

#### ⬢ Scheda del personaggio
Ogni PG e NPC ha una **Scheda** con le regole di *Cyberpunk RED* (nomi in inglese, come sul manuale):
- le 10 **STAT**, tutte le **abilità** divise per categoria (quelle base partono da 2, quelle a costo doppio sono segnate ×2) e abilità personalizzate come *Language (Japanese)* o *Science (Chemistry)*;
- **Role Ability** con il rank, **Hit Points** calcolati da BODY e WILL, stato delle ferite, **armatura** di testa e corpo con l'ablazione, **Luck**, **Death Save**, **iniziativa**, movimento, reputazione e IP;
- l'**EMP** scende da sola con l'umanità calcolata nella scheda Cyberware;
- il campo **Giocatore** collega il PG all'email con cui il giocatore fa login.

Basta un clic su una STAT, un'abilità o un'arma per **tirare i dadi**: base + 1d10 con il successo critico sul 10 e il fallimento critico sull'1, malus delle ferite applicato da solo, campo **MOD** per i modificatori di situazione. I danni delle armi segnalano la **Critical Injury** quando escono due 6.

### 🎲 Tavolo — `// TACTICAL_GRID`
Il tavolo di gioco per i combattimenti, condiviso **in tempo reale** tra tutti quelli che hanno il sito aperto.
- **Mappe** con immagine di sfondo e griglia (1 casella = 2 m), zoom con la rotella e spostamento della vista trascinando lo sfondo.
- **Mappa condivisa**: il GM prepara le mappe in privato e con «Mostra a tutti» porta tutti i giocatori su quella giusta. Chi sta guardando un'altra mappa ci viene spostato con un avviso.
- **Token** trascinabili per PG, NPC e nemici generici, con la barra degli HP presa dalla scheda. Durante lo spostamento una **freccia** va dalla casella di partenza a quella d'arrivo, con la distanza in metri, e la vedono anche gli altri giocatori. Le frecce della tastiera muovono il token selezionato di una casella.
- **Iniziativa**: un pulsante tira REF + 1d10 per tutti, poi «Turno ▶» passa al prossimo e conta i round.
- **Dice log** in stile chat, sempre a portata di mano dal pulsante ⬢ in alto: `2d6+3` per un tiro libero, `/d 3d6` per i danni, `/c 14` per una prova con base 14, oppure un messaggio di testo. Chi non ha fatto l'accesso può tirare, ma i suoi tiri restano sul suo dispositivo.

### 📖 Diario e Quest — `// BRAINDANCE_LOG`
La cronaca della campagna, scritta come un racconto.
- Il diario è diviso in **capitoli** e ogni capitolo in **scene**, con riassunto, luoghi e personaggi coinvolti (collegati al database).
- Le storie si intrecciano: ogni scena può appartenere a **più quest**. La pagina di una quest raccoglie in ordine tutte le sue scene, anche quando sono sparse tra più capitoli, e mostra se la quest è in corso, in sospeso o conclusa.
- Nel testo si possono inserire riquadri in stile terminale per le **architetture di rete** (piano per piano), i **log** (orari, dialoghi, agende) e le note.
- Le scene con una data in gioco compaiono anche nel calendario.

### 📅 Calendario — `// NC_CHRONOLOG`
La cronologia della campagna, **dal 2045 in avanti**.
- Vista mensile con gli eventi colorati per tipo: storia, gig, combattimento, incontro, viaggio.
- Ogni giorno ha una pagina dedicata con il racconto dettagliato degli eventi: ora, luogo, personaggi coinvolti (collegati al database) e tag.
- La **data in gioco** è evidenziata nel calendario e in home.
- **Meteo di Night City** registrato giorno per giorno, con temperatura e 14 condizioni illustrate da icone neon. Oltre a sole, pioggia e nebbia ci sono smog, pioggia acida, tempeste di cenere e di polvere, pioggia di sangue e vento radioattivo.

### 📝 Appunti — `// SHARD_STORAGE`
Riassunti delle sessioni, indizi, lore, regole della casa. Ogni nota è uno *shard* con categoria e tag, ricercabile e fissabile in cima.

### 🎵 Tracce — `// PIRATE_RADIO 98.7`
La colonna sonora della campagna, organizzata in dischi:

| Disco | Album |
|---|---|
| **CD 1** | *Cyberpunk: Echo's Songs* |
| **CD 2** | *Echo CD 2* |

Ogni traccia ha copertina, testo completo, stile musicale e durata, e si ascolta con il player di Suno integrato nella pagina o con file audio caricati sul sito.

## Architettura

Un sito **statico**, senza framework e senza fase di build: HTML, CSS e JavaScript puro.

```
┌──────────────────────┐        ┌───────────────────────────────┐
│   GitHub Pages       │        │   Supabase                    │
│   index.html         │  API   │   • Postgres: tabella records │
│   css/  js/          │ ─────▶ │   • Storage: bucket "media"   │
│   (solo codice)      │        │   • Auth: account del gruppo  │
└──────────────────────┘        └───────────────────────────────┘
```

- **Frontend**: single page application con routing a hash (`#/database`, `#/calendario/2045-03-14`…). Tutta l'interfaccia è generata in `js/app.js`.
- **Dati**: un'unica tabella `records` con documenti JSON divisi per collezione. Immagini e audio caricati dal sito finiscono nello storage di Supabase. Le immagini vengono ridimensionate nel browser prima del caricamento.
- **Permessi**: le regole di *Row Level Security* (`supabase/schema.sql`) consentono la **lettura a tutti** e la **scrittura solo agli utenti autenticati**. La registrazione pubblica è disattivata: gli account vengono creati manualmente.
- **Modalità locale**: senza configurazione Supabase il sito funziona interamente nel browser (IndexedDB). È utile per sviluppo e prove.
- **Backup**: esportazione e importazione completa dei dati in JSON dalle impostazioni del sito.

### Collezioni

| Collezione | Contenuto |
|---|---|
| `entries` | PG, NPC, fazioni, luoghi, oggetti, con galleria, campi personalizzati, cyberware ed equipaggiamento |
| `diary` | scene del diario: capitolo, quest, luoghi, personaggi, racconto |
| `quests` | quest con stato e riassunto |
| `events` | eventi del calendario, collegati ai personaggi |
| `weather` | meteo e temperatura per giorno |
| `notes` | appunti |
| `songs` | tracce, con disco, album, testo e link Suno |
| `meta` | titolo del sito, introduzione, data in gioco |
| `maps` | mappe del tavolo: immagine, griglia, iniziativa e turno |
| `tokens` | token sulle mappe, collegati alle schede del database |
| `rolls` | tiri di dado e messaggi del dice log |

Le schede dei personaggi stanno dentro `entries` (campo `sheet`). Il tavolo usa i canali *broadcast* di Supabase Realtime per gli aggiornamenti istantanei: non serve configurare niente nel database. Se il canale non è disponibile, il tavolo si aggiorna da solo ogni pochi secondi. Anche con il canale attivo, ogni 30 secondi (e quando si torna sulla pagina) il tavolo si riallinea con il database, così un messaggio perso non lascia nessuno indietro. La mappa mostrata a tutti è salvata in `meta` (campo `tableMap`).

## Design

- **Palette**: nero profondo con rosso `#ff2a3d`, ciano `#00f0ff` e giallo `#f3e600`, più accenti magenta e verde.
- **Font**: *Orbitron* per i titoli, *Rajdhani* per il testo, *Share Tech Mono* per i dati.
- **Dettagli**: angoli smussati, scanline, effetto glitch sui titoli e nei cambi di immagine, icone meteo disegnate in SVG.
- **Responsive**: su telefono il calendario mostra punti colorati al posto dei titoli e le gallerie si sfogliano con lo swipe.

## Struttura

```
index.html              pagina unica
css/style.css           tema grafico
js/config.js            collegamento a Supabase (chiave pubblica "anon")
js/store.js             livello dati: Supabase o IndexedDB, canale in tempo reale
js/dice.js              STAT e abilità di Cyberpunk RED, motore dei dadi
js/app.js               interfaccia, routing e logica delle sezioni
supabase/schema.sql     tabella, regole di accesso e storage
tools/suno-import.js    importa le playlist Suno come tracce
tools/lista-import.js   converte una lista di schede in testo in un file importabile
music/                  file audio pubblicati con il sito
```

Per provarlo in locale basta servire la cartella con un qualsiasi server statico, ad esempio `python -m http.server`.

## Crediti

- Campagna, personaggi, testi e musiche: il nostro gruppo di gioco. Le tracce sono state create con [Suno](https://suno.com).
- Le condizioni meteo si ispirano al supplemento gratuito *Night City Weather* di R. Talsorian Games. Il sito ne riporta solo i nomi, non le regole.

> Progetto amatoriale e non commerciale, realizzato da fan. *Cyberpunk RED*, *Night City* e i marchi correlati appartengono a **R. Talsorian Games**. Questo sito non è affiliato né approvato da R. Talsorian Games.
