// ============================================================
//  NIGHT CITY ARCHIVE — tab Ruoli e Capacità di Ruolo
//  (js/ui/: i file si caricano in ordine da index.html e condividono le costanti)
// ============================================================

// ---------- RUOLI: più Ruoli per personaggio, ognuno con il suo grado (sheet.roles) ----------
// ruolo = { id, rank, ca{…} (Solo), tech{field,upgrade,fabricate,invent}, med{surgery,pharma,cryo}, recipes[], team[{name,job,loyalty}],
//           stable[{kind,name,upgrades[],active}], notes } · le schede vecchie hanno solo e.role + sheet.ability/rank
const roleFromOld = e => { const s = sheetOf(e); const id = RL.guessRole(e && e.role) || ((RL.ROLES.find(r => r.ability.toLowerCase() === String(s.ability || "").trim().toLowerCase()) || {}).id || "");
  return id ? [{ id, rank: hasVal(s.rank) ? num(s.rank) : 4 }] : []; };
const rolesOf = e => { const s = sheetOf(e); return Array.isArray(s.roles) ? s.roles : roleFromOld(e); };
const migrateRoles = (s, e) => { if (!Array.isArray(s.roles)) s.roles = JSON.parse(JSON.stringify(roleFromOld({ ...e, sheet: s }))); return s; };
const roleOfE = (e, id) => rolesOf(e).find(r => r.id === id) || null;
const roleRankOf = (e, id) => { const r = roleOfE(e, id); return r ? clamp(num(r.rank), 0, 10) : 0; };
const caOf = e => { const r = roleOfE(e, "solo"); return r ? { ...CPR.autoCA(0), ...(r.ca || CPR.autoCA(clamp(num(r.rank), 0, 10))) } : null; };
const techOf = e => { const r = roleOfE(e, "tech"); return r ? { field: 0, upgrade: 0, fabricate: 0, invent: 0, ...(r.tech || {}) } : null; };
const medOf = e => { const r = roleOfE(e, "medtech"); return r ? { surgery: 0, pharma: 0, cryo: 0, ...(r.med || {}) } : null; };
// Sensi da Combattimento: Attacco Preciso agli attacchi, Reazione all'iniziativa (come i modificatori speciali)
function roleMods(e) {
  const ca = caOf(e), out = [];
  if (ca && num(ca.precise)) out.push({ name: "Attacco Preciso", target: "attack", value: num(ca.precise) });
  if (ca && num(ca.reaction)) out.push({ name: "Reazione", target: "init", value: num(ca.reaction) });
  return out;
}
// bonus dei ruoli alle abilità: Individuare Minacce, Esperienza sul Campo, Garage
function roleSkillBonus(e, skillId) {
  const out = [], ca = caOf(e), t = techOf(e), nomad = roleRankOf(e, "nomad");
  if (ca && num(ca.threat) && skillId === "perception") out.push({ l: "Individuare Minacce", v: num(ca.threat) });
  if (t && num(t.field) && RL.MAKER_SKILLS.includes(skillId)) out.push({ l: "Esperienza sul Campo", v: num(t.field) });
  if (nomad && RL.GARAGE_SKILLS.includes(skillId)) out.push({ l: "Garage", v: nomad });
  return out;
}
const skillLvl = (e, id) => { const k = skillByKey(e, "skill:" + id); return k ? k.lvl : 0; };

