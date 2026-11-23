// ============================================================
//  NIGHT CITY ARCHIVE — mappa: disegno, righello e forme
//  (js/ui/: i file si caricano in ordine da index.html e condividono le costanti)
// ============================================================

// ---------- MAPPA: disegno, righello e forme ----------
// m.draw = [{ id, k: "free" | "line" | "rect" | "square" | "circle", pts [[x, y]…] (matita), x1, y1, x2, y2, c (colore), nf (senza riempimento), by }]
// Coordinate in caselle. Le forme si salvano nella mappa e le vedono tutti; il righello resta solo sul mio schermo.
// by = codice casuale di questo dispositivo (non l'email: le mappe viaggiano sul canale pubblico).
const DRAW_TOOLS = [
  ["move", "✋", "Muovi token e mappa"], ["ruler", "📏", "Righello: trascina per misurare (lo vedi solo tu)"], ["free", "✏", "Matita"],
  ["line", "╱", "Linea con la misura"], ["rect", "▭", "Rettangolo"], ["square", "◻", "Quadrato"], ["circle", "◯", "Cerchio: trascina dal centro"],
  ["shift", "✥", "Sposta: trascina un disegno o una forma (clic = selezionala per cambiarne colore e riempimento)"],
  ["erase", "⌫", "Gomma: clicca una forma per cancellarla"],
];
const DRAW_COLORS = ["#ff2a3d", "#f3e600", "#00f0ff", "#3dff9a", "#ff2bd6", "#ffffff"];
tt.tool = "move"; tt.color = ls.get("nc-draw-color", DRAW_COLORS[0]);
// riempimento di rettangoli, quadrati e cerchi: acceso = colorati dentro, spento = solo il bordo (nf: true)
tt.fill = ls.get("nc-draw-fill", true); tt.selShape = null;
let drawCur = null;
const drawMe = () => { let id = ls.get("nc-draw-me", ""); if (!id) { id = NET.uid(); ls.set("nc-draw-me", id); } return id; };
const canDraw = () => Store.canEdit();
const drawMine = s => isGm() || s.by === drawMe();

// ---------- LAYER (come Roll20): Token, Map, GM ----------
// Token = i token e i disegni normali; Map = oggetti della mappa (sotto i token, si toccano solo da questo layer)
// e immagine di sfondo da spostare e ridimensionare; GM = token nascosti (hidden) e disegni solo per i GM.
// I giocatori sono sempre sul layer Token. I disegni del layer GM stanno in un record a parte ("mapgm", solo GM),
// perché la mappa viaggia sul canale pubblico.
const LAYERS = [["token", "🎲", "Layer Token: token e disegni"], ["map", "🗺", "Layer Map: oggetti della mappa e immagine di sfondo (spostala e ridimensionala)"], ["gm", "🔒", "Layer GM: token e disegni che vedono solo i GM"]];
tt.layer = ls.get("nc-layer", "token");
const curLayer = () => !gmTools() ? "token" : tt.layer === "gm" ? (isGm() && Store.gmReady ? "gm" : "token") : tt.layer === "map" ? "map" : "token";
const tokLayer = t => t.hidden ? "gm" : t.layer === "map" ? "map" : "token";
const shapeLayer = s => s.layer === "map" ? "map" : "token";
const gmDrawRec = m => (state.mapgm || []).find(x => x.id === m.id) || { id: m.id, mapId: m.id, draw: [] };
// le forme del layer attivo (sono le sole che gomma, annulla e cancella toccano)
const layerShapes = (m, L = curLayer()) => !m ? [] : L === "gm" ? gmDrawRec(m).draw || [] : (m.draw || []).filter(s => shapeLayer(s) === L);
function setLayer(l) {
  tt.layer = LAYERS.some(x => x[0] === l) ? l : "token"; ls.set("nc-layer", tt.layer);
  tt.sel = null; drawCur = null; drawTmp(null);
  renderTokens(); renderSide(); renderDrawBar(); renderBgFrame();
}
const r2 = v => Math.round(v * 100) / 100;
// in Cyberpunk RED la diagonale conta come una casella; 1 casella = 2 m
const sqLabel = n => `${n} ${n === 1 ? "casella" : "caselle"} · ${n * 2} m`;
const cellOf = p => ({ x: Math.floor(p.x), y: Math.floor(p.y) });

