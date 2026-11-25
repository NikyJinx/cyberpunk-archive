// ============================================================
//  NIGHT CITY ARCHIVE — eventi: clic, modifiche, tastiera
//  (js/ui/: i file si caricano in ordine da index.html e condividono le costanti)
// ============================================================

// ---------- eventi pagina ----------
function bindPage(page) {
  if (page === "database") {
    const f = state.filter;
    $("#q").addEventListener("input", ev => { f.q = ev.target.value; refreshResults(); });
    $("#f-faction").addEventListener("change", ev => { f.faction = ev.target.value; saveFilter(); refreshResults(); });
    $("#f-status").addEventListener("change", ev => { f.status = ev.target.value; saveFilter(); refreshResults(); });
    $("#f-sort").addEventListener("change", ev => { f.sort = ev.target.value; saveFilter(); refreshResults(); });
    $("#kind-chips").addEventListener("click", ev => {
      const c = ev.target.closest("[data-kind]"); if (!c) return;
      f.kind = c.dataset.kind; saveFilter();
      $$(".chip", ev.currentTarget).forEach(x => x.classList.toggle("active", x === c));
      refreshResults();
    });
  }
  if (page === "tracce" && $("#disc-chips")) {
    $("#disc-chips").addEventListener("click", ev => {
      const c = ev.target.closest("[data-disc]"); if (!c) return;
      state.disc = c.dataset.disc; ls.set("nc-disc", state.disc); route();
    });
  }
  if (page === "diario" && $("#diary-q")) {
    $("#diary-q").addEventListener("input", ev => { state.diaryQ = ev.target.value; $("#diary-results").innerHTML = diaryResults(); });
  }
  if (page === "appunti") {
    $("#note-q").addEventListener("input", ev => { state.noteQ = ev.target.value; $("#notes-results").innerHTML = notesHtml(); });
  }
  if (page === "gm") loadGmList();
  if (page === "mappa") {
    bindTable(); renderLogs();
  }
  const cm = $("#cal-m"), cy = $("#cal-y");
  if (cm && cy) {
    const go = () => { location.hash = `#/calendario/${cy.value}-${pad(cm.value)}`; };
    cm.addEventListener("change", go); cy.addEventListener("change", go);
  }
}

// Conferma disegnata dal sito: confirm() del browser viene bloccato da alcuni browser
// (es. browser integrati e app su telefono) e risponde "no" senza mostrare nulla.
function askConfirm(message, okLabel = "Elimina") {
  return new Promise(resolve => {
    const d = document.createElement("dialog");
    d.className = "modal narrow confirm";
    d.innerHTML = `
      <div class="modal-head"><h2>// CONFERMA</h2></div>
      <div class="modal-body"><p class="confirm-msg">${esc(message)}</p></div>
      <div class="modal-foot">
        <button type="button" class="btn ghost small cyan left" data-c="no">Annulla</button>
        <button type="button" class="btn danger" data-c="yes">${esc(okLabel)}</button>
      </div>`;
    let answer = false;
    d.addEventListener("click", ev => {
      const b = ev.target.closest("[data-c]");
      if (b) { answer = b.dataset.c === "yes"; d.close(); }
      else if (ev.target === d) d.close();
    });
    d.addEventListener("close", () => { d.remove(); resolve(answer); });
    document.body.appendChild(d);
    d.showModal();
    $("[data-c=no]", d).focus();
  });
}

async function confirmDelete(col, list, id, label, after) {
  const rec = list.find(x => x.id === id);
  if (!rec || !(await askConfirm(`Eliminare definitivamente "${label(rec)}"? Non si può annullare.`))) return null;
  try { await Store.remove(col, rec); closeModal(); after(rec); route(); toast("Eliminato"); }
  catch (err) { fail(err); }
}

