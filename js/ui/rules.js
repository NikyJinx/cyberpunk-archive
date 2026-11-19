// ============================================================
//  NIGHT CITY ARCHIVE — munizioni, stati, Critical Injury, modificatori speciali
//  (js/ui/: i file si caricano in ordine da index.html e condividono le costanti)
// ============================================================

// ---------- REGOLE DELLA CAMPAGNA: munizioni e stati (meta "rules", li modifica il GM) ----------
const rules = () => state.rules || { id: "rules", ammo: [], status: CPR.DEFAULT_STATUS };
const STD_AMMO = { id: "", name: "Standard", atk: 0, dmg: "", dmgMod: 0, eff: "" };
const ammoList = cat => [STD_AMMO, ...(rules().ammo || []).filter(a => !a.fam || ((CPR.weaponType(cat) || {}).ammo === a.fam))];
const ammoOf = (cat, id) => ammoList(cat).find(a => a.id === id) || STD_AMMO;
const statusList = () => rules().status || [];
const statusOf2 = id => statusList().find(s => s.id === id);
// malus degli stati di chi agisce (es. Accecato −4, se il GM lo imposta)
const statusParts = ids => (ids || []).map(statusOf2).filter(st => st && num(st.atk)).map(st => ({ l: st.name, v: num(st.atk) }));
// modificatori speciali della scheda attivi per un certo tipo di tiro
const modsFor = (mods, targets) => (mods || []).filter(m => m && m.on !== false && targets.includes(m.target) && num(m.value)).map(m => ({ l: m.name || "Modificatore", v: num(m.value), target: m.target }));

// contesto del tiro per un'arma della scheda
const sheetWeaponCat = w => w.cat || CPR.guessWeapon(w.name, w.skill);
function sheetExtra(e) {
  const s = sheetOf(e), w = woundOf(e), out = [];
  if (w.pen && !(w.id === "serious" && cyberItems(e).length && cyberFx(e).pain)) out.push({ l: w.label, v: w.pen });
  out.push(...statusParts(s.status), ...modsFor(s.mods, ["all"]));
  if (sheetMod) out.push({ l: "MOD", v: sheetMod });
  return out;
}



// ---------- stati, Critical Injury, modificatori speciali ----------
// chip degli stati · attrs(op, id) = attributi dei pulsanti, oppure null se non si può modificare
function statusChips(ids, attrs) {
  const list = (ids || []).map(id => statusOf2(id) || { id, name: "?" });
  const add = statusList().filter(st => !(ids || []).includes(st.id));
  return `<div class="st-chips">${list.map(st => `<span class="st-chip" title="${esc([st.atk ? `${st.atk > 0 ? "+" : ""}${st.atk} alle prove` : "", st.dmg ? `${st.dmg} danni per round` : "", st.eff].filter(Boolean).join(" · ") || "Effetto da definire nelle Regole della campagna")}">
      ${esc(st.name)}${num(st.atk) ? ` <b>${st.atk > 0 ? "+" : ""}${st.atk}</b>` : ""}
      ${st.dmg && attrs ? `<button type="button" class="gp-btn" ${attrs("roll", st.id)} title="Tira il danno del round: ${esc(st.dmg)}" aria-label="Tira il danno dello stato">⚄</button>` : ""}
      ${attrs ? `<button type="button" class="gp-btn del" ${attrs("del", st.id)} aria-label="Togli lo stato">✕</button>` : ""}</span>`).join("")}
    ${attrs && add.length ? `<select class="st-add" ${attrs("add", "")} aria-label="Aggiungi uno stato"><option value="">+ stato…</option>${add.map(st => `<option value="${esc(st.id)}">${esc(st.name)}</option>`).join("")}</select>` : ""}
    ${!list.length && !attrs ? `<span class="hint">nessuno</span>` : ""}</div>`;
}
// il select «+ stato» lavora al change, i pulsanti al click
function statusOp(el, apply) {
  const op = el.dataset.stOp, id = el.tagName === "SELECT" ? el.value : el.dataset.st;
  if (!id) return;
  if (op === "roll") { const st = statusOf2(id); const r = st && CPR.rollExpr(st.dmg, { damage: false }); if (r) apply.roll(st, r); return; }
  apply.set(list => op === "add" ? [...new Set([...(list || []), id])] : (list || []).filter(x => x !== id));
}
const sheetStatusAttrs = e => (op, st) => `${op === "add" ? "" : `data-action="sheet-status" `}data-st-sheet="${esc(e.id)}" data-st-op="${op}" data-st="${esc(st)}"`;
const sheetStatusApply = e => ({
  set: fn => sheetPatch(e.id, s => { s.status = fn(s.status); return s; }),
  roll: (st, r) => postRoll({ kind: "damage", who: e.name, entryId: e.id, label: `${st.name} · danno del round`, ...r, note: st.eff || "" }),
});

