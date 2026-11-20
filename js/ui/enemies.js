// ============================================================
//  NIGHT CITY ARCHIVE — nemici del GM: scheda, tiri, modulo
//  (js/ui/: i file si caricano in ordine da index.html e condividono le costanti)
// ============================================================

// ---------- NEMICI (solo GM) ----------
// Fascia (1–4) × Livello (Base / Hardened / Elite), Ruolo facoltativo (Solo, Tech, Medtech, Nomade).
// Le regole stanno in js/dice.js: CPR.generateEnemy crea i valori di partenza, CPR.deriveEnemy applica impianti,
// potenziamenti, Capacità di Ruolo, regola del 20 e malus dell'armatura restituendo OGNI addendo.
// e.enemy (v3) = { v, tier, level, role, name, stats (naturali), bodyImplant, moveImplant, armor, noPen,
//                  weapons[{cat,name,quality,skill,dmg,rof,mag}], skills[{id,label,stat,lvl}], roleRank, ca, med,
//                  hpOverride, extreme, extraPoints, frameBody, comp, picks[chiavi del catalogo], cyber, gear, notes }
// Le schede v1 (livelli 1–5) e v2 (con il Tipo) si convertono alla lettura (CPR.normalizeEnemy).
const enemyOf = e => CPR.normalizeEnemy((e && e.enemy) || {});
const enemyD = e => CPR.deriveEnemy(enemyOf(e));
const tierBadge = E => `F${E.tier} · ${CPR.LEVEL_LABELS[E.level] || "Base"}${E.extreme ? " · ☢ Estremo" : ""}`;
const fmtBonus = list => list.map(b => `${b.v < 0 ? "−" : "+"}${Math.abs(b.v)} ${esc(b.l)}`).join(" ");
// "REF 8 + Handgun 6 = 14 · +1 HQ +1 Attacco Preciso = 16 · armatura −2 → 14"
function formula(x, pen) {
  const bon = x.bonus || [];
  let s = `${esc(x.stat)} ${x.statV} + ${esc(x.skillLabel || x.label)} ${x.lvl} = <b>${x.nat}</b>`;
  if (bon.length) s += ` · ${fmtBonus(bon)} = <b>${x.eff}</b>`;
  if (pen && CPR.PEN_STATS.includes(x.stat)) s += ` · armatura ${pen} → <b class="pen">${x.effArmor}</b>`;
  return s;
}
const finalOf = x => x.effArmor;
const armorPenOf = armor => CPR.armorPen(armor, false);

// token di un nemico: HP e SP propri, presi dalla scheda derivata
function enemyToken(e, m, extra = {}) {
  const D = enemyD(e), arm = loc => ({ name: (D.armor[loc] || {}).name || "", sp: +((D.armor[loc] || {}).sp) || null });
  return { mapId: m.id, entryId: e.id, own: true, snapName: e.name, color: "#ff8a3d", size: 1, hpMax: D.hp, armor: { head: arm("head"), body: arm("body") }, ...extra };
}

// tiri: ogni addendo compare nel Dice log. Dal token valgono le sue ferite (salvo Antidolorifico di Fascia 4);
// i tiri dal modello o da un token nascosto sono segreti.
function rollEnemy(e, what, t) {
  const D = enemyD(e), pen = D.pen, ca = D.ability && D.ability.ca;
  const hp = t && tokHp(t), w = hp && !D.painImmune ? CPR.painFix(CPR.wound(hp.hp, hp.max), D.painEditor) : null;
  const wound = w && w.pen ? [{ l: w.label, v: w.pen }] : [];
  if (t) wound.push(...statusParts(t.status, D.immune));   // stati del token (es. Accecato), salvo immunità del cyberware
  wound.push(...modsFor(D.cyberMods, ["all"]));
  const arm = stat => pen && CPR.PEN_STATS.includes(stat) ? [{ l: "Armor", v: pen }] : [];
  const meta = { who: t ? tokName(t) : e.name, enemyId: e.id, gmOnly: !t || tokHidden(t) };
  if (String(what).startsWith("deck:")) {
    if (!D.ability || !D.ability.deck) return;
    return deckRoll({ deck: D.ability.deck, iface: D.ability.rank,
      check: (label, parts, extra) => postRoll({ kind: "check", label, ...meta, ...CPR.check([...parts, ...wound]), ...extra }),
      dmg: (label, x, note) => { const r = CPR.rollExpr(x); if (r) postRoll({ kind: "damage", label, ...meta, ...r, note: note || "" }); },
      msg: text => postRoll({ kind: "msg", ...meta, text }) }, String(what).slice(5));
  }
  const [type, a, b] = String(what).split(":");
  if (type === "stat") { const s = D.stats[a]; return postRoll({ kind: "check", label: `${a} check`, ...meta, ...CPR.check([{ l: a, v: s.v }, ...arm(a), ...wound]) }); }
  if (type === "skill") {
    const s = D.skills[+a]; if (!s) return;
    return postRoll({ kind: "check", label: s.label, ...meta, ...CPR.check([{ l: s.stat, v: s.statV }, { l: s.label, v: s.lvl }, ...s.bonus, ...arm(s.stat), ...wound]) });
  }
  if (type === "ability" && D.ability) return postRoll({ kind: "check", label: D.ability.nameIt || D.ability.name, ...meta, ...CPR.check([{ l: "Grado", v: D.ability.rank }, ...wound]) });
  if (type === "wpn") { const X = enSrc(e.id, +a, t ? t.id : null); return b === "dmg" ? cbDamage(X) : cbRoll(X, "single"); }
  if (type === "crit") { critRoll(meta.who, a, r => postRoll({ ...r, ...meta })); return; }
  if (type === "init") { const d = CPR.die(10), ref = D.stats.REF.armor; return postRoll({ kind: "init", label: "Initiative", ...meta, dice: [{ v: d, s: 10 }], mods: [{ l: "REF", v: ref }, ...D.initBonus], total: d + ref + D.initBonus.reduce((x, y) => x + y.v, 0) }); }
  if (type === "death") {
    // dal token la penalità si conta sul token; dal modello resta a 0
    const pen = t ? num(t.dsp) : 0, r = deathRoll(CPR.die(10), pen, D.body);
    if (t && Store.canEdit()) saveToken({ ...t, dsp: pen + 1 });
    return postRoll({ kind: "death", label: "Death Save", ...meta, ...r, note: r.note + (t ? "" : " · tirato dal modello: la penalità si conta solo dal token") });
  }
}
const enemyBtn = (e, what, label, cls = "chip", t = null, title = "") =>
  `<button type="button" class="${cls}" data-action="enemy-roll" data-id="${esc(e.id)}" data-roll="${what}" ${t ? `data-tok="${esc(t.id)}"` : ""} ${title ? `title="${title}"` : ""}>${label}</button>`;
