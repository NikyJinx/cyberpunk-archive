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
- Alias, fazioni, ruolo (Solo, Netrunner, Fixer, Rockerboy…), stato (vivo, *flatlined*, disperso), rapporto con il party, luogo, tag, descrizione e note.
- Se c'è un **alias** è il titolo della scheda (senza virgolette), con il nome sotto.
- Un record può avere **più fazioni** (es. «Arasaka» e «Party»): nel modulo si aggiungono come etichette, con Invio o virgola. Un NPC con la fazione **Party** compare anche nella pagina Party, accanto ai PG.
- **Campi personalizzati illimitati** per tutto il resto: cyberware, armi, debiti, contatti.
- **Galleria di immagini** per ogni scheda, con carosello sfogliabile tramite frecce, tastiera o swipe e visualizzazione a schermo intero.
- Le fazioni elencano automaticamente i propri membri (anche quelli che hanno più fazioni). Ogni dossier mostra gli eventi del calendario in cui il personaggio è coinvolto.
- Ricerca libera e filtri per tipo, fazione e stato. I personaggi morti compaiono in bianco e nero, marchiati **FLATLINED**.

#### ◈ Cyberware ed equipaggiamento
Ogni PG e NPC ha una scheda **Cyberware**, organizzata come una scheda del personaggio:
- una **sagoma olografica** al centro, con i punti del corpo che si accendono dove ci sono impianti;
- slot per **cyberaudio, cyberocchi, cyberbracci, cybergambe, cyberware interno ed esterno, neuralware, borgware e fashionware**, più **slot personalizzati**;
- per ogni impianto costo, **perdita di umanità** e **umanità massima tolta**. Quest'ultima segue la regola standard (2, borgware 4, fashionware 0) ma si può cambiare impianto per impianto, per esempio per gli impianti modificati;
- impianti **installati** o solo **pianificati**, con i totali di costo, l'umanità attuale e massima, l'EMP effettiva e l'avviso di **cyberpsicosi**.

La **finestra della scheda** (dossier, scheda, combattimento, cyberware…) si sposta trascinandola dalla barra in alto e si ridimensiona dall'angolo in basso a destra; posizione e misura restano su quel dispositivo (doppio clic sulla barra o ⟲ la rimettono com'era). ⇱ la **sgancia**: resta aperta e la pagina dietro si può usare (mappa, dice log, altre pagine); 📌 la riaggancia. ⧉ la apre in una **finestra a parte** del browser, che mostra solo la scheda e si aggiorna in tempo reale con le modifiche fatte altrove. Su schermi stretti la finestra resta fissa.

