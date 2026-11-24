// ============================================================
//  NIGHT CITY ARCHIVE — Night Market: acquisti sul PG, importazione del catalogo
//  (js/ui/: i file si caricano in ordine da index.html e condividono le costanti)
// ============================================================

// ---------- NIGHT MARKET ----------
// meta "market"   = { open, pct, hide[] }  (impostazioni del GM: mercato aperto, prezzi in %, voci nascoste)
// meta "markethb" = { items[] }            (armi, armature ed equipaggiamento custom o importati)
// e.gear.log      = [{ at, id, name, type, cost, qty, undo }]  (storico degli acquisti del PG)
const mkCfg = () => ({ open: true, pct: 100, hide: [], ...(state.market || {}) });
const mkHidden = id => (mkCfg().hide || []).includes(id);
const mkPrice = cost => Math.round(num(cost) * num(mkCfg().pct || 100) / 100);
const mkBuyers = () => {
  const pcs = state.entries.filter(e => e.kind === "pg"), me = myPg();
  if (isGm()) return [...pcs, ...state.entries.filter(e => e.kind === "npc" && hasSheet(e))];
  return me ? [me] : pcs;
};
// «— solo consultazione —» si salva come "none"; la prima volta il giocatore entra col suo PG
const mkWho = () => { const id = ls.get("nc-mk-who", ""); if (id === "none") return null; return mkBuyers().find(e => e.id === id) || (!id && !isGm() ? myPg() : null) || null; };
const mkCanBuy = () => !!mkWho() && Store.canEdit() && (mkCfg().open || isGm());
const moneyOf = e => num(e && e.gear && e.gear.money);
const mkLog = e => (e && e.gear && e.gear.log) || [];

