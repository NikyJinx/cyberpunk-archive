// ============================================================
//  NIGHT CITY ARCHIVE — Cyberdeck: tab, tiri, editor
//  (js/ui/: i file si caricano in ordine da index.html e condividono le costanti)
// ============================================================

// ---------- CYBERDECK (Netrunner) ----------
// sheet.deck = { name, slots, bodyweight, cyberarm, items[{ ref, …campi del personalizzato, cur (REZ attuale), on (Rezzato), used, dead }] }
// Lo stesso riquadro serve alle schede dei PG (con lo stato della Netrun) e ai nemici Netrunner (solo tiri).
const decksOf = e => { const s = sheetOf(e); return Array.isArray(s.decks) ? s.decks : s.deck ? [s.deck] : []; };
const deckIdx = e => clamp(num(sheetOf(e).deckActive), 0, Math.max(0, decksOf(e).length - 1));
const activeDeck = e => decksOf(e)[deckIdx(e)] || { name: "Cyberdeck", slots: 7, items: [] };
// nel salvataggio porto le schede vecchie (deck singolo) all'elenco
const migrateDecks = s => { if (!Array.isArray(s.decks)) s.decks = s.deck ? [s.deck] : []; delete s.deck; s.deckActive = clamp(num(s.deckActive), 0, Math.max(0, s.decks.length - 1)); return s; };
const isNetrunner = e => /netrunner/i.test((e && e.role) || "") || /^(interface|interfaccia)$/i.test(String(sheetOf(e).ability || "").trim())
  || rolesOf(e).some(r => r.id === "netrunner") || decksOf(e).some(d => (d.items || []).length);
const ifaceOf = e => roleOfE(e, "netrunner") ? roleRankOf(e, "netrunner") : num(sheetOf(e).rank);
const clsTag = I => I.hw ? "Hardware" : I.ice ? `Black ICE · ${(NET.CLASSES[I.cls] || {}).short || ""}` : (NET.CLASSES[I.cls] || {}).label || "";
const vsOf = I => I.cls === "antiprogram" ? "vs DEF + 1d10 di un programma o Black ICE" : "vs Interface + 1d10 del Netrunner";

