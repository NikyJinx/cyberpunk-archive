// ============================================================
//  NIGHT CITY ARCHIVE — bonus a STAT e abilità nella scheda
//  (js/ui/: i file si caricano in ordine da index.html e condividono le costanti)
// ============================================================

// ---------- BONUS A STAT E ABILITÀ ----------
// sheet.bonuses = [{ id, name, target: "STAT:REF" | "skill:handgun" | "cskill:0", v, on (false = spento), item (nome di un oggetto dell'inventario) }]
// Un bonus legato a un oggetto conta solo finché l'oggetto è nell'inventario.
// Si sommano ai tiri: STAT (statEff), abilità (skillBonusAll) e attacchi con le armi (abilità dell'arma).
// I bonus automatici (cyberware, Ruolo, armatura, umanità) si vedono nel riquadro ma si cambiano dove nascono.
const bonusesOf = e => (sheetOf(e).bonuses || []).filter(b => b && b.target);
const bonusItemOk = (e, b) => !b.item || gearItems(e).some(it => norm2(it.name) === norm2(b.item) && num(it.qty || 1) > 0);
const bonusActive = (e, b) => b.on !== false && num(b.v) && bonusItemOk(e, b);
// bonus manuali e degli oggetti per un bersaglio, nel formato dei tiri { l, v }
const extraBonus = (e, target) => bonusesOf(e).filter(b => b.target === target && bonusActive(e, b)).map(b => ({ l: b.name || b.item || "Bonus", v: num(b.v), manual: true }));
const statExtra = (e, id) => extraBonus(e, "STAT:" + id).reduce((t, b) => t + b.v, 0);

// bersagli selezionabili: STAT e abilità (anche le custom)
function bonusTargets(e) {
  return [...CPR.STATS.map(st => ["STAT:" + st.id, `${st.id} (STAT)`]), ...skillsOf(e).map(k => [k.key, k.label])];
}
const bonusLabel = (e, t) => (bonusTargets(e).find(x => x[0] === t) || [, t])[1];

