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

  return { STATS, SKILL_GROUPS, SKILLS, skill, WEAPON_SKILLS, ROLE_ABILITIES, hpMax, seriousAt, wound, die, check, parse, rollExpr };
})();
