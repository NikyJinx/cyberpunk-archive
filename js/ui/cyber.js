// ============================================================
//  NIGHT CITY ARCHIVE — tab Cyberware ed Equipaggiamento
//  (js/ui/: i file si caricano in ordine da index.html e condividono le costanti)
// ============================================================

// ---------- CYBERWARE & EQUIPAGGIAMENTO ----------
// Slot del corpo: col = colonna nella scheda (l = sinistra, r = destra, top/bottom = centro),
// zone = punto acceso sulla sagoma. "Destro" del personaggio = sinistra di chi guarda.
// max = quanta umanità MASSIMA toglie ogni impianto installato, se non specificato sull'impianto
// (regola base: 2; borgware 4; fashionware 0). Si può cambiare impianto per impianto.
const CYBER_SLOTS = [
  { id: "audio",      label: "Cyberaudio",          col: "top",    zone: "ears",    max: 2 },
  { id: "occhio_dx",  label: "Cyberocchio destro",  col: "l",      zone: "eye_r",   max: 2 },
  { id: "braccio_dx", label: "Cyberbraccio destro", col: "l",      zone: "arm_r",   max: 2 },
  { id: "esterni",    label: "Cyberware esterno",   col: "l",      zone: "skin",    max: 2 },
  { id: "gamba_dx",   label: "Cybergamba destra",   col: "l",      zone: "leg_r",   max: 2 },
  { id: "borgware",   label: "Borgware",            col: "l",      zone: "core",    max: 4 },
  { id: "occhio_sx",  label: "Cyberocchio sinistro", col: "r",     zone: "eye_l",   max: 2 },
  { id: "braccio_sx", label: "Cyberbraccio sinistro", col: "r",    zone: "arm_l",   max: 2 },
  { id: "interni",    label: "Cyberware interno",   col: "r",      zone: "torso",   max: 2 },
  { id: "gamba_sx",   label: "Cybergamba sinistra", col: "r",      zone: "leg_l",   max: 2 },
  { id: "fashion",    label: "Fashionware",         col: "r",      zone: "fashion", max: 0 },
  { id: "neural",     label: "Neuralware",          col: "bottom", zone: "brain",   max: 2 },
  { id: "alveolo",    label: "Alveolo (Chipware)",  col: "bottom", zone: "brain",   max: 2 },
  // non è un impianto: compare con gli Occhiali Intelligenti nell'inventario, 2 slot per opzioni da Cyberocchio,
  // niente umanità persa e le opzioni contano sempre come una coppia
  { id: "occhiali",   label: "Occhiali Intelligenti", col: "top",  zone: "",        max: 0, glasses: true, ext: true },
  { id: "guanto",     label: "Guanto",              col: "top",    zone: "",        max: 0, ext: true },
  { id: "orecchie",   label: "Smart Ears",          col: "top",    zone: "",        max: 0, ext: true },
];
// oggetti indossati con slot per opzioni (non impianti: niente umanità persa): quanti slot dà ciascuno
const EXT_HOLD = {
  occhiali: [[/occhiali intelligenti|smart\s*glasses/i, 2]],
  guanto: [[/guanto da battaglia|battleglove/i, 3], [/cyberdude smart glove/i, 2], [/xtra-dex smart glove/i, 2]],
  orecchie: [[/smart ears/i, 2]],
};
const extOwned = (e, slot) => ((e.gear && e.gear.items) || []).filter(it => num(it.qty || 1) > 0).map(it => ({ it, n: ((EXT_HOLD[slot] || []).find(([re]) => re.test(it.name || "")) || [])[1] })).filter(x => x.n);
const extSlots = (e, slot) => Math.max(0, ...extOwned(e, slot).map(x => x.n));
const hasExt = (e, slot) => extSlots(e, slot) > 0;
const isExtSlot = slot => !!EXT_HOLD[slot];
const isGlasses = it => EXT_HOLD.occhiali[0][0].test((it && it.name) || "");
const hasGlasses = e => hasExt(e, "occhiali");
const BODY_ZONES = [
  ["", "Nessuna"], ["brain", "Testa / cervello"], ["eye_r", "Occhio destro"], ["eye_l", "Occhio sinistro"], ["ears", "Orecchie"],
  ["skin", "Pelle / esterno"], ["fashion", "Pelle (fashion)"], ["torso", "Torso / interno"], ["core", "Centro del corpo"],
  ["arm_r", "Braccio destro"], ["arm_l", "Braccio sinistro"], ["leg_r", "Gamba destra"], ["leg_l", "Gamba sinistra"],
];
// slot base + slot personalizzati della scheda (alternati a sinistra e destra)
// e.cyber.hidden = slot standard rimossi da questa scheda
const hiddenSlots = e => (e.cyber && e.cyber.hidden) || [];
const slotsOf = e => [...CYBER_SLOTS.filter(s => !hiddenSlots(e).includes(s.id) && (!s.ext || hasExt(e, s.id) || ((((e.cyber || {}).slots || {})[s.id]) || []).length)).map(s => s.ext && hasExt(e, s.id) && s.id !== "occhiali" ? { ...s, label: extOwned(e, s.id).sort((a, b) => b.n - a.n)[0].it.name } : s), ...((e.cyber && e.cyber.extra) || []).map((x, i) => ({
  id: x.id, label: x.label || "Slot personalizzato", zone: x.zone || "", col: i % 2 ? "r" : "l",
  max: x.max === "" || x.max == null ? 2 : Number(x.max), custom: true,
}))];
const slotDef = (e, id) => slotsOf(e).find(s => s.id === id) || CYBER_SLOTS.find(s => s.id === id) || { id, label: id, col: "l", zone: "", max: 2 };
const hasVal = v => v !== "" && v != null;
const itemMax = (e, it) => hasVal(it.max) ? Number(it.max) : slotDef(e, it.slot).max;
const GEAR_CATS = [
  { id: "armi",     label: "Armi",            color: "var(--red)",     hint: "es. 3d6 · ROF 1 · Caricatore 8" },
  { id: "armature", label: "Armature",        color: "var(--cyan)",    hint: "es. SP 11 · Testa / Corpo" },
  { id: "equip",    label: "Equipaggiamento", color: "var(--yellow)",  hint: "es. Agente, kit medico, grimaldelli" },
  { id: "droghe",   label: "Droghe",          color: "#a98bff",   hint: "es. Synthcoke, 2 dosi" },
  { id: "netrun",   label: "Programmi e hardware", color: "var(--green)", hint: "per il cyberdeck: si installano dalla tab Cyberdeck o da qui" },
  { id: "cyber",    label: "Cyberware",       color: "var(--magenta)", hint: "es. impianto da installare, preso come bottino" },
  { id: "munizioni", label: "Munizioni",      color: "var(--orange, #ff9f1c)", hint: "colpi per calibro e tipo: si ricarica dalla tab Combattimento" },
  { id: "vestiti",  label: "Vestiti",         color: "#ff9ad5",   hint: "si indossano dalla tab Wardrobe (tipo e stile)" },
  { id: "veicoli",  label: "Veicoli",         color: "var(--magenta)", hint: "es. Supermoto potenziata" },
  { id: "altro",    label: "Altro",           color: "var(--muted)",   hint: "" },
];
const isPerson = e => e.kind === "npc" || e.kind === "pg";
const num = v => (v === "" || v == null || isNaN(Number(v))) ? 0 : Number(v);
const fmtEb = n => `${Math.round(n).toLocaleString("it-IT")} eb`;
const cyberItems = e => Object.entries((e.cyber && e.cyber.slots) || {}).flatMap(([slot, list]) => (list || []).map(it => isExtSlot(slot) ? { ...it, slot, ...(slot === "occhiali" ? { pair: true } : {}), ...(hasExt(e, slot) ? {} : { installed: false }) } : { ...it, slot }));
const cyberCount = e => cyberItems(e).filter(it => it.installed !== false && !isBaseItem(it)).length + baseCyber(e).length;
// cyberware fondamentale (Cyberocchio, Cyberbraccio, Cybergamba, Collegamento Neurale, Sistema Cyberudito):
// non è un impianto dello slot, si attiva sullo slot stesso · e.cyber.bases[slot] = { on, slots, cost, hl, max }
// Fashionware, Impianti Interni ed Esterni hanno solo il numero di slot (7, modificabile)
const slotKind = id => String(id).replace(/_(dx|sx)$/, "");
// ---------- FULL BODY CONVERSION (Going Metal) ----------
// e.cyber.fbc = { model (id del corpo in CW.FBC), hl (umanità persa per il pacchetto), bio (umanità persa per il Biosystem) }
// gli impianti con pkg: true sono la dotazione del corpo: la loro umanità è già nel pacchetto (ma tolgono umanità massima)
const fbcOf = e => { const f = (e && e.cyber && e.cyber.fbc) || null; if (!f || !f.model) return null; const B = CW.fbcBody(f.model); return B ? { ...f, B, F: CW.FRAMES[B.frame] } : null; };
// parti del corpo FBC: cyberbraccia, cybergambe, cyberudito, collegamento neurale e (se il corpo li ha) i cyberocchi
const fbcPart = (e, kind) => { const f = fbcOf(e); return !!f && ["braccio", "gamba", "audio", "neural"].concat(f.B.eyes === 2 ? ["occhio"] : []).includes(kind); };
const FBC_X2 = ["occhio", "braccio", "gamba", "neural", "audio", "interni", "esterni"];
// umanità persa e massima tolta di un impianto: in una FBC le parti del corpo non costano umanità, la dotazione l'ha già nel pacchetto
const itemHl = (e, it) => { const c = CW.byId(it.ref) || CW.byName(it.name); return fbcOf(e) && (it.pkg || (c && CW.FBC_NOHL.includes(c.id))) ? 0 : num(it.hl); };
const itemMaxF = (e, it) => { const c = CW.byId(it.ref) || CW.byName(it.name); return fbcOf(e) && c && CW.FBC_NOHL.includes(c.id) ? 0 : itemMax(e, it); };
const isBaseItem = it => { const c = CW.byId(it.ref) || CW.byName(it.name); return !!(c && c.base); };
function baseState(e, slotId, raw = false) {
  const b = baseStateRaw(e, slotId); if (!b || raw || !fbcOf(e)) return b;
  const kind = slotKind(slotId), x2 = FBC_X2.includes(kind) ? 2 : 1;
  if (b.fixed) return x2 > 1 ? { ...b, slots: b.slots * x2, std: b.std * x2, fbc: true } : b;
  if (fbcPart(e, kind)) return { ...b, on: true, stored: false, hl: 0, max: 0, cost: 0, slots: b.slots * x2, std: b.std * x2, fbc: true };
  return b;
}
function baseStateRaw(e, slotId) {
  const kind = slotKind(slotId), B = SLOT_BASE[kind], F = isExtSlot(kind) ? extSlots(e, kind) || SLOT_FIXED[kind] : SLOT_FIXED[kind];
  if (!B && !F) return null;
  const saved = ((e.cyber || {}).bases || {})[slotId];
  if (F) return { fixed: true, on: true, slots: saved && hasVal(saved.slots) ? num(saved.slots) : F, std: F };
  // vref = variante della base (Neo-Soviet Cyberarm, Discount Cyberaudio Suite): nome, slot standard e dadi della PU suoi
  const V = saved && saved.vref ? CW.byId(saved.vref) : null, c = V || CW.byId(B[0]) || { cost: 0, pu: 0 }, std = V ? num(V.bslots) : B[1];
  const pick = (v, d) => hasVal(v) ? num(v) : d;
  if (saved) return { on: !!saved.on, stored: !saved.on && !!saved.stored, slots: pick(saved.slots, std), std, cost: pick(saved.cost, c.cost), hl: pick(saved.hl, c.pu), max: pick(saved.max, 2), name: V ? V.name : B[2], ref: V ? V.id : B[0], kind,
    ...(V ? { vref: V.id } : {}), ...(num(saved.budget) ? { budget: num(saved.budget) } : {}) };
  // schede vecchie: la base era inserita come impianto dentro lo slot
  const old = (((e.cyber || {}).slots || {})[slotId] || []).find(it => isBaseItem(it) && it.installed !== false);
  return { on: !!old, slots: B[1], std: B[1], cost: old && hasVal(old.cost) ? num(old.cost) : c.cost, hl: old && hasVal(old.hl) ? num(old.hl) : c.pu, max: old && hasVal(old.max) ? num(old.max) : 2, name: B[2], ref: B[0], kind, legacy: !!old };
}
const baseCyber = e => slotsOf(e).map(sl => ({ slot: sl.id, b: baseState(e, sl.id) })).filter(x => x.b && !x.b.fixed && x.b.on);
const gearItems = e => (e.gear && e.gear.items) || [];
// SP e malus di un'armatura dell'inventario: dai suoi campi, dal Night Market, dal nome o dai dettagli («SP 11»)
function armorInfo(it) {
  const mk = window.MK ? MK.all().find(x => x.type === "armor" && norm2(x.name) === norm2(it.name)) : null;
  const T = CPR.ARMOR_TYPES.find(t => t.sp && norm2(t.label) === norm2(it.name));
  const m = String(it.detail || "").match(/SP\s*(\d+)/i);
  // upgrade: +1 SP sull'armatura (it.up)
  const sp = (num(it.sp) || (mk && mk.sp) || (T && T.sp) || (m ? +m[1] : 0)) + num(it.up);
  const pen = hasVal(it.pen) ? num(it.pen) : mk ? num(mk.pen) : T ? T.pen : 0;
  const both = !!(it.both || (mk && mk.both) || it.loc === "both");
  // zone dove si può indossare: quella scelta all'acquisto; senza zona (oggetti vecchi o scritti a mano) testa o corpo
  return { name: it.name, sp, pen, ...(mk && mk.penBy ? { penBy: mk.penBy } : {}), type: T ? T.id : "custom", both, locs: both ? ["head", "body"] : it.loc === "head" || it.loc === "body" ? [it.loc] : ["head", "body"], fixed: both || it.loc === "head" || it.loc === "body" };
}
const ARMOR_LOC = { head: "testa", body: "corpo", both: "testa e corpo" };
// quali zone occupa ogni armatura dell'inventario (gi → zone) e le armature indossate che nell'inventario non ci sono
function armorWorn(e) {
  const ar = sheetOf(e).armor || {}, worn = ["head", "body"].filter(l => (ar[l] || {}).name || num((ar[l] || {}).sp)), on = {};
  const inv = armorItems(e), take = (x, l) => { (on[x.gi] = on[x.gi] || []).push(l); worn.splice(worn.indexOf(l), 1); };
  // prima quelle con la zona fissa, poi le altre (una copia per zona)
  [...inv.filter(x => armorInfo(x.it).fixed), ...inv.filter(x => !armorInfo(x.it).fixed)].forEach(x => {
    const A = armorInfo(x.it), max = A.fixed ? 2 : Math.max(1, num(x.it.qty));
    A.locs.forEach(l => { if (worn.includes(l) && (on[x.gi] || []).length < max && norm2(ar[l].name) === norm2(x.it.name)) take(x, l); });
  });
  return { on, rest: worn.map(l => ({ l, a: ar[l] })) };
}
const armorItems = e => gearItems(e).map((it, gi) => ({ it, gi })).filter(x => (x.it.cat || "altro") === "armature");
// un'armatura senza zona (comprata prima o scritta a mano) la prende la prima volta che si indossa:
// da lì in poi va solo lì. Con più copie se ne separa una.
function gearWithLoc(e, gi, loc) {
  const g = JSON.parse(JSON.stringify(e.gear || {})), it = (g.items || [])[gi]; if (!it || armorInfo(it).fixed) return e.gear;
  const n = Math.max(1, num(it.qty));
  if (n > 1) { it.qty = n - 1; g.items.splice(gi + 1, 0, { ...it, qty: 1, loc, detail: [it.detail, `per ${ARMOR_LOC[loc]}`].filter(Boolean).join(" · ") }); }
  else { it.loc = loc; it.detail = [it.detail, `per ${ARMOR_LOC[loc]}`].filter(Boolean).join(" · "); }
  return g;
}
function wearArmor(id, gi, loc) {
  const e = state.entries.find(x => x.id === id), it = e && gearItems(e)[gi]; if (!it || !Store.canEdit()) return;
  const A = armorInfo(it), locs = A.both ? ["head", "body"] : A.fixed ? A.locs : [loc];
  if (!A.sp) return toast("Questa armatura non ha la SP: scrivila nei dettagli (es. «SP 11») da Modifica equipaggiamento", "err");
  if (!A.fixed) upsert(state.entries, { ...e, gear: gearWithLoc(e, gi, loc) });
  sheetPatch(id, s => { s.armor = s.armor || {};
    // una tuta intera tolta da una zona si toglie anche dall'altra
    locs.forEach(l => { const old = s.armor[l], o = old && armorItems(e).find(x => norm2(x.it.name) === norm2(old.name));
      if (o && armorInfo(o.it).both) ["head", "body"].forEach(z => { if (s.armor[z] && norm2(s.armor[z].name) === norm2(old.name)) delete s.armor[z]; }); });
    locs.forEach(l => { s.armor[l] = { name: it.name, sp: A.sp, cur: A.sp, type: A.type, pen: A.pen, ...(A.penBy ? { penBy: A.penBy } : {}) }; }); return s; });
  toast(`${it.name} indossata (${A.both ? "testa e corpo" : ARMOR_LOC[locs[0]]})`, "ok");
}
// upgrade dell'armatura: +1 SP (anche su quella indossata, SP attuale compresa)
function armorUp(id, gi, d) {
  const e = state.entries.find(x => x.id === id), it = e && gearItems(e)[gi]; if (!it || !Store.canEdit()) return;
  const on = armorWorn(e).on[gi] || [];
  entryPatch(id, x => {
    const g = x.gear.items[gi]; if (!g) return null;
    g.up = Math.max(0, Math.min(1, num(g.up) + d)); if (!g.up) delete g.up;
    const ar = (x.sheet = x.sheet || {}).armor = x.sheet.armor || {};
    on.forEach(l => { const a = ar[l]; if (!a) return; a.sp = Math.max(0, num(a.sp) + d); a.cur = Math.max(0, Math.min(a.sp, (hasVal(a.cur) ? num(a.cur) : num(a.sp) - d) + d)); });
    return x;
  }, d > 0 ? `${it.name}: upgrade, SP ${armorInfo(it).sp + 1}` : `${it.name}: upgrade tolto, SP ${armorInfo(it).sp - 1}`);
}
// upgrade del cyberware che fa da armatura (Armatura Subdermale, Skin Weave…): +1 SP sottopelle, anche quella attuale
const cyUpBtn = (id, slot, i, it) => `<button type="button" class="btn ghost small g-act" data-action="cy-up" data-id="${id}" data-slot="${esc(slot)}" data-i="${i}" data-d="${num(it.up) ? -1 : 1}" title="${num(it.up) ? "Toglie l'upgrade: −1 SP" : "Impianto migliorato: +1 SP"}">${num(it.up) ? "⬇ Togli upgrade" : "⬆ Upgrade +1 SP"}</button>`;
function cyUp(id, slot, i, d) {
  const e = state.entries.find(x => x.id === id), it = e && ((((e.cyber || {}).slots || {})[slot]) || [])[i]; if (!it || !Store.canEdit()) return;
  entryPatch(id, x => {
    const I = (((x.cyber || {}).slots || {})[slot] || [])[i]; if (!I) return null;
    I.up = Math.max(0, Math.min(1, num(I.up) + d)); if (!I.up) delete I.up;
    // la SP attuale sottopelle (se segnata) sale o scende con l'upgrade
    const sk = (x.sheet || {}).skin; if (sk) ["head", "body"].forEach(l => { if (hasVal(sk[l])) sk[l] = Math.max(0, num(sk[l]) + d); });
    return x;
  }, `${it.name}: ${d > 0 ? "upgrade, +1 SP" : "upgrade tolto, −1 SP"}`);
}
function takeOffArmor(id, locs) {
  if (!Store.canEdit()) return;
  sheetPatch(id, s => { s.armor = s.armor || {}; locs.forEach(l => { delete s.armor[l]; }); return s; });
}

