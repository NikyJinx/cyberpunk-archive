// ============================================================
//  NIGHT CITY ARCHIVE — diario e quest
//  (js/ui/: i file si caricano in ordine da index.html e condividono le costanti)
// ============================================================

// ---------- DIARIO & QUEST ----------
// Il diario è diviso in capitoli e ogni capitolo in scene. Ogni scena può appartenere
// a più quest (le storie si intrecciano): la pagina di una quest raccoglie le sue scene in ordine.
// Formattazione del racconto: riga vuota = paragrafo · "## " titoletto · "> " citazione ·
// "- " elenco · "---" stacco · **grassetto** · *corsivo* ·
// blocchi "::: rete Nome" / "::: log Titolo" / "::: nota Titolo" ... chiusi da ":::".
const QUEST_STATUS = [
  { id: "in-corso", label: "In corso",   color: "var(--yellow)" },
  { id: "sospesa",  label: "In sospeso", color: "var(--muted)" },
  { id: "conclusa", label: "Conclusa",   color: "var(--green)" },
];
const QUEST_COLORS = ["var(--cyan)", "var(--yellow)", "var(--magenta)", "var(--green)", "var(--red)"];
state.quest = ls.get("nc-quest", "all");
const qStatus = id => QUEST_STATUS.find(s => s.id === id) || QUEST_STATUS[0];
const questById = id => state.quests.find(q => q.id === id);
const questColor = q => !q ? "var(--muted)" : q.color || QUEST_COLORS[[...q.id].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7) % QUEST_COLORS.length];
const questsOf = s => (s.quests || []).map(questById).filter(Boolean);
const scenesOf = q => sortScenes(state.diary.filter(s => (s.quests || []).includes(q.id)));
const sortScenes = list => [...list].sort((a, b) =>
  (a.chapterNo ?? 1e9) - (b.chapterNo ?? 1e9) || (a.order ?? 1e9) - (b.order ?? 1e9) || (a.createdAt || "").localeCompare(b.createdAt || ""));
const sortQuests = list => [...list].sort((a, b) =>
  QUEST_STATUS.findIndex(s => s.id === qStatus(a.status).id) - QUEST_STATUS.findIndex(s => s.id === qStatus(b.status).id) ||
  (a.order ?? 1e9) - (b.order ?? 1e9) || (a.name || "").localeCompare(b.name || "", "it"));
function chapters() {
  const out = [];
  for (const s of sortScenes(state.diary)) {
    const last = out[out.length - 1];
    if (last && last.no === s.chapterNo && last.title === (s.chapter || "")) last.scenes.push(s);
    else out.push({ no: s.chapterNo, title: s.chapter || "", scenes: [s] });
  }
  return out;
}
const sceneNum = s => `${s.chapterNo != null ? pad(s.chapterNo) : "--"}.${s.order != null ? pad(s.order) : "--"}`;
const sceneEnd = s => s.dateTo && s.dateTo > s.dateFrom ? s.dateTo : s.dateFrom;
const coversDay = (s, d) => !!s.dateFrom && d >= s.dateFrom && d <= sceneEnd(s);
function fmtRange(s) {
  if (!s.dateFrom) return "";
  const a = parseYmd(s.dateFrom), end = sceneEnd(s), b = parseYmd(end);
  let t;
  if (end === s.dateFrom) t = fmtDate(s.dateFrom);
  else if (a.y === b.y && a.m === b.m) t = `${a.d}–${b.d} ${MONTHS[a.m - 1]} ${a.y}`;
  else if (a.y === b.y) t = `${a.d} ${MONTHS[a.m - 1]} – ${b.d} ${MONTHS[b.m - 1]} ${a.y}`;
  else t = `${fmtDate(s.dateFrom)} – ${fmtDate(end)}`;
  return (s.dateUncertain ? "≈ " : "") + t;
}
// conteggio dei nomi più presenti in un gruppo di scene
function topNames(scenes, key, n = 12) {
  const m = new Map();
  scenes.forEach(s => (s[key] || []).forEach(x => m.set(x, (m.get(x) || 0) + 1)));
  return [...m].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "it")).slice(0, n).map(x => x[0]);
}
const questTag = q => `<a class="quest-tag" style="--c:${questColor(q)}" href="#/quest/${esc(q.id)}">◆ ${esc(q.name)}</a>`;
const questSpan = q => `<span class="quest-tag" style="--c:${questColor(q)}">◆ ${esc(q.name)}</span>`;
const statusBadge = q => { const st = qStatus(q.status); return `<span class="qstatus" style="--s:${st.color}">${esc(st.label)}</span>`; };

