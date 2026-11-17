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
    { id: "npc",     label: "NPC",     plural: "NPC",     color: "var(--cyan)" },
    { id: "fazione", label: "Fazione", plural: "Fazioni", color: "var(--red)" },
    { id: "luogo",   label: "Luogo",   plural: "Luoghi",  color: "var(--yellow)" },
    { id: "oggetto", label: "Oggetto", plural: "Oggetti", color: "var(--magenta)" },
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
    entries: [], songs: [], notes: [], events: [], weather: [], site: null,
    filter: { q: "", kind: "all", faction: "", status: "", sort: "name" },
    noteQ: "", cal: null,
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

  const findEntry = name => state.entries.find(e => norm(e.name) === norm(name));
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

  // ---------- dati ----------
  async function loadAll() {
    const [entries, songs, meta, notes, events, weather] = await Promise.all(
      ["entries", "songs", "meta", "notes", "events", "weather"].map(c => Store.list(c)));
    Object.assign(state, { entries, songs, notes, events, weather });
    state.site = meta.find(m => m.id === "site") || null;
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
    else if (Store.canEdit()) { pill.textContent = "● EDIT · " + Store.user; pill.className = "mode-pill edit"; pill.title = "Connesso: puoi modificare"; }
    else { pill.textContent = "● CLOUD · sola lettura"; pill.className = "mode-pill cloud"; pill.title = "Accedi da ⚙ per modificare"; }
    $("#footer-status").textContent = `${state.entries.length} record · ${state.events.length} eventi · ${state.notes.length} appunti · ${state.songs.length} tracce`;
  }

  // ---------- routing ----------
  let lastView = "";
  function route() {
    const [page = "home", arg] = location.hash.replace(/^#\/?/, "").split("/");
    $$("#nav a").forEach(a => a.classList.toggle("active", a.dataset.route === page));
    const app = $("#app");
    let viewKey = page;
    if (page === "database") app.innerHTML = viewDatabase();
    else if (page === "tracce") app.innerHTML = viewSongs();
    else if (page === "appunti") app.innerHTML = viewNotes();
    else if (page === "calendario") {
      const p = parseYmd(arg);
      if (p && p.d) {
        if (!validDay(arg)) { location.replace("#/calendario"); return; }
        app.innerHTML = viewDay(arg);
      } else app.innerHTML = viewMonth(p);
      viewKey = location.hash;
    }
    else app.innerHTML = viewHome();
    hydrate(app);
    bindPage(page);
    if (page === "database" && arg) openEntry(arg);
    if (page === "appunti" && arg) openNote(arg);
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
          <a class="btn yellow ghost" href="#/calendario">Calendario</a>
          <a class="btn cyan ghost" href="#/tracce">Ascolta le tracce</a>
        </div>
      </section>
      <section class="stats">
        <a class="stat" href="#/database" style="--c:var(--cyan)"><div class="n">${npcs.length}</div><div class="l">NPC schedati</div></a>
        <a class="stat" href="#/database" style="--c:var(--red)"><div class="n">${factions().length}</div><div class="l">Fazioni note</div></a>
        <a class="stat" href="#/calendario" style="--c:var(--yellow)"><div class="n">${state.events.length}</div><div class="l">Eventi</div></a>
        <a class="stat" href="#/appunti" style="--c:var(--green)"><div class="n">${state.notes.length}</div><div class="l">Appunti</div></a>
        <a class="stat" href="#/tracce" style="--c:var(--magenta)"><div class="n">${state.songs.length}</div><div class="l">Tracce</div></a>
        <div class="stat" style="--c:var(--muted)"><div class="n">${npcs.filter(e => e.status === "morto").length}</div><div class="l">Flatlined</div></div>
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
          ${[{ id: "all", plural: "Tutti" }, ...KINDS].map(k => `<button class="chip ${f.kind === k.id ? "active" : ""}" data-kind="${k.id}">${esc(k.plural)}<span class="count">${count(k.id)}</span></button>`).join("")}
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
      <button class="card ${e.status === "morto" ? "is-dead" : ""}" data-action="open-entry" data-id="${esc(e.id)}">
        <div class="card-img">
          ${imgs.length ? imgTag(imgs[0], e.name) : `<div class="noimg"><span>NO SIGNAL</span></div>`}
          <span class="kind-tag" style="--k:${k.color}">${esc(k.label)}</span>
          ${imgs.length > 1 ? `<span class="img-count">▣ ${imgs.length}</span>` : ""}
        </div>
        <div class="card-body">
          <h3>${esc(e.name || "Senza nome")}</h3>
          ${e.handle ? `<div class="handle">“${esc(e.handle)}”</div>` : ""}
          <div class="meta">
            ${e.faction ? `<span class="badge faction">${esc(e.faction)}</span>` : ""}
            ${e.role ? `<span class="badge">${esc(e.role)}</span>` : ""}
            ${st && e.kind === "npc" ? `<span class="status s-${st.id}">${esc(st.label)}</span>` : ""}
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

  // ---------- dettaglio record ----------
  function openEntry(id) {
    const e = state.entries.find(x => x.id === id);
    if (!e) return;
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
        <div class="dossier">
          ${carouselHtml(imgs, e.name)}
          <div>
            <h1>${esc(e.name || "Senza nome")}</h1>
            ${e.handle ? `<div class="handle">“${esc(e.handle)}”</div>` : ""}
            <dl class="facts">${facts.map(([a, b]) => `<dt>${a}</dt><dd>${b}</dd>`).join("")}</dl>
            ${(e.tags || []).length ? `<div class="meta">${e.tags.map(t => `<span class="badge tag">#${esc(t)}</span>`).join("")}</div>` : ""}
            ${e.description ? `<div class="block"><h4>Descrizione</h4><div class="prewrap">${esc(e.description)}</div></div>` : ""}
            ${e.notes ? `<div class="block"><h4>Note</h4><div class="prewrap">${esc(e.notes)}</div></div>` : ""}
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

  function editEntry(id) {
    const e = state.entries.find(x => x.id === id) || { kind: state.filter.kind !== "all" ? state.filter.kind : "npc", status: "vivo", custom: [] };
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
        };
        const saved = await Store.save("entries", rec);
        upsert(state.entries, saved);
        Store.deleteFiles(oldImages.filter(r => !images.includes(r))).catch(() => {});
        toast("Record salvato", "ok");
        closeModal();
        route();
        if (location.hash.startsWith("#/database")) openEntry(saved.id);
      } catch (err) { fail(err); btn.disabled = false; btn.textContent = "Salva record"; }
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
      <button class="note-card ${n.pinned ? "pinned" : ""}" data-action="open-note" data-id="${esc(n.id)}">
        <span class="note-bar"><span>&gt; ${esc(slug(n.title))}.shard</span>${n.pinned ? `<span class="pin">▲ FISSATO</span>` : ""}</span>
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
        ${(n.tags || []).length ? `<div class="meta">${n.tags.map(t => `<span class="badge tag">#${esc(t)}</span>`).join("")}</div>` : ""}
        <div class="prewrap note-body">${esc(n.body)}</div>
      </div>
      ${Store.canEdit() ? `<div class="modal-foot">
        <button class="btn ghost small left" data-action="delete-note" data-id="${esc(n.id)}">Elimina</button>
        <button class="btn cyan" data-action="edit-note" data-id="${esc(n.id)}">Modifica</button>
      </div>` : ""}`);
    if (location.hash !== "#/appunti/" + n.id && location.hash.startsWith("#/appunti")) history.replaceState(null, "", "#/appunti/" + n.id);
  }

  function editNote(id) {
    const n = state.notes.find(x => x.id === id) || {};
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
        });
        upsert(state.notes, saved);
        toast("Appunto salvato", "ok"); closeModal(); route();
        if (location.hash.startsWith("#/appunti")) openNote(saved.id);
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
            ? `<p>Connesso come <b style="color:var(--green)">${esc(Store.user)}</b>. Le modifiche sono visibili a tutti.</p><button class="btn ghost small" data-action="logout">Esci</button>`
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
      const data = await Store.exportAll(["entries", "songs", "meta", "notes", "events", "weather"]);
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
  }
  function closeModal() {
    const m = $("#modal");
    if (m.open) m.close();
  }
  $("#modal").addEventListener("close", () => {
    if ($("#modal").open) return; // riaperto prima che l'evento arrivasse
    closeLightbox();
    $("#modal").innerHTML = "";
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
    if (page === "appunti") {
      $("#note-q").addEventListener("input", ev => { state.noteQ = ev.target.value; $("#notes-results").innerHTML = notesHtml(); });
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
      case "new-entry": editEntry(null); break;
      case "edit-entry": editEntry(id); break;
      case "delete-entry": confirmDelete("entries", state.entries, id, r => r.name, r => { state.entries = state.entries.filter(x => x.id !== r.id); }); break;
      case "new-song": editSong(null); break;
      case "edit-song": editSong(id); break;
      case "delete-song": confirmDelete("songs", state.songs, id, r => r.title, r => { state.songs = state.songs.filter(x => x.id !== r.id); }); break;
      case "open-note": openNote(id); break;
      case "new-note": editNote(null); break;
      case "edit-note": editNote(id); break;
      case "delete-note": confirmDelete("notes", state.notes, id, r => r.title, r => { state.notes = state.notes.filter(x => x.id !== r.id); }); break;
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
    }
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
    Store.onAuth(() => { closeModal(); route(); });
    window.addEventListener("hashchange", () => {
      // navigando altrove chiudo il dossier aperto
      if (!/^#\/(database|appunti)\/.+/.test(location.hash)) closeModal();
      route();
    });
    route();
  }
  boot();
})();
