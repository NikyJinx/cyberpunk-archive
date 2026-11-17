// Riallinea i file del diario (_import/diario/) con il sito.
// Da lanciare PRIMA di modificare i file, e di nuovo DOPO ogni importazione sul sito.
//
// Uso: node tools/diario-sync.js [cartella] [--prova]
//   --prova   mostra cosa farebbe, senza toccare niente
//   --da <file.json>   legge il diario da un backup del sito invece che online
//                      (utile per provare con la copia locale)
//
// Legge diario e quest dal sito (solo lettura, chiave pubblica di js/config.js) e li
// confronta con i file e con lo stato dell'ultimo riallineamento (<cartella>/.base.json):
//   • cambiata dal sito            → la modifica viene riportata nei file
//   • creata dal sito              → aggiunta ai file
//   • eliminata dal sito           → tolta dai file (copia in <cartella>/vecchi/)
//   • cambiata nei file            → resta: va caricata con diario-import.js
//   • nuova nei file               → resta: va caricata con diario-import.js
//   • tolta dai file ma online     → segnalata: va eliminata dal sito (a mano, con conferma)
//   • cambiata da entrambe le parti → conflitto: restano i file, la versione del sito
//                                     viene salvata in <cartella>/conflitti.md
// Alla fine salva lo stato del sito in .base.json.
const fs = require("fs"), path = require("path");
const { parse, serialize, pick, fetchOnline, pad } = require("./diario-lib");

const ROOT = path.join(__dirname, "..");
const argv = process.argv.slice(2);
const dry = argv.includes("--prova");
const fromIdx = argv.indexOf("--da");
const fromFile = fromIdx >= 0 ? argv[fromIdx + 1] : null;
const dir = argv.find((a, i) => !a.startsWith("--") && argv[i - 1] !== "--da") || path.join(ROOT, "_import", "diario");
const baseFile = path.join(dir, ".base.json");

(async () => {
  let online;
  if (fromFile) {
    const j = JSON.parse(fs.readFileSync(fromFile, "utf8"));
    online = { quests: (j.records && j.records.quests) || [], diary: (j.records && j.records.diary) || [] };
  } else {
    online = { quests: await fetchOnline(ROOT, "quests"), diary: await fetchOnline(ROOT, "diary") };
  }
  const base = fs.existsSync(baseFile) ? JSON.parse(fs.readFileSync(baseFile, "utf8")) : { quests: {}, diary: {} };
  const model = parse(dir);
  const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
  const rep = { pulled: [], added: [], removed: [], pending: [], pendingNew: [], toDelete: [], conflicts: [] };
  const conflictText = [];

  for (const col of ["quests", "diary"]) {
    const arr = col === "quests" ? model.quests : model.scenes;
    const label = r => col === "quests" ? `quest "${r.name}"` : `scena "${r.title}"`;
    const files = new Map(arr.map(r => [r.id, r]));
    const on = new Map(online[col].map(r => [r.id, r]));
    const ids = new Set([...on.keys(), ...files.keys(), ...Object.keys(base[col] || {})]);
    for (const id of ids) {
      const o = on.has(id) ? pick(col, on.get(id)) : null;
      const f = files.has(id) ? pick(col, files.get(id)) : null;
      const b = (base[col] || {})[id] || null;
      if (o && f) {
        if (same(o, f)) continue;
        if (b && same(f, b)) { Object.assign(files.get(id), o); rep.pulled.push(label(o)); }       // cambiata dal sito
        else if (b && same(o, b)) rep.pending.push(label(f));                                         // cambiata nei file
        else { rep.conflicts.push(label(f)); conflictText.push(`## ${label(o)} (${id})\n\nVersione del sito:\n\n\`\`\`\n${JSON.stringify(o, null, 1)}\n\`\`\`\n`); }
      } else if (o && !f) {
        if (b && same(o, b)) rep.toDelete.push(`${label(o)} (${id})`);                              // tolta dai file
        else {                                                                                         // creata (o cambiata) dal sito
          const rec = { ...pick(col, on.get(id)), id };
          if (col === "diary") Object.assign(rec, { _doubts: [] });
          arr.push(rec); rep.added.push(label(o));
        }
      } else if (!o && f) {
        if (b) { arr.splice(arr.indexOf(files.get(id)), 1); rep.removed.push(label(f)); }          // eliminata dal sito
        else rep.pendingNew.push(label(f));                                                            // nuova nei file
      }
    }
  }
  // quest sparite: le scene non le citano più
  const qIds = new Set(model.quests.map(q => q.id));
  model.scenes.forEach(s => { s.quests = s.quests.filter(id => qIds.has(id)); });
  model.quests.sort((a, b) => (a.order ?? 1e9) - (b.order ?? 1e9));

  const show = (title, items) => { if (items.length) console.log(`\n${title} (${items.length}):\n` + items.map(x => "  - " + x).join("\n")); };
  console.log(`Sito: ${online.quests.length} quest, ${online.diary.length} scene · File: ${model.quests.length} quest, ${model.scenes.length} scene`);
  show("Cambiate dal sito → riportate nei file", rep.pulled);
  show("Create dal sito → aggiunte ai file", rep.added);
  show("Eliminate dal sito → tolte dai file", rep.removed);
  show("Cambiate nei file → da caricare (diario-import.js)", rep.pending);
  show("Nuove nei file → da caricare (diario-import.js)", rep.pendingNew);
  show("Tolte dai file ma ancora online → da eliminare dal sito", rep.toDelete);
  show("CONFLITTI (cambiate sia dal sito sia nei file) → restano i file, vedi conflitti.md", rep.conflicts);
  const changed = rep.pulled.length + rep.added.length + rep.removed.length;
  if (!changed && !rep.pending.length && !rep.pendingNew.length && !rep.toDelete.length && !rep.conflicts.length) console.log("\nTutto allineato.");

  if (dry) { console.log("\n(--prova: nessun file modificato)"); return; }
  if (changed) {
    // copia dei file prima di riscriverli
    const bak = path.join(dir, "vecchi", "prima-del-sync-" + new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-"));
    fs.mkdirSync(bak, { recursive: true });
    for (const f of fs.readdirSync(dir)) if (/\.txt$/i.test(f)) fs.copyFileSync(path.join(dir, f), path.join(bak, f));
    serialize(model, dir);
  }
  if (conflictText.length) fs.writeFileSync(path.join(dir, "conflitti.md"), `# Conflitti del ${new Date().toISOString().slice(0, 10)}\n\n` + conflictText.join("\n"));
  const snap = { quests: {}, diary: {} };
  for (const col of ["quests", "diary"]) for (const r of online[col]) snap[col][r.id] = pick(col, r);
  fs.writeFileSync(baseFile, JSON.stringify(snap));
  console.log(`\nStato del sito salvato in ${path.relative(ROOT, baseFile)}`);
})().catch(e => { console.error("ERRORE:", e.message); process.exit(1); });
