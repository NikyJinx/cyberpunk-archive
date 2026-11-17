// Trasforma la cronaca della campagna (file di testo in una cartella) in un file da
// importare nel sito: collezioni "quests" (le quest) e "diary" (le scene del diario).
//
// Uso: node tools/diario-import.js <cartella> <file-output.json> [--appunti]
//   es. node tools/diario-import.js _import/diario _import/diario-import.json
//
// Prima di modificare i file, se nel frattempo qualcuno ha cambiato il diario dal sito:
//   node tools/diario-sync.js _import/diario      (riporta nei file le modifiche del sito)
//
// Nella cartella:
//   quest.txt          le quest, una per blocco:
//                        # Nome della quest
//                        id: quest-…            (scritto in automatico, non toccarlo)
//                        stato: in corso | in sospeso | conclusa
//                        Riassunto su più righe…
//   NN-qualcosa.txt    i capitoli. Dentro:
//                        CAPITOLO 3: Titolo del capitolo
//                        @@ Titolo della scena
//                        id: diario-…           (scritto in automatico, non toccarlo:
//                                                il titolo si può cambiare liberamente)
//                        quest: Nome quest, Altra quest
//                        luoghi: …            (facoltativo)
//                        coinvolti: …         (facoltativo)
//                        data: 2045-03-01     (facoltativo; "2045-03-01 → 2045-03-03", "?" = incerta)
//                        tag: …               (facoltativo)
//                        riassunto: una o due righe
//                        dubbio: …            (facoltativo, solo per la revisione: non va sul sito)
//                        ---
//                        Racconto (stessa formattazione del sito: ## titoletto, > citazione,
//                        - elenco, ::: rete / ::: log / ::: nota … :::)
//                      Il numero della scena è la sua posizione nel capitolo: per inserirne
//                      una in mezzo basta scriverla nel punto giusto, le altre si rinumerano.
//   appunti.txt        note sparse per la sezione Appunti (solo con --appunti):
//                        # Titolo / categoria: … / tag: … / testo
//
// Il file prodotto usa merge: true: reimportarlo aggiorna le scene con lo stesso id.
// Accanto scrive <output>-revisione.md con l'elenco da ricontrollare.
const fs = require("fs"), path = require("path");
const { parse, serialize, norm, pad } = require("./diario-lib");

const args = process.argv.slice(2).filter(a => !a.startsWith("--"));
const withNotes = process.argv.includes("--appunti");
const [srcDir, out] = args;
if (!srcDir || !out) { console.error("Uso: node tools/diario-import.js <cartella> <file-output.json> [--appunti]"); process.exit(1); }

const model = parse(srcDir);
const { quests, scenes, notes, warn } = model;
// riscrivo i file: gli id appena nati restano fissi, i numeri delle scene seguono la posizione
serialize(model, srcDir);

const now = new Date().toISOString();
scenes.forEach(s => { if (!s.summary) warn.push(`"${s.title}": manca il riassunto`); if (!s.quests.length) warn.push(`"${s.title}": nessuna quest`); });
const clean = s => { const o = { ...s, createdAt: now }; delete o._doubts; delete o._file; return o; };
const records = { quests: quests.map(q => ({ ...q, createdAt: now })), diary: scenes.map(clean) };
if (withNotes && notes.length) records.notes = notes.map(n => ({ ...n, createdAt: now }));
fs.writeFileSync(out, JSON.stringify({ app: "nc-archive", version: 1, exportedAt: now, mode: "import-diario", merge: true, records, files: {} }, null, 1));

// ---------- revisione ----------
// nomi conosciuti: schede online (snapshot) + lista personaggi da importare
const known = new Map();
for (const [file, label] of [["_import/online-snapshot.json", "online"], ["_import/lista-import.json", "lista"]]) {
  try {
    const j = JSON.parse(fs.readFileSync(file, "utf8"));
    for (const e of (j.records && j.records.entries) || []) {
      for (const n of [e.name, ...String(e.handle || "").split(/[,/]/)]) if (n && n.trim()) known.set(norm(n), `${e.name} (${label})`);
    }
  } catch { /* file assente: nessun confronto */ }
}
const count = key => { const m = new Map(); scenes.forEach(s => s[key].forEach(n => m.set(n, (m.get(n) || 0) + 1))); return [...m].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "it")); };
const nameRows = rows => rows.map(([n, c]) => `| ${n} | ${c} | ${known.get(norm(n)) || "—"} |`).join("\n");
const num = s => `${pad(s.chapterNo)}.${pad(s.order)}`;
const qName = id => (quests.find(q => q.id === id) || {}).name || id;
const doubts = scenes.flatMap(s => s._doubts.map(d => `${num(s)} "${s.title}": ${d}`));
const md = [
  `# Revisione del diario`, ``, `Generato il ${now.slice(0, 10)} da ${srcDir}. ${quests.length} quest, ${scenes.length} scene in ${new Set(scenes.map(s => s.chapterNo)).size} capitoli.`, ``,
  `## Quest`, ``, `| Quest | Stato | Scene |`, `|---|---|---|`,
  ...quests.map(q => `| ${q.name} | ${q.status} | ${scenes.filter(s => s.quests.includes(q.id)).length} |`), ``,
  `## Scene`, ``,
  ...scenes.map(s => `- **${num(s)} ${s.title}**${s.dateFrom ? ` · ${s.dateUncertain ? "≈ " : ""}${s.dateFrom}${s.dateTo ? " → " + s.dateTo : ""}` : ""} — ${s.quests.map(qName).join(", ")}`), ``,
  `## Persone citate`, ``, `"Scheda" indica se il nome corrisponde già a una scheda (o a un alias): solo così diventa un link sul sito.`, ``,
  `| Nome | Scene | Scheda |`, `|---|---|---|`, nameRows(count("people")), ``,
  `## Luoghi citati`, ``, `| Luogo | Scene | Scheda |`, `|---|---|---|`, nameRows(count("places")), ``,
  ...(withNotes && notes.length ? [`## Appunti (vanno nella sezione Appunti)`, ``, ...notes.map(n => `- **${n.title}** · ${n.category}`), ``] : []),
  `## Dubbi da chiarire`, ``, `Punti del testo originale poco chiari: li ho scritti nel modo più fedele possibile, ma conviene ricontrollarli.`, ``,
  ...(doubts.length ? doubts.map(d => "- " + d) : ["Nessuno."]), ``,
  `## Avvisi`, ``, ...(warn.length ? warn.map(w => "- " + w) : ["Nessuno."]), ``,
].join("\n");
const revFile = out.replace(/\.json$/i, "") + "-revisione.md";
fs.writeFileSync(revFile, md);

console.log(`${quests.length} quest · ${scenes.length} scene · ${withNotes ? notes.length : 0} appunti · ${doubts.length} dubbi · ${warn.length} avvisi`);
if (model.generated) console.log(`${model.generated} id nuovi scritti nei file`);
console.log(`Scritto ${out}\nScritto ${revFile}`);
if (warn.length) console.log(warn.map(w => "  ! " + w).join("\n"));
