// ============================================================
//  NIGHT CITY ARCHIVE — catalogo del cyberware nelle schede, cyberware custom, Glossario
//  (js/ui/: i file si caricano in ordine da index.html e condividono le costanti)
// ============================================================

// ---------- CYBERWARE DAL CATALOGO: effetti, attivazioni, armi ----------
// ogni impianto può avere ref (voce del catalogo), on (effetto a comando attivo), param (abilità del Chip Abilità)
const rawBody = e => num((sheetOf(e).stats || {}).BODY);
const cyberFx = e => CW.effects(cyberItems(e), rawBody(e));
const skillBonusAll = (e, k) => k.custom ? [] : [...roleSkillBonus(e, k.id), ...CW.skillBonus(cyberFx(e), k.id, k.lvl)];
const cwOf = it => CW.byId(it.ref) || CW.byName(it.name);
// lista degli effetti del cyberware (tab Cyberware e Combattimento)
function cyberFxHtml(e, compact = false) {
  const fx = cyberFx(e), edit = Store.canEdit(), id = esc(e.id), s = sheetOf(e);
  const items = Object.entries((e.cyber && e.cyber.slots) || {}).flatMap(([slot, list]) => (list || []).map((it, i) => ({ it, slot, i, c: cwOf(it) }))).filter(x => x.c && x.it.installed !== false);
  const conds = items.filter(x => (x.c.fx || []).some(f => f.cond));
  const lines = [];
  // abilità raggruppate per impianto (in Combattimento non servono)
  if (!compact) { const by = {}; Object.entries(fx.skill).forEach(([sk, list]) => { const k = CPR.skill(sk); list.forEach(b => { (by[b.l] = by[b.l] || []).push(b.chip ? `${k ? k.label : sk} a livello 3` : `+${b.v} ${k ? k.label : sk}`); }); });
    Object.entries(by).forEach(([n, l]) => lines.push(`${esc(n)}: ${esc(l.join(", "))}`)); }
  fx.mods.forEach(m => lines.push(`${esc(m.name)}: ${m.value > 0 ? "+" : ""}${m.value} ${esc((CPR.MOD_TARGETS.find(t => t[0] === m.target) || [, m.target])[1])}`));
  if (fx.body !== rawBody(e)) lines.push(`BODY ${rawBody(e)} → <b>${fx.body}</b> (PF, soglie delle ferite e Death Save aggiornati)`);
  if (fx.pain) lines.push("Antidolorifico: ignori i malus di Seriously Wounded");
  fx.armor.forEach(a => lines.push(`${esc(a.name)}: SP ${a.sp} sottopelle a testa e corpo, già combinata con l'armatura indossata (vale la più alta, si ablano insieme; 🛌 = +1 per giorno di riposo)`));
  const have = new Set((s.weapons || []).map(w => norm(w.name)));
  const wpn = fx.weapons.map(w => `${esc(w.name)} (${esc(w.dmg)})${have.has(norm(w.name)) ? " ✓ nelle armi" : edit ? ` <button type="button" class="btn ghost small" data-action="cy-weapon" data-id="${id}" data-name="${esc(w.name)}">+ alle armi</button>` : ""}`);
  if (!lines.length && !conds.length && !wpn.length) return compact ? "" : `<p class="hint">Gli impianti scelti dal catalogo con un effetto (bonus alle abilità, iniziativa, BODY…) lo applicano da soli ai tiri.</p>`;
  return `<div class="cy-fx ${compact ? "compact" : ""}">
    ${compact ? `<span class="sh-k">Cyberware</span>` : `<h4>Effetti del cyberware</h4>`}
    ${conds.length ? `<div class="st-chips">${conds.map(x => { const f = x.c.fx.find(z => z.cond); return `<button type="button" class="chip ${x.it.on ? "active" : ""}" ${edit ? `data-action="cy-on" data-id="${id}" data-slot="${esc(x.slot)}" data-i="${x.i}"` : "disabled"} title="${esc(f.cond)}">${x.it.on ? "◉" : "○"} ${esc(x.c.name)} <small>${esc(f.cond)}</small></button>`; }).join("")}</div>` : ""}
    ${!compact && lines.length ? `<ul>${lines.map(l => `<li>${l}</li>`).join("")}</ul>` : compact && lines.length ? `<span class="hint">${lines.join(" · ")}</span>` : ""}
    ${wpn.length && !compact ? `<div class="cy-wpn"><span class="sh-k">Armi integrate</span> ${wpn.join(" · ")}</div>` : ""}
  </div>`;
}
const norm2 = s => String(s || "").toLowerCase().trim();
async function cyberPatch(id, fn) {
  const e = state.entries.find(x => x.id === id); if (!e) return;
  const rec = { ...e, cyber: fn(JSON.parse(JSON.stringify(e.cyber || {}))) };
  upsert(state.entries, rec); refreshSheetView(id); refreshParty();
  try { const saved = await Store.save("entries", rec); upsert(state.entries, saved); liveSend("entries", saved); } catch (err) { fail(err); }
}
// scelta dal catalogo nel modulo del cyberware: le voci del gruppo dello slot in cima
const slotGroup = slotId => (CW.GROUPS.find(g => g.slot === slotId.replace(/_sx$/, "_dx")) || {}).id || "";
const cwOptions = slotId => {
  const g0 = slotGroup(slotId), groups = [...CW.GROUPS].sort((a, b) => (b.id === g0) - (a.id === g0) || (g0 === "arm" && b.id === "limbcover") - (g0 === "arm" && a.id === "limbcover"));
  return `<option value="">+ dal catalogo…</option>` + groups.map(g => {
    const list = CW.all().filter(c => c.g === g.id && !c.base); if (!list.length) return "";   // la base si attiva sullo slot
    return `<optgroup label="${esc(g.label)}">${list.map(c => `<option value="${esc(c.id)}">${c.custom ? "★ " : ""}${esc(c.name)} · ${c.cost.toLocaleString("it-IT")} E$ · PU ${c.pu}${c.dice && c.dice !== "N/A" ? ` (${c.dice})` : ""}</option>`).join("")}</optgroup>`;
  }).join("");
};
const shortDesc = c => { const d = String(c.desc || ""); const cut = d.indexOf(". "); return (cut > 0 && cut < 110 ? d.slice(0, cut + 1) : d.slice(0, 110)).trim(); };

