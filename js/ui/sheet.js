// ============================================================
//  NIGHT CITY ARCHIVE — scheda del personaggio: STAT, abilità, modulo
//  (js/ui/: i file si caricano in ordine da index.html e condividono le costanti)
// ============================================================

// ---------- SCHEDA PERSONAGGIO (Cyberpunk RED, in inglese) ----------
// e.sheet = { owner, ability, rank, stats{INT…}, skills{id: livello}, custom[{name, group, stat, lvl}],
//             hp, hpMax, luck, dsp (death save penalty), armor{head/body: {name, sp, cur}},
//             weapons[{name, skill, dmg, rof, mag, note}], rep, ip, crit, notes }
const sheetOf = e => (e && e.sheet) || {};
const hasSheet = e => !!(e && e.sheet && e.sheet.stats && Object.values(e.sheet.stats).some(hasVal));
const statBase = (e, id) => id === "BODY" && cyberItems(e).length ? CW.effects(cyberItems(e), num((sheetOf(e).stats || {}).BODY)).body : num((sheetOf(e).stats || {})[id]);
// l'EMP segue l'umanità del cyberware: EMP = umanità attuale / 10
// l'armatura pesante toglie a REF, DEX e MOVE (−2 Medium/Heavy Armorjack, −4 Flak/Metalgear), salvo armatura migliorata
const sheetArmorType = a => a.type || ((CPR.ARMOR_TYPES.find(t => t.sp && norm(t.label) === norm(a.name)) || {}).id) || "custom";
const pcPen = e => { const s = sheetOf(e), ar = s.armor || {}; return CPR.armorPen({ head: { type: sheetArmorType(ar.head || {}) }, body: { type: sheetArmorType(ar.body || {}) } }, s.armorNoPen); };
function statEff(e, id) {
  if (id === "EMP") { const cs = cyberStats(e); if (cs.current != null) return Math.max(0, Math.floor(cs.current / 10)); }
  return CPR.PEN_STATS.includes(id) ? Math.max(0, statBase(e, id) + pcPen(e)) : statBase(e, id);
}
const hpMaxOf = e => { const s = sheetOf(e); return hasVal(s.hpMax) ? num(s.hpMax) : CPR.hpMax(statBase(e, "BODY"), statBase(e, "WILL")); };
const hpOf = e => { const s = sheetOf(e); return hasVal(s.hp) ? num(s.hp) : hpMaxOf(e); };
const woundOf = e => CPR.painFix(CPR.wound(hpOf(e), hpMaxOf(e)), cyberItems(e).length > 0 && cyberFx(e).pain);
const luckOf = e => { const s = sheetOf(e); return hasVal(s.luck) ? num(s.luck) : statBase(e, "LUCK"); };
const wornOf = (e, loc) => { const a = (sheetOf(e).armor || {})[loc] || {}; const sp = num(a.sp); return { name: a.name || "", sp, cur: hasVal(a.cur) ? num(a.cur) : sp }; };
// Armatura Subdermale / Skin Weave: SP sottopelle a testa e corpo (vale la più alta, ma si ablano tutte insieme;
// ogni giorno di riposo completo ne ricostruisce 1) · sheet.skin = { head, body } con la SP attuale sottopelle
const skinOf = (e, loc) => {
  if (!cyberItems(e).length) return null;
  const best = cyberFx(e).armor.sort((a, b) => b.sp - a.sp)[0]; if (!best) return null;
  const v = (sheetOf(e).skin || {})[loc];
  return { name: best.name, sp: best.sp, cur: hasVal(v) ? clamp(num(v), 0, best.sp) : best.sp };
};
const armorOf = (e, loc) => {
  const w = wornOf(e, loc), k = skinOf(e, loc);
  if (!k) return w;
  return { name: [w.sp ? w.name || "Armatura" : "", k.name].filter(Boolean).join(" + "), sp: Math.max(w.sp, k.sp), cur: Math.max(w.cur, k.cur), worn: w, skin: k };
};
// −1 = ablazione di tutte le armature della locazione · +1 / ↺ = riparazione di quella indossata · rest = +1 sottopelle (riposo)
function armorPatch(s, e, loc, d) {
  const w = wornOf(e, loc), k = skinOf(e, loc);
  s.armor = s.armor || {};
  const setWorn = v => { s.armor[loc] = { ...(s.armor[loc] || {}), cur: v }; };
  const setSkin = v => { s.skin = { ...(s.skin || {}), [loc]: v }; };
  if (d === "reset") { if (w.sp) setWorn(w.sp); else if (k) setSkin(k.sp); }
  else if (d === "rest") { if (k) setSkin(clamp(k.cur + 1, 0, k.sp)); }
  else if (num(d) < 0) { if (w.sp) setWorn(clamp(w.cur + num(d), 0, w.sp)); if (k) setSkin(clamp(k.cur + num(d), 0, k.sp)); }
  else { if (w.sp) setWorn(clamp(w.cur + num(d), 0, w.sp)); else if (k) setSkin(clamp(k.cur + num(d), 0, k.sp)); }
  return s;
}
const SK_GROUPS = [...CPR.SKILL_GROUPS.map(g => g.name), "Other"];
// abilità standard + abilità personalizzate (Language (Japanese), Science (Chemistry)…)
function skillsOf(e) {
  const s = sheetOf(e), lv = s.skills || {};
  const std = CPR.SKILLS.map(k => ({ ...k, key: "skill:" + k.id, lvl: num(lv[k.id]) }));
  const cus = (s.custom || []).map((c, i) => ({ id: "c" + i, label: c.name, stat: c.stat || "INT", group: SK_GROUPS.includes(c.group) ? c.group : "Other", lvl: num(c.lvl), custom: true, key: "cskill:" + i }));
  return [...std, ...cus];
}
const skillByKey = (e, key) => skillsOf(e).find(k => k.key === key);
const weaponSkillKey = id => "skill:" + id;
const ownerOf = e => norm(sheetOf(e).owner);
const myPg = () => Store.user ? state.entries.find(e => e.kind === "pg" && ownerOf(e) === norm(Store.user)) : null;

