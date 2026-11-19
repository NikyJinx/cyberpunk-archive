// ============================================================
//  NIGHT CITY ARCHIVE — avvio del sito
//  (js/ui/: i file si caricano in ordine da index.html e condividono le costanti)
// ============================================================

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
