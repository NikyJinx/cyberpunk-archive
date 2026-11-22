// ============================================================
//  NIGHT CITY ARCHIVE — pagina Party
//  (js/ui/: i file si caricano in ordine da index.html e condividono le costanti)
// ============================================================

// ---------- PARTY: le schede dei PG a colpo d'occhio ----------
// Tutti i giocatori possono usare tutte le schede (nel gruppo ci si fida).
const partyPgs = () => state.entries.filter(e => e.kind === "pg").sort((a, b) => (a.name || "").localeCompare(b.name || "", "it"));
function partyCard(e) {
  const id = esc(e.id), edit = Store.canEdit(), imgs = imagesOf(e);
  const head = `
    <header class="pc-head">
      <div class="pc-img">${imgs.length ? imgTag(imgs[0], e.name) : `<span>${esc(initials(e.name))}</span>`}</div>
      <div class="pc-title"><h3>${esc(e.name)}</h3>
        <div class="pc-sub">${e.handle ? `“${esc(e.handle)}” · ` : ""}${esc(e.role || "—")}${sheetOf(e).owner ? ` · <span title="Giocatore">${esc(sheetOf(e).owner.split("@")[0])}</span>` : ""}</div></div>
      ${gmBadge(e)}
    </header>`;
  if (!hasSheet(e)) return `<article class="pc-card empty-sheet">${head}<p class="hint">Scheda ancora vuota.</p>
    ${edit ? `<button type="button" class="btn small" data-action="edit-sheet" data-id="${id}">Compila la scheda</button>` : ""}</article>`;
  const max = hpMaxOf(e), hp = hpOf(e), w = woundOf(e), cs = cyberStats(e);
  const pct = clamp(max ? hp / max * 100 : 0, 0, 100);
  const roll = (what, label, cls = "chip") => `<button type="button" class="${cls}" data-action="sheet-roll" data-id="${id}" data-roll="${what}">${label}</button>`;
  // le abilità più alte, da tirare al volo
  const top = skillsOf(e).filter(k => k.lvl > 0).map(k => ({ ...k, base: statEff(e, k.stat) + k.lvl })).sort((a, b) => b.base - a.base).slice(0, 6);
  const arm = loc => spBar(loc === "head" ? "Head SP" : "Body SP", armorOf(e, loc), edit && (d => `data-action="sheet-adj" data-id="${id}" data-f="armor.${loc}" data-d="${d}"`));
  return `
    <article class="pc-card w-${w.id}">
      ${head}
      <div class="pc-hp">
        <div class="pc-hp-top"><span class="sh-k">HP</span> <b>${hp}</b><small>/ ${max}</small><span class="pc-w">${esc(w.label)}${w.pen ? ` · ${w.pen}` : ""}</span></div>
        <span class="sh-hpbar"><i style="width:${pct}%"></i><b style="left:${clamp(CPR.seriousAt(max) / max * 100, 0, 100)}%"></b></span>
        ${edit ? adjBtns(e.id, "hp", [-5, -1, 1, 5]) : ""}
      </div>
      <div class="pc-armor">${arm("head")}${arm("body")}</div>
      <div class="pc-row">
        <span><small class="sh-k">LUCK</small> <b>${luckOf(e)}</b>/${statBase(e, "LUCK")}
          ${edit ? `<button type="button" class="gp-btn" data-action="sheet-adj" data-id="${id}" data-f="luck" data-d="-1" title="Spendi 1">−</button>` : ""}</span>
        <span><small class="sh-k">HUM</small> <b>${cs.current != null ? cs.current : statBase(e, "EMP") * 10}</b></span>
        <span><small class="sh-k">REF</small> <b>${statEff(e, "REF")}</b></span>
        <span><small class="sh-k">MOVE</small> <b>${statBase(e, "MOVE") * 2}m</b></span>
      </div>
      <div class="pc-rolls">
        ${roll("init", "Initiative", "chip y")}${roll("death", "Death Save", "chip r")}
        ${top.map(k => roll(k.key, `${esc(k.label)} <b>${k.base}</b>`)).join("")}
        ${(sheetOf(e).weapons || []).map((w, i) => ({ w, i })).filter(x => !x.w.away).slice(0, 2).map(x => cbQuick(pcSrc(e, x.i))).join("")}
        ${isNetrunner(e) ? netQuick(activeDeck(e), ifaceOf(e), (w, l, c) => roll("deck:" + w, l, c)) : ""}
      </div>
      <div class="pc-foot">
        <button type="button" class="btn ghost small cyan" data-action="open-entry-tab" data-id="${id}" data-tab="sheet">Scheda completa</button>
        <button type="button" class="btn ghost small" data-action="party-as" data-id="${id}" title="Il Dice log tira a nome di questo PG">Tira come ${esc(e.name)}</button>
      </div>
    </article>`;
}
function viewParty() {
  const pgs = partyPgs();
  return `
    <div class="page-head">
      <div><div class="kicker">// CREW_MANIFEST</div><h1>Party</h1><p>Le schede dei PG: HP, armatura, fortuna e tiri veloci. Ognuno può usare qualsiasi scheda.</p></div>
      <button type="button" class="btn ghost small cyan" data-action="dice-open">⬢ Dice log</button>
    </div>
    <div id="party-grid" class="party-grid">${pgs.length ? pgs.map(partyCard).join("")
      : `<div class="empty"><div class="big">// NESSUN PG</div>Crea i personaggi del party nel Database con tipo «PG».</div>`}</div>`;
}
function refreshParty() {
  const box = $("#party-grid"); if (!box || !/^#\/party/.test(location.hash)) return;
  box.innerHTML = partyPgs().map(partyCard).join(""); hydrate(box);
}
