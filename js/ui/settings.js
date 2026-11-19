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
// opts.entry = { id, tab }: è la scheda di un personaggio, che si può spostare, ridimensionare,
// sganciare dalla pagina (la pagina dietro resta usabile) o aprire in una finestra a parte
function openModal(html, narrow = false, opts = {}) {
  const m = $("#modal"), keepY = opts.entry && m.dataset.entry === opts.entry.id ? m.scrollTop : 0;
  closeLightbox();
  m.className = "modal" + (narrow ? " narrow" : "");
  m.removeAttribute("style"); delete m.dataset.entry; delete m.dataset.tab;
  m.innerHTML = html;
  hydrate(m);
  const free = !!opts.entry && !POP && canFloat() && ls.get("nc-win-free", false);
  // le altre finestre (moduli, conferme…) bloccano sempre la pagina dietro
  if (m.open && m.matches(":modal") === free) { m.close(); }
  if (!m.open) free ? m.show() : m.showModal();
  if (opts.entry) winSetup(m, opts.entry, free);
  $$(".dossier-tabs", m).forEach(tabScroller);
  m.scrollTop = keepY;
  placeDrawer();
}
function closeModal() {
  const m = $("#modal");
  // nella finestra esterna: dai moduli torno alla scheda, dalla scheda chiudo la finestra
  if (POP) { if (m.dataset.entry) window.close(); else openEntry(POP, ls.get("nc-pop-tab", "sheet")); return; }
  if (m.open) m.close();
}

// ---------- tab della scheda che non entrano in larghezza: frecce ‹ ›, rotellina, tab attiva sempre in vista ----------
function tabScroller(bar) {
  if (bar.parentElement.classList.contains("tabs-wrap")) return;
  const wrap = document.createElement("div"); wrap.className = "tabs-wrap";
  bar.before(wrap); wrap.append(bar);
  wrap.insertAdjacentHTML("afterbegin", `<button type="button" class="tabs-arrow l" aria-label="Tab precedenti" tabindex="-1">‹</button>`);
  wrap.insertAdjacentHTML("beforeend", `<button type="button" class="tabs-arrow r" aria-label="Tab successive" tabindex="-1">›</button>`);
  const upd = () => {
    const max = bar.scrollWidth - bar.clientWidth;
    wrap.classList.toggle("can-l", bar.scrollLeft > 2);
    wrap.classList.toggle("can-r", bar.scrollLeft < max - 2);
  };
  const step = d => bar.scrollBy({ left: d * Math.max(120, bar.clientWidth * 0.6), behavior: "smooth" });
  $(".tabs-arrow.l", wrap).addEventListener("click", () => step(-1));
  $(".tabs-arrow.r", wrap).addEventListener("click", () => step(1));
  bar.addEventListener("scroll", upd, { passive: true });
  // rotellina verticale = scorrimento orizzontale, solo se c'è qualcosa da scorrere
  bar.addEventListener("wheel", ev => {
    if (bar.scrollWidth <= bar.clientWidth || Math.abs(ev.deltaX) > Math.abs(ev.deltaY)) return;
    ev.preventDefault(); bar.scrollBy({ left: ev.deltaY, behavior: "instant" });
  }, { passive: false });
  if ("ResizeObserver" in window) new ResizeObserver(upd).observe(bar);
  const act = $("button.active", bar);
  if (act) { bar.style.scrollBehavior = "auto"; bar.scrollLeft = act.offsetLeft - (bar.clientWidth - act.offsetWidth) / 2; bar.style.scrollBehavior = ""; }
  upd();
}

