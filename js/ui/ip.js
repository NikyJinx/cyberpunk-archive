// ============================================================
//  NIGHT CITY ARCHIVE — Punti Miglioramento
//  (js/ui/: i file si caricano in ordine da index.html e condividono le costanti)
// ============================================================

// ---------- PUNTI MIGLIORAMENTO (IP) ----------
// costi del manuale: abilità 20 × nuovo livello (×2 per le abilità a costo doppio), Capacità di Ruolo 60 × nuovo grado
// Un Ruolo nuovo (dal secondo in poi) parte a grado 1 e costa 60 IP: chiave "newrole:<id>".
// sheet.ipLog = [{ at, kind: "earn" | "spend", amount, why, key, label, from, to }] (più recente in fondo)
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
      ${edit ? `<div class="ip-row"><span class="lbl">Guadagna</span><input type="number" min="1" max="999" data-ip-amt placeholder="IP" aria-label="IP guadagnati"><input data-ip-why placeholder="Perché (es. sessione 12, missione al porto)" aria-label="Motivo">
        <button type="button" class="btn small" data-action="ip-earn" data-id="${esc(e.id)}">+ Aggiungi IP</button></div>
      <div class="ip-row"><span class="lbl">Spendi</span><select data-ip-target aria-label="Cosa migliorare">
        <optgroup label="Capacità di Ruolo">${tg.filter(t => t.kind === "role").map(opt).join("") || `<option disabled>nessun Ruolo</option>`}</optgroup>
        ${tg.some(t => t.kind === "newrole") ? `<optgroup label="Nuovo Ruolo (grado 1)">${tg.filter(t => t.kind === "newrole").map(opt).join("")}</optgroup>` : ""}
        ${SK_GROUPS.map(g => { const l = tg.filter(t => t.kind === "skill" && t.group === g); return l.length ? `<optgroup label="${esc(g)}">${l.map(opt).join("")}</optgroup>` : ""; }).join("")}</select>
        <button type="button" class="btn small yellow" data-action="ip-spend" data-id="${esc(e.id)}">Migliora</button></div>` : ""}
      <h3 class="sh-h">Storico ${edit && last ? `<button type="button" class="btn ghost small" data-action="ip-undo" data-id="${esc(e.id)}" title="Annulla l'ultima voce (restituisce gli IP o li toglie)">↶ Annulla l'ultima</button>` : ""}</h3>
      ${log.length ? `<div class="gl-wrap"><table class="gl-t ip-t"><thead><tr><th>Data</th><th>Cosa</th><th>IP</th><th>Totale dopo</th></tr></thead><tbody>${(() => {
        let run = ip; return log.map(x => { const row = `<tr class="${x.kind}"><td class="gl-n">${esc(new Date(x.at).toLocaleDateString("it-IT"))}</td><td>${x.kind === "earn" ? `Guadagnati${x.why ? ` · ${esc(x.why)}` : ""}` : `${esc(x.label)} ${x.from} → ${x.to}`}</td><td class="gl-n">${x.kind === "earn" ? "+" : "−"}${x.amount}</td><td class="gl-n">${run}</td></tr>`; run += x.kind === "earn" ? -x.amount : x.amount; return row; }).join(""); })()}</tbody></table></div>`
        : `<p class="hint">Nessuna voce ancora.</p>`}
    </div>`);
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
    if (n <= 0) return toast("Scrivi quanti IP aggiungere", "err");
    return ipSave(e, s => { s.ip = num(s.ip) + n; s.ipLog = [...(s.ipLog || []), { at: new Date().toISOString(), kind: "earn", amount: n, why }]; return s; }, `+${n} IP`);
  }
  if (a === "ip-spend") {
    const key = $("[data-ip-target]", box).value, t = ipTargets(e).find(x => x.key === key);
    if (!t || t.cost == null) return toast("Già al massimo", "err");
    if (t.locked) return toast("Per un Ruolo nuovo serve il precedente almeno a grado 4", "err");
    if (t.cost > num(sheetOf(e).ip)) return toast(`Servono ${t.cost} IP`, "err");
    return ipSave(e, ipSpendFn(e, t), t.kind === "newrole" ? `Nuovo Ruolo: ${t.label}, grado 1 (−${t.cost} IP) · è nella tab Ruoli` : `${t.label} ${t.lvl} → ${t.lvl + 1} (−${t.cost} IP)`);
  }
  if (a === "ip-undo") {
    const last = (sheetOf(e).ipLog || []).slice(-1)[0]; if (!last) return;
    return ipSave(e, s => {
      s.ipLog = (s.ipLog || []).slice(0, -1);
      if (last.kind === "earn") { s.ip = Math.max(0, num(s.ip) - last.amount); return s; }
      if (last.key.startsWith("newrole:")) { migrateRoles(s, e); const rid = last.key.split(":")[1], j = s.roles.map(r => r.id).lastIndexOf(rid); if (j >= 0) s.roles.splice(j, 1); }
      else if (last.key.startsWith("role:")) { migrateRoles(s, e); const r = s.roles[num(last.key.split(":")[1])]; if (r) r.rank = last.from; }
      else if (last.key.startsWith("cskill:")) { const c = (s.custom || [])[num(last.key.split(":")[1])]; if (c) c.lvl = last.from; }
      else { s.skills = { ...(s.skills || {}) }; if (last.from) s.skills[last.key.split(":")[1]] = last.from; else delete s.skills[last.key.split(":")[1]]; }
      s.ip = num(s.ip) + last.amount;
      return s;
    }, "Ultima voce annullata");
  }
}
