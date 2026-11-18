// ============================================================
//  CYBERPUNK RED — CYBERWARE BASE (manuale base, nomi italiani)
//  Catalogo per schede, nemici e glossario. Un pezzo occupa 1 Slot,
//  salvo indicazione. pu = Perdita d'Umanità media, dice = tiro.
//  fx = effetti applicati ai tiri:
//    skill  → +v alle abilità elencate      mod   → +v a un tipo di tiro (aimed, init, ranged…)
//    body   → +v al BODY (max)              setBody → BODY fissato
//    pain   → ignora Seriously Wounded      chip  → abilità scelta a livello 3
//    weapon → arma da aggiungere alla scheda
//  cond = vale solo quando lo attivi (es. Sandevistan, percezione con la vista)
//  key  = effetti con la stessa chiave non si sommano (installazioni multiple non cumulative)
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
  const N = "N/A", CC = "Centro Commerciale", CL = "Clinica", OS = "Ospedale";
  const BASE = [
    // Fashionware
    C("biomonitor", "fashion", "Biomonitor", CC, 100, "Premium", 0, N, "Impianto sottocutaneo a LED che mostra battito, temperatura, respirazione, zuccheri… Si collega all'Agent per monitorare la salute."),
    C("chemskin", "fashion", "Chimipelle", CC, 100, "Premium", 0, N, "Pigmenti nella pelle per cambiarne il colore, anche sensibili a temperatura o ormoni. Con i Tecnocapelli: +2 a Personal Grooming (non cumulativo).", { fx: [{ t: "skill", skills: ["grooming"], v: 2, needs: "technohair", key: "grooming-pair" }] }),
    C("empthreads", "fashion", "Filamenti EMP", CC, 10, "Economici", 0, N, "Sottili filamenti d'argento lungo il corpo, simili a circuiti stampati. Si dice che proteggano dagli EMP: non è vero, ma sono all'ultima moda."),
    C("mutalens", "fashion", "Mutalenti", CC, 100, "Premium", 0, N, "Lenti a contatto che cambiano colore, anche con temperatura o ormoni. Un solo cambio di colore e pattern; si disattivano con un'Azione."),
    C("dermalclock", "fashion", "Orologio Dermale", CC, 100, "Premium", 0, N, "Impianto sottocutaneo a LED che mostra ora e data."),
    C("lighttattoo", "fashion", "Tatuaggio Luminoso", CC, 100, "Premium", 0, N, "Innesto sottocutaneo che accumula luce e proietta tatuaggi; i disegni grandi ne vogliono di più. Con almeno tre: +2 a Wardrobe & Style (non cumulativo).", { fx: [{ t: "skill", skills: ["wardrobe"], v: 2, min: 3, key: "wardrobe" }] }),
    C("technohair", "fashion", "Tecnocapelli", CC, 100, "Premium", 0, N, "Capelli artificiali luminosi, anche sensibili a temperatura o ormoni. Con la Chimipelle: +2 a Personal Grooming (non cumulativo).", { fx: [{ t: "skill", skills: ["grooming"], v: 2, needs: "chemskin", key: "grooming-pair" }] }),
    // Neuralware
    C("neurallink", "neural", "Collegamento Neurale", CL, 500, "Oneroso", 7, "2d6", "Sistema nervoso artificiale, necessario per Neuralware e Presa Sottocutanea. 5 Slot Opzioni.", { base: true }),
    C("chipslot", "neural", "Alveolo", CL, 500, "Oneroso", 7, "2d6", "Presa sul retro del collo per un Chipware; montarlo o toglierlo è un'Azione. La Perdita d'Umanità si subisce solo la prima volta per ogni chip. Il chip non usa slot del Collegamento Neurale. Se ne possono installare più d'uno.", { req: "Collegamento Neurale" }),
    C("olfactory", "neural", "Amplificatore Olfattivo", N, 100, "Premium", 7, "2d6", "Chipware: potenzia l'olfatto e permette di seguire tracce con il fiuto.", { req: "Alveolo", chip: true }),
    C("tactile", "neural", "Amplificatore Tattile", N, 100, "Premium", 7, "2d6", "Chipware: con la mano su una superficie rileva i movimenti entro 20 m; intanto quella mano non fa altro.", { req: "Alveolo", chip: true }),
    C("chemanalyzer", "neural", "Analizzatore Chimico", N, 500, "Oneroso", 3, "1d6", "Chipware: con un'Azione analizza la composizione chimica di una sostanza e la confronta con un database.", { req: "Alveolo", chip: true }),
    C("painEditor", "neural", "Antidolorifico", N, 1000, "Molto Oneroso", 14, "4d6", "Chipware: spegne i recettori del dolore, ignori gli effetti della soglia Seriously Wounded.", { req: "Alveolo", chip: true, fx: [{ t: "pain" }] }),
    C("skillchip", "neural", "Chip Abilità", N, 500, "Oneroso (×2: Molto Oneroso)", 7, "2d6", "Chipware: un'Abilità a livello 3, se non la conosci già meglio. I chip di abilità ×2 costano 1.000 E$, gli altri 500.", { req: "Alveolo", chip: true, fx: [{ t: "chip" }] }),
    C("memorychip", "neural", "Chip di Memoria", N, 10, "Economico", 0, N, "Chipware: archivio dati che il cyberware può leggere e scrivere.", { req: "Alveolo", chip: true }),
    C("interfaceplugs", "neural", "Connettore d'Interfaccia", CL, 500, "Oneroso", 7, "2d6", "Nel polso o nella testa: per Smartgun, Cyberdeck, macchinari pesanti o guidare senza mani. Più connettori = più dispositivi insieme.", { req: "Collegamento Neurale" }),
    C("kerenzikov", "neural", "Kerenzikov", CL, 500, "Oneroso", 14, "4d6", "Speedware sempre attivo: +2 all'Iniziativa. Un solo Speedware installato.", { req: "Collegamento Neurale", fx: [{ t: "mod", target: "init", v: 2, key: "speedware" }] }),
    C("bdrecorder", "neural", "Registratore Braindance", CL, 500, "Oneroso", 7, "2d6", "Registra braindance su Chip di Memoria o Agent; per rivederle serve un Visore Braindance.", { req: "Collegamento Neurale" }),
    C("sandevistan", "neural", "Sandevistan", CL, 500, "Oneroso", 7, "2d6", "Speedware: attivato, +3 all'Iniziativa per 1 minuto, poi non si usa per 1 ora. Un solo Speedware installato.", { req: "Collegamento Neurale", fx: [{ t: "mod", target: "init", v: 3, key: "speedware", cond: "Attivato (1 minuto, poi 1 ora di ricarica)" }] }),
    // Cyberottiche
    C("cybereye", "optics", "Cyberocchio", CL, 100, "Premium", 7, "2d6", "Occhio artificiale con 3 Slot Opzioni. Alcune opzioni vanno accoppiate (comprate due volte, una per occhio, con PU separata).", { base: true }),
    C("antidazzle", "optics", "Antiriflesso", CC, 100, "Premium", 2, "1d6/2", "Immune ai lampi di luce, come le flashbang.", { req: "due Cyberocchi, accoppiato" }),
    C("lowlight", "optics", "Bassa Luminosità/Infrarosso/UV", CC, 500, "Oneroso", 3, "1d6", "Penalità per buio, fumo, nebbia… a 0. Distingui la carne calda dal metallo e vedi oltre le coperture.", { req: "due Cyberocchi, 2 Slot per occhio, accoppiato", slots: 2 }),
    C("colorshift", "optics", "Cambio Colore", CC, 100, "Premium", 2, "1d6/2", "Cambi illimitati di colore e disegno dell'occhio, anche con temperatura o ormoni.", { req: "Cyberocchio" }),
    C("chyron", "optics", "Chyron", CC, 100, "Premium", 2, "1d6/2", "Piccolo schermo nel campo visivo per messaggi e video da altri dispositivi o cyberware.", { req: "Cyberocchio" }),
    C("imageenhance", "optics", "Definitore d'Immagine", CC, 500, "Oneroso", 3, "1d6", "+2 alle prove di Lip Reading, Conceal/Reveal Object e Perception basate sulla vista. Non cumulativo.", { req: "due Cyberocchi, accoppiato", fx: [{ t: "skill", skills: ["lipreading", "conceal", "perception"], v: 2, key: "imageenhance", cond: "Prova basata sulla vista" }] }),
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
    C("leveldamper", "audio", "Antiassordante", CC, 100, "Premium", 2, "1d6/2", "Compensatore di rumore: immune ai rumori forti, come una flashbang.", { req: "Sistema Cyberudito" }),
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
    C("vampyres", "internal", "Zanne Vampiriche", CL, 500, "Onerose", 14, "4d6", "Arma da Mischia Leggera di Alta Qualità (1d6, ROF 2) occultabile. Uno scomparto nel palato tiene una fiala di Veleno o Biotossina, che si applica in silenzio e dura 30 minuti.", { fx: [{ t: "weapon", name: "Zanne Vampiriche", cat: "lmelee", dmg: "1d6", rof: 2, note: "Alta Qualità" }] }),
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
    C("subdermalgrip", "arm", "Presa Sottocutanea", CL, 100, "Premium", 3, "1d6", "Piastra nel palmo per usare le Smartgun: alternativa economica ai Connettori d'Interfaccia. Anche su un braccio di carne.", { req: "Collegamento Neurale, 1 Slot Neuralware" }),
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
    C("skatefoot", "leg", "Piede Pattino", CL, 500, "Oneroso", 3, "1d6", "Rollerblade nel piede: +6 m alla Corsa.", { req: "due Cybergambe, accoppiato" }),
    // Coperture
    C("plasticcover", "limbcover", "Copertura Plastica", CC, 100, "Premium", 0, N, "Copertura plastica in molti colori e disegni. Nessuno Slot.", { req: "Cyberbraccio o Cybergamba", slots: 0 }),
    C("realskinn", "limbcover", "RealSkinn™", CC, 500, "Onerosa", 0, N, "Copertura in pelle artificiale. Nessuno Slot.", { req: "Cyberbraccio o Cybergamba", slots: 0 }),
    C("superchrome", "limbcover", "Superchrome®", CC, 1000, "Molto Onerosa", 0, N, "Copertura cromata: +2 a Wardrobe & Style (non cumulativo). Nessuno Slot.", { req: "Cyberbraccio o Cybergamba", slots: 0, fx: [{ t: "skill", skills: ["wardrobe"], v: 2, key: "wardrobe" }] }),
    C("hardenedshield", "limbcover", "Schermatura Rinforzata", CL, 1000, "Molto Onerosa", 3, "1d6", "L'arto e le sue opzioni non si disattivano con EMP e programmi (salvo Black ICE).", { req: "Cyberbraccio o Cybergamba" }),
    // Borgware
    C("multioptic", "borg", "Innesto MultiOttico", OS, 1000, "Molto Oneroso", 14, "4d6", "Fino a 5 Cyberocchi in più (venduti e installati a parte). Uno solo."),
    C("artshoulder", "borg", "Innesto Spalla Artificiale", OS, 1000, "Molto Oneroso", 14, "4d6", "Due Cyberbraccia sotto le braccia normali. Uno solo."),
    C("sensorarray", "borg", "Modulo Sensori", CL, 1000, "Molto Oneroso", 14, "4d6", "Due antenne piatte ai lati della testa («Orecchie da Coniglio»): fino a 5 opzioni Cyberudito. Uno solo. Nessuno Slot.", { req: "Sistema Cyberudito", slots: 0 }),
    C("framebeta", "borg", "Telaio Lineare β (Beta) Impiantato", OS, 5000, "Lussuoso", 14, "4d6", "Esoscheletro pesantemente rinforzato: BODY 14 (cambiano PF, soglie e Death Save), massimo 15.", { req: "BODY 8 e due Lacci Osseo-Muscolari", fx: [{ t: "setBody", v: 14, max: 15 }] }),
    C("framesigma", "borg", "Telaio Lineare σ (Sigma) Impiantato", OS, 1000, "Molto Oneroso", 14, "4d6", "Esoscheletro rinforzato: BODY 12 (cambiano PF, soglie e Death Save), massimo 13.", { req: "BODY 6 e un Laccio Osseo-Muscolare", fx: [{ t: "setBody", v: 12, max: 13 }] }),
  ];
  const groupOf = id => GROUPS.find(g => g.id === id) || GROUPS[0];

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
  function effects(items, baseBody) {
    const inst = (items || []).filter(it => it.installed !== false).map(it => ({ it, c: byId(it.ref) || byName(it.name) })).filter(x => x.c);
    const have = id => inst.filter(x => x.c.id === id).length;
    const out = { skill: {}, mods: [], body: null, pain: false, armor: [], weapons: [], cond: [] };
    const seen = new Set();
    let body = +baseBody || 0, bodyCap = null;
    for (const { it, c } of inst) for (const f of c.fx || []) {
      if (f.cond) out.cond.push({ c, f, on: !!it.on, it });
      if (f.cond && !it.on) continue;
      if (f.needs && !have(f.needs)) continue;
      if (f.min && have(c.id) < f.min) continue;
      if (f.key) { if (seen.has(f.key)) continue; seen.add(f.key); }
      if (f.t === "skill") for (const s of f.skills) (out.skill[s] = out.skill[s] || []).push({ l: c.name, v: f.v });
      if (f.t === "chip" && it.param) (out.skill[it.param] = out.skill[it.param] || []).push({ l: c.name, chip: 3 });
      if (f.t === "mod") out.mods.push({ name: c.name, target: f.target, value: f.v });
      if (f.t === "body") body = Math.min(f.max || 99, body + f.v);
      if (f.t === "setBody") { body = Math.max(body, f.v); bodyCap = f.max; }
      if (f.t === "pain") out.pain = true;
      if (f.t === "armor") out.armor.push({ name: c.name, sp: f.sp, type: f.type });
      if (f.t === "weapon") out.weapons.push({ ...f, src: c.name });
    }
    if (bodyCap) body = Math.min(body, bodyCap);
    out.body = body;
    return out;
  }
  // bonus di un'abilità al suo livello: i Chip Abilità portano il livello a 3 se è più basso
  function skillBonus(fx, skillId, lvl) {
    return ((fx && fx.skill[skillId]) || []).map(b => b.chip ? { l: b.l + " (livello 3)", v: Math.max(0, 3 - (+lvl || 0)) } : { l: b.l, v: b.v }).filter(b => b.v);
  }

  return { GROUPS, groupOf, BASE, all, byId, byName, setHomebrew, rollPu, effects, skillBonus };
})();