function marketBar() {
  const who = mkWho(), cfg = mkCfg(), gm = isGm() && Store.canEdit();
  const opts = mkBuyers().map(e => `<option value="${esc(e.id)}" ${who && who.id === e.id ? "selected" : ""}>${esc(e.name)}${e.kind === "npc" ? " (NPC)" : ""}</option>`).join("");
  return `<div class="mk-bar">
    <label class="mk-who"><span>Entra come</span><select data-mk-who><option value="">— solo consultazione —</option>${opts}</select></label>
    ${who ? `<div class="mk-money"><span class="l">Eddies</span><b class="${moneyOf(who) < 0 ? "neg" : ""}">${fmtEb(moneyOf(who))}</b></div>
      <button type="button" class="btn ghost small" data-action="mk-log" data-id="${esc(who.id)}">Storico${mkLog(who).length ? ` (${mkLog(who).length})` : ""}</button>` : `<span class="hint">Scegli un personaggio per comprare: l'oggetto va nella sua scheda e gli eddies si scalano da soli.</span>`}
    ${!cfg.open ? `<span class="mk-closed">Il Night Market è chiuso${gm ? " (solo tu puoi comprare)" : ""}</span>` : ""}
    ${gm ? `<div class="mk-gm"><label class="check"><input type="checkbox" data-mk-open ${cfg.open ? "checked" : ""}> Aperto ai giocatori</label>
      <label class="mk-pct">Prezzi <input type="number" data-mk-pct min="10" max="500" step="5" value="${num(cfg.pct) || 100}">%</label>
      <button type="button" class="btn small yellow" data-action="mk-import">⇪ Importa</button></div>` : ""}
  </div>`;
}

// righe del negozio: armi, armature, equipaggiamento
const mkCostCell = (cost, item) => {
  const p = mkPrice(cost), changed = p !== num(cost);
  if (!num(cost)) return `<td class="gl-n">—</td>`;
  return `<td class="gl-n">${changed ? `<s>${num(cost).toLocaleString("it-IT")}</s> ` : ""}${p.toLocaleString("it-IT")} eb<small>${esc(MK.priceCat(num(cost)))}</small></td>`;
};
const mkBuyCell = (key, cost) => {
  if (!mkCanBuy()) return "";
  if (!num(cost)) return `<td class="mk-buy"><span class="hint">non in vendita</span></td>`;
  const who = mkWho(), p = mkPrice(cost), poor = p > moneyOf(who) && !isGm();
  return `<td class="mk-buy"><button type="button" class="btn small ${poor ? "ghost" : ""}" data-action="mk-buy" data-key="${esc(key)}" ${poor ? `title="Non bastano gli eddies"` : ""}>Compra</button></td>`;
};
const mkTools = (key, it) => {
  if (!Store.canEdit()) return "";
  const gm = isGm(), hid = mkHidden(key), ed = it && MK_FORMS[it.type] && (gm || it.custom);
  if (!ed && !gm) return "";
  return `<span class="mk-tools">${ed ? `<button type="button" class="gp-btn" data-action="mk-edit" data-key="${esc(key)}" aria-label="Modifica" title="${it.custom ? "Modifica" : "Modifica (diventa una voce custom)"}">✎</button>` : ""}
    ${gm ? `<button type="button" class="gp-btn ${hid ? "on" : ""}" data-action="mk-hide" data-key="${esc(key)}" title="${hid ? "Nascosto ai giocatori: clic per mostrarlo" : "Nascondi ai giocatori"}" aria-label="Nascondi">${hid ? "⊘" : "👁"}</button>` : ""}</span>`;
};
let glossP = "";
const mkFilters = (n, extra = "") => `<div class="gl-filters"><input type="search" data-gloss-q placeholder="cerca: nome, effetto, fonte…" value="${esc(glossQ)}">
  ${extra}<select data-gloss-p><option value="">Tutti i prezzi</option>${MK.PRICES.map(([l, v]) => `<option value="${esc(l)}" ${l === glossP ? "selected" : ""}>${esc(l)} (${v.toLocaleString("it-IT")} eb)</option>`).join("")}</select>
  <span class="hint">${n} voci</span></div>`;
const mkVisible = list => list.filter(it => isGm() || !mkHidden(it.id || it.key));
function shopBody(type) {
  const q = norm2(glossQ);
  const list = mkVisible(MK.all().filter(it => it.type === type))
    .filter(it => (!glossP || MK.priceCat(num(it.cost)) === glossP) && (!q || norm2(`${it.name} ${it.desc || ""} ${it.special || ""} ${it.src || ""} ${(CPR.weaponType(it.cat) || {}).label || ""}`).includes(q)));
  const name = it => `<td><b>${it.custom ? "★ " : ""}${esc(it.name)}</b>${mkTools(it.id, it)}${it.src ? `<small>${esc(it.src)}</small>` : ""}</td>`;
  const desc = it => `<td>${esc(it.desc || "")}${it.special ? `<small class="mk-sp">${esc(it.special)}</small>` : ""}</td>`;
  const cls = it => mkHidden(it.id) ? "mk-hid" : "";
  const buyTh = mkCanBuy() ? "<th></th>" : "";
  if (type === "weapon") {
    // raggruppate per categoria, nell'ordine di CPR.WEAPON_TYPES
    const groups = [...CPR.WEAPON_TYPES.map(t => [t.id, t.label]), ["", "Altro"]].filter(([c]) => list.some(it => (it.cat || "") === c));
    return `${mkFilters(list.length)}<div class="gl-wrap"><table class="gl-t mk-t">
      <thead><tr><th>Arma</th><th>Abilità</th><th>Danno</th><th>Car.</th><th>ROF</th><th>Mani</th><th>Occ.</th><th>Descrizione</th><th>Costo</th>${buyTh}</tr></thead>
      <tbody>${groups.map(([c, l]) => `<tr class="gl-grp"><th colspan="${mkCanBuy() ? 10 : 9}">${esc(l)}</th></tr>` + list.filter(it => (it.cat || "") === c).map(it => {
        const s = MK.weaponStats(it);
        return `<tr class="${cls(it)}">${name(it)}<td>${esc((CPR.skill(s.skill) || {}).label || s.skill)}</td>
          <td class="gl-n">${esc(s.dmg || "—")}${it.quality && it.quality !== "standard" ? `<small>${esc(MK.qualityLabel(it.quality))}</small>` : ""}</td><td class="gl-n">${s.mag || "—"}</td>
          <td class="gl-n">${s.rof}${s.auto ? `<small>auto ×${s.auto}</small>` : ""}</td><td class="gl-n">${s.hands}</td><td class="gl-n">${it.conceal ? "sì" : "no"}</td>${desc(it)}${mkCostCell(it.cost)}${mkBuyCell(it.id, it.cost)}</tr>`;
      }).join("")).join("")}</tbody></table></div>
      <p class="hint">Comprata, l'arma va nella tab Combattimento del PG con la tabella delle VD della sua categoria. Speciale e qualità finiscono nelle note (Excellent dà già +1 a colpire).</p>`;
  }
  if (type === "armor") return `${mkFilters(list.length)}<div class="gl-wrap"><table class="gl-t mk-t">
      <thead><tr><th>Armatura</th><th>SP</th><th>Malus a REF, DEX, MOVE</th><th>Descrizione</th><th>Costo</th>${buyTh}</tr></thead>
      <tbody>${list.map(it => `<tr class="${cls(it)}">${name(it)}<td class="gl-n">${it.sp}</td><td class="gl-n">${it.pen || "—"}</td>${desc(it)}${mkCostCell(it.cost)}${mkBuyCell(it.id, it.cost)}</tr>`).join("")}</tbody></table></div>
      <p class="hint">Un'armatura copre una sola zona: comprala due volte per testa e corpo. Si può indossare subito o metterla nell'inventario.</p>`;
  if (type === "deck") return deckShopBody(q, name, desc, buyTh);
  if (type === "drug") return drugShopBody(q, name, buyTh);
  const lab = it => it.label || (it.gcat === "veicoli" ? "Veicolo" : "Equipaggiamento");
  const labs = [...new Set(list.map(lab))].sort((a, b) => (a === "Equipaggiamento" ? -1 : b === "Equipaggiamento" ? 1 : a.localeCompare(b, "it")));
  return `${mkFilters(list.length)}<div class="gl-wrap"><table class="gl-t mk-t">
      <thead><tr><th>Oggetto</th><th>Descrizione</th><th>Costo</th>${buyTh}</tr></thead>
      <tbody>${labs.map(l => `<tr class="gl-grp"><th colspan="${mkCanBuy() ? 4 : 3}">${esc(l)}</th></tr>` + list.filter(it => lab(it) === l).map(it => `<tr class="${cls(it)}">${name(it)}${desc(it)}${mkCostCell(it.cost)}${mkBuyCell(it.id, it.cost)}</tr>`).join("")).join("")}</tbody></table></div>
      <p class="hint">I farmaci del Medtech non si comprano: li prepara il Medtech con la specialità Farmaceutica.</p>`;
}
// tab Munizioni: ogni calibro con la Standard e i tipi del GM («Tipi di munizioni e stati»), a lotti
function ammoShopBody() {
  const q = norm2(glossQ), buy = mkCanBuy(), who = mkWho();
  const rows = AMMO_FAMS.flatMap(fam => ammoTypesFor(fam).map(a => ({ fam, a, key: `ammo:${fam}:${a.id}`, cost: ammoCost(fam, a), lot: AMMO_LOT(fam) })))
    .filter(r => (isGm() || !mkHidden(r.key)) && (!glossP || MK.priceCat(r.cost) === glossP) && (!q || norm2(`${r.fam} ${r.a.name} ${r.a.eff || ""}`).includes(q)));
  const weaponsOf = fam => CPR.WEAPON_TYPES.filter(t => t.ammo === fam).map(t => t.label).join(", ");
  return `${mkFilters(rows.length)}<div class="gl-wrap"><table class="gl-t mk-t">
    <thead><tr><th>Munizioni</th><th>Effetto</th><th>Lotto</th><th>Costo</th>${buy ? "<th></th>" : ""}</tr></thead>
    <tbody>${AMMO_FAMS.filter(f => rows.some(r => r.fam === f)).map(f => `<tr class="gl-grp"><th colspan="${buy ? 5 : 4}">${esc(f)} <small>${esc(weaponsOf(f))}${who ? ` · ${esc(who.name)} ne ha ${ammoTypesFor(f).map(a => ammoStockN(who, f, a.id)).reduce((x, y) => x + y, 0)}` : ""}</small></th></tr>` +
      rows.filter(r => r.fam === f).map(r => `<tr class="${mkHidden(r.key) ? "mk-hid" : ""}"><td><b>${esc(r.a.name)}</b>${mkTools(r.key, null)}${who ? `<small>in scorta: ${ammoStockN(who, f, r.a.id)}</small>` : ""}</td>
        <td>${esc(ammoEff(r.a) || (r.a.id ? [num(r.a.atk) ? `${r.a.atk > 0 ? "+" : ""}${r.a.atk} a colpire` : "", r.a.dmg ? `danno ${r.a.dmg}` : "", num(r.a.dmgMod) ? `${r.a.dmgMod > 0 ? "+" : ""}${r.a.dmgMod} al danno` : ""].filter(Boolean).join(" · ") : "Munizioni base"))}</td>
        <td class="gl-n">${r.lot > 1 ? `${r.lot} colpi` : "1"}</td>${mkCostCell(r.cost)}${buy ? mkBuyCell(r.key, r.cost) : ""}</tr>`).join("")).join("")}</tbody></table></div>
    <p class="hint">Le munizioni comprate vanno nell'Equipaggiamento (Munizioni) e si caricano con «⟳ Ricarica» nella tab Combattimento: ogni attacco spara un colpo, autofire e soppressione 10. I tipi oltre la Standard (perforanti, incendiarie…) li definisce il GM in «Tipi di munizioni e stati», con il prezzo.</p>`;
}
// tab Cyberdeck: deck, programmi, Black ICE e hardware (questi ultimi dal catalogo NET)
const netShop = () => [
  ...NET.PROGRAMS.map(p => ({ key: "net:prog:" + p.id, grp: "Programmi", name: p.name, info: `${(NET.CLASSES[p.cls] || {}).label || ""} · ATK ${p.atk} · DEF ${p.def} · REZ ${p.rez}`, desc: p.eff, cost: p.cost, src: p.src })),
  ...NET.allIce().map(c => ({ key: "net:ice:" + c.id, grp: "Black ICE", name: NET.iceLabel(c), info: `${(NET.CLASSES[c.cls] || {}).short || ""} · PER ${c.per} · VEL ${c.spd} · ATK ${c.atk} · DEF ${c.def} · REZ ${c.rez} · 2 slot`, desc: c.eff, cost: num(c.cost), src: c.homebrew ? "★ homebrew" : c.src })),
  ...NET.HARDWARE.map(h => ({ key: "net:hw:" + h.id, grp: "Hardware", name: h.name, info: `${h.slots} slot`, desc: h.eff, cost: h.cost, src: h.src })),
];
function deckShopBody(q, name, desc, buyTh) {
  const buy = mkCanBuy(), ok = it => (isGm() || !mkHidden(it.id || it.key)) && (!glossP || MK.priceCat(num(it.cost)) === glossP) && (!q || norm2(`${it.name} ${it.desc || ""} ${it.special || ""} ${it.info || ""} ${it.src || ""}`).includes(q));
  const decks = MK.all().filter(it => it.type === "deck").filter(ok);
  const progs = MK.all().filter(it => it.type === "deckprog").map(it => ({ ...it, key: it.id, grp: it.cls === "hw" ? "Hardware" : it.cls === "ice" ? "Black ICE" : "Programmi",
    info: it.cls === "hw" ? `${it.slots || 1} slot` : `${it.cls === "ice" ? "Black ICE" : (NET.CLASSES[it.cls] || {}).short || ""} · ATK ${num(it.atk)} · DEF ${num(it.def)} · REZ ${num(it.rez)}${it.cls === "ice" ? ` · PER ${num(it.per)} · VEL ${num(it.spd)}` : ""} · ${it.slots || 1} slot`, custom: true })).filter(ok);
  const net = [...netShop().filter(ok), ...progs];
  const head = l => `<tr class="gl-grp"><th colspan="${buy ? 5 : 4}">${esc(l)}</th></tr>`;
  const row = (it, key, info) => `<tr class="${mkHidden(key) ? "mk-hid" : ""}"><td><b>${it.custom ? "★ " : ""}${esc(it.name)}</b>${mkTools(key, it.type === "deck" || it.type === "deckprog" ? it : null)}${it.src ? `<small>${esc(it.src)}</small>` : ""}</td><td class="mk-info">${esc(info)}</td>${desc(it)}${mkCostCell(it.cost)}${mkBuyCell(key, it.cost)}</tr>`;
  return `${mkFilters(decks.length + net.length)}<div class="gl-wrap"><table class="gl-t mk-t mk-deck">
    <thead><tr><th>Nome</th><th>Slot / dati</th><th>Descrizione</th><th>Costo</th>${buyTh}</tr></thead>
    <tbody>${decks.length ? head("Cyberdeck") + decks.map(it => row(it, it.id, `${it.slots} slot`)).join("") : ""}
      ${["Programmi", "Black ICE", "Hardware"].map(g => { const l = net.filter(x => x.grp === g); return l.length ? head(g) + l.map(it => row(it, it.key, it.info)).join("") : ""; }).join("")}</tbody></table></div>
    <p class="hint">Un cyberdeck comprato si aggiunge ai deck del PG (tab Cyberdeck) con le sue regole nelle note. Programmi, Black ICE e hardware vanno nel deck che scegli, o nell'inventario.</p>`;
}