// ---------- cyberware custom (meta "cyberhb") ----------
const cyberHbRec = () => state.cyberhb || { id: "cyberhb", items: [] };
function editCyberHb(cid) {
  if (!Store.canEdit()) return;
  const R = cyberHbRec(), old = (R.items || []).find(x => x.id === cid) || {};
  const f0 = (old.fx || [])[0] || {};
  const skOpts = v => `<option value="">—</option>` + CPR.SKILLS.map(k => `<option value="${k.id}" ${k.id === v ? "selected" : ""}>${esc(k.label)}</option>`).join("");
  openModal(`
    <form class="form" id="cyhb-form">
      <div class="modal-head"><h2>// ★ CYBERWARE CUSTOM</h2><button type="button" class="x" data-action="close" aria-label="Chiudi">×</button></div>
      <div class="modal-body"><div class="fields">
        <div class="field full"><label class="req">Nome</label><input name="name" required value="${esc(old.name || "")}"></div>
        <div class="field"><label>Tipo</label><select name="g">${CW.GROUPS.map(g => `<option value="${g.id}" ${g.id === (old.g || "internal") ? "selected" : ""}>${esc(g.label)}</option>`).join("")}</select></div>
        <div class="field"><label>Installazione</label><select name="inst">${["Centro Commerciale", "Clinica", "Ospedale", "N/A"].map(x => `<option ${x === (old.inst || "Clinica") ? "selected" : ""}>${x}</option>`).join("")}</select></div>
        <div class="field"><label>Costo (E$)</label><input name="cost" type="number" min="0" value="${esc(old.cost ?? 500)}"></div>
        <div class="field"><label>Categoria di prezzo</label><input name="cat" value="${esc(old.cat || "Oneroso")}"></div>
        <div class="field"><label>PU media</label><input name="pu" type="number" min="0" value="${esc(old.pu ?? 7)}"></div>
        <div class="field"><label>PU (dadi)</label><input name="dice" value="${esc(old.dice || "2d6")}" placeholder="2d6, 1d6/2, N/A"></div>
        <div class="field"><label>Slot occupati</label><input name="slots" type="number" min="0" max="7" value="${esc(old.slots ?? 1)}"></div>
        <div class="field"><label>Richiede</label><input name="req" value="${esc(old.req || "")}" placeholder="es. Cyberbraccio, 2 Slot"></div>
        <div class="field full"><label>Descrizione</label><textarea name="desc" rows="3">${esc(old.desc || "")}</textarea></div>
        <h3 class="sh-h field full">Effetto nei tiri <small>facoltativo</small></h3>
        <div class="field"><label>Tipo di effetto</label><select name="ft">${[["", "Nessuno"], ["skill", "Bonus a un'abilità"], ["mod", "Bonus a un tipo di tiro"], ["body", "+ BODY"], ["weapon", "Arma integrata"], ["pain", "Ignora Seriously Wounded"]].map(([v, l]) => `<option value="${v}" ${v === (f0.t || "") ? "selected" : ""}>${l}</option>`).join("")}</select></div>
        <div class="field"><label>Valore (±)</label><input name="fv" type="number" min="-10" max="10" value="${esc(f0.v ?? 2)}"></div>
        <div class="field"><label>Abilità (bonus a un'abilità)</label><select name="fs">${skOpts((f0.skills || [])[0] || "")}</select></div>
        <div class="field"><label>Seconda abilità</label><select name="fs2">${skOpts((f0.skills || [])[1] || "")}</select></div>
        <div class="field"><label>Tipo di tiro (bonus a un tipo)</label><select name="fm">${CPR.MOD_TARGETS.map(([v, l]) => `<option value="${v}" ${v === (f0.target || "attack") ? "selected" : ""}>${l}</option>`).join("")}</select></div>
        <div class="field"><label>Solo a comando (es. «Attivato»)</label><input name="fc" value="${esc(f0.cond || "")}" placeholder="vuoto = sempre attivo"></div>
        <div class="field"><label>Arma: categoria</label><select name="fwc">${CPR.WEAPON_TYPES.map(t => `<option value="${t.id}" ${t.id === (f0.cat || "mmelee") ? "selected" : ""}>${esc(t.label)}</option>`).join("")}</select></div>
        <div class="field"><label>Arma: danno</label><input name="fwd" value="${esc(f0.dmg || "2d6")}"></div>
      </div></div>
      <div class="modal-foot">
        ${old.id ? `<button type="button" class="btn ghost small left danger" data-cyhb-del>Elimina</button>` : `<button type="button" class="btn ghost small left" data-action="close">Annulla</button>`}
        <button type="submit" class="btn">Salva</button>
      </div>
    </form>`);
  const form = $("#cyhb-form");
  const save = async items => {
    try {
      const saved = await Store.save("meta", { ...cyberHbRec(), id: "cyberhb", items });
      state.cyberhb = saved; CW.setHomebrew(saved); liveSend("meta", saved);
      closeModal(); route(); toast("Cyberware custom salvato", "ok");
    } catch (err) { fail(err); }
  };
  $("[data-cyhb-del]", form) && $("[data-cyhb-del]", form).addEventListener("click", async () => {
    if (await askConfirm(`Eliminare «${old.name}» dal catalogo? Gli impianti già nelle schede restano, ma senza effetti.`)) save((R.items || []).filter(x => x.id !== old.id));
  });
  form.addEventListener("submit", ev => {
    ev.preventDefault();
    const v = k => form.elements[k].value.trim(), ft = v("ft");
    if (ft === "weapon" && !CPR.parse(v("fwd"))) return toast("Danno dell'arma non valido (es. 2d6)", "err");
    const fx = !ft ? [] : [{ t: ft, v: num(v("fv")), ...(ft === "skill" ? { skills: [v("fs"), v("fs2")].filter(Boolean) } : {}), ...(ft === "mod" ? { target: v("fm") } : {}),
      ...(ft === "body" ? { max: 10 } : {}), ...(ft === "weapon" ? { name: v("name"), cat: v("fwc"), dmg: v("fwd"), rof: (CPR.weaponType(v("fwc")) || {}).rof || 1 } : {}), ...(v("fc") ? { cond: v("fc") } : {}) }];
    if (ft === "skill" && !fx[0].skills.length) return toast("Scegli almeno un'abilità", "err");
    const item = { id: old.id || "cw-" + NET.uid(), name: v("name"), g: v("g"), inst: v("inst"), cost: num(v("cost")), cat: v("cat"), pu: num(v("pu")), dice: v("dice") || "N/A", slots: num(v("slots")), req: v("req"), desc: v("desc"), fx };
    save(old.id ? R.items.map(x => x.id === old.id ? item : x) : [...(R.items || []), item]);
  });
}

