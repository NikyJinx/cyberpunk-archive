// ============================================================
//  NIGHT CITY ARCHIVE — area GM
//  (js/ui/: i file si caricano in ordine da index.html e condividono le costanti)
// ============================================================

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