const initTotal = D => D.stats.REF.armor + D.initBonus.reduce((x, y) => x + y.v, 0);
// tiri veloci nel pannello del token (valori finali, con il malus dell'armatura)
function enemyQuickRolls(e, t) {
  const D = enemyD(e), wl = D.weapons.map(w => w.skillLabel), ca = D.ability && D.ability.ca;
  const top = D.skills.map((s, i) => ({ s, i })).filter(x => !wl.includes(x.s.label)).sort((a, b) => finalOf(b.s) - finalOf(a.s)).slice(0, 4);
  return `<div class="pc-rolls tt-quick">
    ${enemyBtn(e, "init", `Initiative <b>${initTotal(D)}</b>`, "chip y", t)}
    ${D.weapons.map((_, i) => cbQuick(enSrc(e.id, i, t ? t.id : null))).join("")}
    ${top.map(x => enemyBtn(e, `skill:${x.i}`, `${esc(x.s.label)} <b>${finalOf(x.s)}</b>`, "chip", t)).join("")}
    ${D.ability && D.ability.deck ? netQuick(D.ability.deck, D.ability.rank, (w, l, c) => enemyBtn(e, "deck:" + w, l, c, t)) : ""}
    ${ca && ca.deflect ? `<span class="hint">Deflettere Danni: −${ca.deflect} al primo danno del round</span>` : ""}
  </div>`;
}

// riquadro della Capacità di Ruolo con gli effetti in gioco
function roleBlock(D) {
  const A = D.ability; if (!A) return "";
  let body = "";
  if (A.ca) body = `<div class="en-ca">${CPR.CA_USES.map(u => { const n = +A.ca[u.id] || 0; return n ? `<span><b>${esc(u.label)}${u.id === "recover" ? "" : ` ${n}`}</b> <small>${u.cost(n)} pt · ${esc(u.id === "recover" ? u.unit : u.unit.replace("+1", "+" + n).replace("−1", "−" + n))}</small></span>` : ""; }).join("")}</div>
    <div class="hint">Punti di ruolo usati ${A.caUsed} / ${A.rank}. Attacco Preciso e Reazione sono già nei tiri; Individuare Minacce è nella Perception.</div>`;
  if (A.maker) body = `<div class="hint">Esperienza sul Campo ${A.maker.field} (sommata a Basic Tech, Cybertech, Electronics/Security, Weaponstech e tecnologie dei veicoli) · Upgrade ${A.maker.upgrade}.</div>`;
  if (A.med) body = `<div class="hint">Chirurgia ${A.med.surgery} (Surgery ${Math.min(10, 2 * A.med.surgery)}) · Farmaceutica ${A.med.pharma} · Criosistemi ${A.med.cryo} (Medical Tech ${Math.min(10, (+A.med.pharma || 0) + (+A.med.cryo || 0))}).</div>`;
  if (A.actions) body = `<div class="hint">Interfaccia ${A.rank}: <b>${A.actions}</b> Azioni NET per turno · le Capacità d'Interfaccia e i programmi si tirano dal Cyberdeck qui sotto.</div>`;
  if (A.vehicles !== undefined) body = `<div class="hint">Garage ${A.rank} sommato a Drive, Pilot e tecnologie dei veicoli · Scuderia di Famiglia: ${esc(A.vehicles)}.</div>`;
  return `<div class="en-role"><span class="en-role-h">${esc(A.nameIt)} <small>(${esc(A.name)})</small> · grado <b>${A.rank}</b>${A.src ? " ⚡" : ""}</span>${body}</div>`;
}

