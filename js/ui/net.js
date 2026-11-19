// ============================================================
//  NIGHT CITY ARCHIVE — architetture NET, pagina NET, homebrew NET
//  (js/ui/: i file si caricano in ordine da index.html e condividono le costanti)
// ============================================================

// ---------- ARCHITETTURE NET (area GM) ----------
// netarch (🔒 solo GM) = { name, diff, branches[{ fork (piano del ramo principale da cui parte), floors[{ t, dv, ice[{ ref, cur }], label, note, seen, done }] }],
//                           demons[{ ref, cur, note }], notes, shared, gen }
// netview (pubblica)    = copia con i soli piani rivelati, scritta dal GM quando «Mostra ai giocatori» è acceso
const branchLetter = bi => String.fromCharCode(65 + bi);
const branchName = bi => bi ? `Ramo ${branchLetter(bi)}` : "Ramo principale";
const archById = id => state.netarch.find(a => a.id === id);
const archStats = A => {
  const fl = NET.archFloors(A);
  return { floors: fl.length, forks: Math.max(0, (A.branches || []).length - 1), ice: fl.reduce((t, x) => t + (x.f.t === "ice" ? x.f.ice.length : 0), 0),
    bottom: (A.branches || [])[0] ? A.branches[0].floors.length : 0, seen: fl.filter(x => x.f.seen).length };
};
const diffInfo = D => `VD ${D.dv} · Interfaccia per avere una chance ${D.need}+ · rischia di morire prima del fondo: ${D.risk}`;

function archCard(A) {
  const D = NET.diffOf(A.diff), S = archStats(A);
  return `<article class="en-card na-card">
    <button type="button" class="en-card-main" data-action="net-open" data-id="${esc(A.id)}">
      <span class="en-type">${esc(D.label)} · VD ${D.dv}</span>
      <h3>${esc(A.name || "Architettura")}</h3>
      <span class="en-line">${S.floors} piani${S.forks ? ` · ${S.forks} biv${S.forks === 1 ? "io" : "i"}` : ""} · ${S.ice} Black ICE${(A.demons || []).length ? ` · ${(A.demons || []).map(d => esc(NET.demonOf(d.ref).name)).join(", ")}` : ""}</span>
      ${A.shared ? `<span class="en-line na-shared">● visibile ai giocatori · ${S.seen} piani rivelati</span>` : ""}
    </button>
  </article>`;
}

// schema: una colonna per ramo, una riga per piano; le linee le disegna drawArchLinks
// o = { gm: true → pulsanti di gioco, id: architettura }
function archDiagram(A, o = {}) {
  const brs = (A.branches || []).filter(b => b.floors.length);
  if (!brs.length) return `<p class="hint">Nessun piano.</p>`;
  const rows = Math.max(...brs.map(b => NET.depthOf(b, b.floors.length - 1)));
  const main = brs[0];
  const cells = brs.flatMap((b, bi) => b.floors.map((f, i) => {
    const depth = NET.depthOf(b, i);
    const prev = i > 0 ? b.floors[i - 1].id : b.fork ? ((main.floors[b.fork - 1] || {}).id || "") : "";
    const bottom = o.gm ? bi === 0 && i === b.floors.length - 1 : !!f.bottom;   // nella copia pubblica: solo se è davvero il fondo
    return `<div class="na-floor t-${esc(f.t)} ${f.seen ? "seen" : ""} ${f.done ? "done" : ""}" style="grid-column:${bi + 1};grid-row:${depth}" data-floor="${esc(f.id)}" data-prev="${esc(prev)}">
      ${floorHtml(f, depth, bi, bottom, o)}</div>`;
  }));
  return `<div class="na-wrap"><div class="na-grid" style="grid-template-columns:repeat(${brs.length}, minmax(240px, 1fr));grid-template-rows:repeat(${rows}, auto)">
    ${brs.map((b, bi) => bi ? `<span class="na-bh" style="grid-column:${bi + 1};grid-row:${Math.max(1, +b.fork || 1)}">${branchName(bi)}<small>parte dopo il piano ${+b.fork}</small></span>` : "").join("")}
    ${cells.join("")}</div><svg class="na-links" aria-hidden="true"></svg></div>`;
}
function floorHtml(f, depth, bi, bottom, o) {
  const T = NET.floorType(f.t), gm = o.gm;
  const act = (op, inner, title, cls = "gp-btn") => `<button type="button" class="${cls}" data-action="net-adj" data-id="${esc(o.id)}" data-floor="${esc(f.id)}" data-op="${op}" title="${esc(title)}" aria-label="${esc(title)}">${inner}</button>`;
  const roll = (k, what, inner, cls = "chip", title = "") => `<button type="button" class="${cls}" data-action="net-roll" data-id="${esc(o.id)}" data-floor="${esc(f.id)}" data-k="${k}" data-roll="${what}" ${title ? `title="${esc(title)}"` : ""}>${inner}</button>`;
  const head = `<div class="na-fh"><span class="na-depth">Piano ${depth}${bi ? ` <small>${branchLetter(bi)}</small>` : ""}</span>${bottom ? `<span class="na-tag">fondo</span>` : ""}
    ${gm ? `<span class="na-ctl">${act("seen", f.seen ? "👁" : "◌", f.seen ? "Rivelato ai giocatori: clicca per nasconderlo" : "Non ancora raggiunto: clicca per rivelarlo", `gp-btn ${f.seen ? "on" : ""}`)}${act("done", "✓", f.done ? "Superato: clicca per annullare" : "Segna come superato", `gp-btn ${f.done ? "on" : ""}`)}</span>` : f.done ? `<span class="na-tag ok">superato</span>` : ""}</div>`;
  let body;
  if (f.t === "ice") {
    body = (f.ice || []).map((x, k) => {
      const c = NET.iceOf(x.ref); if (!c) return "";
      const cur = x.cur == null ? c.rez : clamp(num(x.cur), 0, c.rez);
      return `<div class="na-ice ${cur <= 0 ? "derez" : ""}">
        <div class="na-ice-h"><b>☠ ${esc(NET.iceLabel(c))}</b><span class="nd-cls">${esc(NET.CLASSES[c.cls].short)}</span>${cur <= 0 ? `<span class="nd-cls dead">derezzato</span>` : ""}</div>
        <small class="na-st">PER ${c.per} · VEL ${c.spd} · ATT ${c.atk} · DIF ${c.def} · REZ ${cur}/${c.rez}</small>
        <span class="sp-bar nd-bar"><i style="width:${cur / c.rez * 100}%"></i></span>
        ${gm ? `<em>${esc(c.eff)}</em>
        <div class="pc-rolls">${roll(k, "spd", `Agguato <b>${c.spd}</b>`, "chip y", "VEL + 1d10 contro Interface + bonus + 1d10 del Netrunner")}${roll(k, "atk", `Attacco <b>${c.atk}</b>`, "chip r", `ATT + 1d10 · ${c.cls === "antiprogram" ? "vs DIF + 1d10 di un programma Rezzato a caso" : "vs Interface + 1d10 del Netrunner"}`)}${(c.dmg || []).map((d, j) => roll(k, "dmg:" + j, `${esc(d.x)}${d.u === "REZ" ? " REZ" : ""}`, "chip y", `${d.l}`)).join("")}${(c.fx || []).length ? roll(k, "fx", `Effetto ${esc(c.fx.map(z => z.x).join("/"))}`, "chip y") : !(c.dmg || []).length ? roll(k, "fx", "Effetto", "chip y") : ""}${roll(k, "def", `Difesa <b>${c.def}</b>`, "chip", "DIF + 1d10 contro un attacco")}
          <span class="sh-adj">${[-1, 1].map(d => act(`rez:${k}:${d}`, d > 0 ? "+1" : "−1", `${d > 0 ? "+" : "−"}1 REZ`)).join("")}${act(`rez:${k}:reset`, "↺", "REZ piena")}</span>
          ${rezIn(sg => `data-action="net-adj" data-id="${esc(o.id)}" data-floor="${esc(f.id)}" data-op="rez:${k}:in${sg}"`)}</div>
        <small class="hint">Bypass: Interface + 1d10 vs PER ${c.per} + 1d10</small>` : ""}
      </div>`;
    }).join("") || `<span class="hint">Nessun Black ICE scelto.</span>`;
  } else {
    body = `<div class="na-what"><b>${T.icon} ${esc(T.label)}</b>${T.dv && f.dv ? ` <span class="na-dv">VD ${num(f.dv)}</span>` : ""}${T.ab ? ` <small class="hint">${T.ab}</small>` : ""}</div>
      ${f.label ? `<div class="na-label">${esc(f.label)}</div>` : ""}`;
  }
  return head + body + (gm && f.note ? `<div class="na-note">${esc(f.note)}</div>` : "") + (gm && f.roll ? `<small class="na-roll">${esc(f.roll)}</small>` : "");
}
// linee tra un piano e il precedente (anche dove un ramo si stacca)
function drawArchLinks(root = document) {
  $$(".na-wrap", root).forEach(wrap => {
    const svg = $(".na-links", wrap), grid = $(".na-grid", wrap); if (!svg || !grid) return;
    const W = grid.scrollWidth, Hh = grid.scrollHeight, base = grid.getBoundingClientRect();
    svg.setAttribute("width", W); svg.setAttribute("height", Hh); svg.setAttribute("viewBox", `0 0 ${W} ${Hh}`);
    const pos = el => { const r = el.getBoundingClientRect(); return { x: r.left - base.left + r.width / 2, top: r.top - base.top, bot: r.bottom - base.top, right: r.right - base.left }; };
    svg.innerHTML = $$(".na-floor[data-prev]", grid).map(el => {
      const prev = el.dataset.prev && $(`.na-floor[data-floor="${CSS.escape(el.dataset.prev)}"]`, grid); if (!prev) return "";
      const a = pos(prev), b = pos(el);
      if (Math.abs(a.x - b.x) < 2) return `<line x1="${a.x}" y1="${a.bot}" x2="${b.x}" y2="${b.top}" />`;
      return `<path d="M${a.right} ${a.bot - 14} H${b.x} V${b.top}" class="fork" />`;
    }).join("");
  });
}
window.addEventListener("resize", () => { if ($(".na-wrap")) drawArchLinks(); });