// forma finita (o in corso) dai due punti trascinati, già agganciata alla griglia
function drawShape(k, a, b, pts) {
  const { W, H } = mapSize(curMap());
  const cx = v => clamp(v, 0, W), cy = v => clamp(v, 0, H);
  if (k === "free") return { k, pts: pts.map(([x, y]) => [r2(cx(x)), r2(cy(y))]) };
  if (k === "line" || k === "ruler") {
    const A = cellOf(a), B = cellOf(b), n = Math.max(Math.abs(B.x - A.x), Math.abs(B.y - A.y));
    return { k, x1: A.x + .5, y1: A.y + .5, x2: B.x + .5, y2: B.y + .5, label: sqLabel(n), n };
  }
  if (k === "rect" || k === "square") {
    const x1 = cx(Math.round(a.x)), y1 = cy(Math.round(a.y));
    let x2 = cx(Math.round(b.x)), y2 = cy(Math.round(b.y));
    if (k === "square") { const s = Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1)); x2 = cx(x1 + (x2 < x1 ? -s : s)); y2 = cy(y1 + (y2 < y1 ? -s : s)); }
    const w = Math.abs(x2 - x1), h = Math.abs(y2 - y1);
    return { k, x1, y1, x2, y2, n: w * h, label: k === "square" ? `lato ${sqLabel(w)}` : `${w} × ${h} caselle · ${w * 2} × ${h * 2} m` };
  }
  // cerchio: centro a mezza casella, raggio a mezze caselle
  const x1 = Math.round(a.x * 2) / 2, y1 = Math.round(a.y * 2) / 2, r = Math.round(Math.hypot(b.x - x1, b.y - y1) * 2) / 2;
  return { k, x1, y1, x2: x1 + r, y2: y1, n: r, label: `raggio ${r} caselle · ${r * 2} m` };
}
function shapeSvg(s, tmp = false) {
  const c = safeColor(s.c || tt.color), P = v => v * CELL, attrs = `${tmp ? "" : `data-shape="${esc(s.id)}"`} stroke="${c}"`;
  const fill = s.nf ? "none" : c;
  const title = s.label ? `<title>${esc(s.label)}</title>` : "";
  if (s.k === "free") return `<polyline ${attrs} class="d-free" points="${s.pts.map(([x, y]) => `${P(x)},${P(y)}`).join(" ")}">${title}</polyline>`;
  if (s.k === "line" || s.k === "ruler") return `<g ${attrs} class="d-line ${s.k === "ruler" ? "d-ruler" : ""}"><line x1="${P(s.x1)}" y1="${P(s.y1)}" x2="${P(s.x2)}" y2="${P(s.y2)}"/>
    <circle fill="${c}" cx="${P(s.x1)}" cy="${P(s.y1)}" r="6"/><circle fill="${c}" cx="${P(s.x2)}" cy="${P(s.y2)}" r="6"/>${title}</g>`;
  if (s.k === "circle") return `<circle ${attrs} class="d-area" fill="${fill}" cx="${P(s.x1)}" cy="${P(s.y1)}" r="${P(Math.abs(s.x2 - s.x1))}">${title}</circle>`;
  return `<rect ${attrs} class="d-area" fill="${fill}" x="${P(Math.min(s.x1, s.x2))}" y="${P(Math.min(s.y1, s.y2))}" width="${P(Math.abs(s.x2 - s.x1))}" height="${P(Math.abs(s.y2 - s.y1))}">${title}</rect>`;
}
// le misure si leggono anche dopo: passando il mouse sulla forma (title) e, per linee e righello, scritte accanto
const shapeTxt = s => (s.k === "line" || s.k === "ruler") && s.label
  ? `<text class="d-txt" x="${s.x2 * CELL + 10}" y="${s.y2 * CELL - 10}">${esc(s.label)}</text>` : "";