function cyberStats(e) {
  // disinstallato (stored): fuori dal corpo, niente effetti né umanità massima tolta, ma l'umanità persa resta (si recupera solo con la terapia)
  const all = cyberItems(e).filter(it => !isBaseItem(it)), inst = all.filter(it => it.installed !== false);
  const plan = all.filter(it => it.installed === false && !it.stored && it.slot !== "idle"), stored = all.filter(it => it.installed === false && it.stored);
  const bases = baseCyber(e), storedBases = slotsOf(e).map(sl => baseState(e, sl.id)).filter(b => b && !b.fixed && b.stored);
  const fb = fbcOf(e), fbHl = fb ? num(fb.hl) + num(fb.bio) : 0;
  const cost = inst.reduce((t, it) => t + num(it.cost), 0) + bases.reduce((t, x) => t + x.b.cost, 0) + (fb ? fb.B.cost + 10000 : 0);
  const hl = inst.filter(it => !isExtSlot(it.slot)).reduce((t, it) => t + itemHl(e, it), 0) + bases.reduce((t, x) => t + x.b.hl, 0)
    + stored.reduce((t, it) => t + num(it.hl), 0) + storedBases.reduce((t, b) => t + b.hl, 0) + fbHl;
  // il Biosystem è Borgware: toglie 4 di umanità massima
  const maxLoss = inst.reduce((t, it) => t + itemMaxF(e, it), 0) + bases.reduce((t, x) => t + x.b.max, 0) + (fb ? 4 : 0);
  const start = e.cyber && hasVal(e.cyber.humanity) ? num(e.cyber.humanity) : null;
  const therapy = e.cyber ? num(e.cyber.therapy) : 0;          // umanità recuperata con la terapia
  const maxUp = e.cyber ? num(e.cyber.maxUp) : 0;              // umanità massima in più concessa dal GM (homebrew)
  const max = start == null ? null : start - maxLoss + maxUp;
  // la terapia restituisce umanità, ma l'attuale non può mai superare la massima
  const current = start == null ? null : Math.min(start - hl + therapy, max);
  return { inst, plan, stored, bases, cost, hl, maxLoss, maxUp, therapy, planCost: plan.reduce((t, it) => t + num(it.cost), 0), start, max, current };
}

// sagoma olografica: limbi = linee spesse semi-trasparenti + linea centrale
const BODY_SVG = `
  <svg class="cy-body" viewBox="0 0 200 440" aria-hidden="true">
    <defs><radialGradient id="cyglow" cx="50%" cy="40%" r="60%"><stop offset="0" stop-color="rgba(0,240,255,.25)"/><stop offset="1" stop-color="rgba(0,240,255,0)"/></radialGradient></defs>
    <ellipse cx="100" cy="200" rx="95" ry="190" fill="url(#cyglow)"/>
    <ellipse class="cy-ring" cx="100" cy="425" rx="62" ry="9"/>
    <ellipse class="cy-ring r2" cx="100" cy="425" rx="40" ry="5"/>
    <g class="cy-limb">
      <path d="M88 70 L88 84 M112 70 L112 84"/>
      <path d="M70 92 L56 160 L46 236"/><path d="M130 92 L144 160 L154 236"/>
      <path d="M88 214 L84 318 L80 412"/><path d="M112 214 L116 318 L120 412"/>
    </g>
    <g class="cy-line">
      <ellipse cx="100" cy="42" rx="21" ry="26"/>
      <path d="M70 88 Q100 78 130 88 L136 150 Q130 196 122 216 L78 216 Q70 196 64 150 Z"/>
      <path d="M70 92 L56 160 L46 236"/><path d="M130 92 L144 160 L154 236"/>
      <path d="M88 214 L84 318 L80 412"/><path d="M112 214 L116 318 L120 412"/>
      <path d="M100 90 L100 210 M78 120 Q100 130 122 120 M80 150 Q100 158 120 150" class="thin"/>
    </g>
    ${[["brain", 100, 24], ["eye_r", 91, 40], ["eye_l", 109, 40], ["ears", 100, 48], ["fashion", 118, 104], ["skin", 64, 128],
       ["torso", 100, 136], ["core", 100, 190], ["arm_r", 54, 172], ["arm_l", 146, 172], ["leg_r", 85, 320], ["leg_l", 115, 320]]
      .map(([z, x, y]) => `<g class="cy-zone" data-zone="${z}" transform="translate(${x} ${y})"><circle class="cy-ping" r="9"/><circle class="cy-dot" r="3.2"/></g>`).join("")}
  </svg>`;

