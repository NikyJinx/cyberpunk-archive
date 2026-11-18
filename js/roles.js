// ============================================================
//  CYBERPUNK RED — RUOLI E CAPACITÀ DI RUOLO
//  Dati dei 10 Ruoli per le schede dei personaggi: tabelle per
//  grado, VD e opzioni (effetti riassunti dal manuale base).
// ============================================================
window.RL = (() => {
  // band(rank) → la riga della tabella per quel grado
  const band = (list, rank) => list.find(b => rank >= b.min && rank <= b.max) || null;

  const ROLES = [
    { id: "rocker", name: "Rockerboy", it: "Rocker", ability: "Charismatic Impact", abilityIt: "Impatto Carismatico", alias: ["rockerboy", "rocker", "rockergirl"] },
    { id: "solo", name: "Solo", it: "Solitario", ability: "Combat Awareness", abilityIt: "Sensi da Combattimento", alias: ["solo", "solitario"] },
    { id: "netrunner", name: "Netrunner", it: "Netrunner", ability: "Interface", abilityIt: "Interfaccia", alias: ["netrunner"] },
    { id: "tech", name: "Tech", it: "Tecnico", ability: "Maker", abilityIt: "Creatore", alias: ["tech", "tecnico"] },
    { id: "medtech", name: "Medtech", it: "Meditech", ability: "Medicine", abilityIt: "Medicina", alias: ["medtech", "meditech", "medtechie"] },
    { id: "media", name: "Media", it: "Media", ability: "Credibility", abilityIt: "Credibilità", alias: ["media"] },
    { id: "exec", name: "Exec", it: "Corporativo", ability: "Teamwork", abilityIt: "Gioco di Squadra", alias: ["exec", "corporativo", "corpo"] },
    { id: "lawman", name: "Lawman", it: "Tutore dell'Ordine", ability: "Backup", abilityIt: "Rinforzi", alias: ["lawman", "tutore dell'ordine", "tutore"] },
    { id: "fixer", name: "Fixer", it: "Fixer", ability: "Operator", abilityIt: "Operatore", alias: ["fixer"] },
    { id: "nomad", name: "Nomad", it: "Nomade", ability: "Moto", abilityIt: "Garage", alias: ["nomad", "nomade"] },
  ];
  const roleById = id => ROLES.find(r => r.id === id) || null;
  const guessRole = name => { const n = String(name || "").trim().toLowerCase(); return (ROLES.find(r => r.alias.includes(n) || r.name.toLowerCase() === n || r.it.toLowerCase() === n) || {}).id || ""; };

  // ---------- Rocker: Impatto Carismatico ----------
  const FAN_DV = [{ id: "single", label: "Singolo", dv: 8 }, { id: "small", label: "Piccolo Gruppo (max 6)", dv: 10 }, { id: "large", label: "Grande Gruppo", dv: 12 }];
  const ROCKER = [
    { min: 1, max: 2, venue: "Locali piccoli", single: "Piccolo favore (pasto, bevuta, passaggio).", small: "Chiedono autografi e ricordi, ti fermano per strada.", large: "Nessun effetto: troppo pochi fan." },
    { min: 3, max: 4, venue: "Club famosi", single: "Grosso favore (andare a letto insieme, mettere una buona parola).", small: "Escono regolarmente con te e ti procurano alcol e droga.", large: "Grosso seguito locale: comprano dischi e merchandise." },
    { min: 5, max: 6, venue: "Grandi e importanti club", single: "Commette un crimine minore (taccheggio, aiuto in uno scontro).", small: "Fanno da «posse» privata: ti seguono e provvedono a te.", large: "Fan in tutta la città e dintorni, leali, fanno grossi favori per attenzione." },
    { min: 7, max: 8, venue: "Piccole sale concerti, TV locali", single: "Rischia la vita senza fare domande.", small: "Fino a 6 fan commettono un crimine minore.", large: "Ferocemente devoti: lottano contro fan rivali, creano reti d'informazione." },
    { min: 9, max: 9, venue: "Grandi sale concerti, TV nazionale", single: "Commette un crimine grave (furto di valore, assalto).", small: "Fino a 6 fan commettono un crimine grave.", large: "Quasi un culto: pronti a rivolte, distruzione e omicidio." },
    { min: 10, max: 10, venue: "Enormi stadi, TV internazionale", single: "Si sacrifica senza ripensamenti.", small: "Fino a 6 fan rischiano la vita o ti fanno da scorta.", large: "Culto mondiale: un esercito privato devoto a tutto." },
  ];

  // ---------- Tecnico: Creatore ----------
  const TECH_SPECS = [
    { id: "field", label: "Esperienza sul Campo", eff: "Si somma a tutte le prove di Cybertech, Electronics/Security, Air/Sea/Land Vehicle Tech, Basic Tech e Weaponstech (non a Upgrade, Fabbricare, Inventare). Riparazione Temporanea: 1 Azione, stessa VD della riparazione completa, l'oggetto torna a posto per 10 minuti per grado." },
    { id: "upgrade", label: "Upgrade", eff: "TECH + abilità di riparazione + grado + 1d10. Materiali pari alla Categoria di Prezzo dell'oggetto (i veicoli contano sempre Molto Onerosi). Un solo upgrade per oggetto: −1d6 Perdita d'Umanità di un cyberware, +1 slot, riparazioni in metà tempo, arma a 1 mano occultabile, qualità Standard → Alta, munizioni non base per un'Arma Insolita, +1 PS, un upgrade da veicolo (grado Nomade 1), un'invenzione." },
    { id: "fabricate", label: "Fabbricare", eff: "Riproduce oggetti esistenti o inventati: TECH + abilità di riparazione + grado + 1d10, materiali pari alla Categoria di Prezzo (Superlussuosi: metà valore)." },
    { id: "invent", label: "Inventare", eff: "Progetta oggetti o upgrade nuovi (minimo Oneroso, approvati dal GM): TECH + abilità pertinente + grado + 1d10. Poi si costruiscono con Fabbricare o Upgrade." },
  ];
  const PRICE_DV = [
    { id: "cheap", label: "Economico / Comune (10–20 E$)", dv: 9, time: "1 ora" },
    { id: "costly", label: "Costoso (50 E$)", dv: 13, time: "6 ore" },
    { id: "premium", label: "Premium (100 E$)", dv: 17, time: "1 giorno" },
    { id: "expensive", label: "Oneroso (500 E$)", dv: 21, time: "1 settimana" },
    { id: "vexpensive", label: "Molto Oneroso (1.000 E$)", dv: 24, time: "2 settimane" },
    { id: "luxury", label: "Lussuoso (5.000 E$)", dv: 29, time: "1 mese" },
    { id: "superluxury", label: "Superlussuoso (10.000+ E$)", dv: 29, time: "1 mese ogni 10.000 E$" },
  ];
  const MAKER_SKILLS = ["basictech", "cybertech", "electronics", "airtech", "weaponstech", "seatech", "landtech"];

  // ---------- Meditech: Medicina ----------
  const MED_SPECS = [
    { id: "surgery", label: "Chirurgia", eff: "+2 livelli per punto nell'abilità Surgery (TECH, max 10): Ferite Critiche gravi, installare cyberware, espiantare organi." },
    { id: "pharma", label: "Farmaceutica", eff: "+1 livello in Medical Tech (TECH, max 10, insieme ai Criosistemi) e 1 ricetta per punto." },
    { id: "cryo", label: "Criosistemi", eff: "+1 livello in Medical Tech e le attrezzature criogeniche del grado." },
  ];
  const RECIPES = [
    { id: "antibiotic", label: "Antibiotico", eff: "+2 PF recuperati al giorno con la guarigione naturale per 1 settimana (max 1 dose attiva)." },
    { id: "rapidetox", label: "Rapidetox", eff: "Purifica subito da droghe, veleni e tossine." },
    { id: "speedheal", label: "Speedheal", eff: "Cura subito BODY + WILL PF a un paziente non Morente (max 1 al giorno)." },
    { id: "stim", label: "Stim", eff: "Ignora i malus di Seriously Wounded per 1 ora (max 1 al giorno)." },
    { id: "surge", label: "Surge", eff: "Ignora i malus da mancanza di sonno per 24 ore (max 1 a settimana)." },
  ];
  const CRYO = [
    "Grado 1: 1 Criopompa.",
    "Grado 2: Tecnico Certificato, accesso illimitato ai Criosistemi di strutture corporative e governative.",
    "Grado 3: 1 Criosistema installato in un luogo a scelta.",
    "Grado 4: +2 Criosistemi nello stesso luogo; Criopompa con 2 cariche.",
    "Grado 5: +3 Criosistemi nello stesso luogo; Criopompa con 3 cariche.",
  ];

  // ---------- Media: Credibilità ----------
  const RUMORS = [
    { id: "vague", label: "Vago", passive: 7, active: 13, eff: "Un indizio minimo per iniziare." },
    { id: "common", label: "Comune", passive: 9, active: 15, eff: "Una direzione per indagare e un'idea generale." },
    { id: "important", label: "Importante", passive: 11, active: 17, eff: "Dettagli concreti: nomi, luoghi, date." },
    { id: "detailed", label: "Dettagliato", passive: 13, active: 21, eff: "Informazioni verificabili, usabili come prove per pubblicare." },
  ];
  const MEDIA = [
    { min: 1, max: 2, sources: "Capibanda e leader di quartiere", audience: "Il quartiere", believe: 2, impact: "Piccolo: spaventa i criminali locali." },
    { min: 3, max: 4, sources: "Capi gang cittadine, politici minori, Corp locali", audience: "Firma nota su Screamsheet e Data Pool locali", believe: 3, impact: "Arresto o caduta di criminali locali." },
    { min: 5, max: 6, sources: "VIP cittadini, politici, celebrità locali", audience: "Tutta la città (Screamsheet, TV)", believe: 4, impact: "Su tutta la città: arresto di criminali di alto livello." },
    { min: 7, max: 8, sources: "Presidenti di Corp locali, sindaco, celebrità metropolitane", audience: "Tutto lo stato", believe: 5, impact: "Tocca più città, Corp medie perdono influenza, nuove leggi locali." },
    { min: 9, max: 9, sources: "Capidivisione di Corp, politici statali, celebrità famose", audience: "L'intero paese (notiziario nazionale)", believe: 6, impact: "Caduta di grosse Corp o amministrazioni, pressione per leggi nazionali." },
    { min: 10, max: 10, sources: "Leader mondiali, capi di Megacorp, celebrità globali", audience: "Il mondo", believe: 7, impact: "Rovescia Megacorp e governi, leggi internazionali." },
  ];

  // ---------- Corporativo: Gioco di Squadra ----------
  const EXEC_BENEFITS = [
    { r: 1, eff: "Completo Business in regalo (non rivendibile senza destare sospetti)." },
    { r: 2, eff: "Conapt corporativo gratuito (escluso lo Stile di Vita)." },
    { r: 3, eff: "1° Membro della Squadra." },
    { r: 5, eff: "2° Membro della Squadra." },
    { r: 6, eff: "Copertura Trauma Team Argento pagata dall'azienda." },
    { r: 7, eff: "Casa stile Beaverville nella Zona Dirigenziale." },
    { r: 8, eff: "Copertura Trauma Team Executive." },
    { r: 9, eff: "3° Membro della Squadra (massimo 3)." },
    { r: 10, eff: "McMansion a Beaverville o attico di lusso nella Zona Corporativa." },
  ];
  const teamSize = rank => (rank >= 9 ? 3 : rank >= 5 ? 2 : rank >= 3 ? 1 : 0);
  const EXEC_JOBS = ["Guardia del Corpo", "Agente Segreto", "Autista", "Netrunner", "Tecnico"];
  const LOYALTY_MODS = [
    [1, "complimento (1 a settimana)"], [4, "bonus di 200 E$ o supporto contro i dirigenti"], [6, "il 20% del guadagno o ferie pagate (1 sessione)"], [8, "rischiare la vita per lui"],
    [-1, "nessun guadagno nella sessione"], [-2, "rimprovero"], [-4, "ignorare il suo contributo o il compleanno"], [-6, "bonus mancato o scaricarlo alla dirigenza"], [-8, "abbandonarlo in una sparatoria"],
  ];

  // ---------- Tutore dell'Ordine: Rinforzi ----------
  const BACKUP = [
    { min: 1, max: 2, name: "Sicurezza Corporativa", who: "4 guardie a piedi", combat: 8, sp: "7 (Kevlar)", hp: 20, move: 4, weapons: "Pistole Pesanti" },
    { min: 3, max: 4, name: "Agenti di Pattuglia", who: "4 poliziotti su 2 Utilitarie", combat: 10, sp: "7 (Kevlar)", hp: 25, move: 5, weapons: "Pistole Pesanti" },
    { min: 5, max: 7, name: "Ufficio dello Sceriffo", who: "2 Vicesceriffi su Auto Sportiva", combat: 14, sp: "13 (Corazza Pesante)", hp: 35, move: 4, weapons: "Fucili d'Assalto" },
    { min: 8, max: 8, name: "Sceriffo della Zona di Recupero", who: "1 Sceriffo su Supermoto", combat: 16, sp: "15 (Corazza Antischegge)", hp: 50, move: 6, weapons: "Pistola Molto Pesante, Fucile d'Assalto, Lanciagranate" },
    { min: 9, max: 9, name: "C-SWAT / Psicosquadra", who: "2 agenti su AV-4", combat: 15, sp: "18 (Metalgear)", hp: 35, move: 4, weapons: "Fucili d'Assalto, Lanciarazzi" },
    { min: 10, max: 10, name: "Sicurezza Nazionale / FBI / Interpol / Netwatch", who: "2 agenti su AV-4", combat: 14, sp: "11 (Giacca Corazzata Leggera)", hp: 35, move: 6, weapons: "Pistole Molto Pesanti, Fucili d'Assalto", extra: "Restano dopo lo scontro per indagare (base 14 nelle abilità investigative, sociali e furtive)." },
  ];

  // ---------- Fixer: Operatore ----------
  const FIXER = [
    { min: 1, max: 2, contacts: "Capibanda locali, capi gang, leader di quartiere", reach: "Trova sempre merci Economiche e Comuni.", haggle: "±10% sul prezzo in acquisto e vendita.", grease: "Conosce usi e gang del proprio quartiere." },
    { min: 3, max: 4, contacts: "Capi gang cittadine, politici minori, Corporativi, gente in vista", reach: "Trova sempre merci fino a Onerose (500 E$).", haggle: "Comprando almeno 5 copie dello stesso oggetto, 1 è gratis.", grease: "+1 cultura locale, con la lingua a livello 4." },
    { min: 5, max: 6, contacts: "VIP cittadini, politici, celebrità locali", reach: "Una volta al mese organizza un Mercato Notturno con altri Fixer (fino a Superlusso).", haggle: "±20% sulla paga individuale di un Lavoro.", grease: "Altre 2 culture (3 in tutto), con le lingue a livello 4." },
    { min: 7, max: 8, contacts: "Presidenti di Corp locali, sindaco, celebrità metropolitane", reach: "Trova sempre merci fino a Molto Onerose (1.000 E$).", haggle: "Lussuosi e Superlussuosi: metà subito, metà dopo un mese (se non salda perde ogni contatto).", grease: "Altre 3 culture (6 in tutto), con le lingue a livello 4." },
    { min: 9, max: 9, contacts: "Capidivisione di Corp, politici statali, celebrità famose", reach: "Trova sempre merci fino a Lussuose (5.000 E$).", haggle: "±20% sul prezzo in acquisto e vendita.", grease: "Si mescola con agenzie corporative e governative." },
    { min: 10, max: 10, contacts: "Leader mondiali, capi di Megacorp, celebrità globali", reach: "Trova sempre merci Superlussuose (10.000+ E$).", haggle: "Paga doppia per i Lavori Pericolosi.", grease: "Si mescola con qualsiasi gruppo (società segrete, culti, club esclusivi)." },
  ];

  // ---------- Nomade: Garage ----------
  const GARAGE_SKILLS = ["drive", "pilotair", "pilotsea", "airtech", "seatech", "landtech"];
  const VEHICLES = [
    { min: 1, list: ["Utilitaria", "Girocottero", "Moto d'Acqua", "Motocicletta"] },
    { min: 5, list: ["Elicottero", "Auto Sportiva", "Motoscafo"] },
    { min: 7, list: ["AV-4", "Cabinato", "Supermoto"] },
    { min: 9, list: ["Aerozep", "AV-9", "Superauto", "Yacht"] },
  ];
  const vehiclesFor = rank => VEHICLES.filter(v => v.min <= Math.max(1, rank)).flatMap(v => v.list);
  const U = (id, g, name, on, eff, multi = false) => ({ id, g, name, on, eff, multi });
  const ALL = "Tutti i veicoli", NOSMALL = "Tranne moto, moto d'acqua e girocotteri";
  const NOMAD_UPGRADES = [
    U("comms", 1, "Centro Comunicazioni", ALL, "Console con 1 Agent, 6 Comunicatori Radio, 6 Codificatori, Radio/Lettore Musicale, Localizzatore con 6 tracciatori, Registratore Audio."),
    U("flamer", 1, "Lanciafiamme", ALL, "Montato fuori, davanti o dietro; il pilota lo usa come Azione. Non ricaricabile in movimento.", true),
    U("mg", 1, "Mitragliatrice", ALL, "Fucile d'Assalto da 30 colpi (solo Fuoco Automatico) montato davanti; il pilota lo usa come Azione.", true),
    U("nos", 1, "NOS", ALL, "Un'Azione diventa Movimento extra mentre guidi. Ogni tanica 1 volta al giorno.", true),
    U("seats", 1, "Sedili Migliorati", NOSMALL, "+2 sedili (o un sidecar protetto), con espulsori e paracadute se vuoi.", true),
    U("smuggler", 1, "Upgrade da Contrabbandiere", NOSMALL, "Vano nascosto e 2 Fondine Nascoste: si trovano con Conceal/Reveal Object VD 17.", true),
    U("glass", 1, "Vetri Antiproiettile", ALL, "Vetri Antiproiettile Sottili (15 PF); la seconda volta Spessi (30 PF).", true),
    U("security", 5, "Sicurezza Migliorata", ALL, "Serrature biometriche (Electronics/Security VD 17, chi sbaglia prende uno Storditore entro 2 m) e mimetizzazione da fermo (Perception VD 17)."),
    U("armor", 5, "Telaio Corazzato", ALL, "SP del veicolo 13 (non i vetri)."),
    U("heavy", 1, "Telaio Pesante", NOSMALL, "+20 PS, traina fino a 10 t, verricello. Serve per le modifiche pesanti."),
    U("rockets", 5, "Lanciarazzi", NOSMALL + " · serve il Telaio Pesante", "Montato davanti con 3 colpi; il pilota lo usa come Azione.", true),
    U("hwmount", 5, "Supporto per Arma Pesante", NOSMALL + " · serve il Telaio Pesante", "Torretta per un'arma a distanza a due mani, usata da un passeggero. La prima arma la regala la Famiglia (Helix, Railgun EMG-86 o Lanciagranate «Cowboy» U-56)."),
    U("melee", 1, "Arma da Mischia", "Veicoli terrestri e marittimi", "Arma da Mischia Molto Pesante montata fuori; il pilota la usa come Azione.", true),
    U("hover", 5, "Hovercraft", "Veicoli terrestri", "Viaggia sull'acqua alla velocità di un Cabinato."),
    U("av4", 7, "Motore AV-4", "Veicoli terrestri", "Vola come un AV-4 (si usa Pilot Air Vehicle)."),
    U("ram", 1, "Rostro", "Terrestri e marittimi, tranne moto, moto d'acqua e girocotteri", "Niente danni al veicolo né Colpo di Frusta speronando; con il NOS +2d6 al danno."),
    U("bikeiface", 5, "Interfaccia per Connettori Migliorata", "Moto", "Con REF 8+ e Connettore d'Interfaccia schivi con Evasion gli attacchi a te, alla moto o al passeggero."),
    U("spikes", 1, "Banda Chiodata", "Automobili", "Chi ti insegue da vicino tira Drive VD 17 o subisce 4d6 a un punto debole (oltre la SP raddoppiano).", true),
    U("quarters", 1, "Alloggio", "Aerozep, AV-4, Cabinati, Auto (con Telaio Pesante), Yacht", "Letto, bagno, doccia e cucinino; su Cabinati, Yacht e Aerozep una stanza in più."),
  ];
  const upgradeById = id => NOMAD_UPGRADES.find(u => u.id === id);

  // ---------- Solo: Sensi da Combattimento (costi in CPR.CA_USES) ----------
  // multiclasse: il ruolo nuovo si prende a grado 1 solo se il precedente è almeno a 4
  const canAddRole = roles => !roles.length || (+roles[roles.length - 1].rank || 0) >= 4;

  return { ROLES, roleById, guessRole, band, FAN_DV, ROCKER, TECH_SPECS, PRICE_DV, MAKER_SKILLS, MED_SPECS, RECIPES, CRYO, RUMORS, MEDIA,
    EXEC_BENEFITS, teamSize, EXEC_JOBS, LOYALTY_MODS, BACKUP, FIXER, GARAGE_SKILLS, VEHICLES, vehiclesFor, NOMAD_UPGRADES, upgradeById, canAddRole };
})();
