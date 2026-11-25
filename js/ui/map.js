// ============================================================
//  NIGHT CITY ARCHIVE — pagina Mappa: mappe, token, iniziativa, tempo reale
//  (js/ui/: i file si caricano in ordine da index.html e condividono le costanti)
// ============================================================

// ---------- TAVOLO DI GIOCO: mappa, token, iniziativa ----------
// maps   = { name, image, cols, rows, grid, init[{tokenId, v}], turn, round }
// tokens = { mapId, entryId?, name, color, image, x, y (caselle), size, hp, hpMax, z (ordine di sovrapposizione nel suo piano) }
const CELL = 64;                              // pixel per casella a zoom 100% · 1 casella = 2 m
// view = mappa che sto guardando io (null = seguo quella condivisa) · remote = frecce degli spostamenti altrui
const tt = { zoom: ls.get("nc-zoom", 1), sel: null, drag: null, view: null, remote: {} };
const onTable = () => /^#\/(mappa|tavolo)/.test(location.hash);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const safeColor = c => /^#[0-9a-f]{6}$/i.test(c || "") ? c : "#00f0ff";
const initials = n => String(n || "?").split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]).join("").toUpperCase();
const mapsSorted = () => [...state.maps].sort((a, b) => (a.name || "").localeCompare(b.name || "", "it"));
// mappa condivisa = quella che il GM ha mostrato a tutti (site.tableMap): quando cambia, tutti ci vengono portati
const sharedMapId = () => (state.site && state.site.tableMap) || "";
// se la mappa condivisa è nascosta (il GM la sta preparando), il giocatore non vede un'altra mappa a caso
const curMap = () => state.maps.find(m => m.id === tt.view) || state.maps.find(m => m.id === sharedMapId())
  || (sharedMapId() && !isGm() ? null : [...state.maps].sort((a, b) => (b.updatedAt || "").localeCompare(a.updatedAt || ""))[0]) || null;
const tokSize = t => clamp(num(t.size) || 1, 1, 6);
const mapSize = m => ({ W: clamp(num(m.cols) || 24, 4, 120), H: clamp(num(m.rows) || 16, 4, 120) });
const mapTokens = m => m ? state.tokens.filter(t => t.mapId === m.id) : [];
const tokEntry = t => t.entryId ? state.entries.find(e => e.id === t.entryId) : null;
// snapName/snapImage: copia presa quando il token è stato messo, per chi non vede la scheda (es. NPC segreto)
const tokName = t => { const e = tokEntry(t); return t.name || (e && e.name) || t.snapName || "Token"; };
const tokImage = t => { const e = tokEntry(t); return t.image || (e && imagesOf(e)[0]) || t.snapImage || ""; };
// nascosto ai giocatori: il token stesso o la sua mappa
const mapHidden = id => { const m = state.maps.find(x => x.id === id); return !!(m && m.hidden); };
const tokHidden = t => !!(t.hidden || mapHidden(t.mapId));
// HP e SP: i token di PG/NPC con scheda usano quelli della scheda; i nemici (own = true) e i token
// generici li hanno propri, così tre ganger dallo stesso modello si feriscono ognuno per conto suo
const tokSheet = t => { const e = tokEntry(t); return e && !t.own && hasSheet(e) ? e : null; };
function tokHp(t) {
  const e = tokSheet(t);
  if (e) return { hp: hpOf(e), max: hpMaxOf(e) };
  if (hasVal(t.hpMax) && num(t.hpMax) > 0) return { hp: hasVal(t.hp) ? num(t.hp) : num(t.hpMax), max: num(t.hpMax) };
  return null;
}
function tokArmor(t, loc) {
  const e = tokSheet(t);
  if (e) return armorOf(e, loc);
  const a = (t.armor || {})[loc]; if (!a || !num(a.sp)) return null;
  return { name: a.name || "", sp: num(a.sp), cur: hasVal(a.cur) ? num(a.cur) : num(a.sp) };
}
// si toccano solo i token del layer attivo (i giocatori sono sempre sul layer Token)
const canMove = t => Store.canEdit() && (!t || tokLayer(t) === curLayer());
const initList = m => (m.init || []).map(it => { const t = state.tokens.find(x => x.id === it.tokenId); return t ? { ...it, name: tokName(t) } : null; })
  .filter(Boolean).sort((a, b) => b.v - a.v || a.name.localeCompare(b.name, "it"));
// il turno è salvato come id del token (turnId): così chi non vede i token nascosti non sbaglia il conto
const turnToken = m => {
  const l = initList(m); if (!l.length) return null;
  if (m.turnId) return l.some(it => it.tokenId === m.turnId) ? m.turnId : null;
  return l[(num(m.turn) % l.length + l.length) % l.length].tokenId;
};

function viewTable() {
  const m = curMap(), edit = gmTools();
  return `
    <div class="page-head tt-head">
      <div><div class="kicker">// TACTICAL_GRID</div><h1>Mappa</h1><p>Mappa, token e iniziativa condivisi in tempo reale · 1 casella = 2 m · i tiri compaiono qui sopra e restano nel Dice log ⬢.</p></div>
      <div class="tt-tools" id="tt-tools">${toolsHtml()}</div>
    </div>
    ${m ? `
    <div class="tt">
      <div class="tt-main">
        <div class="tt-drawbar" id="tt-drawbar" role="toolbar" aria-label="Strumenti della mappa">${drawBarHtml()}</div>
        <div class="tt-wrap" id="tt-wrap"><div class="tt-sizer" id="tt-sizer"><div class="tt-board" id="tt-board">
          <div class="tt-bg" id="tt-bg"></div><div class="tt-grid"></div><svg class="tt-draw" id="tt-draw" aria-hidden="true"></svg><svg class="tt-arrows" id="tt-arrows" aria-hidden="true"></svg><div class="tt-tokens" id="tt-tokens"></div><svg class="tt-draw tmp" id="tt-draw-tmp" aria-hidden="true"></svg>
        </div></div><div class="tt-ruler" id="tt-ruler" hidden></div></div>
        <div class="tt-zoom">
          <button type="button" class="gp-btn" data-action="tt-zoom" data-d="-1" aria-label="Riduci">−</button>
          <span id="tt-zl"></span>
          <button type="button" class="gp-btn" data-action="tt-zoom" data-d="1" aria-label="Ingrandisci">+</button>
          <button type="button" class="gp-btn" data-action="tt-zoom" data-d="0" title="Adatta allo schermo" aria-label="Adatta">⤢</button>
        </div>
      </div>
      <aside class="tt-side">
        <section class="tt-panel" id="tt-sel"></section>
        <section class="tt-panel" id="tt-init"></section>
        <button type="button" class="btn ghost small cyan tt-logbtn" data-action="dice-open">⬢ Apri il Dice log</button>
      </aside>
    </div>` : `
    <div class="empty"><div class="big">// NESSUNA MAPPA</div>${edit ? `Crea la prima mappa per iniziare: carica un'immagine e scegli quante caselle ha.<br><button class="btn" data-action="tt-new-map">+ Nuova mappa</button>` : sharedMapId() ? "Il master sta preparando la mappa: compare qui da sola appena la mostra." : "Il master non ha ancora mostrato una mappa. Appena lo fa, compare qui da sola."}</div>
    <section class="tt-panel tt-log solo"><h4>Dice log</h4>${logWidget()}</section>`}`;
}

function toolsHtml() {
  const m = curMap(), edit = gmTools(), shared = sharedMapId();
  const live = m && m.id === shared && !m.hidden;
  return `
    ${state.maps.length ? `<select id="tt-map" aria-label="Mappa">${mapsSorted().map(x => `<option value="${esc(x.id)}" ${m && x.id === m.id ? "selected" : ""}>${x.id === shared ? "● " : ""}${x.hidden ? "🔒 " : ""}${esc(x.name || "Mappa")}</option>`).join("")}</select>` : ""}
    ${m && m.hidden ? `<span class="tt-hidden-pill" title="I giocatori non vedono questa mappa">🔒 NASCOSTA AI GIOCATORI</span>` : ""}
    ${m ? (live ? `<span class="tt-live" title="Tutti quelli che aprono la pagina Mappa vedono questa mappa">● VISIBILE A TUTTI</span>`
      : edit ? `<button type="button" class="btn small yellow" data-action="tt-share-map" title="Porta tutti i giocatori su questa mappa">◉ Mostra a tutti</button>`
      : shared && state.maps.some(x => x.id === shared) ? `<button type="button" class="btn ghost small yellow" data-action="tt-follow">Torna alla mappa del master</button>` : "") : ""}
    ${edit ? `<button type="button" class="btn ghost small cyan" data-action="tt-new-map">+ Mappa</button>
      ${m ? `<button type="button" class="btn ghost small" data-action="tt-edit-map">Modifica mappa</button><button type="button" class="btn small" data-action="tt-add-token">+ Token</button>` : ""}` : ""}`;
}
function renderTools() { const box = $("#tt-tools"); if (box) box.innerHTML = toolsHtml(); }

