// ============================================================
//  CYBERPUNK RED — CYBERWARE BASE (manuale base, nomi italiani)
//  Catalogo per schede, nemici e glossario. Un pezzo occupa 1 Slot,
//  salvo indicazione. pu = Perdita d'Umanità media, dice = tiro.
//  fx = effetti applicati ai tiri:
//    skill  → +v alle abilità elencate      mod   → +v a un tipo di tiro (aimed, init, ranged…)
//    body   → +v al BODY (max)              setBody → BODY fissato
//    pain   → ignora Seriously Wounded      chip  → abilità scelta a livello 3 o 4 (it.lvl)
//    weapon → arma da aggiungere alla scheda
//    stat   → +v a una STAT (stat: "COOL"), fino a max      chip con skill/lvl → abilità fissa (chip homebrew)
//    dodge  → schivi i proiettili qualunque sia il REF    critImmune → Critical Injury senza effetto (crits; limb: solo l'arto dove è installato)
//    nano   → un uso al giorno per riportare la SP sottopelle al massimo
//  cap  = l'effetto vale al massimo per N installazioni (es. Extra-Jointed: 4)
//  base + baseOf + bslots = variante del cyberware fondamentale (Neo-Soviet Cyberarm, Discount Cyberaudio Suite)
//  socket = conta come un Alveolo (budget: espelle il chip quando subisci danni alla testa)
//  cond = vale solo quando lo attivi (es. Sandevistan, percezione con la vista)
//  key  = effetti con la stessa chiave non si sommano (installazioni multiple non cumulative): vale il più forte
// ============================================================
window.CW = (() => {
  const GROUPS = [
    { id: "fashion", label: "Fashionware", slot: "fashion", note: "7 Slot Opzioni" },
    { id: "neural", label: "Neuralware", slot: "neural", note: "base: Collegamento Neurale (5 Slot)" },
    { id: "optics", label: "Cyberottiche", slot: "occhio_dx", note: "base: Cyberocchio (3 Slot)" },
    { id: "audio", label: "Cyberudito", slot: "audio", note: "base: Sistema Cyberudito (3 Slot)" },
    { id: "internal", label: "Impianti Interni", slot: "interni", note: "7 Slot Opzioni" },
    { id: "external", label: "Impianti Esterni", slot: "esterni", note: "7 Slot Opzioni" },
    { id: "arm", label: "Cyberbraccio", slot: "braccio_dx", note: "base: Cyberbraccio (4 Slot)" },
    { id: "leg", label: "Cybergamba", slot: "gamba_dx", note: "base: Cybergamba (3 Slot)" },
    { id: "limbcover", label: "Cyberarti (coperture)", slot: "braccio_dx", note: "nessuno Slot" },
    { id: "borg", label: "Borgware", slot: "borgware", note: "" },
  ];
  const TECH7 = ["cybertech", "electronics", "airtech", "landtech", "weaponstech", "seatech", "basictech"];
  // C(id, gruppo, nome, installazione, costo, categoria, pu, dadi, descrizione, extra)
  const C = (id, g, name, inst, cost, cat, pu, dice, desc, x = {}) => ({ id, g, name, inst, cost, cat, pu, dice, desc, slots: 1, ...x });
  const N = "N/A", CC = "Centro Commerciale", CL = "Clinica", OS = "Ospedale", BC = "Black Chrome", GM = "Going Metal";
  const FBCONLY = "Solo in una Full Body Conversion.";
  const HARD = "non possono essere disattivati, resi inutilizzabili o distrutti da scosse elettriche, Microwaver, impulsi EMP o programmi che non siano Black ICE.";
  const BASE = [
    // Fashionware
    C("biomonitor", "fashion", "Biomonitor", CC, 100, "Premium", 0, N, "Impianto sottocutaneo a LED che mostra battito, temperatura, respirazione, zuccheri… Si collega all'Agent per monitorare la salute."),
    C("chemskin", "fashion", "Chimipelle", CC, 100, "Premium", 0, N, "Pigmenti nella pelle per cambiarne il colore, anche sensibili a temperatura o ormoni. Con i Tecnocapelli: +2 a Personal Grooming (non cumulativo).", { fx: [{ t: "skill", skills: ["grooming"], v: 2, needs: "technohair", key: "grooming-pair" }] }),
    C("empthreads", "fashion", "Filamenti EMP", CC, 10, "Economici", 0, N, "Sottili filamenti d'argento lungo il corpo, simili a circuiti stampati. Si dice che proteggano dagli EMP: non è vero, ma sono all'ultima moda."),
    C("mutalens", "fashion", "Mutalenti", CC, 100, "Premium", 0, N, "Lenti a contatto che cambiano colore, anche con temperatura o ormoni. Un solo cambio di colore e pattern; si disattivano con un'Azione."),
    C("dermalclock", "fashion", "Orologio Dermale", CC, 100, "Premium", 0, N, "Impianto sottocutaneo a LED che mostra ora e data."),
    C("lighttattoo", "fashion", "Tatuaggio Luminoso", CC, 100, "Premium", 0, N, "Innesto sottocutaneo che accumula luce e proietta tatuaggi; i disegni grandi ne vogliono di più. Con almeno tre: +2 a Wardrobe & Style (non cumulativo).", { fx: [{ t: "skill", skills: ["wardrobe"], v: 2, min: 3, key: "wardrobe", count: "lighttattoo" }] }),
    C("technohair", "fashion", "Tecnocapelli", CC, 100, "Premium", 0, N, "Capelli artificiali luminosi, anche sensibili a temperatura o ormoni. Con la Chimipelle: +2 a Personal Grooming (non cumulativo).", { fx: [{ t: "skill", skills: ["grooming"], v: 2, needs: "chemskin", key: "grooming-pair" }] }),
    // Neuralware
    C("neurallink", "neural", "Collegamento Neurale", CL, 500, "Oneroso", 7, "2d6", "Sistema nervoso artificiale, necessario per Neuralware e Presa Sottocutanea. 5 Slot Opzioni.", { base: true }),
    C("chipslot", "neural", "Alveolo", CL, 500, "Oneroso", 7, "2d6", "Presa sul retro del collo per un Chipware; montarlo o toglierlo è un'Azione. La Perdita d'Umanità si subisce solo la prima volta per ogni chip. Il chip non usa slot del Collegamento Neurale. Se ne possono installare più d'uno.", { req: "Collegamento Neurale" }),
    C("olfactory", "neural", "Amplificatore Olfattivo", N, 100, "Premium", 7, "2d6", "Chipware: potenzia l'olfatto e permette di seguire tracce con il fiuto.", { req: "Alveolo", chip: true }),
    C("tactile", "neural", "Amplificatore Tattile", N, 100, "Premium", 7, "2d6", "Chipware: con la mano su una superficie rileva i movimenti entro 20 m; intanto quella mano non fa altro.", { req: "Alveolo", chip: true }),
    C("chemanalyzer", "neural", "Analizzatore Chimico", N, 500, "Oneroso", 3, "1d6", "Chipware: con un'Azione analizza la composizione chimica di una sostanza e la confronta con un database.", { req: "Alveolo", chip: true }),
    C("painEditor", "neural", "Antidolorifico", N, 1000, "Molto Oneroso", 14, "4d6", "Chipware: spegne i recettori del dolore, ignori gli effetti della soglia Seriously Wounded.", { req: "Alveolo", chip: true, fx: [{ t: "pain" }] }),
    C("skillchip", "neural", "Chip Abilità", N, 500, "Oneroso (×2: Molto Oneroso)", 7, "2d6", "Chipware: porta un'Abilità a livello 3 o 4 (lo scegli per ogni chip); se la conosci già a quel livello o più, non fa nulla. I chip di abilità ×2 costano 1.000 E$, gli altri 500.", { req: "Alveolo", chip: true, fx: [{ t: "chip" }] }),
    C("memorychip", "neural", "Chip di Memoria", N, 10, "Economico", 0, N, "Chipware: archivio dati che il cyberware può leggere e scrivere.", { req: "Alveolo", chip: true }),
    C("interfaceplugs", "neural", "Connettore d'Interfaccia", CL, 500, "Oneroso", 7, "2d6", "Nel polso o nella testa: per Smartgun, Cyberdeck, macchinari pesanti o guidare senza mani. Più connettori = più dispositivi insieme.", { req: "Collegamento Neurale" , fx: [{ t: "smart" }] }),
    C("kerenzikov", "neural", "Kerenzikov", CL, 500, "Oneroso", 14, "4d6", "Speedware sempre attivo: +2 all'Iniziativa. Un solo Speedware installato.", { req: "Collegamento Neurale", fx: [{ t: "mod", target: "init", v: 2, key: "speedware" }] }),
    C("bdrecorder", "neural", "Registratore Braindance", CL, 500, "Oneroso", 7, "2d6", "Registra braindance su Chip di Memoria o Agent; per rivederle serve un Visore Braindance.", { req: "Collegamento Neurale" }),
    C("sandevistan", "neural", "Sandevistan", CL, 500, "Oneroso", 7, "2d6", "Speedware: attivato, +3 all'Iniziativa per 1 minuto, poi non si usa per 1 ora. Un solo Speedware installato.", { req: "Collegamento Neurale", fx: [{ t: "mod", target: "init", v: 3, key: "speedware", cond: "Attivato (1 minuto, poi 1 ora di ricarica)" }] }),
    // Cyberottiche
    C("cybereye", "optics", "Cyberocchio", CL, 100, "Premium", 7, "2d6", "Occhio artificiale con 3 Slot Opzioni. Alcune opzioni vanno accoppiate (comprate due volte, una per occhio, con PU separata).", { base: true }),
    C("antidazzle", "optics", "Antiriflesso", CC, 100, "Premium", 2, "1d6/2", "Immune ai lampi di luce, come le flashbang.", { req: "due Cyberocchi, accoppiato" , fx: [{ t: "immune", status: "Accecato", min: 2 }] }),
    C("lowlight", "optics", "Bassa Luminosità/Infrarosso/UV", CC, 500, "Oneroso", 3, "1d6", "Penalità per buio, fumo, nebbia… a 0. Distingui la carne calda dal metallo e vedi oltre le coperture.", { req: "due Cyberocchi, 2 Slot per occhio, accoppiato", slots: 2 }),
    C("colorshift", "optics", "Cambio Colore", CC, 100, "Premium", 2, "1d6/2", "Cambi illimitati di colore e disegno dell'occhio, anche con temperatura o ormoni.", { req: "Cyberocchio" }),
    C("chyron", "optics", "Chyron", CC, 100, "Premium", 2, "1d6/2", "Piccolo schermo nel campo visivo per messaggi e video da altri dispositivi o cyberware.", { req: "Cyberocchio" }),
    C("imageenhance", "optics", "Definitore d'Immagine", CC, 500, "Oneroso", 3, "1d6", "+2 alle prove di Lip Reading, Conceal/Reveal Object e Perception basate sulla vista. Non cumulativo.", { req: "due Cyberocchi, accoppiato", fx: [{ t: "skill", skills: ["lipreading", "conceal", "perception"], v: 2, min: 2, key: "imageenhance", cond: "Prova basata sulla vista" }] }),
    C("dartgun", "optics", "Lanciadardi", CL, 500, "Oneroso", 2, "1d6/2", "Pistola a dardi a colpo singolo nascosta nell'occhio.", { req: "Cyberocchio, 3 Slot", slots: 3 }),
    C("microoptics", "optics", "Micro Ottica", CL, 100, "Premium", 2, "1d6/2", "Microscopio con ingrandimento 400×.", { req: "Cyberocchio" }),
    C("microvideo", "optics", "MicroVideo", CL, 500, "Oneroso", 2, "1d6/2", "Videocamera nell'occhio: registra audio e video su Chip di Memoria o Agent.", { req: "Cyberocchio, 2 Slot", slots: 2 }),
    C("targetscope", "optics", "Mirino", CL, 500, "Oneroso", 3, "1d6", "+1 alle prove dei Colpi Mirati. Non cumulativo.", { req: "Cyberocchio", fx: [{ t: "mod", target: "aimed", v: 1, key: "targetscope" }] }),
    C("raddetector", "optics", "Rilevatore di Radiazioni", CL, 1000, "Molto Oneroso", 3, "1d6", "Mostra le radiazioni entro 100 m come una luce blu sugli oggetti.", { req: "Cyberocchio" }),
    C("teleoptics", "optics", "TeleOttica", CL, 500, "Oneroso", 3, "1d6", "Dettagli fino a 800 m. +1 agli attacchi con Colpo Singolo e Colpo Mirato oltre 51 m. Non cumulativo, né con il Mirino di Precisione.", { req: "Cyberocchio", fx: [{ t: "mod", target: "ranged", v: 1, key: "teleoptics", cond: "Bersaglio oltre 51 m (colpo singolo o mirato)" }] }),
    C("virtuality", "optics", "Virtuality", CC, 100, "Premium", 2, "1d6/2", "Proietta il cyberspazio nel campo visivo: niente più Visore Virtuality.", { req: "due Cyberocchi, accoppiato" }),
    // Cyberudito
    C("cyberaudio", "audio", "Sistema Cyberudito", CL, 500, "Oneroso", 7, "2d6", "Nel cranio, invisibile. 3 Slot Opzioni. Se ne può avere uno solo.", { base: true }),
    C("internalagent", "audio", "Agent Interno", CC, 100, "Premium", 3, "1d6", "Agent completo a comandi vocali; descrive le immagini o si collega a un Cyberocchio con Chyron. Il Chip di Memoria interno si toglie solo con la chirurgia.", { req: "Sistema Cyberudito" }),
    C("stressanalyzer", "audio", "Analizzatore di Stress", CC, 100, "Premium", 3, "1d6", "+2 a Human Perception e Interrogation. Macchina della verità per 1 minuto: il GM tira in segreto e segnala con un bip chi mente (con falsi positivi).", { req: "Sistema Cyberudito", fx: [{ t: "skill", skills: ["humanperception", "interrogation"], v: 2, key: "stressanalyzer" }] }),
    C("leveldamper", "audio", "Antiassordante", CC, 100, "Premium", 2, "1d6/2", "Compensatore di rumore: immune ai rumori forti, come una flashbang.", { req: "Sistema Cyberudito" , fx: [{ t: "immune", status: "Assordato" }] }),
    C("scrambler", "audio", "Codificatore/Decodificatore", CC, 100, "Premium", 2, "1d6/2", "Codifica le comunicazioni in uscita; il decodificatore è incluso.", { req: "Sistema Cyberudito" }),
    C("radiocomm", "audio", "Comunicatore Radio", CC, 100, "Premium", 2, "1d6/2", "Comunicazione via radio fino a 1,6 km.", { req: "Sistema Cyberudito" }),
    C("tracer", "audio", "Localizzatore", CL, 100, "Premium", 2, "1d6/2", "Segue un tracciatore fino a 1,6 km; uno è incluso (gli altri 50 E$).", { req: "Sistema Cyberudito" }),
    C("radioplayer", "audio", "Radio/Lettore Musicale", CL, 50, "Costosa", 2, "1d6/2", "Con un'Azione scansiona le trasmissioni entro 1,6 km; riproduce musica dal Data Pool o da un chip. Per le frequenze criptate serve il Decodificatore.", { req: "Sistema Cyberudito" }),
    C("audiorecorder", "audio", "Registratore Audio", CL, 100, "Premium", 2, "1d6/2", "Registra audio su Chip di Memoria o Agent.", { req: "Sistema Cyberudito" }),
    C("bugdetector", "audio", "Rilevatore di Cimici", CC, 100, "Premium", 2, "1d6/2", "Bip entro 2 m da un dispositivo d'ascolto.", { req: "Sistema Cyberudito" }),
    C("radardetector", "audio", "Rilevatore Radar", CL, 500, "Oneroso", 2, "1d6/2", "Bip se c'è un radar attivo entro 100 m.", { req: "Sistema Cyberudito" }),
    C("amphearing", "audio", "Udito Amplificato", CC, 100, "Premium", 3, "1d6", "+2 alle prove di Perception basate sull'udito. Non cumulativo.", { req: "Sistema Cyberudito", fx: [{ t: "skill", skills: ["perception"], v: 2, key: "amphearing", cond: "Prova basata sull'udito" }] }),
    // Impianti interni
    C("antibodies", "internal", "Anticorpi Potenziati", CC, 500, "Onerosi", 2, "1d6/2", "Una volta stabilizzato, guarisci 2 × BODY PF per ogni giorno di riposo completo."),
    C("audiovox", "internal", "Audiovox", CL, 500, "Oneroso", 3, "1d6", "Sintetizzatore vocale: +2 ad Acting e Play Instrument mentre canti. Non cumulativo.", { fx: [{ t: "skill", skills: ["acting", "instrument"], v: 2, key: "audiovox", cond: "Mentre canti" }] }),
    C("gills", "internal", "Branchie", OS, 1000, "Molto Onerose", 7, "2d6", "Respiri sott'acqua."),
    C("cybersnake", "internal", "Cyberserpente", OS, 1000, "Molto Oneroso", 14, "4d6", "Arma a tentacolo in gola: Arma da Mischia Molto Pesante (4d6, ROF 1), occultata senza prove.", { fx: [{ t: "weapon", name: "Cyberserpente", cat: "vhmelee", dmg: "4d6", rof: 1 }] }),
    C("nasalfilters", "internal", "Filtri Nasali", CL, 100, "Premium", 2, "1d6/2", "Immune a gas tossici, fumi e sostanze inalate. Si disattivano con un'Azione."),
    C("toxinbinders", "internal", "Filtro Antitossina", CL, 100, "Premium", 2, "1d6/2", "+2 a Resist Torture/Drugs. Non cumulativo.", { fx: [{ t: "skill", skills: ["resist"], v: 2, key: "toxinbinders" }] }),
    C("contraceptive", "internal", "Impianto Contraccettivo", CC, 10, "Economico", 0, N, "Previene gravidanze indesiderate."),
    C("radarsonar", "internal", "Impianto Radar/Sonar", CL, 1000, "Molto Oneroso", 7, "2d6", "Scansiona il terreno entro 50 m (anche sott'acqua); non vede oltre le coperture. Il GM indica direzione e presenza degli oggetti in movimento."),
    C("midnightlady", "internal", "Impianto Sessuale Midnight Lady™", CL, 100, "Premium", 7, "2d6", "Sii Venere, sii fuoco, sii desiderio."),
    C("mrstudd", "internal", "Impianto Sessuale Mr. Studd™", CL, 100, "Premium", 7, "2d6", "Tutta la notte, tutte le notti, e nessuno lo verrà a sapere."),
    C("bonelace", "internal", "Laccio Osseo-Muscolare", OS, 1000, "Molto Oneroso", 14, "4d6", "+2 al BODY (cambiano PF, soglie delle ferite e Death Save). Cumulativo, BODY massimo 10.", { fx: [{ t: "body", v: 2, max: 10 }] }),
    C("airtank", "internal", "Riserva d'Aria Indipendente", OS, 1000, "Molto Onerosa", 2, "1d6/2", "30 minuti d'ossigeno, si ricarica in 1 ora; cambiare la bombola (50 E$) è un'Azione."),
    C("vampyres", "internal", "Zanne Vampiriche", CL, 500, "Onerose", 14, "4d6", "Arma da Mischia Leggera di Alta Qualità (1d6, ROF 2) occultabile. Uno scomparto nel palato tiene una fiala di Veleno o Biotossina, che si applica in silenzio e dura 30 minuti.", { fx: [{ t: "weapon", name: "Zanne Vampiriche", cat: "lmelee", dmg: "1d6", rof: 2, quality: "excellent", note: "Alta Qualità" }] }),
    // Impianti esterni
    C("subdermal", "external", "Armatura Subdermale", OS, 1000, "Molto Onerosa", 14, "4d6", "SP 11 a testa e corpo. Vale la SP più alta tra le armature, ma si ablano tutte insieme. Ogni giorno di riposo completo ricostruisce 1 SP.", { fx: [{ t: "armor", sp: 11, type: "subdermal" }] }),
    C("hiddenholster", "external", "Fondina Nascosta", CL, 500, "Onerosa", 7, "2d6", "Fondina nel corpo per un'arma occultabile, senza prove; estrarla non richiede Azioni se la parte del corpo è accessibile."),
    C("skinweave", "external", "Skin Weave", OS, 500, "Onerosa", 7, "2d6", "SP 7 a testa e corpo. Vale la SP più alta tra le armature, ma si ablano tutte insieme. Ogni giorno di riposo completo ricostruisce 1 SP.", { fx: [{ t: "armor", sp: 7, type: "kevlar" }] }),
    C("subdermalpocket", "external", "Tasca Subdermale", CL, 100, "Premium", 3, "1d6", "Tasca sotto la pelle da 5 × 10 cm con zip in RealSkinn™: il contenuto è occultato senza prove."),
    // Cyberbraccio
    C("cyberarm", "arm", "Cyberbraccio", OS, 500, "Oneroso", 7, "2d6", "Braccio artificiale (anche singolo). 4 Slot per opzioni da Cyberbraccio o Cyberarto e una Mano Standard senza PU e senza slot.", { base: true }),
    C("standardhand", "arm", "Mano Standard", CL, 100, "Premium", 2, "1d6/2", "Una mano dall'aspetto normale; anche su un braccio di carne, non conta come cyberware. Nessuno Slot.", { slots: 0 }),
    C("popupranged", "arm", "Arma a Distanza Popup", CL, 500, "Onerosa", 7, "2d6", "Un'arma a distanza a una mano (con accessori) nel braccio, occultabile senza prove; si estrae e si ritira senza Azioni. Estratta, la mano non regge nulla.", { req: "Cyberbraccio, 2 Slot", slots: 2 }),
    C("popupmelee", "arm", "Arma da Mischia Popup", CL, 500, "Onerosa", 7, "2d6", "Un'arma da mischia a una mano leggera, media o pesante nel braccio, occultabile senza prove; si estrae e si ritira senza Azioni.", { req: "Cyberbraccio, 2 Slot", slots: 2 }),
    C("armdeck", "arm", "Cyberdeck", CL, 500, "Oneroso", 3, "1d6", "Cyberdeck fisso nel braccio: +1 Slot per programmi o hardware. Smontarlo lo distrugge (programmi e hardware si recuperano). Servono ancora Connettori d'Interfaccia e Collegamento Neurale.", { req: "Cyberbraccio, 3 Slot", slots: 3 }),
    C("rippers", "arm", "Digitolame", CL, 500, "Onerosi", 3, "1d6", "Artigli retrattili in carbonio: Arma da Mischia Media (2d6, ROF 2) occultabile. Si possono avere su un braccio di carne.", { fx: [{ t: "weapon", name: "Digitolame", cat: "mmelee", dmg: "2d6", rof: 2 }] }),
    C("quickchange", "arm", "Innesto Cambio Rapido", CL, 100, "Premium", 7, "2d6", "Il braccio si monta e smonta con un'Azione; la PU si subisce solo la prima volta per ogni braccio.", { req: "Cyberbraccio" }),
    C("popupgl", "arm", "Lanciagranate Popup", CL, 500, "Oneroso", 7, "2d6", "Lanciagranate a una mano da un colpo nel braccio; solo l'accessorio Smartgun. Occultabile senza prove.", { req: "Cyberbraccio, 2 Slot", slots: 2 }),
    C("toolhand", "arm", "Mano Attrezzo", CL, 100, "Premium", 3, "1d6", "Cacciavite, chiave, trapano e altri attrezzi nelle dita. Anche su un braccio di carne."),
    C("grapplehand", "arm", "Mano Rampino", CL, 100, "Premium", 3, "1d6", "Con un'Azione lancia un rampino che si aggancia a una copertura spessa entro 30 m; regge il doppio del tuo peso, 10 PF. Niente penalità ad arrampicarti.", { req: "Cyberbraccio" }),
    C("medscanner", "arm", "Medscanner", CL, 500, "Oneroso", 7, "2d6", "Scanner medico con sonde ed elettrodi: +2 a Paramedic e First Aid. Non cumulativo.", { req: "Cyberbraccio, 2 Slot", slots: 2, fx: [{ t: "skill", skills: ["paramedic", "firstaid"], v: 2, key: "medscanner" }] }),
    C("bigknucks", "arm", "Nocche Blindate", CL, 100, "Premium", 3, "1d6", "Nocche rinforzate: Arma da Mischia Media (2d6, ROF 2) occultabile. Anche su un braccio di carne.", { fx: [{ t: "weapon", name: "Nocche Blindate", cat: "mmelee", dmg: "2d6", rof: 2 }] }),
    C("subdermalgrip", "arm", "Presa Sottocutanea", CL, 100, "Premium", 3, "1d6", "Piastra nel palmo per usare le Smartgun: alternativa economica ai Connettori d'Interfaccia. Anche su un braccio di carne.", { req: "Collegamento Neurale, 1 Slot Neuralware" , fx: [{ t: "smart" }] }),
    C("slicendice", "arm", "Rasoio Monofilare", CL, 500, "Oneroso", 3, "1d6", "Frusta monomolecolare nel pollice: Arma da Mischia Media (2d6, ROF 2) occultabile.", { fx: [{ t: "weapon", name: "Rasoio Monofilare", cat: "mmelee", dmg: "2d6", rof: 2 }] }),
    C("scratchers", "arm", "Scorticatori", CC, 100, "Premium", 2, "1d6/2", "Unghie in carbonio: Arma da Mischia Leggera (1d6, ROF 2) occultabile.", { fx: [{ t: "weapon", name: "Scorticatori", cat: "lmelee", dmg: "1d6", rof: 2 }] }),
    C("popupshield", "arm", "Scudo Popup", CL, 500, "Oneroso", 7, "2d6", "Scudo balistico pieghevole nel braccio; si estrae e si ritira senza Azioni se ha più di 0 PF.", { req: "Cyberbraccio, 3 Slot", slots: 3 }),
    C("techscanner", "arm", "Tecnoscanner", CL, 500, "Oneroso", 7, "2d6", "Scanner per macchinari ed elettronica: +2 a Cybertech, Electronics/Security, Air/Land/Sea Vehicle Tech, Weaponstech e Basic Tech. Non cumulativo.", { req: "Cyberbraccio, 3 Slot", slots: 3, fx: [{ t: "skill", skills: TECH7, v: 2, key: "techscanner" }] }),
    C("armcamera", "arm", "Videocamera", CL, 500, "Onerosa", 7, "2d6", "Videocamera a comparsa nella spalla, indipendente; estrarla o riporla è un'Azione.", { req: "Cyberbraccio, 2 Slot", slots: 2 }),
    C("wolvers", "arm", "Wolvers", CL, 500, "Onerosi", 7, "2d6", "Artigli retrattili dalle nocche: Arma da Mischia Pesante (3d6, ROF 2) occultabile. Anche su un braccio di carne.", { fx: [{ t: "weapon", name: "Wolvers", cat: "hmelee", dmg: "3d6", rof: 2 }] }),
    // Cybergamba
    C("cyberleg", "leg", "Cybergamba", OS, 100, "Premium", 3, "1d6", "Gamba artificiale (anche singola). 3 Slot per opzioni da Cybergamba o Cyberarto e un Piede Standard senza PU e senza slot. Molte opzioni vanno accoppiate.", { base: true }),
    C("standardfoot", "leg", "Piede Standard", CL, 100, "Premium", 2, "1d6/2", "Un piede dall'aspetto normale; anche su una gamba di carne, non conta come cyberware. Nessuno Slot.", { slots: 0 }),
    C("jumpbooster", "leg", "Jump Booster", CL, 500, "Oneroso", 3, "1d6", "Idrauliche nelle gambe: niente penalità al movimento saltando.", { req: "due Cybergambe, accoppiato" }),
    C("talonfoot", "leg", "Piede Artigliato", CL, 500, "Oneroso", 3, "1d6", "Lama nel piede: Arma da Mischia Leggera occultabile. Anche su una gamba di carne.", { fx: [{ t: "weapon", name: "Piede Artigliato", cat: "lmelee", dmg: "1d6", rof: 2 }] }),
    C("gripfoot", "leg", "Piede Grip", CL, 500, "Oneroso", 3, "1d6", "Piedi ad alta aderenza: niente penalità al movimento arrampicandoti.", { req: "due Cybergambe, accoppiato" }),
    C("webfoot", "leg", "Piede Palmato", CL, 500, "Oneroso", 3, "1d6", "Membrane tra le dita: niente penalità al movimento nuotando.", { req: "due Cybergambe, accoppiato" }),
    C("skatefoot", "leg", "Piede Pattino", CL, 500, "Oneroso", 3, "1d6", "Rollerblade nel piede: +6 m alla Corsa.", { req: "due Cybergambe, accoppiato" , fx: [{ t: "run", v: 6, min: 2, key: "skate" }] }),
    // Coperture
    C("plasticcover", "limbcover", "Copertura Plastica", CC, 100, "Premium", 0, N, "Copertura plastica in molti colori e disegni. Nessuno Slot.", { req: "Cyberbraccio o Cybergamba", slots: 0 }),
    C("realskinn", "limbcover", "RealSkinn™", CC, 500, "Onerosa", 0, N, "Copertura in pelle artificiale. Nessuno Slot.", { req: "Cyberbraccio o Cybergamba", slots: 0 }),
    C("superchrome", "limbcover", "Superchrome®", CC, 1000, "Molto Onerosa", 0, N, "Copertura cromata: +2 a Wardrobe & Style (non cumulativo). Nessuno Slot.", { req: "Cyberbraccio o Cybergamba", slots: 0, fx: [{ t: "skill", skills: ["wardrobe"], v: 2, key: "wardrobe" }] }),
    C("hardenedshield", "limbcover", "Schermatura Rinforzata (Hardened)", CL, 1000, "Molto Onerosa", 3, "1d6", "Le opzioni del cyberware non possono essere disattivate, rese inutilizzabili o distrutte da scosse elettriche, Microwaver o impulsi EMP, né da effetti di programmi che non siano Black ICE.", { req: "Cyberbraccio o Cybergamba" }),
    // Borgware
    C("multioptic", "borg", "Innesto MultiOttico", OS, 1000, "Molto Oneroso", 14, "4d6", "Fino a 5 Cyberocchi in più (venduti e installati a parte). Uno solo."),
    C("artshoulder", "borg", "Innesto Spalla Artificiale", OS, 1000, "Molto Oneroso", 14, "4d6", "Due Cyberbraccia sotto le braccia normali. Uno solo."),
    C("sensorarray", "borg", "Modulo Sensori", CL, 1000, "Molto Oneroso", 14, "4d6", "Due antenne piatte ai lati della testa («Orecchie da Coniglio»): fino a 5 opzioni Cyberudito. Uno solo. Nessuno Slot.", { req: "Sistema Cyberudito", slots: 0 }),
    C("framebeta", "borg", "Telaio Lineare β (Beta) Impiantato", OS, 5000, "Lussuoso", 14, "4d6", "Esoscheletro pesantemente rinforzato: BODY 14 (cambiano PF, soglie e Death Save), massimo 15.", { req: "BODY 8 e due Lacci Osseo-Muscolari", fx: [{ t: "setBody", v: 14, max: 15, laces: 2, minBody: 8 }] }),
    C("framesigma", "borg", "Telaio Lineare σ (Sigma) Impiantato", OS, 1000, "Molto Oneroso", 14, "4d6", "Esoscheletro rinforzato: BODY 12 (cambiano PF, soglie e Death Save), massimo 13.", { req: "BODY 6 e un Laccio Osseo-Muscolare", fx: [{ t: "setBody", v: 12, max: 13, laces: 1, minBody: 6 }] }),
    // espansioni (12 Days of …, Hornet's Pharmacy, Must Have Cyberware Deals)
    C("autoinjector", "internal", "AutoInjector Bodyweight", CL, 100, "Premium", 3, "1d6", "Serbatoio sottocutaneo per una dose di droga (caricarla è un'Azione); con un'Azione te la inietti. Con il Biomonitor la programmi per iniettarla da sola quando tiri l'iniziativa, subisci una Critical Injury o entri in uno Stato di Ferita scelto.", {"src": "Hornet's Pharmacy"}),
    C("gasjet", "arm", "Gas Jet Pursuit Security", CL, 500, "Expensive", 7, "2d6", "Lanciatore di gas nel braccio con 3 dosi di droga o 3 fiale di veleno o biotossina, occultato senza prove. Funziona come uno Shotgun esotico a una mano da 1 colpo, solo in modalità Shotgun Shell: invece dei danni applica la sostanza a chi viene colpito (i Filtri Nasali la bloccano). Ogni colpo svuota il serbatoio.", {"src": "Hornet's Pharmacy", "req": "Cyberbraccio", "slots": 2}),
    C("appetite", "internal", "Appetite Controller", OS, 500, "Expensive", 7, "2d6", "Gestisci e ignori la fame dal Biomonitor: niente perdita d'umanità dallo stress ambientale di lungo periodo legato alla fame. La fame però resta: dopo 7 giorni senza cibo tiri un Death Save ogni giorno, con +1 cumulativo.", {"src": "Must Have Cyberware Deals", "req": "Biomonitor"}),
    C("cyberpillow", "arm", "Cyberpillow", CL, 100, "Premium", 0, N, "Un cuscino che esce dal cyberbraccio: nessun beneficio, se non poter dormire ovunque.", {"src": "Must Have Cyberware Deals", "req": "Cyberbraccio"}),
    C("vidscreen", "external", "External Vidscreen", OS, 100, "Premium", 7, "2d6", "Schermo flessibile sottopelle, grande come il manuale, in qualsiasi parte del corpo; lo usa l'Agent collegato o un Memory Chip nell'Alveolo.", {"src": "Must Have Cyberware Deals"}),
    C("holopalm", "arm", "Holo Projector Palm", CL, 100, "Premium", 2, "1d6/2", "Proiettore olografico nel palmo: ologramma interattivo grande come una lattina, collegato all'Agent. Può essere l'unico impianto in un braccio di carne.", {"src": "Must Have Cyberware Deals"}),
    C("killdisplay", "fashion", "Kill Display", CC, 100, "Premium", 0, N, "Scritta luminosa sottopelle «KILLS:» seguita da un numero fino a 999, aggiornato dall'Agent. Conta come Tatuaggio Luminoso per il +2 a Wardrobe & Style con tre installazioni.", {"src": "Must Have Cyberware Deals", "as": "lighttattoo", "fx": [{"t": "skill", "skills": ["wardrobe"], "v": 2, "min": 3, "key": "wardrobe", "count": "lighttattoo"}]}),
    C("ledsnails", "fashion", "Unghie Turn-On-Show-Off di Lead", CC, 100, "Premium", 0, N, "Dieci unghie luminose programmabili, con penne luminose e preset dalla CitiNet. Conta come Tatuaggio Luminoso per il +2 a Wardrobe & Style con tre installazioni. Su mani di carne o cyber.", {"src": "Must Have Cyberware Deals", "as": "lighttattoo", "fx": [{"t": "skill", "skills": ["wardrobe"], "v": 2, "min": 3, "key": "wardrobe", "count": "lighttattoo"}]}),
    C("moodeye", "fashion", "Mood Eye", CC, 100, "Premium", 0, N, "Lenti che cambiano colore con l'umore letto dal Collegamento Neurale: rosso rabbia, blu tristezza, giallo paura, rosa eccitazione, verde gelosia, grigio morte. Fingere un'emozione è Acting VD 21. Si spengono senza Azione.", {"src": "Must Have Cyberware Deals", "req": "Collegamento Neurale"}),
    C("neutongue", "internal", "NeuTongue", OS, 100, "Premium", 7, "2d6", "Lingua cibernetica: con l'Agent aggiungi sapori virtuali al cibo. Si spegne senza Azione, e allora non senti più i sapori.", {"src": "Must Have Cyberware Deals"}),
    C("perfectfit", "leg", "PerfectFit Cyberfoot", CL, 100, "Premium", 2, "1d6/2", "Piede cyber regolabile in misura (un'Azione) con tacco idraulico: in coppia azzera le penalità da scarpe inadatte. Può essere l'unico impianto in una gamba di carne.", {"src": "Must Have Cyberware Deals"}),
    C("kibblewarmer", "arm", "PersonalPak KibbleWarmer", CL, 100, "Premium", 3, "1d6", "Fornetto a rosticceria nell'avambraccio per scaldare i cilindri di Kibble.", {"src": "Must Have Cyberware Deals", "req": "Cyberbraccio"}),
    C("shredder", "arm", "Personal Shredder Pursuit Security", CL, 100, "Premium", 3, "1d6", "Distruggidocumenti a taglio incrociato nascosto nel braccio, con serbatoio per i frammenti.", {"src": "Must Have Cyberware Deals", "req": "Cyberbraccio"}),
    C("sponsored", "limbcover", "Sponsored Covering", CC, 50, "Costly", 0, N, "Pubblicità luminosa sull'arto. Se rispetti il contratto dello sponsor ricevi 20 eb il primo di ogni mese; se lo violi possono provare a riprendersi l'arto.", {"src": "Must Have Cyberware Deals", "req": "Cyberbraccio o Cybergamba", "slots": 0}),
    C("monopaw", "arm", "Hello Cutie Mono-Paw", CL, 500, "Expensive", 7, "2d6", "Artigli da gatto retrattili con punte monomolecolari: Medium Melee Weapon Excellent da 1d6, occultabile senza prove, che ignora le armature sotto SP 11. Attivi, la mano non regge nulla.", {"src": "12 Days of CutieMAS", "req": "Cyberbraccio", "fx": [{"t": "weapon", "name": "Mono-Paw", "cat": "mmelee", "dmg": "1d6", "rof": 2, "quality": "excellent", "note": "Excellent · ignora le armature sotto SP 11"}]}),
    C("sparkleize", "optics", "Hello Cutie Sparkle-ize", CL, 250, "Premium", 3, "1d6", "Torcia nell'occhio. In coppia, con un'Azione costringi chi ha occhi entro 25 m a un Resist Torture/Drugs VD 15, o subisce Occhio Danneggiato per un minuto (l'Antiriflesso protegge).", {"src": "12 Days of CutieMAS", "req": "Cyberocchio", "slots": 2}),
    C("chainripp", "arm", "ChainRipp", OS, 500, "Expensive", 14, "4d6", "Motosega retrattile nel polso: Very Heavy Melee Weapon a una mano che si estrae senza Azione. Avviata (un'Azione) è Excellent ed esotica. Estratta, la mano non regge nulla.", {"src": "12 Days of CyberMAS", "req": "Cyberbraccio", "slots": 4, "fx": [{"t": "weapon", "name": "ChainRipp", "cat": "vhmelee", "dmg": "4d6", "rof": 1, "note": "avviata: Excellent (+1)"}]}),
    C("gangjazzler", "arm", "Cybermatrix Gang Jazzler", CL, 500, "Expensive", 7, "2d6", "Ago elettrodo nel braccio, occultato senza prove. Strangolando qualcuno in una presa puoi consumare la batteria (50 eb, si ricarica in un'ora): Resist Torture/Drugs VD 13 o perde i sensi per un minuto. Può essere l'unico impianto in un braccio di carne.", {"src": "12 Days of CyberMAS"}),
    C("bugeye", "borg", "Cyclops International Bug Eye", OS, 500, "Expensive", 14, "4d6", "Cyberocchio gigante da insetto con 5 slot per le opzioni del Cyberocchio.", {"src": "12 Days of CyberMAS"}),
    C("deathtrance", "neural", "DeathTrance", CL, 500, "Expensive", 3, "1d6", "Con un'Azione rallenti battito e respiro: sembri morto e hai −4 a tutte le Azioni. Per accorgersene serve Medical Tech VD 17 o Criminology, Deduction o Perception VD 21. Esci quando vuoi, senza Azione.", {"src": "12 Days of CyberMAS", "req": "Collegamento Neurale", "fx": [{"t": "mod", "target": "all", "v": -4, "cond": "Attivo (sembri morto)"}]}),
    C("monovision", "borg", "Kiroshi MonoVision", OS, 500, "Expensive", 14, "4d6", "Visore che sostituisce entrambi gli occhi, con 3 slot per le opzioni del Cyberocchio che contano sempre come in coppia. Se è la tua unica vista, Occhio Perso ha effetto doppio. Non va in un MultiOptic Mount.", {"src": "12 Days of CyberMAS"}),
    C("optishield", "external", "Kiroshi OptiShield", CL, 500, "Expensive", 7, "2d6", "Occhiali a specchio antiriflesso retrattili nella fronte (un'Azione): estesi, sei immune ai lampi accecanti come quelli delle flashbang.", {"src": "12 Days of CyberMAS", "fx": [{"t": "immune", "status": "Accecato", "cond": "Estesi"}]}),
    C("watchman", "arm", "Psiberstuff Watch-Man", CC, 100, "Premium", 3, "1d6", "Agent completo con schermo a ribalta nel cyberbraccio.", {"src": "12 Days of CyberMAS", "req": "Cyberbraccio"}),
    C("poserchip", "neural", "Poser Chip", N, 500, "Expensive", 14, "4d6", "Chip che ti fa copiare voce, gesti e modi di una persona: +4 ad Acting per impersonarla, +5 se il giocatore la interpreta. 500 eb per una celebrità, 1.000 eb per una persona privata.", {"src": "12 Days of CyberMAS", "req": "Alveolo", "chip": true, "fx": [{"t": "skill", "skills": ["acting"], "v": 4, "cond": "Impersonando"}]}),
    C("arcthrower", "arm", "Cyberbraccio Arc-Thrower Radline Blitzkrieg", OS, 1000, "Very Expensive", 14, "4d6", "Cyberbraccio senza mano e senza slot opzioni, non va in coppia. È uno Shotgun esotico Poor a una mano con Heavy Weapons, solo in modalità Shotgun Shell ma da 4d6. Ogni colpo consuma una delle 32 cariche della batteria (100 eb, inclusa; un'ora per ricaricarla). Niente Critical Injury né ablazione; chi scenderebbe sotto 1 HP resta a 1 HP privo di sensi.", {"src": "12 Days of CyberMAS", "fx": [{"t": "weapon", "name": "Arc-Thrower", "cat": "shotgun", "skill": "heavyweapons", "dmg": "4d6", "rof": 1, "note": "Poor · solo Shotgun Shell · niente Critical Injury né ablazione · 32 cariche"}]}),
    C("microwaldo", "arm", "Raven Microcybernetics MicroWaldo", CL, 1000, "Very Expensive", 7, "2d6", "Otto sonde articolate nel polso collegate al cervello (opzione del Cyberbraccio e Neuralware): +1 a Surgery per un Medtech.", {"src": "12 Days of CyberMAS"}),
    C("fleshweave", "external", "Sycust FleshWeave", OS, 1000, "Very Expensive", 7, "2d6", "SP 7 a testa e corpo come lo Skin Weave (vale la più alta, si ablano insieme), ma dopo 10 minuti senza sforzi torna a SP piena.", {"src": "12 Days of CyberMAS", "fx": [{"t": "armor", "sp": 7, "type": "kevlar"}]}),
    C("romanova", "leg", "Cybergambe Romanova Wyzard Technologies", OS, 1000, "Very Expensive", 14, "4d6", "Cybergambe in coppia (un solo costo e una sola perdita d'umanità), con 3 slot opzioni ciascuna e un Talon Foot incluso che non costa umanità né slot e non si toglie.", {"src": "12 Days of CyberMAS"}),
    C("faceplate", "internal", "Quick Change Faceplate Mount", OS, 1000, "Very Expensive", 14, "4d6", "Sostituisce il viso con un attacco per Faceplate intercambiabili (un'Azione). Uno è incluso, gli altri costano 100 eb.", {"src": "12 Days of REDMAS"}),
    C("quickdigits", "arm", "Rocklin Augmentics Quick Digits", CL, 250, "Premium", 3, "1d6", "Cybermano, anche come unico impianto in un braccio di carne. Con due o più: +1 a Conceal/Reveal Object, Contortionist (con le mani), First Aid, Forgery, Language (Sign), Paramedic, Pick Lock e Pick Pocket.", {"src": "12 Days of REDMAS", "fx": [{"t": "skill", "skills": ["conceal", "contortionist", "firstaid", "forgery", "paramedic", "picklock", "pickpocket"], "v": 1, "min": 2, "key": "quickdigits"}]}),
    C("skydrivers", "leg", "Rocklin Augmentics Skydrivers", OS, 1000, "Very Expensive", 14, "4d6", "Cybergambe in coppia con 2 slot ciascuna e Jump Booster inclusi (senza umanità né slot, non si tolgono). Se ti sei mosso di almeno 4 m, un attacco di Brawling o Martial Arts con le gambe contro una copertura fa +3d6.", {"src": "12 Days of REDMAS"}),
    C("cyberspine", "internal", "Sycust Cyberspine", OS, 1000, "Very Expensive", 7, "2d6", "Immune all'effetto e ai danni bonus della Critical Injury Spina Dorsale. Hardened: immune agli EMP e ai programmi non Black ICE. +1 a Contortionist. Può ospitare un Cybersnake.", {"src": "12 Days of REDMAS", "slots": 3, "fx": [{"t": "skill", "skills": ["contortionist"], "v": 1}, {"t": "critImmune", "crits": ["Spinal Injury"]}]}),
    C("cyberconductor", "borg", "Zetatech CyberConductor Integrato", OS, 1000, "Very Expensive", 14, "4d6", "Solo in una Full Body Conversion. Collega fino a 3 cyberdeck più quelli installati nel corpo; cambiare deck non fa danni.", {"src": "12 Days of REDMAS", "req": "Full Body Conversion", "slots": 3}),
    C("cyberscanner", "arm", "Cyberscanner Integrato", CL, 500, "Expensive", 7, "2d6", "In un minuto, a 2 m, legge il cyberware installato di chi resta fermo (dà errore con impianti Hardened, potenziati o sconosciuti). Il risultato compare su un pannello LED, sul Chyron o sull'Agent.", {"src": "12 Days of GEARMAS", "req": "Cyberbraccio", "slots": 2}),
    // Black Chrome
    C("budgetchipslot", "neural", "Budget Chipware Socket", CL, 100, "Premium", 7, "2d6", "Alveolo economico sul retro del collo: tiene un Chipware, montarlo o toglierlo è un'Azione; la Perdita d'Umanità si subisce solo la prima volta per ogni chip. Se ne possono installare più d'uno. Quando subisci danni alla testa espelle il chip fino a 30 m dietro di te: 1d10, con 1 il chip si distrugge (si ritrova facilmente: fuma ed è rovente).", { src: BC, req: "Collegamento Neurale", socket: true, budget: true }),
    C("memstim", "neural", "Explicit Memory Stimulator", N, 100, "Premium", 3, "1d6", "Chipware: +2 alle prove di Concentration per ricordare informazioni.", { src: BC, req: "Alveolo", chip: true, fx: [{ t: "skill", skills: ["concentration"], v: 2, cond: "Per ricordare informazioni" }] }),
    C("reflexcopro", "neural", "Reflex Co-Processor", OS, 500, "Expensive", 14, "4d6", "Aiuta il Collegamento Neurale a gestire i riflessi: schivi i proiettili qualunque sia il tuo REF.", { src: BC, req: "Collegamento Neurale", fx: [{ t: "dodge" }] }),
    C("discountaudio", "audio", "Discount Cyberaudio Suite", CL, 100, "Premium", 3, "1d6", "Sistema Cyberudito economico, con un grosso componente esterno ben visibile attorno alle orecchie: 1 Slot Opzioni. Se ne può avere uno solo.", { src: BC, base: true, baseOf: "audio", bslots: 1 }),
    C("eyehardened", "optics", "Hardened Cybereye Casing", CL, 500, "Expensive", 3, "1d6", `L'interno del Cyberocchio è rinforzato a standard militare: l'occhio e le sue opzioni ${HARD}`, { src: BC, req: "Cyberocchio" }),
    C("healthmonitor", "fashion", "Heuristic Health Monitor", CC, 500, "Expensive", 0, N, "Sensori in tutto il corpo collegati al Biomonitor: salute dei tessuti, densità ossea, muscoli… e la classifica «Healthy Persons» in tempo reale. Conosci a colpo d'occhio i tuoi Punti Ferita.", { src: BC, req: "Biomonitor" }),
    C("internalhardened", "internal", "Internal Body Cyberware Hardened Shielding", OS, 1000, "Very Expensive", 14, "4d6", `Tutti gli Impianti Interni sono rinforzati a standard militare: ${HARD}`, { src: BC }),
    C("racerbracer", "internal", "RacerBracer", OS, 500, "Expensive", 7, "2d6", "Rocklin Augmentics: sei immune alla Critical Injury Whiplash.", { src: BC, fx: [{ t: "critImmune", crits: ["Whiplash"] }] }),
    C("nanomatrix", "internal", "Trauma Response Nanomatrix", OS, 1000, "Very Expensive", 7, "2d6", "Una volta al giorno, con un'Azione, riporta lo Skin Weave o l'Armatura Subdermale alla SP piena. Ogni installazione in più aggiunge un uso al giorno.", { src: BC, req: "Skin Weave o Armatura Subdermale", fx: [{ t: "nano" }] }),
    C("neosovietarm", "arm", "Neo-Soviet Cyberarm", OS, 100, "Premium", 7, "2d6", "Cyberbraccio economico: 3 Slot per opzioni da Cyberbraccio o Cyberarto e una Mano Standard senza PU e senza slot. Senza BODY 8 o più hai −1 a tutti i tiri che usano questo braccio. Ingombrante: le opzioni sono sempre visibili quando è scoperto (anche le armi che altrove sarebbero occultate) e si riconosce come cyberbraccio anche sotto il RealSkinn™.", { src: BC, base: true, baseOf: "braccio", bslots: 3, minBody: 8 }),
    C("flashbulb", "arm", "Flashbulb", CL, 500, "Expensive", 7, "2d6", "Con un'Azione costringi chi ha occhi di carne o cyberottiche entro 25 m a un Resist Torture/Drugs VD 15 (tu non tiri): se fallisce subisce Damaged Eye per un minuto. Protezioni come l'Antiriflesso lo evitano.", { src: BC, req: "Cyberbraccio, 2 Slot", slots: 2 }),
    C("armdeckup", "arm", "Integrated Cyberdeck Upgrade", CL, 500, "Expensive", 7, "2d6", "+1 Slot per programmi o hardware al Cyberdeck integrato nello stesso Cyberbraccio (aggiungilo dalla tab Cyberdeck).", { src: BC, req: "Cyberdeck nello stesso Cyberbraccio" }),
    C("popupnet", "arm", "Popup Net Launcher", CL, 500, "Expensive", 7, "2d6", "Lanciareti esotico a una mano nel braccio, con una rete nel caricatore: Shoulder Arms, tabella dello Shotgun, al massimo 25 m. Occultato senza prove, si estrae e si ritira senza Azioni; estratto, la mano non regge nulla. Chi è colpito resta in Presa nella rete: niente Azione di Movimento, niente armi a due mani, −2 alle Azioni fisiche. La rete ha 15 PF: chi spara dentro danneggia allo stesso modo rete e bersaglio. Per liberarsi: Contortionist VD 13 (solo chi è dentro) o Brawling VD 13 (chiunque), e la rete si distrugge. Rete di ricambio 50 eb.", { src: BC, req: "Cyberbraccio, 3 Slot", slots: 3, fx: [{ t: "weapon", name: "Popup Net Launcher", cat: "shotgun", skill: "shoulderarms", dmg: "—", rof: 1, nodmg: true, noAmmo: true, charges: 1, batteryCost: 50, exotic: true, note: "Exotic · niente danni: chi è colpito resta in Presa nella rete (niente Movimento né armi a due mani, −2 alle Azioni fisiche) · al massimo 25 m · rete 15 PF · Contortionist o Brawling VD 13 per liberarsi · carica = rete (50 eb)" }] }),
    C("popupshotgun", "arm", "Popup Shotgun", CL, 1000, "Very Expensive", 7, "2d6", "Shotgun con 2 colpi nel Cyberbraccio, compatibile solo con il Collegamento Smartgun tra gli accessori. Occultato senza prove, si estrae e si ritira senza Azioni; estratto, la mano non regge nulla.", { src: BC, req: "Cyberbraccio, 3 Slot", slots: 3, fx: [{ t: "weapon", name: "Popup Shotgun", cat: "shotgun", dmg: "5d6", rof: 1, mag: 2, note: "Popup nel cyberbraccio · solo il Collegamento Smartgun come accessorio" }] }),
    C("extrajointed", "limbcover", "Extra-Jointed Cyberlimb Upgrade", CL, 500, "Expensive", 3, "1d6", "Opzione del cyberarto: +2 a Contortionist. Una sola per cyberarto; valgono al massimo quattro cyberarti, fino a +8.", { src: BC, req: "Cyberbraccio o Cybergamba", fx: [{ t: "skill", skills: ["contortionist"], v: 2, cap: 4 }] }),
    C("reinforcedlimb", "limbcover", "Reinforced Cyberlimb Upgrade", CL, 1000, "Very Expensive", 3, "1d6", "Idrauliche ridondanti e rinforzi: il cyberarto è immune a Broken Arm se è un braccio, a Broken Leg se è una gamba. Il GM decide quale arto subisce la Critical Injury.", { src: BC, req: "Cyberbraccio o Cybergamba", fx: [{ t: "critImmune", limb: true }] }),
    C("borghardened", "borg", "Borgware Hardened Shielding", OS, 1000, "Very Expensive", 14, "4d6", `Un Borgware già installato è rinforzato a standard militare: la schermatura e il Borgware scelto ${HARD}`, { src: BC, req: "un Borgware installato" }),
    // Going Metal (Interface RED Vol. 3): Full Body Conversion
    C("biosystem", "borg", "Biosystem", OS, 10000, "Super Luxury", 14, "4d6", "Il cervello (e qualche altro pezzo scelto) in un Biopod con computer e batterie: si installa in un corpo FBC. Rinforzato contro EMP e radiazioni. Fuori da un corpo non può agire, solo osservare e comunicare (guscio = Copertura da 25 PF); un colpo diretto al cervello uccide. Installarlo in un corpo: Cybertech o Surgery VD 17, 4 ore, si può ritentare.", { src: GM, fbcOnly: true, slots: 0 }),
    C("cyberskull", "internal", "Cyberskull", OS, 5000, "Luxury", 14, "4d6", "Cranio di metallo con Faceplate personalizzato (altri 100 eb). La testa non è più un punto debole ×2 per i colpi mirati; immune a Cracked Skull e Broken Jaw. In una FBC non costa umanità.", { src: GM, slots: 3, fx: [{ t: "critImmune", crits: ["Cracked Skull", "Broken Jaw"] }] }),
    C("dragoonplating", "external", "Dragoon Plating", OS, 5000, "Luxury", 14, "4d6", "Borgware. Piastre magnetiche: SP 15 a testa e corpo, −2 a REF, DEX e MOVE. Con un'Azione si sganciano (niente SP né malus) e con un'Azione si richiamano entro 6 m. Si riparano di 1 SP a fine giornata se non ne perdono. Set di ricambio 1.000 eb. Serve BODY 16 se non sei una FBC.", { src: GM, fx: [{ t: "armor", sp: 15, type: "plating" }] }),
    C("dragoonmetalgear", "external", "Dragoon Plating, Metalgear", OS, 15000, "Super Luxury", 14, "4d6", "Borgware. Piastre Metalgear: SP 18 a testa e corpo, −3 a REF, DEX e MOVE. Si sganciano e si richiamano come le Dragoon Plating; si riparano di 1 SP a fine giornata se non ne perdono. Set di ricambio 5.000 eb. Serve BODY 16 se non sei una FBC.", { src: GM, fx: [{ t: "armor", sp: 18, type: "plating" }] }),
    C("fbcbrimstone", "external", "FBC Brimstone Coating", OS, 1000, "Very Expensive", 7, "2d6", FBCONLY + " Immune ai danni da fuoco (anche munizioni incendiarie e lanciafiamme) e non prende fuoco.", { src: GM, fbcOnly: true }),
    C("fbcchameleon", "external", "FBC Chameleon Coating", OS, 1000, "Very Expensive", 7, "2d6", FBCONLY + " Fermo per 1 minuto (20 round) attivi senza Azione un mimetismo contro tutti i sensi visivi (anche Bassa Luminosità/IR/UV): serve Perception VD 17 per vederti. Si spegne se ti muovi più di 2 m in un round. Seconda installazione: 30 secondi (10 round); terza: 9 secondi (3 round).", { src: GM, fbcOnly: true }),
    C("fbcemp", "external", "FBC EMP Coating", OS, 1000, "Very Expensive", 7, "2d6", FBCONLY + " Quando un effetto EMP renderebbe inutilizzabili uno o più pezzi del tuo cyberware, si brucia invece una delle installazioni di EMP Coating. Più installazioni, più strati di protezione.", { src: GM, fbcOnly: true }),
    C("fbcgemini", "external", "FBC Gemini Sculpt", OS, 1000, "Very Expensive", 0, N, FBCONLY + " Rimodella il corpo in forma umana con un guscio di Realskinn: a vista non si capisce che sei una FBC, solo all'infrarosso (sei freddo come il metallo). Non va su un Telaio Omega o con BODY 16 o più.", { src: GM, fbcOnly: true }),
    C("fbcbodyweight", "external", "FBC Integrated Bodyweight Coating", OS, 1000, "Very Expensive", 7, "2d6", FBCONLY + " 2 slot solo per hardware, condivisi da tutti i cyberdeck integrati nel cyberware; i deck integrati sono collegati senza Connettori d'Interfaccia (ne usi comunque uno alla volta). Ogni installazione in più: +2 slot hardware condivisi. Con questo coating la Tuta Bodyweight non serve.", { src: GM, fbcOnly: true }),
    C("heavysubdermal", "external", "Heavy Subdermal Plating", OS, 5000, "Luxury", 14, "4d6", "Borgware. SP 13 a testa e corpo, come Armatura Subdermale. −2 a REF, DEX e MOVE se non hai BODY 14 o più e non sei una FBC. Ogni giorno di riposo completo ripara 1 SP. Serve BODY 10 se non sei una FBC.", { src: GM, fx: [{ t: "armor", sp: 13, type: "subdermal" }] }),
    C("hydraulics", "internal", "Internal Hydraulics Upgrade", OS, 1000, "Very Expensive", 3, "1d6", FBCONLY + " Con un Telaio Lineare: REF, DEX e MOVE almeno 4 (le armature e le Critical Injury le abbassano comunque).", { src: GM, fbcOnly: true, fx: [{ t: "statMin", stats: ["REF", "DEX", "MOVE"], v: 4, key: "hydraulics" }] }),
    C("hydraulicstuned", "internal", "Internal Hydraulics Upgrade, Tuned", OS, 5000, "Luxury", 3, "1d6", FBCONLY + " Con un Telaio Lineare: REF, DEX e MOVE almeno 6 (le armature e le Critical Injury le abbassano comunque).", { src: GM, fbcOnly: true, fx: [{ t: "statMin", stats: ["REF", "DEX", "MOVE"], v: 6, key: "hydraulics" }] }),
    C("hydraulicsperfect", "internal", "Internal Hydraulics Upgrade, Perfected", OS, 20000, "Super Luxury", 3, "1d6", FBCONLY + " Con un Telaio Lineare: REF, DEX e MOVE almeno 8 (le armature e le Critical Injury le abbassano comunque).", { src: GM, fbcOnly: true, fx: [{ t: "statMin", stats: ["REF", "DEX", "MOVE"], v: 8, key: "hydraulics" }] }),
    C("frameomega", "borg", "Telaio Lineare Ω (Omega) Impiantato", OS, 10000, "Super Luxury", 28, "8d6", "Endoskeleton perfezionato con muscoli idraulici e myomar: BODY 16 (cambiano PF, soglie e Death Save), massimo 16. Conta come due Borgware per l'umanità massima.", { src: GM, req: "BODY 10 e tre Lacci Osseo-Muscolari", max: 8, fx: [{ t: "setBody", v: 16, max: 16, laces: 3, minBody: 10 }] }),
    C("prehensilefoot", "leg", "Prehensile Cyberfoot", CL, 1000, "Very Expensive", 3, "1d6", "Con un'Azione la Cybergamba diventa un Cyberbraccio e il piede una mano (un'Azione per tornare). Trasformata: −4 a MOVE (minimo 1), tranne in gravità zero.", { src: GM, req: "Cybergamba" }),
    C("zerogthrusters", "leg", "Zero Gravity Thrusters", CL, 1000, "Very Expensive", 3, "1d6", "Propulsori di precisione: in gravità zero nessuna penalità al movimento. Serbatoi da 100 eb, da cambiare ogni 24 ore d'uso. Servono due Cybergambe, in coppia, 2 slot.", { src: GM, req: "due Cybergambe, in coppia", slots: 2 }),
  ];
  const groupOf = id => GROUPS.find(g => g.id === id) || GROUPS[0];

  // ---------- FULL BODY CONVERSION (Going Metal) ----------
  // corpi FBC: frame = telaio incluso (BODY), eyes = due Cyberocchi o un Kiroshi MonoVision, arms = cyberbraccia,
  // noHl = parti senza umanità persa né umanità massima tolta, inc = cyberware incluso che costa umanità (nel pacchetto)
  const FRAMES = { sigma: { v: 12, max: 13, name: "Telaio Lineare σ (Sigma)" }, beta: { v: 14, max: 15, name: "Telaio Lineare β (Beta)" }, omega: { v: 16, max: 16, name: "Telaio Lineare Ω (Omega)" } };
  const FB = (id, name, cost, cat, hl, dice, frame, eyes, inc, desc, x = {}) => ({ id, name, cost, cat, hl, dice, frame, eyes, arms: 2, inc, desc, ...x });
  const FBC = [
    FB("copernicus", "Cybermatrix Inc. Copernicus", 17300, "Very Expensive", 52, "2d6/2+15d6", "sigma", "mono", [["antidazzle", 1], ["fbcemp", 2], ["grapplehand", 2], ["hydraulics", 1], ["prehensilefoot", 2], ["radarsonar", 1], ["radiocomm", 1], ["toolhand", 2], ["zerogthrusters", 2]], "Il corpo ideale per l'esplorazione e la costruzione nello spazio profondo."),
    FB("aquarius", "Dynalar Aquarius", 13000, "Very Expensive", 37, "2d6/2+10d6", "sigma", 2, [["lowlight", 2], ["radardetector", 1], ["radiocomm", 1], ["radarsonar", 1], ["subdermal", 1], ["webfoot", 2]], "L'ultima parola per l'esplorazione e la vita sott'acqua."),
    FB("brimstone", "Dynalar Brimstone", 17600, "Very Expensive", 53, "1d6/2+15d6", "sigma", 2, [["amphearing", 1], ["fbcbrimstone", 1], ["heavysubdermal", 1], ["lowlight", 2], ["radarsonar", 1], ["radiocomm", 1], ["popupgl", 2]], "Creato per sconfiggere il fuoco. Lanciagranate Popup Tech Upgraded (+1 capacità)."),
    FB("dragoon", "Militech Dragoon Revised War Platform", 35000, "Super Luxury", 64, "3d6/2+18d6", "omega", 2, [["antidazzle", 2], ["chyron", 1], ["dragoonplating", 1], ["fbcemp", 2], ["internalagent", 1], ["lowlight", 2], ["reinforcedlimb", 4], ["subdermalgrip", 2], ["hydraulicstuned", 1]], "Revisione del corpo militare che vinse la 4ª Guerra Corporativa; l'armamento si compra a parte."),
    FB("eclipse", "Militech Eclipse", 29200, "Luxury", 67, "2d6/2+19d6", "beta", "mono", [["amphearing", 1], ["fbcchameleon", 3], ["gripfoot", 2], ["lowlight", 1], ["radiocomm", 1], ["scrambler", 1], ["subdermal", 1], ["subdermalpocket", 2], ["popupmelee", 1], ["hydraulicstuned", 1]], "Militech nega l'esistenza dei «ninja borg». Arma da Mischia Popup Tech Upgraded (Kendachi Mono-Three)."),
    FB("enforcer", "Militech Enforcer", 16800, "Very Expensive", 53, "3d6/2+13d6", "sigma", "mono", [["antidazzle", 1], ["audiorecorder", 1], ["heavysubdermal", 1], ["hiddenholster", 1], ["lowlight", 1], ["popupgl", 1], ["popupmelee", 1], ["radiocomm", 1], ["subdermalgrip", 1], ["targetscope", 1], ["stressanalyzer", 1]], "Il corpo per proteggere e servire. Arma da Mischia Popup: Stun Baton."),
    FB("spyder", "Militech Spyder 2.0", 24900, "Luxury", 73, "1d6/2+22d6", "beta", "mono", [["amphearing", 1], ["artshoulder", 1], ["budgetchipslot", 1], ["fbcchameleon", 1], ["grapplehand", 4], ["gripfoot", 2], ["imageenhance", 1], ["internalagent", 1], ["lowlight", 1], ["microvideo", 1], ["tactile", 1], ["teleoptics", 1], ["hydraulicstuned", 1]], "Il borg da spionaggio perfetto, con quattro cyberbraccia.", { arms: 4 }),
    FB("sheol", "Moore Technologies Sheol", 19600, "Very Expensive", 32, "1d6/2+9d6", "beta", 2, [["chemanalyzer", 1], ["budgetchipslot", 1], ["chyron", 1], ["heavysubdermal", 1], ["internalagent", 1], ["raddetector", 1]], "Il borg originale per le operazioni pericolose."),
    FB("samson", "NovelTech Samson", 20500, "Luxury", 39, "3d6/2+10d6", "omega", 2, [["antidazzle", 2], ["chyron", 1], ["internalagent", 1], ["raddetector", 1], ["subdermal", 1], ["techscanner", 1], ["toolhand", 2]], "Il borg industriale più robusto sul mercato."),
    FB("gemini", "Raven Microcybernetics Gemini", 10200, "Expensive", 14, "4d6", "sigma", 2, [["mrstudd", 1], ["skinweave", 1]], "Tutti i vantaggi di una FBC, nessuno svantaggio sociale. Senza umanità persa anche FBC Gemini Sculpt, Tecnocapelli e Shift Tacts; Mr. Studd o Midnight Lady a scelta.", { noHlExtra: ["fbcgemini", "technohair"] }),
    FB("wiseman", "Raven Microcybernetics Wiseman", 27480, "Luxury", 70, "3d6/2+19d6", "sigma", 2, [["chyron", 1], ["armdeck", 4], ["fbcbodyweight", 3], ["internalagent", 1], ["armdeckup", 4], ["virtuality", 2]], "Il corpo per Netrunner che uccide i Netrunner nemici. Deck inclusi: due Excellent Quality, Microtech Warrior e Kestrel 2 Tech Upgraded (+1 slot), integrati nelle braccia; hardware nel Bodyweight Coating."),
    FB("alpha", "Rocklin Augmentics Alpha Class", 9900, "Expensive", 21, "6d6", "sigma", 2, [["interfaceplugs", 1], ["subdermal", 1]], "Il modello d'ingresso per eccellenza: il primo che viene in mente pensando a un «borg»."),
    FB("kildare", "Trauma Team Kildare", 12200, "Very Expensive", 39, "3d6/2+10d6", "sigma", "mono", [["amphearing", 1], ["chyron", 1], ["imageenhance", 1], ["lowlight", 1], ["medscanner", 1], ["microoptics", 1], ["radiocomm", 1], ["microwaldo", 1], ["toolhand", 1], ["techscanner", 1]], "Il chirurgo che non si stanca mai. Mano Attrezzo Tech Upgraded con Airhypo."),
  ];
  const fbcBody = id => FBC.find(b => b.id === id) || null;
  // cyberware che in una FBC non costa umanità né toglie umanità massima (parti del corpo)
  const FBC_NOHL = ["cyberarm", "cyberaudio", "cybereye", "cyberleg", "cyberskull", "framesigma", "framebeta", "frameomega", "neurallink", "monovision", "discountaudio", "neosovietarm"];
  // Critical Injury senza effetto né danni bonus in un corpo FBC
  const FBC_CRITS = ["Broken Jaw", "Collapsed Lung", "Concussion", "Cracked Skull", "Crushed Windpipe", "Lost Ear", "Spinal Injury", "Torn Muscle", "Whiplash"];
  // dadi del pacchetto, es. «3d6/2+19d6»: la parte /2 si dimezza per eccesso
  function rollFbc(dice) {
    let total = 0; const out = [];
    for (const part of String(dice || "").split("+")) {
      const m = part.match(/(\d+)d(\d+)(\/2)?/); if (!m) continue;
      const d = Array.from({ length: +m[1] }, () => CPR.die(+m[2])), s = d.reduce((a, b) => a + b, 0);
      total += m[3] ? Math.ceil(s / 2) : s; out.push(...d);
    }
    return { total, dice: out };
  }

  // homebrew del GM (meta "cyberhb"): stessi campi del catalogo
  let HB = [];
  const setHomebrew = rec => { HB = ((rec && rec.items) || []).map(x => ({ slots: 1, ...x, custom: true })); };
  const all = () => [...BASE, ...HB];
  const byId = id => all().find(c => c.id === id) || null;
  // trova una voce anche dal nome (impianti inseriti a mano prima del catalogo)
  const norm = s => String(s || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  const byName = name => { const n = norm(name); return n ? all().find(c => norm(c.name) === n) || null : null; };
  // PU: tiro dei dadi della voce (1d6/2 = metà arrotondata per eccesso)
  function rollPu(c) {
    if (!c || !c.dice || c.dice === "N/A") return { total: 0, dice: [] };
    const half = /\/2$/.test(c.dice), m = String(c.dice).match(/(\d+)d(\d+)/); if (!m) return { total: num(c.pu), dice: [] };
    const dice = Array.from({ length: +m[1] }, () => CPR.die(+m[2])), sum = dice.reduce((a, b) => a + b, 0);
    return { total: half ? Math.ceil(sum / 2) : sum, dice };
  }
  const num = v => (v === "" || v == null || isNaN(+v)) ? 0 : +v;

  // effetti degli impianti installati · items = [{ ref, installed, on, param }]
  // risultato: skill{ id: [{l,v}] }, mods[{name,target,value}], body (BODY con gli impianti), pain, armor[], weapons[]
  function effects(items, baseBody, opts = {}) {
    let inst = (items || []).filter(it => it.installed !== false).map(it => ({ it, c: byId(it.ref) || byName(it.name) })).filter(x => x.c);
    if (opts.chipCap != null) { let n = 0; inst = inst.filter(x => !x.c.chip || ++n <= opts.chipCap); }
    const w = x => x.it.pair ? 2 : 1;   // negli Occhiali Intelligenti un'opzione conta sempre come una coppia
    const have = id => inst.filter(x => x.c.id === id).reduce((t, x) => t + w(x), 0);
    const count = id => inst.filter(x => x.c.id === id || x.c.as === id).reduce((t, x) => t + w(x), 0);   // «as»: conta come un altro impianto
    const out = { skill: {}, mods: [], stat: {}, body: null, pain: false, armor: [], weapons: [], cond: [], immune: [], smart: false, run: 0, warn: [], dodge: "", critImmune: [], nano: 0, statMin: {}, fbc: !!opts.fbc };
    let body = +baseBody || 0, frame = null; const frames = [];
    // effetti validi; con la stessa chiave resta il più forte (es. Analizzatore di Stress potenziato sul normale)
    const ok = [], best = {}, capN = {};
    for (const { it, c } of inst) for (const [fi, f] of (c.fx || []).entries()) {
      // bonus situazionali: attivi di base, spenti solo se qualcuno li disattiva a mano (off: true; il vecchio «on» non conta)
      if (f.cond) out.cond.push({ c, f, on: !it.off, it });
      if (f.cond && it.off) continue;
      if (f.needs && !have(f.needs)) continue;
      if (f.min && count(f.count || c.id) < f.min) continue;
      // cap: l'effetto conta al massimo per N installazioni (es. quattro cyberarti Extra-Jointed)
      if (f.cap && (capN[c.id + fi] = (capN[c.id + fi] || 0) + 1) > f.cap) continue;
      if (c.fbcOnly && !opts.fbc) continue;   // pezzi solo per FBC: senza corpo FBC non fanno niente
      const x = { it, c, f }; ok.push(x);
      if (f.key && (!best[f.key] || num(f.v) > num(best[f.key].f.v))) best[f.key] = x;
    }
    for (const x of ok) {
      const { it, c, f } = x;
      if (f.key && best[f.key] !== x) continue;
      if (f.t === "skill") for (const s of f.skills) (out.skill[s] = out.skill[s] || []).push({ l: c.name, v: f.v });
      // Chip Abilità: abilità e livello scelti all'acquisto; un chip homebrew li ha fissi (f.skill, f.lvl)
      const chipSk = f.skill || it.param, chipLv = f.lvl || it.lvl;
      if (f.t === "chip" && chipSk) (out.skill[chipSk] = out.skill[chipSk] || []).push({ l: c.name, chip: +chipLv === 4 ? 4 : 3 });
      if (f.t === "stat" && f.stat) (out.stat[f.stat] = out.stat[f.stat] || []).push({ l: c.name, v: num(f.v), max: f.max });
      if (f.t === "mod") out.mods.push({ name: c.name, target: f.target, value: f.v });
      if (f.t === "body") body = Math.min(f.max || 99, body + f.v);
      // Telaio Lineare: si controlla e si applica dopo i Lacci (vedi sotto)
      if (f.t === "setBody") frames.push({ f, c });
      if (f.t === "pain") out.pain = true;
      if (f.t === "immune") out.immune.push({ status: f.status, name: c.name });          // stato che non ti penalizza (es. Accecato)
      if (f.t === "smart") out.smart = true;                                              // collegamento per le armi Smartgun
      if (f.t === "run") out.run += f.v;                                                  // metri in più alla Corsa
      if (f.t === "armor") out.armor.push({ name: c.name, sp: f.sp + (+it.up || 0), type: f.type, up: +it.up || 0 });
      if (f.t === "weapon") out.weapons.push({ ...f, src: c.name });
      if (f.t === "dodge") out.dodge = out.dodge || c.name;                               // schivi i proiettili con qualsiasi REF
      if (f.t === "nano") out.nano += 1;                                                  // usi al giorno della Nanomatrix
      if (f.t === "statMin") f.stats.forEach(s => { out.statMin[s] = Math.max(out.statMin[s] || 0, num(f.v)); });   // Idrauliche FBC
      // Critical Injury senza effetto; limb: solo quella dell'arto dove è installato (braccio → Broken Arm, gamba → Broken Leg)
      if (f.t === "critImmune") {
        const limb = /^braccio/.test(it.slot || "") ? "Broken Arm" : /^gamba/.test(it.slot || "") ? "Broken Leg" : "";
        const crits = f.limb ? (limb ? [limb] : []) : f.crits || [];
        crits.forEach(n => out.critImmune.push({ crit: n, name: c.name, limb: !!f.limb, slot: it.slot || "" }));
      }
    }
    // requisiti del telaio: il BODY già alzato dai Lacci (es. 4 + Laccio = 6 basta per il Sigma) e il numero di Lacci
    for (const { f, c } of frames) {
      // in una FBC i requisiti di Lacci e BODY sono soddisfatti (il telaio fa parte del corpo)
      if (opts.fbc) { if (!frame || f.v > frame.v) frame = f; continue; }
      const miss = [f.minBody && body < f.minBody ? `BODY ${f.minBody} (ora ${body})` : "", f.laces && have("bonelace") < f.laces ? `${f.laces > 1 ? f.laces + " Lacci" : "un Laccio"} Osseo-Muscolar${f.laces > 1 ? "i" : "e"} (ne hai ${have("bonelace")})` : ""].filter(Boolean);
      if (miss.length) out.warn.push({ name: c.name, miss });
      else if (!frame || f.v > frame.v) frame = f;
    }
    // il telaio fissa il BODY (12 o 14), anche se i Lacci da soli si fermano a 10
    // FBC: il BODY viene dal telaio del corpo (anche se nello slot non c'è); le parti senza carne ignorano 9 Critical Injury
    if (opts.fbc) {
      const F = FRAMES[opts.fbcFrame] || FRAMES.sigma;
      if (!frame || F.v > frame.v) frame = F;
      body = frame.v;
      FBC_CRITS.filter(n => !out.critImmune.some(x => x.crit === n && !x.limb)).forEach(n => out.critImmune.push({ crit: n, name: "Full Body Conversion", limb: false, slot: "" }));
    }
    if (frame) body = Math.min(Math.max(body, frame.v), frame.max);
    out.body = body;
    // pezzi solo per FBC installati senza corpo FBC
    if (!opts.fbc) inst.filter(x => x.c.fbcOnly).forEach(x => out.warn.push({ name: x.c.name, miss: ["un corpo Full Body Conversion"] }));
    return out;
  }
  // bonus di un'abilità al suo livello: i Chip Abilità portano il livello a 3 se è più basso
  function skillBonus(fx, skillId, lvl) {
    const list = (fx && fx.skill[skillId]) || [], best = Math.max(0, ...list.filter(b => b.chip).map(b => b.chip));
    return list.filter(b => !b.chip || b.chip === best).filter((b, i, l) => !b.chip || l.findIndex(x => x.chip) === i).map(b => b.chip ? { l: `${b.l} (livello ${b.chip})`, v: Math.max(0, b.chip - (+lvl || 0)) } : { l: b.l, v: b.v }).filter(b => b.v);
  }

  // conta come un Alveolo (l'Alveolo del manuale o il Budget Chipware Socket)
  const isSocket = c => !!c && (c.id === "chipslot" || !!c.socket);
  // varianti del cyberware fondamentale per un tipo di slot (braccio, audio…)
  const baseVariants = kind => all().filter(c => c.base && c.baseOf === kind);
  return { GROUPS, groupOf, BASE, all, byId, byName, setHomebrew, rollPu, effects, skillBonus, isSocket, baseVariants, FBC, FRAMES, fbcBody, FBC_NOHL, FBC_CRITS, rollFbc };
})();
