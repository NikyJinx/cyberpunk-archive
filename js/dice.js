// ============================================================
//  CYBERPUNK RED — dati della scheda e motore dei dadi
//  Contiene solo i NOMI di STAT, abilità e Role Ability
//  (in inglese, come sul manuale): nessun testo delle regole.
// ============================================================
window.CPR = (() => {
  const STATS = [
    { id: "INT",  label: "Intelligence" },
    { id: "REF",  label: "Reflexes" },
    { id: "DEX",  label: "Dexterity" },
    { id: "TECH", label: "Technique" },
    { id: "COOL", label: "Cool" },
    { id: "WILL", label: "Willpower" },
    { id: "LUCK", label: "Luck" },
    { id: "MOVE", label: "Movement" },
    { id: "BODY", label: "Body" },
    { id: "EMP",  label: "Empathy" },
  ];

  // [id, nome, STAT, flag]  ·  b = abilità base (parte da 2)  ·  x2 = costo doppio
  const GROUPS = [
    ["Awareness", [
      ["concentration", "Concentration", "WILL", "b"], ["conceal", "Conceal/Reveal Object", "INT"],
      ["lipreading", "Lip Reading", "INT"], ["perception", "Perception", "INT", "b"], ["tracking", "Tracking", "INT"]]],
    ["Body", [
      ["athletics", "Athletics", "DEX", "b"], ["contortionist", "Contortionist", "DEX"], ["dance", "Dance", "DEX"],
      ["endurance", "Endurance", "WILL"], ["resist", "Resist Torture/Drugs", "WILL"], ["stealth", "Stealth", "DEX", "b"]]],
    ["Control", [
      ["drive", "Drive Land Vehicle", "REF"], ["pilotair", "Pilot Air Vehicle", "REF", "x2"],
      ["pilotsea", "Pilot Sea Vehicle", "REF"], ["riding", "Riding", "REF"]]],
    ["Education", [
      ["accounting", "Accounting", "INT"], ["animal", "Animal Handling", "INT"], ["bureaucracy", "Bureaucracy", "INT"],
      ["business", "Business", "INT"], ["composition", "Composition", "INT"], ["criminology", "Criminology", "INT"],
      ["cryptography", "Cryptography", "INT"], ["deduction", "Deduction", "INT"], ["education", "Education", "INT", "b"],
      ["gamble", "Gamble", "INT"], ["streetslang", "Language (Streetslang)", "INT", "b"], ["language", "Language", "INT"],
      ["library", "Library Search", "INT"], ["localhome", "Local Expert (Your Home)", "INT", "b"], ["localexpert", "Local Expert", "INT"],
      ["science", "Science", "INT"], ["tactics", "Tactics", "INT"], ["wilderness", "Wilderness Survival", "INT"]]],
    ["Fighting", [
      ["brawling", "Brawling", "DEX", "b"], ["evasion", "Evasion", "DEX", "b"],
      ["martialarts", "Martial Arts", "DEX", "x2"], ["melee", "Melee Weapon", "DEX"]]],
    ["Performance", [
      ["acting", "Acting", "COOL"], ["instrument", "Play Instrument", "TECH"]]],
    ["Ranged Weapon", [
      ["archery", "Archery", "REF"], ["autofire", "Autofire", "REF", "x2"], ["handgun", "Handgun", "REF"],
      ["heavyweapons", "Heavy Weapons", "REF", "x2"], ["shoulderarms", "Shoulder Arms", "REF"]]],
    ["Social", [
      ["bribery", "Bribery", "COOL"], ["conversation", "Conversation", "EMP", "b"], ["humanperception", "Human Perception", "EMP", "b"],
      ["interrogation", "Interrogation", "COOL"], ["persuasion", "Persuasion", "COOL", "b"], ["grooming", "Personal Grooming", "COOL"],
      ["streetwise", "Streetwise", "COOL"], ["trading", "Trading", "COOL"], ["wardrobe", "Wardrobe & Style", "COOL"]]],
    ["Technique", [
      ["airtech", "Air Vehicle Tech", "TECH"], ["basictech", "Basic Tech", "TECH"], ["cybertech", "Cybertech", "TECH"],
      ["demolitions", "Demolitions", "TECH", "x2"], ["electronics", "Electronics/Security Tech", "TECH", "x2"],
      ["firstaid", "First Aid", "TECH", "b"], ["forgery", "Forgery", "TECH"], ["landtech", "Land Vehicle Tech", "TECH"],
      ["paint", "Paint/Draw/Sculpt", "TECH"], ["paramedic", "Paramedic", "TECH", "x2"], ["photo", "Photography/Film", "TECH"],
      ["picklock", "Pick Lock", "TECH"], ["pickpocket", "Pick Pocket", "TECH"], ["seatech", "Sea Vehicle Tech", "TECH"],
      ["weaponstech", "Weaponstech", "TECH"]]],
  ];
  const SKILL_GROUPS = GROUPS.map(([name, list]) => ({
    name, skills: list.map(([id, label, stat, f]) => ({ id, label, stat, basic: f === "b", x2: f === "x2", group: name })),
  }));
  const SKILLS = SKILL_GROUPS.flatMap(g => g.skills);
  const skill = id => SKILLS.find(s => s.id === id);

  // abilità usabili per attaccare con un'arma
  const WEAPON_SKILLS = ["handgun", "shoulderarms", "heavyweapons", "autofire", "archery", "melee", "brawling", "martialarts"];

  const ROLE_ABILITIES = {
    Rockerboy: "Charismatic Impact", Solo: "Combat Awareness", Netrunner: "Interface", Tech: "Maker",
    Medtech: "Medicine", Media: "Credibility", Exec: "Teamwork", Lawman: "Backup", Fixer: "Operator", Nomad: "Moto",
  };

  // ---------- valori derivati ----------
  const hpMax = (body, will) => 10 + 5 * Math.ceil(((+body || 0) + (+will || 0)) / 2);
  const seriousAt = max => Math.ceil(max / 2);
  // stato delle ferite e malus a tutte le azioni
  function wound(hp, max) {
    if (hp <= 0) return { id: "mortal", label: "Mortally Wounded", pen: -4 };
    if (hp < seriousAt(max)) return { id: "serious", label: "Seriously Wounded", pen: -2 };
    if (hp < max) return { id: "light", label: "Lightly Wounded", pen: 0 };
    return { id: "ok", label: "Unharmed", pen: 0 };
  }

  // ---------- dadi ----------
  function die(sides) {
    if (window.crypto && crypto.getRandomValues) {
      const a = new Uint32Array(1); crypto.getRandomValues(a);
      return 1 + (a[0] % sides);
    }
    return 1 + Math.floor(Math.random() * sides);
  }

  // Prova di Cyberpunk RED: base + 1d10.
  // 10 naturale = successo critico, tiri un altro d10 e lo aggiungi.
  // 1 naturale = fallimento critico, tiri un altro d10 e lo sottrai.
  function check(mods) {
    const first = die(10), dice = [{ v: first, s: 10 }];
    let total = first, crit = "";
    if (first === 10) { const x = die(10); dice[0].t = "crit"; dice.push({ v: x, s: 10, t: "plus" }); total += x; crit = "success"; }
    else if (first === 1) { const x = die(10); dice[0].t = "fumble"; dice.push({ v: x, s: 10, t: "minus" }); total -= x; crit = "fail"; }
    for (const m of mods) total += m.v;
    return { dice, mods, total, crit };
  }

  // Espressioni libere: "2d6+3", "d10 - 2", "3d6 + 1d10 + 4"
  const TERM = /([+-]?)\s*(?:(\d*)d(\d+)|(\d+))/gi;
  function parse(expr) {
    const src = String(expr || "").replace(/\s+/g, "");
    if (!src || !/^[+-]?(\d*d\d+|\d+)([+-](\d*d\d+|\d+))*$/i.test(src)) return null;
    const terms = [];
    for (const m of src.matchAll(TERM)) {
      const sign = m[1] === "-" ? -1 : 1;
      if (m[3]) {
        const n = m[2] === "" ? 1 : +m[2], s = +m[3];
        if (n < 1 || n > 100 || s < 2 || s > 1000) return null;
        terms.push({ sign, n, s });
      } else terms.push({ sign, k: +m[4] });
    }
    return terms.length ? terms : null;
  }
  function rollExpr(expr, { damage = false } = {}) {
    const terms = parse(expr); if (!terms) return null;
    const dice = [], mods = [];
    let total = 0;
    for (const t of terms) {
      if (t.k != null) { mods.push({ l: "", v: t.sign * t.k }); total += t.sign * t.k; continue; }
      for (let i = 0; i < t.n; i++) {
        const v = die(t.s); dice.push({ v, s: t.s, t: t.sign < 0 ? "minus" : (t.s === 6 && v === 6 && damage ? "six" : "") });
        total += t.sign * v;
      }
    }
    // danni: due o più 6 sui d6 = Critical Injury (+5 danni bonus)
    let crit = "";
    if (damage && dice.filter(d => d.s === 6 && d.v === 6 && d.t !== "minus").length >= 2) {
      crit = "injury"; mods.push({ l: "Critical Injury", v: 5 }); total += 5;
    }
    return { dice, mods, total, crit, expr: String(expr).replace(/\s+/g, "") };
  }

  // ---------- armi e armature per categoria (dati di gioco del manuale base) ----------
  // dmg "BODY" = danno a mani nude / arti marziali, dipende dal BODY
  const WEAPON_TYPES = [
    { id: "mpistol",  label: "Medium Pistol",     skill: "handgun",      dmg: "2d6", rof: 2, mag: 12, ammo: "Pistola Media" },
    { id: "hpistol",  label: "Heavy Pistol",      skill: "handgun",      dmg: "3d6", rof: 2, mag: 8,  ammo: "Pistola Pesante" },
    { id: "vhpistol", label: "Very Heavy Pistol", skill: "handgun",      dmg: "4d6", rof: 1, mag: 8,  ammo: "Pistola Molto Pesante" },
    { id: "smg",      label: "SMG",               skill: "handgun",      dmg: "2d6", rof: 1, mag: 30, auto: 3, ammo: "Pistola Media" },
    { id: "hsmg",     label: "Heavy SMG",         skill: "handgun",      dmg: "3d6", rof: 1, mag: 40, auto: 3, ammo: "Pistola Pesante" },
    { id: "shotgun",  label: "Shotgun",           skill: "shoulderarms", dmg: "5d6", rof: 1, mag: 4,  ammo: "Slug" },
    { id: "ar",       label: "Assault Rifle",     skill: "shoulderarms", dmg: "5d6", rof: 1, mag: 25, auto: 4, ammo: "Fucile" },
    { id: "sniper",   label: "Sniper Rifle",      skill: "shoulderarms", dmg: "5d6", rof: 1, mag: 4,  ammo: "Fucile" },
    { id: "bow",      label: "Bow / Crossbow",    skill: "archery",      dmg: "4d6", rof: 1, ammo: "Frecce" },
    { id: "gl",       label: "Grenade Launcher",  skill: "heavyweapons", dmg: "6d6", rof: 1, mag: 2,  ammo: "Granate" },
    { id: "rl",       label: "Rocket Launcher",   skill: "heavyweapons", dmg: "8d6", rof: 1, mag: 1,  ammo: "Razzi" },
    { id: "flamer",   label: "Flamethrower",      skill: "heavyweapons", dmg: "3d6", rof: 1, mag: 4,  ammo: "Lanciafiamme" },
    { id: "lmelee",   label: "Light Melee Weapon",      skill: "melee", dmg: "1d6", rof: 2 },
    { id: "mmelee",   label: "Medium Melee Weapon",     skill: "melee", dmg: "2d6", rof: 2 },
    { id: "hmelee",   label: "Heavy Melee Weapon",      skill: "melee", dmg: "3d6", rof: 2 },
    { id: "vhmelee",  label: "Very Heavy Melee Weapon", skill: "melee", dmg: "4d6", rof: 1 },
    { id: "brawl",    label: "Brawling",          skill: "brawling",     dmg: "BODY", rof: 2 },
    { id: "martial",  label: "Martial Arts Strike", skill: "martialarts", dmg: "BODY", rof: 2 },
  ];
  const weaponType = id => WEAPON_TYPES.find(w => w.id === id);
  // pugni e arti marziali: il danno dipende dal BODY
  const brawlDmg = body => body <= 4 ? "1d6" : body <= 6 ? "2d6" : body <= 10 ? "3d6" : "4d6";
  // pen = malus a REF, DEX e MOVE (Medium/Heavy Armorjack −2, Flak/Metalgear −4)
  const ARMOR_TYPES = [
    { id: "none",       label: "Nessuna",          sp: 0,  pen: 0 },
    { id: "leathers",   label: "Leathers",         sp: 4,  pen: 0 },
    { id: "kevlar",     label: "Kevlar",           sp: 7,  pen: 0 },
    { id: "lightjack",  label: "Light Armorjack",  sp: 11, pen: 0 },
    { id: "bodyweight", label: "Bodyweight Suit",  sp: 11, pen: 0 },
    { id: "subdermal",  label: "Subdermal Armor",  sp: 11, pen: 0 },
    { id: "mediumjack", label: "Medium Armorjack", sp: 12, pen: -2 },
    { id: "heavyjack",  label: "Heavy Armorjack",  sp: 13, pen: -2 },
    { id: "flak",       label: "Flak",             sp: 15, pen: -4 },
    { id: "metalgear",  label: "Metalgear",        sp: 18, pen: -4 },
  ];
  const armorType = id => ARMOR_TYPES.find(a => a.id === id);
  const PEN_STATS = ["REF", "DEX", "MOVE"];
  // malus dell'armatura: vale il peggiore tra testa e corpo, salvo armatura migliorata (noPen)
  const armorPen = (armor, noPen) => noPen ? 0 : Math.min(0, ...["head", "body"].map(l => ((armorType(((armor || {})[l] || {}).type) || {}).pen) || 0));

  // ---------- generatore di nemici ----------
  // Tarato sui PNG del manuale base (pag. 412–416) e sui PDF gratuiti Hardened di R. Talsorian:
  //  1 = Scagnozzi del manuale · 2 = Luogotenenti · 3 = Hardened · 4 = Mini-Boss / Hardened Lieutenant
  //  5 = Hardened Mini-Boss con potenziamenti in più.
  // Le fasce sono le BASI (STAT + abilità) che si vedono nei blocchi del manuale.
  const LEVELS = [
    { n: 1, label: "Scagnozzo",    hint: "come i PNG base del manuale",
      stat: [2, 4], key: [5, 7], ref: [6, 7], body: [2, 6], will: [2, 4], move: [3, 4], emp: [3, 4],
      prim: [10, 12], sec: [7, 10], basic: [4, 8], eva: [6, 7],
      armor: ["leathers", "kevlar", "kevlar"], poor: 0.6, exc: 0, weapons: 2, cyber: 0 },
    { n: 2, label: "Luogotenente", hint: "come i Luogotenenti del manuale",
      stat: [3, 5], key: [5, 7], ref: [6, 8], body: [3, 7], will: [4, 5], move: [4, 5], emp: [3, 4],
      prim: [10, 12], sec: [8, 11], basic: [5, 9], eva: [6, 9],
      armor: ["kevlar", "lightjack", "lightjack", "bodyweight", "mediumjack"], poor: 0.25, exc: 0, weapons: 2, cyber: 1 },
    { n: 3, label: "Hardened",     hint: "come gli Hardened Mooks / Lieutenants",
      stat: [3, 6], key: [6, 8], ref: [6, 8], body: [4, 7], will: [5, 6], move: [4, 6], emp: [3, 4],
      prim: [12, 14], sec: [9, 12], basic: [5, 10], eva: [7, 11],
      armor: ["kevlar", "lightjack", "lightjack", "lightjack", "heavyjack"], poor: 0.2, exc: 0, weapons: 2, cyber: 2 },
    { n: 4, label: "Mini-Boss",    hint: "come i Mini-Boss del manuale e gli Hardened Lieutenants migliori",
      stat: [4, 7], key: [7, 8], ref: [7, 8], body: [5, 8], will: [6, 7], move: [6, 7], emp: [3, 6],
      prim: [14, 15], sec: [11, 14], basic: [6, 11], eva: [10, 14],
      armor: ["lightjack", "lightjack", "mediumjack", "heavyjack"], poor: 0, exc: 0.25, weapons: 2, cyber: 3 },
    { n: 5, label: "Élite",        hint: "Hardened Mini-Boss con un potenziamento in più",
      stat: [5, 8], key: [8, 8], ref: [8, 8], body: [6, 10], will: [8, 8], move: [7, 8], emp: [2, 6],
      prim: [16, 17], sec: [13, 16], basic: [7, 12], eva: [14, 16],
      armor: ["lightjack", "lightjack", "heavyjack", "flak"], poor: 0, exc: 0.6, weapons: 2, cyber: 4 },
  ];
  // Abilità che tutti i PNG del manuale hanno (le "base")
  const BASIC = ["athletics", "brawling", "concentration", "conversation", "education", "evasion", "firstaid",
    "humanperception", "streetslang", "localhome", "perception", "persuasion", "stealth"];
  // Archetipi presi dai ruoli dei PNG del manuale e dei PDF Hardened.
  // keys = STAT alte · prim/sec = abilità principali/secondarie · weapons = categorie per livello 1..5
  // armor = spostamento verso armature più leggere (−) o più pesanti (+) · ability = Capacità di Ruolo dal livello indicato
  const ENEMY_TYPES = [
    { id: "bodyguard", label: "Guardia del corpo", keys: ["REF", "BODY"], armor: 0,
      prim: ["shoulderarms", "handgun", "brawling"], sec: ["drive", "endurance", "resist", "interrogation"],
      weapons: [["shotgun", "vhpistol"], ["shotgun", "vhpistol"], ["shotgun", "brawl"], ["ar", "vhpistol"], ["shotgun", "vhpistol"]],
      cyber: ["Comunicatore Radio", "Collegamento Neurale", "Cyberocchio (Low Light/IR/UV)", "Kerenzikov", "Laccio Osseo-Muscolare"],
      gear: ["Comunicatore Radio", "Agent"] },
    { id: "booster", label: "Booster (boostergang)", keys: ["REF", "DEX"], armor: -1,
      prim: ["handgun", "melee", "brawling"], sec: ["drive", "interrogation", "resist"],
      weapons: [["vhpistol", "mmelee"], ["vhpistol", "mmelee"], ["vhpistol", "hmelee"], ["hsmg", "hmelee"], ["hsmg", "vhmelee"]],
      cyber: ["Tecnocapelli", "Wolvers", "Digitolame", "Collegamento Neurale", "Sandevistan", "Laccio Osseo-Muscolare"],
      gear: ["Cellulare usa-e-getta", "Black Lace ×1"] },
    { id: "roadganger", label: "Ganger di strada (nomade)", keys: ["REF", "TECH"], armor: -1,
      prim: ["handgun", "archery", "drive", "melee"], sec: ["landtech", "tracking", "wilderness"],
      weapons: [["vhpistol", "bow", "lmelee"], ["vhpistol", "bow"], ["vhpistol", "vhmelee"], ["shotgun", "vhpistol"], ["ar", "vhmelee"]],
      cyber: ["Collegamento Neurale (Connettori d'Interfaccia)", "Cyberocchio (TeleOttica)", "Cybergamba (Jump Booster)"],
      gear: ["Corda", "Torcia elettrica"] },
    { id: "secop", label: "Guardia giurata", keys: ["REF", "BODY"], armor: 0,
      prim: ["shoulderarms", "autofire", "handgun"], sec: ["melee", "interrogation", "resist"],
      weapons: [["ar", "vhpistol", "mmelee"], ["ar", "vhpistol"], ["ar", "vhpistol"], ["ar", "hsmg"], ["ar", "gl"]],
      cyber: ["Comunicatore Radio", "Collegamento Neurale", "Cyberocchio (Mirino)", "Kerenzikov"],
      gear: ["Comunicatore Radio"] },
    { id: "netrunner", label: "Netrunner", keys: ["INT", "TECH"], armor: -1, ability: ["Interface", 1, [2, 4, 4, 6, 7]],
      prim: ["electronics", "basictech", "handgun"], sec: ["cryptography", "deduction", "library", "forgery", "conceal", "picklock", "tactics"],
      weapons: [["vhpistol"], ["vhpistol"], ["vhpistol"], ["vhpistol", "smg"], ["vhpistol", "hsmg"]],
      cyber: ["Collegamento Neurale (Connettori d'Interfaccia)", "Visore Virtuality", "Cyberdeck", "Chipware"],
      gear: ["Cyberdeck con programmi (Sword, Armor, Hellbolt, Eraser)", "Torcia elettrica"], prefArmor: "bodyweight" },
    { id: "reclaimer", label: "Capo reclamatore", keys: ["REF", "DEX", "BODY"], armor: 0,
      prim: ["shoulderarms", "melee", "athletics"], sec: ["endurance", "resist", "drive", "electronics", "weaponstech", "basictech", "tactics"],
      weapons: [["shotgun", "hpistol", "lmelee"], ["shotgun", "hpistol", "hmelee"], ["shotgun", "hmelee"], ["shotgun", "vhpistol", "hmelee"], ["shotgun", "gl", "hmelee"]],
      cyber: ["Collegamento Neurale", "Filtri Nasali", "Kerenzikov", "Cyberbraccio (Lanciagranate Popup)"],
      gear: ["Agent", "Comunicatore Radio", "Pistola con rampino", "Tenda ed equipaggiamento da campeggio"] },
    { id: "secagent", label: "Agente di sicurezza", keys: ["REF", "BODY", "MOVE"], armor: 1,
      prim: ["autofire", "shoulderarms", "handgun", "melee", "brawling"], sec: ["drive", "interrogation", "resist", "tactics"],
      weapons: [["ar", "vhpistol", "mmelee"], ["ar", "vhpistol", "mmelee"], ["ar", "hsmg"], ["ar", "vhpistol"], ["hsmg", "ar"]],
      cyber: ["Collegamento Neurale (Kerenzikov)", "Comunicatore Radio", "Cyberocchi", "Cybergambe"],
      gear: ["Scudo balistico (10 PF)", "Manette ×2", "Comunicatore Radio", "Granata lacrimogena"] },
    { id: "tracker", label: "Battipista", keys: ["REF", "DEX", "INT", "WILL"], armor: 0,
      prim: ["shoulderarms", "handgun", "melee", "brawling", "perception", "stealth"], sec: ["tracking", "criminology", "resist", "endurance", "drive", "streetwise"],
      weapons: [["hpistol", "lmelee"], ["ar", "vhpistol"], ["ar", "vhpistol", "lmelee"], ["ar", "vhpistol", "lmelee"], ["ar", "sniper", "lmelee"]],
      cyber: ["Collegamento Neurale (Connettori d'Interfaccia)", "Cyberocchio (Mirino, TeleOttica)", "Sistema Cyberudito (Udito Amplificato)", "Geolocalizzatore"],
      gear: ["Manette ×2", "Comunicatore Radio"] },
    { id: "pyro", label: "Piromane", keys: ["REF", "TECH"], armor: 0, ability: ["Combat Awareness", 4, [0, 0, 2, 4, 4]],
      prim: ["heavyweapons", "handgun", "melee", "demolitions", "evasion"], sec: ["basictech", "resist", "tactics", "weaponstech", "interrogation"],
      weapons: [["flamer", "hpistol"], ["flamer", "hpistol", "hmelee"], ["flamer", "hmelee"], ["flamer", "rl"], ["flamer", "rl"]],
      cyber: ["Cyberocchi (Antiriflesso)", "Sistema Cyberudito (Antiassordante)", "Cyberbraccio", "Supporto da spalla"],
      gear: ["Granata Flashbang", "Granata Incendiaria"] },
    { id: "cyberpsycho", label: "Cyberpsicotico", keys: ["BODY", "REF", "DEX", "MOVE", "WILL"], armor: 0, lowEmp: true, prefArmor: "subdermal",
      prim: ["melee", "brawling", "autofire", "heavyweapons", "athletics"], sec: ["handgun", "resist", "interrogation", "endurance", "tracking"],
      weapons: [["mmelee", "hsmg"], ["hmelee", "hsmg"], ["vhmelee", "hsmg", "gl"], ["vhmelee", "hsmg", "gl"], ["vhmelee", "hsmg", "gl"]],
      cyber: ["Corazza Sottocutanea", "Cyberbraccio (Mitra Pesante Popup)", "Cyberbraccio (Lanciagranate Popup)", "Wolvers", "Cyberserpente", "Laccio Osseo-Muscolare", "Cybergambe (Jump Booster)", "Collegamento Neurale (Antidolorifico)"],
      gear: ["Granate perforanti ×2"] },
    { id: "assassin", label: "Assassino (Solo)", keys: ["REF", "DEX", "MOVE", "COOL"], armor: 0, ability: ["Combat Awareness", 4, [0, 2, 4, 4, 6]],
      prim: ["martialarts", "melee", "brawling", "evasion", "stealth"], sec: ["tactics", "resist", "interrogation", "athletics"],
      weapons: [["mmelee", "hpistol"], ["hmelee", "hpistol"], ["hmelee", "martial"], ["hmelee", "martial"], ["hmelee", "martial"]],
      cyber: ["Collegamento Neurale", "Sandevistan", "Cyberocchi (Low Light/IR/UV)", "Laccio Osseo-Muscolare"],
      gear: ["Granata fumogena"] },
    { id: "sniper", label: "Cecchino (Solo)", keys: ["REF", "DEX", "COOL"], armor: -1, ability: ["Combat Awareness", 4, [0, 2, 4, 4, 6]],
      prim: ["shoulderarms", "stealth", "perception", "evasion"], sec: ["endurance", "conceal", "wilderness", "acting", "athletics"],
      weapons: [["sniper", "hpistol"], ["sniper", "hpistol"], ["sniper", "vhpistol"], ["sniper", "vhpistol"], ["sniper", "vhpistol"]],
      cyber: ["Cyberocchi (Low Light/IR/UV, Mirino)", "Collegamento Neurale", "Cyberocchio (TeleOttica)"],
      gear: ["Cellulare usa-e-getta", "Munizioni perforanti ×16"] },
    { id: "outrider", label: "Nomade (outrider)", keys: ["REF", "DEX", "TECH"], armor: 0, ability: ["Moto", 4, [0, 2, 4, 4, 6]],
      prim: ["drive", "shoulderarms", "autofire", "melee"], sec: ["landtech", "wilderness", "stealth", "pilotsea", "airtech"],
      weapons: [["shotgun", "hpistol"], ["shotgun", "vhpistol"], ["ar", "mmelee"], ["ar", "hmelee"], ["ar", "hmelee"]],
      cyber: ["Collegamento Neurale (Connettori d'Interfaccia)", "Sistema Cyberudito (Udito Amplificato)", "Cyberocchio (Mirino, TeleOttica)"],
      gear: ["Moto blindata", "Comunicatore Radio", "Traccianti"] },
    { id: "veteran", label: "Veterano militare (Solo)", keys: ["REF", "DEX", "BODY", "WILL"], armor: 0, ability: ["Combat Awareness", 4, [0, 2, 4, 4, 6]],
      prim: ["shoulderarms", "handgun", "athletics", "brawling", "evasion"], sec: ["tactics", "interrogation", "resist", "paramedic"],
      weapons: [["ar", "hpistol"], ["ar", "hpistol"], ["ar", "hpistol"], ["ar", "hpistol"], ["ar", "hpistol"]],
      cyber: ["Laccio Osseo-Muscolare", "Comunicatore Radio", "Collegamento Neurale", "Kerenzikov"],
      gear: ["Munizioni perforanti ×10", "Black Lace ×2"] },
  ];
  // compatibilità con i nemici creati prima (vecchi tipi)
  const OLD_TYPES = { ganger: "booster", security: "secop", merc: "veteran", ncpd: "secagent", nomad: "roadganger" };
  const enemyType = id => ENEMY_TYPES.find(t => t.id === (OLD_TYPES[id] || id)) || ENEMY_TYPES[0];
  // potenziamenti del livello 5 (uno a caso, due con un tiro fortunato)
  const BUFFS = [
    { id: "hp",      label: "+10 HP" },
    { id: "peak",    label: "Una base di combattimento portata a 18" },
    { id: "armor",   label: "Armatura migliorata: niente malus" },
    { id: "speed",   label: "MOVE 8 ed Evasion 18" },
    { id: "grenade", label: "Granata perforante e Athletics 16" },
    { id: "cyber",   label: "Cyberware extra" },
  ];
  const NICKS = ["Razor", "Spike", "Vex", "Glitch", "Rook", "Jinx", "Static", "Mako", "Chrome", "Ash", "Viper", "Torque", "Neon", "Grit", "Hex", "Kilo", "Rust", "Zero", "Blitz", "Sable", "Dice", "Molotov", "Fuse", "Ghost"];

  function generateEnemy(typeId, level) {
    const T = enemyType(typeId), L = LEVELS[Math.max(1, Math.min(5, +level || 1)) - 1];
    const r = ([a, b]) => a + die(b - a + 1) - 1;
    const pick = list => list[die(list.length) - 1];
    const shuffle = list => [...list].sort(() => Math.random() - 0.5);

    // STAT: quelle chiave più alte; BODY, WILL, MOVE ed EMP hanno fasce proprie; niente LUCK (come i PNG del manuale)
    const stats = {};
    for (const s of STATS) {
      const k = T.keys.includes(s.id);
      stats[s.id] = s.id === "LUCK" ? 0
        : s.id === "BODY" ? (k ? Math.max(r(L.body), r(L.key)) : r(L.body))
        : s.id === "WILL" ? (k ? Math.max(r(L.will), r(L.key) - 2) : r(L.will))
        : s.id === "MOVE" ? (k ? Math.max(r(L.move), r(L.key) - 1) : r(L.move))
        : s.id === "EMP" ? r(L.emp)
        : s.id === "REF" ? (k ? r(L.ref) : r(L.ref) - 1)   // anche i non combattenti sparano, ma un po' peggio
        : k ? r(L.key) : r(L.stat);
    }
    if (T.lowEmp) stats.EMP = 0;

    // armatura (testa e corpo uguali, come nei blocchi del manuale)
    const order = ["none", "leathers", "kevlar", "lightjack", "mediumjack", "heavyjack", "flak", "metalgear"];
    let armId = pick(L.armor);
    if (T.prefArmor && L.n >= 2) armId = T.prefArmor;
    else if (T.armor) armId = order[Math.max(1, Math.min(order.length - 1, order.indexOf(armId === "bodyweight" ? "lightjack" : armId) + T.armor))];
    const A = armorType(armId) || armorType("kevlar");
    // con un'armatura pesante REF, DEX e MOVE salgono prima del malus: +2 dal livello Hardened (come nei PDF Hardened), +1 sotto
    if (A.pen) PEN_STATS.forEach(s => { stats[s] = Math.min(10, stats[s] + (L.n >= 3 ? 2 : 1)); });

    // abilità: si sceglie la BASE nella fascia del livello, poi livello = base − STAT (0–10)
    const skills = new Map();
    const setSkill = (id, range) => {
      const k = skill(id); if (!k) return;
      const target = r(range), lvl = Math.max(0, Math.min(10, target - stats[k.stat]));
      const base = stats[k.stat] + lvl;
      const old = skills.get(id);
      if (!old || old.base < base) skills.set(id, { id, label: k.label, stat: k.stat, base });
    };
    BASIC.forEach(id => setSkill(id, L.basic));
    setSkill("evasion", L.eva);
    T.sec.forEach(id => setSkill(id, L.sec));
    T.prim.forEach(id => setSkill(id, L.prim));

    // armi: categorie del tipo per quel livello, qualità bassa o eccellente a seconda del livello
    const cats = (T.weapons[L.n - 1] || T.weapons[0]).slice(0, Math.max(L.weapons, (T.weapons[L.n - 1] || []).length));
    const weapons = cats.map(id => {
      const w = weaponType(id); if (!w) return null;
      if (!skills.has(w.skill)) setSkill(w.skill, L.sec);
      const q = Math.random() < L.exc ? "excellent" : Math.random() < L.poor && !["brawl", "martial"].includes(id) ? "poor" : "";
      return { cat: id, name: (q === "poor" ? "Poor Quality " : q === "excellent" ? "Excellent Quality " : "") + w.label, quality: q,
        skill: w.skill, dmg: w.dmg === "BODY" ? brawlDmg(stats.BODY) : w.dmg, rof: w.rof, mag: w.mag || "",
        base: skills.get(w.skill).base + (q === "excellent" ? 1 : 0) };
    }).filter(Boolean);

    // Capacità di Ruolo
    let ability = null;
    if (T.ability) { const [name, , ranks] = T.ability; const rank = ranks[L.n - 1]; if (rank) ability = { name, rank }; }

    // potenziamenti del livello 5
    const buffs = [];
    let hpBonus = 0, noPen = false;
    if (L.n === 5) {
      const n = die(10) === 10 ? 2 : 1;
      for (const b of shuffle(BUFFS)) {
        if (buffs.length >= n) break;
        if (b.id === "armor" && !A.pen) continue;
        buffs.push(b.label);
        if (b.id === "hp") hpBonus = 10;
        if (b.id === "armor") noPen = true;
        if (b.id === "peak") { const best = [...skills.values()].filter(s => T.prim.includes(s.id)).sort((a, b) => b.base - a.base)[0]; if (best) { best.base = 18; weapons.forEach(w => { if (w.skill === best.id) w.base = 18 + (w.quality === "excellent" ? 1 : 0); }); } }
        if (b.id === "speed") { stats.MOVE = Math.max(stats.MOVE, 8); const ev = skills.get("evasion"); if (ev) ev.base = 18; }
        if (b.id === "grenade") { const at = skills.get("athletics"); if (at) at.base = Math.max(at.base, 16); }
      }
    }

    // cyberware ed equipaggiamento: munizioni per le armi da fuoco + oggetti del tipo
    const cyber = shuffle(T.cyber).slice(0, L.cyber + (buffs.includes("Cyberware extra") ? 2 : 0) + (T.lowEmp ? 3 : 0));
    const ammo = [...new Set(weapons.map(w => (weaponType(w.cat) || {}).ammo).filter(Boolean))].map(a => `Munizioni ${a} ×${10 * (2 + die(4))}`);
    const gear = [...ammo, ...shuffle(T.gear).slice(0, 1 + Math.floor(L.n / 2))];
    if (buffs.includes("Granata perforante e Athletics 16")) gear.push("Granata perforante");

    return {
      type: T.id, level: L.n, name: `${T.label.split(" (")[0]} «${pick(NICKS)}»`,
      stats, hpMax: hpMax(stats.BODY, stats.WILL) + hpBonus,
      armor: { head: { type: A.id, name: A.sp ? A.label : "", sp: A.sp }, body: { type: A.id, name: A.sp ? A.label : "", sp: A.sp } },
      noPen, buffs, weapons,
      skills: [...skills.values()].sort((a, b) => b.base - a.base || a.label.localeCompare(b.label)).map(({ id, label, stat, base }) => ({ id, label, stat, base })),
      ability, cyber: cyber.join(", "), gear: gear.join(", "),
    };
  }

  return { STATS, SKILL_GROUPS, SKILLS, skill, WEAPON_SKILLS, ROLE_ABILITIES, hpMax, seriousAt, wound, die, check, parse, rollExpr,
    WEAPON_TYPES, weaponType, brawlDmg, ARMOR_TYPES, armorType, PEN_STATS, armorPen, LEVELS, ENEMY_TYPES, enemyType, BUFFS, generateEnemy };
})();