// il GM porta tutti su un'altra mappa (o la mappa condivisa cambia dal database)
function applySharedMap(id) {
  if (typeof id !== "string" || id === sharedMapId()) return;
  const before = curMap();
  state.site = { ...(state.site || {}), id: "site", tableMap: id };
  tt.view = null;
  const now = curMap();
  if (!onTable()) return;
  if (!before || !now || before.id !== now.id) {
    tt.sel = null; tt.remote = {}; route();
    if (now) toast(`Il master ha aperto la mappa «${now.name || "Mappa"}»`);
  } else renderTools();
}

// freccia dalla casella di partenza a quella d'arrivo (in Cyberpunk RED la diagonale conta una casella)
function arrowSvg(a) {
  const s = a.size * CELL, x1 = a.sx * CELL + s / 2, y1 = a.sy * CELL + s / 2, x2 = a.x * CELL + s / 2, y2 = a.y * CELL + s / 2;
  const len = Math.hypot(x2 - x1, y2 - y1); if (len < 4) return "";
  const ux = (x2 - x1) / len, uy = (y2 - y1) / len, head = Math.min(30, len * 0.45), w = head * 0.55;
  const bx = x2 - ux * head, by = y2 - uy * head;
  const sq = Math.max(Math.abs(a.x - a.sx), Math.abs(a.y - a.sy));
  return `<g class="tt-arrow" style="--ac:${safeColor(a.color)}">
    <rect class="tt-from" x="${a.sx * CELL + 3}" y="${a.sy * CELL + 3}" width="${s - 6}" height="${s - 6}" rx="${s / 2}"/>
    <rect class="tt-to" x="${a.x * CELL + 2}" y="${a.y * CELL + 2}" width="${s - 4}" height="${s - 4}"/>
    <line x1="${x1}" y1="${y1}" x2="${bx}" y2="${by}"/>
    <polygon points="${x2},${y2} ${bx - uy * w},${by + ux * w} ${bx + uy * w},${by - ux * w}"/>
    ${a.label ? `<text x="${x2}" y="${a.y * CELL - 8}">${esc(a.who || "")} · ${sq * 2} m</text>` : ""}
  </g>`;
}
function drawArrows() {
  const svg = $("#tt-arrows"), m = curMap(); if (!svg || !m) return;
  const list = [];
  const d = tt.drag;
  if (d && d.moved) list.push({ sx: num(d.t.x), sy: num(d.t.y), x: Math.round(d.x), y: Math.round(d.y), size: tokSize(d.t), color: d.t.color });
  for (const [id, a] of Object.entries(tt.remote)) {
    const t = state.tokens.find(x => x.id === id);
    if (t && t.mapId === m.id) list.push({ sx: num(a.sx), sy: num(a.sy), x: Math.round(num(a.x)), y: Math.round(num(a.y)), size: tokSize(t), color: t.color, label: true, who: tokName(t) });
  }
  svg.innerHTML = list.map(arrowSvg).join("");
}
// le frecce degli altri spariscono se il loro trascinamento si interrompe senza arrivare
setInterval(() => {
  const old = Object.keys(tt.remote).filter(id => Date.now() - tt.remote[id].at > 4000);
  if (old.length) { old.forEach(id => delete tt.remote[id]); drawArrows(); renderTokens(); }
}, 1000);

function renderBoard() {
  const m = curMap(), board = $("#tt-board"); if (!m || !board) return;
  const { W, H } = mapSize(m);
  board.style.width = W * CELL + "px"; board.style.height = H * CELL + "px";
  board.classList.toggle("nogrid", m.grid === false);
  const bg = $("#tt-bg");
  if (bg.dataset.img !== (m.image || "")) {
    bg.dataset.img = m.image || "";
    bg.innerHTML = m.image ? `<img data-ref="${esc(m.image)}" alt="" draggable="false">` : "";
    hydrate(bg);
  }
  if (!tt.bgDrag) placeBg($("img", bg), bgOf(m));
  renderBgFrame();
  applyZoom(); renderTokens(); renderSide();
}
function applyZoom() {
  const m = curMap(), board = $("#tt-board"); if (!m || !board) return;
  const { W, H } = mapSize(m);
  board.style.transform = `scale(${tt.zoom})`;
  $("#tt-sizer").style.width = W * CELL * tt.zoom + "px";
  $("#tt-sizer").style.height = H * CELL * tt.zoom + "px";
  $("#tt-zl").textContent = Math.round(tt.zoom * 100) + "%";
}
function setZoom(z, cx, cy) {
  const wrap = $("#tt-wrap"); if (!wrap) return;
  const r = wrap.getBoundingClientRect();
  const px = (cx ?? r.left + r.width / 2) - r.left, py = (cy ?? r.top + r.height / 2) - r.top;
  const bx = (wrap.scrollLeft + px) / tt.zoom, by = (wrap.scrollTop + py) / tt.zoom;
  tt.zoom = clamp(z, 0.2, 3); ls.set("nc-zoom", tt.zoom); applyZoom();
  wrap.scrollLeft = bx * tt.zoom - px; wrap.scrollTop = by * tt.zoom - py;
}
function fitZoom() {
  const m = curMap(), wrap = $("#tt-wrap"); if (!m || !wrap) return;
  const { W, H } = mapSize(m);
  tt.zoom = clamp(Math.min(wrap.clientWidth / (W * CELL), wrap.clientHeight / (H * CELL)), 0.2, 3);
  ls.set("nc-zoom", tt.zoom); applyZoom(); wrap.scrollLeft = 0; wrap.scrollTop = 0;
}

