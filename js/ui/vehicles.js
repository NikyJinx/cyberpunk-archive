// ============================================================
//  NIGHT CITY ARCHIVE — tab Veicoli (veicoli comprati e Scuderia di Famiglia del Nomade)
//  (js/ui/: i file si caricano in ordine da index.html e condividono le costanti)
// ============================================================
// I veicoli sono oggetti dell'inventario (gear.items, cat "veicoli"), come i vestiti per il Wardrobe:
//   it.veh = { src: "role" | "buy", kind, active, upgrades: [{ id, src, cost }] }
//   src "role" = preso con il Garage del Nomade (conta tra le scelte del ruolo), "buy" = comprato (default).
// Le schede vecchie tenevano la scuderia nel ruolo (sheet.roles[nomad].stable): si legge da lì
// e alla prima modifica si sposta nell'inventario.

const VH_KINDS = RL.VEHICLES.flatMap(v => v.list);
const vhUpgPrice = U => U && U.g > 1 ? 5000 : 1000;      // sul libero mercato: grado 1 Molto Oneroso, gli altri Lussuosi
const vhUpg = u => typeof u === "string" ? { id: u, src: "role" } : u;
const vhInfo = it => { const v = it.veh || {}; return { src: v.src === "role" ? "role" : "buy", kind: v.kind || "", active: !!v.active, upgrades: (v.upgrades || []).map(vhUpg) }; };
const legacyStable = e => ((roleOfE(e, "nomad") || {}).stable || []);
const stableToGear = v => ({ cat: "veicoli", name: v.name || v.kind || "Veicolo", qty: 1,
  veh: { src: "role", kind: v.kind || "", active: !!v.active, upgrades: (v.upgrades || []).map(u => ({ id: u, src: "role" })) } });
// veicoli della scheda: { it, gi } (gi = indice in gear.items, null per quelli ancora nel ruolo)
const vehiclesOf = e => [...gearItems(e).map((it, gi) => ({ it, gi })).filter(x => x.it.cat === "veicoli"), ...legacyStable(e).map(v => ({ it: stableToGear(v), gi: null }))];
// scelte del Garage usate: ogni veicolo e ogni upgrade presi dal ruolo
const garageUsed = e => vehiclesOf(e).reduce((a, x) => { const V = vhInfo(x.it); return a + (V.src === "role" ? 1 : 0) + V.upgrades.filter(u => u.src === "role").length; }, 0);

// sposta la scuderia vecchia nell'inventario (su una copia del record)
function vhMigrate(e) {
  const r = ((e.sheet || {}).roles || []).find(x => x.id === "nomad");
  e.gear = e.gear || {}; e.gear.items = e.gear.items || [];
  if (r && (r.stable || []).length) e.gear.items.push(...r.stable.map(stableToGear));
  if (r) delete r.stable;
  return e;
}
// modifica di un veicolo: fn(it, e) sul veicolo numero k della lista (dopo la migrazione)
function vhPatch(id, k, fn, msg) {
  return entryPatch(id, e => { vhMigrate(e); const list = e.gear.items.filter(it => it.cat === "veicoli"), it = list[k]; if (!it) return null;
    it.veh = { src: "buy", upgrades: [], ...(it.veh || {}) }; it.veh.upgrades = (it.veh.upgrades || []).map(vhUpg);
    return fn(it, e) === false ? null : e; }, msg);
}