function rolesTabHtml(e) {
  const id = esc(e.id), edit = Store.canEdit(), roles = rolesOf(e);
  const free = RL.ROLES.filter(r => !roles.some(x => x.id === r.id));
  return `<div class="rl-tab" data-roles-tab="${id}">
    <div class="sh-bar"><label class="sh-mod" title="Modificatore situazionale aggiunto ai tiri">MOD <input type="number" step="1" data-sheet-mod value="${sheetMod}"></label>
      <span class="hint">Si parte con un Ruolo a grado 4. Un altro Ruolo parte a grado 1 e costa 60 IP (anche dai Punti Miglioramento), con il precedente almeno a 4.</span>
      <button type="button" class="btn ghost small cyan" data-action="dice-open">⬢ Dice log</button></div>
    ${roles.length ? roles.map((r, i) => roleCard(e, r, i, edit)).join("") : `<p class="hint">Nessun Ruolo: aggiungine uno qui sotto.</p>`}
    ${edit && free.length ? `<div class="rl-add"><select data-rl-new aria-label="Ruolo da aggiungere">${free.map(r => `<option value="${r.id}">${esc(r.it)} · ${esc(r.abilityIt)}</option>`).join("")}</select>
      <button type="button" class="btn small yellow" data-action="rl-op" data-id="${id}" data-op="add" ${roles.length ? `title="Grado 1 con i Punti Miglioramento: 60 IP (ne hai ${num(sheetOf(e).ip)})"` : ""}>+ Ruolo${roles.length ? " · 60 IP" : ""}</button>
      ${roles.length && !RL.canAddRole(roles) ? `<span class="hint warn-t">Per le regole il Ruolo precedente deve essere almeno a grado 4.</span>` : ""}</div>` : ""}
  </div>`;
}
function roleCard(e, r, i, edit) {
  const R = RL.roleById(r.id) || { it: r.id, abilityIt: "", ability: "" }, rank = clamp(num(r.rank), 0, 10), id = esc(e.id);
  const at = `data-id="${id}" data-r="${i}"`;
  const roll = (k, inner, cls = "btn small", title = "") => `<button type="button" class="${cls}" data-action="rl-roll" ${at} data-k="${k}" ${title ? `title="${esc(title)}"` : ""}>${inner}</button>`;
  const op = (o, inner, cls = "gp-btn", title = "") => edit ? `<button type="button" class="${cls}" data-action="rl-op" ${at} data-op="${o}" ${title ? `title="${esc(title)}" aria-label="${esc(title)}"` : ""}>${inner}</button>` : "";
  const numIn = (path, v, max, title = "") => `<input type="number" min="0" max="${max}" data-rl="${i}" data-rf="${path}" data-rid="${id}" value="${num(v)}" ${edit ? "" : "disabled"} ${title ? `title="${esc(title)}"` : ""}>`;
  let body = "";
  if (r.id === "rocker") {
    const B = RL.band(RL.ROCKER, rank);
    body = `<div class="rl-acts">${RL.FAN_DV.map(f => roll("fan:" + f.id, `${esc(f.label)} <b>VD ${f.dv}</b>`, "btn small", `Creare Fan o chiedere un favore: Impatto Carismatico + 1d10 vs VD ${f.dv}`)).join("")}</div>
      ${B ? `<table class="rl-t"><tr><th>Grado ${B.min}${B.max > B.min ? "–" + B.max : ""}</th><td colspan="2">${esc(B.venue)}</td></tr>
        <tr><th>Singolo (VD 8)</th><td colspan="2">${esc(B.single)}</td></tr><tr><th>Piccolo Gruppo (VD 10)</th><td colspan="2">${esc(B.small)}</td></tr><tr><th>Grande Gruppo (VD 12)</th><td colspan="2">${esc(B.large)}</td></tr></table>` : ""}
      <p class="hint">Il GM decide se il favore rientra nel grado. Se il tiro fallisce non puoi chiedere a quei fan per una settimana.</p>`;
  } else if (r.id === "solo") {
    const ca = { ...CPR.autoCA(0), ...(r.ca || CPR.autoCA(rank)) }, used = CPR.caCost(ca);
    body = `<p class="hint">Con un'Azione (all'inizio dello scontro, o quando vuoi fuori dallo scontro) distribuisci ${rank} punti; la configurazione resta finché non la cambi. I bonus sono già nei tiri.</p>
      <div class="rl-ca">${CPR.CA_USES.map(u => `<label><span>${esc(u.label)} <small>${u.id === "precise" ? "3 pt = +1 (max +3)" : u.id === "deflect" ? "2 pt = −1 (max −5)" : u.id === "recover" ? "4 pt" : "1 pt = +1"} · ${esc(u.unit)}</small></span>${numIn("ca." + u.id, ca[u.id], u.max)}</label>`).join("")}</div>
      <div class="en-budget ${used > rank ? "over" : ""}">Punti usati <b>${used}</b> / ${rank}${used > rank ? " · troppi!" : ""} ${op("ca-auto", "Distribuisci da solo", "btn ghost small")}</div>`;
  } else if (r.id === "netrunner") {
    body = `<p>Interfaccia ${rank}: <b>${CPR.netActions(rank)}</b> Azioni NET per turno. Capacità d'Interfaccia, programmi e Black ICE si tirano dal Cyberdeck.</p>
      <button type="button" class="btn small cyan" data-action="open-entry-tab" data-id="${id}" data-tab="deck">Apri il Cyberdeck →</button>`;
  } else if (r.id === "tech") {
    const t = { field: 0, upgrade: 0, fabricate: 0, invent: 0, ...(r.tech || {}) }, used = RL.TECH_SPECS.reduce((a, x) => a + num(t[x.id]), 0), over = RL.TECH_SPECS.some(x => num(t[x.id]) > rank);
    const skSel = `<select data-rl-skill aria-label="Abilità">${RL.MAKER_SKILLS.map(k => `<option value="${k}">${esc(CPR.skill(k).label)} ${skillLvl(e, k)}</option>`).join("")}</select>`;
    body = `<p class="hint">A ogni grado: +1 in due Specializzazioni diverse (al massimo il grado del Creatore in ognuna).</p>
      <div class="rl-ca">${RL.TECH_SPECS.map(x => `<label title="${esc(x.eff)}"><span>${esc(x.label)} <small>${esc(x.eff.split(". ")[0])}.</small></span>${numIn("tech." + x.id, t[x.id], rank)}</label>`).join("")}</div>
      <div class="en-budget ${used > 2 * rank || over ? "over" : ""}">Punti <b>${used}</b> / ${2 * rank}${over ? " · una Specializzazione supera il grado" : ""} ${op("tech-auto", "Distribuisci da solo", "btn ghost small")}</div>
      <div class="rl-acts"><span class="sh-k">Abilità</span>${skSel}
        ${roll("repair", `Riparazione Temporanea <b>+${num(t.field)}</b>`, "btn small", "TECH + abilità + Esperienza sul Campo + 1d10, contro la VD della riparazione completa")}</div>
      <div class="rl-acts"><span class="sh-k">Prezzo</span><select data-rl-price aria-label="Categoria di prezzo">${RL.PRICE_DV.map(p => `<option value="${p.id}">${esc(p.label)} · VD ${p.dv} · ${esc(p.time)}</option>`).join("")}</select>
        ${roll("make:upgrade", `Upgrade <b>+${num(t.upgrade)}</b>`)}${roll("make:fabricate", `Fabbricare <b>+${num(t.fabricate)}</b>`)}${roll("make:invent", `Inventare <b>+${num(t.invent)}</b>`)}</div>
      <details class="rl-more"><summary>Cosa fa ogni Specializzazione</summary>${RL.TECH_SPECS.map(x => `<p><b>${esc(x.label)}</b>: ${esc(x.eff)}</p>`).join("")}</details>`;
  } else if (r.id === "medtech") {
    const m = { surgery: 0, pharma: 0, cryo: 0, ...(r.med || {}) }, used = num(m.surgery) + num(m.pharma) + num(m.cryo);
    const surg = Math.min(10, 2 * num(m.surgery)), mt = Math.min(10, num(m.pharma) + num(m.cryo)), rec = r.recipes || [];
    body = `<p class="hint">Ogni grado di Medicina dà 1 punto a una Specializzazione.</p>
      <div class="rl-ca">${RL.MED_SPECS.map(x => `<label title="${esc(x.eff)}"><span>${esc(x.label)} <small>${esc(x.eff)}</small></span>${numIn("med." + x.id, m[x.id], x.id === "surgery" ? 5 : x.id === "cryo" ? 5 : 10)}</label>`).join("")}</div>
      <div class="en-budget ${used > rank ? "over" : ""}">Punti <b>${used}</b> / ${rank} · Surgery ${surg} · Medical Tech ${mt}</div>
      <div class="rl-acts">${roll("surgery", `Surgery <b>${statEff(e, "TECH") + surg}</b>`, "btn small", "TECH + Surgery + 1d10")}${roll("medtech", `Medical Tech <b>${statEff(e, "TECH") + mt}</b>`, "btn small", "TECH + Medical Tech + 1d10")}${num(m.pharma) ? roll("synth", "Sintesi VD 13", "btn small yellow", "200 E$ di materiali, 1 ora: Medical Tech vs VD 13 → dosi pari al livello di Medical Tech") : ""}</div>
      ${num(m.pharma) ? `<div class="rl-sub"><span class="sh-k">Ricette ${rec.length} / ${num(m.pharma)}</span>${RL.RECIPES.map(x => `<label class="check" title="${esc(x.eff)}"><input type="checkbox" data-rl="${i}" data-rf="recipes" data-rv="${x.id}" data-rid="${id}" ${rec.includes(x.id) ? "checked" : ""} ${edit && (rec.includes(x.id) || rec.length < num(m.pharma)) ? "" : "disabled"}> ${esc(x.label)} <small>${esc(x.eff)}</small></label>`).join("")}</div>` : ""}
      ${num(m.cryo) ? `<div class="rl-sub"><span class="sh-k">Criosistemi</span>${RL.CRYO.map((c, k) => `<p class="${k < num(m.cryo) ? "on" : "off"}">${k < num(m.cryo) ? "✓" : "·"} ${esc(c)}</p>`).join("")}</div>` : ""}`;
  } else if (r.id === "media") {
    const B = RL.band(RL.MEDIA, rank);
    body = `<div class="rl-acts">${roll("rumor", "Pettegolezzo passivo", "btn small", "Il GM tira 1d10 + Credibilità almeno 2 volte a settimana")}
        <label class="check"><input type="checkbox" data-rl-proof1> almeno 1 prova verificabile (+1)</label><label class="check"><input type="checkbox" data-rl-proof4> più di 4 prove (+2)</label>
        ${roll("publish", `Pubblica una storia <b>${B ? B.believe : 0}/10</b>`, "btn small yellow", "1d10 contro l'Attendibilità (niente Fortuna)")}</div>
      <table class="rl-t"><tr><th>Livello</th><th>Passivo</th><th>Attivo</th><th></th></tr>${RL.RUMORS.map(x => `<tr><th>${esc(x.label)}</th><td>${x.passive}</td><td>${x.active}</td><td>${esc(x.eff)}</td></tr>`).join("")}</table>
      ${B ? `<table class="rl-t"><tr><th>Fonti</th><td>${esc(B.sources)}</td></tr><tr><th>Pubblico</th><td>${esc(B.audience)}</td></tr><tr><th>Attendibilità</th><td>${B.believe} su 10</td></tr><tr><th>Impatto</th><td>${esc(B.impact)}</td></tr></table>` : ""}
      <p class="hint">Pettegolezzo attivo: tiri STAT + abilità adatta + 1d10 contro la colonna «Attivo».</p>`;
  } else if (r.id === "exec") {
    const team = r.team || [], max = RL.teamSize(rank);
    body = `<ul class="rl-list">${RL.EXEC_BENEFITS.map(b => `<li class="${b.r <= rank ? "on" : "off"}">${b.r <= rank ? "✓" : "·"} <b>Grado ${b.r}</b> ${esc(b.eff)}</li>`).join("")}</ul>
      <div class="rl-sub"><span class="sh-k">Squadra ${team.length} / ${max}</span>
        ${team.map((m, k) => `<div class="rl-row">
          <input data-rl="${i}" data-rf="team.${k}.name" data-rid="${id}" placeholder="Nome" value="${esc(m.name || "")}" ${edit ? "" : "disabled"}>
          <select data-rl="${i}" data-rf="team.${k}.job" data-rid="${id}" ${edit ? "" : "disabled"}>${RL.EXEC_JOBS.map(j => `<option ${j === m.job ? "selected" : ""}>${esc(j)}</option>`).join("")}</select>
          <span class="rl-loy">Lealtà ${numIn(`team.${k}.loyalty`, m.loyalty, 99, "Lealtà (massimo 10 tra una sessione e l'altra)")}</span>
          ${roll("order:" + k, "Ordine 1d6", "btn small", "Il GM tira 1d6: l'ordine viene eseguito se esce meno della Lealtà")}${roll("loyal:" + k, "Lealtà iniziale", "btn ghost small", "1d6 + 1")}
          ${op("team-del:" + k, "✕", "gp-btn del", "Togli il membro")}</div>`).join("")}
        ${edit && team.length < max ? op("team-add", "+ Membro della Squadra", "btn ghost small cyan") : ""}
        <p class="hint">Lealtà a 0: tradisce; sotto 0 a fine sessione si dimette. Sostituire un membro morto costa 200 E$ e il nuovo parte con −1. Indossa solo corazze leggere e non guadagna IP.<br>${RL.LOYALTY_MODS.map(([v, t]) => `${v > 0 ? "+" : ""}${v} ${esc(t)}`).join(" · ")}</p></div>`;
  } else if (r.id === "lawman") {
    body = `<div class="rl-acts"><span class="sh-k">Chiami il grado</span><select data-rl-grade aria-label="Grado dei rinforzi">${Array.from({ length: Math.max(1, rank) }, (_, k) => k + 1).reverse().map(g => `<option value="${g}">${g} · ${esc((RL.band(RL.BACKUP, g) || {}).name || "")}</option>`).join("")}</select>
        ${roll("call", "📡 Chiama i rinforzi", "btn small yellow", "Azione: 1d10 ≤ grado chiamato = arrivano; poi 1d6 round di attesa, con un 6 arriva il grado superiore")}</div>
      <table class="rl-t"><tr><th>Grado</th><th>Chi</th><th>Comb.</th><th>SP</th><th>PF</th><th>MOVE/BODY</th><th>Armi</th></tr>
        ${RL.BACKUP.map(b => `<tr class="${b.min <= rank ? "" : "off"}"><th>${b.min}${b.max > b.min ? "–" + b.max : ""}<br><small>${esc(b.name)}</small></th><td>${esc(b.who)}</td><td>${b.combat}</td><td>${esc(b.sp)}</td><td>${b.hp}</td><td>${b.move}</td><td>${esc(b.weapons)}${b.extra ? `<br><small>${esc(b.extra)}</small>` : ""}</td></tr>`).join("")}</table>
      <p class="hint">I rinforzi non schivano i proiettili. Abusarne porta multe o il licenziamento.</p>`;
  } else if (r.id === "fixer") {
    const B = RL.band(RL.FIXER, rank), tr = skillLvl(e, "trading");
    body = `<div class="rl-acts">${roll("haggle", `Contrattare <b>${statEff(e, "COOL") + tr + rank}</b>`, "btn small", "Tiro contrapposto: COOL + Trading + Operatore + 1d10 (un accordo per transazione)")}</div>
      ${B ? `<table class="rl-t"><tr><th>Contatti</th><td>${esc(B.contacts)}</td></tr><tr><th>Portata</th><td>${esc(B.reach)}</td></tr><tr><th>Contrattare</th><td>${esc(B.haggle)}</td></tr><tr><th>Oliare</th><td>${esc(B.grease)}</td></tr></table>` : ""}
      <details class="rl-more"><summary>Tutti i gradi</summary>${RL.FIXER.map(b => `<p><b>Grado ${b.min}${b.max > b.min ? "–" + b.max : ""}</b>: ${esc(b.reach)} ${esc(b.haggle)} ${esc(b.grease)}</p>`).join("")}</details>`;
  } else if (r.id === "nomad") {
    const st = r.stable || [], used = st.reduce((a, v) => a + 1 + (v.upgrades || []).length, 0), kinds = RL.vehiclesFor(rank);
    const upg = RL.NOMAD_UPGRADES.filter(u => u.g <= Math.max(1, rank));
    body = `<p class="hint">Garage ${rank} è già sommato a Drive, Pilot e tecnologie dei veicoli. A ogni grado (e per ogni punto di partenza) un veicolo nuovo o un upgrade. Usi un veicolo alla volta${rank >= 10 ? " (a grado 10 tutti insieme)" : ""}; se è distrutto la Famiglia lo ripara in una settimana per 500 E$.</p>
      <div class="en-budget ${used > rank ? "over" : ""}">Scuderia: <b>${used}</b> / ${rank} scelte · veicoli sbloccati: ${esc(kinds.join(", "))}</div>
      ${st.map((v, k) => `<div class="rl-veh ${v.active ? "on" : ""}">
        <div class="rl-row"><label class="check" title="In uso"><input type="checkbox" data-rl="${i}" data-rf="stable.${k}.active" data-rid="${id}" ${v.active ? "checked" : ""} ${edit ? "" : "disabled"}> in uso</label>
          <select data-rl="${i}" data-rf="stable.${k}.kind" data-rid="${id}" ${edit ? "" : "disabled"}>${[...new Set([...kinds, v.kind].filter(Boolean))].map(x => `<option ${x === v.kind ? "selected" : ""}>${esc(x)}</option>`).join("")}</select>
          <input data-rl="${i}" data-rf="stable.${k}.name" data-rid="${id}" placeholder="Nome o modello" value="${esc(v.name || "")}" ${edit ? "" : "disabled"}>
          ${op("stable-del:" + k, "✕", "gp-btn del", "Togli il veicolo")}</div>
        <div class="st-chips">${(v.upgrades || []).map((u, j) => { const U = RL.upgradeById(u) || { name: u, eff: "" }; return `<span class="st-chip" title="${esc(U.eff)}">${esc(U.name)} ${op(`upg-del:${k}:${j}`, "✕", "gp-btn del", "Togli l'upgrade")}</span>`; }).join("")}
          ${edit ? `<select class="st-add" data-rl-upg="${i}:${k}" data-rid="${id}" aria-label="Aggiungi un upgrade"><option value="">+ upgrade…</option>${upg.filter(u => u.multi || !(v.upgrades || []).includes(u.id)).map(u => `<option value="${u.id}">[${u.g}] ${esc(u.name)} · ${esc(u.on)}</option>`).join("")}</select>` : ""}</div>
      </div>`).join("")}
      ${op("stable-add", "+ Veicolo", "btn ghost small cyan")}
      <details class="rl-more"><summary>Upgrade disponibili (grado ≤ ${rank})</summary>${upg.map(u => `<p><b>[${u.g}] ${esc(u.name)}</b> <small>${esc(u.on)}${u.multi ? " · più volte" : ""}</small>: ${esc(u.eff)}</p>`).join("")}
        <p class="hint">Sul libero mercato gli upgrade di grado 1 sono Molto Onerosi (1.000 E$), gli altri Lussuosi (5.000 E$).</p></details>`;
  }
  return `<section class="rl-card">
    <header class="rl-h"><span class="rl-name">${esc(R.it)} <small>${esc(R.name)}</small></span>
      <span class="rl-ab">${esc(R.abilityIt)} <small>${esc(R.ability)}</small></span>
      <span class="rl-rank">${op("rank:-1", "−", "gp-btn", "Grado −1")}<b>${rank}</b>${op("rank:1", "+", "gp-btn", "Grado +1")}</span>
      ${roll("ability", `⚄ ${esc(R.abilityIt)} <b>${rank}</b>`, "btn small", "Grado + 1d10")}
      ${op("del", "✕", "gp-btn del", "Togli il Ruolo")}</header>
    <div class="role-body">${body}</div>
    <textarea class="rl-notes" data-rl="${i}" data-rf="notes" data-rid="${id}" rows="1" placeholder="Note su questo Ruolo" ${edit ? "" : "disabled"}>${esc(r.notes || "")}</textarea>
  </section>`;
}