// slot opzioni di ogni parte del corpo: Cyberocchio 3, Cyberbraccio 4, Cybergamba 3, Collegamento Neurale 5,
// Sistema Cyberudito 3; Fashionware, Impianti Interni ed Esterni 7.
// Alveolo: si attiva sul suo slot e tiene 1 chip (Chip di Memoria, Chip Abilità, Antidolorifico…); gli slot si aumentano
// installando altri Alveoli. Ogni slot dell'Alveolo occupa uno slot del Collegamento Neurale.
const SLOT_BASE = { occhio: ["cybereye", 3, "Cyberocchio"], braccio: ["cyberarm", 4, "Cyberbraccio"], gamba: ["cyberleg", 3, "Cybergamba"], neural: ["neurallink", 5, "Collegamento Neurale"], audio: ["cyberaudio", 3, "Sistema Cyberudito"], alveolo: ["chipslot", 1, "Alveolo"] };
const SLOT_FIXED = { fashion: 7, interni: 7, esterni: 7, occhiali: 2, guanto: 3, orecchie: 2 };
function slotUse(slotId, items, base, extra = 0) {
  if (!base) return null;
  const kind = slotKind(slotId), limb = kind === "braccio" || kind === "gamba", alv = kind === "alveolo";
  const opts = (items || []).filter(it => it.installed !== false && it.name).map(it => CW.byId(it.ref) || CW.byName(it.name)).filter(c => !(c && (c.base || (c.chip && !alv))));
  const used = opts.reduce((t, c) => t + (alv || !c ? 1 : num(c.slots)), 0) + extra;
  // senza l'arto artificiale c'è posto solo per un'opzione «installabile su un arto di carne»
  const cap = base.fixed || base.on ? base.slots : limb ? 1 : 0;
  const missing = !base.fixed && !base.on && used && !limb ? base.name : "";
  return { used, cap, over: used > cap, missing, base: base.name || "", hasBase: base.fixed || base.on, label: alv ? "chip" : "opzioni", extra };
}
const slotUseHtml = u => !u || (!u.used && !u.hasBase) ? "" : `<span class="cy-cap ${u.over || u.missing ? "over" : ""}" title="Slot opzioni usati / disponibili${u.base && !u.hasBase ? ` (senza ${u.base})` : ""}">${u.missing ? `⚠ manca ${/^[aeiou]/i.test(u.missing) ? "l'" : "il "}${esc(u.missing)}` : `${u.label || "opzioni"} ${u.used}/${u.cap}${u.over ? " ⚠" : ""}`}</span>`;
// slot dell'Alveolo attivo (occupano il Collegamento Neurale)
const alveoloSlots = e => { const b = baseState(e, "alveolo"); return b && b.on ? b.slots : 0; };
// chip installato ma oltre il numero di Alveoli (contati nell'ordine della scheda)
function chipOff(e, it) {
  const c = CW.byId(it.ref) || CW.byName(it.name); if (!c || !c.chip || it.installed === false) return false;
  const chips = cyberItems(e).filter(x => x.installed !== false && (CW.byId(x.ref) || CW.byName(x.name) || {}).chip);
  const i = chips.findIndex(x => x.slot === it.slot && x.name === it.name && x.ref === it.ref);
  return i >= alveoliOf(e);
}
function slotCard(e, s) {
  const items = ((e.cyber && e.cyber.slots && e.cyber.slots[s.id]) || []).map((it, k) => ({ ...it, slot: s.id, k })).filter(it => !isBaseItem(it)), canOut = Store.canEdit();
  const inst = items.filter(it => it.installed !== false), b = baseState(e, s.id), bOn = b && !b.fixed && b.on;
  const sumC = inst.reduce((t, it) => t + num(it.cost), 0) + (bOn ? b.cost : 0), sumH = inst.reduce((t, it) => t + itemHl(e, it), 0) + (bOn ? b.hl : 0);
  return `
    <section class="cy-slot ${inst.length || bOn ? "has" : ""} ${items.length || bOn ? "" : "vacant"} ${s.custom ? "custom" : ""}" data-zone="${s.zone}">
      <header><span class="cy-title">${esc(s.label)}</span>${s.ext ? (hasExt(e, s.id) ? `<span class="cy-cap" title="Non è un impianto: niente umanità${s.glasses ? ", le opzioni contano come una coppia" : ""}">esterno</span>` : `<span class="cy-cap over" title="L'oggetto non è nell'inventario: le opzioni non hanno effetto">⚠ non nell'inventario</span>`) : ""}${slotUseHtml(slotUse(s.id, items, b, s.id === "neural" ? alveoloSlots(e) : 0))}
        ${inst.length || bOn ? `<span class="cy-sum">${fmtEb(sumC)} · ${sumH} HL</span>` : ""}</header>
      ${b && !b.fixed && b.fbc ? `<div class="cy-base on fbc-part" title="Parte del corpo FBC: niente umanità persa, slot opzioni raddoppiati">◆ <b>${esc(b.name)}</b> · ${b.slots} slot <small>parte del corpo FBC · 0 HL</small></div>`
        : b && !b.fixed ? `<div class="cy-base ${b.on ? "on" : ""}" title="Cyberware fondamentale: si attiva sullo slot">${b.on ? `◆ <b>${esc(b.name)}</b> · ${b.slots} slot${b.slots !== b.std ? ` (standard ${b.std})` : ""} <small>${b.cost.toLocaleString("it-IT")} eb · ${b.hl} HL · −${b.max}</small>` : b.stored ? `⬚ ${esc(b.name)} disinstallato <small>(in Equipaggiamento · ${b.hl} HL restano)</small>` : `○ ${esc(b.name)} non installato${slotKind(s.id) === "braccio" || slotKind(s.id) === "gamba" ? " <small>(arto di carne: 1 opzione)</small>" : ""}`}</div>`
        : b && b.slots !== b.std ? `<div class="cy-base on"><small>${b.slots} slot opzioni (standard ${b.std})</small></div>` : ""}
      ${items.length ? `<ul>${items.map(it => {
        const m = itemMaxF(e, it), changed = hasVal(it.max) && Number(it.max) !== s.max, fbHl = fbcOf(e) && (it.pkg || itemHl(e, it) !== num(it.hl));
        return `
        <li class="${it.installed === false ? (it.stored ? "planned stored" : "planned") : ""}" ${it.note || cwOf(it) ? `title="${esc([(cwOf(it) || {}).desc, it.note].filter(Boolean).join(" · "))}"` : ""}>
          <span class="cy-chk" aria-label="${it.installed === false ? (it.stored ? "disinstallato" : "pianificato") : "installato"}">${it.installed === false ? (it.stored ? "⬚" : "◇") : "◆"}</span>
          <span class="cy-name">${esc(it.name)}${canOut && (it.installed !== false || it.stored) ? `<button type="button" class="gp-btn cy-out" data-action="gear-cy" data-id="${esc(e.id)}" data-op="out" data-slot="${esc(s.id)}" data-i="${it.k}" title="Disinstalla: va in idle, poi lo installi in uno slot adatto">⇩</button>` : ""}${chipOff(e, it) ? ` <i class="cy-off" title="Non c'è posto nell'Alveolo: il chip non è montato e non ha effetto. Aumenta gli slot dell'Alveolo o installane un altro.">⚠ ${alveoliOf(e) ? "Alveolo pieno" : "senza Alveolo"}</i>` : ""}${cwOf(it) && (cwOf(it).fx || []).length ? ` <i class="gl-fx" title="Effetto applicato ai tiri">⚡</i>` : ""}${it.ref === "skillchip" && it.param ? ` <small>${esc((CPR.skill(it.param) || {}).label || "")} ${+it.lvl === 4 ? 4 : 3}</small>` : ""}${it.note ? `<small>${esc(it.note)}</small>` : ""}</span>
          <span class="cy-cost">${hasVal(it.cost) ? esc(num(it.cost).toLocaleString("it-IT")) : "—"}</span>
          <span class="cy-hl" ${fbHl ? `title="${it.pkg ? "Dotazione del corpo FBC: l'umanità è nel pacchetto" : "Parte del corpo FBC: niente umanità persa"}"` : ""}>${fbHl ? (it.pkg ? "📦" : "0") : hasVal(it.hl) ? esc(it.hl) : "—"}</span>
          <span class="cy-max ${changed ? "changed" : ""}" title="Umanità massima tolta${changed ? " (modificata, standard " + s.max + ")" : ""}">${m ? "−" + m : "0"}</span>
        </li>`; }).join("")}</ul>` : bOn ? "" : `<div class="cy-free">— slot libero —</div>`}
    </section>`;
}

// ---------- IDLE: cyberware comprato o tolto, non installato ----------
// cyber.slots.idle = [{ name, ref, cost, hl, installed: false, fresh (mai montato: l'umanità si perde quando si installa) | stored, from }]
const idleCyber = e => ((((e.cyber || {}).slots || {}).idle) || []).filter(it => it && it.name);
function idleHtml(e) {
  const list = idleCyber(e), edit = Store.canEdit(), id = esc(e.id); if (!list.length) return "";
  return `<section class="cy-idle"><header><span class="cy-title">⏸ Idle</span><span class="hint">non installato: niente effetti${list.some(it => it.fresh) ? " · l'umanità si perde quando lo installi" : ""} · va negli slot adatti</span></header>
    <ul>${list.map((it, i) => `<li><span class="cy-name">${esc(it.name)}${it.from ? ` <small>tolto da ${esc(slotDef(e, it.from).label)}</small>` : ""}${it.ref === "skillchip" && it.param ? ` <small>${esc((CPR.skill(it.param) || {}).label || "")} ${+it.lvl === 4 ? 4 : 3}</small>` : ""}</span>
      <span class="cy-cost">${hasVal(it.cost) ? esc(num(it.cost).toLocaleString("it-IT")) : "—"}</span><span class="cy-hl" title="${it.fresh ? "Umanità che perderai installandolo" : "Umanità già persa"}">${hasVal(it.hl) ? esc(it.hl) : "—"}${it.fresh ? "*" : ""}</span>
      ${edit ? `<button type="button" class="btn ghost small g-act" data-action="cy-install" data-id="${id}" data-i="${i}">⇧ Installa</button>` : ""}</li>`).join("")}</ul></section>`;
}
// installa dall'idle: si sceglie lo slot (prima quelli adatti), e per un pezzo nuovo l'umanità persa
function cyInstall(id, i) {
  const e = state.entries.find(x => x.id === id), it = e && idleCyber(e)[i]; if (!it || !Store.canEdit()) return;
  // solo gli slot adatti al pezzo (un'opzione del braccio: braccio dx, sx o guanto); un pezzo fuori catalogo va ovunque
  const c = CW.byId(it.ref) || CW.byName(it.name), { fit, other } = c ? mkCySlots(e, c) : { fit: slotsOf(e), other: [] };
  const okSlot = s => { const u = slotUse(s.id, [...((((e.cyber || {}).slots || {})[s.id]) || []), { name: it.name, ref: it.ref }], baseState(e, s.id)); return !u || (!u.missing && !u.over); };
  const fitOk = [...fit].sort((a, b) => okSlot(b) - okSlot(a)), pick = (fitOk.find(s => s.id === it.from && okSlot(s)) || fitOk.find(okSlot) || fitOk[0] || {}).id;
  const opt = s => `<option value="${esc(s.id)}" ${s.id === pick ? "selected" : ""}>${esc(s.label)}${okSlot(s) ? "" : " (non c'è posto)"}</option>`;
  openModal(`<form class="form" id="cy-inst">
    <div class="modal-head"><h2>// INSTALLA · ${esc(it.name)}</h2><button type="button" class="x" data-action="close" aria-label="Chiudi">×</button></div>
    <div class="modal-body"><div class="fields">
      <div class="field full"><label for="ci-slot">Slot</label><select id="ci-slot" name="slot">${fitOk.map(opt).join("")}</select>${c && other.length ? `<span class="hint">Solo dove può stare: ${esc(fitOk.map(s => s.label).join(", "))}.</span>` : ""}</div>
      ${it.fresh ? `<div class="field"><label for="ci-hl">Umanità persa (HL)</label><div class="mk-hl"><input id="ci-hl" name="hl" type="number" min="0" value="${esc(num(it.hl))}">${c && c.dice && c.dice !== "N/A" ? `<button type="button" class="gp-btn" data-ci-pu title="Tira ${esc(c.dice)}">⚄</button>` : ""}</div><span class="hint">${c && c.dice && c.dice !== "N/A" ? `${esc(c.dice)}, media ${c.pu}` : "si perde ora, all'installazione"}</span></div>` : `<p class="hint field full">L'umanità di questo pezzo è già stata persa quando l'hai installato la prima volta.</p>`}
      <p class="mk-warn field full" data-ci-cap></p>
    </div></div>
    <div class="modal-foot"><button type="button" class="btn ghost" data-action="close">Annulla</button><button class="btn cyan" type="submit">Installa</button></div>
  </form>`, true);
  const form = $("#cy-inst"), cap = () => {
    const sl = form.elements.slot.value, u = slotUse(sl, [...((((e.cyber || {}).slots || {})[sl]) || []), { name: it.name, ref: it.ref }], baseState(e, sl));
    $("[data-ci-cap]", form).textContent = !u ? "" : u.missing ? `Manca ${u.missing}: attivalo prima.` : u.over ? `Slot pieno: ${u.label} ${u.used}/${u.cap}.` : `${u.label === "chip" ? "Chip" : "Opzioni"} dopo l'installazione: ${u.used}/${u.cap}.`;
  };
  cap(); form.elements.slot.addEventListener("change", cap);
  const pu = $("[data-ci-pu]", form); pu && pu.addEventListener("click", () => { const r = CW.rollPu(c); form.elements.hl.value = r.total; toast(`Umanità persa: ${r.total}${r.dice.length ? ` (${r.dice.join(" + ")})` : ""}`); });
  form.addEventListener("submit", ev => {
    ev.preventDefault();
    const slot = form.elements.slot.value, hl = form.elements.hl ? num(form.elements.hl.value) : num(it.hl);
    cyberPatch(id, cy => {
      const idle = cy.slots.idle || [], x = idle[i]; if (!x) return cy;
      idle.splice(i, 1); if (!idle.length) delete cy.slots.idle;
      const { fresh, stored, from, withBase, ...keep } = x;
      cy.slots[slot] = [...(cy.slots[slot] || []), { ...keep, hl, installed: true }];
      return cy;
    });
    closeModal(); openEntry(id, "cyber");
    toast(`${it.name} installato in ${slotDef(e, slot).label}${it.fresh && hl ? ` · −${hl} umanità` : ""}`, "ok");
  });
}