document.addEventListener("click", async ev => {
  const el = ev.target.closest("[data-action]"); if (!el) return;
  const a = el.dataset.action, id = el.dataset.id;
  switch (a) {
    case "close": closeModal(); break;
    case "settings": openSettings(); break;
    case "export": doExport(); break;
    case "logout": await Store.signOut(); closeModal(); toast("Disconnesso"); break;
    case "open-entry":
      if (!location.hash.startsWith("#/database")) { location.hash = "#/database/" + id; }
      else openEntry(id);
      break;
    case "open-entry-tab": openEntry(id, el.dataset.tab); break;
    case "gear-cy": {   // disinstalla / reinstalla il cyberware senza perderlo
      if (!Store.canEdit()) break;
      const e = state.entries.find(x => x.id === id); if (!e) break;
      const slot = el.dataset.slot, i = num(el.dataset.i), out = el.dataset.op === "out";
      if (i < 0) { const b = baseState(e, slot); if (!b) break;
        cyberPatch(id, cy => { cy.bases = cy.bases || {}; const { name, ref, std, legacy, fixed, ...keep } = b; cy.bases[slot] = { ...keep, on: !out, ...(out ? { stored: true } : {}) }; if (!out) delete cy.bases[slot].stored;
          if (legacy) cy.slots[slot] = (cy.slots[slot] || []).filter(it => !isBaseItem(it));
          // le opzioni dentro l'arto o l'occhio escono e rientrano con la base
          (cy.slots && cy.slots[slot] || []).forEach(it => { if (out && it.installed !== false) { it.installed = false; it.stored = true; it.withBase = true; } else if (!out && it.withBase) { it.installed = true; delete it.stored; delete it.withBase; } });
          return cy; });
      } else cyberPatch(id, cy => { const list = (cy.slots || {})[slot] || [], it = list[i]; if (!it) return cy;
        // un'opzione tolta va in idle: da lì si installa in qualsiasi slot
        if (out) { list.splice(i, 1); cy.slots.idle = [...(cy.slots.idle || []), { ...it, installed: false, stored: true, from: slot }]; }
        else { it.installed = true; delete it.stored; delete it.withBase; }
        return cy; });
      toast(out ? (i < 0 ? "Disinstallato con le sue opzioni: resta in Equipaggiamento (l'umanità persa non torna)" : "Disinstallato: è in idle, lo puoi installare in qualsiasi slot (l'umanità persa non torna)") : `Reinstallato${i < 0 ? " con le sue opzioni" : ""}`, "ok");
      break;
    }
    case "edit-cyber": editCyber(id); break;
    case "edit-humanity": editHumanity(id); break;
    case "edit-gear": editGear(id); break;
    case "new-entry": editEntry(null); break;
    case "edit-entry": editEntry(id); break;
    case "delete-entry": confirmDelete("entries", state.entries, id, r => r.name, r => {
      state.entries = state.entries.filter(x => x.id !== r.id);
      const g = gmNoteOf(r.id);   // le note del GM se ne vanno con il personaggio
      if (g) { Store.remove("gmnotes", g).catch(() => {}); state.gmnotes = state.gmnotes.filter(x => x.id !== g.id); }
    }); break;
    case "edit-gmnote": editGmNote(id); break;
    case "gm-new-entry": editEntry(null, { kind: "npc", gmOnly: true }); break;
    // nemici
    case "gm-gen-enemy": editEnemy(null, CPR.generateEnemy(1, "base")); break;
    case "gm-new-enemy": editEnemy(null, { v: 3, role: "none", roleRank: 0, extraPoints: 0, tier: 1, level: "base", name: "", stats: Object.fromEntries(CPR.STATS.map(s => [s.id, s.id === "LUCK" ? 0 : 5])), armor: {}, weapons: [], skills: [], picks: [] }); break;
    case "enemy-open": openEnemy(id); break;
    case "enemy-edit": editEnemy(id); break;
    case "enemy-spawn": spawnEnemy(id); break;
    case "enemy-copy": { const e = state.entries.find(x => x.id === id); if (e) editEnemy(null, { ...JSON.parse(JSON.stringify(enemyOf(e))), name: e.name + " (copia)" }); break; }
    case "enemy-roll": {
      const e = state.entries.find(x => x.id === id), t = el.dataset.tok && state.tokens.find(x => x.id === el.dataset.tok);
      if (e) rollEnemy(e, el.dataset.roll, t || null);
      break;
    }
    case "gm-new-note": editNote(null, { gmOnly: true, category: "GM" }); break;
    // architetture NET
    case "net-gen": editArch(null, NET.generate("standard")); break;
    case "net-new": editArch(null, NET.blank()); break;
    case "net-open": openArch(id); break;
    case "net-edit": editArch(id); break;
    case "net-copy": { const A = archById(id); if (A) { const c = JSON.parse(JSON.stringify(A)); delete c.id; delete c.createdAt; editArch(null, { ...c, name: (A.name || "Architettura") + " (copia)", shared: false }); } break; }
    case "net-adj": archAdj(el); break;
    case "net-roll": archRoll(el); break;
    case "net-reset": archPatch(id, A => { A.branches.forEach(b => b.floors.forEach(f => { f.seen = false; f.done = false; (f.ice || []).forEach(x => { x.cur = null; }); })); (A.demons || []).forEach(d => { d.cur = null; }); return A; }); break;
    case "net-share": {
      const A = archById(id); if (!A) break;
      const on = !A.shared;
      archPatch(id, X => ({ ...X, shared: on }));
      toast(on ? "Visibile nella pagina NET: compaiono solo i piani rivelati (👁)" : "Architettura nascosta ai giocatori", "ok");
      el.textContent = on ? "🔒 Nascondi ai giocatori" : "👁 Mostra ai giocatori";
      if (/^#\/net/.test(location.hash)) { netOpen.add(id); refreshNetPage(); }
      break;
    }
    case "net-delete": {
      const v = state.netview.find(x => x.id === "nv-" + id);
      confirmDelete("netarch", state.netarch, id, r => r.name || "architettura", async r => {
        state.netarch = state.netarch.filter(x => x.id !== r.id);
        Store.send({ t: "del", col: "netarch", id: r.id });
        if (v) { try { await Store.remove("netview", v); Store.send({ t: "del", col: "netview", id: v.id }); state.netview = state.netview.filter(x => x.id !== v.id); } catch (e) { console.warn(e); } }
      });
      break;
    }
    case "gm-add": {
      const inp = $("#gm-email"), email = inp && inp.value.trim();
      if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { toast("Scrivi un'email valida", "err"); break; }
      try { await Store.addGm(email); inp.value = ""; toast(`${email} ora è GM`, "ok"); loadGmList(); } catch (err) { fail(err); }
      break;
    }
    case "gm-remove": {
      const email = el.dataset.email;
      const me = norm(email) === norm(Store.user);
      if (!(await askConfirm(me ? `Togliere te stesso dai GM? Non vedrai più le cose segrete finché un altro GM non ti riaggiunge.` : `Togliere ${email} dai GM?`, "Togli"))) break;
      try { await Store.removeGm(email); toast("Fatto"); if (me) location.reload(); else loadGmList(); } catch (err) { fail(err); }
      break;
    }
    case "gm-open-map": tt.view = id; tt.sel = null; location.hash = "#/mappa"; break;
    case "party-as": {
      const e = state.entries.find(x => x.id === id); if (!e) break;
      ls.set("nc-as", id); $$("[data-roll-as]").forEach(s => { s.value = id; });
      toast(`Il Dice log ora tira come ${e.name}`, "ok"); openDrawer();
      break;
    }
    case "new-song": editSong(null); break;
    case "edit-song": editSong(id); break;
    case "delete-song": confirmDelete("songs", state.songs, id, r => r.title, r => { state.songs = state.songs.filter(x => x.id !== r.id); }); break;
    case "open-note": openNote(id); break;
    case "new-note": editNote(null); break;
    case "edit-note": editNote(id); break;
    case "delete-note": confirmDelete("notes", state.notes, id, r => r.title, r => { state.notes = state.notes.filter(x => x.id !== r.id); }); break;
    case "new-scene": editScene(null); break;
    case "edit-scene": editScene(id); break;
    case "delete-scene": confirmDelete("diary", state.diary, id, r => r.title, r => { state.diary = state.diary.filter(x => x.id !== r.id); if (location.hash.startsWith("#/diario/")) history.replaceState(null, "", "#/diario"); }); break;
    case "new-quest": editQuest(null); break;
    case "edit-quest": editQuest(id); break;
    case "delete-quest": confirmDelete("quests", state.quests, id, r => "quest " + r.name, r => { state.quests = state.quests.filter(x => x.id !== r.id); if (state.quest === r.id) state.quest = "all"; history.replaceState(null, "", "#/quest"); }); break;
    case "set-quest":
      state.quest = el.dataset.quest; ls.set("nc-quest", state.quest);
      if (location.hash !== "#/diario") location.hash = "#/diario"; else route();
      break;
    case "scene-in-quest": state.quest = el.dataset.quest; ls.set("nc-quest", state.quest); break; // poi il link apre la scena
    case "q-expand": {
      const open = el.dataset.open !== "1";
      $$(".q-scene").forEach(d => { d.open = open; });
      el.dataset.open = open ? "1" : ""; el.textContent = open ? "Chiudi tutte le scene" : "Espandi tutte le scene";
      break;
    }
    case "new-event": editEvent(null, el.dataset.date); break;
    case "edit-event": editEvent(id); break;
    case "delete-event": confirmDelete("events", state.events, id, r => r.title, r => { state.events = state.events.filter(x => x.id !== r.id); }); break;
    case "edit-weather": editWeather(el.dataset.date); break;
    case "delete-weather": confirmDelete("weather", state.weather, id, r => "meteo del " + fmtDate(r.date), r => { state.weather = state.weather.filter(x => x.id !== r.id); }); break;
    case "set-gameday":
      try { await saveSite({ campaignDate: el.dataset.date }); toast("Data in gioco aggiornata", "ok"); route(); } catch (err) { fail(err); }
      break;
    case "toggle-suno": {
      const box = $(".suno-embed", el.closest(".track"));
      if (box.hidden) { box.innerHTML = `<iframe src="${esc(el.dataset.embed)}" loading="lazy" allow="autoplay; encrypted-media" title="Player Suno"></iframe>`; box.hidden = false; el.textContent = "■ Chiudi player"; }
      else { box.innerHTML = ""; box.hidden = true; el.textContent = "▶ Player Suno"; }
      break;
    }
    case "car-step": { const car = el.closest(".carousel"); carGo(car, +car.dataset.i + +el.dataset.d); break; }
    case "car-go": { const car = el.closest(".carousel"); carGo(car, +el.dataset.i); break; }
    case "zoom": {
      const car = el.closest(".carousel");
      const srcs = car ? $$(".car-slide", car).map(i => i.src).filter(Boolean) : [el.src];
      openLightbox(srcs, car ? +car.dataset.i : 0);
      break;
    }
    case "pick-file": $("input[type=file]", el.closest("[data-picker]")).click(); break;
    case "pick-clear": {
      const p = el.closest("[data-picker]");
      p._blob = null; $("input[type=hidden]", p).value = ""; $("[data-picker-url]", p).value = "";
      if (p.dataset.type === "image") $(".picker-preview", p).innerHTML = `<div class="ph">NESSUNA IMMAGINE</div>`;
      else { const au = $("audio", p); au.removeAttribute("src"); au.hidden = true; $(".audio-name", p).textContent = ""; }
      break;
    }
    case "cf-add": $("#cf-list").insertAdjacentHTML("beforeend", cfRow()); $("#cf-list .cf-row:last-child input").focus(); break;
    case "cf-del": el.closest(".cf-row").remove(); break;
    // scheda personaggio
    case "edit-sheet": editSheet(id); break;
    case "edit-decks": editDecks(id); break;
    case "ip-open": openIp(id); break;
    case "ip-earn": case "ip-spend": case "ip-undo": case "ip-edit": ipAction(el); break;
    case "sheet-roll": { const e = state.entries.find(x => x.id === id); if (e) sheetRoll(e, el.dataset.roll); break; }
    case "rl-op": roleOp(el); break;
    case "rl-roll": roleRoll(el); break;
    case "log-clear": ls.set("nc-log-cleared", new Date().toISOString()); renderLogs(); toast("Dice log pulito su questo dispositivo: i tiri restano salvati"); break;
    case "log-wipe": wipeLog(); break;
    case "log-unclear": ls.set("nc-log-cleared", ""); renderLogs(); break;
    case "cy-on": cyberPatch(id, c => { const it = ((c.slots || {})[el.dataset.slot] || [])[num(el.dataset.i)]; if (it) it.on = !it.on; return c; }); break;
    case "cy-weapon": {
      const e = state.entries.find(x => x.id === id), w = e && cyberFx(e).weapons.find(x => x.name === el.dataset.name); if (!w || !Store.canEdit()) break;
      const T = CPR.weaponType(w.cat) || {};
      sheetPatch(id, s => { s.weapons = [...(s.weapons || []), { name: w.name, cat: w.cat, skill: w.skill || T.skill || "melee", dmg: w.dmg, rof: w.rof || T.rof || 1, mag: "", ...(w.quality ? { quality: w.quality } : {}), note: [w.note, "cyberware"].filter(Boolean).join(" · ") }]; return s; });
      toast(`${w.name} aggiunta alle armi`, "ok"); break;
    }
    case "cyhb-edit": editCyberHb(id); break;
    case "gloss-tab": ls.set("nc-gloss", el.dataset.tab); route(); break;
    case "mk-buy": mkBuy(el.dataset.key); break;
    case "mk-log": mkHistory(id); break;
    case "mk-undo": mkUndo(id); break;
    case "mk-import": mkImport(); break;
    case "mk-edit": { const it = MK.byId(el.dataset.key); if (it && MK_FORMS[it.type]) editMkItem(it.type, it.id); else mkImport(el.dataset.key); break; }
    case "mk-custom": editMkItem(el.dataset.type); break;
    case "drug-take": drugTake(id, num(el.dataset.i)); break;
    case "deck-install": { const sel = el.closest("li") && $(".g-deck", el.closest("li")); deckInstall(id, num(el.dataset.i), num(sel ? sel.value : el.dataset.deck)); break; }
    case "tt-tool": setTool(el.dataset.tool); break;
    case "hq-buy": hqBuy(el.dataset.id); break;
    case "hq-lose": hqLose(el.dataset.id); break;
    case "hq-log": hqLog(); break;
    case "hq-undo": hqUndo(); break;
    case "hq-edit": hqEdit(); break;
    case "hq-item": hqItemEdit(el.dataset.id); break;
    case "hq-gear": hqGearEdit(el.dataset.id); break;
    case "hq-proj-week": hqProjOp("week", el.dataset.id); break;
    case "hq-proj-fumble": hqProjOp("fumble", el.dataset.id); break;
    case "hq-proj-done": hqProjOp("done", el.dataset.id); break;
    case "hq-floor": hqFloorEdit(el.dataset.id); break;
    case "hq-floor-go": hqFloor = el.dataset.id; ls.set("nc-hq-floor", hqFloor); route(); break;
    case "hq-floor-map": hqFloorMap(el.dataset.id); break;
    case "hq-floor-zoom": { const f = (hqRec().floors || []).find(x => x.id === el.dataset.id); if (f && f.image) openLightbox([f.image], 0); break; }
    case "tt-layer": setLayer(el.dataset.layer); break;
    case "tt-bg-fit": bgFit(); break;
    case "tt-color": setDrawColor(el.dataset.c); break;
    case "tt-fill": toggleFill(); break;
    case "tt-bar-toggle": ls.set("nc-tt-bar", !ls.get("nc-tt-bar", true)); renderDrawBar(); break;
    case "tt-shape-z": shapeZ(el.dataset.z); break;
    case "tt-draw-undo": drawUndo(); break;
    case "tt-draw-clear": drawClear(); break;
    case "cy-install": cyInstall(id, num(el.dataset.i)); break;
    case "wd-wear": wdWear(id, num(el.dataset.i)); break;
    case "wd-style-wear": wdStyleWear(id, el.dataset.style || ""); break;
    case "wd-off-all": wdOffAll(id); break;
    case "edit-wardrobe": editWardrobe(id); break;
    case "vh-add": vhAdd(id, el.dataset.src); break;
    case "vh-del": vhDel(id, num(el.dataset.k)); break;
    case "vh-src": vhSrc(id, num(el.dataset.k), el.dataset.j == null ? null : num(el.dataset.j)); break;
    case "vh-upg-del": vhUpgDel(id, num(el.dataset.k), num(el.dataset.j)); break;
    case "agent-toggle": agentToggle(id, el.dataset.app); break;
    case "edit-agent": editAgent(id); break;
    case "exp-toggle": expToggle(id, el.dataset.app); break;
    case "exp-pay": expPay(id); break;
    case "edit-expenses": editExpenses(id); break;
    case "armor-wear": wearArmor(id, num(el.dataset.i), el.dataset.loc === "both" ? "head" : el.dataset.loc); break;
    case "armor-off": takeOffArmor(id, String(el.dataset.loc || "").split(",").filter(Boolean)); break;
    case "wpn-away": {   // arma lasciata a casa / portata con sé
      if (!Store.canEdit()) break;
      const i = num(el.dataset.i);
      sheetPatch(id, s => { const w = (s.weapons || [])[i]; if (!w) return s; if (w.away) delete w.away; else w.away = true; return s; });
      break;
    }
    case "tt-dsp": {   // penalità del Death Save dal pannello del token
      const t = state.tokens.find(x => x.id === tt.sel); if (!t || !Store.canEdit()) break;
      const e = tokEntry(t), d = num(el.dataset.d);
      if (e && isPerson(e) && hasSheet(e)) sheetPatch(e.id, s => { s.dsp = Math.max(0, num(s.dsp) + d); return s; });
      else saveToken({ ...t, dsp: Math.max(0, num(t.dsp) + d) });
      setTimeout(renderSel, 50);
      break;
    }
    case "deck-uninstall": deckUninstall(id, num(el.dataset.deck), num(el.dataset.i)); break;
    case "drug-end": drugEnd(id, el.dataset.uid); break;
    case "drug-cure": drugCure(id, num(el.dataset.i)); break;
    case "mk-hide": { const k = el.dataset.key, h = mkCfg().hide || []; mkSaveCfg({ hide: h.includes(k) ? h.filter(x => x !== k) : [...h, k] }); break; }
    case "cb-roll": cbRoll(wSrc(el.dataset.src, id, el.dataset.i, el.dataset.tok), el.dataset.mode || "single"); break;
    case "sp-attack": spAttack(wSrc(el.dataset.src, id, el.dataset.i, el.dataset.tok), num(el.dataset.n)); break;
    case "sp-check": spCheck(wSrc(el.dataset.src, id, el.dataset.i, el.dataset.tok), num(el.dataset.n)); break;
    case "sp-battery": spBattery(id, num(el.dataset.i)); break;
    case "sp-edit": spEdit(id, num(el.dataset.i)); break;
    case "att-off": attOff(id, num(el.dataset.i), num(el.dataset.k)); break;
    case "att-slots": attSlots(id, num(el.dataset.i), num(el.dataset.d)); break;
    case "ammo-mod": ammoModEdit(id, num(el.dataset.i)); break;
    case "cb-reload": cbReload(id, el.dataset.i); break;
    case "cb-dmg": cbDamage(wSrc(el.dataset.src, id, el.dataset.i, el.dataset.tok), num(el.dataset.mult)); break;
    case "sheet-status": { const e = state.entries.find(x => x.id === el.dataset.stSheet); if (e && Store.canEdit()) statusOp(el, sheetStatusApply(e)); break; }
    case "tok-status": { const t = state.tokens.find(x => x.id === el.dataset.stTok); if (t && Store.canEdit()) statusOp(el, tokStatusApply(t)); break; }
    case "sheet-crit": { const e = state.entries.find(x => x.id === id); if (!e) break; lastCrit[id] = critRoll(e.name, el.dataset.loc, r => postRoll({ ...r, who: e.name, entryId: e.id })); refreshSheetView(id); break; }
    case "sheet-crit-add": {
      const L = lastCrit[id]; if (!L || !Store.canEdit()) break;
      delete lastCrit[id];
      sheetPatch(id, s => { s.crit = [s.crit, `${L.name} (${L.loc === "head" ? "testa" : "corpo"}): ${L.eff}`].filter(Boolean).join("\n"); if (L.dsp) s.dsp = num(s.dsp) + L.dsp; return s; });
      toast(`${L.name} aggiunta${L.dsp ? " · penalità del Death Save +1" : ""}`, "ok");
      break;
    }
    case "gm-rules": editRules(); break;
    case "hb-edit": editHomebrew(el.dataset.kind, id); break;
    case "deck-adj": { const e = state.entries.find(x => x.id === id), op = rezOp(el, el.dataset.op); if (e && op && Store.canEdit()) deckAdj(e, num(el.dataset.i), op); break; }
    case "sheet-adj": {
      const e = state.entries.find(x => x.id === id); if (!e || !Store.canEdit()) break;
      const f = el.dataset.f, d = el.dataset.d;
      sheetPatch(id, s => {
        if (f === "hp") s.hp = clamp(hpOf(e) + num(d), 0, hpMaxOf(e));
        else if (f === "luck") s.luck = d === "reset" ? null : clamp(luckOf(e) + num(d), 0, statBase(e, "LUCK"));
        else if (f === "dsp") s.dsp = Math.max(0, num(s.dsp) + num(d));
        else if (f.startsWith("armor.")) armorPatch(s, e, f.slice(6), d);
        return s;
      });
      break;
    }
    // dadi
    case "dice-toggle": if (drawer && !drawer.hidden) closeDrawer(); else openDrawer(); break;
    case "dice-open": openDrawer(); break;
    case "dice-close": closeDrawer(); break;
    case "menu-toggle": if ($("#side-menu").hidden) openMenu(); else closeMenu(); break;
    case "menu-close": closeMenu(); break;
    case "dice-min": minDrawer(); break;
    default: if (a.startsWith("tt-")) tableAction(a, el);
  }
});

// log dei dadi: invio, tiri rapidi, "tira come"
document.addEventListener("submit", ev => {
  const f = ev.target.closest && ev.target.closest("[data-roll-form]"); if (!f) return;
  ev.preventDefault();
  const inp = $("[data-roll-text]", f); submitChat(inp.value); inp.value = ""; inp.focus();
});
document.addEventListener("click", ev => {
  const q = ev.target.closest && ev.target.closest("[data-quick]"); if (q) quickRoll(q.dataset.quick);
});
document.addEventListener("change", ev => {
  const t = ev.target;
  // armi: mirato (solo su questo dispositivo), munizioni e tabelle (nell'arma)
  if (t.matches("[data-cb-aim], [data-cb-loc], [data-cb-ammo], [data-cb-table], [data-cb-atable], [data-cb-weak]")) {
    const X = wSrc(t.dataset.src, t.dataset.id, t.dataset.i, t.dataset.tok); if (!X) return;
    if (t.matches("[data-cb-aim], [data-cb-loc], [data-cb-weak]")) {
      const M = cbMem[X.key] = cbMem[X.key] || {};
      if (t.matches("[data-cb-aim]")) M.aim = t.checked; else if (t.matches("[data-cb-weak]")) M.weak = t.checked; else M.loc = t.value;
      X.refresh(); return;
    }
    if (!X.edit) return;
    // armi della scheda con caricatore: cambiare tipo = scaricare e ricaricare dalle scorte
    if (t.matches("[data-cb-ammo]") && X.mag) { cbReload(X.id, X.i, t.value); return; }
    const f = t.matches("[data-cb-ammo]") ? "ammo" : t.matches("[data-cb-table]") ? "range" : "autoRange";
    if (f !== "ammo" && cbMem[X.key]) delete cbMem[X.key].last;
    X.save(f, t.value);
    return;
  }
  if (t.matches("[data-sp-rider]")) { const X = wSrc(t.dataset.src, t.dataset.id, t.dataset.i, t.dataset.tok); if (X) { spMem(X).riders[t.dataset.spRider] = t.checked; } return; }
  if (t.matches("[data-att-on]")) { if (t.value !== "") attOn(t.dataset.id, num(t.dataset.i), num(t.value)); return; }
  // tab Ruoli
  if (t.matches("[data-rl][data-rf]")) { roleSet(t); return; }
  // tab Veicoli
  if (t.matches("[data-vh-f]")) { vhField(t); return; }
  if (t.matches("select[data-vh-upg]")) { vhUpgAdd(t); return; }
  if (t.matches("select[data-st-op=add]")) {
    if (t.dataset.stSheet) { const e = state.entries.find(x => x.id === t.dataset.stSheet); if (e && Store.canEdit()) statusOp(t, sheetStatusApply(e)); }
    if (t.dataset.stTok) { const k = state.tokens.find(x => x.id === t.dataset.stTok); if (k && Store.canEdit()) statusOp(t, tokStatusApply(k)); }
    return;
  }
  if (t.matches("[data-gloss-g]")) { glossG = t.value; const b = $("#gloss-body"); if (b) b.innerHTML = glossBody(glossTab()); return; }
  if (t.matches("[data-bg-keep]")) { ls.set("nc-bg-keep", t.checked); return; }
  if (t.matches("[data-bg-snap]")) { ls.set("nc-bg-snap", t.checked); return; }
  if (t.matches("[data-tok-layer]")) {   // layer del token: GM = nascosto ai giocatori
    const tok = state.tokens.find(x => x.id === tt.sel); if (!tok || !gmTools()) return;
    const L = t.value, { layer, ...rest } = tok;
    saveToken({ ...rest, hidden: L === "gm", ...(L === "map" ? { layer: "map" } : {}) });
    toast(L === "gm" ? `${tokName(tok)} è sul layer GM: i giocatori non lo vedono` : L === "map" ? `${tokName(tok)} è sul layer Map` : `${tokName(tok)} è sul layer Token`);
    if (L !== curLayer()) tt.sel = null;
    return;
  }
  if (t.matches("[data-gloss-p]")) { glossP = t.value; const b = $("#gloss-body"); if (b) b.innerHTML = glossBody(glossTab()); return; }
  if (t.matches("[data-mk-who]")) { ls.set("nc-mk-who", t.value || "none"); route(); return; }
  if (t.matches("[data-mk-open]")) { mkSaveCfg({ open: t.checked }); return; }
  if (t.matches("[data-mk-pct]")) { const v = Math.max(10, Math.min(500, Math.round(num(t.value)) || 100)); mkSaveCfg({ pct: v }); return; }
  if (t.matches("[data-roll-as]")) { ls.set("nc-as", t.value || null); $$("[data-roll-as]").forEach(s => { s.value = t.value; }); }
  // cambio mappa: solo per me; il GM poi può premere "Mostra a tutti"
  if (t.matches("[data-secret]")) { secretRoll = t.checked; ls.set("nc-secret", secretRoll); $$("[data-secret]").forEach(c => { c.checked = secretRoll; }); $$(".roll-form").forEach(f => f.classList.toggle("is-secret", secretRoll)); return; }
  if (t.id === "tt-map") { tt.view = t.value; tt.sel = null; tt.remote = {}; route(); return; }
  if (t.matches("[data-sk-all]")) { ls.set("nc-sk-all", t.checked); const sh = t.closest(".sh"); if (sh) refreshSheetView(sh.dataset.sheet); }
  if (t.matches("[data-init]")) {
    const m = curMap(); if (!m || !Store.canEdit()) return;
    saveMap({ ...m, init: (m.init || []).map(it => it.tokenId === t.dataset.init ? { ...it, v: num(t.value) } : it) });
  }
});
document.addEventListener("input", ev => {
  if (ev.target.matches("[data-gloss-q]")) { glossQ = ev.target.value; const b = $("#gloss-body"); if (b) { b.innerHTML = glossBody(glossTab()); const i = $("[data-gloss-q]", b); i.focus(); i.setSelectionRange(i.value.length, i.value.length); } return; }
  if (ev.target.matches("[data-sheet-mod]")) sheetMod = Math.trunc(num(ev.target.value));
});

// tavolo: frecce = sposta il token selezionato di una casella · Canc = deseleziona
document.addEventListener("keydown", ev => {
  if (!onTable() || $("#modal").open || !tt.sel) return;
  if (ev.target.closest && ev.target.closest("input, textarea, select")) return;
  if (ev.key === "Escape") { selectToken(null); return; }
  const dir = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[ev.key];
  const t = state.tokens.find(x => x.id === tt.sel), m = curMap();
  if (!dir || !t || !m || !canMove(t)) return;
  ev.preventDefault();
  const { W, H } = mapSize(m), size = clamp(num(t.size) || 1, 1, 6);
  saveToken({ ...t, x: clamp(num(t.x) + dir[0], 0, W - size), y: clamp(num(t.y) + dir[1], 0, H - size) });
});

// tavolo: Ctrl+C / Ctrl+V copia e incolla il token selezionato, Ctrl+D lo duplica (solo GM)
document.addEventListener("keydown", ev => {
  if (!onTable() || $("#modal").open || !(ev.ctrlKey || ev.metaKey) || ev.altKey || ev.shiftKey || !gmTools()) return;
  if (ev.target.closest && ev.target.closest("input, textarea, select, [contenteditable]")) return;
  if (String(getSelection() || "")) return;   // c'è del testo selezionato: copia normale
  const k = ev.key.toLowerCase(), t = state.tokens.find(x => x.id === tt.sel);
  if (k === "c" && t) { ev.preventDefault(); copyToken(t); }
  else if (k === "v" && tt.clip) { ev.preventDefault(); pasteTokens(1); }
  else if (k === "d" && t) { ev.preventDefault(); const err = tokCopyErr(t); if (err) return toast(err, "err"); tt.clip = JSON.parse(JSON.stringify(t)); pasteTokens(1, t); }
});

// frecce da tastiera: lightbox, poi carosello del dossier
document.addEventListener("keydown", ev => {
  if (ev.key !== "ArrowLeft" && ev.key !== "ArrowRight") return;
  if (ev.target.closest && ev.target.closest("input, textarea, select")) return;
  const d = ev.key === "ArrowLeft" ? -1 : 1;
  if (lightbox) { lightbox.show(lightbox.i + d); ev.preventDefault(); return; }
  const car = $("#modal").open && $("#modal .carousel[data-n]");
  if (car) { carGo(car, +car.dataset.i + d); ev.preventDefault(); }
});

// un solo audio alla volta + vinile che gira
document.addEventListener("play", ev => {
  if (ev.target.tagName !== "AUDIO") return;
  $$("audio").forEach(a => { if (a !== ev.target) a.pause(); });
  const t = ev.target.closest(".track"); t && t.classList.add("playing");
}, true);
["pause", "ended"].forEach(n => document.addEventListener(n, ev => {
  const t = ev.target.closest && ev.target.closest(".track"); t && t.classList.remove("playing");
}, true));
