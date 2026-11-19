// ============================================================
//  NIGHT CITY ARCHIVE — calendario e meteo
//  (js/ui/: i file si caricano in ordine da index.html e condividono le costanti)
// ============================================================

// ---------- CALENDARIO ----------
const wxOn = date => state.weather.find(w => w.date === date && wxOf(w.type));
const wxBadge = w => w ? `<span class="cal-wx" title="${esc(wxOf(w.type).label)}${w.temp != null && w.temp !== "" ? " · " + fmtTemp(w.temp) : ""}">${wxIcon(w.type)}${w.temp != null && w.temp !== "" ? `<b>${Math.round(w.temp)}°</b>` : ""}</span>` : "";

function eventsOn(date) {
  return state.events.filter(e => e.date === date).sort((a, b) => (a.time || "99").localeCompare(b.time || "99"));
}

function monthNav(y, m) {
  const prev = m === 1 ? [y - 1, 12] : [y, m - 1], next = m === 12 ? [y + 1, 1] : [y, m + 1];
  const canPrev = prev[0] >= START_YEAR, canNext = next[0] <= END_YEAR;
  const years = []; for (let i = START_YEAR; i <= END_YEAR; i++) years.push(i);
  return `
    <div class="cal-nav">
      <a class="car-btn inline prev ${canPrev ? "" : "disabled"}" ${canPrev ? `href="#/calendario/${prev[0]}-${pad(prev[1])}"` : ""} aria-label="Mese precedente"><span>‹</span></a>
      <div class="cal-title">
        <span class="cal-month glitch" data-text="${MONTHS[m - 1].toUpperCase()}">${MONTHS[m - 1].toUpperCase()}</span>
        <span class="cal-year">${y}</span>
      </div>
      <a class="car-btn inline next ${canNext ? "" : "disabled"}" ${canNext ? `href="#/calendario/${next[0]}-${pad(next[1])}"` : ""} aria-label="Mese successivo"><span>›</span></a>
      <div class="cal-jump">
        <select id="cal-m" aria-label="Mese">${MONTHS.map((n, i) => `<option value="${i + 1}" ${i + 1 === m ? "selected" : ""}>${n}</option>`).join("")}</select>
        <select id="cal-y" aria-label="Anno">${years.map(v => `<option ${v === y ? "selected" : ""}>${v}</option>`).join("")}</select>
        ${site().campaignDate && validDay(site().campaignDate) ? `<a class="btn small yellow ghost" href="#/calendario/${esc(site().campaignDate)}">◉ Oggi in gioco</a>` : ""}
      </div>
    </div>`;
}