// ---------- acquisto ----------
// slot adatti al gruppo del cyberware (le parti doppie destra e sinistra)
const mkCySlots = (e, c) => {
  const pairs = { optics: ["occhio_dx", "occhio_sx"], arm: ["braccio_dx", "braccio_sx"], leg: ["gamba_dx", "gamba_sx"], limbcover: ["braccio_dx", "braccio_sx", "gamba_dx", "gamba_sx"] };
  const g = CW.GROUPS.find(x => x.id === c.g) || {}, want = c.chip || c.id === "chipslot" ? ["alveolo"] : pairs[c.g] || [g.slot].filter(Boolean);
  const all = slotsOf(e), fit = all.filter(s => want.includes(s.id));
  return { fit: fit.length ? fit : all, other: all.filter(s => !fit.includes(s)) };
};
const mkItemOf = key => {
  if (key.startsWith("ammo:")) {
    const [, fam, aid = ""] = key.split(":"), a = ammoTypesFor(fam).find(t => t.id === aid); if (!a) return null;
    const lot = AMMO_LOT(fam);
    return { type: "ammo", key, id: key, name: `${fam} · ${a.name}`, fam, ammo: a.id, lot, cost: ammoCost(fam, a), desc: `${lot > 1 ? `Scatola da ${lot} colpi` : "Un pezzo"} per ${CPR.WEAPON_TYPES.filter(t => t.ammo === fam).map(t => t.label).join(", ")}${a.eff ? ` · ${a.eff}` : ""}` };
  }
  if (key.startsWith("cw:")) return (c => c && { ...c, type: "cyber", key })(CW.byId(key.slice(3)));
  if (key.startsWith("net:")) { const it = netShop().find(x => x.key === key); return it && { ...it, type: "netitem", ref: key.slice(4), id: key }; }
  const m = MK.byId(key);
  if (m && m.type === "deckprog") return { ...m, key, deckItem: { ref: "custom", name: m.name, cls: m.cls || "antipersonnel", atk: num(m.atk), def: num(m.def), rez: num(m.rez), per: num(m.per), spd: num(m.spd), slots: num(m.slots) || 1, dmg: m.dmg || "", eff: m.eff || m.desc || "" } };
  return (it => it && { ...it, key })(MK.byId(key));
};

function mkBuy(key) {
  const e = mkWho(), it = mkItemOf(key); if (!e || !it || !mkCanBuy()) return;
  const gm = isGm(), price = mkPrice(it.cost), money = moneyOf(e);
  let extra = "";
  if (it.type === "weapon") extra = `<p class="hint">Va nella tab Combattimento: ${esc(MK.weaponStats(it).dmg)} · ROF ${MK.weaponStats(it).rof}${it.special ? ` · ${esc(it.special)}` : ""}</p>`;
  if (it.type === "armor") {
    const s = sheetOf(e), cur = l => { const a = (s.armor || {})[l] || {}; return a.name ? `${a.name} SP ${num(a.sp)}` : "niente"; };
    extra = `<div class="field"><label>Per</label><select name="loc">${it.both ? `<option value="both">testa e corpo (tuta intera)</option>`
      : `<option value="body">il corpo (ora: ${esc(cur("body"))})</option><option value="head">la testa (ora: ${esc(cur("head"))})</option>`}</select>
      <span class="hint">Si potrà indossare solo lì.</span></div>
      <div class="field"><label class="check"><input type="checkbox" name="wear" checked> Indossala subito</label></div>`;
  }
  if (it.type === "deck") extra = `<p class="hint">Si aggiunge ai cyberdeck di ${esc(e.name)}: ${it.slots} slot · ${esc(it.special || "")}</p>`;
  if (it.type === "drug") extra = `<div class="field"><label>Dosi</label><input name="qty" type="number" min="1" max="99" value="1"></div><p class="hint field full">${it.dur ? `Dura ${esc(it.dur)} · ` : ""}VD ${it.dv || "—"} · ${esc(it.primary || "")}</p>`;
  if (it.type === "netitem" || it.type === "deckprog") {
    const ds = decksOf(e);
    extra = `<div class="field full"><label>Mettilo in</label><select name="deck">${ds.map((d, i) => { const S = NET.deckSlots(d); return `<option value="${i}" ${i === deckIdx(e) ? "selected" : ""}>${esc(d.name || `Cyberdeck ${i + 1}`)} · slot ${S.used}/${S.total}</option>`; }).join("")}<option value="">nell'inventario, da installare dopo</option></select>
      ${ds.length ? "" : `<span class="hint">${esc(e.name)} non ha un cyberdeck: va nell'inventario.</span>`}</div><p class="mk-warn field full" data-mk-cap></p>`;
  }
  if (it.type === "ammo") extra = `<div class="field"><label>${it.lot > 1 ? `Scatole da ${it.lot} colpi` : "Quantità"}</label><input name="qty" type="number" min="1" max="99" value="1"></div><p class="hint field full">In scorta: ${ammoStockN(e, it.fam, it.ammo)}. Vanno nell'Equipaggiamento; si caricano con «⟳ Ricarica» nella tab Combattimento.</p>`;
  if (it.type === "gear") extra = `<div class="field"><label>Quantità</label><input name="qty" type="number" min="1" max="99" value="1"></div>`;
  if (it.type === "cyber") {
    const { fit, other } = mkCySlots(e, it), base = !!it.base || it.id === "chipslot";
    const opt = s => { const b = base ? baseState(e, s.id) : null, on = b && !b.fixed && b.on, more = on && it.id === "chipslot";
      return `<option value="${esc(s.id)}" ${on && !more ? "disabled" : ""}>${esc(s.label)}${more ? ` (ne hai già ${b.slots}: +1 slot)` : on ? " (già attivo)" : ""}</option>`; };
    const pu = CW.rollPu(it);
    extra = `<div class="field"><label>${base ? "Si attiva su" : "Slot"}</label><select name="slot">${fit.map(opt).join("")}${other.length && !base ? `<optgroup label="Altri slot">${other.map(opt).join("")}</optgroup>` : ""}${base ? "" : `<option value="idle">⏸ Idle: non installato, lo installi dopo</option>`}</select></div>
      <div class="field"><label>Umanità persa (HL)</label><div class="mk-hl"><input name="hl" type="number" min="0" value="${pu.total}"><button type="button" class="gp-btn" data-mk-pu title="Tira ${esc(it.dice)}">⚄</button></div><span class="hint">${it.dice && it.dice !== "N/A" ? `${esc(it.dice)}, media ${it.pu}` : "nessuna"}${pu.dice.length ? ` · tirato: ${pu.dice.join(" + ")}` : ""}</span></div>
      ${it.id === "skillchip" ? `<div class="field"><label>Livello del chip</label><select name="lvl"><option value="3">3</option><option value="4">4</option></select></div><div class="field"><label>Abilità del chip</label><select name="param">${CPR.SKILLS.map(k => `<option value="${k.id}">${esc(k.label)}</option>`).join("")}</select></div>` : ""}
      ${it.req ? `<p class="hint field full">Richiede: ${esc(it.req)}</p>` : ""}
      <p class="mk-warn field full" data-mk-cap></p>`;
  }
  openModal(`
    <form class="form" id="mk-form">
      <div class="modal-head"><h2>// COMPRA</h2><button type="button" class="x" data-action="close" aria-label="Chiudi">×</button></div>
      <div class="modal-body">
        <div class="mk-sum"><b>${esc(it.name)}</b><span>${esc(it.desc || "")}</span></div>
        <div class="fields">${extra}</div>
        <div class="mk-pay">
          <div><span class="l">${esc(e.name)} ha</span><b>${fmtEb(money)}</b></div>
          <div><span class="l">Prezzo</span><b data-mk-tot>${fmtEb(price)}</b></div>
          <div><span class="l">Restano</span><b data-mk-left>${fmtEb(money - price)}</b></div>
        </div>
        ${gm ? `<label class="check"><input type="checkbox" name="free"> Senza pagare (regalo del GM, bottino…)</label>` : ""}
        <p class="mk-warn" data-mk-poor></p>
      </div>
      <div class="modal-foot"><button type="button" class="btn ghost small left" data-action="close">Annulla</button><button type="submit" class="btn" data-mk-ok>Compra</button></div>
    </form>`, true);
  const form = $("#mk-form"), F = n => form.elements[n];
  // Chip Abilità: 1.000 eb per le abilità ×2, 500 per le altre
  const unit = () => it.id === "skillchip" && F("param") && (CPR.skill(F("param").value) || {}).x2 ? mkPrice(1000) : price;
  const total = () => F("free") && F("free").checked ? 0 : unit() * (F("qty") ? Math.max(1, Math.trunc(num(F("qty").value)) || 1) : 1);
  const upd = () => {
    const t = total(), left = money - t;
    $("[data-mk-tot]", form).textContent = fmtEb(t); $("[data-mk-left]", form).textContent = fmtEb(left);
    $("[data-mk-left]", form).classList.toggle("neg", left < 0);
    const poor = left < 0;
    $("[data-mk-poor]", form).textContent = poor ? (gm ? "Gli eddies non bastano: comprando vai in negativo." : "Gli eddies non bastano.") : "";
    $("[data-mk-ok]", form).disabled = poor && !gm;
    const cap = $("[data-mk-cap]", form);
    if (cap && (it.type === "netitem" || it.type === "deckprog")) {
      const v = F("deck").value, d = v === "" ? null : decksOf(e)[num(v)];
      if (!d) cap.textContent = "";
      else { const S = NET.deckSlots({ ...d, items: [...(d.items || []), it.deckItem || { ref: it.ref }] }); cap.textContent = S.over ? `Il deck è pieno: slot ${S.used}/${S.total}.` : `Slot dopo l'acquisto: ${S.used}/${S.total}.`; }
    }
    if (cap && it.type === "cyber") {
      const sl = F("slot").value, items = (((e.cyber || {}).slots || {})[sl]) || [];
      if (it.base) cap.textContent = "";
      else if (it.id === "chipslot") { const b = baseState(e, "alveolo"); cap.textContent = b && b.on ? `Hai già un Alveolo da ${b.slots} slot: questo ne aggiunge uno (${b.slots + 1} chip).` : "Attiva l'Alveolo: tiene 1 chip e occupa 1 slot del Collegamento Neurale."; }
      else if (sl === "idle") cap.textContent = "In idle: niente effetti e niente umanità persa finché non lo installi (in qualsiasi slot, dall'Equipaggiamento o dalla tab Cyberware).";
      else { const u = slotUse(sl, [...items, { name: it.name, ref: it.id }], baseState(e, sl)), art = n => /^[aeiou]/i.test(n) ? "l'" : "il ";
        cap.textContent = !u ? "" : u.missing ? `Manca ${art(u.missing)}${u.missing}: attivalo prima o insieme.` : u.over ? `Slot pieno: ${u.label} ${u.used}/${u.cap}.` : `${u.label === "chip" ? "Chip" : "Opzioni"} dopo l'acquisto: ${u.used}/${u.cap}.`; }
    }
  };
  form.addEventListener("input", upd); form.addEventListener("change", upd); upd();
  const puBtn = $("[data-mk-pu]", form);
  puBtn && puBtn.addEventListener("click", () => { const r = CW.rollPu(it); F("hl").value = r.total; toast(`Umanità persa: ${r.total}${r.dice.length ? ` (${r.dice.join(" + ")})` : ""}`); });
  form.addEventListener("submit", ev => {
    ev.preventDefault();
    const paid = total(), qty = F("qty") ? Math.max(1, Math.trunc(num(F("qty").value)) || 1) : 1;
    if (money - paid < 0 && !gm) return;
    mkCommit(e, it, paid, qty, { loc: F("loc") ? F("loc").value : "", wear: F("wear") ? F("wear").checked : false, slot: F("slot") ? F("slot").value : "", hl: F("hl") ? num(F("hl").value) : 0, param: F("param") ? F("param").value : "", lvl: F("lvl") ? F("lvl").value : "", deck: F("deck") ? F("deck").value : "" });
  });
}

