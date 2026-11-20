// ============================================================
//  NIGHT CITY ARCHIVE — costanti, stato, utilità, dati, menu, routing, Home, Database
//  (js/ui/: i file si caricano in ordine da index.html e condividono le costanti)
// ============================================================

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = v => String(v ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const norm = v => String(v ?? "").trim().toLowerCase();
const CFG = window.SITE_CONFIG || {};

// ---------- costanti di gioco (modificabili) ----------
const KINDS = [
  { id: "pg",      label: "PG",      plural: "Party",   color: "var(--green)" },
  { id: "npc",     label: "NPC",     plural: "NPC",     color: "var(--cyan)" },
  { id: "fazione", label: "Fazione", plural: "Fazioni", color: "var(--red)" },
  { id: "luogo",   label: "Luogo",   plural: "Luoghi",  color: "var(--yellow)" },
  { id: "oggetto", label: "Oggetto", plural: "Oggetti", color: "var(--magenta)" },
  { id: "nemico",  label: "Nemico",  plural: "Nemici",  color: "#ff8a3d" },   // scheda semplificata, solo GM
];
const ROLES = ["Rockerboy", "Solo", "Netrunner", "Tech", "Medtech", "Media", "Exec", "Lawman", "Fixer", "Nomad", "Civile", "Boostergang", "Corpo"];
const STATUSES = [
  { id: "vivo", label: "Vivo" },
  { id: "morto", label: "Flatlined" },
  { id: "disperso", label: "Disperso" },
  { id: "sconosciuto", label: "Sconosciuto" },
];
const ATTITUDES = ["Alleato", "Amichevole", "Neutrale", "Diffidente", "Ostile", "Nemesi"];
const EVENT_TYPES = [
  { id: "storia",        label: "Storia",        color: "var(--cyan)" },
  { id: "gig",           label: "Gig",           color: "var(--yellow)" },
  { id: "combattimento", label: "Combattimento", color: "var(--red)" },
  { id: "incontro",      label: "Incontro",      color: "var(--green)" },
  { id: "viaggio",       label: "Viaggio",       color: "var(--magenta)" },
  { id: "altro",         label: "Altro",         color: "var(--muted)" },
];
// Condizioni meteo ispirate al DLC gratuito "Night City Weather" di R. Talsorian.
// Icone SVG 24x24 disegnate a linee (usano currentColor = colore della condizione).
const TEMP_UNIT = "°C";
const RAIN_CLOUD = `<path d="M7 14h10a4 4 0 0 0 .5-7.97A6 6 0 0 0 6.1 7.2 3.5 3.5 0 0 0 7 14z"/>`;
const WEATHER = [
  { id: "sereno",      label: "Sereno",            color: "var(--yellow)",
    svg: `<circle cx="12" cy="12" r="4"/><path d="M12 2v2.5M12 19.5V22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M2 12h2.5M19.5 12H22M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8"/>` },
  { id: "nuvoloso",    label: "Nuvoloso",          color: "#9aa3c7",
    svg: `<path d="M7 19h10a4 4 0 0 0 .5-7.97A6 6 0 0 0 6.1 12.2 3.5 3.5 0 0 0 7 19z"/><path d="M15 6.5a4 4 0 0 1 5.5 4"/>` },
  { id: "nebbia",      label: "Nebbia",            color: "#b8bcd6",
    svg: `<path d="M3 7h13M6 11h15M3 15h15M7 19h11"/>` },
  { id: "pioggia",     label: "Pioggia",           color: "var(--cyan)",
    svg: `${RAIN_CLOUD}<path d="M8 17l-1 3M12 17l-1 3M16 17l-1 3"/>` },
  { id: "acida",       label: "Pioggia acida",     color: "var(--green)",
    svg: `${RAIN_CLOUD}<path d="M8 17l-1 3M16 17l-1 3"/><path d="M12 16.5c-1.2 1.8-1.6 2.7-1.6 3.4a1.6 1.6 0 0 0 3.2 0c0-.7-.4-1.6-1.6-3.4z" fill="currentColor"/>` },
  { id: "temporale",   label: "Temporale",         color: "#c9a0ff",
    svg: `${RAIN_CLOUD}<path d="M13 13.5l-3 4.5h4l-2.5 4" stroke-width="2.2"/>` },
  { id: "smog",        label: "Smog",              color: "#c79a6b",
    svg: `<path d="M2 21h20M4 21v-8l4 2.5V13l4 2.5V10h3v11"/><circle cx="16.5" cy="6" r="2"/><circle cx="20" cy="4.5" r="1.4"/><circle cx="13.5" cy="3.5" r="1.2"/>` },
  { id: "caldo",       label: "Ondata di calore",  color: "var(--red)",
    svg: `<path d="M9 14V5a2 2 0 1 1 4 0v9a4 4 0 1 1-4 0z"/><path d="M11 9v7"/><path d="M17 4.5l2-1M17.5 8.5H20M17 12.5l2 1"/>` },
  { id: "gelo",        label: "Gelo",              color: "#8fe9ff",
    svg: `<path d="M12 2v20M3.3 7l17.4 10M20.7 7L3.3 17"/><path d="M9.5 3.8L12 5.6l2.5-1.8M9.5 20.2l2.5-1.8 2.5 1.8"/>` },
  { id: "vento",       label: "Vento forte",       color: "#7fd4ff",
    svg: `<path d="M3 8h10.5a2.75 2.75 0 1 0-2.6-3.6M3 12.5h15a3 3 0 1 1-2.8 4M3 16.5h7"/>` },
  { id: "polvere",     label: "Tempesta di polvere", color: "#e3a35c",
    svg: `<path d="M3 8.5h11a2.75 2.75 0 1 0-2.6-3.6M3 13h14"/><circle cx="6" cy="17.5" r=".9" fill="currentColor"/><circle cx="11" cy="19" r=".9" fill="currentColor"/><circle cx="16" cy="17.5" r=".9" fill="currentColor"/><circle cx="20" cy="12" r=".9" fill="currentColor"/>` },
  { id: "cenere",      label: "Tempesta di cenere", color: "#a8a8a8",
    svg: `${RAIN_CLOUD}<circle cx="8" cy="17.5" r="1" fill="currentColor"/><circle cx="12" cy="20.5" r="1" fill="currentColor"/><circle cx="16" cy="17.5" r="1" fill="currentColor"/><circle cx="10" cy="22" r=".7" fill="#ff8a3d" stroke="#ff8a3d"/>` },
  { id: "sangue",      label: "Pioggia di sangue", color: "#ff3b5c",
    svg: `${RAIN_CLOUD}<path d="M8 16.5c-1 1.5-1.4 2.3-1.4 2.9a1.4 1.4 0 0 0 2.8 0c0-.6-.4-1.4-1.4-2.9zM16 16.5c-1 1.5-1.4 2.3-1.4 2.9a1.4 1.4 0 0 0 2.8 0c0-.6-.4-1.4-1.4-2.9z" fill="currentColor"/><path d="M12 18l-.6 2.5"/>` },
  { id: "radioattivo", label: "Vento radioattivo", color: "#d6ff3b",
    svg: `<circle cx="12" cy="12" r="1.7" fill="currentColor"/><g fill="currentColor" stroke="none"><path d="M10.6 9.6L7.9 4.9a8 8 0 0 1 8.2 0l-2.7 4.7a2.6 2.6 0 0 0-2.8 0z"/><path d="M10.6 9.6L7.9 4.9a8 8 0 0 1 8.2 0l-2.7 4.7a2.6 2.6 0 0 0-2.8 0z" transform="rotate(120 12 12)"/><path d="M10.6 9.6L7.9 4.9a8 8 0 0 1 8.2 0l-2.7 4.7a2.6 2.6 0 0 0-2.8 0z" transform="rotate(240 12 12)"/></g><circle cx="12" cy="12" r="10.5" stroke-dasharray="2 3"/>` },
];
const wxOf = id => WEATHER.find(w => w.id === id);
const wxIcon = (id, cls = "wx-ic") => {
  const w = wxOf(id); if (!w) return "";
  return `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="color:${w.color}" aria-hidden="true">${w.svg}</svg>`;
};
const fmtTemp = t => (t === null || t === undefined || t === "") ? "" : `${Math.round(t)}${TEMP_UNIT}`;

const NOTE_CATEGORIES =["Sessione", "Lore", "Indizi", "Gig", "Regole", "Bottino", "Personale"];
const MONTHS = ["Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno", "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"];
const WDAYS = ["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"];
const WDAYS_LONG = ["Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato", "Domenica"];
const START_YEAR = 2045, END_YEAR = 2099;

const kindOf = id => KINDS.find(k => k.id === id) || KINDS[0];
const statusOf = id => STATUSES.find(s => s.id === id);
const evType = id => EVENT_TYPES.find(t => t.id === id) || EVENT_TYPES[0];

// ---------- date ----------
const pad = n => String(n).padStart(2, "0");
const ymd = (y, m, d) => `${y}-${pad(m)}-${pad(d)}`;
const parseYmd = s => {
  const r = /^(\d{4})-(\d{2})(?:-(\d{2}))?$/.exec(s || "");
  return r ? { y: +r[1], m: +r[2], d: r[3] ? +r[3] : null } : null;
};
const daysIn = (y, m) => new Date(Date.UTC(y, m, 0)).getUTCDate();
const wday = (y, m, d) => (new Date(Date.UTC(y, m - 1, d)).getUTCDay() + 6) % 7; // 0 = lunedì
const fmtDate = s => { const p = parseYmd(s); return p && p.d ? `${p.d} ${MONTHS[p.m - 1]} ${p.y}` : esc(s); };
const addDays = (s, n) => {
  const p = parseYmd(s), dt = new Date(Date.UTC(p.y, p.m - 1, p.d + n));
  return ymd(dt.getUTCFullYear(), dt.getUTCMonth() + 1, dt.getUTCDate());
};
const validDay = s => { const p = parseYmd(s); return !!(p && p.d && p.y >= START_YEAR && p.y <= END_YEAR && p.m >= 1 && p.m <= 12 && p.d <= daysIn(p.y, p.m)); };
const fmtStamp = iso => { try { return new Date(iso).toLocaleDateString("it-IT", { day: "numeric", month: "short", year: "numeric" }); } catch { return ""; } };

// ---------- stato ----------
const state = {
  entries: [], songs: [], notes: [], events: [], weather: [], diary: [], quests: [], site: null,
  maps: [], tokens: [], rolls: [], gmnotes: [], netarch: [], netview: [],
  filter: { q: "", kind: "all", faction: "", status: "", sort: "name" },
  noteQ: "", diaryQ: "", cal: null,
};
const ls = {
  get(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
};
Object.assign(state.filter, ls.get("nc-filter", {}), { q: "" });
state.cal = ls.get("nc-cal", null);
const saveFilter = () => ls.set("nc-filter", state.filter);

const site = () => ({ title: CFG.title || "NIGHT CITY ARCHIVE", tagline: CFG.tagline || "", intro: "", campaignDate: "", ...(state.site || {}) });
const imagesOf = e => Array.isArray(e.images) && e.images.length ? e.images : (e.image ? [e.image] : []);

// ---------- util ----------
function toast(msg, type = "") {
  const t = document.createElement("div");
  t.className = "toast " + type; t.textContent = msg;
  $("#toasts").appendChild(t);
  setTimeout(() => t.remove(), type === "err" ? 6000 : 3000);
}
const fail = e => { console.error(e); toast("ERRORE: " + (e.message || e), "err"); };

async function hydrate(root = document) {
  for (const el of $$("[data-ref]", root)) {
    const ref = el.dataset.ref; el.removeAttribute("data-ref");
    try { const url = await Store.resolve(ref); if (url) el.src = url; } catch {}
  }
}
const imgTag = (ref, alt = "") => ref ? `<img data-ref="${esc(ref)}" alt="${esc(alt)}" loading="lazy">` : "";

async function processImage(file) {
  if (!/^image\/(jpeg|png|webp|bmp)$/.test(file.type)) return file;
  try {
    const bmp = await createImageBitmap(file);
    const max = 1400, scale = Math.min(1, max / Math.max(bmp.width, bmp.height));
    if (scale === 1 && file.size < 500 * 1024) return file;
    const c = document.createElement("canvas");
    c.width = Math.round(bmp.width * scale); c.height = Math.round(bmp.height * scale);
    const ctx = c.getContext("2d");
    ctx.fillStyle = "#0a0a0f"; ctx.fillRect(0, 0, c.width, c.height);
    ctx.drawImage(bmp, 0, 0, c.width, c.height);
    return await new Promise(r => c.toBlob(b => r(b || file), "image/jpeg", 0.86));
  } catch { return file; }
}

function sunoEmbed(url) {
  const m = String(url || "").match(/suno\.(?:com|ai)\/(?:song|embed)\/([0-9a-f-]{36})/i);
  return m ? `https://suno.com/embed/${m[1]}` : null;
}

// trova la scheda per nome o per alias (campo alias, anche più alias separati da virgola)
const findEntry = name => { const n = norm(name); return state.entries.find(e => norm(e.name) === n) || state.entries.find(e => String(e.handle || "").split(/[,/]/).some(a => a.trim() && norm(a) === n)); };
const factionEntry = name => state.entries.find(e => e.kind === "fazione" && norm(e.name) === norm(name));
const factions = () => {
  const set = new Map();
  for (const e of state.entries) {
    if (e.faction) set.set(norm(e.faction), e.faction.trim());
    if (e.kind === "fazione" && e.name) set.set(norm(e.name), e.name.trim());
  }
  return [...set.values()].sort((a, b) => a.localeCompare(b, "it"));
};
const splitList = s => String(s || "").split(",").map(t => t.trim()).filter(Boolean);
const upsert = (arr, rec) => { const i = arr.findIndex(x => x.id === rec.id); if (i >= 0) arr[i] = rec; else arr.push(rec); };
const peopleLinks = list => list.map(n => { const e = findEntry(n); return e ? `<a href="#/database/${esc(e.id)}">${esc(n)}</a>` : esc(n); }).join(", ");

// ---------- GM ----------
// Le cose "solo GM" (gmOnly) le legge solo chi è nella tabella gm_users: il database non le manda agli altri.
const isGm = () => Store.isGm;
const gmBadge = r => r && r.gmOnly ? `<span class="badge gm" title="Visibile solo ai GM">🔒 SOLO GM</span>` : "";
const gmCheck = (on, label = "Solo GM: i giocatori non lo vedono") => isGm()
  ? `<label class="check field full gm-check"><input type="checkbox" name="gmOnly" ${on ? "checked" : ""}> 🔒 ${esc(label)}</label>` : "";
// in tempo reale le righe segrete non viaggiano sul canale (che è pubblico): mando solo un avviso con l'id,
// e i GM la rileggono dal database
function liveSend(col, rec) { Store.send(rec.gmOnly ? { t: "gm", col, id: rec.id } : { t: "rec", col, rec }); }
const gmNoteOf = id => state.gmnotes.find(n => n.entryId === id);

// ---------- dati ----------
async function loadAll() {
  const [entries, songs, meta, notes, events, weather, diary, quests] = await Promise.all(
    ["entries", "songs", "meta", "notes", "events", "weather", "diary", "quests"].map(c => Store.list(c)));
  Object.assign(state, { entries, songs, notes, events, weather, diary, quests });
  state.site = meta.find(m => m.id === "site") || null;
  state.rules = meta.find(m => m.id === "rules") || null;
  state.nethb = meta.find(m => m.id === "nethb") || null; NET.setHomebrew(state.nethb);
  state.cyberhb = meta.find(m => m.id === "cyberhb") || null; CW.setHomebrew(state.cyberhb);
  state.markethb = meta.find(m => m.id === "markethb") || null; MK.setHomebrew(state.markethb);
  state.market = meta.find(m => m.id === "market") || null;
  // tavolo di gioco: se qualcosa va storto qui, il resto del sito funziona lo stesso
  try {
    const [maps, tokens, rolls] = await Promise.all([Store.list("maps"), Store.list("tokens"), Store.list("rolls", { limit: 100 })]);
    Object.assign(state, { maps, tokens, rolls }); sortRolls();
  } catch (e) { console.warn("tavolo", e); }
  try { state.gmnotes = isGm() ? await Store.list("gmnotes") : []; } catch (e) { state.gmnotes = []; console.warn("gm", e); }
  try { state.mapgm = isGm() ? await Store.list("mapgm") : []; } catch (e) { state.mapgm = []; console.warn("mapgm", e); }
  // NET: le architetture sono del GM, le copie pubbliche (solo i piani rivelati) le vedono tutti
  try { state.netview = await Store.list("netview"); state.netarch = isGm() ? await Store.list("netarch") : []; } catch (e) { state.netview = state.netview || []; state.netarch = []; console.warn("net", e); }
}
async function saveSite(patch) {
  state.site = await Store.save("meta", { ...(state.site || {}), id: "site", ...patch });
}

// ---------- chrome ----------
function renderChrome() {
  const s = site();
  const b = $("#brand-title");
  b.textContent = s.title; b.dataset.text = s.title;
  document.title = s.title;
  const pill = $("#mode-pill");
  if (Store.mode === "local") { pill.textContent = "● LOCALE"; pill.className = "mode-pill"; pill.title = "Dati salvati solo in questo browser"; }
  else if (Store.canEdit()) { pill.textContent = (isGm() ? "● GM · " : "● EDIT · ") + Store.user; pill.className = "mode-pill edit" + (isGm() ? " gm" : ""); pill.title = isGm() ? "Connesso come GM: vedi anche le cose segrete" : "Connesso: puoi modificare"; }
  else { pill.textContent = "● CLOUD · sola lettura"; pill.className = "mode-pill cloud"; pill.title = "Accedi da ⚙ per modificare"; }
  const navGm = $("#nav-gm"); if (navGm) navGm.hidden = !isGm();
  $("#footer-status").textContent = `${state.entries.length} record · ${state.diary.length} scene · ${state.events.length} eventi · ${state.notes.length} appunti · ${state.songs.length} tracce`;
  renderSideMenu(); fitNav();
}

// ---------- menu laterale ----------
// Le voci sono le stesse della barra in alto (GM compresa solo per i GM), con un'icona e una riga di spiegazione.
const MENU_INFO = {
  home: ["⌂", "Pagina iniziale"], database: ["▤", "PG, NPC, fazioni, luoghi"], diario: ["✎", "Cronaca e quest"],
  calendario: ["▦", "Eventi e meteo"], appunti: ["✉", "Note della campagna"], tracce: ["♫", "Colonna sonora"],
  party: ["◈", "Schede dei PG"], mappa: ["⬡", "Mappa, token e iniziativa"], net: ["⌬", "Architetture di Rete"], glossario: ["❖", "Negozio: armi, cyberware, regole"], gm: ["🔒", "Solo per i GM"],
};
function renderSideMenu() {
  const box = $("#side-nav"); if (!box) return;
  const page = location.hash.replace(/^#\/?/, "").split("/")[0] || "home";
  const cur = page === "quest" ? "diario" : page;
  box.innerHTML = $$("#nav a").filter(a => !a.hidden).map(a => {
    const r = a.dataset.route, [ic, sub] = MENU_INFO[r] || ["›", ""];
    return `<a href="${esc(a.getAttribute("href"))}" class="${r === cur ? "active" : ""} ${r === "gm" ? "gm" : ""}" data-route="${esc(r)}" ${r === cur ? `aria-current="page"` : ""}>
      <span class="side-ic" aria-hidden="true">${ic}</span><span class="side-l">${esc(a.textContent)}<small>${esc(sub)}</small></span></a>`;
  }).join("");
}
function openMenu() {
  const m = $("#side-menu"); if (!m) return;
  renderSideMenu();
  m.hidden = false; $("#side-backdrop").hidden = false;
  void m.offsetWidth;   // forzo il layout così la transizione parte subito (anche senza animation frame)
  m.classList.add("open"); $("#side-backdrop").classList.add("open");
  $("#menu-btn").setAttribute("aria-expanded", "true");
  const first = $("#side-nav a.active") || $("#side-nav a"); first && first.focus();
}
function closeMenu() {
  const m = $("#side-menu"); if (!m || m.hidden) return;
  m.classList.remove("open"); $("#side-backdrop").classList.remove("open");
  $("#menu-btn").setAttribute("aria-expanded", "false");
  setTimeout(() => { if (!m.classList.contains("open")) { m.hidden = true; $("#side-backdrop").hidden = true; } }, 200);
}
// la barra in alto resta solo se tutte le voci ci stanno; altrimenti si usa il menu ☰
function fitNav() {
  const bar = $(".topbar"), nav = $("#nav"); if (!bar || !nav) return;
  bar.classList.remove("nav-collapsed");
  if (nav.scrollWidth > nav.clientWidth + 2) bar.classList.add("nav-collapsed");
}
window.addEventListener("resize", () => { fitNav(); });
document.addEventListener("keydown", ev => { if (ev.key === "Escape" && !$("#side-menu").hidden) { closeMenu(); $("#menu-btn").focus(); } });
// scelta una voce (o Dice log / Impostazioni), il menu si chiude
$("#side-menu") && $("#side-menu").addEventListener("click", ev => { if (ev.target.closest("#side-nav a, .side-foot [data-action]")) closeMenu(); });
if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitNav);   // i font cambiano la larghezza delle voci

// ---------- routing ----------
let lastView = "";
function route() {
  const [page = "home", arg] = location.hash.replace(/^#\/?/, "").split("/");
  $$("#nav a").forEach(a => a.classList.toggle("active", a.dataset.route === (page === "quest" ? "diario" : page)));
  const app = $("#app");
  let viewKey = page;
  if (page === "database") app.innerHTML = viewDatabase();
  else if (page === "tracce") app.innerHTML = viewSongs();
  else if (page === "appunti") app.innerHTML = viewNotes();
  else if (page === "diario") {
    if (arg && !state.diary.some(x => x.id === arg)) { location.replace("#/diario"); return; }
    app.innerHTML = arg ? viewScene(arg) : viewDiary();
    viewKey = location.hash;
  }
  else if (page === "quest") {
    if (arg && !questById(arg)) { location.replace("#/quest"); return; }
    app.innerHTML = arg ? viewQuest(arg) : viewQuests();
    viewKey = location.hash;
  }
  else if (page === "calendario") {
    const p = parseYmd(arg);
    if (p && p.d) {
      if (!validDay(arg)) { location.replace("#/calendario"); return; }
      app.innerHTML = viewDay(arg);
    } else app.innerHTML = viewMonth(p);
    viewKey = location.hash;
  }
  else if (page === "tavolo") { location.replace("#/mappa"); return; }   // vecchio indirizzo
  else if (page === "mappa") app.innerHTML = viewTable();
  else if (page === "party") app.innerHTML = viewParty();
  else if (page === "net") app.innerHTML = viewNet();
  else if (page === "glossario") app.innerHTML = viewGlossary();
  else if (page === "gm") {
    if (!isGm()) { location.replace("#/home"); return; }
    app.innerHTML = viewGm();
  }
  else app.innerHTML = viewHome();
  app.classList.toggle("wide", page === "mappa");
  hydrate(app);
  bindPage(page);
  if (page === "database" && arg) openEntry(arg);
  if (page === "appunti" && arg) openNote(arg);
  if (page === "net") drawArchLinks(app);
  if (viewKey !== lastView) { window.scrollTo(0, 0); lastView = viewKey; }
  renderChrome();
}

// ---------- HOME ----------
function viewHome() {
  const s = site();
  const npcs = state.entries.filter(e => e.kind === "npc");
  const recent = [...state.entries].sort((a, b) => (b.updatedAt || "").localeCompare(a.updatedAt || "")).slice(0, 6);
  const songs = [...state.songs].sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || "")).slice(0, 3);
  const events = [...state.events].sort((a, b) => (b.date + (b.time || "")).localeCompare(a.date + (a.time || ""))).slice(0, 4);
  return `
    <section class="hero">
      <h1 class="glitch" data-text="${esc(s.title)}">${esc(s.title)}</h1>
      ${s.tagline ? `<p class="tagline">${esc(s.tagline)}</p>` : ""}
      ${s.campaignDate && validDay(s.campaignDate) ? (() => { const w = wxOn(s.campaignDate); return `<a class="game-date" href="#/calendario/${esc(s.campaignDate)}">◉ DATA IN GIOCO · ${fmtDate(s.campaignDate)}${w ? ` · ${wxIcon(w.type)} ${esc(wxOf(w.type).label)}${w.temp != null && w.temp !== "" ? " " + fmtTemp(w.temp) : ""}` : ""}</a>`; })() : ""}
      ${s.intro ? `<p class="intro">${esc(s.intro)}</p>` : ""}
      <div class="cta">
        <a class="btn" href="#/database">Apri il database</a>
        <a class="btn yellow ghost" href="#/diario">Leggi il diario</a>
        <a class="btn yellow ghost" href="#/calendario">Calendario</a>
        <a class="btn cyan ghost" href="#/tracce">Ascolta le tracce</a>
      </div>
    </section>
    <section class="stats">
      <a class="stat" href="#/database" style="--c:var(--cyan)"><div class="n">${npcs.length}</div><div class="l">NPC schedati</div></a>
      <a class="stat" href="#/database" style="--c:var(--red)"><div class="n">${factions().length}</div><div class="l">Fazioni note</div></a>
      <a class="stat" href="#/calendario" style="--c:var(--yellow)"><div class="n">${state.events.length}</div><div class="l">Eventi</div></a>
      <a class="stat" href="#/diario" style="--c:var(--magenta)"><div class="n">${state.diary.length}</div><div class="l">Scene di diario</div></a>
      <a class="stat" href="#/quest" style="--c:var(--yellow)"><div class="n">${state.quests.filter(q => qStatus(q.status).id === "in-corso").length}</div><div class="l">Quest in corso</div></a>
      <a class="stat" href="#/appunti" style="--c:var(--green)"><div class="n">${state.notes.length}</div><div class="l">Appunti</div></a>
      <a class="stat" href="#/tracce" style="--c:var(--magenta)"><div class="n">${state.songs.length}</div><div class="l">Tracce</div></a>
      <div class="stat" style="--c:var(--muted)"><div class="n">${state.entries.filter(e => isPerson(e) && e.status === "morto").length}</div><div class="l">Flatlined</div></div>
    </section>
    <div class="section-title"><h2>Ultimi aggiornamenti</h2><a class="see-all" href="#/database">tutto il database →</a></div>
    ${recent.length ? `<div class="grid">${recent.map(cardEntry).join("")}</div>` : emptyDb()}
    ${events.length ? `
      <div class="section-title" style="margin-top:34px"><h2>Cronologia recente</h2><a class="see-all" href="#/calendario">calendario →</a></div>
      <div class="timeline">${events.map(timelineItem).join("")}</div>` : ""}
    ${songs.length ? `
      <div class="section-title" style="margin-top:34px"><h2>Ultime tracce</h2><a class="see-all" href="#/tracce">tutte le tracce →</a></div>
      <div class="tracks">${songs.map((s, i) => cardSong(s, i)).join("")}</div>` : ""}
  `;
}

function timelineItem(ev) {
  const t = evType(ev.type);
  return `<a class="tl-item" href="#/calendario/${esc(ev.date)}" style="--c:${t.color}">
    <span class="tl-date">${fmtDate(ev.date)}${ev.time ? " · " + esc(ev.time) : ""}</span>
    <span class="tl-title">${esc(ev.title)}</span>
    <span class="tl-type">${esc(t.label)}</span></a>`;
}

function emptyDb() {
  return `<div class="empty"><div class="big">// NESSUN DOSSIER</div>Il database è vuoto.
    ${Store.canEdit() ? `<br><button class="btn" data-action="new-entry">+ Crea il primo record</button>` : ""}</div>`;
}

// ---------- DATABASE ----------
function filteredEntries() {
  const f = state.filter, q = norm(f.q);
  let list = state.entries.filter(e =>
    (f.kind === "all" || e.kind === f.kind) &&
    (!f.faction || norm(e.faction) === norm(f.faction) || (e.kind === "fazione" && norm(e.name) === norm(f.faction))) &&
    (!f.status || e.status === f.status) &&
    (!q || [e.name, e.handle, e.faction, e.role, e.location, e.description, e.notes, (e.tags || []).join(" "),
            ...(e.custom || []).map(c => c.k + " " + c.v)].some(v => norm(v).includes(q)))
  );
  if (f.sort === "recent") list.sort((a, b) => (b.updatedAt || "").localeCompare(a.updatedAt || ""));
  else if (f.sort === "faction") list.sort((a, b) => (a.faction || "~").localeCompare(b.faction || "~", "it") || (a.name || "").localeCompare(b.name || "", "it"));
  else list.sort((a, b) => (a.name || "").localeCompare(b.name || "", "it"));
  return list;
}

function viewDatabase() {
  const f = state.filter;
  const count = k => k === "all" ? state.entries.length : state.entries.filter(e => e.kind === k).length;
  return `
    <div class="page-head">
      <div><div class="kicker">// NCPD_LEAKED_DB</div><h1>Database</h1><p>NPC, fazioni, luoghi e oggetti della campagna.</p></div>
      ${Store.canEdit() ? `<button class="btn" data-action="new-entry">+ Nuovo record</button>` : ""}
    </div>
    <div class="toolbar">
      <div class="chips" id="kind-chips">
        ${[{ id: "all", plural: "Tutti" }, ...KINDS.filter(k => k.id !== "nemico" || isGm())].map(k => `<button class="chip ${f.kind === k.id ? "active" : ""}" data-kind="${k.id}">${esc(k.plural)}<span class="count">${count(k.id)}</span></button>`).join("")}
      </div>
      <input class="search" id="q" type="search" placeholder="> cerca nome, alias, tag, note…" value="${esc(f.q)}">
      <select id="f-faction" aria-label="Fazione"><option value="">Tutte le fazioni</option>
        ${factions().map(x => `<option ${norm(x) === norm(f.faction) ? "selected" : ""}>${esc(x)}</option>`).join("")}</select>
      <select id="f-status" aria-label="Stato"><option value="">Ogni stato</option>
        ${STATUSES.map(s => `<option value="${s.id}" ${f.status === s.id ? "selected" : ""}>${s.label}</option>`).join("")}</select>
      <select id="f-sort" aria-label="Ordina">
        <option value="name" ${f.sort === "name" ? "selected" : ""}>A → Z</option>
        <option value="recent" ${f.sort === "recent" ? "selected" : ""}>Più recenti</option>
        <option value="faction" ${f.sort === "faction" ? "selected" : ""}>Per fazione</option>
      </select>
    </div>
    <div id="db-results">${resultsHtml()}</div>`;
}

function resultsHtml() {
  const list = filteredEntries();
  if (!state.entries.length) return emptyDb();
  if (!list.length) return `<div class="empty"><div class="big">// NESSUN RISULTATO</div>Prova a cambiare i filtri.</div>`;
  return `<div class="grid">${list.map(cardEntry).join("")}</div>`;
}
function refreshResults() {
  const box = $("#db-results"); if (!box) return;
  box.innerHTML = resultsHtml(); hydrate(box);
}

function cardEntry(e) {
  const k = kindOf(e.kind), st = statusOf(e.status), imgs = imagesOf(e);
  return `
    <button class="card ${e.status === "morto" ? "is-dead" : ""} ${e.gmOnly ? "is-gm" : ""}" data-action="open-entry" data-id="${esc(e.id)}">
      <div class="card-img">
        ${imgs.length ? imgTag(imgs[0], e.name) : `<div class="noimg"><span>NO SIGNAL</span></div>`}
        <span class="kind-tag" style="--k:${k.color}">${esc(k.label)}</span>
        ${imgs.length > 1 ? `<span class="img-count">▣ ${imgs.length}</span>` : ""}
      </div>
      <div class="card-body">
        <h3>${esc(e.name || "Senza nome")}</h3>
        ${e.handle ? `<div class="handle">“${esc(e.handle)}”</div>` : ""}
        <div class="meta">
          ${gmBadge(e)}
          ${e.faction ? `<span class="badge faction">${esc(e.faction)}</span>` : ""}
          ${e.role ? `<span class="badge">${esc(e.role)}</span>` : ""}
          ${st && isPerson(e) ? `<span class="status s-${st.id}">${esc(st.label)}</span>` : ""}
          ${cyberCount(e) ? `<span class="badge cyber" title="Cyberware installato">◈ ${cyberCount(e)}</span>` : ""}
        </div>
      </div>
    </button>`;
}

// ---------- carosello immagini ----------
function carouselHtml(imgs, name) {
  if (!imgs.length) return `<div class="carousel empty-car"><div class="noimg"><span>NO SIGNAL</span></div></div>`;
  const multi = imgs.length > 1;
  return `
    <div class="carousel" data-i="0" data-n="${imgs.length}">
      <div class="car-stage" data-action="zoom" title="Clicca per ingrandire">
        ${imgs.map((r, i) => `<img class="car-slide ${i === 0 ? "active" : ""}" data-ref="${esc(r)}" alt="${esc(name)} — immagine ${i + 1}">`).join("")}
        ${multi ? `
          <button type="button" class="car-btn prev" data-action="car-step" data-d="-1" aria-label="Immagine precedente"><span>‹</span></button>
          <button type="button" class="car-btn next" data-action="car-step" data-d="1" aria-label="Immagine successiva"><span>›</span></button>
          <span class="car-count">IMG <b>01</b> / ${pad(imgs.length)}</span>` : ""}
      </div>
      ${multi ? `<div class="car-thumbs">${imgs.map((r, i) => `<button type="button" class="car-thumb ${i === 0 ? "active" : ""}" data-action="car-go" data-i="${i}" aria-label="Immagine ${i + 1}">${imgTag(r)}</button>`).join("")}</div>` : ""}
    </div>`;
}

function carGo(car, i) {
  const n = +car.dataset.n; if (n < 2) return;
  i = ((i % n) + n) % n;
  car.dataset.i = i;
  $$(".car-slide", car).forEach((s, j) => {
    s.classList.toggle("active", j === i);
    if (j === i) { s.classList.remove("glitch-in"); void s.offsetWidth; s.classList.add("glitch-in"); }
  });
  $$(".car-thumb", car).forEach((t, j) => t.classList.toggle("active", j === i));
  const thumb = $$(".car-thumb", car)[i]; thumb && thumb.scrollIntoView({ block: "nearest", inline: "nearest" });
  const c = $(".car-count b", car); if (c) c.textContent = pad(i + 1);
}

function bindSwipe(el, onStep) {
  let x0 = null;
  el.addEventListener("touchstart", ev => { x0 = ev.touches[0].clientX; }, { passive: true });
  el.addEventListener("touchend", ev => {
    if (x0 == null) return;
    const dx = ev.changedTouches[0].clientX - x0; x0 = null;
    if (Math.abs(dx) > 40) onStep(dx < 0 ? 1 : -1);
  });
}

// lightbox a schermo intero con frecce
let lightbox = null;
function openLightbox(srcs, i) {
  closeLightbox();
  const lb = document.createElement("div");
  lb.className = "lightbox";
  lb.innerHTML = `
    <img alt="">
    ${srcs.length > 1 ? `<button class="car-btn prev" data-lb="-1" aria-label="Precedente"><span>‹</span></button>
    <button class="car-btn next" data-lb="1" aria-label="Successiva"><span>›</span></button>
    <span class="car-count lb-count"></span>` : ""}
    <button class="lb-close" aria-label="Chiudi">×</button>`;
  const show = j => {
    lightbox.i = ((j % srcs.length) + srcs.length) % srcs.length;
    const img = $("img", lb); img.src = srcs[lightbox.i];
    img.classList.remove("glitch-in"); void img.offsetWidth; img.classList.add("glitch-in");
    const c = $(".lb-count", lb); if (c) c.innerHTML = `IMG <b>${pad(lightbox.i + 1)}</b> / ${pad(srcs.length)}`;
  };
  lb.addEventListener("click", ev => {
    const b = ev.target.closest("[data-lb]");
    if (b) { ev.stopPropagation(); show(lightbox.i + +b.dataset.lb); return; }
    if (ev.target.tagName !== "IMG") closeLightbox();
  });
  bindSwipe(lb, d => show(lightbox.i + d));
  lightbox = { el: lb, show, i };
  ($("#modal").open ? $("#modal") : document.body).appendChild(lb);
  show(i);
}
function closeLightbox() { if (lightbox) { lightbox.el.remove(); lightbox = null; } }