function enemyHtml(e) {
  const E = enemyOf(e), D = CPR.deriveEnemy(E), pen = D.pen;
  const arm = loc => { const a = D.armor[loc] || {}; return `<span><small class="sh-k">${loc === "head" ? "HEAD SP" : "BODY SP"}</small> <b>${+a.sp || "—"}</b>${a.name && +a.sp ? ` <em>${esc(a.name)}${a.forced ? " (regola del 20)" : ""}</em>` : ""}</span>`; };
  return `
    <div class="en" data-enemy="${esc(e.id)}">
      <div class="en-head">
        <span class="en-type">${esc(D.role.id === "none" ? D.T.label : D.role.label)}</span>
        <span class="en-lvl" title="${esc(D.T.label)} · ${esc(D.T.ratio)}">${tierBadge(E)}</span>
        <span class="hint">${esc(D.T.label)} · ${esc(D.T.ratio)}</span>
        ${pen ? `<span class="en-pen">Armatura: ${pen} a REF, DEX, MOVE${D.penReduce ? ` (${D.penRaw} ridotto di ${D.penReduce}: Boss Elite)` : ""}</span>` : D.penReduce ? `<span class="en-pen ok">Armatura: malus ${D.penRaw} annullato (Boss Elite: −2 di serie)</span>` : D.noPen && armorPenOf(D.armor) ? `<span class="en-pen ok">Armatura senza malus (Tech Upgrade)</span>` : ""}
        ${D.painImmune ? `<span class="en-pen ok">Ignora i malus delle ferite</span>` : D.painEditor ? `<span class="en-pen ok">Antidolorifico: ignora Seriously Wounded</span>` : ""}
        ${E.migrated ? `<span class="en-pen">Scheda convertita: controllala e salvala</span>` : ""}
      </div>
      <div class="en-stats">${CPR.STATS.map(s => {
        const v = D.stats[s.id];
        if (s.id === "LUCK" && !v.v) return `<span class="sh-stat off"><span class="k">LUCK</span><span class="v">—</span></span>`;
        const shown = v.v !== v.nat ? `${v.nat}→${v.v}` : `${v.v}`;
        return enemyBtn(e, "stat:" + s.id, `<span class="k">${s.id}</span><span class="v">${shown}${v.armor !== v.v ? ` <span class="pen">(${v.armor})</span>` : ""}</span>${v.src ? `<small>${esc(v.src)}</small>` : ""}`, "sh-stat", null, esc(v.src || ""));
      }).join("")}</div>
      <div class="en-vitals">
        <span><small class="sh-k">HP</small> <b>${D.hp}</b></span>
        <span><small class="sh-k">Seriously Wounded</small> <b>${CPR.seriousAt(D.hp)}</b></span>
        <span><small class="sh-k">Death Save</small> <b>${D.body}</b></span>
        ${arm("head")}${arm("body")}
        ${enemyBtn(e, "init", `Initiative ${initTotal(D)}`, "chip y", null, esc(`REF ${D.stats.REF.armor}${D.initBonus.map(b => ` + ${b.l} ${b.v}`).join("")}`))}${enemyBtn(e, "death", "Death Save", "chip r")}
        ${D.ability ? enemyBtn(e, "ability", `${esc(D.ability.nameIt)} ${D.ability.rank}`, "chip y") : ""}
        ${enemyBtn(e, "crit:body", "⚄ Crit. corpo", "chip r", null, "Critical Injury al corpo (2d6)")}${enemyBtn(e, "crit:head", "⚄ Crit. testa", "chip r", null, "Critical Injury alla testa (2d6)")}
      </div>
      <div class="en-hp hint">HP: ${D.hpParts.map((p, i) => i ? `${p.v >= 0 ? "+" : "−"}${Math.abs(p.v)} (${esc(p.l)})` : `${esc(p.l)} = ${p.v}`).join(" ")} → <b>${D.hp}</b></div>
      ${roleBlock(D)}
      ${D.ability && D.ability.deck ? deckHtml(D.ability.deck, { iface: D.ability.rank, roll: w => `data-action="enemy-roll" data-id="${esc(e.id)}" data-roll="deck:${w}"`, adj: null }) : ""}
      ${D.budget || D.picks.length ? `<div class="en-elite">
        <span class="en-budget">Punti <b>${D.spent}</b> / ${D.budget}${E.extraPoints ? ` (di cui ${E.extraPoints} extra)` : ""} · tratti apice ${D.apexUsed} / ${D.apexLimit}</span>
        ${D.picks.map(o => `<span class="${o.apex ? "apex" : ""}">⚡ ${esc(o.label)} <small>${o.cost} pt${o.apex ? " · apice" : ""}</small></span>`).join("") || `<span class="hint">Nessun potenziamento acquistato.</span>`}
      </div>` : ""}
      ${D.twenty.length ? `<div class="en-pen">Regola del 20: ${D.twenty.map(s => esc(s.label)).join(", ")} a 20 naturale → ${D.comp === "hp" ? "HP ridotti" : "SP portata a 11"}</div>` : ""}
      ${D.weapons.length ? `<div class="sh-sec-head"><h4>Weapons</h4><span class="hint">base_naturale = STAT + skill · base_effettiva = + HQ + Smartgun (entro il tetto di fascia) + ruolo · le VD sono quelle della tabella dell'arma</span></div>
        <div class="sh-weapons">${D.weapons.map((_, i) => cbCard(enSrc(e.id, i, null))).join("")}</div>` : ""}
      <div class="sh-sec-head"><h4>Skill Bases</h4><span class="hint">clicca una riga per tirare · le abilità non elencate valgono la sola STAT</span></div>
      <div class="en-table">
        <div class="en-tr en-th"><span>Skill</span><span>STAT</span><span>Lvl</span><span>Naturale</span><span>Bonus</span><span>Effettiva</span></div>
        ${D.skills.map((s, i) => `<button type="button" class="en-tr ${s.nat >= 20 ? "twenty" : ""}" data-action="enemy-roll" data-id="${esc(e.id)}" data-roll="skill:${i}">
          <span>${esc(s.label)}${s.elite10 ? " ⚡" : ""}${s.fromRole ? " ◈" : ""}</span><span>${esc(s.stat)} ${s.statV}</span><span>${s.lvl}</span><span>${s.nat}</span><span>${fmtBonus(s.bonus) || "—"}</span>
          <span><b>${s.eff}</b>${s.effArmor !== s.eff ? ` <span class="pen">(${s.effArmor})</span>` : ""}</span></button>`).join("")}
      </div>
      ${(E.cyberRefs || []).length ? `<div class="block"><h4>Cyberware</h4><div class="st-chips">${E.cyberRefs.map(x => { const c = CW.byId(x.ref) || { name: x.ref }; return `<span class="st-chip" title="${esc(c.desc || "")}">${esc(c.name)}${(c.fx || []).length ? " ⚡" : ""}${x.param ? ` <small>${esc((CPR.skill(x.param) || {}).label || "")}</small>` : ""}${(c.fx || []).some(f => f.cond) ? ` <small>${x.on ? "attivo" : "spento"}</small>` : ""}</span>`; }).join("")}</div></div>` : ""}
      ${E.cyber || D.extraCyber.length || E.bodyImplant ? `<div class="block"><h4>${(E.cyberRefs || []).length ? "Altro cyberware" : "Cyberware"}</h4><div class="prewrap">${esc([E.cyber, ...D.extraCyber, E.bodyImplant ? CPR.bodyImplant(E.bodyImplant).label : ""].filter(Boolean).join(", "))}</div></div>` : ""}
      ${E.gear ? `<div class="block"><h4>Gear</h4><div class="prewrap">${esc(E.gear)}</div></div>` : ""}
      ${E.notes ? `<div class="block"><h4>Note</h4><div class="prewrap">${esc(E.notes)}</div></div>` : ""}
    </div>`;
}

function openEnemy(id) {
  const e = state.entries.find(x => x.id === id); if (!e || !isGm()) return;
  openModal(`
    <div class="modal-head"><h2>// 🔒 NEMICO</h2><button class="x" data-action="close" aria-label="Chiudi">×</button></div>
    <div class="modal-body">
      <div class="tab-title"><h1>${esc(e.name || "Nemico")}</h1>${gmBadge(e)}</div>
      ${enemyHtml(e)}
    </div>
    <div class="modal-foot">
      <button class="btn ghost small left" data-action="delete-entry" data-id="${esc(e.id)}">Elimina</button>
      <button class="btn ghost small" data-action="enemy-copy" data-id="${esc(e.id)}">Duplica</button>
      <button class="btn ghost small yellow" data-action="enemy-spawn" data-id="${esc(e.id)}">⇲ Sulla mappa</button>
      <button class="btn cyan" data-action="enemy-edit" data-id="${esc(e.id)}">Modifica</button>
    </div>`);
}