function archViewHtml(A) {
  const D = NET.diffOf(A.diff), S = archStats(A), id = A.id;
  const dmBtn = (k, what, inner, cls = "chip", title = "") => `<button type="button" class="${cls}" data-action="net-roll" data-id="${esc(id)}" data-demon="${k}" data-roll="${what}" ${title ? `title="${esc(title)}"` : ""}>${inner}</button>`;
  const dmAdj = (k, op, inner, title) => `<button type="button" class="gp-btn" data-action="net-adj" data-id="${esc(id)}" data-demon="${k}" data-op="${op}" title="${esc(title)}" aria-label="${esc(title)}">${inner}</button>`;
  return `<div class="na-view" data-arch="${esc(id)}">
    <div class="na-info">
      <span><small class="sh-k">Difficoltà</small> <b>${esc(D.label)}</b></span>
      <span><small class="sh-k">VD</small> <b>${D.dv}</b></span>
      <span><small class="sh-k">Interfaccia per una chance</small> <b>${D.need}</b></span>
      <span><small class="sh-k">Rischia di morire</small> <b>${esc(D.risk)}</b></span>
      <span><small class="sh-k">Piani</small> <b>${S.floors}</b>${S.forks ? ` · ${S.forks} biv${S.forks === 1 ? "io" : "i"}` : ""}</span>
      <span><small class="sh-k">Rivelati</small> <b>${S.seen}</b> / ${S.floors}</span>
    </div>
    ${A.gen ? `<p class="hint">Tiri del generatore: ${esc(A.gen.floors)} · ${esc(A.gen.forks)}</p>` : ""}
    <p class="hint">Il Netrunner scende un piano alla volta (quanti ne vuole per turno, se nessuna Password lo ferma). I Black ICE in agguato tirano VEL + 1d10 contro la sua Interface + 1d10 e, se vincono, colpiscono subito e vanno in cima all'Iniziativa. 👁 rivela il piano ai giocatori.</p>
    ${archDiagram(A, { gm: true, id })}
    ${(A.demons || []).length ? `<div class="sh-sec-head"><h4>Demoni</h4><span class="hint">nessuna Password li ferma, battono sempre in velocità i programmi · si difendono con Interface + 1d10 · Zap e Control come Azioni NET</span></div>
    <div class="sh-weapons">${A.demons.map((d, k) => {
      const M = NET.demonOf(d.ref), cur = d.cur == null ? M.rez : clamp(num(d.cur), 0, M.rez);
      return `<div class="wpn nd-item demon ${cur <= 0 ? "derez" : ""}"><span class="wpn-n"><span class="nd-name">${esc(M.name)} <span class="nd-cls">Demone</span>${cur <= 0 ? ` <span class="nd-cls dead">derezzato</span>` : ""}</span>
        <small>REZ ${cur}/${M.rez} · Interface ${M.iface} · ${M.actions} Azioni NET · Combattimento ${M.combat}</small><span class="sp-bar nd-bar"><i style="width:${cur / M.rez * 100}%"></i></span>${d.note ? `<em>${esc(d.note)}</em>` : ""}</span>
        <span class="nd-acts">${dmBtn(k, "zap", `Zap <b>${M.iface}</b>`, "btn small", "Interface + 1d10")}${dmBtn(k, "zapdmg", "1d6", "btn small yellow", "Danno dello Zap")}${dmBtn(k, "control", `Control <b>${M.iface}</b>`, "btn small ghost")}${dmBtn(k, "def", `Difesa <b>${M.iface}</b>`, "btn small ghost", "Interface + 1d10")}${dmBtn(k, "combat", `Combattimento <b>${M.combat}</b>`, "btn small ghost", "Droni e torrette: Combattimento + 1d10")}
          <span class="sh-adj">${dmAdj(k, "rez:-1", "−1", "−1 REZ")}${dmAdj(k, "rez:1", "+1", "+1 REZ")}${dmAdj(k, "rez:reset", "↺", "REZ piena")}</span>
          ${rezIn(sg => `data-action="net-adj" data-id="${esc(id)}" data-demon="${k}" data-op="rez:in${sg}"`)}</span></div>`;
    }).join("")}</div>` : ""}
    ${A.notes ? `<div class="block"><h4>Note</h4><div class="prewrap">${esc(A.notes)}</div></div>` : ""}
  </div>`;
}
function openArch(id) {
  const A = archById(id); if (!A || !isGm()) return;
  openModal(`
    <div class="modal-head"><h2>// 🔒 ARCHITETTURA NET</h2><button class="x" data-action="close" aria-label="Chiudi">×</button></div>
    <div class="modal-body">
      <div class="tab-title"><h1>${esc(A.name || "Architettura")}</h1>${A.shared ? `<span class="badge na-shared">● visibile ai giocatori</span>` : `<span class="badge gm">🔒 SOLO GM</span>`}</div>
      ${archViewHtml(A)}
    </div>
    <div class="modal-foot">
      <button class="btn ghost small left" data-action="net-delete" data-id="${esc(A.id)}">Elimina</button>
      <button class="btn ghost small" data-action="net-copy" data-id="${esc(A.id)}">Duplica</button>
      <button class="btn ghost small" data-action="net-reset" data-id="${esc(A.id)}" title="REZ piena, piani da rivelare e da superare">↺ Nuova Netrun</button>
      <button class="btn ghost small yellow" data-action="net-share" data-id="${esc(A.id)}">${A.shared ? "🔒 Nascondi ai giocatori" : "👁 Mostra ai giocatori"}</button>
      <button class="btn cyan" data-action="net-edit" data-id="${esc(A.id)}">Modifica</button>
    </div>`);
  drawArchLinks($("#modal"));
}
function refreshArchView(id) {
  const A = archById(id); if (!A) return;
  $$(`.na-view[data-arch="${CSS.escape(id)}"]`).forEach(box => {
    const host = box.parentElement, y = $("#modal").scrollTop, x = ($(".na-wrap", box) || {}).scrollLeft || 0;
    box.outerHTML = archViewHtml(A);
    const w = $(`.na-view[data-arch="${CSS.escape(id)}"] .na-wrap`, host); if (w) w.scrollLeft = x;
    $("#modal").scrollTop = y; drawArchLinks(host);
  });
}