// ---- testo formattato ----
const inlineMd = t => esc(t)
  .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
  .replace(/(^|[^*\w])\*([^*\n]+?)\*(?!\w)/g, "$1<em>$2</em>");
function mdBlock(lines) {
  const b = lines.join("\n");
  if (/^\s*-{3,}\s*$/.test(b)) return `<hr class="dy-sep">`;
  if (lines[0].startsWith("## ")) {
    const rest = lines.slice(1);
    return `<h3>${inlineMd(lines[0].slice(3))}</h3>` + (rest.length ? mdBlock(rest) : "");
  }
  if (lines.every(l => l.startsWith(">"))) return `<blockquote>${lines.map(l => inlineMd(l.replace(/^>\s?/, ""))).join("<br>")}</blockquote>`;
  if (lines.every(l => /^\s*[-•*]\s/.test(l))) return `<ul>${lines.map(l => `<li>${inlineMd(l.replace(/^\s*[-•*]\s/, ""))}</li>`).join("")}</ul>`;
  return `<p>${lines.map(inlineMd).join("<br>")}</p>`;
}
function boxBlock(type, title, lines) {
  lines = lines.filter(l => l.trim());
  if (type === "rete") {
    const rows = lines.map(l => {
      const m = l.match(/^\s*([^:]{1,28}):\s*(.*)$/);
      return m ? `<li><span class="nf">${esc(m[1].trim())}</span><span class="nc">${inlineMd(m[2])}</span></li>` : `<li class="free">${inlineMd(l)}</li>`;
    }).join("");
    return `<div class="dy-box net"><div class="dy-box-h">◈ ARCHITETTURA DI RETE${title ? " · " + esc(title) : ""}</div><ol class="net-floors">${rows}</ol></div>`;
  }
  if (type === "log") {
    const rows = lines.map(l => {
      const m = l.match(/^\s*(\d{1,2}:\d{2}(?:\s*[–-]\s*\d{1,2}:\d{2})?(?:\s*\([^)]*\))?)\s*[–-]\s*(.*)$/) || l.match(/^\s*([^:]{1,24}):\s*(.*)$/);
      return m ? `<li><span class="lk">${esc(m[1].trim())}</span><span class="lv">${inlineMd(m[2])}</span></li>` : `<li class="free">${inlineMd(l)}</li>`;
    }).join("");
    return `<div class="dy-box log"><div class="dy-box-h">▤ ${esc(title || "LOG")}</div><ul class="log-rows">${rows}</ul></div>`;
  }
  return `<div class="dy-box nota"><div class="dy-box-h">✦ ${esc(title || "NOTA")}</div>${lines.length ? `<p>${lines.map(inlineMd).join("<br>")}</p>` : ""}</div>`;
}
function richText(src) {
  const out = [], lines = String(src || "").replace(/\r/g, "").split("\n");
  let para = [];
  const flush = () => { if (para.length) out.push(mdBlock(para)); para = []; };
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(/^:::\s*(\w+)\s*(.*)$/);
    if (m) {
      flush();
      const body = [];
      for (i++; i < lines.length && !/^:::\s*$/.test(lines[i]); i++) body.push(lines[i]);
      out.push(boxBlock(m[1].toLowerCase(), m[2].trim(), body));
    } else if (!lines[i].trim()) flush();
    else para.push(lines[i]);
  }
  flush();
  return out.join("");
}

// ---- elenco del diario ----
const diaryTabs = active => `
  <nav class="dy-tabs">
    <a href="#/diario" class="${active === "diario" ? "active" : ""}">▤ Capitoli</a>
    <a href="#/quest" class="${active === "quest" ? "active" : ""}">◆ Quest</a>
  </nav>`;
