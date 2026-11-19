// ============================================================
//  NIGHT CITY ARCHIVE — interfaccia
// ============================================================
(() => {
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
    // tavolo di gioco: se qualcosa va storto qui, il resto del sito funziona lo stesso
    try {
      const [maps, tokens, rolls] = await Promise.all([Store.list("maps"), Store.list("tokens"), Store.list("rolls", { limit: 100 })]);
      Object.assign(state, { maps, tokens, rolls }); sortRolls();
    } catch (e) { console.warn("tavolo", e); }
    try { state.gmnotes = isGm() ? await Store.list("gmnotes") : []; } catch (e) { state.gmnotes = []; console.warn("gm", e); }
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
    party: ["◈", "Schede dei PG"], mappa: ["⬡", "Mappa, token e iniziativa"], net: ["⌬", "Architetture di Rete"], glossario: ["❖", "Cyberware, armi, regole"], gm: ["🔒", "Solo per i GM"],
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

  // ---------- CYBERWARE & EQUIPAGGIAMENTO ----------
  // Slot del corpo: col = colonna nella scheda (l = sinistra, r = destra, top/bottom = centro),
  // zone = punto acceso sulla sagoma. "Destro" del personaggio = sinistra di chi guarda.
  // max = quanta umanità MASSIMA toglie ogni impianto installato, se non specificato sull'impianto
  // (regola base: 2; borgware 4; fashionware 0). Si può cambiare impianto per impianto.
  const CYBER_SLOTS = [
    { id: "audio",      label: "Cyberaudio",          col: "top",    zone: "ears",    max: 2 },
    { id: "occhio_dx",  label: "Cyberocchio destro",  col: "l",      zone: "eye_r",   max: 2 },
    { id: "braccio_dx", label: "Cyberbraccio destro", col: "l",      zone: "arm_r",   max: 2 },
    { id: "esterni",    label: "Cyberware esterno",   col: "l",      zone: "skin",    max: 2 },
    { id: "gamba_dx",   label: "Cybergamba destra",   col: "l",      zone: "leg_r",   max: 2 },
    { id: "borgware",   label: "Borgware",            col: "l",      zone: "core",    max: 4 },
    { id: "occhio_sx",  label: "Cyberocchio sinistro", col: "r",     zone: "eye_l",   max: 2 },
    { id: "braccio_sx", label: "Cyberbraccio sinistro", col: "r",    zone: "arm_l",   max: 2 },
    { id: "interni",    label: "Cyberware interno",   col: "r",      zone: "torso",   max: 2 },
    { id: "gamba_sx",   label: "Cybergamba sinistra", col: "r",      zone: "leg_l",   max: 2 },
    { id: "fashion",    label: "Fashionware",         col: "r",      zone: "fashion", max: 0 },
    { id: "neural",     label: "Neuralware",          col: "bottom", zone: "brain",   max: 2 },
  ];
  const BODY_ZONES = [
    ["", "Nessuna"], ["brain", "Testa / cervello"], ["eye_r", "Occhio destro"], ["eye_l", "Occhio sinistro"], ["ears", "Orecchie"],
    ["skin", "Pelle / esterno"], ["fashion", "Pelle (fashion)"], ["torso", "Torso / interno"], ["core", "Centro del corpo"],
    ["arm_r", "Braccio destro"], ["arm_l", "Braccio sinistro"], ["leg_r", "Gamba destra"], ["leg_l", "Gamba sinistra"],
  ];
  // slot base + slot personalizzati della scheda (alternati a sinistra e destra)
  // e.cyber.hidden = slot standard rimossi da questa scheda
  const hiddenSlots = e => (e.cyber && e.cyber.hidden) || [];
  const slotsOf = e => [...CYBER_SLOTS.filter(s => !hiddenSlots(e).includes(s.id)), ...((e.cyber && e.cyber.extra) || []).map((x, i) => ({
    id: x.id, label: x.label || "Slot personalizzato", zone: x.zone || "", col: i % 2 ? "r" : "l",
    max: x.max === "" || x.max == null ? 2 : Number(x.max), custom: true,
  }))];
  const slotDef = (e, id) => slotsOf(e).find(s => s.id === id) || CYBER_SLOTS.find(s => s.id === id) || { id, label: id, col: "l", zone: "", max: 2 };
  const hasVal = v => v !== "" && v != null;
  const itemMax = (e, it) => hasVal(it.max) ? Number(it.max) : slotDef(e, it.slot).max;
  const GEAR_CATS = [
    { id: "armi",     label: "Armi",            color: "var(--red)",     hint: "es. 3d6 · ROF 1 · Caricatore 8" },
    { id: "armature", label: "Armature",        color: "var(--cyan)",    hint: "es. SP 11 · Testa / Corpo" },
    { id: "equip",    label: "Equipaggiamento", color: "var(--yellow)",  hint: "es. Agente, kit medico, grimaldelli" },
    { id: "veicoli",  label: "Veicoli",         color: "var(--magenta)", hint: "es. Supermoto potenziata" },
    { id: "altro",    label: "Altro",           color: "var(--muted)",   hint: "" },
  ];
  const isPerson = e => e.kind === "npc" || e.kind === "pg";
  const num = v => (v === "" || v == null || isNaN(Number(v))) ? 0 : Number(v);
  const fmtEb = n => `${Math.round(n).toLocaleString("it-IT")} eb`;
  const cyberItems = e => Object.entries((e.cyber && e.cyber.slots) || {}).flatMap(([slot, list]) => (list || []).map(it => ({ ...it, slot })));
  const cyberCount = e => cyberItems(e).filter(it => it.installed !== false).length;
  const gearItems = e => (e.gear && e.gear.items) || [];

  function cyberStats(e) {
    const all = cyberItems(e), inst = all.filter(it => it.installed !== false), plan = all.filter(it => it.installed === false);
    const cost = inst.reduce((t, it) => t + num(it.cost), 0), hl = inst.reduce((t, it) => t + num(it.hl), 0);
    const maxLoss = inst.reduce((t, it) => t + itemMax(e, it), 0);
    const start = e.cyber && hasVal(e.cyber.humanity) ? num(e.cyber.humanity) : null;
    const therapy = e.cyber ? num(e.cyber.therapy) : 0;          // umanità recuperata con la terapia
    const max = start == null ? null : start - maxLoss;
    // la terapia restituisce umanità, ma l'attuale non può mai superare la massima
    const current = start == null ? null : Math.min(start - hl + therapy, max);
    return { inst, plan, cost, hl, maxLoss, therapy, planCost: plan.reduce((t, it) => t + num(it.cost), 0), start, max, current };
  }

  // sagoma olografica: limbi = linee spesse semi-trasparenti + linea centrale
  const BODY_SVG = `
    <svg class="cy-body" viewBox="0 0 200 440" aria-hidden="true">
      <defs><radialGradient id="cyglow" cx="50%" cy="40%" r="60%"><stop offset="0" stop-color="rgba(0,240,255,.25)"/><stop offset="1" stop-color="rgba(0,240,255,0)"/></radialGradient></defs>
      <ellipse cx="100" cy="200" rx="95" ry="190" fill="url(#cyglow)"/>
      <ellipse class="cy-ring" cx="100" cy="425" rx="62" ry="9"/>
      <ellipse class="cy-ring r2" cx="100" cy="425" rx="40" ry="5"/>
      <g class="cy-limb">
        <path d="M88 70 L88 84 M112 70 L112 84"/>
        <path d="M70 92 L56 160 L46 236"/><path d="M130 92 L144 160 L154 236"/>
        <path d="M88 214 L84 318 L80 412"/><path d="M112 214 L116 318 L120 412"/>
      </g>
      <g class="cy-line">
        <ellipse cx="100" cy="42" rx="21" ry="26"/>
        <path d="M70 88 Q100 78 130 88 L136 150 Q130 196 122 216 L78 216 Q70 196 64 150 Z"/>
        <path d="M70 92 L56 160 L46 236"/><path d="M130 92 L144 160 L154 236"/>
        <path d="M88 214 L84 318 L80 412"/><path d="M112 214 L116 318 L120 412"/>
        <path d="M100 90 L100 210 M78 120 Q100 130 122 120 M80 150 Q100 158 120 150" class="thin"/>
      </g>
      ${[["brain", 100, 24], ["eye_r", 91, 40], ["eye_l", 109, 40], ["ears", 100, 48], ["fashion", 118, 104], ["skin", 64, 128],
         ["torso", 100, 136], ["core", 100, 190], ["arm_r", 54, 172], ["arm_l", 146, 172], ["leg_r", 85, 320], ["leg_l", 115, 320]]
        .map(([z, x, y]) => `<g class="cy-zone" data-zone="${z}" transform="translate(${x} ${y})"><circle class="cy-ping" r="9"/><circle class="cy-dot" r="3.2"/></g>`).join("")}
    </svg>`;

  // slot opzioni di ogni parte del corpo: Cyberocchio 3, Cyberbraccio 4, Cybergamba 3, Collegamento Neurale 5,
  // Sistema Cyberudito 3; Fashionware, Impianti Interni ed Esterni 7. Il Chipware sta nell'Alveolo e non conta.
  const SLOT_BASE = { occhio: ["cybereye", 3, "Cyberocchio"], braccio: ["cyberarm", 4, "Cyberbraccio"], gamba: ["cyberleg", 3, "Cybergamba"], neural: ["neurallink", 5, "Collegamento Neurale"], audio: ["cyberaudio", 3, "Sistema Cyberudito"] };
  const SLOT_FIXED = { fashion: 7, interni: 7, esterni: 7 };
  function slotUse(slotId, items) {
    const kind = slotId.replace(/_(dx|sx)$/, ""), inst = (items || []).filter(it => it.installed !== false && it.name);
    const B = SLOT_BASE[kind], fixed = SLOT_FIXED[kind];
    if (!B && !fixed) return null;
    const list = inst.map(it => ({ it, c: CW.byId(it.ref) || CW.byName(it.name) }));
    const hasBase = B && list.some(x => x.c && x.c.id === B[0]);
    const opts = list.filter(x => !(x.c && (x.c.base || x.c.chip)));
    const used = opts.reduce((t, x) => t + (x.c ? num(x.c.slots) : 1), 0);
    // senza l'arto artificiale c'è posto solo per un'opzione «installabile su un arto di carne»
    const cap = fixed || (hasBase ? B[1] : kind === "braccio" || kind === "gamba" ? 1 : 0);
    const missing = B && !hasBase && opts.length && !(kind === "braccio" || kind === "gamba") ? B[2] : "";
    return { used, cap, over: used > cap, missing, base: B ? B[2] : "", hasBase };
  }
  const slotUseHtml = u => !u || (!u.used && !u.hasBase) ? "" : `<span class="cy-cap ${u.over || u.missing ? "over" : ""}" title="Slot opzioni usati / disponibili${u.base && !u.hasBase ? ` (senza ${u.base})` : ""}">${u.missing ? `⚠ manca il ${esc(u.missing)}` : `opzioni ${u.used}/${u.cap}${u.over ? " ⚠" : ""}`}</span>`;
  function slotCard(e, s) {
    const items = ((e.cyber && e.cyber.slots && e.cyber.slots[s.id]) || []).map(it => ({ ...it, slot: s.id }));
    const inst = items.filter(it => it.installed !== false);
    return `
      <section class="cy-slot ${inst.length ? "has" : ""} ${items.length ? "" : "vacant"} ${s.custom ? "custom" : ""}" data-zone="${s.zone}">
        <header><span class="cy-title">${esc(s.label)}</span>${slotUseHtml(slotUse(s.id, items))}
          ${inst.length ? `<span class="cy-sum">${fmtEb(inst.reduce((t, it) => t + num(it.cost), 0))} · ${inst.reduce((t, it) => t + num(it.hl), 0)} HL</span>` : ""}</header>
        ${items.length ? `<ul>${items.map(it => {
          const m = itemMax(e, it), changed = hasVal(it.max) && Number(it.max) !== s.max;
          return `
          <li class="${it.installed === false ? "planned" : ""}" ${it.note || cwOf(it) ? `title="${esc([(cwOf(it) || {}).desc, it.note].filter(Boolean).join(" · "))}"` : ""}>
            <span class="cy-chk" aria-label="${it.installed === false ? "pianificato" : "installato"}">${it.installed === false ? "◇" : "◆"}</span>
            <span class="cy-name">${esc(it.name)}${cwOf(it) && (cwOf(it).fx || []).length ? ` <i class="gl-fx" title="Effetto applicato ai tiri">⚡</i>` : ""}${it.ref === "skillchip" && it.param ? ` <small>${esc((CPR.skill(it.param) || {}).label || "")}</small>` : ""}${it.note ? `<small>${esc(it.note)}</small>` : ""}</span>
            <span class="cy-cost">${hasVal(it.cost) ? esc(num(it.cost).toLocaleString("it-IT")) : "—"}</span>
            <span class="cy-hl">${hasVal(it.hl) ? esc(it.hl) : "—"}</span>
            <span class="cy-max ${changed ? "changed" : ""}" title="Umanità massima tolta${changed ? " (modificata, standard " + s.max + ")" : ""}">${m ? "−" + m : "0"}</span>
          </li>`; }).join("")}</ul>` : `<div class="cy-free">— slot libero —</div>`}
      </section>`;
  }

  function cyberHtml(e) { return `<div class="cy-wrap" data-cyber="${esc(e.id)}">${cyberInner(e)}${cyberFxHtml(e)}</div>`; }
  function cyberInner(e) {
    const st = cyberStats(e);
    const slots = slotsOf(e);
    const zonesOn = new Set(st.inst.map(it => slotDef(e, it.slot).zone).filter(Boolean));
    const pct = v => st.start ? Math.max(0, Math.min(100, (v / st.start) * 100)) : 0;
    const psycho = st.current != null && st.current <= 0;
    const col = c => slots.filter(s => s.col === c).map(s => slotCard(e, s)).join("");
    return `
      <div class="cy-summary ${psycho ? "psycho" : ""}">
        <div class="cy-stat"><span class="l">Costo installato</span><span class="n">${fmtEb(st.cost)}</span></div>
        ${st.planCost ? `<div class="cy-stat plan"><span class="l">Pianificato</span><span class="n">${fmtEb(st.planCost)}</span></div>` : ""}
        <div class="cy-stat hl"><span class="l">Perdita umanità</span><span class="n">${st.hl}</span></div>
        <div class="cy-stat mx"><span class="l">Umanità max persa</span><span class="n">${st.maxLoss}</span></div>
        ${st.therapy ? `<div class="cy-stat th"><span class="l">Recuperata (terapia)</span><span class="n">+${st.therapy}</span></div>` : ""}
        <div class="cy-stat hum">
          ${Store.canEdit() ? `<button type="button" class="cy-hum-edit" data-action="edit-humanity" data-id="${esc(e.id)}" title="Modifica umanità iniziale e terapia">✎ Umanità</button>` : ""}
          ${st.start != null ? `
            <span class="l">Umanità <b>${st.current}</b> · max <b>${st.max}</b> · iniziale ${st.start}</span>
            <span class="cy-bar" title="Barra chiara = umanità massima, barra piena = umanità attuale"><i class="mx" style="width:${pct(st.max)}%"></i><i style="width:${pct(st.current)}%"></i></span>
            <span class="cy-emp">EMP effettiva ${Math.max(0, Math.floor(st.current / 10))}${psycho ? ` · <b>⚠ CYBERPSICOSI</b>` : ""}</span>`
            : `<span class="l">Umanità</span><span class="cy-emp">Umanità iniziale non impostata</span>`}
        </div>
      </div>
      <div class="cy-legend"><span>◆ installato</span><span>◇ pianificato</span><span>colonne: costo (eb) · HL = umanità persa · −N = umanità massima tolta (in giallo se modificata)</span></div>
      <div class="cy-layout">
        <div class="cy-col">${col("l")}</div>
        <div class="cy-center">
          ${col("top")}
          <div class="cy-figure" data-zones="${[...zonesOn].join(" ")}">${BODY_SVG}</div>
          ${col("bottom")}
        </div>
        <div class="cy-col">${col("r")}</div>
      </div>`;
  }

  function gearHtml(e) {
    const items = gearItems(e), money = e.gear && e.gear.money;
    if (!items.length && (money === "" || money == null)) return `<div class="empty"><div class="big">// INVENTARIO VUOTO</div>Nessun equipaggiamento registrato.</div>`;
    return `
      ${money !== "" && money != null ? `<div class="cy-summary"><div class="cy-stat"><span class="l">Eddies</span><span class="n">${fmtEb(num(money))}</span></div>
        <div class="cy-stat"><span class="l">Oggetti</span><span class="n">${items.length}</span></div></div>` : ""}
      <div class="gear-grid">
        ${GEAR_CATS.map(c => {
          const list = items.filter(it => (it.cat || "altro") === c.id);
          if (!list.length) return "";
          return `<section class="gear-sec" style="--c:${c.color}">
            <header>${esc(c.label)} <span>${list.length}</span></header>
            <ul>${list.map(it => `<li>
              <span class="g-qty">${num(it.qty) > 1 ? "×" + num(it.qty) : ""}</span>
              <span class="g-name">${esc(it.name)}${it.detail ? `<small>${esc(it.detail)}</small>` : ""}${it.note ? `<em>${esc(it.note)}</em>` : ""}</span>
            </li>`).join("")}</ul></section>`;
        }).join("")}
      </div>`;
  }

  // evidenzia sulla sagoma lo slot sotto il mouse
  document.addEventListener("mouseover", ev => {
    const s = ev.target.closest && ev.target.closest(".cy-slot");
    const fig = $("#modal .cy-figure"); if (!fig) return;
    $$(".cy-zone", fig).forEach(z => z.classList.toggle("hover", !!s && z.dataset.zone === s.dataset.zone));
  });

  const allCyberNames = () => [...new Set(state.entries.flatMap(x => cyberItems(x).map(it => it.name)).filter(Boolean))].sort((a, b) => a.localeCompare(b, "it"));
  const cyRow = (it = {}, def = 2) => `
    <div class="cy-row ${it.ref === "skillchip" ? "chip" : ""}">
      <label class="cy-inst" title="Installato (togli la spunta se è solo pianificato)"><input type="checkbox" data-f="installed" ${it.installed === false ? "" : "checked"}><span></span></label>
      <input data-f="name" placeholder="Nome impianto" list="dl-cyber" value="${esc(it.name)}">
      <input type="hidden" data-f="ref" value="${esc(it.ref || "")}"><input type="hidden" data-f="on" value="${it.on ? "1" : ""}">
      <select data-f="param" class="cy-param" title="Abilità del Chip Abilità (livello 3)"><option value="">abilità del chip…</option>${CPR.SKILLS.map(k => `<option value="${k.id}" ${k.id === it.param ? "selected" : ""}>${esc(k.label)}</option>`).join("")}</select>
      <input data-f="cost" type="number" min="0" step="1" placeholder="eb" title="Costo in eddies" value="${esc(it.cost ?? "")}">
      <input data-f="hl" type="number" min="0" step="1" placeholder="HL" title="Umanità persa (HL)" value="${esc(it.hl ?? "")}">
      <button type="button" class="gp-btn" data-cy-pu title="Tira la Perdita d'Umanità con i dadi del catalogo" aria-label="Tira la Perdita d'Umanità">⚄</button>
      <input data-f="max" type="number" min="0" step="1" placeholder="max ${def}" title="Umanità massima tolta — vuoto = ${def} (standard dello slot)" value="${esc(it.max ?? "")}">
      <input data-f="note" placeholder="Nota (opzioni, effetti…)" value="${esc(it.note)}">
      <button type="button" class="gp-btn del" data-row-del aria-label="Rimuovi">✕</button>
    </div>`;
  const zoneSelect = (z = "") => `<select data-slot-f="zone" title="Punto acceso sulla sagoma">${BODY_ZONES.map(([v, l]) => `<option value="${v}" ${v === z ? "selected" : ""}>${l}</option>`).join("")}</select>`;
  const cyFieldset = (s, items) => `
    <fieldset class="cy-edit ${s.custom ? "custom" : ""}" data-slot="${esc(s.id)}" data-max="${s.max}">
      <legend>${s.custom ? "Slot personalizzato" : `${esc(s.label)} <small>· max standard ${s.max}</small>`} <span data-cy-cap></span></legend>
      ${s.custom ? `<div class="cy-slot-head">
        <input data-slot-f="label" placeholder="Nome dello slot (es. Chipware, Opzioni occhi…)" value="${esc(s.label === "Slot personalizzato" ? "" : s.label)}">
        ${zoneSelect(s.zone)}
        <input data-slot-f="max" type="number" min="0" step="1" value="${esc(s.max)}" title="Umanità massima standard per questo slot">
        <button type="button" class="btn ghost small" data-slot-del>Elimina slot</button>
      </div>` : ""}
      <div class="cy-rows">${items.map(it => cyRow(it, s.max)).join("")}</div>
      <div class="cy-edit-actions">
        <select class="cy-pick" data-cy-pick aria-label="Aggiungi dal catalogo">${cwOptions(s.id)}</select>
        <button type="button" class="btn ghost small cyan" data-row-add="cy">+ Impianto a mano</button>
        ${s.custom ? "" : `<button type="button" class="btn ghost small" data-slot-del>Rimuovi slot</button>`}
      </div>
    </fieldset>`;
  const gearRow = (it = {}) => `
    <div class="gear-row">
      <select data-f="cat">${GEAR_CATS.map(c => `<option value="${c.id}" ${(it.cat || "equip") === c.id ? "selected" : ""}>${c.label}</option>`).join("")}</select>
      <input data-f="name" placeholder="Nome" value="${esc(it.name)}">
      <input data-f="qty" type="number" min="1" step="1" placeholder="Q.tà" value="${esc(it.qty ?? 1)}">
      <input data-f="detail" placeholder="Dettagli (danno, SP, ROF…)" value="${esc(it.detail)}">
      <input data-f="note" placeholder="Nota" value="${esc(it.note)}">
      <button type="button" class="gp-btn del" data-row-del aria-label="Rimuovi">✕</button>
    </div>`;
  const readRows = (root, sel) => $$(sel, root).map(r => Object.fromEntries($$("[data-f]", r).map(i => [i.dataset.f, i.type === "checkbox" ? i.checked : i.value.trim()])));

  // finestra rapida: solo umanità iniziale e recuperata con la terapia
  function editHumanity(id) {
    const e = state.entries.find(x => x.id === id); if (!e) return;
    const c = e.cyber || {}, st = cyberStats(e);
    openModal(`
      <form class="form" id="hum-form">
        <div class="modal-head"><h2>// UMANITÀ · ${esc(e.name)}</h2><button type="button" class="x" data-action="open-entry-tab" data-id="${esc(e.id)}" data-tab="cyber" aria-label="Chiudi">×</button></div>
        <div class="modal-body">
          <div class="fields">
            <div class="field"><label for="h-start">Umanità iniziale</label>
              <input id="h-start" name="humanity" type="number" min="0" step="1" value="${esc(c.humanity ?? "")}" placeholder="EMP × 10, es. 70"></div>
            <div class="field"><label for="h-th">Recuperata con la terapia</label>
              <div class="temp-row"><button type="button" class="gp-btn" data-th="-1" aria-label="Meno uno">−</button>
              <input id="h-th" name="therapy" type="number" min="0" step="1" value="${esc(c.therapy ?? "")}" placeholder="0">
              <button type="button" class="gp-btn" data-th="1" aria-label="Più uno">+</button></div></div>
          </div>
          <p class="hint" style="margin-top:12px">Impianti installati: perdita umanità <b>${st.hl}</b>, umanità massima tolta <b>${st.maxLoss}</b>.
            L'umanità attuale = iniziale − perdita + terapia, e non può superare la massima (iniziale − ${st.maxLoss}).</p>
          <p class="hint hum-preview" aria-live="polite"></p>
        </div>
        <div class="modal-foot">
          <button type="button" class="btn ghost small left" data-action="open-entry-tab" data-id="${esc(e.id)}" data-tab="cyber">Annulla</button>
          <button type="submit" class="btn">Salva umanità</button>
        </div>
      </form>`, true);
    const form = $("#hum-form"), prev = $(".hum-preview", form);
    const update = () => {
      const s = form.humanity.value === "" ? null : num(form.humanity.value);
      if (s == null) { prev.textContent = ""; return; }
      const max = s - st.maxLoss, cur = Math.min(s - st.hl + num(form.therapy.value), max);
      prev.innerHTML = `Risultato: umanità <b>${cur}</b> · max <b>${max}</b> · EMP effettiva <b>${Math.max(0, Math.floor(cur / 10))}</b>${cur <= 0 ? " · ⚠ cyberpsicosi" : ""}`;
    };
    form.addEventListener("input", update);
    form.addEventListener("click", ev => {
      const b = ev.target.closest("[data-th]");
      if (b) { form.therapy.value = Math.max(0, num(form.therapy.value) + num(b.dataset.th)); update(); }
    });
    update();
    form.addEventListener("submit", async ev => {
      ev.preventDefault();
      const h = form.humanity.value, t = form.therapy.value;
      try {
        const saved = await Store.save("entries", { ...e, cyber: { ...(e.cyber || {}), humanity: h === "" ? null : num(h), therapy: t === "" ? null : num(t) } });
        upsert(state.entries, saved); toast("Umanità salvata", "ok"); openEntry(saved.id, "cyber");
      } catch (err) { fail(err); }
    });
  }

  function editCyber(id) {
    const e = state.entries.find(x => x.id === id); if (!e) return;
    const slots = (e.cyber && e.cyber.slots) || {};
    openModal(`
      <form class="form" id="cyber-form">
        <div class="modal-head"><h2>// CYBERWARE · ${esc(e.name)}</h2><button type="button" class="x" data-action="close" aria-label="Chiudi">×</button></div>
        <div class="modal-body">
          <div class="fields">
            <div class="field"><label for="cy-hum">Umanità iniziale</label><input id="cy-hum" name="humanity" type="number" min="0" step="1" value="${esc(e.cyber && e.cyber.humanity != null ? e.cyber.humanity : "")}" placeholder="EMP × 10, es. 70"></div>
            <div class="field"><label for="cy-th">Recuperata con la terapia</label><input id="cy-th" name="therapy" type="number" min="0" step="1" value="${esc(e.cyber && e.cyber.therapy != null ? e.cyber.therapy : "")}" placeholder="0"></div>
            <div class="field full"><span class="lbl">Legenda</span><span class="hint">Spunta = installato, senza spunta = pianificato (non conta nei totali). <b>eb</b> = costo · <b>HL</b> = umanità persa · <b>max</b> = umanità massima tolta: vuoto = standard dello slot (2, borgware 4, fashionware 0), oppure scrivi il valore modificato (es. 1).</span></div>
          </div>
          <datalist id="dl-cyber">${allCyberNames().map(n => `<option value="${esc(n)}">`).join("")}</datalist>
          <div id="cy-fieldsets">${slotsOf(e).map(s => cyFieldset(s, slots[s.id] || [])).join("")}</div>
          <div class="cy-slot-tools">
            <button type="button" class="btn ghost small yellow" data-slot-add>+ Aggiungi slot personalizzato</button>
            <div id="cy-restore"></div>
          </div>
        </div>
        <div class="modal-foot">
          <button type="button" class="btn ghost small left" data-action="open-entry-tab" data-id="${esc(e.id)}" data-tab="cyber">Annulla</button>
          <button type="submit" class="btn">Salva cyberware</button>
        </div>
      </form>`);
    const form = $("#cyber-form");
    // slot standard rimossi → pulsanti per ripristinarli
    const refreshRestore = () => {
      const gone = CYBER_SLOTS.filter(s => !$(`fieldset[data-slot="${s.id}"]`, form));
      $("#cy-restore", form).innerHTML = gone.length
        ? `<span class="lbl">Slot standard rimossi:</span> ${gone.map(s => `<button type="button" class="chip" data-slot-restore="${s.id}">+ ${esc(s.label)}</button>`).join(" ")}` : "";
    };
    refreshRestore();
    form.addEventListener("click", async ev => {
      const rs = ev.target.closest("[data-slot-restore]");
      if (rs) {
        const s = CYBER_SLOTS.find(x => x.id === rs.dataset.slotRestore);
        $("#cy-fieldsets", form).insertAdjacentHTML("beforeend", cyFieldset(s, []));
        refreshRestore(); $(`fieldset[data-slot="${s.id}"]`, form).scrollIntoView({ block: "center" });
        return;
      }
      const add = ev.target.closest("[data-row-add]"), del = ev.target.closest("[data-row-del]");
      if (add) {
        const fs = add.closest("fieldset"), box = $(".cy-rows", fs);
        const def = fs.classList.contains("custom") ? num($("[data-slot-f=max]", fs).value) : num(fs.dataset.max);
        box.insertAdjacentHTML("beforeend", cyRow({}, def)); $(".cy-row:last-child [data-f=name]", box).focus();
      }
      if (del) del.closest(".cy-row").remove();
      // PU tirata con i dadi della voce del catalogo
      const pu = ev.target.closest("[data-cy-pu]");
      if (pu) { const row = pu.closest(".cy-row"), c = CW.byId($("[data-f=ref]", row).value) || CW.byName($("[data-f=name]", row).value);
        if (!c) { toast("Prima scegli l'impianto dal catalogo", "err"); return; }
        const r = CW.rollPu(c); $("[data-f=hl]", row).value = r.total; toast(`${c.name}: PU ${r.dice.length ? `${r.dice.join(" + ")}${/\/2$/.test(c.dice) ? " ÷ 2" : ""} = ` : ""}${r.total}`, "ok"); return; }
      if (ev.target.closest("[data-slot-add]")) {
        const id = "x-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
        $("#cy-fieldsets", form).insertAdjacentHTML("beforeend", cyFieldset({ id, label: "", zone: "", max: 2, custom: true }, []));
        const fs = $(`fieldset[data-slot="${id}"]`, form); fs.scrollIntoView({ block: "center" }); $("[data-slot-f=label]", fs).focus();
      }
      const sd = ev.target.closest("[data-slot-del]");
      if (sd) {
        const fs = sd.closest("fieldset"), n = $$(".cy-row", fs).length;
        if (!n || await askConfirm(`Rimuovere lo slot e i suoi ${n} impianti? Diventa definitivo quando salvi.`, "Rimuovi slot")) { fs.remove(); refreshRestore(); }
      }
    });
    // contatore degli slot opzioni, aggiornato a ogni modifica
    const capCount = () => $$("fieldset[data-slot]", form).forEach(fs => {
      const items = readRows(fs, ".cy-row").map(r => ({ name: r.name, ref: r.ref, installed: r.installed }));
      const el = $("[data-cy-cap]", fs); if (el) el.innerHTML = slotUseHtml(slotUse(fs.dataset.slot, items));
    });
    ["change", "input"].forEach(t => form.addEventListener(t, () => setTimeout(capCount)));
    form.addEventListener("click", ev => { if (ev.target.closest("[data-row-del], [data-row-add]")) setTimeout(capCount); });
    capCount();
    // voce scelta dal catalogo: riga compilata (nome, costo, PU media, nota)
    form.addEventListener("change", ev => {
      const sel = ev.target.closest("[data-cy-pick]");
      if (sel && sel.value) {
        const c = CW.byId(sel.value), fs = sel.closest("fieldset"), box = $(".cy-rows", fs);
        const def = fs.classList.contains("custom") ? num($("[data-slot-f=max]", fs).value) : num(fs.dataset.max);
        box.insertAdjacentHTML("beforeend", cyRow({ name: c.name, ref: c.id, cost: c.cost, hl: c.pu, note: shortDesc(c), max: c.g === "fashion" || c.pu === 0 ? 0 : null }, def));
        sel.value = ""; return;
      }
      const nm = ev.target.closest(".cy-row [data-f=name]");
      if (nm) { const row = nm.closest(".cy-row"), c = CW.byName(nm.value); $("[data-f=ref]", row).value = c ? c.id : ""; row.classList.toggle("chip", !!c && c.id === "skillchip"); }
    });
    form.addEventListener("submit", async ev => {
      ev.preventDefault();
      const out = {}, extra = [];
      for (const fs of $$("fieldset[data-slot]", form)) {
        const items = readRows(fs, ".cy-row").filter(it => it.name).map(it => ({
          name: it.name, installed: it.installed, cost: it.cost === "" ? null : num(it.cost), hl: it.hl === "" ? null : num(it.hl),
          max: it.max === "" ? null : num(it.max), note: it.note,
          ...(it.ref ? { ref: it.ref } : {}), ...(it.on ? { on: true } : {}), ...(it.param && it.ref === "skillchip" ? { param: it.param } : {}),
        }));
        if (fs.classList.contains("custom")) {
          const label = $("[data-slot-f=label]", fs).value.trim();
          if (!label && !items.length) continue;              // slot vuoto e senza nome: lo scarto
          extra.push({ id: fs.dataset.slot, label: label || "Slot personalizzato", zone: $("[data-slot-f=zone]", fs).value, max: num($("[data-slot-f=max]", fs).value) });
        }
        if (items.length) out[fs.dataset.slot] = items;
      }
      const hum = form.humanity.value, th = form.therapy.value;
      const hidden = CYBER_SLOTS.filter(s => !$(`fieldset[data-slot="${s.id}"]`, form)).map(s => s.id);
      try {
        const saved = await Store.save("entries", { ...e, cyber: {
          humanity: hum === "" ? null : num(hum), therapy: th === "" ? null : num(th), slots: out, extra, hidden,
        } });
        upsert(state.entries, saved); toast("Cyberware salvato", "ok"); openEntry(saved.id, "cyber");
      } catch (err) { fail(err); }
    });
  }

  function editGear(id) {
    const e = state.entries.find(x => x.id === id); if (!e) return;
    openModal(`
      <form class="form" id="gear-form">
        <div class="modal-head"><h2>// EQUIPAGGIAMENTO · ${esc(e.name)}</h2><button type="button" class="x" data-action="close" aria-label="Chiudi">×</button></div>
        <div class="modal-body">
          <div class="fields"><div class="field"><label for="g-money">Eddies</label><input id="g-money" name="money" type="number" step="1" value="${esc(e.gear && e.gear.money != null ? e.gear.money : "")}" placeholder="es. 2500"></div></div>
          <div class="gear-rows">${gearItems(e).map(gearRow).join("")}</div>
          <button type="button" class="btn ghost small cyan" data-row-add="gear" style="margin-top:10px">+ Aggiungi oggetto</button>
          <p class="hint" style="margin-top:10px">${GEAR_CATS.filter(c => c.hint).map(c => `<b>${c.label}</b>: ${esc(c.hint)}`).join(" · ")}</p>
        </div>
        <div class="modal-foot">
          <button type="button" class="btn ghost small left" data-action="open-entry-tab" data-id="${esc(e.id)}" data-tab="gear">Annulla</button>
          <button type="submit" class="btn">Salva equipaggiamento</button>
        </div>
      </form>`);
    const form = $("#gear-form");
    form.addEventListener("click", ev => {
      if (ev.target.closest("[data-row-add]")) { $(".gear-rows", form).insertAdjacentHTML("beforeend", gearRow()); $(".gear-row:last-child [data-f=name]", form).focus(); }
      const del = ev.target.closest("[data-row-del]"); if (del) del.closest(".gear-row").remove();
    });
    form.addEventListener("submit", async ev => {
      ev.preventDefault();
      const items = readRows(form, ".gear-row").filter(it => it.name).map(it => ({ ...it, qty: Math.max(1, num(it.qty) || 1) }));
      const money = form.money.value;
      try {
        const saved = await Store.save("entries", { ...e, gear: { money: money === "" ? null : num(money), items } });
        upsert(state.entries, saved); toast("Equipaggiamento salvato", "ok"); openEntry(saved.id, "gear");
      } catch (err) { fail(err); }
    });
  }

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
  const woundOf = e => CPR.wound(hpOf(e), hpMaxOf(e));
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
    const cw = $(`#modal .cy-wrap[data-cyber="${CSS.escape(id)}"]`);
    if (!box && !dt && !cb && !rt && !cw) return;
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
          <div class="sh-box"><span class="l">Move</span><span class="n">${statEff(e, "MOVE") * 2}<small> m/turn</small></span><span class="sh-sub">${statEff(e, "MOVE")} squares · Run ${statEff(e, "MOVE") * 4} m</span></div>
        </div>
        ${pcPen(e) ? `<div class="en-pen">Armatura pesante: ${pcPen(e)} a REF, DEX e MOVE (già calcolato nei valori e nei tiri)</div>` : ""}
        ${(s.status || []).length ? `<div class="sh-status"><span class="sh-k">Stati</span>${statusChips(s.status, null)}</div>` : ""}

        <div class="sh-stats">${CPR.STATS.map(st => roll("stat:" + st.id, `<span class="k">${st.id}</span><span class="v">${statEff(e, st.id)}</span>${statEff(e, st.id) !== statBase(e, st.id) ? `<small>base ${statBase(e, st.id)}</small>` : ""}`, "sh-stat", `${st.label}: ${st.id} + 1d10`)).join("")}</div>

        <div class="sh-sec-head"><h4>Combat</h4><span class="hint">${weapons.length} arm${weapons.length === 1 ? "a" : "i"} · HP, armatura, iniziativa, stati e Critical Injury</span>
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
        <span class="hint">Si parte con un Ruolo a grado 4. Un secondo Ruolo (a grado 1, con i Punti Miglioramento) si prende solo con il precedente almeno a 4.</span>
        <button type="button" class="btn ghost small cyan" data-action="dice-open">⬢ Dice log</button></div>
      ${roles.length ? roles.map((r, i) => roleCard(e, r, i, edit)).join("") : `<p class="hint">Nessun Ruolo: aggiungine uno qui sotto.</p>`}
      ${edit && free.length ? `<div class="rl-add"><select data-rl-new aria-label="Ruolo da aggiungere">${free.map(r => `<option value="${r.id}">${esc(r.it)} · ${esc(r.abilityIt)}</option>`).join("")}</select>
        <button type="button" class="btn small yellow" data-action="rl-op" data-id="${id}" data-op="add">+ Ruolo</button>
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
      if (roles.length && !RL.canAddRole(roles) && !(await askConfirm(`Per le regole serve il Ruolo precedente almeno a grado 4 (ora è ${num(roles[roles.length - 1].rank)}). Aggiungere comunque?`, "Aggiungi"))) return;
      return sheetPatch(e.id, s => { migrateRoles(s, e); s.roles.push({ id, rank: s.roles.length ? 1 : 4 }); return s; });
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
      const list = CW.all().filter(c => c.g === g.id); if (!list.length) return "";
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
  const GLOSS_TABS = [["cyber", "Cyberware"], ["weapons", "Armi e armature"], ["rules", "Munizioni e stati"], ["crit", "Critical Injury"], ["net", "NET"]];
  let glossQ = "", glossG = "";
  function viewGlossary() {
    const tab = ls.get("nc-gloss", "cyber");
    return `
      <div class="page-head">
        <div><div class="kicker">// DATA_FORTRESS</div><h1>Glossario</h1><p>Tutti i cataloghi del sito: cyberware, armi, munizioni, stati, Critical Injury e NET. Le voci ★ sono custom.</p></div>
        <div class="row-btns">${tab === "cyber" && Store.canEdit() ? `<button type="button" class="btn small yellow" data-action="cyhb-edit">★ + Cyberware custom</button>` : ""}</div>
      </div>
      <div class="chips gl-tabs">${GLOSS_TABS.map(([id, l]) => `<button type="button" class="chip ${id === tab ? "active" : ""}" data-action="gloss-tab" data-tab="${id}">${l}</button>`).join("")}</div>
      <div id="gloss-body">${glossBody(tab)}</div>`;
  }
  function glossBody(tab) {
    if (tab === "cyber") {
      const q = norm2(glossQ), list = CW.all().filter(c => (!glossG || c.g === glossG) && (!q || norm2(`${c.name} ${c.desc} ${c.req || ""}`).includes(q)));
      return `<div class="gl-filters"><input type="search" data-gloss-q placeholder="cerca: nome, effetto, requisito…" value="${esc(glossQ)}">
          <select data-gloss-g><option value="">Tutti i tipi</option>${CW.GROUPS.map(g => `<option value="${g.id}" ${g.id === glossG ? "selected" : ""}>${esc(g.label)}</option>`).join("")}</select>
          <span class="hint">${list.length} voci · un impianto occupa 1 Slot salvo indicazione</span></div>
        <div class="gl-wrap"><table class="gl-t">
          <thead><tr><th>Nome</th><th>Tipo</th><th>Installazione</th><th>Descrizione</th><th>Costo</th><th>PU</th></tr></thead>
          <tbody>${CW.GROUPS.filter(g => list.some(c => c.g === g.id)).map(g => `<tr class="gl-grp"><th colspan="6">${esc(g.label)}${g.note ? ` <small>${esc(g.note)}</small>` : ""}</th></tr>` +
            list.filter(c => c.g === g.id).map(c => `<tr class="${c.base ? "gl-base" : ""}">
              <td><b>${c.custom ? "★ " : ""}${esc(c.name)}</b>${c.custom && Store.canEdit() ? ` <button type="button" class="gp-btn" data-action="cyhb-edit" data-id="${esc(c.id)}" aria-label="Modifica">✎</button>` : ""}${(c.fx || []).length ? ` <span class="gl-fx" title="Effetto applicato ai tiri">⚡</span>` : ""}</td>
              <td>${esc(g.label)}</td><td>${esc(c.inst)}</td>
              <td>${esc(c.desc)}${c.req ? `<small>Richiede: ${esc(c.req)}${c.slots > 1 ? ` · ${c.slots} Slot` : ""}</small>` : c.slots === 0 ? `<small>Nessuno Slot</small>` : ""}</td>
              <td class="gl-n">${c.cost.toLocaleString("it-IT")} E$<small>${esc(c.cat || "")}</small></td><td class="gl-n">${c.pu}<small>${esc(c.dice || "")}</small></td></tr>`).join("")).join("")}</tbody></table></div>
        <p class="hint">⚡ = effetto già applicato ai tiri quando l'impianto è nella scheda (alcuni solo a comando, con l'interruttore nella tab Cyberware).</p>`;
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


  // ---------- PUNTI MIGLIORAMENTO (IP) ----------
  // costi del manuale: abilità 20 × nuovo livello (×2 per le abilità a costo doppio), Capacità di Ruolo 60 × nuovo grado
  // sheet.ipLog = [{ at, kind: "earn" | "spend", amount, why, key, label, from, to }] (più recente in fondo)
  const ipCost = (kind, to, x2) => kind === "role" ? 60 * to : (x2 ? 40 : 20) * to;
  function ipTargets(e) {
    const s = sheetOf(e);
    const sk = skillsOf(e).map(k => ({ key: k.key, label: k.label, kind: "skill", lvl: k.lvl, x2: !!k.x2, group: k.group }));
    const rl = rolesOf(e).map((r, i) => ({ key: "role:" + i, label: `${(RL.roleById(r.id) || {}).it || r.id} · ${(RL.roleById(r.id) || {}).abilityIt || ""}`, kind: "role", lvl: clamp(num(r.rank), 0, 10) }));
    return [...rl, ...sk].map(t => ({ ...t, cost: t.lvl >= 10 ? null : ipCost(t.kind, t.lvl + 1, t.x2) }));
  }
  function openIp(id) {
    const e = state.entries.find(x => x.id === id); if (!e) return;
    const s = sheetOf(e), edit = Store.canEdit(), ip = num(s.ip), log = [...(s.ipLog || [])].reverse();
    const tg = ipTargets(e), last = (s.ipLog || []).slice(-1)[0];
    const opt = t => `<option value="${esc(t.key)}" ${t.cost == null || t.cost > ip ? "disabled" : ""}>${esc(t.label)} ${t.lvl} → ${t.lvl + 1 > 10 ? "max" : t.lvl + 1} · ${t.cost == null ? "al massimo" : t.cost + " IP"}${t.x2 ? " (×2)" : ""}</option>`;
    openModal(`
      <div class="modal-head"><h2>// PUNTI MIGLIORAMENTO · ${esc(e.name)}</h2><button type="button" class="x" data-action="open-entry-tab" data-id="${esc(e.id)}" data-tab="sheet" aria-label="Chiudi">×</button></div>
      <div class="modal-body ip-box" data-ip="${esc(e.id)}">
        <div class="ip-now"><span class="sh-k">Disponibili</span> <b>${ip}</b> IP</div>
        <p class="hint">Abilità: 20 IP × il livello nuovo (40 × per le abilità ×2). Capacità di Ruolo: 60 IP × il grado nuovo. Le abilità che non hai partono da 0 (il livello 1 costa 20).</p>
        ${edit ? `<div class="ip-row"><span class="lbl">Guadagna</span><input type="number" min="1" max="999" data-ip-amt placeholder="IP" aria-label="IP guadagnati"><input data-ip-why placeholder="Perché (es. sessione 12, missione al porto)" aria-label="Motivo">
          <button type="button" class="btn small" data-action="ip-earn" data-id="${esc(e.id)}">+ Aggiungi IP</button></div>
        <div class="ip-row"><span class="lbl">Spendi</span><select data-ip-target aria-label="Cosa migliorare">
          <optgroup label="Capacità di Ruolo">${tg.filter(t => t.kind === "role").map(opt).join("") || `<option disabled>nessun Ruolo</option>`}</optgroup>
          ${SK_GROUPS.map(g => { const l = tg.filter(t => t.kind === "skill" && t.group === g); return l.length ? `<optgroup label="${esc(g)}">${l.map(opt).join("")}</optgroup>` : ""; }).join("")}</select>
          <button type="button" class="btn small yellow" data-action="ip-spend" data-id="${esc(e.id)}">Migliora</button></div>` : ""}
        <h3 class="sh-h">Storico ${edit && last ? `<button type="button" class="btn ghost small" data-action="ip-undo" data-id="${esc(e.id)}" title="Annulla l'ultima voce (restituisce gli IP o li toglie)">↶ Annulla l'ultima</button>` : ""}</h3>
        ${log.length ? `<div class="gl-wrap"><table class="gl-t ip-t"><thead><tr><th>Data</th><th>Cosa</th><th>IP</th><th>Totale dopo</th></tr></thead><tbody>${(() => {
          let run = ip; return log.map(x => { const row = `<tr class="${x.kind}"><td class="gl-n">${esc(new Date(x.at).toLocaleDateString("it-IT"))}</td><td>${x.kind === "earn" ? `Guadagnati${x.why ? ` · ${esc(x.why)}` : ""}` : `${esc(x.label)} ${x.from} → ${x.to}`}</td><td class="gl-n">${x.kind === "earn" ? "+" : "−"}${x.amount}</td><td class="gl-n">${run}</td></tr>`; run += x.kind === "earn" ? -x.amount : x.amount; return row; }).join(""); })()}</tbody></table></div>`
          : `<p class="hint">Nessuna voce ancora.</p>`}
      </div>`);
  }
  async function ipSave(e, fn, msg) {
    const sh = JSON.parse(JSON.stringify(sheetOf(e)));
    const next = fn(sh); if (!next) return;
    try {
      const saved = await Store.save("entries", { ...e, sheet: next });
      upsert(state.entries, saved); liveSend("entries", saved);
      if (msg) toast(msg, "ok"); openIp(saved.id); refreshParty();
    } catch (err) { fail(err); }
  }
  function ipAction(el) {
    const e = state.entries.find(x => x.id === el.dataset.id); if (!e || !Store.canEdit()) return;
    const box = el.closest(".ip-box"), a = el.dataset.action;
    if (a === "ip-earn") {
      const n = Math.trunc(num($("[data-ip-amt]", box).value)), why = $("[data-ip-why]", box).value.trim();
      if (n <= 0) return toast("Scrivi quanti IP aggiungere", "err");
      return ipSave(e, s => { s.ip = num(s.ip) + n; s.ipLog = [...(s.ipLog || []), { at: new Date().toISOString(), kind: "earn", amount: n, why }]; return s; }, `+${n} IP`);
    }
    if (a === "ip-spend") {
      const key = $("[data-ip-target]", box).value, t = ipTargets(e).find(x => x.key === key);
      if (!t || t.cost == null) return toast("Già al massimo", "err");
      if (t.cost > num(sheetOf(e).ip)) return toast(`Servono ${t.cost} IP`, "err");
      return ipSave(e, s => {
        if (t.kind === "role") { migrateRoles(s, e); const r = s.roles[num(key.split(":")[1])]; if (!r) return null; r.rank = t.lvl + 1; }
        else if (key.startsWith("cskill:")) { const c = (s.custom || [])[num(key.split(":")[1])]; if (!c) return null; c.lvl = t.lvl + 1; }
        else { s.skills = { ...(s.skills || {}), [key.split(":")[1]]: t.lvl + 1 }; }
        s.ip = num(s.ip) - t.cost;
        s.ipLog = [...(s.ipLog || []), { at: new Date().toISOString(), kind: "spend", amount: t.cost, key, label: t.label, from: t.lvl, to: t.lvl + 1 }];
        return s;
      }, `${t.label} ${t.lvl} → ${t.lvl + 1} (−${t.cost} IP)`);
    }
    if (a === "ip-undo") {
      const last = (sheetOf(e).ipLog || []).slice(-1)[0]; if (!last) return;
      return ipSave(e, s => {
        s.ipLog = (s.ipLog || []).slice(0, -1);
        if (last.kind === "earn") { s.ip = Math.max(0, num(s.ip) - last.amount); return s; }
        if (last.key.startsWith("role:")) { migrateRoles(s, e); const r = s.roles[num(last.key.split(":")[1])]; if (r) r.rank = last.from; }
        else if (last.key.startsWith("cskill:")) { const c = (s.custom || [])[num(last.key.split(":")[1])]; if (c) c.lvl = last.from; }
        else { s.skills = { ...(s.skills || {}) }; if (last.from) s.skills[last.key.split(":")[1]] = last.from; else delete s.skills[last.key.split(":")[1]]; }
        s.ip = num(s.ip) + last.amount;
        return s;
      }, "Ultima voce annullata");
    }
  }

  // ---------- tab COMBATTIMENTO: HP, armatura, iniziativa, stati, modificatori, armi, Critical Injury ----------
  // ---------- ARMI: la stessa scheda per PG/NPC con scheda e per i nemici del GM ----------
  // X = sorgente dell'arma: addendi del colpo singolo e dell'autofire, danno, tabelle delle VD, come salvare e ridisegnare.
  // Colpo mirato e ultimo tiro restano in memoria (per dispositivo); munizioni e tabelle si salvano nell'arma.
  const cbMem = {};
  function finishSrc(X) {
    const w = X.w, T = CPR.weaponType(X.cat) || {};
    X.T = T; X.melee = CPR.isMelee(X.cat);
    X.autoMax = num(w.auto) || T.auto || 0;
    X.RT = X.melee ? null : CPR.rangeById(w.range || CPR.rangeDefault(X.cat));
    X.AT = X.autoMax ? CPR.autoById(w.autoRange || CPR.autoDefault(X.cat) || "smg") : null;
    X.ammo = ammoOf(X.cat, w.ammo || "");
    X.dmg = X.ammo.dmg && CPR.parse(X.ammo.dmg) ? X.ammo.dmg : (X.baseDmg || w.dmg || T.dmg || "");
    // autofire: danno e moltiplicatore massimo si possono cambiare per l'arma (es. modificata dal Tech)
    X.afDmg = w.afDmg && CPR.parse(w.afDmg) ? String(w.afDmg).replace(/\s+/g, "") : "2d6";
    X.base = X.single.reduce((t, p) => t + p.v, 0);
    X.afBase = X.auto.reduce((t, p) => t + p.v, 0);
    X.attrs = `data-src="${X.kind}" data-id="${esc(X.id)}" data-i="${X.i}"${X.tok ? ` data-tok="${esc(X.tok)}"` : ""}`;
    return X;
  }
  function pcSrc(e, i) {
    const s = sheetOf(e), w = (s.weapons || [])[i]; if (!w) return null;
    const k = skillByKey(e, weaponSkillKey(w.skill)) || skillByKey(e, "skill:handgun"), af = skillByKey(e, "skill:autofire");
    return finishSrc({
      kind: "pc", id: e.id, i, key: `pc:${e.id}:${i}`, w, cat: sheetWeaponCat(w), mods: [...(s.mods || []), ...roleMods(e), ...cyberFx(e).mods], skillLabel: k.label,
      weakness: num((caOf(e) || {}).weakness),
      fix: r => { const ca = caOf(e); if (ca && num(ca.recover) && CPR.FIREARMS.includes(sheetWeaponCat(w)) && r.crit === "fail") { const minus = r.dice.find(d => d.t === "minus"); if (minus) { r.total += minus.v; r.dice = r.dice.filter(d => d !== minus); } r.crit = ""; r.note = "Recuperare da un Disastro: fallimento critico ignorato (il dado conta come 1)"; } },
      single: [{ l: k.stat, v: statEff(e, k.stat) }, { l: k.label, v: k.lvl }],
      auto: [{ l: "REF", v: statEff(e, "REF") }, { l: "Autofire", v: af ? af.lvl : 0 }], afLvl: af ? af.lvl : 0,
      extra: () => sheetExtra(e), edit: Store.canEdit(),
      post: r => postRoll({ ...r, who: e.name, entryId: e.id }),
      save: (f, v) => sheetPatch(e.id, x => { if (x.weapons && x.weapons[i]) x.weapons[i][f] = v; return x; }),
      refresh: () => refreshSheetView(e.id),
    });
  }
  // nemico: valori derivati dalla scheda (malus dell'armatura, bonus di ruolo); dal token valgono le sue ferite e i suoi stati
  function enSrc(id, i, tokId) {
    const e = state.entries.find(x => x.id === id); if (!e || !e.enemy) return null;
    const D = enemyD(e), wp = D.weapons[i]; if (!wp) return null;
    const t = tokId ? state.tokens.find(x => x.id === tokId) : null;
    const pen = D.pen, arm = stat => pen && CPR.PEN_STATS.includes(stat) ? [{ l: "Armor", v: pen }] : [];
    const hp = t && tokHp(t), wd = hp && !D.painImmune ? CPR.wound(hp.hp, hp.max) : null;
    const extra = [...(wd && wd.pen ? [{ l: wd.label, v: wd.pen }] : []), ...(t ? statusParts(t.status) : [])];
    const af = D.skills.find(s => s.id === "autofire"), ca = D.ability && D.ability.ca;
    const raw = (enemyOf(e).weapons || [])[i] || {};
    return finishSrc({
      kind: "en", id: e.id, i, tok: t ? t.id : "", key: `en:${e.id}:${t ? t.id : "m"}:${i}`, w: { ...raw, name: wp.name }, cat: wp.cat, baseDmg: wp.dmg, mods: D.cyberMods || [], skillLabel: wp.skillLabel,
      sub: `${formula(wp, pen)}${wp.hq ? " · HQ" : wp.poor ? " · Poor: si inceppa con un 1" : ""}`,
      single: [{ l: wp.stat, v: wp.statV }, { l: wp.skillLabel, v: wp.lvl }, ...wp.bonus, ...arm(wp.stat)],
      auto: [{ l: "REF", v: D.stats.REF.v }, { l: "Autofire", v: af ? af.lvl : 0 }, ...(af ? af.bonus : []), ...wp.bonus.filter(b => b.role), ...arm("REF")], afLvl: af ? af.lvl : 0,
      extra: () => extra, edit: isGm() || !Store.gmReady,
      // Recuperare da un Disastro: sparando, il fallimento critico non toglie il secondo dado (il tiro resta un 1)
      fix: r => { if (ca && ca.recover && wp.firearm && r.crit === "fail") { const minus = r.dice.find(d => d.t === "minus"); if (minus) { r.total += minus.v; r.dice = r.dice.filter(d => d !== minus); } r.crit = ""; r.note = "Recuperare da un Disastro: fallimento critico ignorato (il tiro conta come 1)"; } },
      post: r => postRoll({ ...r, who: t ? tokName(t) : e.name, enemyId: e.id, gmOnly: !t || tokHidden(t) }),
      save: (f, v) => enemyPatch(e.id, E => { if (E.weapons && E.weapons[i]) E.weapons[i][f] = v; return E; }),
      refresh: () => { refreshEnemyView(e.id); if (onTable()) renderSel(); },
    });
  }
  const wSrc = (kind, id, i, tok) => kind === "en" ? enSrc(id, num(i), tok) : (() => { const e = state.entries.find(x => x.id === id); return e ? pcSrc(e, num(i)) : null; })();
  // modifica rapida di un nemico (munizioni, tabelle): salvo subito, la scheda è del GM
  async function enemyPatch(id, fn) {
    const e = state.entries.find(x => x.id === id); if (!e) return;
    const rec = { ...e, enemy: fn(JSON.parse(JSON.stringify(enemyOf(e)))) };
    upsert(state.entries, rec); refreshEnemyView(id); if (onTable()) renderSel();
    try { const saved = await Store.save("entries", rec); upsert(state.entries, saved); liveSend("entries", saved); } catch (err) { fail(err); }
  }
  function refreshEnemyView(id) {
    const box = $(`#modal .en[data-enemy="${CSS.escape(id)}"]`), e = state.entries.find(x => x.id === id); if (!box || !e) return;
    const y = $("#modal").scrollTop; box.outerHTML = enemyHtml(e); $("#modal").scrollTop = y;
  }
  function cbParts(X, mode, aimLoc) {
    const auto = mode === "auto" || mode === "supp";
    const parts = [...(auto ? X.auto : X.single)];
    if (aimLoc) parts.push({ l: `Colpo mirato (${(CPR.AIMED.find(a => a.id === aimLoc) || {}).label})`, v: -8 });
    if (num(X.ammo.atk)) parts.push({ l: X.ammo.name, v: num(X.ammo.atk) });
    parts.push(...modsFor(X.mods, ["attack", X.melee ? "melee" : "ranged", ...(aimLoc ? ["aimed"] : []), ...(auto ? ["autofire"] : [])]).map(m => ({ l: m.l, v: m.v })));
    return [...parts, ...X.extra()];
  }
  function cbRoll(X, mode = "single") {
    if (!X) return;
    const M = cbMem[X.key] = cbMem[X.key] || {};
    const auto = mode === "auto" || mode === "supp", aimLoc = !auto && M.aim ? (M.loc || "head") : "";
    const r = CPR.check(cbParts(X, mode, aimLoc));
    if (X.fix) X.fix(r);
    const T = auto ? X.AT : X.RT;
    const bands = T ? T.dv.map((dv, j) => ({ label: CPR.RANGE_BANDS[j], dv, hit: dv != null && r.total > dv, mult: mode === "auto" && dv != null && r.total > dv ? Math.min(r.total - dv, X.autoMax) : 0 })) : [];
    M.last = { mode, total: r.total, crit: r.crit, bands, aim: aimLoc };
    const reach = bands.filter(b => b.hit).map(b => b.label + (b.mult ? ` ×${b.mult}` : "")).join(", ");
    const aimed = aimLoc ? CPR.AIMED.find(a => a.id === aimLoc) : null;
    const hit = X.melee ? null : T ? { ok: !!reach, table: T.label, bands: bands.filter(b => b.hit).map(b => b.label + (b.mult ? ` ×${b.mult}` : "")), text: `${T.label}: ${reach ? `colpisce a ${reach}` : "fuori portata a ogni distanza"}` } : null;
    // attacco: come prima (chi, cosa, totale e addendi) + la riga delle distanze; gli effetti stanno nel tiro del danno
    const note = [r.note || "", X.melee ? "vs DEX + Evasion + 1d10 del difensore" : "",
      mode === "supp" ? "chi è entro 25 m tira WILL + Concentration contro questo totale" : ""].filter(Boolean).join(" · ");
    const what = { single: aimed ? `aimed shot (${aimed.label})` : "attack", auto: `autofire ×${X.autoMax}`, supp: "suppressive fire" }[mode];
    X.post({ kind: "check", label: `${X.w.name} · ${what}${X.ammo.id ? ` · ${X.ammo.name}` : ""}`, ...r, note, ...(hit ? { hit } : {}) });
    X.refresh();
  }
  function cbDamage(X, mult) {
    if (!X) return;
    const L = (cbMem[X.key] || {}).last, auto = L && L.mode === "auto" && mult;
    const r = CPR.rollExpr(auto ? X.afDmg : X.dmg, { damage: true });
    if (!r) return toast(`Danno non valido: "${auto ? X.afDmg : X.dmg}"`, "err");
    if (auto && mult > 1) { const raw = r.total - (r.crit === "injury" ? 5 : 0), add = raw * (mult - 1); r.mods.push({ l: `× ${mult} autofire`, v: add }); r.total += add; }
    const weak = X.weakness && (cbMem[X.key] || {}).weak ? [{ l: "Individuare Debolezze", v: X.weakness }] : [];
    [...(num(X.ammo.dmgMod) ? [{ l: X.ammo.name, v: num(X.ammo.dmgMod) }] : []), ...modsFor(X.mods, ["damage"]), ...weak].forEach(m => { r.mods.push({ l: m.l, v: m.v }); r.total += m.v; });
    const aimed = L && L.aim && !auto ? CPR.AIMED.find(a => a.id === L.aim) : null;
    const note = [aimed ? `${aimed.label}: ${aimed.eff}` : "", X.ammo.eff ? `${X.ammo.name}: ${X.ammo.eff}` : "", r.crit === "injury" ? "Due 6: tira la Critical Injury dalla scheda del bersaglio" : ""].filter(Boolean).join(" · ");
    X.post({ kind: "damage", label: `${X.w.name} · damage${auto ? ` (autofire ×${mult})` : aimed ? ` (aimed: ${aimed.label})` : ""}`, ...r, note });
  }
  // la tabella delle VD fa parte della descrizione dell'arma; dopo un tiro segna ✓ / ✗ per ogni distanza
  function cbTable(X, L) {
    if (X.melee) return `<p class="hint cb-melee">Mischia: il difensore tira DEX + Evasion + 1d10.</p>`;
    const rowsOf = (T, isAuto) => {
      if (!T) return "";
      const last = L && (isAuto ? L.mode === "auto" || L.mode === "supp" : L.mode === "single") ? L : null;
      return `<tr class="${last ? "rolled" : ""}"><th>${isAuto ? "Autofire" : "Colpo singolo"}</th>${CPR.RANGE_BANDS.map((_, j) => {
        if (j >= T.dv.length) return `<td class="na">—</td>`;
        const dv = T.dv[j], b = last && last.bands[j];
        return `<td class="${dv == null ? "na" : b ? (b.hit ? "hit" : "miss") : ""}">${dv == null ? "N/A" : dv}${b && dv != null ? `<i>${b.hit ? (b.mult ? `✓×${b.mult}` : "✓") : "✗"}</i>` : ""}</td>`;
      }).join("")}</tr>`;
    };
    const sel = (attr, list, cur, title) => X.edit ? `<select class="cb-tsel" ${attr} ${X.attrs} title="${title}" aria-label="${title}">${list.map(t => `<option value="${t.id}" ${t.id === cur ? "selected" : ""}>${esc(t.label)}</option>`).join("")}</select>` : esc((list.find(t => t.id === cur) || {}).label || "");
    return `<div class="cb-dvwrap"><table class="cb-dv">
      <thead><tr><th>VD</th>${CPR.RANGE_BANDS.map(b => `<th>${b.replace(" m", "")}</th>`).join("")}</tr></thead>
      <tbody>${rowsOf(X.RT, false)}${rowsOf(X.AT, true)}</tbody></table>
      <div class="cb-tables">${X.RT ? `Tabella ${sel("data-cb-table", CPR.RANGE_TABLES, X.RT.id, "Tabella delle distanze")}` : `<span class="hint">Nessuna tabella delle distanze</span>`}
        ${X.AT ? ` · autofire ${sel("data-cb-atable", CPR.AUTO_TABLES, X.AT.id, "Tabella dell'autofire")}` : ""}</div></div>`;
  }
  function cbCard(X) {
    if (!X) return "";
    const M = cbMem[X.key] || {}, L = M.last, A = X.attrs;
    const btn = (attrs, inner, cls, title = "") => `<button type="button" class="${cls}" ${attrs} ${title ? `title="${esc(title)}"` : ""}>${inner}</button>`;
    const ammoOpts = ammoList(X.cat);
    let dmg = "";
    if (L && L.mode === "auto") dmg = [...new Set(L.bands.filter(b => b.mult).map(b => b.mult))].sort((a, b) => a - b).map(m => btn(`data-action="cb-dmg" ${A} data-mult="${m}"`, `Danno ${esc(X.afDmg)} × ${m}`, "btn small yellow")).join("");
    if (!dmg) dmg = btn(`data-action="cb-dmg" ${A}`, `Damage ${esc(X.dmg)}`, "btn small yellow", L && L.aim ? (CPR.AIMED.find(a => a.id === L.aim) || {}).eff : "");
    const sub = X.sub || `${X.T.label ? esc(X.T.label) + " · " : ""}${esc(X.skillLabel)} · base ${X.base}${X.w.rof ? ` · ROF ${esc(X.w.rof)}` : ""}${X.w.mag ? ` · Mag ${esc(X.w.mag)}` : ""}`;
    return `<div class="wpn cb-wpn">
      <div class="cb-wh"><span class="wpn-n"><span class="nd-name">${esc(X.w.name)}</span>
        <small>${sub}${X.autoMax ? ` · Autofire ${esc(X.afDmg)} ×${X.autoMax}` : ""} · danno ${esc(X.dmg)}</small>${X.w.note ? `<em>${esc(X.w.note)}</em>` : ""}</span>
        ${L ? `<span class="cb-last ${L.crit ? "c-" + L.crit : ""}" title="Ultimo tiro">${L.total}</span>` : ""}</div>
      <div class="cb-ctl">
        ${btn(`data-action="cb-roll" ${A} data-mode="single"`, `⌖ Attack <b>${X.base}</b>`, "btn small", "Tira per colpire: il risultato si segna sulla tabella delle VD")}
        <label class="check cb-aim" title="Colpo mirato: −8 al tiro"><input type="checkbox" data-cb-aim ${A} ${M.aim ? "checked" : ""}> Mirato −8</label>
        <select class="cb-loc" data-cb-loc ${A} aria-label="Dove miri" ${M.aim ? "" : "disabled"}>${CPR.AIMED.map(a => `<option value="${a.id}" ${a.id === (M.loc || "head") ? "selected" : ""}>${a.label}</option>`).join("")}</select>
        ${X.autoMax ? btn(`data-action="cb-roll" ${A} data-mode="auto"`, `Autofire <b>${X.afBase}</b> ×${X.autoMax}`, "btn small ghost", `REF + Autofire ${X.afLvl} + 1d10, 10 colpi: danno ${X.afDmg} × quanto superi la VD, al massimo ×${X.autoMax}`) + btn(`data-action="cb-roll" ${A} data-mode="supp"`, "Soppressione", "btn small ghost", "Fuoco di soppressione, 10 colpi") : ""}
        ${ammoOpts.length > 1 || X.w.ammo ? `<label class="cb-ammo"><span class="sh-k">Munizioni</span><select data-cb-ammo ${A} ${X.edit ? "" : "disabled"}>${ammoOpts.map(a => `<option value="${esc(a.id)}" ${a.id === (X.ammo.id || "") ? "selected" : ""}>${esc(a.name)}</option>`).join("")}</select></label>` : ""}
        ${X.weakness ? `<label class="check cb-aim" title="Individuare Debolezze: +${X.weakness} al danno del primo colpo a segno del round (prima dell'armatura)"><input type="checkbox" data-cb-weak ${A} ${M.weak ? "checked" : ""}> 1° colpo del round +${X.weakness}</label>` : ""}
        <span class="cb-dmg">${dmg}</span>
      </div>
      ${X.ammo.eff ? `<p class="hint">${esc(X.ammo.name)}: ${esc(X.ammo.eff)}</p>` : ""}
      ${M.aim ? `<p class="hint">${esc((CPR.AIMED.find(a => a.id === (M.loc || "head")) || {}).eff || "")}</p>` : ""}
      ${cbTable(X, L)}
    </div>`;
  }
  // tiri rapidi (Party, token): attacco e danno
  const cbQuick = (X, cls = "chip") => !X ? "" : `<button type="button" class="${cls}" data-action="cb-roll" ${X.attrs} data-mode="single">⌖ ${esc(X.w.name)} <b>${X.base}</b></button>`
    + (X.autoMax ? `<button type="button" class="${cls}" data-action="cb-roll" ${X.attrs} data-mode="auto" title="Autofire">AF <b>${X.afBase}</b></button>` : "")
    + `<button type="button" class="${cls} y" data-action="cb-dmg" ${X.attrs}>${esc(X.dmg)}</button>`;

  function combatHtml(e) {
    const s = sheetOf(e), edit = Store.canEdit(), id = esc(e.id);
    if (!hasSheet(e)) return `<div class="cb" data-combat="${id}"><div class="empty"><div class="big">// SCHEDA VUOTA</div>Compila prima la scheda.
      ${edit ? `<br><button class="btn" data-action="edit-sheet" data-id="${id}">Compila la scheda</button>` : ""}</div></div>`;
    const max = hpMaxOf(e), hp = hpOf(e), w = woundOf(e);
    const pct = v => Math.max(0, Math.min(100, max ? v / max * 100 : 0));
    const roll = (what, inner, cls = "", title = "") => `<button type="button" class="${cls}" data-action="sheet-roll" data-id="${id}" data-roll="${what}" ${title ? `title="${esc(title)}"` : ""}>${inner}</button>`;
    const arm = loc => spBar(loc === "head" ? "Head" : "Body", armorOf(e, loc), edit && (d => `data-action="sheet-adj" data-id="${id}" data-f="armor.${loc}" data-d="${d}"`));
    const weapons = s.weapons || [];
    const mods = (s.mods || []).filter(m => m.on !== false && num(m.value));
    const im = modsFor([...(s.mods || []), ...roleMods(e), ...cyberFx(e).mods], ["init"]).reduce((t, m) => t + m.v, 0);
    const ca = caOf(e);
    return `
      <div class="cb sh" data-combat="${id}">
        <div class="sh-bar">
          <label class="sh-mod" title="Modificatore situazionale aggiunto a tutti i tiri (es. −2 copertura, +1 mira)">MOD <input type="number" step="1" data-sheet-mod value="${sheetMod}"></label>
          <span class="hint">Spunta «Mirato» e scegli le munizioni prima di attaccare · il tiro si segna sulla tabella delle VD.</span>
          <button type="button" class="btn ghost small cyan" data-action="dice-open">⬢ Dice log</button>
        </div>
        <div class="sh-top">
          <div class="sh-box hp w-${w.id}">
            <span class="l">Hit Points</span>
            <span class="n">${hp}<small> / ${max}</small></span>
            <span class="sh-hpbar"><i style="width:${pct(hp)}%"></i><b style="left:${pct(CPR.seriousAt(max))}%" title="Seriously Wounded"></b></span>
            <span class="sh-sub">${w.label}${w.pen ? ` · ${w.pen} to all Actions` : ""}</span>
            ${ca && num(ca.deflect) ? `<span class="sh-sub rl-hint">Deflettere Danni: −${num(ca.deflect)} al primo danno subito nel round</span>` : ""}
            ${edit ? adjBtns(e.id, "hp", [-5, -1, 1, 5]) : ""}
          </div>
          <div class="sh-box"><span class="l">Armor · SP</span>${arm("head")}${arm("body")}</div>
          <div class="sh-box">
            <span class="l">Initiative</span>
            ${roll("init", `<span class="n">REF ${statEff(e, "REF")}${im ? ` <small>${im > 0 ? "+" : ""}${im}</small>` : ""}</span><span class="sh-sub">tira REF + 1d10</span>`, "sh-rollbox")}
          </div>
          <div class="sh-box">
            <span class="l">Death Save</span>
            ${roll("death", `<span class="n">${statBase(e, "BODY")}</span><span class="sh-sub">BODY · penalty +${num(s.dsp)}</span>`, "sh-rollbox", "Tira 1d10 + penalità contro BODY")}
            ${edit ? adjBtns(e.id, "dsp", [-1, 1]) : ""}
          </div>
          <div class="sh-box"><span class="l">Move</span><span class="n">${statEff(e, "MOVE") * 2}<small> m/turn</small></span><span class="sh-sub">${statEff(e, "MOVE")} squares · Run ${statEff(e, "MOVE") * 4} m</span></div>
          <div class="sh-box"><span class="l">Evasion</span>${(() => { const k = skillByKey(e, "skill:evasion"); return roll("skill:evasion", `<span class="n">${statEff(e, "DEX") + (k ? k.lvl : 0)}</span><span class="sh-sub">DEX + Evasion${statEff(e, "REF") >= 8 ? " · schivi anche i proiettili" : ""}</span>`, "sh-rollbox", "Tira DEX + Evasion + 1d10"); })()}</div>
        </div>
        ${pcPen(e) ? `<div class="en-pen">Armatura pesante: ${pcPen(e)} a REF, DEX e MOVE (già calcolato nei valori e nei tiri)</div>` : ""}
        <div class="sh-status"><span class="sh-k">Stati</span>${statusChips(s.status, edit ? sheetStatusAttrs(e) : null)}</div>
        ${mods.length ? `<div class="sh-mods"><span class="sh-k">Modificatori speciali</span>${mods.map(m => `<span class="st-chip" title="${esc(m.note || "")}">${esc(m.name || "Modificatore")} <b>${num(m.value) > 0 ? "+" : ""}${num(m.value)}</b> <small>${esc((CPR.MOD_TARGETS.find(t => t[0] === m.target) || [, ""])[1])}</small></span>`).join("")}</div>` : ""}
        ${cyberFxHtml(e, true)}
        <div class="sh-sec-head"><h4>Weapons</h4></div>
        ${weapons.length ? `<div class="sh-weapons">${weapons.map((_, i) => cbCard(pcSrc(e, i))).join("")}</div>` : `<p class="hint">Nessuna arma: aggiungile da «Modifica scheda».</p>`}
        ${critBlock(e, edit)}
      </div>`;
  }
  function editSheet(id) {
    const e = state.entries.find(x => x.id === id); if (!e) return;
    const fresh = !e.sheet;
    const s = sheetOf(e), stats = s.stats || {}, lv = s.skills || (fresh ? Object.fromEntries(CPR.SKILLS.filter(k => k.basic).map(k => [k.id, 2])) : {});
    const statOpts = v => CPR.STATS.map(st => `<option ${st.id === v ? "selected" : ""}>${st.id}</option>`).join("");
    const cusRow = (c = {}) => `<div class="sh-row cus">
      <input data-f="name" placeholder="es. Language (Japanese)" value="${esc(c.name)}">
      <select data-f="group">${SK_GROUPS.map(g => `<option ${g === (c.group || "Other") ? "selected" : ""}>${g}</option>`).join("")}</select>
      <select data-f="stat">${statOpts(c.stat || "INT")}</select>
      <input data-f="lvl" type="number" min="0" max="10" step="1" placeholder="LVL" value="${esc(c.lvl ?? "")}">
      <button type="button" class="gp-btn del" data-row-del aria-label="Rimuovi">✕</button></div>`;
    const wpnRow = (w = {}) => `<div class="sh-row wpn-row">
      <select data-f="cat" title="Categoria: decide VD delle distanze e autofire">${CPR.WEAPON_TYPES.map(t => `<option value="${t.id}" ${t.id === (w.name || w.cat ? (w.cat || CPR.guessWeapon(w.name, w.skill)) : "hpistol") ? "selected" : ""}>${t.label}</option>`).join("")}<option value="" ${(w.name || w.cat) && !(w.cat || CPR.guessWeapon(w.name, w.skill)) ? "selected" : ""}>Altro…</option></select>
      <input data-f="name" placeholder="Arma (es. Heavy Pistol)" value="${esc(w.name)}">
      <select data-f="skill">${CPR.WEAPON_SKILLS.map(k => `<option value="${k}" ${k === (w.skill || "handgun") ? "selected" : ""}>${CPR.skill(k).label}</option>`).join("")}</select>
      <input data-f="dmg" placeholder="Danno (3d6)" value="${esc(w.dmg)}">
      <input data-f="rof" placeholder="ROF" value="${esc(w.rof)}">
      <input data-f="mag" placeholder="Mag" value="${esc(w.mag)}">
      <input data-f="afDmg" placeholder="Autofire 2d6" title="Danno dell'autofire (vuoto = 2d6). Vale anche 3d6kh2 = tira 3d6 e tieni i 2 più alti" value="${esc(w.afDmg || "")}">
      <input data-f="auto" type="number" min="0" max="10" placeholder="× max" title="Moltiplicatore massimo dell'autofire (vuoto = quello della categoria: SMG 3, fucile d'assalto 4; 0 o vuoto su armi senza autofire)" value="${esc(w.auto ?? "")}">
      <input data-f="note" placeholder="Note (Smartgun, Excellent…)" value="${esc(w.note)}">
      <input type="hidden" data-f="ammo" value="${esc(w.ammo || "")}"><input type="hidden" data-f="range" value="${esc(w.range || "")}"><input type="hidden" data-f="autoRange" value="${esc(w.autoRange || "")}">
      <button type="button" class="gp-btn del" data-row-del aria-label="Rimuovi">✕</button></div>`;
    const modRow = (m = {}) => `<div class="sh-row mod-row">
      <label class="check" title="Attivo"><input type="checkbox" data-f="on" ${m.on === false ? "" : "checked"}></label>
      <input data-f="name" placeholder="Nome (es. Mirino ottico)" value="${esc(m.name || "")}">
      <select data-f="target">${CPR.MOD_TARGETS.map(([v, l]) => `<option value="${v}" ${v === (m.target || "attack") ? "selected" : ""}>${l}</option>`).join("")}</select>
      <input data-f="value" type="number" min="-20" max="20" placeholder="±" value="${esc(m.value ?? "")}">
      <input data-f="note" placeholder="Note (da dove viene)" value="${esc(m.note || "")}">
      <button type="button" class="gp-btn del" data-row-del aria-label="Rimuovi">✕</button></div>`;
    const a = loc => (s.armor || {})[loc] || {};
    const autoHp = CPR.hpMax(num(stats.BODY), num(stats.WILL));
    openModal(`
      <form class="form" id="sheet-form">
        <div class="modal-head"><h2>// SCHEDA · ${esc(e.name)}</h2><button type="button" class="x" data-action="open-entry-tab" data-id="${esc(e.id)}" data-tab="sheet" aria-label="Chiudi">×</button></div>
        <div class="modal-body">
          <h3 class="sh-h">STATs</h3>
          <div class="sh-stat-in">${CPR.STATS.map(st => `<label><span>${st.id}</span><input name="st-${st.id}" type="number" min="0" max="20" step="1" value="${esc(stats[st.id] ?? "")}" title="${st.label}"></label>`).join("")}</div>
          <p class="hint">HP max calcolati: <b id="sh-auto-hp">${autoHp}</b> (10 + 5 × (BODY + WILL) / 2, arrotondato per eccesso). L'EMP si abbassa da sola con l'umanità del cyberware.</p>
          <div class="fields">
            <div class="field full"><span class="lbl">Ruoli e gradi</span><span class="hint">Si gestiscono nella tab «Ruoli» del dossier (anche più di uno): ${esc(rolesOf(e).map(r => `${(RL.roleById(r.id) || {}).it} ${num(r.rank)}`).join(", ") || "nessuno")}.</span></div>
            <div class="field"><label for="sh-hpm">HP max (vuoto = automatici)</label><input id="sh-hpm" name="hpMax" type="number" min="1" value="${esc(s.hpMax ?? "")}" placeholder="${autoHp}"></div>
            <div class="field"><label for="sh-hp">HP attuali (vuoto = pieni)</label><input id="sh-hp" name="hp" type="number" value="${esc(s.hp ?? "")}"></div>
            ${[["head", "ah", "testa"], ["body", "ab", "corpo"]].map(([loc, p, l]) => { const ar = a(loc), ty = sheetArmorType(ar); return `
            <div class="field"><label for="sh-${p}">Armatura ${l} · tipo / SP</label>
              <div class="sh-pair"><select id="sh-${p}" data-sh-arm="${p}">${CPR.ARMOR_TYPES.map(t => `<option value="${t.id}" ${t.id === ty ? "selected" : ""}>${t.label}${t.sp ? ` (SP ${t.sp}${t.pen ? `, ${t.pen}` : ""})` : ""}</option>`).join("")}<option value="custom" ${ty === "custom" ? "selected" : ""}>Altro…</option></select>
              <input name="${p}-sp" type="number" min="0" value="${esc(ar.sp ?? "")}" placeholder="SP"></div>
              <input name="${p}-name" value="${esc(ar.name)}" placeholder="Nome (es. Light Armorjack)" style="margin-top:4px"></div>`; }).join("")}
            <div class="field full"><label class="check"><input type="checkbox" name="armorNoPen" ${s.armorNoPen ? "checked" : ""}> Armatura migliorata dal Tech: niente malus</label>
              <span class="hint">Medium e Heavy Armorjack danno −2 a REF, DEX e MOVE; Flak e Metalgear −4. Vale il peggiore tra testa e corpo.</span></div>
            <div class="field"><label for="sh-rep">Reputation</label><input id="sh-rep" name="rep" type="number" min="0" value="${esc(s.rep ?? "")}"></div>
            <div class="field"><label for="sh-ip">Improvement Points</label><input id="sh-ip" name="ip" type="number" min="0" value="${esc(s.ip ?? "")}"></div>
            <div class="field full"><label for="sh-own">Giocatore (email dell'account)</label><input id="sh-own" name="owner" type="email" value="${esc(s.owner || "")}" placeholder="email con cui il giocatore fa login"><span class="hint">Serve per riconoscere il PG di chi ha fatto l'accesso: i tiri partono a suo nome.</span></div>
          </div>

          <h3 class="sh-h">Skills <small>livello 0–10 · STAT tra parentesi</small></h3>
          <div class="sh-skill-in">${CPR.SKILL_GROUPS.map(g => `<fieldset><legend>${g.name}</legend>${g.skills.map(k => `
            <label class="${k.basic ? "basic" : ""}"><span>${esc(k.label)} <small>(${k.stat})${k.x2 ? " ×2" : ""}</small></span><input name="sk-${k.id}" type="number" min="0" max="10" step="1" value="${esc(lv[k.id] ?? "")}"></label>`).join("")}</fieldset>`).join("")}</div>
          <span class="lbl">Abilità personalizzate</span>
          <div class="sh-rows" id="sh-cus">${(s.custom || []).map(cusRow).join("")}</div>
          <button type="button" class="btn ghost small cyan" data-sh-add="cus">+ Abilità (Language, Science, Local Expert…)</button>

          <h3 class="sh-h">Weapons</h3>
          <div class="sh-rows" id="sh-wpn">${(s.weapons || []).map(wpnRow).join("")}</div>
          <button type="button" class="btn ghost small cyan" data-sh-add="wpn">+ Arma</button>

          <h3 class="sh-h">Modificatori speciali <small>cyberware, talenti, situazioni fisse · si sommano da soli ai tiri del tipo scelto</small></h3>
          <div class="sh-rows" id="sh-mods">${(s.mods || []).map(modRow).join("")}</div>
          <button type="button" class="btn ghost small cyan" data-sh-add="mod">+ Modificatore (es. Mirino ottico +1 ai colpi mirati)</button>

          <div class="fields" style="margin-top:18px">
            <div class="field full"><label for="sh-crit">Critical Injuries</label><textarea id="sh-crit" name="crit" rows="2">${esc(s.crit || "")}</textarea></div>
            <div class="field full"><label for="sh-notes">Notes</label><textarea id="sh-notes" name="notes" rows="3">${esc(s.notes || "")}</textarea></div>
          </div>
        </div>
        <div class="modal-foot">
          <button type="button" class="btn ghost small left" data-action="open-entry-tab" data-id="${esc(e.id)}" data-tab="sheet">Annulla</button>
          <button type="submit" class="btn">Salva scheda</button>
        </div>
      </form>`);
    const form = $("#sheet-form");
    form.addEventListener("input", ev => {
      if (/^st-(BODY|WILL)$/.test(ev.target.name)) $("#sh-auto-hp").textContent = CPR.hpMax(num(form["st-BODY"].value), num(form["st-WILL"].value));
    });
    // tipo di armatura scelto: compilo SP e nome
    form.addEventListener("change", ev => {
      // categoria dell'arma: compilo danno, ROF, caricatore e skill (il nome solo se è vuoto o generico)
      const wc = ev.target.closest(".wpn-row [data-f=cat]");
      if (wc) {
        const T = CPR.weaponType(wc.value), row = wc.closest(".sh-row"), set = (f, v) => { const i = $(`[data-f=${f}]`, row); if (i) i.value = v ?? ""; };
        set("range", ""); set("autoRange", "");
        if (T) { set("skill", T.skill); set("dmg", T.dmg === "BODY" ? CPR.brawlDmg(num(form["st-BODY"].value)) : T.dmg); set("rof", T.rof); set("mag", T.mag || "");
          const nm = $("[data-f=name]", row).value.trim(); if (!nm || CPR.WEAPON_TYPES.some(x => x.label === nm)) set("name", T.label); }
        return;
      }
      const sel = ev.target.closest("[data-sh-arm]"); if (!sel) return;
      const t = CPR.armorType(sel.value); if (!t) return;
      form.elements[sel.dataset.shArm + "-sp"].value = t.sp || "";
      form.elements[sel.dataset.shArm + "-name"].value = t.sp ? t.label : "";
    });
    form.addEventListener("click", ev => {
      const add = ev.target.closest("[data-sh-add]");
      if (add) {
        const kind = add.dataset.shAdd, box = $(kind === "cus" ? "#sh-cus" : kind === "mod" ? "#sh-mods" : "#sh-wpn", form);
        box.insertAdjacentHTML("beforeend", kind === "cus" ? cusRow() : kind === "mod" ? modRow() : wpnRow());
        $(".sh-row:last-child input", box).focus();
      }
      const del = ev.target.closest("[data-row-del]"); if (del) del.closest(".sh-row").remove();
    });
    form.addEventListener("submit", async ev => {
      ev.preventDefault();
      const v = n => form[n].value.trim(), nv = n => v(n) === "" ? null : num(v(n));
      const stats = {}, skills = {};
      for (const st of CPR.STATS) { const x = nv("st-" + st.id); if (x != null) stats[st.id] = x; }
      for (const k of CPR.SKILLS) { const x = nv("sk-" + k.id); if (x) skills[k.id] = x; }
      const custom = readRows(form, "#sh-cus .sh-row").filter(c => c.name).map(c => ({ ...c, lvl: num(c.lvl) }));
      const weapons = readRows(form, "#sh-wpn .sh-row").filter(w => w.name).map(w => ({ ...w, auto: w.auto === "" ? "" : num(w.auto) }));
      const badW = weapons.filter(w => (w.dmg && !CPR.parse(w.dmg)) || (w.afDmg && !CPR.parse(w.afDmg)));
      if (badW.length) return toast(`Danno non valido in: ${badW.map(w => w.name).join(", ")} (es. 3d6, 2d6+2, 3d6kh2)`, "err");
      const mods = readRows(form, "#sh-mods .sh-row").filter(m => m.name || num(m.value)).map(m => ({ ...m, value: num(m.value) }));
      // la SP attuale (ablazione) resta, ma non oltre la nuova SP massima
      const armor = {};
      for (const [loc, p] of [["head", "ah"], ["body", "ab"]]) {
        const sp = nv(p + "-sp"), old = armorOf(e, loc);
        armor[loc] = { type: $(`[data-sh-arm=${p}]`, form).value, name: v(p + "-name"), sp, cur: sp == null ? null : Math.min(old.cur, sp) };
        if (old.sp !== sp) armor[loc].cur = sp;
      }
      const sheet = { ...migrateRoles(JSON.parse(JSON.stringify(s)), e), owner: v("owner"), stats, skills, custom, weapons, armor, armorNoPen: form.elements["armorNoPen"].checked,
        hpMax: nv("hpMax"), hp: nv("hp"), rep: nv("rep"), ip: nv("ip"), crit: v("crit"), notes: v("notes"), mods };
      try {
        const saved = await Store.save("entries", { ...e, sheet });
        upsert(state.entries, saved); liveSend("entries", saved);
        toast("Scheda salvata", "ok"); openEntry(saved.id, "sheet"); refreshParty();
        if (onTable()) { renderTokens(); renderSide(); }
      } catch (err) { fail(err); }
    });
  }



  // ---------- REGOLE DELLA CAMPAGNA: munizioni e stati (meta "rules", li modifica il GM) ----------
  const rules = () => state.rules || { id: "rules", ammo: [], status: CPR.DEFAULT_STATUS };
  const STD_AMMO = { id: "", name: "Standard", atk: 0, dmg: "", dmgMod: 0, eff: "" };
  const ammoList = cat => [STD_AMMO, ...(rules().ammo || []).filter(a => !a.fam || ((CPR.weaponType(cat) || {}).ammo === a.fam))];
  const ammoOf = (cat, id) => ammoList(cat).find(a => a.id === id) || STD_AMMO;
  const statusList = () => rules().status || [];
  const statusOf2 = id => statusList().find(s => s.id === id);
  // malus degli stati di chi agisce (es. Accecato −4, se il GM lo imposta)
  const statusParts = ids => (ids || []).map(statusOf2).filter(st => st && num(st.atk)).map(st => ({ l: st.name, v: num(st.atk) }));
  // modificatori speciali della scheda attivi per un certo tipo di tiro
  const modsFor = (mods, targets) => (mods || []).filter(m => m && m.on !== false && targets.includes(m.target) && num(m.value)).map(m => ({ l: m.name || "Modificatore", v: num(m.value), target: m.target }));

  // contesto del tiro per un'arma della scheda
  const sheetWeaponCat = w => w.cat || CPR.guessWeapon(w.name, w.skill);
  function sheetExtra(e) {
    const s = sheetOf(e), w = woundOf(e), out = [];
    if (w.pen && !(w.id === "serious" && cyberItems(e).length && cyberFx(e).pain)) out.push({ l: w.label, v: w.pen });
    out.push(...statusParts(s.status), ...modsFor(s.mods, ["all"]));
    if (sheetMod) out.push({ l: "MOD", v: sheetMod });
    return out;
  }



  // ---------- stati, Critical Injury, modificatori speciali ----------
  // chip degli stati · attrs(op, id) = attributi dei pulsanti, oppure null se non si può modificare
  function statusChips(ids, attrs) {
    const list = (ids || []).map(id => statusOf2(id) || { id, name: "?" });
    const add = statusList().filter(st => !(ids || []).includes(st.id));
    return `<div class="st-chips">${list.map(st => `<span class="st-chip" title="${esc([st.atk ? `${st.atk > 0 ? "+" : ""}${st.atk} alle prove` : "", st.dmg ? `${st.dmg} danni per round` : "", st.eff].filter(Boolean).join(" · ") || "Effetto da definire nelle Regole della campagna")}">
        ${esc(st.name)}${num(st.atk) ? ` <b>${st.atk > 0 ? "+" : ""}${st.atk}</b>` : ""}
        ${st.dmg && attrs ? `<button type="button" class="gp-btn" ${attrs("roll", st.id)} title="Tira il danno del round: ${esc(st.dmg)}" aria-label="Tira il danno dello stato">⚄</button>` : ""}
        ${attrs ? `<button type="button" class="gp-btn del" ${attrs("del", st.id)} aria-label="Togli lo stato">✕</button>` : ""}</span>`).join("")}
      ${attrs && add.length ? `<select class="st-add" ${attrs("add", "")} aria-label="Aggiungi uno stato"><option value="">+ stato…</option>${add.map(st => `<option value="${esc(st.id)}">${esc(st.name)}</option>`).join("")}</select>` : ""}
      ${!list.length && !attrs ? `<span class="hint">nessuno</span>` : ""}</div>`;
  }
  // il select «+ stato» lavora al change, i pulsanti al click
  function statusOp(el, apply) {
    const op = el.dataset.stOp, id = el.tagName === "SELECT" ? el.value : el.dataset.st;
    if (!id) return;
    if (op === "roll") { const st = statusOf2(id); const r = st && CPR.rollExpr(st.dmg, { damage: false }); if (r) apply.roll(st, r); return; }
    apply.set(list => op === "add" ? [...new Set([...(list || []), id])] : (list || []).filter(x => x !== id));
  }
  const sheetStatusAttrs = e => (op, st) => `${op === "add" ? "" : `data-action="sheet-status" `}data-st-sheet="${esc(e.id)}" data-st-op="${op}" data-st="${esc(st)}"`;
  const sheetStatusApply = e => ({
    set: fn => sheetPatch(e.id, s => { s.status = fn(s.status); return s; }),
    roll: (st, r) => postRoll({ kind: "damage", who: e.name, entryId: e.id, label: `${st.name} · danno del round`, ...r, note: st.eff || "" }),
  });

  const lastCrit = {};
  function critRoll(who, loc, post) {
    const r = CPR.rollCrit(loc), I = r.injury;
    post({ kind: "check", label: `Critical Injury · ${loc === "head" ? "testa" : "corpo"}: ${I.name}`, dice: r.dice, mods: [], total: r.total, inj: I.name,
      note: `${I.eff}${I.dsp ? " · +1 alla penalità del Death Save" : ""} · +5 danni diretti (già nel tiro di danno)` });
    return { ...I, loc };
  }
  function critBlock(e, edit) {
    const s = sheetOf(e), L = lastCrit[e.id];
    return `<div class="block crit-block"><h4>Critical Injuries</h4>
      ${s.crit ? `<div class="prewrap">${esc(s.crit)}</div>` : `<p class="hint">Nessuna. Con due 6 sul danno si tira la Critical Injury (2d6, corpo o testa).</p>`}
      <div class="pc-rolls">
        <button type="button" class="chip r" data-action="sheet-crit" data-id="${esc(e.id)}" data-loc="body">⚄ Critical Injury · corpo</button>
        <button type="button" class="chip r" data-action="sheet-crit" data-id="${esc(e.id)}" data-loc="head">⚄ Critical Injury · testa</button>
        ${L && edit ? `<span class="crit-last">Uscita: <b>${esc(L.name)}</b> <button type="button" class="btn ghost small" data-action="sheet-crit-add" data-id="${esc(e.id)}">+ Aggiungi alla scheda</button></span>` : ""}
      </div></div>`;
  }

  // ---------- modulo delle Regole della campagna (GM) ----------
  const AMMO_FAMS = [...new Set(CPR.WEAPON_TYPES.map(w => w.ammo).filter(Boolean))];
  function editRules() {
    if (!isGm() && Store.gmReady) return;
    const R = rules();
    const aRow = (a = {}) => `<div class="sh-row rl-ammo">
      <input data-f="name" placeholder="Nome (es. Perforanti)" value="${esc(a.name || "")}">
      <select data-f="fam" title="Per quali armi">${[["", "Tutte le armi"], ...AMMO_FAMS.map(f => [f, f])].map(([v, l]) => `<option value="${esc(v)}" ${v === (a.fam || "") ? "selected" : ""}>${esc(l)}</option>`).join("")}</select>
      <input data-f="atk" type="number" min="-10" max="10" placeholder="± colpire" title="Modificatore al tiro per colpire" value="${esc(a.atk || "")}">
      <input data-f="dmg" placeholder="Danno al posto (es. 2d6)" title="Danno che sostituisce quello dell'arma (vuoto = quello dell'arma)" value="${esc(a.dmg || "")}">
      <input data-f="dmgMod" type="number" min="-20" max="20" placeholder="± danno" title="Modificatore al danno" value="${esc(a.dmgMod || "")}">
      <input data-f="eff" placeholder="Effetto (compare nel Dice log)" value="${esc(a.eff || "")}" class="wide">
      <input type="hidden" data-f="id" value="${esc(a.id || "")}">
      <button type="button" class="gp-btn del" data-row-del aria-label="Rimuovi">✕</button></div>`;
    const sRow = (st = {}) => `<div class="sh-row rl-st">
      <input data-f="name" placeholder="Nome (es. In fiamme)" value="${esc(st.name || "")}">
      <input data-f="atk" type="number" min="-10" max="10" placeholder="± prove" title="Modificatore a tutte le prove di chi ha lo stato" value="${esc(st.atk || "")}">
      <input data-f="dmg" placeholder="Danno per round (es. 1d6)" value="${esc(st.dmg || "")}">
      <input data-f="eff" placeholder="Effetto" value="${esc(st.eff || "")}" class="wide">
      <input type="hidden" data-f="id" value="${esc(st.id || "")}">
      <button type="button" class="gp-btn del" data-row-del aria-label="Rimuovi">✕</button></div>`;
    openModal(`
      <form class="form" id="rules-form">
        <div class="modal-head"><h2>// REGOLE DELLA CAMPAGNA</h2><button type="button" class="x" data-action="close" aria-label="Chiudi">×</button></div>
        <div class="modal-body">
          <h3 class="sh-h">Munizioni <small>si scelgono nel tiro per colpire di ogni arma compatibile · «Standard» c'è sempre</small></h3>
          <div class="sh-rows" id="rl-ammo">${(R.ammo || []).map(aRow).join("")}</div>
          <button type="button" class="btn ghost small cyan" data-rl-add="ammo">+ Munizione</button>
          <h3 class="sh-h">Stati <small>si mettono su schede e token · il modificatore vale per tutte le prove di chi ha lo stato</small></h3>
          <div class="sh-rows" id="rl-st">${(R.status || []).map(sRow).join("")}</div>
          <button type="button" class="btn ghost small cyan" data-rl-add="st">+ Stato</button>
          <p class="hint" style="margin-top:14px">I modificatori legati al cyberware o ai talenti (es. mirino ottico +1 ai colpi mirati) si mettono nella scheda di ogni personaggio, sezione «Modificatori speciali».</p>
        </div>
        <div class="modal-foot"><button type="button" class="btn ghost small left" data-action="close">Annulla</button><button type="submit" class="btn">Salva regole</button></div>
      </form>`);
    const form = $("#rules-form");
    form.addEventListener("click", ev => {
      const add = ev.target.closest("[data-rl-add]");
      if (add) { const box = $(add.dataset.rlAdd === "ammo" ? "#rl-ammo" : "#rl-st", form); box.insertAdjacentHTML("beforeend", add.dataset.rlAdd === "ammo" ? aRow() : sRow()); $(".sh-row:last-child input", box).focus(); }
      const del = ev.target.closest("[data-row-del]"); if (del) del.closest(".sh-row").remove();
    });
    form.addEventListener("submit", async ev => {
      ev.preventDefault();
      const idOf = (x, p) => x.id || p + NET.uid();
      const ammo = readRows(form, "#rl-ammo .sh-row").filter(a => a.name).map(a => ({ id: idOf(a, "am-"), name: a.name, fam: a.fam, atk: num(a.atk), dmg: a.dmg, dmgMod: num(a.dmgMod), eff: a.eff }));
      const status = readRows(form, "#rl-st .sh-row").filter(x => x.name).map(x => ({ id: idOf(x, "st-"), name: x.name, atk: num(x.atk), dmg: x.dmg, eff: x.eff }));
      const bad = [...ammo.filter(a => a.dmg && !CPR.parse(a.dmg)).map(a => a.name), ...status.filter(x => x.dmg && !CPR.parse(x.dmg)).map(x => x.name)];
      if (bad.length) return toast(`Danno non valido in: ${bad.join(", ")} (es. 2d6 o 1d6+2)`, "err");
      try {
        const saved = await Store.save("meta", { ...rules(), id: "rules", ammo, status });
        state.rules = saved; liveSend("meta", saved);
        toast("Regole salvate", "ok"); closeModal(); route();
      } catch (err) { fail(err); }
    });
  }

  // ---------- CYBERDECK (Netrunner) ----------
  // sheet.deck = { name, slots, bodyweight, cyberarm, items[{ ref, …campi del personalizzato, cur (REZ attuale), on (Rezzato), used, dead }] }
  // Lo stesso riquadro serve alle schede dei PG (con lo stato della Netrun) e ai nemici Netrunner (solo tiri).
  const decksOf = e => { const s = sheetOf(e); return Array.isArray(s.decks) ? s.decks : s.deck ? [s.deck] : []; };
  const deckIdx = e => clamp(num(sheetOf(e).deckActive), 0, Math.max(0, decksOf(e).length - 1));
  const activeDeck = e => decksOf(e)[deckIdx(e)] || { name: "Cyberdeck", slots: 7, items: [] };
  // nel salvataggio porto le schede vecchie (deck singolo) all'elenco
  const migrateDecks = s => { if (!Array.isArray(s.decks)) s.decks = s.deck ? [s.deck] : []; delete s.deck; s.deckActive = clamp(num(s.deckActive), 0, Math.max(0, s.decks.length - 1)); return s; };
  const isNetrunner = e => /netrunner/i.test((e && e.role) || "") || /^(interface|interfaccia)$/i.test(String(sheetOf(e).ability || "").trim())
    || rolesOf(e).some(r => r.id === "netrunner") || decksOf(e).some(d => (d.items || []).length);
  const ifaceOf = e => roleOfE(e, "netrunner") ? roleRankOf(e, "netrunner") : num(sheetOf(e).rank);
  const clsTag = I => I.hw ? "Hardware" : I.ice ? `Black ICE · ${(NET.CLASSES[I.cls] || {}).short || ""}` : (NET.CLASSES[I.cls] || {}).label || "";
  const vsOf = I => I.cls === "antiprogram" ? "vs DEF + 1d10 di un programma o Black ICE" : "vs Interface + 1d10 del Netrunner";

  // o = { iface, roll(what) → attributi del pulsante, adj(i, op) → attributi (null = sola lettura), reset → attributi }
  function deckHtml(deck, o) {
    deck = deck || { items: [] };
    const S = NET.deckSlots(deck), B = NET.boosts(deck), items = deck.items || [];
    const bsum = k => (B[k] || []).reduce((t, b) => t + b.v, 0);
    const btn = (what, inner, cls = "chip", title = "") => `<button type="button" class="${cls}" ${o.roll(what)} ${title ? `title="${esc(title)}"` : ""}>${inner}</button>`;
    const ad = (i, op, inner, title, cls = "gp-btn") => `<button type="button" class="${cls}" ${o.adj(i, op)} title="${esc(title)}" aria-label="${esc(title)}">${inner}</button>`;
    const abil = NET.ABILITIES.map(a => btn("ab:" + a.id, `${esc(a.name)} <b>${o.iface + bsum(a.id)}</b>`, a.attack ? "chip r" : "chip",
      `${a.name}: Interface${bsum(a.id) ? " + boost" : ""} + 1d10 · ${a.eff}`) + (a.dmg ? btn(`ab:${a.id}:dmg`, esc(a.dmg[0].x), "chip y", `Danno dello ${a.name}`) : "")).join("");
    const rows = items.map((it, i) => {
      const I = NET.itemInfo(it), cur = NET.curRez(it, I), rezzable = NET.hasRez(I), off = !I.ice && NET.offensive(I.cls);
      const stats = I.hw ? `${I.slots} slot` : I.ice ? `PER ${I.per} · SPD ${I.spd} · ATK ${I.atk} · DEF ${I.def} · REZ ${cur}/${I.rez} · ${I.slots} slot`
        : `ATK ${I.atk} · DEF ${I.def} · REZ ${rezzable ? `${cur}/` : ""}${I.rez}`;
      let acts = "";
      if (!I.hw && !it.dead) {
        if (I.ice || off) acts += btn(`it:${i}:atk`, `Attack <b>${I.ice ? I.atk : o.iface + I.atk}</b>`, "btn small", I.ice ? `ATK ${I.atk} + 1d10 · ${vsOf(I)}` : `Interface ${o.iface} + ATK ${I.atk} + 1d10 · ${vsOf(I)}`);
        (I.dmg || []).forEach((d, j) => { acts += btn(`it:${i}:dmg:${j}`, `${esc(d.x)}${d.u === "REZ" ? " REZ" : ""} <small>${esc(d.l)}</small>`, "btn small yellow", `${I.name}: ${d.x} ${d.l}`); });
        if ((I.fx || []).length) acts += btn(`it:${i}:fx`, `Effect <small>${esc(I.fx.map(f => f.x).join(" / "))}</small>`, "btn small yellow", I.eff);
        else if (!(I.dmg || []).length && (off || I.ice)) acts += btn(`it:${i}:fx`, "Effect", "btn small yellow", I.eff);
        if (rezzable && (I.ice || I.def > 0)) acts += btn(`it:${i}:def`, `DEF <b>${I.def}</b>`, "btn small ghost cyan", "Difesa: DEF + 1d10 contro un attacco");
      }
      let ctl = "";
      if (o.adj && !I.hw) {
        if (rezzable && !it.dead) ctl += ad(i, "on", it.on ? "◉ Rezzed" : "○ Rez", it.on ? "Disattiva (Azione NET)" : "Attiva (Azione NET)", `btn small ghost cyan nd-tog ${it.on ? "on" : ""}`);
        if (rezzable && !it.dead) ctl += `<span class="sh-adj">${ad(i, "rez:-1", "−1", "−1 REZ")}${ad(i, "rez:1", "+1", "+1 REZ")}</span>${rezIn(sg => o.adj(i, "rez:in" + sg))}`;
        if (I.once) ctl += ad(i, "used", it.used ? "✓ usato" : "1×", it.used ? "Già usato in questa Netrun: clicca per annullare" : "Una volta per Netrun: segna come usato", `btn small ghost ${it.used ? "yellow" : ""}`);
        ctl += ad(i, "dead", it.dead ? "↺" : "✕", it.dead ? "Ripristina (non più Distrutto)" : "Segna come Distrutto", "gp-btn del");
      }
      const st = [rezzable && it.on && !it.dead ? "on" : "", it.dead ? "dead" : "", rezzable && cur <= 0 ? "derez" : ""].join(" ");
      return `<div class="wpn nd-item ${I.hw ? "hw" : I.ice ? "ice" : esc(I.cls)} ${st}">
        <span class="wpn-n"><span class="nd-name">${esc(I.label)} <span class="nd-cls">${esc(clsTag(I))}</span>${it.used ? ` <span class="nd-cls used">usato</span>` : ""}${it.dead ? ` <span class="nd-cls dead">distrutto</span>` : rezzable && cur <= 0 ? ` <span class="nd-cls dead">derezzato</span>` : ""}</span>
          <small>${stats}</small>${rezzable ? `<span class="sp-bar nd-bar" title="REZ ${cur} / ${I.rez}"><i style="width:${I.rez ? cur / I.rez * 100 : 0}%"></i></span>` : ""}${I.eff ? `<em>${esc(I.eff)}</em>` : ""}</span>
        ${acts || ctl ? `<span class="nd-acts">${acts}${ctl}</span>` : ""}
      </div>`;
    }).join("");
    const boostTxt = Object.entries(B).map(([k, l]) => `${k === "speed" ? "Speed" : (NET.ABILITIES.find(a => a.id === k) || {}).name} +${l.reduce((t, b) => t + b.v, 0)}`).join(" · ");
    return `<div class="nd">
      <div class="sh-sec-head"><h4>Cyberdeck</h4>
        <span class="hint">${esc(deck.name || "Cyberdeck")} · Slot <b class="${S.over ? "pen" : ""}">${S.used}</b> / ${S.total} · Interface <b>${o.iface}</b> · <b>${CPR.netActions(o.iface)}</b> NET Actions${boostTxt ? ` · Rezzed: ${esc(boostTxt)}` : ""}</span>
        ${o.reset ? `<button type="button" class="btn ghost small" ${o.reset} title="Nuova Netrun: REZ piena, tutto disattivato, «una volta per Netrun» di nuovo disponibili">↺ Nuova Netrun</button>` : ""}</div>
      <div class="pc-rolls nd-abil">${btn("def", `Defense <b>${o.iface}</b>`, "chip y", "Interface + 1d10 contro un attacco NET")}${btn("speed", `Speed <b>${o.iface + bsum("speed")}</b>`, "chip y", "Agguato: Interface + bonus + 1d10 vs VEL + 1d10 del Black ICE")}${abil}</div>
      ${items.length ? `<div class="sh-weapons nd-list">${rows}</div>` : `<p class="hint">Deck vuoto: aggiungi programmi, Black ICE e hardware da «Modifica scheda».</p>`}
    </div>`;
  }

  // campo REZ a mano: attrs(segno) = attributi del pulsante; l'op finisce con ":in-" o ":in+" e il valore lo legge rezOp
  const rezIn = attrs => `<span class="rez-in"><input type="number" min="1" max="999" inputmode="numeric" placeholder="REZ" aria-label="REZ da togliere o ridare">` +
    `<button type="button" class="gp-btn rez-minus" ${attrs("-")} title="Togli i REZ scritti (Invio)" aria-label="Togli i REZ scritti">−</button>` +
    `<button type="button" class="gp-btn" ${attrs("+")} title="Ridai i REZ scritti" aria-label="Ridai i REZ scritti">+</button></span>`;
  const rezOp = (el, op) => {
    const m = String(op || "").match(/^(.*):in([+-])$/); if (!m) return op;
    const inp = el.closest(".rez-in") && $("input", el.closest(".rez-in")), v = Math.abs(Math.trunc(num(inp && inp.value)));
    if (!v) { if (inp) inp.focus(); toast("Scrivi quanti REZ togliere o ridare", "err"); return null; }
    return `${m[1]}:${m[2] === "-" ? -v : v}`;
  };
  // Invio nel campo = togli
  document.addEventListener("keydown", ev => {
    if (ev.key !== "Enter" || !ev.target.closest || !ev.target.closest(".rez-in input")) return;
    ev.preventDefault(); const b = $(".rez-minus", ev.target.closest(".rez-in")); if (b) b.click();
  });

  function deckTabHtml(e) {
    const id = esc(e.id), edit = Store.canEdit(), decks = decksOf(e), cur = deckIdx(e);
    return `<div class="nd-tab" data-deck-tab="${id}">
      <div class="sh-bar"><label class="sh-mod" title="Modificatore situazionale aggiunto ai tiri">MOD <input type="number" step="1" data-sheet-mod value="${sheetMod}"></label>
        <span class="hint">Interface = Rank della Role Ability (${ifaceOf(e)}) · clicca un programma per tirare.</span>
        <button type="button" class="btn ghost small cyan" data-action="dice-open">⬢ Dice log</button></div>
      ${decks.length > 1 ? `<div class="chips nd-decks"><span class="lbl">Deck in uso</span>${decks.map((d, i) => `<button type="button" class="chip ${i === cur ? "active" : ""}" ${edit ? `data-action="deck-adj" data-id="${id}" data-i="${i}" data-op="active"` : "disabled"}>${esc(d.name || `Cyberdeck ${i + 1}`)}</button>`).join("")}</div>` : ""}
      ${decks.length ? deckHtml(activeDeck(e), { iface: ifaceOf(e), roll: w => `data-action="sheet-roll" data-id="${id}" data-roll="deck:${w}"`,
        adj: edit ? (i, op) => `data-action="deck-adj" data-id="${id}" data-i="${i}" data-op="${op}"` : null, reset: edit ? `data-action="deck-adj" data-id="${id}" data-op="reset"` : "" })
        : `<div class="empty"><div class="big">// NESSUN CYBERDECK</div>${edit ? `<button class="btn" data-action="edit-decks" data-id="${id}">+ Aggiungi un Cyberdeck</button>` : ""}</div>`}
    </div>`;
  }
  function editDecks(id) {
    const e = state.entries.find(x => x.id === id); if (!e) return;
    const decks = decksOf(e).length ? decksOf(e) : [{ name: "Cyberdeck", slots: 7, items: [] }];
    const sec = (d, i, on) => `<section class="nd-sec" data-nd-sec>
      <h3 class="sh-h"><label class="check"><input type="radio" name="deck-active" value="${i}" ${on ? "checked" : ""}> in uso</label>
        <button type="button" class="btn ghost small danger" data-nd-delsec>Togli questo deck</button></h3>${deckEditorHtml(d)}</section>`;
    openModal(`
      <form class="form" id="decks-form">
        <div class="modal-head"><h2>// CYBERDECK · ${esc(e.name)}</h2><button type="button" class="x" data-action="open-entry-tab" data-id="${esc(e.id)}" data-tab="deck" aria-label="Chiudi">×</button></div>
        <div class="modal-body">
          <p class="hint">Programmi 1 slot, Black ICE 2, hardware come indicato. Puoi tenere più deck (es. uno di scorta o nel cyberbraccio): quello «in uso» è quello che tiri.</p>
          <div id="nd-secs">${decks.map((d, i) => sec(d, i, i === deckIdx(e))).join("")}</div>
          <button type="button" class="btn ghost small yellow" data-nd-newdeck>+ Cyberdeck</button>
        </div>
        <div class="modal-foot">
          <button type="button" class="btn ghost small left" data-action="open-entry-tab" data-id="${esc(e.id)}" data-tab="deck">Annulla</button>
          <button type="submit" class="btn">Salva Cyberdeck</button>
        </div>
      </form>`);
    const form = $("#decks-form");
    bindDeckEditor(form);
    const renum = () => $$("[data-nd-sec]", form).forEach((x, i) => { $("input[type=radio]", x).value = i; });
    form.addEventListener("click", ev => {
      if (ev.target.closest("[data-nd-newdeck]")) { $("#nd-secs", form).insertAdjacentHTML("beforeend", sec({ name: `Cyberdeck ${$$("[data-nd-sec]", form).length + 1}`, slots: 7, items: [] }, 0, false)); renum(); return; }
      const del = ev.target.closest("[data-nd-delsec]");
      if (del) { del.closest("[data-nd-sec]").remove(); renum(); if (!$("input[name=deck-active]:checked", form) && $("input[name=deck-active]", form)) $("input[name=deck-active]", form).checked = true; }
    });
    form.addEventListener("submit", async ev => {
      ev.preventDefault();
      const list = $$("[data-nd-sec] .nd-edit", form).map(b => readDeck(b));
      const act = $("input[name=deck-active]:checked", form);
      const s = migrateDecks(JSON.parse(JSON.stringify(sheetOf(e))));
      s.decks = list; s.deckActive = act ? clamp(num(act.value), 0, Math.max(0, list.length - 1)) : 0;
      try {
        const saved = await Store.save("entries", { ...e, sheet: s });
        upsert(state.entries, saved); liveSend("entries", saved);
        toast("Cyberdeck salvati", "ok"); openEntry(saved.id, "deck"); refreshParty();
      } catch (err) { fail(err); }
    });
  }

  // tiri del deck · c = { deck, iface, check(label, mods, extra), dmg(label, expr, note), msg(text) }
  const NET_VS = "vs Interface + 1d10 del Netrunner, o DEF + 1d10 di un programma / Black ICE";
  function deckRoll(c, what) {
    const [t, a, b, j] = String(what).split(":");
    const B = NET.boosts(c.deck), bon = k => B[k] || [];
    const I0 = { l: "Interface", v: c.iface };
    if (t === "def") return c.check("NET Defense", [I0], { note: "Difesa contro un attacco NET" });
    if (t === "speed") return c.check("NET Speed", [I0, ...bon("speed")], { note: "Agguato: vs VEL + 1d10 del Black ICE" });
    if (t === "ab") {
      const A = NET.ABILITIES.find(x => x.id === a); if (!A) return;
      if (b === "dmg") return c.dmg(`${A.name} · damage`, A.dmg[0].x, "1d6 REZ a un programma o al cervello di un Netrunner");
      return c.check(A.attack ? `${A.name} · attack` : A.name, [I0, ...bon(A.id)], { note: A.attack ? NET_VS : A.eff });
    }
    if (t !== "it") return;
    const it = ((c.deck || {}).items || [])[+a]; if (!it) return;
    const I = NET.itemInfo(it);
    if (b === "atk") return c.check(`${I.label} · attack`, I.ice ? [{ l: "ATK", v: I.atk }] : [I0, { l: `${I.name} ATK`, v: I.atk }],
      { note: `${vsOf(I)}${I.ice ? "" : " · si disattiva dopo l'uso"}${I.eff ? ` · ${I.eff}` : ""}` });
    if (b === "def") return c.check(`${I.label} · defense`, [{ l: "DEF", v: I.def }], { note: "Difesa del programma contro l'attacco" });
    if (b === "dmg") { const d = (I.dmg || [])[+j]; if (d) c.dmg(`${I.label} · ${d.u === "brain" ? "brain damage" : d.u === "REZ" ? "REZ damage" : "damage"} ${d.l}`, d.x, I.eff); return; }
    if (b === "fx") {
      if (!(I.fx || []).length) return c.msg(`${I.label}: ${I.eff}`);
      I.fx.forEach(f => c.dmg(`${I.label} · ${f.l}`, f.x, I.eff));
    }
  }
  const sheetDeckCtx = e => ({
    deck: activeDeck(e), iface: ifaceOf(e),
    check: (label, parts, extra) => sheetCheck(e, label, parts, extra),
    dmg: (label, x, note) => { const r = CPR.rollExpr(x); if (r) postRoll({ kind: "damage", who: e.name, entryId: e.id, label, ...r, note: note || "" }); },
    msg: text => postRoll({ kind: "msg", who: e.name, entryId: e.id, text }),
  });
  // tiri veloci (Party, pannello del token): Zap e i programmi offensivi
  function netQuick(deck, iface, mk) {
    const off = ((deck || {}).items || []).map((it, i) => ({ it, i, I: NET.itemInfo(it) }))
      .filter(x => !x.it.dead && !x.I.hw && (x.I.ice || NET.offensive(x.I.cls))).slice(0, 3);
    return mk("ab:zap", `⌁ Zap <b>${iface}</b>`, "chip") + off.map(x => mk(`it:${x.i}:atk`, `⌁ ${esc(x.I.name)} <b>${x.I.ice ? x.I.atk : iface + x.I.atk}</b>`, "chip")).join("");
  }
  // Rez / Derez, REZ, «una volta per Netrun», Distrutto e Nuova Netrun dalla scheda
  function deckAdj(e, i, op) {
    sheetPatch(e.id, s => {
      migrateDecks(s);
      if (op === "active") { s.deckActive = clamp(i, 0, Math.max(0, s.decks.length - 1)); return s; }
      if (!s.decks.length) s.decks.push({ name: "Cyberdeck", slots: 7, items: [] });
      const d = s.decks[s.deckActive], items = d.items = d.items || [];
      if (op === "reset") { items.forEach(it => { it.on = false; it.used = false; it.cur = null; }); return s; }
      const it = items[i]; if (!it) return s;
      const I = NET.itemInfo(it);
      if (op === "on") {
        if (!it.on && I.once && it.used) { toast(`${I.name}: già usato in questa Netrun`, "err"); return s; }
        it.on = !it.on;
        if (it.on) { it.cur = null; if (I.once) it.used = true; }   // riattivato = di nuovo a REZ piena
      } else if (op.startsWith("rez:")) it.cur = clamp(NET.curRez(it, I) + num(op.slice(4)), 0, I.rez);
      else if (op === "used") it.used = !it.used;
      else if (op === "dead") { it.dead = !it.dead; if (it.dead) it.on = false; }
      return s;
    });
  }

  // ---------- editor del deck (scheda e nemico) ----------
  const deckOpt = (v, label, sel) => `<option value="${esc(v)}" ${v === sel ? "selected" : ""}>${esc(label)}</option>`;
  const deckRefOptions = sel => `
    ${Object.entries(NET.CLASSES).map(([k, c]) => `<optgroup label="${esc(c.label)}">${NET.PROGRAMS.filter(p => p.cls === k).map(p => deckOpt("prog:" + p.id, `${p.name} · ATK ${p.atk} DEF ${p.def} REZ ${p.rez}`, sel)).join("")}</optgroup>`).join("")}
    <optgroup label="Black ICE (2 slot)">${NET.allIce().map(c => deckOpt("ice:" + c.id, `${NET.iceLabel(c)} · ${NET.CLASSES[c.cls].short} · ATK ${c.atk} REZ ${c.rez}`, sel)).join("")}</optgroup>
    <optgroup label="Hardware">${NET.HARDWARE.map(h => deckOpt("hw:" + h.id, `${h.name} · ${h.slots} slot`, sel)).join("")}</optgroup>
    <optgroup label="Altro">${deckOpt("custom", "Personalizzato…", sel)}</optgroup>`;
  const deckInfoTxt = it => { const I = NET.itemInfo(it); return `${I.slots} slot${I.eff ? " · " + I.eff : ""}`; };
  function deckRow(it = { ref: "prog:sword" }) {
    const custom = it.ref === "custom";
    const n = (f, ph, w = "") => `<input data-f="${f}" type="number" min="0" max="99" placeholder="${ph}" title="${ph}" value="${esc(it[f] ?? "")}" class="nd-c ${w}">`;
    return `<div class="sh-row nd-row ${custom ? "custom" : ""}">
      <select data-f="ref" aria-label="Programma o hardware">${deckRefOptions(it.ref || "custom")}</select>
      <span class="nd-info">${custom ? "" : esc(deckInfoTxt(it))}</span>
      <input data-f="name" placeholder="Nome" value="${esc(it.name || "")}" class="nd-c">
      <select data-f="cls" class="nd-c" aria-label="Classe">${[...Object.entries(NET.CLASSES).map(([k, c]) => [k, c.short]), ["ice", "Black ICE"], ["hw", "Hardware"]].map(([k, l]) => deckOpt(k, l, it.cls || "antipersonnel")).join("")}</select>
      ${n("atk", "ATK")}${n("def", "DEF")}${n("rez", "REZ")}${n("per", "PER")}${n("spd", "SPD")}${n("slots", "Slot")}
      <input data-f="dmg" placeholder="Danno (2d6)" value="${esc(it.dmg || "")}" class="nd-c">
      <input data-f="eff" placeholder="Effetto" value="${esc(it.eff || "")}" class="nd-c wide">
      <input type="hidden" data-f="st" value="${esc(JSON.stringify({ ref: it.ref, name: it.name || "", cur: it.cur ?? null, on: !!it.on, used: !!it.used, dead: !!it.dead }))}">
      <button type="button" class="gp-btn del" data-row-del aria-label="Rimuovi">✕</button></div>`;
  }
  function deckEditorHtml(deck) {
    const d = deck || { name: "Cyberdeck", slots: 7, items: [] };
    return `<div class="nd-edit">
      <div class="fields">
        <div class="field"><label>Nome del deck</label><input data-nd="name" value="${esc(d.name || "")}" placeholder="es. Zetatech Paraline"></div>
        <div class="field"><label>Slot</label><input data-nd="slots" type="number" min="1" max="20" value="${esc(d.slots ?? 7)}"><span class="hint">${NET.DECK_QUALITY.map(q => `${q.label} ${q.slots}`).join(" · ")}</span></div>
        <div class="field full"><label class="check"><input type="checkbox" data-nd="bodyweight" ${d.bodyweight ? "checked" : ""}> Tuta Bodyweight: +1 slot solo per l'hardware</label>
          <label class="check"><input type="checkbox" data-nd="cyberarm" ${d.cyberarm ? "checked" : ""}> Cyberdeck nel cyberbraccio: +1 slot</label></div>
      </div>
      <div class="en-budget" data-nd-count></div>
      <div class="sh-rows nd-rows">${(d.items || []).map(deckRow).join("")}</div>
      <button type="button" class="btn ghost small cyan" data-nd-add>+ Programma / Hardware</button>
    </div>`;
  }
  function readDeck(root, old = null) {
    const box = root && root.classList && root.classList.contains("nd-edit") ? root : $(".nd-edit", root); if (!box) return old;
    const val = k => $(`[data-nd=${k}]`, box);
    const items = readRows(box, ".nd-row").map(r => {
      let st = {}; try { st = JSON.parse(r.st || "{}"); } catch { st = {}; }
      const base = r.ref === "custom"
        ? { ref: "custom", name: r.name, cls: r.cls, atk: num(r.atk), def: num(r.def), rez: num(r.rez), per: num(r.per), spd: num(r.spd), slots: num(r.slots) || (r.cls === "ice" ? 2 : 1), dmg: r.dmg, eff: r.eff }
        : { ref: r.ref };
      // lo stato della Netrun resta se l'oggetto è lo stesso
      const same = st.ref === r.ref && (r.ref !== "custom" || st.name === r.name);
      return same ? { ...base, cur: st.cur ?? null, on: !!st.on, used: !!st.used, dead: !!st.dead } : base;
    }).filter(it => it.ref !== "custom" || it.name);
    return { name: val("name").value.trim(), slots: clamp(num(val("slots").value) || 7, 1, 20), bodyweight: val("bodyweight").checked, cyberarm: val("cyberarm").checked, items };
  }
  // contatore degli slot e campi del personalizzato
  function bindDeckEditor(root) {
    const count = () => $$(".nd-edit", root).forEach(box => {
      const S = NET.deckSlots(readDeck(box));
      const el = $("[data-nd-count]", box);
      el.className = "en-budget" + (S.over ? " over" : "");
      el.innerHTML = `Slot usati <b>${S.used}</b> / ${S.total}${S.hwExtra ? ` (di cui ${S.hwExtra} solo hardware)` : ""}${S.over ? " · troppi oggetti per questo deck" : ""} · programmi 1 slot, Black ICE 2`;
    });
    root.addEventListener("click", ev => {
      const addBtn = ev.target.closest("[data-nd-add]");
      if (addBtn) { $(".nd-rows", addBtn.closest(".nd-edit")).insertAdjacentHTML("beforeend", deckRow()); count(); return; }
      if (ev.target.closest(".nd-row [data-row-del]")) setTimeout(count);
    });
    root.addEventListener("change", ev => {
      const sel = ev.target.closest(".nd-row [data-f=ref]");
      if (sel) { const row = sel.closest(".nd-row"); row.classList.toggle("custom", sel.value === "custom"); $(".nd-info", row).textContent = sel.value === "custom" ? "" : deckInfoTxt({ ref: sel.value }); }
      if (ev.target.closest(".nd-edit")) count();
    });
    root.addEventListener("input", ev => { if (ev.target.closest(".nd-edit")) count(); });
    count();
  }

  // ---------- DADI: log condiviso, stile chat ----------
  const ROLL_KEEP = 150;
  const sortRolls = () => { state.rolls.sort((a, b) => (a.at || a.createdAt || "").localeCompare(b.at || b.createdAt || "")); if (state.rolls.length > ROLL_KEEP) state.rolls.splice(0, state.rolls.length - ROLL_KEEP); };
  const fmtTime = iso => { try { return new Date(iso).toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" }); } catch { return ""; } };

  // tiro segreto del GM: interruttore 🔒 nel Dice log, oppure tiro di un NPC segreto o di un token nascosto
  let secretRoll = ls.get("nc-secret", false);
  async function postRoll(r) {
    const ent = r.entryId && state.entries.find(e => e.id === r.entryId);
    const secret = isGm() && Store.gmReady && !!(r.gmOnly || secretRoll || (ent && ent.gmOnly));
    const rec = { ...r, gmOnly: secret, by: Store.user || "", at: new Date().toISOString() };
    let out = { ...rec, id: "loc-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6), local: true };
    if (Store.canEdit()) {
      try { out = await Store.save("rolls", rec); liveSend("rolls", out); }
      catch (err) { fail(err); }
    }
    upsert(state.rolls, out); sortRolls(); renderLogs();
    if (onTable() && !$("#modal").open) popRoll(out); else openDrawer();
    return out;
  }

  // pop-up di un tiro: compare per qualche secondo e resta nel Dice log
  function popRoll(r) {
    if (drawer && !drawer.hidden && !drawer.classList.contains("min")) return;   // il log è già aperto
    let box = $("#roll-pops");
    if (!box) { box = document.createElement("div"); box.id = "roll-pops"; box.className = "roll-pops"; box.setAttribute("aria-live", "polite"); document.body.appendChild(box); }
    const el = document.createElement("div");
    el.className = "roll-pop"; el.innerHTML = rollCard(r); el.title = "Clicca per aprire il Dice log";
    el.addEventListener("click", () => { el.remove(); openDrawer(); });
    box.appendChild(el);
    while (box.children.length > 4) box.firstElementChild.remove();
    setTimeout(() => { el.classList.add("out"); setTimeout(() => el.remove(), 400); }, r.kind === "msg" ? 5000 : 6500);
  }
  function rollCard(r) {
    const who = esc(r.who || (r.by ? r.by.split("@")[0] : "") || "Anonimo");
    const time = `<span class="rl-time">${fmtTime(r.at || r.createdAt)}</span>`;
    if (r.kind === "msg") return `<div class="rl msg ${r.local ? "local" : ""} ${r.gmOnly ? "secret" : ""}"><div class="rl-head"><b class="rl-who">${who}</b>${r.gmOnly ? `<span class="rl-secret">🔒 SEGRETO</span>` : ""}${time}</div><div class="rl-text">${esc(r.text)}</div></div>`;
    const dice = (r.dice || []).map(d => `<span class="rd ${d.s === 10 ? "d10" : d.s === 6 ? "d6" : ""} ${esc(d.t || "")}" title="d${d.s}${d.t === "drop" ? " · scartato" : ""}">${d.t === "minus" ? "−" : ""}${d.v}</span>`).join("");
    const mods = (r.mods || []).map(m => `<span class="rm">${m.v < 0 ? "−" : "+"}${Math.abs(m.v)}${m.l ? ` <small>${esc(m.l)}</small>` : ""}</span>`).join("");
    const crit = { success: "Critical Success", fail: "Critical Failure", injury: "Critical Injury" }[r.crit];
    return `<div class="rl ${r.crit ? "c-" + esc(r.crit) : ""} ${r.local ? "local" : ""} ${r.gmOnly ? "secret" : ""}">
      <div class="rl-head"><b class="rl-who">${who}</b>${r.gmOnly ? `<span class="rl-secret" title="Lo vedono solo i GM">🔒 SEGRETO</span>` : ""}${time}</div>
      <div class="rl-label">${esc(r.label || r.expr || "Tiro")}</div>
      <div class="rl-body"><span class="rl-total">${num(r.total)}</span><span class="rl-break">${dice}${mods}</span></div>
      ${crit ? `<div class="rl-crit">${crit}</div>` : ""}
      ${r.inj ? `<div class="rl-inj">✚ ${esc(r.inj)}</div>` : ""}
      ${r.hit && r.hit.text ? `<div class="rl-hit ${r.hit.ok ? "ok" : "no"}">${r.hit.ok ? "✓" : "✗"} ${Array.isArray(r.hit.bands) ? `${esc(r.hit.table)}: ${r.hit.bands.length ? `colpisce a ${r.hit.bands.map(b => `<span class="rl-band">${esc(b)}</span>`).join(" ")}` : "fuori portata a ogni distanza"}` : esc(r.hit.text)}</div>` : ""}
      ${r.note ? `<div class="rl-note">${esc(r.note)}</div>` : ""}
      ${r.local ? `<div class="rl-note">solo su questo dispositivo · accedi per condividere i tiri</div>` : ""}
    </div>`;
  }
  const logItems = () => {
    const cut = ls.get("nc-log-cleared", ""), list = cut ? state.rolls.filter(r => (r.at || r.createdAt || "") > cut) : state.rolls;
    return list.length ? list.map(rollCard).join("") : `<div class="rl-empty">// ${cut && state.rolls.length ? "log pulito." : "nessun tiro ancora."}<br>Clicca un'abilità nella scheda o scrivi <b>2d6+3</b> qui sotto.${cut && state.rolls.length ? `<br><button type="button" class="btn ghost small" data-action="log-unclear">Mostra di nuovo i tiri vecchi</button>` : ""}</div>`;
  };
  // cancella tutti i tiri dal database (solo GM): gli altri ricevono un avviso e svuotano il loro log
  async function wipeLog() {
    if (!(await askConfirm("Eliminare DEFINITIVAMENTE tutti i tiri e i messaggi del Dice log, per tutti? Non si può annullare.", "Elimina tutti"))) return;
    try {
      const all = await Store.list("rolls");
      for (const r of all) await Store.remove("rolls", r);
      state.rolls = []; renderLogs(); Store.send({ t: "wipe", col: "rolls" });
      toast(`Dice log svuotato: ${all.length} tiri eliminati`, "ok");
    } catch (err) { fail(err); }
  }
  const rollAs = () => { const id = ls.get("nc-as", null); const e = id && state.entries.find(x => x.id === id); return e || myPg() || null; };
  const asOptions = () => {
    const cur = rollAs(), people = state.entries.filter(isPerson).sort((a, b) => (a.kind === b.kind ? 0 : a.kind === "pg" ? -1 : 1) || (a.name || "").localeCompare(b.name || "", "it"));
    return `<option value="">${esc(Store.user ? Store.user.split("@")[0] : "Anonimo")}</option>` +
      people.map(e => `<option value="${esc(e.id)}" ${cur && cur.id === e.id ? "selected" : ""}>${esc(e.name)}${e.kind === "pg" ? " (PG)" : ""}</option>`).join("");
  };
  function logWidget() {
    return `
      <div class="roll-log" aria-live="polite">${logItems()}</div>
      <form class="roll-form ${secretRoll && isGm() ? "is-secret" : ""}" data-roll-form autocomplete="off">
        <div class="roll-quick">${["1d10", "1d6", "2d6", "3d6", "4d6", "5d6", "6d6", "3d6kh2"].map(x => `<button type="button" class="chip" data-quick="${x}">${x}</button>`).join("")}<button type="button" class="chip" data-quick="check" title="Prova: 1d10 con critico sul 10 e fallimento sull'1">CHECK</button>
          ${isGm() && Store.gmReady ? `<label class="roll-secret" title="I tuoi tiri e messaggi li vedono solo i GM"><input type="checkbox" data-secret ${secretRoll ? "checked" : ""}> 🔒 Segreto</label>` : ""}</div>
        <div class="roll-tools"><button type="button" class="chip" data-action="log-clear" title="Nasconde i tiri fatti finora, solo su questo dispositivo">🧹 Pulisci</button>
          ${isGm() || !Store.gmReady ? `<button type="button" class="chip r" data-action="log-wipe" title="Elimina tutti i tiri dal database, per tutti">🗑 Elimina tutti</button>` : ""}</div>
        <div class="roll-in">
          <select data-roll-as title="Tira come" aria-label="Tira come">${asOptions()}</select>
          <input data-roll-text placeholder="2d6+3 · /c 14 · messaggio" aria-label="Tiro o messaggio">
          <button class="btn small" type="submit">Invia</button>
        </div>
      </form>`;
  }
  function renderLogs() {
    for (const box of $$(".roll-log")) {
      const atEnd = box.scrollHeight - box.scrollTop - box.clientHeight < 60;
      box.innerHTML = logItems();
      if (atEnd || box.dataset.init !== "1") { box.scrollTop = box.scrollHeight; box.dataset.init = "1"; }
    }
  }

  // testo del log: "2d6+3" o "/r 2d6" = tiro libero · "/d 3d6" = danni (critico con due 6)
  // "/c 14" = prova con base 14 (critico sul 10, fallimento sull'1) · altro testo = messaggio
  function submitChat(text) {
    text = text.trim(); if (!text) return;
    const as = rollAs(), who = as ? as.name : "";
    const c = /^\/c(?:heck)?\s*([+-]?\d+)?\s*$/i.exec(text);
    if (c) { const base = num(c[1]); return postRoll({ kind: "check", who, label: "Check", ...CPR.check(base ? [{ l: "base", v: base }] : []) }); }
    const dmg = /^\/d(?:mg|amage)?\s+/i.test(text);
    const expr = text.replace(/^\/(?:r|roll|d|dmg|damage)\s+/i, "");
    const r = CPR.rollExpr(expr, { damage: dmg });
    if (r) return postRoll({ kind: dmg ? "damage" : "expr", who, label: dmg ? `Damage ${r.expr}` : r.expr, ...r });
    if (/^\/[rd]/i.test(text)) return toast("Tiro non valido. Esempi: 2d6+3, 1d10-2, /d 3d6", "err");
    return postRoll({ kind: "msg", who, text: text.slice(0, 500) });
  }
  function quickRoll(x) {
    const as = rollAs(), who = as ? as.name : "";
    if (x === "check") return as && hasSheet(as) ? sheetCheck(as, "Check", []) : postRoll({ kind: "check", who, label: "Check", ...CPR.check([]) });
    const dmg = /d6$/.test(x);
    const r = CPR.rollExpr(x, { damage: dmg });
    postRoll({ kind: dmg ? "damage" : "expr", who, label: dmg ? `Damage ${x}` : x, ...r });
  }

  // cassetto dei dadi (sempre disponibile; dentro la finestra aperta se ce n'è una)
  let drawer = null;
  function ensureDrawer() {
    if (drawer) return drawer;
    drawer = document.createElement("aside");
    drawer.className = "dice-drawer"; drawer.hidden = true;
    drawer.setAttribute("aria-label", "Dadi e chat");
    document.body.appendChild(drawer);
    return drawer;
  }
  function placeDrawer() {
    if (!drawer) return;
    const host = $("#modal").open ? $("#modal") : document.body;
    if (drawer.parentNode !== host) host.appendChild(drawer);
  }
  function openDrawer() {
    ensureDrawer();
    if (drawer.hidden) {
      drawer.innerHTML = `<header><h4>// DICE LOG</h4><span>
        <button type="button" class="x" data-action="dice-min" title="Riduci / espandi" aria-label="Riduci o espandi">▁</button>
        <button type="button" class="x" data-action="dice-close" aria-label="Chiudi">×</button></span></header>${logWidget()}`;
      drawer.classList.toggle("min", ls.get("nc-dice-min", false));
      drawer.hidden = false;
    }
    document.body.classList.add("drawer-open");
    placeDrawer(); renderLogs();
  }
  function closeDrawer() { if (drawer) drawer.hidden = true; document.body.classList.remove("drawer-open"); }
  function minDrawer() { if (!drawer) return; const on = !drawer.classList.contains("min"); drawer.classList.toggle("min", on); ls.set("nc-dice-min", on); renderLogs(); }

  // ---------- dettaglio record ----------
  function openEntry(id, tab = "dossier") {
    const e = state.entries.find(x => x.id === id);
    if (!e) return;
    if (e.kind === "nemico" && e.enemy) return openEnemy(id);
    if (!isPerson(e)) tab = "dossier";
    const edit = Store.canEdit();
    const tabs = isPerson(e) ? `
      <div class="dossier-tabs" role="tablist">
        ${[["dossier", "Dossier"], ["sheet", `Scheda${hasSheet(e) ? ` <span>${hpOf(e)}/${hpMaxOf(e)}</span>` : ""}`], ["roles", `Ruoli${rolesOf(e).length > 1 ? ` <span>${rolesOf(e).length}</span>` : ""}`], ["combat", `Combattimento${(sheetOf(e).weapons || []).length ? ` <span>${sheetOf(e).weapons.length}</span>` : ""}`], ["cyber", `Cyberware${cyberCount(e) ? ` <span>${cyberCount(e)}</span>` : ""}`], ["gear", `Equipaggiamento${gearItems(e).length ? ` <span>${gearItems(e).length}</span>` : ""}`], ...(isNetrunner(e) ? [["deck", `Cyberdeck${decksOf(e).length > 1 ? ` <span>${decksOf(e).length}</span>` : ""}`]] : [])]
          .map(([t, l]) => `<button type="button" role="tab" class="${t === tab ? "active" : ""}" aria-selected="${t === tab}" data-action="open-entry-tab" data-id="${esc(e.id)}" data-tab="${t}">${l}</button>`).join("")}
      </div>` : "";
    if (tab !== "dossier") {
      const k = kindOf(e.kind);
      const T = { sheet: ["SCHEDA", sheetHtml, "edit-sheet", "scheda"], combat: ["COMBATTIMENTO", combatHtml, "edit-sheet", "scheda"], roles: ["RUOLI", rolesTabHtml, "edit-sheet", "scheda"], cyber: ["CYBERWARE", cyberHtml, "edit-cyber", "cyberware"], gear: ["EQUIPAGGIAMENTO", gearHtml, "edit-gear", "equipaggiamento"], deck: ["CYBERDECK", deckTabHtml, "edit-decks", "cyberdeck"] }[tab] || [];
      if (!T.length) return openEntry(id);
      openModal(`
        <div class="modal-head"><h2>// ${T[0]} · ${esc(k.label)}</h2><button class="x" data-action="close" aria-label="Chiudi">×</button></div>
        <div class="modal-body">
          <div class="tab-title"><h1>${esc(e.name || "Senza nome")}</h1>${e.handle ? `<span class="handle">“${esc(e.handle)}”</span>` : ""}</div>
          ${tabs}
          ${T[1](e)}
        </div>
        ${edit && tab !== "roles" && (!["sheet", "combat"].includes(tab) || hasSheet(e)) ? `<div class="modal-foot">
          <button class="btn cyan" data-action="${T[2]}" data-id="${esc(e.id)}">Modifica ${T[3]}</button>
        </div>` : ""}`);
      const fig = $("#modal .cy-figure");
      if (fig) fig.dataset.zones.split(" ").filter(Boolean).forEach(z => $$(`.cy-zone[data-zone="${z}"]`, fig).forEach(n => n.classList.add("on")));
      if (location.hash !== "#/database/" + e.id && location.hash.startsWith("#/database")) history.replaceState(null, "", "#/database/" + e.id);
      return;
    }
    const k = kindOf(e.kind), st = statusOf(e.status), imgs = imagesOf(e);
    const fac = e.faction ? factionEntry(e.faction) : null;
    const facts = [
      ["Tipo", esc(k.label)],
      e.faction && ["Fazione", fac && fac.id !== e.id ? `<a data-action="open-entry" data-id="${esc(fac.id)}">${esc(e.faction)}</a>` : esc(e.faction)],
      e.role && ["Ruolo", esc(e.role)],
      st && ["Stato", `<span class="status s-${st.id}">${esc(st.label)}</span>`],
      e.attitude && ["Rapporto", esc(e.attitude)],
      e.location && ["Luogo", esc(e.location)],
      ...(e.custom || []).filter(c => c.k || c.v).map(c => [esc(c.k), esc(c.v)]),
    ].filter(Boolean);
    const members = e.kind === "fazione" ? state.entries.filter(x => x.id !== e.id && norm(x.faction) === norm(e.name)) : [];
    const related = state.events
      .filter(ev => (ev.people || []).some(p => norm(p) === norm(e.name)) || (e.kind === "luogo" && norm(ev.location) === norm(e.name)))
      .sort((a, b) => (a.date + (a.time || "")).localeCompare(b.date + (b.time || "")));
    openModal(`
      <div class="modal-head"><h2>// DOSSIER · ${esc(k.label)}</h2><button class="x" data-action="close" aria-label="Chiudi">×</button></div>
      <div class="modal-body">
        ${tabs}
        <div class="dossier">
          ${carouselHtml(imgs, e.name)}
          <div>
            <h1>${esc(e.name || "Senza nome")}</h1>
            ${e.handle ? `<div class="handle">“${esc(e.handle)}”</div>` : ""}
            <dl class="facts">${facts.map(([a, b]) => `<dt>${a}</dt><dd>${b}</dd>`).join("")}</dl>
            ${(e.tags || []).length || e.gmOnly ? `<div class="meta">${gmBadge(e)}${(e.tags || []).map(t => `<span class="badge tag">#${esc(t)}</span>`).join("")}</div>` : ""}
            ${e.description ? `<div class="block"><h4>Descrizione</h4><div class="prewrap">${esc(e.description)}</div></div>` : ""}
            ${e.notes ? `<div class="block"><h4>Note</h4><div class="prewrap">${esc(e.notes)}</div></div>` : ""}
            ${isGm() ? (() => { const g = gmNoteOf(e.id); return `<div class="block gm-block"><h4>🔒 Note del GM <small>· le vedono solo i GM</small></h4>
              ${g && g.text ? `<div class="prewrap">${esc(g.text)}</div>` : `<p class="hint">Vere intenzioni, segreti, statistiche nascoste…</p>`}
              <button type="button" class="btn ghost small" data-action="edit-gmnote" data-id="${esc(e.id)}">${g && g.text ? "Modifica" : "Scrivi"} note GM</button></div>`; })() : ""}
            ${members.length ? `<div class="block"><h4>Membri noti (${members.length})</h4><div class="members">
              ${members.map(m => `<button class="member" data-action="open-entry" data-id="${esc(m.id)}">${imagesOf(m).length ? imgTag(imagesOf(m)[0]) : `<span class="ph"></span>`}${esc(m.name)}</button>`).join("")}
            </div></div>` : ""}
            ${related.length ? `<div class="block"><h4>Eventi collegati (${related.length})</h4><div class="timeline compact">${related.map(timelineItem).join("")}</div></div>` : ""}
          </div>
        </div>
      </div>
      ${Store.canEdit() ? `<div class="modal-foot">
        <button class="btn ghost small left" data-action="delete-entry" data-id="${esc(e.id)}">Elimina</button>
        <button class="btn cyan" data-action="edit-entry" data-id="${esc(e.id)}">Modifica</button>
      </div>` : ""}
    `);
    const car = $("#modal .carousel[data-n]");
    if (car) bindSwipe($(".car-stage", car), d => carGo(car, +car.dataset.i + d));
    if (location.hash !== "#/database/" + e.id && location.hash.startsWith("#/database")) history.replaceState(null, "", "#/database/" + e.id);
  }

  // ---------- galleria (form) ----------
  function galleryHtml() {
    return `
      <div class="gallery-picker" id="gallery">
        <span class="lbl">Immagini <span class="hint">— la prima è la copertina</span></span>
        <div class="gp-grid"></div>
        <input type="file" accept="image/*" multiple hidden>
        <div class="picker-row">
          <input type="url" class="gp-url" placeholder="…oppure incolla URL immagine">
          <button type="button" class="btn ghost small cyan" data-gp="url">+ URL</button>
        </div>
      </div>`;
  }

  function bindGallery(root, initial) {
    const items = initial.map(ref => ({ ref }));
    const fileIn = $("input[type=file]", root), urlIn = $(".gp-url", root), grid = $(".gp-grid", root);
    const render = () => {
      grid.innerHTML = items.map((it, i) => `
        <div class="gp-item ${i === 0 ? "cover" : ""}" data-i="${i}">
          <img ${it.url ? `src="${it.url}"` : `data-ref="${esc(it.ref)}"`} alt="">
          ${i === 0 ? `<span class="gp-badge">COPERTINA</span>` : `<button type="button" class="gp-btn star" data-gp="cover" title="Usa come copertina">★</button>`}
          <button type="button" class="gp-btn del" data-gp="del" title="Rimuovi">✕</button>
          <div class="gp-move">
            <button type="button" class="gp-btn" data-gp="left" title="Sposta indietro" ${i === 0 ? "disabled" : ""}>‹</button>
            <span>${pad(i + 1)}</span>
            <button type="button" class="gp-btn" data-gp="right" title="Sposta avanti" ${i === items.length - 1 ? "disabled" : ""}>›</button>
          </div>
        </div>`).join("") +
        `<button type="button" class="gp-add" data-gp="add"><b>+</b><span>Aggiungi<br>immagini</span><small>o trascinale qui</small></button>`;
      hydrate(grid);
    };
    const addFiles = async files => {
      for (const f of files) {
        if (!f.type.startsWith("image/")) continue;
        const blob = await processImage(f);
        items.push({ blob, name: f.name, url: URL.createObjectURL(blob) });
      }
      render();
    };
    root.addEventListener("click", ev => {
      const b = ev.target.closest("[data-gp]"); if (!b) return;
      const act = b.dataset.gp;
      if (act === "add") return fileIn.click();
      if (act === "url") { const u = urlIn.value.trim(); if (u) { items.push({ ref: u }); urlIn.value = ""; render(); } return; }
      const i = +b.closest(".gp-item").dataset.i;
      if (act === "del") items.splice(i, 1);
      else if (act === "cover") items.unshift(items.splice(i, 1)[0]);
      else if (act === "left" && i > 0) [items[i - 1], items[i]] = [items[i], items[i - 1]];
      else if (act === "right" && i < items.length - 1) [items[i + 1], items[i]] = [items[i], items[i + 1]];
      render();
    });
    fileIn.addEventListener("change", () => { addFiles([...fileIn.files]); fileIn.value = ""; });
    root.addEventListener("dragover", ev => { ev.preventDefault(); root.classList.add("drag"); });
    root.addEventListener("dragleave", ev => { if (!root.contains(ev.relatedTarget)) root.classList.remove("drag"); });
    root.addEventListener("drop", ev => { ev.preventDefault(); root.classList.remove("drag"); addFiles([...ev.dataTransfer.files]); });
    render();
    return {
      async commit() {
        const out = [];
        for (const it of items) out.push(it.blob ? await Store.uploadFile(it.blob, it.name, "images") : it.ref);
        return out;
      },
    };
  }

  // ---------- form record ----------
  function imagePicker(name, ref, square = false) {
    return `
      <div class="picker" data-picker="${name}" data-type="image">
        <div class="picker-preview ${square ? "square" : ""}" data-action="pick-file" title="Clicca o trascina un'immagine">
          ${ref ? imgTag(ref) : `<div class="ph">TRASCINA QUI<br>un'immagine<br>o clicca</div>`}
        </div>
        <input type="hidden" name="${name}" value="${esc(ref || "")}">
        <input type="file" accept="image/*" hidden>
        <div class="picker-row">
          <input type="url" placeholder="…oppure URL immagine" data-picker-url value="${ref && !ref.startsWith("idb:") ? esc(ref) : ""}">
          <button type="button" class="btn ghost small" data-action="pick-clear">✕</button>
        </div>
      </div>`;
  }

  function cfRow(c = {}) {
    return `<div class="cf-row"><input placeholder="Campo (es. Cyberware)" data-cf-k value="${esc(c.k)}"><input placeholder="Valore" data-cf-v value="${esc(c.v)}"><button type="button" data-action="cf-del" aria-label="Rimuovi campo">✕</button></div>`;
  }

  const datalists = () => `
    <datalist id="dl-fac">${factions().map(x => `<option value="${esc(x)}">`).join("")}</datalist>
    <datalist id="dl-role">${ROLES.map(x => `<option value="${esc(x)}">`).join("")}</datalist>
    <datalist id="dl-att">${ATTITUDES.map(x => `<option value="${esc(x)}">`).join("")}</datalist>
    <datalist id="dl-loc">${[...new Set([...state.entries.map(x => x.kind === "luogo" ? x.name : x.location), ...state.events.map(x => x.location)].filter(Boolean))].map(x => `<option value="${esc(x)}">`).join("")}</datalist>`;

  function editEntry(id, preset = {}) {
    const e = state.entries.find(x => x.id === id) || { kind: state.filter.kind !== "all" ? state.filter.kind : "npc", status: "vivo", custom: [], ...preset };
    const oldImages = imagesOf(e);
    openModal(`
      <form class="form" id="entry-form">
        <div class="modal-head"><h2>${e.id ? "// MODIFICA RECORD" : "// NUOVO RECORD"}</h2><button type="button" class="x" data-action="close" aria-label="Chiudi">×</button></div>
        <div class="modal-body">
          <div class="form-grid">
            ${galleryHtml()}
            <div class="fields">
              <div class="field"><label class="req" for="f-name">Nome</label><input id="f-name" name="name" required value="${esc(e.name)}"></div>
              <div class="field"><label for="f-handle">Alias / Handle</label><input id="f-handle" name="handle" value="${esc(e.handle)}"></div>
              <div class="field"><label for="f-kind">Tipo</label><select id="f-kind" name="kind">${KINDS.map(k => `<option value="${k.id}" ${e.kind === k.id ? "selected" : ""}>${k.label}</option>`).join("")}</select></div>
              <div class="field"><label for="f-fac">Fazione</label><input id="f-fac" name="faction" list="dl-fac" value="${esc(e.faction)}" placeholder="es. Arasaka, Maelstrom…"></div>
              <div class="field"><label for="f-role">Ruolo</label><input id="f-role" name="role" list="dl-role" value="${esc(e.role)}"></div>
              <div class="field"><label for="f-status">Stato</label><select id="f-status" name="status">${STATUSES.map(s => `<option value="${s.id}" ${e.status === s.id ? "selected" : ""}>${s.label}</option>`).join("")}</select></div>
              <div class="field"><label for="f-att">Rapporto col party</label><input id="f-att" name="attitude" list="dl-att" value="${esc(e.attitude)}"></div>
              <div class="field"><label for="f-loc">Luogo</label><input id="f-loc" name="location" list="dl-loc" value="${esc(e.location)}" placeholder="es. Watson, Afterlife…"></div>
              <div class="field full"><label for="f-tags">Tag</label><input id="f-tags" name="tags" value="${esc((e.tags || []).join(", "))}" placeholder="separati da virgola: fixer, debito, sessione-3"></div>
              <div class="field full"><label for="f-desc">Descrizione</label><textarea id="f-desc" name="description" rows="3">${esc(e.description)}</textarea></div>
              <div class="field full"><label for="f-notes">Note</label><textarea id="f-notes" name="notes" rows="5">${esc(e.notes)}</textarea></div>
              <div class="field full">
                <span class="lbl">Campi personalizzati</span>
                <div class="cf-list" id="cf-list">${(e.custom || []).map(cfRow).join("")}</div>
                <div><button type="button" class="btn ghost small cyan" data-action="cf-add">+ Aggiungi campo</button></div>
                <span class="hint">Aggiungi quello che vuoi: Cyberware, Armi, Debiti, Prima apparizione, Contatti…</span>
              </div>
              ${gmCheck(e.gmOnly, "Record segreto: solo i GM lo vedono (scheda, cyberware ed equipaggiamento compresi)")}
            </div>
          </div>
          ${datalists()}
        </div>
        <div class="modal-foot">
          <button type="button" class="btn ghost small left" data-action="close">Annulla</button>
          <button type="submit" class="btn">Salva record</button>
        </div>
      </form>
    `);
    const gallery = bindGallery($("#gallery"), oldImages);
    $("#entry-form").addEventListener("submit", async ev => {
      ev.preventDefault();
      const form = ev.target, btn = $("button[type=submit]", form);
      btn.disabled = true; btn.textContent = "Salvataggio…";
      try {
        const fd = new FormData(form);
        const images = await gallery.commit();
        const rec = {
          ...e,
          name: fd.get("name").trim(), handle: fd.get("handle").trim(), kind: fd.get("kind"),
          faction: fd.get("faction").trim(), role: fd.get("role").trim(), status: fd.get("status"),
          attitude: fd.get("attitude").trim(), location: fd.get("location").trim(),
          tags: splitList(fd.get("tags")),
          description: fd.get("description").trim(), notes: fd.get("notes").trim(),
          custom: $$(".cf-row", form).map(r => ({ k: $("[data-cf-k]", r).value.trim(), v: $("[data-cf-v]", r).value.trim() })).filter(c => c.k || c.v),
          images, image: images[0] || "",
          gmOnly: isGm() ? !!fd.get("gmOnly") : !!e.gmOnly,
        };
        const saved = await Store.save("entries", rec);
        upsert(state.entries, saved);
        if (saved.gmOnly) liveSend("entries", saved);
        Store.deleteFiles(oldImages.filter(r => !images.includes(r))).catch(() => {});
        toast(saved.gmOnly ? "Record segreto salvato" : "Record salvato", "ok");
        closeModal();
        route();
        if (location.hash.startsWith("#/database")) openEntry(saved.id);
      } catch (err) { fail(err); btn.disabled = false; btn.textContent = "Salva record"; }
    });
  }

  // note segrete del GM su un personaggio pubblico: record a parte (gmnotes), così il database non le dà ai giocatori
  function editGmNote(entryId) {
    const e = state.entries.find(x => x.id === entryId); if (!e || !isGm()) return;
    const g = gmNoteOf(entryId) || { id: "gmn-" + entryId, entryId };
    openModal(`
      <form class="form" id="gmn-form">
        <div class="modal-head"><h2>// 🔒 NOTE DEL GM · ${esc(e.name)}</h2><button type="button" class="x" data-action="open-entry" data-id="${esc(e.id)}" aria-label="Chiudi">×</button></div>
        <div class="modal-body">
          <div class="field full"><label for="gmn-text">Solo i GM vedono queste note</label><textarea id="gmn-text" name="text" rows="12" placeholder="Vere intenzioni, segreti, legami nascosti, statistiche…">${esc(g.text)}</textarea></div>
        </div>
        <div class="modal-foot">
          <button type="button" class="btn ghost small left" data-action="open-entry" data-id="${esc(e.id)}">Annulla</button>
          <button type="submit" class="btn">Salva note GM</button>
        </div>
      </form>`, true);
    $("#gmn-form").addEventListener("submit", async ev => {
      ev.preventDefault();
      try {
        const saved = await Store.save("gmnotes", { ...g, text: ev.target.text.value, entryName: e.name, gmOnly: true });
        upsert(state.gmnotes, saved); toast("Note GM salvate", "ok");
        if (location.hash.startsWith("#/gm")) { closeModal(); route(); } else openEntry(e.id);
      } catch (err) { fail(err); }
    });
  }

  // ---------- picker singolo (copertine / audio) ----------
  function bindPickers(root) {
    for (const p of $$("[data-picker]", root)) {
      const fileIn = $("input[type=file]", p), hidden = $("input[type=hidden]", p), urlIn = $("[data-picker-url]", p);
      const prev = $(".picker-preview", p);
      const setFile = async file => {
        if (!file) return;
        if (p.dataset.type === "image" && !file.type.startsWith("image/")) return toast("Serve un file immagine", "err");
        if (p.dataset.type === "audio" && !file.type.startsWith("audio/")) return toast("Serve un file audio", "err");
        p._blob = p.dataset.type === "image" ? await processImage(file) : file;
        p._name = file.name;
        const url = URL.createObjectURL(p._blob);
        if (p.dataset.type === "image") prev.innerHTML = `<img src="${url}" alt="">`;
        else { $("audio", p).src = url; $("audio", p).hidden = false; $(".audio-name", p).textContent = "📁 " + file.name + " (" + (file.size / 1048576).toFixed(1) + " MB)"; }
        if (urlIn) urlIn.value = "";
      };
      fileIn.addEventListener("change", () => setFile(fileIn.files[0]));
      if (prev) {
        prev.addEventListener("dragover", ev => { ev.preventDefault(); prev.classList.add("drag"); });
        prev.addEventListener("dragleave", () => prev.classList.remove("drag"));
        prev.addEventListener("drop", ev => { ev.preventDefault(); prev.classList.remove("drag"); setFile(ev.dataTransfer.files[0]); });
      }
      urlIn && urlIn.addEventListener("change", () => {
        p._blob = null; hidden.value = urlIn.value.trim();
        if (p.dataset.type === "image") prev.innerHTML = hidden.value ? `<img src="${esc(hidden.value)}" alt="">` : `<div class="ph">NESSUNA IMMAGINE</div>`;
        else { const a = $("audio", p); a.hidden = !hidden.value; if (hidden.value) a.src = hidden.value; $(".audio-name", p).textContent = ""; }
      });
    }
    hydrate(root);
  }

  async function commitPicker(form, name, folder) {
    const p = $(`[data-picker="${name}"]`, form);
    if (p._blob) return await Store.uploadFile(p._blob, p._name, folder);
    return $("input[type=hidden]", p).value.trim();
  }

  // ---------- CALENDARIO ----------
  const wxOn = date => state.weather.find(w => w.date === date && wxOf(w.type));
  const wxBadge = w => w ? `<span class="cal-wx" title="${esc(wxOf(w.type).label)}${w.temp != null && w.temp !== "" ? " · " + fmtTemp(w.temp) : ""}">${wxIcon(w.type)}${w.temp != null && w.temp !== "" ? `<b>${Math.round(w.temp)}°</b>` : ""}</span>` : "";

  function eventsOn(date) {
    return state.events.filter(e => e.date === date).sort((a, b) => (a.time || "99").localeCompare(b.time || "99"));
  }

  function monthNav(y, m) {
    const prev = m === 1 ? [y - 1, 12] : [y, m - 1], next = m === 12 ? [y + 1, 1] : [y, m + 1];
    const canPrev = prev[0] >= START_YEAR, canNext = next[0] <= END_YEAR;
    const years = []; for (let i = START_YEAR; i <= END_YEAR; i++) years.push(i);
    return `
      <div class="cal-nav">
        <a class="car-btn inline prev ${canPrev ? "" : "disabled"}" ${canPrev ? `href="#/calendario/${prev[0]}-${pad(prev[1])}"` : ""} aria-label="Mese precedente"><span>‹</span></a>
        <div class="cal-title">
          <span class="cal-month glitch" data-text="${MONTHS[m - 1].toUpperCase()}">${MONTHS[m - 1].toUpperCase()}</span>
          <span class="cal-year">${y}</span>
        </div>
        <a class="car-btn inline next ${canNext ? "" : "disabled"}" ${canNext ? `href="#/calendario/${next[0]}-${pad(next[1])}"` : ""} aria-label="Mese successivo"><span>›</span></a>
        <div class="cal-jump">
          <select id="cal-m" aria-label="Mese">${MONTHS.map((n, i) => `<option value="${i + 1}" ${i + 1 === m ? "selected" : ""}>${n}</option>`).join("")}</select>
          <select id="cal-y" aria-label="Anno">${years.map(v => `<option ${v === y ? "selected" : ""}>${v}</option>`).join("")}</select>
          ${site().campaignDate && validDay(site().campaignDate) ? `<a class="btn small yellow ghost" href="#/calendario/${esc(site().campaignDate)}">◉ Oggi in gioco</a>` : ""}
        </div>
      </div>`;
  }

  function viewMonth(p) {
    const fallback = parseYmd(site().campaignDate) || state.cal || { y: START_YEAR, m: 1 };
    let { y, m } = p || state.cal || fallback;
    y = Math.min(END_YEAR, Math.max(START_YEAR, y)); m = Math.min(12, Math.max(1, m));
    state.cal = { y, m }; ls.set("nc-cal", state.cal);
    const first = wday(y, m, 1), n = daysIn(y, m), gameDay = site().campaignDate;
    const prefix = `${y}-${pad(m)}-`;
    const monthEvents = state.events.filter(e => (e.date || "").startsWith(prefix))
      .sort((a, b) => (a.date + (a.time || "")).localeCompare(b.date + (b.time || "")));
    const cells = [];
    for (let i = 0; i < first; i++) cells.push(`<div class="cal-cell blank"></div>`);
    for (let d = 1; d <= n; d++) {
      const date = ymd(y, m, d), evs = monthEvents.filter(e => e.date === date);
      cells.push(`
        <a class="cal-cell ${evs.length ? "has" : ""} ${date === gameDay ? "today" : ""} ${wday(y, m, d) >= 5 ? "weekend" : ""}" href="#/calendario/${date}" aria-label="${d} ${MONTHS[m - 1]} ${y}${evs.length ? `, ${evs.length} eventi` : ""}">
          <span class="cal-top">
            <span class="cal-n">${pad(d)}</span>
            ${date === gameDay ? `<span class="cal-now">OGGI</span>` : ""}
            ${wxBadge(wxOn(date))}
          </span>
          <span class="cal-evs">
            ${evs.slice(0, 3).map(e => `<span class="cal-ev" style="--c:${evType(e.type).color}">${esc(e.title)}</span>`).join("")}
            ${evs.length > 3 ? `<span class="cal-more">+${evs.length - 3}</span>` : ""}
          </span>
        </a>`);
    }
    while (cells.length % 7) cells.push(`<div class="cal-cell blank"></div>`);
    return `
      <div class="page-head">
        <div><div class="kicker">// NC_CHRONOLOG</div><h1>Calendario</h1><p>Clicca un giorno per leggere o scrivere cosa è successo.</p></div>
        ${Store.canEdit() ? `<button class="btn" data-action="new-event" data-date="${ymd(y, m, 1)}">+ Nuovo evento</button>` : ""}
      </div>
      ${monthNav(y, m)}
      <div class="cal">
        <div class="cal-head">${WDAYS.map(d => `<span>${d}</span>`).join("")}</div>
        <div class="cal-grid">${cells.join("")}</div>
      </div>
      <div class="section-title" style="margin-top:28px"><h2>Eventi di ${MONTHS[m - 1]} ${y}</h2></div>
      ${monthEvents.length ? `<div class="timeline">${monthEvents.map(timelineItem).join("")}</div>`
        : `<div class="empty"><div class="big">// NESSUN EVENTO</div>Nessun evento registrato in questo mese.</div>`}
      <div class="legend">${EVENT_TYPES.map(t => `<span style="--c:${t.color}">${t.label}</span>`).join("")}</div>
      ${state.weather.some(w => w.date.startsWith(prefix)) ? `<div class="legend wx-legend">${
        [...new Set(state.weather.filter(w => w.date.startsWith(prefix)).map(w => w.type))].filter(wxOf)
          .map(t => `<span>${wxIcon(t)}${esc(wxOf(t).label)}</span>`).join("")}</div>` : ""}`;
  }

  function viewDay(date) {
    const p = parseYmd(date), evs = eventsOn(date), gameDay = site().campaignDate;
    const prev = addDays(date, -1), next = addDays(date, 1);
    const canPrev = validDay(prev), canNext = validDay(next);
    return `
      <a class="back" href="#/calendario/${p.y}-${pad(p.m)}">‹ ${MONTHS[p.m - 1]} ${p.y}</a>
      <div class="day-head">
        <a class="car-btn inline prev ${canPrev ? "" : "disabled"}" ${canPrev ? `href="#/calendario/${prev}"` : ""} aria-label="Giorno precedente"><span>‹</span></a>
        <div class="day-title">
          <div class="kicker">// ${WDAYS_LONG[wday(p.y, p.m, p.d)].toUpperCase()} ${date === gameDay ? `· <span class="now-tag">DATA IN GIOCO</span>` : ""}</div>
          <h1><span class="day-num">${pad(p.d)}</span> ${MONTHS[p.m - 1]} <span class="day-year">${p.y}</span></h1>
        </div>
        <a class="car-btn inline next ${canNext ? "" : "disabled"}" ${canNext ? `href="#/calendario/${next}"` : ""} aria-label="Giorno successivo"><span>›</span></a>
      </div>
      ${weatherPanel(date)}
      ${diaryOnDay(date)}
      ${Store.canEdit() ? `<div class="day-actions">
        <button class="btn" data-action="new-event" data-date="${date}">+ Aggiungi evento</button>
        ${date !== gameDay ? `<button class="btn yellow ghost small" data-action="set-gameday" data-date="${date}">◉ Imposta come data in gioco</button>` : ""}
      </div>` : ""}
      ${evs.length ? `<div class="events">${evs.map(eventCard).join("")}</div>`
        : `<div class="empty"><div class="big">// LOG VUOTO</div>Nessun evento registrato in questo giorno.
           ${Store.canEdit() ? `<br><button class="btn" data-action="new-event" data-date="${date}">+ Scrivi cosa è successo</button>` : ""}</div>`}`;
  }

  // ---------- METEO ----------
  function weatherPanel(date) {
    const w = wxOn(date), edit = Store.canEdit();
    if (!w) return edit
      ? `<button class="wx-panel wx-empty" data-action="edit-weather" data-date="${date}"><span class="wx-plus">+</span> Aggiungi il meteo del giorno</button>`
      : "";
    const t = wxOf(w.type);
    return `
      <div class="wx-panel" style="--c:${t.color}">
        <div class="wx-big">${wxIcon(w.type, "wx-ic big")}</div>
        <div class="wx-info">
          <div class="wx-kicker">// METEO · NIGHT CITY</div>
          <div class="wx-name">${esc(t.label)}</div>
          ${w.note ? `<div class="wx-note">${esc(w.note)}</div>` : ""}
        </div>
        ${w.temp != null && w.temp !== "" ? `<div class="wx-temp">${Math.round(w.temp)}<small>${TEMP_UNIT}</small></div>` : ""}
        ${edit ? `<button class="btn ghost small cyan wx-edit" data-action="edit-weather" data-date="${date}">Modifica</button>` : ""}
      </div>`;
  }

  function editWeather(date) {
    const w = wxOn(date) || {};
    const prev = wxOn(addDays(date, -1));
    openModal(`
      <form class="form" id="wx-form">
        <div class="modal-head"><h2>// METEO · ${fmtDate(date).toUpperCase()}</h2><button type="button" class="x" data-action="close" aria-label="Chiudi">×</button></div>
        <div class="modal-body">
          <span class="lbl">Condizioni</span>
          <div class="wx-grid">
            ${WEATHER.map(t => `
              <label class="wx-opt" style="--c:${t.color}">
                <input type="radio" name="type" value="${t.id}" ${w.type === t.id ? "checked" : ""} required>
                ${wxIcon(t.id)}<span>${esc(t.label)}</span>
              </label>`).join("")}
          </div>
          <div class="fields" style="margin-top:16px">
            <div class="field"><label for="wx-temp">Temperatura (${TEMP_UNIT})</label>
              <div class="temp-row"><button type="button" class="gp-btn" data-temp="-1" aria-label="Meno un grado">−</button>
              <input id="wx-temp" name="temp" type="number" step="1" min="-40" max="60" value="${esc(w.temp ?? "")}" placeholder="es. 18">
              <button type="button" class="gp-btn" data-temp="1" aria-label="Più un grado">+</button></div></div>
            <div class="field"><label for="wx-note">Nota (facoltativa)</label><input id="wx-note" name="note" value="${esc(w.note)}" placeholder="es. allerta smog, coprifuoco"></div>
          </div>
          ${prev && !w.type ? `<button type="button" class="btn ghost small yellow" data-wx-copy style="margin-top:14px">↺ Come il giorno prima (${esc(wxOf(prev.type).label)}${prev.temp != null && prev.temp !== "" ? ", " + fmtTemp(prev.temp) : ""})</button>` : ""}
        </div>
        <div class="modal-foot">
          ${w.id ? `<button type="button" class="btn ghost small left" data-action="delete-weather" data-id="${esc(w.id)}">Rimuovi meteo</button>` : `<button type="button" class="btn ghost small left" data-action="close">Annulla</button>`}
          <button type="submit" class="btn">Salva meteo</button>
        </div>
      </form>`, true);
    const form = $("#wx-form");
    form.addEventListener("click", ev => {
      const b = ev.target.closest("[data-temp]");
      if (b) { const i = form.temp; i.value = (Number(i.value) || 0) + Number(b.dataset.temp); }
      if (ev.target.closest("[data-wx-copy]") && prev) {
        form.querySelector(`input[name=type][value="${prev.type}"]`).checked = true;
        form.temp.value = prev.temp ?? ""; form.note.value = prev.note || "";
      }
    });
    form.addEventListener("submit", async ev => {
      ev.preventDefault();
      const fd = new FormData(form), temp = fd.get("temp");
      try {
        const saved = await Store.save("weather", {
          ...w, id: w.id || "wx-" + date, date, type: fd.get("type"),
          temp: temp === "" ? null : Number(temp), note: fd.get("note").trim(),
        });
        upsert(state.weather, saved);
        toast("Meteo salvato", "ok"); closeModal(); route();
      } catch (err) { fail(err); }
    });
  }

  function eventCard(ev) {
    const t = evType(ev.type);
    return `
      <article class="event" style="--c:${t.color}">
        <div class="event-head">
          <span class="event-time">${ev.time ? esc(ev.time) : "--:--"}</span>
          <span class="event-type">${esc(t.label)}</span>
          ${Store.canEdit() ? `<span class="event-tools">
            <button class="btn ghost small cyan" data-action="edit-event" data-id="${esc(ev.id)}">Modifica</button>
            <button class="btn ghost small" data-action="delete-event" data-id="${esc(ev.id)}">✕</button></span>` : ""}
        </div>
        <h3>${esc(ev.title)}</h3>
        ${ev.location || (ev.people || []).length ? `<dl class="event-meta">
          ${ev.location ? `<dt>Luogo</dt><dd>${peopleLinks([ev.location])}</dd>` : ""}
          ${(ev.people || []).length ? `<dt>Coinvolti</dt><dd>${peopleLinks(ev.people)}</dd>` : ""}
        </dl>` : ""}
        ${ev.body ? `<div class="prewrap event-body">${esc(ev.body)}</div>` : ""}
        ${(ev.tags || []).length ? `<div class="meta">${ev.tags.map(x => `<span class="badge tag">#${esc(x)}</span>`).join("")}</div>` : ""}
      </article>`;
  }

  function editEvent(id, date) {
    const ev = state.events.find(x => x.id === id) || { date: date || ymd(START_YEAR, 1, 1), type: "storia" };
    const names = state.entries.filter(e => e.kind !== "luogo").map(e => e.name).filter(Boolean);
    openModal(`
      <form class="form" id="event-form">
        <div class="modal-head"><h2>${ev.id ? "// MODIFICA EVENTO" : "// NUOVO EVENTO"}</h2><button type="button" class="x" data-action="close" aria-label="Chiudi">×</button></div>
        <div class="modal-body">
          <div class="fields">
            <div class="field"><label class="req" for="e-date">Data</label><input id="e-date" name="date" type="date" required min="${START_YEAR}-01-01" max="${END_YEAR}-12-31" value="${esc(ev.date)}"></div>
            <div class="field"><label for="e-time">Ora</label><input id="e-time" name="time" type="time" value="${esc(ev.time)}"></div>
            <div class="field full"><label class="req" for="e-title">Titolo</label><input id="e-title" name="title" required value="${esc(ev.title)}" placeholder="es. Imboscata al mercato di Kabuki"></div>
            <div class="field"><label for="e-type">Tipo</label><select id="e-type" name="type">${EVENT_TYPES.map(t => `<option value="${t.id}" ${ev.type === t.id ? "selected" : ""}>${t.label}</option>`).join("")}</select></div>
            <div class="field"><label for="e-loc">Luogo</label><input id="e-loc" name="location" list="dl-loc" value="${esc(ev.location)}"></div>
            <div class="field full"><label for="e-people">Coinvolti</label><input id="e-people" name="people" value="${esc((ev.people || []).join(", "))}" placeholder="nomi separati da virgola — diventano link al database">
              <span class="hint">Nel database: ${names.length ? names.slice(0, 12).map(esc).join(", ") + (names.length > 12 ? "…" : "") : "nessun NPC ancora"}</span></div>
            <div class="field full"><label for="e-body">Cosa è successo</label><textarea id="e-body" name="body" rows="9" placeholder="Racconta l'evento nel dettaglio…">${esc(ev.body)}</textarea></div>
            <div class="field full"><label for="e-tags">Tag</label><input id="e-tags" name="tags" value="${esc((ev.tags || []).join(", "))}" placeholder="sessione-4, bottino, indizio"></div>
          </div>
          ${datalists()}
        </div>
        <div class="modal-foot">
          <button type="button" class="btn ghost small left" data-action="close">Annulla</button>
          <button type="submit" class="btn">Salva evento</button>
        </div>
      </form>`);
    $("#event-form").addEventListener("submit", async e2 => {
      e2.preventDefault();
      const form = e2.target, btn = $("button[type=submit]", form), fd = new FormData(form);
      if (!validDay(fd.get("date"))) return toast(`La data deve essere tra il ${START_YEAR} e il ${END_YEAR}`, "err");
      btn.disabled = true;
      try {
        const saved = await Store.save("events", {
          ...ev, date: fd.get("date"), time: fd.get("time"), title: fd.get("title").trim(), type: fd.get("type"),
          location: fd.get("location").trim(), people: splitList(fd.get("people")),
          body: fd.get("body").trim(), tags: splitList(fd.get("tags")),
        });
        upsert(state.events, saved);
        toast("Evento salvato", "ok"); closeModal();
        if (location.hash !== "#/calendario/" + saved.date) location.hash = "#/calendario/" + saved.date; else route();
      } catch (err) { fail(err); btn.disabled = false; }
    });
  }

  // ---------- APPUNTI ----------
  function filteredNotes() {
    const q = norm(state.noteQ);
    return state.notes
      .filter(n => !q || [n.title, n.body, n.category, (n.tags || []).join(" ")].some(v => norm(v).includes(q)))
      .sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || (b.updatedAt || "").localeCompare(a.updatedAt || ""));
  }
  const slug = s => (norm(s).replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "").slice(0, 24) || "untitled");

  function viewNotes() {
    return `
      <div class="page-head">
        <div><div class="kicker">// SHARD_STORAGE</div><h1>Appunti</h1><p>Riassunti delle sessioni, indizi, lore e tutto quello da non dimenticare.</p></div>
        ${Store.canEdit() ? `<button class="btn" data-action="new-note">+ Nuovo appunto</button>` : ""}
      </div>
      <div class="toolbar"><input class="search" id="note-q" type="search" placeholder="> cerca negli appunti…" value="${esc(state.noteQ)}"></div>
      <div id="notes-results">${notesHtml()}</div>`;
  }
  function notesHtml() {
    if (!state.notes.length) return `<div class="empty"><div class="big">// SHARD VUOTO</div>Nessun appunto ancora.
      ${Store.canEdit() ? `<br><button class="btn" data-action="new-note">+ Scrivi il primo appunto</button>` : ""}</div>`;
    const list = filteredNotes();
    if (!list.length) return `<div class="empty"><div class="big">// NESSUN RISULTATO</div></div>`;
    return `<div class="notes-grid">${list.map(cardNote).join("")}</div>`;
  }
  function cardNote(n) {
    const ex = (n.body || "").slice(0, 220);
    return `
      <button class="note-card ${n.pinned ? "pinned" : ""} ${n.gmOnly ? "is-gm" : ""}" data-action="open-note" data-id="${esc(n.id)}">
        <span class="note-bar"><span>&gt; ${esc(slug(n.title))}.shard</span>${n.gmOnly ? `<span class="pin gm">🔒 SOLO GM</span>` : ""}${n.pinned ? `<span class="pin">▲ FISSATO</span>` : ""}</span>
        <span class="note-inner">
          <h3>${esc(n.title || "Senza titolo")}</h3>
          ${ex ? `<span class="note-ex">${esc(ex)}${(n.body || "").length > 220 ? "…" : ""}</span>` : ""}
          <span class="meta">
            ${n.category ? `<span class="badge faction">${esc(n.category)}</span>` : ""}
            ${(n.tags || []).slice(0, 4).map(t => `<span class="badge tag">#${esc(t)}</span>`).join("")}
            <span class="note-date">${fmtStamp(n.updatedAt)}</span>
          </span>
        </span>
      </button>`;
  }

  function openNote(id) {
    const n = state.notes.find(x => x.id === id); if (!n) return;
    openModal(`
      <div class="modal-head"><h2>// ${esc(slug(n.title))}.shard</h2><button class="x" data-action="close" aria-label="Chiudi">×</button></div>
      <div class="modal-body note-view">
        <div class="kicker">${n.category ? esc(n.category.toUpperCase()) + " · " : ""}AGGIORNATO ${esc(fmtStamp(n.updatedAt).toUpperCase())}</div>
        <h1>${esc(n.title || "Senza titolo")}</h1>
        ${(n.tags || []).length || n.gmOnly ? `<div class="meta">${gmBadge(n)}${(n.tags || []).map(t => `<span class="badge tag">#${esc(t)}</span>`).join("")}</div>` : ""}
        <div class="prewrap note-body">${esc(n.body)}</div>
      </div>
      ${Store.canEdit() ? `<div class="modal-foot">
        <button class="btn ghost small left" data-action="delete-note" data-id="${esc(n.id)}">Elimina</button>
        <button class="btn cyan" data-action="edit-note" data-id="${esc(n.id)}">Modifica</button>
      </div>` : ""}`);
    if (location.hash !== "#/appunti/" + n.id && location.hash.startsWith("#/appunti")) history.replaceState(null, "", "#/appunti/" + n.id);
  }

  function editNote(id, preset = {}) {
    const n = state.notes.find(x => x.id === id) || { ...preset };
    openModal(`
      <form class="form" id="note-form">
        <div class="modal-head"><h2>${n.id ? "// MODIFICA APPUNTO" : "// NUOVO APPUNTO"}</h2><button type="button" class="x" data-action="close" aria-label="Chiudi">×</button></div>
        <div class="modal-body">
          <div class="fields">
            <div class="field full"><label class="req" for="n-title">Titolo</label><input id="n-title" name="title" required value="${esc(n.title)}"></div>
            <div class="field"><label for="n-cat">Categoria</label><input id="n-cat" name="category" list="dl-ncat" value="${esc(n.category)}"></div>
            <div class="field"><label for="n-tags">Tag</label><input id="n-tags" name="tags" value="${esc((n.tags || []).join(", "))}"></div>
            <div class="field full"><label for="n-body">Testo</label><textarea id="n-body" name="body" rows="16">${esc(n.body)}</textarea></div>
            <label class="check field full"><input type="checkbox" name="pinned" ${n.pinned ? "checked" : ""}> Fissa in cima</label>
            ${gmCheck(n.gmOnly, "Appunto segreto: solo i GM lo vedono")}
          </div>
          <datalist id="dl-ncat">${[...new Set([...NOTE_CATEGORIES, ...state.notes.map(x => x.category).filter(Boolean)])].map(c => `<option value="${esc(c)}">`).join("")}</datalist>
        </div>
        <div class="modal-foot">
          <button type="button" class="btn ghost small left" data-action="close">Annulla</button>
          <button type="submit" class="btn">Salva appunto</button>
        </div>
      </form>`);
    $("#note-form").addEventListener("submit", async ev => {
      ev.preventDefault();
      const form = ev.target, btn = $("button[type=submit]", form), fd = new FormData(form);
      btn.disabled = true;
      try {
        const saved = await Store.save("notes", {
          ...n, title: fd.get("title").trim(), category: fd.get("category").trim(),
          tags: splitList(fd.get("tags")), body: fd.get("body"), pinned: !!fd.get("pinned"),
          gmOnly: isGm() ? !!fd.get("gmOnly") : !!n.gmOnly,
        });
        upsert(state.notes, saved);
        if (saved.gmOnly) liveSend("notes", saved);   // chi l'aveva già aperto da giocatore la perde subito
        toast(saved.gmOnly ? "Appunto segreto salvato" : "Appunto salvato", "ok"); closeModal(); route();
        if (location.hash.startsWith("#/appunti")) openNote(saved.id);
      } catch (err) { fail(err); btn.disabled = false; }
    });
  }

  // ---------- DIARIO & QUEST ----------
  // Il diario è diviso in capitoli e ogni capitolo in scene. Ogni scena può appartenere
  // a più quest (le storie si intrecciano): la pagina di una quest raccoglie le sue scene in ordine.
  // Formattazione del racconto: riga vuota = paragrafo · "## " titoletto · "> " citazione ·
  // "- " elenco · "---" stacco · **grassetto** · *corsivo* ·
  // blocchi "::: rete Nome" / "::: log Titolo" / "::: nota Titolo" ... chiusi da ":::".
  const QUEST_STATUS = [
    { id: "in-corso", label: "In corso",   color: "var(--yellow)" },
    { id: "sospesa",  label: "In sospeso", color: "var(--muted)" },
    { id: "conclusa", label: "Conclusa",   color: "var(--green)" },
  ];
  const QUEST_COLORS = ["var(--cyan)", "var(--yellow)", "var(--magenta)", "var(--green)", "var(--red)"];
  state.quest = ls.get("nc-quest", "all");
  const qStatus = id => QUEST_STATUS.find(s => s.id === id) || QUEST_STATUS[0];
  const questById = id => state.quests.find(q => q.id === id);
  const questColor = q => !q ? "var(--muted)" : q.color || QUEST_COLORS[[...q.id].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7) % QUEST_COLORS.length];
  const questsOf = s => (s.quests || []).map(questById).filter(Boolean);
  const scenesOf = q => sortScenes(state.diary.filter(s => (s.quests || []).includes(q.id)));
  const sortScenes = list => [...list].sort((a, b) =>
    (a.chapterNo ?? 1e9) - (b.chapterNo ?? 1e9) || (a.order ?? 1e9) - (b.order ?? 1e9) || (a.createdAt || "").localeCompare(b.createdAt || ""));
  const sortQuests = list => [...list].sort((a, b) =>
    QUEST_STATUS.findIndex(s => s.id === qStatus(a.status).id) - QUEST_STATUS.findIndex(s => s.id === qStatus(b.status).id) ||
    (a.order ?? 1e9) - (b.order ?? 1e9) || (a.name || "").localeCompare(b.name || "", "it"));
  function chapters() {
    const out = [];
    for (const s of sortScenes(state.diary)) {
      const last = out[out.length - 1];
      if (last && last.no === s.chapterNo && last.title === (s.chapter || "")) last.scenes.push(s);
      else out.push({ no: s.chapterNo, title: s.chapter || "", scenes: [s] });
    }
    return out;
  }
  const sceneNum = s => `${s.chapterNo != null ? pad(s.chapterNo) : "--"}.${s.order != null ? pad(s.order) : "--"}`;
  const sceneEnd = s => s.dateTo && s.dateTo > s.dateFrom ? s.dateTo : s.dateFrom;
  const coversDay = (s, d) => !!s.dateFrom && d >= s.dateFrom && d <= sceneEnd(s);
  function fmtRange(s) {
    if (!s.dateFrom) return "";
    const a = parseYmd(s.dateFrom), end = sceneEnd(s), b = parseYmd(end);
    let t;
    if (end === s.dateFrom) t = fmtDate(s.dateFrom);
    else if (a.y === b.y && a.m === b.m) t = `${a.d}–${b.d} ${MONTHS[a.m - 1]} ${a.y}`;
    else if (a.y === b.y) t = `${a.d} ${MONTHS[a.m - 1]} – ${b.d} ${MONTHS[b.m - 1]} ${a.y}`;
    else t = `${fmtDate(s.dateFrom)} – ${fmtDate(end)}`;
    return (s.dateUncertain ? "≈ " : "") + t;
  }
  // conteggio dei nomi più presenti in un gruppo di scene
  function topNames(scenes, key, n = 12) {
    const m = new Map();
    scenes.forEach(s => (s[key] || []).forEach(x => m.set(x, (m.get(x) || 0) + 1)));
    return [...m].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "it")).slice(0, n).map(x => x[0]);
  }
  const questTag = q => `<a class="quest-tag" style="--c:${questColor(q)}" href="#/quest/${esc(q.id)}">◆ ${esc(q.name)}</a>`;
  const questSpan = q => `<span class="quest-tag" style="--c:${questColor(q)}">◆ ${esc(q.name)}</span>`;
  const statusBadge = q => { const st = qStatus(q.status); return `<span class="qstatus" style="--s:${st.color}">${esc(st.label)}</span>`; };

  // ---- testo formattato ----
  const inlineMd = t => esc(t)
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/(^|[^*\w])\*([^*\n]+?)\*(?!\w)/g, "$1<em>$2</em>");
  function mdBlock(lines) {
    const b = lines.join("\n");
    if (/^\s*-{3,}\s*$/.test(b)) return `<hr class="dy-sep">`;
    if (lines[0].startsWith("## ")) {
      const rest = lines.slice(1);
      return `<h3>${inlineMd(lines[0].slice(3))}</h3>` + (rest.length ? mdBlock(rest) : "");
    }
    if (lines.every(l => l.startsWith(">"))) return `<blockquote>${lines.map(l => inlineMd(l.replace(/^>\s?/, ""))).join("<br>")}</blockquote>`;
    if (lines.every(l => /^\s*[-•*]\s/.test(l))) return `<ul>${lines.map(l => `<li>${inlineMd(l.replace(/^\s*[-•*]\s/, ""))}</li>`).join("")}</ul>`;
    return `<p>${lines.map(inlineMd).join("<br>")}</p>`;
  }
  function boxBlock(type, title, lines) {
    lines = lines.filter(l => l.trim());
    if (type === "rete") {
      const rows = lines.map(l => {
        const m = l.match(/^\s*([^:]{1,28}):\s*(.*)$/);
        return m ? `<li><span class="nf">${esc(m[1].trim())}</span><span class="nc">${inlineMd(m[2])}</span></li>` : `<li class="free">${inlineMd(l)}</li>`;
      }).join("");
      return `<div class="dy-box net"><div class="dy-box-h">◈ ARCHITETTURA DI RETE${title ? " · " + esc(title) : ""}</div><ol class="net-floors">${rows}</ol></div>`;
    }
    if (type === "log") {
      const rows = lines.map(l => {
        const m = l.match(/^\s*(\d{1,2}:\d{2}(?:\s*[–-]\s*\d{1,2}:\d{2})?(?:\s*\([^)]*\))?)\s*[–-]\s*(.*)$/) || l.match(/^\s*([^:]{1,24}):\s*(.*)$/);
        return m ? `<li><span class="lk">${esc(m[1].trim())}</span><span class="lv">${inlineMd(m[2])}</span></li>` : `<li class="free">${inlineMd(l)}</li>`;
      }).join("");
      return `<div class="dy-box log"><div class="dy-box-h">▤ ${esc(title || "LOG")}</div><ul class="log-rows">${rows}</ul></div>`;
    }
    return `<div class="dy-box nota"><div class="dy-box-h">✦ ${esc(title || "NOTA")}</div>${lines.length ? `<p>${lines.map(inlineMd).join("<br>")}</p>` : ""}</div>`;
  }
  function richText(src) {
    const out = [], lines = String(src || "").replace(/\r/g, "").split("\n");
    let para = [];
    const flush = () => { if (para.length) out.push(mdBlock(para)); para = []; };
    for (let i = 0; i < lines.length; i++) {
      const m = lines[i].match(/^:::\s*(\w+)\s*(.*)$/);
      if (m) {
        flush();
        const body = [];
        for (i++; i < lines.length && !/^:::\s*$/.test(lines[i]); i++) body.push(lines[i]);
        out.push(boxBlock(m[1].toLowerCase(), m[2].trim(), body));
      } else if (!lines[i].trim()) flush();
      else para.push(lines[i]);
    }
    flush();
    return out.join("");
  }

  // ---- elenco del diario ----
  const diaryTabs = active => `
    <nav class="dy-tabs">
      <a href="#/diario" class="${active === "diario" ? "active" : ""}">▤ Capitoli</a>
      <a href="#/quest" class="${active === "quest" ? "active" : ""}">◆ Quest</a>
    </nav>`;
  function filteredScenes() {
    const q = norm(state.diaryQ);
    return sortScenes(state.diary).filter(s =>
      (state.quest === "all" || (s.quests || []).includes(state.quest)) &&
      (!q || [s.title, s.chapter, s.summary, s.body, questsOf(s).map(x => x.name).join(" "),
        (s.people || []).join(" "), (s.places || []).join(" "), (s.tags || []).join(" ")].some(v => norm(v).includes(q))));
  }
  function viewDiary() {
    if (state.quest !== "all" && !questById(state.quest)) state.quest = "all";
    const quests = sortQuests(state.quests);
    return `
      <div class="page-head">
        <div><div class="kicker">// BRAINDANCE_LOG</div><h1>Diario</h1><p>La cronaca della campagna, capitolo per capitolo. Ogni scena può far parte di più quest.</p></div>
        ${Store.canEdit() ? `<div class="head-actions"><button class="btn ghost cyan" data-action="new-quest">+ Quest</button><button class="btn" data-action="new-scene">+ Nuova scena</button></div>` : ""}
      </div>
      ${diaryTabs("diario")}
      <div class="toolbar">
        <input class="search" id="diary-q" type="search" placeholder="> cerca nel diario: nomi, luoghi, fatti…" value="${esc(state.diaryQ)}">
      </div>
      ${quests.length ? `<div class="chips quest-chips">
        <button class="chip ${state.quest === "all" ? "active" : ""}" data-action="set-quest" data-quest="all">Tutte<span class="count">${state.diary.length}</span></button>
        ${quests.map(q => `<button class="chip ${state.quest === q.id ? "active" : ""}" style="--qc:${questColor(q)}" data-action="set-quest" data-quest="${esc(q.id)}"><span class="qdot"></span>${esc(q.name)}<span class="count">${scenesOf(q).length}</span></button>`).join("")}
      </div>` : ""}
      <div id="diary-results">${diaryResults()}</div>`;
  }
  function diaryResults() {
    if (!state.diary.length) return `<div class="empty"><div class="big">// NESSUN RICORDO</div>Il diario è ancora vuoto.
      ${Store.canEdit() ? `<br><button class="btn" data-action="new-scene">+ Scrivi la prima scena</button>` : ""}</div>`;
    const list = filteredScenes(), q = state.quest !== "all" && questById(state.quest);
    const banner = q ? `<a class="quest-banner" href="#/quest/${esc(q.id)}" style="--c:${questColor(q)}">
        <span class="qb-k">QUEST ${statusBadge(q)}</span><span class="qb-t">${esc(q.name)}</span>
        ${q.summary ? `<span class="qb-s">${esc(q.summary)}</span>` : ""}<span class="qb-go">apri la quest →</span></a>` : "";
    if (!list.length) return banner + `<div class="empty"><div class="big">// NESSUN RISULTATO</div></div>`;
    if (q || state.diaryQ) return banner + `<div class="dy-list">${list.map(s => cardScene(s, true)).join("")}</div>`;
    return chapters().map(c => `
      <section class="dy-chapter">
        <div class="dy-chap-head"><span class="dy-chap-no">CAP. ${c.no != null ? pad(c.no) : "--"}</span><h2>${esc(c.title || "Senza capitolo")}</h2><span class="dy-chap-n">${c.scenes.length} scene</span></div>
        <div class="dy-list">${c.scenes.map(s => cardScene(s)).join("")}</div>
      </section>`).join("");
  }
  function cardScene(s, withChapter = false) {
    const qs = questsOf(s), date = fmtRange(s);
    return `
      <a class="dy-card" href="#/diario/${esc(s.id)}" style="--c:${qs[0] ? questColor(qs[0]) : "var(--line)"}">
        <span class="dy-num">${sceneNum(s)}</span>
        <span class="dy-main">
          ${withChapter || date ? `<span class="dy-k">${withChapter ? esc(s.chapter || "") : ""}${withChapter && date ? " · " : ""}${esc(date)}</span>` : ""}
          <h3>${esc(s.title || "Senza titolo")}</h3>
          ${s.summary ? `<span class="dy-sum">${esc(s.summary)}</span>` : ""}
          ${qs.length ? `<span class="meta">${qs.map(questSpan).join("")}</span>` : ""}
        </span>
      </a>`;
  }

  // ---- singola scena ----
  function viewScene(id) {
    const s = state.diary.find(x => x.id === id), qs = questsOf(s);
    // dentro una quest filtrata, avanti/indietro restano in quella quest
    const inQuest = state.quest !== "all" && (s.quests || []).includes(state.quest) && questById(state.quest);
    const seq = inQuest ? scenesOf(inQuest) : sortScenes(state.diary);
    const i = seq.findIndex(x => x.id === id), prev = seq[i - 1], next = seq[i + 1];
    const date = s.dateFrom ? (sceneEnd(s) === s.dateFrom
      ? `<a href="#/calendario/${esc(s.dateFrom)}">${esc(fmtRange(s))}</a>`
      : `${s.dateUncertain ? "≈ " : ""}<a href="#/calendario/${esc(s.dateFrom)}">${fmtDate(s.dateFrom)}</a> → <a href="#/calendario/${esc(sceneEnd(s))}">${fmtDate(sceneEnd(s))}</a>`) : "";
    const evs = s.dateFrom ? state.events.filter(e => coversDay(s, e.date)).sort((a, b) => (a.date + (a.time || "")).localeCompare(b.date + (b.time || ""))) : [];
    const step = (x, dir) => x ? `<a class="dy-step ${dir}" href="#/diario/${esc(x.id)}">
        <span class="k">${dir === "prev" ? "‹ precedente" : "successiva ›"}${inQuest ? " · " + esc(inQuest.name) : ""}</span>
        <span class="t">${sceneNum(x)} ${esc(x.title)}</span></a>` : `<span class="dy-step ${dir} off"></span>`;
    return `
      <a class="back" href="${inQuest ? `#/quest/${esc(inQuest.id)}` : "#/diario"}">‹ ${inQuest ? esc(inQuest.name) : "Diario"}</a>
      <article class="dy-page" style="--c:${qs[0] ? questColor(qs[0]) : "var(--cyan)"}">
        <div class="kicker">// CAP. ${s.chapterNo != null ? pad(s.chapterNo) : "--"} · ${esc((s.chapter || "").toUpperCase())} · SCENA ${s.order != null ? pad(s.order) : "--"}</div>
        <h1>${esc(s.title || "Senza titolo")}</h1>
        ${date ? `<div class="dy-date">◉ ${date}${s.dateUncertain ? ` <span class="dy-unc">data da verificare</span>` : ""}</div>` : ""}
        ${qs.length ? `<div class="dy-quests">${qs.map(questTag).join("")}</div>` : ""}
        ${s.summary ? `<p class="dy-lead">${esc(s.summary)}</p>` : ""}
        ${(s.places || []).length || (s.people || []).length ? `<dl class="event-meta dy-meta">
          ${(s.places || []).length ? `<dt>Luoghi</dt><dd>${peopleLinks(s.places)}</dd>` : ""}
          ${(s.people || []).length ? `<dt>Coinvolti</dt><dd>${peopleLinks(s.people)}</dd>` : ""}
        </dl>` : ""}
        <div class="dy-body">${richText(s.body) || `<p class="muted">Nessun testo.</p>`}</div>
        ${(s.tags || []).length ? `<div class="meta">${s.tags.map(t => `<span class="badge tag">#${esc(t)}</span>`).join("")}</div>` : ""}
        ${evs.length ? `<div class="section-title" style="margin-top:26px"><h2>Eventi in calendario</h2></div>
          <div class="timeline compact">${evs.map(timelineItem).join("")}</div>` : ""}
        ${Store.canEdit() ? `<div class="dy-tools">
          <button class="btn ghost small" data-action="delete-scene" data-id="${esc(s.id)}">Elimina</button>
          <button class="btn cyan small" data-action="edit-scene" data-id="${esc(s.id)}">Modifica</button></div>` : ""}
      </article>
      <nav class="dy-nav">${step(prev, "prev")}${step(next, "next")}</nav>`;
  }

  // ---- quest ----
  function viewQuests() {
    const groups = QUEST_STATUS.map(st => ({ st, list: sortQuests(state.quests.filter(q => qStatus(q.status).id === st.id)) })).filter(g => g.list.length);
    return `
      <div class="page-head">
        <div><div class="kicker">// JOB_BOARD</div><h1>Quest</h1><p>Le storie della campagna. Ogni quest raccoglie le sue scene in ordine, anche quando sono sparse tra più capitoli.</p></div>
        ${Store.canEdit() ? `<button class="btn" data-action="new-quest">+ Nuova quest</button>` : ""}
      </div>
      ${diaryTabs("quest")}
      ${groups.length ? groups.map(g => `
        <div class="section-title"><h2 style="color:${g.st.color}">${esc(g.st.label)} · ${g.list.length}</h2></div>
        <div class="q-grid">${g.list.map(cardQuest).join("")}</div>`).join("")
        : `<div class="empty"><div class="big">// NESSUNA QUEST</div>Nessuna quest ancora.
           ${Store.canEdit() ? `<br><button class="btn" data-action="new-quest">+ Crea la prima quest</button>` : ""}</div>`}`;
  }
  function cardQuest(q) {
    const sc = scenesOf(q), chaps = [...new Set(sc.map(s => s.chapterNo).filter(x => x != null))];
    const ppl = topNames(sc, "people", 6);
    return `
      <a class="q-card" href="#/quest/${esc(q.id)}" style="--c:${questColor(q)}">
        <span class="q-top">${statusBadge(q)}<span class="q-count">${sc.length} scene${chaps.length ? ` · cap. ${chaps.length > 1 ? pad(Math.min(...chaps)) + "–" + pad(Math.max(...chaps)) : pad(chaps[0])}` : ""}</span></span>
        <h3>◆ ${esc(q.name)}</h3>
        ${q.summary ? `<span class="q-sum">${esc(q.summary)}</span>` : ""}
        ${ppl.length ? `<span class="q-ppl">${ppl.map(esc).join(" · ")}</span>` : ""}
      </a>`;
  }
  function viewQuest(id) {
    const q = questById(id), sc = scenesOf(q);
    return `
      <a class="back" href="#/quest">‹ Quest</a>
      <header class="q-head" style="--c:${questColor(q)}">
        <div class="kicker">// QUEST ${statusBadge(q)}</div>
        <h1>◆ ${esc(q.name)}</h1>
        ${q.summary ? `<p class="dy-lead">${esc(q.summary)}</p>` : ""}
        ${sc.length ? `<dl class="event-meta dy-meta">
          ${topNames(sc, "places").length ? `<dt>Luoghi</dt><dd>${peopleLinks(topNames(sc, "places"))}</dd>` : ""}
          ${topNames(sc, "people", 30).length ? `<dt>Coinvolti</dt><dd>${peopleLinks(topNames(sc, "people", 30))}</dd>` : ""}
        </dl>` : ""}
        <div class="q-actions">
          ${sc.length ? `<button class="btn ghost small cyan" data-action="q-expand">Espandi tutte le scene</button>
          <button class="btn ghost small" data-action="set-quest" data-quest="${esc(q.id)}">Filtra il diario</button>` : ""}
          ${Store.canEdit() ? `<span class="spacer"></span>
          <button class="btn ghost small" data-action="delete-quest" data-id="${esc(q.id)}">Elimina quest</button>
          <button class="btn cyan small" data-action="edit-quest" data-id="${esc(q.id)}">Modifica</button>` : ""}
        </div>
      </header>
      ${sc.length ? `<div class="q-scenes">${sc.map(s => `
        <details class="q-scene" style="--c:${questColor(q)}">
          <summary><span class="dy-num">${sceneNum(s)}</span><span class="dy-main">
            <span class="dy-k">${esc(s.chapter || "")}${fmtRange(s) ? " · " + esc(fmtRange(s)) : ""}</span>
            <h3>${esc(s.title)}</h3>${s.summary ? `<span class="dy-sum">${esc(s.summary)}</span>` : ""}</span></summary>
          <div class="dy-body">${richText(s.body)}</div>
          <a class="q-open" href="#/diario/${esc(s.id)}" data-action="scene-in-quest" data-quest="${esc(q.id)}">apri la scena →</a>
        </details>`).join("")}</div>`
        : `<div class="empty"><div class="big">// NESSUNA SCENA</div>Nessuna scena collegata a questa quest.</div>`}`;
  }

  function diaryOnDay(date) {
    const list = sortScenes(state.diary).filter(s => coversDay(s, date));
    if (!list.length) return "";
    return `<div class="dy-day"><span class="k">// DAL DIARIO</span>
      ${list.map(s => `<a href="#/diario/${esc(s.id)}"><b>${sceneNum(s)}</b> ${esc(s.title)}</a>`).join("")}</div>`;
  }

  // ---- editor ----
  function editScene(id) {
    const all = sortScenes(state.diary), last = all[all.length - 1];
    const s = state.diary.find(x => x.id === id) || {
      chapter: last ? last.chapter : "", chapterNo: last ? last.chapterNo : 1,
      order: last ? (last.order || 0) + 1 : 1, quests: state.quest !== "all" ? [state.quest] : [],
    };
    const chaps = chapters().filter(c => c.title);
    openModal(`
      <form class="form" id="scene-form">
        <div class="modal-head"><h2>${s.id ? "// MODIFICA SCENA" : "// NUOVA SCENA"}</h2><button type="button" class="x" data-action="close" aria-label="Chiudi">×</button></div>
        <div class="modal-body">
          <div class="fields">
            <div class="field full"><label class="req" for="s-title">Titolo</label><input id="s-title" name="title" required value="${esc(s.title)}" placeholder="es. La lira sul monitor"></div>
            <div class="field"><label for="s-chap">Capitolo</label><input id="s-chap" name="chapter" list="dl-chap" value="${esc(s.chapter)}"></div>
            <div class="field"><label for="s-chapno">N° capitolo · N° scena</label><span class="duo">
              <input id="s-chapno" name="chapterNo" type="number" min="0" step="1" value="${esc(s.chapterNo ?? "")}">
              <input name="order" type="number" min="0" step="1" value="${esc(s.order ?? "")}" aria-label="Numero della scena"></span></div>
            <div class="field"><label for="s-from">Dal giorno</label><input id="s-from" name="dateFrom" type="date" min="${START_YEAR}-01-01" max="${END_YEAR}-12-31" value="${esc(s.dateFrom)}"><span class="hint">vuoto se non si sa</span></div>
            <div class="field"><label for="s-to">Al giorno</label><input id="s-to" name="dateTo" type="date" min="${START_YEAR}-01-01" max="${END_YEAR}-12-31" value="${esc(s.dateTo)}"><span class="hint">vuoto se è un giorno solo</span></div>
            <label class="check field full"><input type="checkbox" name="dateUncertain" ${s.dateUncertain ? "checked" : ""}> Data incerta o dedotta</label>
            <div class="field full"><span class="lbl">Quest</span>
              ${state.quests.length ? `<div class="q-checks">${sortQuests(state.quests).map(q => `<label class="check" style="--c:${questColor(q)}"><input type="checkbox" name="quests" value="${esc(q.id)}" ${(s.quests || []).includes(q.id) ? "checked" : ""}> ${esc(q.name)}</label>`).join("")}</div>`
                : `<span class="hint">Nessuna quest: creale dalla pagina Quest.</span>`}</div>
            <div class="field"><label for="s-places">Luoghi</label><input id="s-places" name="places" list="dl-loc" value="${esc((s.places || []).join(", "))}"></div>
            <div class="field"><label for="s-people">Coinvolti</label><input id="s-people" name="people" value="${esc((s.people || []).join(", "))}"><span class="hint">separati da virgola · i nomi del database diventano link</span></div>
            <div class="field full"><label for="s-sum">Riassunto</label><textarea id="s-sum" name="summary" rows="2" placeholder="Una o due righe: si leggono nell'elenco">${esc(s.summary)}</textarea></div>
            <div class="field full"><label for="s-body">Racconto</label><textarea id="s-body" name="body" rows="18">${esc(s.body)}</textarea>
              <span class="hint">Riga vuota = paragrafo · ## titoletto · &gt; citazione · - elenco · --- stacco · **grassetto** · *corsivo* · blocchi ::: rete / ::: log / ::: nota … chiusi da :::</span></div>
            <div class="field full"><label for="s-tags">Tag</label><input id="s-tags" name="tags" value="${esc((s.tags || []).join(", "))}"></div>
          </div>
          <datalist id="dl-chap">${chaps.map(c => `<option value="${esc(c.title)}">`).join("")}</datalist>
          ${datalists()}
        </div>
        <div class="modal-foot">
          <button type="button" class="btn ghost small left" data-action="close">Annulla</button>
          <button type="submit" class="btn">Salva scena</button>
        </div>
      </form>`);
    const form = $("#scene-form");
    // scegliendo un capitolo esistente, il numero si compila da solo
    $("#s-chap").addEventListener("change", ev => {
      const c = chaps.find(x => norm(x.title) === norm(ev.target.value));
      if (c && c.no != null) { form.chapterNo.value = c.no; form.order.value = Math.max(0, ...c.scenes.filter(x => x.id !== s.id).map(x => x.order || 0)) + 1; }
    });
    form.addEventListener("submit", async ev => {
      ev.preventDefault();
      const btn = $("button[type=submit]", form), fd = new FormData(form);
      const from = fd.get("dateFrom"), to = fd.get("dateTo"), num = k => fd.get(k) === "" ? null : Number(fd.get(k));
      if (from && !validDay(from)) return toast(`La data deve essere tra il ${START_YEAR} e il ${END_YEAR}`, "err");
      if (to && (!from || !validDay(to) || to < from)) return toast("La data finale deve venire dopo quella iniziale", "err");
      btn.disabled = true;
      try {
        const saved = await Store.save("diary", {
          ...s, title: fd.get("title").trim(), chapter: fd.get("chapter").trim(), chapterNo: num("chapterNo"), order: num("order"),
          dateFrom: from, dateTo: to && to !== from ? to : "", dateUncertain: !!fd.get("dateUncertain"),
          quests: fd.getAll("quests"), places: splitList(fd.get("places")), people: splitList(fd.get("people")),
          summary: fd.get("summary").trim(), body: fd.get("body").replace(/\s+$/, ""), tags: splitList(fd.get("tags")),
        });
        upsert(state.diary, saved);
        toast("Scena salvata", "ok"); closeModal();
        if (location.hash !== "#/diario/" + saved.id) location.hash = "#/diario/" + saved.id; else route();
      } catch (err) { fail(err); btn.disabled = false; }
    });
  }
  function editQuest(id) {
    const q = questById(id) || { status: "in-corso" };
    openModal(`
      <form class="form" id="quest-form">
        <div class="modal-head"><h2>${q.id ? "// MODIFICA QUEST" : "// NUOVA QUEST"}</h2><button type="button" class="x" data-action="close" aria-label="Chiudi">×</button></div>
        <div class="modal-body">
          <div class="fields">
            <div class="field full"><label class="req" for="q-name">Nome</label><input id="q-name" name="name" required value="${esc(q.name)}" placeholder="es. Dark Harmony"></div>
            <div class="field"><label for="q-status">Stato</label><select id="q-status" name="status">${QUEST_STATUS.map(st => `<option value="${st.id}" ${qStatus(q.status).id === st.id ? "selected" : ""}>${st.label}</option>`).join("")}</select></div>
            <div class="field"><label for="q-order">Ordine</label><input id="q-order" name="order" type="number" step="1" value="${esc(q.order ?? "")}"><span class="hint">facoltativo: ordina le quest con lo stesso stato</span></div>
            <div class="field full"><label for="q-sum">Riassunto</label><textarea id="q-sum" name="summary" rows="6" placeholder="Di cosa parla, cosa è ancora aperto…">${esc(q.summary)}</textarea></div>
          </div>
        </div>
        <div class="modal-foot">
          <button type="button" class="btn ghost small left" data-action="close">Annulla</button>
          <button type="submit" class="btn">Salva quest</button>
        </div>
      </form>`, true);
    $("#quest-form").addEventListener("submit", async ev => {
      ev.preventDefault();
      const form = ev.target, btn = $("button[type=submit]", form), fd = new FormData(form);
      btn.disabled = true;
      try {
        const saved = await Store.save("quests", { ...q, name: fd.get("name").trim(), status: fd.get("status"),
          order: fd.get("order") === "" ? null : Number(fd.get("order")), summary: fd.get("summary").trim() });
        upsert(state.quests, saved);
        toast("Quest salvata", "ok"); closeModal();
        if (location.hash !== "#/quest/" + saved.id) location.hash = "#/quest/" + saved.id; else route();
      } catch (err) { fail(err); btn.disabled = false; }
    });
  }

  // ---------- TRACCE ----------
  const NO_DISC = "Singoli";
  const discOf = s => (s.disc || "").trim() || NO_DISC;
  const fmtDur = sec => sec ? `${Math.floor(sec / 60)}:${pad(Math.round(sec % 60))}` : "";
  const fmtTotal = sec => { const m = Math.round(sec / 60); return m >= 60 ? `${Math.floor(m / 60)}h ${pad(m % 60)}m` : `${m} min`; };
  const sortSongs = list => [...list].sort((a, b) => (a.order ?? 1e9) - (b.order ?? 1e9) || (a.createdAt || "").localeCompare(b.createdAt || ""));
  const discs = () => [...new Set(state.songs.map(discOf))]
    .sort((a, b) => (a === NO_DISC) - (b === NO_DISC) || a.localeCompare(b, "it", { numeric: true }));
  state.disc = ls.get("nc-disc", "all");

  function viewSongs() {
    const all = discs();
    if (state.disc !== "all" && !all.includes(state.disc)) state.disc = "all";
    const shown = state.disc === "all" ? all : [state.disc];
    const groups = shown.map(d => ({ disc: d, songs: sortSongs(state.songs.filter(s => discOf(s) === d)) }));
    return `
      <div class="page-head">
        <div><div class="kicker">// PIRATE_RADIO 98.7</div><h1>Tracce</h1><p>Le canzoni create per la campagna — file locali e link Suno.</p></div>
        ${Store.canEdit() ? `<button class="btn" data-action="new-song">+ Nuova traccia</button>` : ""}
      </div>
      ${all.length > 1 ? `<div class="toolbar"><div class="chips" id="disc-chips">
        ${["all", ...all].map(d => `<button class="chip ${state.disc === d ? "active" : ""}" data-disc="${esc(d)}">${d === "all" ? "Tutti" : esc(d)}<span class="count">${d === "all" ? state.songs.length : state.songs.filter(s => discOf(s) === d).length}</span></button>`).join("")}
      </div></div>` : ""}
      ${state.songs.length ? groups.map(g => {
        const album = g.songs.find(s => s.album)?.album, tot = g.songs.reduce((t, s) => t + (s.duration || 0), 0);
        return `
          ${all.length > 1 || g.disc !== NO_DISC ? `<div class="disc-head">
            <span class="disc-icon" aria-hidden="true"></span>
            <div><h2>${esc(g.disc)}</h2>${album ? `<div class="disc-album">${esc(album)}</div>` : ""}</div>
            <span class="disc-meta">${g.songs.length} tracce${tot ? " · " + fmtTotal(tot) : ""}</span>
          </div>` : ""}
          <div class="tracks">${g.songs.map(cardSong).join("")}</div>`;
      }).join("") :
        `<div class="empty"><div class="big">// RADIO SILENCE</div>Nessuna traccia ancora.
          ${Store.canEdit() ? `<br><button class="btn" data-action="new-song">+ Aggiungi la prima traccia</button>` : ""}</div>`}`;
  }

  function cardSong(s, i) {
    const embed = sunoEmbed(s.suno);
    return `
      <article class="track" data-num="TRK ${String(i + 1).padStart(2, "0")}${s.duration ? " · " + fmtDur(s.duration) : ""}" data-song="${esc(s.id)}">
        <div class="track-cover">${s.cover ? imgTag(s.cover, s.title) : `<div class="vinyl"></div>`}</div>
        <div class="track-main">
          <div>
            <h3>${esc(s.title || "Senza titolo")}</h3>
            <div class="track-sub">${[s.artist && `<b>${esc(s.artist)}</b>`, s.session && esc(s.session), s.mood && esc(s.mood)].filter(Boolean).join(" · ")}</div>
          </div>
          ${s.audio ? `<audio controls preload="none" data-ref="${esc(s.audio)}"></audio>` : ""}
          <div class="track-actions">
            ${embed ? `<button class="btn small cyan ghost" data-action="toggle-suno" data-embed="${esc(embed)}">▶ Player Suno</button>` : ""}
            ${s.suno ? `<a class="btn small yellow ghost" href="${esc(s.suno)}" target="_blank" rel="noopener">Apri su Suno ↗</a>` : ""}
            ${Store.canEdit() ? `<button class="btn small ghost" data-action="edit-song" data-id="${esc(s.id)}">Modifica</button>` : ""}
          </div>
          <div class="suno-embed" hidden></div>
          ${s.lyrics ? `<details class="lyrics"><summary>&gt; Mostra testo</summary><pre>${esc(s.lyrics)}</pre></details>` : ""}
          ${s.notes ? `<p class="track-notes">${esc(s.notes)}</p>` : ""}
        </div>
      </article>`;
  }

  function editSong(id) {
    const s = state.songs.find(x => x.id === id) || {};
    const audioIsPath = s.audio && !s.audio.startsWith("idb:");
    openModal(`
      <form class="form" id="song-form">
        <div class="modal-head"><h2>${s.id ? "// MODIFICA TRACCIA" : "// NUOVA TRACCIA"}</h2><button type="button" class="x" data-action="close" aria-label="Chiudi">×</button></div>
        <div class="modal-body">
          <div class="form-grid">
            <div>${imagePicker("cover", s.cover, true)}<span class="hint" style="font-size:13px;color:var(--muted)">Copertina (facoltativa)</span></div>
            <div class="fields">
              <div class="field full"><label class="req" for="s-title">Titolo</label><input id="s-title" name="title" required value="${esc(s.title)}"></div>
              <div class="field"><label for="s-artist">Artista / crediti</label><input id="s-artist" name="artist" value="${esc(s.artist)}" placeholder="es. Il nostro Rockerboy"></div>
              <div class="field"><label for="s-session">Sessione / momento</label><input id="s-session" name="session" value="${esc(s.session)}" placeholder="es. Sessione 5 — Il colpo"></div>
              <div class="field"><label for="s-disc">Disco</label><input id="s-disc" name="disc" list="dl-disc" value="${esc(s.disc)}" placeholder="es. CD 1"></div>
              <div class="field"><label for="s-album">Album</label><input id="s-album" name="album" list="dl-album" value="${esc(s.album)}" placeholder="es. Echo's Songs"></div>
              <datalist id="dl-disc">${discs().filter(d => d !== NO_DISC).map(d => `<option value="${esc(d)}">`).join("")}</datalist>
              <datalist id="dl-album">${[...new Set(state.songs.map(x => x.album).filter(Boolean))].map(a => `<option value="${esc(a)}">`).join("")}</datalist>
              <div class="field"><label for="s-mood">Genere / mood</label><input id="s-mood" name="mood" value="${esc(s.mood)}" placeholder="es. synthwave, industrial"></div>
              <div class="field"><label for="s-order">Posizione in lista</label><input id="s-order" name="order" type="number" value="${esc(s.order ?? "")}" placeholder="1, 2, 3…"></div>
              <div class="field full"><label for="s-suno">Link Suno</label><input id="s-suno" name="suno" type="url" value="${esc(s.suno)}" placeholder="https://suno.com/song/…"><span class="hint">Incolla il link della canzone: verrà mostrato il player Suno incorporato.</span></div>
              <div class="field full">
                <span class="lbl">File audio</span>
                <div class="audio-picker" data-picker="audio" data-type="audio">
                  <input type="hidden" name="audio" value="${esc(s.audio || "")}">
                  <input type="file" accept="audio/*" hidden>
                  <div class="picker-row">
                    <input type="text" placeholder="percorso tipo music/brano.mp3 o URL" data-picker-url value="${audioIsPath ? esc(s.audio) : ""}">
                    <button type="button" class="btn small cyan" data-action="pick-file">Carica file</button>
                    <button type="button" class="btn ghost small" data-action="pick-clear">✕</button>
                  </div>
                  <span class="hint audio-name" style="font-size:13px;color:var(--muted)">${s.audio && !audioIsPath ? "📁 file caricato" : ""}</span>
                  <audio controls ${s.audio ? `data-ref="${esc(s.audio)}"` : "hidden"}></audio>
                </div>
                <span class="hint">Puoi caricare un mp3 dal PC, oppure mettere il file nella cartella <code>music/</code> del sito e scrivere il percorso.</span>
              </div>
              <div class="field full"><label for="s-lyrics">Testo</label><textarea id="s-lyrics" name="lyrics" rows="6">${esc(s.lyrics)}</textarea></div>
              <div class="field full"><label for="s-notes">Note</label><textarea id="s-notes" name="notes" rows="2">${esc(s.notes)}</textarea></div>
            </div>
          </div>
        </div>
        <div class="modal-foot">
          ${s.id ? `<button type="button" class="btn ghost small left" data-action="delete-song" data-id="${esc(s.id)}">Elimina</button>` : `<button type="button" class="btn ghost small left" data-action="close">Annulla</button>`}
          <button type="submit" class="btn">Salva traccia</button>
        </div>
      </form>
    `);
    bindPickers($("#modal"));
    $("#song-form").addEventListener("submit", async ev => {
      ev.preventDefault();
      const form = ev.target, btn = $("button[type=submit]", form);
      btn.disabled = true; btn.textContent = "Caricamento…";
      try {
        const fd = new FormData(form);
        const ord = fd.get("order");
        const rec = {
          ...s,
          title: fd.get("title").trim(), artist: fd.get("artist").trim(), session: fd.get("session").trim(),
          mood: fd.get("mood").trim(), order: ord === "" ? null : Number(ord),
          disc: fd.get("disc").trim(), album: fd.get("album").trim(),
          suno: fd.get("suno").trim(), lyrics: fd.get("lyrics").trim(), notes: fd.get("notes").trim(),
          cover: await commitPicker(form, "cover", "covers"),
          audio: await commitPicker(form, "audio", "audio"),
        };
        const saved = await Store.save("songs", rec);
        upsert(state.songs, saved);
        toast("Traccia salvata", "ok");
        closeModal(); route();
      } catch (err) { fail(err); btn.disabled = false; btn.textContent = "Salva traccia"; }
    });
  }

  // ---------- PARTY: le schede dei PG a colpo d'occhio ----------
  // Tutti i giocatori possono usare tutte le schede (nel gruppo ci si fida).
  const partyPgs = () => state.entries.filter(e => e.kind === "pg").sort((a, b) => (a.name || "").localeCompare(b.name || "", "it"));
  function partyCard(e) {
    const id = esc(e.id), edit = Store.canEdit(), imgs = imagesOf(e);
    const head = `
      <header class="pc-head">
        <div class="pc-img">${imgs.length ? imgTag(imgs[0], e.name) : `<span>${esc(initials(e.name))}</span>`}</div>
        <div class="pc-title"><h3>${esc(e.name)}</h3>
          <div class="pc-sub">${e.handle ? `“${esc(e.handle)}” · ` : ""}${esc(e.role || "—")}${sheetOf(e).owner ? ` · <span title="Giocatore">${esc(sheetOf(e).owner.split("@")[0])}</span>` : ""}</div></div>
        ${gmBadge(e)}
      </header>`;
    if (!hasSheet(e)) return `<article class="pc-card empty-sheet">${head}<p class="hint">Scheda ancora vuota.</p>
      ${edit ? `<button type="button" class="btn small" data-action="edit-sheet" data-id="${id}">Compila la scheda</button>` : ""}</article>`;
    const max = hpMaxOf(e), hp = hpOf(e), w = woundOf(e), cs = cyberStats(e);
    const pct = clamp(max ? hp / max * 100 : 0, 0, 100);
    const roll = (what, label, cls = "chip") => `<button type="button" class="${cls}" data-action="sheet-roll" data-id="${id}" data-roll="${what}">${label}</button>`;
    // le abilità più alte, da tirare al volo
    const top = skillsOf(e).filter(k => k.lvl > 0).map(k => ({ ...k, base: statEff(e, k.stat) + k.lvl })).sort((a, b) => b.base - a.base).slice(0, 6);
    const arm = loc => spBar(loc === "head" ? "Head SP" : "Body SP", armorOf(e, loc), edit && (d => `data-action="sheet-adj" data-id="${id}" data-f="armor.${loc}" data-d="${d}"`));
    return `
      <article class="pc-card w-${w.id}">
        ${head}
        <div class="pc-hp">
          <div class="pc-hp-top"><span class="sh-k">HP</span> <b>${hp}</b><small>/ ${max}</small><span class="pc-w">${esc(w.label)}${w.pen ? ` · ${w.pen}` : ""}</span></div>
          <span class="sh-hpbar"><i style="width:${pct}%"></i><b style="left:${clamp(CPR.seriousAt(max) / max * 100, 0, 100)}%"></b></span>
          ${edit ? adjBtns(e.id, "hp", [-5, -1, 1, 5]) : ""}
        </div>
        <div class="pc-armor">${arm("head")}${arm("body")}</div>
        <div class="pc-row">
          <span><small class="sh-k">LUCK</small> <b>${luckOf(e)}</b>/${statBase(e, "LUCK")}
            ${edit ? `<button type="button" class="gp-btn" data-action="sheet-adj" data-id="${id}" data-f="luck" data-d="-1" title="Spendi 1">−</button>` : ""}</span>
          <span><small class="sh-k">HUM</small> <b>${cs.current != null ? cs.current : statBase(e, "EMP") * 10}</b></span>
          <span><small class="sh-k">REF</small> <b>${statEff(e, "REF")}</b></span>
          <span><small class="sh-k">MOVE</small> <b>${statBase(e, "MOVE") * 2}m</b></span>
        </div>
        <div class="pc-rolls">
          ${roll("init", "Initiative", "chip y")}${roll("death", "Death Save", "chip r")}
          ${top.map(k => roll(k.key, `${esc(k.label)} <b>${k.base}</b>`)).join("")}
          ${(sheetOf(e).weapons || []).slice(0, 2).map((_, i) => cbQuick(pcSrc(e, i))).join("")}
          ${isNetrunner(e) ? netQuick(activeDeck(e), ifaceOf(e), (w, l, c) => roll("deck:" + w, l, c)) : ""}
        </div>
        <div class="pc-foot">
          <button type="button" class="btn ghost small cyan" data-action="open-entry-tab" data-id="${id}" data-tab="sheet">Scheda completa</button>
          <button type="button" class="btn ghost small" data-action="party-as" data-id="${id}" title="Il Dice log tira a nome di questo PG">Tira come ${esc(e.name)}</button>
        </div>
      </article>`;
  }
  function viewParty() {
    const pgs = partyPgs();
    return `
      <div class="page-head">
        <div><div class="kicker">// CREW_MANIFEST</div><h1>Party</h1><p>Le schede dei PG: HP, armatura, fortuna e tiri veloci. Ognuno può usare qualsiasi scheda.</p></div>
        <button type="button" class="btn ghost small cyan" data-action="dice-open">⬢ Dice log</button>
      </div>
      <div id="party-grid" class="party-grid">${pgs.length ? pgs.map(partyCard).join("")
        : `<div class="empty"><div class="big">// NESSUN PG</div>Crea i personaggi del party nel Database con tipo «PG».</div>`}</div>`;
  }
  function refreshParty() {
    const box = $("#party-grid"); if (!box || !/^#\/party/.test(location.hash)) return;
    box.innerHTML = partyPgs().map(partyCard).join(""); hydrate(box);
  }

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
    const hp = t && tokHp(t), w = hp && !D.painImmune ? CPR.wound(hp.hp, hp.max) : null;
    const wound = w && w.pen ? [{ l: w.label, v: w.pen }] : [];
    if (t) wound.push(...statusParts(t.status));   // stati del token (es. Accecato)
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
          ${D.painImmune ? `<span class="en-pen ok">Antidolorifico: ignora i malus delle ferite</span>` : ""}
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
        return `<span class="st-chip" title="${esc(c.desc || "")}">${esc(c.name)}${c.id === "skillchip" ? ` <select data-cw-param="${k}" class="st-add">${CPR.SKILLS.map(s => `<option value="${s.id}" ${s.id === x.param ? "selected" : ""}>${esc(s.label)}</option>`).join("")}</select>` : ""}${cond ? ` <label class="check" title="${esc(cond.cond)}"><input type="checkbox" data-cw-on="${k}" ${x.on ? "checked" : ""}> attivo</label>` : ""} <button type="button" class="gp-btn del" data-cw-del="${k}" aria-label="Togli">✕</button></span>`; }).join("")}
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
        $("#en-wpns", form).innerHTML = ws.map(wRow).join(""); refresh(); return;
      }
      const one = ev.target.closest("[data-wpn-reroll]");
      if (one) {
        const row = one.closest(".sh-row"), i = $$("#en-wpns .sh-row", form).indexOf(row);
        const ws = CPR.rollWeapons(form.elements["role"].value, num(form.elements["tier"].value), form.elements["level"].value);
        const w = ws[Math.min(i, ws.length - 1)] || ws[0];
        if (w) { row.outerHTML = wRow(w); refresh(); }
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

  // ---------- AREA GM ----------
  function viewGm() {
    const enemies = state.entries.filter(e => e.kind === "nemico" && e.enemy)
      .sort((a, b) => { const A = enemyOf(a), B = enemyOf(b); return A.tier - B.tier || CPR.LEVEL_IDS.indexOf(A.level) - CPR.LEVEL_IDS.indexOf(B.level) || (a.name || "").localeCompare(b.name || "", "it"); });
    const secretEntries = state.entries.filter(e => e.gmOnly && e.kind !== "nemico").sort((a, b) => (a.name || "").localeCompare(b.name || "", "it"));
    const secretNotes = state.notes.filter(n => n.gmOnly).sort((a, b) => (b.updatedAt || "").localeCompare(a.updatedAt || ""));
    const notesOn = state.gmnotes.filter(g => g.text && state.entries.some(e => e.id === g.entryId));
    const hiddenTok = state.tokens.filter(t => t.hidden);
    const secretRolls = state.rolls.filter(r => r.gmOnly).slice(-8).reverse();
    return `
      <div class="page-head">
        <div><div class="kicker">// GM_ONLY_CHANNEL</div><h1>Area GM</h1><p>Questa pagina e tutto ciò che è segnato 🔒 lo vedono solo i GM: il database non lo manda ai giocatori.</p></div>
        <div class="row-btns">
          <button type="button" class="btn" data-action="gm-new-entry">+ NPC segreto</button>
          <button type="button" class="btn yellow ghost" data-action="gm-new-note">+ Appunto segreto</button>
        </div>
      </div>
      ${!Store.gmReady ? `<div class="gm-warn">⚠ Il database non ha ancora il ruolo GM: esegui <b>supabase/schema.sql</b> nell'editor SQL di Supabase.</div>` : ""}

      <div class="section-title"><h2>☠ Nemici <span class="hint">${enemies.length}</span></h2>
        <span class="en-actions"><button type="button" class="btn small yellow" data-action="gm-gen-enemy">⚄ Genera nemico</button>
        <button type="button" class="btn ghost small" data-action="gm-new-enemy">+ Nemico a mano</button></span></div>
      ${enemies.length ? `<div class="en-grid">${enemies.map(enemyCard).join("")}</div>`
        : `<p class="hint">Nessun nemico. «Genera nemico» crea una scheda semplificata come quelle del manuale scegliendo Fascia (1 Scagnozzi → 4 Boss), Livello (Base, Hardened, Elite) e, se vuoi, un Ruolo (Solo, Tech, Medtech, Nomade, Netrunner).</p>`}

      <div class="section-title" style="margin-top:28px"><h2>⚙ Regole della campagna</h2>
        <span class="en-actions"><button type="button" class="btn small" data-action="gm-rules">Modifica munizioni e stati</button></span></div>
      <p class="hint">Munizioni: ${(rules().ammo || []).length ? (rules().ammo || []).map(a => esc(a.name)).join(", ") : "solo Standard"} · Stati: ${statusList().map(x => esc(x.name)).join(", ") || "nessuno"}. Le vedono tutti; le modificano i GM.</p>

      <div class="section-title" style="margin-top:28px"><h2>⌬ Architetture NET <span class="hint">${state.netarch.length}</span></h2>
        <span class="en-actions"><button type="button" class="btn small yellow" data-action="net-gen">⚄ Genera architettura</button>
        <button type="button" class="btn ghost small" data-action="net-new">+ Architettura a mano</button>
        ${state.netview.length ? `<a class="btn ghost small cyan" href="#/net">Pagina NET →</a>` : ""}</span></div>
      ${state.netarch.length ? `<div class="en-grid">${[...state.netarch].sort((a, b) => (a.name || "").localeCompare(b.name || "", "it")).map(archCard).join("")}</div>`
        : `<p class="hint">Nessuna architettura. «Genera architettura» segue le tabelle del manuale (3d6 piani, bivi con il d10, Ingresso e piani inferiori per difficoltà); «a mano» per costruirla piano per piano. Con «👁 Mostra ai giocatori» i piani rivelati compaiono nella pagina NET.</p>`}

      <div class="section-title" style="margin-top:28px"><h2>🔒 Dossier segreti <span class="hint">${secretEntries.length}</span></h2></div>
      ${secretEntries.length ? `<div class="grid">${secretEntries.map(cardEntry).join("")}</div>`
        : `<p class="hint">Nessuno. Crea un «NPC segreto», oppure spunta «Solo GM» nella modifica di un record del database.</p>`}

      <div class="gm-cols">
        <section>
          <div class="section-title"><h2>🔒 Appunti segreti <span class="hint">${secretNotes.length}</span></h2></div>
          ${secretNotes.length ? `<div class="notes-grid">${secretNotes.map(cardNote).join("")}</div>` : `<p class="hint">Trame, colpi di scena, preparazione delle sessioni…</p>`}
        </section>
        <section>
          <div class="section-title"><h2>🔒 Note del GM sui personaggi <span class="hint">${notesOn.length}</span></h2></div>
          ${notesOn.length ? `<div class="gm-list">${notesOn.map(g => { const e = state.entries.find(x => x.id === g.entryId);
            return `<button type="button" class="gm-item" data-action="edit-gmnote" data-id="${esc(e.id)}"><b>${esc(e.name)}</b><span>${esc(String(g.text).slice(0, 160))}${g.text.length > 160 ? "…" : ""}</span></button>`; }).join("")}</div>`
            : `<p class="hint">Nel dossier di ogni PG o NPC trovi il riquadro «Note del GM».</p>`}
        </section>
      </div>

      <div class="gm-cols">
        <section>
          <div class="section-title"><h2>Mappe</h2><a class="see-all" href="#/mappa">apri la mappa →</a></div>
          ${state.maps.length ? `<div class="gm-list">${mapsSorted().map(m => {
            const nTok = mapTokens(m).length, nHid = mapTokens(m).filter(t => t.hidden).length;
            return `<button type="button" class="gm-item" data-action="gm-open-map" data-id="${esc(m.id)}">
              <b>${m.id === sharedMapId() ? "● " : ""}${m.hidden ? "🔒 " : ""}${esc(m.name || "Mappa")}</b>
              <span>${m.id === sharedMapId() ? "visibile a tutti" : m.hidden ? "nascosta ai giocatori" : "visibile"} · ${nTok} token${nHid ? ` (${nHid} nascosti)` : ""}</span></button>`; }).join("")}</div>`
            : `<p class="hint">Nessuna mappa. Le mappe nuove nascono nascoste: le riveli con «Mostra a tutti».</p>`}
          ${hiddenTok.length ? `<p class="hint">Token nascosti in tutto: ${hiddenTok.length}. Selezionali sulla mappa e premi «👁 Rivela».</p>` : ""}
        </section>
        <section>
          <div class="section-title"><h2>🔒 Ultimi tiri segreti</h2></div>
          ${secretRolls.length ? `<div class="gm-rolls">${secretRolls.map(rollCard).join("")}</div>`
            : `<p class="hint">Spunta «🔒 Segreto» nel Dice log per tirare di nascosto. I tiri degli NPC segreti e dei token nascosti sono segreti da soli.</p>`}
        </section>
      </div>

      <div class="section-title"><h2>Account GM</h2></div>
      <div class="gm-accounts">
        <div id="gm-list" class="gm-list"><p class="hint">Carico l'elenco…</p></div>
        ${Store.mode === "cloud" ? `<div class="gm-add">
          <input id="gm-email" type="email" placeholder="email dell'account da rendere GM" autocomplete="off">
          <button type="button" class="btn small" data-action="gm-add">+ Aggiungi GM</button>
        </div>
        <p class="hint">L'account deve già esistere su Supabase (Authentication → Users). Chi è GM vede tutto ciò che è segnato 🔒.</p>` : ""}
      </div>`;
  }
  async function loadGmList() {
    const box = $("#gm-list"); if (!box) return;
    if (Store.mode !== "cloud") { box.innerHTML = `<p class="hint">In modalità locale sei sempre GM.</p>`; return; }
    try {
      const list = await Store.listGms();
      box.innerHTML = list.map(g => `<div class="gm-item static"><b>${esc(g.email)}</b>${norm(g.email) === norm(Store.user) ? `<span>tu</span>` : ""}
        <button type="button" class="btn ghost small danger" data-action="gm-remove" data-email="${esc(g.email)}">Togli</button></div>`).join("") || `<p class="hint">Nessun GM.</p>`;
    } catch (e) { box.innerHTML = `<p class="hint">Impossibile leggere l'elenco: ${esc(e.message || e)}</p>`; }
  }


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

  // ---------- TAVOLO DI GIOCO: mappa, token, iniziativa ----------
  // maps   = { name, image, cols, rows, grid, init[{tokenId, v}], turn, round }
  // tokens = { mapId, entryId?, name, color, image, x, y (caselle), size, hp, hpMax }
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
  const canMove = () => Store.canEdit();
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
          <div class="tt-wrap" id="tt-wrap"><div class="tt-sizer" id="tt-sizer"><div class="tt-board" id="tt-board">
            <div class="tt-bg" id="tt-bg"></div><div class="tt-grid"></div><svg class="tt-arrows" id="tt-arrows" aria-hidden="true"></svg><div class="tt-tokens" id="tt-tokens"></div>
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
      cls: ["tt-token", tt.sel === t.id && "sel", dead && "dead", turnToken(m) === t.id && "turn", canMove(t) && "mov", t.hidden && "hid"].filter(Boolean).join(" "),
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
    drawArrows();
  }
  function renderSide() { renderSel(); renderInit(); }
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
      box.innerHTML = `<h4>Token</h4><p class="hint">Clicca un token per selezionarlo. Trascinalo per muoverlo (o usa le frecce della tastiera). Rotella = zoom, trascina lo sfondo per spostare la vista.</p>`;
      return;
    }
    const e = tokEntry(t), hp = tokHp(t), edit = Store.canEdit(), gmt = gmTools();
    const w = hp && CPR.wound(hp.hp, hp.max), enemy = e && e.kind === "nemico" && e.enemy;
    const sp = loc => { const a = tokArmor(t, loc); return a ? spBar(loc === "head" ? "Head SP" : "Body SP", a, edit && (d => `data-action="tt-sp" data-loc="${loc}" data-d="${d}"`)) : ""; };
    box.innerHTML = `
      <h4 style="color:${safeColor(t.color)}">${t.hidden ? "🔒 " : ""}${esc(tokName(t))}</h4>
      ${isGm() && tokHidden(t) ? `<p class="hint gm-hint">Nascosto ai giocatori${!t.hidden ? " (perché la mappa è nascosta)" : ""}.</p>` : ""}
      ${hp ? `<div class="tt-hpblock w-${w.id}">
        <div class="tt-hpline"><span>HP <b>${hp.hp}</b> / ${hp.max}</span><span class="hint">${esc(w.label)}${w.pen ? ` · ${w.pen}` : ""}</span></div>
        <span class="sh-hpbar"><i style="width:${clamp(hp.hp / hp.max * 100, 0, 100)}%"></i><b style="left:${clamp(CPR.seriousAt(hp.max) / hp.max * 100, 0, 100)}%"></b></span>
        ${edit ? `<span class="sh-adj">${[-5, -1, 1, 5].map(d => `<button type="button" class="gp-btn" data-action="tt-hp" data-d="${d}">${d > 0 ? "+" : "−"}${Math.abs(d) === 1 ? "" : Math.abs(d)}</button>`).join("")}</span>` : ""}
      </div>` : ""}
      ${sp("head")}${sp("body")}
      <div class="tt-st"><span class="sh-k">Stati</span>${statusChips(tokStatusIds(t), edit ? (op, st) => `${op === "add" ? "" : `data-action="tok-status" `}data-st-tok="${esc(t.id)}" data-st-op="${op}" data-st="${esc(st)}"` : null)}</div>
      ${enemy && isGm() ? enemyQuickRolls(e, t) : ""}
      <div class="row-btns" style="margin-top:8px">
        ${e && isPerson(e) ? `<button type="button" class="btn ghost small cyan" data-action="open-entry-tab" data-id="${esc(e.id)}" data-tab="sheet">Scheda</button>` : ""}
        ${enemy && isGm() ? `<button type="button" class="btn ghost small cyan" data-action="enemy-open" data-id="${esc(e.id)}">Scheda nemico</button>` : ""}
        ${edit ? `<button type="button" class="btn ghost small" data-action="tt-init-one">Iniziativa</button>` : ""}
        ${gmt ? `${isGm() && Store.gmReady ? `<button type="button" class="btn ghost small yellow" data-action="tt-toggle-hidden">${t.hidden ? "👁 Rivela" : "🔒 Nascondi"}</button>` : ""}
          <button type="button" class="btn ghost small" data-action="tt-edit-token">Modifica</button>
          <button type="button" class="btn ghost small danger" data-action="tt-del-token">Rimuovi</button>` : ""}
      </div>`;
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
  function freeCell(m, taken) {
    const { W, H } = mapSize(m), wrap = $("#tt-wrap");
    const cx = wrap ? Math.floor((wrap.scrollLeft + wrap.clientWidth / 2) / (CELL * tt.zoom)) : Math.floor(W / 2);
    const cy = wrap ? Math.floor((wrap.scrollTop + wrap.clientHeight / 2) / (CELL * tt.zoom)) : Math.floor(H / 2);
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
    wrap.addEventListener("pointerdown", ev => {
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
            ${isGm() && Store.gmReady ? `<label class="check field full gm-check"><input type="checkbox" name="hidden"> 🔒 Aggiungi nascosti ai giocatori (li riveli poi con un clic)</label>` : ""}
          </div>
        </div>
        <div class="modal-foot"><button type="button" class="btn ghost small left" data-action="close">Annulla</button><button type="submit" class="btn">Aggiungi</button></div>
      </form>`, true);
    const form = $("#tok-form");
    form.addEventListener("submit", async ev => {
      ev.preventDefault();
      const taken = new Set(mapTokens(m).map(t => num(t.x) + "," + num(t.y)));
      const out = [], hidden = !!(form.elements["hidden"] && form.elements["hidden"].checked);
      for (const id of $$("input[name=ent]:checked", form).map(i => i.value)) {
        const e = state.entries.find(x => x.id === id);
        // nome e immagine copiati: chi non vede la scheda (NPC segreto) vede comunque il token
        if (e.kind === "nemico") { out.push(enemyToken(e, m, { hidden, ...freeCell(m, taken) })); continue; }
        out.push({ mapId: m.id, entryId: id, snapName: e.name, snapImage: imagesOf(e)[0] || "", color: e.kind === "pg" ? "#3dff9a" : "#00f0ff", size: 1, hidden, ...freeCell(m, taken) });
      }
      const name = form.elements["name"].value.trim(), n = clamp(num(form.count.value) || 1, 1, 20);
      const gsp = form.elements["sp"].value === "" ? null : num(form.elements["sp"].value);
      if (name) for (let i = 0; i < n; i++) out.push({ mapId: m.id, name: n > 1 ? `${name} ${i + 1}` : name, color: safeColor(form.color.value), size: 1, hidden,
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
        if (!t) return;
        const e = tokSheet(t), d = num(el.dataset.d);
        if (e) return sheetPatch(e.id, s => ({ ...s, hp: clamp(hpOf(e) + d, 0, hpMaxOf(e)) }));
        const hp = tokHp(t); if (!hp) return;
        return saveToken({ ...t, hp: clamp(hp.hp + d, 0, hp.max) });
      }
      case "tt-sp": {
        if (!t) return;
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
        for (const x of mapTokens(m)) cur = { ...cur, init: await initFor(cur, x) };
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
      if (r.id === "rules" || r.id === "nethb" || r.id === "cyberhb") {
        if (r.id === "rules") state.rules = r; else if (r.id === "cyberhb") { state.cyberhb = r; CW.setHomebrew(r); } else { state.nethb = r; NET.setHomebrew(r); }
        if (!$("#modal form")) { if (/^#\/(gm|net|party|glossario)/.test(location.hash) && !$("#modal").open) route(); }
      }
      return;
    }
    // riga diventata segreta: i giocatori la tolgono, i GM la rileggono dal database (sul canale non viaggia)
    if (msg.t === "gm") {
      if (!["rolls", "tokens", "maps", "entries", "notes", "gmnotes", "netarch"].includes(col) || !msg.id) return;
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
    if (!["rolls", "tokens", "maps", "entries", "notes", "gmnotes", "netarch", "netview"].includes(col)) return;
    if (!trusted && (rec.gmOnly || ["notes", "gmnotes", "netarch"].includes(col))) return;
    // tiro nuovo di qualcun altro: pop-up se il log è chiuso (sempre sulla mappa)
    if (col === "rolls" && !state.rolls.some(x => x.id === rec.id) && (onTable() || !drawer || drawer.hidden)) setTimeout(() => popRoll(rec));
    let oldTurn = null;
    if (col === "entries" && !trusted) {
      // dal canale accetto solo la parte "sheet" di schede già esistenti
      const e = state.entries.find(x => x.id === rec.id); if (!e) return;
      upsert(state.entries, { ...e, sheet: rec.sheet, updatedAt: rec.updatedAt });
      if (!$("#modal form")) refreshSheetView(e.id);
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

  // ---------- IMPOSTAZIONI ----------
  function openSettings() {
    const s = site();
    const cloud = Store.mode === "cloud";
    openModal(`
      <div class="modal-head"><h2>// IMPOSTAZIONI</h2><button class="x" data-action="close" aria-label="Chiudi">×</button></div>
      <div class="modal-body">
        <div class="settings-sec">
          <h3>Modalità</h3>
          ${cloud ? (Store.canEdit()
            ? `<p>Connesso come <b style="color:var(--green)">${esc(Store.user)}</b>. Le modifiche sono visibili a tutti.</p>
               <p>Ruolo: ${!Store.gmReady ? `<b>giocatore</b> · <span class="hint">il ruolo GM non è ancora attivo: va eseguito lo script <b>supabase/schema.sql</b> su Supabase (vedi README).</span>`
                 : isGm() ? `<b style="color:var(--yellow)">GM</b> · vedi anche le cose segrete. <a href="#/gm" data-action="close">Apri l'area GM →</a>`
                 : `<b>giocatore</b> · <span class="hint">un GM può darti il ruolo GM dalla sua area.</span>`}</p>
               <button class="btn ghost small" data-action="logout">Esci</button>`
            : `<p>Database condiviso (cloud). Accedi per modificare.</p>
               <form id="login-form" class="fields">
                 <div class="field"><label for="l-mail">Email</label><input id="l-mail" type="email" name="email" required autocomplete="username"></div>
                 <div class="field"><label for="l-pw">Password</label><input id="l-pw" type="password" name="password" required autocomplete="current-password"></div>
                 <div class="field full"><button class="btn cyan" type="submit">Accedi</button></div>
               </form>`)
            : `<p><b style="color:var(--yellow)">Locale</b>: i dati sono salvati solo in questo browser. Per condividerli con il gruppo attiva la modalità cloud (vedi README.md) e importa un backup.</p>`}
        </div>
        ${Store.canEdit() ? `
        <form class="settings-sec" id="site-form">
          <h3>Pagina iniziale</h3>
          <div class="fields">
            <div class="field full"><label for="st-title">Titolo del sito</label><input id="st-title" name="title" value="${esc(s.title)}"></div>
            <div class="field full"><label for="st-tag">Sottotitolo</label><input id="st-tag" name="tagline" value="${esc(s.tagline)}"></div>
            <div class="field full"><label for="st-date">Data attuale in gioco</label><input id="st-date" name="campaignDate" type="date" min="${START_YEAR}-01-01" max="${END_YEAR}-12-31" value="${esc(s.campaignDate)}"><span class="hint">Evidenziata nel calendario e mostrata in home.</span></div>
            <div class="field full"><label for="st-intro">Introduzione</label><textarea id="st-intro" name="intro" rows="4" placeholder="Due righe sulla campagna, il gruppo, l'anno…">${esc(s.intro)}</textarea></div>
            <div class="field full"><button class="btn small" type="submit">Salva</button></div>
          </div>
        </form>` : ""}
        <div class="settings-sec">
          <h3>Backup</h3>
          <p>Scarica tutto (record, eventi, appunti, tracce${cloud ? "" : ", immagini e audio caricati"}) in un file JSON, o reimportalo.</p>
          <div class="row-btns">
            <button class="btn cyan small" data-action="export">⇩ Esporta backup</button>
            ${Store.canEdit() ? `<label class="btn ghost small cyan">⇧ Importa backup<input type="file" accept="application/json,.json" id="import-file" hidden></label>` : ""}
          </div>
        </div>
      </div>
    `, true);
    const lf = $("#login-form");
    lf && lf.addEventListener("submit", async ev => {
      ev.preventDefault();
      const fd = new FormData(lf);
      try { await Store.signIn(fd.get("email"), fd.get("password")); toast("Accesso effettuato", "ok"); closeModal(); }
      catch (e) { fail(e); }
    });
    const sf = $("#site-form");
    sf && sf.addEventListener("submit", async ev => {
      ev.preventDefault();
      const fd = new FormData(sf);
      const cd = fd.get("campaignDate");
      if (cd && !validDay(cd)) return toast(`La data deve essere tra il ${START_YEAR} e il ${END_YEAR}`, "err");
      try {
        await saveSite({ title: fd.get("title").trim() || "NIGHT CITY ARCHIVE", tagline: fd.get("tagline").trim(), intro: fd.get("intro").trim(), campaignDate: cd });
        toast("Salvato", "ok"); closeModal(); route();
      } catch (e) { fail(e); }
    });
    const imp = $("#import-file");
    imp && imp.addEventListener("change", async () => {
      const f = imp.files[0]; if (!f) return;
      try {
        toast("Importazione in corso…");
        const n = await Store.importAll(JSON.parse(await f.text()));
        await loadAll(); toast(`Importati ${n} elementi`, "ok"); closeModal(); route();
      } catch (e) { fail(e); }
    });
  }

  async function doExport() {
    try {
      toast("Preparo il backup…");
      const data = await Store.exportAll(["entries", "songs", "meta", "notes", "events", "weather", "diary", "quests", "maps", "tokens", "netview", ...(isGm() ? ["netarch"] : [])]);
      const blob = new Blob([JSON.stringify(data)], { type: "application/json" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `nc-archive-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    } catch (e) { fail(e); }
  }

  // ---------- modal ----------
  function openModal(html, narrow = false) {
    const m = $("#modal");
    closeLightbox();
    m.className = "modal" + (narrow ? " narrow" : "");
    m.innerHTML = html;
    hydrate(m);
    if (!m.open) m.showModal();
    m.scrollTop = 0;
    placeDrawer();
  }
  function closeModal() {
    const m = $("#modal");
    if (m.open) m.close();
  }
  $("#modal").addEventListener("close", () => {
    if ($("#modal").open) return; // riaperto prima che l'evento arrivasse
    closeLightbox();
    $("#modal").innerHTML = "";
    placeDrawer();
    const r = /^#\/(database|appunti)\/.+/.exec(location.hash);
    if (r) history.replaceState(null, "", "#/" + r[1]);
  });
  $("#modal").addEventListener("cancel", ev => { if (lightbox) { ev.preventDefault(); closeLightbox(); } });
  $("#modal").addEventListener("click", ev => { if (ev.target === ev.currentTarget) closeModal(); });

  // ---------- eventi pagina ----------
  function bindPage(page) {
    if (page === "database") {
      const f = state.filter;
      $("#q").addEventListener("input", ev => { f.q = ev.target.value; refreshResults(); });
      $("#f-faction").addEventListener("change", ev => { f.faction = ev.target.value; saveFilter(); refreshResults(); });
      $("#f-status").addEventListener("change", ev => { f.status = ev.target.value; saveFilter(); refreshResults(); });
      $("#f-sort").addEventListener("change", ev => { f.sort = ev.target.value; saveFilter(); refreshResults(); });
      $("#kind-chips").addEventListener("click", ev => {
        const c = ev.target.closest("[data-kind]"); if (!c) return;
        f.kind = c.dataset.kind; saveFilter();
        $$(".chip", ev.currentTarget).forEach(x => x.classList.toggle("active", x === c));
        refreshResults();
      });
    }
    if (page === "tracce" && $("#disc-chips")) {
      $("#disc-chips").addEventListener("click", ev => {
        const c = ev.target.closest("[data-disc]"); if (!c) return;
        state.disc = c.dataset.disc; ls.set("nc-disc", state.disc); route();
      });
    }
    if (page === "diario" && $("#diary-q")) {
      $("#diary-q").addEventListener("input", ev => { state.diaryQ = ev.target.value; $("#diary-results").innerHTML = diaryResults(); });
    }
    if (page === "appunti") {
      $("#note-q").addEventListener("input", ev => { state.noteQ = ev.target.value; $("#notes-results").innerHTML = notesHtml(); });
    }
    if (page === "gm") loadGmList();
    if (page === "mappa") {
      bindTable(); renderLogs();
    }
    const cm = $("#cal-m"), cy = $("#cal-y");
    if (cm && cy) {
      const go = () => { location.hash = `#/calendario/${cy.value}-${pad(cm.value)}`; };
      cm.addEventListener("change", go); cy.addEventListener("change", go);
    }
  }

  // Conferma disegnata dal sito: confirm() del browser viene bloccato da alcuni browser
  // (es. browser integrati e app su telefono) e risponde "no" senza mostrare nulla.
  function askConfirm(message, okLabel = "Elimina") {
    return new Promise(resolve => {
      const d = document.createElement("dialog");
      d.className = "modal narrow confirm";
      d.innerHTML = `
        <div class="modal-head"><h2>// CONFERMA</h2></div>
        <div class="modal-body"><p class="confirm-msg">${esc(message)}</p></div>
        <div class="modal-foot">
          <button type="button" class="btn ghost small cyan left" data-c="no">Annulla</button>
          <button type="button" class="btn danger" data-c="yes">${esc(okLabel)}</button>
        </div>`;
      let answer = false;
      d.addEventListener("click", ev => {
        const b = ev.target.closest("[data-c]");
        if (b) { answer = b.dataset.c === "yes"; d.close(); }
        else if (ev.target === d) d.close();
      });
      d.addEventListener("close", () => { d.remove(); resolve(answer); });
      document.body.appendChild(d);
      d.showModal();
      $("[data-c=no]", d).focus();
    });
  }

  async function confirmDelete(col, list, id, label, after) {
    const rec = list.find(x => x.id === id);
    if (!rec || !(await askConfirm(`Eliminare definitivamente "${label(rec)}"? Non si può annullare.`))) return null;
    try { await Store.remove(col, rec); closeModal(); after(rec); route(); toast("Eliminato"); }
    catch (err) { fail(err); }
  }

  document.addEventListener("click", async ev => {
    const el = ev.target.closest("[data-action]"); if (!el) return;
    const a = el.dataset.action, id = el.dataset.id;
    switch (a) {
      case "close": closeModal(); break;
      case "settings": openSettings(); break;
      case "export": doExport(); break;
      case "logout": await Store.signOut(); closeModal(); toast("Disconnesso"); break;
      case "open-entry":
        if (!location.hash.startsWith("#/database")) { location.hash = "#/database/" + id; }
        else openEntry(id);
        break;
      case "open-entry-tab": openEntry(id, el.dataset.tab); break;
      case "edit-cyber": editCyber(id); break;
      case "edit-humanity": editHumanity(id); break;
      case "edit-gear": editGear(id); break;
      case "new-entry": editEntry(null); break;
      case "edit-entry": editEntry(id); break;
      case "delete-entry": confirmDelete("entries", state.entries, id, r => r.name, r => {
        state.entries = state.entries.filter(x => x.id !== r.id);
        const g = gmNoteOf(r.id);   // le note del GM se ne vanno con il personaggio
        if (g) { Store.remove("gmnotes", g).catch(() => {}); state.gmnotes = state.gmnotes.filter(x => x.id !== g.id); }
      }); break;
      case "edit-gmnote": editGmNote(id); break;
      case "gm-new-entry": editEntry(null, { kind: "npc", gmOnly: true }); break;
      // nemici
      case "gm-gen-enemy": editEnemy(null, CPR.generateEnemy(1, "base")); break;
      case "gm-new-enemy": editEnemy(null, { v: 3, role: "none", roleRank: 0, extraPoints: 0, tier: 1, level: "base", name: "", stats: Object.fromEntries(CPR.STATS.map(s => [s.id, s.id === "LUCK" ? 0 : 5])), armor: {}, weapons: [], skills: [], picks: [] }); break;
      case "enemy-open": openEnemy(id); break;
      case "enemy-edit": editEnemy(id); break;
      case "enemy-spawn": spawnEnemy(id); break;
      case "enemy-copy": { const e = state.entries.find(x => x.id === id); if (e) editEnemy(null, { ...JSON.parse(JSON.stringify(enemyOf(e))), name: e.name + " (copia)" }); break; }
      case "enemy-roll": {
        const e = state.entries.find(x => x.id === id), t = el.dataset.tok && state.tokens.find(x => x.id === el.dataset.tok);
        if (e) rollEnemy(e, el.dataset.roll, t || null);
        break;
      }
      case "gm-new-note": editNote(null, { gmOnly: true, category: "GM" }); break;
      // architetture NET
      case "net-gen": editArch(null, NET.generate("standard")); break;
      case "net-new": editArch(null, NET.blank()); break;
      case "net-open": openArch(id); break;
      case "net-edit": editArch(id); break;
      case "net-copy": { const A = archById(id); if (A) { const c = JSON.parse(JSON.stringify(A)); delete c.id; delete c.createdAt; editArch(null, { ...c, name: (A.name || "Architettura") + " (copia)", shared: false }); } break; }
      case "net-adj": archAdj(el); break;
      case "net-roll": archRoll(el); break;
      case "net-reset": archPatch(id, A => { A.branches.forEach(b => b.floors.forEach(f => { f.seen = false; f.done = false; (f.ice || []).forEach(x => { x.cur = null; }); })); (A.demons || []).forEach(d => { d.cur = null; }); return A; }); break;
      case "net-share": {
        const A = archById(id); if (!A) break;
        const on = !A.shared;
        archPatch(id, X => ({ ...X, shared: on }));
        toast(on ? "Visibile nella pagina NET: compaiono solo i piani rivelati (👁)" : "Architettura nascosta ai giocatori", "ok");
        el.textContent = on ? "🔒 Nascondi ai giocatori" : "👁 Mostra ai giocatori";
        if (/^#\/net/.test(location.hash)) { netOpen.add(id); refreshNetPage(); }
        break;
      }
      case "net-delete": {
        const v = state.netview.find(x => x.id === "nv-" + id);
        confirmDelete("netarch", state.netarch, id, r => r.name || "architettura", async r => {
          state.netarch = state.netarch.filter(x => x.id !== r.id);
          Store.send({ t: "del", col: "netarch", id: r.id });
          if (v) { try { await Store.remove("netview", v); Store.send({ t: "del", col: "netview", id: v.id }); state.netview = state.netview.filter(x => x.id !== v.id); } catch (e) { console.warn(e); } }
        });
        break;
      }
      case "gm-add": {
        const inp = $("#gm-email"), email = inp && inp.value.trim();
        if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { toast("Scrivi un'email valida", "err"); break; }
        try { await Store.addGm(email); inp.value = ""; toast(`${email} ora è GM`, "ok"); loadGmList(); } catch (err) { fail(err); }
        break;
      }
      case "gm-remove": {
        const email = el.dataset.email;
        const me = norm(email) === norm(Store.user);
        if (!(await askConfirm(me ? `Togliere te stesso dai GM? Non vedrai più le cose segrete finché un altro GM non ti riaggiunge.` : `Togliere ${email} dai GM?`, "Togli"))) break;
        try { await Store.removeGm(email); toast("Fatto"); if (me) location.reload(); else loadGmList(); } catch (err) { fail(err); }
        break;
      }
      case "gm-open-map": tt.view = id; tt.sel = null; location.hash = "#/mappa"; break;
      case "party-as": {
        const e = state.entries.find(x => x.id === id); if (!e) break;
        ls.set("nc-as", id); $$("[data-roll-as]").forEach(s => { s.value = id; });
        toast(`Il Dice log ora tira come ${e.name}`, "ok"); openDrawer();
        break;
      }
      case "new-song": editSong(null); break;
      case "edit-song": editSong(id); break;
      case "delete-song": confirmDelete("songs", state.songs, id, r => r.title, r => { state.songs = state.songs.filter(x => x.id !== r.id); }); break;
      case "open-note": openNote(id); break;
      case "new-note": editNote(null); break;
      case "edit-note": editNote(id); break;
      case "delete-note": confirmDelete("notes", state.notes, id, r => r.title, r => { state.notes = state.notes.filter(x => x.id !== r.id); }); break;
      case "new-scene": editScene(null); break;
      case "edit-scene": editScene(id); break;
      case "delete-scene": confirmDelete("diary", state.diary, id, r => r.title, r => { state.diary = state.diary.filter(x => x.id !== r.id); if (location.hash.startsWith("#/diario/")) history.replaceState(null, "", "#/diario"); }); break;
      case "new-quest": editQuest(null); break;
      case "edit-quest": editQuest(id); break;
      case "delete-quest": confirmDelete("quests", state.quests, id, r => "quest " + r.name, r => { state.quests = state.quests.filter(x => x.id !== r.id); if (state.quest === r.id) state.quest = "all"; history.replaceState(null, "", "#/quest"); }); break;
      case "set-quest":
        state.quest = el.dataset.quest; ls.set("nc-quest", state.quest);
        if (location.hash !== "#/diario") location.hash = "#/diario"; else route();
        break;
      case "scene-in-quest": state.quest = el.dataset.quest; ls.set("nc-quest", state.quest); break; // poi il link apre la scena
      case "q-expand": {
        const open = el.dataset.open !== "1";
        $$(".q-scene").forEach(d => { d.open = open; });
        el.dataset.open = open ? "1" : ""; el.textContent = open ? "Chiudi tutte le scene" : "Espandi tutte le scene";
        break;
      }
      case "new-event": editEvent(null, el.dataset.date); break;
      case "edit-event": editEvent(id); break;
      case "delete-event": confirmDelete("events", state.events, id, r => r.title, r => { state.events = state.events.filter(x => x.id !== r.id); }); break;
      case "edit-weather": editWeather(el.dataset.date); break;
      case "delete-weather": confirmDelete("weather", state.weather, id, r => "meteo del " + fmtDate(r.date), r => { state.weather = state.weather.filter(x => x.id !== r.id); }); break;
      case "set-gameday":
        try { await saveSite({ campaignDate: el.dataset.date }); toast("Data in gioco aggiornata", "ok"); route(); } catch (err) { fail(err); }
        break;
      case "toggle-suno": {
        const box = $(".suno-embed", el.closest(".track"));
        if (box.hidden) { box.innerHTML = `<iframe src="${esc(el.dataset.embed)}" loading="lazy" allow="autoplay; encrypted-media" title="Player Suno"></iframe>`; box.hidden = false; el.textContent = "■ Chiudi player"; }
        else { box.innerHTML = ""; box.hidden = true; el.textContent = "▶ Player Suno"; }
        break;
      }
      case "car-step": { const car = el.closest(".carousel"); carGo(car, +car.dataset.i + +el.dataset.d); break; }
      case "car-go": { const car = el.closest(".carousel"); carGo(car, +el.dataset.i); break; }
      case "zoom": {
        const car = el.closest(".carousel");
        const srcs = car ? $$(".car-slide", car).map(i => i.src).filter(Boolean) : [el.src];
        openLightbox(srcs, car ? +car.dataset.i : 0);
        break;
      }
      case "pick-file": $("input[type=file]", el.closest("[data-picker]")).click(); break;
      case "pick-clear": {
        const p = el.closest("[data-picker]");
        p._blob = null; $("input[type=hidden]", p).value = ""; $("[data-picker-url]", p).value = "";
        if (p.dataset.type === "image") $(".picker-preview", p).innerHTML = `<div class="ph">NESSUNA IMMAGINE</div>`;
        else { const au = $("audio", p); au.removeAttribute("src"); au.hidden = true; $(".audio-name", p).textContent = ""; }
        break;
      }
      case "cf-add": $("#cf-list").insertAdjacentHTML("beforeend", cfRow()); $("#cf-list .cf-row:last-child input").focus(); break;
      case "cf-del": el.closest(".cf-row").remove(); break;
      // scheda personaggio
      case "edit-sheet": editSheet(id); break;
      case "edit-decks": editDecks(id); break;
      case "ip-open": openIp(id); break;
      case "ip-earn": case "ip-spend": case "ip-undo": ipAction(el); break;
      case "sheet-roll": { const e = state.entries.find(x => x.id === id); if (e) sheetRoll(e, el.dataset.roll); break; }
      case "rl-op": roleOp(el); break;
      case "rl-roll": roleRoll(el); break;
      case "log-clear": ls.set("nc-log-cleared", new Date().toISOString()); renderLogs(); toast("Dice log pulito su questo dispositivo: i tiri restano salvati"); break;
      case "log-wipe": wipeLog(); break;
      case "log-unclear": ls.set("nc-log-cleared", ""); renderLogs(); break;
      case "cy-on": cyberPatch(id, c => { const it = ((c.slots || {})[el.dataset.slot] || [])[num(el.dataset.i)]; if (it) it.on = !it.on; return c; }); break;
      case "cy-weapon": {
        const e = state.entries.find(x => x.id === id), w = e && cyberFx(e).weapons.find(x => x.name === el.dataset.name); if (!w || !Store.canEdit()) break;
        const T = CPR.weaponType(w.cat) || {};
        sheetPatch(id, s => { s.weapons = [...(s.weapons || []), { name: w.name, cat: w.cat, skill: T.skill || "melee", dmg: w.dmg, rof: w.rof || T.rof || 1, mag: "", note: [w.note, "cyberware"].filter(Boolean).join(" · ") }]; return s; });
        toast(`${w.name} aggiunta alle armi`, "ok"); break;
      }
      case "cyhb-edit": editCyberHb(id); break;
      case "gloss-tab": ls.set("nc-gloss", el.dataset.tab); route(); break;
      case "cb-roll": cbRoll(wSrc(el.dataset.src, id, el.dataset.i, el.dataset.tok), el.dataset.mode || "single"); break;
      case "cb-dmg": cbDamage(wSrc(el.dataset.src, id, el.dataset.i, el.dataset.tok), num(el.dataset.mult)); break;
      case "sheet-status": { const e = state.entries.find(x => x.id === el.dataset.stSheet); if (e && Store.canEdit()) statusOp(el, sheetStatusApply(e)); break; }
      case "tok-status": { const t = state.tokens.find(x => x.id === el.dataset.stTok); if (t && Store.canEdit()) statusOp(el, tokStatusApply(t)); break; }
      case "sheet-crit": { const e = state.entries.find(x => x.id === id); if (!e) break; lastCrit[id] = critRoll(e.name, el.dataset.loc, r => postRoll({ ...r, who: e.name, entryId: e.id })); refreshSheetView(id); break; }
      case "sheet-crit-add": {
        const L = lastCrit[id]; if (!L || !Store.canEdit()) break;
        delete lastCrit[id];
        sheetPatch(id, s => { s.crit = [s.crit, `${L.name} (${L.loc === "head" ? "testa" : "corpo"}): ${L.eff}`].filter(Boolean).join("\n"); if (L.dsp) s.dsp = num(s.dsp) + L.dsp; return s; });
        toast(`${L.name} aggiunta${L.dsp ? " · penalità del Death Save +1" : ""}`, "ok");
        break;
      }
      case "gm-rules": editRules(); break;
      case "hb-edit": editHomebrew(el.dataset.kind, id); break;
      case "deck-adj": { const e = state.entries.find(x => x.id === id), op = rezOp(el, el.dataset.op); if (e && op && Store.canEdit()) deckAdj(e, num(el.dataset.i), op); break; }
      case "sheet-adj": {
        const e = state.entries.find(x => x.id === id); if (!e || !Store.canEdit()) break;
        const f = el.dataset.f, d = el.dataset.d;
        sheetPatch(id, s => {
          if (f === "hp") s.hp = clamp(hpOf(e) + num(d), 0, hpMaxOf(e));
          else if (f === "luck") s.luck = d === "reset" ? null : clamp(luckOf(e) + num(d), 0, statBase(e, "LUCK"));
          else if (f === "dsp") s.dsp = Math.max(0, num(s.dsp) + num(d));
          else if (f.startsWith("armor.")) armorPatch(s, e, f.slice(6), d);
          return s;
        });
        break;
      }
      // dadi
      case "dice-toggle": if (drawer && !drawer.hidden) closeDrawer(); else openDrawer(); break;
      case "dice-open": openDrawer(); break;
      case "dice-close": closeDrawer(); break;
      case "menu-toggle": if ($("#side-menu").hidden) openMenu(); else closeMenu(); break;
      case "menu-close": closeMenu(); break;
      case "dice-min": minDrawer(); break;
      default: if (a.startsWith("tt-")) tableAction(a, el);
    }
  });

  // log dei dadi: invio, tiri rapidi, "tira come"
  document.addEventListener("submit", ev => {
    const f = ev.target.closest && ev.target.closest("[data-roll-form]"); if (!f) return;
    ev.preventDefault();
    const inp = $("[data-roll-text]", f); submitChat(inp.value); inp.value = ""; inp.focus();
  });
  document.addEventListener("click", ev => {
    const q = ev.target.closest && ev.target.closest("[data-quick]"); if (q) quickRoll(q.dataset.quick);
  });
  document.addEventListener("change", ev => {
    const t = ev.target;
    // armi: mirato (solo su questo dispositivo), munizioni e tabelle (nell'arma)
    if (t.matches("[data-cb-aim], [data-cb-loc], [data-cb-ammo], [data-cb-table], [data-cb-atable], [data-cb-weak]")) {
      const X = wSrc(t.dataset.src, t.dataset.id, t.dataset.i, t.dataset.tok); if (!X) return;
      if (t.matches("[data-cb-aim], [data-cb-loc], [data-cb-weak]")) {
        const M = cbMem[X.key] = cbMem[X.key] || {};
        if (t.matches("[data-cb-aim]")) M.aim = t.checked; else if (t.matches("[data-cb-weak]")) M.weak = t.checked; else M.loc = t.value;
        X.refresh(); return;
      }
      if (!X.edit) return;
      const f = t.matches("[data-cb-ammo]") ? "ammo" : t.matches("[data-cb-table]") ? "range" : "autoRange";
      if (f !== "ammo" && cbMem[X.key]) delete cbMem[X.key].last;
      X.save(f, t.value);
      return;
    }
    // tab Ruoli
    if (t.matches("[data-rl][data-rf]")) { roleSet(t); return; }
    if (t.matches("select[data-rl-upg]")) {
      const e = state.entries.find(x => x.id === t.dataset.rid), [ri, vi] = t.dataset.rlUpg.split(":").map(num), u = t.value;
      if (e && u && Store.canEdit()) sheetPatch(e.id, s => { migrateRoles(s, e); const v = ((s.roles[ri] || {}).stable || [])[vi]; if (v) (v.upgrades = v.upgrades || []).push(u); return s; });
      return;
    }
    if (t.matches("select[data-st-op=add]")) {
      if (t.dataset.stSheet) { const e = state.entries.find(x => x.id === t.dataset.stSheet); if (e && Store.canEdit()) statusOp(t, sheetStatusApply(e)); }
      if (t.dataset.stTok) { const k = state.tokens.find(x => x.id === t.dataset.stTok); if (k && Store.canEdit()) statusOp(t, tokStatusApply(k)); }
      return;
    }
    if (t.matches("[data-gloss-g]")) { glossG = t.value; const b = $("#gloss-body"); if (b) b.innerHTML = glossBody("cyber"); return; }
    if (t.matches("[data-roll-as]")) { ls.set("nc-as", t.value || null); $$("[data-roll-as]").forEach(s => { s.value = t.value; }); }
    // cambio mappa: solo per me; il GM poi può premere "Mostra a tutti"
    if (t.matches("[data-secret]")) { secretRoll = t.checked; ls.set("nc-secret", secretRoll); $$("[data-secret]").forEach(c => { c.checked = secretRoll; }); $$(".roll-form").forEach(f => f.classList.toggle("is-secret", secretRoll)); return; }
    if (t.id === "tt-map") { tt.view = t.value; tt.sel = null; tt.remote = {}; route(); return; }
    if (t.matches("[data-sk-all]")) { ls.set("nc-sk-all", t.checked); const sh = t.closest(".sh"); if (sh) refreshSheetView(sh.dataset.sheet); }
    if (t.matches("[data-init]")) {
      const m = curMap(); if (!m || !Store.canEdit()) return;
      saveMap({ ...m, init: (m.init || []).map(it => it.tokenId === t.dataset.init ? { ...it, v: num(t.value) } : it) });
    }
  });
  document.addEventListener("input", ev => {
    if (ev.target.matches("[data-gloss-q]")) { glossQ = ev.target.value; const b = $("#gloss-body"); if (b) { b.innerHTML = glossBody("cyber"); const i = $("[data-gloss-q]", b); i.focus(); i.setSelectionRange(i.value.length, i.value.length); } return; }
    if (ev.target.matches("[data-sheet-mod]")) sheetMod = Math.trunc(num(ev.target.value));
  });

  // tavolo: frecce = sposta il token selezionato di una casella · Canc = deseleziona
  document.addEventListener("keydown", ev => {
    if (!onTable() || $("#modal").open || !tt.sel) return;
    if (ev.target.closest && ev.target.closest("input, textarea, select")) return;
    if (ev.key === "Escape") { selectToken(null); return; }
    const dir = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[ev.key];
    const t = state.tokens.find(x => x.id === tt.sel), m = curMap();
    if (!dir || !t || !m || !canMove(t)) return;
    ev.preventDefault();
    const { W, H } = mapSize(m), size = clamp(num(t.size) || 1, 1, 6);
    saveToken({ ...t, x: clamp(num(t.x) + dir[0], 0, W - size), y: clamp(num(t.y) + dir[1], 0, H - size) });
  });

  // frecce da tastiera: lightbox, poi carosello del dossier
  document.addEventListener("keydown", ev => {
    if (ev.key !== "ArrowLeft" && ev.key !== "ArrowRight") return;
    if (ev.target.closest && ev.target.closest("input, textarea, select")) return;
    const d = ev.key === "ArrowLeft" ? -1 : 1;
    if (lightbox) { lightbox.show(lightbox.i + d); ev.preventDefault(); return; }
    const car = $("#modal").open && $("#modal .carousel[data-n]");
    if (car) { carGo(car, +car.dataset.i + d); ev.preventDefault(); }
  });

  // un solo audio alla volta + vinile che gira
  document.addEventListener("play", ev => {
    if (ev.target.tagName !== "AUDIO") return;
    $$("audio").forEach(a => { if (a !== ev.target) a.pause(); });
    const t = ev.target.closest(".track"); t && t.classList.add("playing");
  }, true);
  ["pause", "ended"].forEach(n => document.addEventListener(n, ev => {
    const t = ev.target.closest && ev.target.closest(".track"); t && t.classList.remove("playing");
  }, true));

  // ---------- avvio ----------
  async function boot() {
    try {
      await Store.init();
      await loadAll();
    } catch (e) {
      $("#app").innerHTML = `<div class="empty"><div class="big">// CONNESSIONE FALLITA</div>${esc(e.message || e)}<br><br>Controlla js/config.js e il README.</div>`;
      console.error(e); return;
    }
    // accesso o uscita: ricarico i dati, perché un GM vede anche le righe segrete
    Store.onAuth(async () => {
      closeModal(); closeDrawer();
      try { await loadAll(); } catch (e) { console.warn(e); }
      tt.view = null; tt.sel = null; route();
      if (isGm()) toast("Accesso come GM: vedi anche le cose segrete", "ok");
    });
    ensureDrawer();
    try { Store.live(onLive, onLiveStatus); } catch (e) { console.warn("realtime", e); }
    window.addEventListener("hashchange", () => {
      // navigando altrove chiudo il dossier aperto
      if (!/^#\/(database|appunti)\/.+/.test(location.hash)) closeModal();
      route();
    });
    route();
  }
  boot();
})();