function vehiclesHtml(e) {
  const id = esc(e.id), edit = Store.canEdit(), list = vehiclesOf(e), rank = roleRankOf(e, "nomad"), nomad = !!roleOfE(e, "nomad");
  const used = garageUsed(e), kinds = RL.vehiclesFor(rank);
  const srcBtn = (k, src, j) => {
    const lab = src === "role" ? "🏕 dal ruolo" : "💰 comprato", tip = src === "role" ? "Preso con il Garage del Nomade: conta tra le scelte del ruolo" : "Comprato: non conta tra le scelte del Garage";
    return edit && nomad ? `<button type="button" class="vh-src ${src}" data-action="vh-src" data-id="${id}" data-k="${k}" ${j != null ? `data-j="${j}"` : ""} title="${tip} · clic per cambiare">${lab}</button>`
      : `<span class="vh-src ${src}" title="${tip}">${lab}</span>`;
  };
  const card = (x, k) => {
    const V = vhInfo(x.it), it = x.it;
    const upgOpts = src => RL.NOMAD_UPGRADES.filter(u => (src !== "role" || u.g <= Math.max(1, rank)) && (u.multi || !V.upgrades.some(y => y.id === u.id)))
      .map(u => `<option value="${src}:${u.id}">[${u.g}] ${esc(u.name)} · ${esc(u.on)}${src === "pay" ? ` · ${fmtEb(vhUpgPrice(u))}` : ""}</option>`).join("");
    return `<section class="vh-card ${V.active ? "on" : ""}">
      <header class="vh-h">
        ${edit ? `<label class="check" title="Il veicolo che stai usando"><input type="checkbox" data-vh-f="active" data-id="${id}" data-k="${k}" ${V.active ? "checked" : ""}> in uso</label>` : V.active ? `<span class="vh-on">in uso</span>` : ""}
        ${edit ? `<input class="vh-name" data-vh-f="name" data-id="${id}" data-k="${k}" value="${esc(it.name || "")}" placeholder="Nome o modello" aria-label="Nome del veicolo">` : `<h4>${esc(it.name || V.kind || "Veicolo")}</h4>`}
        ${srcBtn(k, V.src)}
        ${edit ? `<button type="button" class="gp-btn del" data-action="vh-del" data-id="${id}" data-k="${k}" title="Togli il veicolo" aria-label="Togli il veicolo">✕</button>` : ""}
      </header>
      <div class="vh-meta">
        ${edit ? `<label>Tipo <input data-vh-f="kind" data-id="${id}" data-k="${k}" list="dl-vh-kind" value="${esc(V.kind)}" placeholder="es. Supermoto"></label>` : V.kind ? `<span>${esc(V.kind)}</span>` : ""}
        ${V.src === "role" && V.kind && !kinds.includes(V.kind) && VH_KINDS.includes(V.kind) ? `<span class="vh-warn">serve Garage ${(RL.VEHICLES.find(v => v.list.includes(V.kind)) || {}).min}</span>` : ""}
        ${it.cost ? `<span class="hint">pagato ${fmtEb(it.cost)}</span>` : ""}
        ${it.detail ? `<span class="hint">${esc(it.detail)}</span>` : ""}${it.note ? `<span class="hint">${esc(it.note)}</span>` : ""}
      </div>
      <div class="st-chips">${V.upgrades.map((u, j) => { const U = RL.upgradeById(u.id) || { name: u.id, eff: "" };
        return `<span class="st-chip vh-upg ${u.src}" title="${esc(U.eff)}">${esc(U.name)} ${srcBtn(k, u.src, j)}${edit ? `<button type="button" class="gp-btn del" data-action="vh-upg-del" data-id="${id}" data-k="${k}" data-j="${j}" title="Togli l'upgrade" aria-label="Togli l'upgrade">✕</button>` : ""}</span>`; }).join("")}
        ${edit ? `<select class="st-add" data-vh-upg data-id="${id}" data-k="${k}" aria-label="Aggiungi un upgrade"><option value="">+ upgrade…</option>
          ${nomad ? `<optgroup label="Dal ruolo (Garage ${rank})">${upgOpts("role")}</optgroup>` : ""}<optgroup label="Comprato ora (scala gli eddies)">${upgOpts("pay")}</optgroup><optgroup label="Già comprato (senza pagare)">${upgOpts("buy")}</optgroup></select>` : ""}
        ${!V.upgrades.length && !edit ? `<span class="hint">Nessun upgrade.</span>` : ""}</div>
    </section>`;
  };
  return `<div class="lf-tab vh" data-life="${id}" data-life-tab="veicoli">
    <datalist id="dl-vh-kind">${VH_KINDS.map(k => `<option value="${esc(k)}">`).join("")}</datalist>
    ${nomad ? `<div class="en-budget ${used > rank ? "over" : ""}">Garage ${rank}: <b>${used}</b> / ${rank} scelte dal ruolo · veicoli sbloccati: ${esc(kinds.join(", "))}</div>
      <p class="hint">A ogni grado (e per ogni punto di partenza) un veicolo nuovo o un upgrade della Famiglia. Usi un veicolo alla volta${rank >= 10 ? " (a grado 10 tutti insieme)" : ""}; se è distrutto la Famiglia lo ripara in una settimana per 500 E$. I veicoli e gli upgrade «comprati» non contano tra le scelte.</p>`
      : `<p class="hint">Veicoli comprati al Night Market o scritti a mano. Gli upgrade si comprano sul libero mercato: grado 1 Molto Onerosi (1.000 E$), gli altri Lussuosi (5.000 E$).</p>`}
    ${list.length ? `<div class="vh-list">${list.map(card).join("")}</div>` : `<div class="empty"><div class="big">// GARAGE VUOTO</div>Compra un veicolo al Night Market (Oggetti con destinazione «Veicoli»)${nomad ? " o prendine uno dalla Famiglia" : ""}.</div>`}
    ${edit ? `<div class="vh-add">
      <input data-vh-new="name" placeholder="Nome o modello" aria-label="Nome del nuovo veicolo">
      <input data-vh-new="kind" list="dl-vh-kind" placeholder="Tipo (es. Motocicletta)" aria-label="Tipo del nuovo veicolo">
      ${nomad ? `<button type="button" class="btn ghost small cyan" data-action="vh-add" data-id="${id}" data-src="role">+ Dal ruolo</button>` : ""}
      <button type="button" class="btn ghost small" data-action="vh-add" data-id="${id}" data-src="buy">+ Comprato</button></div>` : ""}
  </div>`;
}

// ---------- azioni ----------
async function vhAdd(id, src) {
  const e = state.entries.find(x => x.id === id), box = $(`#modal [data-life="${CSS.escape(id)}"]`); if (!e || !box || !Store.canEdit()) return;
  const name = $("[data-vh-new=name]", box).value.trim(), kind = $("[data-vh-new=kind]", box).value.trim();
  if (!name && !kind) return toast("Scrivi il nome o il tipo del veicolo", "err");
  if (src === "role") {
    const rank = roleRankOf(e, "nomad");
    if (kind && VH_KINDS.includes(kind) && !RL.vehiclesFor(rank).includes(kind) && !(await askConfirm(`${kind} si sblocca a un grado di Garage più alto (ora ${rank}). Aggiungerlo comunque?`, "Aggiungi"))) return;
    if (garageUsed(e) >= rank && !(await askConfirm(`Le scelte del Garage sono finite (${garageUsed(e)}/${rank}). Aggiungerlo comunque?`, "Aggiungi"))) return;
  }
  entryPatch(id, x => { vhMigrate(x);
    const first = !x.gear.items.some(it => it.cat === "veicoli");
    x.gear.items.push({ cat: "veicoli", name: name || kind, qty: 1, veh: { src, kind, active: first, upgrades: [] } }); return x; }, `${name || kind} nel garage`);
}
async function vhDel(id, k) {
  const e = state.entries.find(x => x.id === id), x = e && vehiclesOf(e)[k]; if (!x) return;
  if (!(await askConfirm(`Togliere ${x.it.name || "il veicolo"} con i suoi upgrade?`, "Togli"))) return;
  entryPatch(id, r => { vhMigrate(r); const it = r.gear.items.filter(i => i.cat === "veicoli")[k]; if (!it) return null; r.gear.items.splice(r.gear.items.indexOf(it), 1); return r; });
}
// cambia comprato ↔ dal ruolo (del veicolo o, con j, di un upgrade)
function vhSrc(id, k, j) {
  vhPatch(id, k, it => { const o = j == null ? it.veh : it.veh.upgrades[j]; if (!o) return false; o.src = o.src === "role" ? "buy" : "role"; });
}
function vhField(el) {
  const id = el.dataset.id, k = num(el.dataset.k), f = el.dataset.vhF, e = state.entries.find(x => x.id === id);
  if (!e || !Store.canEdit()) return;
  const multi = roleRankOf(e, "nomad") >= 10;     // a Garage 10 si usano tutti insieme
  vhPatch(id, k, (it, r) => {
    if (f === "name") it.name = el.value.trim() || it.veh.kind || "Veicolo";
    if (f === "kind") it.veh.kind = el.value.trim();
    if (f === "active") { if (el.checked && !multi) r.gear.items.forEach(x => { if (x.cat === "veicoli" && x.veh) x.veh.active = false; }); it.veh.active = el.checked; }
  });
}
async function vhUpgAdd(el) {
  const id = el.dataset.id, k = num(el.dataset.k), [src, uid] = String(el.value).split(":"), e = state.entries.find(x => x.id === id);
  el.value = ""; if (!e || !uid || !Store.canEdit()) return;
  const U = RL.upgradeById(uid), rank = roleRankOf(e, "nomad");
  if (src === "role" && garageUsed(e) >= rank && !(await askConfirm(`Le scelte del Garage sono finite (${garageUsed(e)}/${rank}). Aggiungere l'upgrade comunque?`, "Aggiungi"))) return;
  const paid = src === "pay" ? vhUpgPrice(U) : 0;
  if (paid && !(await askConfirm(`Comprare ${U.name} per ${fmtEb(paid)}? ${e.name} ha ${fmtEb(moneyOf(e))}.`, "Paga"))) return;
  vhPatch(id, k, (it, r) => { it.veh.upgrades.push({ id: uid, src: src === "role" ? "role" : "buy", ...(paid ? { cost: paid } : {}) }); if (paid) r.gear.money = num(r.gear.money) - paid; },
    `${U.name} montato${paid ? ` (−${fmtEb(paid)})` : ""}`);
}
function vhUpgDel(id, k, j) { vhPatch(id, k, it => { if (!it.veh.upgrades[j]) return false; it.veh.upgrades.splice(j, 1); }); }