function filteredScenes() {
  const q = norm(state.diaryQ);
  return sortScenes(state.diary).filter(s =>
    (state.quest === "all" || (s.quests || []).includes(state.quest)) &&
    (!q || [s.title, s.chapter, s.summary, s.body, questsOf(s).map(x => x.name).join(" "),
      (s.people || []).join(" "), (s.places || []).join(" "), (s.tags || []).join(" ")].some(v => norm(v).includes(q))));
}
function viewDiary() {
  if (state.quest !== "all" && !questById(state.quest)) state.quest = "all";
  const quests = sortQuests(state.quests);
  return `
    <div class="page-head">
      <div><div class="kicker">// BRAINDANCE_LOG</div><h1>Diario</h1><p>La cronaca della campagna, capitolo per capitolo. Ogni scena può far parte di più quest.</p></div>
      ${Store.canEdit() ? `<div class="head-actions"><button class="btn ghost cyan" data-action="new-quest">+ Quest</button><button class="btn" data-action="new-scene">+ Nuova scena</button></div>` : ""}
    </div>
    ${diaryTabs("diario")}
    <div class="toolbar">
      <input class="search" id="diary-q" type="search" placeholder="> cerca nel diario: nomi, luoghi, fatti…" value="${esc(state.diaryQ)}">
    </div>
    ${quests.length ? `<div class="chips quest-chips">
      <button class="chip ${state.quest === "all" ? "active" : ""}" data-action="set-quest" data-quest="all">Tutte<span class="count">${state.diary.length}</span></button>
      ${quests.map(q => `<button class="chip ${state.quest === q.id ? "active" : ""}" style="--qc:${questColor(q)}" data-action="set-quest" data-quest="${esc(q.id)}"><span class="qdot"></span>${esc(q.name)}<span class="count">${scenesOf(q).length}</span></button>`).join("")}
    </div>` : ""}
    <div id="diary-results">${diaryResults()}</div>`;
}
function diaryResults() {
  if (!state.diary.length) return `<div class="empty"><div class="big">// NESSUN RICORDO</div>Il diario è ancora vuoto.
    ${Store.canEdit() ? `<br><button class="btn" data-action="new-scene">+ Scrivi la prima scena</button>` : ""}</div>`;
  const list = filteredScenes(), q = state.quest !== "all" && questById(state.quest);
  const banner = q ? `<a class="quest-banner" href="#/quest/${esc(q.id)}" style="--c:${questColor(q)}">
      <span class="qb-k">QUEST ${statusBadge(q)}</span><span class="qb-t">${esc(q.name)}</span>
      ${q.summary ? `<span class="qb-s">${esc(q.summary)}</span>` : ""}<span class="qb-go">apri la quest →</span></a>` : "";
  if (!list.length) return banner + `<div class="empty"><div class="big">// NESSUN RISULTATO</div></div>`;
  if (q || state.diaryQ) return banner + `<div class="dy-list">${list.map(s => cardScene(s, true)).join("")}</div>`;
  return chapters().map(c => `
    <section class="dy-chapter">
      <div class="dy-chap-head"><span class="dy-chap-no">CAP. ${c.no != null ? pad(c.no) : "--"}</span><h2>${esc(c.title || "Senza capitolo")}</h2><span class="dy-chap-n">${c.scenes.length} scene</span></div>
      <div class="dy-list">${c.scenes.map(s => cardScene(s)).join("")}</div>
    </section>`).join("");
}
function cardScene(s, withChapter = false) {
  const qs = questsOf(s), date = fmtRange(s);
  return `
    <a class="dy-card" href="#/diario/${esc(s.id)}" style="--c:${qs[0] ? questColor(qs[0]) : "var(--line)"}">
      <span class="dy-num">${sceneNum(s)}</span>
      <span class="dy-main">
        ${withChapter || date ? `<span class="dy-k">${withChapter ? esc(s.chapter || "") : ""}${withChapter && date ? " · " : ""}${esc(date)}</span>` : ""}
        <h3>${esc(s.title || "Senza titolo")}</h3>
        ${s.summary ? `<span class="dy-sum">${esc(s.summary)}</span>` : ""}
        ${qs.length ? `<span class="meta">${qs.map(questSpan).join("")}</span>` : ""}
      </span>
    </a>`;
}

