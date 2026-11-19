// ============================================================
//  NIGHT CITY ARCHIVE — impostazioni, export, finestre
//  (js/ui/: i file si caricano in ordine da index.html e condividono le costanti)
// ============================================================

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