const lastCrit = {};
function critRoll(who, loc, post) {
  const r = CPR.rollCrit(loc), I = r.injury;
  post({ kind: "check", label: `Critical Injury · ${loc === "head" ? "testa" : "corpo"}: ${I.name}`, dice: r.dice, mods: [], total: r.total, inj: I.name,
    note: `${I.eff}${I.dsp ? " · +1 alla penalità del Death Save" : ""} · +5 danni diretti (già nel tiro di danno)` });
  return { ...I, loc };
}
function critBlock(e, edit) {
  const s = sheetOf(e), L = lastCrit[e.id];
  return `<div class="block crit-block"><h4>Critical Injuries</h4>
    ${s.crit ? `<div class="prewrap">${esc(s.crit)}</div>` : `<p class="hint">Nessuna. Con due 6 sul danno si tira la Critical Injury (2d6, corpo o testa).</p>`}
    <div class="pc-rolls">
      <button type="button" class="chip r" data-action="sheet-crit" data-id="${esc(e.id)}" data-loc="body">⚄ Critical Injury · corpo</button>
      <button type="button" class="chip r" data-action="sheet-crit" data-id="${esc(e.id)}" data-loc="head">⚄ Critical Injury · testa</button>
      ${L && edit ? `<span class="crit-last">Uscita: <b>${esc(L.name)}</b> <button type="button" class="btn ghost small" data-action="sheet-crit-add" data-id="${esc(e.id)}">+ Aggiungi alla scheda</button></span>` : ""}
    </div></div>`;
}

