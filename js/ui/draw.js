// ============================================================
//  NIGHT CITY ARCHIVE — mappa: disegno, righello e forme
//  (js/ui/: i file si caricano in ordine da index.html e condividono le costanti)
// ============================================================

// ---------- MAPPA: disegno, righello e forme ----------
// m.draw = [{ id, k: "free" | "line" | "rect" | "square" | "circle", pts [[x, y]…] (matita), x1, y1, x2, y2, c (colore), by }]
// Coordinate in caselle. Le forme si salvano nella mappa e le vedono tutti; il righello resta solo sul mio schermo.
// by = codice casuale di questo dispositivo (non l'email: le mappe viaggiano sul canale pubblico).
const DRAW_TOOLS = [
  ["move", "✋", "Muovi token e mappa"], ["ruler", "📏", "Righello: trascina per misurare (lo vedi solo tu)"], ["free", "✏", "Matita"],
  ["line", "╱", "Linea con la misura"], ["rect", "▭", "Rettangolo"], ["square", "◻", "Quadrato"], ["circle", "◯", "Cerchio: trascina dal centro"],
  ["erase", "⌫", "Gomma: clicca una forma per cancellarla"],
];
const DRAW_COLORS = ["#ff2a3d", "#f3e600", "#00f0ff", "#3dff9a", "#ff2bd6", "#ffffff"];
tt.tool = "move"; tt.color = ls.get("nc-draw-color", DRAW_COLORS[0]);
let drawCur = null;
const drawMe = () => { let id = ls.get("nc-draw-me", ""); if (!id) { id = NET.uid(); ls.set("nc-draw-me", id); } return id; };
const canDraw = () => Store.canEdit();
const drawMine = s => isGm() || s.by === drawMe();
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
  const title = s.label ? `<title>${esc(s.label)}</title>` : "";
  if (s.k === "free") return `<polyline ${attrs} class="d-free" points="${s.pts.map(([x, y]) => `${P(x)},${P(y)}`).join(" ")}">${title}</polyline>`;
  if (s.k === "line" || s.k === "ruler") return `<g ${attrs} class="d-line ${s.k === "ruler" ? "d-ruler" : ""}"><line x1="${P(s.x1)}" y1="${P(s.y1)}" x2="${P(s.x2)}" y2="${P(s.y2)}"/>
    <circle fill="${c}" cx="${P(s.x1)}" cy="${P(s.y1)}" r="6"/><circle fill="${c}" cx="${P(s.x2)}" cy="${P(s.y2)}" r="6"/>${title}</g>`;
  if (s.k === "circle") return `<circle ${attrs} class="d-area" fill="${c}" cx="${P(s.x1)}" cy="${P(s.y1)}" r="${P(Math.abs(s.x2 - s.x1))}">${title}</circle>`;
  return `<rect ${attrs} class="d-area" fill="${c}" x="${P(Math.min(s.x1, s.x2))}" y="${P(Math.min(s.y1, s.y2))}" width="${P(Math.abs(s.x2 - s.x1))}" height="${P(Math.abs(s.y2 - s.y1))}">${title}</rect>`;
}
// le misure si leggono anche dopo: passando il mouse sulla forma (title) e, per linee e righello, scritte accanto
const shapeTxt = s => (s.k === "line" || s.k === "ruler") && s.label
  ? `<text class="d-txt" x="${s.x2 * CELL + 10}" y="${s.y2 * CELL - 10}">${esc(s.label)}</text>` : "";
function renderDraw() {
  const m = curMap(), box = $("#tt-draw"); if (!m || !box) return;
  const list = m.draw || [];
  const sig = list.length + ":" + (list.length ? list[list.length - 1].id : "") + ":" + JSON.stringify(list).length;
  if (box.dataset.sig !== sig) { box.innerHTML = list.map(s => shapeSvg(s) + shapeTxt(s)).join(""); box.dataset.sig = sig; }
  box.classList.toggle("erasing", tt.tool === "erase");
}
function drawTmp(s) {
  const box = $("#tt-draw-tmp"); if (box) box.innerHTML = s ? shapeSvg({ ...s, c: s.k === "ruler" ? "#f3e600" : tt.color }, true) + shapeTxt(s) : "";
}
function drawLabel(ev, text) {
  const ruler = $("#tt-ruler"), wrap = $("#tt-wrap"); if (!ruler || !wrap) return;
  if (!text) { ruler.hidden = true; return; }
  const wr = wrap.getBoundingClientRect();
  ruler.hidden = false; ruler.textContent = text;
  ruler.style.left = ev.clientX - wr.left + 16 + "px"; ruler.style.top = ev.clientY - wr.top + 12 + "px";
}