// o = { iface, roll(what) → attributi del pulsante, adj(i, op) → attributi (null = sola lettura), reset → attributi }
function deckHtml(deck, o) {
  deck = deck || { items: [] };
  const S = NET.deckSlots(deck), B = NET.boosts(deck), items = deck.items || [];
  const bsum = k => (B[k] || []).reduce((t, b) => t + b.v, 0);
  const btn = (what, inner, cls = "chip", title = "") => `<button type="button" class="${cls}" ${o.roll(what)} ${title ? `title="${esc(title)}"` : ""}>${inner}</button>`;
  const ad = (i, op, inner, title, cls = "gp-btn") => `<button type="button" class="${cls}" ${o.adj(i, op)} title="${esc(title)}" aria-label="${esc(title)}">${inner}</button>`;
  const abil = NET.ABILITIES.map(a => btn("ab:" + a.id, `${esc(a.name)} <b>${o.iface + bsum(a.id)}</b>`, a.attack ? "chip r" : "chip",
    `${a.name}: Interface${bsum(a.id) ? " + boost" : ""} + 1d10 · ${a.eff}`) + (a.dmg ? btn(`ab:${a.id}:dmg`, esc(a.dmg[0].x), "chip y", `Danno dello ${a.name}`) : "")).join("");
  const rows = items.map((it, i) => {
    const I = NET.itemInfo(it), cur = NET.curRez(it, I), rezzable = NET.hasRez(I), off = !I.ice && NET.offensive(I.cls);
    const stats = I.hw ? `${I.slots} slot` : I.ice ? `PER ${I.per} · SPD ${I.spd} · ATK ${I.atk} · DEF ${I.def} · REZ ${cur}/${I.rez} · ${I.slots} slot`
      : `ATK ${I.atk} · DEF ${I.def} · REZ ${rezzable ? `${cur}/` : ""}${I.rez}`;
    let acts = "";
    if (!I.hw && !it.dead) {
      if (I.ice || off) acts += btn(`it:${i}:atk`, `Attack <b>${I.ice ? I.atk : o.iface + I.atk}</b>`, "btn small", I.ice ? `ATK ${I.atk} + 1d10 · ${vsOf(I)}` : `Interface ${o.iface} + ATK ${I.atk} + 1d10 · ${vsOf(I)}`);
      (I.dmg || []).forEach((d, j) => { acts += btn(`it:${i}:dmg:${j}`, `${esc(d.x)}${d.u === "REZ" ? " REZ" : ""} <small>${esc(d.l)}</small>`, "btn small yellow", `${I.name}: ${d.x} ${d.l}`); });
      if ((I.fx || []).length) acts += btn(`it:${i}:fx`, `Effect <small>${esc(I.fx.map(f => f.x).join(" / "))}</small>`, "btn small yellow", I.eff);
      else if (!(I.dmg || []).length && (off || I.ice)) acts += btn(`it:${i}:fx`, "Effect", "btn small yellow", I.eff);
      if (rezzable && (I.ice || I.def > 0)) acts += btn(`it:${i}:def`, `DEF <b>${I.def}</b>`, "btn small ghost cyan", "Difesa: DEF + 1d10 contro un attacco");
    }
    let ctl = "";
    if (o.adj && !I.hw) {
      if (rezzable && !it.dead) ctl += ad(i, "on", it.on ? "◉ Rezzed" : "○ Rez", it.on ? "Disattiva (Azione NET)" : "Attiva (Azione NET)", `btn small ghost cyan nd-tog ${it.on ? "on" : ""}`);
      if (rezzable && !it.dead) ctl += `<span class="sh-adj">${ad(i, "rez:-1", "−1", "−1 REZ")}${ad(i, "rez:1", "+1", "+1 REZ")}</span>${rezIn(sg => o.adj(i, "rez:in" + sg))}`;
      if (I.once) ctl += ad(i, "used", it.used ? "✓ usato" : "1×", it.used ? "Già usato in questa Netrun: clicca per annullare" : "Una volta per Netrun: segna come usato", `btn small ghost ${it.used ? "yellow" : ""}`);
      ctl += ad(i, "dead", it.dead ? "↺" : "✕", it.dead ? "Ripristina (non più Distrutto)" : "Segna come Distrutto", "gp-btn del");
    }
    const st = [rezzable && it.on && !it.dead ? "on" : "", it.dead ? "dead" : "", rezzable && cur <= 0 ? "derez" : ""].join(" ");
    return `<div class="wpn nd-item ${I.hw ? "hw" : I.ice ? "ice" : esc(I.cls)} ${st}">
      <span class="wpn-n"><span class="nd-name">${esc(I.label)} <span class="nd-cls">${esc(clsTag(I))}</span>${it.used ? ` <span class="nd-cls used">usato</span>` : ""}${it.dead ? ` <span class="nd-cls dead">distrutto</span>` : rezzable && cur <= 0 ? ` <span class="nd-cls dead">derezzato</span>` : ""}</span>
        <small>${stats}</small>${rezzable ? `<span class="sp-bar nd-bar" title="REZ ${cur} / ${I.rez}"><i style="width:${I.rez ? cur / I.rez * 100 : 0}%"></i></span>` : ""}${I.eff ? `<em>${esc(I.eff)}</em>` : ""}</span>
      ${acts || ctl ? `<span class="nd-acts">${acts}${ctl}</span>` : ""}
    </div>`;
  }).join("");
  const boostTxt = Object.entries(B).map(([k, l]) => `${k === "speed" ? "Speed" : (NET.ABILITIES.find(a => a.id === k) || {}).name} +${l.reduce((t, b) => t + b.v, 0)}`).join(" · ");
  return `<div class="nd">
    <div class="sh-sec-head"><h4>Cyberdeck</h4>
      <span class="hint">${esc(deck.name || "Cyberdeck")} · Slot <b class="${S.over ? "pen" : ""}">${S.used}</b> / ${S.total} · Interface <b>${o.iface}</b> · <b>${CPR.netActions(o.iface)}</b> NET Actions${boostTxt ? ` · Rezzed: ${esc(boostTxt)}` : ""}${deck.note ? `<em class="nd-note">${esc(deck.note)}</em>` : ""}</span>
      ${o.reset ? `<button type="button" class="btn ghost small" ${o.reset} title="Nuova Netrun: REZ piena, tutto disattivato, «una volta per Netrun» di nuovo disponibili">↺ Nuova Netrun</button>` : ""}</div>
    <div class="pc-rolls nd-abil">${btn("def", `Defense <b>${o.iface}</b>`, "chip y", "Interface + 1d10 contro un attacco NET")}${btn("speed", `Speed <b>${o.iface + bsum("speed")}</b>`, "chip y", "Agguato: Interface + bonus + 1d10 vs VEL + 1d10 del Black ICE")}${abil}</div>
    ${items.length ? `<div class="sh-weapons nd-list">${rows}</div>` : `<p class="hint">Deck vuoto: aggiungi programmi, Black ICE e hardware da «Modifica scheda».</p>`}
  </div>`;
}