function viewMonth(p) {
  const fallback = parseYmd(site().campaignDate) || state.cal || { y: START_YEAR, m: 1 };
  let { y, m } = p || state.cal || fallback;
  y = Math.min(END_YEAR, Math.max(START_YEAR, y)); m = Math.min(12, Math.max(1, m));
  state.cal = { y, m }; ls.set("nc-cal", state.cal);
  const first = wday(y, m, 1), n = daysIn(y, m), gameDay = site().campaignDate;
  const prefix = `${y}-${pad(m)}-`;
  const monthEvents = state.events.filter(e => (e.date || "").startsWith(prefix))
    .sort((a, b) => (a.date + (a.time || "")).localeCompare(b.date + (b.time || "")));
  const cells = [];
  for (let i = 0; i < first; i++) cells.push(`<div class="cal-cell blank"></div>`);
  for (let d = 1; d <= n; d++) {
    const date = ymd(y, m, d), evs = monthEvents.filter(e => e.date === date);
    cells.push(`
      <a class="cal-cell ${evs.length ? "has" : ""} ${date === gameDay ? "today" : ""} ${wday(y, m, d) >= 5 ? "weekend" : ""}" href="#/calendario/${date}" aria-label="${d} ${MONTHS[m - 1]} ${y}${evs.length ? `, ${evs.length} eventi` : ""}">
        <span class="cal-top">
          <span class="cal-n">${pad(d)}</span>
          ${date === gameDay ? `<span class="cal-now">OGGI</span>` : ""}
          ${wxBadge(wxOn(date))}
        </span>
        <span class="cal-evs">
          ${evs.slice(0, 3).map(e => `<span class="cal-ev" style="--c:${evType(e.type).color}">${esc(e.title)}</span>`).join("")}
          ${evs.length > 3 ? `<span class="cal-more">+${evs.length - 3}</span>` : ""}
        </span>
      </a>`);
  }
  while (cells.length % 7) cells.push(`<div class="cal-cell blank"></div>`);
  return `
    <div class="page-head">
      <div><div class="kicker">// NC_CHRONOLOG</div><h1>Calendario</h1><p>Clicca un giorno per leggere o scrivere cosa è successo.</p></div>
      ${Store.canEdit() ? `<button class="btn" data-action="new-event" data-date="${ymd(y, m, 1)}">+ Nuovo evento</button>` : ""}
    </div>
    ${monthNav(y, m)}
    <div class="cal">
      <div class="cal-head">${WDAYS.map(d => `<span>${d}</span>`).join("")}</div>
      <div class="cal-grid">${cells.join("")}</div>
    </div>
    <div class="section-title" style="margin-top:28px"><h2>Eventi di ${MONTHS[m - 1]} ${y}</h2></div>
    ${monthEvents.length ? `<div class="timeline">${monthEvents.map(timelineItem).join("")}</div>`
      : `<div class="empty"><div class="big">// NESSUN EVENTO</div>Nessun evento registrato in questo mese.</div>`}
    <div class="legend">${EVENT_TYPES.map(t => `<span style="--c:${t.color}">${t.label}</span>`).join("")}</div>
    ${state.weather.some(w => w.date.startsWith(prefix)) ? `<div class="legend wx-legend">${
      [...new Set(state.weather.filter(w => w.date.startsWith(prefix)).map(w => w.type))].filter(wxOf)
        .map(t => `<span>${wxIcon(t)}${esc(wxOf(t).label)}</span>`).join("")}</div>` : ""}`;
}

function viewDay(date) {
  const p = parseYmd(date), evs = eventsOn(date), gameDay = site().campaignDate;
  const prev = addDays(date, -1), next = addDays(date, 1);
  const canPrev = validDay(prev), canNext = validDay(next);
  return `
    <a class="back" href="#/calendario/${p.y}-${pad(p.m)}">‹ ${MONTHS[p.m - 1]} ${p.y}</a>
    <div class="day-head">
      <a class="car-btn inline prev ${canPrev ? "" : "disabled"}" ${canPrev ? `href="#/calendario/${prev}"` : ""} aria-label="Giorno precedente"><span>‹</span></a>
      <div class="day-title">
        <div class="kicker">// ${WDAYS_LONG[wday(p.y, p.m, p.d)].toUpperCase()} ${date === gameDay ? `· <span class="now-tag">DATA IN GIOCO</span>` : ""}</div>
        <h1><span class="day-num">${pad(p.d)}</span> ${MONTHS[p.m - 1]} <span class="day-year">${p.y}</span></h1>
      </div>
      <a class="car-btn inline next ${canNext ? "" : "disabled"}" ${canNext ? `href="#/calendario/${next}"` : ""} aria-label="Giorno successivo"><span>›</span></a>
    </div>
    ${weatherPanel(date)}
    ${diaryOnDay(date)}
    ${Store.canEdit() ? `<div class="day-actions">
      <button class="btn" data-action="new-event" data-date="${date}">+ Aggiungi evento</button>
      ${date !== gameDay ? `<button class="btn yellow ghost small" data-action="set-gameday" data-date="${date}">◉ Imposta come data in gioco</button>` : ""}
    </div>` : ""}
    ${evs.length ? `<div class="events">${evs.map(eventCard).join("")}</div>`
      : `<div class="empty"><div class="big">// LOG VUOTO</div>Nessun evento registrato in questo giorno.
         ${Store.canEdit() ? `<br><button class="btn" data-action="new-event" data-date="${date}">+ Scrivi cosa è successo</button>` : ""}</div>`}`;
}

// ---------- METEO ----------
function weatherPanel(date) {
  const w = wxOn(date), edit = Store.canEdit();
  if (!w) return edit
    ? `<button class="wx-panel wx-empty" data-action="edit-weather" data-date="${date}"><span class="wx-plus">+</span> Aggiungi il meteo del giorno</button>`
    : "";
  const t = wxOf(w.type);
  return `
    <div class="wx-panel" style="--c:${t.color}">
      <div class="wx-big">${wxIcon(w.type, "wx-ic big")}</div>
      <div class="wx-info">
        <div class="wx-kicker">// METEO · NIGHT CITY</div>
        <div class="wx-name">${esc(t.label)}</div>
        ${w.note ? `<div class="wx-note">${esc(w.note)}</div>` : ""}
      </div>
      ${w.temp != null && w.temp !== "" ? `<div class="wx-temp">${Math.round(w.temp)}<small>${TEMP_UNIT}</small></div>` : ""}
      ${edit ? `<button class="btn ghost small cyan wx-edit" data-action="edit-weather" data-date="${date}">Modifica</button>` : ""}
    </div>`;
}

function editWeather(date) {
  const w = wxOn(date) || {};
  const prev = wxOn(addDays(date, -1));
  openModal(`
    <form class="form" id="wx-form">
      <div class="modal-head"><h2>// METEO · ${fmtDate(date).toUpperCase()}</h2><button type="button" class="x" data-action="close" aria-label="Chiudi">×</button></div>
      <div class="modal-body">
        <span class="lbl">Condizioni</span>
        <div class="wx-grid">
          ${WEATHER.map(t => `
            <label class="wx-opt" style="--c:${t.color}">
              <input type="radio" name="type" value="${t.id}" ${w.type === t.id ? "checked" : ""} required>
              ${wxIcon(t.id)}<span>${esc(t.label)}</span>
            </label>`).join("")}
        </div>
        <div class="fields" style="margin-top:16px">
          <div class="field"><label for="wx-temp">Temperatura (${TEMP_UNIT})</label>
            <div class="temp-row"><button type="button" class="gp-btn" data-temp="-1" aria-label="Meno un grado">−</button>
            <input id="wx-temp" name="temp" type="number" step="1" min="-40" max="60" value="${esc(w.temp ?? "")}" placeholder="es. 18">
            <button type="button" class="gp-btn" data-temp="1" aria-label="Più un grado">+</button></div></div>
          <div class="field"><label for="wx-note">Nota (facoltativa)</label><input id="wx-note" name="note" value="${esc(w.note)}" placeholder="es. allerta smog, coprifuoco"></div>
        </div>
        ${prev && !w.type ? `<button type="button" class="btn ghost small yellow" data-wx-copy style="margin-top:14px">↺ Come il giorno prima (${esc(wxOf(prev.type).label)}${prev.temp != null && prev.temp !== "" ? ", " + fmtTemp(prev.temp) : ""})</button>` : ""}
      </div>
      <div class="modal-foot">
        ${w.id ? `<button type="button" class="btn ghost small left" data-action="delete-weather" data-id="${esc(w.id)}">Rimuovi meteo</button>` : `<button type="button" class="btn ghost small left" data-action="close">Annulla</button>`}
        <button type="submit" class="btn">Salva meteo</button>
      </div>
    </form>`, true);
  const form = $("#wx-form");
  form.addEventListener("click", ev => {
    const b = ev.target.closest("[data-temp]");
    if (b) { const i = form.temp; i.value = (Number(i.value) || 0) + Number(b.dataset.temp); }
    if (ev.target.closest("[data-wx-copy]") && prev) {
      form.querySelector(`input[name=type][value="${prev.type}"]`).checked = true;
      form.temp.value = prev.temp ?? ""; form.note.value = prev.note || "";
    }
  });
  form.addEventListener("submit", async ev => {
    ev.preventDefault();
    const fd = new FormData(form), temp = fd.get("temp");
    try {
      const saved = await Store.save("weather", {
        ...w, id: w.id || "wx-" + date, date, type: fd.get("type"),
        temp: temp === "" ? null : Number(temp), note: fd.get("note").trim(),
      });
      upsert(state.weather, saved);
      toast("Meteo salvato", "ok"); closeModal(); route();
    } catch (err) { fail(err); }
  });
}

function eventCard(ev) {
  const t = evType(ev.type);
  return `
    <article class="event" style="--c:${t.color}">
      <div class="event-head">
        <span class="event-time">${ev.time ? esc(ev.time) : "--:--"}</span>
        <span class="event-type">${esc(t.label)}</span>
        ${Store.canEdit() ? `<span class="event-tools">
          <button class="btn ghost small cyan" data-action="edit-event" data-id="${esc(ev.id)}">Modifica</button>
          <button class="btn ghost small" data-action="delete-event" data-id="${esc(ev.id)}">✕</button></span>` : ""}
      </div>
      <h3>${esc(ev.title)}</h3>
      ${ev.location || (ev.people || []).length ? `<dl class="event-meta">
        ${ev.location ? `<dt>Luogo</dt><dd>${peopleLinks([ev.location])}</dd>` : ""}
        ${(ev.people || []).length ? `<dt>Coinvolti</dt><dd>${peopleLinks(ev.people)}</dd>` : ""}
      </dl>` : ""}
      ${ev.body ? `<div class="prewrap event-body">${esc(ev.body)}</div>` : ""}
      ${(ev.tags || []).length ? `<div class="meta">${ev.tags.map(x => `<span class="badge tag">#${esc(x)}</span>`).join("")}</div>` : ""}
    </article>`;
}

function editEvent(id, date) {
  const ev = state.events.find(x => x.id === id) || { date: date || ymd(START_YEAR, 1, 1), type: "storia" };
  const names = state.entries.filter(e => e.kind !== "luogo").map(e => e.name).filter(Boolean);
  openModal(`
    <form class="form" id="event-form">
      <div class="modal-head"><h2>${ev.id ? "// MODIFICA EVENTO" : "// NUOVO EVENTO"}</h2><button type="button" class="x" data-action="close" aria-label="Chiudi">×</button></div>
      <div class="modal-body">
        <div class="fields">
          <div class="field"><label class="req" for="e-date">Data</label><input id="e-date" name="date" type="date" required min="${START_YEAR}-01-01" max="${END_YEAR}-12-31" value="${esc(ev.date)}"></div>
          <div class="field"><label for="e-time">Ora</label><input id="e-time" name="time" type="time" value="${esc(ev.time)}"></div>
          <div class="field full"><label class="req" for="e-title">Titolo</label><input id="e-title" name="title" required value="${esc(ev.title)}" placeholder="es. Imboscata al mercato di Kabuki"></div>
          <div class="field"><label for="e-type">Tipo</label><select id="e-type" name="type">${EVENT_TYPES.map(t => `<option value="${t.id}" ${ev.type === t.id ? "selected" : ""}>${t.label}</option>`).join("")}</select></div>
          <div class="field"><label for="e-loc">Luogo</label><input id="e-loc" name="location" list="dl-loc" value="${esc(ev.location)}"></div>
          <div class="field full"><label for="e-people">Coinvolti</label><input id="e-people" name="people" value="${esc((ev.people || []).join(", "))}" placeholder="nomi separati da virgola — diventano link al database">
            <span class="hint">Nel database: ${names.length ? names.slice(0, 12).map(esc).join(", ") + (names.length > 12 ? "…" : "") : "nessun NPC ancora"}</span></div>
          <div class="field full"><label for="e-body">Cosa è successo</label><textarea id="e-body" name="body" rows="9" placeholder="Racconta l'evento nel dettaglio…">${esc(ev.body)}</textarea></div>
          <div class="field full"><label for="e-tags">Tag</label><input id="e-tags" name="tags" value="${esc((ev.tags || []).join(", "))}" placeholder="sessione-4, bottino, indizio"></div>
        </div>
        ${datalists()}
      </div>
      <div class="modal-foot">
        <button type="button" class="btn ghost small left" data-action="close">Annulla</button>
        <button type="submit" class="btn">Salva evento</button>
      </div>
    </form>`);
  $("#event-form").addEventListener("submit", async e2 => {
    e2.preventDefault();
    const form = e2.target, btn = $("button[type=submit]", form), fd = new FormData(form);
    if (!validDay(fd.get("date"))) return toast(`La data deve essere tra il ${START_YEAR} e il ${END_YEAR}`, "err");
    btn.disabled = true;
    try {
      const saved = await Store.save("events", {
        ...ev, date: fd.get("date"), time: fd.get("time"), title: fd.get("title").trim(), type: fd.get("type"),
        location: fd.get("location").trim(), people: splitList(fd.get("people")),
        body: fd.get("body").trim(), tags: splitList(fd.get("tags")),
      });
      upsert(state.events, saved);
      toast("Evento salvato", "ok"); closeModal();
      if (location.hash !== "#/calendario/" + saved.date) location.hash = "#/calendario/" + saved.date; else route();
    } catch (err) { fail(err); btn.disabled = false; }
  });
}
