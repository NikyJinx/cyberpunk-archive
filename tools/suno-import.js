// Scarica le playlist Suno pubbliche e crea un file di importazione per il sito.
// Uso: node suno-import.js <file-output.json>
const fs = require("fs");

const PLAYLISTS = [
  { disc: "CD 1", id: "66e05574-d742-489e-9eea-ed5b4a0fc260" },
  { disc: "CD 2", id: "b66c6804-d5bc-4955-b500-d836e9c4b271" },
];

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

const clean = s => String(s || "").replace(/\s+/g, " ").replace(/[\s,]+$/, "").trim();

(async () => {
  const out = process.argv[2];
  const songs = [];
  const now = new Date().toISOString();
  for (const p of PLAYLISTS) {
    const pl = await getPlaylist(p.id);
    console.log(`${p.disc} — "${pl.name}": ${pl.clips.length}/${pl.total} tracce`);
    pl.clips
      .sort((a, b) => (a.relative_index ?? 0) - (b.relative_index ?? 0))
      .forEach((pc, i) => {
        const c = pc.clip, m = c.metadata || {};
        songs.push({
          // id fisso per disco: reimportare aggiorna invece di duplicare,
          // e la stessa canzone può stare sia nel CD 1 sia nel CD 2
          id: `suno-${p.disc.replace(/\s+/g, "").toLowerCase()}-${c.id}`,
          title: clean(c.title),
          artist: "Echo",
          disc: p.disc,
          album: pl.name,
          order: i + 1,
          session: "",
          mood: clean(m.tags),
          duration: m.duration ? Math.round(m.duration) : null,
          suno: `https://suno.com/song/${c.id}`,
          cover: c.image_url || c.image_large_url || "",   // 360px: basta per le miniature
          audio: "",
          lyrics: String(m.prompt || "").trim(),
          notes: "",
          createdAt: now,
        });
        console.log(`  ${String(i + 1).padStart(2, "0")}. ${clean(c.title)}`);
      });
  }
  fs.writeFileSync(out, JSON.stringify({
    app: "nc-archive", version: 1, exportedAt: now, mode: "import-suno",
    records: { songs }, files: {},
  }, null, 1));
  console.log(`\nScritte ${songs.length} tracce in ${out}`);
})().catch(e => { console.error("ERRORE:", e.message); process.exit(1); });