// campo REZ a mano: attrs(segno) = attributi del pulsante; l'op finisce con ":in-" o ":in+" e il valore lo legge rezOp
const rezIn = attrs => `<span class="rez-in"><input type="number" min="1" max="999" inputmode="numeric" placeholder="REZ" aria-label="REZ da togliere o ridare">` +
  `<button type="button" class="gp-btn rez-minus" ${attrs("-")} title="Togli i REZ scritti (Invio)" aria-label="Togli i REZ scritti">−</button>` +
  `<button type="button" class="gp-btn" ${attrs("+")} title="Ridai i REZ scritti" aria-label="Ridai i REZ scritti">+</button></span>`;
const rezOp = (el, op) => {
  const m = String(op || "").match(/^(.*):in([+-])$/); if (!m) return op;
  const inp = el.closest(".rez-in") && $("input", el.closest(".rez-in")), v = Math.abs(Math.trunc(num(inp && inp.value)));
  if (!v) { if (inp) inp.focus(); toast("Scrivi quanti REZ togliere o ridare", "err"); return null; }
  return `${m[1]}:${m[2] === "-" ? -v : v}`;
};
// Invio nel campo = togli
document.addEventListener("keydown", ev => {
  if (ev.key !== "Enter" || !ev.target.closest || !ev.target.closest(".rez-in input")) return;
  ev.preventDefault(); const b = $(".rez-minus", ev.target.closest(".rez-in")); if (b) b.click();
});

