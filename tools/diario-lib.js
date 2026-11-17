// Lettura e scrittura dei file di testo del diario (_import/diario/).
// Usato da tools/diario-import.js (file → import per il sito)
// e da tools/diario-sync.js (sito → file, riallineamento).
//
// Formato dei file: vedi il commento in cima a tools/diario-import.js.
const fs = require("fs"), path = require("path");

const norm = s => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
const slug = s => norm(s).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60) || "x";
const list = s => String(s || "").split(",").map(x => x.trim()).filter(Boolean);
const pad = n => String(n).padStart(2, "0");

const STATUS = { "in corso": "in-corso", "in-corso": "in-corso", "in sospeso": "sospesa", "sospesa": "sospesa", "conclusa": "conclusa", "chiusa": "conclusa" };
const STATUS_LABEL = { "in-corso": "in corso", "sospesa": "in sospeso", "conclusa": "conclusa" };
const isChapterFile = f => /^\d+.*\.txt$/i.test(f);

// ---------- lettura ----------
function parse(dir) {
  const warn = [], quests = [], scenes = [], notes = [], chapterFiles = new Map();
  const read = f => fs.readFileSync(path.join(dir, f), "utf8").replace(/\r/g, "").split("\n");

  // quest.txt: # Nome / id: / stato: / riassunto
  if (fs.existsSync(path.join(dir, "quest.txt"))) {
    let cur = null;
    for (const raw of read("quest.txt")) {
      const h = raw.match(/^#\s+(.+)$/);
      if (h) { cur = { id: "", name: h[1].trim(), status: "in-corso", order: quests.length + 1, summary: "" }; quests.push(cur); continue; }
      if (!cur) continue;
      if (!cur.summary.trim()) {
        const id = raw.match(/^id:\s*(\S+)\s*$/i), st = raw.match(/^stato:\s*(.+)$/i);
        if (id) { cur.id = id[1]; continue; }
        if (st) { cur.status = STATUS[norm(st[1])] || (warn.push(`Quest "${cur.name}": stato "${st[1]}" sconosciuto`), "in-corso"); continue; }
      }
      cur.summary += raw + "\n";
    }
    const used = new Set(quests.map(q => q.id).filter(Boolean));
    for (const q of quests) {
      q.summary = q.summary.trim();
      if (!q.id) { let id = "quest-" + slug(q.name); for (let k = 2; used.has(id); k++) id = "quest-" + slug(q.name) + "-" + k; q.id = id; used.add(id); }
    }
  }
  const questRef = new Map();
  quests.forEach(q => { questRef.set(norm(q.name), q.id); questRef.set(q.id, q.id); });

  // capitoli: CAPITOLO n: Titolo / @@ Titolo scena / intestazione / --- / racconto
  for (const f of fs.readdirSync(dir).filter(isChapterFile).sort()) {
    let chapter = "", chapterNo = null, order = 0, sc = null, inBody = false;
    const close = () => { if (sc) { sc.body = sc.body.replace(/^\n+|\s+$/g, ""); scenes.push(sc); } sc = null; };
    for (const raw of read(f)) {
      const ch = raw.match(/^CAPITOLO\s+(\d+)\s*[:·.-]\s*(.+)$/);
      if (ch) { close(); chapterNo = Number(ch[1]); chapter = ch[2].trim(); order = 0; if (!chapterFiles.has(chapterNo)) chapterFiles.set(chapterNo, f); continue; }
      const st = raw.match(/^@@\s+(.+)$/);
      if (st) {
        close();
        sc = { id: "", chapter, chapterNo, order: ++order, title: st[1].trim(), dateFrom: "", dateTo: "", dateUncertain: false,
          quests: [], places: [], people: [], summary: "", body: "", tags: [], _doubts: [], _file: f };
        inBody = false;
        continue;
      }
      if (!sc) { if (raw.trim()) warn.push(`${f}: testo fuori da una scena ignorato: "${raw.slice(0, 50)}…"`); continue; }
      if (inBody) { sc.body += raw + "\n"; continue; }
      if (/^---\s*$/.test(raw)) { inBody = true; continue; }
      const kv = raw.match(/^(\w+):\s*(.*)$/);
      if (!kv) { if (raw.trim()) warn.push(`${f} · "${sc.title}": riga d'intestazione non capita: "${raw}"`); continue; }
      const [, k, v] = kv;
      switch (norm(k)) {
        case "id": sc.id = v.trim(); break;
        case "quest": for (const n of list(v)) { const id = questRef.get(norm(n)) || questRef.get(n); if (id) sc.quests.push(id); else warn.push(`"${sc.title}": quest "${n}" non esiste in quest.txt`); } break;
        case "luoghi": sc.places = list(v); break;
        case "coinvolti": sc.people = list(v); break;
        case "tag": sc.tags = list(v); break;
        case "riassunto": sc.summary = v.trim(); break;
        case "dubbio": sc._doubts.push(v.trim()); break;
        case "data": {
          sc.dateUncertain = v.includes("?");
          const d = v.match(/\d{4}-\d{2}-\d{2}/g) || [];
          sc.dateFrom = d[0] || ""; sc.dateTo = d[1] && d[1] !== d[0] ? d[1] : "";
          break;
        }
        default: warn.push(`"${sc.title}": campo "${k}" sconosciuto`);
      }
    }
    close();
  }
  // id mancanti: nascono dal titolo, una volta sola (poi vengono scritti nel file e restano fissi)
  const used = new Set(scenes.map(s => s.id).filter(Boolean));
  let generated = 0;
  for (const s of scenes) {
    if (s.id) continue;
    let id = "diario-" + slug(s.title);
    for (let k = 2; used.has(id); k++) id = "diario-" + slug(s.title) + "-" + k;
    s.id = id; used.add(id); generated++;
  }

  // appunti.txt: # Titolo / categoria: / tag: / testo
  if (fs.existsSync(path.join(dir, "appunti.txt"))) {
    let cur = null;
    for (const raw of read("appunti.txt")) {
      const h = raw.match(/^#\s+(.+)$/);
      if (h) { cur = { id: "diario-nota-" + slug(h[1]), title: h[1].trim(), category: "Lore", tags: [], body: "", pinned: false }; notes.push(cur); continue; }
      if (!cur) continue;
      const c = raw.match(/^categoria:\s*(.+)$/i), t = raw.match(/^tag:\s*(.+)$/i);
      if (c && !cur.body) cur.category = c[1].trim();
      else if (t && !cur.body) cur.tags = list(t[1]);
      else cur.body += raw + "\n";
    }
    notes.forEach(n => { n.body = n.body.trim(); });
  }
  return { quests, scenes, notes, chapterFiles, warn, generated };
}

// ---------- scrittura ----------
function sceneText(s, questName) {
  const date = s.dateFrom ? `${s.dateFrom}${s.dateTo ? " → " + s.dateTo : ""}${s.dateUncertain ? " ?" : ""}` : "";
  const lines = [`@@ ${s.title}`, `id: ${s.id}`, `quest: ${(s.quests || []).map(questName).join(", ")}`];
  if ((s.places || []).length) lines.push(`luoghi: ${s.places.join(", ")}`);
  if ((s.people || []).length) lines.push(`coinvolti: ${s.people.join(", ")}`);
  if (date) lines.push(`data: ${date}`);
  if ((s.tags || []).length) lines.push(`tag: ${s.tags.join(", ")}`);
  lines.push(`riassunto: ${(s.summary || "").replace(/\s*\n\s*/g, " ")}`);
  for (const d of s._doubts || []) lines.push(`dubbio: ${d}`);
  lines.push("---", (s.body || "").replace(/\s+$/, ""), "");
  return lines.join("\n");
}

// Riscrive quest.txt e i file dei capitoli a partire dal modello.
// I file di capitolo rimasti senza scene vengono spostati in vecchi/.
function serialize(model, dir) {
  const { quests, scenes, chapterFiles } = model;
  const qById = new Map(quests.map(q => [q.id, q]));
  const questName = id => (qById.get(id) || {}).name || id;

  fs.writeFileSync(path.join(dir, "quest.txt"), quests.map(q =>
    `# ${q.name}\nid: ${q.id}\nstato: ${STATUS_LABEL[q.status] || "in corso"}\n${(q.summary || "").trim()}\n`).join("\n"));

  // raggruppo per capitolo (numero + titolo), nell'ordine del diario
  const sorted = [...scenes].sort((a, b) => (a.chapterNo ?? 1e9) - (b.chapterNo ?? 1e9) || (a.order ?? 1e9) - (b.order ?? 1e9));
  const chapters = [];
  for (const s of sorted) {
    const last = chapters[chapters.length - 1];
    if (last && last.no === s.chapterNo && last.title === (s.chapter || "")) last.scenes.push(s);
    else chapters.push({ no: s.chapterNo, title: s.chapter || "Senza capitolo", scenes: [s] });
  }
  const out = new Map();
  for (const c of chapters) {
    const no = c.no ?? 99;
    const file = chapterFiles.get(no) || `${pad(no)}-${slug(c.title).slice(0, 30)}.txt`;
    out.set(file, (out.get(file) || "") + `CAPITOLO ${no}: ${c.title}\n\n` + c.scenes.map(s => sceneText(s, questName)).join("\n"));
  }
  for (const [file, text] of out) fs.writeFileSync(path.join(dir, file), text);
  for (const f of fs.readdirSync(dir).filter(isChapterFile)) {
    if (out.has(f)) continue;
    fs.mkdirSync(path.join(dir, "vecchi"), { recursive: true });
    fs.renameSync(path.join(dir, f), path.join(dir, "vecchi", f));
  }
}

// I campi che contano per capire se una scena/quest è cambiata
function pick(col, r) {
  const arr = v => Array.isArray(v) ? v.map(String) : [];
  const str = v => v == null ? "" : String(v).trim();
  const num = v => v === "" || v == null ? null : Number(v);
  if (col === "quests") return { name: str(r.name), status: str(r.status) || "in-corso", order: num(r.order), summary: str(r.summary) };
  return {
    title: str(r.title), chapter: str(r.chapter), chapterNo: num(r.chapterNo), order: num(r.order),
    dateFrom: str(r.dateFrom), dateTo: str(r.dateTo), dateUncertain: !!r.dateUncertain,
    quests: arr(r.quests), places: arr(r.places), people: arr(r.people), tags: arr(r.tags),
    summary: str(r.summary), body: String(r.body || "").replace(/\s+$/, ""),
  };
}

// Lettura (solo lettura, chiave pubblica) di una collezione dal sito
async function fetchOnline(root, col) {
  const cfg = fs.readFileSync(path.join(root, "js", "config.js"), "utf8");
  const url = (cfg.match(/supabaseUrl:\s*"([^"]*)"/) || [])[1], key = (cfg.match(/supabaseAnonKey:\s*"([^"]*)"/) || [])[1];
  if (!url || !key) throw new Error("js/config.js senza Supabase: niente sito online da leggere");
  const r = await fetch(`${url}/rest/v1/records?collection=eq.${col}&select=id,data`, { headers: { apikey: key, Authorization: "Bearer " + key } });
  if (!r.ok) throw new Error(`Lettura ${col} online: HTTP ${r.status}`);
  return (await r.json()).map(x => ({ ...x.data, id: x.id }));
}

module.exports = { parse, serialize, pick, fetchOnline, norm, slug, pad };