// tutte le voci per un bersaglio: automatiche e manuali
function bonusRows(e) {
  const rows = [], s = sheetOf(e), fx = cyberItems(e).length ? cyberFx(e) : null;
  for (const st of CPR.STATS) {
    const t = "STAT:" + st.id, raw = num((s.stats || {})[st.id]), auto = [];
    if (st.id === "BODY" && statBase(e, "BODY") !== raw) auto.push({ l: "Cyberware", v: statBase(e, "BODY") - raw });
    if (st.id === "EMP") { const cs = cyberStats(e); if (cs.current != null) { const emp = Math.max(0, Math.floor(cs.current / 10)); if (emp !== raw) auto.push({ l: "Umanità (EMP = umanità / 10)", v: emp - raw }); } }
    if (CPR.PEN_STATS.includes(st.id) && pcPen(e)) auto.push({ l: "Armatura pesante", v: pcPen(e) });
    const man = bonusesOf(e).filter(b => b.target === t);
    if (auto.length || man.length) rows.push({ t, label: st.id, kind: "stat", base: raw, baseTxt: `${raw}`, auto, man, total: statEff(e, st.id) });
  }
  for (const k of skillsOf(e)) {
    const man = bonusesOf(e).filter(b => b.target === k.key);
    const auto = k.custom ? [] : [...roleSkillBonus(e, k.id).map(b => ({ ...b, l: `${b.l} (Ruolo)` })), ...CW.skillBonus(fx, k.id, k.lvl).map(b => ({ ...b, l: `${b.l} (cyberware)` }))];
    if (!auto.length && !man.length) continue;
    const base = statEff(e, k.stat) + k.lvl, extra = [...auto, ...extraBonus(e, k.key)].reduce((t, b) => t + b.v, 0);
    rows.push({ t: k.key, label: k.label, kind: "skill", base, baseTxt: `${k.stat} ${statEff(e, k.stat)} + ${k.lvl}`, auto, man, total: base + extra });
  }
  // modificatori a tutte le prove (es. DeathTrance, droghe con bonus «Tutte le prove»)
  const all = [...modsFor(s.mods, ["all"]), ...(fx ? modsFor(fx.mods, ["all"]) : [])];
  if (all.length) rows.push({ t: "ALL", label: "Tutte le prove", kind: "all", base: 0, baseTxt: "—", auto: all.map(m => ({ l: m.l, v: m.v })), man: [], total: all.reduce((x, m) => x + m.v, 0) });
  return rows;
}
const sgn = v => (v > 0 ? "+" : "") + v;
function bonusBoxHtml(e, edit) {
  const rows = bonusRows(e), id = esc(e.id), open = ls.get("nc-bonus-open", true);
  const autoChip = b => `<span class="bn-chip auto" title="Automatico: si cambia dove nasce (cyberware, Ruolo, armatura…)">⚡ ${esc(b.l)} <b>${sgn(b.v)}</b></span>`;
  const manChip = b => { const gone = !bonusItemOk(e, b);
    return `<span class="bn-chip man ${bonusActive(e, b) ? "" : "off"}" title="${b.on === false ? "Spento" : gone ? "L'oggetto non è nell'inventario" : "Bonus a mano"}">${esc(b.name || b.item || "Bonus")} <b>${sgn(num(b.v))}</b>${b.item ? ` <small>🎒 ${esc(b.item)}${gone ? " · non c'è" : ""}</small>` : ""}${b.on === false ? " <small>spento</small>" : ""}</span>`; };
  return `<details class="bn-box" data-bn-box ${open ? "open" : ""}>
    <summary><h4>Bonus a STAT e abilità</h4><span class="hint">${rows.length ? `${rows.length} con bonus` : "nessuno"} · ⚡ automatici · gli altri si aggiungono e si modificano in «Modifica scheda»</span></summary>
    ${rows.length ? `<div class="gl-wrap"><table class="bn-t"><thead><tr><th>STAT / abilità</th><th>Base</th><th>Bonus</th><th>Totale</th></tr></thead><tbody>
      ${rows.map(r => `<tr class="bn-${r.kind}"><th>${esc(r.label)}</th><td class="gl-n">${esc(r.baseTxt)}</td><td>${r.auto.map(autoChip).join("")}${r.man.map(manChip).join("")}</td><td class="gl-n bn-tot">${r.kind === "all" ? sgn(r.total) : r.total}</td></tr>`).join("")}
    </tbody></table></div>` : `<p class="hint">Nessun bonus: quelli del cyberware e del Ruolo compaiono da soli.</p>`}
    ${edit ? `<p><button type="button" class="btn ghost small cyan" data-action="edit-sheet" data-id="${id}">✎ Aggiungi o modifica i bonus</button></p>` : ""}
  </details>`;
}