function renderDraw() {
  const m = curMap(), box = $("#tt-draw"); if (!m || !box) return;
  const L = curLayer(), pub = m.draw || [], gm = isGm() ? gmDrawRec(m).draw || [] : [];
  // prima il layer Map, poi il Token, poi (solo per i GM) il GM
  const all = [...pub.filter(s => shapeLayer(s) === "map").map(s => [s, "map"]), ...pub.filter(s => shapeLayer(s) === "token").map(s => [s, "token"]), ...gm.map(s => [s, "gm"])];
  // firma completa (non solo la lunghezza): una forma spostata ha la stessa lunghezza ma coordinate diverse
  const sel = tt.tool === "shift" ? tt.selShape : null;
  const sig = L + ":" + sel + ":" + JSON.stringify(all);
  if (box.dataset.sig !== sig) {
    box.innerHTML = all.map(([s, ly]) => `<g class="ly-${ly} ${ly === L ? "act" : ""} ${s.id === sel ? "sel" : ""}">${shapeSvg(s)}${shapeTxt(s)}</g>`).join("");
    box.dataset.sig = sig;
  }
  box.classList.toggle("erasing", tt.tool === "erase");
  box.classList.toggle("shifting", tt.tool === "shift");
}
function drawTmp(s) {
  const box = $("#tt-draw-tmp"); if (box) box.innerHTML = s ? shapeSvg({ ...s, c: s.k === "ruler" ? "#f3e600" : tt.color, nf: !tt.fill }, true) + shapeTxt(s) : "";
}
// forma selezionata con ✥ (solo se è ancora nel layer attivo e posso modificarla)
const selShape = () => { const s = tt.tool === "shift" && tt.selShape && layerShapes(curMap()).find(x => x.id === tt.selShape); return s && drawMine(s) ? s : null; };
const isArea = s => s && (s.k === "rect" || s.k === "square" || s.k === "circle");
function moveShape(s, dx, dy) {
  if (s.k === "free") return { ...s, pts: s.pts.map(([x, y]) => [r2(x + dx), r2(y + dy)]) };
  return { ...s, x1: r2(s.x1 + dx), y1: r2(s.y1 + dy), x2: r2(s.x2 + dx), y2: r2(s.y2 + dy) };
}
// colore e riempimento: valgono per le forme nuove e, con ✥, anche per quella selezionata
function setDrawColor(c) {
  tt.color = safeColor(c); ls.set("nc-draw-color", tt.color);
  const s = selShape();
  if (s) saveDraw(l => l.map(x => x.id === s.id ? { ...x, c: tt.color } : x)); else renderDrawBar();
}
function toggleFill() {
  const s = selShape();
  if (isArea(s)) { const nf = !s.nf; tt.fill = !nf; ls.set("nc-draw-fill", tt.fill); saveDraw(l => l.map(x => x.id === s.id ? { ...x, nf } : x)); return; }
  tt.fill = !tt.fill; ls.set("nc-draw-fill", tt.fill); renderDrawBar();
}
// piano della forma selezionata: nel suo layer l'ordine della lista è l'ordine di disegno (l'ultima sta sopra)
function shapeZ(how) {
  const s = selShape(); if (!s) return;
  saveDraw(l => {
    const i = l.findIndex(x => x.id === s.id); if (i < 0) return l;
    const out = l.filter(x => x.id !== s.id);
    const j = how === "front" ? out.length : how === "back" ? 0 : clamp(i + (how === "up" ? 1 : -1), 0, out.length);
    out.splice(j, 0, l[i]); return out;
  });
}
function drawLabel(ev, text) {
  const ruler = $("#tt-ruler"), wrap = $("#tt-wrap"); if (!ruler || !wrap) return;
  if (!text) { ruler.hidden = true; return; }
  const wr = wrap.getBoundingClientRect();
  ruler.hidden = false; ruler.textContent = text;
  ruler.style.left = ev.clientX - wr.left + 16 + "px"; ruler.style.top = ev.clientY - wr.top + 12 + "px";
}

