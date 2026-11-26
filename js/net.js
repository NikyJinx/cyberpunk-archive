// ============================================================
//  CYBERPUNK RED — NETRUNNING
//  Programmi, Black ICE, hardware del Cyberdeck, Demoni e
//  generatore di Architetture di Rete (manuale base, pag. 201–212).
//  Nomi come nell'edizione italiana; gli effetti sono riassunti.
// ============================================================
window.NET = (() => {
  const die = s => CPR.die(s);
  const pick = a => a[die(a.length) - 1];
  const uid = () => Math.random().toString(36).slice(2, 10);

  // ---------- classi ----------
  const CLASSES = {
    boost:         { label: "Boost",                     short: "Boost" },
    defender:      { label: "Difensivo",                 short: "Difensivo" },
    antiprogram:   { label: "Offensivo · Anti-Programma", short: "Anti-Programma" },
    antipersonnel: { label: "Offensivo · Anti-Operatore", short: "Anti-Operatore" },
  };
  const offensive = cls => cls === "antiprogram" || cls === "antipersonnel";

  // ---------- programmi (non Black ICE) ----------
  // dmg = tiri di danno (u: "REZ" ai programmi, "brain" al cervello) · fx = altri tiri dell'effetto
  // boost = bonus alle prove d'Interfaccia finché è Rezzato · once = una volta per Netrun
  const P = (id, name, cls, atk, def, rez, cost, eff, x = {}) => ({ id, name, cls, atk, def, rez, cost, eff, slots: 1, ...x });
  const PROGRAMS = [
    P("eraser", "Eraser", "boost", 0, 0, 7, 20, "+2 alle prove di Cloak finché è Rezzato.", { boost: { cloak: 2 } }),
    P("seeya", "See Ya", "boost", 0, 0, 7, 20, "+2 alle prove di Mapper finché è Rezzato.", { boost: { mapper: 2 } }),
    P("speedy", "Speedy Gonzalvez", "boost", 0, 0, 7, 100, "+2 alla Velocità finché è Rezzato.", { boost: { speed: 2 } }),
    P("worm", "Worm", "boost", 0, 0, 7, 50, "+2 alle prove di Backdoor finché è Rezzato.", { boost: { backdoor: 2 } }),
    P("armor", "Armor", "defender", 0, 0, 7, 50, "Finché è Rezzato: −4 ai danni al cervello. Una sola copia attiva; ogni copia si usa una volta per Netrun.", { once: true }),
    P("flak", "Flak", "defender", 0, 0, 7, 50, "Finché è Rezzato: l'ATT dei programmi nemici non Black ICE scende a 0. Una sola copia attiva; una volta per Netrun.", { once: true }),
    P("shield", "Shield", "defender", 0, 0, 7, 20, "Il primo colpo di un programma non Black ICE non fa danni al cervello, poi si Derezza. Una sola copia attiva; una volta per Netrun.", { once: true }),
    P("banhammer", "Banhammer", "antiprogram", 1, 0, 0, 50, "3d6 REZ a un programma non Black ICE, 2d6 REZ a un Black ICE.",
      { dmg: [{ l: "vs programma", x: "3d6", u: "REZ" }, { l: "vs Black ICE", x: "2d6", u: "REZ" }] }),
    P("sword", "Sword", "antiprogram", 1, 0, 0, 50, "2d6 REZ a un programma non Black ICE, 3d6 REZ a un Black ICE.",
      { dmg: [{ l: "vs programma", x: "2d6", u: "REZ" }, { l: "vs Black ICE", x: "3d6", u: "REZ" }] }),
    P("deckkrash", "DeckKRASH", "antipersonnel", 0, 0, 0, 100, "Il Netrunner colpito viene Scollegato a forza e subisce gli effetti di tutti i Black ICE Rezzati che ha incontrato."),
    P("hellbolt", "Hellbolt", "antipersonnel", 2, 0, 0, 100, "2d6 al cervello; deck (se non ha Cavi Isolati) e vestiti prendono fuoco: −2 HP a round finché non usa un'Azione IRL per spegnerli. Più copie non si sommano.",
      { dmg: [{ l: "al cervello", x: "2d6", u: "brain" }] }),
    P("nervescrub", "Nervescrub", "antipersonnel", 0, 0, 0, 100, "INT, REF e DEX del bersaglio −1d6 ciascuna (minimo 1) per un'ora. Effetto psicosomatico, non permanente.",
      { fx: [{ l: "INT −", x: "1d6" }, { l: "REF −", x: "1d6" }, { l: "DEX −", x: "1d6" }] }),
    P("poisonflatline", "Poison Flatline", "antipersonnel", 0, 0, 0, 100, "Distrugge un programma non Black ICE, scelto a caso, nel deck del bersaglio."),
    P("superglue", "Superglue", "antipersonnel", 2, 0, 0, 100, "Il bersaglio non può scendere di piano né Scollegarsi in sicurezza per 1d6 round (a forza sì). Una volta per Netrun.",
      { fx: [{ l: "round bloccato", x: "1d6" }], once: true }),
    P("vrizzbolt", "Vrizzbolt", "antipersonnel", 1, 0, 0, 50, "1d6 al cervello e −1 Azione NET nel prossimo turno del bersaglio (minimo 2).",
      { dmg: [{ l: "al cervello", x: "1d6", u: "brain" }] }),
  ];

  // ---------- Black ICE ----------
  // PER = difficoltà del Bypass · VEL = agguato · nel deck occupano 2 Slot
  const I = (id, name, cls, per, spd, atk, def, rez, cost, eff, x = {}) => ({ id, name, cls, per, spd, atk, def, rez, cost, eff, ice: true, slots: 2, ...x });
  const ICE = [
    I("hellhound", "Cerbero", "antipersonnel", 6, 6, 6, 2, 20, 500, "2d6 al cervello; deck (se non ha Cavi Isolati) e vestiti prendono fuoco: −2 HP a round finché non usa un'Azione IRL per spegnerli. Più copie non si sommano.",
      { alias: "Hellhound", dmg: [{ l: "al cervello", x: "2d6", u: "brain" }] }),
    I("cobra", "Cobra", "antipersonnel", 4, 6, 2, 2, 15, 100, "Distrugge un programma, scelto a caso, nel deck del bersaglio."),
    I("kraken", "Kraken", "antipersonnel", 6, 2, 8, 4, 30, 1000, "3d6 al cervello; nel turno seguente il Netrunner non può scendere di piano né Scollegarsi in sicurezza (a forza sì).",
      { dmg: [{ l: "al cervello", x: "3d6", u: "brain" }] }),
    I("lich", "Lich", "antipersonnel", 8, 2, 6, 2, 25, 500, "INT, REF e DEX del bersaglio −1d6 ciascuna (minimo 1) per un'ora. Effetto psicosomatico, non permanente.",
      { fx: [{ l: "INT −", x: "1d6" }, { l: "REF −", x: "1d6" }, { l: "DEX −", x: "1d6" }] }),
    I("raven", "Raven", "antipersonnel", 6, 4, 4, 2, 15, 50, "Derezza un programma Difensivo Rezzato, scelto a caso, poi 1d6 al cervello.",
      { dmg: [{ l: "al cervello", x: "1d6", u: "brain" }] }),
    I("scorpion", "Scorpion", "antipersonnel", 2, 6, 2, 2, 15, 100, "La Velocità del Netrunner scende di 1d6 (minimo 1) per un'ora. Effetto psicosomatico, non permanente.",
      { fx: [{ l: "Velocità −", x: "1d6" }] }),
    I("skunk", "Skunk", "antipersonnel", 2, 4, 4, 2, 10, 500, "Finché lo Skunk non è Derezzato, il Netrunner colpito ha −2 a tutte le prove di Bypass. Ogni Skunk colpisce un Netrunner alla volta; più copie si sommano."),
    I("wisp", "Sprite", "antipersonnel", 4, 4, 4, 2, 15, 50, "1d6 al cervello e −1 Azione NET nel prossimo turno del bersaglio (minimo 2).",
      { alias: "Wisp", dmg: [{ l: "al cervello", x: "1d6", u: "brain" }] }),
    I("titan", "Titan", "antipersonnel", 2, 2, 8, 4, 25, 1000, "3d6 al cervello e Scollegamento forzato: subisce gli effetti di tutti i Black ICE Rezzati incontrati (Titan escluso).",
      { dmg: [{ l: "al cervello", x: "3d6", u: "brain" }] }),
    I("dragon", "Dragon", "antiprogram", 6, 4, 6, 6, 30, 1000, "6d6 REZ a un programma; se lo Derezza, lo Distrugge.", { dmg: [{ l: "a un programma", x: "6d6", u: "REZ" }] }),
    I("killer", "Killer", "antiprogram", 4, 8, 6, 2, 20, 500, "4d6 REZ a un programma; se lo Derezza, lo Distrugge.", { dmg: [{ l: "a un programma", x: "4d6", u: "REZ" }] }),
    I("sabertooth", "Sabertooth", "antiprogram", 8, 6, 6, 2, 25, 1000, "6d6 REZ a un programma; se lo Derezza, lo Distrugge.", { dmg: [{ l: "a un programma", x: "6d6", u: "REZ" }] }),
  ];
  const iceLabel = c => c.alias ? `${c.name} (${c.alias})` : c.name;

  // ---------- homebrew del GM (meta "nethb"): Black ICE e Demoni in più ----------
  // ice = { id: "hb-…", name, cls, per, spd, atk, def, rez, dmgX, dmgU ("brain" | "REZ"), fxX, fxL, eff }
  let HB = { ice: [], demons: [] };
  const n0 = v => (v === "" || v == null || isNaN(+v)) ? 0 : +v;
  const hbIce = h => ({ ...h, cls: h.cls === "antiprogram" ? "antiprogram" : "antipersonnel", per: n0(h.per), spd: n0(h.spd), atk: n0(h.atk), def: n0(h.def), rez: Math.max(1, n0(h.rez)),
    cost: n0(h.cost), ice: true, slots: 2, homebrew: true,
    dmg: h.dmgX && CPR.parse(h.dmgX) ? [{ l: h.dmgU === "REZ" ? "a un programma" : "al cervello", x: String(h.dmgX).replace(/\s+/g, ""), u: h.dmgU === "REZ" ? "REZ" : "brain" }] : [],
    fx: h.fxX && CPR.parse(h.fxX) ? [{ l: h.fxL || "effetto", x: String(h.fxX).replace(/\s+/g, "") }] : [] });
  const hbDemon = d => ({ ...d, rez: Math.max(1, n0(d.rez)), iface: n0(d.iface), actions: Math.max(1, n0(d.actions) || 2), combat: n0(d.combat), homebrew: true });
  function setHomebrew(rec) { HB = { ice: ((rec && rec.ice) || []).map(hbIce), demons: ((rec && rec.demons) || []).map(hbDemon) }; }
  const homebrew = () => HB;
  const allIce = () => [...ICE, ...HB.ice];

  // ---------- hardware del Cyberdeck ----------
  const HARDWARE = [
    { id: "krash", name: "Barriera KRASH", slots: 2, cost: 100, eff: "Immune ai programmi che costringono a Scollegarsi." },
    { id: "dnalock", name: "Blocco DNA", slots: 2, cost: 100, eff: "Si sblocca solo con la chiave biometrica; senza, Electronics/Security Tech VD 17." },
    { id: "insulated", name: "Cavi Isolati", slots: 1, cost: 100, eff: "Il deck non prende fuoco e non incendia i vestiti per l'effetto di un programma." },
    { id: "hardened", name: "Circuiti Rinforzati", slots: 1, cost: 100, eff: "Non può essere disattivato né distrutto da EMP, microonde o programmi non Black ICE." },
    { id: "backup", name: "Disco di Backup", slots: 2, cost: 100, eff: "Salva i programmi non Black ICE quando vengono Distrutti; reinstallarne uno è un'Azione IRL (se c'è lo Slot)." },
    { id: "range", name: "Portata Migliorata", slots: 1, cost: 100, eff: "Si collega ad Access Point fino a 8 m di distanza." },
    // Midnight with the Upload
    { id: "aerie", name: "Aerie", slots: 2, cost: 500, eff: "Ogni Black ICE Raven del deck, col suo effetto d'attacco, distrugge un Defender Rezzato a caso del Netrunner nemico invece di derezzarlo.", src: "Midnight with the Upload" },
    { id: "bushido", name: "Bushido Accelerator", slots: 3, cost: 500, eff: "Per ogni Bushido Accelerator, +2 alla Velocità di tutti i Black ICE Killer del deck. (3 slot secondo la descrizione, 2 nella tabella.)", src: "Midnight with the Upload" },
    { id: "combatrec", name: "Combat Recorder", slots: 1, cost: 500, eff: "Quando un altro Netrunner nella stessa Architettura fallisce un Death Save, registra gli ultimi 5 minuti senza tracce tue: ogni registrazione vale circa 50 eb.", src: "Midnight with the Upload" },
    { id: "defseq", name: "Defense Sequencer", slots: 2, cost: 500, eff: "Quando un Armor attivo viene derezzato o distrutto, all'inizio del tuo turno Rezza da solo un altro Armor del deck non ancora usato in questa Netrun, senza NET Action.", src: "Midnight with the Upload" },
    { id: "feline", name: "Feline Instinct", slots: 2, cost: 500, eff: "Quando un Sabertooth del deck distrugge un programma, il suo danno sale di 1d6 fino al Jack Out.", src: "Midnight with the Upload" },
    { id: "hangry", name: "Hangry Hangry Dragon", slots: 1, cost: 500, eff: "Quando un Dragon del deck distrugge un programma, torna a REZ piena.", src: "Midnight with the Upload" },
    { id: "perfume", name: "Perfume Shoppe", slots: 2, cost: 500, eff: "I Black ICE Skunk occupano 1 slot invece di 2.", src: "Midnight with the Upload" },
    { id: "smithy", name: "Smithy", slots: 1, cost: 500, eff: "Con una Meat Action trasformi tutti i Sword installati in Banhammer, e tutti i Banhammer in Sword.", src: "Midnight with the Upload" },
    { id: "snaketrap", name: "Snaketrap", slots: 1, cost: 500, eff: "Blocca il primo effetto di Black ICE o programma della Netrun che distruggerebbe un programma a caso del deck. Più copie non servono.", src: "Midnight with the Upload" },
    { id: "swampmist", name: "Swamp Mist", slots: 2, cost: 500, eff: "Rimappa i Black ICE Wisp in una versione più potente, a scapito dell'efficienza. (Il testo è incompleto: l'effetto preciso lo decide il GM.)", src: "Midnight with the Upload" },
    // Hacking Agents
    { id: "crunchwhistle", name: "Crunch Whistle", slots: 1, cost: 100, eff: "Collega il Cyberdeck a un Breacher: aggiungi l'Interface alle prove di Electronics/Security Tech per hackerare un Agent (riquadro «Hacking Agent» nella tab Cyberdeck).", src: "Hacking Agents" },
    { id: "swiftyclean", name: "Swifty Clean", slots: 2, cost: 500, eff: "Effetto non descritto nel testo: lo decide il GM.", src: "Midnight with the Upload" },
  ];

  // ---------- Capacità d'Interfaccia ----------
  const ABILITIES = [
    { id: "backdoor", name: "Backdoor", eff: "Supera una Password: vs VD." },
    { id: "bypass", name: "Bypass", eff: "Sfugge a un Black ICE: vs PER + 1d10 del Black ICE." },
    { id: "cloak", name: "Cloak", eff: "Nasconde le tracce del Netrun: chi le cerca tira contro questo risultato." },
    { id: "control", name: "Control", eff: "Usa un Nodo di Controllo: vs VD." },
    { id: "id", name: "I-D", eff: "Identifica un File o un Nodo: vs VD." },
    { id: "mapper", name: "Mapper", eff: "Rivela i piani dell'Architettura: vs VD." },
    { id: "scanner", name: "Scanner", eff: "Trova Access Point e Architetture nei dintorni: vs VD." },
    { id: "virus", name: "Virus", eff: "Lascia un Virus al fondo dell'Architettura: vs VD." },
    { id: "zap", name: "Zap", eff: "Attacco: 1d6 REZ a un programma o 1d6 al cervello di un Netrunner.", attack: true, dmg: [{ l: "danno", x: "1d6" }] },
  ];
  const netActions = rank => CPR.netActions(rank);

  // ---------- Cyberdeck ----------
  // deck = { name, slots, hwSlots (Tuta Bodyweight +1, solo hardware), items[{ ref, …custom, cur, on, used, dead }] }
  // ref = "prog:sword" | "ice:hellhound" | "hw:krash" | "custom"
  const DECK_QUALITY = [{ id: "poor", label: "Poor Quality", slots: 5 }, { id: "standard", label: "Standard", slots: 7 }, { id: "excellent", label: "Excellent Quality", slots: 9 }];
  function catalogOf(ref) {
    const [k, id] = String(ref || "").split(":");
    if (k === "prog") return PROGRAMS.find(p => p.id === id);
    if (k === "ice") return allIce().find(p => p.id === id);
    if (k === "hw") return HARDWARE.find(p => p.id === id);
    return null;
  }
  // tutte le informazioni di un oggetto del deck (catalogo o personalizzato)
  function itemInfo(it) {
    const k = String(it.ref || "custom").split(":")[0];
    const c = catalogOf(it.ref);
    if (c) return { ...c, k, label: k === "ice" ? iceLabel(c) : c.name, hw: k === "hw", ice: k === "ice" };
    const n = v => (v === "" || v == null || isNaN(+v)) ? 0 : +v;
    const cls = CLASSES[it.cls] ? it.cls : it.cls === "hw" ? "hw" : it.cls === "ice" ? "ice" : "antipersonnel";
    const hw = cls === "hw", ice = cls === "ice";
    const dmg = CPR.parse(it.dmg) ? [{ l: "danno", x: String(it.dmg).replace(/\s+/g, ""), u: "" }] : [];
    return { id: "custom", k: "custom", name: it.name || "Programma", label: it.name || "Programma", cls: hw ? "" : ice ? (it.iceCls || "antipersonnel") : cls, hw, ice,
      atk: n(it.atk), def: n(it.def), rez: n(it.rez), per: n(it.per), spd: n(it.spd), slots: Math.max(0, n(it.slots) || (ice ? 2 : 1)), eff: it.eff || "", dmg, custom: true };
  }
  const hasRez = info => !info.hw && (info.ice || info.rez > 0);
  const curRez = (it, info) => it.cur == null || it.cur === "" || isNaN(+it.cur) ? info.rez : Math.max(0, Math.min(info.rez, +it.cur));
  function deckSlots(deck) {
    const d = deck || {}, items = d.items || [];
    const base = Math.max(0, +d.slots || 7) + (d.cyberarm ? 1 : 0), hwExtra = d.bodyweight ? 1 : 0;
    const used = items.reduce((t, it) => t + itemInfo(it).slots, 0);
    const hwUsed = items.filter(it => itemInfo(it).hw).reduce((t, it) => t + itemInfo(it).slots, 0);
    const nonHw = used - hwUsed;
    // lo Slot della tuta vale solo per l'hardware
    const over = nonHw > base || used > base + Math.min(hwExtra, hwUsed);
    return { used, total: base + hwExtra, base, hwExtra, over };
  }
  // bonus delle Capacità dai Boost Rezzati (e non Derezzati)
  function boosts(deck) {
    const out = {};
    for (const it of (deck && deck.items) || []) {
      const info = itemInfo(it); if (!info.boost || !it.on || it.dead || curRez(it, info) <= 0) continue;
      for (const [k, v] of Object.entries(info.boost)) (out[k] = out[k] || []).push({ l: info.name, v });
    }
    return out;
  }
  // deck tipico di un Netrunner nemico, per Fascia e Livello
  function autoDeck(tier, level) {
    const t = +tier || 1, lv = ["base", "hardened", "elite"].indexOf(level);
    const slots = t <= 1 ? 5 : t === 2 ? 7 : 9;
    const items = [];
    const add = ref => items.push({ ref });
    add(pick(["prog:shield", "prog:armor"]));
    add(pick(["prog:sword", "prog:banhammer"]));
    add(t >= 3 ? pick(["prog:hellbolt", "prog:vrizzbolt"]) : "prog:vrizzbolt");
    if (t >= 2) add(pick(["prog:hellbolt", "prog:superglue", "prog:nervescrub"]));
    if (t >= 2 || lv >= 1) add(pick(["prog:worm", "prog:speedy", "prog:eraser"]));
    if (t >= 3) add(pick(["prog:flak", "prog:armor", "prog:shield"]));
    if (t >= 3 || (t === 2 && lv === 2)) add(pick(["ice:wisp", "ice:raven", "ice:hellhound", "ice:skunk"]));
    if (t >= 4) add(pick(["prog:deckkrash", "prog:poisonflatline"]));
    if (t >= 3 && lv >= 1) add(pick(["hw:insulated", "hw:hardened"]));
    const deck = { name: t <= 1 ? "Cyberdeck Poor Quality" : t >= 3 ? "Cyberdeck Excellent Quality" : "Cyberdeck", slots, items };
    while (deckSlots(deck).over && deck.items.length) deck.items.pop();
    return deck;
  }

  // ---------- Demoni ----------
  const DEMONS = [
    { id: "imp", name: "Imp", rez: 15, iface: 3, actions: 2, combat: 14 },
    { id: "ifrit", name: "Ifrit", rez: 25, iface: 4, actions: 3, combat: 14 },
    { id: "balron", name: "Balron", rez: 30, iface: 7, actions: 4, combat: 14 },
  ];
  const allDemons = () => [...DEMONS, ...HB.demons];
  const demonOf = id => allDemons().find(d => d.id === id) || DEMONS[0];

  // ---------- Architetture di Rete ----------
  const DIFFS = [
    { id: "basic", label: "Base", dv: 6, need: 2, risk: "—", demon: "imp" },
    { id: "standard", label: "Standard", dv: 8, need: 4, risk: "2 o meno", demon: "imp" },
    { id: "uncommon", label: "Non Comune", dv: 10, need: 6, risk: "4 o meno", demon: "ifrit" },
    { id: "advanced", label: "Avanzata", dv: 12, need: 8, risk: "6 o meno", demon: "balron" },
  ];
  const diffOf = id => DIFFS.find(d => d.id === id) || DIFFS[1];
  const FLOOR_TYPES = [
    { id: "password", label: "Password", icon: "🔑", dv: true, ab: "Backdoor" },
    { id: "file", label: "File", icon: "📄", dv: true, ab: "I-D" },
    { id: "control", label: "Nodo di Controllo", icon: "⚙", dv: true, ab: "Control" },
    { id: "ice", label: "Black ICE", icon: "☠", dv: false },
    { id: "other", label: "Altro", icon: "◇", dv: true },
  ];
  const floorType = id => FLOOR_TYPES.find(t => t.id === id) || FLOOR_TYPES[4];
  // l'Ingresso (primi due piani): 1d6
  const ENTRANCE = [{ t: "file", dv: 6 }, { t: "password", dv: 6 }, { t: "password", dv: 8 }, { t: "ice", ice: ["skunk"] }, { t: "ice", ice: ["wisp"] }, { t: "ice", ice: ["killer"] }];
  // piani inferiori: 3d6, una colonna per Livello di Difficoltà (Base, Standard, Non Comune, Avanzata)
  const H = "hellhound";
  const LOWER = {
    3: [[H], [H, H], ["kraken"], [H, H, H]],
    4: [["sabertooth"], [H, "killer"], [H, "scorpion"], ["cobra", "cobra"]],
    5: [["raven", "raven"], ["skunk", "skunk"], [H, "killer"], [H, "lich"]],
    6: [[H], ["sabertooth"], ["raven", "raven"], ["wisp", "wisp", "wisp"]],
    7: [["wisp"], ["scorpion"], ["sabertooth"], [H, "sabertooth"]],
    8: [["raven"], [H], [H], ["kraken"]],
    9: "password", 10: "file", 11: "control", 12: "password",
    13: [["skunk"], ["cobra"], ["killer"], ["titan"]],
    14: [["cobra"], ["killer"], ["lich"], ["dragon"]],
    15: [["scorpion"], ["lich"], ["dragon"], ["killer", "scorpion"]],
    16: [["killer", "skunk"], ["cobra"], ["cobra", "raven"], ["kraken"]],
    17: [["wisp", "wisp", "wisp"], ["raven", "raven", "raven"], ["dragon", "wisp"], ["raven", "wisp", H]],
    18: [["lich"], ["lich", "raven"], ["titan"], ["dragon", "dragon"]],
  };
  const CONTROLS = ["Telecamere", "Torretta", "Porta di sicurezza", "Ascensore", "Luci", "Irrigatori antincendio", "Sirene", "Drone di sorveglianza",
    "Altoparlanti", "Climatizzazione", "Serrature elettroniche", "Monitor", "Catena di montaggio", "Distributore di bibite"];
  const FILES = ["Registro del personale", "Contabilità", "Email riservate", "Planimetrie", "Registrazioni video", "Dati di ricerca",
    "Codici d'accesso", "Materiale di ricatto", "Ordini di consegna", "Turni della sicurezza"];

  const iceOf = id => allIce().find(c => c.id === id);
  const iceList = ids => ids.map(id => ({ ref: id, cur: (iceOf(id) || {}).rez || 0 }));
  // un piano dalla tabella: entrata = 1d6, sotto = 3d6 sulla colonna della difficoltà
  function rollFloor(diffId, entrance) {
    const D = diffOf(diffId), col = DIFFS.indexOf(D);
    let res, roll;
    if (entrance) { roll = die(6); res = ENTRANCE[roll - 1]; }
    else {
      roll = die(6) + die(6) + die(6);
      const r = LOWER[roll];
      res = typeof r === "string" ? { t: r, dv: D.dv } : { t: "ice", ice: r[col] };
    }
    const f = { id: uid(), t: res.t, dv: res.dv || null, ice: res.ice ? iceList(res.ice) : [], label: "", note: "", roll: `${entrance ? "1d6" : "3d6"}: ${roll}` };
    if (f.t === "control") f.label = pick(CONTROLS);
    if (f.t === "file") f.label = pick(FILES);
    return f;
  }
  // programmi e password già usciti si ritirano (stesso risultato della tabella)
  const floorKey = f => f.t === "ice" ? "ice:" + f.ice.map(i => i.ref).sort().join(",") : f.t === "password" ? "pw:" + f.dv : "";
  function rollUnique(diffId, entrance, seen) {
    let f;
    for (let i = 0; i < 30; i++) { f = rollFloor(diffId, entrance); const k = floorKey(f); if (!k || !seen.has(k)) break; }
    const k = floorKey(f); if (k) seen.add(k);
    return f;
  }
  // forma: 3d6 piani; d10 ≥ 7 = un bivio (si ritira finché esce); i bivi partono dopo il 2° piano del ramo
  // principale e il ramo principale resta il più lungo (un solo "fondo" dove lasciare il Virus)
  function shape(total, forks) {
    for (let nb = forks; nb > 0; nb--) {
      for (let a = 0; a < 200; a++) {
        const minMain = Math.max(4, Math.ceil(total / (nb + 1)) + 1);
        if (minMain > total - nb) break;
        const L = minMain + die(total - nb - minMain + 1) - 1;
        let rest = total - L;
        const lens = Array(nb).fill(1); rest -= nb;
        while (rest > 0) { lens[die(nb) - 1]++; rest--; }
        const forkAt = lens.map(m => L - 1 - m >= 2 ? 2 + die(L - 1 - m - 2 + 1) - 1 : null);
        if (forkAt.every(x => x !== null)) return { main: L, branches: lens.map((m, i) => ({ len: m, fork: forkAt[i] })).sort((x, y) => x.fork - y.fork) };
      }
    }
    return { main: total, branches: [] };
  }
  function generate(diffId = "standard", { demon = "auto", name = "" } = {}) {
    const D = diffOf(diffId);
    const r3 = [die(6), die(6), die(6)], total = r3[0] + r3[1] + r3[2];
    const forkRolls = []; let forks = 0;
    for (let i = 0; i < 6; i++) { const d = die(10); forkRolls.push(d); if (d >= 7) forks++; else break; }
    const S = shape(total, forks);
    const seen = new Set();
    const main = { id: uid(), fork: null, floors: [] };
    for (let i = 0; i < S.main; i++) main.floors.push(rollUnique(D.id, i < 2, seen));
    const branches = [main, ...S.branches.map(b => ({ id: uid(), fork: b.fork, floors: Array.from({ length: b.len }, () => rollUnique(D.id, false, seen)) }))];
    const nodes = branches.some(b => b.floors.some(f => f.t === "control"));
    const dId = demon === "auto" ? D.demon : demon;
    const demons = nodes && dId && dId !== "none" ? [{ id: uid(), ref: dId, cur: demonOf(dId).rez, note: "Gestisce i Nodi di Controllo" }] : [];
    const placed = S.branches.length;
    return {
      v: 1, name: name || `Architettura ${D.label}`, diff: D.id, branches, demons, notes: "", shared: false,
      gen: { floors: `3d6 = ${r3.join(" + ")} = ${total} piani`, forks: `d10: ${forkRolls.join(", ")} → ${forks} biv${forks === 1 ? "io" : "i"}${placed < forks ? ` (${placed} sistemat${placed === 1 ? "o" : "i"}: troppo pochi piani)` : ""}` },
    };
  }
  // un piano rigenerato con la tabella giusta per la sua profondità
  const rerollFloor = (diffId, depth) => rollFloor(diffId, depth <= 2);
  const emptyFloor = (t = "password", dv = null) => ({ id: uid(), t, dv, ice: [], label: "", note: "" });
  function blank(diffId = "standard") {
    const D = diffOf(diffId);
    return { v: 1, name: "", diff: D.id, branches: [{ id: uid(), fork: null, floors: [emptyFloor("password", D.dv), emptyFloor("file", D.dv), emptyFloor("ice")] }], demons: [], notes: "", shared: false };
  }
  // profondità di ogni piano: ramo principale 1…L, ramo che parte dopo il piano f → f+1…
  const depthOf = (branch, i) => (branch.fork ? +branch.fork : 0) + i + 1;
  const archFloors = A => (A.branches || []).flatMap((b, bi) => b.floors.map((f, i) => ({ f, b, bi, i, depth: depthOf(b, i) })));

  return {
    CLASSES, offensive, PROGRAMS, ICE, iceOf, iceLabel, allIce, allDemons, setHomebrew, homebrew, HARDWARE, ABILITIES, netActions, DECK_QUALITY,
    catalogOf, itemInfo, hasRez, curRez, deckSlots, boosts, autoDeck,
    DEMONS, demonOf, DIFFS, diffOf, FLOOR_TYPES, floorType, CONTROLS, FILES,
    generate, rerollFloor, emptyFloor, blank, depthOf, archFloors, uid,
  };
})();
