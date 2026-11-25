// ============================================================
//  NIGHT CITY ARCHIVE — tab Combattimento e schede delle armi (PG e nemici)
//  (js/ui/: i file si caricano in ordine da index.html e condividono le costanti)
// ============================================================

// ---------- tab COMBATTIMENTO: HP, armatura, iniziativa, stati, modificatori, armi, Critical Injury ----------
// ---------- ARMI: la stessa scheda per PG/NPC con scheda e per i nemici del GM ----------
// X = sorgente dell'arma: addendi del colpo singolo e dell'autofire, danno, tabelle delle VD, come salvare e ridisegnare.
// Colpo mirato e ultimo tiro restano in memoria (per dispositivo); munizioni e tabelle si salvano nell'arma.
const cbMem = {};
function finishSrc(X) {
  const w = X.w, T = CPR.weaponType(X.cat) || {};
  X.T = T; X.melee = CPR.isMelee(X.cat);
  X.autoMax = hasVal(w.auto) ? num(w.auto) : T.auto || 0;   // 0 = niente autofire (es. Railgun)
  X.RT = X.melee ? null : CPR.rangeById(w.range || CPR.rangeDefault(X.cat));
  X.AT = X.autoMax ? CPR.autoById(w.autoRange || CPR.autoDefault(X.cat) || "smg") : null;
  X.ammo = X.ent ? ammoOfE(X.ent, X.cat, w.ammo || "", famOfW(w, X.cat)) : ammoOf(X.cat, w.ammo || "", famOfW(w, X.cat));
  X.ammoEff = ammoEff(X.ammo);
  // caricatore: solo le armi della scheda con un caricatore (i nemici del GM non contano i colpi)
  X.fam = famOfW(w, X.cat); X.noBase = noBaseW(w);
  X.mag = X.kind === "pc" && !X.melee && X.fam ? magOf(w, X.cat) : 0;
  X.loaded = X.mag ? loadedOf(w, X.cat) : null;
  X.dmg = X.ammo.dmg && CPR.parse(X.ammo.dmg) ? X.ammo.dmg : (X.baseDmg || w.dmg || T.dmg || "");
  // autofire: danno e moltiplicatore massimo si possono cambiare per l'arma (es. modificata dal Tech)
  X.afDmg = w.afDmg && CPR.parse(w.afDmg) ? String(w.afDmg).replace(/\s+/g, "") : "2d6";
  X.afShots = num(w.afShots) || 10;
  X.suppShots = num(w.suppShots) || 10;
  // accessorio di autofire: moltiplicatore (più alto su un'arma Excellent o che l'aveva già), tabella e colpi per raffica
  const AF = attAutofire(w);
  if (AF && AF.autofire) {
    const F = AF.autofire, had = num(w.auto) || T.auto || 0;
    X.autoMax = F.up && (w.quality === "excellent" || had) ? F.up : F.mult;
    X.AT = CPR.autoById(w.autoRange || F.table || CPR.autoDefault(X.cat) || "smg");
    if (F.shots && !num(w.afShots)) X.afShots = F.shots;
  }
  const mk = MK.byId(w.market || "") || {};
  X.autoOnly = !!(w.autoOnly || mk.autoOnly) && !!X.autoMax;
  X.noAim = !!(w.noAim || mk.noAim);
  // armi a batteria senza munizioni (Taser, Microwaver, Urlatore): niente caricatore, ogni colpo consuma una carica
  X.noAmmo = !!(w.noAmmo || mk.noAmmo); if (X.noAmmo) { X.mag = 0; X.loaded = null; }
  X.noCrit = !!(w.noCrit || mk.noCrit); X.nodmg = !!(w.nodmg || mk.nodmg);
  X.base = X.single.reduce((t, p) => t + p.v, 0);
  X.afBase = X.auto.reduce((t, p) => t + p.v, 0);
  X.attrs = `data-src="${X.kind}" data-id="${esc(X.id)}" data-i="${X.i}"${X.tok ? ` data-tok="${esc(X.tok)}"` : ""}`;
  return X;
}
// qualità Excellent: +1 a colpire (le armi del Night Market la salvano nell'arma)
const qualBonus = w => w.quality === "excellent" ? [{ l: "Excellent", v: 1 }] : [];
const isSmartgun = w => /smart\s*gun|smartgun/i.test(`${w.name || ""} ${w.note || ""}`) || hasAtt(w, "smart");
const smartBonus = (e, w) => isSmartgun(w) && cyberItems(e).length && cyberFx(e).smart ? [{ l: "Smartgun Link", v: 1 }] : [];
function pcSrc(e, i) {
  const s = sheetOf(e), R = pcWeapon(e, i), w = R && R.w; if (!w || R.base.away) return null;   // lasciata a casa: niente tiri
  const k = skillByKey(e, weaponSkillKey(w.skill)) || skillByKey(e, "skill:handgun"), af = skillByKey(e, "skill:autofire");
  return finishSrc({
    kind: "pc", ent: e, id: e.id, i, key: `pc:${e.id}:${i}`, w, cat: sheetWeaponCat(w), mods: [...(s.mods || []), ...roleMods(e), ...cyberFx(e).mods], skillLabel: k.label,
    weakness: num((caOf(e) || {}).weakness),
    // munizioni High Precision: abilità dell'arma 7+ o Combat Awareness (Solo) 1+
    precOk: k.lvl >= 7 || rolesOf(e).some(r => r.id === "solo" && num(r.rank) >= 1),
    fix: r => { const ca = caOf(e); if (ca && num(ca.recover) && CPR.FIREARMS.includes(sheetWeaponCat(w)) && r.crit === "fail") { const minus = r.dice.find(d => d.t === "minus"); if (minus) { r.total += minus.v; r.dice = r.dice.filter(d => d !== minus); } r.crit = ""; r.note = "Recuperare da un Disastro: fallimento critico ignorato (il dado conta come 1)"; } },
    single: [{ l: k.stat, v: statEff(e, k.stat) }, { l: k.label, v: k.lvl }, ...skillBonusAll(e, k), ...qualBonus(w), ...smartBonus(e, w)],
    auto: [{ l: "REF", v: statEff(e, "REF") }, { l: "Autofire", v: af ? af.lvl : 0 }, ...(af ? skillBonusAll(e, af) : []), ...qualBonus(w), ...smartBonus(e, w)], afLvl: af ? af.lvl : 0,
    extra: () => sheetExtra(e), edit: Store.canEdit(),
    post: r => postRoll({ ...r, who: e.name, entryId: e.id }),
    isSub: R.k != null, two: !!w.two,
    save: (f, v) => sheetPatch(e.id, x => { const W = x.weapons && x.weapons[R.wi], T = W && (R.k == null ? W : (W.attach || [])[R.k]); if (T) T[f] = v; return x; }),
    refresh: () => refreshSheetView(e.id),
  });
}
// nemico: valori derivati dalla scheda (malus dell'armatura, bonus di ruolo); dal token valgono le sue ferite e i suoi stati
function enSrc(id, i, tokId) {
  const e = state.entries.find(x => x.id === id); if (!e || !e.enemy) return null;
  const D = enemyD(e), wp = D.weapons[i]; if (!wp) return null;
  const t = tokId ? state.tokens.find(x => x.id === tokId) : null;
  const pen = D.pen, arm = stat => pen && CPR.PEN_STATS.includes(stat) ? [{ l: "Armor", v: pen }] : [];
  const hp = t && tokHp(t), wd = hp && !D.painImmune ? CPR.painFix(CPR.wound(hp.hp, hp.max), D.painEditor) : null;
  const extra = [...(wd && wd.pen ? [{ l: wd.label, v: wd.pen }] : []), ...(t ? statusParts(t.status, D.immune) : [])];
  const af = D.skills.find(s => s.id === "autofire"), ca = D.ability && D.ability.ca;
  const raw = (enemyOf(e).weapons || [])[i] || {};
  return finishSrc({
    kind: "en", id: e.id, i, tok: t ? t.id : "", key: `en:${e.id}:${t ? t.id : "m"}:${i}`, w: { ...raw, name: wp.name }, cat: wp.cat, baseDmg: wp.dmg, mods: D.cyberMods || [], skillLabel: wp.skillLabel,
    sub: `${formula(wp, pen)}${wp.hq ? " · HQ" : wp.poor ? " · Poor: si inceppa con un 1" : ""}`,
    single: [{ l: wp.stat, v: wp.statV }, { l: wp.skillLabel, v: wp.lvl }, ...wp.bonus, ...arm(wp.stat)],
    auto: [{ l: "REF", v: D.stats.REF.v }, { l: "Autofire", v: af ? af.lvl : 0 }, ...(af ? af.bonus : []), ...wp.bonus.filter(b => b.role), ...arm("REF")], afLvl: af ? af.lvl : 0,
    extra: () => extra, edit: isGm() || !Store.gmReady,
    // Recuperare da un Disastro: sparando, il fallimento critico non toglie il secondo dado (il tiro resta un 1)
    fix: r => { if (ca && ca.recover && wp.firearm && r.crit === "fail") { const minus = r.dice.find(d => d.t === "minus"); if (minus) { r.total += minus.v; r.dice = r.dice.filter(d => d !== minus); } r.crit = ""; r.note = "Recuperare da un Disastro: fallimento critico ignorato (il tiro conta come 1)"; } },
    post: r => postRoll({ ...r, who: t ? tokName(t) : e.name, enemyId: e.id, gmOnly: !t || tokHidden(t) }),
    save: (f, v) => enemyPatch(e.id, E => { if (E.weapons && E.weapons[i]) E.weapons[i][f] = v; return E; }),
    refresh: () => { refreshEnemyView(e.id); if (onTable()) renderSel(); },
  });
}
const wSrc = (kind, id, i, tok) => kind === "en" ? enSrc(id, num(i), tok) : (() => { const e = state.entries.find(x => x.id === id); return e ? pcSrc(e, i) : null; })();
// modifica rapida di un nemico (munizioni, tabelle): salvo subito, la scheda è del GM
async function enemyPatch(id, fn) {
  const e = state.entries.find(x => x.id === id); if (!e) return;
  const rec = { ...e, enemy: fn(JSON.parse(JSON.stringify(enemyOf(e)))) };
  upsert(state.entries, rec); refreshEnemyView(id); if (onTable()) renderSel();
  try { const saved = await Store.save("entries", rec); upsert(state.entries, saved); liveSend("entries", saved); } catch (err) { fail(err); }
}
function refreshEnemyView(id) {
  const box = $(`#modal .en[data-enemy="${CSS.escape(id)}"]`), e = state.entries.find(x => x.id === id); if (!box || !e) return;
  const y = $("#modal").scrollTop; box.outerHTML = enemyHtml(e); $("#modal").scrollTop = y;
}
function cbParts(X, mode, aimLoc) {
  const auto = mode === "auto" || mode === "supp";
  const parts = [...(auto ? X.auto : X.single)];
  if (aimLoc) parts.push({ l: `Colpo mirato (${(CPR.AIMED.find(a => a.id === aimLoc) || {}).label})`, v: -8 });
  const AM = X.ammo, req = !AM.req || X.precOk !== false;
  if (num(AM.atk)) parts.push({ l: AM.name, v: num(AM.atk) });
  if (req && num(AM.atkSingle) && mode === "single" && !aimLoc) parts.push({ l: AM.name, v: num(AM.atkSingle) });
  if (req && num(AM.atkAimed) && aimLoc) parts.push({ l: AM.name, v: num(AM.atkAimed) });
  if (num(AM.atkAuto) && mode === "auto") parts.push({ l: AM.name, v: num(AM.atkAuto) });
  parts.push(...modsFor(X.mods, ["attack", X.melee ? "melee" : "ranged", ...(aimLoc ? ["aimed"] : []), ...(auto ? ["autofire"] : [])]).map(m => ({ l: m.l, v: m.v })));
  return [...parts, ...X.extra()];
}
function cbRoll(X, mode = "single") {
  if (!X) return;
  const M = cbMem[X.key] = cbMem[X.key] || {};
  const auto = mode === "auto" || mode === "supp", aimLoc = !auto && M.aim ? (M.loc || "head") : "";
  // ogni attacco spara un colpo, autofire e soppressione 10 (l'autofire di alcune armi ne spara di più: afShots)
  const shots = X.mag ? (mode === "auto" ? X.afShots : auto ? X.suppShots : 1) : 0;
  if (mode === "single" && X.autoOnly) return toast(`${X.w.name} spara solo in autofire e fuoco di soppressione`, "err");
  if (aimLoc && (X.noAim || X.ammo.noAim)) return toast(`${X.noAim ? X.w.name : X.ammo.name}: niente colpi mirati`, "err");
  // effetti speciali attivati sull'attacco (es. In Fiamme dei Nastri): consumano cariche
  const RD = X.kind === "pc" && !X.isSub ? spRiders(X) : { cost: 0, note: "" };
  if (X.kind === "pc" && X.noAmmo && chargesLeftOf(X.w) != null) RD.cost += 1;
  const chL = RD.cost ? chargesLeftOf(X.w) : null;
  if (RD.cost && chL != null && chL < RD.cost) return toast(`${X.w.name}: cariche finite (${chL}). Serve una batteria nuova`, "err");
  if (shots && X.loaded < shots) return toast(`${X.w.name}: ${X.loaded ? `solo ${X.loaded} colpi, ne servono ${shots}` : "caricatore vuoto"}. Ricarica dalla tab Combattimento`, "err");
  const r = CPR.check(cbParts(X, mode, aimLoc));
  if (X.fix) X.fix(r);
  const T = auto ? X.AT : X.RT;
  const scope = mode === "single" && hasAtt(X.w, "scope") ? 1 : 0, sc = j => scope && j >= 4 ? scope : 0;
  const bands = T ? T.dv.map((dv, j) => ({ label: CPR.RANGE_BANDS[j], dv, hit: dv != null && r.total + sc(j) > dv, mult: mode === "auto" && dv != null && r.total > dv ? Math.min(r.total - dv, X.autoMax) : 0 })) : [];
  M.last = { mode, total: r.total, crit: r.crit, bands, aim: aimLoc };
  const reach = bands.filter(b => b.hit).map(b => b.label + (b.mult ? ` ×${b.mult}` : "")).join(", ");
  const aimed = aimLoc ? CPR.AIMED.find(a => a.id === aimLoc) : null;
  const hit = X.melee ? null : T ? { ok: !!reach, table: T.label, bands: bands.filter(b => b.hit).map(b => b.label + (b.mult ? ` ×${b.mult}` : "")), text: `${T.label}: ${reach ? `colpisce a ${reach}` : "fuori portata a ogni distanza"}` } : null;
  // attacco: come prima (chi, cosa, totale e addendi) + la riga delle distanze; gli effetti stanno nel tiro del danno
  const note = [r.note || "", X.melee ? "vs DEX + Evasion + 1d10 del difensore" : "",
    mode === "supp" ? "chi è entro 25 m tira WILL + Concentration contro questo totale" : "", RD.note ? `${RD.note}${chL != null ? ` (cariche ${chL - RD.cost}/${num(X.w.charges)})` : ""}` : "", scope ? "Mirino di Precisione: +1 oltre 51 m (già contato nelle distanze)" : ""].filter(Boolean).join(" · ");
  const what = { single: aimed ? `aimed shot (${aimed.label})` : "attack", auto: `autofire ×${X.autoMax}`, supp: "suppressive fire" }[mode];
  X.post({ kind: "check", label: `${X.w.name} · ${what}${X.ammo.id ? ` · ${X.ammo.name}` : ""}${shots ? ` · ${X.loaded - shots}/${X.mag}` : ""}`, ...r, note, ...(hit ? { hit } : {}) });
  if (shots) X.save("loaded", X.loaded - shots);
  if (RD.cost && chL != null) X.save("chargesLeft", chL - RD.cost);
  if (!shots && !(RD.cost && chL != null)) X.refresh();
}
function cbDamage(X, mult) {
  if (!X) return;
  if (X.w.nodmg || X.nodmg) return X.post({ kind: "damage", label: `${X.w.name} · nessun danno`, total: 0, dice: [], mods: [], note: X.w.note || "" });
  if (X.ammo.nodmg) {
    const r = X.ammo.sdmg ? CPR.rollExpr(X.ammo.sdmg, { damage: true }) : null;
    return X.post({ kind: "damage", label: `${X.w.name} · ${X.ammo.name}${r ? ` · danni se fallisce la prova` : ""}`, ...(r || { total: 0, dice: [], mods: [] }), crit: "", note: X.ammoEff });
  }
  const L = (cbMem[X.key] || {}).last, auto = L && L.mode === "auto" && mult;
  const r = CPR.rollExpr(auto ? X.afDmg : X.dmg, { damage: true });
  if (!r) return toast(`Danno non valido: "${auto ? X.afDmg : X.dmg}"`, "err");
  if (auto && mult > 1) { const raw = r.total - (r.crit === "injury" ? 5 : 0), add = raw * (mult - 1); r.mods.push({ l: `× ${mult} autofire`, v: add }); r.total += add; }
  if (X.noCrit && r.crit === "injury") { r.crit = ""; r.total -= 5; r.mods = (r.mods || []).filter(m => m.l !== "Critical Injury"); r.note = "Quest'arma non causa Critical Injury"; }
  const weak = X.weakness && (cbMem[X.key] || {}).weak ? [{ l: "Individuare Debolezze", v: X.weakness }] : [];
  [...(num(X.ammo.dmgMod) ? [{ l: X.ammo.name, v: num(X.ammo.dmgMod) }] : []), ...modsFor(X.mods, ["damage"]), ...weak].forEach(m => { r.mods.push({ l: m.l, v: m.v }); r.total += m.v; });
  const aimed = L && L.aim && !auto ? CPR.AIMED.find(a => a.id === L.aim) : null;
  const note = [aimed ? `${aimed.label}: ${aimed.eff}` : "", X.ammoEff ? `${X.ammo.name}: ${X.ammoEff}` : "", X.kind === "pc" && !X.isSub ? spPassive(X) : "", r.crit === "injury" ? "Due 6: tira la Critical Injury dalla scheda del bersaglio" : ""].filter(Boolean).join(" · ");
  X.post({ kind: "damage", label: `${X.w.name} · damage${auto ? ` (autofire ×${mult})` : aimed ? ` (aimed: ${aimed.label})` : ""}`, ...r, note });
}
// la tabella delle VD fa parte della descrizione dell'arma; dopo un tiro segna ✓ / ✗ per ogni distanza
function cbTable(X, L) {
  if (X.melee) return `<p class="hint cb-melee">Mischia: il difensore tira DEX + Evasion + 1d10.</p>`;
  const rowsOf = (T, isAuto) => {
    if (!T) return "";
    const last = L && (isAuto ? L.mode === "auto" || L.mode === "supp" : L.mode === "single") ? L : null;
    return `<tr class="${last ? "rolled" : ""}"><th>${isAuto ? "Autofire" : "Colpo singolo"}</th>${CPR.RANGE_BANDS.map((_, j) => {
      if (j >= T.dv.length) return `<td class="na">—</td>`;
      const dv = T.dv[j], b = last && last.bands[j];
      return `<td class="${dv == null ? "na" : b ? (b.hit ? "hit" : "miss") : ""}">${dv == null ? "N/A" : dv}${b && dv != null ? `<i>${b.hit ? (b.mult ? `✓×${b.mult}` : "✓") : "✗"}</i>` : ""}</td>`;
    }).join("")}</tr>`;
  };
  const sel = (attr, list, cur, title) => X.edit ? `<select class="cb-tsel" ${attr} ${X.attrs} title="${title}" aria-label="${title}">${list.map(t => `<option value="${t.id}" ${t.id === cur ? "selected" : ""}>${esc(t.label)}</option>`).join("")}</select>` : esc((list.find(t => t.id === cur) || {}).label || "");
  return `<div class="cb-dvwrap"><table class="cb-dv">
    <thead><tr><th>VD</th>${CPR.RANGE_BANDS.map(b => `<th>${b.replace(" m", "")}</th>`).join("")}</tr></thead>
    <tbody>${rowsOf(X.RT, false)}${rowsOf(X.AT, true)}</tbody></table>
    <div class="cb-tables">${X.RT ? `Tabella ${sel("data-cb-table", CPR.RANGE_TABLES, X.RT.id, "Tabella delle distanze")}` : `<span class="hint">Nessuna tabella delle distanze</span>`}
      ${X.AT ? ` · autofire ${sel("data-cb-atable", CPR.AUTO_TABLES, X.AT.id, "Tabella dell'autofire")}` : ""}</div></div>`;
}
function cbCard(X) {
  if (!X) return "";
  const M = cbMem[X.key] || {}, L = M.last, A = X.attrs;
  const btn = (attrs, inner, cls, title = "") => `<button type="button" class="${cls}" ${attrs} ${title ? `title="${esc(title)}"` : ""}>${inner}</button>`;
  const ammoOpts = (X.ent ? ammoListE(X.ent, X.cat, X.fam) : ammoList(X.cat, X.fam)).filter(a => !X.noBase || a.id || a.id === (X.w.ammo || "x"));
  let dmg = "";
  if (L && L.mode === "auto") dmg = [...new Set(L.bands.filter(b => b.mult).map(b => b.mult))].sort((a, b) => a - b).map(m => btn(`data-action="cb-dmg" ${A} data-mult="${m}"`, `Danno ${esc(X.afDmg)} × ${m}`, "btn small yellow")).join("");
  if (X.ammo.nodmg) dmg = btn(`data-action="cb-dmg" ${A}`, X.ammo.sdmg ? `${esc(X.ammo.name)}: ${esc(X.ammo.sdmg)} se fallisce` : `Effetto ${esc(X.ammo.name)}`, "btn small yellow", X.ammoEff);
  // solo autofire: il danno compare dopo la raffica (danno dell'autofire × quanto superi la VD)
  if (!dmg && !X.autoOnly) dmg = btn(`data-action="cb-dmg" ${A}`, `Damage ${esc(X.dmg)}`, "btn small yellow", L && L.aim ? (CPR.AIMED.find(a => a.id === L.aim) || {}).eff : "");
  const sub = X.sub || `${X.T.label ? esc(X.T.label) + " · " : ""}${esc(X.skillLabel)} · base ${X.base}${X.w.rof ? ` · ROF ${esc(X.w.rof)}` : ""}${X.w.mag && !X.mag ? ` · Mag ${esc(X.w.mag)}` : ""}`;
  return `<div class="wpn cb-wpn ${X.isSub ? "cb-sub" : ""}">
    <div class="cb-wh"><span class="wpn-n"><span class="nd-name">${esc(X.w.name)}</span>
      <small>${sub}${X.autoMax ? ` · Autofire ${esc(X.afDmg)} ×${X.autoMax}` : ""} ${X.autoOnly ? "" : ` · ${X.ammo.nodmg ? `${esc(X.ammo.name)}: niente danni` : `danno ${esc(X.dmg)}`}`}</small>${X.w.note ? `<em>${esc(X.w.note)}</em>` : ""}${X.isSub && X.two ? `<em>Solo impugnando l'arma a due mani.</em>` : ""}</span>
      ${X.mag ? `<span class="cb-mag ${X.loaded ? X.loaded < Math.min(10, X.mag) && X.autoMax ? "low" : "" : "empty"}" title="Colpi nel caricatore">${X.loaded}/${X.mag}</span>` : ""}
      ${L ? `<span class="cb-last ${L.crit ? "c-" + L.crit : ""}" title="Ultimo tiro">${L.total}</span>` : ""}</div>
    <div class="cb-ctl">
      ${X.autoOnly ? `<span class="hint">Solo autofire</span>` : `${btn(`data-action="cb-roll" ${A} data-mode="single"`, `⌖ Attack <b>${X.base}</b>`, "btn small", "Tira per colpire: il risultato si segna sulla tabella delle VD")}
      ${X.noAim || X.ammo.noAim ? `<span class="hint">niente colpi mirati</span>` : `<label class="check cb-aim" title="Colpo mirato: −8 al tiro"><input type="checkbox" data-cb-aim ${A} ${M.aim ? "checked" : ""}> Mirato −8</label>
      <select class="cb-loc" data-cb-loc ${A} aria-label="Dove miri" ${M.aim ? "" : "disabled"}>${CPR.AIMED.map(a => `<option value="${a.id}" ${a.id === (M.loc || "head") ? "selected" : ""}>${a.label}</option>`).join("")}</select>`}`}
      ${X.autoMax ? btn(`data-action="cb-roll" ${A} data-mode="auto"`, `Autofire <b>${X.afBase}</b> ×${X.autoMax}`, "btn small ghost", `REF + Autofire ${X.afLvl} + 1d10, ${X.afShots} colpi: danno ${X.afDmg} × quanto superi la VD, al massimo ×${X.autoMax}`) + btn(`data-action="cb-roll" ${A} data-mode="supp"`, "Soppressione", "btn small ghost", `Fuoco di soppressione, ${X.suppShots} colpi`) : ""}
      ${ammoOpts.length > 1 || X.w.ammo ? `<label class="cb-ammo"><span class="sh-k">Munizioni</span><select data-cb-ammo ${A} ${X.edit ? "" : "disabled"} title="${X.mag ? "Cambiando tipo, i colpi nel caricatore tornano nelle scorte e ricarichi con il nuovo tipo" : "Tipo di munizioni"}">${ammoOpts.map(a => `<option value="${esc(a.id)}" ${a.id === (X.ammo.id || "") ? "selected" : ""}>${esc(a.name)}${X.mag ? ` (${ammoStockN(state.entries.find(x => x.id === X.id), X.fam, a.id)})` : ""}</option>`).join("")}</select></label>` : ""}
      ${X.mag && X.edit ? btn(`data-action="cb-reload" data-id="${esc(X.id)}" data-i="${X.i}"`, `⟳ Ricarica <small>${ammoStockN(state.entries.find(x => x.id === X.id), X.fam, X.ammo.id)} in scorta</small>`, "btn small ghost cyan", `Riempie il caricatore con le munizioni ${X.fam} · ${X.ammo.name} dell'inventario`) : ""}
      ${X.weakness ? `<label class="check cb-aim" title="Individuare Debolezze: +${X.weakness} al danno del primo colpo a segno del round (prima dell'armatura)"><input type="checkbox" data-cb-weak ${A} ${M.weak ? "checked" : ""}> 1° colpo del round +${X.weakness}</label>` : ""}
      <span class="cb-dmg">${dmg}</span>
    </div>
    ${X.ammoEff ? `<p class="hint">${esc(X.ammo.name)}: ${esc(X.ammoEff)}</p>` : ""}
    ${X.kind === "pc" && !X.isSub ? spHtml(X) : ""}
    ${X.kind === "pc" && !X.melee && !X.isSub ? attHtml(X.ent, X.i, X.w, X.edit) : ""}
    ${X.kind === "pc" && !X.isSub ? attAttacks(X.ent, X.i).map(x => cbCard(pcSrc(X.ent, `${X.i}.${x.k}`))).join("") : ""}
    ${M.aim ? `<p class="hint">${esc((CPR.AIMED.find(a => a.id === (M.loc || "head")) || {}).eff || "")}</p>` : ""}
    ${cbTable(X, L)}
  </div>`;
}
// tiri rapidi (Party, token): attacco e danno
const cbQuick = (X, cls = "chip") => !X ? "" : `<button type="button" class="${cls}" data-action="cb-roll" ${X.attrs} data-mode="single">⌖ ${esc(X.w.name)} <b>${X.base}</b></button>`
  + (X.autoMax ? `<button type="button" class="${cls}" data-action="cb-roll" ${X.attrs} data-mode="auto" title="Autofire">AF <b>${X.afBase}</b></button>` : "")
  + `<button type="button" class="${cls} y" data-action="cb-dmg" ${X.attrs}>${esc(X.dmg)}</button>`;

// armi lasciate a casa: in fondo alla tab Combattimento, senza tiri finché non le porti con te
function awayBox(e, edit) {
  const list = (sheetOf(e).weapons || []).map((w, i) => ({ w, i })).filter(x => x.w.away);
  if (!list.length) return "";
  return `<div class="cb-away"><div class="sh-sec-head"><h4>🏠 A casa</h4><span class="hint">non si possono usare finché non le porti con te</span></div>
    <ul>${list.map(({ w, i }) => { const T = CPR.weaponType(sheetWeaponCat(w)) || {};
      return `<li><span><b>${esc(w.name || T.label || "Arma")}</b> <small>${esc([T.label && T.label !== w.name ? T.label : "", w.dmg || T.dmg, w.mag ? `Car. ${w.mag}` : ""].filter(Boolean).join(" · "))}</small></span>
        ${edit ? `<button type="button" class="btn ghost small g-act" data-action="wpn-away" data-id="${esc(e.id)}" data-i="${i}">🎒 Porta con sé</button>` : ""}</li>`; }).join("")}</ul></div>`;
}
function combatHtml(e) {
  const s = sheetOf(e), edit = Store.canEdit(), id = esc(e.id);
  if (!hasSheet(e)) return `<div class="cb" data-combat="${id}"><div class="empty"><div class="big">// SCHEDA VUOTA</div>Compila prima la scheda.
    ${edit ? `<br><button class="btn" data-action="edit-sheet" data-id="${id}">Compila la scheda</button>` : ""}</div></div>`;
  const max = hpMaxOf(e), hp = hpOf(e), w = woundOf(e);
  const pct = v => Math.max(0, Math.min(100, max ? v / max * 100 : 0));
  const roll = (what, inner, cls = "", title = "") => `<button type="button" class="${cls}" data-action="sheet-roll" data-id="${id}" data-roll="${what}" ${title ? `title="${esc(title)}"` : ""}>${inner}</button>`;
  const arm = loc => spBar(loc === "head" ? "Head" : "Body", armorOf(e, loc), edit && (d => `data-action="sheet-adj" data-id="${id}" data-f="armor.${loc}" data-d="${d}"`));
  const weapons = s.weapons || [];
  const mods = (s.mods || []).filter(m => m.on !== false && num(m.value));
  const im = modsFor([...(s.mods || []), ...roleMods(e), ...cyberFx(e).mods], ["init"]).reduce((t, m) => t + m.v, 0);
  const ca = caOf(e);
  return `
    <div class="cb sh" data-combat="${id}">
      <div class="sh-bar">
        <label class="sh-mod" title="Modificatore situazionale aggiunto a tutti i tiri (es. −2 copertura, +1 mira)">MOD <input type="number" step="1" data-sheet-mod value="${sheetMod}"></label>
        <span class="hint">Spunta «Mirato» e scegli le munizioni prima di attaccare · il tiro si segna sulla tabella delle VD.</span>
        <button type="button" class="btn ghost small cyan" data-action="dice-open">⬢ Dice log</button>
      </div>
      <div class="sh-top">
        <div class="sh-box hp w-${w.id}">
          <span class="l">Hit Points</span>
          <span class="n">${hp}<small> / ${max}</small></span>
          <span class="sh-hpbar"><i style="width:${pct(hp)}%"></i><b style="left:${pct(CPR.seriousAt(max))}%" title="Seriously Wounded"></b></span>
          <span class="sh-sub">${w.label}${w.pen ? ` · ${w.pen} to all Actions` : ""}</span>
          ${ca && num(ca.deflect) ? `<span class="sh-sub rl-hint">Deflettere Danni: −${num(ca.deflect)} al primo danno subito nel round</span>` : ""}
          ${edit ? adjBtns(e.id, "hp", [-5, -1, 1, 5]) : ""}
        </div>
        <div class="sh-box"><span class="l">Armor · SP</span>${arm("head")}${arm("body")}</div>
        <div class="sh-box">
          <span class="l">Initiative</span>
          ${roll("init", `<span class="n">REF ${statEff(e, "REF")}${im ? ` <small>${im > 0 ? "+" : ""}${im}</small>` : ""}</span><span class="sh-sub">tira REF + 1d10</span>`, "sh-rollbox")}
        </div>
        <div class="sh-box">
          <span class="l">Death Save</span>
          ${roll("death", `<span class="n">${statBase(e, "BODY")}</span><span class="sh-sub">BODY · penalty +${num(s.dsp)}</span>`, "sh-rollbox", "Tira 1d10 + penalità contro BODY")}
          ${edit ? adjBtns(e.id, "dsp", [-1, 1]) : ""}
        </div>
        <div class="sh-box"><span class="l">Move</span><span class="n">${statEff(e, "MOVE") * 2}<small> m/turn</small></span><span class="sh-sub">${statEff(e, "MOVE")} squares · Run ${runOf(e)} m</span></div>
        <div class="sh-box"><span class="l">Evasion</span>${(() => { const k = skillByKey(e, "skill:evasion"); return roll("skill:evasion", `<span class="n">${statEff(e, "DEX") + (k ? k.lvl : 0)}</span><span class="sh-sub">DEX + Evasion${statEff(e, "REF") >= 8 ? " · schivi anche i proiettili" : ""}</span>`, "sh-rollbox", "Tira DEX + Evasion + 1d10"); })()}</div>
      </div>
      ${pcPen(e) ? `<div class="en-pen">Armatura pesante: ${pcPenTxt(e)} (già calcolato nei valori e nei tiri)</div>` : ""}
      <div class="sh-status"><span class="sh-k">Stati</span>${statusChips(s.status, edit ? sheetStatusAttrs(e) : null)}</div>
      ${mods.length ? `<div class="sh-mods"><span class="sh-k">Modificatori speciali</span>${mods.map(m => `<span class="st-chip" title="${esc(m.note || "")}">${esc(m.name || "Modificatore")} <b>${num(m.value) > 0 ? "+" : ""}${num(m.value)}</b> <small>${esc((CPR.MOD_TARGETS.find(t => t[0] === m.target) || [, ""])[1])}</small></span>`).join("")}</div>` : ""}
      ${cyberFxHtml(e, true)}
      <div class="sh-sec-head"><h4>Weapons</h4></div>
      ${weapons.some(w => !w.away) ? `<div class="sh-weapons">${weapons.map((w, i) => w.away ? "" : cbCard(pcSrc(e, i))).join("")}</div>`
        : `<p class="hint">${weapons.length ? "Tutte le armi sono a casa: portane una con te qui sotto o dall'Equipaggiamento." : "Nessuna arma: aggiungile da «Modifica scheda»."}</p>`}
      ${awayBox(e, edit)}
      ${critBlock(e, edit)}
    </div>`;
}
// ---------- creazione del PG: Pacchetto Completo (punti) del manuale base ----------
// STAT: i punti del grado scelto (di solito 62), ognuna tra 2 e 8.
// Abilità: 86 punti, nessuna oltre 6, le abilità base almeno a 2, quelle ×2 costano il doppio;
// in più 4 livelli gratis nella lingua del Background Culturale (Language o un'abilità personalizzata «Language …»).
// Contano solo i valori di creazione: i livelli comprati con gli IP (storico IP) si tolgono, e cyberware e bonus
// non entrano perché nel modulo le STAT e le abilità sono quelle base (i bonus stanno a parte, nelle celle «+»).
const CR_GRADES = [[50, "Personaggio Secondario Minore"], [62, "Personaggio Iniziale"], [70, "Personaggio Secondario Maggiore"], [75, "Eroe Minore"], [80, "Eroe Maggiore"]];
const CR_SKILL_PTS = 86, CR_LANG_FREE = 4;
const crIsLang = name => /^(language|linguaggio|lingua)\b/i.test(String(name || "").trim()) && !/streetslang/i.test(name);
function crBoxHtml(s, fresh) {
  const pts = num(s.createPts) || 62;
  return `<details class="cr-box" id="cr-box" ${fresh ? "open" : ""}>
    <summary><b>Creazione · Pacchetto Completo</b>
      <span class="cr-c" id="cr-st"></span><span class="cr-c" id="cr-sk"></span><span class="cr-c" id="cr-warn"></span></summary>
    <div class="cr-body">
      <label>Grado del personaggio <select name="createPts">${CR_GRADES.map(([n, l]) => `<option value="${n}" ${n === pts ? "selected" : ""}>${l} · ${n} punti STAT</option>`).join("")}</select></label>
      <p class="hint">STAT tra 2 e 8 · ${CR_SKILL_PTS} punti abilità, nessuna oltre 6 · le abilità base (●) almeno a 2 · ×2 = due punti per livello · ${CR_LANG_FREE} livelli gratis nella lingua del Background Culturale. Contano solo i valori di creazione: i livelli comprati con gli IP si tolgono da soli, cyberware e bonus non entrano. Sono solo contatori: la scheda si salva comunque.</p>
      <p class="hint" id="cr-ip" hidden></p>
      <ul class="cr-list" id="cr-list"></ul>
    </div></details>`;
}
// livelli presi con gli IP per ogni abilità («skill:id» o «cskill:indice»), dallo storico
function crIpRaises(s) {
  const out = {};
  for (const x of s.ipLog || []) if (x.kind === "spend" && /^c?skill:/.test(x.key || "")) out[x.key] = (out[x.key] || 0) + Math.max(0, num(x.to) - num(x.from));
  return out;
}
function crUpdate(form, raises = {}) {
  const box = $("#cr-box", form); if (!box) return;
  const val = n => { const i = form.elements[n]; return i && i.value.trim() !== "" ? num(i.value) : null; };
  const pts = num(form.elements["createPts"].value) || 62, bad = [];
  $$(".cr-bad", form).forEach(i => i.classList.remove("cr-bad"));
  const flag = (n, msg) => { const i = form.elements[n]; if (i && i.classList) i.classList.add("cr-bad"); bad.push(msg); };
  let st = 0; const empty = [];
  for (const s of CPR.STATS) {
    const v = val("st-" + s.id); st += v || 0;
    if (v == null) empty.push(s.id);
    else if (v < 2 || v > 8) flag("st-" + s.id, `${s.id} ${v}: deve stare tra 2 e 8`);
  }
  if (empty.length) bad.push(`STAT da riempire: ${empty.join(", ")}`);
  // abilità: livelli × costo, poi i livelli gratis della lingua più alta
  let sk = 0, lang = 0, fromIp = 0;
  const base = (key, v) => { const r = Math.min(v, raises[key] || 0); fromIp += r; return v - r; };
  for (const k of CPR.SKILLS) {
    const v = base("skill:" + k.id, val("sk-" + k.id) || 0); sk += v * (k.x2 ? 2 : 1);
    if (k.id === "language") lang = Math.max(lang, v);
    if (v > 6) flag("sk-" + k.id, `${k.label} ${v}: massimo 6`);
    if (k.basic && v < 2) flag("sk-" + k.id, `${k.label} è un'abilità base: almeno 2`);
  }
  $$("#sh-cus .sh-row", form).forEach((row, i) => row.dataset.crI = i);
  for (const row of $$("#sh-cus .sh-row", form)) {
    const name = $("[data-f=name]", row).value.trim(), li = $("[data-f=lvl]", row), v = base("cskill:" + row.dataset.crI, num(li.value));
    if (!name || !v) continue;
    sk += v; if (crIsLang(name)) lang = Math.max(lang, v);
    if (v > 6) { li.classList.add("cr-bad"); bad.push(`${name} ${v}: massimo 6`); }
  }
  sk -= Math.min(CR_LANG_FREE, lang);
  const ipNote = $("#cr-ip", form); ipNote.hidden = !fromIp;
  ipNote.textContent = `Esclusi ${fromIp} livelli di abilità comprati con gli IP (dallo storico IP): qui conta solo la creazione.`;
  const side = (used, tot) => used === tot ? "ok" : used > tot ? "over" : "left";
  const txt = (used, tot) => used === tot ? "tutti spesi" : used > tot ? `${used - tot} di troppo` : `restano ${tot - used}`;
  const sst = side(st, pts), ssk = side(sk, CR_SKILL_PTS);
  $("#cr-st", form).className = "cr-c " + sst; $("#cr-st", form).textContent = `STAT ${st} / ${pts} · ${txt(st, pts)}`;
  $("#cr-sk", form).className = "cr-c " + ssk; $("#cr-sk", form).textContent = `Abilità ${sk} / ${CR_SKILL_PTS} · ${txt(sk, CR_SKILL_PTS)}`;
  if (!lang) bad.push(`Nessuna lingua del Background Culturale: metti Language (o un'abilità «Language …») a ${CR_LANG_FREE}, sono gratis`);
  // ✓ solo quando tornano anche i punti; se mancano solo quelli bastano i due contatori
  const w = $("#cr-warn", form), allOk = !bad.length && sst === "ok" && ssk === "ok";
  w.hidden = !bad.length && !allOk;
  w.className = "cr-c " + (bad.length ? "over" : "ok");
  w.textContent = bad.length ? `⚠ ${bad.length} da sistemare` : "✓ tutto secondo le regole";
  $("#cr-list", form).innerHTML = bad.map(b => `<li>${esc(b)}</li>`).join("");
}
function editSheet(id) {
  const e = state.entries.find(x => x.id === id); if (!e) return;
  const fresh = !e.sheet;
  const s = sheetOf(e), stats = s.stats || {}, lv = s.skills || (fresh ? Object.fromEntries(CPR.SKILLS.filter(k => k.basic).map(k => [k.id, 2])) : {});
  const statOpts = v => CPR.STATS.map(st => `<option ${st.id === v ? "selected" : ""}>${st.id}</option>`).join("");
  const cusRow = (c = {}) => `<div class="sh-row cus">
    <input data-f="name" placeholder="es. Language (Japanese)" value="${esc(c.name)}">
    <select data-f="group">${SK_GROUPS.map(g => `<option ${g === (c.group || "Other") ? "selected" : ""}>${g}</option>`).join("")}</select>
    <select data-f="stat">${statOpts(c.stat || "INT")}</select>
    <input data-f="lvl" type="number" min="0" max="10" step="1" placeholder="LVL" value="${esc(c.lvl ?? "")}">
    <button type="button" class="gp-btn del" data-row-del aria-label="Rimuovi">✕</button></div>`;
  const wpnRow = (w = {}) => `<div class="sh-row wpn-row">
    <select data-f="cat" title="Categoria: decide VD delle distanze e autofire">${CPR.WEAPON_TYPES.map(t => `<option value="${t.id}" ${t.id === (w.name || w.cat ? (w.cat || CPR.guessWeapon(w.name, w.skill)) : "hpistol") ? "selected" : ""}>${t.label}</option>`).join("")}<option value="" ${(w.name || w.cat) && !(w.cat || CPR.guessWeapon(w.name, w.skill)) ? "selected" : ""}>Altro…</option></select>
    <input data-f="name" placeholder="Arma (es. Heavy Pistol)" value="${esc(w.name)}">
    <select data-f="skill">${CPR.WEAPON_SKILLS.map(k => `<option value="${k}" ${k === (w.skill || "handgun") ? "selected" : ""}>${CPR.skill(k).label}</option>`).join("")}</select>
    <input data-f="dmg" placeholder="Danno (3d6)" value="${esc(w.dmg)}">
    <input data-f="rof" placeholder="ROF" value="${esc(w.rof)}">
    <input data-f="mag" placeholder="Mag" value="${esc(w.mag)}">
    <input data-f="afDmg" placeholder="Autofire 2d6" title="Danno dell'autofire (vuoto = 2d6). Vale anche 3d6kh2 = tira 3d6 e tieni i 2 più alti" value="${esc(w.afDmg || "")}">
    <input data-f="auto" type="number" min="0" max="10" placeholder="× max" title="Moltiplicatore massimo dell'autofire (vuoto = quello della categoria: SMG 3, fucile d'assalto 4; 0 o vuoto su armi senza autofire)" value="${esc(w.auto ?? "")}">
    <input data-f="note" placeholder="Note (Smartgun, Excellent…)" value="${esc(w.note)}">
    <input type="hidden" data-f="away" value="${w.away ? "1" : ""}"><input type="hidden" data-f="afShots" value="${esc(w.afShots || "")}"><input type="hidden" data-f="quality" value="${esc(w.quality || "")}"><input type="hidden" data-f="market" value="${esc(w.market || "")}"><input type="hidden" data-f="ammo" value="${esc(w.ammo || "")}"><input type="hidden" data-f="range" value="${esc(w.range || "")}"><input type="hidden" data-f="autoRange" value="${esc(w.autoRange || "")}"><input type="hidden" data-f="loaded" value="${esc(w.loaded ?? "")}"><input type="hidden" data-f="slots" value="${esc(w.slots ?? "")}"><input type="hidden" data-f="attach" value="${esc(w.attach && w.attach.length ? JSON.stringify(w.attach) : "")}"><input type="hidden" data-f="xtra" value="${esc(w.specials || w.charges || w.autoOnly || w.noAim || w.suppShots ? JSON.stringify({ specials: w.specials, charges: w.charges, chargesLeft: w.chargesLeft, batteryCost: w.batteryCost, autoOnly: w.autoOnly, noAim: w.noAim, suppShots: w.suppShots }) : "")}">
    <button type="button" class="gp-btn del" data-row-del aria-label="Rimuovi">✕</button></div>`;
  const modRow = (m = {}) => `<div class="sh-row mod-row">
    <label class="check" title="Attivo"><input type="checkbox" data-f="on" ${m.on === false ? "" : "checked"}></label>
    <input data-f="name" placeholder="Nome (es. Mirino ottico)" value="${esc(m.name || "")}">
    <select data-f="target">${CPR.MOD_TARGETS.map(([v, l]) => `<option value="${v}" ${v === (m.target || "attack") ? "selected" : ""}>${l}</option>`).join("")}</select>
    <input data-f="value" type="number" min="-20" max="20" placeholder="±" value="${esc(m.value ?? "")}">
    <input data-f="note" placeholder="Note (da dove viene)" value="${esc(m.note || "")}">
    <button type="button" class="gp-btn del" data-row-del aria-label="Rimuovi">✕</button></div>`;
  const a = loc => (s.armor || {})[loc] || {};
  const autoHp = CPR.hpMax(num(stats.BODY), num(stats.WILL));
  bnFormStart(e);
  openModal(`
    <form class="form" id="sheet-form">
      <div class="modal-head"><h2>// SCHEDA · ${esc(e.name)}</h2><button type="button" class="x" data-action="open-entry-tab" data-id="${esc(e.id)}" data-tab="sheet" aria-label="Chiudi">×</button></div>
      <div class="modal-body">
        ${e.kind === "pg" ? crBoxHtml(s, fresh) : ""}
        <h3 class="sh-h">STATs</h3>
        <div class="sh-stat-in">${CPR.STATS.map(st => `<div class="st-ed"><label><span>${st.id}</span><input name="st-${st.id}" type="number" min="0" max="20" step="1" value="${esc(stats[st.id] ?? "")}" title="${st.label}"></label>${bnCellHtml("STAT:" + st.id)}</div>`).join("")}</div>
        <p class="hint">HP max calcolati: <b id="sh-auto-hp">${autoHp}</b> (10 + 5 × (BODY + WILL) / 2, arrotondato per eccesso). L'EMP si abbassa da sola con l'umanità del cyberware.</p>
        <div class="fields">
          <div class="field full"><span class="lbl">Ruoli e gradi</span><span class="hint">Si gestiscono nella tab «Ruoli» del dossier (anche più di uno): ${esc(rolesOf(e).map(r => `${(RL.roleById(r.id) || {}).it} ${num(r.rank)}`).join(", ") || "nessuno")}.</span></div>
          <div class="field"><label for="sh-hpm">HP max (vuoto = automatici)</label><input id="sh-hpm" name="hpMax" type="number" min="1" value="${esc(s.hpMax ?? "")}" placeholder="${autoHp}"></div>
          <div class="field"><label for="sh-hp">HP attuali (vuoto = pieni)</label><input id="sh-hp" name="hp" type="number" value="${esc(s.hp ?? "")}"></div>
          ${[["head", "ah", "testa"], ["body", "ab", "corpo"]].map(([loc, p, l]) => { const ar = a(loc), inv = armorItems(e).filter((x, i, all) => armorInfo(x.it).locs.includes(loc) && all.findIndex(y => armorInfo(y.it).locs.includes(loc) && norm2(y.it.name) === norm2(x.it.name)) === i);
            const has = ar.name && inv.some(x => norm2(x.it.name) === norm2(ar.name));
            return `
          <div class="field"><label for="sh-${p}">Armatura ${l}</label>
            <select id="sh-${p}" name="${p}-item"><option value="">— nessuna —</option>${inv.map(({ it }) => { const A = armorInfo(it); return `<option value="${esc(it.name)}" ${norm2(ar.name) === norm2(it.name) ? "selected" : ""}>${esc(it.name)}${A.sp ? ` (SP ${A.sp}${A.pen ? `, ${A.pen}` : ""})` : ""}${A.both ? " · testa e corpo" : ""}</option>`; }).join("")}
              ${ar.name && !has ? `<option value="__keep" selected>${esc(ar.name)} (SP ${num(ar.sp)}) · non è nell'inventario</option>` : ""}</select>
            <span class="hint">${inv.length ? `Solo le armature dell'Equipaggiamento per la ${l}.` : `Nessuna armatura per la ${l} nell'Equipaggiamento: comprala al Night Market.`}</span></div>`; }).join("")}
          <div class="field full"><label class="check"><input type="checkbox" name="armorNoPen" ${s.armorNoPen ? "checked" : ""}> Armatura migliorata dal Tech: niente malus</label>
            <span class="hint">Medium e Heavy Armorjack danno −2 a REF, DEX e MOVE; Flak e Metalgear −4. Vale il peggiore tra testa e corpo.</span></div>
          <div class="field"><label for="sh-rep">Reputation</label><input id="sh-rep" name="rep" type="number" min="0" value="${esc(s.rep ?? "")}"></div>
          <div class="field"><label for="sh-ip">Improvement Points</label><input id="sh-ip" name="ip" type="number" min="0" value="${esc(s.ip ?? "")}"></div>
          <div class="field full"><label for="sh-own">Giocatore (email dell'account)</label><input id="sh-own" name="owner" type="email" value="${esc(s.owner || "")}" placeholder="email con cui il giocatore fa login"><span class="hint">Serve per riconoscere il PG di chi ha fatto l'accesso: i tiri partono a suo nome.</span></div>
        </div>

        <h3 class="sh-h">Skills <small>livello 0–10 · STAT tra parentesi</small></h3>
        <div class="sh-skill-in">${CPR.SKILL_GROUPS.map(g => `<fieldset><legend>${g.name}</legend>${g.skills.map(k => `
          <div class="sk-ed"><label class="${k.basic ? "basic" : ""}"><span>${esc(k.label)} <small>(${k.stat})${k.x2 ? " ×2" : ""}</small></span><input name="sk-${k.id}" type="number" min="0" max="10" step="1" value="${esc(lv[k.id] ?? "")}"></label>${bnCellHtml("skill:" + k.id)}</div>`).join("")}</fieldset>`).join("")}</div>
        <span class="lbl">Abilità personalizzate</span>
        <div class="sh-rows" id="sh-cus">${(s.custom || []).map(cusRow).join("")}</div>
        <button type="button" class="btn ghost small cyan" data-sh-add="cus">+ Abilità (Language, Science, Local Expert…)</button>

        <h3 class="sh-h">Weapons</h3>
        <div class="sh-rows" id="sh-wpn">${(s.weapons || []).map(wpnRow).join("")}</div>
        <button type="button" class="btn ghost small cyan" data-sh-add="wpn">+ Arma</button>

        <h3 class="sh-h">Modificatori speciali <small>cyberware, talenti, situazioni fisse · si sommano da soli ai tiri del tipo scelto</small></h3>
        <div class="sh-rows" id="sh-mods">${(s.mods || []).map(modRow).join("")}</div>
        <button type="button" class="btn ghost small cyan" data-sh-add="mod">+ Modificatore (es. Mirino ottico +1 ai colpi mirati)</button>

        <div class="fields" style="margin-top:18px">
          <div class="field full"><label for="sh-crit">Critical Injuries</label><textarea id="sh-crit" name="crit" rows="2">${esc(s.crit || "")}</textarea></div>
          <div class="field full"><label for="sh-notes">Notes</label><textarea id="sh-notes" name="notes" rows="3">${esc(s.notes || "")}</textarea></div>
        </div>
      </div>
      <div class="modal-foot">
        <button type="button" class="btn ghost small left" data-action="open-entry-tab" data-id="${esc(e.id)}" data-tab="sheet">Annulla</button>
        <button type="submit" class="btn">Salva scheda</button>
      </div>
    </form>`);
  const form = $("#sheet-form");
  bnFormBind(form);
  // il riquadro della creazione si ferma sotto l'intestazione (anche lei fissa) della finestra
  const crBox = $("#cr-box", form), head = $(".modal-head", form);
  if (crBox && head) crBox.style.setProperty("--cr-top", head.offsetHeight + "px");
  const crRaises = crIpRaises(s), cr = () => crUpdate(form, crRaises);
  cr();
  form.addEventListener("input", cr);
  form.addEventListener("change", cr);
  form.addEventListener("click", ev => { if (ev.target.closest("[data-row-del]")) setTimeout(cr, 0); });
  form.addEventListener("input", ev => {
    if (/^st-(BODY|WILL)$/.test(ev.target.name)) $("#sh-auto-hp").textContent = CPR.hpMax(num(form["st-BODY"].value), num(form["st-WILL"].value));
  });
  // tipo di armatura scelto: compilo SP e nome
  form.addEventListener("change", ev => {
    // categoria dell'arma: compilo danno, ROF, caricatore e skill (il nome solo se è vuoto o generico)
    const wc = ev.target.closest(".wpn-row [data-f=cat]");
    if (wc) {
      const T = CPR.weaponType(wc.value), row = wc.closest(".sh-row"), set = (f, v) => { const i = $(`[data-f=${f}]`, row); if (i) i.value = v ?? ""; };
      set("range", ""); set("autoRange", "");
      if (T) { set("skill", T.skill); set("dmg", T.dmg === "BODY" ? CPR.brawlDmg(num(form["st-BODY"].value)) : T.dmg); set("rof", T.rof); set("mag", T.mag || "");
        const nm = $("[data-f=name]", row).value.trim(); if (!nm || CPR.WEAPON_TYPES.some(x => x.label === nm)) set("name", T.label); }
      return;
    }
    // armatura scelta dall'inventario: una tuta intera (testa e corpo) va su entrambe le zone
    const as = ev.target.closest("[name=ah-item], [name=ab-item]"); if (!as || !as.value || as.value === "__keep") return;
    const it = armorItems(e).find(x => x.it.name === as.value); if (!it || !armorInfo(it.it).both) return;
    form.elements[as.name === "ah-item" ? "ab-item" : "ah-item"].value = as.value;
  });
  form.addEventListener("click", ev => {
    const add = ev.target.closest("[data-sh-add]");
    if (add) {
      const kind = add.dataset.shAdd, box = $(kind === "cus" ? "#sh-cus" : kind === "mod" ? "#sh-mods" : "#sh-wpn", form);
      box.insertAdjacentHTML("beforeend", kind === "cus" ? cusRow() : kind === "mod" ? modRow() : wpnRow());
      $(".sh-row:last-child input", box).focus();
    }
    const del = ev.target.closest("[data-row-del]"); if (del) del.closest(".sh-row").remove();
  });
  form.addEventListener("submit", async ev => {
    ev.preventDefault();
    const v = n => form[n].value.trim(), nv = n => v(n) === "" ? null : num(v(n));
    const stats = {}, skills = {};
    for (const st of CPR.STATS) { const x = nv("st-" + st.id); if (x != null) stats[st.id] = x; }
    for (const k of CPR.SKILLS) { const x = nv("sk-" + k.id); if (x) skills[k.id] = x; }
    const custom = readRows(form, "#sh-cus .sh-row").filter(c => c.name).map(c => ({ ...c, lvl: num(c.lvl) }));
    const weapons = readRows(form, "#sh-wpn .sh-row").filter(w => w.name).map(({ away, loaded, slots, attach, xtra, afShots, ...w }) => ({ ...(xtra ? (() => { try { return JSON.parse(xtra); } catch { return {}; } })() : {}), ...w, auto: w.auto === "" ? "" : num(w.auto), ...(away ? { away: true } : {}), ...(num(afShots) ? { afShots: num(afShots) } : {}),
      ...(loaded !== "" && loaded != null ? { loaded: num(loaded) } : {}), ...(slots !== "" && slots != null ? { slots: num(slots) } : {}), ...(attach ? (() => { try { return { attach: JSON.parse(attach) }; } catch { return {}; } })() : {}) }));
    const badW = weapons.filter(w => (w.dmg && !CPR.parse(w.dmg)) || (w.afDmg && !CPR.parse(w.afDmg)));
    if (badW.length) return toast(`Danno non valido in: ${badW.map(w => w.name).join(", ")} (es. 3d6, 2d6+2, 3d6kh2)`, "err");
    const mods = readRows(form, "#sh-mods .sh-row").filter(m => m.name || num(m.value)).map(m => ({ ...m, value: num(m.value) }));
    // la SP attuale (ablazione) resta, ma non oltre la nuova SP massima
    const armor = {}; let gear = e.gear;
    for (const [loc, p] of [["head", "ah"], ["body", "ab"]]) {
      const pick = form.elements[p + "-item"].value, old = (s.armor || {})[loc] || {};
      if (pick === "__keep") { armor[loc] = old; continue; }        // armatura vecchia, non nell'inventario: resta com'è
      // con lo stesso nome, prima quella già per questa zona
      const it = pick && armorItems(e).filter(x => x.it.name === pick && armorInfo(x.it).locs.includes(loc)).sort((x, y) => armorInfo(y.it).fixed - armorInfo(x.it).fixed)[0]; if (!it) continue;
      const A = armorInfo(it.it), same = norm2(old.name) === norm2(A.name);
      // stessa armatura: la SP attuale (ablazione) resta; un'armatura nuova parte piena
      armor[loc] = { name: A.name, sp: A.sp, cur: same && hasVal(old.cur) ? Math.min(num(old.cur), A.sp) : A.sp, type: A.type, pen: A.pen, ...(A.penBy ? { penBy: A.penBy } : {}) };
      if (!A.fixed) gear = gearWithLoc({ gear }, it.gi, loc);   // senza zona: da ora è per questa
    }
    // un'armatura sola nell'inventario non copre due zone (salvo le tute intere)
    const twice = armor.head && armor.body && norm2(armor.head.name) === norm2(armor.body.name) && armor.head !== ((s.armor || {}).head) ? armorItems(e).find(x => norm2(x.it.name) === norm2(armor.head.name) && !armorInfo(x.it).fixed) : null;
    if (twice && !armorInfo(twice.it).both && Math.max(1, num(twice.it.qty)) < 2) return toast(`Hai una sola ${twice.it.name}: non copre testa e corpo insieme`, "err");
    const sheet = { ...migrateRoles(JSON.parse(JSON.stringify(s)), e), owner: v("owner"), stats, skills, custom, weapons, armor, armorNoPen: form.elements["armorNoPen"].checked,
      hpMax: nv("hpMax"), hp: nv("hp"), rep: nv("rep"), ip: nv("ip"), crit: v("crit"), notes: v("notes"), mods, bonuses: bnFormBonuses(),
      ...(form.elements["createPts"] ? { createPts: num(form.elements["createPts"].value) || 62 } : {}) };
    try {
      const saved = await Store.save("entries", { ...e, sheet, ...(gear ? { gear } : {}) });
      upsert(state.entries, saved); liveSend("entries", saved);
      toast("Scheda salvata", "ok"); openEntry(saved.id, "sheet"); refreshParty();
      if (onTable()) { renderTokens(); renderSide(); }
    } catch (err) { fail(err); }
  });
}
