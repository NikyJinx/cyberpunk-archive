// ============================================================
//  NIGHT CITY ARCHIVE — vita del personaggio: Wardrobe, Agent, Spese mensili
//  (js/ui/: i file si caricano in ordine da index.html e condividono le costanti)
// ============================================================
// Wardrobe: i vestiti sono oggetti dell'inventario (gear.items, cat "vestiti") con tipo, stile e «indossato»;
//           le immagini degli stili stanno in entry.wardrobe.styles = [{ name, image }].
// Agent:    entry.agent = { model, note, apps: [{ id, name, kind: "app" | "sub", cost, desc, on, target, v }] }
//           (un'app accesa con target e v dà un bonus automatico a quella STAT o abilità).
// Spese:    entry.expenses = { items: [{ id, name, type, cost, on, note }], last: { at, total } }
//           (gli abbonamenti dell'Agent si sommano da soli).

// salva subito una modifica all'intero record e ridisegna la tab aperta
async function entryPatch(id, fn, msg) {
  const e0 = state.entries.find(x => x.id === id); if (!e0 || !Store.canEdit()) return;
  const e = fn(JSON.parse(JSON.stringify(e0))); if (!e) return;
  try {
    const saved = await Store.save("entries", e);
    upsert(state.entries, saved); liveSend("entries", saved);
    refreshSheetView(id); refreshParty(); if (onTable()) { renderTokens(); renderSide(); }
    if (msg) toast(msg, "ok");
    return saved;
  } catch (err) { fail(err); }
}
// ridisegna Wardrobe, Agent o Spese se la tab è aperta (chiamata da refreshSheetView)
function refreshLifeTab(e) {
  const box = $(`#modal [data-life="${CSS.escape(e.id)}"]`); if (!box) return false;
  const y = $("#modal").scrollTop;
  box.outerHTML = lifeTabHtml(e, box.dataset.lifeTab);
  hydrate($("#modal")); $("#modal").scrollTop = y;
  return true;
}
const lifeTabHtml = (e, tab) => tab === "wardrobe" ? wardrobeHtml(e) : tab === "veicoli" ? vehiclesHtml(e) : tab === "agent" ? agentHtml(e) : expensesHtml(e);

// ---------- WARDROBE ----------
const WD_STYLES = ["Bag Lady Chic", "Gang Colors", "Generic Chic", "Bohemian", "Leisurewear", "Nomad Leathers", "Asia Pop", "Urban Flash", "Businesswear", "High Fashion"];
const WD_TYPES = [["top", "Top"], ["bottom", "Pantaloni / gonna"], ["jacket", "Giacca"], ["shoes", "Scarpe"], ["jewel", "Gioielli"], ["glasses", "Occhiali / Mirrorshades"],
  ["lenses", "Lenti a contatto"], ["hat", "Cappello"], ["accessory", "Accessorio"], ["other", "Altro"]];
const wdType = t => (WD_TYPES.find(x => x[0] === t) || [, ""])[1];
const clothesOf = e => gearItems(e).map((it, gi) => ({ it, gi })).filter(x => x.it.cat === "vestiti");
const wdStyles = e => (e.wardrobe || {}).styles || [];
const wdImg = (e, style) => (wdStyles(e).find(s => norm2(s.name) === norm2(style)) || {}).image || "";

