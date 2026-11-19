// ============================================================
//  NIGHT CITY ARCHIVE — dossier, galleria, modulo dei record
//  (js/ui/: i file si caricano in ordine da index.html e condividono le costanti)
// ============================================================

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
      </div>` : ""}`, false, { entry: { id: e.id, tab } });
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
  `, false, isPerson(e) ? { entry: { id: e.id, tab: "dossier" } } : {});
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
