// Scarica le playlist Suno pubbliche e crea un file di importazione per il sito
// con SOLO le tracce nuove.
//
// Uso: node tools/suno-import.js <file-output.json> [--tutte]
//
// Per non rovinare il lavoro fatto dal sito, lo script legge le tracce già online
// (solo lettura, con la chiave pubblica di js/config.js) e:
//   • salta le tracce già presenti online  → le tue modifiche restano intatte
//   • salta le tracce elencate in _import/suno-escluse.json → quelle che hai eliminato
//     dal sito non ricompaiono
// Con --tutte scrive invece tutte le tracce delle playlist (sovrascrive le modifiche!).
const fs = require("fs"), path = require("path");

const PLAYLISTS = [
  { disc: "CD 1", id: "66e05574-d742-489e-9eea-ed5b4a0fc260" },
  { disc: "CD 2", id: "b66c6804-d5bc-4955-b500-d836e9c4b271" },
];
const ROOT = path.join(__dirname, "..");
const EXCLUDED_FILE = path.join(ROOT, "_import", "suno-escluse.json");

async function getPlaylist(id) {
  const clips = [];
  let meta = null;
  for (let page = 1; page < 20; page++) {
    const r = await fetch(`https://studio-api.prod.suno.com/api/playlist/${id}/?page=${page}`);
    if (!r.ok) throw new Error(`Playlist ${id}: HTTP ${r.status}`);
    const j = await r.json();
    meta = meta || j;
    const pc = j.playlist_clips || [];
    if (!pc.length) break;
    clips.push(...pc);
    if (clips.length >= (j.num_total_results || 0)) break;
  }
  return { name: (meta.name || "").trim(), total: meta.num_total_results, clips };
}

async function onlineSongIds() {
  const cfg = fs.readFileSync(path.join(ROOT, "js", "config.js"), "utf8");
  const url = (cfg.match(/supabaseUrl:\s*"([^"]*)"/) || [])[1], key = (cfg.match(/supabaseAnonKey:\s*"([^"]*)"/) || [])[1];
  if (!url || !key) return null;                         // modalità locale: niente da confrontare
  const r = await fetch(`${url}/rest/v1/records?collection=eq.songs&select=id`, { headers: { apikey: key, Authorization: "Bearer " + key } });
  if (!r.ok) throw new Error(`Lettura tracce online: HTTP ${r.status}`);
  return new Set((await r.json()).map(x => x.id));
}

const clean = s => String(s || "").replace(/\s+/g, " ").replace(/[\s,]+$/, "").trim();

(async () => {
  const out = process.argv[2];
  const all = process.argv.includes("--tutte");
  if (!out) { console.error("Uso: node tools/suno-import.js <file-output.json> [--tutte]"); process.exit(1); }
  const online = all ? null : await onlineSongIds();
  const excluded = new Set(fs.existsSync(EXCLUDED_FILE) ? JSON.parse(fs.readFileSync(EXCLUDED_FILE, "utf8")).ids || [] : []);
  const songs = [];
  const now = new Date().toISOString();
  for (const p of PLAYLISTS) {
    const pl = await getPlaylist(p.id);
    console.log(`${p.disc} — "${pl.name}": ${pl.clips.length}/${pl.total} tracce su Suno`);
    pl.clips
      .sort((a, b) => (a.relative_index ?? 0) - (b.relative_index ?? 0))
      .forEach((pc, i) => {
        const c = pc.clip, m = c.metadata || {};
        // id fisso per disco: la stessa canzone può stare sia nel CD 1 sia nel CD 2
        const id = `suno-${p.disc.replace(/\s+/g, "").toLowerCase()}-${c.id}`;
        const tag = `  ${String(i + 1).padStart(2, "0")}. ${clean(c.title)}`;
        if (!all && excluded.has(id)) { console.log(tag + "  (esclusa: eliminata dal sito)"); return; }
        if (online && online.has(id)) { console.log(tag + "  (già online, non la tocco)"); return; }
        songs.push({
          id, title: clean(c.title), artist: "Echo", disc: p.disc, album: pl.name, order: i + 1, session: "",
          mood: clean(m.tags), duration: m.duration ? Math.round(m.duration) : null,
          suno: `https://suno.com/song/${c.id}`,
          cover: c.image_url || c.image_large_url || "",   // 360px: basta per le miniature
          audio: "", lyrics: String(m.prompt || "").trim(), notes: "", createdAt: now,
        });
        console.log(tag + "  ← NUOVA");
      });
  }
  fs.writeFileSync(out, JSON.stringify({
    app: "nc-archive", version: 1, exportedAt: now, mode: "import-suno",
    records: { songs }, files: {},
  }, null, 1));
  console.log(`\n${songs.length} tracce da importare scritte in ${out}${songs.length ? "" : " (niente di nuovo)"}`);
})().catch(e => { console.error("ERRORE:", e.message); process.exit(1); });
