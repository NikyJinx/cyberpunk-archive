// ============================================================
//  NIGHT CITY ARCHIVE — tracce musicali
//  (js/ui/: i file si caricano in ordine da index.html e condividono le costanti)
// ============================================================

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