// ---- singola scena ----
function viewScene(id) {
  const s = state.diary.find(x => x.id === id), qs = questsOf(s);
  // dentro una quest filtrata, avanti/indietro restano in quella quest
  const inQuest = state.quest !== "all" && (s.quests || []).includes(state.quest) && questById(state.quest);
  const seq = inQuest ? scenesOf(inQuest) : sortScenes(state.diary);
  const i = seq.findIndex(x => x.id === id), prev = seq[i - 1], next = seq[i + 1];
  const date = s.dateFrom ? (sceneEnd(s) === s.dateFrom
    ? `<a href="#/calendario/${esc(s.dateFrom)}">${esc(fmtRange(s))}</a>`
    : `${s.dateUncertain ? "≈ " : ""}<a href="#/calendario/${esc(s.dateFrom)}">${fmtDate(s.dateFrom)}</a> → <a href="#/calendario/${esc(sceneEnd(s))}">${fmtDate(sceneEnd(s))}</a>`) : "";
  const evs = s.dateFrom ? state.events.filter(e => coversDay(s, e.date)).sort((a, b) => (a.date + (a.time || "")).localeCompare(b.date + (b.time || ""))) : [];
  const step = (x, dir) => x ? `<a class="dy-step ${dir}" href="#/diario/${esc(x.id)}">
      <span class="k">${dir === "prev" ? "‹ precedente" : "successiva ›"}${inQuest ? " · " + esc(inQuest.name) : ""}</span>
      <span class="t">${sceneNum(x)} ${esc(x.title)}</span></a>` : `<span class="dy-step ${dir} off"></span>`;
  return `
    <a class="back" href="${inQuest ? `#/quest/${esc(inQuest.id)}` : "#/diario"}">‹ ${inQuest ? esc(inQuest.name) : "Diario"}</a>
    <article class="dy-page" style="--c:${qs[0] ? questColor(qs[0]) : "var(--cyan)"}">
      <div class="kicker">// CAP. ${s.chapterNo != null ? pad(s.chapterNo) : "--"} · ${esc((s.chapter || "").toUpperCase())} · SCENA ${s.order != null ? pad(s.order) : "--"}</div>
      <h1>${esc(s.title || "Senza titolo")}</h1>
      ${date ? `<div class="dy-date">◉ ${date}${s.dateUncertain ? ` <span class="dy-unc">data da verificare</span>` : ""}</div>` : ""}
      ${qs.length ? `<div class="dy-quests">${qs.map(questTag).join("")}</div>` : ""}
      ${s.summary ? `<p class="dy-lead">${esc(s.summary)}</p>` : ""}
      ${(s.places || []).length || (s.people || []).length ? `<dl class="event-meta dy-meta">
        ${(s.places || []).length ? `<dt>Luoghi</dt><dd>${peopleLinks(s.places)}</dd>` : ""}
        ${(s.people || []).length ? `<dt>Coinvolti</dt><dd>${peopleLinks(s.people)}</dd>` : ""}
      </dl>` : ""}
      <div class="dy-body">${richText(s.body) || `<p class="muted">Nessun testo.</p>`}</div>
      ${(s.tags || []).length ? `<div class="meta">${s.tags.map(t => `<span class="badge tag">#${esc(t)}</span>`).join("")}</div>` : ""}
      ${evs.length ? `<div class="section-title" style="margin-top:26px"><h2>Eventi in calendario</h2></div>
        <div class="timeline compact">${evs.map(timelineItem).join("")}</div>` : ""}
      ${Store.canEdit() ? `<div class="dy-tools">
        <button class="btn ghost small" data-action="delete-scene" data-id="${esc(s.id)}">Elimina</button>
        <button class="btn cyan small" data-action="edit-scene" data-id="${esc(s.id)}">Modifica</button></div>` : ""}
    </article>
    <nav class="dy-nav">${step(prev, "prev")}${step(next, "next")}</nav>`;
}

// ---- quest ----
function viewQuests() {
  const groups = QUEST_STATUS.map(st => ({ st, list: sortQuests(state.quests.filter(q => qStatus(q.status).id === st.id)) })).filter(g => g.list.length);
  return `
    <div class="page-head">
      <div><div class="kicker">// JOB_BOARD</div><h1>Quest</h1><p>Le storie della campagna. Ogni quest raccoglie le sue scene in ordine, anche quando sono sparse tra più capitoli.</p></div>
      ${Store.canEdit() ? `<button class="btn" data-action="new-quest">+ Nuova quest</button>` : ""}
    </div>
    ${diaryTabs("quest")}
    ${groups.length ? groups.map(g => `
      <div class="section-title"><h2 style="color:${g.st.color}">${esc(g.st.label)} · ${g.list.length}</h2></div>
      <div class="q-grid">${g.list.map(cardQuest).join("")}</div>`).join("")
      : `<div class="empty"><div class="big">// NESSUNA QUEST</div>Nessuna quest ancora.
         ${Store.canEdit() ? `<br><button class="btn" data-action="new-quest">+ Crea la prima quest</button>` : ""}</div>`}`;
}
function cardQuest(q) {
  const sc = scenesOf(q), chaps = [...new Set(sc.map(s => s.chapterNo).filter(x => x != null))];
  const ppl = topNames(sc, "people", 6);
  return `
    <a class="q-card" href="#/quest/${esc(q.id)}" style="--c:${questColor(q)}">
      <span class="q-top">${statusBadge(q)}<span class="q-count">${sc.length} scene${chaps.length ? ` · cap. ${chaps.length > 1 ? pad(Math.min(...chaps)) + "–" + pad(Math.max(...chaps)) : pad(chaps[0])}` : ""}</span></span>
      <h3>◆ ${esc(q.name)}</h3>
      ${q.summary ? `<span class="q-sum">${esc(q.summary)}</span>` : ""}
      ${ppl.length ? `<span class="q-ppl">${ppl.map(esc).join(" · ")}</span>` : ""}
    </a>`;
}
function viewQuest(id) {
  const q = questById(id), sc = scenesOf(q);
  return `
    <a class="back" href="#/quest">‹ Quest</a>
    <header class="q-head" style="--c:${questColor(q)}">
      <div class="kicker">// QUEST ${statusBadge(q)}</div>
      <h1>◆ ${esc(q.name)}</h1>
      ${q.summary ? `<p class="dy-lead">${esc(q.summary)}</p>` : ""}
      ${sc.length ? `<dl class="event-meta dy-meta">
        ${topNames(sc, "places").length ? `<dt>Luoghi</dt><dd>${peopleLinks(topNames(sc, "places"))}</dd>` : ""}
        ${topNames(sc, "people", 30).length ? `<dt>Coinvolti</dt><dd>${peopleLinks(topNames(sc, "people", 30))}</dd>` : ""}
      </dl>` : ""}
      <div class="q-actions">
        ${sc.length ? `<button class="btn ghost small cyan" data-action="q-expand">Espandi tutte le scene</button>
        <button class="btn ghost small" data-action="set-quest" data-quest="${esc(q.id)}">Filtra il diario</button>` : ""}
        ${Store.canEdit() ? `<span class="spacer"></span>
        <button class="btn ghost small" data-action="delete-quest" data-id="${esc(q.id)}">Elimina quest</button>
        <button class="btn cyan small" data-action="edit-quest" data-id="${esc(q.id)}">Modifica</button>` : ""}
      </div>
    </header>
    ${sc.length ? `<div class="q-scenes">${sc.map(s => `
      <details class="q-scene" style="--c:${questColor(q)}">
        <summary><span class="dy-num">${sceneNum(s)}</span><span class="dy-main">
          <span class="dy-k">${esc(s.chapter || "")}${fmtRange(s) ? " · " + esc(fmtRange(s)) : ""}</span>
          <h3>${esc(s.title)}</h3>${s.summary ? `<span class="dy-sum">${esc(s.summary)}</span>` : ""}</span></summary>
        <div class="dy-body">${richText(s.body)}</div>
        <a class="q-open" href="#/diario/${esc(s.id)}" data-action="scene-in-quest" data-quest="${esc(q.id)}">apri la scena →</a>
      </details>`).join("")}</div>`
      : `<div class="empty"><div class="big">// NESSUNA SCENA</div>Nessuna scena collegata a questa quest.</div>`}`;
}

function diaryOnDay(date) {
  const list = sortScenes(state.diary).filter(s => coversDay(s, date));
  if (!list.length) return "";
  return `<div class="dy-day"><span class="k">// DAL DIARIO</span>
    ${list.map(s => `<a href="#/diario/${esc(s.id)}"><b>${sceneNum(s)}</b> ${esc(s.title)}</a>`).join("")}</div>`;
}

// ---- editor ----
function editScene(id) {
  const all = sortScenes(state.diary), last = all[all.length - 1];
  const s = state.diary.find(x => x.id === id) || {
    chapter: last ? last.chapter : "", chapterNo: last ? last.chapterNo : 1,
    order: last ? (last.order || 0) + 1 : 1, quests: state.quest !== "all" ? [state.quest] : [],
  };
  const chaps = chapters().filter(c => c.title);
  openModal(`
    <form class="form" id="scene-form">
      <div class="modal-head"><h2>${s.id ? "// MODIFICA SCENA" : "// NUOVA SCENA"}</h2><button type="button" class="x" data-action="close" aria-label="Chiudi">×</button></div>
      <div class="modal-body">
        <div class="fields">
          <div class="field full"><label class="req" for="s-title">Titolo</label><input id="s-title" name="title" required value="${esc(s.title)}" placeholder="es. La lira sul monitor"></div>
          <div class="field"><label for="s-chap">Capitolo</label><input id="s-chap" name="chapter" list="dl-chap" value="${esc(s.chapter)}"></div>
          <div class="field"><label for="s-chapno">N° capitolo · N° scena</label><span class="duo">
            <input id="s-chapno" name="chapterNo" type="number" min="0" step="1" value="${esc(s.chapterNo ?? "")}">
            <input name="order" type="number" min="0" step="1" value="${esc(s.order ?? "")}" aria-label="Numero della scena"></span></div>
          <div class="field"><label for="s-from">Dal giorno</label><input id="s-from" name="dateFrom" type="date" min="${START_YEAR}-01-01" max="${END_YEAR}-12-31" value="${esc(s.dateFrom)}"><span class="hint">vuoto se non si sa</span></div>
          <div class="field"><label for="s-to">Al giorno</label><input id="s-to" name="dateTo" type="date" min="${START_YEAR}-01-01" max="${END_YEAR}-12-31" value="${esc(s.dateTo)}"><span class="hint">vuoto se è un giorno solo</span></div>
          <label class="check field full"><input type="checkbox" name="dateUncertain" ${s.dateUncertain ? "checked" : ""}> Data incerta o dedotta</label>
          <div class="field full"><span class="lbl">Quest</span>
            ${state.quests.length ? `<div class="q-checks">${sortQuests(state.quests).map(q => `<label class="check" style="--c:${questColor(q)}"><input type="checkbox" name="quests" value="${esc(q.id)}" ${(s.quests || []).includes(q.id) ? "checked" : ""}> ${esc(q.name)}</label>`).join("")}</div>`
              : `<span class="hint">Nessuna quest: creale dalla pagina Quest.</span>`}</div>
          <div class="field"><label for="s-places">Luoghi</label><input id="s-places" name="places" list="dl-loc" value="${esc((s.places || []).join(", "))}"></div>
          <div class="field"><label for="s-people">Coinvolti</label><input id="s-people" name="people" value="${esc((s.people || []).join(", "))}"><span class="hint">separati da virgola · i nomi del database diventano link</span></div>
          <div class="field full"><label for="s-sum">Riassunto</label><textarea id="s-sum" name="summary" rows="2" placeholder="Una o due righe: si leggono nell'elenco">${esc(s.summary)}</textarea></div>
          <div class="field full"><label for="s-body">Racconto</label><textarea id="s-body" name="body" rows="18">${esc(s.body)}</textarea>
            <span class="hint">Riga vuota = paragrafo · ## titoletto · &gt; citazione · - elenco · --- stacco · **grassetto** · *corsivo* · blocchi ::: rete / ::: log / ::: nota … chiusi da :::</span></div>
          <div class="field full"><label for="s-tags">Tag</label><input id="s-tags" name="tags" value="${esc((s.tags || []).join(", "))}"></div>
        </div>
        <datalist id="dl-chap">${chaps.map(c => `<option value="${esc(c.title)}">`).join("")}</datalist>
        ${datalists()}
      </div>
      <div class="modal-foot">
        <button type="button" class="btn ghost small left" data-action="close">Annulla</button>
        <button type="submit" class="btn">Salva scena</button>
      </div>
    </form>`);
  const form = $("#scene-form");
  // scegliendo un capitolo esistente, il numero si compila da solo
  $("#s-chap").addEventListener("change", ev => {
    const c = chaps.find(x => norm(x.title) === norm(ev.target.value));
    if (c && c.no != null) { form.chapterNo.value = c.no; form.order.value = Math.max(0, ...c.scenes.filter(x => x.id !== s.id).map(x => x.order || 0)) + 1; }
  });
  form.addEventListener("submit", async ev => {
    ev.preventDefault();
    const btn = $("button[type=submit]", form), fd = new FormData(form);
    const from = fd.get("dateFrom"), to = fd.get("dateTo"), num = k => fd.get(k) === "" ? null : Number(fd.get(k));
    if (from && !validDay(from)) return toast(`La data deve essere tra il ${START_YEAR} e il ${END_YEAR}`, "err");
    if (to && (!from || !validDay(to) || to < from)) return toast("La data finale deve venire dopo quella iniziale", "err");
    btn.disabled = true;
    try {
      const saved = await Store.save("diary", {
        ...s, title: fd.get("title").trim(), chapter: fd.get("chapter").trim(), chapterNo: num("chapterNo"), order: num("order"),
        dateFrom: from, dateTo: to && to !== from ? to : "", dateUncertain: !!fd.get("dateUncertain"),
        quests: fd.getAll("quests"), places: splitList(fd.get("places")), people: splitList(fd.get("people")),
        summary: fd.get("summary").trim(), body: fd.get("body").replace(/\s+$/, ""), tags: splitList(fd.get("tags")),
      });
      upsert(state.diary, saved);
      toast("Scena salvata", "ok"); closeModal();
      if (location.hash !== "#/diario/" + saved.id) location.hash = "#/diario/" + saved.id; else route();
    } catch (err) { fail(err); btn.disabled = false; }
  });
}
function editQuest(id) {
  const q = questById(id) || { status: "in-corso" };
  openModal(`
    <form class="form" id="quest-form">
      <div class="modal-head"><h2>${q.id ? "// MODIFICA QUEST" : "// NUOVA QUEST"}</h2><button type="button" class="x" data-action="close" aria-label="Chiudi">×</button></div>
      <div class="modal-body">
        <div class="fields">
          <div class="field full"><label class="req" for="q-name">Nome</label><input id="q-name" name="name" required value="${esc(q.name)}" placeholder="es. Dark Harmony"></div>
          <div class="field"><label for="q-status">Stato</label><select id="q-status" name="status">${QUEST_STATUS.map(st => `<option value="${st.id}" ${qStatus(q.status).id === st.id ? "selected" : ""}>${st.label}</option>`).join("")}</select></div>
          <div class="field"><label for="q-order">Ordine</label><input id="q-order" name="order" type="number" step="1" value="${esc(q.order ?? "")}"><span class="hint">facoltativo: ordina le quest con lo stesso stato</span></div>
          <div class="field full"><label for="q-sum">Riassunto</label><textarea id="q-sum" name="summary" rows="6" placeholder="Di cosa parla, cosa è ancora aperto…">${esc(q.summary)}</textarea></div>
        </div>
      </div>
      <div class="modal-foot">
        <button type="button" class="btn ghost small left" data-action="close">Annulla</button>
        <button type="submit" class="btn">Salva quest</button>
      </div>
    </form>`, true);
  $("#quest-form").addEventListener("submit", async ev => {
    ev.preventDefault();
    const form = ev.target, btn = $("button[type=submit]", form), fd = new FormData(form);
    btn.disabled = true;
    try {
      const saved = await Store.save("quests", { ...q, name: fd.get("name").trim(), status: fd.get("status"),
        order: fd.get("order") === "" ? null : Number(fd.get("order")), summary: fd.get("summary").trim() });
      upsert(state.quests, saved);
      toast("Quest salvata", "ok"); closeModal();
      if (location.hash !== "#/quest/" + saved.id) location.hash = "#/quest/" + saved.id; else route();
    } catch (err) { fail(err); btn.disabled = false; }
  });
}
