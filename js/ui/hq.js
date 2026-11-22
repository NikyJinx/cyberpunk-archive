// ============================================================
//  NIGHT CITY ARCHIVE — pagina HQ: piani, migliorie, HQ IP
//  (js/ui/: i file si caricano in ordine da index.html e condividono le costanti)
// ============================================================

// ---------- HQ della crew ----------
// meta "hq" = { name, place, notes, lost (accesso perso), ip, log[{ at, kind: earn|buy|lost, amount, why, imp, from, to }],
//              owned{ id: livello }, floors[{ id, name, image, notes }], items[] (migliorie custom o modificate) }
// Livello: 0 = non comprata, 1 = comprata, 1 + n = n upgrade.
const hqRec = () => state.hq || { id: "hq", name: "", ip: 0, log: [], owned: {}, floors: [], items: [] };
const hqLvl = (H, id) => num((H.owned || {})[id]);
let hqFloor = ls.get("nc-hq-floor", "");
async function hqSave(fn, msg, full = false) {
  if (!Store.canEdit()) return;
  const H = JSON.parse(JSON.stringify(hqRec()));
  if (fn(H) === false) return;
  try {
    const saved = await Store.save("meta", { ...H, id: "hq" });
    state.hq = saved; HQ.setHomebrew(saved.items); liveSend("meta", saved);
    if (msg) toast(msg, "ok");
    // HQ IP e migliorie si ridisegnano da soli: la piantina non si ricarica e la pagina non salta
    if (location.hash.startsWith("#/hq")) full || !$("#hq-imps") ? route() : hqRefresh();
  } catch (err) { fail(err); }
}