// copia pubblica: solo i piani rivelati (niente note del GM né piani non raggiunti)
function publicView(A) {
  const main = (A.branches || [])[0] || { floors: [] }, last = main.floors[main.floors.length - 1];
  const keep = f => ({ id: f.id, t: f.t, dv: f.dv, label: f.label || "", done: !!f.done, seen: true, bottom: f === last, ice: (f.ice || []).map(x => ({ ref: x.ref, cur: x.cur })) });
  const branches = (A.branches || []).map((b, bi) => {
    const seen = [];
    for (const f of b.floors) { if (!f.seen) break; seen.push(keep(f)); }   // i piani si aprono in ordine
    return { id: b.id, fork: b.fork, floors: seen };
  }).filter((b, bi) => bi === 0 || (b.floors.length && main.floors.slice(0, b.fork).every(f => f.seen)));
  return { id: "nv-" + A.id, archId: A.id, name: A.name, diff: A.diff, branches, gmOnly: false };
}
async function syncNetView(A) {
  const vid = "nv-" + A.id, had = state.netview.find(v => v.id === vid);
  if (A.shared) {
    const saved = await Store.save("netview", { ...(had || {}), ...publicView(A) });
    upsert(state.netview, saved); liveSend("netview", saved);
  } else if (had) {
    await Store.remove("netview", had); Store.send({ t: "del", col: "netview", id: vid });
    state.netview = state.netview.filter(v => v.id !== vid);
  }
}
// modifiche di gioco (piani rivelati, REZ): aggiorno subito la vista e salvo dopo una breve pausa
const archTimers = new Map();
function archPatch(id, fn) {
  const A = archById(id); if (!A) return;
  upsert(state.netarch, fn(JSON.parse(JSON.stringify(A))));
  refreshArchView(id);
  clearTimeout(archTimers.get(id));
  archTimers.set(id, setTimeout(async () => {
    archTimers.delete(id);
    try {
      const saved = await Store.save("netarch", { ...archById(id), gmOnly: true });
      if (!archTimers.has(id)) upsert(state.netarch, saved);
      liveSend("netarch", saved);
      await syncNetView(saved);
    } catch (err) { fail(err); }
  }, 500));
}
const findFloor = (A, fid) => NET.archFloors(A).find(x => x.f.id === fid);
function archAdj(el) {
  const id = el.dataset.id, op = rezOp(el, el.dataset.op), fid = el.dataset.floor, dk = el.dataset.demon;
  if (!op) return;
  archPatch(id, A => {
    if (dk != null && dk !== "") {
      const d = (A.demons || [])[+dk]; if (!d) return A;
      const M = NET.demonOf(d.ref), cur = d.cur == null ? M.rez : num(d.cur);
      d.cur = op === "rez:reset" ? M.rez : clamp(cur + num(op.split(":")[1]), 0, M.rez);
      return A;
    }
    const x = findFloor(A, fid); if (!x) return A;
    const f = x.f;
    if (op === "seen") {
      // rivelare un piano rivela anche quelli sopra (si scende in ordine); nasconderlo nasconde quelli sotto
      const on = !f.seen, chain = [];
      const main = A.branches[0];
      if (x.bi > 0) chain.push(...main.floors.slice(0, x.b.fork));
      chain.push(...x.b.floors.slice(0, x.i + 1));
      if (on) chain.forEach(g => { g.seen = true; });
      else { x.b.floors.slice(x.i).forEach(g => { g.seen = false; }); if (x.bi === 0) A.branches.slice(1).forEach(b => { if (+b.fork >= x.depth) b.floors.forEach(g => { g.seen = false; }); }); }
    } else if (op === "done") f.done = !f.done;
    else if (op.startsWith("rez:")) {
      const [, k, d] = op.split(":"), ice = (f.ice || [])[+k], c = ice && NET.iceOf(ice.ref); if (!c) return A;
      const cur = ice.cur == null ? c.rez : num(ice.cur);
      ice.cur = d === "reset" ? c.rez : clamp(cur + num(d), 0, c.rez);
    }
    return A;
  });
}
function archRoll(el) {
  const A = archById(el.dataset.id); if (!A) return;
  const what = el.dataset.roll, dk = el.dataset.demon;
  if (dk != null && dk !== "") {
    const d = (A.demons || [])[+dk]; if (!d) return;
    const M = NET.demonOf(d.ref), meta = { who: M.name };
    if (what === "zapdmg") { const r = CPR.rollExpr("1d6"); return postRoll({ kind: "damage", label: "Zap · damage", ...meta, ...r, note: "1d6 REZ a un programma o al cervello di un Netrunner" }); }
    const lab = { zap: ["Zap · attack", "Interface", M.iface, "vs Interface + 1d10 del Netrunner, o DEF + 1d10 di un programma"], control: ["Control", "Interface", M.iface, "Attiva un Nodo di Controllo (una volta per turno)"],
      def: ["Defense", "Interface", M.iface, "Difesa del Demone contro un attacco NET"], combat: ["Combattimento", "Combattimento", M.combat, "Droni, torrette e difese collegate ai Nodi"] }[what];
    if (!lab) return;
    return postRoll({ kind: "check", label: lab[0], ...meta, ...CPR.check([{ l: lab[1], v: lab[2] }]), note: lab[3] });
  }
  const x = findFloor(A, el.dataset.floor), ice = x && (x.f.ice || [])[+el.dataset.k], c = ice && NET.iceOf(ice.ref); if (!c) return;
  const meta = { who: NET.iceLabel(c) };
  const [t, j] = what.split(":");
  if (t === "spd") return postRoll({ kind: "check", label: "Agguato (VEL)", ...meta, ...CPR.check([{ l: "VEL", v: c.spd }]), note: "vs Interface + bonus alla Velocità + 1d10 del Netrunner: se vince, colpisce subito e va in cima all'Iniziativa" });
  if (t === "atk") return postRoll({ kind: "check", label: "Attacco", ...meta, ...CPR.check([{ l: "ATT", v: c.atk }]), note: `${c.cls === "antiprogram" ? "vs DIF + 1d10 di un programma Rezzato a caso" : "vs Interface + 1d10 del Netrunner"} · ${c.eff}` });
  if (t === "def") return postRoll({ kind: "check", label: "Difesa", ...meta, ...CPR.check([{ l: "DIF", v: c.def }]), note: "Contro l'attacco di un programma o uno Zap" });
  if (t === "dmg") { const d = (c.dmg || [])[+j]; if (!d) return; const r = CPR.rollExpr(d.x); return postRoll({ kind: "damage", label: `${d.u === "brain" ? "brain damage" : "REZ damage"} ${d.l}`, ...meta, ...r, note: c.eff }); }
  if (t === "fx") {
    if (!(c.fx || []).length) return postRoll({ kind: "msg", ...meta, text: c.eff });
    c.fx.forEach(z => { const r = CPR.rollExpr(z.x); postRoll({ kind: "damage", label: z.l, ...meta, ...r, note: c.eff }); });
  }
}