// riquadro del corpo FBC (tab Cyberware): modello, telaio, umanità del pacchetto, regole e pulsanti
function fbcHtml(e) {
  const f = fbcOf(e), edit = Store.canEdit(), id = esc(e.id);
  if (!f) return edit && isPerson(e) ? `<div class="fbc-off"><button type="button" class="btn ghost small" data-action="fbc-edit" data-id="${id}" title="Full Body Conversion (Going Metal): corpo, telaio, umanità del pacchetto">⚙ Full Body Conversion</button></div>` : "";
  const B = f.B, inc = B.inc.map(([ref, n]) => { const c = CW.byId(ref); return `${c ? c.name : ref}${n > 1 ? ` ×${n}` : ""}`; });
  const pk = cyberItems(e).filter(it => it.pkg && it.installed !== false).length;
  const fx = cyberFx(e), hp = hpMaxOf(e);
  return `<section class="fbc">
    <header><span class="cy-title">⬢ Full Body Conversion</span><b>${esc(B.name)}</b>
      ${edit ? `<button type="button" class="btn ghost small" data-action="fbc-edit" data-id="${id}">✎ Corpo</button><button type="button" class="btn small cyan" data-action="fbc-repair" data-id="${id}" title="Cybertech VD 15, 4 ore: PF al massimo (se fallisce, almeno a metà). Serve un Lifestyle Good Prepak o migliore.">🔧 Ripara</button>` : ""}</header>
    <div class="fbc-grid">
      <span><small class="sh-k">Telaio</small> ${esc(f.F.name)} · BODY <b>${fx.body}</b> · PF ${hp}</span>
      <span><small class="sh-k">Pacchetto</small> ${num(f.hl)} HL <small>(${esc(B.dice)}, media ${B.hl})</small> · Biosystem ${num(f.bio)} HL</span>
      <span><small class="sh-k">Dotazione</small> ${pk} pezzi segnati 📦 <small>(${esc(inc.join(", "))})</small></span>
    </div>
    <p class="hint">${esc(B.desc)}</p>
    <ul class="fbc-rules">
      <li>Parti del corpo (braccia, gambe, ${B.eyes === 2 ? "occhi, " : ""}udito, cranio, telaio, collegamento neurale): niente umanità persa · slot opzioni raddoppiati (anche Impianti Interni ed Esterni) · requisiti di Lacci e Muscoli Innestati soddisfatti.</li>
      <li>Immune a ${CW.FBC_CRITS.join(", ")} · niente malus degli Stati di Ferita (il Death Save resta).</li>
      <li>Immune a malattie, veleni, farmaci e droghe, salvo un Airhypo nella porta del Biosystem · Cryobag, Cryotank e Speedheal non funzionano · niente fame né aria; Soluzione di Glucosio ogni mese (nelle Spese mensili).</li>
      <li>Con Lifestyle Good Prepak o migliore: ogni giorno di riposo recupera PF pari al BODY; «🔧 Ripara» li riporta al massimo. Un EMP colpisce i singoli pezzi, non tutto il corpo.</li>
    </ul>
  </section>`;
}
// modulo del corpo FBC: modello, umanità del pacchetto e del Biosystem, dotazione
function fbcEdit(id) {
  const e = state.entries.find(x => x.id === id); if (!e || !Store.canEdit()) return;
  const f = fbcOf(e) || {}, model = f.model || "alpha";
  const items = Object.entries(((e.cyber || {}).slots) || {}).flatMap(([slot, list]) => (list || []).map((it, i) => ({ it, slot, i }))).filter(x => x.slot !== "idle" && x.it.installed !== false && !isExtSlot(x.slot) && x.it.name);
  // prima volta: segna da solo la dotazione del corpo scelto (per tipo, fino al numero incluso)
  const auto = mid => { const B = CW.fbcBody(mid), left = Object.fromEntries((B ? B.inc : []).map(([r, n]) => [r, n])), out = new Set();
    items.forEach(x => { const c = CW.byId(x.it.ref) || CW.byName(x.it.name); if (c && left[c.id] > 0) { left[c.id]--; out.add(x.slot + ":" + x.i); } }); return out; };
  const pre = f.model ? new Set(items.filter(x => x.it.pkg).map(x => x.slot + ":" + x.i)) : auto(model);
  const B0 = CW.fbcBody(model);
  openModal(`<form class="form" id="fbc-form">
    <div class="modal-head"><h2>// FULL BODY CONVERSION</h2><button type="button" class="x" data-action="close" aria-label="Chiudi">×</button></div>
    <div class="modal-body"><div class="fields">
      <div class="field full"><label for="fb-model">Corpo</label><select id="fb-model" name="model">${CW.FBC.map(b => `<option value="${b.id}" ${b.id === model ? "selected" : ""}>${esc(b.name)} · ${fmtEb(b.cost)} · ${CW.FRAMES[b.frame].name.split(" (")[0].replace("Telaio Lineare ", "")} BODY ${CW.FRAMES[b.frame].v}</option>`).join("")}</select>
        <span class="hint" data-fb-desc>${esc(B0.desc)}</span></div>
      <div class="field"><label for="fb-hl">Umanità persa · pacchetto</label><div class="mk-hl"><input id="fb-hl" name="hl" type="number" min="0" value="${esc(hasVal(f.hl) ? f.hl : B0.hl)}"><button type="button" class="gp-btn" data-fb-roll="hl" title="Tira i dadi del pacchetto">⚄</button></div><span class="hint" data-fb-dice>${esc(B0.dice)}, media ${B0.hl}</span></div>
      <div class="field"><label for="fb-bio">Umanità persa · Biosystem</label><div class="mk-hl"><input id="fb-bio" name="bio" type="number" min="0" value="${esc(hasVal(f.bio) ? f.bio : 14)}"><button type="button" class="gp-btn" data-fb-roll="bio" title="Tira 4d6">⚄</button></div><span class="hint">4d6, media 14 · 10.000 eb</span></div>
      <div class="field full"><span class="lbl">Dotazione del corpo 📦 <small>(la loro umanità è già nel pacchetto; tolgono comunque umanità massima)</small></span>
        <div class="fbc-pkg">${items.length ? items.map(x => `<label class="check"><input type="checkbox" name="pkg" value="${esc(x.slot + ":" + x.i)}" ${pre.has(x.slot + ":" + x.i) ? "checked" : ""}> ${esc(x.it.name)} <small>${esc(slotDef(e, x.slot).label)}${hasVal(x.it.hl) ? ` · ${num(x.it.hl)} HL` : ""}</small></label>`).join("") : `<span class="hint">Nessun impianto installato.</span>`}</div>
        <span class="hint" data-fb-inc>Il corpo include: ${esc(B0.inc.map(([r, n]) => `${(CW.byId(r) || { name: r }).name}${n > 1 ? " ×" + n : ""}`).join(", "))}.</span></div>
    </div></div>
    <div class="modal-foot">${f.model ? `<button type="button" class="btn ghost small danger left" data-action="fbc-remove" data-id="${esc(id)}">Togli la FBC</button>` : ""}<button type="button" class="btn ghost" data-action="close">Annulla</button><button class="btn cyan" type="submit">Salva</button></div>
  </form>`, true);
  const form = $("#fbc-form");
  form.elements.model.addEventListener("change", () => {
    const B = CW.fbcBody(form.elements.model.value); if (!B) return;
    form.elements.hl.value = B.hl; $("[data-fb-dice]", form).textContent = `${B.dice}, media ${B.hl}`; $("[data-fb-desc]", form).textContent = B.desc;
    $("[data-fb-inc]", form).textContent = `Il corpo include: ${B.inc.map(([r, n]) => `${(CW.byId(r) || { name: r }).name}${n > 1 ? " ×" + n : ""}`).join(", ")}.`;
    const a = auto(B.id); $$("input[name=pkg]", form).forEach(c => { c.checked = a.has(c.value); });
  });
  $$("[data-fb-roll]", form).forEach(b => b.addEventListener("click", () => {
    const k = b.dataset.fbRoll, r = k === "bio" ? CW.rollFbc("4d6") : CW.rollFbc(CW.fbcBody(form.elements.model.value).dice);
    form.elements[k].value = r.total; toast(`Umanità persa: ${r.total}`);
  }));
  form.addEventListener("submit", ev => {
    ev.preventDefault();
    const pk = new Set($$("input[name=pkg]:checked", form).map(c => c.value));
    cyberPatch(id, cy => {
      cy.fbc = { model: form.elements.model.value, hl: num(form.elements.hl.value), bio: num(form.elements.bio.value) };
      Object.entries(cy.slots || {}).forEach(([slot, list]) => (list || []).forEach((it, i) => { if (pk.has(slot + ":" + i)) it.pkg = true; else delete it.pkg; }));
      return cy;
    });
    closeModal(); openEntry(id, "cyber"); toast("Full Body Conversion salvata", "ok");
  });
}
function fbcRemove(id) {
  cyberPatch(id, cy => { delete cy.fbc; Object.values(cy.slots || {}).forEach(list => (list || []).forEach(it => { delete it.pkg; })); return cy; });
  closeModal(); openEntry(id, "cyber"); toast("Full Body Conversion tolta", "ok");
}
// riparazione del corpo FBC: Cybertech VD 15, 4 ore · riuscita = PF al massimo, fallita = almeno metà
function fbcRepair(id) {
  const e = state.entries.find(x => x.id === id); if (!e || !fbcOf(e) || !Store.canEdit()) return;
  const k = skillByKey(e, "skill:cybertech") || { label: "Cybertech", stat: "TECH", lvl: 0 };
  const r = CPR.check([{ l: k.stat, v: statEff(e, k.stat) }, { l: k.label, v: k.lvl }, ...skillBonusAll(e, k), ...sheetExtra(e)]);
  const ok = r.total > 15, max = hpMaxOf(e), hp = hpOf(e), to = ok ? max : Math.max(hp, Math.ceil(max / 2));
  postRoll({ kind: "check", who: e.name, entryId: e.id, label: "Riparazione del corpo FBC · Cybertech", ...r,
    hit: { ok, text: ok ? `VD 15 superata: PF al massimo (${max})` : `VD 15 non superata: 4 ore perse, PF ${to}/${max}` }, note: "4 ore · serve un Lifestyle Good Prepak o migliore" });
  sheetPatch(id, s => { s.hp = to; return s; });
}
function cyberHtml(e) { return `<div class="cy-wrap" data-cyber="${esc(e.id)}">${cyberInner(e)}${cyberFxHtml(e)}</div>`; }
function cyberInner(e) {
  const st = cyberStats(e);
  const slots = slotsOf(e);
  const zonesOn = new Set([...st.inst.map(it => slotDef(e, it.slot).zone), ...st.bases.map(x => slotDef(e, x.slot).zone)].filter(Boolean));
  const pct = v => st.start ? Math.max(0, Math.min(100, (v / st.start) * 100)) : 0;
  const psycho = st.current != null && st.current <= 0;
  const alv = slots.find(s => s.id === "alveolo");
  const card = s => s.id !== "neural" || !alv ? slotCard(e, s) : slotCard(e, s).replace(/<\/section>\s*$/, `<div class="cy-nest">${slotCard(e, alv)}</div></section>`);
  const col = c => slots.filter(s => s.col === c && !(s.id === "alveolo" && slots.some(x => x.id === "neural"))).map(card).join("");
  const summary = `
    <h4 class="cy-res-h">Resoconto</h4>
    <div class="cy-summary ${psycho ? "psycho" : ""}">
      <div class="cy-stat"><span class="l">Costo installato</span><span class="n">${fmtEb(st.cost)}</span></div>
      ${st.planCost ? `<div class="cy-stat plan"><span class="l">Pianificato</span><span class="n">${fmtEb(st.planCost)}</span></div>` : ""}
      <div class="cy-stat hl"><span class="l">Perdita umanità</span><span class="n">${st.hl}</span></div>
      <div class="cy-stat mx"><span class="l">Umanità max persa</span><span class="n">${st.maxLoss}</span></div>
      ${st.therapy ? `<div class="cy-stat th"><span class="l">Recuperata (terapia)</span><span class="n">+${st.therapy}</span></div>` : ""}
      ${st.maxUp ? `<div class="cy-stat th" title="Concessa dal GM durante la campagna"><span class="l">Massima extra (GM)</span><span class="n">+${st.maxUp}</span></div>` : ""}
      <div class="cy-stat hum">
        ${Store.canEdit() ? `<button type="button" class="cy-hum-edit" data-action="edit-humanity" data-id="${esc(e.id)}" title="Modifica umanità iniziale e terapia">✎ Umanità</button>` : ""}
        ${st.start != null ? `
          <span class="l">Umanità <b>${st.current}</b> · max <b>${st.max}</b> · iniziale ${st.start}</span>
          <span class="cy-bar" title="Barra chiara = umanità massima, barra piena = umanità attuale"><i class="mx" style="width:${pct(st.max)}%"></i><i style="width:${pct(st.current)}%"></i></span>
          <span class="cy-emp">EMP effettiva ${Math.max(0, Math.floor(st.current / 10))}${psycho ? ` · <b>⚠ CYBERPSICOSI</b>` : ""}</span>`
          : `<span class="l">Umanità</span><span class="cy-emp">Umanità iniziale non impostata</span>`}
      </div>
    </div>`;
  return `
    ${fbcHtml(e)}
    ${idleHtml(e)}
    <div class="cy-legend"><span>◆ installato</span><span>◇ pianificato</span><span>⏸ idle (non installato, va negli slot adatti)</span><span>⬚ disinstallato (resta in Equipaggiamento)</span><span>○ base non installata</span><span>colonne: costo (eb) · HL = umanità persa · −N = umanità massima tolta (in giallo se modificata)</span></div>
    <div class="cy-layout">
      <div class="cy-col">${col("l")}</div>
      <div class="cy-center">
        ${col("top")}
        <div class="cy-figure" data-zones="${[...zonesOn].join(" ")}">${BODY_SVG}</div>
      </div>
      <div class="cy-col">${col("r")}</div>
      ${col("bottom") ? `<div class="cy-bottom">${col("bottom")}</div>` : ""}
    </div>
    ${summary}`;
}