// ---------- nel modulo «Modifica scheda»: i bonus accanto a ogni STAT e abilità ----------
// «Dance [livello] [bonus…] [+] = totale»: i ⚡ automatici in sola lettura, i propri cliccabili (o «+») per modificarli
// in un piccolo editor sotto la riga. Si salvano con «Salva scheda» (sheet.bonuses).
const bnForm = { e: null, list: [] };
function bnFormStart(e) { bnForm.e = e; bnForm.list = JSON.parse(JSON.stringify(sheetOf(e).bonuses || [])).filter(b => b && b.target); }
const bnFormBonuses = () => bnForm.list.map(b => ({ ...b, v: Math.trunc(num(b.v)) })).filter(b => b.target && b.v);
// bonus automatici di una STAT o abilità, con il livello scritto nel modulo (il Chip Abilità dipende dal livello)
function bnAuto(e, target, lvl) {
  const [kind, id] = target.split(":"), s = sheetOf(e), out = [];
  if (kind === "STAT") {
    const raw = num((s.stats || {})[id]);
    if (id === "BODY" && statBase(e, "BODY") !== raw) out.push({ l: "Cyberware", v: statBase(e, "BODY") - raw });
    if (id === "EMP") { const cs = cyberStats(e); if (cs.current != null) { const emp = Math.max(0, Math.floor(cs.current / 10)); if (emp !== raw) out.push({ l: "Umanità", v: emp - raw }); } }
    if (CPR.PEN_STATS.includes(id) && pcPen(e)) out.push({ l: "Armatura", v: pcPen(e) });
  } else if (kind === "skill") {
    const fx = cyberItems(e).length ? cyberFx(e) : null;
    out.push(...roleSkillBonus(e, id).map(b => ({ l: b.l + " (Ruolo)", v: b.v })), ...CW.skillBonus(fx, id, lvl).map(b => ({ l: b.l, v: b.v })));
  }
  return out;
}
const bnOn = b => b.on !== false && num(b.v) && bonusItemOk(bnForm.e, b);
function bnCellHtml(target) {
  const e = bnForm.e; if (!e) return "";
  const mine = bnForm.list.map((b, i) => ({ b, i })).filter(x => x.b.target === target);
  return `<span class="bn-cell" data-bn-t="${esc(target)}">
    <span class="bn-list">${mine.map(({ b, i }) => `<button type="button" class="bn-chip man ${bnOn(b) ? "" : "off"}" data-bn-edit="${i}" title="${esc(b.name || b.item || "Bonus")}${b.item ? " · legato a " + esc(b.item) : ""}${b.on === false ? " · spento" : ""} — clic per modificare">${esc(b.name || b.item || "Bonus")} <b>${sgn(num(b.v))}</b>${b.item ? " 🎒" : ""}</button>`).join("")}<i data-bn-autos></i></span>
    <button type="button" class="bn-plus" data-bn-new="${esc(target)}" title="Aggiungi un bonus" aria-label="Aggiungi un bonus">+</button>
    <output class="bn-sum" data-bn-sum></output></span>`;
}
// valore e totale della riga, dai campi del modulo
function bnRefresh(form, cell) {
  const e = bnForm.e, t = cell.dataset.bnT, [kind, id] = t.split(":");
  let base = 0, lvl = 0;
  if (kind === "STAT") base = num(form.elements["st-" + id] && form.elements["st-" + id].value);
  else if (kind === "skill") { const k = CPR.skill(id); lvl = num(form.elements["sk-" + id] && form.elements["sk-" + id].value); base = num(form.elements["st-" + k.stat] && form.elements["st-" + k.stat].value) + lvl; }
  const autos = bnAuto(e, t, lvl), mine = bnForm.list.filter(b => b.target === t && bnOn(b));
  // per le abilità contano anche i bonus della STAT su cui si basano
  const statB = kind === "skill" ? bnForm.list.filter(b => b.target === "STAT:" + CPR.skill(id).stat && bnOn(b)).reduce((x, b) => x + num(b.v), 0) + bnAuto(e, "STAT:" + CPR.skill(id).stat, 0).reduce((x, b) => x + b.v, 0) : 0;
  const ad = $("[data-bn-autos]", cell); if (ad) ad.outerHTML = `<i data-bn-autos>${autos.map(b => `<span class="bn-chip auto" title="Automatico: ${esc(b.l)}">⚡ <b>${sgn(b.v)}</b></span>`).join("")}</i>`;
  const tot = base + statB + autos.reduce((x, b) => x + b.v, 0) + mine.reduce((x, b) => x + num(b.v), 0);
  const any = autos.length || mine.length || statB;
  $("[data-bn-sum]", cell).textContent = any ? `= ${tot}` : "";
  cell.classList.toggle("has", !!any);
}
function bnRefreshAll(form) { $$("[data-bn-t]", form).forEach(c => bnRefresh(form, c)); }
function bnRedraw(form, target) {
  const cell = $(`[data-bn-t="${CSS.escape(target)}"]`, form); if (!cell) return;
  cell.outerHTML = bnCellHtml(target);
  bnRefresh(form, $(`[data-bn-t="${CSS.escape(target)}"]`, form));
}
// editor sotto la riga: valore, fonte, oggetto, acceso
function bnEditor(form, cell, i) {
  $$(".bn-ed", form).forEach(x => x.remove());
  const e = bnForm.e, t = cell.dataset.bnT, b = i == null ? { target: t, v: 1, name: "" } : bnForm.list[i];
  const inv = [...new Set(gearItems(e).map(it => it.name).filter(Boolean))].sort((x, y) => x.localeCompare(y, "it"));
  if (b.item && !inv.includes(b.item)) inv.unshift(b.item);
  const row = cell.closest(".sk-ed, .st-ed") || cell;
  row.insertAdjacentHTML("afterend", `<div class="bn-ed">
    <input data-ed="v" type="number" step="1" value="${num(b.v)}" aria-label="Valore" class="bn-v">
    <input data-ed="name" value="${esc(b.name || "")}" placeholder="Fonte (es. Guanti tattici)">
    <select data-ed="item" title="Conta solo finché l'oggetto è nell'inventario"><option value="">— nessun oggetto —</option>${inv.map(n => `<option value="${esc(n)}" ${n === b.item ? "selected" : ""}>🎒 ${esc(n)}</option>`).join("")}</select>
    <label class="check"><input type="checkbox" data-ed="on" ${b.on === false ? "" : "checked"}> acceso</label>
    <button type="button" class="btn small" data-ed-ok>OK</button>
    ${i == null ? "" : `<button type="button" class="btn ghost small danger" data-ed-del>Elimina</button>`}
    <button type="button" class="btn ghost small" data-ed-x>Annulla</button></div>`);
  const ed = row.nextElementSibling, F = k => $(`[data-ed=${k}]`, ed);
  F("v").focus(); F("v").select();
  $("[data-ed-ok]", ed).addEventListener("click", () => {
    const v = Math.trunc(num(F("v").value)); if (!v) return toast("Scrivi un valore diverso da 0", "err");
    const nb = { id: b.id || NET.uid(), target: t, v, name: F("name").value.trim(), ...(F("item").value ? { item: F("item").value } : {}), ...(b.market ? { market: b.market } : {}), ...(F("on").checked ? {} : { on: false }) };
    if (i == null) bnForm.list.push(nb); else bnForm.list[i] = nb;
    ed.remove(); bnRedraw(form, t);
  });
  const del = $("[data-ed-del]", ed); del && del.addEventListener("click", () => { bnForm.list.splice(i, 1); ed.remove(); bnRedrawAllCells(form); });
  $("[data-ed-x]", ed).addEventListener("click", () => ed.remove());
  ed.addEventListener("keydown", ev => { if (ev.key === "Enter") { ev.preventDefault(); $("[data-ed-ok]", ed).click(); } if (ev.key === "Escape") { ev.preventDefault(); ed.remove(); } });
}
// dopo una cancellazione gli indici cambiano: ridisegno tutte le caselle
function bnRedrawAllCells(form) { $$("[data-bn-t]", form).forEach(c => { const t = c.dataset.bnT; c.outerHTML = bnCellHtml(t); }); bnRefreshAll(form); }
function bnFormBind(form) {
  bnRefreshAll(form);
  form.addEventListener("input", ev => { if (/^(st|sk)-/.test(ev.target.name || "")) bnRefreshAll(form); });
  form.addEventListener("click", ev => {
    const nw = ev.target.closest("[data-bn-new]"), ed = ev.target.closest("[data-bn-edit]");
    if (nw) bnEditor(form, nw.closest("[data-bn-t]"), null);
    if (ed) bnEditor(form, ed.closest("[data-bn-t]"), num(ed.dataset.bnEdit));
  });
}

document.addEventListener("toggle", ev => { if (ev.target.matches && ev.target.matches("[data-bn-box]")) ls.set("nc-bonus-open", ev.target.open); }, true);