function deckTabHtml(e) {
  const id = esc(e.id), edit = Store.canEdit(), decks = decksOf(e), cur = deckIdx(e);
  return `<div class="nd-tab" data-deck-tab="${id}">
    <div class="sh-bar"><label class="sh-mod" title="Modificatore situazionale aggiunto ai tiri">MOD <input type="number" step="1" data-sheet-mod value="${sheetMod}"></label>
      <span class="hint">Interface = Rank della Role Ability (${ifaceOf(e)}) · clicca un programma per tirare.</span>
      <button type="button" class="btn ghost small cyan" data-action="dice-open">⬢ Dice log</button></div>
    ${decks.length > 1 ? `<div class="chips nd-decks"><span class="lbl">Deck in uso</span>${decks.map((d, i) => `<button type="button" class="chip ${i === cur ? "active" : ""}" ${edit ? `data-action="deck-adj" data-id="${id}" data-i="${i}" data-op="active"` : "disabled"}>${esc(d.name || `Cyberdeck ${i + 1}`)}</button>`).join("")}</div>` : ""}
    ${decks.length ? deckHtml(activeDeck(e), { iface: ifaceOf(e), roll: w => `data-action="sheet-roll" data-id="${id}" data-roll="deck:${w}"`,
      adj: edit ? (i, op) => `data-action="deck-adj" data-id="${id}" data-i="${i}" data-op="${op}"` : null, reset: edit ? `data-action="deck-adj" data-id="${id}" data-op="reset"` : "" })
      : `<div class="empty"><div class="big">// NESSUN CYBERDECK</div>${edit ? `<button class="btn" data-action="edit-decks" data-id="${id}">+ Aggiungi un Cyberdeck</button>` : ""}</div>`}
    ${deckInvHtml(e)}
  </div>`;
}
function editDecks(id) {
  const e = state.entries.find(x => x.id === id); if (!e) return;
  const decks = decksOf(e).length ? decksOf(e) : [{ name: "Cyberdeck", slots: 7, items: [] }];
  const sec = (d, i, on) => `<section class="nd-sec" data-nd-sec>
    <h3 class="sh-h"><label class="check"><input type="radio" name="deck-active" value="${i}" ${on ? "checked" : ""}> in uso</label>
      <button type="button" class="btn ghost small danger" data-nd-delsec>Togli questo deck</button></h3>${deckEditorHtml(d)}</section>`;
  openModal(`
    <form class="form" id="decks-form">
      <div class="modal-head"><h2>// CYBERDECK · ${esc(e.name)}</h2><button type="button" class="x" data-action="open-entry-tab" data-id="${esc(e.id)}" data-tab="deck" aria-label="Chiudi">×</button></div>
      <div class="modal-body">
        <p class="hint">Programmi 1 slot, Black ICE 2, hardware come indicato. Puoi tenere più deck (es. uno di scorta o nel cyberbraccio): quello «in uso» è quello che tiri.</p>
        <div id="nd-secs">${decks.map((d, i) => sec(d, i, i === deckIdx(e))).join("")}</div>
        <button type="button" class="btn ghost small yellow" data-nd-newdeck>+ Cyberdeck</button>
      </div>
      <div class="modal-foot">
        <button type="button" class="btn ghost small left" data-action="open-entry-tab" data-id="${esc(e.id)}" data-tab="deck">Annulla</button>
        <button type="submit" class="btn">Salva Cyberdeck</button>
      </div>
    </form>`);
  const form = $("#decks-form");
  bindDeckEditor(form);
  const renum = () => $$("[data-nd-sec]", form).forEach((x, i) => { $("input[type=radio]", x).value = i; });
  form.addEventListener("click", ev => {
    if (ev.target.closest("[data-nd-newdeck]")) { $("#nd-secs", form).insertAdjacentHTML("beforeend", sec({ name: `Cyberdeck ${$$("[data-nd-sec]", form).length + 1}`, slots: 7, items: [] }, 0, false)); renum(); return; }
    const del = ev.target.closest("[data-nd-delsec]");
    if (del) { del.closest("[data-nd-sec]").remove(); renum(); if (!$("input[name=deck-active]:checked", form) && $("input[name=deck-active]", form)) $("input[name=deck-active]", form).checked = true; }
  });
  form.addEventListener("submit", async ev => {
    ev.preventDefault();
    const list = $$("[data-nd-sec] .nd-edit", form).map(b => readDeck(b));
    const act = $("input[name=deck-active]:checked", form);
    const s = migrateDecks(JSON.parse(JSON.stringify(sheetOf(e))));
    s.decks = list; s.deckActive = act ? clamp(num(act.value), 0, Math.max(0, list.length - 1)) : 0;
    try {
      const saved = await Store.save("entries", { ...e, sheet: s });
      upsert(state.entries, saved); liveSend("entries", saved);
      toast("Cyberdeck salvati", "ok"); openEntry(saved.id, "deck"); refreshParty();
    } catch (err) { fail(err); }
  });
}

// tiri del deck · c = { deck, iface, check(label, mods, extra), dmg(label, expr, note), msg(text) }
const NET_VS = "vs Interface + 1d10 del Netrunner, o DEF + 1d10 di un programma / Black ICE";
function deckRoll(c, what) {
  const [t, a, b, j] = String(what).split(":");
  const B = NET.boosts(c.deck), bon = k => B[k] || [];
  const I0 = { l: "Interface", v: c.iface };
  if (t === "def") return c.check("NET Defense", [I0], { note: "Difesa contro un attacco NET" });
  if (t === "speed") return c.check("NET Speed", [I0, ...bon("speed")], { note: "Agguato: vs VEL + 1d10 del Black ICE" });
  if (t === "ab") {
    const A = NET.ABILITIES.find(x => x.id === a); if (!A) return;
    if (b === "dmg") return c.dmg(`${A.name} · damage`, A.dmg[0].x, "1d6 REZ a un programma o al cervello di un Netrunner");
    return c.check(A.attack ? `${A.name} · attack` : A.name, [I0, ...bon(A.id)], { note: A.attack ? NET_VS : A.eff });
  }
  if (t !== "it") return;
  const it = ((c.deck || {}).items || [])[+a]; if (!it) return;
  const I = NET.itemInfo(it);
  if (b === "atk") return c.check(`${I.label} · attack`, I.ice ? [{ l: "ATK", v: I.atk }] : [I0, { l: `${I.name} ATK`, v: I.atk }],
    { note: `${vsOf(I)}${I.ice ? "" : " · si disattiva dopo l'uso"}${I.eff ? ` · ${I.eff}` : ""}` });
  if (b === "def") return c.check(`${I.label} · defense`, [{ l: "DEF", v: I.def }], { note: "Difesa del programma contro l'attacco" });
  if (b === "dmg") { const d = (I.dmg || [])[+j]; if (d) c.dmg(`${I.label} · ${d.u === "brain" ? "brain damage" : d.u === "REZ" ? "REZ damage" : "damage"} ${d.l}`, d.x, I.eff); return; }
  if (b === "fx") {
    if (!(I.fx || []).length) return c.msg(`${I.label}: ${I.eff}`);
    I.fx.forEach(f => c.dmg(`${I.label} · ${f.l}`, f.x, I.eff));
  }
}
const sheetDeckCtx = e => ({
  deck: activeDeck(e), iface: ifaceOf(e),
  check: (label, parts, extra) => sheetCheck(e, label, parts, extra),
  dmg: (label, x, note) => { const r = CPR.rollExpr(x); if (r) postRoll({ kind: "damage", who: e.name, entryId: e.id, label, ...r, note: note || "" }); },
  msg: text => postRoll({ kind: "msg", who: e.name, entryId: e.id, text }),
});
// tiri veloci (Party, pannello del token): Zap e i programmi offensivi
function netQuick(deck, iface, mk) {
  const off = ((deck || {}).items || []).map((it, i) => ({ it, i, I: NET.itemInfo(it) }))
    .filter(x => !x.it.dead && !x.I.hw && (x.I.ice || NET.offensive(x.I.cls))).slice(0, 3);
  return mk("ab:zap", `⌁ Zap <b>${iface}</b>`, "chip") + off.map(x => mk(`it:${x.i}:atk`, `⌁ ${esc(x.I.name)} <b>${x.I.ice ? x.I.atk : iface + x.I.atk}</b>`, "chip")).join("");
}
// Rez / Derez, REZ, «una volta per Netrun», Distrutto e Nuova Netrun dalla scheda
function deckAdj(e, i, op) {
  sheetPatch(e.id, s => {
    migrateDecks(s);
    if (op === "active") { s.deckActive = clamp(i, 0, Math.max(0, s.decks.length - 1)); return s; }
    if (!s.decks.length) s.decks.push({ name: "Cyberdeck", slots: 7, items: [] });
    const d = s.decks[s.deckActive], items = d.items = d.items || [];
    if (op === "reset") { items.forEach(it => { it.on = false; it.used = false; it.cur = null; }); return s; }
    const it = items[i]; if (!it) return s;
    const I = NET.itemInfo(it);
    if (op === "on") {
      if (!it.on && I.once && it.used) { toast(`${I.name}: già usato in questa Netrun`, "err"); return s; }
      it.on = !it.on;
      if (it.on) { it.cur = null; if (I.once) it.used = true; }   // riattivato = di nuovo a REZ piena
    } else if (op.startsWith("rez:")) it.cur = clamp(NET.curRez(it, I) + num(op.slice(4)), 0, I.rez);
    else if (op === "used") it.used = !it.used;
    else if (op === "dead") { it.dead = !it.dead; if (it.dead) it.on = false; }
    return s;
  });
}

// ---------- editor del deck (scheda e nemico) ----------
const deckOpt = (v, label, sel) => `<option value="${esc(v)}" ${v === sel ? "selected" : ""}>${esc(label)}</option>`;
const deckRefOptions = sel => `
  ${Object.entries(NET.CLASSES).map(([k, c]) => `<optgroup label="${esc(c.label)}">${NET.PROGRAMS.filter(p => p.cls === k).map(p => deckOpt("prog:" + p.id, `${p.name} · ATK ${p.atk} DEF ${p.def} REZ ${p.rez}`, sel)).join("")}</optgroup>`).join("")}
  <optgroup label="Black ICE (2 slot)">${NET.allIce().map(c => deckOpt("ice:" + c.id, `${NET.iceLabel(c)} · ${NET.CLASSES[c.cls].short} · ATK ${c.atk} REZ ${c.rez}`, sel)).join("")}</optgroup>
  <optgroup label="Hardware">${NET.HARDWARE.map(h => deckOpt("hw:" + h.id, `${h.name} · ${h.slots} slot`, sel)).join("")}</optgroup>
  <optgroup label="Altro">${deckOpt("custom", "Personalizzato…", sel)}</optgroup>`;
const deckInfoTxt = it => { const I = NET.itemInfo(it); return `${I.slots} slot${I.eff ? " · " + I.eff : ""}`; };
function deckRow(it = { ref: "prog:sword" }) {
  const custom = it.ref === "custom";
  const n = (f, ph, w = "") => `<input data-f="${f}" type="number" min="0" max="99" placeholder="${ph}" title="${ph}" value="${esc(it[f] ?? "")}" class="nd-c ${w}">`;
  return `<div class="sh-row nd-row ${custom ? "custom" : ""}">
    <select data-f="ref" aria-label="Programma o hardware">${deckRefOptions(it.ref || "custom")}</select>
    <span class="nd-info">${custom ? "" : esc(deckInfoTxt(it))}</span>
    <input data-f="name" placeholder="Nome" value="${esc(it.name || "")}" class="nd-c">
    <select data-f="cls" class="nd-c" aria-label="Classe">${[...Object.entries(NET.CLASSES).map(([k, c]) => [k, c.short]), ["ice", "Black ICE"], ["hw", "Hardware"]].map(([k, l]) => deckOpt(k, l, it.cls || "antipersonnel")).join("")}</select>
    ${n("atk", "ATK")}${n("def", "DEF")}${n("rez", "REZ")}${n("per", "PER")}${n("spd", "SPD")}${n("slots", "Slot")}
    <input data-f="dmg" placeholder="Danno (2d6)" value="${esc(it.dmg || "")}" class="nd-c">
    <input data-f="eff" placeholder="Effetto" value="${esc(it.eff || "")}" class="nd-c wide">
    <input type="hidden" data-f="st" value="${esc(JSON.stringify({ ref: it.ref, name: it.name || "", cur: it.cur ?? null, on: !!it.on, used: !!it.used, dead: !!it.dead }))}">
    <button type="button" class="gp-btn del" data-row-del aria-label="Rimuovi">✕</button></div>`;
}
function deckEditorHtml(deck) {
  const d = deck || { name: "Cyberdeck", slots: 7, items: [] };
  return `<div class="nd-edit">
    <div class="fields">
      <div class="field"><label>Nome del deck</label><input data-nd="name" value="${esc(d.name || "")}" placeholder="es. Zetatech Paraline"></div>
      <div class="field"><label>Slot</label><input data-nd="slots" type="number" min="1" max="20" value="${esc(d.slots ?? 7)}"><span class="hint">${NET.DECK_QUALITY.map(q => `${q.label} ${q.slots}`).join(" · ")}</span></div>
      <div class="field full"><label class="check"><input type="checkbox" data-nd="bodyweight" ${d.bodyweight ? "checked" : ""}> Tuta Bodyweight: +1 slot solo per l'hardware</label>
        <label class="check"><input type="checkbox" data-nd="cyberarm" ${d.cyberarm ? "checked" : ""}> Cyberdeck nel cyberbraccio: +1 slot</label></div>
      <div class="field full"><label>Regole del deck</label><input data-nd="note" value="${esc(d.note || "")}" placeholder="es. solo programmi · un Jack Out non sicuro conta come sicuro"></div>
    </div>
    <div class="en-budget" data-nd-count></div>
    <div class="sh-rows nd-rows">${(d.items || []).map(deckRow).join("")}</div>
    <button type="button" class="btn ghost small cyan" data-nd-add>+ Programma / Hardware</button>
  </div>`;
}
function readDeck(root, old = null) {
  const box = root && root.classList && root.classList.contains("nd-edit") ? root : $(".nd-edit", root); if (!box) return old;
  const val = k => $(`[data-nd=${k}]`, box);
  const items = readRows(box, ".nd-row").map(r => {
    let st = {}; try { st = JSON.parse(r.st || "{}"); } catch { st = {}; }
    const base = r.ref === "custom"
      ? { ref: "custom", name: r.name, cls: r.cls, atk: num(r.atk), def: num(r.def), rez: num(r.rez), per: num(r.per), spd: num(r.spd), slots: num(r.slots) || (r.cls === "ice" ? 2 : 1), dmg: r.dmg, eff: r.eff }
      : { ref: r.ref };
    // lo stato della Netrun resta se l'oggetto è lo stesso
    const same = st.ref === r.ref && (r.ref !== "custom" || st.name === r.name);
    return same ? { ...base, cur: st.cur ?? null, on: !!st.on, used: !!st.used, dead: !!st.dead } : base;
  }).filter(it => it.ref !== "custom" || it.name);
  return { name: val("name").value.trim(), slots: clamp(num(val("slots").value) || 7, 1, 20), bodyweight: val("bodyweight").checked, cyberarm: val("cyberarm").checked, ...(val("note") && val("note").value.trim() ? { note: val("note").value.trim() } : {}), items };
}
// contatore degli slot e campi del personalizzato
function bindDeckEditor(root) {
  const count = () => $$(".nd-edit", root).forEach(box => {
    const S = NET.deckSlots(readDeck(box));
    const el = $("[data-nd-count]", box);
    el.className = "en-budget" + (S.over ? " over" : "");
    el.innerHTML = `Slot usati <b>${S.used}</b> / ${S.total}${S.hwExtra ? ` (di cui ${S.hwExtra} solo hardware)` : ""}${S.over ? " · troppi oggetti per questo deck" : ""} · programmi 1 slot, Black ICE 2`;
  });
  root.addEventListener("click", ev => {
    const addBtn = ev.target.closest("[data-nd-add]");
    if (addBtn) { $(".nd-rows", addBtn.closest(".nd-edit")).insertAdjacentHTML("beforeend", deckRow()); count(); return; }
    if (ev.target.closest(".nd-row [data-row-del]")) setTimeout(count);
  });
  root.addEventListener("change", ev => {
    const sel = ev.target.closest(".nd-row [data-f=ref]");
    if (sel) { const row = sel.closest(".nd-row"); row.classList.toggle("custom", sel.value === "custom"); $(".nd-info", row).textContent = sel.value === "custom" ? "" : deckInfoTxt({ ref: sel.value }); }
    if (ev.target.closest(".nd-edit")) count();
  });
  root.addEventListener("input", ev => { if (ev.target.closest(".nd-edit")) count(); });
  count();
}


// ---------- programmi, Black ICE e hardware nell'inventario: si installano nei deck e si tolgono ----------
// e.gear.items { cat: "netrun", name, qty, ref ("prog:…" | "ice:…" | "hw:…" | "custom"), item (l'oggetto custom completo), detail }
const NET_CAT = "netrun";
const netGearOf = e => gearItems(e).map((it, gi) => ({ it, gi })).filter(x => x.it.cat === NET_CAT);
const netKind = I => I.hw ? "Hardware" : I.ice ? "Black ICE" : "Programma";
const netStrip = ({ cur, on, used, dead, ...rest }) => rest;
// l'oggetto da mettere nel deck: dal catalogo (anche cercandolo per nome) o personalizzato
function netGearItem(it) {
  if (it.item && typeof it.item === "object") return { ...it.item };
  if (it.ref && it.ref !== "custom") return { ref: it.ref };
  const n = norm2(it.name);
  const hit = [...NET.PROGRAMS.map(p => "prog:" + p.id), ...NET.allIce().map(c => "ice:" + c.id), ...NET.HARDWARE.map(h => "hw:" + h.id)]
    .find(r => { const I = NET.itemInfo({ ref: r }); return norm2(I.name) === n || norm2(I.label) === n || norm2(I.alias) === n; });
  return hit ? { ref: hit } : { ref: "custom", name: it.name, cls: "antipersonnel", slots: 1, eff: it.detail || "" };
}
const netSame = (a, b) => a.ref === b.ref && (a.ref !== "custom" || norm2(a.name) === norm2(b.name));
function netGearEntry(di) {
  const I = NET.itemInfo(di);
  return { cat: NET_CAT, name: I.label || I.name, qty: 1, ref: di.ref, ...(di.ref === "custom" ? { item: netStrip(di) } : {}), detail: `${netKind(I)} · ${I.slots} slot${I.eff ? " · " + I.eff : ""}` };
}
// nell'inventario: se c'è già lo stesso oggetto ne aumento la quantità
function netGearAdd(items, di) {
  const g = items.find(x => x.cat === NET_CAT && netSame(netGearItem(x), di));
  if (g) g.qty = (num(g.qty) || 1) + 1; else items.push(netGearEntry(di));
}
async function netEntrySave(e0, fn, msg) {
  const e = JSON.parse(JSON.stringify(e0)); e.sheet = e.sheet || {}; e.gear = e.gear || {}; e.gear.items = e.gear.items || [];
  if (fn(e) === false) return;
  try { const saved = await Store.save("entries", e); upsert(state.entries, saved); liveSend("entries", saved); refreshSheetView(saved.id); refreshParty(); if (msg) toast(msg, "ok"); }
  catch (err) { fail(err); }
}
function deckInstall(id, gi, di) {
  const e = state.entries.find(x => x.id === id), g = gearItems(e)[gi]; if (!e || !g || !Store.canEdit()) return;
  const d = decksOf(e)[di]; if (!d) return toast("Scegli un cyberdeck", "err");
  const obj = netGearItem(g), S = NET.deckSlots({ ...d, items: [...(d.items || []), obj] });
  if (S.over) return toast(`${d.name || "Il deck"} è pieno: servirebbero ${S.used} slot su ${S.total}`, "err");
  netEntrySave(e, x => {
    const s = migrateDecks(x.sheet), it = x.gear.items[gi]; if (!it || !s.decks[di]) return false;
    it.qty = (num(it.qty) || 1) - 1; if (it.qty <= 0) x.gear.items.splice(gi, 1);
    s.decks[di].items = [...(s.decks[di].items || []), obj];
  }, `${g.name} installato in ${d.name || "Cyberdeck"}`);
}
function deckUninstall(id, di, ii) {
  const e = state.entries.find(x => x.id === id); if (!e || !Store.canEdit()) return;
  const d = decksOf(e)[di], it = d && (d.items || [])[ii]; if (!it) return;
  netEntrySave(e, x => {
    const s = migrateDecks(x.sheet), list = (s.decks[di] || {}).items || []; if (!list[ii]) return false;
    const [out] = list.splice(ii, 1); netGearAdd(x.gear.items, netStrip(out));
  }, `${NET.itemInfo(it).label} tolto dal deck: è nell'inventario`);
}
// riquadro della tab Cyberdeck: le cose dell'inventario da installare nel deck in uso
function deckInvHtml(e) {
  const loose = netGearOf(e), edit = Store.canEdit(), id = esc(e.id), ds = decksOf(e);
  if (!loose.length) return "";
  return `<div class="nd-inv"><span class="sh-k">Nell'inventario, non installati</span>
    <ul>${loose.map(({ it, gi }) => `<li><span>${num(it.qty) > 1 ? `×${num(it.qty)} ` : ""}<b>${esc(it.name)}</b> <small>${esc(it.detail || "")}</small></span>
      ${edit && ds.length ? `<button type="button" class="btn ghost small g-act" data-action="deck-install" data-id="${id}" data-i="${gi}" data-deck="${deckIdx(e)}">⇧ Installa in ${esc(activeDeck(e).name || "Cyberdeck")}</button>` : ""}</li>`).join("")}</ul></div>`;
}