// ---------- GLOSSARIO: tutti i cataloghi del sito ----------
// Night Market: le prime quattro tab sono il negozio (con un PG scelto si compra), le altre la consultazione
const GLOSS_TABS = [["weapon", "Armi"], ["armor", "Armature"], ["gear", "Equipaggiamento"], ["drug", "Droghe"], ["cyber", "Cyberware"], ["deck", "Cyberdeck"], ["weapons", "Regole delle armi"], ["rules", "Munizioni e stati"], ["crit", "Critical Injury"], ["net", "NET"]];
const SHOP_TABS = ["weapon", "armor", "gear", "drug", "cyber", "deck"];
const glossTab = () => { const t = ls.get("nc-gloss", "weapon"); return GLOSS_TABS.some(x => x[0] === t) ? t : "weapon"; };
let glossQ = "", glossG = "";
function viewGlossary() {
  const tab = glossTab();
  return `
    <div class="page-head">
      <div><div class="kicker">// NIGHT_MARKET</div><h1>Night Market</h1><p>Armi, armature, equipaggiamento e cyberware da comprare, più i cataloghi delle regole. Scegli con chi entri e compra con un clic: l'oggetto va nella sua scheda. Le voci ★ sono custom.</p></div>
      <div class="row-btns">${Store.canEdit() ? ({ weapon: [["weapon", "Arma"]], armor: [["armor", "Armatura"]], gear: [["gear", "Oggetto"]], drug: [["drug", "Droga"]], deck: [["deck", "Cyberdeck"], ["deckprog", "Programma / hardware"]] }[tab] || [])
        .map(([t, l]) => `<button type="button" class="btn small yellow" data-action="mk-custom" data-type="${t}">★ + ${l} custom</button>`).join("") + (tab === "cyber" ? `<button type="button" class="btn small yellow" data-action="cyhb-edit">★ + Cyberware custom</button>` : "") : ""}</div>
    </div>
    ${SHOP_TABS.includes(tab) ? marketBar() : ""}
    <div class="chips gl-tabs">${GLOSS_TABS.map(([id, l], i) => `${i === SHOP_TABS.length ? `<span class="gl-sep"></span>` : ""}<button type="button" class="chip ${id === tab ? "active" : ""}" data-action="gloss-tab" data-tab="${id}">${l}</button>`).join("")}</div>
    <div id="gloss-body">${glossBody(tab)}</div>`;
}
function glossBody(tab) {
  if (["weapon", "armor", "gear", "deck", "drug"].includes(tab)) return shopBody(tab);
  if (tab === "cyber") {
    const q = norm2(glossQ), buy = mkCanBuy();
    const list = CW.all().filter(c => (isGm() || !mkHidden("cw:" + c.id)) && (!glossG || c.g === glossG) && (!glossP || MK.priceCat(num(c.cost)) === glossP) && (!q || norm2(`${c.name} ${c.desc} ${c.req || ""} ${c.src || ""}`).includes(q)));
    return `<div class="gl-filters"><input type="search" data-gloss-q placeholder="cerca: nome, effetto, requisito…" value="${esc(glossQ)}">
        <select data-gloss-g><option value="">Tutti i tipi</option>${CW.GROUPS.map(g => `<option value="${g.id}" ${g.id === glossG ? "selected" : ""}>${esc(g.label)}</option>`).join("")}</select>
        <select data-gloss-p><option value="">Tutti i prezzi</option>${MK.PRICES.map(([l, v]) => `<option value="${esc(l)}" ${l === glossP ? "selected" : ""}>${esc(l)} (${v.toLocaleString("it-IT")} eb)</option>`).join("")}</select>
        <span class="hint">${list.length} voci · un impianto occupa 1 Slot salvo indicazione</span></div>
      <div class="gl-wrap"><table class="gl-t">
        <thead><tr><th>Nome</th><th>Tipo</th><th>Installazione</th><th>Descrizione</th><th>Costo</th><th>PU</th>${buy ? "<th></th>" : ""}</tr></thead>
        <tbody>${CW.GROUPS.filter(g => list.some(c => c.g === g.id)).map(g => `<tr class="gl-grp"><th colspan="${buy ? 7 : 6}">${esc(g.label)}${g.note ? ` <small>${esc(g.note)}</small>` : ""}</th></tr>` +
          list.filter(c => c.g === g.id).map(c => `<tr class="${c.base ? "gl-base" : ""} ${mkHidden("cw:" + c.id) ? "mk-hid" : ""}">
            <td><b>${c.custom ? "★ " : ""}${esc(c.name)}</b>${c.custom && Store.canEdit() ? ` <button type="button" class="gp-btn" data-action="cyhb-edit" data-id="${esc(c.id)}" aria-label="Modifica">✎</button>` : ""}${mkTools("cw:" + c.id, null)}${(c.fx || []).length ? ` <span class="gl-fx" title="Effetto applicato ai tiri">⚡</span>` : ""}${c.src ? `<small>${esc(c.src)}</small>` : ""}</td>
            <td>${esc(g.label)}</td><td>${esc(c.inst)}</td>
            <td>${esc(c.desc)}${c.req ? `<small>Richiede: ${esc(c.req)}${c.slots > 1 ? ` · ${c.slots} Slot` : ""}</small>` : c.slots === 0 ? `<small>Nessuno Slot</small>` : ""}</td>
            ${mkCostCell(c.cost)}<td class="gl-n">${c.pu}<small>${esc(c.dice || "")}</small></td>${buy ? mkBuyCell("cw:" + c.id, c.cost) : ""}</tr>`).join("")).join("")}</tbody></table></div>
      <p class="hint">⚡ = effetto già applicato ai tiri quando l'impianto è nella scheda (alcuni solo a comando, con l'interruttore nella tab Cyberware). Comprato, l'impianto va nello slot scelto con l'umanità persa tirata; il cyberware fondamentale (Cyberbraccio, Cyberocchio…) si attiva sullo slot.</p>`;
  }
  if (tab === "weapons") return `<div class="gl-wrap"><table class="gl-t"><thead><tr><th>Arma</th><th>Abilità</th><th>Danno</th><th>ROF</th><th>Caricatore</th><th>Autofire</th><th>Munizioni</th><th>VD per distanza</th></tr></thead>
      <tbody>${CPR.WEAPON_TYPES.map(w => { const T = CPR.rangeById(CPR.rangeDefault(w.id)); return `<tr><td><b>${esc(w.label)}</b></td><td>${esc((CPR.skill(w.skill) || {}).label || w.skill)}</td><td>${esc(w.dmg === "BODY" ? "secondo il BODY" : w.dmg)}</td><td>${w.rof}</td><td>${w.mag || "—"}</td><td>${w.auto ? "×" + w.auto : "—"}</td><td>${esc(w.ammo || "—")}</td><td>${T ? T.dv.map(x => x == null ? "–" : x).join(" / ") : "—"}</td></tr>`; }).join("")}</tbody></table></div>
    <h3 class="sh-h">Tabelle delle distanze <small>${CPR.RANGE_BANDS.join(" · ")}</small></h3>
    <div class="gl-wrap"><table class="gl-t"><tbody>${CPR.RANGE_TABLES.map(t => `<tr><th>${esc(t.label)}</th>${t.dv.map(x => `<td class="gl-n">${x == null ? "N/A" : x}</td>`).join("")}</tr>`).join("")}
      <tr class="gl-grp"><th colspan="9">Autofire (fino a 100 m)</th></tr>${CPR.AUTO_TABLES.map(t => `<tr><th>${esc(t.label)}</th>${t.dv.map(x => `<td class="gl-n">${x}</td>`).join("")}<td colspan="3"></td></tr>`).join("")}</tbody></table></div>
    <h3 class="sh-h">Armature</h3>
    <div class="gl-wrap"><table class="gl-t"><thead><tr><th>Armatura</th><th>SP</th><th>Malus a REF, DEX, MOVE</th></tr></thead><tbody>${CPR.ARMOR_TYPES.filter(a => a.sp).map(a => `<tr><td><b>${esc(a.label)}</b></td><td class="gl-n">${a.sp}</td><td class="gl-n">${a.pen || "—"}</td></tr>`).join("")}</tbody></table></div>`;
  if (tab === "rules") return `<h3 class="sh-h">Munizioni ${isGm() ? `<button type="button" class="btn ghost small" data-action="gm-rules">Modifica</button>` : ""}</h3>
    <div class="gl-wrap"><table class="gl-t"><thead><tr><th>Munizione</th><th>Per</th><th>Colpire</th><th>Danno</th><th>Effetto</th></tr></thead><tbody>
      <tr><td><b>Standard</b></td><td>tutte</td><td>—</td><td>quello dell'arma</td><td></td></tr>
      ${(rules().ammo || []).map(a => `<tr><td><b>${esc(a.name)}</b></td><td>${esc(a.fam || "tutte")}</td><td class="gl-n">${num(a.atk) || "—"}</td><td>${esc(a.dmg || "quello dell'arma")}${num(a.dmgMod) ? ` ${a.dmgMod > 0 ? "+" : ""}${a.dmgMod}` : ""}</td><td>${esc(a.eff || "")}</td></tr>`).join("")}</tbody></table></div>
    <h3 class="sh-h">Stati</h3>
    <div class="gl-wrap"><table class="gl-t"><thead><tr><th>Stato</th><th>Prove</th><th>Danno per round</th><th>Effetto</th></tr></thead><tbody>${statusList().map(s => `<tr><td><b>${esc(s.name)}</b></td><td class="gl-n">${num(s.atk) || "—"}</td><td>${esc(s.dmg || "—")}</td><td>${esc(s.eff || "")}</td></tr>`).join("")}</tbody></table></div>
    <h3 class="sh-h">Colpi mirati <small>−8 al tiro</small></h3>
    <ul class="rl-list">${CPR.AIMED.map(a => `<li><b>${esc(a.label)}</b>: ${esc(a.eff)}</li>`).join("")}</ul>`;
  if (tab === "crit") return ["body", "head"].map(loc => `<h3 class="sh-h">Critical Injury · ${loc === "head" ? "testa" : "corpo"} <small>2d6 · +5 danni diretti</small></h3>
    <div class="gl-wrap"><table class="gl-t"><thead><tr><th>2d6</th><th>Ferita</th><th>Effetto</th><th>Death Save</th></tr></thead><tbody>${(loc === "head" ? CPR.CRIT_HEAD : CPR.CRIT_BODY).map(c => `<tr><td class="gl-n">${c.n}</td><td><b>${esc(c.name)}</b></td><td>${esc(c.eff)}</td><td class="gl-n">${c.dsp ? "+1" : "—"}</td></tr>`).join("")}</tbody></table></div>`).join("");
  if (tab === "net") return `<h3 class="sh-h">Programmi</h3>
    <div class="gl-wrap"><table class="gl-t"><thead><tr><th>Programma</th><th>Classe</th><th>ATK</th><th>DEF</th><th>REZ</th><th>Effetto</th><th>Costo</th></tr></thead><tbody>${NET.PROGRAMS.map(p => `<tr><td><b>${esc(p.name)}</b></td><td>${esc(NET.CLASSES[p.cls].label)}</td><td class="gl-n">${p.atk}</td><td class="gl-n">${p.def}</td><td class="gl-n">${p.rez}</td><td>${esc(p.eff)}</td><td class="gl-n">${p.cost} E$</td></tr>`).join("")}</tbody></table></div>
    <h3 class="sh-h">Black ICE</h3>
    <div class="gl-wrap"><table class="gl-t"><thead><tr><th>Black ICE</th><th>Classe</th><th>PER</th><th>VEL</th><th>ATT</th><th>DIF</th><th>REZ</th><th>Effetto</th></tr></thead><tbody>${NET.allIce().map(c => `<tr><td><b>${c.homebrew ? "★ " : ""}${esc(NET.iceLabel(c))}</b></td><td>${esc(NET.CLASSES[c.cls].short)}</td><td class="gl-n">${c.per}</td><td class="gl-n">${c.spd}</td><td class="gl-n">${c.atk}</td><td class="gl-n">${c.def}</td><td class="gl-n">${c.rez}</td><td>${esc(c.eff)}</td></tr>`).join("")}</tbody></table></div>
    <h3 class="sh-h">Hardware del Cyberdeck</h3>
    <div class="gl-wrap"><table class="gl-t"><tbody>${NET.HARDWARE.map(h => `<tr><td><b>${esc(h.name)}</b></td><td class="gl-n">${h.slots} slot</td><td>${esc(h.eff)}</td></tr>`).join("")}</tbody></table></div>
    <h3 class="sh-h">Demoni</h3>
    <div class="gl-wrap"><table class="gl-t"><thead><tr><th>Demone</th><th>REZ</th><th>Interface</th><th>Azioni NET</th><th>Combattimento</th></tr></thead><tbody>${NET.allDemons().map(d => `<tr><td><b>${d.homebrew ? "★ " : ""}${esc(d.name)}</b></td><td class="gl-n">${d.rez}</td><td class="gl-n">${d.iface}</td><td class="gl-n">${d.actions}</td><td class="gl-n">${d.combat}</td></tr>`).join("")}</tbody></table></div>`;
  return "";
}
