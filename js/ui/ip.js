// ============================================================
//  NIGHT CITY ARCHIVE — Punti Miglioramento
//  (js/ui/: i file si caricano in ordine da index.html e condividono le costanti)
// ============================================================

// ---------- PUNTI MIGLIORAMENTO (IP) ----------
// costi del manuale: abilità 20 × nuovo livello (×2 per le abilità a costo doppio), Capacità di Ruolo 60 × nuovo grado
// Un Ruolo nuovo (dal secondo in poi) parte a grado 1 e costa 60 IP: chiave "newrole:<id>".
// sheet.ipLog = [{ at, kind: "earn" | "spend", amount, why, key, label, from, to }] (più recente in fondo)
// «earn» con amount negativo = IP tolti (penalità, correzioni)
const ipCost = (kind, to, x2) => kind === "role" ? 60 * to : (x2 ? 40 : 20) * to;
function ipTargets(e) {
  const s = sheetOf(e);
  const sk = skillsOf(e).map(k => ({ key: k.key, label: k.label, kind: "skill", lvl: k.lvl, x2: !!k.x2, group: k.group }));
  const rl = rolesOf(e).map((r, i) => ({ key: "role:" + i, label: `${(RL.roleById(r.id) || {}).it || r.id} · ${(RL.roleById(r.id) || {}).abilityIt || ""}`, kind: "role", lvl: clamp(num(r.rank), 0, 10) }));
  // Ruoli che non ha: il grado 1 si compra (il primo Ruolo invece si sceglie gratis, a grado 4, nella tab Ruoli)
  const roles = rolesOf(e), nw = !roles.length ? [] : RL.ROLES.filter(r => !roles.some(x => x.id === r.id))
    .map(r => ({ key: "newrole:" + r.id, label: `${r.it} · ${r.abilityIt}`, kind: "newrole", lvl: 0, locked: !RL.canAddRole(roles) }));
  return [...rl, ...nw, ...sk].map(t => ({ ...t, cost: t.lvl >= 10 ? null : ipCost(t.kind === "newrole" ? "role" : t.kind, t.lvl + 1, t.x2) }));
}
// cosa cambia nella scheda spendendo IP su un bersaglio (anche dalla tab Ruoli)
function ipSpendFn(e, t) {
  return s => {
    if (t.kind === "role") { migrateRoles(s, e); const r = s.roles[num(t.key.split(":")[1])]; if (!r) return null; r.rank = t.lvl + 1; }
    else if (t.kind === "newrole") { migrateRoles(s, e); const rid = t.key.split(":")[1]; if (s.roles.some(r => r.id === rid)) return null; s.roles.push({ id: rid, rank: 1 }); }
    else if (t.key.startsWith("cskill:")) { const c = (s.custom || [])[num(t.key.split(":")[1])]; if (!c) return null; c.lvl = t.lvl + 1; }
    else { s.skills = { ...(s.skills || {}), [t.key.split(":")[1]]: t.lvl + 1 }; }
    s.ip = num(s.ip) - t.cost;
    s.ipLog = [...(s.ipLog || []), { at: new Date().toISOString(), kind: "spend", amount: t.cost, key: t.key, label: t.label, from: t.lvl, to: t.lvl + 1 }];
    return s;
  };
}
function openIp(id) {
  const e = state.entries.find(x => x.id === id); if (!e) return;
  const s = sheetOf(e), edit = Store.canEdit(), ip = num(s.ip), log = [...(s.ipLog || [])].reverse();
  const tg = ipTargets(e), last = (s.ipLog || []).slice(-1)[0];
  const opt = t => `<option value="${esc(t.key)}" ${t.cost == null || t.cost > ip || t.locked ? "disabled" : ""}>${esc(t.label)} ${t.lvl} → ${t.lvl + 1 > 10 ? "max" : t.lvl + 1} · ${t.cost == null ? "al massimo" : t.cost + " IP"}${t.x2 ? " (×2)" : ""}${t.locked ? " · serve il Ruolo precedente a grado 4" : ""}</option>`;
  openModal(`
    <div class="modal-head"><h2>// PUNTI MIGLIORAMENTO · ${esc(e.name)}</h2><button type="button" class="x" data-action="open-entry-tab" data-id="${esc(e.id)}" data-tab="sheet" aria-label="Chiudi">×</button></div>
    <div class="modal-body ip-box" data-ip="${esc(e.id)}">
      <div class="ip-now"><span class="sh-k">Disponibili</span> <b>${ip}</b> IP</div>
      <p class="hint">Abilità: 20 IP × il livello nuovo (40 × per le abilità ×2). Capacità di Ruolo: 60 IP × il grado nuovo; un Ruolo nuovo parte a grado 1 (60 IP), con il precedente almeno a 4. Le abilità che non hai partono da 0 (il livello 1 costa 20).</p>
      ${edit ? `<div class="ip-row"><span class="lbl">Aggiungi / togli</span><input type="number" min="-9999" max="9999" step="1" data-ip-amt placeholder="IP (es. 50 o −50)" aria-label="IP da aggiungere (positivo) o togliere (negativo)" title="Numero negativo per togliere IP"><input data-ip-why placeholder="Perché (es. sessione 12, missione al porto)" aria-label="Motivo">
        <button type="button" class="btn small" data-action="ip-earn" data-id="${esc(e.id)}">± Registra</button></div>
      <div class="ip-row"><span class="lbl">Spendi</span><select data-ip-target aria-label="Cosa migliorare">
        <optgroup label="Capacità di Ruolo">${tg.filter(t => t.kind === "role").map(opt).join("") || `<option disabled>nessun Ruolo</option>`}</optgroup>
        ${tg.some(t => t.kind === "newrole") ? `<optgroup label="Nuovo Ruolo (grado 1)">${tg.filter(t => t.kind === "newrole").map(opt).join("")}</optgroup>` : ""}
        ${SK_GROUPS.map(g => { const l = tg.filter(t => t.kind === "skill" && t.group === g); return l.length ? `<optgroup label="${esc(g)}">${l.map(opt).join("")}</optgroup>` : ""; }).join("")}</select>
        <button type="button" class="btn small yellow" data-action="ip-spend" data-id="${esc(e.id)}">Migliora</button></div>` : ""}
      <h3 class="sh-h">Storico ${edit && last ? `<button type="button" class="btn ghost small" data-action="ip-undo" data-id="${esc(e.id)}" title="Annulla l'ultima voce (restituisce gli IP o li toglie)">↶ Annulla l'ultima</button>` : ""}</h3>
      ${log.length ? `<div class="gl-wrap"><table class="gl-t ip-t"><thead><tr><th>Data</th><th>Cosa</th><th>IP</th><th>Totale dopo</th>${edit ? "<th></th>" : ""}</tr></thead><tbody>${(() => {
        let run = ip, n = log.length; return log.map((x, k) => { const row = `<tr class="${x.kind}" data-ip-i="${n - 1 - k}"><td class="gl-n">${esc(new Date(x.at).toLocaleDateString("it-IT"))}</td><td>${x.kind === "earn" ? `${x.amount < 0 ? "Tolti" : "Guadagnati"}${x.why ? ` · ${esc(x.why)}` : ""}` : `${esc(x.label)} ${x.from} → ${x.to}`}</td><td class="gl-n">${x.kind === "earn" && x.amount >= 0 ? "+" : "−"}${Math.abs(x.amount)}</td><td class="gl-n">${run}</td>${edit ? `<td><button type="button" class="btn ghost small g-act" data-action="ip-edit" data-id="${esc(e.id)}" data-i="${n - 1 - k}" title="Modifica o elimina questa voce">✎</button></td>` : ""}</tr>`; run += x.kind === "earn" ? -x.amount : x.amount; return row; }).join(""); })()}</tbody></table></div>`
        : `<p class="hint">Nessuna voce ancora.</p>`}
    </div>`);
}
// riporta il bersaglio di una spesa al livello di prima
function ipRevert(s, e, x) {
  if (x.key.startsWith("newrole:")) { migrateRoles(s, e); const rid = x.key.split(":")[1], j = s.roles.map(r => r.id).lastIndexOf(rid); if (j >= 0) s.roles.splice(j, 1); }
  else if (x.key.startsWith("role:")) { migrateRoles(s, e); const r = s.roles[num(x.key.split(":")[1])]; if (r) r.rank = x.from; }
  else if (x.key.startsWith("cskill:")) { const c = (s.custom || [])[num(x.key.split(":")[1])]; if (c) c.lvl = x.from; }
  else { s.skills = { ...(s.skills || {}) }; if (x.from) s.skills[x.key.split(":")[1]] = x.from; else delete s.skills[x.key.split(":")[1]]; }
}
// livello attuale del bersaglio di una spesa (null se non c'è più)
function ipLevelNow(e, x) {
  if (x.key.startsWith("newrole:")) { const r = rolesOf(e).find(y => y.id === x.key.split(":")[1]); return r ? num(r.rank) : null; }
  const t = ipTargets(e).find(y => y.key === x.key); return t ? t.lvl : null;
}
// una spesa più recente sullo stesso bersaglio (un Ruolo comprato si migliora poi come «role:<indice>»)
function ipLaterOn(e, i) {
  const log = sheetOf(e).ipLog || [], x = log[i];
  const keys = [x.key]; if (x.key.startsWith("newrole:")) { const j = rolesOf(e).findIndex(r => r.id === x.key.split(":")[1]); if (j >= 0) keys.push("role:" + j); }
  return log.slice(i + 1).find(y => y.kind === "spend" && keys.includes(y.key)) || null;
}
// ✎ su una voce dello storico: si modifica sotto la riga
function ipEdit(el) {
  const e = state.entries.find(x => x.id === el.dataset.id), i = num(el.dataset.i), x = e && (sheetOf(e).ipLog || [])[i]; if (!x) return;
  const tr = el.closest("tr"), box = el.closest(".ip-box");
  $$(".ip-ed", box).forEach(r => r.remove());
  const spend = x.kind === "spend";
  tr.insertAdjacentHTML("afterend", `<tr class="ip-ed"><td colspan="5"><div class="ip-ed-in">
    <b>${spend ? `${esc(x.label)} ${x.from} → ${x.to}` : "IP registrati"}</b>
    <label>${spend ? "IP spesi" : "IP (meno per toglierli)"} <input type="number" step="1" data-ed-amt value="${num(x.amount)}"></label>
    ${spend ? "" : `<input data-ed-why value="${esc(x.why || "")}" placeholder="Perché">`}
    <button type="button" class="btn small" data-ed-ok>Salva</button>
    <button type="button" class="btn ghost small danger" data-ed-del>${spend ? "Elimina e annulla il miglioramento" : "Elimina la voce"}</button>
    <button type="button" class="btn ghost small" data-ed-x>Chiudi</button></div></td></tr>`);
  const ed = tr.nextElementSibling, amt = $("[data-ed-amt]", ed);
  amt.focus(); amt.select();
  $("[data-ed-x]", ed).addEventListener("click", () => ed.remove());
  $("[data-ed-ok]", ed).addEventListener("click", () => {
    const v = Math.trunc(num(amt.value)), why = spend ? null : $("[data-ed-why]", ed).value.trim();
    if (spend && v < 0) return toast("Gli IP spesi non possono essere negativi", "err");
    if (!spend && !v) return toast("Scrivi un valore diverso da 0 (o elimina la voce)", "err");
    // differenza sul totale: una spesa più cara toglie IP, un guadagno più alto li aggiunge
    const delta = spend ? num(x.amount) - v : v - num(x.amount);
    if (num(sheetOf(e).ip) + delta < 0) return toast(`Così gli IP disponibili andrebbero a ${num(sheetOf(e).ip) + delta}: sono già stati spesi`, "err");
    ipSave(e, s => { const y = (s.ipLog || [])[i]; if (!y) return null; y.amount = v; if (!spend) y.why = why; s.ip = num(s.ip) + delta; return s; }, "Voce modificata");
  });
  $("[data-ed-del]", ed).addEventListener("click", async () => {
    const ip = num(sheetOf(e).ip);
    if (!spend) {
      if (ip - num(x.amount) < 0) return toast(`Senza questa voce gli IP disponibili andrebbero a ${ip - num(x.amount)}: sono già stati spesi`, "err");
      if (!(await askConfirm(`Eliminare la voce «${x.amount > 0 ? "+" : "−"}${Math.abs(num(x.amount))} IP${x.why ? ` · ${x.why}` : ""}»?`, "Elimina"))) return;
      return ipSave(e, s => { s.ipLog = (s.ipLog || []).filter((_, k) => k !== i); s.ip = num(s.ip) - num(x.amount); return s; }, "Voce eliminata");
    }
    const later = ipLaterOn(e, i);
    if (later) return toast(`Prima annulla l'aumento successivo: ${later.label} ${later.from} → ${later.to}`, "err");
    const now = ipLevelNow(e, x), keepLvl = now !== null && now !== x.to;
    if (!(await askConfirm(keepLvl
      ? `${x.label} ora è a ${now}, non a ${x.to} (cambiato a mano). Elimino la voce e restituisco ${num(x.amount)} IP lasciando il livello com'è?`
      : `Annullare «${x.label} ${x.from} → ${x.to}»? Torna a ${x.from} e tornano ${num(x.amount)} IP.`, "Annulla il miglioramento"))) return;
    ipSave(e, s => { s.ipLog = (s.ipLog || []).filter((_, k) => k !== i); if (!keepLvl && now !== null) ipRevert(s, e, x); s.ip = num(s.ip) + num(x.amount); return s; }, `${x.label} ${x.from} → ${x.to} annullato`);
  });
  ed.addEventListener("keydown", ev => { if (ev.key === "Enter") { ev.preventDefault(); $("[data-ed-ok]", ed).click(); } if (ev.key === "Escape") { ev.preventDefault(); ed.remove(); } });
}
async function ipSave(e, fn, msg) {
  const sh = JSON.parse(JSON.stringify(sheetOf(e)));
  const next = fn(sh); if (!next) return;
  try {
    const saved = await Store.save("entries", { ...e, sheet: next });
    upsert(state.entries, saved); liveSend("entries", saved);
    if (msg) toast(msg, "ok"); openIp(saved.id); refreshParty();
  } catch (err) { fail(err); }
}
function ipAction(el) {
  const e = state.entries.find(x => x.id === el.dataset.id); if (!e || !Store.canEdit()) return;
  const box = el.closest(".ip-box"), a = el.dataset.action;
  if (a === "ip-earn") {
    const n = Math.trunc(num($("[data-ip-amt]", box).value)), why = $("[data-ip-why]", box).value.trim();
    if (!n) return toast("Scrivi quanti IP aggiungere (o togliere, con il meno)", "err");
    if (num(sheetOf(e).ip) + n < 0) return toast(`Ne ha solo ${num(sheetOf(e).ip)}: non si può scendere sotto zero`, "err");
    return ipSave(e, s => { s.ip = num(s.ip) + n; s.ipLog = [...(s.ipLog || []), { at: new Date().toISOString(), kind: "earn", amount: n, why }]; return s; }, `${n > 0 ? "+" : "−"}${Math.abs(n)} IP`);
  }
  if (a === "ip-spend") {
    const key = $("[data-ip-target]", box).value, t = ipTargets(e).find(x => x.key === key);
    if (!t || t.cost == null) return toast("Già al massimo", "err");
    if (t.locked) return toast("Per un Ruolo nuovo serve il precedente almeno a grado 4", "err");
    if (t.cost > num(sheetOf(e).ip)) return toast(`Servono ${t.cost} IP`, "err");
    return ipSave(e, ipSpendFn(e, t), t.kind === "newrole" ? `Nuovo Ruolo: ${t.label}, grado 1 (−${t.cost} IP) · è nella tab Ruoli` : `${t.label} ${t.lvl} → ${t.lvl + 1} (−${t.cost} IP)`);
  }
  if (a === "ip-edit") return ipEdit(el);
  if (a === "ip-undo") {
    const last = (sheetOf(e).ipLog || []).slice(-1)[0]; if (!last) return;
    return ipSave(e, s => {
      s.ipLog = (s.ipLog || []).slice(0, -1);
      if (last.kind === "earn") { s.ip = Math.max(0, num(s.ip) - last.amount); return s; }
      ipRevert(s, e, last);
      s.ip = num(s.ip) + last.amount;
      return s;
    }, "Ultima voce annullata");
  }
}
