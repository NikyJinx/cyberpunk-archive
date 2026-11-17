// Converte una lista di schede in formato testo (Nome:/Tipo:/Alias:/…) in un file
// importabile dal sito (⚙ → Importa backup) e stampa un report dei punti dubbi.
//
// Uso: node tools/lista-import.js <lista.txt> <output.json>
//
// Il file prodotto è in modalità "merge": reimportarlo aggiorna le schede esistenti
// (stesso id o stesso nome) senza toccare immagini, cyberware e campi lasciati vuoti.
//
// Formato di ogni scheda: una riga titolo, poi righe "Campo: valore".
// Tipo: PG, NPC, Fazione, Luogo, Oggetto.
// Campi: Nome, Tipo, Alias, Fazione, Ruolo, Stato, Rapporto col party, Luogo, Tag,
//        Descrizione, Note, Altro ("Campo: valore. Campo2: valore" → campi personalizzati)
const fs = require("fs");

const KIND = { npc: "npc", pg: "pg", party: "pg", personaggio: "npc",fazione: "fazione", organizzazione: "fazione", luogo: "luogo", oggetto: "oggetto" };
const STATUS = { vivo: "vivo", viva: "vivo", flatlined: "morto", morto: "morto", morta: "morto", disperso: "disperso", dispersa: "disperso", sconosciuto: "sconosciuto" };
const FIELDS = {
  "nome": "name", "tipo": "kind", "alias": "handle", "fazione": "faction", "ruolo": "role", "stato": "status",
  "rapporto col party": "attitude", "luogo": "location", "tag": "tags", "descrizione": "description", "note": "notes", "altro": "other",
};

const slug = s => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const norm = s => String(s || "").trim().toLowerCase();

function parse(text) {
  const lines = text.split(/\r?\n/);
  const blocks = [];
  let cur = null, lastTitle = "";
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;
    if (/^\d+\.\s/.test(line) && !line.includes(":")) continue;          // "1. Personaggi"
    const m = /^([A-Za-zÀ-ÿ ]+?):\s*(.*)$/.exec(line);
    const key = m && FIELDS[norm(m[1])];
    if (key) {
      if (key === "name") { cur = { title: lastTitle }; blocks.push(cur); }
      if (!cur) continue;
      cur[key] = m[2].trim();
    } else {
      lastTitle = line;                                                    // titolo della prossima scheda
    }
  }
  return blocks;
}

// "Cyberware: A; B. Relazione: X." → [{k:"Cyberware",v:"A; B"},{k:"Relazione",v:"X"}]
function parseOther(s) {
  s = String(s || "").trim();
  if (!s) return [];
  const re = /(?:^|[.;]\s+)([A-ZÀ-Ý][^:.;]{1,40}):\s*/g;
  const keys = [];
  let m;
  while ((m = re.exec(s))) keys.push({ k: m[1].trim(), start: m.index, valStart: re.lastIndex });
  if (!keys.length) return [{ k: "Altro", v: s.replace(/\.$/, "") }];
  return keys.map((k, i) => ({
    k: k.k,
    v: s.slice(k.valStart, i + 1 < keys.length ? keys[i + 1].start : s.length).replace(/^[.;\s]+|[.;\s]+$/g, ""),
  })).filter(c => c.v);
}

const [, , input, output] = process.argv;
if (!input || !output) { console.error("Uso: node tools/lista-import.js <lista.txt> <output.json>"); process.exit(1); }

const warnings = [];
let entries = parse(fs.readFileSync(input, "utf8")).map(b => {
  const kind = KIND[norm(b.kind)] || "npc";
  let name = (b.name || "").trim();
  if (!name) { name = b.title; warnings.push(`Nome mancante → uso il titolo "${b.title}"`); }
  const status = STATUS[norm(b.status)] || "";
  return {
    kind, name, handle: b.handle || "", faction: b.faction || "", role: b.role || "", status,
    attitude: b.attitude || "", location: b.location || "",
    tags: String(b.tags || "").split(",").map(t => t.trim()).filter(Boolean),
    description: b.description || "", notes: b.notes || "", custom: parseOther(b.other),
    _hadName: !!(b.name || "").trim(),
  };
});

// Schede senza nome il cui alias è il nome di un'altra scheda dello stesso tipo → unisco
entries = entries.filter(e => {
  if (e._hadName || !e.handle) return true;
  const target = entries.find(x => x !== e && x.kind === e.kind && norm(x.name) === norm(e.handle));
  if (!target) return true;
  target.tags = [...new Set([...target.tags, ...e.tags])];
  if (e.description && !target.description.includes(e.description)) target.description = [target.description, e.description].filter(Boolean).join("\n");
  if (e.notes && !target.notes.includes(e.notes)) target.notes = [target.notes, e.notes].filter(Boolean).join("\n");
  warnings.push(`"${e.name}" unito a "${target.name}" (stessa fazione)`);
  return false;
});

// Controlli incrociati
const names = new Set(entries.map(e => norm(e.name)));
const factions = new Set(entries.filter(e => e.kind === "fazione").map(e => norm(e.name)));
for (const e of entries) {
  if (e.faction && !factions.has(norm(e.faction))) warnings.push(`${e.name}: fazione "${e.faction}" non ha una scheda`);
  if (e.location && !names.has(norm(e.location))) warnings.push(`${e.name}: luogo "${e.location}" non ha una scheda`);
  if (!e.description && !e.notes) warnings.push(`${e.name}: scheda quasi vuota`);
}
const seen = new Map();
for (const e of entries) {
  const k = e.kind + ":" + norm(e.name);
  if (seen.has(k)) warnings.push(`Doppione: "${e.name}" compare due volte`);
  seen.set(k, true);
}

const now = new Date().toISOString();
// Tolgo i campi vuoti: in modalità "merge" non devono cancellare ciò che è già scritto sul sito
const compact = o => Object.fromEntries(Object.entries(o).filter(([, v]) => Array.isArray(v) ? v.length : v !== "" && v != null));
const records = entries.map(({ _hadName, ...e }) => compact({
  ...e, id: `lista-${e.kind}-${slug(e.name)}`, createdAt: now,
}));
fs.writeFileSync(output, JSON.stringify({ app: "nc-archive", version: 1, exportedAt: now, mode: "import-lista", merge: true, records: { entries: records }, files: {} }, null, 1));

const count = k => records.filter(r => r.kind === k).length;
console.log(`Schede: ${records.length}  (PG ${count("pg")}, NPC ${count("npc")}, fazioni ${count("fazione")}, luoghi ${count("luogo")}, oggetti ${count("oggetto")})`);
for (const r of records) console.log(`  [${r.kind}] ${r.name}${r.handle ? ` "${r.handle}"` : ""} — ${[r.faction, r.role, r.status, r.attitude].filter(Boolean).join(" · ")}${(r.custom || []).length ? ` | campi: ${r.custom.map(c => c.k).join(", ")}` : ""}`);
console.log(`\nDa ricontrollare (${warnings.length}):`);
warnings.forEach(w => console.log("  ! " + w));
console.log(`\nFile: ${output}`);
