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

  // Espressioni libere: "2d6+3", "d10 - 2", "3d6 + 1d10 + 4", "3d6kh2" (tieni i 2 più alti), "4d6kl3" (i 3 più bassi)
  const TERM = /([+-]?)\s*(?:(\d*)d(\d+)(?:k([hl])(\d+))?|(\d+))/gi;
  function parse(expr) {
    const src = String(expr || "").replace(/\s+/g, "").toLowerCase();
    if (!src || !/^[+-]?(\d*d\d+(k[hl]\d+)?|\d+)([+-](\d*d\d+(k[hl]\d+)?|\d+))*$/.test(src)) return null;
    const terms = [];
    for (const m of src.matchAll(TERM)) {
      const sign = m[1] === "-" ? -1 : 1;
      if (m[3]) {
        const n = m[2] === "" ? 1 : +m[2], s = +m[3], keep = m[4] ? { hl: m[4], k: +m[5] } : null;
        if (n < 1 || n > 100 || s < 2 || s > 1000 || (keep && (keep.k < 1 || keep.k > n))) return null;
        terms.push({ sign, n, s, keep });
      } else terms.push({ sign, k: +m[6] });
    }
    return terms.length ? terms : null;
  }
  function rollExpr(expr, { damage = false } = {}) {
    const terms = parse(expr); if (!terms) return null;
    const dice = [], mods = [];
    let total = 0;
    for (const t of terms) {
      if (t.k != null) { mods.push({ l: "", v: t.sign * t.k }); total += t.sign * t.k; continue; }
      const vals = Array.from({ length: t.n }, () => die(t.s));
      // keep highest / lowest: i dadi scartati restano nel log, barrati
      let kept = vals.map((v, i) => i);
      if (t.keep) kept = vals.map((v, i) => ({ v, i })).sort((x, y) => t.keep.hl === "h" ? y.v - x.v : x.v - y.v).slice(0, t.keep.k).map(x => x.i);
      vals.forEach((v, i) => {
        const on = kept.includes(i);
        dice.push({ v, s: t.s, t: !on ? "drop" : t.sign < 0 ? "minus" : (t.s === 6 && v === 6 && damage ? "six" : "") });
        if (on) total += t.sign * v;
      });
    }
    // danni: due o più 6 sui d6 tenuti = Critical Injury (+5 danni bonus)
    let crit = "";
    if (damage && dice.filter(d => d.s === 6 && d.v === 6 && d.t === "six").length >= 2) {
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
  // categoria dal nome (schede vecchie senza categoria)
  const guessWeapon = (name, skill) => {
    const n = String(name || "").toLowerCase();
    const hit = WEAPON_TYPES.find(w => n.includes(w.label.toLowerCase()));
    if (hit) return hit.id;
    const kw = [["very heavy pistol", "vhpistol"], ["heavy pistol", "hpistol"], ["pistol", "mpistol"], ["heavy smg", "hsmg"], ["smg", "smg"], ["shotgun", "shotgun"], ["assault", "ar"], ["sniper", "sniper"],
      ["bow", "bow"], ["crossbow", "bow"], ["grenade", "gl"], ["rocket", "rl"], ["flame", "flamer"], ["katana", "hmelee"], ["knife", "lmelee"], ["coltello", "lmelee"], ["fucile d'assalto", "ar"], ["pistola", "mpistol"]];
    const k = kw.find(([w]) => n.includes(w)); if (k) return k[1];
    return { brawling: "brawl", martialarts: "martial" }[skill] || "";
  };

  // ---------- tiro per colpire: VD per distanza (manuale base) ----------
  const RANGE_BANDS = ["0–6 m", "7–12 m", "13–25 m", "26–50 m", "51–100 m", "101–200 m", "201–400 m", "401–800 m"];
  // tabelle estese: VD del colpo singolo per tipo di arma e distanza (null = fuori portata)
  const N = null;
  const RT = (id, label, dv) => ({ id, label, dv });
  const RANGE_TABLES = [
    RT("snub", "Snubnose Pistol", [12, 14, 20, 26, 35, N, N, N]),
    RT("pistol", "Pistol", [13, 15, 20, 25, 30, 35, N, N]),
    RT("lbpistol", "Long Barrel Pistol", [15, 13, 14, 19, 20, 22, 30, N]),
    RT("subsmg", "Subcompact SMG", [15, 13, 14, 21, 27, 30, N, N]),
    RT("smg", "SMG", [15, 13, 15, 20, 25, 25, 30, N]),
    RT("sbshotgun", "Short Barrel Shotgun", [12, 14, 23, 27, 32, N, N, N]),
    RT("shotgun", "Shotgun", [13, 15, 20, 25, 30, 35, N, N]),
    RT("lbshotgun", "Long Barrel Shotgun", [14, 16, 15, 18, 25, 28, N, N]),
    RT("carbine", "Carbine", [16, 15, 13, 15, 20, 25, 30, N]),
    RT("ar", "Assault Rifle", [17, 16, 15, 13, 15, 20, 25, 30]),
    RT("battle", "Battle Rifle", [18, 16, 16, 14, 14, 19, 24, 29]),
    RT("marksman", "Marksman Rifle", [20, 18, 17, 15, 14, 18, 21, 27]),
    RT("scout", "Scout Rifle", [21, 20, 19, 18, 17, 17, 19, 24]),
    RT("sniper", "Sniper Rifle", [30, 25, 25, 20, 15, 16, 17, 20]),
    RT("antimat", "Anti-materiel Rifle", [30, 30, 28, 22, 15, 15, 16, 17]),
    RT("shortbow", "Shortbow", [13, 14, 16, 21, 22, N, N, N]),
    RT("bow", "Bow", [15, 13, 15, 17, 20, 22, N, N]),
    RT("longbow", "Longbow", [17, 15, 13, 15, 17, 20, 22, N]),
    RT("gl", "Grenade Launcher", [16, 15, 15, 17, 20, 22, 25, N]),
    RT("rl", "Rocket Launcher", [17, 16, 15, 15, 20, 20, 25, 30]),
    RT("ml", "Missile Launcher", [30, 25, 25, 20, 17, 20, 20, 20]),
  ];
  // Autofire: solo fino a 100 m, danno 2d6 × (quanto superi la VD), al massimo ×3 (SMG) o ×4 (fucile d'assalto); 10 colpi
  const AUTO_TABLES = [
    RT("mpistol", "Machine Pistol", [17, 20, 22, 27, 30]),
    RT("smg", "SMGs", [20, 17, 20, 25, 30]),
    RT("ar", "Assault Rifle", [22, 20, 17, 20, 25]),
    RT("mg", "Machine Gun", [21, 18, 18, 19, 25]),
  ];
  const RANGE_OF = { mpistol: "pistol", hpistol: "pistol", vhpistol: "pistol", smg: "smg", hsmg: "smg", shotgun: "shotgun", ar: "ar", sniper: "sniper", bow: "bow", gl: "gl", rl: "rl" };
  const rangeDefault = cat => RANGE_OF[cat] || "";
  const autoDefault = cat => { const w = weaponType(cat); return w && w.auto ? (cat === "ar" ? "ar" : "smg") : ""; };
  const rangeById = id => RANGE_TABLES.find(t => t.id === id) || null;
  const autoById = id => AUTO_TABLES.find(t => t.id === id) || null;
  const rangeTable = cat => (rangeById(rangeDefault(cat)) || {}).dv || null;
  const autoTable = cat => (autoById(autoDefault(cat)) || {}).dv || null;
  const isMelee = cat => ["lmelee", "mmelee", "hmelee", "vhmelee", "brawl", "martial"].includes(cat);
  // colpi mirati: −8 al tiro, un solo colpo
  const AIMED = [
    { id: "head", label: "Testa", eff: "Il danno che supera la SP della testa raddoppia." },
    { id: "hand", label: "Oggetto in mano", eff: "Se il colpo fa danni, il bersaglio lascia cadere l'oggetto." },
    { id: "leg", label: "Gamba", eff: "Se il danno supera l'armatura, il bersaglio subisce la Critical Injury Gamba Rotta." },
  ];

  // ---------- Critical Injury (2d6) · effetti riassunti, dsp = +1 alla penalità del Death Save ----------
  const CI = (n, name, eff, dsp = 0) => ({ n, name, eff, dsp });
  const CRIT_BODY = [
    CI(2, "Dismembered Arm", "Braccio perso: lasci cadere ciò che tieni in quella mano.", 1),
    CI(3, "Dismembered Hand", "Mano persa: lasci cadere ciò che tieni.", 1),
    CI(4, "Collapsed Lung", "−2 MOVE (minimo 1).", 1),
    CI(5, "Broken Ribs", "A fine turno, se ti sei mosso a piedi più di 4 m, subisci di nuovo il danno bonus."),
    CI(6, "Broken Arm", "Il braccio non si usa: lasci cadere ciò che tieni."),
    CI(7, "Foreign Object", "A fine turno, se ti sei mosso a piedi più di 4 m, subisci di nuovo il danno bonus."),
    CI(8, "Broken Leg", "−4 MOVE (minimo 1)."),
    CI(9, "Torn Muscle", "−2 agli attacchi in mischia."),
    CI(10, "Spinal Injury", "Nel prossimo turno non puoi fare Azioni, solo muoverti.", 1),
    CI(11, "Crushed Fingers", "−4 alle Azioni con quella mano."),
    CI(12, "Dismembered Leg", "Gamba persa: −6 MOVE (minimo 1), non puoi schivare.", 1),
  ];
  const CRIT_HEAD = [
    CI(2, "Lost Eye", "−4 agli attacchi a distanza e alla Perception con la vista.", 1),
    CI(3, "Brain Injury", "−2 a tutte le Azioni.", 1),
    CI(4, "Damaged Eye", "−2 agli attacchi a distanza e alla Perception con la vista."),
    CI(5, "Concussion", "−2 a tutte le Azioni."),
    CI(6, "Broken Jaw", "−4 alle Azioni che richiedono di parlare."),
    CI(7, "Foreign Object", "A fine turno, se ti sei mosso a piedi più di 4 m, subisci di nuovo il danno bonus."),
    CI(8, "Whiplash", "Nessun malus oltre al Death Save.", 1),
    CI(9, "Cracked Skull", "I colpi mirati alla testa ti fanno danno ×3 invece di ×2.", 1),
    CI(10, "Damaged Ear", "−2 alla Perception con l'udito; ogni volta che ti muovi più di 4 m in un turno, −2 alle Azioni nel turno dopo."),
    CI(11, "Crushed Windpipe", "Non puoi parlare.", 1),
    CI(12, "Lost Ear", "−4 alla Perception con l'udito; ogni volta che ti muovi più di 4 m in un turno, −2 alle Azioni nel turno dopo.", 1),
  ];
  function rollCrit(loc) {
    const a = die(6), b = die(6), T = loc === "head" ? CRIT_HEAD : CRIT_BODY;
    return { dice: [{ v: a, s: 6 }, { v: b, s: 6 }], total: a + b, injury: T.find(x => x.n === a + b) };
  }

  // ---------- modificatori speciali della scheda (cyberware, talenti, situazioni) ----------
  const MOD_TARGETS = [
    ["attack", "Tutti gli attacchi"], ["ranged", "Attacchi a distanza"], ["melee", "Attacchi in mischia"], ["aimed", "Colpi mirati"],
    ["autofire", "Autofire"], ["damage", "Danni delle armi"], ["init", "Iniziativa"], ["all", "Tutte le prove"],
  ];
  // stati di partenza (effetti da completare nelle Regole della campagna)
  const DEFAULT_STATUS = ["In fiamme", "Avvelenato", "Stordito", "Accecato", "Assordato", "A terra", "Afferrato", "Svenuto"]
    .map((name, i) => ({ id: "st" + i, name, atk: 0, dmg: "", eff: "" }));
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

  // =================================================================================
  //  PNG / NEMICI — Fascia × Livello (+ Ruolo facoltativo: Solo, Tech, Medtech, Nomade)
  //  Base e Hardened ricalcano i PNG del manuale base (pag. 412–416) e i PDF gratuiti
  //  "Hardened" di R. Talsorian. Elite = regole della casa a Punti Elite.
  //  Ogni valore resta scomposto: base_naturale = STAT + livello_skill;
  //  base_effettiva = base_naturale + HQ + Smartgun + cyberware + ruolo (il malus dell'armatura è a parte).
  // =================================================================================
  const LEVEL_IDS = ["base", "hardened", "elite"];
  const LEVEL_LABELS = { base: "Base", hardened: "Hardened", elite: "Elite con Buff" };
  // tetti e fasce per Fascia e Livello. combat/tech/tactics/other/eva = fasce di base_naturale
  const TIERS = [
    { n: 1, label: "Scagnozzi e Strada", ratio: "1 per Edgerunner", budget: 6, extreme: 0, apex: 0, other: [2, 5],
      levels: {
        base:     { statMax: 7, skillMax: 6, combat: [10, 12], other: [4, 8],  eva: [6, 8],   hp: [20, 35], sp: [4, 7],   armor: ["leathers", "kevlar"], quality: "poor1", role: 0, hq: 0 },
        hardened: { statMax: 7, skillMax: 7, combat: [12, 14], other: [5, 9],  eva: [7, 10],  hp: [25, 40], sp: [4, 11],  armor: ["kevlar", "kevlar", "lightjack"], quality: "poor", role: 0, hq: 0 },
        elite:    { statMax: 8, skillMax: 8, combat: [14, 16], other: [6, 10], eva: [10, 13], hp: [35, 45], sp: [11, 11], armor: ["lightjack"], quality: "standard", role: 0, hq: 0 },
      } },
    { n: 2, label: "Luogotenenti e Operativi", ratio: "1 ogni 2 Edgerunner", budget: 8, extreme: 0, apex: 0, other: [3, 6],
      levels: {
        base:     { statMax: 8, skillMax: 6, combat: [10, 12], tech: [11, 13], other: [5, 9],  eva: [6, 9],   hp: [30, 40], sp: [11, 12], armor: ["lightjack", "bodyweight", "mediumjack"], quality: "standard", role: 4, hq: 0 },
        hardened: { statMax: 8, skillMax: 8, combat: [12, 14], tech: [13, 15], tactics: [10, 12], other: [6, 10], eva: [8, 12], hp: [40, 40], sp: [11, 13], armor: ["lightjack", "mediumjack", "heavyjack"], quality: "standard", role: 4, hq: 0 },
        elite:    { statMax: 8, skillMax: 9, combat: [16, 17], tech: [15, 17], tactics: [12, 14], other: [7, 11], eva: [12, 15], hp: [45, 55], sp: [11, 13], armor: ["lightjack", "mediumjack", "heavyjack"], quality: "standard", role: 4, hq: 0 },
      } },
    { n: 3, label: "Mini Boss e Specialisti Letali", ratio: "1 ogni 3 Edgerunner", budget: 10, extreme: 4, apex: 1, other: [4, 7],
      levels: {
        base:     { statMax: 8, skillMax: 6, combat: [14, 14], tech: [12, 14], other: [6, 10], eva: [12, 14], hp: [35, 40], sp: [11, 11], armor: ["lightjack"], quality: "standard", role: 4, hq: 0 },
        hardened: { statMax: 8, skillMax: 8, combat: [16, 16], tech: [14, 16], other: [7, 11], eva: [14, 16], hp: [45, 60], sp: [11, 11], armor: ["lightjack"], quality: "standard", role: 6, hq: 1, implants: true },
        elite:    { statMax: 8, skillMax: 9, combat: [17, 17], tech: [15, 17], other: [8, 12], eva: [17, 18], hp: [55, 70], sp: [11, 13], armor: ["lightjack", "mediumjack", "heavyjack"], quality: "standard", role: 6, hq: 1, implants: true },
      } },
    { n: 4, label: "Boss e Minacce Apice", ratio: "boss unico", budget: 12, extreme: 5, apex: 1, apexExtreme: 2, painImmune: true, other: [5, 7],
      levels: {
        base:     { statMax: 8, skillMax: 9,  combat: [17, 17], tech: [14, 16], other: [7, 12], eva: [15, 17], hp: [55, 55], sp: [11, 11], armor: ["lightjack", "subdermal"], quality: "standard", role: 4, hq: 0, implants: true },
        hardened: { statMax: 8, skillMax: 10, combat: [18, 18], tech: [15, 17], other: [8, 12], eva: [16, 17], hp: [60, 65], sp: [11, 13], armor: ["lightjack", "subdermal", "mediumjack", "heavyjack"], quality: "standard", role: 6, hq: 1, implants: true },
        // Boss Elite: STAT primarie di serie a 9 e malus dell'armatura sempre ridotto di 2
        elite:    { statMax: 9, penReduce: 2, skillMax: 10, combat: [18, 18], tech: [16, 18], other: [9, 13], eva: [17, 18], hp: [70, 85], sp: [11, 14], armor: ["lightjack", "subdermal", "mediumjack", "heavyjack"], quality: "standard", role: 6, hq: 1, implants: true },
      } },
  ];
  const tierOf = n => TIERS[Math.max(1, Math.min(4, +n || 1)) - 1];
  // tetto della base_effettiva (con HQ, Smartgun ecc.) per Fascia e Livello, dalla matrice calibrata
  const EFF_MAX = { 1: { base: 12, hardened: 14, elite: 17 }, 2: { base: 12, hardened: 14, elite: 19 }, 3: { base: 14, hardened: 17, elite: 20 }, 4: { base: 17, hardened: 19, elite: 21 } };
  const effMax = (tier, lvl) => (EFF_MAX[tierOf(tier).n] || EFF_MAX[1])[LEVEL_IDS.includes(lvl) ? lvl : "base"];
  const levelOf = (tier, lvl) => tierOf(tier).levels[LEVEL_IDS.includes(lvl) ? lvl : "base"];

  // impianti che alzano BODY oltre il tetto naturale di 8 (Linear Frame superiore = tratto apice, solo Elite F3/F4)
  const BODY_IMPLANTS = [
    { id: "", label: "Nessuno", body: 0 },
    { id: "bonelace", label: "Grafted Muscle and Bone Lace", body: 10 },
    { id: "sigma", label: "Linear Frame Σ (Sigma)", body: 12 },
    { id: "beta", label: "Linear Frame β (Beta)", body: 14 },
  ];
  const bodyImplant = id => BODY_IMPLANTS.find(b => b.id === id) || BODY_IMPLANTS[0];
  const FIREARMS = ["mpistol", "hpistol", "vhpistol", "smg", "hsmg", "shotgun", "ar", "sniper", "gl", "rl"];
  const COMBAT_SKILLS = ["handgun", "shoulderarms", "autofire", "heavyweapons", "archery", "melee", "brawling", "martialarts", "evasion"];

  // Abilità che tutti i PNG del manuale hanno
  const BASIC = ["athletics", "brawling", "concentration", "conversation", "education", "evasion", "firstaid",
    "humanperception", "streetslang", "localhome", "perception", "persuasion", "stealth"];

  // ---------- Ruolo (facoltativo): Solo, Tech, Medtech, Nomade ----------
  // Il Ruolo decide STAT primarie/secondarie, skill firma, armi tipiche e la Capacità di Ruolo con i suoi effetti.
  // "none" = combattente generico senza Capacità di Ruolo.
  const ROLES = [
    { id: "none", label: "Nessuno", ability: "", prim: ["REF", "DEX"], sec: ["BODY", "WILL"],
      combat: ["handgun", "shoulderarms", "melee", "brawling"], tech: [], other: ["athletics", "interrogation", "resist", "drive"],
      weapons: { 1: [["hpistol", "vhpistol", "shotgun", "smg"], ["lmelee", "mmelee"]], 2: [["ar", "shotgun", "hsmg", "vhpistol"], ["mmelee", "hpistol"]], 3: [["ar", "hsmg", "shotgun", "sniper"], ["vhpistol", "hmelee"]], 4: [["ar", "hsmg"], ["vhpistol", "vhmelee"], ["gl", "rl"]] },
      cyber: ["Comunicatore Radio", "Collegamento Neurale", "Cyberocchio (Low Light)", "Wolvers"], gear: ["Comunicatore Radio", "Cellulare usa-e-getta", "Agent"] },
    { id: "solo", label: "Solo", ability: "Combat Awareness", abilityIt: "Sensi da Combattimento", prim: ["REF", "DEX"], sec: ["BODY", "WILL"],
      combat: ["shoulderarms", "handgun", "autofire", "brawling", "melee"], tech: [], other: ["athletics", "tactics", "resist", "perception"],
      weapons: { 1: [["hpistol", "vhpistol", "shotgun"], ["mmelee", "lmelee"]], 2: [["ar", "shotgun", "hsmg"], ["vhpistol", "mmelee"]], 3: [["ar", "sniper", "hsmg"], ["vhpistol", "hmelee"]], 4: [["ar", "hsmg", "sniper"], ["vhpistol", "hmelee"], ["gl", "rl"]] },
      cyber: ["Collegamento Neurale", "Kerenzikov", "Sandevistan", "Laccio Osseo-Muscolare", "Cyberocchi (Mirino)"], gear: ["Munizioni perforanti ×10", "Granata perforante", "Granata fumogena"] },
    { id: "tech", label: "Tech", ability: "Maker", abilityIt: "Creatore", prim: ["TECH", "INT"], sec: ["REF", "COOL"],
      combat: ["handgun", "shoulderarms"], tech: ["basictech", "weaponstech", "electronics", "cybertech", "landtech", "demolitions"], other: ["perception", "education", "conceal"],
      weapons: { 1: [["hpistol", "mpistol"], ["lmelee"]], 2: [["shotgun", "hpistol", "smg"], ["lmelee"]], 3: [["shotgun", "ar", "hsmg"], ["hpistol"]], 4: [["ar", "gl"], ["hpistol", "hmelee"]] },
      cyber: ["Cyberbraccio (Mano Attrezzo)", "Cyberocchio (MicroOttica)", "Rilevatore di Cimici"], gear: ["Kit da tecnico", "Granata EMP", "Torcia elettrica"] },
    { id: "medtech", label: "Medtech", ability: "Medicine", abilityIt: "Medicina", prim: ["TECH", "INT"], sec: ["COOL", "REF"],
      combat: ["handgun"], tech: ["paramedic", "firstaid", "cybertech", "basictech"], other: ["humanperception", "concentration", "perception"],
      weapons: { 1: [["hpistol", "mpistol"], ["lmelee"]], 2: [["hpistol", "smg"], ["lmelee"]], 3: [["hsmg", "smg"], ["hpistol"]], 4: [["hsmg", "shotgun"], ["hpistol"]] },
      cyber: ["Cyberocchio (MicroOttica)", "Filtri Nasali", "Antidolorifico"], gear: ["Kit medico", "Speedheal ×2", "Airhypo", "Criopompa"] },
    { id: "nomad", label: "Nomade", ability: "Moto", abilityIt: "Garage", prim: ["REF", "DEX"], sec: ["TECH", "MOVE"],
      combat: ["shoulderarms", "autofire", "melee", "handgun"], tech: ["landtech", "airtech", "seatech"], other: ["drive", "wilderness", "stealth", "pilotair"],
      weapons: { 1: [["shotgun", "vhpistol", "bow"], ["mmelee"]], 2: [["shotgun", "ar"], ["vhpistol", "mmelee"]], 3: [["ar", "shotgun"], ["vhpistol", "hmelee"]], 4: [["ar", "shotgun"], ["vhpistol", "hmelee"], ["gl"]] },
      cyber: ["Collegamento Neurale (Connettori d'Interfaccia)", "Sistema Cyberudito (Udito Amplificato)", "Cyberocchio (TeleOttica)"], gear: ["Comunicatore Radio", "Traccianti", "Attrezzi"] },
  ];
  // Netrunner: Interfaccia, Azioni NET per grado e Cyberdeck (programmi da js/net.js)
  ROLES.push({ id: "netrunner", label: "Netrunner", ability: "Interface", abilityIt: "Interfaccia", prim: ["INT", "TECH"], sec: ["REF", "COOL"],
    combat: ["handgun"], tech: ["electronics", "basictech", "cybertech"], other: ["perception", "library", "conceal", "stealth", "cryptography"],
    weapons: { 1: [["mpistol", "hpistol"], ["lmelee"]], 2: [["hpistol", "smg"], ["lmelee"]], 3: [["hsmg", "smg", "hpistol"], ["lmelee"]], 4: [["hsmg", "smg"], ["vhpistol"]] },
    cyber: ["Collegamento Neurale (Connettori d'Interfaccia)", "Chipware (Chip di Memoria)", "Cyberocchio (MicroOttica)", "Comunicatore Radio"], gear: ["Occhiali VR", "Tuta Bodyweight", "Agent"] });
  const roleOf = id => ROLES.find(r => r.id === id) || ROLES[0];
  // Azioni NET per grado d'Interfaccia: 1–3 → 2 · 4–6 → 3 · 7–9 → 4 · 10 → 5
  const netActions = rank => { const r = +rank || 0; return r >= 10 ? 5 : r >= 7 ? 4 : r >= 4 ? 3 : 2; };
  // grado della Capacità di Ruolo di partenza per Fascia e Livello (poi si alza con i Punti Elite)
  const ROLE_RANK = { 1: { base: 2, hardened: 3, elite: 4 }, 2: { base: 4, hardened: 4, elite: 5 }, 3: { base: 4, hardened: 6, elite: 6 }, 4: { base: 4, hardened: 6, elite: 6 } };
  const roleRank = (tier, lvl) => (ROLE_RANK[tierOf(tier).n] || ROLE_RANK[1])[LEVEL_IDS.includes(lvl) ? lvl : "base"];

  // Sensi da Combattimento: costo in punti di ruolo di ogni uso (manuale base, pag. 146)
  const CA_USES = [
    { id: "precise",  label: "Attacco Preciso",         unit: "+1 agli attacchi", cost: n => 3 * n, max: 3 },
    { id: "reaction", label: "Reazione",                unit: "+1 all'Iniziativa", cost: n => n, max: 10 },
    { id: "threat",   label: "Individuare Minacce",     unit: "+1 a Perception",  cost: n => n, max: 10 },
    { id: "weakness", label: "Individuare Debolezze",   unit: "+1 danno al primo colpo a segno del round", cost: n => n, max: 10 },
    { id: "deflect",  label: "Deflettere Danni",        unit: "−1 al primo danno subito nel round", cost: n => 2 * n, max: 5 },
    { id: "recover",  label: "Recuperare da un Disastro", unit: "ignora i fallimenti critici sparando", cost: n => 4 * n, max: 1 },
  ];
  const caCost = ca => CA_USES.reduce((t, u) => t + u.cost(+((ca || {})[u.id]) || 0), 0);
  // distribuzione automatica: prima Attacco Preciso, poi Deflettere, il resto in Reazione
  function autoCA(rank) {
    const ca = { precise: Math.min(3, Math.floor(rank / 3)), reaction: 0, threat: 0, weakness: 0, deflect: 0, recover: 0 };
    let rest = rank - 3 * ca.precise;
    if (rest >= 2) { ca.deflect = 1; rest -= 2; }
    ca.reaction = rest;
    return ca;
  }
  // Creatore: ogni grado dà 1 punto a due specializzazioni diverse → Esperienza sul Campo e Upgrade = grado
  const MAKER_SKILLS = ["basictech", "cybertech", "electronics", "airtech", "weaponstech", "seatech", "landtech"];
  // Garage: il grado si somma a Guidare, Pilotare e tecnologie dei veicoli
  const GARAGE_SKILLS = ["drive", "pilotair", "pilotsea", "airtech", "seatech", "landtech"];
  const GARAGE_VEHICLES = [[1, 4, "Utilitarie, Girocotteri, Moto d'Acqua, Motociclette"], [5, 6, "Elicotteri, Auto Sportive, Motoscafi"], [7, 8, "AV-4, Cabinati, Supermoto"], [9, 10, "Aerozep, AV-9, Superauto, Yacht"]];
  // Medicina: ogni grado dà 1 punto a Chirurgia (2 livelli dell'abilità Surgery), Farmaceutica o Criosistemi (Medical Tech, max 5 ciascuna)
  function autoMed(rank) { const surgery = Math.min(5, Math.ceil(rank / 2)), rest = rank - surgery, pharma = Math.min(5, Math.ceil(rest / 2)); return { surgery, pharma, cryo: Math.min(5, rest - pharma) }; }

  // ---------- catalogo dei potenziamenti (Punti Elite) ----------
  // Costi ribilanciati: il nemico più forte possibile resta un Solo di Fascia 4 Elite Estremo con 2 tratti apice.
  // apex = tratto apice (Fascia 3: max 1 · Fascia 4: max 1, 2 se Nemico Estremo). Gli acquisti valgono a ogni livello:
  // in Elite c'è il budget della fascia, in Base e Hardened solo i Punti extra.
  const DEF_CYBER = ["Cyberocchi Low Light/IR/UV", "Antiriflesso", "Filtri Nasali", "Sistema Cyberudito (Udito Amplificato)"];
  function eliteCatalog(E) {
    const R = roleOf(E.role), tier = +E.tier || 1, out = [];
    const add = o => out.push({ apex: false, ...o });
    if (R.ability) {
      add({ key: "role:7", group: "Ruolo", label: `${R.abilityIt} a 7`, cost: 2 });
      add({ key: "role:8", group: "Ruolo", label: `${R.abilityIt} a 8`, cost: 4 });
      add({ key: "role:9", group: "Ruolo", label: `${R.abilityIt} a 9`, cost: 6 });
      add({ key: "role:10", group: "Ruolo", label: `${R.abilityIt} a 10`, cost: 9, apex: tier >= 3 });
    }
    if (tier >= 3) {
      for (const s of [...R.prim, ...R.sec]) {
        if (s === "BODY") continue;            // il BODY sale solo con gli impianti
        const combat = s === "REF" || s === "DEX";
        // STAT a 9 e 10 rese più accessibili: costano poco e nella pesca casuale escono spesso
        add({ key: `stat:${s}:9`, group: "STAT", label: `${s} a 9`, cost: 2 });
        add({ key: `stat:${s}:10`, group: "STAT", label: `${s} a 10`, cost: R.prim.includes(s) ? 4 : 3, apex: combat });
      }
      for (const id of [...new Set([...R.combat, "evasion"])]) {
        const k = skill(id); if (!k) continue;
        add({ key: `skill:${id}`, group: "Skill", label: `${k.label} a 10`, cost: 4, apex: true });
      }
      add({ key: "frame", group: "Impianti", label: "Linear Frame superiore (BODY 16–18)", cost: 6, apex: true });
      add({ key: "metalgear", group: "Armatura", label: "Metalgear (SP 18, −4 senza Tech Upgrade)", cost: 5, apex: true });
    }
    if ((E.weapons || []).some(w => FIREARMS.includes(w.cat))) add({ key: "smart", group: "Armi", label: "Collegamento Neurale + Smartgun Link (+1)", cost: 4 });
    (E.weapons || []).forEach((w, i) => { if (w.quality !== "hq") add({ key: `hq:${i}`, group: "Armi", label: `${w.name || "Arma"} High Quality (+1)`, cost: 2 }); });
    add({ key: "techup", group: "Armatura", label: "Tech Upgrade: niente malus dell'armatura", cost: 3 });
    add({ key: "tough", group: "Corpo", label: "+5 HP (robustezza)", cost: 2 });
    DEF_CYBER.forEach((c, i) => add({ key: `cyber:${i}`, group: "Cyberware", label: c, cost: 1 }));
    return out;
  }
  const budgetOf = E => { const T = tierOf(E.tier); return (E.level === "elite" ? T.budget + (E.extreme && T.extreme ? T.extreme : 0) : 0) + Math.max(0, +E.extraPoints || 0); };
  const apexLimit = E => { const T = tierOf(E.tier); return E.level === "elite" && E.extreme && T.apexExtreme ? T.apexExtreme : T.apex; };
  function canPick(E, opt, picks = E.picks || []) {
    const cat = eliteCatalog(E), have = picks.map(k => cat.find(o => o.key === k)).filter(Boolean);
    if (picks.includes(opt.key)) return false;
    if (have.reduce((t, o) => t + o.cost, 0) + opt.cost > budgetOf(E)) return false;
    if (opt.apex && have.filter(o => o.apex).length >= apexLimit(E)) return false;
    const fam = k => k.split(":").slice(0, 2).join(":");
    if ((opt.key.startsWith("role:") && have.some(o => o.key.startsWith("role:"))) ||
        (opt.key.startsWith("stat:") && have.some(o => o.key.startsWith("stat:") && fam(o.key) === fam(opt.key)))) return false;
    if (opt.key === "techup" && !armorPen(E.armor, false) && !picks.includes("metalgear")) return false;
    if (opt.key.startsWith("skill:")) { const s = (E.skills || []).find(x => x.id === opt.key.slice(6)); if (s && s.lvl >= 10) return false; }
    if (opt.key.startsWith("stat:")) { const [, st, v] = opt.key.split(":"); if ((+((E.stats || {})[st]) || 0) >= +v) return false; }
    if (opt.key.startsWith("role:") && +E.roleRank >= +opt.key.slice(5)) return false;
    return true;
  }
  // generazione casuale: peso = 1 / costo, finché resta budget per qualcosa
  function rollElite(E) {
    const picks = [];
    for (let guard = 0; guard < 40; guard++) {
      const opts = eliteCatalog(E).filter(o => canPick(E, o, picks));
      if (!opts.length) break;
      const wt = o => (o.key.startsWith("stat:") ? 2 : 1) / o.cost;   // le STAT 9–10 escono più spesso
      const tot = opts.reduce((t, o) => t + wt(o), 0);
      let x = Math.random() * tot, pick = opts[0];
      for (const o of opts) { x -= wt(o); if (x <= 0) { pick = o; break; } }
      picks.push(pick.key);
    }
    return picks;
  }

  // ---------- armi: pesca per Fascia, Livello e Ruolo (anche per il pulsante "Ripesca armi") ----------
  function rollWeapons(roleId, tierN, levelId) {
    const R = roleOf(roleId), tier = tierOf(tierN).n, L = levelOf(tier, levelId);
    const pools = R.weapons[tier] || R.weapons[1];
    const pick = list => list[die(list.length) - 1];
    const n = tier === 1 && levelId === "base" ? 1 + (die(2) - 1) : pools.length;
    return pools.slice(0, Math.max(1, n)).map((pool, i) => {
      const id = pick(pool), w = weaponType(id); if (!w) return null;
      const quality = L.quality === "poor" ? (["brawl", "martial"].includes(id) ? "standard" : "poor")
        : L.quality === "poor1" ? (i === 0 ? "poor" : "standard")
        : (L.hq && i === 0 ? "hq" : "standard");
      return { cat: id, name: w.label, quality, skill: w.skill, dmg: w.dmg, rof: w.rof, mag: w.mag || "" };
    }).filter(Boolean);
  }

  // ---------- valori derivati: ogni addendo, una sola fonte per scheda, tiri e validatore ----------
  function deriveEnemy(E) {
    const tier = +E.tier || 1, T = tierOf(tier), L = levelOf(tier, E.level), R = roleOf(E.role);
    const cat = eliteCatalog(E), picks = (E.picks || []).map(k => cat.find(o => o.key === k)).filter(Boolean);
    const has = k => picks.some(o => o.key === k);
    const nat = { ...(E.stats || {}) }, statSrc = {};
    picks.filter(o => o.key.startsWith("stat:")).forEach(o => { const [, s, v] = o.key.split(":"); nat[s] = +v; statSrc[s] = `Elite: ${o.label}`; });
    let armor = JSON.parse(JSON.stringify(E.armor || {}));
    if (has("metalgear")) for (const l of ["head", "body"]) armor[l] = { type: "metalgear", name: "Metalgear", sp: 18 };
    const imp = bodyImplant(E.bodyImplant);
    let body = Math.max(+nat.BODY || 0, imp.body || 0), bodySrc = imp.body ? imp.label : "";
    if (has("frame")) { body = Math.max(body, +E.frameBody || 16); bodySrc = `Linear Frame superiore (BODY ${body})`; }
    // Capacità di Ruolo e i suoi effetti
    let ability = null;
    if (R.ability) {
      const rp = picks.find(o => o.key.startsWith("role:"));
      const rank = Math.max(+E.roleRank || 0, rp ? +rp.key.slice(5) : 0);
      ability = { id: R.id, name: R.ability, nameIt: R.abilityIt, rank, src: rp ? "Elite" : "" };
      if (R.id === "solo") { ability.ca = { ...autoCA(0), ...(E.ca || autoCA(rank)) }; ability.caUsed = caCost(ability.ca); }
      if (R.id === "tech") ability.maker = { field: rank, upgrade: rank };
      if (R.id === "medtech") { ability.med = { ...autoMed(rank), ...(E.med || {}) }; }
      if (R.id === "netrunner") { ability.actions = netActions(rank); ability.deck = E.deck || { name: "Cyberdeck", slots: 7, items: [] }; }
      if (R.id === "nomad") ability.vehicles = (GARAGE_VEHICLES.filter(([a]) => a <= Math.max(1, rank)).map(v => v[2])).join(" · ");
    }
    const ca = ability && ability.ca;
    // cyberware scelto dal catalogo (js/cyberware.js): bonus alle abilità, iniziativa, attacchi
    const cfx = window.CW && (E.cyberRefs || []).length ? CW.effects(E.cyberRefs.map(x => ({ ...x, installed: true })), 0) : null;
    // skill: base_naturale = STAT + livello; bonus_ruolo (Creatore / Garage / Individuare Minacce)
    const skills = (E.skills || []).map(s => {
      const k = skill(s.id) || {}, stat = s.stat || k.stat || "INT";
      const lvl = has(`skill:${s.id}`) ? 10 : (+s.lvl || 0);
      const bonus = [];
      if (ability && R.id === "tech" && MAKER_SKILLS.includes(s.id)) bonus.push({ l: "Esperienza sul Campo", v: ability.rank, role: true });
      if (ability && R.id === "nomad" && GARAGE_SKILLS.includes(s.id)) bonus.push({ l: "Garage", v: ability.rank, role: true });
      if (ca && ca.threat && s.id === "perception") bonus.push({ l: "Individuare Minacce", v: +ca.threat, role: true });
      if (cfx) bonus.push(...CW.skillBonus(cfx, s.id, has(`skill:${s.id}`) ? 10 : (+s.lvl || 0)));
      return { ...s, label: s.label || k.label || s.id, stat, lvl, statV: +nat[stat] || 0, nat: (+nat[stat] || 0) + lvl, combat: COMBAT_SKILLS.includes(s.id), elite10: has(`skill:${s.id}`), bonus };
    });
    // Medicina: Surgery (2 livelli per punto) e Medical Tech (Farmaceutica + Criosistemi) come abilità TECH
    if (ability && ability.med) {
      const tech = +nat.TECH || 0, med = ability.med;
      const surg = Math.min(10, 2 * med.surgery), mt = Math.min(10, (+med.pharma || 0) + (+med.cryo || 0));
      if (surg) skills.push({ id: "surgery", label: "Surgery", stat: "TECH", lvl: surg, statV: tech, nat: tech + surg, combat: false, bonus: [], fromRole: true });
      if (mt) skills.push({ id: "medicaltech", label: "Medical Tech", stat: "TECH", lvl: mt, statV: tech, nat: tech + mt, combat: false, bonus: [], fromRole: true });
    }
    // regola del 20
    const twenty = skills.filter(s => s.combat && s.nat >= 20);
    const spNow = Math.max(...["head", "body"].map(l => +((armor[l] || {}).sp) || 0));
    const comp = !twenty.length ? "" : spNow <= 11 ? "sp" : (E.comp === "hp" ? "hp" : "sp");
    if (comp === "sp") for (const l of ["head", "body"]) if ((+((armor[l] || {}).sp) || 0) > 11) armor[l] = { type: "lightjack", name: "Light Armorjack", sp: 11, forced: true };
    const noPen = !!E.noPen || has("techup");
    const penRaw = armorPen(armor, noPen), pen = L.penReduce ? Math.min(0, penRaw + L.penReduce) : penRaw;
    const smart = has("smart");
    const skillRows = skills.map(s => { const eff = s.nat + s.bonus.reduce((t, b) => t + b.v, 0); return { ...s, eff, effArmor: eff + (PEN_STATS.includes(s.stat) ? pen : 0) }; });
    // armi: HQ e Smartgun entro il tetto della fascia; Attacco Preciso (ruolo) a parte
    const weapons = (E.weapons || []).map((w, i) => {
      const t = weaponType(w.cat) || {}, wsk = skill(w.skill) || {};
      const sk = skills.find(s => s.id === w.skill) || { stat: wsk.stat || "REF", lvl: 0, nat: +nat[wsk.stat || "REF"] || 0, label: wsk.label || w.skill };
      const hq = w.quality === "hq" || has(`hq:${i}`);
      const bonus = [];
      if (hq) bonus.push({ l: has(`hq:${i}`) ? "HQ (Elite)" : "HQ", v: 1 });
      if (smart && FIREARMS.includes(w.cat)) bonus.push({ l: "Smartgun", v: 1 });
      let eff = sk.nat + bonus.reduce((t, b) => t + b.v, 0);
      const capE = Math.max(effMax(tier, E.level), sk.nat);
      if (bonus.length && eff > capE) { bonus.push({ l: "tetto di fascia", v: capE - eff }); eff = capE; }
      if (ca && ca.precise) { bonus.push({ l: "Attacco Preciso", v: +ca.precise, role: true }); eff += +ca.precise; }
      return { ...w, hq, poor: w.quality === "poor", firearm: FIREARMS.includes(w.cat), dmg: t.dmg === "BODY" ? brawlDmg(body) : (w.dmg || t.dmg), skillLabel: sk.label, stat: sk.stat, statV: +nat[sk.stat] || 0, lvl: sk.lvl, nat: sk.nat, bonus, eff, effArmor: eff + (PEN_STATS.includes(sk.stat) ? pen : 0) };
    });
    const eff = {};
    for (const s of STATS) {
      let v = +nat[s.id] || 0;
      if (s.id === "BODY") v = body;
      if (s.id === "MOVE" && E.moveImplant) v = Math.max(v, +E.moveImplant || 0);
      eff[s.id] = { nat: +((E.stats || {})[s.id]) || 0, v, armor: PEN_STATS.includes(s.id) ? Math.max(0, v + pen) : v, src: s.id === "BODY" ? bodySrc : s.id === "MOVE" && E.moveImplant ? "Cybergambe" : statSrc[s.id] || "" };
    }
    // HP: formula del manuale, fascia del livello, robustezza comprata, regola del 20
    const formula = hpMax(body, +nat.WILL || 0);
    const parts = [{ l: `10 + 5 × ⌈(BODY ${body} + WILL ${+nat.WILL || 0}) / 2⌉`, v: formula }];
    let hp = formula;
    if (hasNum(E.hpOverride)) { parts.push({ l: "valore a mano", v: +E.hpOverride - hp }); hp = +E.hpOverride; }
    else if (hp < L.hp[0]) { parts.push({ l: `minimo di fascia (${L.hp[0]})`, v: L.hp[0] - hp }); hp = L.hp[0]; }
    else if (hp > L.hp[1]) { parts.push({ l: `massimo di fascia (${L.hp[1]})`, v: L.hp[1] - hp }); hp = L.hp[1]; }
    if (has("tough")) { parts.push({ l: "robustezza (Punti Elite)", v: 5 }); hp += 5; }
    if (comp === "hp") { const cap = tier >= 4 ? 65 : tier === 3 ? 45 : 40; if (hp > cap) { parts.push({ l: `regola del 20: HP ridotti a ${cap}`, v: cap - hp }); hp = cap; } }
    const initBonus = [...(ca && ca.reaction ? [{ l: "Reazione", v: +ca.reaction }] : []), ...(cfx ? cfx.mods.filter(m => m.target === "init").map(m => ({ l: m.name, v: m.value })) : [])];
    return {
      tier, level: E.level, T, L, role: R, stats: eff, pen, penRaw, penReduce: L.penReduce && penRaw ? Math.min(L.penReduce, -penRaw) : 0, noPen, armor, body, skills: skillRows, weapons, ability, initBonus,
      hp, hpParts: parts, painImmune: tier >= 4 || !!(cfx && cfx.pain), cyberMods: cfx ? cfx.mods.filter(m => m.target !== "init") : [],
      picks, spent: picks.reduce((t, o) => t + o.cost, 0), budget: budgetOf(E), apexUsed: picks.filter(o => o.apex).length, apexLimit: apexLimit(E),
      twenty, comp, extraCyber: picks.filter(o => o.key.startsWith("cyber:") || o.key === "smart").map(o => o.label),
    };
  }
  const hasNum = v => v !== "" && v !== null && v !== undefined && !isNaN(+v);

  // ---------- validatore ----------
  function validateEnemy(E) {
    const D = deriveEnemy(E), L = D.L, errors = [], warns = [];
    for (const s of STATS) {
      if (s.id === "LUCK") continue;
      const n = +((E.stats || {})[s.id]) || 0;
      if (n > L.statMax) errors.push(`${s.id} naturale ${n} supera il tetto di ${L.statMax} (Fascia ${D.tier} ${LEVEL_LABELS[E.level]})${s.id === "BODY" ? ": usa un impianto" : ""}`);
    }
    if (bodyImplant(E.bodyImplant).body && !L.implants) warns.push("Impianti per il BODY previsti dalla Fascia 3 Hardened in su");
    for (const s of D.skills) if (!s.fromRole && s.lvl > L.skillMax && !s.elite10) errors.push(`${s.label}: livello ${s.lvl} oltre il massimo di ${L.skillMax}`);
    if (D.spent > D.budget) errors.push(`Punti spesi ${D.spent} su ${D.budget}`);
    if (D.apexUsed > D.apexLimit) errors.push(`Tratti apice ${D.apexUsed} su ${D.apexLimit} consentiti`);
    if (D.ability && D.ability.ca && D.ability.caUsed > D.ability.rank) errors.push(`Sensi da Combattimento: ${D.ability.caUsed} punti usati su ${D.ability.rank}`);
    if (D.ability && D.ability.med) { const m = D.ability.med, t = (+m.surgery || 0) + (+m.pharma || 0) + (+m.cryo || 0); if (t > D.ability.rank) errors.push(`Medicina: ${t} punti su ${D.ability.rank}`); if (+m.pharma > 5 || +m.cryo > 5) errors.push("Farmaceutica e Criosistemi: massimo 5 ciascuna"); }
    const sp = Math.max(...["head", "body"].map(l => +((D.armor[l] || {}).sp) || 0));
    if ((sp < L.sp[0] || sp > L.sp[1]) && !D.picks.some(o => o.key === "metalgear")) warns.push(`SP ${sp} fuori dalla fascia ${L.sp[0]}–${L.sp[1]}`);
    if (D.hp < L.hp[0] && D.comp !== "hp") warns.push(`HP ${D.hp} sotto la fascia ${L.hp[0]}–${L.hp[1]}`);
    if (D.tier <= 2 && E.level !== "elite" && (E.weapons || []).some(w => w.quality === "hq")) warns.push("Armi HQ di serie solo dalla Fascia 3 Hardened");
    if (D.twenty.length) warns.push(`Regola del 20 (${D.twenty.map(s => s.label).join(", ")}): ${D.comp === "hp" ? "HP ridotti" : "SP portata a 11"}`);
    return { errors, warns, D };
  }

  // ---------- generatore: Fascia + Livello (+ Ruolo facoltativo) ----------
  const NICKS = ["Razor", "Spike", "Vex", "Glitch", "Rook", "Jinx", "Static", "Mako", "Chrome", "Ash", "Viper", "Torque", "Neon", "Grit", "Hex", "Kilo", "Rust", "Zero", "Blitz", "Sable", "Dice", "Molotov", "Fuse", "Ghost"];
  const TIER_NAMES = { 1: "Scagnozzo", 2: "Luogotenente", 3: "Specialista", 4: "Boss" };
  function generateEnemy(tierN, levelId, { role = "none", extreme = null, extraPoints = 0 } = {}) {
    const R = roleOf(role), tier = tierOf(tierN).n, level = LEVEL_IDS.includes(levelId) ? levelId : "base";
    const T = tierOf(tier), L = T.levels[level];
    const r = ([a, b]) => a + die(b - a + 1) - 1;
    const pick = list => list[die(list.length) - 1];
    const shuffle = list => [...list].sort(() => Math.random() - 0.5);
    const cap = v => Math.max(0, Math.min(L.statMax, v));
    const stats = {};
    for (const s of STATS) {
      if (s.id === "LUCK") { stats.LUCK = 0; continue; }
      if (R.prim.includes(s.id)) stats[s.id] = cap(tier >= 3 ? L.statMax : r([L.statMax - 1, L.statMax]));
      else if (R.sec.includes(s.id)) stats[s.id] = cap(r([L.statMax - 2, L.statMax - 1]));
      else stats[s.id] = cap(r(T.other));
    }
    if (!R.prim.includes("REF") && !R.sec.includes("REF")) stats.REF = cap(Math.max(stats.REF, L.statMax - 2));
    if (stats.WILL < T.other[0] + 1) stats.WILL = T.other[0] + 1;
    stats.EMP = cap(r([2, 5]));
    // armatura
    const A = armorType(pick(L.armor)) || armorType("kevlar");
    if (A.pen) PEN_STATS.forEach(s => { stats[s] = cap(stats[s] + 2); });
    let bodyImp = "";
    if (L.implants && (R.prim.includes("BODY") || R.sec.includes("BODY") || Math.random() < 0.4)) bodyImp = tier >= 4 ? pick(["bonelace", "sigma", "sigma", "beta"]) : pick(["bonelace", "sigma"]);
    // skill
    const skills = new Map();
    const setSkill = (id, range) => {
      const k = skill(id); if (!k || !range) return;
      const lvl = Math.max(0, Math.min(L.skillMax, r(range) - (stats[k.stat] || 0)));
      const old = skills.get(id);
      if (!old || old.lvl < lvl) skills.set(id, { id, label: k.label, stat: k.stat, lvl });
    };
    BASIC.forEach(id => setSkill(id, L.other));
    (R.other || []).forEach(id => setSkill(id, [Math.min(L.other[1], L.other[0] + 2), L.other[1] + (tier >= 3 ? 2 : 1)]));
    (R.tech || []).forEach(id => setSkill(id, L.tech || [L.other[0] + 2, L.other[1] + 2]));
    if (tier === 2 && L.tactics) setSkill("tactics", L.tactics);
    setSkill("evasion", L.eva);
    (R.combat || []).forEach(id => setSkill(id, L.combat));
    const weapons = rollWeapons(R.id, tier, level);
    weapons.forEach(w => { if (!skills.has(w.skill)) setSkill(w.skill, L.combat); });
    const rank = R.ability ? roleRank(tier, level) : 0;
    const E = {
      v: 3, tier, level, role: R.id, name: `${R.id === "none" ? TIER_NAMES[tier] : R.label} «${pick(NICKS)}»`,
      stats, bodyImplant: bodyImp, moveImplant: tier >= 4 && R.sec.includes("MOVE") ? 10 : null,
      armor: { head: { type: A.id, name: A.sp ? A.label : "", sp: A.sp }, body: { type: A.id, name: A.sp ? A.label : "", sp: A.sp } },
      noPen: false, weapons, skills: [...skills.values()], roleRank: rank,
      ca: R.id === "solo" ? autoCA(rank) : null, med: R.id === "medtech" ? autoMed(rank) : null,
      deck: R.id === "netrunner" && window.NET ? NET.autoDeck(tier, level) : null,
      hpOverride: null, extreme: level === "elite" && tier >= 3 ? (extreme === null ? Math.random() < 0.12 : !!extreme) : false,
      extraPoints: Math.max(0, +extraPoints || 0), frameBody: 16 + die(3) - 1, comp: Math.random() < 0.5 ? "sp" : "hp", picks: [],
      cyber: shuffle(R.cyber).slice(0, Math.min(R.cyber.length, tier - 1 + LEVEL_IDS.indexOf(level))).join(", "),
      gear: [...[...new Set(weapons.map(w => (weaponType(w.cat) || {}).ammo).filter(Boolean))].map(a => `Munizioni ${a} ×${10 * (2 + die(4))}`), ...shuffle(R.gear).slice(0, 1 + Math.floor(tier / 2))].join(", "),
      notes: "",
    };
    if (budgetOf(E) > 0) E.picks = rollElite(E);
    // se la Capacità sale con i punti, i Sensi da Combattimento / la Medicina si ridistribuiscono sul grado nuovo
    const D = deriveEnemy(E);
    if (D.ability && D.ability.rank !== rank) { if (R.id === "solo") E.ca = autoCA(D.ability.rank); if (R.id === "medtech") E.med = autoMed(D.ability.rank); }
    return E;
  }

  // ---------- migrazione ----------
  // v1 = vecchio generatore (livelli 1–5, basi già sommate) · v2 = Fascia × Tipo × Livello · v3 = Fascia × Livello + Ruolo
  const TYPE_ROLE = { solo: "solo", assassin: "solo", sniper: "solo", tracker: "solo", pyro: "solo", boss: "solo", veteran: "solo", merc: "solo",
    tech: "tech", medtech: "medtech", nomad: "nomad", netrunner: "netrunner", outrider: "nomad", roadganger: "nomad" };
  const OLD_TIER = { booster: 1, ganger: 1, scavenger: 1, roadganger: 1, bodyguard: 1, secop: 1, security: 1, netrunner: 2, reclaimer: 2, secagent: 2, ncpd: 2, nomad: 2, outrider: 2, tech: 2, medtech: 2,
    solo: 3, merc: 3, veteran: 3, assassin: 3, tracker: 3, pyro: 3, sniper: 3, cyberpsycho: 4, boss: 4 };
  function normalizeEnemy(E0) {
    if (!E0) return E0;
    if (E0.v === 3) return E0;
    const E = E0.v === 2 ? E0 : v1to2(E0);
    const role = TYPE_ROLE[E.type] || "none", R = roleOf(role);
    const rank = R.ability ? Math.max(roleRank(E.tier, E.level), (E.ability && E.ability.name === R.ability ? +E.ability.rank : 0) || 0) : 0;
    const picks = (E.picks || []).filter(k => !k.startsWith("stim:")).map(k => k.startsWith("role:") && +k.slice(5) < 7 ? null : k).filter(Boolean);
    const out = { ...E, v: 3, role, roleRank: rank, ca: role === "solo" ? autoCA(rank) : null, med: role === "medtech" ? autoMed(rank) : null, deck: role === "netrunner" && window.NET ? NET.autoDeck(E.tier, E.level) : null, extraPoints: 0, picks };
    delete out.type; delete out.ability;
    const notes = [];
    if (E.ability && E.ability.name && E.ability.name !== R.ability) notes.push(`Capacità di Ruolo precedente: ${E.ability.name} ${E.ability.rank}`);
    if ((E.picks || []).some(k => k.startsWith("stim:"))) notes.push("Stimolanti tolti dal catalogo");
    if (notes.length) out.notes = [out.notes, ...notes].filter(Boolean).join("\n");
    out.migrated = true;
    return out;
  }
  function v1to2(E) {
    const tierOfType = OLD_TIER[E.type] || 1, lv = +E.level || 1;
    const map = { 1: [1, "base"], 2: [2, "base"], 3: [Math.min(2, tierOfType), "hardened"], 4: [3, "base"], 5: [3, "elite"] }[lv] || [tierOfType, "base"];
    const stats = { ...(E.stats || {}) }, orig = { ...(E.stats || {}) };
    let bodyImp = "";
    if ((+stats.BODY || 0) > 8) { bodyImp = +stats.BODY >= 14 ? "beta" : +stats.BODY >= 12 ? "sigma" : "bonelace"; stats.BODY = 8; }
    const notes = [], picks = [];
    for (const k of Object.keys(stats).filter(k => k !== "BODY" && k !== "LUCK" && +stats[k] > 8)) {
      if (map[1] === "elite" && map[0] >= 3) picks.push(`stat:${k}:${Math.min(10, +stats[k])}`);
      else notes.push(`${k} era ${stats[k]}: riportato a 8 (tetto della fascia)`);
      stats[k] = 8;
    }
    const skills = (E.skills || []).map(s => {
      const k = SKILLS.find(x => x.id === s.id) || SKILLS.find(x => x.label.toLowerCase() === String(s.label || "").toLowerCase());
      const stat = s.stat || (k && k.stat) || "INT";
      const lvl = s.lvl != null ? +s.lvl : Math.max(0, Math.min(10, (+s.base || 0) - (+orig[stat] || 0)));
      return { id: (k && k.id) || s.id || String(s.label || "").toLowerCase().replace(/[^a-z]+/g, ""), label: s.label || (k && k.label) || s.id, stat, lvl };
    });
    const weapons = (E.weapons || []).map(w => {
      const q = w.quality === "excellent" || /^Excellent Quality /.test(w.name || "") ? "hq" : w.quality === "poor" || /^Poor Quality /.test(w.name || "") ? "poor" : w.quality || "standard";
      const sk = SKILLS.find(s => s.id === w.skill);
      if (sk && !skills.some(s => s.id === sk.id) && w.base != null) skills.push({ id: sk.id, label: sk.label, stat: sk.stat, lvl: Math.max(0, Math.min(10, +w.base - (q === "hq" ? 1 : 0) - (+orig[sk.stat] || 0))) });
      return { cat: w.cat || "", name: String(w.name || "").replace(/^(Poor|Excellent) Quality /, ""), quality: q, skill: w.skill || (weaponType(w.cat) || {}).skill || "handgun", dmg: w.dmg, rof: w.rof, mag: w.mag || "" };
    });
    const hpAuto = hpMax(+orig.BODY || 0, +orig.WILL || 0);
    return { v: 2, type: E.type, tier: map[0], level: map[1], name: E.name, stats, bodyImplant: bodyImp, moveImplant: null, armor: E.armor || {}, noPen: !!E.noPen,
      weapons, skills, ability: E.ability || null, hpOverride: E.hpMax != null && +E.hpMax !== hpAuto ? +E.hpMax : null, extreme: false, frameBody: 16, comp: "sp", picks,
      cyber: E.cyber || "", gear: E.gear || "", notes: [E.notes, (E.buffs || []).length ? `Vecchi potenziamenti: ${E.buffs.join(", ")}` : "", ...notes].filter(Boolean).join("\n") };
  }

  return { STATS, SKILL_GROUPS, SKILLS, skill, WEAPON_SKILLS, ROLE_ABILITIES, hpMax, seriousAt, wound, die, check, parse, rollExpr,
    WEAPON_TYPES, weaponType, guessWeapon, brawlDmg, RANGE_BANDS, RANGE_TABLES, AUTO_TABLES, rangeDefault, autoDefault, rangeById, autoById, rangeTable, autoTable, isMelee, AIMED, CRIT_BODY, CRIT_HEAD, rollCrit, MOD_TARGETS, DEFAULT_STATUS, ARMOR_TYPES, armorType, PEN_STATS, armorPen, BODY_IMPLANTS, bodyImplant, FIREARMS,
    TIERS, tierOf, levelOf, effMax, LEVEL_IDS, LEVEL_LABELS, ROLES, roleOf, roleRank, netActions, CA_USES, caCost, autoCA, autoMed, GARAGE_VEHICLES,
    eliteCatalog, canPick, rollElite, rollWeapons, budgetOf, apexLimit, deriveEnemy, validateEnemy, generateEnemy, normalizeEnemy };
})();