function tokenParts(t, m) {
  const hp = tokHp(t), img = tokImage(t), dead = hp && hp.hp <= 0;
  return {
    cls: ["tt-token", tt.sel === t.id && "sel", dead && "dead", turnToken(m) === t.id && "turn", canMove(t) && "mov", t.hidden && "hid", "layer-" + tokLayer(t), tokLayer(t) !== curLayer() && "inactive"].filter(Boolean).join(" "),
    inner: `<div class="tt-face">${img ? `<img data-ref="${esc(img)}" alt="" draggable="false">` : `<span>${esc(initials(tokName(t)))}</span>`}</div>
      ${hp ? `<div class="tt-hp"><i style="width:${clamp(hp.hp / hp.max * 100, 0, 100)}%"></i></div>` : ""}
      <div class="tt-name">${esc(tokName(t))}</div>
      ${tokStatusIds(t).length ? `<div class="tt-stb" title="${esc(tokStatusIds(t).map(id => (statusOf2(id) || {}).name || "").join(", "))}">${tokStatusIds(t).length}</div>` : ""}`,
  };
}
// aggiorno i token uno per uno senza ricrearli: così un trascinamento in corso non si interrompe
// quando arrivano le mosse degli altri giocatori
function renderTokens() {
  const m = curMap(), box = $("#tt-tokens"); if (!m || !box) return;
  const els = new Map($$(".tt-token", box).map(el => [el.dataset.tok, el]));
  for (const t of mapTokens(m)) {
    const p = tokenParts(t, m), dragging = !!(tt.drag && tt.drag.t.id === t.id);
    let el = els.get(t.id); els.delete(t.id);
    if (!el) { el = document.createElement("div"); el.dataset.tok = t.id; box.appendChild(el); }
    el.className = p.cls + (dragging ? " drag" : "");
    el.title = tokName(t);
    if (el.dataset.sig !== p.inner) { el.innerHTML = p.inner; el.dataset.sig = p.inner; hydrate(el); }
    el.style.width = el.style.height = tokSize(t) * CELL + "px";
    el.style.setProperty("--tc", safeColor(t.color));
    if (!dragging && !tt.remote[t.id]) { el.style.left = num(t.x) * CELL + "px"; el.style.top = num(t.y) * CELL + "px"; }
  }
  for (const el of els.values()) if (!(tt.drag && tt.drag.el === el)) el.remove();
  // ordine nel DOM = ordine di sovrapposizione (non durante un trascinamento, che si interromperebbe)
  if (!tt.drag) {
    const want = [...mapTokens(m)].sort(zCmp).map(t => t.id), have = $$(".tt-token", box).map(el => el.dataset.tok);
    if (want.join() !== have.join()) want.forEach(id => { const el = $(`.tt-token[data-tok="${CSS.escape(id)}"]`, box); if (el) box.appendChild(el); });
  }
  drawArrows(); renderDraw();
}
function renderSide() { renderSel(); renderInit(); }
// piani: i token del layer Map (immagini) stanno sotto, quelli dei layer Token e GM sopra;
// dentro lo stesso piano decide z (a parità l'id, così l'ordine è uguale per tutti)
const tokPlane = t => tokLayer(t) === "map" ? 0 : 1;
const zCmp = (a, b) => tokPlane(a) - tokPlane(b) || num(a.z) - num(b.z) || String(a.id).localeCompare(String(b.id));
const zPlane = t => mapTokens(state.maps.find(m => m.id === t.mapId)).filter(x => tokPlane(x) === tokPlane(t)).sort(zCmp);
async function tokZ(t, how) {
  if (!t || !gmTools()) return;
  let L = zPlane(t);
  if (L.length < 2) return toast("È l'unico su questo piano");
  const i = L.findIndex(x => x.id === t.id);
  if (how === "front" || how === "back") {
    if (i === (how === "front" ? L.length - 1 : 0)) return;
    return saveToken({ ...t, z: how === "front" ? num(L[L.length - 1].z) + 1 : num(L[0].z) - 1 });
  }
  const j = how === "up" ? i + 1 : i - 1; if (j < 0 || j >= L.length) return;
  // con z uguali (token messi prima di questa funzione) si numerano tutti nell'ordine attuale
  if (new Set(L.map(x => num(x.z))).size < L.length) L = L.map((x, k) => ({ ...x, z: k }));
  const za = num(L[i].z), zb = num(L[j].z);
  L[i] = { ...L[i], z: zb }; L[j] = { ...L[j], z: za };
  const old = new Map(zPlane(t).map(x => [x.id, num(x.z)]));
  await Promise.all(L.filter(x => old.get(x.id) !== num(x.z)).map(x => saveRec("tokens", x)));
  renderTokens(); renderSide();
}
// stati del token: quelli della scheda per PG e NPC con scheda, altrimenti i suoi
const tokStatusIds = t => { const e = tokSheet(t); return (e ? sheetOf(e).status : t.status) || []; };
const tokStatusApply = t => {
  const e = tokSheet(t); if (e) return sheetStatusApply(e);
  return { set: fn => saveToken({ ...t, status: fn(t.status) }),
    roll: (st, r) => postRoll({ kind: "damage", who: tokName(t), label: `${st.name} · danno del round`, ...r, note: st.eff || "", gmOnly: tokHidden(t) }) };
};

function renderSel() {
  const box = $("#tt-sel"); if (!box) return;
  const t = state.tokens.find(x => x.id === tt.sel);
  if (!t) {
    box.innerHTML = `<h4>Token</h4><p class="hint">Clicca un token per selezionarlo. Trascinalo per muoverlo (o usa le frecce della tastiera). Il GM copia i nemici con Ctrl+C / Ctrl+V. Rotella = zoom, trascina lo sfondo per spostare la vista.</p>`;
    return;
  }
  const e = tokEntry(t), hp = tokHp(t), edit = Store.canEdit(), gmt = gmTools(), editHp = edit && (!!tokSheet(t) || gmt);
  const enemy = e && e.kind === "nemico" && e.enemy, sh = tokSheet(t), ED = enemy ? enemyD(e) : null;
  const w = hp && (sh ? woundOf(sh) : ED && ED.painImmune ? (w0 => w0.pen ? { ...w0, pen: 0, label: w0.label + " · ignora le ferite" } : w0)(CPR.wound(hp.hp, hp.max)) : CPR.painFix(CPR.wound(hp.hp, hp.max), !!(ED && ED.painEditor)));
  const sp = loc => { const a = tokArmor(t, loc); return a ? spBar(loc === "head" ? "Head SP" : "Body SP", a, editHp && (d => `data-action="tt-sp" data-loc="${loc}" data-d="${d}"`)) : ""; };
  box.innerHTML = `
    <h4 style="color:${safeColor(t.color)}">${t.hidden ? "🔒 " : ""}${esc(tokName(t))}</h4>
    ${isGm() && tokHidden(t) ? `<p class="hint gm-hint">Nascosto ai giocatori${!t.hidden ? " (perché la mappa è nascosta)" : ""}.</p>` : ""}
    ${hp ? `<div class="tt-hpblock w-${w.id}">
      <div class="tt-hpline"><span>HP <b>${hp.hp}</b> / ${hp.max}</span><span class="hint">${esc(w.label)}${w.pen ? ` · ${w.pen}` : ""}</span></div>
      <span class="sh-hpbar"><i style="width:${clamp(hp.hp / hp.max * 100, 0, 100)}%"></i><b style="left:${clamp(CPR.seriousAt(hp.max) / hp.max * 100, 0, 100)}%"></b></span>
      ${editHp ? `<span class="sh-adj">${[-5, -1, 1, 5].map(d => `<button type="button" class="gp-btn" data-action="tt-hp" data-d="${d}">${d > 0 ? "+" : "−"}${Math.abs(d) === 1 ? "" : Math.abs(d)}</button>`).join("")}</span>` : ""}
      ${hp.hp <= 0 ? tokDeathHtml(t, e, enemy, editHp) : ""}
    </div>` : ""}
    ${sp("head")}${sp("body")}
    <div class="tt-st"><span class="sh-k">Stati</span>${statusChips(tokStatusIds(t), edit ? (op, st) => `${op === "add" ? "" : `data-action="tok-status" `}data-st-tok="${esc(t.id)}" data-st-op="${op}" data-st="${esc(st)}"` : null)}</div>
    ${enemy && isGm() ? enemyQuickRolls(e, t) : ""}
    <div class="row-btns" style="margin-top:8px">
      ${e && isPerson(e) ? `<button type="button" class="btn ghost small cyan" data-action="open-entry-tab" data-id="${esc(e.id)}" data-tab="sheet">Scheda</button>` : ""}
      ${enemy && isGm() ? `<button type="button" class="btn ghost small cyan" data-action="enemy-open" data-id="${esc(e.id)}">Scheda nemico</button>` : ""}
      ${edit ? `<button type="button" class="btn ghost small" data-action="tt-init-one">Iniziativa</button>` : ""}
      ${gmt ? `<label class="tt-lysel" title="Layer del token: GM = nascosto ai giocatori">Layer <select data-tok-layer>${[["token", "Token"], ["map", "Map"], ...(isGm() && Store.gmReady ? [["gm", "GM (nascosto)"]] : [])].map(([v, l]) => `<option value="${v}" ${tokLayer(t) === v ? "selected" : ""}>${l}</option>`).join("")}</select></label>
        <span class="tt-z" title="Ordine di sovrapposizione nel suo piano (${tokPlane(t) ? "token" : "immagini del layer Map"})">Piano
          <button type="button" class="gp-btn" data-action="tt-z" data-z="back" title="Porta in fondo" aria-label="Porta in fondo">⤓</button><button type="button" class="gp-btn" data-action="tt-z" data-z="down" title="Scendi di un piano" aria-label="Scendi di un piano">↓</button><button type="button" class="gp-btn" data-action="tt-z" data-z="up" title="Sali di un piano" aria-label="Sali di un piano">↑</button><button type="button" class="gp-btn" data-action="tt-z" data-z="front" title="Porta in primo piano" aria-label="Porta in primo piano">⤒</button></span>
        ${tokSheet(t) ? "" : `<span class="tt-dup" title="Crea copie uguali (HP pieni, numerate) · tastiera: Ctrl+C / Ctrl+V, Ctrl+D"><button type="button" class="btn ghost small" data-action="tt-dup">⧉ Duplica</button><input type="number" min="1" max="20" value="1" data-tok-dup-n aria-label="Quante copie"></span>`}
        <button type="button" class="btn ghost small" data-action="tt-edit-token">Modifica</button>
        <button type="button" class="btn ghost small danger" data-action="tt-del-token">Rimuovi</button>` : ""}
    </div>`;
}
// Death Save dal token quando è Mortally Wounded: ogni tiro alza di 1 la penalità del successivo
// (nemici: penalità sul token; PG e NPC con scheda: quella della scheda)
const tokDsp = (t, e) => e && isPerson(e) && hasSheet(e) ? num(sheetOf(e).dsp) : num(t.dsp);
function tokDeathHtml(t, e, enemy, edit) {
  const pc = e && isPerson(e) && hasSheet(e);
  if (!pc && !(enemy && isGm())) return "";
  const body = pc ? statBase(e, "BODY") : enemyD(e).body, pen = tokDsp(t, e);
  const roll = pc ? `data-action="sheet-roll" data-id="${esc(e.id)}" data-roll="death"` : `data-action="enemy-roll" data-id="${esc(e.id)}" data-roll="death" data-tok="${esc(t.id)}"`;
  return `<div class="tt-death"><button type="button" class="btn small danger" ${roll} title="1d10 + penalità: riesce se il totale è ≤ BODY ${body}; un 10 naturale fallisce sempre">☠ Death Save</button>
    <span>BODY <b>${body}</b> · penalità <b>+${pen}</b></span>
    ${edit ? `<span class="sh-adj"><button type="button" class="gp-btn" data-action="tt-dsp" data-d="-1" aria-label="Penalità −1">−</button><button type="button" class="gp-btn" data-action="tt-dsp" data-d="1" aria-label="Penalità +1">+</button></span>` : ""}</div>`;
}
// strumenti del master (mappe, token, turni): solo i GM; se il ruolo GM non è ancora attivo, chiunque abbia fatto l'accesso
const gmTools = () => Store.canEdit() && (isGm() || !Store.gmReady);

