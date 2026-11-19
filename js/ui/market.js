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
  return `<td class="gl-n">${changed ? `<s>${num(cost).toLocaleString("it-IT")}</s> ` : ""}${p.toLocaleString("it-IT")} eb<small>${esc(MK.priceCat(num(cost)))}</small></td>`;
};
const mkBuyCell = (key, cost) => {
  if (!mkCanBuy()) return "";
  const who = mkWho(), p = mkPrice(cost), poor = p > moneyOf(who) && !isGm();
  return `<td class="mk-buy"><button type="button" class="btn small ${poor ? "ghost" : ""}" data-action="mk-buy" data-key="${esc(key)}" ${poor ? `title="Non bastano gli eddies"` : ""}>Compra</button></td>`;
};
const mkTools = (key, it) => {
  if (!isGm() || !Store.canEdit()) return "";
  const hid = mkHidden(key);
  return `<span class="mk-tools">${it ? `<button type="button" class="gp-btn" data-action="mk-edit" data-key="${esc(key)}" aria-label="Modifica" title="${it.custom ? "Modifica" : "Modifica (diventa una voce custom)"}">✎</button>` : ""}
    <button type="button" class="gp-btn ${hid ? "on" : ""}" data-action="mk-hide" data-key="${esc(key)}" title="${hid ? "Nascosto ai giocatori: clic per mostrarlo" : "Nascondi ai giocatori"}" aria-label="Nascondi">${hid ? "⊘" : "👁"}</button></span>`;
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
  return `${mkFilters(list.length)}<div class="gl-wrap"><table class="gl-t mk-t">
      <thead><tr><th>Oggetto</th><th>Tipo</th><th>Descrizione</th><th>Costo</th>${buyTh}</tr></thead>
      <tbody>${list.map(it => `<tr class="${cls(it)}">${name(it)}<td>${esc(it.label || (it.gcat === "veicoli" ? "Veicolo" : "Equipaggiamento"))}</td>${desc(it)}${mkCostCell(it.cost)}${mkBuyCell(it.id, it.cost)}</tr>`).join("")}</tbody></table></div>`;
}

// ---------- acquisto ----------
// slot adatti al gruppo del cyberware (le parti doppie destra e sinistra)
const mkCySlots = (e, c) => {
  const pairs = { optics: ["occhio_dx", "occhio_sx"], arm: ["braccio_dx", "braccio_sx"], leg: ["gamba_dx", "gamba_sx"], limbcover: ["braccio_dx", "braccio_sx", "gamba_dx", "gamba_sx"] };
  const g = CW.GROUPS.find(x => x.id === c.g) || {}, want = pairs[c.g] || [g.slot].filter(Boolean);
  const all = slotsOf(e), fit = all.filter(s => want.includes(s.id));
  return { fit: fit.length ? fit : all, other: all.filter(s => !fit.includes(s)) };
};
const mkItemOf = key => key.startsWith("cw:") ? (c => c && { ...c, type: "cyber", key })(CW.byId(key.slice(3))) : (it => it && { ...it, key })(MK.byId(key));