let sheetMod = 0;   // modificatore situazionale (campo MOD della scheda), vale per i tiri successivi

// prova con le regole di Cyberpunk RED: base + 1d10, malus ferite e MOD
function sheetCheck(e, label, parts, extra = {}) {
  return postRoll({ kind: "check", who: e.name, entryId: e.id, label, ...CPR.check([...parts, ...sheetExtra(e)]), ...extra });
}

function sheetRoll(e, what) {
  if (what.startsWith("deck:")) return deckRoll(sheetDeckCtx(e), what.slice(5));
  const [type, a, b] = what.split(":");
  if (type === "stat") {
    const st = CPR.STATS.find(s => s.id === a);
    return sheetCheck(e, `${st.label} check`, [{ l: a, v: statEff(e, a) }]);
  }
  if (type === "skill" || type === "cskill") {
    const k = skillByKey(e, type + ":" + a); if (!k) return;
    return sheetCheck(e, k.label, [{ l: k.stat, v: statEff(e, k.stat) }, { l: k.label, v: k.lvl }, ...skillBonusAll(e, k)]);
  }
  if (type === "ability") {
    const r = rolesOf(e)[0], R = r && RL.roleById(r.id);
    if (R) return sheetCheck(e, R.abilityIt, [{ l: R.abilityIt, v: clamp(num(r.rank), 0, 10) }]);
    const s = sheetOf(e);
    return sheetCheck(e, s.ability || CPR.ROLE_ABILITIES[e.role] || "Role Ability", [{ l: "Rank", v: num(s.rank) }]);
  }
  if (type === "wpn") {
    const w = (sheetOf(e).weapons || [])[+a]; if (!w) return;
    return b === "dmg" ? cbDamage(pcSrc(e, +a)) : cbRoll(pcSrc(e, +a), "single");
  }
  if (type === "init") return rollInitiative(e);
  if (type === "death") {
    const d = CPR.die(10), pen = num(sheetOf(e).dsp), body = statBase(e, "BODY");
    const r = deathRoll(d, pen, body);
    // ogni Death Save fatto alza di 1 la penalità dei successivi
    if (Store.canEdit()) sheetPatch(e.id, x => { x.dsp = pen + 1; return x; });
    return postRoll({ kind: "death", who: e.name, entryId: e.id, label: "Death Save", ...r });
  }
}

// Death Save: 1d10 + penalità ≤ BODY; un 10 naturale fallisce sempre; dopo il tiro la penalità sale di 1
function deathRoll(d, pen, body) {
  const total = d + pen, ok = d !== 10 && total <= body;
  return { dice: [{ v: d, s: 10, t: d === 10 ? "fumble" : "" }], mods: pen ? [{ l: "Death Save Penalty", v: pen }] : [], total, crit: d === 10 ? "fail" : "",
    hit: { ok, text: d === 10 ? "10 naturale: fallito" : ok ? `Riuscito (≤ BODY ${body})` : `Fallito (BODY ${body})` },
    note: `Penalità ${pen} → ${pen + 1} per il prossimo Death Save` };
}
function rollInitiative(e, extra = {}) {
  const d = CPR.die(10), ref = statEff(e, "REF"), im = modsFor([...(sheetOf(e).mods || []), ...roleMods(e), ...cyberFx(e).mods], ["init"]);
  return postRoll({ kind: "init", who: e.name, entryId: e.id, label: "Initiative", dice: [{ v: d, s: 10 }], mods: [{ l: "REF", v: ref }, ...im], total: d + ref + im.reduce((t, m) => t + m.v, 0), ...extra });
}