// barra degli strumenti sopra la mappa (fuori dalla griglia, così non copre le prime caselle); si chiude con ▴
function drawBarHtml() {
  const open = ls.get("nc-tt-bar", true), cur = DRAW_TOOLS.find(t => t[0] === tt.tool) || DRAW_TOOLS[0];
  const tog = `<button type="button" class="tt-tool tt-bartog" data-action="tt-bar-toggle" aria-expanded="${open}" title="${open ? "Chiudi la barra degli strumenti" : "Apri la barra degli strumenti"}" aria-label="${open ? "Chiudi la barra degli strumenti" : "Apri la barra degli strumenti"}">${open ? "▴" : "▾"}</button>`;
  if (!open) return `${tog}<span class="tt-barmini" data-action="tt-bar-toggle" title="Strumento attivo: ${esc(cur[2])} · clicca per aprire la barra">${cur[1]} <small>Strumenti${curLayer() !== "token" ? ` · layer ${curLayer() === "map" ? "Map" : "GM"}` : ""}</small></span>`;
  return tog + drawBarFull();
}
function drawBarFull() {
  const draw = canDraw(), m = curMap(), L = curLayer(), mine = layerShapes(m, L).some(drawMine);
  const sel = selShape(), filled = isArea(sel) ? !sel.nf : tt.fill;
  const fillBtn = `<button type="button" class="tt-tool tt-fill ${filled ? "on" : ""}" data-action="tt-fill" aria-pressed="${filled}"
    title="${filled ? "Figure colorate dentro" : "Figure solo con il bordo"}${isArea(sel) ? " (vale per la figura selezionata)" : " (vale per le prossime figure)"}: clicca per cambiare">${filled ? "◼" : "◻"}</button>`;
  const layers = gmTools() ? `<span class="tt-layers" role="group" aria-label="Layer">${LAYERS.filter(([k]) => k !== "gm" || (isGm() && Store.gmReady)).map(([k, ic, tip]) => `<button type="button" class="tt-tool tt-ly ${L === k ? "on" : ""}" data-action="tt-layer" data-layer="${k}" title="${esc(tip)}" aria-label="${esc(tip)}">${ic}<small>${k === "token" ? "Token" : k === "map" ? "Map" : "GM"}</small></button>`).join("")}</span><span class="tt-sep"></span>` : "";
  const bgCtl = L === "map" && m && m.image ? `<span class="tt-sep"></span><button type="button" class="tt-tool tt-txt" data-action="tt-bg-fit" title="Rimetti l'immagine a coprire tutta la mappa">↺ Adatta</button>
    <label class="tt-chk" title="Acceso: l'immagine si sposta e si ridimensiona di casella in casella. Spento: libera"><input type="checkbox" data-bg-snap ${ls.get("nc-bg-snap", true) ? "checked" : ""}> griglia</label>
    <label class="tt-chk" title="Ridimensionando, l'immagine tiene le sue proporzioni"><input type="checkbox" data-bg-keep ${ls.get("nc-bg-keep", true) ? "checked" : ""}> proporzioni</label>` : "";
  return `${layers}${DRAW_TOOLS.filter(([k]) => draw || k === "move" || k === "ruler").map(([k, ic, tip]) => `<button type="button" class="tt-tool ${tt.tool === k ? "on" : ""}" data-action="tt-tool" data-tool="${k}" title="${esc(tip)}" aria-label="${esc(tip)}">${ic}</button>`).join("")}
    ${draw ? `<span class="tt-sep"></span>${DRAW_COLORS.map(c => `<button type="button" class="tt-color ${c === tt.color ? "on" : ""}" data-action="tt-color" data-c="${c}" style="--c:${c}" aria-label="Colore ${c}"></button>`).join("")}${fillBtn}
      ${sel ? `<span class="tt-sep"></span><span class="tt-zbar" title="Piano della forma selezionata nel suo layer">${[["back", "⤓", "Porta in fondo"], ["down", "↓", "Scendi di un piano"], ["up", "↑", "Sali di un piano"], ["front", "⤒", "Porta in primo piano"]]
        .map(([z, ic, tip]) => `<button type="button" class="tt-tool" data-action="tt-shape-z" data-z="${z}" title="${tip}" aria-label="${tip}">${ic}</button>`).join("")}</span>` : ""}
      <span class="tt-sep"></span><button type="button" class="tt-tool" data-action="tt-draw-undo" title="Annulla la mia ultima forma" ${mine ? "" : "disabled"}>↶</button>
      <button type="button" class="tt-tool" data-action="tt-draw-clear" title="${isGm() ? "Cancella tutti i disegni di questo layer" : "Cancella i miei disegni"}" ${mine ? "" : "disabled"}>🗑</button>` : ""}${bgCtl}`;
}
function renderDrawBar() {
  const bar = $("#tt-drawbar"), wrap = $("#tt-wrap");
  if (bar) bar.innerHTML = drawBarHtml();
  if (wrap) { wrap.classList.toggle("drawing", tt.tool !== "move"); ["token", "map", "gm"].forEach(l => wrap.classList.toggle("lay-" + l, curLayer() === l)); }
  renderDraw(); renderBgFrame();
}
function setTool(k) {
  tt.tool = DRAW_TOOLS.some(t => t[0] === k) ? k : "move";
  tt.selShape = null; drawCur = null; drawTmp(null); drawLabel(null, "");
  renderDrawBar();
}
// fn riceve e restituisce le forme del layer attivo; le altre restano come sono
async function saveDraw(fn, L = curLayer()) {
  const m = curMap(); if (!m) return;
  if (L === "gm") {
    const rec = gmDrawRec(m);
    await saveRec("mapgm", { ...rec, gmOnly: true, draw: fn([...(rec.draw || [])]) });
  } else {
    // riparto dalla versione più recente della mappa, così non cancello le forme appena aggiunte da altri
    const cur = state.maps.find(x => x.id === m.id) || m, all = cur.draw || [];
    await saveMap({ ...cur, draw: [...all.filter(s => shapeLayer(s) !== L), ...fn(all.filter(s => shapeLayer(s) === L))] });
  }
  renderDrawBar();
}
async function drawUndo() {
  const list = layerShapes(curMap()), me = drawMe();
  let i = -1; for (let k = list.length - 1; k >= 0; k--) if (list[k].by === me || (isGm() && k === list.length - 1)) { i = k; break; }
  if (i >= 0) { const id = list[i].id; saveDraw(l => l.filter(s => s.id !== id)); }
}
async function drawClear() {
  const gm = isGm(), list = layerShapes(curMap());
  const n = gm ? list.length : list.filter(drawMine).length; if (!n) return;
  const name = { token: "Token", map: "Map", gm: "GM" }[curLayer()];
  if (!(await askConfirm(gm ? `Cancellare tutti i disegni del layer ${name} (${n})?` : `Cancellare i tuoi disegni (${n})?`))) return;
  saveDraw(l => gm ? [] : l.filter(s => !drawMine(s)));
}