Nella tab **Scheda** il riquadro **Bonus a STAT e abilità** mostra, per ogni STAT o abilità che ne ha, la base, ogni bonus nel suo riquadro e il totale. Quelli ⚡ sono automatici (cyberware, Ruolo, armatura pesante, umanità sull'EMP, modificatori a tutte le prove) e si cambiano dove nascono; gli altri si aggiungono e si modificano in **Modifica scheda**, direttamente accanto a ogni STAT e abilità: «Dance [livello] [bonus] + = totale». Il «+» aggiunge un bonus, un clic su un bonus lo modifica (valore, fonte, oggetto a cui è legato, acceso/spento, elimina); i ⚡ automatici compaiono sulla stessa riga e il totale si aggiorna mentre cambi livello o STAT. Nella scheda il riquadro è solo in lettura. Un bonus può essere legato a un oggetto dell'inventario: conta solo finché l'oggetto c'è. Gli oggetti del Night Market che danno un bonus (es. DPI Smartsticks, Húsafell Underjack) lo portano da soli. I bonus contano nei tiri di STAT, di abilità e negli attacchi con l'abilità dell'arma; quelli al BODY non cambiano HP e Death Save.

Nella sezione **Armi** dell'Equipaggiamento ogni arma ha **🏠 Lascia a casa** / **🎒 Porta con sé**: un'arma lasciata a casa sparisce dalle schede delle armi del Combattimento (e dai tiri rapidi del Party), finisce nel riquadro «🏠 A casa» in fondo alla tab Combattimento e non si può tirare finché non la riporti con te (da lì o dall'Equipaggiamento).

Nella sezione **Cyberdeck** dell'Equipaggiamento ci sono i deck con quello che hanno installato (⇩ Disinstalla lo rimette nell'inventario) e, sotto «Non installati», programmi, Black ICE e hardware sfusi con ⇧ Installa nel deck scelto; anche la tab Cyberdeck ha il riquadro «Nell'inventario» per installarli nel deck in uso. Se il deck è pieno l'installazione viene rifiutata.

La scheda **Equipaggiamento** è l'inventario completo, diviso per categoria: eddies, armi (anche quelle della tab Combattimento), armature (con quelle indossate), cyberware, cyberdeck con programmi e hardware, oggetti e veicoli. Il cyberware si può **disinstallare** da qui (⇩) senza perderlo: va in **⏸ idle**, non dà più effetti né toglie umanità massima, ma l'umanità già persa resta (torna solo con la terapia). Dall'idle «⇧ Installa» lo rimette in **qualsiasi slot** (prima quelli adatti). Anche al Night Market il cyberware si può comprare in idle: in quel caso l'umanità si perde solo quando lo installi. L'idle si vede anche nella tab Cyberware, sotto la sagoma. Togliendo un Cyberbraccio, un Cyberocchio… escono con lui anche le opzioni che contiene, e ⇧ Reinstalla le rimette.

Le **armature** si indossano da qui. Ogni armatura è **per la testa o per il corpo**: si sceglie quando la si compra al Night Market (le tute intere, come l'Esporma, sono per testa e corpo) e da lì si può indossare solo in quella zona, con «🛡 Indossa»; quelle indossate hanno «Togli». Per avere la stessa armatura su testa e corpo ne servono due, una per zona. Un'armatura senza zona (comprata prima di questa regola o scritta a mano) la prende la prima volta che si indossa. Indossata, l'armatura porta SP piena e il suo malus a REF, DEX e MOVE. Anche in **Modifica scheda** la testa e il corpo offrono solo le armature dell'Equipaggiamento per quella zona (o «nessuna»); un'armatura indossata da prima ma non nell'inventario resta finché non la cambi. Se si cambia armatura la SP riparte piena, se resta la stessa l'ablazione si conserva.

La tab **Wardrobe** è l'armadio: i vestiti (categoria «Vestiti» dell'inventario) con tipo (top, giacca, scarpe, occhiali…) e stile (Urban Flash, Businesswear…), raggruppati per stile. «👕 Indossa» e «Togli» scelgono cosa ha addosso, «Indossa lo stile» veste tutto uno stile; in alto c'è il look attuale. In «Modifica wardrobe» si aggiungono i vestiti e un'**immagine per ogni stile**. Al Night Market un oggetto custom può andare in «Vestiti (Wardrobe)», con tipo e stile.

La tab **Veicoli** è il garage: i veicoli dell'inventario (categoria «Veicoli», anche quelli comprati al Night Market) con nome, tipo, «in uso» (uno alla volta, tutti insieme solo con Garage 10) e gli upgrade del Nomade. Se il personaggio ha il ruolo Nomade, ogni veicolo e ogni upgrade si segna **🏕 dal ruolo** (conta tra le scelte del Garage, con i veicoli sbloccati dal grado) o **💰 comprato** (non conta): un clic sull'etichetta lo cambia. Un upgrade «comprato ora» toglie il prezzo dagli eddies (grado 1 1.000 E$, gli altri 5.000 E$), «già comprato» no. La tab Ruoli del Nomade mostra solo il riepilogo della Scuderia.

La tab **Agent** è lo smartphone: modello, app e abbonamenti. Ogni voce può essere solo una descrizione o dare un **bonus** a una STAT o abilità, automatico finché è accesa (⏸ Spegni / ▶ Accendi); il bonus compare con ⚡ nel riquadro dei bonus e conta nei tiri. Gli abbonamenti con un costo vanno da soli nelle Spese mensili.

La tab **Spese mensili** raccoglie Lifestyle, affitto, Trauma Team, siti web e servizi (con le voci del manuale già compilate), più gli abbonamenti dell'Agent. Ogni voce si può sospendere; «💸 Paga il mese» toglie il totale dagli eddies e finisce negli Acquisti del Night Market, da dove si annulla.

#### ⚡ Catalogo del cyberware
Le parti con slot (Cyberocchio, Cyberbraccio, Cybergamba, Collegamento Neurale, Sistema Cyberudito) sono **cyberware fondamentale**: non si aggiungono dentro lo slot ma si **attivano** in testa allo slot, con costo, PU (⚄), umanità massima e **numero di slot** modificabile per gli upgrade; anche Fashionware, Impianti Interni ed Esterni hanno i loro 7 slot modificabili. Ogni slot mostra «opzioni usate/disponibili» e avvisa se è pieno o se manca la base. Il **resoconto** di costo e umanità è in fondo alla tab.

Nella modifica del cyberware ogni slot ha «+ dal catalogo…»: tutti gli impianti del manuale base (Fashionware, Neuralware e Chipware, Cyberottiche, Cyberudito, Impianti Interni ed Esterni, Cyberbraccio, Cybergamba e coperture, Borgware), con le voci dello slot in cima. La riga si compila da sola con nome, costo, PU media e descrizione; ⚄ tira la PU con i dadi del manuale.
- Gli effetti vanno da soli nei tiri: Mirino +1 ai colpi mirati, Kerenzikov +2 all'iniziativa, Tecnoscanner e Medscanner, Analizzatore di Stress, Filtro Antitossina, Chip Abilità (porta l'abilità scelta a livello 3 o 4, lo scegli per ogni chip; se la conosci già a quel livello o più non fa nulla), Laccio Osseo-Muscolare e Telai Lineari sul BODY (con PF e Death Save), Antidolorifico (toglie il −2 di Seriously Wounded / Ferito Gravemente, non il −4 di Mortally Wounded, anche per i nemici), Connettori d'Interfaccia o Presa Sottocutanea (+1 a colpire con le armi Smartgun Link), Antiriflesso e Kiroshi OptiShield (lo stato Accecato non penalizza), Antiassordante (Assordato), DeathTrance attivo (−4 a tutto), Poser Chip mentre impersoni (+4 Acting), Piede Pattino (+6 m alla Corsa). Le opzioni «accoppiate» (Antiriflesso, Definitore d'Immagine, Piede Pattino) funzionano solo con entrambe installate. Il **Chipware** (Chip di Memoria, Chip Abilità, Antidolorifico…) funziona solo dentro l'**Alveolo**, che ha un suo slot nella tab Cyberware: si attiva come il Cyberocchio, ha 1 slot di base e gli slot si aumentano (nel modulo, o comprando un altro Alveolo al Night Market: +1 slot). Ogni slot dell'Alveolo occupa uno slot del Collegamento Neurale. La scheda mostra «chip N/M» nella card del Collegamento Neurale e segna i chip in più («⚠ Alveolo pieno»), che non hanno effetto. Gli effetti «non cumulativi» non si sommano e si può avere un solo Speedware.
- Quelli a comando (Sandevistan, Definitore d'Immagine con la vista, Udito Amplificato, TeleOttica oltre 51 m, Audiovox mentre canti) hanno un interruttore nelle tab Cyberware e Combattimento. Le armi integrate (Wolvers, Digitolame, Zanne…) si aggiungono alle armi con un clic.
- Anche i **nemici** prendono cyberware dal catalogo, con gli stessi bonus.
- **Cyberware custom**: dal Night Market si creano impianti nuovi con costo, PU, descrizione e un effetto nei tiri; compaiono nel catalogo con la ★.

#### ⬢ Scheda del personaggio
Ogni PG e NPC ha una **Scheda** con le regole di *Cyberpunk RED* (nomi in inglese, come sul manuale):
- le 10 **STAT**, tutte le **abilità** divise per categoria (quelle base partono da 2, quelle a costo doppio sono segnate ×2) e abilità personalizzate come *Language (Japanese)* o *Science (Chemistry)*;
- **Role Ability** con il rank, **Hit Points** calcolati da BODY e WILL, stato delle ferite, **armatura** di testa e corpo con l'ablazione, **Luck**, **Death Save**, **iniziativa**, movimento, reputazione e IP;
- l'**EMP** scende da sola con l'umanità calcolata nella scheda Cyberware;
- il campo **Giocatore** collega il PG all'email con cui il giocatore fa login.

Basta un clic su una STAT, un'abilità o un'arma per **tirare i dadi**: base + 1d10 con il successo critico sul 10 e il fallimento critico sull'1, malus delle ferite applicato da solo, campo **MOD** per i modificatori di situazione. I danni delle armi segnalano la **Critical Injury** quando escono due 6.

#### ◈ Ruoli
La tab **Ruoli** del dossier tiene uno o più Ruoli, ognuno con il suo grado (−/+). Si parte con un Ruolo a grado 4, gratis. Gli altri si **comprano con i Punti Miglioramento**: grado 1 per 60 IP, con il precedente almeno a 4. Si prendono da «+ Ruolo · 60 IP» nella tab Ruoli oppure dalla finestra degli IP (gruppo «Nuovo Ruolo»); il Ruolo compare subito nella tab Ruoli e la spesa va nello storico degli IP, da dove si annulla. Il GM può aggiungerlo gratis se gli IP non bastano. Ogni Ruolo segue le regole del manuale:
- **Rocker** (Impatto Carismatico): tiri contro VD 8 / 10 / 12 per singolo, piccolo e grande gruppo, con i favori del grado;
- **Solitario** (Sensi da Combattimento): punti da distribuire con i costi del manuale. Attacco Preciso, Reazione, Individuare Minacce, Recuperare da un Disastro e Individuare Debolezze (spunta «1° colpo del round» sull'arma) sono già nei tiri; Deflettere Danni compare sotto gli HP;
- **Netrunner** (Interfaccia): il grado è l'Interface del Cyberdeck, con le Azioni NET;
- **Tecnico** (Creatore): due Specializzazioni per grado. Esperienza sul Campo si somma alle prove tecniche; Riparazione Temporanea, Upgrade, Fabbricare e Inventare hanno la tabella delle VD e dei tempi per prezzo;
- **Meditech** (Medicina): Chirurgia, Farmaceutica (ricette e Sintesi VD 13) e Criosistemi, con Surgery e Medical Tech tirabili;
- **Media** (Credibilità): pettegolezzo passivo, pubblicazione contro l'Attendibilità del grado (con le prove) e tabelle di fonti e pubblico;
- **Corporativo** (Gioco di Squadra): benefit per grado e Squadra con mansione, Lealtà, ordini (1d6 < Lealtà) e Lealtà iniziale;
- **Tutore dell'Ordine** (Rinforzi): chiamata 1d10 ≤ grado, round d'attesa e squadra in arrivo, con la tabella dei rinforzi;
- **Fixer** (Operatore): Contrattare (COOL + Trading + grado) e la tabella di contatti, portata e Oliare;
- **Nomade** (Garage): bonus a guida e veicoli, Scuderia di Famiglia con veicoli sbloccati e upgrade per grado.

#### ⚔ Combattimento
La tab **Combattimento** del dossier raccoglie HP, armatura, iniziativa, Death Save, movimento, Evasion, stati, modificatori speciali, armi e Critical Injury. Ogni arma ha, direttamente nella sua scheda:
- **⌖ Attack**, la spunta **Mirato −8** con la parte del corpo (testa, oggetto in mano, gamba) e, per SMG e fucili d'assalto, **Autofire** e **Soppressione**;
- la scelta delle **munizioni** (catalogo nelle Regole della campagna) e il pulsante del **danno**: in autofire (REF + skill Autofire) il danno è 2d6 × quanto superi la VD, al massimo ×3 per gli SMG e ×4 per i fucili d'assalto. Per le armi modificate danno dell'autofire e moltiplicatore massimo si cambiano nella scheda dell'arma;
- la **tabella delle VD per distanza** come parte della descrizione, con le tabelle estese (21 tipi di arma per il colpo singolo, 4 per l'autofire). La tabella viene dalla categoria dell'arma e si cambia dal menu sotto (l'arma la ricorda). Dopo il tiro ogni distanza si segna ✓ o ✗, con il moltiplicatore dell'autofire, e il Dice log elenca le distanze a cui colpisci.

I **nemici** del GM hanno le stesse schede delle armi (anche dal pannello del token), con la formula della base e, nel modulo, danno dell'autofire e moltiplicatore per arma. Nel Dice log l'esito per distanza («Pistol: colpisce a 0–6 m, 7–12 m») è evidenziato in verde, o in rosso se è fuori portata.

Ci sono anche gli **stati** (in fiamme, accecato… con il loro malus, se il GM lo imposta), i **modificatori speciali** (cyberware, talenti: «Mirino ottico +1 ai colpi mirati») che si sommano da soli ai tiri del tipo scelto, e le **Critical Injury** tirabili (2d6, corpo o testa) da aggiungere alla scheda con il +1 al Death Save.

#### ⌁ Cyberdeck (Netrunner)
Se il ruolo è **Netrunner** (o la Role Ability è *Interface*) il dossier ha la tab **Cyberdeck**: si possono tenere **più deck** (di scorta, nel cyberbraccio…) e scegliere quello in uso. Il catalogo è il catalogo del manuale base (pag. 201–208, nomi dell'edizione italiana):
- **programmi** Boost, Difensivi, Anti-Programma e Anti-Operatore, **Black ICE** (2 slot) e **hardware** (Barriera KRASH, Blocco DNA, Cavi Isolati, Circuiti Rinforzati, Disco di Backup, Portata Migliorata), più programmi personalizzati; il contatore degli slot tiene conto della Tuta Bodyweight e del deck nel cyberbraccio;
- ogni programma si tira come un'arma: **Attack** = Interface + ATK + 1d10 (i Black ICE del deck usano il loro ATK), poi il **danno** (REZ ai programmi o al cervello, con i valori diversi contro i Black ICE) o l'**effetto** con i suoi dadi;
- le **Capacità d'Interfaccia** (Backdoor, Bypass, Cloak, Control, I-D, Mapper, Scanner, Virus, Zap), **Defense** e **Speed** sono pulsanti; i Boost Rezzati aggiungono il loro +2 da soli;
- durante la Netrun si tengono **Rez/Derez**, i **REZ** rimasti, i programmi «una volta per Netrun» già usati e quelli Distrutti; «↺ Nuova Netrun» rimette tutto a posto. Le **Azioni NET** si leggono dal Rank (2, 3, 4 o 5).

### 🎲 Mappa — `// TACTICAL_GRID`
La mappa per i combattimenti, condiviso **in tempo reale** tra tutti quelli che hanno il sito aperto.
- **Mappe** con immagine di sfondo e griglia (1 casella = 2 m), zoom con la rotella e spostamento della vista trascinando lo sfondo.
- **Mappa condivisa**: il GM prepara le mappe in privato e con «Mostra a tutti» porta tutti i giocatori su quella giusta. Chi sta guardando un'altra mappa ci viene spostato con un avviso.
- **Token** trascinabili per PG, NPC e nemici generici, con la barra degli HP presa dalla scheda. Nel pannello del token HP e armatura (SP di testa e corpo) hanno le barre e i pulsanti per danni, ablazione e riparazione; i token generici e i nemici hanno HP e SP propri, modificabili anche da «Modifica». Durante lo spostamento una **freccia** va dalla casella di partenza a quella d'arrivo, con la distanza in metri, e la vedono anche gli altri giocatori. Le frecce della tastiera muovono il token selezionato di una casella.
- **Iniziativa**: un pulsante tira REF + 1d10 per tutti, poi «Turno ▶» passa al prossimo e conta i round.
- **Disegno e misure**: la barra in alto a sinistra della mappa ha ✋ (muovi token e mappa), 📏 righello (lo vedi solo tu), ✏ matita, ╱ linea, ▭ rettangolo, ◻ quadrato, ◯ cerchio, ⌫ gomma, i colori, ↶ annulla e 🗑 cancella. Le forme si salvano nella mappa e le vedono tutti in tempo reale; linee e righello mostrano caselle e metri (la diagonale conta una casella, 1 casella = 2 m), rettangoli, quadrati e cerchi le misure passandoci sopra. Ognuno cancella le sue forme, il GM tutte.
- **Layer** (come Roll20, solo per il GM, nella barra della mappa): 🎲 **Token** per i token e i disegni normali; 🗺 **Map** per gli oggetti della mappa (sotto i token, si toccano solo da questo layer e non entrano in «Tira per tutti») e per l'immagine di sfondo, che con ✋ ha una cornice: trascinala per spostarla, tira gli angoli per ridimensionarla; «griglia» (acceso di base) la sposta e la ridimensiona di casella in casella, spento la lascia libera; «proporzioni» tiene quelle dell'immagine (con la griglia l'altezza si arrotonda alla casella), «↺ Adatta» la rimette su tutta la mappa; 🔒 **GM** per token e disegni che vedono solo i GM (i token del layer GM sono quelli nascosti; i disegni stanno in un record solo per i GM). Il layer di un token si cambia dal suo pannello; i token nuovi vanno sul layer attivo. Sempre dal pannello, **Piano** ⤓ ↓ ↑ ⤒ cambia l'ordine di sovrapposizione: in fondo, giù di uno, su di uno, in primo piano (i token del layer Map restano sempre sotto quelli del layer Token). Lo stesso per figure e disegni: selezionali con ✥ e nella barra compaiono ⤓ ↓ ↑ ⤒, che cambiano il piano dentro il loro layer. Gomma, ↶ e 🗑 agiscono solo sul layer attivo. I giocatori sono sempre sul layer Token.
- **A 0 HP** il token ha una grande X rossa e nel suo pannello compare «☠ Death Save» con la penalità attuale (+1 a ogni tiro, − e + per correggerla): per i nemici si conta sul token, per PG e NPC sulla scheda.
- **Pop-up dei tiri**: sulla mappa ogni tiro (tuo o degli altri) compare per qualche secondo in alto a destra e resta nel Dice log. Ogni token ha i suoi **stati**, segnati da un contatore sul token.
- **Dice log** in stile chat, sempre a portata di mano dal pulsante ⬢ in alto (🧹 Pulisci nasconde i tiri vecchi su questo dispositivo; il GM con 🗑 Elimina tutti li cancella per tutti): `2d6+3` per un tiro libero, `3d6kh2` per tirare 3d6 e tenere i 2 più alti (`kl` per i più bassi; vale anche nei danni delle armi), `/d 3d6` per i danni, `/c 14` per una prova con base 14, oppure un messaggio di testo. Chi non ha fatto l'accesso può tirare, ma i suoi tiri restano sul suo dispositivo.

### ❖ Night Market — `// NIGHT_MARKET`
Il negozio della campagna e tutti i cataloghi del sito (la pagina che prima era il Glossario).
- **Negozio**: Armi, Armature, Equipaggiamento (diviso per tipo: droghe, accessori per armi, scudi, attrezzi…), Cyberware e Cyberdeck (deck, programmi, Black ICE, hardware), con ricerca e filtro per categoria di prezzo. Oltre al manuale base ci sono le voci di *12 Days of Gunmas / CutieMAS / CyberMAS / REDMAS / GEARMAS*, *Hornet's Pharmacy*, *Must Have Cyberware Deals* e *Midnight with the Upload*, con la fonte sotto il nome.
- **Entra come**: scegli il personaggio (il giocatore entra col suo PG, il GM con chiunque). «Compra» scala gli eddies e mette l'oggetto nella scheda:
  - armi nella tab Combattimento, con categoria, tabella delle VD, autofire e qualità (Excellent dà +1 a colpire); lo speciale va nelle note;
  - armature nell'inventario, per la testa o per il corpo (si sceglie all'acquisto), e se vuoi indossate subito;
  - equipaggiamento nell'inventario, con la quantità;
  - cyberware nello slot scelto, con l'umanità persa tirata (⚄ per ritirarla) e il controllo degli slot opzioni; il cyberware fondamentale si attiva sullo slot.
  - cyberdeck tra i deck del PG, con le sue regole nel campo «Regole del deck»; programmi, Black ICE e hardware nel deck che scegli (col conteggio degli slot) o nell'inventario.
- **Voci custom in ogni sezione**: «★ + Arma / Armatura / Oggetto / Droga / Cyberdeck / Programma o hardware custom» apre un modulo con i campi giusti per quel tipo; ✎ lo riapre per modificarle o eliminarle. Chi può modificare il sito crea e cambia le sue voci custom; il GM può anche modificare le voci base (diventano custom e si possono ripristinare).
- **Droghe**: tab con durata, effetto primario, VD ed effetto secondario. Le dosi comprate vanno nella categoria Droghe dell'Equipaggiamento: «💉 Assumi» toglie una dose, tira Resist Torture/Drugs contro la VD (nel Dice log), segna la droga «sotto effetto» e, se la prova fallisce, la dipendenza o l'effetto secondario. Un bonus della droga (es. Timewarp +3 all'iniziativa) si applica da solo finché non premi «Effetto finito»; «Curata» toglie la dipendenza.
- **Storico** degli acquisti del personaggio e «Annulla l'ultimo» (restituisce gli eddies e toglie l'oggetto).
- **GM**: mercato aperto o chiuso ai giocatori, prezzi in percentuale, 👁 per nascondere una voce, «Senza pagare» per regali e bottino, ✎ per modificare una voce (anche quelle base: «Ripristina l'originale» le riporta com'erano).
- **⇪ Importa** (GM): incolli o carichi un file .txt / .md con le voci nel formato a blocchi qui sotto, vedi l'anteprima e salvi. Armi, armature ed equipaggiamento vanno nel catalogo custom del mercato, il cyberware nel cyberware custom. Una voce con lo stesso nome la aggiorna.
- **Consultazione**: regole delle armi e tabelle delle distanze, munizioni e stati, colpi mirati, Critical Injury e NET (programmi, Black ICE, hardware, Demoni).

Formato per l'importazione (una voce per blocco, chiavi in italiano o in inglese; le righe senza chiave continuano la descrizione):

```
## Magnum Opus Hellbringer
Tipo: Arma                 (Arma, Armatura, Equipaggiamento, Cyberware)
Categoria: Very Heavy Pistol
Abilità: Handgun
Danno: 5d6
Caricatore: 3
ROF: 1
Mani: 1
Occultabile: no
Autofire: 4                (moltiplicatore massimo, se ce l'ha)
Qualità: Exotic            (Poor, Excellent, Exotic)
Costo: 1000
Speciale: Si inceppa dopo ogni colpo se BODY < 10
Descrizione: Revolver enorme in titanio.
```

Armatura: `SP`, `Malus`. Cyberware: `Gruppo` (Fashionware, Neuralware, Cyberottiche, Cyberudito, Impianti Interni, Impianti Esterni, Cyberbraccio, Cybergamba, Borgware), `Installazione`, `PU` (es. `2d6 (7)`), `Slot`, `Richiede`. Tutti: `Fonte`.

### ⌂ HQ — `// SAFEHOUSE`
La base della crew (regole dei Headquarters).
- **Piani**: ognuno con nome, piantina e note; si passa da uno all'altro con le schede, la piantina si apre a tutto schermo e il GM può aprirla come mappa tattica («🗺 Apri sulla Mappa», nascosta ai giocatori finché non la mostra).
- **HQ IP**: la crew ne riceve tanti quanti IP riceve dalla colonna Group dopo una missione. «+ Aggiungi» con il motivo, storico e «Annulla l'ultimo».
- **Migliorie**: Evidence Wall, Garage, Lockup, Lounge, Medbay, Morale Boost, Rent Reduction, Server Room, Studio, Training Area, Workshop, Workstation, con effetto, upgrade, livello e costo (40 HQ IP). «Compra» e «Upgrade» spendono gli HQ IP; ogni miglioria si compra e si potenzia una volta, il Morale Boost fino a 10 (con la tabella dei benefici, quelli raggiunti evidenziati), la Rent Reduction finché i letti non raddoppiano. «✕ persa» la toglie senza restituire gli HQ IP.
- **★ Migliorie custom** e modifica di quelle esistenti (costi, upgrade massimi, effetti, benefici livello per livello); le migliorie del manuale modificate si possono ripristinare.
- «Accesso perso» segnala che la crew non può usare l'HQ: i benefici sono sospesi finché non lo riprende.

### ⌬ NET — `// NET_ARCHITECTURE`
Le Architetture di Rete che il GM sta mostrando: compaiono piano per piano mentre il Netrunner scende, con Password, File, Nodi e Black ICE (REZ compresi), aggiornate in tempo reale. I piani non ancora raggiunti e le note del GM non arrivano ai giocatori.

### 👥 Party — `// CREW_MANIFEST`
Le schede di tutti i PG (e degli NPC con la fazione «Party») affiancate: HP con i pulsanti per danni e cure, armatura con l'ablazione, Luck, umanità, iniziativa, Death Save, le abilità più alte e le armi da tirare con un clic, e «Tira come» per far partire il Dice log a nome di quel PG. Ognuno può usare qualsiasi scheda.

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

  Con «⇲ Sulla mappa» si mettono N copie sulla mappa, anche nascoste: ogni token ha HP e SP propri e tira dal suo pannello.
- **⌬ Architetture NET**: «⚄ Genera» segue il manuale (pag. 209–211): 3d6 piani, un bivio per ogni d10 da 7 in su (i bivi partono dopo il 2° piano e il ramo principale resta il più profondo), tabella dell'**Ingresso** (1d6) per i primi due piani e dei **piani inferiori** (3d6) secondo la difficoltà Base / Standard / Non Comune / Avanzata (VD 6 / 8 / 10 / 12), ritirando programmi e Password già usciti, più un **Demone** se ci sono Nodi di Controllo. Oppure si costruisce a mano: piani (Password, File, Nodo di Controllo, Black ICE, altro) con VD, descrizione e note, rami, Demoni, ⚄ per ritirare un singolo piano. Nella vista di gioco ogni Black ICE ha i pulsanti **Agguato** (VEL), **Attacco** (ATT), danno o effetto e **Difesa** (DIF), con i REZ da scalare; i Demoni tirano Zap, Control, Difesa e Combattimento. Con «👁 Mostra ai giocatori» la pagina **NET** mostra a tutti i soli piani rivelati con 👁 (rivelarne uno rivela quelli sopra). Nella pagina NET il GM gestisce tutto anche lì e crea **Black ICE e Demoni homebrew**, che compaiono negli elenchi delle architetture e dei Cyberdeck.
- **⚙ Regole della campagna**: catalogo delle **munizioni** (per famiglia di armi, con modificatore al colpire, danno sostitutivo o modificatore al danno ed effetto) e degli **stati**.
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

- **Frontend**: single page application con routing a hash (`#/database`, `#/calendario/2045-03-14`…). Tutta l'interfaccia è generata dai file in `js/ui/`: sono script normali caricati in ordine, che condividono le costanti di primo livello (niente build, niente import). Se aggiungi un file, mettilo in `index.html` dopo quelli di cui usa le funzioni al caricamento.
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

In `meta` ci sono anche `rules` (munizioni e stati), `nethb` (Black ICE e Demoni homebrew) e `cyberhb` (cyberware custom).

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
js/roles.js             Ruoli e Capacità di Ruolo
js/cyberware.js         catalogo del cyberware base con gli effetti
js/market.js            catalogo del Night Market (armi, armature, equipaggiamento) e lettore del formato a blocchi
js/hq.js                migliorie dell'HQ (Headquarters)
js/ui/                  interfaccia, un file per sezione (caricati in ordine da index.html):
  core.js               costanti, stato, utilità, dati, menu, routing, Home e Database
  cyber.js              tab Cyberware ed Equipaggiamento (sagoma, slot, umanità)
  sheet.js              scheda del personaggio e modulo
  roles.js              tab Ruoli
  catalog.js            catalogo del cyberware nelle schede, cyberware custom, pagina Night Market
  market.js             Night Market: acquisti, storico, impostazioni del GM, importazione
  hq.js                 pagina HQ: piani, migliorie, HQ IP
  ip.js                 Punti Miglioramento
  bonus.js              riquadro dei bonus a STAT e abilità
  life.js               tab Wardrobe, Agent e Spese mensili
  vehicles.js           tab Veicoli (garage e Scuderia di Famiglia del Nomade)
  combat.js             tab Combattimento e schede delle armi (PG e nemici)
  rules.js              munizioni, stati, Critical Injury, modificatori, Regole della campagna
  deck.js               Cyberdeck
  dicelog.js            Dice log e pop-up dei tiri
  records.js            dossier, galleria e modulo dei record
  calendar.js · notes.js · diary.js · tracks.js · party.js   le altre pagine
  enemies.js · gm.js    nemici e area GM
  net.js                architetture NET e homebrew
  map.js                pagina Mappa e tempo reale
  draw.js               disegno, righello, forme, layer e immagine di sfondo della mappa
  settings.js · events.js · boot.js   impostazioni, eventi, avvio
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