function renderInit() {
  const box = $("#tt-init"), m = curMap(); if (!box || !m) return;
  const list = initList(m), edit = gmTools(), cur = turnToken(m);
  const hid = id => { const t = state.tokens.find(x => x.id === id); return t && t.hidden ? "🔒 " : ""; };
  box.innerHTML = `
    <h4>Initiative ${list.length ? `<span class="hint">· round ${num(m.round) || 1}</span>` : ""}</h4>
    ${list.length ? `<ol class="tt-init">${list.map(it => `
      <li class="${it.tokenId === cur ? "cur" : ""}"><button type="button" data-action="tt-select" data-tok="${esc(it.tokenId)}">${hid(it.tokenId)}${esc(it.name)}</button>
        ${edit ? `<input type="number" step="1" data-init="${esc(it.tokenId)}" value="${num(it.v)}" aria-label="Iniziativa di ${esc(it.name)}">` : `<b>${num(it.v)}</b>`}</li>`).join("")}</ol>`
      : `<p class="hint">Nessuno in iniziativa. ${edit ? "«Tira per tutti» usa REF + 1d10 per chi ha la scheda, 1d10 per gli altri." : ""}</p>`}
    ${edit ? `<div class="row-btns">
      <button type="button" class="btn small" data-action="tt-init-all">Tira per tutti</button>
      ${list.length ? `<button type="button" class="btn small cyan" data-action="tt-next">Turno ▶</button><button type="button" class="btn ghost small" data-action="tt-init-clear">Pulisci</button>` : ""}
    </div>` : ""}`;
}

const newId = () => (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : "id-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
async function saveRec(col, rec) {
  if (!rec.id) rec = { ...rec, id: newId() };
  // visibilità: una mappa nascosta e i suoi token restano solo ai GM (anche nel database)
  if (col === "maps") rec = { ...rec, gmOnly: !!rec.hidden };
  if (col === "tokens") rec = { ...rec, gmOnly: !!(rec.hidden || mapHidden(rec.mapId)) };
  upsert(state[col], rec);
  try {
    const saved = await Store.save(col, rec);
    upsert(state[col], saved); liveSend(col, saved);
    return saved;
  } catch (err) { fail(err); return rec; }
}
async function saveToken(t) { const p = saveRec("tokens", t); renderTokens(); renderSide(); return p; }
async function saveMap(m) { const p = saveRec("maps", m); renderTokens(); renderInit(); return p; }

function selectToken(id) {
  tt.sel = id;
  $$(".tt-token").forEach(el => el.classList.toggle("sel", el.dataset.tok === id));
  renderSel();
}

// prima casella libera vicino al centro della vista
// (at = parti da questa casella invece che dal centro della vista)
function freeCell(m, taken, at) {
  const { W, H } = mapSize(m), wrap = $("#tt-wrap");
  const cx = at ? num(at.x) : wrap ? Math.floor((wrap.scrollLeft + wrap.clientWidth / 2) / (CELL * tt.zoom)) : Math.floor(W / 2);
  const cy = at ? num(at.y) : wrap ? Math.floor((wrap.scrollTop + wrap.clientHeight / 2) / (CELL * tt.zoom)) : Math.floor(H / 2);
  for (let r = 0; r < Math.max(W, H); r++)
    for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
      if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue;
      const x = clamp(cx + dx, 0, W - 1), y = clamp(cy + dy, 0, H - 1);
      if (!taken.has(x + "," + y)) { taken.add(x + "," + y); return { x, y }; }
    }
  return { x: 0, y: 0 };
}

function bindTable() {
  const wrap = $("#tt-wrap"); if (!wrap) return;
  renderBoard();
  if (!ls.get("nc-zoom", null)) fitZoom();
  const board = $("#tt-board"), ruler = $("#tt-ruler");
  const cellAt = ev => { const r = board.getBoundingClientRect(); return { x: (ev.clientX - r.left) / (CELL * tt.zoom), y: (ev.clientY - r.top) / (CELL * tt.zoom) }; };
  let pan = null, lastSend = 0;
  wrap.classList.toggle("drawing", tt.tool !== "move");
  wrap.addEventListener("pointerdown", ev => {
    if (curLayer() === "map" && tt.tool === "move" && bgDown(ev, cellAt)) return;
    if (drawDown(ev, cellAt)) return;
    if (ev.pointerType === "mouse" && ev.button !== 0) return;
    const el = ev.target.closest(".tt-token");
    if (el) {
      const t = state.tokens.find(x => x.id === el.dataset.tok); if (!t) return;
      selectToken(t.id);
      if (!canMove(t)) return;
      ev.preventDefault();
      const p = cellAt(ev);
      tt.drag = { t, el, ox: p.x - num(t.x), oy: p.y - num(t.y), x: num(t.x), y: num(t.y), moved: false };
      try { el.setPointerCapture(ev.pointerId); } catch {} el.classList.add("drag");
      return;
    }
    if (ev.pointerType !== "mouse") return;   // su touch la vista si sposta con lo scroll nativo
    pan = { x: ev.clientX, y: ev.clientY, sl: wrap.scrollLeft, st: wrap.scrollTop, moved: false };
    try { wrap.setPointerCapture(ev.pointerId); } catch {} wrap.classList.add("panning");
  });
  wrap.addEventListener("pointermove", ev => {
    if (bgMove(ev, cellAt)) return;
    if (drawMove(ev, cellAt)) return;
    const d = tt.drag;
    if (d) {
      const m = curMap(), { W, H } = mapSize(m), size = tokSize(d.t), p = cellAt(ev);
      d.x = clamp(p.x - d.ox, 0, W - size); d.y = clamp(p.y - d.oy, 0, H - size);
      if (!d.moved && Math.hypot(d.x - num(d.t.x), d.y - num(d.t.y)) < 0.08) return;
      d.moved = true;
      d.el.style.left = d.x * CELL + "px"; d.el.style.top = d.y * CELL + "px";
      // freccia + righello: in Cyberpunk RED la diagonale conta come una casella
      drawArrows();
      const sq = Math.max(Math.abs(Math.round(d.x) - num(d.t.x)), Math.abs(Math.round(d.y) - num(d.t.y)));
      const wr = wrap.getBoundingClientRect();
      ruler.hidden = false; ruler.textContent = `${sq} ${sq === 1 ? "casella" : "caselle"} · ${sq * 2} m`;
      ruler.style.left = ev.clientX - wr.left + 16 + "px"; ruler.style.top = ev.clientY - wr.top + 12 + "px";
      const now = Date.now();
      // i token nascosti non mandano la posizione sul canale pubblico
      if (now - lastSend > 60 && !tokHidden(d.t)) { Store.send({ t: "move", id: d.t.id, sx: num(d.t.x), sy: num(d.t.y), x: d.x, y: d.y }); lastSend = now; }
    } else if (pan) {
      const dx = ev.clientX - pan.x, dy = ev.clientY - pan.y;
      if (Math.abs(dx) + Math.abs(dy) > 3) pan.moved = true;
      wrap.scrollLeft = pan.sl - dx; wrap.scrollTop = pan.st - dy;
    }
  });
  const end = (ev, cancel) => {
    if (bgUp(ev, cancel)) return;
    if (drawUp(ev, cancel)) return;
    const d = tt.drag;
    if (d) {
      tt.drag = null; ruler.hidden = true; d.el.classList.remove("drag");
      const nx = Math.round(d.x), ny = Math.round(d.y);
      const cur = state.tokens.find(x => x.id === d.t.id);          // nel frattempo qualcuno potrebbe averlo rimosso
      if (cur && !cancel && d.moved && (nx !== num(d.t.x) || ny !== num(d.t.y))) saveToken({ ...cur, x: nx, y: ny });
      else { if (d.moved && !tokHidden(d.t)) Store.send({ t: "move-end", id: d.t.id }); renderTokens(); }
    }
    if (pan) { if (!pan.moved && !cancel) selectToken(null); pan = null; wrap.classList.remove("panning"); }
  };
  wrap.addEventListener("pointerup", ev => end(ev, false));
  wrap.addEventListener("pointercancel", ev => end(ev, true));
  wrap.addEventListener("wheel", ev => { ev.preventDefault(); setZoom(tt.zoom * (ev.deltaY < 0 ? 1.15 : 1 / 1.15), ev.clientX, ev.clientY); }, { passive: false });
  wrap.addEventListener("dblclick", ev => {
    const el = ev.target.closest(".tt-token"); if (!el) return;
    const t = state.tokens.find(x => x.id === el.dataset.tok), e = t && tokEntry(t);
    if (e && isPerson(e)) openEntry(e.id, "sheet");
  });
}