// distanza (in caselle) dal punto p a un segmento, e forma più vicina al punto per la gomma
function segDist(p, ax, ay, bx, by) {
  const dx = bx - ax, dy = by - ay, l2 = dx * dx + dy * dy;
  const t = l2 ? clamp(((p.x - ax) * dx + (p.y - ay) * dy) / l2, 0, 1) : 0;
  return Math.hypot(p.x - (ax + t * dx), p.y - (ay + t * dy));
}
function shapeDist(s, p) {
  if (s.k === "free") return Math.min(...s.pts.slice(1).map((q, i) => segDist(p, s.pts[i][0], s.pts[i][1], q[0], q[1])));
  if (s.k === "line") return segDist(p, s.x1, s.y1, s.x2, s.y2);
  if (s.k === "circle") return Math.max(0, Math.hypot(p.x - s.x1, p.y - s.y1) - Math.abs(s.x2 - s.x1));
  const x1 = Math.min(s.x1, s.x2), x2 = Math.max(s.x1, s.x2), y1 = Math.min(s.y1, s.y2), y2 = Math.max(s.y1, s.y2);
  return Math.hypot(Math.max(x1 - p.x, 0, p.x - x2), Math.max(y1 - p.y, 0, p.y - y2));
}
function nearShape(list, p) {
  let best = null, bd = 0.5;
  for (const s of list) { const d = shapeDist(s, p); if (d <= bd) { best = s; bd = d; } }
  return best;
}

