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

#### ⌁ Cyberdeck (Netrunner)
Se il ruolo è **Netrunner** (o la Role Ability è *Interface*) la scheda ha il riquadro **Cyberdeck**, con il catalogo del manuale base (pag. 201–208, nomi dell'edizione italiana):
- **programmi** Boost, Difensivi, Anti-Programma e Anti-Operatore, **Black ICE** (2 slot) e **hardware** (Barriera KRASH, Blocco DNA, Cavi Isolati, Circuiti Rinforzati, Disco di Backup, Portata Migliorata), più programmi personalizzati; il contatore degli slot tiene conto della Tuta Bodyweight e del deck nel cyberbraccio;
- ogni programma si tira come un'arma: **Attack** = Interface + ATK + 1d10 (i Black ICE del deck usano il loro ATK), poi il **danno** (REZ ai programmi o al cervello, con i valori diversi contro i Black ICE) o l'**effetto** con i suoi dadi;
- le **Capacità d'Interfaccia** (Backdoor, Bypass, Cloak, Control, I-D, Mapper, Scanner, Virus, Zap), **Defense** e **Speed** sono pulsanti; i Boost Rezzati aggiungono il loro +2 da soli;
- durante la Netrun si tengono **Rez/Derez**, i **REZ** rimasti, i programmi «una volta per Netrun» già usati e quelli Distrutti; «↺ Nuova Netrun» rimette tutto a posto. Le **Azioni NET** si leggono dal Rank (2, 3, 4 o 5).

### 🎲 Tavolo — `// TACTICAL_GRID`
Il tavolo di gioco per i combattimenti, condiviso **in tempo reale** tra tutti quelli che hanno il sito aperto.
- **Mappe** con immagine di sfondo e griglia (1 casella = 2 m), zoom con la rotella e spostamento della vista trascinando lo sfondo.
- **Mappa condivisa**: il GM prepara le mappe in privato e con «Mostra a tutti» porta tutti i giocatori su quella giusta. Chi sta guardando un'altra mappa ci viene spostato con un avviso.
- **Token** trascinabili per PG, NPC e nemici generici, con la barra degli HP presa dalla scheda. Nel pannello del token HP e armatura (SP di testa e corpo) hanno le barre e i pulsanti per danni, ablazione e riparazione; i token generici e i nemici hanno HP e SP propri, modificabili anche da «Modifica». Durante lo spostamento una **freccia** va dalla casella di partenza a quella d'arrivo, con la distanza in metri, e la vedono anche gli altri giocatori. Le frecce della tastiera muovono il token selezionato di una casella.
- **Iniziativa**: un pulsante tira REF + 1d10 per tutti, poi «Turno ▶» passa al prossimo e conta i round.
- **Dice log** in stile chat, sempre a portata di mano dal pulsante ⬢ in alto: `2d6+3` per un tiro libero, `/d 3d6` per i danni, `/c 14` per una prova con base 14, oppure un messaggio di testo. Chi non ha fatto l'accesso può tirare, ma i suoi tiri restano sul suo dispositivo.

### ⌬ NET — `// NET_ARCHITECTURE`
Le Architetture di Rete che il GM sta mostrando: compaiono piano per piano mentre il Netrunner scende, con Password, File, Nodi e Black ICE (REZ compresi), aggiornate in tempo reale. I piani non ancora raggiunti e le note del GM non arrivano ai giocatori.

### 👥 Party — `// CREW_MANIFEST`
Le schede di tutti i PG affiancate: HP con i pulsanti per danni e cure, armatura con l'ablazione, Luck, umanità, iniziativa, Death Save, le abilità più alte e le armi da tirare con un clic, e «Tira come» per far partire il Dice log a nome di quel PG. Ognuno può usare qualsiasi scheda.

### 🔒 Area GM — `// GM_ONLY_CHANNEL`
Una sezione che vedono **solo i GM**: le righe segrete non arrivano proprio ai giocatori, perché le filtra il database.
- **NPC, dossier e appunti segreti**: si crea un «NPC segreto» o un «Appunto segreto», oppure si spunta «Solo GM» quando si modifica un record.
- **Note del GM** su qualsiasi PG o NPC (vere intenzioni, segreti), in un riquadro del dossier.
- **Mappe nascoste**: le mappe nuove del GM nascono nascoste e si rivelano con «Mostra a tutti». Chi le apre vede solo «il master sta preparando la mappa».
- **Token nascosti**: nemici in agguato che compaiono ai giocatori quando il GM preme «👁 Rivela». Mentre il GM li sposta, la posizione non viaggia sul canale pubblico.
- **Tiri segreti**: interruttore «🔒 Segreto» nel Dice log. I tiri degli NPC segreti e dei token nascosti sono segreti da soli.
- **Account GM**: dalla pagina GM si aggiungono o tolgono altri master.
- **☠ Nemici**: schede semplificate come i PNG del manuale. Si scelgono la **Fascia** (1 Scagnozzi e Strada → 4 Boss e Minacce Apice, con il rapporto per Edgerunner), il **Livello** (Base e Hardened ricalcano i PNG del manuale base e i PDF gratuiti *Hardened*; Elite con Buff spende i Punti Elite: 6 / 8 / 10 / 12, +4 o +5 per il *Nemico Estremo* di Fascia 3–4) e, se serve, un **Ruolo**:
  - **Solo**: i punti di *Sensi da Combattimento* si distribuiscono tra gli usi del manuale (Attacco Preciso, Reazione, Individuare Minacce e Debolezze, Deflettere Danni, Recuperare da un Disastro) e valgono nei tiri;
  - **Tech**: *Creatore*, con l'Esperienza sul Campo sommata alle prove tecniche;
  - **Medtech**: *Medicina*, divisa tra Chirurgia (abilità Surgery) e Tecnologia Medica;
  - **Nomade**: *Garage*, sommato a guida, pilotaggio e tecnologie dei veicoli, con la Scuderia di Famiglia del suo grado;
  - **Netrunner**: *Interfaccia* con le sue Azioni NET e un **Cyberdeck** generato per Fascia e Livello (modificabile, «⚄ Deck casuale»), che si tira come quello dei PG.

  I **Punti extra** si aggiungono al budget, così i potenziamenti si possono spuntare a qualsiasi livello. La generazione casuale li pesca con peso 1/costo; nel modulo un contatore impedisce di sforare. Accanto alle armi c'è **⚄ Ripesca** (tutte o una sola).

  Ogni valore è scomposto: **base_naturale = STAT + livello della skill**, **base_effettiva = naturale + HQ + Smartgun** (entro il tetto della fascia) **+ bonus del ruolo**, con il malus dell'armatura indicato a parte; il Dice log mostra ogni addendo. Le STAT naturali non superano 8; il BODY sale solo con gli impianti (Bone Lace 10, Linear Frame Σ 12, β 14, superiore 16–18), e 9–10 si comprano solo in Fascia 3–4. I **tratti apice** (REF/DEX 10, Ruolo 10, skill di combattimento 10, BODY 16–18, Metalgear 18) sono al massimo 1 in Fascia 3 e 1 in Fascia 4, 2 se Estremo. Con la **regola del 20** (STAT 10 + skill 10) scatta la compensazione: SP massimo 11 oppure HP ridotti. Un validatore controlla tetti, punti e fasce mentre compili. Le schede delle versioni precedenti si convertono da sole all'apertura.

  Con «⇲ Sul tavolo» si mettono N copie sulla mappa, anche nascoste: ogni token ha HP e SP propri e tira dal suo pannello.
- **⌬ Architetture NET**: «⚄ Genera» segue il manuale (pag. 209–211): 3d6 piani, un bivio per ogni d10 da 7 in su (i bivi partono dopo il 2° piano e il ramo principale resta il più profondo), tabella dell'**Ingresso** (1d6) per i primi due piani e dei **piani inferiori** (3d6) secondo la difficoltà Base / Standard / Non Comune / Avanzata (VD 6 / 8 / 10 / 12), ritirando programmi e Password già usciti, più un **Demone** se ci sono Nodi di Controllo. Oppure si costruisce a mano: piani (Password, File, Nodo di Controllo, Black ICE, altro) con VD, descrizione e note, rami, Demoni, ⚄ per ritirare un singolo piano. Nella vista di gioco ogni Black ICE ha i pulsanti **Agguato** (VEL), **Attacco** (ATT), danno o effetto e **Difesa** (DIF), con i REZ da scalare; i Demoni tirano Zap, Control, Difesa e Combattimento. Con «👁 Mostra ai giocatori» la pagina **NET** mostra a tutti i soli piani rivelati con 👁 (rivelarne uno rivela quelli sopra).
- Con il ruolo GM attivo, mappe, token, turni e «Mostra a tutti» li gestiscono solo i GM. I giocatori muovono i token visibili, cambiano gli HP e tirano.

**Per attivarlo** (una volta sola): su Supabase apri *SQL Editor*, incolla tutto `supabase/schema.sql`, togli i due trattini dall'ultima riga mettendo l'email del primo GM e premi *Run*. Gli altri GM si aggiungono poi dal sito.

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
- **Permessi**: le regole di *Row Level Security* (`supabase/schema.sql`) consentono la **lettura a tutti** e la **scrittura solo agli utenti autenticati**. Le righe con `gm_only = true` le leggono e scrivono solo gli account elencati nella tabella `gm_users` (funzione `is_gm()`). La registrazione pubblica è disattivata: gli account vengono creati manualmente.
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
| `gmnotes` | note del GM sui personaggi (sempre segrete) |
| `netarch` | architetture NET del GM (sempre segrete) |
| `netview` | copia pubblica di un'architettura: solo i piani rivelati |

Le schede dei personaggi stanno dentro `entries` (campo `sheet`). Il tavolo usa i canali *broadcast* di Supabase Realtime per gli aggiornamenti istantanei: non serve configurare niente nel database. Se il canale non è disponibile, il tavolo si aggiorna da solo ogni pochi secondi. Anche con il canale attivo, ogni 30 secondi (e quando si torna sulla pagina) il tavolo si riallinea con il database, così un messaggio perso non lascia nessuno indietro. La mappa mostrata a tutti è salvata in `meta` (campo `tableMap`).

## Design

- **Palette**: nero profondo con rosso `#ff2a3d`, ciano `#00f0ff` e giallo `#f3e600`, più accenti magenta e verde.
- **Font**: *Orbitron* per i titoli, *Rajdhani* per il testo, *Share Tech Mono* per i dati.
- **Dettagli**: angoli smussati, scanline, effetto glitch sui titoli e nei cambi di immagine, icone meteo disegnate in SVG.
- **Responsive**: su telefono il calendario mostra punti colorati al posto dei titoli e le gallerie si sfogliano con lo swipe.
- **Menu ☰**: il pulsante a sinistra del titolo apre un menu laterale con tutte le sezioni, più Dice log e Impostazioni. Quando la finestra è troppo stretta per tutte le voci, la barra in alto si nasconde e resta il menu.

## Struttura

```
index.html              pagina unica
css/style.css           tema grafico
js/config.js            collegamento a Supabase (chiave pubblica "anon")
js/store.js             livello dati: Supabase o IndexedDB, canale in tempo reale
js/dice.js              STAT e abilità di Cyberpunk RED, motore dei dadi, generatore dei nemici
js/net.js               Netrunning: programmi, Black ICE, hardware, Demoni, generatore di architetture
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