function gearHtml(e) { return `<div class="gear-wrap" data-gear="${esc(e.id)}">${gearInner(e)}</div>`; }
function gearInner(e) {
  const s = sheetOf(e), items = gearItems(e), money = e.gear && e.gear.money, id = esc(e.id), edit = Store.canEdit();
  const rows = Object.fromEntries([...GEAR_CATS.map(c => c.id), "deck"].map(k => [k, []]));
  const go = (tab, label) => `<button type="button" class="g-src" data-action="open-entry-tab" data-id="${id}" data-tab="${tab}" title="Apri la tab ${label}">${label} ›</button>`;
  const cyBtn = (op, slot, i, label, tip) => edit ? `<button type="button" class="btn ghost small g-act" data-action="gear-cy" data-id="${id}" data-op="${op}" data-slot="${esc(slot)}" data-i="${i}" title="${tip}">${label}</button>` : "";
  const fromGear = (it, gi) => ({ qty: num(it.qty), name: it.name, detail: it.detail, note: it.note,
    ...(it.cat === "droghe" && edit ? { act: `<button type="button" class="btn ghost small g-act" data-action="drug-take" data-id="${id}" data-i="${gi}" title="Assumi una dose: tiro di Resist Torture/Drugs contro la VD">💉 Assumi</button>` } : {}) });
  // armi della tab Combattimento + quelle segnate solo nell'inventario
  (s.weapons || []).forEach((w, i) => {
    const T = CPR.weaponType(w.cat || CPR.guessWeapon(w.name, w.skill)) || {};
    rows.armi.push({ name: w.name || T.label || "Arma", detail: [T.label && T.label !== w.name ? T.label : "", w.dmg || T.dmg, w.rof ? `ROF ${w.rof}` : "", magOf(w, sheetWeaponCat(w)) ? `Car. ${famOfW(w, sheetWeaponCat(w)) ? `${loadedOf(w, sheetWeaponCat(w))}/` : ""}${magOf(w, sheetWeaponCat(w))}` : "", (w.attach || []).length ? `accessori: ${w.attach.map(a => a.name).join(", ")}` : ""].filter(Boolean).join(" · "), note: w.note,
      tag: w.away ? "🏠 a casa" : "🎒 con sé", cls: w.away ? "stored" : "",
      act: edit ? `<button type="button" class="btn ghost small g-act" data-action="wpn-away" data-id="${id}" data-i="${i}" title="${w.away ? "La porti con te: torna nella tab Combattimento" : "La lasci a casa: va in fondo alla tab Combattimento e non si può usare"}">${w.away ? "🎒 Porta con sé" : "🏠 Lascia a casa"}</button>` : "" });
  });
  // armature: quelle indossate e quelle nell'inventario (con lo stesso nome sono la stessa armatura)
  const LOC = { head: "testa", body: "corpo" };
  const AW = armorWorn(e);
  items.forEach((it, gi) => {
    const cat = it.cat || "altro";
    if (cat === NET_CAT) return;
    if (cat === "munizioni") { const A = ammoOfE(e, (CPR.WEAPON_TYPES.find(t => t.ammo === it.fam) || {}).id || "", it.ammo || "");
      rows.munizioni.push({ ...fromGear(it, gi), qty: 1, detail: `${num(it.qty)} ${AMMO_LOT(it.fam) > 1 ? "colpi" : num(it.qty) === 1 ? "pezzo" : "pezzi"}${A.mod ? " · modificate" : ""}`, note: ammoEff(A),
        act: edit ? `<button type="button" class="btn ghost small g-act" data-action="ammo-mod" data-id="${id}" data-i="${gi}" title="Cambia VD, danni o effetto di alcune di queste munizioni">✎ Modifica</button>` : "" }); return; }
    if (cat === "vestiti") { rows.vestiti.push({ ...fromGear(it, gi), detail: [wdType(it.type), it.style, it.detail].filter(Boolean).join(" · "), tag: it.worn ? "👕 indossato" : "" }); return; }
    if (cat === "veicoli") { const V = vhInfo(it); rows.veicoli.push({ ...fromGear(it, gi), detail: [V.kind, ...V.upgrades.map(u => (RL.upgradeById(u.id) || { name: u.id }).name), it.detail].filter(Boolean).join(" · "),
      tag: [V.active ? "in uso" : "", roleOfE(e, "nomad") ? (V.src === "role" ? "🏕 dal ruolo" : "💰 comprato") : ""].filter(Boolean).join(" · ") }); return; }
    if (cat !== "armature") { rows[cat] && rows[cat].push(fromGear(it, gi)); return; }
    const on = AW.on[gi] || [], A = armorInfo(it);
    const free = A.both ? (on.length ? [] : ["both"]) : A.fixed ? A.locs.filter(l => !on.includes(l)) : on.length < Math.max(1, num(it.qty)) ? ["head", "body"].filter(l => !on.includes(l)) : [];
    const btn = (l, label) => `<button type="button" class="btn ghost small g-act" data-action="armor-wear" data-id="${id}" data-i="${gi}" data-loc="${l}">${label}</button>`;
    const act = !edit ? "" : [
      ...free.map(l => btn(l, A.fixed ? "🛡 Indossa" : `🛡 Indossa: ${LOC[l]}`)),
      `<button type="button" class="btn ghost small g-act" data-action="armor-up" data-id="${id}" data-i="${gi}" data-d="${num(it.up) ? -1 : 1}" title="${num(it.up) ? "Toglie l'upgrade: −1 SP" : "Armatura migliorata: +1 SP"}">${num(it.up) ? "⬇ Togli upgrade" : "⬆ Upgrade +1 SP"}</button>`,
      ...(on.length ? [`<button type="button" class="btn ghost small g-act" data-action="armor-off" data-id="${id}" data-loc="${on.join(",")}">Togli${on.length > 1 || A.fixed ? "" : ` (${LOC[on[0]]})`}</button>`] : []),
    ].join("");
    rows.armature.push({ ...fromGear(it), detail: [num(it.up) ? String(it.detail || "").replace(/SP\s*\d+/i, `SP ${A.sp} (upgrade +1)`) || `SP ${A.sp} (upgrade +1)` : it.detail || (A.sp ? `SP ${A.sp}${A.pen ? ` · ${A.pen} REF/DEX/MOVE` : ""}` : "SP non indicata"), A.fixed && !/testa|corpo/i.test(it.detail || "") ? `per ${ARMOR_LOC[A.both ? "both" : A.locs[0]]}` : ""].filter(Boolean).join(" · "), tag: on.length ? `indossata${A.fixed ? "" : `: ${on.map(l => LOC[l]).join(", ")}`}` : "", act });
  });
  AW.rest.forEach(x => rows.armature.push({ name: x.a.name || "Armatura", detail: `SP ${hasVal(x.a.cur) ? num(x.a.cur) : num(x.a.sp)}/${num(x.a.sp)} · non è nell'inventario`, tag: `indossata: ${LOC[x.l]}`,
    act: edit ? `<button type="button" class="btn ghost small g-act" data-action="armor-off" data-id="${id}" data-loc="${x.l}">Togli</button>` : "" }));
  // cyberware: installato, disinstallato (resta qui) e pianificato, parte per parte
  slotsOf(e).forEach(sl => {
    const b = baseState(e, sl.id);
    if (b && !b.fixed && (b.on || b.stored)) rows.cyber.push({ name: `${b.name}`, detail: `${sl.label} · ${b.slots} slot · ${b.hl} HL`, cls: b.on ? "" : "stored",
      tag: b.on ? "◆ installato" : "⬚ disinstallato", act: b.on ? cyBtn("out", sl.id, -1, "⇩ Disinstalla", "Lo togli dal corpo: resta nell'inventario") : cyBtn("in", sl.id, -1, "⇧ Reinstalla", "Lo rimetti nel corpo") });
    (((e.cyber || {}).slots || {})[sl.id] || []).forEach((it, i) => {
      if (!it.name || isBaseItem(it)) return;
      const st = it.installed !== false ? "in" : it.stored ? "stored" : "plan";
      const arm = ((cwOf(it) || {}).fx || []).find(f => f.t === "armor");
      rows.cyber.push({ name: it.name, detail: [sl.label, hasVal(it.hl) ? `${num(it.hl)} HL` : "", arm ? `SP ${arm.sp + num(it.up)}${num(it.up) ? " (upgrade +1)" : ""}` : ""].filter(Boolean).join(" · "), note: it.note, cls: st === "in" ? "" : st,
        tag: { in: "◆ installato", stored: "⬚ disinstallato", plan: "◇ pianificato" }[st],
        act: (arm && edit ? cyUpBtn(id, sl.id, i, it) : "") + (st === "in" ? cyBtn("out", sl.id, i, "⇩ Disinstalla", "Lo togli dal corpo: resta nell'inventario") : st === "stored" ? cyBtn("in", sl.id, i, "⇧ Reinstalla", "Lo rimetti nel corpo") + cyBtn("out", sl.id, i, "⏸ In idle", "Lo togli dallo slot: dall'idle lo installi in uno slot adatto") : "") });
    });
  });
  // cyberware in idle: comprato o tolto, si installa negli slot adatti
  idleCyber(e).forEach((it, i) => rows.cyber.push({ name: it.name, detail: [it.from ? `tolto da ${slotDef(e, it.from).label}` : "", hasVal(it.hl) ? `${num(it.hl)} HL${it.fresh ? " (al montaggio)" : ""}` : ""].filter(Boolean).join(" · "), note: it.note, cls: "stored",
    tag: "⏸ idle", act: edit ? `<button type="button" class="btn ghost small g-act" data-action="cy-install" data-id="${id}" data-i="${i}" title="Scegli lo slot dove installarlo">⇧ Installa</button>` : "" }));
  // cyberdeck con programmi e hardware
  const ds = decksOf(e), loose = netGearOf(e);
  ds.forEach((d, di) => {
    const S = NET.deckSlots(d);
    rows.deck.push({ name: d.name || `Cyberdeck ${di + 1}`, tag: ds.length > 1 && di === deckIdx(e) ? "in uso" : "", detail: `slot ${S.used}/${S.total}`, note: d.note, cls: "deckhead" });
    (d.items || []).forEach((it, ii) => { const I = NET.itemInfo(it); rows.deck.push({ name: I.label || I.name, detail: `${netKind(I)} · ${I.slots} slot`, cls: "sub",
      act: edit ? `<button type="button" class="btn ghost small g-act" data-action="deck-uninstall" data-id="${id}" data-deck="${di}" data-i="${ii}" title="Lo togli dal deck: resta nell'inventario">⇩ Disinstalla</button>` : "" }); });
    if (!(d.items || []).length) rows.deck.push({ name: "— vuoto —", cls: "sub none" });
  });
  if (loose.length) {
    rows.deck.push({ name: "Non installati", cls: "subhead" });
    loose.forEach(({ it, gi }) => rows.deck.push({ qty: num(it.qty), name: it.name, detail: it.detail, note: it.note, cls: "loose",
      act: !edit ? "" : !ds.length ? `<span class="hint">nessun deck</span>` : `${ds.length > 1 ? `<select class="g-deck" data-deck-for="${gi}" aria-label="In quale deck">${ds.map((d, i) => `<option value="${i}" ${i === deckIdx(e) ? "selected" : ""}>${esc(d.name || `Cyberdeck ${i + 1}`)}</option>`).join("")}</select>` : ""}<button type="button" class="btn ghost small g-act" data-action="deck-install" data-id="${id}" data-i="${gi}" data-deck="${deckIdx(e)}">⇧ Installa</button>` }));
  }
  const SECS = [...GEAR_CATS.slice(0, 2), GEAR_CATS.find(c => c.id === "cyber"), { id: "deck", label: "Cyberdeck", color: "var(--green)" }, ...GEAR_CATS.filter(c => !["armi", "armature", "cyber", NET_CAT].includes(c.id))];
  const LINK = { armi: (s.weapons || []).length ? ["combat", "Combattimento"] : null, cyber: ["cyber", "Cyberware"], deck: ["deck", "Cyberdeck"], vestiti: ["wardrobe", "Wardrobe"], munizioni: ["combat", "Combattimento"] };
  const real = l => l.filter(x => !/subhead|none/.test(x.cls || "")).length;
  const total = SECS.reduce((t, c) => t + real(rows[c.id]), 0);
  if (!total && (money === "" || money == null) && !drugStatusHtml(e)) return `<div class="empty"><div class="big">// INVENTARIO VUOTO</div>Nessun equipaggiamento registrato.</div>`;
  return `
    <div class="cy-summary">${money !== "" && money != null ? `<div class="cy-stat"><span class="l">Eddies</span><span class="n">${fmtEb(num(money))}</span></div>` : ""}
      <div class="cy-stat"><span class="l">Voci</span><span class="n">${total}</span></div></div>
    ${drugStatusHtml(e)}
    <p class="hint">Qui c'è tutto quello che il personaggio possiede: anche le armi della tab Combattimento, le armature indossate, il cyberware (pure quello disinstallato) e i cyberdeck. «Modifica» cambia solo gli oggetti dell'inventario; il resto si modifica nella sua tab.</p>
    <div class="gear-grid">
      ${SECS.map(c => {
        const list = rows[c.id]; if (!list.length) return "";
        return `<section class="gear-sec ${c.id === "cyber" || c.id === "deck" ? "wide" : ""}" style="--c:${c.color}">
          <header>${esc(c.label)} <span>${real(list)}</span>${LINK[c.id] ? go(...LINK[c.id]) : ""}</header>
          <ul>${list.map(it => `<li class="${it.cls || ""}">
            <span class="g-qty">${num(it.qty) > 1 ? "×" + num(it.qty) : ""}</span>
            <span class="g-name">${esc(it.name)}${it.tag ? ` <i class="g-tag">${esc(it.tag)}</i>` : ""}${it.detail ? `<small>${esc(it.detail)}</small>` : ""}${it.note ? `<em>${esc(it.note)}</em>` : ""}</span>
            ${it.act ? `<span class="g-side">${it.act}</span>` : ""}
          </li>`).join("")}</ul></section>`;
      }).join("")}
    </div>`;
}