// barra degli strumenti sopra la mappa
function drawBarHtml() {
  const draw = canDraw(), m = curMap(), mine = ((m && m.draw) || []).some(drawMine);
  return `${DRAW_TOOLS.filter(([k]) => draw || k === "move" || k === "ruler").map(([k, ic, tip]) => `<button type="button" class="tt-tool ${tt.tool === k ? "on" : ""}" data-action="tt-tool" data-tool="${k}" title="${esc(tip)}" aria-label="${esc(tip)}">${ic}</button>`).join("")}
    ${draw ? `<span class="tt-sep"></span>${DRAW_COLORS.map(c => `<button type="button" class="tt-color ${c === tt.color ? "on" : ""}" data-action="tt-color" data-c="${c}" style="--c:${c}" aria-label="Colore ${c}"></button>`).join("")}
      <span class="tt-sep"></span><button type="button" class="tt-tool" data-action="tt-draw-undo" title="Annulla la mia ultima forma" ${mine ? "" : "disabled"}>↶</button>
      <button type="button" class="tt-tool" data-action="tt-draw-clear" title="${isGm() ? "Cancella tutti i disegni della mappa" : "Cancella i miei disegni"}" ${mine ? "" : "disabled"}>🗑</button>` : ""}`;
}
function renderDrawBar() {
  const bar = $("#tt-drawbar"), wrap = $("#tt-wrap");
  if (bar) bar.innerHTML = drawBarHtml();
  if (wrap) wrap.classList.toggle("drawing", tt.tool !== "move");
  renderDraw();
}
function setTool(k) {
  tt.tool = DRAW_TOOLS.some(t => t[0] === k) ? k : "move";
  drawCur = null; drawTmp(null); drawLabel(null, "");
  renderDrawBar();
}
async function saveDraw(fn) {
  const m = curMap(); if (!m) return;
  // riparto dalla versione più recente della mappa, così non cancello le forme appena aggiunte da altri
  const cur = state.maps.find(x => x.id === m.id) || m;
  await saveMap({ ...cur, draw: fn([...(cur.draw || [])]) });
  renderDrawBar();
}
async function drawUndo() {
  const list = (curMap() || {}).draw || [], me = drawMe();
  let i = -1; for (let k = list.length - 1; k >= 0; k--) if (list[k].by === me || (isGm() && k === list.length - 1)) { i = k; break; }
  if (i >= 0) saveDraw(l => { l.splice(i, 1); return l; });
}
async function drawClear() {
  const gm = isGm(), list = (curMap() || {}).draw || [];
  const n = gm ? list.length : list.filter(drawMine).length; if (!n) return;
  if (!(await askConfirm(gm ? `Cancellare tutti i disegni della mappa (${n})?` : `Cancellare i tuoi disegni (${n})?`))) return;
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
    const el = ev.target.closest && ev.target.closest("[data-shape]"), list = (curMap() || {}).draw || [];
    const s = el ? list.find(x => x.id === el.dataset.shape) : nearShape(list, cellAt(ev));
    if (s && drawMine(s)) saveDraw(l => l.filter(x => x.id !== s.id)); else if (s) toast("Puoi cancellare solo le tue forme", "err");
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
  if (d.k === "free") { const [lx, ly] = d.pts[d.pts.length - 1]; if (Math.hypot(p.x - lx, p.y - ly) > 0.12) d.pts.push([p.x, p.y]); }
  const s = drawShape(d.k, d.a, p, d.pts);
  drawTmp(s); drawLabel(ev, s.label || "");
  return true;
}
function drawUp(ev, cancel) {
  if (!drawCur) return false;
  const d = drawCur; drawCur = null;
  if (d.k === "ruler") { drawLabel(ev, ""); return true; }   // il righello resta disegnato finché non ne tracci un altro
  drawTmp(null); drawLabel(ev, "");
  if (cancel) return true;
  const s = drawShape(d.k, d.a, d.b, d.pts);
  const empty = d.k === "free" ? s.pts.length < 2 : d.k === "circle" ? !s.n : d.k === "line" ? s.x1 === s.x2 && s.y1 === s.y2 : !s.n;
  if (empty) return true;
  // la matita tiene al massimo 400 punti
  if (s.pts && s.pts.length > 400) { const step = Math.ceil(s.pts.length / 400); s.pts = s.pts.filter((_, i) => i % step === 0 || i === s.pts.length - 1); }
  saveDraw(l => [...l, { ...s, id: NET.uid(), c: tt.color, by: drawMe() }]);
  return true;
}