async function mkCommit(e0, it, paid, qty, o) {
  const e = JSON.parse(JSON.stringify(e0)), s = e.sheet = e.sheet || {}, gear = e.gear = e.gear || {};
  gear.items = gear.items || [];
  let undo = {};
  const addGear = (cat, name, detail, n, cost) => {
    const old = gear.items.find(x => norm2(x.name) === norm2(name) && (x.cat || "altro") === cat);
    if (old) old.qty = Math.max(1, num(old.qty) || 1) + n; else gear.items.push({ cat, name, qty: n, ...(detail ? { detail } : {}), ...(cost ? { cost } : {}) });
  };
  if (it.type === "weapon") { s.weapons = [...(s.weapons || []), MK.toSheetWeapon(it)]; undo = { k: "weapon" }; }
  if (it.type === "ammo") { ammoAdd(e, it.fam, it.ammo, qty * it.lot); undo = { k: "ammo", fam: it.fam, ammo: it.ammo, n: qty * it.lot }; }
  if (it.type === "gear") {
    addGear(it.gcat || "equip", it.name, "", qty, mkPrice(it.cost)); undo = { k: "gear", cat: it.gcat || "equip", qty };
    if (it.gcat === "vestiti") { const g = gear.items.find(x => x.cat === "vestiti" && norm2(x.name) === norm2(it.name)); if (g) Object.assign(g, { ...(it.wtype ? { type: it.wtype } : {}), ...(it.style ? { style: it.style } : {}) }); }
    // il bonus dell'oggetto va nel riquadro «Bonus a STAT e abilità», legato all'oggetto (una volta sola)
    (it.bonus || []).forEach(b => { if (!(s.bonuses || []).some(x => x.item === it.name && x.target === b.target)) s.bonuses = [...(s.bonuses || []), { id: NET.uid(), ...b, item: it.name, market: it.id }]; });
  }
  if (it.type === "armor") {
    const gl = it.both ? "both" : o.loc === "head" ? "head" : "body";
    // stessa armatura per la stessa zona: una copia in più; per l'altra zona: una voce a parte
    const old = gear.items.find(x => x.cat === "armature" && norm2(x.name) === norm2(it.name) && x.loc === gl);
    if (old) old.qty = Math.max(1, num(old.qty) || 1) + 1;
    else gear.items.push({ cat: "armature", name: it.name, qty: 1, detail: `SP ${it.sp}${it.pen ? ` · ${it.pen} REF/DEX/MOVE` : ""} · per ${ARMOR_LOC[gl]}`, ...(mkPrice(it.cost) ? { cost: mkPrice(it.cost) } : {}), sp: it.sp, pen: num(it.pen), loc: gl, ...(it.both ? { both: true } : {}) });
    undo = { k: "armor", loc: o.wear ? gl : "", gloc: gl, prevs: {} };
    const T = CPR.ARMOR_TYPES.find(t => t.sp && norm(t.label) === norm(it.name));
    (!o.wear ? [] : gl === "both" ? ["head", "body"] : [gl]).forEach(l => {
      s.armor = s.armor || {}; undo.prevs[l] = s.armor[l] || null;
      s.armor[l] = { name: it.name, sp: it.sp, cur: it.sp, type: T ? T.id : "custom", pen: num(it.pen) };
    });
  }
  if (it.type === "deck") {
    migrateDecks(s); s.decks.push({ name: it.name, slots: it.slots, items: [], note: it.special || "" });
    undo = { k: "deck" };
  }
  if (it.type === "netitem" || it.type === "deckprog") {
    const i = o.deck === "" ? -1 : num(o.deck), di = it.deckItem || { ref: it.ref };
    if (i >= 0 && decksOf(e)[i]) { migrateDecks(s); s.decks[i].items = [...(s.decks[i].items || []), di]; undo = { k: "deckitem", deck: i, ref: di.ref, name: di.name || "" }; }
    else { netGearAdd(gear.items, di); const g = gear.items.find(x => x.cat === NET_CAT && netSame(netGearItem(x), di)); if (g && !g.cost) g.cost = mkPrice(it.cost); undo = { k: "gear", cat: NET_CAT, qty: 1 }; }
  }
  if (it.type === "drug") {
    const old = gear.items.find(x => x.cat === "droghe" && (x.drug === it.id || norm2(x.name) === norm2(it.name)));
    if (old) old.qty = (num(old.qty) || 1) + qty; else gear.items.push({ cat: "droghe", name: it.name, qty, drug: it.id, detail: `${it.dur ? it.dur + " · " : ""}VD ${it.dv || "—"}`, cost: mkPrice(it.cost) });
    undo = { k: "gear", cat: "droghe", qty };
  }
  if (it.type === "cyber") {
    const cy = e.cyber = e.cyber || {};
    if (it.base || it.id === "chipslot") {
      cy.bases = cy.bases || {}; undo = { k: "base", slot: o.slot, prev: cy.bases[o.slot] || null };
      const B = SLOT_BASE[slotKind(o.slot)], was = baseState(e0, o.slot);
      // un altro Alveolo: +1 slot, e costo, umanità persa e umanità massima si sommano
      if (it.id === "chipslot" && was && was.on) cy.bases[o.slot] = { on: true, slots: was.slots + 1, cost: was.cost + (paid || num(it.cost)), hl: was.hl + o.hl, max: was.max + 2 };
      else cy.bases[o.slot] = { ...(cy.bases[o.slot] || {}), on: true, slots: (cy.bases[o.slot] || {}).slots ?? (B ? B[1] : 3), cost: paid || it.cost, hl: o.hl, max: 2 };
    } else {
      cy.slots = cy.slots || {};
      // in idle: non montato, l'umanità (già tirata) si perde quando si installa
      cy.slots[o.slot] = [...(cy.slots[o.slot] || []), { name: it.name, ref: it.id, cost: paid || num(it.cost), hl: o.hl, ...(o.slot === "idle" ? { installed: false, fresh: true } : { installed: true }), ...(o.param ? { param: o.param, lvl: +o.lvl === 4 ? 4 : 3 } : {}) }];
      undo = { k: "cyber", slot: o.slot };
    }
  }
  if (paid) gear.money = num(gear.money) - paid;
  gear.log = [...(gear.log || []), { at: new Date().toISOString(), id: it.key || it.id, name: it.name, type: it.type, cost: paid, qty, undo }];
  try {
    const saved = await Store.save("entries", e);
    upsert(state.entries, saved); liveSend("entries", saved);
    closeModal(); route(); refreshParty();
    toast(`${it.name}${qty > 1 ? ` ×${qty}` : ""} comprato${paid ? ` (−${fmtEb(paid)})` : ""}${it.type === "cyber" ? (o.slot === "idle" ? " · in idle" : ` · −${o.hl} umanità`) : ""}`, "ok");
  } catch (err) { fail(err); }
}