// modifiche rapide dalla scheda (PF, fortuna, SP…): aggiorno subito la vista e salvo dopo una breve pausa
const sheetTimers = new Map();
function sheetPatch(id, fn) {
  const e = state.entries.find(x => x.id === id); if (!e) return;
  const next = { ...e, sheet: fn(JSON.parse(JSON.stringify(sheetOf(e)))) };
  upsert(state.entries, next);
  refreshSheetView(id); refreshParty(); if (onTable()) { renderTokens(); renderSide(); }
  clearTimeout(sheetTimers.get(id));
  sheetTimers.set(id, setTimeout(async () => {
    sheetTimers.delete(id);
    try {
      const saved = await Store.save("entries", state.entries.find(x => x.id === id));
      if (!sheetTimers.has(id)) upsert(state.entries, saved);   // se nel frattempo è cambiato altro, tengo la versione più nuova
      liveSend("entries", saved);
    } catch (err) { fail(err); }
  }, 500));
}
function refreshSheetView(id) {
  const e = state.entries.find(x => x.id === id); if (!e) return;
  const box = $(`#modal .sh[data-sheet="${CSS.escape(id)}"]`), dt = $(`#modal .nd-tab[data-deck-tab="${CSS.escape(id)}"]`), cb = $(`#modal .cb[data-combat="${CSS.escape(id)}"]`), rt = $(`#modal .rl-tab[data-roles-tab="${CSS.escape(id)}"]`);
  const cw = $(`#modal .cy-wrap[data-cyber="${CSS.escape(id)}"]`), gw = $(`#modal .gear-wrap[data-gear="${CSS.escape(id)}"]`);
  if (!box && !dt && !cb && !rt && !cw && !gw) return;
  if (gw) gw.innerHTML = gearInner(e);
  if (cw) { cw.outerHTML = cyberHtml(e); const fig = $("#modal .cy-figure"); if (fig) fig.dataset.zones.split(" ").filter(Boolean).forEach(z => $$(`.cy-zone[data-zone="${z}"]`, fig).forEach(n => n.classList.add("on"))); }
  if (rt) { const keep = $$("details[open]", rt).map(d => [...rt.querySelectorAll("details")].indexOf(d)); rt.outerHTML = rolesTabHtml(e); const n = $(`#modal .rl-tab[data-roles-tab="${CSS.escape(id)}"]`); keep.forEach(k => { const d = n.querySelectorAll("details")[k]; if (d) d.open = true; }); }
  const y = $("#modal").scrollTop;
  if (box) box.outerHTML = sheetHtml(e);
  if (cb) cb.outerHTML = combatHtml(e);
  if (dt) dt.outerHTML = deckTabHtml(e);
  $("#modal").scrollTop = y;
}

// armatura come gli HP: barra + pulsanti (−1 ablazione, +1 riparazione, ↺ SP piena)
// a = { cur, sp, name } · btn(d) = attributi del pulsante, oppure falso se non si può modificare
function spBar(label, a, btn) {
  const pct = a.sp ? Math.max(0, Math.min(100, a.cur / a.sp * 100)) : 0;
  const sk = a.skin ? `<span class="sp-skin" title="Si abla insieme all'armatura indossata; vale la SP più alta">Sottopelle ${esc(a.skin.name)} <b>${a.skin.cur}</b>/${a.skin.sp}${a.worn && a.worn.sp ? ` · indossata ${a.worn.cur}/${a.worn.sp}` : ""}
    ${btn ? `<button type="button" class="gp-btn" ${btn("rest")} title="Giorno di riposo completo: +1 SP sottopelle" aria-label="Riposo: +1 SP sottopelle">🛌</button>` : ""}</span>` : "";
  return `<div class="sp-line ${a.sp && a.cur < a.sp ? "worn" : ""} ${a.sp && a.cur <= 0 ? "broken" : ""}">
    <span class="sp-top"><span class="sh-k">${label}</span><b>${a.cur}</b><small>/ ${a.sp}</small>${a.name ? `<em>${esc(a.name)}</em>` : ""}</span>
    <span class="sp-bar" title="SP attuale"><i style="width:${pct}%"></i></span>
    ${btn ? `<span class="sh-adj">${[[-1, "−1", "Ablazione: −1 SP"], [1, "+1", "Riparazione: +1 SP"], ["reset", "↺", "SP piena"]]
      .map(([d, l, t]) => `<button type="button" class="gp-btn" ${btn(d)} title="${t}">${l}</button>`).join("")}</span>` : ""}
    ${sk}
  </div>`;
}