// gestione del puntatore: restituisce true se l'evento è del disegno (e la mappa non deve spostarsi)
function drawDown(ev, cellAt) {
  if (tt.tool === "move") return false;
  if (ev.pointerType === "mouse" && ev.button !== 0) return false;
  ev.preventDefault();
  if (tt.tool === "erase") {
    // la forma cliccata o, se le linee sono sottili da prendere, la più vicina entro mezza casella
    const el = ev.target.closest && ev.target.closest(".act [data-shape]"), list = layerShapes(curMap());
    const s = el ? list.find(x => x.id === el.dataset.shape) : nearShape(list, cellAt(ev));
    if (s && drawMine(s)) saveDraw(l => l.filter(x => x.id !== s.id)); else if (s) toast("Puoi cancellare solo le tue forme", "err");
    return true;
  }
  if (tt.tool === "shift") {
    const el = ev.target.closest && ev.target.closest(".act [data-shape]"), list = layerShapes(curMap()), p = cellAt(ev);
    const s = el ? list.find(x => x.id === el.dataset.shape) : nearShape(list, p);
    if (!s) { if (tt.selShape) { tt.selShape = null; renderDrawBar(); } return true; }
    if (!drawMine(s)) { toast("Puoi spostare solo le tue forme", "err"); return true; }
    tt.selShape = s.id; renderDrawBar();
    const g = $(`#tt-draw [data-shape="${CSS.escape(s.id)}"]`);
    drawCur = { k: "shift", s, a: p, dx: 0, dy: 0, g: g && g.parentNode, id: ev.pointerId };
    try { $("#tt-wrap").setPointerCapture(ev.pointerId); } catch {}
    return true;
  }
  if (tt.tool !== "ruler" && !canDraw()) return true;
  const p = cellAt(ev);
  drawCur = { k: tt.tool, a: p, b: p, pts: [[p.x, p.y]], id: ev.pointerId };
  try { $("#tt-wrap").setPointerCapture(ev.pointerId); } catch {}
  drawTmp(drawShape(drawCur.k, p, p, drawCur.pts));
  return true;
}
function drawMove(ev, cellAt) {
  if (!drawCur) return false;
  const p = cellAt(ev), d = drawCur; d.b = p;
  if (d.k === "shift") {
    // a caselle intere (così rettangoli e linee restano sulla griglia), a mezze caselle per cerchi e matita
    const step = d.s.k === "circle" || d.s.k === "free" ? 0.5 : 1, snap = v => Math.round(v / step) * step;
    d.dx = snap(p.x - d.a.x); d.dy = snap(p.y - d.a.y);
    if (d.g) d.g.setAttribute("transform", `translate(${d.dx * CELL} ${d.dy * CELL})`);
    drawLabel(ev, d.dx || d.dy ? sqLabel(Math.max(Math.abs(Math.round(d.dx)), Math.abs(Math.round(d.dy)))) : "");
    return true;
  }
  if (d.k === "free") { const [lx, ly] = d.pts[d.pts.length - 1]; if (Math.hypot(p.x - lx, p.y - ly) > 0.12) d.pts.push([p.x, p.y]); }
  const s = drawShape(d.k, d.a, p, d.pts);
  drawTmp(s); drawLabel(ev, s.label || "");
  return true;
}
function drawUp(ev, cancel) {
  if (!drawCur) return false;
  const d = drawCur; drawCur = null;
  if (d.k === "shift") {
    drawLabel(ev, "");
    if (cancel || (!d.dx && !d.dy)) { if (d.g) d.g.removeAttribute("transform"); return true; }
    const { dx, dy } = d, id = d.s.id;
    saveDraw(l => l.map(x => x.id === id ? moveShape(x, dx, dy) : x));
    return true;
  }
  if (d.k === "ruler") { drawLabel(ev, ""); return true; }   // il righello resta disegnato finché non ne tracci un altro
  drawTmp(null); drawLabel(ev, "");
  if (cancel) return true;
  const s = drawShape(d.k, d.a, d.b, d.pts);
  const empty = d.k === "free" ? s.pts.length < 2 : d.k === "circle" ? !s.n : d.k === "line" ? s.x1 === s.x2 && s.y1 === s.y2 : !s.n;
  if (empty) return true;
  // la matita tiene al massimo 400 punti
  if (s.pts && s.pts.length > 400) { const step = Math.ceil(s.pts.length / 400); s.pts = s.pts.filter((_, i) => i % step === 0 || i === s.pts.length - 1); }
  const L = curLayer();
  saveDraw(l => [...l, { ...s, id: NET.uid(), c: tt.color, by: drawMe(), ...(!tt.fill && (s.k === "rect" || s.k === "square" || s.k === "circle") ? { nf: true } : {}), ...(L === "map" ? { layer: "map" } : {}) }], L);
  return true;
}


