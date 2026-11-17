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
  const kindOf = id => KINDS.find(k => k.id === id) || KINDS[0];
  const statusOf = id => STATUSES.find(s => s.id === id);

  // ---------- stato ----------
  const state = {
    entries: [], songs: [], site: null,
    filter: { q: "", kind: "all", faction: "", status: "", sort: "name" },
  };
  try { Object.assign(state.filter, JSON.parse(localStorage.getItem("nc-filter") || "{}"), { q: "" }); } catch {}
  const saveFilter = () => { try { localStorage.setItem("nc-filter", JSON.stringify(state.filter)); } catch {} };

  const site = () => ({ title: CFG.title || "NIGHT CITY ARCHIVE", tagline: CFG.tagline || "", intro: "", ...(state.site || {}) });

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
      const max = 1100, scale = Math.min(1, max / Math.max(bmp.width, bmp.height));
      if (scale === 1 && file.size < 400 * 1024) return file;
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

  const factionEntry = name => state.entries.find(e => e.kind === "fazione" && norm(e.name) === norm(name));
  const factions = () => {
    const set = new Map();
    for (const e of state.entries) {
      if (e.faction) set.set(norm(e.faction), e.faction.trim());
      if (e.kind === "fazione" && e.name) set.set(norm(e.name), e.name.trim());
    }
    return [...set.values()].sort((a, b) => a.localeCompare(b, "it"));
  };

  // ---------- dati ----------
  async function loadAll() {
    const [entries, songs, meta] = await Promise.all([Store.list("entries"), Store.list("songs"), Store.list("meta")]);
    state.entries = entries; state.songs = songs;
    state.site = meta.find(m => m.id === "site") || null;
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
    $("#footer-status").textContent = `${state.entries.length} record · ${state.songs.length} tracce`;
  }

  // ---------- routing ----------
  function route() {
    const [page = "home", id] = location.hash.replace(/^#\/?/, "").split("/");
    $$("#nav a").forEach(a => a.classList.toggle("active", a.dataset.route === page));
    const app = $("#app");
    if (page === "database") app.innerHTML = viewDatabase();
    else if (page === "tracce") app.innerHTML = viewSongs();
    else app.innerHTML = viewHome();
    hydrate(app);
    bindPage(page);
    if (page === "database" && id) openEntry(id);
    renderChrome();
  }

  // ---------- HOME ----------
  function viewHome() {
    const s = site();
    const npcs = state.entries.filter(e => e.kind === "npc");
    const recent = [...state.entries].sort((a, b) => (b.updatedAt || "").localeCompare(a.updatedAt || "")).slice(0, 6);
    const songs = [...state.songs].sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || "")).slice(0, 3);
    return `
      <section class="hero">
        <h1 class="glitch" data-text="${esc(s.title)}">${esc(s.title)}</h1>
        ${s.tagline ? `<p class="tagline">${esc(s.tagline)}</p>` : ""}
        ${s.intro ? `<p class="intro">${esc(s.intro)}</p>` : ""}
        <div class="cta">
          <a class="btn" href="#/database">Apri il database</a>
          <a class="btn cyan ghost" href="#/tracce">Ascolta le tracce</a>
        </div>
      </section>
      <section class="stats">
        <div class="stat" style="--c:var(--cyan)"><div class="n">${npcs.length}</div><div class="l">NPC schedati</div></div>
        <div class="stat" style="--c:var(--red)"><div class="n">${factions().length}</div><div class="l">Fazioni note</div></div>
        <div class="stat" style="--c:var(--yellow)"><div class="n">${state.entries.filter(e => e.kind === "luogo").length}</div><div class="l">Luoghi</div></div>
        <div class="stat" style="--c:var(--magenta)"><div class="n">${state.songs.length}</div><div class="l">Tracce</div></div>
        <div class="stat" style="--c:var(--muted)"><div class="n">${npcs.filter(e => e.status === "morto").length}</div><div class="l">Flatlined</div></div>
      </section>
      <div class="section-title"><h2>Ultimi aggiornamenti</h2><a class="see-all" href="#/database">tutto il database →</a></div>
      ${recent.length ? `<div class="grid">${recent.map(cardEntry).join("")}</div>` : emptyDb()}
      ${songs.length ? `
        <div class="section-title" style="margin-top:34px"><h2>Ultime tracce</h2><a class="see-all" href="#/tracce">tutte le tracce →</a></div>
        <div class="tracks">${songs.map((s, i) => cardSong(s, i)).join("")}</div>` : ""}
    `;
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
    const k = kindOf(e.kind), st = statusOf(e.status);
    return `
      <button class="card ${e.status === "morto" ? "is-dead" : ""}" data-action="open-entry" data-id="${esc(e.id)}">
        <div class="card-img">
          ${e.image ? imgTag(e.image, e.name) : `<div class="noimg"><span>NO SIGNAL</span></div>`}
          <span class="kind-tag" style="--k:${k.color}">${esc(k.label)}</span>
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

  // ---------- dettaglio ----------
  function openEntry(id) {
    const e = state.entries.find(x => x.id === id);
    if (!e) return;
    const k = kindOf(e.kind), st = statusOf(e.status);
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
    openModal(`
      <div class="modal-head"><h2>// DOSSIER · ${esc(k.label)}</h2><button class="x" data-action="close" aria-label="Chiudi">×</button></div>
      <div class="modal-body">
        <div class="dossier">
          <div class="dossier-img">${e.image ? `<img data-ref="${esc(e.image)}" alt="${esc(e.name)}" data-action="zoom">` : `<div class="noimg"><span>NO SIGNAL</span></div>`}</div>
          <div>
            <h1>${esc(e.name || "Senza nome")}</h1>
            ${e.handle ? `<div class="handle">“${esc(e.handle)}”</div>` : ""}
            <dl class="facts">${facts.map(([a, b]) => `<dt>${a}</dt><dd>${b}</dd>`).join("")}</dl>
            ${(e.tags || []).length ? `<div class="meta">${e.tags.map(t => `<span class="badge tag">#${esc(t)}</span>`).join("")}</div>` : ""}
            ${e.description ? `<div class="block"><h4>Descrizione</h4><div class="prewrap">${esc(e.description)}</div></div>` : ""}
            ${e.notes ? `<div class="block"><h4>Note</h4><div class="prewrap">${esc(e.notes)}</div></div>` : ""}
            ${members.length ? `<div class="block"><h4>Membri noti (${members.length})</h4><div class="members">
              ${members.map(m => `<button class="member" data-action="open-entry" data-id="${esc(m.id)}">${m.image ? imgTag(m.image) : `<span class="ph"></span>`}${esc(m.name)}</button>`).join("")}
            </div></div>` : ""}
          </div>
        </div>
      </div>
      ${Store.canEdit() ? `<div class="modal-foot">
        <button class="btn ghost small left" data-action="delete-entry" data-id="${esc(e.id)}">Elimina</button>
        <button class="btn cyan" data-action="edit-entry" data-id="${esc(e.id)}">Modifica</button>
      </div>` : ""}
    `);
    if (location.hash !== "#/database/" + e.id && location.hash.startsWith("#/database")) history.replaceState(null, "", "#/database/" + e.id);
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

  function editEntry(id) {
    const e = state.entries.find(x => x.id === id) || { kind: state.filter.kind !== "all" ? state.filter.kind : "npc", status: "vivo", custom: [] };
    openModal(`
      <form class="form" id="entry-form">
        <div class="modal-head"><h2>${e.id ? "// MODIFICA RECORD" : "// NUOVO RECORD"}</h2><button type="button" class="x" data-action="close" aria-label="Chiudi">×</button></div>
        <div class="modal-body">
          <div class="form-grid">
            ${imagePicker("image", e.image)}
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
          <datalist id="dl-fac">${factions().map(x => `<option value="${esc(x)}">`).join("")}</datalist>
          <datalist id="dl-role">${ROLES.map(x => `<option value="${esc(x)}">`).join("")}</datalist>
          <datalist id="dl-att">${ATTITUDES.map(x => `<option value="${esc(x)}">`).join("")}</datalist>
          <datalist id="dl-loc">${[...new Set(state.entries.map(x => x.kind === "luogo" ? x.name : x.location).filter(Boolean))].map(x => `<option value="${esc(x)}">`).join("")}</datalist>
        </div>
        <div class="modal-foot">
          <button type="button" class="btn ghost small left" data-action="close">Annulla</button>
          <button type="submit" class="btn">Salva record</button>
        </div>
      </form>
    `);
    bindPickers($("#modal"));
    $("#entry-form").addEventListener("submit", async ev => {
      ev.preventDefault();
      const form = ev.target, btn = $("button[type=submit]", form);
      btn.disabled = true; btn.textContent = "Salvataggio…";
      try {
        const fd = new FormData(form);
        const rec = {
          ...e,
          name: fd.get("name").trim(), handle: fd.get("handle").trim(), kind: fd.get("kind"),
          faction: fd.get("faction").trim(), role: fd.get("role").trim(), status: fd.get("status"),
          attitude: fd.get("attitude").trim(), location: fd.get("location").trim(),
          tags: fd.get("tags").split(",").map(t => t.trim()).filter(Boolean),
          description: fd.get("description").trim(), notes: fd.get("notes").trim(),
          custom: $$(".cf-row", form).map(r => ({ k: $("[data-cf-k]", r).value.trim(), v: $("[data-cf-v]", r).value.trim() })).filter(c => c.k || c.v),
          image: await commitPicker(form, "image", "images"),
        };
        const saved = await Store.save("entries", rec);
        const i = state.entries.findIndex(x => x.id === saved.id);
        if (i >= 0) state.entries[i] = saved; else state.entries.push(saved);
        toast("Record salvato", "ok");
        closeModal();
        route();
        if (location.hash.startsWith("#/database")) openEntry(saved.id);
      } catch (err) { fail(err); btn.disabled = false; btn.textContent = "Salva record"; }
    });
  }

  // ---------- picker file (immagini / audio) ----------
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

  // ---------- TRACCE ----------
  function viewSongs() {
    const list = [...state.songs].sort((a, b) => (a.order ?? 1e9) - (b.order ?? 1e9) || (a.createdAt || "").localeCompare(b.createdAt || ""));
    return `
      <div class="page-head">
        <div><div class="kicker">// PIRATE_RADIO 98.7</div><h1>Tracce</h1><p>Le canzoni create per la campagna — file locali e link Suno.</p></div>
        ${Store.canEdit() ? `<button class="btn" data-action="new-song">+ Nuova traccia</button>` : ""}
      </div>
      ${list.length ? `<div class="tracks">${list.map(cardSong).join("")}</div>` :
        `<div class="empty"><div class="big">// RADIO SILENCE</div>Nessuna traccia ancora.
          ${Store.canEdit() ? `<br><button class="btn" data-action="new-song">+ Aggiungi la prima traccia</button>` : ""}</div>`}`;
  }

  function cardSong(s, i) {
    const embed = sunoEmbed(s.suno);
    return `
      <article class="track" data-num="TRK ${String(i + 1).padStart(2, "0")}" data-song="${esc(s.id)}">
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
          suno: fd.get("suno").trim(), lyrics: fd.get("lyrics").trim(), notes: fd.get("notes").trim(),
          cover: await commitPicker(form, "cover", "covers"),
          audio: await commitPicker(form, "audio", "audio"),
        };
        const saved = await Store.save("songs", rec);
        const i = state.songs.findIndex(x => x.id === saved.id);
        if (i >= 0) state.songs[i] = saved; else state.songs.push(saved);
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
            <div class="field full"><label for="st-intro">Introduzione</label><textarea id="st-intro" name="intro" rows="4" placeholder="Due righe sulla campagna, il gruppo, l'anno…">${esc(s.intro)}</textarea></div>
            <div class="field full"><button class="btn small" type="submit">Salva</button></div>
          </div>
        </form>` : ""}
        <div class="settings-sec">
          <h3>Backup</h3>
          <p>Scarica tutto (record, tracce${cloud ? "" : ", immagini e audio caricati"}) in un file JSON, o reimportalo.</p>
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
      try {
        state.site = await Store.save("meta", { ...(state.site || {}), id: "site", title: fd.get("title").trim() || "NIGHT CITY ARCHIVE", tagline: fd.get("tagline").trim(), intro: fd.get("intro").trim() });
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
      const data = await Store.exportAll(["entries", "songs", "meta"]);
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
    $("#modal").innerHTML = "";
    if (/^#\/database\/.+/.test(location.hash)) history.replaceState(null, "", "#/database");
  });
  $("#modal").addEventListener("click", ev => { if (ev.target === ev.currentTarget) closeModal(); });

  // ---------- eventi pagina ----------
  function bindPage(page) {
    if (page !== "database") return;
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
      case "delete-entry": {
        const e = state.entries.find(x => x.id === id);
        if (!e || !confirm(`Eliminare definitivamente "${e.name}"? Non si può annullare.`)) return;
        try { await Store.remove("entries", e); state.entries = state.entries.filter(x => x.id !== id); closeModal(); route(); toast("Record eliminato"); } catch (err) { fail(err); }
        break;
      }
      case "new-song": editSong(null); break;
      case "edit-song": editSong(id); break;
      case "delete-song": {
        const s = state.songs.find(x => x.id === id);
        if (!s || !confirm(`Eliminare definitivamente "${s.title}"? Non si può annullare.`)) return;
        try { await Store.remove("songs", s); state.songs = state.songs.filter(x => x.id !== id); closeModal(); route(); toast("Traccia eliminata"); } catch (err) { fail(err); }
        break;
      }
      case "toggle-suno": {
        const box = $(".suno-embed", el.closest(".track"));
        if (box.hidden) { box.innerHTML = `<iframe src="${esc(el.dataset.embed)}" loading="lazy" allow="autoplay; encrypted-media" title="Player Suno"></iframe>`; box.hidden = false; el.textContent = "■ Chiudi player"; }
        else { box.innerHTML = ""; box.hidden = true; el.textContent = "▶ Player Suno"; }
        break;
      }
      case "zoom": {
        const lb = document.createElement("div");
        lb.className = "lightbox"; lb.innerHTML = `<img src="${esc(el.src)}" alt="">`;
        lb.addEventListener("click", () => lb.remove());
        ($("#modal").open ? $("#modal") : document.body).appendChild(lb);
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
    window.addEventListener("hashchange", route);
    route();
  }
  boot();
})();