function mkBuy(key) {
  const e = mkWho(), it = mkItemOf(key); if (!e || !it || !mkCanBuy()) return;
  const gm = isGm(), price = mkPrice(it.cost), money = moneyOf(e);
  let extra = "";
  if (it.type === "weapon") extra = `<p class="hint">Va nella tab Combattimento: ${esc(MK.weaponStats(it).dmg)} · ROF ${MK.weaponStats(it).rof}${it.special ? ` · ${esc(it.special)}` : ""}</p>`;
  if (it.type === "armor") {
    const s = sheetOf(e), cur = l => { const a = (s.armor || {})[l] || {}; return a.name ? `${a.name} SP ${num(a.sp)}` : "niente"; };
    extra = `<div class="field"><label>Indossala</label><select name="loc"><option value="body">sul corpo (ora: ${esc(cur("body"))})</option><option value="head">sulla testa (ora: ${esc(cur("head"))})</option><option value="">no, solo nell'inventario</option></select></div>`;
  }
  if (it.type === "gear") extra = `<div class="field"><label>Quantità</label><input name="qty" type="number" min="1" max="99" value="1"></div>`;
  if (it.type === "cyber") {
    const { fit, other } = mkCySlots(e, it), base = !!it.base;
    const opt = s => { const b = base ? baseState(e, s.id) : null, on = b && !b.fixed && b.on; return `<option value="${esc(s.id)}" ${on ? "disabled" : ""}>${esc(s.label)}${on ? " (già attivo)" : ""}</option>`; };
    const pu = CW.rollPu(it);
    extra = `<div class="field"><label>${base ? "Si attiva su" : "Slot"}</label><select name="slot">${fit.map(opt).join("")}${other.length && !base ? `<optgroup label="Altri slot">${other.map(opt).join("")}</optgroup>` : ""}</select></div>
      <div class="field"><label>Umanità persa (HL)</label><div class="mk-hl"><input name="hl" type="number" min="0" value="${pu.total}"><button type="button" class="gp-btn" data-mk-pu title="Tira ${esc(it.dice)}">⚄</button></div><span class="hint">${it.dice && it.dice !== "N/A" ? `${esc(it.dice)}, media ${it.pu}` : "nessuna"}${pu.dice.length ? ` · tirato: ${pu.dice.join(" + ")}` : ""}</span></div>
      ${it.id === "skillchip" ? `<div class="field"><label>Abilità del chip</label><select name="param">${CPR.SKILLS.map(k => `<option value="${k.id}">${esc(k.label)}</option>`).join("")}</select></div>` : ""}
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
  const total = () => F("free") && F("free").checked ? 0 : price * (F("qty") ? Math.max(1, Math.trunc(num(F("qty").value)) || 1) : 1);
  const upd = () => {
    const t = total(), left = money - t;
    $("[data-mk-tot]", form).textContent = fmtEb(t); $("[data-mk-left]", form).textContent = fmtEb(left);
    $("[data-mk-left]", form).classList.toggle("neg", left < 0);
    const poor = left < 0;
    $("[data-mk-poor]", form).textContent = poor ? (gm ? "Gli eddies non bastano: comprando vai in negativo." : "Gli eddies non bastano.") : "";
    $("[data-mk-ok]", form).disabled = poor && !gm;
    const cap = $("[data-mk-cap]", form);
    if (cap && it.type === "cyber") {
      const sl = F("slot").value, items = (((e.cyber || {}).slots || {})[sl]) || [];
      if (it.base) cap.textContent = "";
      else { const u = slotUse(sl, [...items, { name: it.name, ref: it.id }], baseState(e, sl)); cap.textContent = !u ? "" : u.missing ? `Manca il ${u.missing}: attivalo prima o insieme.` : u.over ? `Slot pieno: opzioni ${u.used}/${u.cap}.` : `Opzioni dopo l'acquisto: ${u.used}/${u.cap}.`; }
    }
  };
  form.addEventListener("input", upd); form.addEventListener("change", upd); upd();
  const puBtn = $("[data-mk-pu]", form);
  puBtn && puBtn.addEventListener("click", () => { const r = CW.rollPu(it); F("hl").value = r.total; toast(`Umanità persa: ${r.total}${r.dice.length ? ` (${r.dice.join(" + ")})` : ""}`); });
  form.addEventListener("submit", ev => {
    ev.preventDefault();
    const paid = total(), qty = F("qty") ? Math.max(1, Math.trunc(num(F("qty").value)) || 1) : 1;
    if (money - paid < 0 && !gm) return;
    mkCommit(e, it, paid, qty, { loc: F("loc") ? F("loc").value : "", slot: F("slot") ? F("slot").value : "", hl: F("hl") ? num(F("hl").value) : 0, param: F("param") ? F("param").value : "" });
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
  if (it.type === "gear") { addGear(it.gcat || "equip", it.name, "", qty, mkPrice(it.cost)); undo = { k: "gear", cat: it.gcat || "equip", qty }; }
  if (it.type === "armor") {
    addGear("armature", it.name, `SP ${it.sp}${it.pen ? ` · ${it.pen} REF/DEX/MOVE` : ""}`, 1, mkPrice(it.cost));
    undo = { k: "armor", loc: o.loc };
    if (o.loc) {
      s.armor = s.armor || {}; undo.prev = s.armor[o.loc] || null;
      const T = CPR.ARMOR_TYPES.find(t => t.sp && norm(t.label) === norm(it.name));
      s.armor[o.loc] = { name: it.name, sp: it.sp, cur: it.sp, type: T ? T.id : "custom" };
    }
  }
  if (it.type === "cyber") {
    const cy = e.cyber = e.cyber || {};
    if (it.base) {
      cy.bases = cy.bases || {}; undo = { k: "base", slot: o.slot, prev: cy.bases[o.slot] || null };
      const B = SLOT_BASE[slotKind(o.slot)];
      cy.bases[o.slot] = { ...(cy.bases[o.slot] || {}), on: true, slots: (cy.bases[o.slot] || {}).slots ?? (B ? B[1] : 3), cost: paid || it.cost, hl: o.hl, max: 2 };
    } else {
      cy.slots = cy.slots || {};
      cy.slots[o.slot] = [...(cy.slots[o.slot] || []), { name: it.name, ref: it.id, cost: paid || num(it.cost), hl: o.hl, installed: true, ...(o.param ? { param: o.param } : {}) }];
      undo = { k: "cyber", slot: o.slot };
    }
  }
  if (paid) gear.money = num(gear.money) - paid;
  gear.log = [...(gear.log || []), { at: new Date().toISOString(), id: it.key || it.id, name: it.name, type: it.type, cost: paid, qty, undo }];
  try {
    const saved = await Store.save("entries", e);
    upsert(state.entries, saved); liveSend("entries", saved);
    closeModal(); route(); refreshParty();
    toast(`${it.name}${qty > 1 ? ` ×${qty}` : ""} comprato${paid ? ` (−${fmtEb(paid)})` : ""}${it.type === "cyber" ? ` · −${o.hl} umanità` : ""}`, "ok");
  } catch (err) { fail(err); }
}

// storico degli acquisti e annullamento dell'ultimo
function mkHistory(id) {
  const e = state.entries.find(x => x.id === id); if (!e) return;
  const log = mkLog(e), T = Object.fromEntries(MK.TYPES);
  openModal(`<div class="form">
    <div class="modal-head"><h2>// ACQUISTI · ${esc(e.name)}</h2><button type="button" class="x" data-action="close" aria-label="Chiudi">×</button></div>
    <div class="modal-body">${log.length ? `<ul class="mk-log">${[...log].reverse().map(l => `<li><span class="d">${esc(new Date(l.at).toLocaleDateString("it-IT"))}</span><b>${esc(l.name)}${l.qty > 1 ? ` ×${l.qty}` : ""}</b><span class="hint">${esc(T[l.type] || "")}</span><span class="c">${l.cost ? "−" + fmtEb(l.cost) : "gratis"}</span></li>`).join("")}</ul>`
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
  if (u.k === "weapon") { const w = s.weapons || [], i = lastIdx(w, x => x.market === last.id || norm2(x.name) === norm2(last.name)); if (i >= 0) w.splice(i, 1); }
  if (u.k === "gear") dropGear(u.cat || "equip", u.qty || 1);
  if (u.k === "armor") { dropGear("armature", 1); if (u.loc) { s.armor = s.armor || {}; if (u.prev) s.armor[u.loc] = u.prev; else delete s.armor[u.loc]; } }
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