// ---------- immagine di sfondo: posizione e misura (m.bg = { x, y, w, h } in caselle) ----------
// Sul layer Map, con ✋, l'immagine ha una cornice: trascinala per spostarla, tira gli angoli per ridimensionarla.
const bgOf = m => { const { W, H } = mapSize(m), b = m.bg || {}; return b.w > 0 && b.h > 0 ? { x: num(b.x), y: num(b.y), w: num(b.w), h: num(b.h) } : { x: 0, y: 0, w: W, h: H }; };
function placeBg(img, b) {
  if (!img) return;
  Object.assign(img.style, { position: "absolute", left: b.x * CELL + "px", top: b.y * CELL + "px", width: b.w * CELL + "px", height: b.h * CELL + "px" });
}
function renderBgFrame() {
  const m = curMap(), board = $("#tt-board"); if (!m || !board) return;
  let f = $("#tt-bgframe");
  const on = curLayer() === "map" && tt.tool === "move" && !!m.image && gmTools();
  if (!on) { if (f) f.remove(); return; }
  if (!f) {
    f = document.createElement("div"); f.id = "tt-bgframe"; f.className = "tt-bgframe";
    f.innerHTML = ["nw", "ne", "sw", "se"].map(h => `<span class="bg-h ${h}" data-h="${h}"></span>`).join("") + `<span class="bg-size"></span>`;
    board.appendChild(f);
  }
  const b = tt.bgDrag ? tt.bgDrag.b : bgOf(m);
  Object.assign(f.style, { left: b.x * CELL + "px", top: b.y * CELL + "px", width: b.w * CELL + "px", height: b.h * CELL + "px" });
  $(".bg-size", f).textContent = `${r2(b.w)} × ${r2(b.h)} caselle`;
}
function bgDown(ev, cellAt) {
  const f = ev.target.closest && ev.target.closest("#tt-bgframe"); if (!f) return false;
  if (ev.pointerType === "mouse" && ev.button !== 0) return false;
  ev.preventDefault();
  const m = curMap(), img = $("#tt-bg img"), b = bgOf(m), h = ev.target.dataset && ev.target.dataset.h;
  const ratio = img && img.naturalWidth ? img.naturalHeight / img.naturalWidth : b.h / b.w;
  tt.bgDrag = { h: h || "move", p0: cellAt(ev), b0: b, b: { ...b }, ratio };
  try { $("#tt-wrap").setPointerCapture(ev.pointerId); } catch {}
  return true;
}
function bgMove(ev, cellAt) {
  const d = tt.bgDrag; if (!d) return false;
  const p = cellAt(ev), dx = p.x - d.p0.x, dy = p.y - d.p0.y, o = d.b0;
  // griglia: posizione e lati agganciati alle caselle intere; altrimenti liberi
  const snap = ls.get("nc-bg-snap", true), S = v => snap ? Math.round(v) : v;
  if (d.h === "move") d.b = { ...o, x: S(o.x + dx), y: S(o.y + dy) };
  else {
    // l'angolo opposto resta fermo
    let x1 = o.x, y1 = o.y, x2 = o.x + o.w, y2 = o.y + o.h;
    if (d.h.includes("w")) x1 = S(x1 + dx); else x2 = S(x2 + dx);
    if (d.h.includes("n")) y1 = S(y1 + dy); else y2 = S(y2 + dy);
    let w = Math.max(1, x2 - x1), h = Math.max(1, y2 - y1);
    if (ls.get("nc-bg-keep", true)) h = Math.max(1, snap ? Math.round(w * d.ratio) : w * d.ratio);
    d.b = { x: d.h.includes("w") ? o.x + o.w - w : o.x, y: d.h.includes("n") ? o.y + o.h - h : o.y, w, h };
  }
  placeBg($("#tt-bg img"), d.b); renderBgFrame();
  return true;
}
function bgUp(ev, cancel) {
  const d = tt.bgDrag; if (!d) return false;
  tt.bgDrag = null;
  const m = curMap();
  if (cancel || !m) { placeBg($("#tt-bg img"), bgOf(m)); renderBgFrame(); return true; }
  const b = { x: r2(d.b.x), y: r2(d.b.y), w: r2(d.b.w), h: r2(d.b.h) };
  saveMap({ ...(state.maps.find(x => x.id === m.id) || m), bg: b });
  return true;
}
function bgFit() {
  const m = curMap(); if (!m) return;
  const { bg, ...rest } = state.maps.find(x => x.id === m.id) || m;
  saveMap(rest);
}