// ---------- finestra della scheda ----------
const POP = new URLSearchParams(location.search).get("pop");   // finestra esterna: ?pop=<id della scheda>
const canFloat = () => innerWidth >= 760;
const winGeo = () => ls.get("nc-win", null);                    // { x, y, w, h } ricordati su questo dispositivo
function winSetup(m, en, free) {
  m.dataset.entry = en.id; m.dataset.tab = en.tab;
  const x = $(".modal-head .x", m);
  if (POP) {
    m.classList.add("popwin"); ls.set("nc-pop-tab", en.tab);
    const e = state.entries.find(z => z.id === en.id); if (e) document.title = `${e.name} · ${site().title}`;
    return;
  }
  if (!canFloat()) return;
  m.classList.add("floating"); m.classList.toggle("free", free);
  x && x.insertAdjacentHTML("beforebegin", `<div class="win-btns">
    ${winGeo() ? `<button type="button" class="win-btn" data-win="reset" title="Rimetti la finestra al centro, con la misura normale">⟲</button>` : ""}
    <button type="button" class="win-btn ${free ? "on" : ""}" data-win="free" title="${free ? "Blocca la pagina dietro la scheda" : "Sgancia: la scheda resta aperta e puoi usare la pagina dietro (mappa, dice log…)"}">${free ? "📌" : "⇱"}</button>
    <button type="button" class="win-btn" data-win="pop" title="Apri la scheda in una finestra a parte">⧉</button></div>`);
  const g = winGeo();
  if (g) {
    if (g.w) m.style.width = Math.min(g.w, innerWidth - 8) + "px";
    if (g.h) m.style.height = Math.min(g.h, innerHeight - 8) + "px";
    if (g.x != null) winMove(m, g.x, g.y);
  } else if (free) winMove(m, (innerWidth - m.offsetWidth) / 2, 24);
}
function winMove(m, x, y) {
  const w = m.offsetWidth;
  m.style.margin = "0"; m.style.inset = "auto";
  m.style.left = clamp(Math.round(x), Math.min(0, 120 - w), innerWidth - 120) + "px";
  m.style.top = clamp(Math.round(y), 0, innerHeight - 48) + "px";
}
function winSave(patch) { ls.set("nc-win", { ...(winGeo() || {}), ...patch }); }
// trascinare dalla barra in alto
let winDrag = null, winSize = null;
$("#modal").addEventListener("pointerdown", ev => {
  const m = $("#modal"); if (!m.classList.contains("floating")) return;
  if (ev.target === m) { winSize = { w: m.offsetWidth, h: m.offsetHeight }; return; }   // maniglia di ridimensionamento
  const head = ev.target.closest(".modal-head");
  if (!head || ev.target.closest("button, a, input, select, textarea") || ev.button !== 0) return;
  const r = m.getBoundingClientRect();
  winDrag = { dx: ev.clientX - r.left, dy: ev.clientY - r.top, id: ev.pointerId };
  head.setPointerCapture(ev.pointerId); m.classList.add("dragging"); ev.preventDefault();
});
$("#modal").addEventListener("pointermove", ev => { if (winDrag && ev.pointerId === winDrag.id) winMove($("#modal"), ev.clientX - winDrag.dx, ev.clientY - winDrag.dy); });
document.addEventListener("pointerup", () => {
  const m = $("#modal");
  if (winDrag) { winDrag = null; m.classList.remove("dragging"); const r = m.getBoundingClientRect(); winSave({ x: r.left, y: r.top }); refreshWinBtns(); }
  if (winSize) {
    const w = m.offsetWidth, h = m.offsetHeight;
    if (Math.abs(w - winSize.w) > 2 || Math.abs(h - winSize.h) > 2) { const r = m.getBoundingClientRect(); winSave({ w, h, x: r.left, y: r.top }); refreshWinBtns(); }
    winSize = null;
  }
});
$("#modal").addEventListener("dblclick", ev => { if (ev.target.closest(".modal-head") && !ev.target.closest("button") && $("#modal").classList.contains("floating")) winReset(); });
const refreshWinBtns = () => { const m = $("#modal"); if (m.dataset.entry && !$("[data-win=reset]", m)) openEntry(m.dataset.entry, m.dataset.tab); };
function winReset() { localStorage.removeItem("nc-win"); const m = $("#modal"); if (m.dataset.entry) openEntry(m.dataset.entry, m.dataset.tab); }
$("#modal").addEventListener("click", ev => {
  const b = ev.target.closest("[data-win]"); if (!b) return;
  const m = $("#modal"), id = m.dataset.entry, tab = m.dataset.tab; if (!id) return;
  if (b.dataset.win === "reset") return winReset();
  if (b.dataset.win === "free") { ls.set("nc-win-free", !ls.get("nc-win-free", false)); return openEntry(id, tab); }
  if (b.dataset.win === "pop") {
    ls.set("nc-pop-tab", tab);
    const w = window.open(`${location.pathname}?pop=${encodeURIComponent(id)}#/pg`, "nc-pg-" + id, "popup,width=1000,height=900");
    if (!w) return toast("Il browser ha bloccato la finestra: permetti i pop-up per questo sito", "err");
    closeModal();
  }
});
// se cambia la finestra del browser, la scheda resta dentro lo schermo
window.addEventListener("resize", () => { const m = $("#modal"); if (m.classList.contains("floating") && m.style.left) winMove(m, parseFloat(m.style.left), parseFloat(m.style.top)); });

$("#modal").addEventListener("close", () => {
  if ($("#modal").open) return; // riaperto prima che l'evento arrivasse
  closeLightbox();
  $("#modal").innerHTML = "";
  placeDrawer();
  const r = /^#\/(database|appunti)\/.+/.exec(location.hash);
  if (r) history.replaceState(null, "", "#/" + r[1]);
});
$("#modal").addEventListener("cancel", ev => { if (lightbox) { ev.preventDefault(); closeLightbox(); } });
$("#modal").addEventListener("click", ev => {
  if (ev.target !== ev.currentTarget || POP) return;
  const r = ev.currentTarget.getBoundingClientRect();
  if (ev.clientX < r.left || ev.clientX > r.right || ev.clientY < r.top || ev.clientY > r.bottom) closeModal();
});