// tiro d'iniziativa per un token: REF + 1d10 se ha la scheda, altrimenti 1d10
async function initFor(m, t) {
  const e = tokEntry(t);
  const d = CPR.die(10);
  const secret = tokHidden(t) ? { gmOnly: true } : {};   // il tiro di un nemico nascosto non lo rivela
  const r = e && e.kind === "nemico" && e.enemy ? await rollEnemy(e, "init", t)
    : e && hasSheet(e) ? await rollInitiative(e, { who: tokName(t), ...secret })
    : await postRoll({ kind: "init", who: tokName(t), label: "Initiative", dice: [{ v: d, s: 10 }], mods: [], total: d, ...secret });
  const init = (m.init || []).filter(it => it.tokenId !== t.id);
  init.push({ tokenId: t.id, v: num(r.total) });
  return init;
}

function editMap(id) {
  // le mappe nuove del GM nascono nascoste: si preparano in pace e si rivelano con "Mostra a tutti"
  const m = state.maps.find(x => x.id === id) || { name: "", cols: 24, rows: 16, grid: true, hidden: isGm() && Store.gmReady };
  openModal(`
    <form class="form" id="map-form">
      <div class="modal-head"><h2>${m.id ? "// MODIFICA MAPPA" : "// NUOVA MAPPA"}</h2><button type="button" class="x" data-action="close" aria-label="Chiudi">×</button></div>
      <div class="modal-body">
        <div class="fields">
          <div class="field full"><label class="req" for="mp-name">Nome</label><input id="mp-name" name="name" required value="${esc(m.name)}" placeholder="es. Magazzino al porto, Watson"></div>
          <div class="field"><label for="mp-cols">Colonne (caselle in larghezza)</label><input id="mp-cols" name="cols" type="number" min="4" max="120" value="${esc(m.cols)}"></div>
          <div class="field"><label for="mp-rows">Righe (caselle in altezza)</label><input id="mp-rows" name="rows" type="number" min="4" max="120" value="${esc(m.rows)}"></div>
          <div class="field full"><label class="check"><input type="checkbox" name="grid" ${m.grid === false ? "" : "checked"}> Mostra la griglia</label>
            <span class="hint">L'immagine viene stirata su colonne × righe: se la mappa ha già una griglia disegnata, conta le sue caselle e usa gli stessi numeri. 1 casella = 2 m.</span></div>
          <div class="field full"><span class="lbl">Immagine di sfondo</span>${imagePicker("image", m.image, true)}</div>
          ${isGm() && Store.gmReady ? `<label class="check field full gm-check"><input type="checkbox" name="hidden" ${m.hidden ? "checked" : ""}> 🔒 Nascosta ai giocatori (con tutti i suoi token) finché non premi «Mostra a tutti»</label>` : ""}
        </div>
      </div>
      <div class="modal-foot">
        ${m.id ? `<button type="button" class="btn ghost small left danger" data-action="tt-del-map" data-id="${esc(m.id)}">Elimina mappa</button>` : ""}
        <button type="button" class="btn ghost small ${m.id ? "" : "left"}" data-action="close">Annulla</button>
        <button type="submit" class="btn">Salva mappa</button>
      </div>
    </form>`, true);
  const form = $("#map-form");
  bindPickers(form);
  form.addEventListener("submit", async ev => {
    ev.preventDefault();
    const btn = $("button[type=submit]", form); btn.disabled = true;
    try {
      const old = m.image || "";
      const image = await commitPicker(form, "image", "maps");
      const hidden = form.elements["hidden"] ? form.elements["hidden"].checked : !!m.hidden;
      const saved = await saveRec("maps", { ...m, name: form.elements["name"].value.trim(), cols: clamp(num(form.cols.value) || 24, 4, 120), rows: clamp(num(form.rows.value) || 16, 4, 120), grid: form.grid.checked, image, hidden });
      if (m.id && !!m.hidden !== hidden) await resaveMapTokens(saved);
      if (old && old !== image) Store.deleteFiles([old]).catch(() => {});
      tt.view = saved.id; closeModal(); route(); toast("Mappa salvata", "ok");
      if (!sharedMapId()) shareMap(saved);   // la prima mappa la vedono subito tutti
    } catch (err) { fail(err); btn.disabled = false; }
  });
}

// la mappa è diventata visibile o nascosta: i suoi token cambiano visibilità insieme a lei
async function resaveMapTokens(m) {
  for (const t of mapTokens(m)) await saveRec("tokens", t);
  renderTokens(); renderSide();
}

// ---------- copia e incolla dei token (Ctrl+C / Ctrl+V, Ctrl+D o «⧉ Duplica») ----------
// le copie partono fresche (HP e armatura pieni, niente stati) e prendono il numero dopo l'ultimo con lo stesso nome.
// I token che usano HP della scheda (PG, NPC con scheda) non si copiano: le copie avrebbero gli stessi HP.
function tokCopyErr(t) {
  if (!t) return "Seleziona prima un token";
  if (!gmTools()) return "Solo il GM può copiare i token";
  if (tokSheet(t)) return "Questo token usa gli HP della sua scheda: le copie si ferirebbero insieme. Copia un nemico o un token generico";
  return "";
}
function copyToken(t) {
  const err = tokCopyErr(t); if (err) return toast(err, "err");
  tt.clip = JSON.parse(JSON.stringify(t));
  toast(`Copiato «${tokName(t)}»: Ctrl+V per incollarlo`, "ok");
}
async function pasteTokens(n = 1, src = tt.clip) {
  const m = curMap(); if (!m || !src || !gmTools()) return;
  n = clamp(Math.trunc(num(n)) || 1, 1, 20);
  const toks = mapTokens(m), taken = new Set(toks.map(t => num(t.x) + "," + num(t.y)));
  const base = tokName(src).replace(/\s+\d+$/, "");
  const re = new RegExp("^" + base.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "(?:\\s+(\\d+))?$");
  let k = Math.max(1, ...toks.map(t => (tokName(t).match(re) || [])[1]).filter(Boolean).map(Number));
  const { id, createdAt, updatedAt, gmOnly, status, dsp, hp, ...rest } = src;
  const armor = src.armor ? Object.fromEntries(Object.entries(src.armor).map(([l, a]) => [l, { ...a, cur: null }])) : undefined;
  const at = src.mapId === m.id ? src : null, out = [];
  for (let i = 0; i < n; i++) out.push({ ...rest, armor, mapId: m.id, name: `${base} ${++k}`, ...freeCell(m, taken, at) });
  let last = null;
  for (const t of out) last = await saveRec("tokens", t);
  renderTokens(); renderSide();
  if (last) selectToken(last.id);
  toast(n > 1 ? `${n} copie di «${base}» sulla mappa` : `«${last ? tokName(last) : base}» sulla mappa`, "ok");
}

