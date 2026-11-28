// ============================================================
//  NIGHT CITY ARCHIVE — Dice log, pop-up dei tiri
//  (js/ui/: i file si caricano in ordine da index.html e condividono le costanti)
// ============================================================

// ---------- DADI: log condiviso, stile chat ----------
const ROLL_KEEP = 150;
const sortRolls = () => { state.rolls.sort((a, b) => (a.at || a.createdAt || "").localeCompare(b.at || b.createdAt || "")); if (state.rolls.length > ROLL_KEEP) state.rolls.splice(0, state.rolls.length - ROLL_KEEP); };
const fmtTime = iso => { try { return new Date(iso).toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" }); } catch { return ""; } };

// tiro segreto del GM: interruttore 🔒 nel Dice log, oppure tiro di un NPC segreto o di un token nascosto
let secretRoll = ls.get("nc-secret", false);
async function postRoll(r) {
  const ent = r.entryId && state.entries.find(e => e.id === r.entryId);
  const secret = isGm() && Store.gmReady && !!(r.gmOnly || secretRoll || (ent && ent.gmOnly));
  // l'ora la scrive il dispositivo: se il suo orologio è indietro il tiro finirebbe sopra quelli già fatti,
  // quindi un tiro nuovo viene sempre dopo l'ultimo del log
  const last = state.rolls.reduce((m, x) => { const t = Date.parse(x.at || x.createdAt || ""); return t > m ? t : m; }, 0);
  const rec = { ...r, gmOnly: secret, by: Store.user || "", at: new Date(Math.max(Date.now(), last + 1)).toISOString() };
  let out = { ...rec, id: "loc-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6), local: true };
  if (Store.canEdit()) {
    try { out = await Store.save("rolls", rec); liveSend("rolls", out); }
    catch (err) { fail(err); }
  }
  upsert(state.rolls, out); sortRolls(); renderLogs();
  if (onTable() && !$("#modal").open) popRoll(out); else openDrawer();
  return out;
}

// pop-up di un tiro: compare per qualche secondo e resta nel Dice log
function popRoll(r) {
  if (drawer && !drawer.hidden && !drawer.classList.contains("min")) return;   // il log è già aperto
  let box = $("#roll-pops");
  if (!box) { box = document.createElement("div"); box.id = "roll-pops"; box.className = "roll-pops"; box.setAttribute("aria-live", "polite"); document.body.appendChild(box); }
  const el = document.createElement("div");
  el.className = "roll-pop"; el.innerHTML = rollCard(r); el.title = "Clicca per aprire il Dice log";
  el.addEventListener("click", () => { el.remove(); openDrawer(); });
  box.appendChild(el);
  while (box.children.length > 4) box.firstElementChild.remove();
  setTimeout(() => { el.classList.add("out"); setTimeout(() => el.remove(), 400); }, r.kind === "msg" ? 5000 : 6500);
}
function rollCard(r) {
  const who = esc(r.who || (r.by ? r.by.split("@")[0] : "") || "Anonimo");
  const time = `<span class="rl-time">${fmtTime(r.at || r.createdAt)}</span>`;
  if (r.kind === "msg") return `<div class="rl msg ${r.local ? "local" : ""} ${r.gmOnly ? "secret" : ""}"><div class="rl-head"><b class="rl-who">${who}</b>${r.gmOnly ? `<span class="rl-secret">🔒 SEGRETO</span>` : ""}${time}</div><div class="rl-text">${esc(r.text)}</div></div>`;
  const dice = (r.dice || []).map(d => `<span class="rd ${d.s === 10 ? "d10" : d.s === 6 ? "d6" : ""} ${esc(d.t || "")}" title="d${d.s}${d.t === "drop" ? " · scartato" : ""}">${d.t === "minus" ? "−" : ""}${d.v}</span>`).join("");
  const mods = (r.mods || []).map(m => `<span class="rm">${m.v < 0 ? "−" : "+"}${Math.abs(m.v)}${m.l ? ` <small>${esc(m.l)}</small>` : ""}</span>`).join("");
  const crit = { success: "Critical Success", fail: "Critical Failure", injury: "Critical Injury" }[r.crit];
  return `<div class="rl ${r.crit ? "c-" + esc(r.crit) : ""} ${r.local ? "local" : ""} ${r.gmOnly ? "secret" : ""}">
    <div class="rl-head"><b class="rl-who">${who}</b>${r.gmOnly ? `<span class="rl-secret" title="Lo vedono solo i GM">🔒 SEGRETO</span>` : ""}${time}</div>
    <div class="rl-label">${esc(r.label || r.expr || "Tiro")}</div>
    <div class="rl-body"><span class="rl-total">${num(r.total)}</span><span class="rl-break">${dice}${mods}</span></div>
    ${crit ? `<div class="rl-crit">${crit}</div>` : ""}
    ${r.inj ? `<div class="rl-inj">✚ ${esc(r.inj)}</div>` : ""}
    ${r.hit && r.hit.text ? `<div class="rl-hit ${r.hit.ok ? "ok" : "no"}">${r.hit.ok ? "✓" : "✗"} ${Array.isArray(r.hit.bands) ? `${esc(r.hit.table)}: ${r.hit.bands.length ? `colpisce a ${r.hit.bands.map(b => `<span class="rl-band">${esc(b)}</span>`).join(" ")}` : "fuori portata a ogni distanza"}` : esc(r.hit.text)}</div>` : ""}
    ${r.note ? `<div class="rl-note">${esc(r.note)}</div>` : ""}
    ${r.local ? `<div class="rl-note">solo su questo dispositivo · accedi per condividere i tiri</div>` : ""}
  </div>`;
}
const logList = () => { const cut = ls.get("nc-log-cleared", ""); return cut ? state.rolls.filter(r => (r.at || r.createdAt || "") > cut) : state.rolls; };
const logItems = () => {
  const cut = ls.get("nc-log-cleared", ""), list = logList();
  return list.length ? list.map(rollCard).join("") : `<div class="rl-empty">// ${cut && state.rolls.length ? "log pulito." : "nessun tiro ancora."}<br>Clicca un'abilità nella scheda o scrivi <b>2d6+3</b> qui sotto.${cut && state.rolls.length ? `<br><button type="button" class="btn ghost small" data-action="log-unclear">Mostra di nuovo i tiri vecchi</button>` : ""}</div>`;
};
// cancella tutti i tiri dal database (solo GM): gli altri ricevono un avviso e svuotano il loro log
async function wipeLog() {
  if (!(await askConfirm("Eliminare DEFINITIVAMENTE tutti i tiri e i messaggi del Dice log, per tutti? Non si può annullare.", "Elimina tutti"))) return;
  try {
    const all = await Store.list("rolls");
    for (const r of all) await Store.remove("rolls", r);
    state.rolls = []; renderLogs(); Store.send({ t: "wipe", col: "rolls" });
    toast(`Dice log svuotato: ${all.length} tiri eliminati`, "ok");
  } catch (err) { fail(err); }
}
const rollAs = () => { const id = ls.get("nc-as", null); const e = id && state.entries.find(x => x.id === id); return e || myPg() || null; };
const asOptions = () => {
  const cur = rollAs(), people = state.entries.filter(isPerson).sort((a, b) => (a.kind === b.kind ? 0 : a.kind === "pg" ? -1 : 1) || (a.name || "").localeCompare(b.name || "", "it"));
  return `<option value="">${esc(Store.user ? Store.user.split("@")[0] : "Anonimo")}</option>` +
    people.map(e => `<option value="${esc(e.id)}" ${cur && cur.id === e.id ? "selected" : ""}>${esc(e.name)}${e.kind === "pg" ? " (PG)" : ""}</option>`).join("");
};
function logWidget() {
  return `
    <div class="roll-log" aria-live="polite">${logItems()}</div>
    <form class="roll-form ${secretRoll && isGm() ? "is-secret" : ""}" data-roll-form autocomplete="off">
      <div class="roll-quick">${["1d10", "1d6", "2d6", "3d6", "4d6", "5d6", "6d6", "3d6kh2"].map(x => `<button type="button" class="chip" data-quick="${x}">${x}</button>`).join("")}<button type="button" class="chip" data-quick="check" title="Prova: 1d10 con critico sul 10 e fallimento sull'1">CHECK</button>
        ${isGm() && Store.gmReady ? `<label class="roll-secret" title="I tuoi tiri e messaggi li vedono solo i GM"><input type="checkbox" data-secret ${secretRoll ? "checked" : ""}> 🔒 Segreto</label>` : ""}</div>
      <div class="roll-tools"><button type="button" class="chip" data-action="log-clear" title="Nasconde i tiri fatti finora, solo su questo dispositivo">🧹 Pulisci</button>
        ${isGm() || !Store.gmReady ? `<button type="button" class="chip r" data-action="log-wipe" title="Elimina tutti i tiri dal database, per tutti">🗑 Elimina tutti</button>` : ""}</div>
      <div class="roll-in">
        <select data-roll-as title="Tira come" aria-label="Tira come">${asOptions()}</select>
        <input data-roll-text placeholder="2d6+3 · /c 14 · messaggio" aria-label="Tiro o messaggio">
        <button class="btn small" type="submit">Invia</button>
      </div>
    </form>`;
}
// il log resta in fondo finché chi legge non scorre verso l'alto (stick); se ha scorso, resta sul tiro che stava leggendo.
// Non si ricalcola dalla posizione: quando il log viene nascosto o spostato in una finestra il browser lo riporta in cima.
function renderLogs() {
  for (const box of $$(".roll-log")) {
    if (!box.dataset.wired) {
      box.dataset.wired = "1";
      // conta solo lo scorrimento fatto da chi legge (rotella, dito, barra, tastiera), non quello del browser
      const user = () => { box._u = Date.now(); };
      ["wheel", "touchstart", "touchmove", "pointerdown", "keydown"].forEach(t => box.addEventListener(t, user, { passive: true }));
      box.addEventListener("scroll", () => { if (box.clientHeight && box.isConnected && Date.now() - (box._u || 0) < 1500) box.dataset.stick = box.scrollHeight - box.scrollTop - box.clientHeight < 60 ? "1" : "0"; }, { passive: true });
    }
    // chi legge un tiro più in alto resta su quel tiro (anche se ne arrivano di nuovi o i vecchi escono dal log)
    const stick = box.dataset.stick !== "0", kids = [...box.children], ids = box._ids || [];
    const k = stick ? -1 : kids.findIndex(c => c.offsetTop + c.offsetHeight > box.scrollTop);
    const anchor = k >= 0 ? { id: ids[k], off: kids[k].offsetTop - box.scrollTop } : null, top = box.scrollTop;
    box.innerHTML = logItems(); box._ids = logList().map(r => r.id);
    if (stick) { box.scrollTop = box.scrollHeight; continue; }
    const j = anchor ? box._ids.indexOf(anchor.id) : -1;
    box.scrollTop = j >= 0 && box.children[j] ? box.children[j].offsetTop - anchor.off : top;
  }
}

// testo del log: "2d6+3" o "/r 2d6" = tiro libero · "/d 3d6" = danni (critico con due 6)
// "/c 14" = prova con base 14 (critico sul 10, fallimento sull'1) · altro testo = messaggio
function submitChat(text) {
  text = text.trim(); if (!text) return;
  const as = rollAs(), who = as ? as.name : "";
  const c = /^\/c(?:heck)?\s*([+-]?\d+)?\s*$/i.exec(text);
  if (c) { const base = num(c[1]); return postRoll({ kind: "check", who, label: "Check", ...CPR.check(base ? [{ l: "base", v: base }] : []) }); }
  const dmg = /^\/d(?:mg|amage)?\s+/i.test(text);
  const expr = text.replace(/^\/(?:r|roll|d|dmg|damage)\s+/i, "");
  const r = CPR.rollExpr(expr, { damage: dmg });
  if (r) return postRoll({ kind: dmg ? "damage" : "expr", who, label: dmg ? `Damage ${r.expr}` : r.expr, ...r });
  if (/^\/[rd]/i.test(text)) return toast("Tiro non valido. Esempi: 2d6+3, 1d10-2, /d 3d6", "err");
  return postRoll({ kind: "msg", who, text: text.slice(0, 500) });
}
function quickRoll(x) {
  const as = rollAs(), who = as ? as.name : "";
  if (x === "check") return as && hasSheet(as) ? sheetCheck(as, "Check", []) : postRoll({ kind: "check", who, label: "Check", ...CPR.check([]) });
  const dmg = /d6$/.test(x);
  const r = CPR.rollExpr(x, { damage: dmg });
  postRoll({ kind: dmg ? "damage" : "expr", who, label: dmg ? `Damage ${x}` : x, ...r });
}

// cassetto dei dadi (sempre disponibile; dentro la finestra aperta se ce n'è una)
let drawer = null;
function ensureDrawer() {
  if (drawer) return drawer;
  drawer = document.createElement("aside");
  drawer.className = "dice-drawer"; drawer.hidden = true;
  drawer.setAttribute("aria-label", "Dadi e chat");
  document.body.appendChild(drawer);
  return drawer;
}
function placeDrawer() {
  if (!drawer) return;
  const host = $("#modal").open ? $("#modal") : document.body;
  if (drawer.parentNode !== host) host.appendChild(drawer);
}
function openDrawer() {
  ensureDrawer();
  if (drawer.hidden) {
    drawer.innerHTML = `<header><h4>// DICE LOG</h4><span>
      <button type="button" class="x" data-action="dice-min" title="Riduci / espandi" aria-label="Riduci o espandi">▁</button>
      <button type="button" class="x" data-action="dice-close" aria-label="Chiudi">×</button></span></header>${logWidget()}`;
    drawer.classList.toggle("min", ls.get("nc-dice-min", false));
    drawer.hidden = false;
  }
  document.body.classList.add("drawer-open");
  placeDrawer(); renderLogs();
}
function closeDrawer() { if (drawer) drawer.hidden = true; document.body.classList.remove("drawer-open"); }
function minDrawer() { if (!drawer) return; const on = !drawer.classList.contains("min"); drawer.classList.toggle("min", on); ls.set("nc-dice-min", on); renderLogs(); }