// ---------- editor dell'architettura: forma, piani, Black ICE, Demoni ----------
function editArch(id, preset = null) {
  if (!isGm() && Store.gmReady) return;
  const old = archById(id);
  let A = JSON.parse(JSON.stringify(preset || old || NET.blank()));
  const iceSel = (v, k) => `<select data-fl="ice${k}" aria-label="Black ICE ${k + 1}"><option value="">${k ? "—" : "scegli…"}</option>${NET.allIce().map(c => `<option value="${c.id}" ${c.id === v ? "selected" : ""}>${esc(NET.iceLabel(c))} (${c.cls === "antiprogram" ? "Anti-Prog." : "Anti-Op."} ATT ${c.atk})</option>`).join("")}</select>`;
  const floorRow = (b, bi, f, i) => {
    const T = NET.floorType(f.t), depth = NET.depthOf(b, i);
    return `<div class="na-erow" data-b="${bi}" data-i="${i}">
      <span class="na-edepth">P${depth}</span>
      <select data-fl="t" aria-label="Tipo di piano">${NET.FLOOR_TYPES.map(t => `<option value="${t.id}" ${t.id === f.t ? "selected" : ""}>${t.icon} ${t.label}</option>`).join("")}</select>
      ${f.t === "ice" ? `<span class="na-eice">${[0, 1, 2].map(k => iceSel(((f.ice || [])[k] || {}).ref || "", k)).join("")}</span>`
        : `<input data-fl="dv" type="number" min="0" max="30" placeholder="VD" title="VD" value="${esc(f.dv ?? "")}" ${T.dv ? "" : "disabled"}>
           <input data-fl="label" placeholder="${f.t === "control" ? "es. Telecamere, Torretta" : f.t === "file" ? "es. Contabilità" : "Descrizione"}" value="${esc(f.label || "")}">`}
      <input data-fl="note" placeholder="Note del GM" value="${esc(f.note || "")}" class="na-enote">
      <span class="na-ebtn"><button type="button" class="gp-btn" data-na="reroll" title="Ritira questo piano con la tabella" aria-label="Ritira questo piano">⚄</button><button type="button" class="gp-btn" data-na="up" title="Sposta su" aria-label="Sposta su" ${i ? "" : "disabled"}>↑</button><button type="button" class="gp-btn" data-na="down" title="Sposta giù" aria-label="Sposta giù" ${i < b.floors.length - 1 ? "" : "disabled"}>↓</button><button type="button" class="gp-btn del" data-na="del" title="Elimina il piano" aria-label="Elimina il piano">✕</button></span>
    </div>`;
  };
  const body = () => {
    const D = NET.diffOf(A.diff), main = A.branches[0] || { floors: [] };
    return `
      <div class="en-gen en-steps">
        <div class="field"><label for="na-diff">Difficoltà</label><select id="na-diff" data-top="diff">${NET.DIFFS.map(d => `<option value="${d.id}" ${d.id === A.diff ? "selected" : ""}>${d.label} · VD ${d.dv}</option>`).join("")}</select></div>
        <div class="field"><label for="na-dem">Demone (se ci sono Nodi)</label><select id="na-dem" data-top="demon">${[["auto", `Secondo la difficoltà (${NET.demonOf(D.demon).name})`], ["none", "Nessuno"], ...NET.allDemons().map(d => [d.id, d.name])].map(([v, l]) => `<option value="${v}">${esc(l)}</option>`).join("")}</select></div>
        <button type="button" class="btn yellow" data-na="gen">⚄ Genera</button>
        <span class="hint">${esc(diffInfo(D))}. Genera tira 3d6 piani, il d10 dei bivi, l'Ingresso (1d6) per i primi due piani e la tabella dei piani inferiori (3d6) per gli altri, ritirando programmi e Password già usciti.</span>
      </div>
      ${A.gen ? `<p class="hint">Ultima generazione: ${esc(A.gen.floors)} · ${esc(A.gen.forks)}</p>` : ""}
      <div class="fields" style="margin-top:12px">
        <div class="field full"><label class="req" for="na-name">Nome</label><input id="na-name" data-top="name" required value="${esc(A.name || "")}" placeholder="es. Server della Biotechnica, piano 12"></div>
      </div>
      ${A.branches.map((b, bi) => `<section class="na-ebranch">
        <h3 class="sh-h">${branchName(bi)}${bi ? ` <small>parte dopo il piano</small> <select data-fork="${bi}" aria-label="Piano del ramo principale da cui parte">${main.floors.map((_, i) => i + 1).filter(n => n >= 2 && n < main.floors.length).map(n => `<option ${n === +b.fork ? "selected" : ""}>${n}</option>`).join("") || `<option>${+b.fork || 2}</option>`}</select>
          <button type="button" class="btn ghost small danger" data-na="delbranch" data-b="${bi}">Elimina ramo</button>` : ` <small>${main.floors.length} piani · il fondo è l'ultimo piano</small>`}</h3>
        <div class="na-erows">${b.floors.map((f, i) => floorRow(b, bi, f, i)).join("")}</div>
        <button type="button" class="btn ghost small cyan" data-na="add" data-b="${bi}">+ Piano</button>
      </section>`).join("")}
      <button type="button" class="btn ghost small yellow" data-na="addbranch" ${main.floors.length >= 4 ? "" : "disabled title=\"Servono almeno 4 piani nel ramo principale\""}>+ Ramo (bivio)</button>
      <div id="na-warn" class="en-check"></div>
      <h3 class="sh-h">Demoni <small>gestiscono i Nodi di Controllo; le Difese Attive ne richiedono almeno uno · Imp i più comuni</small></h3>
      <div class="na-erows">${(A.demons || []).map((d, k) => `<div class="na-erow demon" data-dm="${k}">
        <select data-dmf="ref" aria-label="Demone">${NET.allDemons().map(m => `<option value="${m.id}" ${m.id === d.ref ? "selected" : ""}>${m.name} · REZ ${m.rez} · Interface ${m.iface} · ${m.actions} Azioni NET</option>`).join("")}</select>
        <input data-dmf="note" placeholder="Quali Nodi gestisce, trigger…" value="${esc(d.note || "")}" class="na-enote">
        <span class="na-ebtn"><button type="button" class="gp-btn del" data-na="deldemon" data-k="${k}" aria-label="Elimina il Demone">✕</button></span></div>`).join("")}</div>
      <button type="button" class="btn ghost small cyan" data-na="adddemon">+ Demone</button>
      <div class="fields" style="margin-top:16px"><div class="field full"><label for="na-notes">Note (scopo dell'Architettura, collegamenti col Meatspace, chi conosce le Password)</label><textarea id="na-notes" data-top="notes" rows="3">${esc(A.notes || "")}</textarea></div></div>`;
  };
  openModal(`
    <form class="form" id="arch-form">
      <div class="modal-head"><h2>// 🔒 ${old ? "MODIFICA ARCHITETTURA" : "NUOVA ARCHITETTURA NET"}</h2><button type="button" class="x" data-action="close" aria-label="Chiudi">×</button></div>
      <div class="modal-body" id="na-body"></div>
      <div class="modal-foot">
        <button type="button" class="btn ghost small left" data-action="${old && !/^#\/net/.test(location.hash) ? "net-open" : "close"}" data-id="${esc(old ? old.id : "")}">Annulla</button>
        <button type="submit" class="btn">Salva architettura</button>
      </div>
    </form>`);
  const form = $("#arch-form"), box = $("#na-body", form);
  let demonOpt = "auto";
  // leggo i campi nel modello, poi ridisegno (per i cambi di struttura)
  const sync = () => {
    const top = k => $(`[data-top=${k}]`, box);
    A.name = top("name").value.trim(); A.diff = top("diff").value; A.notes = top("notes").value.trim(); demonOpt = top("demon").value;
    $$(".na-erow[data-b]", box).forEach(row => {
      const f = A.branches[+row.dataset.b].floors[+row.dataset.i], g = k => $(`[data-fl=${k}]`, row);
      f.t = g("t").value; f.note = g("note").value.trim();
      if (g("ice0")) {
        const prevIce = f.ice || [];
        f.ice = [0, 1, 2].map(k => g("ice" + k).value).filter(Boolean).map((ref, k) => (prevIce[k] && prevIce[k].ref === ref ? prevIce[k] : { ref, cur: (NET.iceOf(ref) || {}).rez }));
      } else if (g("dv")) { f.dv = g("dv").value === "" ? null : num(g("dv").value); f.label = g("label").value.trim(); }
    });
    $$("[data-fork]", box).forEach(s => { A.branches[+s.dataset.fork].fork = num(s.value); });
    $$(".na-erow[data-dm]", box).forEach(row => { const d = A.demons[+row.dataset.dm]; const ref = $("[data-dmf=ref]", row).value; if (d.ref !== ref) d.cur = null; d.ref = ref; d.note = $("[data-dmf=note]", row).value.trim(); });
  };
  const warn = () => {
    const main = A.branches[0] || { floors: [] }, L = main.floors.length, msgs = [];
    A.branches.slice(1).forEach((b, k) => {
      const n = k + 2;
      if (+b.fork < 2) msgs.push(`Ramo ${branchLetter(n - 1)}: i bivi partono dopo il 2° piano del ramo principale`);
      if (+b.fork >= L) msgs.push(`Ramo ${branchLetter(n - 1)}: deve staccarsi prima dell'ultimo piano del ramo principale`);
      if (+b.fork + b.floors.length >= L) msgs.push(`Ramo ${branchLetter(n - 1)}: arriva in fondo quanto il ramo principale (il «fondo» dovrebbe essere uno solo)`);
      if (!b.floors.length) msgs.push(`Ramo ${branchLetter(n - 1)}: nessun piano`);
    });
    if (!L) msgs.push("Il ramo principale non ha piani");
    $$(".na-erow[data-b]", box).forEach(row => { const f = A.branches[+row.dataset.b].floors[+row.dataset.i]; if (f.t === "ice" && !(f.ice || []).length) msgs.push(`Piano ${$(".na-edepth", row).textContent}: scegli almeno un Black ICE`); });
    const hasNode = A.branches.some(b => b.floors.some(f => f.t === "control"));
    if (hasNode && !(A.demons || []).length) msgs.push("Ci sono Nodi di Controllo ma nessun Demone (va bene per i Nodi semplici; le Difese Attive ne vogliono uno)");
    $("#na-warn", box).innerHTML = msgs.map(m => `<div class="warn">⚠ ${esc(m)}</div>`).join("") || `<div class="ok">✓ ${archStats(A).floors} piani pronti</div>`;
  };
  const draw = () => { box.innerHTML = body(); $("[data-top=demon]", box).value = demonOpt; warn(); };
  draw();
  box.addEventListener("change", ev => {
    const t = ev.target;
    sync();
    if (t.matches("[data-fl=t]")) {
      const f = A.branches[+t.closest(".na-erow").dataset.b].floors[+t.closest(".na-erow").dataset.i];
      if (f.t === "ice") { f.dv = null; f.label = ""; } else { f.ice = []; if (NET.floorType(f.t).dv && f.dv == null) f.dv = NET.diffOf(A.diff).dv; }
      return draw();
    }
    if (t.matches("[data-fork], [data-fl^=ice], [data-dmf=ref], [data-top=diff]")) return draw();
    warn();
  });
  box.addEventListener("input", () => { sync(); warn(); });
  box.addEventListener("click", async ev => {
    const b = ev.target.closest("[data-na]"); if (!b) return;
    sync();
    const op = b.dataset.na, row = b.closest(".na-erow"), bi = row ? +row.dataset.b : +b.dataset.b, i = row ? +row.dataset.i : 0;
    const br = A.branches[bi];
    if (op === "gen") {
      if (archStats(A).floors > 3 && !(await askConfirm("Rigenerare tutta l'architettura? I piani attuali si perdono.", "Genera"))) return;
      const name = A.name && !/^Architettura /.test(A.name) ? A.name : "", notes = A.notes;
      A = { ...NET.generate(A.diff, { demon: demonOpt, name }), id: A.id, notes, shared: !!A.shared };
    }
    if (op === "reroll" && row) { const f = NET.rerollFloor(A.diff, NET.depthOf(br, i)); br.floors[i] = { ...f, id: br.floors[i].id }; }
    if (op === "up" && i > 0) [br.floors[i - 1], br.floors[i]] = [br.floors[i], br.floors[i - 1]];
    if (op === "down" && i < br.floors.length - 1) [br.floors[i + 1], br.floors[i]] = [br.floors[i], br.floors[i + 1]];
    if (["del", "add", "addbranch", "delbranch"].includes(op)) delete A.gen;   // i tiri del generatore non descrivono più la forma
    if (op === "del" && row) br.floors.splice(i, 1);
    if (op === "add") br.floors.push(NET.rerollFloor(A.diff, NET.depthOf(br, br.floors.length)));
    if (op === "addbranch") { const L = A.branches[0].floors.length; A.branches.push({ id: NET.uid(), fork: Math.min(L - 2, 2 + Math.floor(Math.random() * Math.max(1, L - 4))), floors: [NET.rerollFloor(A.diff, 3)] }); }
    if (op === "delbranch") A.branches.splice(+b.dataset.b, 1);
    if (op === "adddemon") A.demons = [...(A.demons || []), { id: NET.uid(), ref: NET.diffOf(A.diff).demon, cur: null, note: "" }];
    if (op === "deldemon") A.demons.splice(+b.dataset.k, 1);
    draw();
  });
  form.addEventListener("submit", async ev => {
    ev.preventDefault(); sync();
    if (!A.name) return toast("Dai un nome all'architettura", "err");
    if (!(A.branches[0] || { floors: [] }).floors.length) return toast("Il ramo principale deve avere almeno un piano", "err");
    A.branches = A.branches.filter((b, bi) => bi === 0 || b.floors.length);
    A.branches.forEach(f => f.floors.forEach(x => { if (x.t === "ice") x.ice = (x.ice || []).filter(z => NET.iceOf(z.ref)); }));
    try {
      const saved = await Store.save("netarch", { ...(old || {}), ...A, v: 1, gmOnly: true });
      upsert(state.netarch, saved); liveSend("netarch", saved);
      if (saved.shared) await syncNetView(saved);
      toast("Architettura salvata", "ok");
      if (/^#\/net/.test(location.hash)) { netOpen.add(saved.id); closeModal(); refreshNetPage(); }
      else openArch(saved.id);
      if (/^#\/gm/.test(location.hash)) route();
    } catch (err) { fail(err); }
  });
}

// ---------- pagina NET: le architetture che il GM mostra ai giocatori ----------
function viewNet() {
  const views = [...state.netview].sort((a, b) => (b.updatedAt || "").localeCompare(a.updatedAt || ""));
  return `
    <div class="page-head">
      <div><div class="kicker">// NET_ARCHITECTURE</div><h1>NET</h1><p>Le Architetture di Rete in cui si sta muovendo il Netrunner: compaiono i piani man mano che li raggiunge. I tiri si fanno dal Cyberdeck nella scheda.</p></div>
      <div class="row-btns">${isGm() ? `<button type="button" class="btn small yellow" data-action="net-gen">⚄ Genera architettura</button><button type="button" class="btn ghost small" data-action="net-new">+ A mano</button>` : ""}<button type="button" class="btn ghost small cyan" data-action="dice-open">⬢ Dice log</button></div>
    </div>
    <div id="net-views">${isGm() ? netGmHtml() : netViewsHtml(views)}</div>`;
}
// GM: le condivise aperte in cima, le altre chiuse sotto · 👁 sui piani li rivela ai giocatori
const netOpen = new Set();
function netGmHtml() {
  const list = [...state.netarch].sort((a, b) => (b.shared ? 1 : 0) - (a.shared ? 1 : 0) || (b.updatedAt || "").localeCompare(a.updatedAt || ""));
  if (!list.length) return `<div class="empty"><div class="big">// NESSUNA ARCHITETTURA</div>«⚄ Genera architettura» segue le tabelle del manuale, «+ A mano» la costruisci piano per piano.</div>` + homebrewHtml();
  return `<p class="hint">🔒 Vista del GM: con 👁 su un piano lo riveli ai giocatori (anche quelli sopra), ✓ lo segna come superato. I giocatori vedono solo le architetture con «Mostra ai giocatori» acceso e solo i piani rivelati.</p>` +
    list.map(A => {
      const S = archStats(A), open = A.shared || netOpen.has(A.id);
      return `<details class="na-det" data-arch-det="${esc(A.id)}" ${open ? "open" : ""}>
        <summary><span class="na-sum-t">⌬ ${esc(A.name || "Architettura")}</span>
          ${A.shared ? `<span class="badge na-shared">● visibile ai giocatori</span>` : `<span class="badge gm">🔒 nascosta</span>`}
          <span class="hint">${esc(NET.diffOf(A.diff).label)} · ${S.seen}/${S.floors} piani rivelati</span></summary>
        <div class="na-det-bar">
          <button type="button" class="btn small ${A.shared ? "ghost" : "yellow"}" data-action="net-share" data-id="${esc(A.id)}">${A.shared ? "🔒 Nascondi ai giocatori" : "👁 Mostra ai giocatori"}</button>
          <button type="button" class="btn ghost small" data-action="net-reset" data-id="${esc(A.id)}" title="REZ piena, piani da rivelare e da superare">↺ Nuova Netrun</button>
          <button type="button" class="btn ghost small" data-action="net-copy" data-id="${esc(A.id)}">Duplica</button>
          <button type="button" class="btn ghost small danger" data-action="net-delete" data-id="${esc(A.id)}">Elimina</button>
          <button type="button" class="btn small cyan" data-action="net-edit" data-id="${esc(A.id)}">Modifica</button>
        </div>
        ${archViewHtml(A)}
      </details>`;
    }).join("") + homebrewHtml();
}
// un'architettura aperta o chiusa: me lo ricordo e ridisegno le linee (da chiusa non hanno misure)
document.addEventListener("toggle", ev => {
  const d = ev.target; if (!d.matches || !d.matches("details.na-det")) return;
  if (d.open) { netOpen.add(d.dataset.archDet); drawArchLinks(d); } else netOpen.delete(d.dataset.archDet);
}, true);
function netViewsHtml(views) {
  return views.length ? views.map(v => {
    const D = NET.diffOf(v.diff), n = NET.archFloors(v).length;
    return `<section class="na-pub"><div class="section-title"><h2>⌬ ${esc(v.name || "Architettura")} <span class="hint">${n} piani raggiunti</span></h2></div>
      ${n ? archDiagram(v, { gm: false }) : `<p class="hint">Il Netrunner non è ancora entrato.</p>`}</section>`;
  }).join("") : `<div class="empty"><div class="big">// NESSUNA ARCHITETTURA</div>Il GM non ne sta mostrando nessuna.</div>`;
}
function refreshNetPage() {
  const box = $("#net-views"); if (!box || !/^#\/net/.test(location.hash)) return;
  const x = [...$$(".na-wrap", box)].map(w => w.scrollLeft);
  box.innerHTML = isGm() ? netGmHtml() : netViewsHtml([...state.netview].sort((a, b) => (b.updatedAt || "").localeCompare(a.updatedAt || "")));
  $$(".na-wrap", box).forEach((w, i) => { w.scrollLeft = x[i] || 0; });
  drawArchLinks(box);
}


// ---------- homebrew NET: Black ICE e Demoni del GM (meta "nethb", li vedono tutti per leggere le architetture) ----------
const hbRec = () => state.nethb || { id: "nethb", ice: [], demons: [] };
function homebrewHtml() {
  const H = NET.homebrew();
  const iceTxt = c => `${NET.CLASSES[c.cls].short} · PER ${c.per} · VEL ${c.spd} · ATT ${c.atk} · DIF ${c.def} · REZ ${c.rez}${(c.dmg || []).length ? ` · ${c.dmg[0].x} ${c.dmg[0].u === "REZ" ? "REZ" : "al cervello"}` : ""}`;
  return `<details class="na-det na-hb" ${netOpen.has("hb") ? "open" : ""} data-arch-det="hb">
    <summary><span class="na-sum-t">★ Homebrew</span><span class="hint">${H.ice.length} Black ICE · ${H.demons.length} Demoni · si usano nelle architetture e nei Cyberdeck</span></summary>
    <div class="na-det-bar"><button type="button" class="btn small yellow" data-action="hb-edit" data-kind="ice">+ Black ICE</button><button type="button" class="btn small" data-action="hb-edit" data-kind="demon">+ Demone</button></div>
    <div class="na-view"><div class="sh-weapons">
      ${H.ice.map(c => `<div class="wpn nd-item ice"><span class="wpn-n"><span class="nd-name">☠ ${esc(c.name)} <span class="nd-cls">Black ICE homebrew</span></span><small>${esc(iceTxt(c))}</small>${c.eff ? `<em>${esc(c.eff)}</em>` : ""}</span>
        <span class="nd-acts"><button type="button" class="btn ghost small cyan" data-action="hb-edit" data-kind="ice" data-id="${esc(c.id)}">Modifica</button></span></div>`).join("")}
      ${H.demons.map(d => `<div class="wpn nd-item demon"><span class="wpn-n"><span class="nd-name">${esc(d.name)} <span class="nd-cls">Demone homebrew</span></span><small>REZ ${d.rez} · Interface ${d.iface} · ${d.actions} Azioni NET · Combattimento ${d.combat}</small>${d.eff ? `<em>${esc(d.eff)}</em>` : ""}</span>
        <span class="nd-acts"><button type="button" class="btn ghost small cyan" data-action="hb-edit" data-kind="demon" data-id="${esc(d.id)}">Modifica</button></span></div>`).join("")}
      ${!H.ice.length && !H.demons.length ? `<p class="hint">Nessuno. I Black ICE homebrew compaiono negli elenchi dell'editor delle architetture e del Cyberdeck; i Demoni nella lista dei Demoni.</p>` : ""}
    </div></div></details>`;
}
function editHomebrew(kind, id) {
  if (!isGm() && Store.gmReady) return;
  const R = hbRec(), list = kind === "ice" ? (R.ice || []) : (R.demons || []), old = list.find(x => x.id === id) || {};
  const n = (name, label, v, min = 0, max = 99) => `<div class="field"><label>${label}</label><input name="${name}" type="number" min="${min}" max="${max}" value="${esc(v ?? "")}"></div>`;
  openModal(`
    <form class="form" id="hb-form">
      <div class="modal-head"><h2>// ★ ${kind === "ice" ? "BLACK ICE" : "DEMONE"} HOMEBREW</h2><button type="button" class="x" data-action="close" aria-label="Chiudi">×</button></div>
      <div class="modal-body"><div class="fields">
        <div class="field full"><label class="req">Nome</label><input name="name" required value="${esc(old.name || "")}"></div>
        ${kind === "ice" ? `
        <div class="field"><label>Classe</label><select name="cls"><option value="antipersonnel" ${old.cls !== "antiprogram" ? "selected" : ""}>Anti-Operatore (attacca il Netrunner)</option><option value="antiprogram" ${old.cls === "antiprogram" ? "selected" : ""}>Anti-Programma (attacca i programmi)</option></select></div>
        ${n("per", "PER (difficoltà del Bypass)", old.per ?? 4)}${n("spd", "VEL (agguato)", old.spd ?? 4)}${n("atk", "ATT", old.atk ?? 4)}${n("def", "DIF", old.def ?? 2)}${n("rez", "REZ", old.rez ?? 15, 1, 999)}
        <div class="field"><label>Danno (es. 2d6, vuoto = nessuno)</label><input name="dmgX" value="${esc(old.dmgX || "")}"></div>
        <div class="field"><label>Il danno va</label><select name="dmgU"><option value="brain" ${old.dmgU !== "REZ" ? "selected" : ""}>al cervello</option><option value="REZ" ${old.dmgU === "REZ" ? "selected" : ""}>ai REZ di un programma</option></select></div>
        <div class="field"><label>Tiro dell'effetto (es. 1d6)</label><input name="fxX" value="${esc(old.fxX || "")}"></div>
        <div class="field"><label>Cosa misura quel tiro</label><input name="fxL" value="${esc(old.fxL || "")}" placeholder="es. round bloccato"></div>
        ${n("cost", "Costo (E$)", old.cost ?? "", 0, 100000)}` : `
        ${n("rez", "REZ", old.rez ?? 20, 1, 999)}${n("iface", "Interface", old.iface ?? 4, 0, 10)}${n("actions", "Azioni NET", old.actions ?? 3, 1, 6)}${n("combat", "Combattimento", old.combat ?? 14, 0, 30)}`}
        <div class="field full"><label>Effetto / descrizione</label><textarea name="eff" rows="3">${esc(old.eff || "")}</textarea></div>
      </div></div>
      <div class="modal-foot">
        ${old.id ? `<button type="button" class="btn ghost small left danger" data-hb-del>Elimina</button>` : `<button type="button" class="btn ghost small left" data-action="close">Annulla</button>`}
        <button type="submit" class="btn">Salva</button>
      </div>
    </form>`, true);
  const form = $("#hb-form");
  const save = async next => {
    const rec = { ...hbRec(), id: "nethb", [kind === "ice" ? "ice" : "demons"]: next };
    try {
      const saved = await Store.save("meta", rec);
      state.nethb = saved; NET.setHomebrew(saved); liveSend("meta", saved);
      netOpen.add("hb"); closeModal(); route(); toast("Homebrew salvato", "ok");
    } catch (err) { fail(err); }
  };
  $("[data-hb-del]", form) && $("[data-hb-del]", form).addEventListener("click", async () => {
    const used = state.netarch.some(A => NET.archFloors(A).some(x => (x.f.ice || []).some(i => i.ref === old.id)) || (A.demons || []).some(d => d.ref === old.id));
    if (!(await askConfirm(`Eliminare «${old.name}»?${used ? " È usato in almeno un'architettura: lì non comparirà più." : ""}`))) return;
    save(list.filter(x => x.id !== old.id));
  });
  form.addEventListener("submit", ev => {
    ev.preventDefault();
    const f = form.elements, v = k => f[k] ? f[k].value.trim() : "";
    if (kind === "ice") for (const k of ["dmgX", "fxX"]) if (v(k) && !CPR.parse(v(k))) return toast(`Tiro non valido: "${v(k)}" (es. 2d6)`, "err");
    const item = kind === "ice"
      ? { id: old.id || "hb-" + NET.uid(), name: v("name"), cls: v("cls"), per: num(v("per")), spd: num(v("spd")), atk: num(v("atk")), def: num(v("def")), rez: Math.max(1, num(v("rez"))), dmgX: v("dmgX"), dmgU: v("dmgU"), fxX: v("fxX"), fxL: v("fxL"), cost: num(v("cost")), eff: v("eff") }
      : { id: old.id || "hd-" + NET.uid(), name: v("name"), rez: Math.max(1, num(v("rez"))), iface: num(v("iface")), actions: Math.max(1, num(v("actions"))), combat: num(v("combat")), eff: v("eff") };
    save(old.id ? list.map(x => x.id === old.id ? item : x) : [...list, item]);
  });
}