// ---------- modulo delle Regole della campagna (GM) ----------
const AMMO_FAMS = [...new Set(CPR.WEAPON_TYPES.map(w => w.ammo).filter(Boolean))];
function editRules() {
  if (!isGm() && Store.gmReady) return;
  const R = rules();
  const aRow = (a = {}) => `<div class="sh-row rl-ammo">
    <input data-f="name" placeholder="Nome (es. Perforanti)" value="${esc(a.name || "")}">
    <select data-f="fam" title="Per quali armi">${[["", "Tutte le armi"], ...AMMO_FAMS.map(f => [f, f])].map(([v, l]) => `<option value="${esc(v)}" ${v === (a.fam || "") ? "selected" : ""}>${esc(l)}</option>`).join("")}</select>
    <input data-f="atk" type="number" min="-10" max="10" placeholder="± colpire" title="Modificatore al tiro per colpire" value="${esc(a.atk || "")}">
    <input data-f="dmg" placeholder="Danno al posto (es. 2d6)" title="Danno che sostituisce quello dell'arma (vuoto = quello dell'arma)" value="${esc(a.dmg || "")}">
    <input data-f="dmgMod" type="number" min="-20" max="20" placeholder="± danno" title="Modificatore al danno" value="${esc(a.dmgMod || "")}">
    <input data-f="eff" placeholder="Effetto (compare nel Dice log)" value="${esc(a.eff || "")}" class="wide">
    <input type="hidden" data-f="id" value="${esc(a.id || "")}">
    <button type="button" class="gp-btn del" data-row-del aria-label="Rimuovi">✕</button></div>`;
  const sRow = (st = {}) => `<div class="sh-row rl-st">
    <input data-f="name" placeholder="Nome (es. In fiamme)" value="${esc(st.name || "")}">
    <input data-f="atk" type="number" min="-10" max="10" placeholder="± prove" title="Modificatore a tutte le prove di chi ha lo stato" value="${esc(st.atk || "")}">
    <input data-f="dmg" placeholder="Danno per round (es. 1d6)" value="${esc(st.dmg || "")}">
    <input data-f="eff" placeholder="Effetto" value="${esc(st.eff || "")}" class="wide">
    <input type="hidden" data-f="id" value="${esc(st.id || "")}">
    <button type="button" class="gp-btn del" data-row-del aria-label="Rimuovi">✕</button></div>`;
  openModal(`
    <form class="form" id="rules-form">
      <div class="modal-head"><h2>// REGOLE DELLA CAMPAGNA</h2><button type="button" class="x" data-action="close" aria-label="Chiudi">×</button></div>
      <div class="modal-body">
        <h3 class="sh-h">Munizioni <small>si scelgono nel tiro per colpire di ogni arma compatibile · «Standard» c'è sempre</small></h3>
        <div class="sh-rows" id="rl-ammo">${(R.ammo || []).map(aRow).join("")}</div>
        <button type="button" class="btn ghost small cyan" data-rl-add="ammo">+ Munizione</button>
        <h3 class="sh-h">Stati <small>si mettono su schede e token · il modificatore vale per tutte le prove di chi ha lo stato</small></h3>
        <div class="sh-rows" id="rl-st">${(R.status || []).map(sRow).join("")}</div>
        <button type="button" class="btn ghost small cyan" data-rl-add="st">+ Stato</button>
        <p class="hint" style="margin-top:14px">I modificatori legati al cyberware o ai talenti (es. mirino ottico +1 ai colpi mirati) si mettono nella scheda di ogni personaggio, sezione «Modificatori speciali».</p>
      </div>
      <div class="modal-foot"><button type="button" class="btn ghost small left" data-action="close">Annulla</button><button type="submit" class="btn">Salva regole</button></div>
    </form>`);
  const form = $("#rules-form");
  form.addEventListener("click", ev => {
    const add = ev.target.closest("[data-rl-add]");
    if (add) { const box = $(add.dataset.rlAdd === "ammo" ? "#rl-ammo" : "#rl-st", form); box.insertAdjacentHTML("beforeend", add.dataset.rlAdd === "ammo" ? aRow() : sRow()); $(".sh-row:last-child input", box).focus(); }
    const del = ev.target.closest("[data-row-del]"); if (del) del.closest(".sh-row").remove();
  });
  form.addEventListener("submit", async ev => {
    ev.preventDefault();
    const idOf = (x, p) => x.id || p + NET.uid();
    const ammo = readRows(form, "#rl-ammo .sh-row").filter(a => a.name).map(a => ({ id: idOf(a, "am-"), name: a.name, fam: a.fam, atk: num(a.atk), dmg: a.dmg, dmgMod: num(a.dmgMod), eff: a.eff }));
    const status = readRows(form, "#rl-st .sh-row").filter(x => x.name).map(x => ({ id: idOf(x, "st-"), name: x.name, atk: num(x.atk), dmg: x.dmg, eff: x.eff }));
    const bad = [...ammo.filter(a => a.dmg && !CPR.parse(a.dmg)).map(a => a.name), ...status.filter(x => x.dmg && !CPR.parse(x.dmg)).map(x => x.name)];
    if (bad.length) return toast(`Danno non valido in: ${bad.join(", ")} (es. 2d6 o 1d6+2)`, "err");
    try {
      const saved = await Store.save("meta", { ...rules(), id: "rules", ammo, status });
      state.rules = saved; liveSend("meta", saved);
      toast("Regole salvate", "ok"); closeModal(); route();
    } catch (err) { fail(err); }
  });
}