// evidenzia sulla sagoma lo slot sotto il mouse
document.addEventListener("mouseover", ev => {
  const s = ev.target.closest && ev.target.closest(".cy-slot");
  const fig = $("#modal .cy-figure"); if (!fig) return;
  $$(".cy-zone", fig).forEach(z => z.classList.toggle("hover", !!s && z.dataset.zone === s.dataset.zone));
});

const allCyberNames = () => [...new Set(state.entries.flatMap(x => cyberItems(x).map(it => it.name)).filter(Boolean))].sort((a, b) => a.localeCompare(b, "it"));
const cyRow = (it = {}, def = 2) => `
  <div class="cy-row ${it.ref === "skillchip" ? "chip" : ""}">
    <label class="cy-inst" title="Installato (togli la spunta se è solo pianificato)"><input type="checkbox" data-f="installed" ${it.installed === false ? "" : "checked"}><span></span></label>
    <input data-f="name" placeholder="Nome impianto" list="dl-cyber" value="${esc(it.name)}">
    <input type="hidden" data-f="ref" value="${esc(it.ref || "")}"><input type="hidden" data-f="stored" value="${it.stored ? "1" : ""}"><input type="hidden" data-f="withBase" value="${it.withBase ? "1" : ""}"><input type="hidden" data-f="off" value="${it.off ? "1" : ""}"><input type="hidden" data-f="up" value="${it.up ? "1" : ""}"><input type="hidden" data-f="pkg" value="${it.pkg ? "1" : ""}">
    <select data-f="lvl" class="cy-param cy-lvl" title="Livello a cui il chip porta l'abilità">${[3, 4].map(n => `<option value="${n}" ${+it.lvl === n ? "selected" : ""}>liv. ${n}</option>`).join("")}</select>
    <select data-f="param" class="cy-param" title="Abilità del Chip Abilità"><option value="">abilità del chip…</option>${CPR.SKILLS.map(k => `<option value="${k.id}" ${k.id === it.param ? "selected" : ""}>${esc(k.label)}</option>`).join("")}</select>
    <input data-f="cost" type="number" min="0" step="1" placeholder="eb" title="Costo in eddies" value="${esc(it.cost ?? "")}">
    <input data-f="hl" type="number" min="0" step="1" placeholder="HL" title="Umanità persa (HL)" value="${esc(it.hl ?? "")}">
    <button type="button" class="gp-btn" data-cy-pu title="Tira la Perdita d'Umanità con i dadi del catalogo" aria-label="Tira la Perdita d'Umanità">⚄</button>
    <input data-f="max" type="number" min="0" step="1" placeholder="max ${def}" title="Umanità massima tolta — vuoto = ${def} (standard dello slot)" value="${esc(it.max ?? "")}">
    <input data-f="note" placeholder="Nota (opzioni, effetti…)" value="${esc(it.note)}">
    <button type="button" class="gp-btn del" data-row-del aria-label="Rimuovi">✕</button>
  </div>`;
const zoneSelect = (z = "") => `<select data-slot-f="zone" title="Punto acceso sulla sagoma">${BODY_ZONES.map(([v, l]) => `<option value="${v}" ${v === z ? "selected" : ""}>${l}</option>`).join("")}</select>`;
const cyBaseRow = b => !b ? "" : b.fixed ? `<div class="cy-base-edit" data-base>
    <label>Slot opzioni <input data-base-f="slots" type="number" min="0" max="20" value="${b.slots}" title="Standard ${b.std}; si possono aumentare con gli upgrade"></label><span class="hint">standard ${b.std}</span></div>`
  : `<div class="cy-base-edit" data-base data-base-ref="${esc(b.ref)}" data-base-name="${esc(b.name)}" data-base-budget="${num(b.budget) || ""}">
    <label class="check"><input type="checkbox" data-base-f="on" ${b.on ? "checked" : ""}> <b>${esc(b.name)}</b> installato</label>
    ${CW.baseVariants(b.kind).length ? `<label>Modello <select data-base-f="vref" title="Variante del cyberware fondamentale">${[[SLOT_BASE[b.kind][0], SLOT_BASE[b.kind][2]], ...CW.baseVariants(b.kind).map(v => [v.id, v.name])].map(([v, l]) => `<option value="${esc(v)}" ${v === b.ref ? "selected" : ""}>${esc(l)}</option>`).join("")}</select></label>` : ""}
    <label>eb <input data-base-f="cost" type="number" min="0" value="${b.cost}"></label>
    <label>HL <input data-base-f="hl" type="number" min="0" value="${b.hl}"></label>
    <button type="button" class="gp-btn" data-base-pu title="Tira la Perdita d'Umanità" aria-label="Tira la Perdita d'Umanità">⚄</button>
    <label>max <input data-base-f="max" type="number" min="0" value="${b.max}" title="Umanità massima tolta"></label>
    <label>Slot <input data-base-f="slots" type="number" min="0" max="20" value="${b.slots}" title="Standard ${b.std}; si possono aumentare con gli upgrade"></label>
  </div>`;