// storico degli acquisti e annullamento dell'ultimo
function mkHistory(id) {
  const e = state.entries.find(x => x.id === id); if (!e) return;
  const log = mkLog(e), T = Object.fromEntries(MK.TYPES);
  openModal(`<div class="form">
    <div class="modal-head"><h2>// ACQUISTI · ${esc(e.name)}</h2><button type="button" class="x" data-action="close" aria-label="Chiudi">×</button></div>
    <div class="modal-body">${log.length ? `<ul class="mk-log">${[...log].reverse().map(l => `<li><span class="d">${esc(new Date(l.at).toLocaleDateString("it-IT"))}</span><b>${esc(l.name)}${l.qty > 1 ? ` ×${l.qty}` : ""}</b><span class="hint">${esc(T[l.type] || { ammo: "Munizioni", expense: "Spese mensili", battery: "Batteria" }[l.type] || "")}</span><span class="c">${l.cost ? "−" + fmtEb(l.cost) : "gratis"}</span></li>`).join("")}</ul>`
      : `<p class="hint">Nessun acquisto dal Night Market.</p>`}</div>
    <div class="modal-foot">${log.length && Store.canEdit() ? `<button type="button" class="btn ghost small left danger" data-action="mk-undo" data-id="${esc(e.id)}">Annulla l'ultimo (${esc(log[log.length - 1].name)})</button>` : ""}<button type="button" class="btn" data-action="close">Chiudi</button></div>
  </div>`, true);
}
async function mkUndo(id) {
  const e0 = state.entries.find(x => x.id === id), last = mkLog(e0).slice(-1)[0]; if (!e0 || !last || !Store.canEdit()) return;
  if (!(await askConfirm(`Annullare l'acquisto di «${last.name}»? Torna${last.cost ? `no ${fmtEb(last.cost)}` : " tutto com'era"} e l'oggetto sparisce dalla scheda.`, "Annulla l'acquisto"))) return;
  const e = JSON.parse(JSON.stringify(e0)), s = e.sheet = e.sheet || {}, gear = e.gear, u = last.undo || {};
  const dropGear = (cat, n) => { const g = (gear.items || []).find(x => norm2(x.name) === norm2(last.name) && (x.cat || "altro") === cat); if (!g) return; g.qty = (num(g.qty) || 1) - n; if (g.qty <= 0) gear.items = gear.items.filter(x => x !== g); };
  const lastIdx = (arr, f) => { for (let i = arr.length - 1; i >= 0; i--) if (f(arr[i])) return i; return -1; };
  if (u.k === "ammo") ammoAdd(e, u.fam, u.ammo, -num(u.n));
  if (u.k === "weapon") { const w = s.weapons || [], i = lastIdx(w, x => x.market === last.id || norm2(x.name) === norm2(last.name)); if (i >= 0) w.splice(i, 1); }
  if (u.k === "gear") {
    dropGear(u.cat || "equip", u.qty || 1);
    if (!(gear.items || []).some(x => norm2(x.name) === norm2(last.name))) s.bonuses = (s.bonuses || []).filter(b => !(b.market && b.item === last.name));
  }
  if (u.k === "armor") {
    if (u.gloc) { const g = (gear.items || []).find(x => x.cat === "armature" && norm2(x.name) === norm2(last.name) && x.loc === u.gloc); if (g) { g.qty = (num(g.qty) || 1) - 1; if (g.qty <= 0) gear.items = gear.items.filter(x => x !== g); } }
    else dropGear("armature", 1);
    s.armor = s.armor || {};
    const prevs = u.prevs || (u.loc ? { [u.loc]: u.prev || null } : {});
    Object.entries(prevs).forEach(([l, p]) => { if (p) s.armor[l] = p; else delete s.armor[l]; });
  }
  if (u.k === "deck") { migrateDecks(s); const i = lastIdx(s.decks, d => norm2(d.name) === norm2(last.name)); if (i >= 0) { s.decks.splice(i, 1); s.deckActive = clamp(num(s.deckActive), 0, Math.max(0, s.decks.length - 1)); } }
  if (u.k === "deckitem") { migrateDecks(s); const d = s.decks[u.deck]; if (d) { const i = lastIdx(d.items || [], x => x.ref === u.ref && (!u.name || x.name === u.name)); if (i >= 0) d.items.splice(i, 1); } }
  if (u.k === "base") { const b = (e.cyber || {}).bases || {}; if (u.prev) b[u.slot] = u.prev; else delete b[u.slot]; }
  if (u.k === "cyber") { const l = ((e.cyber || {}).slots || {})[u.slot] || [], i = lastIdx(l, x => x.ref === last.id.replace(/^cw:/, "") || norm2(x.name) === norm2(last.name)); if (i >= 0) l.splice(i, 1); }
  if (last.cost) gear.money = num(gear.money) + last.cost;
  gear.log = gear.log.slice(0, -1);
  try {
    const saved = await Store.save("entries", e);
    upsert(state.entries, saved); liveSend("entries", saved);
    route(); refreshParty(); mkHistory(saved.id); toast(`Annullato: ${last.name}`, "ok");
  } catch (err) { fail(err); }
}

// ---------- impostazioni del GM ----------
async function mkSaveCfg(patch) {
  if (!isGm() || !Store.canEdit()) return;
  try { const saved = await Store.save("meta", { ...mkCfg(), ...patch, id: "market" }); state.market = saved; liveSend("meta", saved); route(); }
  catch (err) { fail(err); }
}

// ---------- importazione (formato a blocchi) ----------
// key = voce da modificare (testo precompilato, la voce mantiene il suo id)
function mkImport(key) {
  if (!isGm() || !Store.canEdit()) return;
  const it = key ? mkItemOf(key) : null;
  openModal(`
    <form class="form" id="mk-imp">
      <div class="modal-head"><h2>// ${it ? "MODIFICA VOCE" : "IMPORTA NEL CATALOGO"}</h2><button type="button" class="x" data-action="close" aria-label="Chiudi">×</button></div>
      <div class="modal-body">
        ${it ? "" : `<p class="hint">Incolla una o più voci (armi, armature, equipaggiamento, cyberware) nel formato a blocchi, oppure carica un file .txt / .md. Sotto vedi cosa verrà aggiunto prima di salvare. Una voce con lo stesso nome di una già importata la aggiorna.</p>
        <div class="mk-imp-tools"><label class="btn ghost small">Carica file<input type="file" accept=".txt,.md,text/plain,text/markdown" data-mk-file hidden></label>
          <button type="button" class="btn ghost small" data-mk-tpl>Inserisci un esempio</button></div>`}
        <textarea name="txt" rows="${it ? 14 : 12}" class="mk-txt" spellcheck="false" placeholder="## Nome dell'oggetto&#10;Tipo: Arma&#10;Categoria: Heavy Pistol&#10;Costo: 500&#10;Descrizione: …">${esc(it ? MK.toText(it) : "")}</textarea>
        <details class="mk-help"><summary>Formato e chiavi</summary>
          <p>Ogni voce inizia con <code>## Nome</code> (va bene anche <code>▶ Nome</code>). Sotto, una chiave per riga, <code>Chiave: valore</code>, in italiano o in inglese. Le righe senza chiave continuano la descrizione.</p>
          <ul>
            <li><b>Tutti</b>: Tipo (Arma, Armatura, Equipaggiamento, Cyberware), Costo, Descrizione, Fonte</li>
            <li><b>Arma</b>: Categoria (Heavy Pistol, SMG, Assault Rifle, Medium Melee Weapon…), Abilità, Danno, Caricatore, ROF, Mani, Occultabile (sì/no), Autofire (moltiplicatore), Qualità (Poor, Excellent, Exotic), Speciale</li>
            <li><b>Armatura</b>: SP, Malus (a REF, DEX e MOVE)</li>
            <li><b>Equipaggiamento</b>: Categoria (es. Veicolo)</li>
            <li><b>Cyberware</b>: Gruppo (Fashionware, Neuralware, Cyberottiche, Cyberudito, Impianti Interni, Impianti Esterni, Cyberbraccio, Cybergamba, Borgware), Installazione, PU (es. <code>2d6 (7)</code>), Slot, Richiede</li>
          </ul>
          <p>Le statistiche che mancano a un'arma si prendono dalla sua categoria. Gli effetti automatici del cyberware (bonus alle abilità…) si aggiungono poi con ✎ nella tab Cyberware.</p>
        </details>
        <div class="mk-prev" data-mk-prev></div>
      </div>
      <div class="modal-foot">
        ${it && it.custom ? `<button type="button" class="btn ghost small left danger" data-mk-del>${MK.BASE.some(b => b.id === it.id) ? "Ripristina l'originale" : "Elimina"}</button>` : `<button type="button" class="btn ghost small left" data-action="close">Annulla</button>`}
        <button type="submit" class="btn" data-mk-save>${it ? "Salva" : "Importa"}</button>
      </div>
    </form>`);
  const form = $("#mk-imp"), ta = form.elements.txt, T = Object.fromEntries(MK.TYPES);
  const parsed = () => {
    const r = MK.parse(ta.value);
    if (it && r.items.length === 1) r.items[0].id = it.id;   // la voce modificata tiene il suo id
    return r;
  };
  const exists = x => x.type === "cyber" ? ((state.cyberhb || {}).items || []).some(y => y.id === x.id) : ((state.markethb || {}).items || []).some(y => y.id === x.id);
  const prev = () => {
    const r = parsed(), box = $("[data-mk-prev]", form);
    const count = MK.TYPES.map(([t, l]) => [l, r.items.filter(x => x.type === t).length]).filter(x => x[1]).map(([l, n]) => `${l} ${n}`).join(" · ");
    box.innerHTML = !ta.value.trim() ? "" : `<h4>Anteprima: ${r.items.length ? count : "nessuna voce valida"}</h4>
      ${r.items.length ? `<ul>${r.items.map(x => {
        const info = x.type === "weapon" ? `${(CPR.weaponType(x.cat) || {}).label || x.cat} · ${MK.weaponStats(x).dmg} · car. ${MK.weaponStats(x).mag || "—"}` : x.type === "armor" ? `SP ${x.sp}${x.pen ? ` · ${x.pen}` : ""}` : x.type === "cyber" ? `${(CW.GROUPS.find(g => g.id === x.g) || {}).label} · PU ${x.dice}` : x.label || "";
        return `<li><span class="mk-tag ${x.type}">${esc(T[x.type])}</span><b>${esc(x.name)}</b> <span class="hint">${esc(info)} · ${num(x.cost).toLocaleString("it-IT")} eb</span>${exists(x) || it ? ` <em>aggiorna</em>` : ` <em class="new">nuova</em>`}</li>`;
      }).join("")}</ul>` : ""}
      ${r.errors.length ? `<ul class="mk-err">${r.errors.map(x => `<li>⚠ ${esc(x)}</li>`).join("")}</ul>` : ""}`;
    $("[data-mk-save]", form).disabled = !r.items.length || (it && r.items.length !== 1);
  };
  ta.addEventListener("input", prev); prev();
  const tpl = $("[data-mk-tpl]", form); tpl && tpl.addEventListener("click", () => { ta.value = MK.TEMPLATE; prev(); });
  const file = $("[data-mk-file]", form);
  file && file.addEventListener("change", async () => { const f = file.files[0]; if (!f) return; if (f.size > 2e6) return toast("File troppo grande (max 2 MB)", "err"); ta.value = await f.text(); prev(); });
  const saveAll = async (mk, cy) => {
    try {
      if (mk) { const saved = await Store.save("meta", { ...(state.markethb || {}), id: "markethb", items: mk }); state.markethb = saved; MK.setHomebrew(saved); liveSend("meta", saved); }
      if (cy) { const saved = await Store.save("meta", { ...cyberHbRec(), id: "cyberhb", items: cy }); state.cyberhb = saved; CW.setHomebrew(saved); liveSend("meta", saved); }
      closeModal(); route(); return true;
    } catch (err) { fail(err); return false; }
  };
  const del = $("[data-mk-del]", form);
  del && del.addEventListener("click", async () => {
    const base = MK.BASE.some(b => b.id === it.id);
    if (!(await askConfirm(`${base ? "Ripristinare la versione originale di" : "Eliminare dal catalogo"} «${it.name}»? Gli oggetti già comprati restano nelle schede.`, base ? "Ripristina" : "Elimina"))) return;
    if (await saveAll(((state.markethb || {}).items || []).filter(x => x.id !== it.id), null)) toast("Fatto", "ok");
  });
  form.addEventListener("submit", async ev => {
    ev.preventDefault();
    const r = parsed(); if (!r.items.length) return;
    const strip = ({ custom, key, ...x }) => x;
    const mkNew = r.items.filter(x => x.type !== "cyber").map(strip), cyNew = r.items.filter(x => x.type === "cyber").map(strip);
    const merge = (old, add, keepFx) => { const out = [...old]; add.forEach(x => { const i = out.findIndex(y => y.id === x.id); if (i >= 0) out[i] = keepFx ? { ...x, fx: out[i].fx || [] } : x; else out.push(x); }); return out; };
    const ok = await saveAll(mkNew.length ? merge((state.markethb || {}).items || [], mkNew) : null, cyNew.length ? merge(cyberHbRec().items || [], cyNew, true) : null);
    if (ok) toast(`${it ? "Voce salvata" : `Importate ${r.items.length} voci`}${r.errors.length ? ` · ${r.errors.length} scartate` : ""}`, "ok");
  });
}


// ---------- voci custom in ogni sezione (meta "markethb") ----------
// stesso modulo per armi, armature, oggetti, cyberdeck, programmi/hardware e droghe; con un id di una voce base la sostituisce
const MK_FORMS = {
  weapon: { title: "ARMA", fields: () => [
    ["name", "Nome", "text", { req: true, full: true }],
    ["cat", "Categoria (VD e autofire)", "select", { opts: CPR.WEAPON_TYPES.map(t => [t.id, t.label]), def: "hpistol" }],
    ["skill", "Abilità", "select", { opts: [["", "quella della categoria"], ...CPR.WEAPON_SKILLS.map(k => [k, CPR.skill(k).label])] }],
    ["dmg", "Danno", "text", { ph: "vuoto = quello della categoria" }], ["mag", "Caricatore", "num"], ["rof", "ROF", "num"], ["hands", "Mani", "num", { def: 1 }],
    ["auto", "Autofire (× massimo)", "num", { ph: "vuoto = categoria" }],
    ["quality", "Qualità", "select", { opts: [["standard", "Standard"], ["poor", "Poor"], ["excellent", "Excellent (+1 a colpire)"]] }],
    ["conceal", "Occultabile", "chk"], ["exotic", "Esotica", "chk"],
    ["cost", "Costo (eb)", "num", { def: 500 }], ["src", "Fonte", "text"],
    ["special", "Speciale (va nelle note dell'arma)", "area", { full: true }], ["desc", "Descrizione", "area", { full: true }]] },
  armor: { title: "ARMATURA", fields: () => [
    ["name", "Nome", "text", { req: true, full: true }], ["sp", "SP", "num", { req: true, def: 11 }], ["pen", "Malus a REF, DEX, MOVE", "num", { ph: "0, 2, 4…" }],
    ["both", "Copre sempre testa e corpo", "chk"], ["cost", "Costo (eb)", "num", { def: 100 }], ["src", "Fonte", "text"], ["desc", "Descrizione", "area", { full: true }]] },
  gear: { title: "OGGETTO", fields: () => [
    ["name", "Nome", "text", { req: true, full: true }], ["label", "Tipo", "text", { list: [...new Set(MK.all().filter(x => x.type === "gear").map(x => x.label).filter(Boolean))], ph: "es. Attrezzo, Scudo, Granata" }],
    ["gdest", "Va in", "select", { opts: [["equip", "Equipaggiamento"], ["veicoli", "Veicoli"], ["vestiti", "Vestiti (Wardrobe)"]] }],
    ["wtype", "Tipo di vestito", "select", { opts: [["", "—"], ...WD_TYPES] }], ["style", "Stile (vestiti)", "text", { list: WD_STYLES }],
    ["cost", "Costo (eb)", "num", { def: 100 }], ["src", "Fonte", "text"], ["desc", "Descrizione", "area", { full: true }]] },
  deck: { title: "CYBERDECK", fields: () => [
    ["name", "Nome", "text", { req: true, full: true }], ["slots", "Slot", "num", { req: true, def: 7 }], ["cost", "Costo (eb)", "num", { def: 500 }], ["src", "Fonte", "text"],
    ["special", "Regole del deck", "area", { full: true, ph: "es. solo programmi · un Jack Out non sicuro conta come sicuro" }], ["desc", "Descrizione", "area", { full: true }]] },
  deckprog: { title: "PROGRAMMA / HARDWARE", fields: () => [
    ["name", "Nome", "text", { req: true, full: true }],
    ["cls", "Tipo", "select", { opts: [...Object.entries(NET.CLASSES).map(([k, c]) => [k, "Programma " + c.label]), ["ice", "Black ICE"], ["hw", "Hardware"]], def: "antipersonnel" }],
    ["atk", "ATK", "num"], ["def", "DEF", "num"], ["rez", "REZ", "num"], ["per", "PER (Black ICE)", "num"], ["spd", "VEL (Black ICE)", "num"], ["slots", "Slot", "num", { def: 1 }],
    ["dmg", "Danno", "text", { ph: "es. 2d6" }], ["cost", "Costo (eb)", "num", { def: 100 }], ["src", "Fonte", "text"], ["desc", "Effetto", "area", { full: true }]] },
  drug: { title: "DROGA", fields: () => [
    ["name", "Nome", "text", { req: true, full: true }], ["dur", "Durata", "text", { ph: "es. 4 ore" }], ["dv", "VD (Resist Torture/Drugs)", "num", { def: 17 }],
    ["cost", "Costo per dose (eb)", "num", { def: 100 }], ["src", "Fonte", "text"],
    ["primary", "Effetto primario", "area", { full: true }], ["secondary", "Effetto secondario (se la prova fallisce)", "area", { full: true }],
    ["mtarget", "Bonus automatico finché dura", "select", { opts: [["", "nessuno"], ...CPR.MOD_TARGETS] }], ["mv", "Valore (±)", "num"]] },
};
const mkHbItems = () => (state.markethb && state.markethb.items) || [];
async function mkSaveHb(items) {
  const saved = await Store.save("meta", { ...(state.markethb || {}), id: "markethb", items });
  state.markethb = saved; MK.setHomebrew(saved); liveSend("meta", saved);
}
function editMkItem(type, id) {
  if (!Store.canEdit() || !MK_FORMS[type]) return;
  const old = id ? MK.byId(id) || {} : {}, base = MK.BASE.some(b => b.id === id), F = MK_FORMS[type];
  if (base && !isGm()) return;
  const val = (k, o) => k === "gdest" ? old.gcat || "equip" : k === "mtarget" ? (old.mod || {}).target || "" : k === "mv" ? (old.mod || {}).v ?? "" : k === "pen" && old.pen ? Math.abs(old.pen) : old[k] ?? o.def ?? "";
  const field = ([k, l, kind, o = {}]) => {
    const v = val(k, o), cls = `field ${o.full ? "full" : ""}`;
    if (kind === "chk") return `<div class="${cls}"><label class="check"><input type="checkbox" name="${k}" ${v ? "checked" : ""}> ${esc(l)}</label></div>`;
    if (kind === "select") return `<div class="${cls}"><label>${esc(l)}</label><select name="${k}">${o.opts.map(([ov, ol]) => `<option value="${esc(ov)}" ${String(ov) === String(v) ? "selected" : ""}>${esc(ol)}</option>`).join("")}</select></div>`;
    if (kind === "area") return `<div class="${cls}"><label>${esc(l)}</label><textarea name="${k}" rows="3" placeholder="${esc(o.ph || "")}">${esc(v)}</textarea></div>`;
    return `<div class="${cls}"><label class="${o.req ? "req" : ""}">${esc(l)}</label><input name="${k}" ${kind === "num" ? `type="number" step="1"` : ""} ${o.req ? "required" : ""} value="${esc(v)}" placeholder="${esc(o.ph || "")}" ${o.list ? `list="dl-mk-${k}"` : ""}>${o.list ? `<datalist id="dl-mk-${k}">${o.list.map(x => `<option value="${esc(x)}">`).join("")}</datalist>` : ""}</div>`;
  };
  openModal(`
    <form class="form" id="mkc-form">
      <div class="modal-head"><h2>// ★ ${F.title} ${old.id ? "· MODIFICA" : "CUSTOM"}</h2><button type="button" class="x" data-action="close" aria-label="Chiudi">×</button></div>
      <div class="modal-body">${base ? `<p class="hint">È una voce del catalogo base: salvando diventa custom e sostituisce l'originale (che puoi ripristinare).</p>` : ""}<div class="fields">${F.fields().map(field).join("")}</div></div>
      <div class="modal-foot">
        ${old.custom ? `<button type="button" class="btn ghost small left danger" data-mkc-del>${base ? "Ripristina l'originale" : "Elimina"}</button>` : `<button type="button" class="btn ghost small left" data-action="close">Annulla</button>`}
        <button type="submit" class="btn">Salva</button>
      </div>
    </form>`);
  const form = $("#mkc-form");
  const del = $("[data-mkc-del]", form);
  del && del.addEventListener("click", async () => {
    if (!(await askConfirm(`${base ? "Ripristinare l'originale di" : "Eliminare dal catalogo"} «${old.name}»? Gli oggetti già comprati restano nelle schede.`, base ? "Ripristina" : "Elimina"))) return;
    try { await mkSaveHb(mkHbItems().filter(x => x.id !== old.id)); closeModal(); route(); toast("Fatto", "ok"); } catch (err) { fail(err); }
  });
  form.addEventListener("submit", async ev => {
    ev.preventDefault();
    const E = form.elements, out = { id: old.id || "mk-" + NET.uid(), type };
    for (const [k, , kind] of F.fields()) {
      if (k === "gdest" || k === "mtarget" || k === "mv") continue;
      if (kind === "chk") { if (E[k].checked) out[k] = true; continue; }
      const raw = E[k].value.trim(); if (raw === "") continue;
      out[k] = kind === "num" ? num(raw) : raw;
    }
    if (type === "weapon" && out.dmg && !CPR.parse(out.dmg)) return toast("Danno non valido (es. 3d6)", "err");
    if (type === "deckprog" && out.dmg && !CPR.parse(out.dmg)) return toast("Danno non valido (es. 2d6)", "err");
    if (type === "armor" && out.pen) out.pen = -Math.abs(out.pen);
    if (type === "gear") { out.gcat = E.gdest.value || "equip"; if (out.gcat === "veicoli" && !out.label) out.label = "Veicolo"; if (out.gcat === "vestiti" && !out.label) out.label = "Vestito";
      if (out.gcat !== "vestiti") { delete out.wtype; delete out.style; } }
    if (type === "drug" && E.mtarget.value && num(E.mv.value)) out.mod = { target: E.mtarget.value, v: num(E.mv.value) };
    if (type === "deckprog") { out.slots = out.slots || (out.cls === "ice" ? 2 : 1); out.eff = out.desc || ""; }
    if (type === "weapon" && out.quality === "standard") delete out.quality;
    out.cost = num(out.cost);
    const list = mkHbItems(), i = list.findIndex(x => x.id === out.id);
    try { await mkSaveHb(i >= 0 ? list.map(x => x.id === out.id ? out : x) : [...list, out]); closeModal(); route(); toast(`★ ${out.name} salvato`, "ok"); }
    catch (err) { fail(err); }
  });
}

// ---------- droghe da strada ----------
// nell'inventario: e.gear.items { cat: "droghe", name, qty, drug: id }
// sheet.drugs = effetti attivi [{ uid, id, name, dur, at }] · sheet.addictions = [{ id, name, eff, at }]
function drugShopBody(q, name, buyTh) {
  const list = mkVisible(MK.all().filter(it => it.type === "drug"))
    .filter(it => (!glossP || MK.priceCat(num(it.cost)) === glossP) && (!q || norm2(`${it.name} ${it.primary || ""} ${it.secondary || ""} ${it.src || ""}`).includes(q)));
  return `${mkFilters(list.length)}<div class="gl-wrap"><table class="gl-t mk-t mk-drug">
    <thead><tr><th>Droga</th><th>Durata</th><th>Effetto primario</th><th>VD</th><th>Effetto secondario (prova fallita)</th><th>Per dose</th>${buyTh}</tr></thead>
    <tbody>${list.map(it => `<tr class="${mkHidden(it.id) ? "mk-hid" : ""}">${name(it)}<td class="gl-n">${esc(it.dur || "—")}</td>
      <td>${esc(it.primary || "")}${it.mod ? `<small class="mk-sp">⚡ ${it.mod.v > 0 ? "+" : ""}${it.mod.v} ${esc((CPR.MOD_TARGETS.find(t => t[0] === it.mod.target) || [, it.mod.target])[1])}, applicato da solo finché dura</small>` : ""}</td>
      <td class="gl-n">${it.dv || "—"}</td><td>${esc(it.secondary || "")}</td>${mkCostCell(it.cost)}${mkBuyCell(it.id, it.cost)}</tr>`).join("")}</tbody></table></div>
    <p class="hint">Le dosi comprate vanno nell'Equipaggiamento del PG. Da lì «💉 Assumi» tira Resist Torture/Drugs contro la VD: se fallisce scatta l'effetto secondario (di solito la dipendenza), che resta segnato nella scheda.</p>`;
}
const drugOf = it => (it.drug && MK.byId(it.drug)) || MK.all().find(x => x.type === "drug" && norm2(x.name) === norm2(it.name)) || null;
async function drugSave(e0, fn, msg) {
  const e = JSON.parse(JSON.stringify(e0)); e.sheet = e.sheet || {}; e.gear = e.gear || {}; e.gear.items = e.gear.items || [];
  if (fn(e) === false) return;
  try { const saved = await Store.save("entries", e); upsert(state.entries, saved); liveSend("entries", saved); refreshSheetView(saved.id); refreshParty(); if (msg) toast(msg, "ok"); }
  catch (err) { fail(err); }
}
// assumere una dose: la tolgo dall'inventario, tiro Resist Torture/Drugs contro la VD, segno effetto attivo e, se fallisce, il secondario
function drugTake(id, gi) {
  const e = state.entries.find(x => x.id === id), g = gearItems(e)[gi]; if (!e || !g || !Store.canEdit()) return;
  const d = drugOf(g) || { name: g.name, dv: 0, primary: g.detail || "", secondary: "" };
  const k = skillByKey(e, "skill:resist") || { label: "Resist Torture/Drugs", stat: "WILL", lvl: 0 };
  const r = CPR.check([{ l: k.stat, v: statEff(e, k.stat) }, { l: k.label, v: k.lvl }, ...skillBonusAll(e, k), ...sheetExtra(e)]);
  const ok = !d.dv || r.total > d.dv, uid = NET.uid();
  postRoll({ kind: "check", who: e.name, entryId: e.id, label: `${d.name} · Resist Torture/Drugs`, ...r,
    hit: d.dv ? { ok, text: ok ? `Superata la VD ${d.dv}: niente effetto secondario` : `VD ${d.dv} non superata: effetto secondario` } : undefined,
    note: [d.dur ? `Dura ${d.dur}` : "", d.primary, !ok && d.secondary ? `Secondario: ${d.secondary}` : ""].filter(Boolean).join(" · ") });
  drugSave(e, x => {
    const it = x.gear.items[gi]; if (!it) return false;
    it.qty = (num(it.qty) || 1) - 1; if (it.qty <= 0) x.gear.items.splice(gi, 1);
    const s = x.sheet;
    s.drugs = [...(s.drugs || []), { uid, id: d.id || "", name: d.name, dur: d.dur || "", at: new Date().toISOString() }];
    if (d.mod) s.mods = [...(s.mods || []), { on: true, name: d.name, target: d.mod.target, value: d.mod.v, note: `Droga (${d.dur || "attiva"})` }];
    if (!ok && d.secondary && !(s.addictions || []).some(a => a.name === d.name)) s.addictions = [...(s.addictions || []), { id: d.id || "", name: d.name, eff: d.secondary, at: new Date().toISOString() }];
  }, `${d.name} assunta`);
}
function drugEnd(id, uid) {
  const e = state.entries.find(x => x.id === id); if (!e || !Store.canEdit()) return;
  drugSave(e, x => {
    const s = x.sheet, a = (s.drugs || []).find(z => z.uid === uid); if (!a) return false;
    s.drugs = s.drugs.filter(z => z.uid !== uid);
    // il bonus va via solo se non c'è un'altra dose della stessa droga ancora attiva
    if (!s.drugs.some(z => z.name === a.name)) s.mods = (s.mods || []).filter(m => !(m.name === a.name && /^Droga/.test(m.note || "")));
  }, "Effetto finito");
}
function drugCure(id, i) {
  const e = state.entries.find(x => x.id === id); if (!e || !Store.canEdit()) return;
  drugSave(e, x => { const l = x.sheet.addictions || []; if (!l[i]) return false; l.splice(i, 1); }, "Dipendenza tolta");
}
// riquadro delle droghe nella tab Equipaggiamento: effetti attivi e dipendenze
function drugStatusHtml(e) {
  const s = sheetOf(e), act = s.drugs || [], add = s.addictions || [], edit = Store.canEdit(), id = esc(e.id);
  if (!act.length && !add.length) return "";
  const ago = at => { const m = Math.round((Date.now() - new Date(at)) / 60000); return m < 60 ? `${m} min fa` : m < 1440 ? `${Math.round(m / 60)} h fa` : new Date(at).toLocaleDateString("it-IT"); };
  return `<div class="drug-box">
    ${act.length ? `<div><span class="sh-k">Sotto effetto</span><ul>${act.map(a => `<li><b>${esc(a.name)}</b> <span class="hint">${a.dur ? `dura ${esc(a.dur)} · ` : ""}presa ${esc(ago(a.at))}</span>${edit ? ` <button type="button" class="btn ghost small g-act" data-action="drug-end" data-id="${id}" data-uid="${esc(a.uid)}">Effetto finito</button>` : ""}</li>`).join("")}</ul></div>` : ""}
    ${add.length ? `<div><span class="sh-k">Dipendenze ed effetti secondari</span><ul>${add.map((a, i) => `<li class="addict"><b>${esc(a.name)}</b> <span>${esc(a.eff)}</span>${edit ? ` <button type="button" class="btn ghost small g-act" data-action="drug-cure" data-id="${id}" data-i="${i}" title="Disintossicato o curato">Curata</button>` : ""}</li>`).join("")}</ul></div>` : ""}
  </div>`;
}