// modifica dei Ruoli dalla tab: percorso tipo "ca.precise", "team.0.loyalty", "stable.1.name"
function setPath(o, path, v) { const ks = path.split("."); let x = o; ks.slice(0, -1).forEach((k, j) => { if (x[k] == null) x[k] = /^\d+$/.test(ks[j + 1]) ? [] : {}; x = x[k]; }); x[ks[ks.length - 1]] = v; }
function roleSet(el) {
  const e = state.entries.find(x => x.id === el.dataset.rid); if (!e || !Store.canEdit()) return;
  const i = num(el.dataset.rl), f = el.dataset.rf;
  sheetPatch(e.id, s => {
    migrateRoles(s, e); const r = s.roles[i]; if (!r) return s;
    if (f === "recipes") { const set = new Set(r.recipes || []); if (el.checked) set.add(el.dataset.rv); else set.delete(el.dataset.rv); r.recipes = [...set]; return s; }
    if (f.startsWith("ca.") && !r.ca) r.ca = CPR.autoCA(clamp(num(r.rank), 0, 10));
    if (f.endsWith(".active") && r.id === "nomad" && el.checked && num(r.rank) < 10) (r.stable || []).forEach(v => { v.active = false; });   // un veicolo alla volta
    setPath(r, f, el.type === "checkbox" ? el.checked : el.type === "number" ? Math.max(0, num(el.value)) : el.value);
    return s;
  });
}
async function roleOp(el) {
  const e = state.entries.find(x => x.id === el.dataset.id); if (!e || !Store.canEdit()) return;
  const op = el.dataset.op, i = num(el.dataset.r);
  if (op === "add") {
    const sel = $(`.rl-tab[data-roles-tab="${CSS.escape(e.id)}"] [data-rl-new]`), id = sel && sel.value, roles = rolesOf(e);
    if (!id) return;
    // il primo Ruolo è gratis (grado 4); gli altri partono a grado 1 e costano 60 IP
    if (!roles.length) return sheetPatch(e.id, s => { migrateRoles(s, e); s.roles.push({ id, rank: 4 }); return s; });
    const t = ipTargets(e).find(x => x.key === "newrole:" + id), ip = num(sheetOf(e).ip); if (!t) return;
    if (t.locked && !(await askConfirm(`Per le regole serve il Ruolo precedente almeno a grado 4 (ora è ${num(roles[roles.length - 1].rank)}). Aggiungere comunque?`, "Aggiungi"))) return;
    if (ip < t.cost) {
      if (!isGm()) return toast(`Servono ${t.cost} IP per un nuovo Ruolo: ne hai ${ip}`, "err");
      if (!(await askConfirm(`Servono ${t.cost} IP e ${e.name} ne ha ${ip}. Aggiungere il Ruolo gratis (decisione del GM)?`, "Aggiungi gratis"))) return;
      return sheetPatch(e.id, s => { migrateRoles(s, e); s.roles.push({ id, rank: 1 }); return s; });
    }
    if (!(await askConfirm(`Prendere il Ruolo ${t.label} a grado 1 per ${t.cost} IP? Ne restano ${ip - t.cost}.`, "Compra"))) return;
    sheetPatch(e.id, ipSpendFn(e, t));
    return toast(`Nuovo Ruolo: ${t.label}, grado 1 (−${t.cost} IP)`, "ok");
  }
  if (op === "del") { const R = RL.roleById((rolesOf(e)[i] || {}).id) || {}; if (!(await askConfirm(`Togliere il Ruolo ${R.it || ""} con tutte le sue scelte?`, "Togli"))) return; }
  sheetPatch(e.id, s => {
    migrateRoles(s, e); const r = s.roles[i]; if (!r) return s;
    const [o, a, b] = op.split(":");
    if (o === "del") s.roles.splice(i, 1);
    if (o === "rank") r.rank = clamp(num(r.rank) + num(a), 0, 10);
    if (o === "ca-auto") r.ca = CPR.autoCA(clamp(num(r.rank), 0, 10));
    if (o === "tech-auto") { const n = clamp(num(r.rank), 0, 10); r.tech = { field: n, upgrade: n, fabricate: 0, invent: 0 }; }
    if (o === "team-add") { r.team = r.team || []; r.team.push({ name: "", job: RL.EXEC_JOBS[0], loyalty: 1 + CPR.die(6) }); }
    if (o === "team-del") (r.team || []).splice(num(a), 1);
    if (o === "stable-add") { r.stable = r.stable || []; r.stable.push({ kind: RL.vehiclesFor(num(r.rank))[0], name: "", upgrades: [], active: !r.stable.length }); }
    if (o === "stable-del") (r.stable || []).splice(num(a), 1);
    if (o === "upg-del") { const v = (r.stable || [])[num(a)]; if (v) (v.upgrades || []).splice(num(b), 1); }
    return s;
  });
}
function roleRoll(el) {
  const e = state.entries.find(x => x.id === el.dataset.id); if (!e) return;
  const r = rolesOf(e)[num(el.dataset.r)]; if (!r) return;
  const R = RL.roleById(r.id) || {}, rank = clamp(num(r.rank), 0, 10), card = el.closest(".rl-card");
  const k = el.dataset.k, [kind, arg] = k.split(":");
  const vsDv = (parts, dv, label, extra = {}) => {
    const x = CPR.check([...parts, ...sheetExtra(e)]), ok = x.total > dv;
    return postRoll({ kind: "check", who: e.name, entryId: e.id, label, ...x, hit: { ok, text: `vs VD ${dv} → ${ok ? `riuscito, supera di ${x.total - dv}` : "fallito"}` }, ...extra });
  };
  const val = sel => { const s = card && $(sel, card); return s ? s.value : ""; };
  if (kind === "ability") return sheetCheck(e, `${R.abilityIt || R.ability}`, [{ l: R.abilityIt || "Grado", v: rank }]);
  if (r.id === "rocker" && kind === "fan") {
    const F = RL.FAN_DV.find(f => f.id === arg), B = RL.band(RL.ROCKER, rank);
    return vsDv([{ l: "Impatto Carismatico", v: rank }], F.dv, `Impatto Carismatico · ${F.label}`, { note: B ? `Grado ${rank} (${B.venue}): ${B[arg]}` : "" });
  }
  if (r.id === "tech") {
    const t = techOf(e), sk = val("[data-rl-skill]") || "basictech", K = CPR.skill(sk);
    if (kind === "repair") return sheetCheck(e, `Riparazione Temporanea (${K.label})`, [{ l: "TECH", v: statEff(e, "TECH") }, { l: K.label, v: skillLvl(e, sk) }, { l: "Esperienza sul Campo", v: num(t.field) }],
      { note: `vs la VD della riparazione completa · l'oggetto funziona per ${10 * num(t.field)} minuti, poi torna danneggiato e non si rappezza più` });
    if (kind === "make") {
      const S = RL.TECH_SPECS.find(x => x.id === arg), P = RL.PRICE_DV.find(p => p.id === val("[data-rl-price]")) || RL.PRICE_DV[0];
      return vsDv([{ l: "TECH", v: statEff(e, "TECH") }, { l: K.label, v: skillLvl(e, sk) }, { l: S.label, v: num(t[arg]) }], P.dv, `${S.label} · ${P.label}`,
        { note: `Tempo: ${P.time} · materiali pari alla Categoria di Prezzo${arg === "upgrade" ? " (un upgrade per oggetto; se fallisci a metà ricominci senza perdere i materiali)" : ""}` });
    }
  }
  if (r.id === "medtech") {
    const m = medOf(e), surg = Math.min(10, 2 * num(m.surgery)), mt = Math.min(10, num(m.pharma) + num(m.cryo)), tech = { l: "TECH", v: statEff(e, "TECH") };
    if (kind === "surgery") return sheetCheck(e, "Surgery", [tech, { l: "Surgery", v: surg }]);
    if (kind === "medtech") return sheetCheck(e, "Medical Tech", [tech, { l: "Medical Tech", v: mt }]);
    if (kind === "synth") return vsDv([tech, { l: "Medical Tech", v: mt }], 13, "Sintesi (Farmaceutica)", { note: `200 E$ di materiali, 1 ora · se riesce: ${mt} dosi; se fallisce i materiali sono persi · ricette: ${(r.recipes || []).map(x => (RL.RECIPES.find(y => y.id === x) || {}).label).filter(Boolean).join(", ") || "nessuna scelta"}` });
  }
  if (r.id === "media") {
    if (kind === "rumor") {
      const d = CPR.die(10), tot = d + rank, got = [...RL.RUMORS].reverse().find(x => tot >= x.passive);
      return postRoll({ kind: "check", who: e.name, entryId: e.id, label: "Pettegolezzo passivo", dice: [{ v: d, s: 10 }], mods: [{ l: "Credibilità", v: rank }], total: tot,
        hit: { ok: !!got, text: got ? `Pettegolezzo ${got.label}: ${got.eff}` : "Nessun pettegolezzo questa volta" } });
    }
    if (kind === "publish") {
      const B = RL.band(RL.MEDIA, rank) || { believe: 0 }, bon = (card && $("[data-rl-proof4]", card).checked ? 2 : 0) + (card && $("[data-rl-proof1]", card).checked ? 1 : 0);
      const target = B.believe + bon, d = CPR.die(10), ok = d <= target;
      return postRoll({ kind: "check", who: e.name, entryId: e.id, label: "Pubblicare una storia", dice: [{ v: d, s: 10 }], mods: [], total: d,
        hit: { ok, text: `Attendibilità ${B.believe}${bon ? ` + ${bon} (prove)` : ""} = ${target} su 10 → ${ok ? "il pubblico ci crede" : "non ci crede"}` }, note: `Impatto: ${B.impact || ""} · niente Fortuna su questo tiro` });
    }
  }
  if (r.id === "exec" && (kind === "order" || kind === "loyal")) {
    const m = (r.team || [])[num(arg)]; if (!m) return;
    if (kind === "loyal") { const d = CPR.die(6); sheetPatch(e.id, s => { migrateRoles(s, e); const x = s.roles[num(el.dataset.r)]; if (x && x.team && x.team[num(arg)]) x.team[num(arg)].loyalty = d + 1; return s; });
      return postRoll({ kind: "check", who: e.name, entryId: e.id, label: `Lealtà iniziale · ${m.name || m.job}`, dice: [{ v: d, s: 6 }], mods: [{ l: "", v: 1 }], total: d + 1 }); }
    const d = CPR.die(6), ok = d < num(m.loyalty);
    return postRoll({ kind: "check", who: e.name, entryId: e.id, label: `Ordine a ${m.name || m.job}`, dice: [{ v: d, s: 6 }], mods: [], total: d,
      hit: { ok, text: `Lealtà ${num(m.loyalty)} → ${ok ? "esegue l'ordine" : "non lo esegue"}` } });
  }
  if (r.id === "lawman" && kind === "call") {
    const g = clamp(num(val("[data-rl-grade]")) || rank, 1, Math.max(1, rank)), d = CPR.die(10), ok = d <= g;
    let note = "Se fallisce puoi ritentare nel prossimo turno.";
    if (ok) { const w = CPR.die(6), up = w === 6, B = RL.band(RL.BACKUP, up ? Math.min(10, g + 1) : g) || {};
      note = `Arrivano tra ${w} round: ${B.name} (${B.who}, Comb. ${B.combat}, SP ${B.sp}, PF ${B.hp}, ${B.weapons})${up ? (g >= 10 ? " · con il 6 a grado 10 arrivano due squadre" : " · con il 6 arriva il grado superiore") : ""}`; }
    return postRoll({ kind: "check", who: e.name, entryId: e.id, label: `Rinforzi · grado ${g}`, dice: [{ v: d, s: 10 }], mods: [], total: d, hit: { ok, text: `1d10 ≤ ${g} → ${ok ? "arrivano" : "nessuno risponde"}` }, note });
  }
  if (r.id === "fixer" && kind === "haggle") return sheetCheck(e, "Contrattare", [{ l: "COOL", v: statEff(e, "COOL") }, { l: "Trading", v: skillLvl(e, "trading") }, { l: "Operatore", v: rank }], { note: (RL.band(RL.FIXER, rank) || {}).haggle || "" });
}
