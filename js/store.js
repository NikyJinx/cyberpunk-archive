// ============================================================
//  STORE — salvataggio dati
//  • modalità LOCALE: IndexedDB del browser (record + file)
//  • modalità CLOUD : Supabase (tabella "records" + bucket "media")
// ============================================================
window.Store = (() => {
  const cfg = window.SITE_CONFIG || {};
  const cloud = !!(cfg.supabaseUrl && cfg.supabaseAnonKey);
  const SUPABASE_JS = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.min.js";
  const BUCKET = "media";

  let sb = null, session = null, idb = null;
  const authListeners = new Set();
  const urlCache = new Map();

  const uid = () =>
    (window.crypto && crypto.randomUUID) ? crypto.randomUUID()
      : "id-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 10);

  function loadScript(src) {
    return new Promise((res, rej) => {
      const s = document.createElement("script");
      s.src = src; s.onload = res; s.onerror = () => rej(new Error("Impossibile caricare " + src));
      document.head.appendChild(s);
    });
  }

  // ---------- IndexedDB helpers ----------
  function openIdb() {
    return new Promise((res, rej) => {
      const r = indexedDB.open("nc-archive", 1);
      r.onupgradeneeded = () => {
        const db = r.result;
        db.createObjectStore("records", { keyPath: "_key" });
        db.createObjectStore("files", { keyPath: "id" });
      };
      r.onsuccess = () => res(r.result);
      r.onerror = () => rej(r.error);
    });
  }
  function tx(storeName, mode, fn) {
    return new Promise((res, rej) => {
      const t = idb.transaction(storeName, mode);
      const out = fn(t.objectStore(storeName));
      t.oncomplete = () => res(out instanceof IDBRequest ? out.result : out);
      t.onerror = () => rej(t.error);
      t.onabort = () => rej(t.error || new Error("Transazione annullata (spazio esaurito?)"));
    });
  }

  // ---------- init ----------
  async function init() {
    if (cloud) {
      await loadScript(SUPABASE_JS);
      sb = window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey);
      const { data } = await sb.auth.getSession();
      session = data.session;
      await checkSchema();
      await refreshRole();
      sb.auth.onAuthStateChange(async (_evt, s) => {
        const changed = (!!s) !== (!!session);
        session = s;
        if (changed) { await refreshRole(); authListeners.forEach(f => f()); }
      });
    } else {
      idb = await openIdb();
      if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});
      await refreshRole();
    }
  }

  // ---------- ruolo GM ----------
  // gmSchema: il database ha la colonna gm_only e la tabella gm_users (script supabase/schema.sql eseguito)
  // In modalità locale si è sempre GM; per provare la vista giocatore: localStorage "nc-local-player" = "1"
  let gmSchema = false, gm = false;
  async function checkSchema() {
    const { error } = await sb.from("records").select("gm_only").limit(1);
    gmSchema = !error;
  }
  async function refreshRole() {
    if (!cloud) { gm = localStorage.getItem("nc-local-player") !== "1"; return; }
    gm = false;
    if (!gmSchema || !session) return;
    const { data, error } = await sb.rpc("is_gm");
    gm = !error && data === true;
  }
  async function listGms() {
    if (!cloud) return [];
    const { data, error } = await sb.from("gm_users").select("email,added_at").order("added_at");
    if (error) throw error;
    return data;
  }
  async function addGm(email) {
    const { error } = await sb.from("gm_users").upsert({ email: String(email).trim().toLowerCase() });
    if (error) throw error;
  }
  async function removeGm(email) {
    const { error } = await sb.from("gm_users").delete().eq("email", email);
    if (error) throw error;
  }

  // ---------- records ----------
  // limit: solo gli N record aggiornati più di recente (es. il log dei dadi)
  // Le righe segrete (gmOnly) arrivano solo ai master: nel cloud le filtra il database.
  async function list(col, { limit } = {}) {
    if (cloud) {
      let q = sb.from("records").select("id,data,updated_at").eq("collection", col);
      if (limit) q = q.order("updated_at", { ascending: false }).limit(limit);
      const { data, error } = await q;
      if (error) throw error;
      return data.map(r => ({ ...r.data, id: r.id }));
    }
    const all = await tx("records", "readonly", s => s.getAll());
    let out = all.filter(r => r._col === col && (gm || !r.gmOnly)).map(({ _key, _col, ...r }) => r);
    if (limit) out = out.sort((a, b) => (b.updatedAt || "").localeCompare(a.updatedAt || "")).slice(0, limit);
    return out;
  }
  // un solo record (null se non esiste o se non posso vederlo)
  async function get(col, id) {
    if (cloud) {
      const { data, error } = await sb.from("records").select("id,data").eq("collection", col).eq("id", id).maybeSingle();
      if (error) throw error;
      return data ? { ...data.data, id: data.id } : null;
    }
    const r = await tx("records", "readonly", s => s.get(col + ":" + id));
    if (!r || (r.gmOnly && !gm)) return null;
    const { _key, _col, ...rec } = r;
    return rec;
  }

  // ---------- tempo reale (tavolo di gioco) ----------
  // cloud: canale "broadcast" di Supabase Realtime (non serve configurare il database)
  // locale: BroadcastChannel tra le schede dello stesso browser
  let chan = null, bc = null, liveOk = false;
  function live(onMsg, onStatus) {
    if (cloud) {
      chan = sb.channel("nc-table", { config: { broadcast: { self: false } } });
      chan.on("broadcast", { event: "m" }, ({ payload }) => onMsg(payload));
      chan.subscribe(status => {
        const was = liveOk;
        liveOk = status === "SUBSCRIBED";
        if (onStatus && was !== liveOk) onStatus(liveOk, was);
      });
    } else if ("BroadcastChannel" in window) {
      bc = new BroadcastChannel("nc-table");
      bc.onmessage = ev => onMsg(ev.data);
      liveOk = true;
    }
  }
  function send(msg) {
    try {
      if (chan) chan.send({ type: "broadcast", event: "m", payload: msg });
      else if (bc) bc.postMessage(msg);
    } catch (e) { console.warn("realtime", e); }
  }

  async function save(col, rec) {
    const now = new Date().toISOString();
    const data = { ...rec, id: rec.id || uid(), createdAt: rec.createdAt || now, updatedAt: now };
    if (cloud) {
      const { id, ...payload } = data;
      const row = { id, collection: col, data: payload, updated_at: now };
      if (gmSchema) row.gm_only = !!data.gmOnly;
      else if (data.gmOnly) throw new Error("Per le cose segrete del GM va prima eseguito lo script supabase/schema.sql su Supabase");
      const { error } = await sb.from("records").upsert(row);
      if (error) throw error;
    } else {
      await tx("records", "readwrite", s => s.put({ ...data, _key: col + ":" + data.id, _col: col }));
    }
    return data;
  }

  async function remove(col, rec) {
    if (cloud) {
      const { error } = await sb.from("records").delete().eq("id", rec.id);
      if (error) throw error;
    } else {
      await tx("records", "readwrite", s => s.delete(col + ":" + rec.id));
    }
    await deleteFiles(fileRefs(rec));
  }

  // elimina file caricati (ignora URL esterni e percorsi locali tipo music/…)
  async function deleteFiles(refs) {
    refs = [...new Set(refs.filter(Boolean))];
    if (cloud) {
      const paths = refs.map(storagePath).filter(Boolean);
      if (paths.length) await sb.storage.from(BUCKET).remove(paths).catch(() => {});
    } else {
      for (const ref of refs) {
        if (ref.startsWith("idb:")) await tx("files", "readwrite", s => s.delete(ref.slice(4))).catch(() => {});
      }
    }
  }

  function fileRefs(rec) {
    const one = ["image", "cover", "audio"].map(k => rec[k]);
    const many = Array.isArray(rec.images) ? rec.images : [];
    return [...one, ...many].filter(v => typeof v === "string" && v);
  }
  function storagePath(url) {
    const marker = "/storage/v1/object/public/" + BUCKET + "/";
    const i = url.indexOf(marker);
    return i >= 0 ? decodeURIComponent(url.slice(i + marker.length)) : null;
  }

  // ---------- files ----------
  async function uploadFile(blob, name, folder) {
    const safe = (name || "file").toLowerCase().replace(/[^a-z0-9._-]+/g, "-").slice(-60);
    if (cloud) {
      const path = `${folder}/${uid()}-${safe}`;
      const { error } = await sb.storage.from(BUCKET).upload(path, blob, { contentType: blob.type || undefined, upsert: false });
      if (error) throw error;
      return sb.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
    }
    const id = uid();
    await tx("files", "readwrite", s => s.put({ id, blob, name: safe, type: blob.type }));
    return "idb:" + id;
  }

  async function resolve(ref) {
    if (!ref) return "";
    if (!ref.startsWith("idb:")) return ref;
    if (urlCache.has(ref)) return urlCache.get(ref);
    if (!idb) return "";
    const f = await tx("files", "readonly", s => s.get(ref.slice(4)));
    const url = f ? URL.createObjectURL(f.blob) : "";
    urlCache.set(ref, url);
    return url;
  }

  // ---------- backup ----------
  const blobToDataUrl = b => new Promise((res, rej) => {
    const r = new FileReader(); r.onload = () => res(r.result); r.onerror = () => rej(r.error); r.readAsDataURL(b);
  });

  async function exportAll(collections) {
    const out = { app: "nc-archive", version: 1, exportedAt: new Date().toISOString(), mode: cloud ? "cloud" : "local", records: {}, files: {} };
    for (const c of collections) out.records[c] = await list(c);
    if (!cloud) {
      const files = await tx("files", "readonly", s => s.getAll());
      for (const f of files) out.files[f.id] = { name: f.name, type: f.type, data: await blobToDataUrl(f.blob) };
    }
    return out;
  }

  async function importAll(json) {
    if (!json || json.app !== "nc-archive") throw new Error("File di backup non valido");
    const idMap = {};
    // file inclusi (backup locale) → li ricarico nello store corrente
    for (const [oldId, f] of Object.entries(json.files || {})) {
      const blob = await (await fetch(f.data)).blob();
      idMap["idb:" + oldId] = await uploadFile(blob, f.name, "import");
    }
    // merge: true → i campi del file aggiornano la scheda esistente (stesso id o stesso nome),
    // tutto il resto (immagini, cyberware, modifiche fatte dal sito) resta com'è
    const merge = json.merge === true;
    let n = 0;
    for (const [col, recs] of Object.entries(json.records || {})) {
      const existing = merge ? await list(col) : [];
      for (const r of recs) {
        let rec = { ...r };
        for (const k of ["image", "cover", "audio"]) if (rec[k] && idMap[rec[k]]) rec[k] = idMap[rec[k]];
        if (Array.isArray(rec.images)) rec.images = rec.images.map(r => idMap[r] || r);
        if (merge) {
          const same = (a, b) => String(a || "").trim().toLowerCase() === String(b || "").trim().toLowerCase();
          const old = existing.find(x => x.id === rec.id) || existing.find(x => x.name && same(x.name, rec.name) && x.kind === rec.kind);
          if (old) {
            rec = { ...old, ...rec, id: old.id, createdAt: old.createdAt };
            // campi personalizzati: aggiungo quelli nuovi, aggiorno quelli con lo stesso nome
            if (Array.isArray(r.custom) && Array.isArray(old.custom)) {
              const out = old.custom.map(c => ({ ...c }));
              for (const c of r.custom) { const o = out.find(x => same(x.k, c.k)); if (o) o.v = c.v; else out.push(c); }
              rec.custom = out;
            }
            if (Array.isArray(r.tags) && Array.isArray(old.tags)) rec.tags = [...new Set([...old.tags, ...r.tags])];
          }
        }
        await save(col, { ...rec, createdAt: rec.createdAt });
        n++;
      }
    }
    return n;
  }

  // ---------- auth ----------
  async function signIn(email, password) {
    const { error } = await sb.auth.signInWithPassword({ email, password });
    if (error) throw error;
  }
  async function signOut() { await sb.auth.signOut(); }

  return {
    init, list, save, remove, uploadFile, deleteFiles, resolve, exportAll, importAll,
    signIn, signOut, live, send, get, listGms, addGm, removeGm,
    get liveOk() { return liveOk; },
    get isGm() { return gm; },
    get gmReady() { return !cloud || gmSchema; },
    onAuth: fn => authListeners.add(fn),
    get mode() { return cloud ? "cloud" : "local"; },
    get user() { return session && session.user ? session.user.email : null; },
    canEdit: () => !cloud || !!session,
  };
})();
