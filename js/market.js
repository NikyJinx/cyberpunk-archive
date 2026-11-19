// ============================================================
//  NIGHT CITY ARCHIVE — catalogo del Night Market (window.MK)
//  Armi, armature ed equipaggiamento: voci base, voci custom (meta "markethb")
//  e lettore del formato a blocchi per l'importazione.
//  Il cyberware resta in js/cyberware.js (CW); quello importato va nel cyberware custom.
// ============================================================
window.MK = (() => {
  const num = v => { const n = parseFloat(String(v ?? "").replace(/[.,](?=\d{3}(?!\d))/g, "").replace(",", ".")); return isNaN(n) ? 0 : n; };
  const norm = s => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\s+/g, " ").trim();

  // categorie di prezzo del manuale
  const PRICES = [["Cheap", 10], ["Everyday", 20], ["Costly", 50], ["Premium", 100], ["Expensive", 500], ["Very Expensive", 1000], ["Luxury", 5000], ["Super Luxury", 10000]];
  const priceCat = cost => { let c = PRICES[0][0]; PRICES.forEach(([l, v]) => { if (cost >= v) c = l; }); return c; };
  const TYPES = [["weapon", "Armi"], ["armor", "Armature"], ["gear", "Equipaggiamento"], ["cyber", "Cyberware"]];
  const QUALITY = [["poor", "Poor"], ["standard", "Standard"], ["excellent", "Excellent"]];

  // W(id, nome, categoria, costo, extra) · le statistiche mancanti vengono dalla categoria (CPR.WEAPON_TYPES)
  const W = (id, name, cat, cost, x = {}) => ({ id, type: "weapon", name, cat, cost, ...x });
  const A = (id, name, sp, pen, cost, desc) => ({ id, type: "armor", name, sp, pen, cost, desc });
  const G = (id, name, cost, desc, cat = "equip") => ({ id, type: "gear", name, cost, desc, gcat: cat });
  const GUN = "12 Days of Gunmas";
  const BASE = [
    // armi del manuale base
    W("w-mpistol", "Medium Pistol", "mpistol", 50, { conceal: true, hands: 1, desc: "Pistola semiautomatica standard." }),
    W("w-hpistol", "Heavy Pistol", "hpistol", 100, { conceal: true, hands: 1, desc: "Pistola di grosso calibro." }),
    W("w-vhpistol", "Very Heavy Pistol", "vhpistol", 100, { hands: 1, desc: "Pistola enorme: non si nasconde." }),
    W("w-smg", "SMG", "smg", 100, { conceal: true, hands: 1, desc: "Mitraglietta compatta. Autofire e fuoco di soppressione." }),
    W("w-hsmg", "Heavy SMG", "hsmg", 100, { hands: 1, desc: "Mitraglietta pesante. Autofire e fuoco di soppressione." }),
    W("w-shotgun", "Shotgun", "shotgun", 500, { hands: 2, desc: "Fucile a pompa: slug o pallettoni (Shotgun Shell)." }),
    W("w-ar", "Assault Rifle", "ar", 500, { hands: 2, desc: "Fucile d'assalto. Autofire e fuoco di soppressione." }),
    W("w-sniper", "Sniper Rifle", "sniper", 500, { hands: 2, desc: "Fucile di precisione per le lunghe distanze." }),
    W("w-bow", "Bow / Crossbow", "bow", 100, { hands: 2, desc: "Arco o balestra: frecce, si recuperano." }),
    W("w-gl", "Grenade Launcher", "gl", 500, { hands: 2, desc: "Lanciagranate: danno ad area." }),
    W("w-rl", "Rocket Launcher", "rl", 500, { hands: 2, desc: "Lanciarazzi: danno ad area." }),
    W("w-lmelee", "Light Melee Weapon", "lmelee", 50, { conceal: true, hands: 1, desc: "Coltello, tirapugni… Ignora metà della SP." }),
    W("w-mmelee", "Medium Melee Weapon", "mmelee", 50, { hands: 1, desc: "Mazza, machete… Ignora metà della SP." }),
    W("w-hmelee", "Heavy Melee Weapon", "hmelee", 100, { hands: 2, desc: "Katana, spranga… Ignora metà della SP." }),
    W("w-vhmelee", "Very Heavy Melee Weapon", "vhmelee", 500, { hands: 2, desc: "Motosega, mazza da demolizione… Ignora metà della SP." }),
    // 12 Days of Gunmas (armi esotiche)
    W("g-waa", "Arasaka WAA Bullpup Assault Weapon", "ar", 1000, { src: GUN, skill: "shoulderarms", dmg: "5d6", mag: 30, rof: 1, hands: 2, auto: 4, exotic: true,
      special: "Autofire (4) · Fuoco di soppressione · Smartgun Link · Può usare munizioni non base",
      desc: "Fucile d'assalto bullpup in dotazione ai soldati Arasaka negli anni 2020. Robusto, affidabile e predisposto per lo smartgun." }),
    W("g-multiammo", "Constitutional Arms Multi-Ammo Pistol", "vhpistol", 500, { src: GUN, dmg: "4d6", mag: 5, rof: 1, hands: 1, exotic: true,
      special: "Caricatore misto: fino a 5 tipi di munizioni da Very Heavy Pistol, scegli quale sparare a ogni colpo",
      desc: "Revolver con selettore rapido e display sotto la tacca di mira, per scegliere tra risposta letale e non letale." }),
    W("g-chainknife", "IMI Chainknife", "mmelee", 500, { src: GUN, dmg: "2d6", rof: 1, hands: 1, exotic: true,
      special: "Con un'Azione si avvia (e si spegne): avviato è una Very Heavy Melee Weapon di qualità Excellent, 4d6 e +1 a colpire, finché non la posi o la riponi",
      desc: "Sega da combattimento a forma di coltello da sopravvivenza, usata dal Mossad. Passa le armature come fossero garza." }),
    W("g-dragon", "Kendachi Dragon Flamethrower", "shotgun", 1000, { src: GUN, skill: "heavyweapons", dmg: "3d6", mag: 2, rof: 1, hands: 1, exotic: true, noAim: true, noCrit: true,
      special: "Solo munizioni Incendiary Shotgun Shell (stesso costo) · i bersagli incendiati subiscono 4 danni a fine turno finché non spendono un'Azione per spegnersi (sostituisce un fuoco più debole, non si somma) · niente Critical Injury né colpi mirati",
      desc: "Il lanciafiamme a mano preferito da tutti, un classico del 2020." }),
    W("g-hellbringer", "Magnum Opus Hellbringer", "vhpistol", 1000, { src: GUN, dmg: "5d6", mag: 3, rof: 1, hands: 1, exotic: true,
      special: "Con BODY sotto 10 si inceppa dopo ogni colpo: un'Azione per sbloccarla",
      desc: "Revolver enorme in titanio e acciaio, tre colpi e nessuna elettronica: ogni colpo deve contare." }),
    W("g-malorian", "Malorian Arms Sub-Flechette Gun", "hsmg", 5000, { src: GUN, dmg: "3d6", mag: 25, rof: 1, hands: 1, auto: 4, exotic: true, quality: "excellent", ablate: 4,
      special: "Autofire (4) · Fuoco di soppressione · Smartgun Link · Solo le sue munizioni Armor-Piercing (stesso costo delle AP): ablano l'armatura di 4 invece che di 1",
      desc: "Mitraglietta a flechette semi-bullpup con otturatore rotante. Le sue flechette passano ogni armatura in uso." }),
    W("g-crusher", "Militech Crusher", "vhpistol", 500, { src: GUN, dmg: "3d6", mag: 6, rof: 1, hands: 1, exotic: true,
      special: "Spara solo Shotgun Shell base",
      desc: "Shotgun grande come una pistola, nato nella seconda guerra centroamericana per il combattimento ravvicinato." }),
    W("g-ars5", "Mustang Arms ARS-5 Submachine Gun", "hsmg", 1000, { src: GUN, dmg: "3d6", mag: 40, rof: 1, hands: 1, auto: 3, exotic: true,
      special: "Autofire (3) · Fuoco di soppressione · Smartgun Link · Mirino a infrarossi · Mirino da cecchino",
      desc: "La mitraglietta delle giovani corporazioni e delle forze dell'ordine del 2020, ora ristampata." }),
    W("g-boltgun", "Nomad Pneumatic Bolt Gun", "sniper", 500, { src: GUN, skill: "shoulderarms", dmg: "4d6", mag: 8, rof: 1, hands: 2, exotic: true,
      special: "Spara frecce · Può usare munizioni non base",
      desc: "Arma ad aria compressa dei Nomadi con quattro canne rotanti. Serve a tormentare i guidatori e bucare gomme." }),
    W("g-cityhunter", "Nova Model 757 Cityhunter", "hpistol", 1000, { src: GUN, dmg: "3d6", mag: 18, rof: 2, hands: 1, conceal: true, exotic: true,
      special: "Smartgun Link · Può sparare Smart Ammunition · Munizioni proprie: 18 colpi al prezzo di 10",
      desc: "Revolver a munizioni senza bossolo (tround) con accenditore elettrico, sembra ancora nuovo." }),
    W("g-st5", "Stolbovoy ST-5 Assault Rifle", "ar", 100, { src: GUN, dmg: "5d6", mag: 20, rof: 1, hands: 2, auto: 4, exotic: true, quality: "poor",
      special: "Autofire (4) · Fuoco di soppressione · Inceppata: 50% che spari lo stesso (e si sblocca), altrimenti perdi l'Azione ma si sblocca · Può usare munizioni non base",
      desc: "Funziona con caldo, gelo, fango e sabbia: quasi tutti gli ST-5 sono ancora in servizio." }),
    W("g-teendreem", "Teen Dreem", "smg", 20, { src: GUN, dmg: "2d6", mag: 10, rof: 1, hands: 1, conceal: true, auto: 3, exotic: true, quality: "poor",
      special: "Autofire e soppressione con almeno 2 colpi, svuotano il caricatore · Dopo un autofire o una soppressione la canna si scioglie: arma distrutta",
      desc: "Reliquia pop degli anni 2020 per poser nostalgici. Attento a non scottarti." }),
    // armature
    A("a-leathers", "Leathers", 4, 0, 20, "Giacca e pantaloni di pelle pesante."),
    A("a-kevlar", "Kevlar", 7, 0, 50, "Tessuto antiproiettile, si porta sotto i vestiti."),
    A("a-lightjack", "Light Armorjack", 11, 0, 100, "Giacca imbottita con piastre leggere."),
    A("a-bodyweight", "Bodyweight Suit", 11, 0, 1000, "Tuta aderente: si indossa sotto i vestiti."),
    A("a-mediumjack", "Medium Armorjack", 12, -2, 500, "Piastre più spesse: −2 a REF, DEX e MOVE."),
    A("a-heavyjack", "Heavy Armorjack", 13, -2, 1000, "Armatura pesante: −2 a REF, DEX e MOVE."),
    A("a-flak", "Flak", 15, -4, 500, "Armatura militare: −4 a REF, DEX e MOVE."),
    A("a-metalgear", "Metalgear", 18, -4, 5000, "Armatura completa a piastre: −4 a REF, DEX e MOVE."),
    // equipaggiamento comune
    G("e-agent", "Agent", 100, "Smartphone con IA personale: chiamate, mappe, ricerche."),
    G("e-cellphone", "Telefono usa e getta", 50, "Cellulare economico, si butta dopo l'uso."),
    G("e-radio", "Radio Communicator", 100, "Ricetrasmittente a corto raggio (circa 1,6 km)."),
    G("e-flashlight", "Torcia", 20, "Illumina un cono di 100 m."),
    G("e-glowstick", "Glow Stick", 10, "Luce chimica per 4 ore."),
    G("e-rope", "Corda (60 m)", 20, "Corda di nylon."),
    G("e-ducttape", "Nastro americano", 20, "Ripara (quasi) tutto."),
    G("e-binoculars", "Binocolo", 50, "Ingrandisce ×6."),
    G("e-handcuffs", "Manette", 50, "Per tenere fermo qualcuno."),
    G("e-lockpick", "Grimaldelli", 20, "Kit per scassinare le serrature."),
    G("e-techtool", "Tech Tool", 100, "Attrezzi multiuso del Tech."),
    G("e-medbag", "Medtech Bag", 100, "Kit medico per le cure sul campo."),
    G("e-grapple", "Grapple Gun", 100, "Spara un rampino con 30 m di cavo."),
    G("e-shield", "Scudo antiproiettile", 100, "Scudo con 10 HP che si mette tra te e i colpi."),
  ];

  let HB = [];
  const setHomebrew = rec => { HB = ((rec && rec.items) || []).map(x => ({ ...x, custom: true })); };
  const all = () => { const ids = new Set(HB.map(x => x.id)); return [...BASE.filter(x => !ids.has(x.id)), ...HB]; };
  const byId = id => all().find(x => x.id === id) || null;

  // statistiche complete di un'arma (quelle mancanti dalla categoria)
  const weaponStats = it => {
    const T = (window.CPR && CPR.weaponType(it.cat)) || {};
    return { skill: it.skill || T.skill || "handgun", dmg: it.dmg || T.dmg || "", rof: it.rof || T.rof || 1, mag: it.mag ?? T.mag ?? "", auto: it.auto ?? T.auto ?? 0, hands: it.hands || 1 };
  };
  const qualityLabel = q => (QUALITY.find(x => x[0] === q) || [, ""])[1];
  // l'arma come va nella scheda (tab Combattimento)
  const toSheetWeapon = it => {
    const s = weaponStats(it), T = (window.CPR && CPR.weaponType(it.cat)) || {};
    const note = [it.quality && it.quality !== "standard" ? qualityLabel(it.quality) : "", it.exotic ? "Exotic" : "", it.special].filter(Boolean).join(" · ");
    return { cat: it.cat || "", name: it.name, skill: s.skill, dmg: s.dmg, rof: s.rof, mag: s.mag === "" ? "" : String(s.mag), ...(it.auto != null && it.auto !== T.auto ? { auto: it.auto } : {}),
      ...(it.quality && it.quality !== "standard" ? { quality: it.quality } : {}), note, market: it.id };
  };

  // ---------- formato a blocchi ----------
  // ## Nome            (anche «▶ Nome»)
  // Tipo: Arma | Armatura | Equipaggiamento | Cyberware
  // Chiave: valore     (una per riga; le righe senza chiave continuano il campo precedente)
  const KEYS = {
    type: ["tipo", "type"], cat: ["categoria", "category", "classe"], group: ["gruppo", "group"], skill: ["abilita", "skill", "weapon skill"],
    dmg: ["danno", "damage", "single shot damage"], mag: ["caricatore", "magazine", "standard magazine", "mag"], rof: ["rof", "rate of fire", "cadenza"],
    hands: ["mani", "hands", "hands required"], conceal: ["occultabile", "concealable", "can be concealed", "nascondibile"],
    cost: ["costo", "cost", "prezzo", "price"], quality: ["qualita", "quality"], auto: ["autofire"],
    special: ["speciale", "special", "special features", "alt. fire modes & special features", "funzioni speciali"],
    desc: ["descrizione", "description", "desc"], sp: ["sp", "stopping power"], pen: ["malus", "penalty", "penalita"],
    inst: ["installazione", "install", "installation"], pu: ["pu", "humanity loss", "perdita di umanita", "hl"],
    slots: ["slot", "slots"], req: ["richiede", "requires", "requisiti"], src: ["fonte", "source"], qty: ["quantita", "qty"],
  };
  const KEY_OF = {}; Object.entries(KEYS).forEach(([k, l]) => l.forEach(a => { KEY_OF[a] = k; }));
  const TYPE_OF = { arma: "weapon", armi: "weapon", weapon: "weapon", armatura: "armor", armor: "armor", armour: "armor",
    equipaggiamento: "gear", equip: "gear", gear: "gear", oggetto: "gear", item: "gear", cyberware: "cyber", cyber: "cyber", impianto: "cyber" };
  const yes = v => /^(si|sì|yes|y|true|1|x)$/i.test(String(v).trim());
  const findCat = v => {
    const n = norm(v).replace(/\(.*?\)/g, "").trim(); if (!n || !window.CPR) return "";
    const T = CPR.WEAPON_TYPES.find(t => t.id === n || norm(t.label) === n) || CPR.WEAPON_TYPES.find(t => n.includes(norm(t.label)));
    return T ? T.id : CPR.guessWeapon(n, "");
  };
  const findSkill = v => { const n = norm(v); if (!n || !window.CPR) return ""; const k = CPR.SKILLS.find(s => s.id === n || norm(s.label) === n || norm(s.label).replace(/[^a-z]/g, "") === n.replace(/[^a-z]/g, "")); return k ? k.id : ""; };
  const GROUP_ALIAS = { cyberoptics: "optics", cyberocchio: "optics", ottiche: "optics", cyberaudio: "audio", internal: "internal", interni: "internal", "impianti interni": "internal",
    external: "external", esterni: "external", "impianti esterni": "external", cyberarm: "arm", cyberbraccio: "arm", cyberleg: "leg", cybergamba: "leg", cyberlimbs: "limbcover", coperture: "limbcover" };
  const findGroup = v => {
    const n = norm(v); if (!n || !window.CW) return "";
    const g = CW.GROUPS.find(x => x.id === n || norm(x.label) === n) || CW.GROUPS.find(x => norm(x.label).startsWith(n) || n.startsWith(norm(x.label).split(" ")[0]));
    return g ? g.id : (GROUP_ALIAS[n] || "");
  };
  const slug = s => norm(s).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40);

  function parse(text) {
    const blocks = [], lines = String(text || "").replace(/\r/g, "").split("\n");
    let cur = null, last = null;
    lines.forEach((raw, i) => {
      const line = raw.trim();
      const head = line.match(/^(?:#{1,3}|▶|►|>)\s*(.+)$/);
      if (head) { cur = { name: head[1].trim(), f: {}, line: i + 1 }; blocks.push(cur); last = null; return; }
      if (!cur || !line) { if (!line) last = last === "desc" ? "desc" : null; return; }
      const m = line.match(/^([A-Za-zÀ-ÿ.&' ]{2,40}):\s*(.*)$/);
      const k = m && KEY_OF[norm(m[1])];
      if (k) { cur.f[k] = m[2].trim(); last = k; return; }
      // riga senza chiave: continua il campo precedente (o la descrizione)
      const into = last && ["desc", "special"].includes(last) ? last : "desc";
      cur.f[into] = [cur.f[into], line].filter(Boolean).join(" "); last = into;
    });
    const items = [], errors = [];
    blocks.forEach(b => {
      const f = b.f, err = msg => errors.push(`${b.name} (riga ${b.line}): ${msg}`);
      const type = TYPE_OF[norm(f.type)] || (f.sp ? "armor" : f.pu || f.group ? "cyber" : f.dmg || f.cat ? "weapon" : "");
      if (!type) return err("manca «Tipo:» (Arma, Armatura, Equipaggiamento o Cyberware)");
      const cost = num(f.cost); if (!f.cost) err("manca «Costo:», messo a 0");
      const base = { name: b.name, cost, desc: f.desc || "", ...(f.src ? { src: f.src } : {}) };
      if (type === "weapon") {
        const qWords = norm(f.quality);
        const cat = findCat(f.cat || b.name); if (!cat) return err(`categoria dell'arma non riconosciuta («${f.cat || ""}»): usa ad es. Heavy Pistol, SMG, Assault Rifle, Medium Melee Weapon`);
        const dmg = (f.dmg || "").replace(/\s+/g, "");
        if (dmg && !/^n\/?a$/i.test(dmg) && window.CPR && !CPR.parse(dmg)) return err(`danno non valido («${f.dmg}»)`);
        const autoM = (f.auto || f.special || "").match(/autofire\s*\(?\s*(\d+)/i) || (f.auto ? [0, f.auto] : null);
        items.push({ ...base, type, id: "mk-" + slug(b.name), cat, ...(findSkill(f.skill) ? { skill: findSkill(f.skill) } : {}),
          ...(dmg && !/^n\/?a$/i.test(dmg) ? { dmg } : {}), ...(num(f.mag) ? { mag: num(f.mag) } : {}), ...(num(f.rof) ? { rof: num(f.rof) } : {}),
          ...(num(f.hands) ? { hands: num(f.hands) } : {}), ...(f.conceal ? { conceal: yes(f.conceal) } : {}),
          ...(autoM && num(autoM[1]) ? { auto: num(autoM[1]) } : {}),
          ...(/poor/.test(qWords) ? { quality: "poor" } : /excellent|eccellente|high/.test(qWords) ? { quality: "excellent" } : {}),
          ...(/exotic|esotic/.test(qWords) || /exotic/i.test(f.cat || "") ? { exotic: true } : {}), ...(f.special ? { special: f.special } : {}) });
      } else if (type === "armor") {
        if (!num(f.sp)) return err("manca «SP:»");
        items.push({ ...base, type, id: "mk-" + slug(b.name), sp: num(f.sp), pen: -Math.abs(num(f.pen)) });
      } else if (type === "gear") {
        items.push({ ...base, type, id: "mk-" + slug(b.name), gcat: /veicol|vehicle/.test(norm(f.cat)) ? "veicoli" : "equip", ...(f.cat ? { label: f.cat } : {}) });
      } else {
        const g = findGroup(f.group || f.cat); if (!g) return err(`gruppo del cyberware non riconosciuto («${f.group || f.cat || ""}»): usa ad es. Neuralware, Cyberottiche, Impianti Interni`);
        const pu = String(f.pu || "");
        const dice = (pu.match(/\d+d\d+(?:\/2)?/i) || [""])[0], avg = pu.match(/\((\d+)\)/) ? num(pu.match(/\((\d+)\)/)[1]) : dice ? 0 : num(pu);
        const avgOf = d => { const m = d.match(/(\d+)d(\d+)/); if (!m) return 0; const a = +m[1] * (+m[2] + 1) / 2; return Math.ceil(/\/2$/.test(d) ? a / 2 : a); };
        items.push({ ...base, type, id: "cw-" + slug(b.name), g, inst: f.inst || "Clinica", cat: priceCat(cost), pu: avg || avgOf(dice), dice: dice || "N/A",
          slots: f.slots === "" || f.slots == null ? 1 : num(f.slots), req: f.req || "", fx: [] });
      }
    });
    return { items, errors, blocks: blocks.length };
  }

  // la voce di nuovo nel formato a blocchi (per modificarla)
  function toText(it) {
    const L = [`## ${it.name}`];
    const add = (k, v) => { if (v !== "" && v != null && v !== false) L.push(`${k}: ${v}`); };
    if (it.type === "weapon") {
      const T = (window.CPR && CPR.weaponType(it.cat)) || {};
      add("Tipo", "Arma"); add("Categoria", T.label || it.cat); add("Abilità", it.skill && window.CPR ? (CPR.skill(it.skill) || {}).label : "");
      add("Danno", it.dmg); add("Caricatore", it.mag); add("ROF", it.rof); add("Mani", it.hands); add("Occultabile", it.conceal ? "sì" : it.conceal === false ? "no" : "");
      add("Autofire", it.auto); add("Qualità", [it.exotic ? "Exotic" : "", it.quality ? qualityLabel(it.quality) : ""].filter(Boolean).join(", ")); add("Speciale", it.special);
    } else if (it.type === "armor") { add("Tipo", "Armatura"); add("SP", it.sp); add("Malus", it.pen ? Math.abs(it.pen) : ""); }
    else if (it.type === "gear") { add("Tipo", "Equipaggiamento"); add("Categoria", it.label || (it.gcat === "veicoli" ? "Veicolo" : "")); }
    else {
      add("Tipo", "Cyberware"); add("Gruppo", window.CW ? (CW.GROUPS.find(g => g.id === it.g) || {}).label : it.g); add("Installazione", it.inst);
      add("PU", it.dice && it.dice !== "N/A" ? `${it.dice} (${it.pu})` : it.pu); add("Slot", it.slots); add("Richiede", it.req);
    }
    add("Costo", it.cost); add("Fonte", it.src); add("Descrizione", it.desc);
    return L.join("\n");
  }
  const TEMPLATE = `## Magnum Opus Hellbringer
Tipo: Arma
Categoria: Very Heavy Pistol
Abilità: Handgun
Danno: 5d6
Caricatore: 3
ROF: 1
Mani: 1
Occultabile: no
Qualità: Exotic
Costo: 1000
Speciale: Si inceppa dopo ogni colpo se BODY < 10 (un'Azione per sbloccarla)
Descrizione: Revolver enorme in titanio, tre colpi e niente elettronica.

## Giubbotto rinforzato
Tipo: Armatura
SP: 12
Malus: 2
Costo: 500
Descrizione: Giacca con piastre in ceramica.

## Kit da scasso
Tipo: Equipaggiamento
Costo: 100
Descrizione: Grimaldelli elettronici e meccanici.

## Occhio da cecchino
Tipo: Cyberware
Gruppo: Cyberottiche
Installazione: Clinica
PU: 1d6 (3)
Slot: 1
Richiede: Cyberocchio
Costo: 500
Descrizione: +1 ai tiri oltre i 50 m.`;

  return { PRICES, priceCat, TYPES, QUALITY, qualityLabel, BASE, all, byId, setHomebrew, weaponStats, toSheetWeapon, parse, toText, TEMPLATE, norm };
})();
