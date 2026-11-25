// ============================================================
//  NIGHT CITY ARCHIVE — tipi di munizione del manuale, munizioni modificate, accessori delle armi
//  (js/ui/: i file si caricano in ordine da index.html e condividono le costanti)
// ============================================================

// ---------- TIPI DI MUNIZIONE DEL MANUALE ----------
// calibri del sito (CPR.WEAPON_TYPES[].ammo): «Proiettili» = pistole e fucili, «Slug» = shotgun (slug e cartucce a pallini)
// nodmg: non fa danni, il pulsante del danno tira «sdmg» (se c'è) o mostra l'effetto · dv: VD della prova della vittima
// {dv} e {sdmg} nell'effetto si sostituiscono con i valori (anche quelli cambiati nelle munizioni modificate)
const AM_P = ["Pistola Media", "Pistola Pesante", "Pistola Molto Pesante", "Fucile"], AM_S = "Slug", AM_A = "Frecce", AM_G = "Granate", AM_R = "Razzi";
const AMMO_BASE = [
  { id: "bio", name: "A Biotossina", fams: [AM_A, AM_G], cost: 500, nodmg: true, dv: 15, sdmg: "3d6", eff: "Nessun danno: la vittima supera Resist Torture/Drugs VD {dv} o subisce {sdmg} danni diretti ai PF. L'armatura non si abla." },
  { id: "exp", name: "A Espansione", fams: [AM_A, ...AM_P, AM_S], cost: 100, eff: "Se causa la Critical Injury Foreign Object, la vittima ritira sulla tabella finché esce un'altra ferita e subisce entrambe (la seconda senza Bonus Damage)." },
  { id: "poison", name: "Avvelenate", fams: [AM_A, AM_G], cost: 100, nodmg: true, dv: 13, sdmg: "2d6", eff: "Nessun danno: la vittima supera Resist Torture/Drugs VD {dv} o subisce {sdmg} danni diretti ai PF. L'armatura non si abla." },
  { id: "emp", name: "EMP", fams: [AM_G], cost: 500, nodmg: true, dv: 15, eff: "Nessun danno: la vittima supera Cybertech VD {dv} o due suoi pezzi di cyberware o dispositivi (scelti dal GM) si spengono per 1 minuto; un cyberarto spento è come smembrato." },
  { id: "flash", name: "Flashbang", fams: [AM_G], cost: 100, nodmg: true, dv: 15, eff: "Nessun danno: la vittima supera Resist Torture/Drugs VD {dv} o subisce Damaged Eye e Damaged Ear per 1 minuto (senza Bonus Damage)." },
  { id: "smoke", name: "Fumogene", fams: [AM_G], cost: 50, nodmg: true, eff: "Nessun danno: fumo su 10 × 10 m attorno all'impatto per 1 minuto (−4 ad agire nel fumo)." },
  { id: "rubber", name: "In Gomma", fams: [AM_A, ...AM_P, AM_S], cost: 10, eff: "Niente Critical Injury e niente ablazione; se il bersaglio scenderebbe sotto 0 PF resta a 1. Contano come munizioni base per le armi esotiche." },
  { id: "incend", name: "Incendiarie", fams: [AM_S, AM_A, AM_G, ...AM_P, "Lanciafiamme"], cost: 100, eff: "Se il danno supera l'armatura il bersaglio prende fuoco: 2 danni diretti ai PF alla fine di ogni suo turno finché non usa un'Azione per spegnersi (non cumulativo)." },
  { id: "tear", name: "Lacrimogene", fams: [AM_G], cost: 50, nodmg: true, dv: 13, eff: "Nessun danno: la vittima supera Resist Torture/Drugs VD {dv} o subisce Damaged Eye per 1 minuto (senza Bonus Damage)." },
  { id: "ap", name: "Perforanti", fams: [...AM_P, AM_S, AM_A, AM_G, AM_R], cost: 100, eff: "Ablano l'armatura di 2 invece che di 1." },
  { id: "smart", name: "Smart", fams: [AM_A, ...AM_P, AM_R, AM_S], cost: 500, eff: "Serve il cyberware Mirino. Colpo singolo fallito di 4 o meno: ritenti subito contro la stessa VD, con 10 al posto del d10 (si può spendere LUCK; chi schiva i proiettili può schivare anche questo)." },
  { id: "sleep", name: "Soporifere", fams: [AM_A, AM_G], cost: 500, nodmg: true, dv: 13, eff: "Nessun danno: la vittima supera Resist Torture/Drugs VD {dv} o cade Prona e Priva di Sensi per 1 minuto (si sveglia se subisce danni o se qualcuno usa un'Azione per scuoterla)." },
  // Solo of Fortune 2045 · atkSingle/atkAimed/atkAuto: bonus solo in quel modo di fuoco · req "prec": abilità dell'arma 7+ o Combat Awareness · lot: pezzi per acquisto
  { id: "burrow", name: "Burrowing", fams: [AM_A, ...AM_P, AM_S], cost: 40, src: "Solo of Fortune 2045", eff: "Le Critical Injury che causa non si possono rappezzare con un Quick Fix, salvo che il Quick Fix le tolga per sempre; Quick Fix e Treatment di queste ferite hanno VD +2." },
  { id: "hprec", name: "High Precision", fams: [AM_A, ...AM_P, AM_S], cost: 100, atkSingle: 1, atkAimed: 2, req: "prec", src: "Solo of Fortune 2045", eff: "Servono l'abilità dell'arma a 7 o più o Combat Awareness 1 o più: +1 a colpire in colpo singolo, +2 nei colpi mirati (già contati nei tiri se hai i requisiti)." },
  { id: "explosive", name: "Esplosive", fams: [AM_A, ...AM_P, AM_S], cost: 100, atk: -2, noAim: true, src: "Solo of Fortune 2045", eff: "Niente colpi mirati. −2 a colpire (già contato). I 5 sui dadi del danno contano come 6, solo per vedere se l'attacco causa una Critical Injury." },
  { id: "hvel", name: "High Velocity", fams: [...AM_P], cost: 40, src: "Solo of Fortune 2045", eff: "Chi prova a schivare l'attacco ha −2." },
  { id: "hyper", name: "Hyper Expansive", fams: [AM_A, ...AM_P, AM_S], cost: 100, src: "Solo of Fortune 2045", eff: "Quando causa una Critical Injury, la vittima ritira finché esce una ferita che non ha già e subisce anche quella (senza Bonus Damage)." },
  { id: "hollow", name: "Hollow Point / Frecce seghettate", fams: [AM_A, ...AM_P, AM_S], cost: 30, src: "Solo of Fortune 2045", eff: "La prima volta che causa una Critical Injury nell'attacco, la penalità base del Death Save della vittima sale di 1 (oltre a quella della ferita). Se la ferita è Foreign Object, la vittima ritira finché esce un'altra ferita e subisce anche quella (con Bonus Damage)." },
  { id: "tracer", name: "Traccianti", fams: [...AM_P], cost: 40, atkAuto: 1, src: "Solo of Fortune 2045", eff: "+1 a colpire in autofire (già contato)." },
  { id: "arrowhypo", name: "Arrowhypo", fams: [AM_A], cost: 100, lot: 1, nodmg: true, src: "Solo of Fortune 2045", eff: "Nessun danno: chi è colpito riceve la dose di droga da strada caricata nella freccia (una per freccia). Si recupera come una freccia normale." },
  { id: "airburst", name: "Airburst", fams: [AM_G, AM_R], cost: 125, lot: 1, nodmg: true, src: "Solo of Fortune 2045", eff: "Si carica con tre dosi della stessa droga da strada. Nessun danno: chi è colpito è esposto a una dose (gas). Filtri Nasali, maschere antigas e simili proteggono." },
  { id: "minic9", name: "Mini C9 (Stickybomb)", fams: [AM_G], cost: 60, lot: 1, dmg: "6d6", src: "Solo of Fortune 2045", eff: "Solo per la Stickybomb Launcher. Colpito il bersaglio, la carica si pianta con Demolitions VD 17: 6d6 se riesce, 4d6 se fallisce, come una granata perforante. Esplode solo a distanza, con un'Azione, dopo 30 secondi (10 round)." },
].map(a => ({ ...a, id: "cpr-" + a.id, builtin: true }));
// la Base c'è per tutti i calibri tranne granate e razzi
const ammoBaseOk = fam => fam !== AM_G && fam !== AM_R && fam !== "Lanciafiamme";
const ammoEff = a => String(a.eff || "").replace(/\{dv\}/g, a.dv ?? "").replace(/\{sdmg\}/g, a.sdmg || "");