const cyFieldset = (s, items, base = null) => `
  <fieldset class="cy-edit ${s.custom ? "custom" : ""} ${s.id === "alveolo" ? "nested" : ""}" data-slot="${esc(s.id)}" data-max="${s.max}">
    <legend>${s.custom ? "Slot personalizzato" : s.id === "alveolo" ? `↳ Alveolo <small>· nel Collegamento Neurale: ogni slot tiene un chip</small>` : `${esc(s.label)} <small>· max standard ${s.max}</small>`} <span data-cy-cap></span></legend>
    ${cyBaseRow(base)}
    ${s.custom ? `<div class="cy-slot-head">
      <input data-slot-f="label" placeholder="Nome dello slot (es. Chipware, Opzioni occhi…)" value="${esc(s.label === "Slot personalizzato" ? "" : s.label)}">
      ${zoneSelect(s.zone)}
      <input data-slot-f="max" type="number" min="0" step="1" value="${esc(s.max)}" title="Umanità massima standard per questo slot">
      <button type="button" class="btn ghost small" data-slot-del>Elimina slot</button>
    </div>` : ""}
    <div class="cy-rows">${items.map(it => cyRow(it, s.max)).join("")}</div>
    <div class="cy-edit-actions">
      <select class="cy-pick" data-cy-pick aria-label="Aggiungi dal catalogo">${cwOptions(s.id)}</select>
      <button type="button" class="btn ghost small cyan" data-row-add="cy">+ Impianto a mano</button>
      ${s.custom ? "" : `<button type="button" class="btn ghost small" data-slot-del>Rimuovi slot</button>`}
    </div>
  </fieldset>`;
const gearRow = (it = {}) => `
  <div class="gear-row">
    <select data-f="cat">${GEAR_CATS.map(c => `<option value="${c.id}" ${(it.cat || "equip") === c.id ? "selected" : ""}>${c.label}</option>`).join("")}</select>
    <input data-f="name" placeholder="Nome" value="${esc(it.name)}">
    <input data-f="qty" type="number" min="1" step="1" placeholder="Q.tà" value="${esc(it.qty ?? 1)}">
    <input data-f="detail" placeholder="Dettagli (danno, SP, ROF…)" value="${esc(it.detail)}">
    <input data-f="note" placeholder="Nota" value="${esc(it.note)}">
    <input type="hidden" data-f="up" value="${esc(it.up || "")}"><input type="hidden" data-f="fam" value="${esc(it.fam || "")}"><input type="hidden" data-f="ammo" value="${esc(it.ammo || "")}"><input type="hidden" data-f="style" value="${esc(it.style || "")}"><input type="hidden" data-f="type" value="${esc(it.type || "")}"><input type="hidden" data-f="worn" value="${it.worn ? "1" : ""}"><input type="hidden" data-f="sp" value="${esc(it.sp ?? "")}"><input type="hidden" data-f="pen" value="${esc(it.pen ?? "")}"><input type="hidden" data-f="both" value="${it.both ? "1" : ""}"><input type="hidden" data-f="loc" value="${esc(it.loc || "")}"><input type="hidden" data-f="cost" value="${esc(it.cost ?? "")}"><input type="hidden" data-f="drug" value="${esc(it.drug || "")}"><input type="hidden" data-f="ref" value="${esc(it.ref || "")}"><input type="hidden" data-f="item" value="${esc(it.item ? JSON.stringify(it.item) : "")}"><input type="hidden" data-f="veh" value="${esc(it.veh ? JSON.stringify(it.veh) : "")}">
    <button type="button" class="gp-btn del" data-row-del aria-label="Rimuovi">✕</button>
  </div>`;
const readRows = (root, sel) => $$(sel, root).map(r => Object.fromEntries($$("[data-f]", r).map(i => [i.dataset.f, i.type === "checkbox" ? i.checked : i.value.trim()])));

// finestra rapida: solo umanità iniziale e recuperata con la terapia
function editHumanity(id) {
  const e = state.entries.find(x => x.id === id); if (!e) return;
  const c = e.cyber || {}, st = cyberStats(e);
  openModal(`
    <form class="form" id="hum-form">
      <div class="modal-head"><h2>// UMANITÀ · ${esc(e.name)}</h2><button type="button" class="x" data-action="open-entry-tab" data-id="${esc(e.id)}" data-tab="cyber" aria-label="Chiudi">×</button></div>
      <div class="modal-body">
        <div class="fields">
          <div class="field"><label for="h-start">Umanità iniziale</label>
            <input id="h-start" name="humanity" type="number" min="0" step="1" value="${esc(c.humanity ?? "")}" placeholder="EMP × 10, es. 70"></div>
          <div class="field"><label for="h-th">Recuperata con la terapia</label>
            <div class="temp-row"><button type="button" class="gp-btn" data-th="-1" aria-label="Meno uno">−</button>
            <input id="h-th" name="therapy" type="number" min="0" step="1" value="${esc(c.therapy ?? "")}" placeholder="0">
            <button type="button" class="gp-btn" data-th="1" aria-label="Più uno">+</button></div></div>
          <div class="field"><label for="h-up">Umanità massima extra (GM)</label>
            <div class="temp-row">${isGm() ? `<button type="button" class="gp-btn" data-up="-1" aria-label="Meno uno">−</button>` : ""}
            <input id="h-up" name="maxUp" type="number" step="1" value="${esc(c.maxUp ?? "")}" placeholder="0" ${isGm() ? "" : "readonly"} title="Regola della campagna: il GM può alzare l'umanità massima">
            ${isGm() ? `<button type="button" class="gp-btn" data-up="1" aria-label="Più uno">+</button>` : ""}</div>
            <span class="hint">Regola della campagna: la concede il GM${isGm() ? "" : " (solo il GM la cambia)"}.</span></div>
        </div>
        <p class="hint" style="margin-top:12px">Impianti installati: perdita umanità <b>${st.hl}</b>, umanità massima tolta <b>${st.maxLoss}</b>.
          L'umanità attuale = iniziale − perdita + terapia, e non può superare la massima (iniziale − ${st.maxLoss} + massima extra del GM).</p>
        <p class="hint hum-preview" aria-live="polite"></p>
      </div>
      <div class="modal-foot">
        <button type="button" class="btn ghost small left" data-action="open-entry-tab" data-id="${esc(e.id)}" data-tab="cyber">Annulla</button>
        <button type="submit" class="btn">Salva umanità</button>
      </div>
    </form>`, true);
  const form = $("#hum-form"), prev = $(".hum-preview", form);
  const update = () => {
    const s = form.humanity.value === "" ? null : num(form.humanity.value);
    if (s == null) { prev.textContent = ""; return; }
    const max = s - st.maxLoss + num(form.maxUp.value), cur = Math.min(s - st.hl + num(form.therapy.value), max);
    prev.innerHTML = `Risultato: umanità <b>${cur}</b> · max <b>${max}</b> · EMP effettiva <b>${Math.max(0, Math.floor(cur / 10))}</b>${cur <= 0 ? " · ⚠ cyberpsicosi" : ""}`;
  };
  form.addEventListener("input", update);
  form.addEventListener("click", ev => {
    const b = ev.target.closest("[data-th]");
    if (b) { form.therapy.value = Math.max(0, num(form.therapy.value) + num(b.dataset.th)); update(); }
    const u = ev.target.closest("[data-up]");
    if (u) { form.maxUp.value = num(form.maxUp.value) + num(u.dataset.up); update(); }
  });
  update();
  form.addEventListener("submit", async ev => {
    ev.preventDefault();
    const h = form.humanity.value, t = form.therapy.value, up = isGm() ? form.maxUp.value : (e.cyber || {}).maxUp;
    try {
      const saved = await Store.save("entries", { ...e, cyber: { ...(e.cyber || {}), humanity: h === "" ? null : num(h), therapy: t === "" ? null : num(t), ...(num(up) ? { maxUp: num(up) } : { maxUp: null }) } });
      upsert(state.entries, saved); toast("Umanità salvata", "ok"); openEntry(saved.id, "cyber");
    } catch (err) { fail(err); }
  });
}