function hqRefresh() {
  const H = hqRec(), edit = Store.canEdit(), a = $("#hq-ipbox"), b = $("#hq-imps");
  if (a) a.innerHTML = hqIpHtml(H, edit);
  if (b) b.innerHTML = hqImpsHtml(H, edit);
}
function viewHq() {
  const H = hqRec(), edit = Store.canEdit();
  const floors = H.floors || [], cur = floors.find(f => f.id === hqFloor) || floors[0];
  return `
    <div class="page-head">
      <div><div class="kicker">// SAFEHOUSE</div><h1>${esc(H.name || "Headquarters")}</h1>
        <p>${H.place ? `${esc(H.place)} · ` : ""}La base della crew: piani, migliorie e HQ IP. La crew riceve tanti HQ IP quanti IP riceve dalla colonna Group dopo una missione. Spendere HQ IP è una decisione di squadra.</p></div>
      <div class="row-btns">${edit ? `<button type="button" class="btn ghost small" data-action="hq-edit">✎ Modifica HQ</button>` : ""}</div>
    </div>
    ${H.lost ? `<div class="hq-lost">⚠ La crew ha perso l'accesso all'HQ: i benefici delle migliorie sono sospesi finché non lo riprende. Se l'HQ viene distrutto, si ricomincia da zero.</div>` : ""}
    ${H.notes ? `<p class="hq-notes">${esc(H.notes)}</p>` : ""}

    <div id="hq-ipbox">${hqIpHtml(H, edit)}</div>

    <h3 class="sh-h">Piani della base ${edit ? `<button type="button" class="btn ghost small cyan" data-action="hq-floor">+ Piano</button>` : ""}</h3>
    ${floors.length ? `<div class="chips hq-floors">${floors.map(f => `<button type="button" class="chip ${cur && f.id === cur.id ? "active" : ""}" data-action="hq-floor-go" data-id="${esc(f.id)}">${esc(f.name || "Piano")}</button>`).join("")}</div>
      <div class="hq-floor">
        ${cur.image ? `<a class="hq-floor-img" data-action="hq-floor-zoom" data-id="${esc(cur.id)}" title="Apri a tutto schermo"><img data-ref="${esc(cur.image)}" alt="${esc(cur.name || "Piano")}"></a>` : `<div class="empty"><div class="big">// NESSUNA PIANTINA</div>${edit ? "Aggiungi l'immagine del piano con «Modifica piano»." : ""}</div>`}
        ${cur.notes ? `<p class="prewrap">${esc(cur.notes)}</p>` : ""}
        ${edit ? `<div class="row-btns"><button type="button" class="btn ghost small" data-action="hq-floor" data-id="${esc(cur.id)}">✎ Modifica piano</button>
          ${cur.image && gmTools() ? `<button type="button" class="btn ghost small cyan" data-action="hq-floor-map" data-id="${esc(cur.id)}" title="Crea una mappa tattica con questa piantina (nascosta ai giocatori finché non la mostri)">🗺 Apri sulla Mappa</button>` : ""}</div>` : ""}
      </div>` : `<div class="empty"><div class="big">// NESSUN PIANO</div>${edit ? `Aggiungi i piani della base con le loro piantine.` : ""}</div>`}

    <div id="hq-imps">${hqImpsHtml(H, edit)}</div>`;
}
function hqImpsHtml(H, edit) {
  const owned = HQ.all().filter(it => hqLvl(H, it.id));
  return `
    <h3 class="sh-h">Migliorie dell'HQ <small>${owned.length ? `${owned.length} comprate` : "nessuna"}</small></h3>
    ${owned.length ? `<div class="gl-wrap"><table class="gl-t hq-t hq-own ${H.lost ? "off" : ""}">
      <thead><tr><th>Miglioria</th><th>Livello</th><th>Cosa dà alla crew</th><th>Prossimo</th></tr></thead>
      <tbody>${owned.map(it => hqOwnRow(H, it, edit)).join("")}</tbody></table></div>`
      : `<p class="hint">La crew non ha ancora migliorie: comprale dalla tabella qui sotto con gli HQ IP.</p>`}

    <h3 class="sh-h">Tutte le migliorie ${edit ? `<button type="button" class="btn small yellow" data-action="hq-item">★ + Miglioria custom</button>` : ""}</h3>
    <div class="gl-wrap"><table class="gl-t hq-t ${H.lost ? "off" : ""}">
      <thead><tr><th>Miglioria</th><th>Effetto</th><th>Upgrade</th><th>Livello</th><th>Prossimo</th></tr></thead>
      <tbody>${HQ.all().map(it => hqRow(H, it, edit)).join("")}</tbody></table></div>
    <p class="hint">Ogni miglioria si compra una volta e si potenzia una volta, salvo indicazione (Morale Boost fino a 10, Rent Reduction finché i letti non raddoppiano). ✎ modifica una miglioria (anche quelle base: si possono ripristinare).</p>`;
}
function hqIpHtml(H, edit) {
  const log = H.log || [], owned = HQ.all().filter(it => hqLvl(H, it.id));
  return `<section class="hq-ip">
      <div class="hq-ip-n"><span class="l">HQ IP</span><b>${num(H.ip)}</b></div>
      <div class="hq-ip-sum"><span>${owned.length} migliorie</span><span>${owned.reduce((t, it) => t + hqLvl(H, it.id) - 1, 0)} upgrade</span></div>
      ${edit ? `<form class="hq-earn" data-hq-earn><input name="n" type="number" min="1" step="1" placeholder="HQ IP" aria-label="HQ IP da aggiungere" required>
        <input name="why" placeholder="Motivo (es. missione al porto)" aria-label="Motivo"><button type="submit" class="btn small">+ Aggiungi</button></form>` : ""}
      <div class="row-btns"><button type="button" class="btn ghost small" data-action="hq-log">Storico${log.length ? ` (${log.length})` : ""}</button>
        ${edit && log.length ? `<button type="button" class="btn ghost small danger" data-action="hq-undo">Annulla l'ultimo</button>` : ""}</div>
    </section>
`;
}
function hqRow(H, it, edit) {
  const lvl = hqLvl(H, it.id), max = HQ.maxLevel(it), cost = HQ.nextCost(it, lvl), id = esc(it.id);
  const can = edit && cost != null && num(H.ip) >= cost;
  const state0 = !lvl ? `<span class="hq-st no">non comprata</span>` : lvl === 1 ? `<span class="hq-st ok">comprata</span>` : `<span class="hq-st up">upgrade ${lvl - 1}${max > 2 ? `/${max - 1}` : ""}</span>`;
  const levels = (it.levels || []).length ? `<details class="hq-lv"><summary>Benefici degli upgrade (${it.levels.length})</summary><ol>${it.levels.map((l, i) => `<li class="${lvl - 1 > i ? "got" : ""}">${esc(l)}</li>`).join("")}</ol></details>` : "";
  return `<tr class="${lvl ? "own" : ""}">
    <td><b>${it.custom ? "★ " : ""}${esc(it.name)}</b>${edit ? ` <button type="button" class="gp-btn" data-action="hq-item" data-id="${id}" aria-label="Modifica" title="${it.custom ? "Modifica" : "Modifica (diventa custom, si può ripristinare)"}">✎</button>` : ""}${it.roles ? `<small>${esc(it.roles)}</small>` : ""}</td>
    <td>${esc(it.eff || "")}</td>
    <td>${esc(it.up || "")}${levels}</td>
    <td class="gl-n">${state0}${lvl && edit ? `<button type="button" class="hq-lose" data-action="hq-lose" data-id="${id}" title="Persa (distrutta o rubata): torna non comprata, gli HQ IP non tornano">✕ persa</button>` : ""}</td>
    <td class="gl-n">${cost == null ? `<span class="hint">al massimo</span>` : `${edit ? `<button type="button" class="btn small ${can ? "" : "ghost"}" data-action="hq-buy" data-id="${id}" ${can ? "" : `title="Servono ${cost} HQ IP"`}>${lvl ? "Upgrade" : "Compra"}</button>` : ""}<small>${cost} HQ IP</small>`}</td>
  </tr>`;
}

// riga delle migliorie comprate: quello che dà al livello attuale (effetto, upgrade, benefici raggiunti)
function hqOwnRow(H, it, edit) {
  const lvl = hqLvl(H, it.id), max = HQ.maxLevel(it), cost = HQ.nextCost(it, lvl), id = esc(it.id), ups = lvl - 1;
  const can = edit && cost != null && num(H.ip) >= cost;
  const lv = it.levels || [];
  const gives = [`<p>${esc(it.eff || "")}</p>`];
  if (ups && lv.length) gives.push(`<ol class="hq-got">${lv.slice(0, ups).map(l => `<li>${esc(l)}</li>`).join("")}</ol>`);
  else if (ups && it.up) gives.push(`<p class="hq-upg"><b>Upgrade${ups > 1 ? ` ×${ups}` : ""}:</b> ${esc(it.up)}</p>`);
  return `<tr>
    <td><b>${it.custom ? "★ " : ""}${esc(it.name)}</b>${it.roles ? `<small>${esc(it.roles)}</small>` : ""}</td>
    <td class="gl-n">${ups ? `<span class="hq-st up">upgrade ${ups}${max > 2 ? `/${max - 1}` : ""}</span>` : `<span class="hq-st ok">comprata</span>`}${edit ? `<button type="button" class="hq-lose" data-action="hq-lose" data-id="${id}" title="Persa (distrutta o rubata): torna non comprata, gli HQ IP non tornano">✕ persa</button>` : ""}</td>
    <td>${gives.join("")}</td>
    <td class="gl-n">${cost == null ? `<span class="hint">al massimo</span>` : `${edit ? `<button type="button" class="btn small ${can ? "" : "ghost"}" data-action="hq-buy" data-id="${id}" ${can ? "" : `title="Servono ${cost} HQ IP"`}>Upgrade</button>` : ""}<small>${cost} HQ IP</small>`}</td>
  </tr>`;
}

// ---------- azioni ----------
function hqBuy(id) {
  const H = hqRec(), it = HQ.byId(id); if (!it) return;
  const lvl = hqLvl(H, id), cost = HQ.nextCost(it, lvl);
  if (cost == null) return;
  if (num(H.ip) < cost) return toast(`Servono ${cost} HQ IP (ne avete ${num(H.ip)})`, "err");
  hqSave(h => {
    h.owned = h.owned || {}; h.owned[id] = lvl + 1; h.ip = num(h.ip) - cost;
    h.log = [...(h.log || []), { at: new Date().toISOString(), kind: "buy", amount: cost, imp: id, why: it.name, from: lvl, to: lvl + 1 }];
  }, `${it.name}: ${lvl ? `upgrade ${lvl}` : "comprata"} (−${cost} HQ IP)`);
}
async function hqLose(id) {
  const H = hqRec(), it = HQ.byId(id), lvl = hqLvl(H, id); if (!it || !lvl) return;
  if (!(await askConfirm(`«${it.name}» è persa (distrutta, rubata…)? Torna non comprata con i suoi upgrade e gli HQ IP spesi non tornano.`, "Persa"))) return;
  hqSave(h => { delete h.owned[id]; h.log = [...(h.log || []), { at: new Date().toISOString(), kind: "lost", amount: 0, imp: id, why: it.name, from: lvl, to: 0 }]; }, `${it.name} persa`);
}
function hqEarn(form) {
  const n = Math.trunc(num(form.elements.n.value)), why = form.elements.why.value.trim(); if (n <= 0) return;
  hqSave(h => { h.ip = num(h.ip) + n; h.log = [...(h.log || []), { at: new Date().toISOString(), kind: "earn", amount: n, why }]; }, `+${n} HQ IP`);
}
async function hqUndo() {
  const H = hqRec(), last = (H.log || []).slice(-1)[0]; if (!last) return;
  const what = last.kind === "earn" ? `+${last.amount} HQ IP${last.why ? ` (${last.why})` : ""}` : last.kind === "buy" ? `l'acquisto di ${last.why}` : `la perdita di ${last.why}`;
  if (!(await askConfirm(`Annullare ${what}?`, "Annulla"))) return;
  hqSave(h => {
    const l = h.log.pop();
    if (l.kind === "earn") h.ip = num(h.ip) - l.amount;
    else { h.owned = h.owned || {}; if (l.from) h.owned[l.imp] = l.from; else delete h.owned[l.imp]; if (l.kind === "buy") h.ip = num(h.ip) + l.amount; }
  }, "Annullato");
}
function hqLog() {
  const log = [...(hqRec().log || [])].reverse();
  const txt = l => l.kind === "earn" ? `<b>+${l.amount} HQ IP</b>${l.why ? ` · ${esc(l.why)}` : ""}` : l.kind === "buy" ? `<b>${esc(l.why)}</b> ${l.from ? `upgrade ${l.from}` : "comprata"} · −${l.amount} HQ IP` : `<b>${esc(l.why)}</b> persa`;
  openModal(`<div class="form">
    <div class="modal-head"><h2>// STORICO HQ IP</h2><button type="button" class="x" data-action="close" aria-label="Chiudi">×</button></div>
    <div class="modal-body">${log.length ? `<ul class="mk-log">${log.map(l => `<li><span class="d">${esc(new Date(l.at).toLocaleDateString("it-IT"))}</span><span>${txt(l)}</span></li>`).join("")}</ul>` : `<p class="hint">Nessun movimento.</p>`}</div>
    <div class="modal-foot"><button type="button" class="btn" data-action="close">Chiudi</button></div></div>`, true);
}
function hqEdit() {
  const H = hqRec();
  openModal(`<form class="form" id="hq-form">
    <div class="modal-head"><h2>// HQ</h2><button type="button" class="x" data-action="close" aria-label="Chiudi">×</button></div>
    <div class="modal-body"><div class="fields">
      <div class="field full"><label>Nome dell'HQ</label><input name="name" value="${esc(H.name || "")}" placeholder="es. Mighty Mighty Manor"></div>
      <div class="field full"><label>Dove / che spazio è</label><input name="place" value="${esc(H.place || "")}" placeholder="es. appartamento a due camere a Watson, in affitto"></div>
      <div class="field full"><label>Note (affitto, chi ci vive, accessi…)</label><textarea name="notes" rows="3">${esc(H.notes || "")}</textarea></div>
      <div class="field full"><label class="check"><input type="checkbox" name="lost" ${H.lost ? "checked" : ""}> La crew ha perso l'accesso all'HQ (benefici sospesi)</label></div>
      <div class="field"><label>HQ IP</label><input name="ip" type="number" step="1" value="${num(H.ip)}"><span class="hint">Per correggere a mano; di solito si usano «+ Aggiungi» e gli acquisti.</span></div>
    </div></div>
    <div class="modal-foot"><button type="button" class="btn ghost small left" data-action="close">Annulla</button><button type="submit" class="btn">Salva</button></div></form>`, true);
  $("#hq-form").addEventListener("submit", ev => {
    ev.preventDefault(); const E = ev.target.elements;
    hqSave(h => { h.name = E.name.value.trim(); h.place = E.place.value.trim(); h.notes = E.notes.value.trim(); h.lost = E.lost.checked; h.ip = Math.trunc(num(E.ip.value)); }, "HQ salvato", true).then(closeModal);
  });
}
// piani: nome, piantina, note
function hqFloorEdit(id) {
  const H = hqRec(), f = (H.floors || []).find(x => x.id === id) || {};
  openModal(`<form class="form" id="hqf-form">
    <div class="modal-head"><h2>// ${f.id ? "MODIFICA PIANO" : "NUOVO PIANO"}</h2><button type="button" class="x" data-action="close" aria-label="Chiudi">×</button></div>
    <div class="modal-body"><div class="fields">
      <div class="field full"><label class="req">Nome</label><input name="name" required value="${esc(f.name || "")}" placeholder="es. Piano terra, Seminterrato, Tetto"></div>
      <div class="field full"><span class="lbl">Piantina</span>${imagePicker("image", f.image, false)}</div>
      <div class="field full"><label>Note (stanze, ingressi, trappole…)</label><textarea name="notes" rows="4">${esc(f.notes || "")}</textarea></div>
    </div></div>
    <div class="modal-foot">
      ${f.id ? `<button type="button" class="btn ghost small left danger" data-hqf-del>Elimina piano</button>` : `<button type="button" class="btn ghost small left" data-action="close">Annulla</button>`}
      ${f.id && (H.floors || []).length > 1 ? `<button type="button" class="btn ghost small" data-hqf-move="-1" title="Sposta prima">↑</button><button type="button" class="btn ghost small" data-hqf-move="1" title="Sposta dopo">↓</button>` : ""}
      <button type="submit" class="btn">Salva</button></div></form>`);
  const form = $("#hqf-form");
  bindPickers(form);
  form.addEventListener("submit", async ev => {
    ev.preventDefault();
    try {
      const image = await commitPicker(form, "image", "hq"), fid = f.id || NET.uid();
      const rec = { id: fid, name: form.elements.name.value.trim(), image, notes: form.elements.notes.value.trim() };
      hqFloor = fid; ls.set("nc-hq-floor", fid);
      await hqSave(h => { h.floors = h.floors || []; const i = h.floors.findIndex(x => x.id === fid); if (i >= 0) h.floors[i] = rec; else h.floors.push(rec); }, "Piano salvato", true);
      closeModal();
    } catch (err) { fail(err); }
  });
  const del = $("[data-hqf-del]", form);
  del && del.addEventListener("click", async () => {
    if (!(await askConfirm(`Eliminare il piano «${f.name}»?`))) return;
    await hqSave(h => { h.floors = (h.floors || []).filter(x => x.id !== f.id); }, "Piano eliminato", true); closeModal();
  });
  $$("[data-hqf-move]", form).forEach(b => b.addEventListener("click", async () => {
    const d = num(b.dataset.hqfMove);
    await hqSave(h => { const i = h.floors.findIndex(x => x.id === f.id), j = i + d; if (i < 0 || j < 0 || j >= h.floors.length) return false; [h.floors[i], h.floors[j]] = [h.floors[j], h.floors[i]]; }, "", true);
    closeModal();
  }));
}
// una mappa tattica con la piantina del piano (nascosta ai giocatori finché il GM non la mostra)
async function hqFloorMap(id) {
  const f = (hqRec().floors || []).find(x => x.id === id); if (!f || !f.image || !gmTools()) return;
  try {
    const saved = await saveRec("maps", { name: `${hqRec().name || "HQ"} · ${f.name || "Piano"}`, image: f.image, cols: 24, rows: 16, grid: true, hidden: isGm() && Store.gmReady });
    tt.view = saved.id; location.hash = "#/mappa";
    toast("Mappa creata: regola caselle e immagine dal layer Map", "ok");
  } catch (err) { fail(err); }
}

// ---------- migliorie custom e modifiche ----------
function hqItemEdit(id) {
  if (!Store.canEdit()) return;
  const it = id ? HQ.byId(id) || {} : {}, base = HQ.BASE.some(b => b.id === id);
  openModal(`<form class="form" id="hqi-form">
    <div class="modal-head"><h2>// ★ ${it.id ? "MODIFICA MIGLIORIA" : "MIGLIORIA CUSTOM"}</h2><button type="button" class="x" data-action="close" aria-label="Chiudi">×</button></div>
    <div class="modal-body">${base ? `<p class="hint">È una miglioria del manuale: salvando diventa custom e sostituisce l'originale, che puoi ripristinare.</p>` : ""}<div class="fields">
      <div class="field full"><label class="req">Nome</label><input name="name" required value="${esc(it.name || "")}"></div>
      <div class="field"><label>Costo (HQ IP)</label><input name="cost" type="number" min="0" value="${esc(it.cost ?? 40)}"></div>
      <div class="field"><label>Costo dell'upgrade (HQ IP)</label><input name="upCost" type="number" min="0" value="${esc(it.upCost ?? 40)}"></div>
      <div class="field"><label>Upgrade massimi</label><input name="maxUp" type="number" min="0" max="20" value="${esc(it.maxUp ?? 1)}"></div>
      <div class="field"><label>Chi ne beneficia</label><input name="roles" value="${esc(it.roles || "")}" placeholder="es. Tutti, Solo"></div>
      <div class="field full"><label>Effetto</label><textarea name="eff" rows="3">${esc(it.eff || "")}</textarea></div>
      <div class="field full"><label>Effetto dell'upgrade</label><textarea name="up" rows="3">${esc(it.up || "")}</textarea></div>
      <div class="field full"><label>Benefici upgrade per upgrade <small>facoltativo, uno per riga (come il Morale Boost)</small></label><textarea name="levels" rows="4">${esc((it.levels || []).join("\n"))}</textarea></div>
    </div></div>
    <div class="modal-foot">${it.custom ? `<button type="button" class="btn ghost small left danger" data-hqi-del>${base ? "Ripristina l'originale" : "Elimina"}</button>` : `<button type="button" class="btn ghost small left" data-action="close">Annulla</button>`}<button type="submit" class="btn">Salva</button></div></form>`);
  const form = $("#hqi-form");
  form.addEventListener("submit", async ev => {
    ev.preventDefault(); const E = form.elements;
    const rec = { id: it.id || "hq-" + NET.uid(), name: E.name.value.trim(), cost: num(E.cost.value), upCost: num(E.upCost.value), maxUp: Math.max(0, Math.trunc(num(E.maxUp.value))),
      roles: E.roles.value.trim(), eff: E.eff.value.trim(), up: E.up.value.trim(), levels: E.levels.value.split("\n").map(x => x.trim()).filter(Boolean) };
    await hqSave(h => { h.items = h.items || []; const i = h.items.findIndex(x => x.id === rec.id); if (i >= 0) h.items[i] = rec; else h.items.push(rec); }, `★ ${rec.name} salvata`);
    closeModal();
  });
  const del = $("[data-hqi-del]", form);
  del && del.addEventListener("click", async () => {
    if (!(await askConfirm(`${base ? "Ripristinare l'originale di" : "Eliminare"} «${it.name}»?${!base && hqLvl(hqRec(), it.id) ? " La crew la possiede: sparirà anche dalle migliorie comprate." : ""}`, base ? "Ripristina" : "Elimina"))) return;
    await hqSave(h => { h.items = (h.items || []).filter(x => x.id !== it.id); if (!base && h.owned) delete h.owned[it.id]; }, "Fatto"); closeModal();
  });
}

document.addEventListener("submit", ev => { if (ev.target.matches && ev.target.matches("[data-hq-earn]")) { ev.preventDefault(); hqEarn(ev.target); } });