function adjBtns(id, f, steps) {
  return `<span class="sh-adj">${steps.map(d => `<button type="button" class="gp-btn" data-action="sheet-adj" data-id="${esc(id)}" data-f="${f}" data-d="${d}" aria-label="${d > 0 ? "+" : ""}${d}">${d > 0 ? "+" : "−"}${Math.abs(d) === 1 ? "" : Math.abs(d)}</button>`).join("")}</span>`;
}

function sheetHtml(e) {
  const s = sheetOf(e), edit = Store.canEdit(), id = esc(e.id);
  if (!hasSheet(e)) return `<div class="sh" data-sheet="${id}"><div class="empty"><div class="big">// SCHEDA VUOTA</div>Nessuna statistica inserita per questo personaggio.
    ${edit ? `<br><button class="btn" data-action="edit-sheet" data-id="${id}">Compila la scheda</button>` : ""}</div></div>`;
  const max = hpMaxOf(e), hp = hpOf(e), w = woundOf(e), cs = cyberStats(e);
  const ability = s.ability || CPR.ROLE_ABILITIES[e.role] || "Role Ability";
  const pct = v => Math.max(0, Math.min(100, max ? v / max * 100 : 0));
  const showAll = ls.get("nc-sk-all", false);
  const roll = (what, inner, cls = "", title = "") => `<button type="button" class="${cls}" data-action="sheet-roll" data-id="${id}" data-roll="${what}" ${title ? `title="${esc(title)}"` : ""}>${inner}</button>`;
  const skills = skillsOf(e);
  const groups = SK_GROUPS.map(g => {
    const list = skills.filter(k => k.group === g && (showAll || k.lvl > 0));
    if (!list.length) return "";
    return `<section class="sk-group"><header>${esc(g)}</header>${list.map(k => roll(k.key, `
      <span class="sk-n">${esc(k.label)}${k.x2 ? ` <i title="Costo doppio">×2</i>` : ""}</span><span class="sk-s">${k.stat}</span><span class="sk-l">${k.lvl}</span><span class="sk-b">${(() => { const rb = skillBonusAll(e, k).reduce((t, b) => t + b.v, 0); return statEff(e, k.stat) + k.lvl + rb + (rb ? `<i class="sk-rb" title="Bonus di Ruolo e cyberware">+${rb}</i>` : ""); })()}</span>`,
      "sk " + (k.lvl ? "" : "zero"), `Tira ${k.label}: ${k.stat} + livello + 1d10`)).join("")}</section>`;
  }).join("");
  const weapons = s.weapons || [];
  return `
    <div class="sh" data-sheet="${id}">
      <div class="sh-bar">
        <label class="sh-mod" title="Modificatore situazionale aggiunto a tutti i tiri di prova (es. −2 copertura, +1 mira)">MOD <input type="number" step="1" data-sheet-mod value="${sheetMod}"></label>
        <span class="hint">Clicca una STAT o un'abilità per tirare · armi e danni nella tab Combattimento.</span>
        <button type="button" class="btn ghost small cyan" data-action="dice-open">⬢ Dice log</button>
      </div>
      <div class="sh-top">
        <div class="sh-box hp w-${w.id}">
          <span class="l">Hit Points</span>
          <span class="n">${hp}<small> / ${max}</small></span>
          <span class="sh-hpbar"><i style="width:${pct(hp)}%"></i><b style="left:${pct(CPR.seriousAt(max))}%" title="Seriously Wounded"></b></span>
          <span class="sh-sub">${w.label}${w.pen ? ` · ${w.pen} to all Actions` : ""}</span>
          ${edit ? adjBtns(e.id, "hp", [-5, -1, 1, 5]) : ""}
        </div>
        <div class="sh-box">
          <span class="l">Role · ${esc(rolesOf(e).map(r => (RL.roleById(r.id) || {}).it).filter(Boolean).join(" / ") || e.role || "—")}</span>
          ${rolesOf(e).length ? `<button type="button" class="sh-rollbox" data-action="open-entry-tab" data-id="${id}" data-tab="roles"><span class="n sm">${rolesOf(e).map(r => `${esc((RL.roleById(r.id) || {}).abilityIt || "")} ${clamp(num(r.rank), 0, 10)}`).join(" · ")}</span><span class="sh-sub">apri la tab Ruoli →</span></button>`
            : roll("ability", `<span class="n sm">${esc(ability)}</span><span class="sh-sub">Rank ${num(s.rank)} · tira Rank + 1d10</span>`, "sh-rollbox")}
        </div>
        <div class="sh-box">
          <span class="l">Humanity</span>
          ${cs.current != null ? `<span class="n">${cs.current}<small> / ${cs.max}</small></span><span class="sh-sub">EMP ${statEff(e, "EMP")} (base ${statBase(e, "EMP")}) · dal cyberware</span>`
            : `<span class="n">${statBase(e, "EMP") * 10}</span><span class="sh-sub">EMP × 10 · imposta l'umanità nel cyberware</span>`}
        </div>
        <div class="sh-box"><span class="l">Luck</span><span class="n">${luckOf(e)}<small> / ${statBase(e, "LUCK")}</small></span>
          ${edit ? `<span class="sh-adj"><button type="button" class="gp-btn" data-action="sheet-adj" data-id="${id}" data-f="luck" data-d="-1" title="Spendi 1 punto">−</button><button type="button" class="gp-btn" data-action="sheet-adj" data-id="${id}" data-f="luck" data-d="1">+</button><button type="button" class="gp-btn" data-action="sheet-adj" data-id="${id}" data-f="luck" data-d="reset" title="Ripristina (nuova sessione)">↺</button></span>` : ""}</div>
        <div class="sh-box"><span class="l">Move</span><span class="n">${statEff(e, "MOVE") * 2}<small> m/turn</small></span><span class="sh-sub">${statEff(e, "MOVE")} squares · Run ${runOf(e)} m</span></div>
      </div>
      ${pcPen(e) ? `<div class="en-pen">Armatura pesante: ${pcPen(e)} a REF, DEX e MOVE (già calcolato nei valori e nei tiri)</div>` : ""}
      ${(s.status || []).length ? `<div class="sh-status"><span class="sh-k">Stati</span>${statusChips(s.status, null)}</div>` : ""}

      <div class="sh-stats">${CPR.STATS.map(st => roll("stat:" + st.id, `<span class="k">${st.id}</span><span class="v">${statEff(e, st.id)}</span>${statEff(e, st.id) !== statBase(e, st.id) ? `<small>base ${statBase(e, st.id)}</small>` : ""}`, "sh-stat", `${st.label}: ${st.id} + 1d10`)).join("")}</div>

      <div class="sh-sec-head"><h4>Combat</h4><span class="hint">${weapons.filter(w => !w.away).length} arm${weapons.filter(w => !w.away).length === 1 ? "a" : "i"}${weapons.some(w => w.away) ? ` (+${weapons.filter(w => w.away).length} a casa)` : ""} · HP, armatura, iniziativa, stati e Critical Injury</span>
        <button type="button" class="btn ghost small cyan" data-action="open-entry-tab" data-id="${id}" data-tab="combat">Apri Combattimento →</button></div>
      ${isNetrunner(e) ? `<div class="sh-sec-head"><h4>Cyberdeck</h4><span class="hint">${esc(activeDeck(e).name || "Cyberdeck")} · Interface ${ifaceOf(e)} · ${CPR.netActions(ifaceOf(e))} NET Actions</span>
        <button type="button" class="btn ghost small cyan" data-action="open-entry-tab" data-id="${id}" data-tab="deck">Apri il Cyberdeck →</button></div>` : ""}

      <div class="sh-sec-head"><h4>Skills</h4><label class="check"><input type="checkbox" data-sk-all ${showAll ? "checked" : ""}> mostra anche le abilità a 0</label></div>
      <div class="sk-head"><span>Skill</span><span>STAT</span><span>LVL</span><span>BASE</span></div>
      <div class="sh-skills">${groups || `<p class="hint">Nessuna abilità con livello. Spunta "mostra anche le abilità a 0".</p>`}</div>

      <div class="sh-foot">
        <div><span class="sh-k">Reputation</span> <b>${num(s.rep)}</b></div>
        <div><span class="sh-k">Improvement Points</span> <b>${num(s.ip)}</b> <button type="button" class="btn ghost small yellow" data-action="ip-open" data-id="${id}" title="Guadagna e spendi IP, con lo storico">★ Migliora</button></div>
        ${s.owner ? `<div><span class="sh-k">Player</span> <b>${esc(s.owner)}</b></div>` : ""}
      </div>
      ${s.notes ? `<div class="block"><h4>Notes</h4><div class="prewrap">${esc(s.notes)}</div></div>` : ""}
    </div>`;
}