function wardrobeHtml(e) {
  const id = esc(e.id), edit = Store.canEdit(), cl = clothesOf(e), worn = cl.filter(x => x.it.worn);
  // stili: prima quelli con l'immagine, poi quelli dei vestiti, poi «senza stile»
  const names = [...wdStyles(e).map(s => s.name), ...cl.map(x => x.it.style || "")].filter((n, i, a) => a.findIndex(y => norm2(y) === norm2(n)) === i);
  const groups = names.map(n => ({ n, list: cl.filter(x => norm2(x.it.style || "") === norm2(n)) })).filter(g => g.n || g.list.length);
  const wornStyles = [...new Set(worn.map(x => x.it.style).filter(Boolean))];
  const btn = x => !edit ? "" : `<button type="button" class="btn ghost small g-act" data-action="wd-wear" data-id="${id}" data-i="${x.gi}">${x.it.worn ? "Togli" : "👕 Indossa"}</button>`;
  return `<div class="lf-tab wd" data-life="${id}" data-life-tab="wardrobe">
    <section class="wd-now">
      <div class="wd-now-img">${wornStyles.map(s => wdImg(e, s)).filter(Boolean).slice(0, 3).map(r => imgTag(r, "Look")).join("") || `<div class="wd-ph">LOOK</div>`}</div>
      <div><h4>Indossato ora${wornStyles.length ? ` <small>· ${esc(wornStyles.join(" + "))}</small>` : ""}</h4>
        ${worn.length ? `<ul class="wd-worn">${worn.map(x => `<li><span class="wd-type">${esc(wdType(x.it.type) || "Vestito")}</span> ${esc(x.it.name)}</li>`).join("")}</ul>`
          : `<p class="hint">Niente di particolare addosso.</p>`}
        ${edit && worn.length ? `<button type="button" class="btn ghost small" data-action="wd-off-all" data-id="${id}">Togli tutto</button>` : ""}</div>
    </section>
    ${groups.length ? `<div class="wd-grid">${groups.map(g => `
      <section class="wd-style">
        <div class="wd-img">${wdImg(e, g.n) ? imgTag(wdImg(e, g.n), g.n) : `<div class="wd-ph">${esc(g.n || "—")}</div>`}</div>
        <div class="wd-body"><header><h4>${esc(g.n || "Senza stile")}</h4>${edit && g.list.length > 1 ? `<button type="button" class="btn ghost small g-act" data-action="wd-style-wear" data-id="${id}" data-style="${esc(g.n)}" title="Indossa tutti i vestiti di questo stile e togli gli altri">Indossa lo stile</button>` : ""}</header>
          ${g.list.length ? `<ul>${g.list.map(x => `<li class="${x.it.worn ? "worn" : ""}"><span class="wd-type">${esc(wdType(x.it.type) || "—")}</span>
            <span class="wd-name">${esc(x.it.name)}${num(x.it.qty) > 1 ? ` ×${num(x.it.qty)}` : ""}${x.it.note ? `<small>${esc(x.it.note)}</small>` : ""}</span>${btn(x)}</li>`).join("")}</ul>`
            : `<p class="hint">Nessun vestito di questo stile.</p>`}</div>
      </section>`).join("")}</div>`
    : `<div class="empty"><div class="big">// ARMADIO VUOTO</div>Compra i vestiti al Night Market (Oggetti con destinazione «Vestiti») o aggiungili con «Modifica wardrobe».</div>`}
  </div>`;
}
function wdWear(id, gi) {
  entryPatch(id, e => { const it = (e.gear.items || [])[gi]; if (!it) return null; it.worn = !it.worn; if (!it.worn) delete it.worn; return e; });
}
function wdStyleWear(id, style) {
  entryPatch(id, e => { (e.gear.items || []).filter(it => it.cat === "vestiti").forEach(it => { if (norm2(it.style || "") === norm2(style)) it.worn = true; else delete it.worn; }); return e; }, `Stile ${style || "senza nome"} indossato`);
}
function wdOffAll(id) { entryPatch(id, e => { (e.gear.items || []).forEach(it => { if (it.cat === "vestiti") delete it.worn; }); return e; }); }

const wdRow = (it = {}) => `<div class="sh-row wd-row">
  <input data-f="name" placeholder="Nome (es. Giacca di pelle)" value="${esc(it.name || "")}" aria-label="Nome">
  <select data-f="type" aria-label="Tipo">${WD_TYPES.map(([k, l]) => `<option value="${k}" ${(it.type || "top") === k ? "selected" : ""}>${l}</option>`).join("")}</select>
  <input data-f="style" list="dl-wd-style" placeholder="Stile" value="${esc(it.style || "")}" aria-label="Stile">
  <input data-f="qty" type="number" min="1" step="1" value="${esc(it.qty ?? 1)}" aria-label="Quantità" title="Quantità">
  <input data-f="cost" type="number" min="0" step="1" value="${esc(it.cost ?? "")}" placeholder="eb" aria-label="Costo" title="Costo (eb)">
  <input data-f="note" placeholder="Note" value="${esc(it.note || "")}" aria-label="Note">
  <input type="hidden" data-f="worn" value="${it.worn ? "1" : ""}"><input type="hidden" data-f="detail" value="${esc(it.detail || "")}">
  <button type="button" class="x" data-row-del aria-label="Rimuovi">✕</button></div>`;
let wdPick = 0;
const wdStyleRow = (s = {}) => { const k = "wdimg-" + (++wdPick); return `<div class="wd-st-row" data-pk="${k}">
  <div class="field"><label>Stile</label><input data-f="name" list="dl-wd-style" value="${esc(s.name || "")}" placeholder="es. Urban Flash"></div>
  <div class="field"><span class="lbl">Immagine dello stile</span>${imagePicker(k, s.image || "", false)}</div>
  <button type="button" class="btn ghost small danger" data-row-del-st>Rimuovi stile</button></div>`; };

function editWardrobe(id) {
  const e = state.entries.find(x => x.id === id); if (!e) return;
  openModal(`
    <form class="form" id="wd-form">
      <div class="modal-head"><h2>// WARDROBE · ${esc(e.name)}</h2><button type="button" class="x" data-action="close" aria-label="Chiudi">×</button></div>
      <div class="modal-body">
        <datalist id="dl-wd-style">${[...new Set([...WD_STYLES, ...wdStyles(e).map(s => s.name)])].map(s => `<option value="${esc(s)}">`).join("")}</datalist>
        <h3 class="sh-h">Vestiti <small>sono anche nell'Equipaggiamento · stile, tipo e quantità</small></h3>
        <div class="sh-rows" id="wd-rows">${clothesOf(e).map(x => wdRow(x.it)).join("")}</div>
        <button type="button" class="btn ghost small cyan" data-wd-add>+ Vestito</button>
        <h3 class="sh-h">Stili <small>un'immagine per ogni stile: si vede nel Wardrobe e nel look di chi lo indossa</small></h3>
        <div id="wd-styles">${wdStyles(e).map(wdStyleRow).join("")}</div>
        <button type="button" class="btn ghost small cyan" data-wd-st-add>+ Stile</button>
      </div>
      <div class="modal-foot"><button type="button" class="btn ghost" data-action="close">Annulla</button><button class="btn cyan" type="submit">Salva wardrobe</button></div>
    </form>`);
  const form = $("#wd-form");
  bindPickers(form);
  form.addEventListener("click", ev => {
    if (ev.target.closest("[data-wd-add]")) { $("#wd-rows", form).insertAdjacentHTML("beforeend", wdRow()); $("#wd-rows .wd-row:last-child input", form).focus(); }
    if (ev.target.closest("[data-wd-st-add]")) { $("#wd-styles", form).insertAdjacentHTML("beforeend", wdStyleRow()); bindPickers($("#wd-styles .wd-st-row:last-child", form)); }
    const d = ev.target.closest("[data-row-del]"); if (d) d.closest(".sh-row").remove();
    const ds = ev.target.closest("[data-row-del-st]"); if (ds) ds.closest(".wd-st-row").remove();
  });
  form.addEventListener("submit", async ev => {
    ev.preventDefault();
    const clothes = readRows(form, "#wd-rows .wd-row").filter(c => c.name).map(c => ({ cat: "vestiti", name: c.name, type: c.type, qty: Math.max(1, num(c.qty) || 1),
      ...(c.style ? { style: c.style } : {}), ...(c.cost !== "" ? { cost: num(c.cost) } : {}), ...(c.note ? { note: c.note } : {}), ...(c.detail ? { detail: c.detail } : {}), ...(c.worn ? { worn: true } : {}) }));
    try {
      const styles = [];
      for (const r of $$("#wd-styles .wd-st-row", form)) {
        const name = $("[data-f=name]", r).value.trim(), image = await commitPicker(form, r.dataset.pk, "wardrobe");
        if (name || image) styles.push({ name: name || "Stile", ...(image ? { image } : {}) });
      }
      const gear = { ...(e.gear || {}), items: [...gearItems(e).filter(it => it.cat !== "vestiti"), ...clothes] };
      const saved = await Store.save("entries", { ...e, gear, wardrobe: { ...(e.wardrobe || {}), styles } });
      upsert(state.entries, saved); liveSend("entries", saved);
      toast("Wardrobe salvato", "ok"); openEntry(saved.id, "wardrobe");
    } catch (err) { fail(err); }
  });
}

// ---------- AGENT ----------
const agentOf = e => e.agent || {};
const agentApps = e => (agentOf(e).apps || []).filter(a => a && a.name);
// bonus automatici delle app accese, nel formato dei tiri { l, v }
const agentBonus = (e, target) => agentApps(e).filter(a => a.on !== false && a.target === target && num(a.v)).map(a => ({ l: `${a.name} (Agent)`, v: num(a.v) }));

function agentHtml(e) {
  const id = esc(e.id), edit = Store.canEdit(), A = agentOf(e), apps = agentApps(e);
  const subs = apps.filter(a => a.kind === "sub" && a.on !== false), monthly = subs.reduce((t, a) => t + num(a.cost), 0);
  return `<div class="lf-tab ag" data-life="${id}" data-life-tab="agent">
    <section class="ag-dev">
      <div class="ag-ico" aria-hidden="true">▣</div>
      <div><h4>${esc(A.model || "Agent")}</h4>${A.note ? `<div class="prewrap hint">${esc(A.note)}</div>` : `<p class="hint">Lo smartphone di Night City: app, abbonamenti e servizi.</p>`}
        ${monthly ? `<p class="ag-sub">Abbonamenti: <b>${fmtEb(monthly)}</b> al mese <button type="button" class="g-src" data-action="open-entry-tab" data-id="${id}" data-tab="spese">Spese mensili ›</button></p>` : ""}</div>
    </section>
    ${apps.length ? `<div class="ag-grid">${apps.map(a => `
      <article class="ag-app ${a.on === false ? "off" : ""}">
        <header><b>${esc(a.name)}</b><span class="ag-kind ${a.kind === "sub" ? "sub" : ""}">${a.kind === "sub" ? `Abbonamento${num(a.cost) ? ` · ${fmtEb(num(a.cost))}/mese` : ""}` : "App"}</span></header>
        ${a.desc ? `<p class="prewrap">${esc(a.desc)}</p>` : ""}
        ${a.target && num(a.v) ? `<span class="bn-chip auto" title="Bonus automatico finché l'app è accesa">⚡ ${esc(bonusLabel(e, a.target))} <b>${sgn(num(a.v))}</b></span>` : ""}
        ${edit ? `<button type="button" class="btn ghost small g-act" data-action="agent-toggle" data-id="${id}" data-app="${esc(a.id)}">${a.on === false ? "▶ Accendi" : "⏸ Spegni"}</button>` : a.on === false ? `<small class="hint">spenta</small>` : ""}
      </article>`).join("")}</div>`
    : `<div class="empty"><div class="big">// NESSUNA APP</div>Aggiungi app e abbonamenti con «Modifica agent»: solo una descrizione, oppure un bonus a una STAT o abilità.</div>`}
  </div>`;
}
function agentToggle(id, appId) {
  entryPatch(id, e => { const a = ((e.agent || {}).apps || []).find(x => x.id === appId); if (!a) return null; if (a.on === false) delete a.on; else a.on = false; return e; });
}
const agRow = (e, a = {}) => `<div class="ag-row">
  <input type="hidden" data-f="id" value="${esc(a.id || "")}">
  <input data-f="name" placeholder="Nome (es. NCPD Scanner, Trauma Team app)" value="${esc(a.name || "")}" aria-label="Nome">
  <select data-f="kind" aria-label="Tipo"><option value="app" ${a.kind !== "sub" ? "selected" : ""}>App</option><option value="sub" ${a.kind === "sub" ? "selected" : ""}>Abbonamento</option></select>
  <input data-f="cost" type="number" min="0" step="1" value="${esc(a.cost ?? "")}" placeholder="eb/mese" aria-label="Costo al mese" title="Costo al mese (abbonamenti: va nelle Spese mensili)">
  <select data-f="target" aria-label="Bonus a"><option value="">nessun bonus</option>${bonusTargets(e).map(([k, l]) => `<option value="${esc(k)}" ${a.target === k ? "selected" : ""}>${esc(l)}</option>`).join("")}</select>
  <input data-f="v" type="number" step="1" value="${esc(a.v ?? "")}" placeholder="±" aria-label="Valore del bonus">
  <label class="check" title="Accesa"><input type="checkbox" data-f="on" ${a.on === false ? "" : "checked"}> accesa</label>
  <button type="button" class="x" data-row-del aria-label="Rimuovi">✕</button>
  <textarea data-f="desc" rows="2" placeholder="Descrizione / cosa fa" aria-label="Descrizione">${esc(a.desc || "")}</textarea></div>`;
function editAgent(id) {
  const e = state.entries.find(x => x.id === id); if (!e) return;
  const A = agentOf(e);
  openModal(`
    <form class="form" id="ag-form">
      <div class="modal-head"><h2>// AGENT · ${esc(e.name)}</h2><button type="button" class="x" data-action="close" aria-label="Chiudi">×</button></div>
      <div class="modal-body">
        <div class="fields">
          <div class="field"><label for="ag-model">Modello</label><input id="ag-model" name="model" value="${esc(A.model || "")}" placeholder="es. Agent Zetatech Pocket"></div>
          <div class="field full"><label for="ag-note">Note</label><textarea id="ag-note" name="note" rows="2">${esc(A.note || "")}</textarea></div>
        </div>
        <h3 class="sh-h">App e abbonamenti <small>un abbonamento con il costo va da solo nelle Spese mensili · il bonus conta finché l'app è accesa</small></h3>
        <div id="ag-rows">${agentApps(e).map(a => agRow(e, a)).join("")}</div>
        <button type="button" class="btn ghost small cyan" data-ag-add>+ App o abbonamento</button>
      </div>
      <div class="modal-foot"><button type="button" class="btn ghost" data-action="close">Annulla</button><button class="btn cyan" type="submit">Salva agent</button></div>
    </form>`);
  const form = $("#ag-form");
  form.addEventListener("click", ev => {
    if (ev.target.closest("[data-ag-add]")) { $("#ag-rows", form).insertAdjacentHTML("beforeend", agRow(e)); $("#ag-rows .ag-row:last-child [data-f=name]", form).focus(); }
    const d = ev.target.closest("[data-row-del]"); if (d) d.closest(".ag-row").remove();
  });
  form.addEventListener("submit", async ev => {
    ev.preventDefault();
    const apps = readRows(form, "#ag-rows .ag-row").filter(a => a.name).map(a => ({ id: a.id || NET.uid(), name: a.name, kind: a.kind === "sub" ? "sub" : "app",
      ...(a.cost !== "" ? { cost: num(a.cost) } : {}), ...(a.desc ? { desc: a.desc } : {}), ...(a.target && num(a.v) ? { target: a.target, v: Math.trunc(num(a.v)) } : {}), ...(a.on ? {} : { on: false }) }));
    try {
      const saved = await Store.save("entries", { ...e, agent: { model: form.elements.model.value.trim(), note: form.elements.note.value.trim(), apps } });
      upsert(state.entries, saved); liveSend("entries", saved);
      toast("Agent salvato", "ok"); openEntry(saved.id, "agent");
    } catch (err) { fail(err); }
  });
}

// ---------- SPESE MENSILI ----------
const EXP_TYPES = [["life", "Lifestyle"], ["home", "Casa / affitto"], ["trauma", "Trauma Team"], ["web", "Siti web e servizi"], ["sub", "Abbonamenti"], ["other", "Altro"]];
// costi al mese del manuale base (Lifestyle e affitti)
const EXP_PRESETS = [
  ["life", "Lifestyle: Kibble", 100], ["life", "Lifestyle: Generic Prepak", 300], ["life", "Lifestyle: Good Prepak", 600], ["life", "Lifestyle: Fresh Food", 1500],
  ["home", "Affitto: Cube Hotel", 500], ["home", "Affitto: Cargo Container", 1000], ["home", "Affitto: Studio Apartment", 1500], ["home", "Affitto: Two-Bedroom Apartment", 2500],
  ["home", "Affitto: Upscale Conapt", 7500], ["home", "Affitto: Luxury Penthouse", 15000], ["trauma", "Trauma Team Silver", 500],
];
const expItems = e => ((e.expenses || {}).items || []).filter(x => x && x.name);
// tutte le voci del mese: quelle scritte e gli abbonamenti dell'Agent
function expLines(e) {
  return [...expItems(e).map(x => ({ ...x, src: "exp" })),
    ...agentApps(e).filter(a => a.kind === "sub" && num(a.cost)).map(a => ({ id: a.id, name: a.name, type: "sub", cost: num(a.cost), on: a.on, note: a.desc ? a.desc.split("\n")[0] : "", src: "agent" }))];
}
const expTotal = e => expLines(e).filter(x => x.on !== false).reduce((t, x) => t + num(x.cost), 0);

function expensesHtml(e) {
  const id = esc(e.id), edit = Store.canEdit(), lines = expLines(e), tot = expTotal(e), money = num((e.gear || {}).money), last = (e.expenses || {}).last;
  return `<div class="lf-tab ex" data-life="${id}" data-life-tab="spese">
    <section class="ex-sum">
      <div class="cy-stat"><span class="l">Al mese</span><span class="n">${fmtEb(tot)}</span></div>
      <div class="cy-stat"><span class="l">Eddies</span><span class="n ${money < tot ? "neg" : ""}">${fmtEb(money)}</span></div>
      <div class="cy-stat"><span class="l">Ultimo pagamento</span><span class="n sm">${last ? `${esc(new Date(last.at).toLocaleDateString("it-IT"))} · ${fmtEb(num(last.total))}` : "—"}</span></div>
      ${edit && tot ? `<button type="button" class="btn cyan" data-action="exp-pay" data-id="${id}" title="Toglie le spese del mese dagli eddies (si annulla dagli Acquisti del Night Market)">💸 Paga il mese (−${fmtEb(tot)})</button>` : ""}
    </section>
    ${lines.length ? EXP_TYPES.map(([t, label]) => { const l = lines.filter(x => (x.type || "other") === t); if (!l.length) return "";
      return `<section class="ex-sec"><h4>${label} <span>${fmtEb(l.filter(x => x.on !== false).reduce((s, x) => s + num(x.cost), 0))}</span></h4><ul>${l.map(x => `
        <li class="${x.on === false ? "off" : ""}"><span class="ex-name">${esc(x.name)}${x.src === "agent" ? ` <i class="g-tag">Agent</i>` : ""}${x.note ? `<small>${esc(x.note)}</small>` : ""}</span>
          <span class="ex-cost">${fmtEb(num(x.cost))}</span>
          ${edit ? `<button type="button" class="btn ghost small g-act" data-action="${x.src === "agent" ? "agent-toggle" : "exp-toggle"}" data-id="${id}" data-app="${esc(x.id)}" title="${x.on === false ? "La rimetti nel conto del mese" : "Non la paghi questo mese (sospesa)"}">${x.on === false ? "▶ Riattiva" : "⏸ Sospendi"}</button>` : ""}</li>`).join("")}</ul></section>`; }).join("")
    : `<div class="empty"><div class="big">// NESSUNA SPESA</div>Lifestyle, affitto, Trauma Team, siti web…: aggiungili con «Modifica spese». Gli abbonamenti dell'Agent compaiono da soli.</div>`}
  </div>`;
}
function expToggle(id, xid) {
  entryPatch(id, e => { const x = ((e.expenses || {}).items || []).find(y => y.id === xid); if (!x) return null; if (x.on === false) delete x.on; else x.on = false; return e; });
}
async function expPay(id) {
  const e0 = state.entries.find(x => x.id === id); if (!e0 || !Store.canEdit()) return;
  const tot = expTotal(e0), money = num((e0.gear || {}).money); if (!tot) return;
  if (money < tot && !isGm()) return toast(`Gli eddies non bastano: servono ${fmtEb(tot)}, ne hai ${fmtEb(money)}`, "err");
  if (!(await askConfirm(`Pagare le spese del mese: −${fmtEb(tot)}? Restano ${fmtEb(money - tot)}.`, "Paga"))) return;
  const at = new Date().toISOString();
  entryPatch(id, e => {
    e.gear = e.gear || {}; e.gear.money = num(e.gear.money) - tot;
    e.gear.log = [...(e.gear.log || []), { at, id: "expenses", name: "Spese mensili", type: "expense", cost: tot, qty: 1, undo: { k: "expense" } }];
    e.expenses = { ...(e.expenses || {}), last: { at, total: tot } };
    return e;
  }, `Spese del mese pagate: −${fmtEb(tot)}`);
}
const exRow = (x = {}) => `<div class="sh-row ex-row">
  <input type="hidden" data-f="id" value="${esc(x.id || "")}">
  <select data-f="type" aria-label="Tipo">${EXP_TYPES.map(([k, l]) => `<option value="${k}" ${(x.type || "life") === k ? "selected" : ""}>${l}</option>`).join("")}</select>
  <input data-f="name" list="dl-exp" placeholder="Voce (es. Lifestyle: Good Prepak)" value="${esc(x.name || "")}" aria-label="Voce">
  <input data-f="cost" type="number" min="0" step="1" value="${esc(x.cost ?? "")}" placeholder="eb/mese" aria-label="Costo al mese">
  <input data-f="note" placeholder="Note" value="${esc(x.note || "")}" aria-label="Note">
  <label class="check" title="Attiva"><input type="checkbox" data-f="on" ${x.on === false ? "" : "checked"}> attiva</label>
  <button type="button" class="x" data-row-del aria-label="Rimuovi">✕</button></div>`;
function editExpenses(id) {
  const e = state.entries.find(x => x.id === id); if (!e) return;
  openModal(`
    <form class="form" id="ex-form">
      <div class="modal-head"><h2>// SPESE MENSILI · ${esc(e.name)}</h2><button type="button" class="x" data-action="close" aria-label="Chiudi">×</button></div>
      <div class="modal-body">
        <datalist id="dl-exp">${EXP_PRESETS.map(p => `<option value="${esc(p[1])}">${fmtEb(p[2])}</option>`).join("")}</datalist>
        <p class="hint">Scegli una voce del manuale (Lifestyle, affitti, Trauma Team Silver) per avere tipo e costo già compilati, oppure scrivine una tua (siti web, palestra, deposito…). Gli abbonamenti si gestiscono nell'Agent.</p>
        <div class="sh-rows" id="ex-rows">${expItems(e).map(exRow).join("")}</div>
        <button type="button" class="btn ghost small cyan" data-ex-add>+ Spesa</button>
      </div>
      <div class="modal-foot"><button type="button" class="btn ghost" data-action="close">Annulla</button><button class="btn cyan" type="submit">Salva spese</button></div>
    </form>`);
  const form = $("#ex-form");
  form.addEventListener("click", ev => {
    if (ev.target.closest("[data-ex-add]")) { $("#ex-rows", form).insertAdjacentHTML("beforeend", exRow()); $("#ex-rows .ex-row:last-child [data-f=name]", form).focus(); }
    const d = ev.target.closest("[data-row-del]"); if (d) d.closest(".sh-row").remove();
  });
  form.addEventListener("change", ev => {
    const n = ev.target.closest(".ex-row [data-f=name]"); if (!n) return;
    const p = EXP_PRESETS.find(x => norm2(x[1]) === norm2(n.value)), row = n.closest(".ex-row"); if (!p) return;
    $("[data-f=type]", row).value = p[0]; $("[data-f=cost]", row).value = p[2];
  });
  form.addEventListener("submit", async ev => {
    ev.preventDefault();
    const items = readRows(form, "#ex-rows .ex-row").filter(x => x.name).map(x => ({ id: x.id || NET.uid(), name: x.name, type: x.type, cost: num(x.cost), ...(x.note ? { note: x.note } : {}), ...(x.on ? {} : { on: false }) }));
    try {
      const saved = await Store.save("entries", { ...e, expenses: { ...(e.expenses || {}), items } });
      upsert(state.entries, saved); liveSend("entries", saved);
      toast("Spese salvate", "ok"); openEntry(saved.id, "spese");
    } catch (err) { fail(err); }
  });
}