// ---------- MUNIZIONI MODIFICATE ----------
// e.gear.ammoMods = { "<tipo>~<uid>": { base, name, atk, dmg, dmgMod, dv, sdmg, eff } } · le scorte le usano come tipo «ammo»
const ammoModsOf = e => ((e && e.gear) || {}).ammoMods || {};
function ammoOfE(e, cat, id) {
  if (!id || !String(id).includes("~")) return ammoOf(cat, id || "");
  const m = ammoModsOf(e)[id]; if (!m) return ammoOf(cat, String(id).split("~")[0]);
  const base = ammoTypesFor(ammoFam(cat)).find(t => t.id === m.base) || STD_AMMO;
  return { ...base, ...m, id, name: m.name || `${base.name} (mod.)`, mod: true };
}
// tipi che un'arma della scheda può caricare: quelli del calibro più le munizioni modificate nelle scorte
const ammoListE = (e, cat) => [...ammoList(cat), ...Object.entries(ammoModsOf(e)).filter(([id]) => ammoStockN(e, ammoFam(cat), id) || (sheetOf(e).weapons || []).some(w => w.ammo === id && sheetWeaponCat(w) === cat)).map(([id]) => ammoOfE(e, cat, id))];
// ✎ su una voce delle scorte: si modificano alcuni colpi (o tutti) e diventano un tipo a parte
function ammoModEdit(id, gi) {
  const e = state.entries.find(x => x.id === id), g = e && gearItems(e)[gi]; if (!g || g.cat !== "munizioni" || !Store.canEdit()) return;
  const fam = g.fam, cat = (CPR.WEAPON_TYPES.find(t => t.ammo === fam) || {}).id || "", cur = ammoOfE(e, cat, g.ammo || ""), n = num(g.qty);
  openModal(`<form class="form" id="am-form">
    <div class="modal-head"><h2>// MODIFICA MUNIZIONI · ${esc(fam)}</h2><button type="button" class="x" data-action="close" aria-label="Chiudi">×</button></div>
    <div class="modal-body"><div class="fields">
      <div class="field"><label for="am-name">Nome</label><input id="am-name" name="name" value="${esc(cur.mod ? cur.name : `${cur.name} modificate`)}"></div>
      <div class="field"><label for="am-n">Quante (su ${n})</label><input id="am-n" name="n" type="number" min="1" max="${n}" value="${n}"></div>
      <div class="field"><label for="am-atk">± a colpire</label><input id="am-atk" name="atk" type="number" min="-10" max="10" value="${esc(cur.atk || "")}"></div>
      <div class="field"><label for="am-dmg">Danno al posto di quello dell'arma</label><input id="am-dmg" name="dmg" placeholder="es. 4d6 (vuoto = quello dell'arma)" value="${esc(cur.dmg || "")}"></div>
      <div class="field"><label for="am-dm">± al danno</label><input id="am-dm" name="dmgMod" type="number" min="-20" max="20" value="${esc(cur.dmgMod || "")}"></div>
      <div class="field"><label class="check"><input type="checkbox" name="nodmg" ${cur.nodmg ? "checked" : ""}> Non fa danni (solo l'effetto)</label></div>
      <div class="field"><label for="am-dv">VD della prova della vittima</label><input id="am-dv" name="dv" type="number" min="0" max="40" value="${esc(cur.dv ?? "")}"></div>
      <div class="field"><label for="am-sd">Danni se fallisce la prova</label><input id="am-sd" name="sdmg" placeholder="es. 3d6" value="${esc(cur.sdmg || "")}"></div>
      <div class="field full"><label for="am-eff">Effetto <small>{dv} e {sdmg} diventano la VD e i danni qui sopra</small></label><textarea id="am-eff" name="eff" rows="3">${esc(cur.eff || "")}</textarea></div>
    </div><p class="hint">Le munizioni modificate restano nelle scorte come un tipo a parte e si caricano dal menu Munizioni dell'arma.</p></div>
    <div class="modal-foot"><button type="button" class="btn ghost small left" data-action="close">Annulla</button><button class="btn" type="submit">Salva</button></div></form>`, true);
  $("#am-form").addEventListener("submit", ev => {
    ev.preventDefault();
    const F = ev.target.elements, take = clamp(Math.trunc(num(F.n.value)) || n, 1, n);
    const bad = [F.dmg.value, F.sdmg.value].filter(v => v.trim() && !CPR.parse(v.trim())); if (bad.length) return toast(`Dadi non validi: ${bad.join(", ")} (es. 3d6)`, "err");
    const mod = { base: cur.mod ? ammoModsOf(e)[g.ammo].base : cur.id || "", name: F.name.value.trim() || `${cur.name} modificate`, atk: num(F.atk.value), dmg: F.dmg.value.trim(), dmgMod: num(F.dmgMod.value),
      ...(F.nodmg.checked ? { nodmg: true } : {}), ...(F.dv.value !== "" ? { dv: num(F.dv.value) } : {}), sdmg: F.sdmg.value.trim(), eff: F.eff.value.trim() };
    entryPatch(id, x => {
      const G = x.gear, it = G.items[gi]; if (!it) return null;
      G.ammoMods = G.ammoMods || {};
      // tutte le munizioni di un tipo già modificato: si cambia il tipo; sennò ne nasce uno nuovo
      if (cur.mod && take === n) { G.ammoMods[it.ammo] = mod; it.name = `${fam} · ${mod.name}`; return x; }
      const nid = `${mod.base}~${NET.uid()}`; G.ammoMods[nid] = mod;
      it.qty = num(it.qty) - take; if (it.qty <= 0) G.items.splice(gi, 1);
      G.items.push({ cat: "munizioni", name: `${fam} · ${mod.name}`, fam, ammo: nid, qty: take });
      return x;
    }, `${take} ${fam} · ${mod.name}`);
    closeModal(); setTimeout(() => openEntry(id, "gear"), 50);
  });
}