function editCyber(id) {
  const e = state.entries.find(x => x.id === id); if (!e) return;
  const slots = (e.cyber && e.cyber.slots) || {};
  openModal(`
    <form class="form" id="cyber-form">
      <div class="modal-head"><h2>// CYBERWARE · ${esc(e.name)}</h2><button type="button" class="x" data-action="close" aria-label="Chiudi">×</button></div>
      <div class="modal-body">
        <div class="fields">
          <div class="field"><label for="cy-hum">Umanità iniziale</label><input id="cy-hum" name="humanity" type="number" min="0" step="1" value="${esc(e.cyber && e.cyber.humanity != null ? e.cyber.humanity : "")}" placeholder="EMP × 10, es. 70"></div>
          <div class="field"><label for="cy-th">Recuperata con la terapia</label><input id="cy-th" name="therapy" type="number" min="0" step="1" value="${esc(e.cyber && e.cyber.therapy != null ? e.cyber.therapy : "")}" placeholder="0"></div>
          <div class="field full"><span class="lbl">Legenda</span><span class="hint">Le parti con slot (Cyberocchio, Cyberbraccio, Cybergamba, Collegamento Neurale, Sistema Cyberudito) sono <b>cyberware fondamentale</b>: si attivano in testa allo slot, con costo, PU e numero di slot (modificabile per gli upgrade). Spunta = installato, senza spunta = pianificato (non conta nei totali). <b>eb</b> = costo · <b>HL</b> = umanità persa · <b>max</b> = umanità massima tolta: vuoto = standard dello slot (2, borgware 4, fashionware 0), oppure scrivi il valore modificato (es. 1).</span></div>
        </div>
        <datalist id="dl-cyber">${allCyberNames().map(n => `<option value="${esc(n)}">`).join("")}</datalist>
        <div id="cy-fieldsets">${slotsOf(e).map(s => cyFieldset(s, (slots[s.id] || []).filter(it => !isBaseItem(it)), baseState(e, s.id, true))).join("")}</div>
        <div class="cy-slot-tools">
          <button type="button" class="btn ghost small yellow" data-slot-add>+ Aggiungi slot personalizzato</button>
          <div id="cy-restore"></div>
        </div>
      </div>
      <div class="modal-foot">
        <button type="button" class="btn ghost small left" data-action="open-entry-tab" data-id="${esc(e.id)}" data-tab="cyber">Annulla</button>
        <button type="submit" class="btn">Salva cyberware</button>
      </div>
    </form>`);
  const form = $("#cyber-form");
  // slot standard rimossi → pulsanti per ripristinarli
  const refreshRestore = () => {
    const gone = CYBER_SLOTS.filter(s => !$(`fieldset[data-slot="${s.id}"]`, form));
    $("#cy-restore", form).innerHTML = gone.length
      ? `<span class="lbl">Slot standard rimossi:</span> ${gone.map(s => `<button type="button" class="chip" data-slot-restore="${s.id}">+ ${esc(s.label)}</button>`).join(" ")}` : "";
  };
  refreshRestore();
  form.addEventListener("click", async ev => {
    const rs = ev.target.closest("[data-slot-restore]");
    if (rs) {
      const s = CYBER_SLOTS.find(x => x.id === rs.dataset.slotRestore);
      $("#cy-fieldsets", form).insertAdjacentHTML("beforeend", cyFieldset(s, [], baseState({ cyber: {} }, s.id)));
      refreshRestore(); $(`fieldset[data-slot="${s.id}"]`, form).scrollIntoView({ block: "center" });
      return;
    }
    const add = ev.target.closest("[data-row-add]"), del = ev.target.closest("[data-row-del]");
    if (add) {
      const fs = add.closest("fieldset"), box = $(".cy-rows", fs);
      const def = fs.classList.contains("custom") ? num($("[data-slot-f=max]", fs).value) : num(fs.dataset.max);
      box.insertAdjacentHTML("beforeend", cyRow({}, def)); $(".cy-row:last-child [data-f=name]", box).focus();
    }
    if (del) del.closest(".cy-row").remove();
    // PU della base tirata con i dadi del catalogo
    const bpu = ev.target.closest("[data-base-pu]");
    if (bpu) { const box = bpu.closest("[data-base]"), c = CW.byId(box.dataset.baseRef), r = CW.rollPu(c);
      $("[data-base-f=hl]", box).value = r.total; toast(`${c.name}: PU ${r.dice.join(" + ")} = ${r.total}`, "ok"); return; }
    // PU tirata con i dadi della voce del catalogo
    const pu = ev.target.closest("[data-cy-pu]");
    if (pu) { const row = pu.closest(".cy-row"), c = CW.byId($("[data-f=ref]", row).value) || CW.byName($("[data-f=name]", row).value);
      if (!c) { toast("Prima scegli l'impianto dal catalogo", "err"); return; }
      const r = CW.rollPu(c); $("[data-f=hl]", row).value = r.total; toast(`${c.name}: PU ${r.dice.length ? `${r.dice.join(" + ")}${/\/2$/.test(c.dice) ? " ÷ 2" : ""} = ` : ""}${r.total}`, "ok"); return; }
    if (ev.target.closest("[data-slot-add]")) {
      const id = "x-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
      $("#cy-fieldsets", form).insertAdjacentHTML("beforeend", cyFieldset({ id, label: "", zone: "", max: 2, custom: true }, []));
      const fs = $(`fieldset[data-slot="${id}"]`, form); fs.scrollIntoView({ block: "center" }); $("[data-slot-f=label]", fs).focus();
    }
    const sd = ev.target.closest("[data-slot-del]");
    if (sd) {
      const fs = sd.closest("fieldset"), n = $$(".cy-row", fs).length;
      if (!n || await askConfirm(`Rimuovere lo slot e i suoi ${n} impianti? Diventa definitivo quando salvi.`, "Rimuovi slot")) { fs.remove(); refreshRestore(); }
    }
  });
  // contatore degli slot opzioni, aggiornato a ogni modifica
  const readBase = fs => { const box = $("[data-base]", fs); if (!box) return null; const f = k => $(`[data-base-f=${k}]`, box);
    const vr = f("vref") && CW.byId(f("vref").value), vb = vr && vr.base && vr.baseOf ? { vref: vr.id } : {}, bud = num(box.dataset.baseBudget) ? { budget: num(box.dataset.baseBudget) } : {};
    return f("on") ? { on: f("on").checked, slots: num(f("slots").value), cost: num(f("cost").value), hl: num(f("hl").value), max: num(f("max").value), name: box.dataset.baseName, ...vb, ...bud }
      : { fixed: true, on: true, slots: num(f("slots").value) }; };
  const capCount = () => $$("fieldset[data-slot]", form).forEach(fs => {
    const items = readRows(fs, ".cy-row").map(r => ({ name: r.name, ref: r.ref, installed: r.installed }));
    const alvFs = $('fieldset[data-slot="alveolo"]', form), alvB = alvFs && readBase(alvFs);
    const el = $("[data-cy-cap]", fs); if (el) el.innerHTML = slotUseHtml(slotUse(fs.dataset.slot, items, readBase(fs), fs.dataset.slot === "neural" && alvB && alvB.on ? alvB.slots : 0));
  });
  ["change", "input"].forEach(t => form.addEventListener(t, () => setTimeout(capCount)));
  form.addEventListener("click", ev => { if (ev.target.closest("[data-row-del], [data-row-add]")) setTimeout(capCount); });
  capCount();
  // voce scelta dal catalogo: riga compilata (nome, costo, PU media, nota)
  form.addEventListener("change", ev => {
    const vsel = ev.target.closest("[data-base-f=vref]");
    if (vsel) { const box = vsel.closest("[data-base]"), c = CW.byId(vsel.value), B = SLOT_BASE[slotKind(vsel.closest("fieldset").dataset.slot)];
      if (c) { box.dataset.baseRef = c.id; box.dataset.baseName = c.name; $("b", box).textContent = c.name; $("[data-base-f=slots]", box).value = c.base && c.baseOf ? num(c.bslots) : B[1]; $("[data-base-f=cost]", box).value = c.cost; }
      return; }
    const sel = ev.target.closest("[data-cy-pick]");
    if (sel && sel.value) {
      const c = CW.byId(sel.value), fs = sel.closest("fieldset"), box = $(".cy-rows", fs);
      if (c.base) { const bb = $("[data-base]", fs); if (bb && bb.dataset.baseRef === c.id) $("[data-base-f=on]", bb).checked = true; else toast(`${c.name} è cyberware fondamentale: attivalo in testa al suo slot${c.baseOf ? " (scegli il modello)" : ""}`, "err"); sel.value = ""; return; }
      const def = fs.classList.contains("custom") ? num($("[data-slot-f=max]", fs).value) : num(fs.dataset.max);
      box.insertAdjacentHTML("beforeend", cyRow({ name: c.name, ref: c.id, cost: c.cost, hl: c.pu, note: shortDesc(c), max: c.g === "fashion" || c.pu === 0 ? 0 : null }, def));
      sel.value = ""; return;
    }
    const nm = ev.target.closest(".cy-row [data-f=name]");
    if (nm) { const row = nm.closest(".cy-row"), c = CW.byName(nm.value); $("[data-f=ref]", row).value = c ? c.id : ""; row.classList.toggle("chip", !!c && c.id === "skillchip"); }
  });
  form.addEventListener("submit", async ev => {
    ev.preventDefault();
    const out = {}, extra = [], bases = {};
    for (const fs of $$("fieldset[data-slot]", form)) {
      const bs = readBase(fs); if (bs) { const { name, fixed, ...keep } = bs, was = baseState(e, fs.dataset.slot, true); bases[fs.dataset.slot] = fixed ? { slots: keep.slots } : { ...keep, ...(!keep.on && was && was.stored ? { stored: true } : {}) }; }
      const items = readRows(fs, ".cy-row").filter(it => it.name && !isBaseItem(it)).map(it => ({
        name: it.name, installed: it.installed, cost: it.cost === "" ? null : num(it.cost), hl: it.hl === "" ? null : num(it.hl),
        max: it.max === "" ? null : num(it.max), note: it.note,
        ...(it.ref ? { ref: it.ref } : {}), ...(it.off ? { off: true } : {}), ...(it.pkg ? { pkg: true } : {}), ...(it.up ? { up: 1 } : {}), ...(it.stored && it.installed === false ? { stored: true, ...(it.withBase ? { withBase: true } : {}) } : {}), ...(it.param && it.ref === "skillchip" ? { param: it.param, lvl: +it.lvl === 4 ? 4 : 3 } : {}),
      }));
      if (fs.classList.contains("custom")) {
        const label = $("[data-slot-f=label]", fs).value.trim();
        if (!label && !items.length) continue;              // slot vuoto e senza nome: lo scarto
        extra.push({ id: fs.dataset.slot, label: label || "Slot personalizzato", zone: $("[data-slot-f=zone]", fs).value, max: num($("[data-slot-f=max]", fs).value) });
      }
      if (items.length) out[fs.dataset.slot] = items;
    }
    // tolti dal corpo con la spunta: vanno in idle (da lì si installano in uno slot adatto)
    const idle = [...idleCyber(e)];
    Object.keys(out).forEach(sl => {
      const was = ((((e.cyber || {}).slots || {})[sl]) || []).filter(x => x.installed !== false);
      out[sl] = out[sl].filter(it => {
        if (it.installed !== false || it.stored) return true;
        const k = was.findIndex(x => x.name === it.name && (x.ref || "") === (it.ref || "")); if (k < 0) return true;
        was.splice(k, 1); idle.push({ ...it, installed: false, stored: true, from: sl }); return false;
      });
      if (!out[sl].length) delete out[sl];
    });
    const hum = form.humanity.value, th = form.therapy.value;
    const hidden = CYBER_SLOTS.filter(s => !s.ext && !$(`fieldset[data-slot="${s.id}"]`, form)).map(s => s.id);   // gli occhiali compaiono da soli
    try {
      const saved = await Store.save("entries", { ...e, cyber: { ...(e.cyber || {}),
        humanity: hum === "" ? null : num(hum), therapy: th === "" ? null : num(th), slots: { ...out, ...(idle.length ? { idle } : {}) }, extra, hidden, bases,
      } });
      upsert(state.entries, saved); const nIdle = idle.length - idleCyber(e).length;
      toast(nIdle > 0 ? `Cyberware salvato · ${nIdle} ${nIdle > 1 ? "pezzi tolti vanno" : "pezzo tolto va"} in idle` : "Cyberware salvato", "ok"); openEntry(saved.id, "cyber");
    } catch (err) { fail(err); }
  });
}

function editGear(id) {
  const e = state.entries.find(x => x.id === id); if (!e) return;
  openModal(`
    <form class="form" id="gear-form">
      <div class="modal-head"><h2>// EQUIPAGGIAMENTO · ${esc(e.name)}</h2><button type="button" class="x" data-action="close" aria-label="Chiudi">×</button></div>
      <div class="modal-body">
        <div class="fields"><div class="field"><label for="g-money">Eddies</label><input id="g-money" name="money" type="number" step="1" value="${esc(e.gear && e.gear.money != null ? e.gear.money : "")}" placeholder="es. 2500"></div></div>
        <div class="gear-rows">${gearItems(e).map(gearRow).join("")}</div>
        <button type="button" class="btn ghost small cyan" data-row-add="gear" style="margin-top:10px">+ Aggiungi oggetto</button>
        <p class="hint" style="margin-top:10px">${GEAR_CATS.filter(c => c.hint).map(c => `<b>${c.label}</b>: ${esc(c.hint)}`).join(" · ")}</p>
      </div>
      <div class="modal-foot">
        <button type="button" class="btn ghost small left" data-action="open-entry-tab" data-id="${esc(e.id)}" data-tab="gear">Annulla</button>
        <button type="submit" class="btn">Salva equipaggiamento</button>
      </div>
    </form>`);
  const form = $("#gear-form");
  form.addEventListener("click", ev => {
    if (ev.target.closest("[data-row-add]")) { $(".gear-rows", form).insertAdjacentHTML("beforeend", gearRow()); $(".gear-row:last-child [data-f=name]", form).focus(); }
    const del = ev.target.closest("[data-row-del]"); if (del) del.closest(".gear-row").remove();
  });
  form.addEventListener("submit", async ev => {
    ev.preventDefault();
    const items = readRows(form, ".gear-row").filter(it => it.name).map(({ item, veh, ...it }) => {
      const o = { ...it, qty: Math.max(1, num(it.qty) || 1) };
      ["cost", "drug", "ref", "sp", "pen", "both", "loc", "style", "type", "worn", "fam", "ammo", "up"].forEach(k => { if (!o[k]) delete o[k]; });
      if (o.worn) o.worn = true;
      if (o.up) o.up = num(o.up); if (o.sp) o.sp = num(o.sp); if (o.pen) o.pen = num(o.pen); if (o.both) o.both = true;
      if (o.cost) o.cost = num(o.cost);
      if (item) try { o.item = JSON.parse(item); } catch {}
      if (veh && o.cat === "veicoli") try { o.veh = JSON.parse(veh); } catch {}
      return o;
    });
    const money = form.money.value;
    try {
      const saved = await Store.save("entries", { ...e, gear: { ...(e.gear || {}), money: money === "" ? null : num(money), items } });
      upsert(state.entries, saved); toast("Equipaggiamento salvato", "ok"); openEntry(saved.id, "gear");
    } catch (err) { fail(err); }
  });
}
