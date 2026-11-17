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
      sb.auth.onAuthStateChange((_evt, s) => {
        const changed = (!!s) !== (!!session);
        session = s;
        if (changed) authListeners.forEach(f => f());
      });
    } else {
      idb = await openIdb();
      if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});
    }
  }

  // ---------- records ----------
  async function list(col) {
    if (cloud) {
      const { data, error } = await sb.from("records").select("id,data,updated_at").eq("collection", col);
      if (error) throw error;
      return data.map(r => ({ ...r.data, id: r.id }));
    }
    const all = await tx("records", "readonly", s => s.getAll());
    return all.filter(r => r._col === col).map(({ _key, _col, ...r }) => r);
  }

  async function save(col, rec) {
    const now = new Date().toISOString();
    const data = { ...rec, id: rec.id || uid(), createdAt: rec.createdAt || now, updatedAt: now };
    if (cloud) {
      const { id, ...payload } = data;
      const { error } = await sb.from("records").upsert({ id, collection: col, data: payload, updated_at: now });
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
      const paths = fileRefs(rec).map(storagePath).filter(Boolean);
      if (paths.length) await sb.storage.from(BUCKET).remove(paths).catch(() => {});
    } else {
      await tx("records", "readwrite", s => s.delete(col + ":" + rec.id));
      for (const ref of fileRefs(rec)) {
        if (ref.startsWith("idb:")) await tx("files", "readwrite", s => s.delete(ref.slice(4)));
      }
    }
  }

  function fileRefs(rec) {
    return ["image", "cover", "audio"].map(k => rec[k]).filter(v => typeof v === "string" && v);
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
    let n = 0;
    for (const [col, recs] of Object.entries(json.records || {})) {
      for (const r of recs) {
        const rec = { ...r };
        for (const k of ["image", "cover", "audio"]) if (rec[k] && idMap[rec[k]]) rec[k] = idMap[rec[k]];
        const keepDates = { createdAt: rec.createdAt };
        await save(col, { ...rec, ...keepDates });
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
    init, list, save, remove, uploadFile, resolve, exportAll, importAll,
    signIn, signOut,
    onAuth: fn => authListeners.add(fn),
    get mode() { return cloud ? "cloud" : "local"; },
    get user() { return session && session.user ? session.user.email : null; },
    canEdit: () => !cloud || !!session,
  };
})();