// ---------- ACCESSORI DELLE ARMI ----------
// arma: w.slots (slot accessori, di base 3, si cambiano con − / +), w.attach = [{ name, ref }] (montati: escono dall'inventario)
// voce del Night Market: attach = { slots, sa (solo armi con Shoulder Arms), nobow, mag: "ext" | "drum", smart, scope,
//   cats (solo queste categorie), exoticOk (anche su armi esotiche), one (uno solo di quel tipo), dv (Weaponstech per montarlo),
//   autofire { table, mult, up (se Excellent o già con autofire), shots (colpi per raffica) } }
const ATT_SLOTS = 3;
const MAG_TABLE = { mpistol: [12, 18, 36], hpistol: [8, 14, 28], vhpistol: [8, 14, 28], smg: [30, 40, 50], hsmg: [40, 50, 60], shotgun: [4, 8, 16], ar: [25, 35, 45], sniper: [4, 8, 12], gl: [2, 4, 6], rl: [1, 2, 3] };
const attCatalog = it => { const m = MK.all().find(x => x.type === "gear" && x.attach && (x.id === it.ref || norm2(x.name) === norm2(it.name))); return m || null; };
const attOf = w => (w.attach || []).map(a => ({ ...a, A: (attCatalog(a) || {}).attach || { slots: 1 } }));
const slotsOfW = w => hasVal(w.slots) ? num(w.slots) : ATT_SLOTS;
const attSlotsN = A => num((A || {}).slots ?? 1);
const slotsUsed = w => attOf(w).reduce((t, a) => t + attSlotsN(a.A), 0);
// accessorio che cambia l'autofire (Pistol Autosear, Shotgun Automatic Control Group, SMG Cyclic Internals)
const attAutofire = w => (attOf(w).find(a => a.A.autofire) || {}).A;
const hasAtt = (w, k) => attOf(w).some(a => a.A[k]);
// caricatore con gli accessori: Esteso o Tamburo dalla tabella dei caricatori
const magWithAtt = (w, cat) => { const m = attOf(w).find(a => a.A.mag), T = MAG_TABLE[cat]; return m && T ? T[m.A.mag === "drum" ? 2 : 1] : 0; };
const isExoticW = w => /\bexotic\b|esotic|insolit/i.test(w.note || "") || !!(MK.byId(w.market || "") || {}).exotic;
function attHtml(e, i, w, edit) {
  const list = attOf(w), used = slotsUsed(w), max = slotsOfW(w), id = esc(e.id);
  const inv = gearItems(e).map((it, gi) => ({ it, gi, m: attCatalog(it) })).filter(x => x.m && num(x.it.qty || 1) > 0);
  return `<div class="cb-att"><span class="sh-k">Accessori ${used}/${max}</span>
    ${list.map((a, k) => `<span class="cb-att-chip" title="${esc(((attCatalog(a) || {}).desc) || "")}">${esc(a.name)}${attSlotsN(a.A) !== 1 ? ` <small>${attSlotsN(a.A)} slot</small>` : ""}${edit ? `<button type="button" data-action="att-off" data-id="${id}" data-i="${i}" data-k="${k}" aria-label="Smonta ${esc(a.name)}" title="Smonta: torna nell'inventario">×</button>` : ""}</span>`).join("")}
    ${edit && inv.length ? `<select data-att-on data-id="${id}" data-i="${i}" aria-label="Monta un accessorio"><option value="">+ Monta…</option>${inv.map(x => `<option value="${x.gi}">${esc(x.it.name)} (${attSlotsN(x.m.attach)} slot)</option>`).join("")}</select>` : ""}
    ${edit ? `<span class="cb-att-sl"><button type="button" class="gp-btn" data-action="att-slots" data-id="${id}" data-i="${i}" data-d="-1" title="Uno slot in meno" aria-label="Uno slot in meno">−</button><button type="button" class="gp-btn" data-action="att-slots" data-id="${id}" data-i="${i}" data-d="1" title="Uno slot in più" aria-label="Uno slot in più">+</button></span>` : ""}
    ${list.filter(a => (attCatalog(a) || {}).desc).map(a => `<small class="cb-att-note">${esc(a.name)}: ${esc(shortAtt(attCatalog(a)))}</small>`).join("")}</div>`;
}
// l'attacco di un accessorio montato (Baionetta, Doppietta, Lanciagranate…) è un'arma a sé, con colpi e munizioni salvati nell'accessorio
function pcWeapon(e, i) {
  const [wi, k] = String(i).split(".").map(Number), base = (sheetOf(e).weapons || [])[wi]; if (!base) return null;
  if (k == null || isNaN(k)) return { w: base, wi, k: null, base };
  const a = (base.attach || [])[k], A = a && (attCatalog(a) || {}).attach, spec = A && A.wpn; if (!spec) return null;
  return { wi, k, base, a, w: { ...spec, name: `${base.name} · ${a.name}`, ammo: a.ammo || "", loaded: a.loaded, range: a.range, autoRange: a.autoRange, attach: [] } };
}
const attAttacks = (e, i) => { const w = ((sheetOf(e).weapons || [])[i]) || {}; return (w.attach || []).map((a, k) => ({ a, k, spec: ((attCatalog(a) || {}).attach || {}).wpn })).filter(x => x.spec); };
const shortAtt = m => String(m.desc || "").split(/(?<=\.)\s/)[0];
async function attOn(id, i, gi) {
  const e = state.entries.find(x => x.id === id), w = e && (sheetOf(e).weapons || [])[i], it = e && gearItems(e)[gi], m = it && attCatalog(it); if (!w || !m || !Store.canEdit()) return;
  const A = m.attach, cat = sheetWeaponCat(w), T = CPR.weaponType(cat) || {};
  const why = [CPR.isMelee(cat) ? "è un'arma da mischia" : "", A.sa && (w.skill || T.skill) !== "shoulderarms" ? "serve un'arma con Shoulder Arms" : "", A.nobow && cat === "bow" ? "non va su archi e balestre" : "",
    A.mag && hasAtt(w, "mag") ? "c'è già un caricatore speciale" : "", isExoticW(w) && !A.exoticOk ? "l'arma è esotica" : "",
    A.cats && !A.cats.includes(cat) ? "non è adatto a questa categoria di arma" : "", A.one && attOf(w).some(a => a.A.one === A.one) ? "ne ha già uno dello stesso tipo" : "",
    slotsUsed(w) + attSlotsN(A) > slotsOfW(w) ? `servono ${attSlotsN(A)} slot liberi (ne restano ${slotsOfW(w) - slotsUsed(w)})` : ""].filter(Boolean);
  if (A.dv && !why.length && !(await askConfirm(`Per montare ${m.name} serve una prova di Weaponstech VD ${A.dv}. Riuscita?`, "Monta"))) return refreshSheetView(id);
  if (why.length && !(await askConfirm(`${m.name} su ${w.name}: ${why.join(", ")}. Montarlo comunque?`, "Monta"))) return refreshSheetView(id);
  entryPatch(id, x => {
    const W = x.sheet.weapons[i], g = x.gear.items[gi]; if (!W || !g) return null;
    g.qty = num(g.qty || 1) - 1; if (g.qty <= 0) x.gear.items.splice(gi, 1);
    W.attach = [...(W.attach || []), { name: m.name, ref: m.id }];
    return x;
  }, `${m.name} montato su ${w.name}`);
}
function attOff(id, i, k) {
  const e = state.entries.find(x => x.id === id), w = e && (sheetOf(e).weapons || [])[i], a = w && (w.attach || [])[k]; if (!a || !Store.canEdit()) return;
  entryPatch(id, x => {
    const W = x.sheet.weapons[i], cat = sheetWeaponCat(W), fam = ammoFam(cat), was = magOf(W, cat), had = loadedOf(W, cat);
    const spec = ((attCatalog(a) || {}).attach || {}).wpn, sfam = spec ? ammoFam(spec.cat) : "";
    if (sfam && spec.mag) { const n = loadedOf({ ...spec, ammo: a.ammo || "", loaded: a.loaded, attach: [] }, spec.cat); if (n && (a.ammo || ammoBaseOk(sfam))) ammoAdd(x, sfam, a.ammo || "", n); }
    W.attach = (W.attach || []).filter((_, j) => j !== k);
    // caricatore più piccolo: i colpi in più tornano nelle scorte
    const now = magOf(W, cat); if (fam && now < was && had > now) { ammoAdd(x, fam, W.ammo || "", had - now); W.loaded = now; }
    const g = x.gear.items.find(y => norm2(y.name) === norm2(a.name) && (y.cat || "equip") === "equip");
    if (g) g.qty = num(g.qty || 1) + 1; else x.gear.items.push({ cat: "equip", name: a.name, qty: 1 });
    return x;
  }, `${a.name} smontato: è nell'inventario`);
}
function attSlots(id, i, d) {
  const e = state.entries.find(x => x.id === id), w = e && (sheetOf(e).weapons || [])[i]; if (!w || !Store.canEdit()) return;
  const n = Math.max(slotsUsed(w), Math.max(0, slotsOfW(w) + d));
  if (n === slotsOfW(w)) return toast(d < 0 ? "Gli slot sono occupati: smonta prima un accessorio" : "", d < 0 ? "err" : "ok");
  sheetPatch(id, s => { s.weapons[i].slots = n; return s; });
}