// ---------- modulo: Fascia, Livello e Ruolo, poi valori, Capacità di Ruolo e potenziamenti ----------
function editEnemy(id, preset = null) {
  if (!isGm() && Store.gmReady) return;
  const old = state.entries.find(x => x.id === id);
  const E0 = preset ? CPR.normalizeEnemy(preset) : old ? { ...enemyOf(old), name: old.name } : CPR.generateEnemy(1, "base");
  const armorSel = (loc, a = {}) => `
    <div class="field"><label>Armatura ${loc === "head" ? "testa" : "corpo"}</label><div class="sh-pair">
      <select data-arm-type="${loc}">${CPR.ARMOR_TYPES.map(t => `<option value="${t.id}" ${t.id === (a.type || "none") ? "selected" : ""}>${t.label}${t.sp ? ` (SP ${t.sp}${t.pen ? `, ${t.pen}` : ""})` : ""}</option>`).join("")}<option value="custom" ${a.type === "custom" ? "selected" : ""}>Altro…</option></select>
      <input name="sp-${loc}" type="number" min="0" value="${esc(a.sp ?? 0)}" title="SP"></div>
      <input name="arm-${loc}" value="${esc(a.name || "")}" placeholder="Nome" style="margin-top:4px"></div>`;
  const wRow = (w = {}) => `<div class="sh-row en-wpn">
    <select data-f="cat">${CPR.WEAPON_TYPES.map(t => `<option value="${t.id}" ${t.id === w.cat ? "selected" : ""}>${t.label}</option>`).join("")}<option value="" ${!w.cat ? "selected" : ""}>Altro…</option></select>
    <input data-f="name" placeholder="Nome" value="${esc(w.name)}">
    <select data-f="quality" title="Qualità">${[["poor", "Poor"], ["standard", "Standard"], ["hq", "High Quality +1"]].map(([v, l]) => `<option value="${v}" ${(w.quality || "standard") === v ? "selected" : ""}>${l}</option>`).join("")}</select>
    <input data-f="dmg" placeholder="Danno" value="${esc(w.dmg)}">
    <input data-f="rof" placeholder="ROF" value="${esc(w.rof ?? "")}">
    <input data-f="afDmg" placeholder="Autofire 2d6" title="Danno dell'autofire (vuoto = 2d6; vale anche 3d6kh2)" value="${esc(w.afDmg || "")}">
    <input data-f="auto" type="number" min="0" max="10" placeholder="× max" title="Moltiplicatore massimo dell'autofire (vuoto = quello della categoria)" value="${esc(w.auto ?? "")}">
    <input data-f="skill" type="hidden" value="${esc(w.skill || "")}"><input data-f="mag" type="hidden" value="${esc(w.mag ?? "")}">
    <input data-f="ammo" type="hidden" value="${esc(w.ammo || "")}"><input data-f="range" type="hidden" value="${esc(w.range || "")}"><input data-f="autoRange" type="hidden" value="${esc(w.autoRange || "")}">
    <button type="button" class="gp-btn" data-wpn-reroll title="Ripesca quest'arma" aria-label="Ripesca quest'arma">⚄</button>
    <button type="button" class="gp-btn del" data-row-del aria-label="Rimuovi">✕</button></div>`;
  const sRow = (s = {}) => `<div class="sh-row en-sk">
    <select data-f="id">${CPR.SKILLS.map(k => `<option value="${k.id}" ${k.id === s.id ? "selected" : ""}>${esc(k.label)}</option>`).join("")}</select>
    <select data-f="stat">${CPR.STATS.map(st => `<option ${st.id === (s.stat || "REF") ? "selected" : ""}>${st.id}</option>`).join("")}</select>
    <input data-f="lvl" type="number" min="0" max="10" placeholder="Lvl" value="${esc(s.lvl ?? 0)}" title="Livello della skill">
    <span class="en-nat" title="base_naturale = STAT + livello">= ?</span>
    <button type="button" class="gp-btn del" data-row-del aria-label="Rimuovi">✕</button></div>`;
  const ensureAutoSkill = (wpns = []) => {
    if (wpns.some(w => (CPR.weaponType(w.cat) || {}).auto || w.auto)) {
      const cur = readRows(form, "#en-skills .sh-row");
      const tier = num(form.elements["tier"].value) || 1, level = form.elements["level"].value;
      const L = CPR.levelOf(tier, level), ref = num(form.elements["st-REF"].value) || 0;
      let target = L.combat[0];
      if (level === "hardened") {
        const autoWpns = wpns.filter(w => (CPR.weaponType(w.cat) || {}).auto || w.auto);
        const refSkills = autoWpns.length ? autoWpns.map(w => w.cat === "ar" ? "shoulderarms" : "handgun") : ["handgun", "shoulderarms"];
        const candSks = refSkills.map(id => cur.find(s => s.id === id)).filter(Boolean);
        const refNat = candSks.length ? Math.max(...candSks.map(s => ref + num(s.lvl))) : L.combat[1];
        const maxCap = tier >= 3 ? 16 : 14;
        target = Math.min(maxCap, refNat);
      }
      target = Math.max(10, target);
      const lvl = Math.max(0, Math.min(L.skillMax, target - ref));
      const existing = cur.find(s => s.id === "autofire");
      if (!existing) {
        $("#en-skills", form).insertAdjacentHTML("beforeend", sRow({ id: "autofire", stat: "REF", lvl }));
      } else if (level === "hardened") {
        const rows = $$("#en-skills .sh-row", form);
        const idx = cur.indexOf(existing);
        if (idx >= 0 && rows[idx]) {
          $("[data-f=lvl]", rows[idx]).value = lvl;
        }
      }
    }
  };
  openModal(`
    <form class="form" id="enemy-form">
      <div class="modal-head"><h2>// 🔒 ${old ? "MODIFICA NEMICO" : "NUOVO NEMICO"}</h2><button type="button" class="x" data-action="close" aria-label="Chiudi">×</button></div>
      <div class="modal-body">
        <div class="en-gen en-steps">
          <div class="field"><label for="en-tier">Fascia</label><select id="en-tier" name="tier">${CPR.TIERS.map(t => `<option value="${t.n}" ${t.n === +E0.tier ? "selected" : ""}>${t.n} · ${esc(t.label)} (${esc(t.ratio)})</option>`).join("")}</select></div>
          <div class="field"><label for="en-lvl">Livello</label><select id="en-lvl" name="level">${CPR.LEVEL_IDS.map(l => `<option value="${l}" ${l === E0.level ? "selected" : ""}>${CPR.LEVEL_LABELS[l]}</option>`).join("")}</select></div>
          <div class="field"><label for="en-role">Ruolo (facoltativo)</label><select id="en-role" name="role">${CPR.ROLES.map(r => `<option value="${r.id}" ${r.id === (E0.role || "none") ? "selected" : ""}>${esc(r.label)}${r.abilityIt ? ` · ${esc(r.abilityIt)}` : ""}</option>`).join("")}</select></div>
          <div class="field en-extra"><label for="en-xp">Punti extra</label><input id="en-xp" name="extraPoints" type="number" min="0" max="20" value="${esc(E0.extraPoints || 0)}" title="Si aggiungono al budget dei potenziamenti, anche in Base e Hardened"></div>
          <label class="check" id="en-extreme-box"><input type="checkbox" name="extreme" ${E0.extreme ? "checked" : ""}> ☢ Nemico Estremo</label>
          <button type="button" class="btn yellow" data-en-gen>⚄ Genera</button>
          <span class="hint" id="en-caps"></span>
        </div>
        <div class="fields" style="margin-top:14px">
          <div class="field full"><label class="req" for="en-name">Nome</label><input id="en-name" name="name" required value="${esc(E0.name || "")}"></div>
        </div>
        <h3 class="sh-h">STAT naturali <small id="en-statcap"></small></h3>
        <div class="sh-stat-in">${CPR.STATS.map(s => `<label><span>${s.id}</span><input name="st-${s.id}" type="number" min="0" max="10" value="${esc((E0.stats || {})[s.id] ?? 0)}"></label>`).join("")}</div>
        <div class="fields">
          <div class="field"><label for="en-bimp">Impianto per il BODY</label><select id="en-bimp" name="bodyImplant">${CPR.BODY_IMPLANTS.map(b => `<option value="${b.id}" ${b.id === (E0.bodyImplant || "") ? "selected" : ""}>${esc(b.label)}${b.body ? ` (BODY ${b.body})` : ""}</option>`).join("")}</select></div>
          <div class="field"><label for="en-move">MOVE con cybergambe (vuoto = nessuno)</label><input id="en-move" name="moveImplant" type="number" min="0" max="10" value="${esc(E0.moveImplant ?? "")}"></div>
          <div class="field"><label for="en-hp">HP a mano (vuoto = formula e fascia)</label><input id="en-hp" name="hpOverride" type="number" min="1" value="${esc(E0.hpOverride ?? "")}"></div>
          <div class="field"><label for="en-rank">Grado della Capacità di Ruolo</label><input id="en-rank" name="roleRank" type="number" min="0" max="10" value="${esc(E0.roleRank ?? 0)}"></div>
          ${armorSel("head", (E0.armor || {}).head)}${armorSel("body", (E0.armor || {}).body)}
          <div class="field full"><label class="check"><input type="checkbox" name="noPen" ${E0.noPen ? "checked" : ""}> Armatura già migliorata (niente malus, fuori dal budget)</label></div>
        </div>
        <div id="en-role-box"></div>
        <div id="en-deck-box"></div>
        <h3 class="sh-h">Weapons <small>la base d'attacco si calcola dalla skill dell'arma · ⚄ ripesca la singola arma</small>
          <button type="button" class="btn ghost small yellow" data-wpn-reroll-all>⚄ Ripesca armi</button></h3>
        <div class="sh-rows" id="en-wpns">${(E0.weapons || []).map(wRow).join("")}</div>
        <button type="button" class="btn ghost small cyan" data-en-add="wpn">+ Arma</button>
        <h3 class="sh-h">Skill <small>livello della skill: la base_naturale = STAT + livello si calcola da sola</small></h3>
        <div class="sh-rows" id="en-skills">${(E0.skills || []).map(sRow).join("")}</div>
        <button type="button" class="btn ghost small cyan" data-en-add="skill">+ Skill</button>
        <div id="en-elite"></div>
        <div id="en-check" class="en-check" aria-live="polite"></div>
        <div class="fields" style="margin-top:16px">
          <div class="field full"><span class="lbl">Cyberware dal catalogo <small>i bonus valgono nei tiri</small></span><div id="en-cw"></div></div>
          <div class="field full"><label for="en-cy">Altro cyberware (testo libero)</label><textarea id="en-cy" name="cyber" rows="2">${esc(E0.cyber || "")}</textarea></div>
          <div class="field full"><label for="en-gear">Gear</label><textarea id="en-gear" name="gear" rows="2">${esc(E0.gear || "")}</textarea></div>
          <div class="field full"><label for="en-notes">Note (tattiche, comportamento)</label><textarea id="en-notes" name="notes" rows="2">${esc(E0.notes || "")}</textarea></div>
        </div>
      </div>
      <div class="modal-foot">
        <button type="button" class="btn ghost small left" data-action="close">Annulla</button>
        <button type="submit" class="btn">Salva nemico</button>
      </div>
    </form>`);
  const form = $("#enemy-form");
  let picks = [...(E0.picks || [])], comp = E0.comp || "sp", frameBody = E0.frameBody || 16;
  let ca = E0.ca ? { ...E0.ca } : null, med = E0.med ? { ...E0.med } : null;
  let cwRefs = JSON.parse(JSON.stringify(E0.cyberRefs || []));
  const renderCw = () => {
    $("#en-cw", form).innerHTML = `<div class="st-chips">${cwRefs.map((x, k) => { const c = CW.byId(x.ref) || { name: x.ref }; const cond = (c.fx || []).find(f => f.cond);
      return `<span class="st-chip" title="${esc(c.desc || "")}">${esc(c.name)}${c.id === "skillchip" ? ` <select data-cw-lvl="${k}" class="st-add" title="Livello del chip">${[3, 4].map(n => `<option value="${n}" ${+x.lvl === n ? "selected" : ""}>liv. ${n}</option>`).join("")}</select> <select data-cw-param="${k}" class="st-add">${CPR.SKILLS.map(s => `<option value="${s.id}" ${s.id === x.param ? "selected" : ""}>${esc(s.label)}</option>`).join("")}</select>` : ""}${cond ? ` <label class="check" title="${esc(cond.cond)}"><input type="checkbox" data-cw-on="${k}" ${x.on ? "checked" : ""}> attivo</label>` : ""} <button type="button" class="gp-btn del" data-cw-del="${k}" aria-label="Togli">✕</button></span>`; }).join("")}
      <select class="st-add" data-cw-add aria-label="Aggiungi cyberware">${cwOptions("")}</select></div>`;
  };
  const readForm = () => {
    const v = n => (form.elements[n] ? form.elements[n].value.trim() : ""), nv = n => v(n) === "" ? null : num(v(n));
    const armor = {};
    for (const loc of ["head", "body"]) armor[loc] = { type: $(`[data-arm-type=${loc}]`, form).value, name: v("arm-" + loc), sp: num(v("sp-" + loc)) };
    const role = v("role") || "none";
    return {
      v: 3, tier: num(v("tier")) || 1, level: v("level") || "base", role, name: v("name"),
      stats: Object.fromEntries(CPR.STATS.map(s => [s.id, num(v("st-" + s.id))])),
      bodyImplant: v("bodyImplant"), moveImplant: nv("moveImplant"), hpOverride: nv("hpOverride"),
      roleRank: CPR.roleOf(role).ability ? num(v("roleRank")) : 0,
      ca: role === "solo" ? (ca || CPR.autoCA(num(v("roleRank")))) : null, med: role === "medtech" ? (med || CPR.autoMed(num(v("roleRank")))) : null,
      armor, noPen: form.elements["noPen"].checked,
      weapons: readRows(form, "#en-wpns .sh-row").filter(w => w.name).map(w => ({ ...w, skill: w.skill || ((CPR.weaponType(w.cat) || {}).skill) || "handgun", rof: w.rof === "" ? 1 : (num(w.rof) || w.rof), auto: w.auto === "" ? "" : num(w.auto) })),
      skills: readRows(form, "#en-skills .sh-row").map(s => ({ id: s.id, label: (CPR.skill(s.id) || {}).label || s.id, stat: s.stat, lvl: num(s.lvl) })),
      extreme: form.elements["extreme"].checked && num(v("tier")) >= 3 && v("level") === "elite",
      extraPoints: Math.max(0, num(v("extraPoints"))), frameBody, comp, picks,
      cyber: v("cyber"), gear: v("gear"), notes: v("notes"),
      deck: role === "netrunner" ? readDeck($("#en-deck-box", form), E0.deck || null) : null,
      cyberRefs: cwRefs,
    };
  };
  // Netrunner: Cyberdeck modificabile (resta com'è mentre cambi il resto della scheda)
  const renderDeck = (role, deck) => {
    const box = $("#en-deck-box", form);
    box.innerHTML = role === "netrunner" ? `<h3 class="sh-h">Cyberdeck <small>programmi 1 slot, Black ICE 2 · Interfaccia = grado della Capacità di Ruolo</small>
      <button type="button" class="btn ghost small yellow" data-nd-auto>⚄ Deck casuale</button></h3>${deckEditorHtml(deck)}` : "";
    if (role === "netrunner") $("[data-nd-count]", box) && ndCount();
  };
  const ndCount = () => { const ev = new Event("input", { bubbles: true }); const el = $("#en-deck-box [data-nd=name]", form); if (el) el.dispatchEvent(ev); };
  bindDeckEditor($("#en-deck-box", form));
  renderCw();
  $("#en-cw", form).addEventListener("change", ev => {
    const t = ev.target;
    if (t.matches("[data-cw-add]") && t.value) { cwRefs.push({ ref: t.value, ...(t.value === "skillchip" ? { param: "perception" } : {}) }); renderCw(); refresh(); }
    if (t.matches("[data-cw-param]")) { cwRefs[num(t.dataset.cwParam)].param = t.value; refresh(); }
    if (t.matches("[data-cw-lvl]")) { cwRefs[num(t.dataset.cwLvl)].lvl = num(t.value); refresh(); }
    if (t.matches("[data-cw-on]")) { cwRefs[num(t.dataset.cwOn)].on = t.checked; refresh(); }
    ev.stopPropagation();
  });
  $("#en-cw", form).addEventListener("click", ev => { const d = ev.target.closest("[data-cw-del]"); if (d) { cwRefs.splice(num(d.dataset.cwDel), 1); renderCw(); refresh(); } });
  renderDeck(E0.role, E0.deck || (E0.role === "netrunner" ? NET.autoDeck(E0.tier, E0.level) : null));
  // Capacità di Ruolo: Sensi da Combattimento (punti per uso) o Medicina (punti per specializzazione)
  const renderRole = E => {
    const box = $("#en-role-box", form), R = CPR.roleOf(E.role), D = CPR.deriveEnemy(E), A = D.ability;
    if (!A) { box.innerHTML = ""; return; }
    if (A.ca) {
      box.innerHTML = `<h3 class="sh-h">${esc(R.abilityIt)} <small>grado ${A.rank}: distribuisci i punti tra gli usi (manuale pag. 146)</small>
        <button type="button" class="btn ghost small" data-ca-auto>Distribuisci da solo</button></h3>
        <div class="en-ca-in">${CPR.CA_USES.map(u => `<label><span>${esc(u.label)} <small>${esc(u.unit)} · ${u.id === "precise" ? "3 pt per +1" : u.id === "deflect" ? "2 pt per −1" : u.id === "recover" ? "4 pt" : "1 pt per +1"}</small></span>
          <input type="number" min="0" max="${u.max}" data-ca="${u.id}" value="${+A.ca[u.id] || 0}"></label>`).join("")}</div>
        <div class="en-budget ${A.caUsed > A.rank ? "over" : ""}">Punti di ruolo <b>${A.caUsed}</b> / ${A.rank}</div>`;
    } else if (A.med) {
      box.innerHTML = `<h3 class="sh-h">${esc(R.abilityIt)} <small>grado ${A.rank}: ogni grado = 1 punto in una specializzazione</small></h3>
        <div class="en-ca-in">${[["surgery", "Chirurgia (2 livelli di Surgery per punto)"], ["pharma", "Farmaceutica (max 5)"], ["cryo", "Criosistemi (max 5)"]].map(([k, l]) => `<label><span>${l}</span><input type="number" min="0" max="${k === "surgery" ? 5 : 5}" data-med="${k}" value="${+A.med[k] || 0}"></label>`).join("")}</div>
        <div class="en-budget">Punti usati <b>${(+A.med.surgery || 0) + (+A.med.pharma || 0) + (+A.med.cryo || 0)}</b> / ${A.rank}</div>`;
    } else box.innerHTML = `<h3 class="sh-h">${esc(R.abilityIt)} <small>grado ${A.rank}</small></h3>${roleBlock(D)}`;
  };
  // pannello potenziamenti: contatore e opzioni acquistabili (quelle che sforano il budget sono disattivate)
  const renderElite = E => {
    const box = $("#en-elite", form), cat = CPR.eliteCatalog(E), budget = CPR.budgetOf(E);
    picks = picks.filter(k => cat.some(o => o.key === k));
    const spent = picks.reduce((t, k) => t + ((cat.find(o => o.key === k) || {}).cost || 0), 0);
    const apexUsed = picks.filter(k => (cat.find(o => o.key === k) || {}).apex).length;
    const groups = [...new Set(cat.map(o => o.group))];
    box.innerHTML = `
      <h3 class="sh-h">Potenziamenti <small>${E.level === "elite" ? `budget Elite ${budget - (E.extraPoints || 0)}` : "in Base e Hardened si usano solo i Punti extra"}${E.extraPoints ? ` + ${E.extraPoints} extra` : ""} · peso nella pesca casuale = 1 / costo</small></h3>
      <div class="en-budget big">Punti <b>${spent}</b> / ${budget} · tratti apice <b>${apexUsed}</b> / ${CPR.apexLimit(E)}
        <button type="button" class="btn ghost small yellow" data-en-reroll ${budget ? "" : "disabled"}>⚄ Ripesca</button><button type="button" class="btn ghost small" data-en-clear>Azzera</button></div>
      ${budget ? "" : `<p class="hint">Nessun punto da spendere: aumenta i Punti extra o passa al livello Elite.</p>`}
      <div class="en-cat">${groups.map(g => `<fieldset><legend>${esc(g)}</legend>${cat.filter(o => o.group === g).map(o => {
        const on = picks.includes(o.key), ok = on || CPR.canPick({ ...E, picks }, o, picks);
        return `<label class="check ${o.apex ? "apex" : ""} ${ok ? "" : "off"}"><input type="checkbox" data-pick="${esc(o.key)}" ${on ? "checked" : ""} ${ok ? "" : "disabled"}> ${esc(o.label)} <small>${o.cost} pt${o.apex ? " · apice" : ""}</small></label>`;
      }).join("")}</fieldset>`).join("")}</div>
      ${picks.includes("frame") ? `<div class="field"><label>BODY con il Linear Frame superiore</label><select data-en-frame>${[16, 17, 18].map(b => `<option ${b === frameBody ? "selected" : ""}>${b}</option>`).join("")}</select></div>` : ""}`;
  };
  const refresh = () => {
    const tier = num(form.elements["tier"].value) || 1, level = form.elements["level"].value, L = CPR.levelOf(tier, level), T = CPR.tierOf(tier);
    $("#en-extreme-box", form).hidden = !(tier >= 3 && level === "elite");
    $("#en-caps", form).textContent = `Fascia ${tier} ${CPR.LEVEL_LABELS[level]}: STAT max ${L.statMax}, skill max ${L.skillMax}, base di combattimento ${L.combat.join("–")}, SP ${L.sp.join("–")}, HP ${L.hp.join("–")}, grado di Ruolo ${CPR.roleRank(tier, level)}${level === "elite" ? `, ${T.budget} Punti Elite${T.extreme ? ` (+${T.extreme} se Estremo)` : ""}` : ""}.`;
    $("#en-statcap", form).textContent = `· tetto ${L.statMax} (BODY oltre 8 solo con impianto${tier >= 3 ? "; 9–10 solo con i potenziamenti" : ""})`;
    const E = readForm();
    renderElite(E);
    const res = CPR.validateEnemy({ ...E, picks });
    renderRole({ ...E, picks });
    const D = res.D;
    $$("#en-skills .sh-row", form).forEach((row, i) => { const s = D.skills[i]; if (s) $(".en-nat", row).innerHTML = `= <b>${s.nat}</b>${s.nat >= 20 ? " ⚠" : ""}`; });
    $("#en-check", form).innerHTML = `
      <div class="en-sum">HP <b>${D.hp}</b> · SP ${+((D.armor.body || {}).sp) || 0} · Initiative ${initTotal(D)} · ${D.weapons.map(w => `${esc(w.name)} <b>${w.effArmor}</b>`).join(" · ") || "nessuna arma"}</div>
      ${D.twenty.length && Math.max(...["head", "body"].map(l => +(((E.armor || {})[l] || {}).sp) || 0)) > 11 ? `<div class="field"><label>Regola del 20: compensazione obbligatoria</label><select data-en-comp><option value="sp" ${comp === "sp" ? "selected" : ""}>SP massimo 11 (armatura leggera)</option><option value="hp" ${comp === "hp" ? "selected" : ""}>HP ridotti</option></select></div>` : ""}
      ${res.errors.map(x => `<div class="err">✕ ${esc(x)}</div>`).join("")}${res.warns.map(x => `<div class="warn">⚠ ${esc(x)}</div>`).join("")}
      ${!res.errors.length && !res.warns.length ? `<div class="ok">✓ Scheda dentro i tetti di Fascia ${tier} ${CPR.LEVEL_LABELS[level]}</div>` : ""}`;
    return res;
  };
  form.addEventListener("click", ev => {
    if (ev.target.closest("[data-en-gen]")) {
      const g = CPR.generateEnemy(num(form.elements["tier"].value), form.elements["level"].value, { role: form.elements["role"].value, extreme: form.elements["extreme"].checked, extraPoints: num(form.elements["extraPoints"].value) });
      const typed = form.elements["name"].value.trim();
      if (typed && typed !== E0.name) g.name = typed; else if (old && !preset) g.name = old.name;
      return editEnemy(id, g);
    }
    // armi: ripesca tutte o una sola, per la Fascia, il Livello e il Ruolo scelti
    if (ev.target.closest("[data-wpn-reroll-all]")) {
      const ws = CPR.rollWeapons(form.elements["role"].value, num(form.elements["tier"].value), form.elements["level"].value);
      $("#en-wpns", form).innerHTML = ws.map(wRow).join(""); ensureAutoSkill(ws); refresh(); return;
    }
    const one = ev.target.closest("[data-wpn-reroll]");
    if (one) {
      const row = one.closest(".sh-row"), i = $$("#en-wpns .sh-row", form).indexOf(row);
      const ws = CPR.rollWeapons(form.elements["role"].value, num(form.elements["tier"].value), form.elements["level"].value);
      const w = ws[Math.min(i, ws.length - 1)] || ws[0];
      if (w) { row.outerHTML = wRow(w); ensureAutoSkill([w]); refresh(); }
      return;
    }
    if (ev.target.closest("[data-nd-auto]")) { renderDeck("netrunner", NET.autoDeck(num(form.elements["tier"].value), form.elements["level"].value)); return; }
    if (ev.target.closest("[data-ca-auto]")) { ca = CPR.autoCA(CPR.deriveEnemy({ ...readForm(), picks }).ability.rank); refresh(); return; }
    if (ev.target.closest("[data-en-reroll]")) { const E = readForm(); picks = CPR.rollElite({ ...E, picks: [] }); refresh(); return; }
    if (ev.target.closest("[data-en-clear]")) { picks = []; refresh(); return; }
    const add = ev.target.closest("[data-en-add]");
    if (add) { const box = $(add.dataset.enAdd === "wpn" ? "#en-wpns" : "#en-skills", form); box.insertAdjacentHTML("beforeend", add.dataset.enAdd === "wpn" ? wRow() : sRow()); refresh(); }
    const del = ev.target.closest("[data-row-del]"); if (del) { del.closest(".sh-row").remove(); refresh(); }
  });
  form.addEventListener("change", ev => {
    const t = ev.target;
    if (t.matches("[data-pick]")) { const k = t.dataset.pick; picks = t.checked ? [...picks, k] : picks.filter(x => x !== k); }
    if (t.matches("[data-en-frame]")) frameBody = num(t.value);
    if (t.matches("[data-en-comp]")) comp = t.value;
    if (t.matches("[data-ca]")) { ca = { ...(ca || {}), [t.dataset.ca]: Math.max(0, num(t.value)) }; }
    if (t.matches("[data-med]")) { med = { ...(med || {}), [t.dataset.med]: Math.max(0, num(t.value)) }; }
    if (t.name === "role" && (t.value === "netrunner") !== !!$("#en-deck-box .nd-edit", form)) renderDeck(t.value, t.value === "netrunner" ? NET.autoDeck(num(form.elements["tier"].value), form.elements["level"].value) : null);
    if (t.name === "role") { const r = CPR.roleOf(t.value); form.elements["roleRank"].value = r.ability ? CPR.roleRank(num(form.elements["tier"].value), form.elements["level"].value) : 0; ca = null; med = null; }
    if (t.matches(".en-wpn [data-f=cat]")) {
      const w = CPR.weaponType(t.value), row = t.closest(".sh-row");
      if (w) {
        const set = (f, v) => { $(`[data-f=${f}]`, row).value = v; };
        set("dmg", w.dmg === "BODY" ? CPR.brawlDmg(num(form.elements["st-BODY"].value)) : w.dmg); set("rof", w.rof); set("skill", w.skill); set("mag", w.mag || ""); set("range", ""); set("autoRange", "");
        const nm = $("[data-f=name]", row).value.trim();
        if (!nm || CPR.WEAPON_TYPES.some(x => x.label === nm)) set("name", w.label);
        if (w.auto) ensureAutoSkill([w]);
      }
    }
    if (t.matches(".en-sk [data-f=id]")) { const k = CPR.skill(t.value); if (k) $("[data-f=stat]", t.closest(".sh-row")).value = k.stat; }
    if (t.matches("[data-arm-type]")) { const a = CPR.armorType(t.value); if (a) { form.elements["sp-" + t.dataset.armType].value = a.sp; form.elements["arm-" + t.dataset.armType].value = a.sp ? a.label : ""; } }
    refresh();
  });
  form.addEventListener("input", ev => {
    if (ev.target.matches("[data-ca]")) ca = { ...(ca || {}), [ev.target.dataset.ca]: Math.max(0, num(ev.target.value)) };
    if (ev.target.matches("[data-med]")) med = { ...(med || {}), [ev.target.dataset.med]: Math.max(0, num(ev.target.value)) };
    if (ev.target.matches("input[type=number]") && !ev.target.matches("[data-ca], [data-med]")) refresh();
  });
  refresh();
  form.addEventListener("submit", async ev => {
    ev.preventDefault();
    const res = refresh();
    if (res.errors.length) return toast(`Da sistemare prima di salvare: ${res.errors[0]}`, "err");
    const enemy = readForm(); delete enemy.migrated;
    try {
      const saved = await Store.save("entries", { ...(old || { status: "vivo", custom: [] }), kind: "nemico", name: enemy.name, gmOnly: true, enemy });
      upsert(state.entries, saved); liveSend("entries", saved);
      if (/^#\/gm/.test(location.hash)) route();
      toast("Nemico salvato", "ok"); openEnemy(saved.id);
    } catch (err) { fail(err); }
  });
}

// mette N copie del nemico sulla mappa che il GM sta guardando (nascoste, se vuole)
function spawnEnemy(id) {
  const e = state.entries.find(x => x.id === id); if (!e) return;
  const m = curMap();
  if (!m) return toast("Prima crea una mappa nella pagina Mappa", "err");
  const D = enemyD(e);
  openModal(`
    <form class="form" id="spawn-form">
      <div class="modal-head"><h2>// ⇲ ${esc(e.name)} SUL TAVOLO</h2><button type="button" class="x" data-action="close" aria-label="Chiudi">×</button></div>
      <div class="modal-body"><div class="fields">
        <div class="field full"><span class="lbl">Mappa</span><b>${esc(m.name || "Mappa")}</b>${m.hidden ? ` <span class="hint">(nascosta ai giocatori)</span>` : ""}</div>
        <div class="field"><label for="sp-n">Quanti</label><input id="sp-n" name="count" type="number" min="1" max="20" value="1"></div>
        <div class="field"><label for="sp-c">Colore</label><input id="sp-c" name="color" type="color" value="#ff8a3d"></div>
        <label class="check field full gm-check"><input type="checkbox" name="hidden" checked> 🔒 Nascosti ai giocatori (li riveli dalla mappa)</label>
        <p class="hint field full">Ogni token ha HP (${D.hp}) e SP propri: si feriscono uno per uno. ${esc(D.T.ratio)}.</p>
      </div></div>
      <div class="modal-foot"><button type="button" class="btn ghost small left" data-action="close">Annulla</button><button type="submit" class="btn">Metti sulla mappa</button></div>
    </form>`, true);
  $("#spawn-form").addEventListener("submit", async ev => {
    ev.preventDefault();
    const f = ev.target, n = clamp(num(f.count.value) || 1, 1, 20), hidden = f.hidden.checked;
    const taken = new Set(mapTokens(m).map(t => num(t.x) + "," + num(t.y)));
    closeModal();
    for (let i = 0; i < n; i++) await saveRec("tokens", enemyToken(e, m, { name: n > 1 ? `${e.name} ${i + 1}` : "", color: safeColor(f.color.value), hidden, ...freeCell(m, taken) }));
    toast(`${n} × ${e.name} sulla mappa`, "ok");
    tt.view = m.id; if (onTable()) { renderTokens(); renderSide(); } else location.hash = "#/mappa";
  });
}

function enemyCard(e) {
  const E = enemyOf(e), D = CPR.deriveEnemy(E);
  return `<article class="en-card">
    <button type="button" class="en-card-main" data-action="enemy-open" data-id="${esc(e.id)}">
      <span class="en-lvl">${tierBadge(E)}</span>
      <h3>${esc(e.name)}</h3>
      <span class="en-type">${esc(D.role.id === "none" ? D.T.label : `${D.role.label} · ${D.ability ? `${D.ability.nameIt} ${D.ability.rank}` : ""}`)}${E.migrated ? " · da convertire" : ""}</span>
      <span class="en-line">HP <b>${D.hp}</b> · SP <b>${+((D.armor.head || {}).sp) || 0}/${+((D.armor.body || {}).sp) || 0}</b> · Init <b>${initTotal(D)}</b>${D.budget ? ` · ⚡ ${D.spent}/${D.budget}` : ""}</span>
      <span class="en-line">${D.weapons.map(w => `${esc(w.name)} <b>${w.effArmor}</b>`).join(" · ") || "disarmato"}</span>
    </button>
    <button type="button" class="btn ghost small yellow" data-action="enemy-spawn" data-id="${esc(e.id)}">⇲ Sulla mappa</button>
  </article>`;
}