function addTokens() {
  const m = curMap(); if (!m) return;
  const onMap = new Set(mapTokens(m).map(t => t.entryId).filter(Boolean));
  const order = { pg: 0, npc: 1, nemico: 2 };
  const people = state.entries.filter(e => isPerson(e) || (e.kind === "nemico" && e.enemy && isGm()))
    .sort((a, b) => order[a.kind] - order[b.kind] || (a.name || "").localeCompare(b.name || "", "it"));
  openModal(`
    <form class="form" id="tok-form">
      <div class="modal-head"><h2>// AGGIUNGI TOKEN</h2><button type="button" class="x" data-action="close" aria-label="Chiudi">×</button></div>
      <div class="modal-body">
        ${people.length ? `<span class="lbl">Dal database</span>
        <div class="tok-pick">${people.map(e => `<label class="check ${onMap.has(e.id) ? "on-map" : ""}"><input type="checkbox" name="ent" value="${esc(e.id)}">
          ${imagesOf(e).length ? imgTag(imagesOf(e)[0]) : `<span class="ph">${esc(initials(e.name))}</span>`}
          <span>${esc(e.name)} <small>${kindOf(e.kind).label}${hasSheet(e) ? " · scheda" : ""}${onMap.has(e.id) ? " · già sulla mappa" : ""}</small></span></label>`).join("")}</div>` : ""}
        <span class="lbl" style="display:block;margin-top:16px">Token generico (ganger, drone, auto…)</span>
        <div class="fields">
          <div class="field"><label for="tk-name">Nome</label><input id="tk-name" name="name" placeholder="es. Ganger Maelstrom"></div>
          <div class="field"><label for="tk-n">Quanti</label><input id="tk-n" name="count" type="number" min="1" max="20" value="1"></div>
          <div class="field"><label for="tk-hp">HP max (facoltativo)</label><input id="tk-hp" name="hpMax" type="number" min="0"></div>
          <div class="field"><label for="tk-sp">SP armatura (facoltativa)</label><input id="tk-sp" name="sp" type="number" min="0" placeholder="es. 7 Kevlar, 11 Light Armorjack"></div>
          <div class="field"><label for="tk-c">Colore</label><input id="tk-c" name="color" type="color" value="#ff2a3d"></div>
          ${isGm() && Store.gmReady ? `<label class="check field full gm-check"><input type="checkbox" name="hidden" ${curLayer() === "gm" ? "checked" : ""}> 🔒 Aggiungi sul layer GM (nascosti ai giocatori)</label>` : ""}
        </div>
      </div>
      <div class="modal-foot"><button type="button" class="btn ghost small left" data-action="close">Annulla</button><button type="submit" class="btn">Aggiungi</button></div>
    </form>`, true);
  const form = $("#tok-form");
  form.addEventListener("submit", async ev => {
    ev.preventDefault();
    const taken = new Set(mapTokens(m).map(t => num(t.x) + "," + num(t.y)));
    const out = [], hidden = !!(form.elements["hidden"] && form.elements["hidden"].checked), onMap = !hidden && curLayer() === "map" ? { layer: "map" } : {};
    for (const id of $$("input[name=ent]:checked", form).map(i => i.value)) {
      const e = state.entries.find(x => x.id === id);
      // nome e immagine copiati: chi non vede la scheda (NPC segreto) vede comunque il token
      if (e.kind === "nemico") { out.push(enemyToken(e, m, { hidden, ...onMap, ...freeCell(m, taken) })); continue; }
      out.push({ mapId: m.id, entryId: id, snapName: e.name, snapImage: imagesOf(e)[0] || "", color: e.kind === "pg" ? "#3dff9a" : "#00f0ff", size: 1, hidden, ...onMap, ...freeCell(m, taken) });
    }
    const name = form.elements["name"].value.trim(), n = clamp(num(form.count.value) || 1, 1, 20);
    const gsp = form.elements["sp"].value === "" ? null : num(form.elements["sp"].value);
    if (name) for (let i = 0; i < n; i++) out.push({ mapId: m.id, name: n > 1 ? `${name} ${i + 1}` : name, color: safeColor(form.color.value), size: 1, hidden, ...onMap,
      hpMax: form.hpMax.value === "" ? null : num(form.hpMax.value), armor: gsp ? { head: { sp: gsp }, body: { sp: gsp } } : undefined, ...freeCell(m, taken) });
    if (!out.length) return toast("Scegli almeno un personaggio o scrivi un nome", "err");
    closeModal();
    for (const t of out) await saveRec("tokens", t);
    renderTokens(); renderSide(); toast(`${out.length} token sulla mappa`, "ok");
  });
}

function editToken(id) {
  const t = state.tokens.find(x => x.id === id); if (!t) return;
  const e = tokEntry(t);
  openModal(`
    <form class="form" id="tok-edit">
      <div class="modal-head"><h2>// TOKEN · ${esc(tokName(t))}</h2><button type="button" class="x" data-action="close" aria-label="Chiudi">×</button></div>
      <div class="modal-body"><div class="fields">
        <div class="field full"><label for="te-name">Nome${e ? " (vuoto = come nel database)" : ""}</label><input id="te-name" name="name" value="${esc(t.name || "")}" placeholder="${esc(e ? e.name : "")}"></div>
        <div class="field"><label for="te-size">Dimensione (caselle)</label><select id="te-size" name="size">${[1, 2, 3, 4].map(n => `<option ${num(t.size) === n || (!t.size && n === 1) ? "selected" : ""}>${n}</option>`).join("")}</select></div>
        <div class="field"><label for="te-c">Colore</label><input id="te-c" name="color" type="color" value="${safeColor(t.color)}"></div>
        ${tokSheet(t) ? `<div class="field full"><span class="hint">HP e armatura di questo token sono quelli della scheda di ${esc(e.name)}: si cambiano lì o con i pulsanti del pannello.</span></div>` : `
        <div class="field"><label for="te-hpm">HP max</label><input id="te-hpm" name="hpMax" type="number" min="0" value="${esc(t.hpMax ?? "")}"></div>
        <div class="field"><label for="te-hp">HP attuali</label><input id="te-hp" name="hp" type="number" value="${esc(t.hp ?? "")}"></div>
        ${["head", "body"].map(loc => { const a = (t.armor || {})[loc] || {}; return `
        <div class="field"><label for="te-sp-${loc}">SP ${loc === "head" ? "testa" : "corpo"} · max</label><input id="te-sp-${loc}" name="sp-${loc}" type="number" min="0" value="${esc(a.sp ?? "")}" placeholder="es. 11"></div>
        <div class="field"><label for="te-cur-${loc}">SP ${loc === "head" ? "testa" : "corpo"} · attuale</label><input id="te-cur-${loc}" name="cur-${loc}" type="number" min="0" value="${esc(a.cur ?? "")}" placeholder="vuoto = piena"></div>`; }).join("")}`}
        <div class="field full"><label for="te-img">Immagine (URL, vuoto = quella del personaggio)</label><input id="te-img" name="image" type="url" value="${esc(t.image && !t.image.startsWith("idb:") ? t.image : "")}"></div>
      </div></div>
      <div class="modal-foot"><button type="button" class="btn ghost small left" data-action="close">Annulla</button><button type="submit" class="btn">Salva token</button></div>
    </form>`, true);
  const form = $("#tok-edit");
  form.addEventListener("submit", async ev => {
    ev.preventDefault();
    const patch = { name: form.elements["name"].value.trim(), size: num(form.size.value) || 1, color: safeColor(form.color.value), image: form.image.value.trim() };
    if (form.hpMax) {
      patch.hpMax = form.hpMax.value === "" ? null : num(form.hpMax.value); patch.hp = form.hp.value === "" ? null : num(form.hp.value);
      patch.armor = {};
      for (const loc of ["head", "body"]) {
        const sp = form.elements["sp-" + loc].value, cur = form.elements["cur-" + loc].value;
        patch.armor[loc] = { ...((t.armor || {})[loc] || {}), sp: sp === "" ? null : num(sp), cur: cur === "" || sp === "" ? null : clamp(num(cur), 0, num(sp)) };
      }
    }
    closeModal(); await saveToken({ ...t, ...patch });
  });
}