// ---------- SPECIALI DELLE ARMI (armi uniche, es. i Nastri di Echo) ----------
// arma della scheda: w.charges (cariche massime), w.chargesLeft (rimaste, vuoto = piene), w.batteryCost (eb per una batteria nuova)
// w.specials = [{ id, name, mode, charge, dmg, armor, streak, skill, dv, note }]
//   mode "passive" = nota in ogni tiro di danno (es. portata, ignora SP basse)
//   mode "rider"   = si attiva prima dell'attacco (casella), consuma cariche, aggiunge l'effetto al tiro (es. In Fiamme)
//   mode "attack"  = attacco a parte: tira «dmg», armatura «half» (metà) o «ignore»; con «streak» la seconda di fila ignora tutta l'armatura
//   mode "check"   = prova di abilità contro una VD (es. Presa del Cigno: Dance VD 17)
const SP_MODES = [["passive", "Sempre (nota)"], ["rider", "Da attivare sull'attacco"], ["attack", "Attacco speciale"], ["check", "Prova di abilità"]];
const SP_ARMOR = [["", "Armatura normale"], ["half", "Supera metà armatura"], ["ignore", "Ignora l'armatura"]];
const chargesLeftOf = w => num(w.charges) ? (hasVal(w.chargesLeft) ? clamp(num(w.chargesLeft), 0, num(w.charges)) : num(w.charges)) : null;
const spList = w => (w.specials || []).filter(x => x && x.name);
const spMem = X => { const M = cbMem[X.key] = cbMem[X.key] || {}; M.riders = M.riders || {}; return M; };
const spArmorTxt = a => a === "half" ? "supera solo metà dell'armatura (SP dimezzata)" : a === "ignore" ? "ignora l'armatura" : "";
function spHtml(X) {
  const w = X.w, list = spList(w), ch = chargesLeftOf(w), M = spMem(X), A = X.attrs;
  if (!list.length && ch == null && !X.edit) return "";
  return `<div class="cb-sp">
    ${ch != null ? `<span class="cb-ch ${ch ? "" : "empty"}" title="Cariche rimaste">🔋 ${ch}/${num(w.charges)}</span>${X.edit && ch < num(w.charges) ? `<button type="button" class="btn ghost small" data-action="sp-battery" data-id="${esc(X.id)}" data-i="${X.i}" title="Batteria nuova: cariche piene${num(w.batteryCost) ? `, −${num(w.batteryCost)} eb` : ""}">Batteria nuova${num(w.batteryCost) ? ` · ${num(w.batteryCost)} eb` : ""}</button>` : ""}` : ""}
    ${list.map((s, n) => s.mode === "rider" ? `<label class="check cb-aim" title="${esc(s.note || "")}"><input type="checkbox" data-sp-rider="${n}" ${A} ${M.riders[n] ? "checked" : ""}> ${esc(s.name)}${num(s.charge) ? ` <small>${num(s.charge)} car.</small>` : ""}</label>`
      : s.mode === "attack" ? `<button type="button" class="btn small ghost" data-action="sp-attack" ${A} data-n="${n}" title="${esc(s.note || "")}">⚡ ${esc(s.name)} <b>${esc(s.dmg || "")}</b>${num(s.charge) ? ` <small>${num(s.charge)} car.</small>` : ""}</button>`
      : s.mode === "check" ? `<button type="button" class="btn small ghost" data-action="sp-check" ${A} data-n="${n}" title="${esc(s.note || "")}">${esc(s.name)} <small>${esc((CPR.skill(s.skill) || {}).label || s.skill || "")} VD ${num(s.dv)}</small></button>` : "").join("")}
    ${X.edit ? `<button type="button" class="gp-btn" data-action="sp-edit" data-id="${esc(X.id)}" data-i="${X.i}" title="Speciali dell'arma: cariche, attacchi speciali, effetti" aria-label="Modifica gli speciali">✎ speciali</button>` : ""}
    ${list.filter(s => s.note).map(s => `<small class="cb-att-note"><b>${esc(s.name)}</b>: ${esc(s.note)}</small>`).join("")}</div>`;
}
// effetti attivati sull'attacco: cariche necessarie e note per il tiro
function spRiders(X) {
  const M = spMem(X), list = spList(X.w).map((s, n) => ({ s, n })).filter(x => x.s.mode === "rider" && M.riders[x.n]);
  return { list, cost: list.reduce((t, x) => t + num(x.s.charge), 0), note: list.map(x => `${x.s.name}: ${x.s.note || "attivo"}`).join(" · ") };
}
const spPassive = X => spList(X.w).filter(s => s.mode === "passive").map(s => `${s.name}${s.note ? `: ${s.note}` : ""}`).join(" · ");
function spAttack(X, n) {
  const s = X && spList(X.w)[n]; if (!s) return;
  const ch = chargesLeftOf(X.w), cost = num(s.charge);
  if (cost && ch != null && ch < cost) return toast(`${X.w.name}: cariche finite (${ch}). Serve una batteria nuova`, "err");
  const M = spMem(X), again = s.streak && M.lastSp === n;
  const r = s.dmg ? CPR.rollExpr(s.dmg, { damage: true }) : null; if (s.dmg && !r) return toast(`Danno non valido: "${s.dmg}"`, "err");
  const armor = again ? "ignore" : s.armor;
  X.post({ kind: "damage", label: `${X.w.name} · ${s.name}${again ? " (di fila)" : ""}`, ...(r || { total: 0, dice: [], mods: [] }),
    note: [spArmorTxt(armor) ? `Danno: ${spArmorTxt(armor)}` : "", s.note || "", cost && ch != null ? `cariche ${ch - cost}/${num(X.w.charges)}` : ""].filter(Boolean).join(" · ") });
  M.lastSp = n;
  if (cost && ch != null) X.save("chargesLeft", ch - cost); else X.refresh();
}
function spCheck(X, n) {
  const s = X && spList(X.w)[n], e = X && X.ent; if (!s || !e) return;
  const k = skillByKey(e, "skill:" + s.skill) || { stat: "DEX", label: s.skill || "Prova", lvl: 0 };
  const r = CPR.check([{ l: k.stat, v: statEff(e, k.stat) }, { l: k.label, v: k.lvl }, ...(k.key ? skillBonusAll(e, k) : []), ...sheetExtra(e)]);
  const ok = r.total > num(s.dv);
  X.post({ kind: "check", label: `${X.w.name} · ${s.name} (${k.label} VD ${num(s.dv)})`, ...r, note: s.note || "", hit: { ok, text: `VD ${num(s.dv)}: ${ok ? "riuscita" : "fallita"}` } });
}
async function spBattery(id, i) {
  const e = state.entries.find(x => x.id === id), w = e && (sheetOf(e).weapons || [])[i]; if (!w || !Store.canEdit()) return;
  const cost = mkPrice(num(w.batteryCost)), money = moneyOf(e);
  if (cost && money < cost && !isGm()) return toast(`Servono ${fmtEb(cost)} per la batteria: ne hai ${fmtEb(money)}`, "err");
  if (!(await askConfirm(`Batteria nuova per ${w.name}: cariche ${num(w.charges)}/${num(w.charges)}${cost ? `, −${fmtEb(cost)} (restano ${fmtEb(money - cost)})` : ""}?`, "Cambia batteria"))) return;
  entryPatch(id, x => {
    const W = x.sheet.weapons[i]; if (!W) return null;
    W.chargesLeft = num(W.charges);
    if (cost) { x.gear = x.gear || {}; x.gear.money = num(x.gear.money) - cost; x.gear.log = [...(x.gear.log || []), { at: new Date().toISOString(), id: "battery", name: `Batteria · ${W.name}`, type: "battery", cost, qty: 1, undo: { k: "battery" } }]; }
    return x;
  }, `${w.name}: batteria nuova${cost ? ` (−${fmtEb(cost)})` : ""}`);
}
// modulo degli speciali di un'arma
function spEdit(id, i) {
  const e = state.entries.find(x => x.id === id), w = e && (sheetOf(e).weapons || [])[i]; if (!w) return;
  const row = (s = {}) => `<div class="sp-row">
    <input type="hidden" data-f="id" value="${esc(s.id || "")}">
    <input data-f="name" placeholder="Nome (es. Scossa Sincopata)" value="${esc(s.name || "")}">
    <select data-f="mode">${SP_MODES.map(([v, l]) => `<option value="${v}" ${v === (s.mode || "passive") ? "selected" : ""}>${l}</option>`).join("")}</select>
    <input data-f="charge" type="number" min="0" placeholder="cariche" title="Cariche che consuma ogni volta" value="${esc(s.charge || "")}">
    <input data-f="dmg" placeholder="Danno (es. 6d6)" title="Solo per gli attacchi speciali" value="${esc(s.dmg || "")}">
    <select data-f="armor" title="Armatura (attacchi speciali)">${SP_ARMOR.map(([v, l]) => `<option value="${v}" ${v === (s.armor || "") ? "selected" : ""}>${l}</option>`).join("")}</select>
    <label class="check" title="Usato due volte di fila ignora tutta l'armatura"><input type="checkbox" data-f="streak" ${s.streak ? "checked" : ""}> 2ª di fila ignora l'armatura</label>
    <select data-f="skill" title="Abilità (prove)"><option value="">— abilità —</option>${CPR.SKILLS.map(k => `<option value="${k.id}" ${k.id === s.skill ? "selected" : ""}>${esc(k.label)}</option>`).join("")}</select>
    <input data-f="dv" type="number" min="0" placeholder="VD" title="VD della prova" value="${esc(s.dv || "")}">
    <button type="button" class="x" data-row-del aria-label="Rimuovi">✕</button>
    <textarea data-f="note" rows="2" placeholder="Effetto / regola (compare nel Dice log)">${esc(s.note || "")}</textarea></div>`;
  openModal(`<form class="form" id="sp-form">
    <div class="modal-head"><h2>// SPECIALI · ${esc(w.name)}</h2><button type="button" class="x" data-action="close" aria-label="Chiudi">×</button></div>
    <div class="modal-body">
      <div class="fields">
        <div class="field"><label for="sp-ch">Cariche (vuoto = nessuna)</label><input id="sp-ch" name="charges" type="number" min="0" value="${esc(w.charges || "")}"></div>
        <div class="field"><label for="sp-left">Rimaste</label><input id="sp-left" name="chargesLeft" type="number" min="0" value="${esc(chargesLeftOf(w) ?? "")}"></div>
        <div class="field"><label for="sp-bat">Batteria nuova (eb)</label><input id="sp-bat" name="batteryCost" type="number" min="0" value="${esc(w.batteryCost || "")}"></div>
      </div>
      <h3 class="sh-h">Speciali <small>sempre (nota nei danni) · da attivare sull'attacco · attacco speciale con il suo danno · prova di abilità contro una VD</small></h3>
      <div id="sp-rows">${spList(w).map(row).join("")}</div>
      <button type="button" class="btn ghost small cyan" data-sp-add>+ Speciale</button>
    </div>
    <div class="modal-foot"><button type="button" class="btn ghost small left" data-action="close">Annulla</button><button class="btn" type="submit">Salva</button></div></form>`);
  const form = $("#sp-form");
  form.addEventListener("click", ev => {
    if (ev.target.closest("[data-sp-add]")) $("#sp-rows", form).insertAdjacentHTML("beforeend", row());
    const d = ev.target.closest("[data-row-del]"); if (d) d.closest(".sp-row").remove();
  });
  form.addEventListener("submit", ev => {
    ev.preventDefault();
    const specials = readRows(form, "#sp-rows .sp-row").filter(s => s.name).map(s => ({ id: s.id || NET.uid(), name: s.name, mode: s.mode, ...(num(s.charge) ? { charge: num(s.charge) } : {}),
      ...(s.dmg ? { dmg: s.dmg } : {}), ...(s.armor ? { armor: s.armor } : {}), ...(s.streak ? { streak: true } : {}), ...(s.skill ? { skill: s.skill } : {}), ...(num(s.dv) ? { dv: num(s.dv) } : {}), ...(s.note ? { note: s.note } : {}) }));
    const bad = specials.filter(s => s.dmg && !CPR.parse(s.dmg)).map(s => s.name); if (bad.length) return toast(`Danno non valido in: ${bad.join(", ")}`, "err");
    const F = form.elements, ch = num(F.charges.value);
    sheetPatch(id, s => { const W = s.weapons[i]; if (!W) return s; W.specials = specials;
      if (ch) { W.charges = ch; W.chargesLeft = clamp(F.chargesLeft.value === "" ? ch : num(F.chargesLeft.value), 0, ch); W.batteryCost = num(F.batteryCost.value); } else { delete W.charges; delete W.chargesLeft; delete W.batteryCost; }
      return s; });
    toast("Speciali salvati", "ok"); closeModal(); setTimeout(() => openEntry(id, "combat"), 50);
  });
}
