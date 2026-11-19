// ============================================================
//  NIGHT CITY ARCHIVE — appunti
//  (js/ui/: i file si caricano in ordine da index.html e condividono le costanti)
// ============================================================

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