async function tableAction(a, el) {
  const m = curMap();
  const t = state.tokens.find(x => x.id === tt.sel);
  switch (a) {
    case "tt-new-map": return editMap(null);
    case "tt-edit-map": return m && editMap(m.id);
    case "tt-del-map": {
      const rec = state.maps.find(x => x.id === el.dataset.id); if (!rec) return;
      const toks = mapTokens(rec);
      if (!(await askConfirm(`Eliminare la mappa "${rec.name}" e i suoi ${toks.length} token? Non si può annullare.`))) return;
      try {
        await Store.remove("maps", rec); Store.send({ t: "del", col: "maps", id: rec.id });
        for (const x of toks) { await Store.remove("tokens", x); Store.send({ t: "del", col: "tokens", id: x.id }); }
        state.maps = state.maps.filter(x => x.id !== rec.id); state.tokens = state.tokens.filter(x => x.mapId !== rec.id);
        closeModal(); route(); toast("Mappa eliminata");
      } catch (err) { fail(err); }
      return;
    }
    case "tt-add-token": return addTokens();
    case "tt-edit-token": return t && editToken(t.id);
    case "tt-z": return tokZ(t, el.dataset.z);
    case "tt-dup": { const err = tokCopyErr(t); if (err) return toast(err, "err"); tt.clip = JSON.parse(JSON.stringify(t)); return pasteTokens(($("[data-tok-dup-n]") || {}).value, t); }
    case "tt-del-token": {
      if (!t) return;
      try {
        await Store.remove("tokens", t); Store.send({ t: "del", col: "tokens", id: t.id });
        state.tokens = state.tokens.filter(x => x.id !== t.id);
        if (m && (m.init || []).some(it => it.tokenId === t.id)) await saveMap({ ...m, init: m.init.filter(it => it.tokenId !== t.id) });
        tt.sel = null; renderTokens(); renderSide();
      } catch (err) { fail(err); }
      return;
    }
    case "tt-select": return selectToken(el.dataset.tok);
    case "tt-hp": {
      if (!t || (!tokSheet(t) && !gmTools())) return;   // nemici e token generici: solo il GM
      const e = tokSheet(t), d = num(el.dataset.d);
      if (e) return sheetPatch(e.id, s => ({ ...s, hp: clamp(hpOf(e) + d, 0, hpMaxOf(e)) }));
      const hp = tokHp(t); if (!hp) return;
      return saveToken({ ...t, hp: clamp(hp.hp + d, 0, hp.max) });
    }
    case "tt-sp": {
      if (!t || (!tokSheet(t) && !gmTools())) return;
      const loc = el.dataset.loc, d = el.dataset.d, e = tokSheet(t);
      if (e) {
        return sheetPatch(e.id, s => armorPatch(s, e, loc, d));
      }
      const a = tokArmor(t, loc); if (!a) return;
      return saveToken({ ...t, armor: { ...(t.armor || {}), [loc]: { ...((t.armor || {})[loc] || {}), cur: d === "reset" ? a.sp : clamp(a.cur + num(d), 0, a.sp) } } });
    }
    case "tt-zoom": {
      const d = num(el.dataset.d);
      return d ? setZoom(tt.zoom * (d > 0 ? 1.25 : 0.8)) : fitZoom();
    }
    case "tt-init-one": {
      if (!m || !t) return;
      return saveMap({ ...curMap(), init: await initFor(curMap(), t) });
    }
    case "tt-init-all": {
      if (!m) return;
      let cur = { ...m };
      for (const x of mapTokens(m).filter(x => tokLayer(x) !== "map")) cur = { ...cur, init: await initFor(cur, x) };
      const first = initList(cur)[0];
      return saveMap({ ...cur, turn: 0, turnId: first ? first.tokenId : null, round: 1 });
    }
    case "tt-next": {
      if (!m) return;
      const l = initList(m); if (!l.length) return;
      let i = l.findIndex(it => it.tokenId === turnToken(m)) + 1, round = num(m.round) || 1;
      if (i >= l.length) { i = 0; round++; }
      const saved = await saveMap({ ...m, turn: i, turnId: l[i].tokenId, round });
      const tok = state.tokens.find(x => x.id === turnToken(saved));
      if (tok) toast(`Turno di ${tokName(tok)}${i === 0 ? ` · round ${round}` : ""}`);
      return;
    }
    case "tt-init-clear": return m && saveMap({ ...m, init: [], turn: 0, turnId: null, round: 1 });
    case "tt-toggle-hidden": {
      if (!t || !isGm()) return;
      await saveToken({ ...t, hidden: !t.hidden });
      toast(t.hidden ? `${tokName(t)} ora è visibile ai giocatori` : `${tokName(t)} ora è nascosto ai giocatori`);
      return;
    }
    case "tt-share-map": return m && shareMap(m);
    case "tt-follow": tt.view = null; tt.sel = null; return route();
  }
}

// il GM porta tutti i giocatori su questa mappa
async function shareMap(m) {
  if (!Store.canEdit()) return;
  try {
    // una mappa nascosta prima diventa visibile, con i suoi token
    if (m.hidden) { m = await saveRec("maps", { ...m, hidden: false }); await resaveMapTokens(m); }
    await saveSite({ tableMap: m.id });
    Store.send({ t: "rec", col: "meta", rec: { id: "site", tableMap: m.id } });
    tt.view = null; renderTools(); toast(`«${m.name || "Mappa"}» ora è visibile a tutti`, "ok");
  } catch (err) { fail(err); }
}

// le schede dei personaggi creati durante la sessione: le ricarico se un token ne nomina una che non conosco
let entriesTimer = null;
function refetchEntries() {
  clearTimeout(entriesTimer);
  entriesTimer = setTimeout(async () => {
    try { state.entries = await Store.list("entries"); if (onTable()) { renderTokens(); renderSide(); } } catch (e) { console.warn(e); }
  }, 300);
}
// cyberware, equipaggiamento… cambiati da un'altra finestra o da un altro giocatore: li rileggo dal database
const entryTimers = new Map();
function refetchEntry(id) {
  clearTimeout(entryTimers.get(id));
  entryTimers.set(id, setTimeout(async () => {
    entryTimers.delete(id);
    try { const rec = await Store.get("entries", id); if (!rec) return; upsert(state.entries, rec); if (!$("#modal form")) refreshSheetView(id); refreshParty(); } catch (e) { console.warn(e); }
  }, 300));
}
const unknownEntries = () => state.tokens.some(t => t.entryId && !state.entries.some(e => e.id === t.entryId));

// messaggi in tempo reale dagli altri giocatori
function onLive(msg) {
  if (!msg || typeof msg !== "object") return;
  if (msg.t === "move" || msg.t === "move-end") {
    const id = String(msg.id);
    if (tt.drag && tt.drag.t.id === id) return;
    if (msg.t === "move-end") { delete tt.remote[id]; renderTokens(); return; }
    tt.remote[id] = { sx: num(msg.sx), sy: num(msg.sy), x: num(msg.x), y: num(msg.y), at: Date.now() };
    const el = $(`.tt-token[data-tok="${CSS.escape(id)}"]`);
    if (el) { el.style.left = num(msg.x) * CELL + "px"; el.style.top = num(msg.y) * CELL + "px"; }
    drawArrows();
    return;
  }
  const col = msg.col;
  if (col === "meta") {
    const r = msg.rec; if (!r) return;
    if (r.id === "site") applySharedMap(r.tableMap);
    if (r.id === "hq") { state.hq = r; HQ.setHomebrew(r.items); if (!$("#modal form") && /^#\/hq/.test(location.hash)) route(); return; }
    if (["rules", "nethb", "cyberhb", "markethb", "market"].includes(r.id)) {
      if (r.id === "rules") state.rules = r; else if (r.id === "cyberhb") { state.cyberhb = r; CW.setHomebrew(r); }
      else if (r.id === "markethb") { state.markethb = r; MK.setHomebrew(r); } else if (r.id === "market") state.market = r; else { state.nethb = r; NET.setHomebrew(r); }
      if (!$("#modal form")) { if (/^#\/(gm|net|party|glossario)/.test(location.hash) && !$("#modal").open) route(); }
    }
    return;
  }
  // riga diventata segreta: i giocatori la tolgono, i GM la rileggono dal database (sul canale non viaggia)
  if (msg.t === "gm") {
    if (!["rolls", "tokens", "maps", "entries", "notes", "gmnotes", "netarch", "mapgm"].includes(col) || !msg.id) return;
    const id = String(msg.id);
    if (isGm()) { Store.get(col, id).then(rec => rec && applyLive(col, rec, true)).catch(e => console.warn(e)); return; }
    return removeLive(col, id);
  }
  if (msg.t === "rec" && msg.rec && msg.rec.id) return applyLive(col, msg.rec, false);
  if (msg.t === "wipe" && col === "rolls") { state.rolls = []; renderLogs(); return; }
  if (msg.t === "del" && ["rolls", "tokens", "maps", "netview", "netarch"].includes(col) && msg.id) return removeLive(col, String(msg.id));
}

// trusted = letto dal database (non dal canale pubblico)
function applyLive(col, rec, trusted) {
  if (!["rolls", "tokens", "maps", "entries", "notes", "gmnotes", "netarch", "netview", "mapgm"].includes(col)) return;
  if (col === "mapgm" && !trusted) return;
  if (col === "mapgm") { state.mapgm = state.mapgm || []; upsert(state.mapgm, rec); if (onTable()) renderDraw(); return; }
  if (!trusted && (rec.gmOnly || ["notes", "gmnotes", "netarch"].includes(col))) return;
  // tiro nuovo di qualcun altro: pop-up se il log è chiuso (sempre sulla mappa)
  if (col === "rolls" && !state.rolls.some(x => x.id === rec.id) && (onTable() || !drawer || drawer.hidden)) setTimeout(() => popRoll(rec));
  let oldTurn = null;
  if (col === "entries" && !trusted) {
    // dal canale accetto solo la parte "sheet" di schede già esistenti
    const e = state.entries.find(x => x.id === rec.id); if (!e) return;
    upsert(state.entries, { ...e, sheet: rec.sheet, updatedAt: rec.updatedAt });
    if (!$("#modal form")) refreshSheetView(e.id);
    if ($("#modal").dataset.entry === e.id) refetchEntry(e.id);
    refreshParty();
    if (onTable()) { renderTokens(); renderSide(); }
    return;
  } else {
    if (col === "maps") { const old = state.maps.find(x => x.id === rec.id); oldTurn = old ? turnToken(old) + "|" + num(old.round) : null; }
    if (col === "tokens") delete tt.remote[rec.id];
    upsert(state[col], rec);
    if (col === "tokens" && rec.entryId && !state.entries.some(e => e.id === rec.entryId)) refetchEntries();
  }
  afterLive(col, rec, oldTurn);
}
function removeLive(col, id) {
  if (!state[col]) return;
  state[col] = state[col].filter(x => x.id !== id);
  if (col === "tokens") { delete tt.remote[id]; if (tt.sel === id) tt.sel = null; }
  if (col === "maps") { state.tokens = state.tokens.filter(t => t.mapId !== id); if (tt.view === id) tt.view = null; }
  if (col === "entries" || col === "notes") {
    // un record diventato segreto mentre un giocatore lo guardava: chiudo la finestra
    if ($("#modal").open && location.hash.includes(id)) closeModal();
    if (["database", "appunti", "party", "home"].includes(location.hash.replace(/^#\/?/, "").split("/")[0] || "home")) route();
    return;
  }
  afterLive(col, null, null);
}
function afterLive(col, rec, oldTurn) {
  if (col === "rolls") { sortRolls(); renderLogs(); return; }
  if (col === "netview") { if (!isGm()) refreshNetPage(); return; }
  if (col === "netarch") {
    if (rec && !archTimers.has(rec.id) && !$("#arch-form")) {
      if (/^#\/net/.test(location.hash) && !$(`.na-view[data-arch="${CSS.escape(rec.id)}"]`, $("#net-views") || document)) refreshNetPage();
      refreshArchView(rec.id);
    }
    if (!rec && /^#\/net/.test(location.hash)) refreshNetPage();
    if (/^#\/gm/.test(location.hash) && !$("#modal").open) route();
    return;
  }
  if (col === "notes" || col === "gmnotes" || col === "entries") {
    if (/^#\/(gm|appunti|database|party)/.test(location.hash) && !$("#modal").open) route();
    if (col === "entries" && onTable()) { renderTokens(); renderSide(); }
    return;
  }
  if (!onTable()) return;
  if (col === "maps") {
    // la mappa compare o sparisce del tutto: ridisegno la pagina; altrimenti aggiorno elenco e tavolo
    if (!!$("#tt-board") !== !!curMap()) return route();
    renderTools(); renderBoard();
    const m = curMap();
    if (m && rec && rec.id === m.id && oldTurn !== null && oldTurn !== turnToken(m) + "|" + num(m.round)) {
      const tok = state.tokens.find(x => x.id === turnToken(m));
      if (tok) toast(`Turno di ${tokName(tok)} · round ${num(m.round) || 1}`);
    }
  } else { renderTokens(); renderSide(); }
}

// riallineamento con il database: se un messaggio in tempo reale si perde (rete che salta,
// telefono in standby), il tavolo si rimette in pari da solo
let refreshing = false;
async function refreshLive() {
  if (refreshing) return; refreshing = true;
  try {
    const [rolls, tokens, maps, meta] = await Promise.all([Store.list("rolls", { limit: 100 }), Store.list("tokens"), Store.list("maps"), Store.list("meta")]);
    state.rolls = rolls; sortRolls(); renderLogs();
    if (tt.drag) return;
    Object.assign(state, { tokens, maps });
    if (unknownEntries()) refetchEntries();
    const s = meta.find(x => x.id === "site");
    if (s && s.tableMap && s.tableMap !== sharedMapId()) return applySharedMap(s.tableMap);
    if (!onTable()) return;
    if (!!$("#tt-board") !== !!curMap()) return route();
    renderTools(); renderBoard();
  } catch (e) { console.warn(e); }
  finally { refreshing = false; }
}
// canale giù: ogni 6 secondi · canale su: un controllo ogni 30 secondi, per sicurezza
let lastRefresh = 0;
setInterval(() => {
  if (!onTable() || document.hidden || tt.drag) return;
  const every = Store.mode === "cloud" && !Store.liveOk ? 6000 : 30000;
  if (Date.now() - lastRefresh >= every) { lastRefresh = Date.now(); refreshLive(); }
}, 2000);
document.addEventListener("visibilitychange", () => { if (!document.hidden && onTable()) { lastRefresh = Date.now(); refreshLive(); } });
// pagina NET: se un messaggio si perde, la rileggo ogni tanto
let lastNet = 0;
setInterval(async () => {
  if (!/^#\/net/.test(location.hash) || document.hidden) return;
  if (Date.now() - lastNet < (Store.mode === "cloud" && !Store.liveOk ? 6000 : 30000)) return;
  lastNet = Date.now();
  try {
    if (isGm()) { if (archTimers.size || $("#modal").open) return; state.netarch = await Store.list("netarch"); }
    else state.netview = await Store.list("netview");
    refreshNetPage();
  } catch (e) { console.warn(e); }
}, 2000);
// quando il canale si riconnette dopo un'interruzione, recupero quello che mi sono perso
const onLiveStatus = (ok, wasOk) => { if (ok && wasOk === false && onTable()) refreshLive(); };
