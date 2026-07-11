// =========================================================
// Baila — práctica de coreografías con la cámara
// App JS (ES module). Sin frameworks. Única dependencia: MediaPipe por CDN.
//
// Secciones:
//   1. Imports y constantes
//   2. Utilidades (toast, fmtTime, DOM)
//   3. IndexedDB (guardado local de coreografías)
//   4. Matemática de poses (ángulos de articulaciones)
//   5. MediaPipe (carga del PoseLandmarker y cambio de modo)
//   6. Router / navegación entre vistas
//   7. Biblioteca (render de tarjetas)
//   8. Añadir (subida + análisis del video)
//   9. Práctica (reproducción + feedback de ritmo en vivo)
// =========================================================

import {
  FilesetResolver,
  PoseLandmarker,
} from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/vision_bundle.mjs";

// ---------- Constantes ----------
const WASM_URL =
  "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm";
const MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task";

const ACCENTS = ["#7C5CFF", "#F5A524", "#22C55E", "#EC4899", "#0EA5E9"];

// Articulaciones a comparar: vértice B con puntos A y C.
const JOINTS = [
  { key: "codoIzq", label: "el brazo izquierdo", a: 11, b: 13, c: 15 },
  { key: "codoDer", label: "el brazo derecho", a: 12, b: 14, c: 16 },
  { key: "hombroIzq", label: "el hombro izquierdo", a: 13, b: 11, c: 23 },
  { key: "hombroDer", label: "el hombro derecho", a: 14, b: 12, c: 24 },
  { key: "caderaIzq", label: "la cadera izquierda", a: 11, b: 23, c: 25 },
  { key: "caderaDer", label: "la cadera derecha", a: 12, b: 24, c: 26 },
  { key: "rodillaIzq", label: "la pierna izquierda", a: 23, b: 25, c: 27 },
  { key: "rodillaDer", label: "la pierna derecha", a: 24, b: 26, c: 28 },
];

// Conexiones del esqueleto para dibujar.
const CONNECTIONS = [
  [11, 12], [11, 13], [13, 15], [12, 14], [14, 16],
  [11, 23], [12, 24], [23, 24], [23, 25], [25, 27],
  [24, 26], [26, 28],
];

const VIS_MIN = 0.5; // visibilidad mínima confiable

// =========================================================
// 2. Utilidades
// =========================================================
const $ = (id) => document.getElementById(id);

let toastTimer = null;
function toast(msg) {
  const el = $("toast");
  if (!el) return;
  el.textContent = msg;
  el.classList.remove("hidden");
  // fuerza reflow para reiniciar la transición
  void el.offsetWidth;
  el.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    el.classList.remove("show");
    setTimeout(() => el.classList.add("hidden"), 250);
  }, 2500);
}

function fmtTime(seconds) {
  const s = Math.max(0, Math.floor(seconds || 0));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${String(r).padStart(2, "0")}`;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// =========================================================
// 3. IndexedDB
// =========================================================
const DB_NAME = "baila";
const STORE = "choreos";
let _dbPromise = null;

function openDB() {
  if (_dbPromise) return _dbPromise;
  _dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: "id" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return _dbPromise;
}

async function tx(mode, fn) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const t = db.transaction(STORE, mode);
    const store = t.objectStore(STORE);
    const out = fn(store);
    t.oncomplete = () => resolve(out.result ?? out._value);
    t.onerror = () => reject(t.error);
    t.onabort = () => reject(t.error);
  });
}

async function getAllChoreos() {
  return tx("readonly", (store) => store.getAll());
}
async function getChoreo(id) {
  return tx("readonly", (store) => store.get(id));
}
async function putChoreo(rec) {
  return tx("readwrite", (store) => store.put(rec));
}
async function deleteChoreo(id) {
  return tx("readwrite", (store) => store.delete(id));
}

// =========================================================
// 4. Matemática de poses (ángulos)
// =========================================================

// Ángulo en grados en el vértice B entre los vectores BA y BC (usando x,y).
// Devuelve null si algún punto no es confiable (visibility < 0.5).
function angleAt(lm, a, b, c) {
  const pa = lm[a], pb = lm[b], pc = lm[c];
  if (!pa || !pb || !pc) return null;
  if (
    (pa.visibility ?? 1) < VIS_MIN ||
    (pb.visibility ?? 1) < VIS_MIN ||
    (pc.visibility ?? 1) < VIS_MIN
  )
    return null;

  const bax = pa.x - pb.x;
  const bay = pa.y - pb.y;
  const bcx = pc.x - pb.x;
  const bcy = pc.y - pb.y;
  const dot = bax * bcx + bay * bcy;
  const magBA = Math.hypot(bax, bay);
  const magBC = Math.hypot(bcx, bcy);
  if (magBA < 1e-6 || magBC < 1e-6) return null;
  let cos = dot / (magBA * magBC);
  cos = Math.min(1, Math.max(-1, cos));
  return (Math.acos(cos) * 180) / Math.PI;
}

// Punto medio entre dos landmarks. Devuelve null si alguno no es confiable,
// para que el null se propague a la feature que lo use.
function midpoint(lm, i, j) {
  const p = lm[i], q = lm[j];
  if (!p || !q) return null;
  if ((p.visibility ?? 1) < VIS_MIN || (q.visibility ?? 1) < VIS_MIN) return null;
  return { x: (p.x + q.x) / 2, y: (p.y + q.y) / 2 };
}

// Inclinación de la columna (hombros→caderas) respecto a la VERTICAL, en grados.
// Con signo: captura inclinarse lateral (y algo de adelante/atrás vía x,y).
function torsoLean(lm) {
  const sh = midpoint(lm, 11, 12);
  const hip = midpoint(lm, 23, 24);
  if (!sh || !hip) return null;
  const dx = hip.x - sh.x;
  const dy = hip.y - sh.y; // hacia abajo en coords de imagen
  if (Math.hypot(dx, dy) < 1e-6) return null;
  return (Math.atan2(dx, dy) * 180) / Math.PI; // desviación de la vertical
}

// Ángulo de una línea (p→q) respecto a la HORIZONTAL, en grados, con signo.
function lineTilt(lm, i, j) {
  const p = lm[i], q = lm[j];
  if (!p || !q) return null;
  if ((p.visibility ?? 1) < VIS_MIN || (q.visibility ?? 1) < VIS_MIN) return null;
  const dx = q.x - p.x;
  const dy = q.y - p.y;
  if (Math.hypot(dx, dy) < 1e-6) return null;
  return (Math.atan2(dy, dx) * 180) / Math.PI;
}

// Vector de FEATURES (en grados). Cada item sabe calcularse desde los landmarks
// y devuelve null si los puntos que necesita no son confiables (visibility < 0.5).
// Las 8 primeras son las articulaciones históricas; les siguen 3 features de tronco.
const FEATURES = [
  ...JOINTS.map((j) => ({
    key: j.key,
    label: j.label,
    compute: (lm) => angleAt(lm, j.a, j.b, j.c),
  })),
  { key: "torsoLean", label: "el torso", compute: (lm) => torsoLean(lm) },
  { key: "hombros", label: "los hombros", compute: (lm) => lineTilt(lm, 11, 12) },
  { key: "cadera", label: "la cadera (giro)", compute: (lm) => lineTilt(lm, 23, 24) },
];

// Índice de la feature espejada (izq ↔ der). Las 3 de tronco se mapean a sí mismas.
const FEATURE_LR_SWAP = [1, 0, 3, 2, 5, 4, 7, 6, 8, 9, 10];

// Pares L/R de MediaPipe Pose para espejar por índice de landmark.
const LR_PAIRS = [
  [1, 4], [2, 5], [3, 6], [7, 8], [9, 10], [11, 12], [13, 14], [15, 16],
  [17, 18], [19, 20], [21, 22], [23, 24], [25, 26], [27, 28], [29, 30], [31, 32],
];

// Devuelve el vector de features (números/null), una entrada por FEATURE.
function computeFeatures(landmarks) {
  if (!landmarks) return FEATURES.map(() => null);
  return FEATURES.map((f) => f.compute(landmarks));
}

// Compara dos vectores de features. Devuelve { score, worstIndex, worstDiff }.
// Solo promedia sobre índices donde AMBOS son no-null. Si los vectores tienen
// distinta longitud (coreos viejas guardaron solo 8 features), compara sobre los
// índices comunes para no crashear.
function compareFeatures(a, b) {
  if (!a || !b) return { score: 0, worstIndex: null, worstDiff: 0 };
  const n = Math.min(a.length, b.length);
  let sum = 0;
  let count = 0;
  let worstIndex = null;
  let worstDiff = -1;
  for (let i = 0; i < n; i++) {
    const l = a[i];
    const r = b[i];
    if (l == null || r == null) continue;
    const diff = Math.abs(l - r);
    sum += diff;
    count++;
    if (diff > worstDiff) {
      worstDiff = diff;
      worstIndex = i;
    }
  }
  if (count === 0) return { score: 0, worstIndex: null, worstDiff: 0 };
  const meanDiff = sum / count;
  const score = Math.max(0, Math.round(100 - meanDiff * 2));
  return { score, worstIndex, worstDiff: Math.max(0, worstDiff) };
}

// Espeja los landmarks completos: cada punto {x:1-x, y, z, visibility} colocado
// en el índice L/R intercambiado. La nariz (0) y puntos sin par quedan en su sitio.
function mirrorLandmarks(lm) {
  if (!lm) return null;
  const out = new Array(lm.length);
  const mir = (p) => (p ? { x: 1 - p.x, y: p.y, z: p.z, visibility: p.visibility } : p);
  for (let i = 0; i < lm.length; i++) out[i] = mir(lm[i]);
  for (const [a, b] of LR_PAIRS) {
    out[a] = mir(lm[b]);
    out[b] = mir(lm[a]);
  }
  return out;
}

// Elige el mejor entre la comparación directa y la espejada (ya recalculadas).
// Si gana la espejada, remapea worstIndex al lado real del cuerpo de la usuaria
// para que "revisá el brazo derecho" nombre su brazo derecho de verdad.
function bestOfMirror(featuresLive, featuresLiveMirror, refFeatures) {
  const direct = compareFeatures(featuresLive, refFeatures);
  const mirrored = compareFeatures(featuresLiveMirror, refFeatures);
  if (mirrored.score > direct.score) {
    return {
      score: mirrored.score,
      worstIndex: mirrored.worstIndex != null ? FEATURE_LR_SWAP[mirrored.worstIndex] : null,
      worstDiff: mirrored.worstDiff,
    };
  }
  return direct;
}

// Compara los landmarks en vivo contra un vector de features de referencia,
// probando también la versión espejada (al practicar frente a la pantalla se
// suele copiar la coreografía en espejo). Recibe LANDMARKS (no features) porque
// necesita espejar y recalcular sobre la pose espejada completa.
function comparePoseMirrorAware(liveLm, refFeatures) {
  if (!liveLm) return compareFeatures(null, refFeatures);
  return bestOfMirror(
    computeFeatures(liveLm),
    computeFeatures(mirrorLandmarks(liveLm)),
    refFeatures
  );
}

// =========================================================
// 5. MediaPipe
// =========================================================
let landmarker = null;
let currentMode = null; // "IMAGE" | "VIDEO"

async function initLandmarker() {
  const chip = $("model-status");
  try {
    const vision = await FilesetResolver.forVisionTasks(WASM_URL);
    landmarker = await PoseLandmarker.createFromOptions(vision, {
      baseOptions: { modelAssetPath: MODEL_URL, delegate: "GPU" },
      runningMode: "IMAGE",
      numPoses: 1,
    });
    currentMode = "IMAGE";
    if (chip) {
      chip.classList.remove("chip-loading");
      chip.classList.add("chip-ready");
      chip.textContent = "✓ listo";
    }
  } catch (err) {
    console.error("Error cargando el modelo:", err);
    toast("No se pudo cargar el modelo. Revisa tu conexión e intenta de nuevo.");
  }
}

// Alterna el runningMode según la fase (análisis vs. práctica).
async function setMode(mode) {
  if (!landmarker || currentMode === mode) return;
  await landmarker.setOptions({ runningMode: mode });
  currentMode = mode;
}

// =========================================================
// 6. Router
// =========================================================
const VIEWS = ["library", "add", "practice"];

function showView(name) {
  for (const v of VIEWS) {
    const el = $(`view-${v}`);
    if (el) el.classList.toggle("hidden", v !== name);
  }
  if (name === "library") renderLibrary();
}

// Al abandonar práctica, apaga cámara y audio si estaban activos.
function leaveToLibrary() {
  stopPracticeHard();
  showView("library");
}

function wireNav() {
  $("brand-home")?.addEventListener("click", leaveToLibrary);
  document.querySelectorAll(".back[data-goto]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const goto = btn.getAttribute("data-goto") || "library";
      if (goto === "library") leaveToLibrary();
      else showView(goto);
    });
  });
}

// =========================================================
// 7. Biblioteca
// =========================================================
async function renderLibrary() {
  const grid = $("library-grid");
  const empty = $("library-empty");
  if (!grid) return;

  let choreos = [];
  try {
    choreos = await getAllChoreos();
  } catch (err) {
    console.error(err);
    toast("No se pudo leer la biblioteca.");
  }
  choreos.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

  grid.innerHTML = "";

  for (const c of choreos) {
    const card = document.createElement("div");
    card.className = "card";
    card.style.setProperty("--card-accent", c.accent || "var(--accent)");

    const metaTxt =
      c.bestScore != null ? `⭐ mejor: ${c.bestScore}%` : "sin practicar";

    card.innerHTML = `
      <div class="card-thumb">
        ${c.thumb ? `<img src="${c.thumb}" alt="">` : ""}
        <button class="card-del" title="Eliminar">🗑</button>
        <span class="card-dur">${fmtTime(c.duration)}</span>
      </div>
      <div class="card-body">
        <div class="card-title">${escapeHtml(c.name || "Sin nombre")}</div>
        <div class="card-meta">${metaTxt}</div>
      </div>`;

    // Abrir práctica al hacer click (excepto en la papelera).
    card.addEventListener("click", async (e) => {
      if (e.target.closest(".card-del")) return;
      try {
        const full = await getChoreo(c.id);
        if (full) startPractice(full);
      } catch (err) {
        console.error(err);
        toast("No se pudo abrir la coreografía.");
      }
    });

    // Eliminar.
    card.querySelector(".card-del")?.addEventListener("click", async (e) => {
      e.stopPropagation();
      if (!confirm(`¿Eliminar «${c.name}»? No se puede deshacer.`)) return;
      try {
        await deleteChoreo(c.id);
        renderLibrary();
      } catch (err) {
        console.error(err);
        toast("No se pudo eliminar.");
      }
    });

    grid.appendChild(card);
  }

  // Tarjeta "Añadir coreografía" siempre al final.
  const add = document.createElement("div");
  add.className = "card-add";
  add.setAttribute("role", "button");
  add.setAttribute("tabindex", "0");
  add.innerHTML = `
    <div class="card-add-plus">+</div>
    <div class="card-add-title">Añadir coreografía</div>
    <div class="card-add-sub">subir video de referencia</div>`;
  add.addEventListener("click", () => showView("add"));
  add.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      showView("add");
    }
  });
  grid.appendChild(add);

  // Estado vacío.
  if (empty) empty.classList.toggle("hidden", choreos.length > 0);
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// =========================================================
// 8. Añadir coreografía
// =========================================================
let pendingFile = null; // File del video subido
let pendingUrl = null; // objectURL del preview

function wireAdd() {
  const fileInput = $("add-file");
  const dropzone = $("dropzone");
  const nameInput = $("add-name");
  const saveBtn = $("add-save");

  fileInput?.addEventListener("change", () => {
    if (fileInput.files && fileInput.files[0]) loadAddFile(fileInput.files[0]);
  });

  // Drag & drop sobre la dropzone.
  ["dragover", "dragenter"].forEach((ev) =>
    dropzone?.addEventListener(ev, (e) => {
      e.preventDefault();
    })
  );
  dropzone?.addEventListener("drop", (e) => {
    e.preventDefault();
    const f = e.dataTransfer?.files?.[0];
    if (f) loadAddFile(f);
  });

  nameInput?.addEventListener("input", refreshAddSaveState);

  saveBtn?.addEventListener("click", saveChoreo);
}

function loadAddFile(file) {
  if (!file.type.startsWith("video/")) {
    toast("Ese archivo no parece un video.");
    return;
  }
  pendingFile = file;
  if (pendingUrl) URL.revokeObjectURL(pendingUrl);
  pendingUrl = URL.createObjectURL(file);

  const preview = $("add-preview");
  const dzEmpty = $("dropzone-empty");
  if (preview) {
    preview.src = pendingUrl;
    preview.classList.remove("hidden");
    preview.load();
  }
  if (dzEmpty) dzEmpty.classList.add("hidden");
  refreshAddSaveState();
}

function refreshAddSaveState() {
  const nameInput = $("add-name");
  const saveBtn = $("add-save");
  const ok = !!pendingFile && !!nameInput && nameInput.value.trim().length > 0;
  if (saveBtn) saveBtn.disabled = !ok;
}

function resetAddForm() {
  pendingFile = null;
  if (pendingUrl) {
    URL.revokeObjectURL(pendingUrl);
    pendingUrl = null;
  }
  const preview = $("add-preview");
  if (preview) {
    preview.pause();
    preview.removeAttribute("src");
    preview.load();
    preview.classList.add("hidden");
  }
  $("dropzone-empty")?.classList.remove("hidden");
  const nameInput = $("add-name");
  if (nameInput) nameInput.value = "";
  const fileInput = $("add-file");
  if (fileInput) fileInput.value = "";
  const prog = $("add-progress");
  if (prog) prog.classList.add("hidden");
  refreshAddSaveState();
}

// seekTo: coloca el video en t y resuelve cuando hay un fotograma decodificado.
// En iOS/Safari el evento "seeked" no garantiza que el frame esté pintado, así que
// además esperamos un requestVideoFrameCallback (con timeouts de respaldo para no
// colgarnos si el evento no dispara, p.ej. cuando el tiempo no cambia por redondeo).
function seekTo(video, t) {
  return new Promise((resolve) => {
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      video.removeEventListener("seeked", onSeeked);
      resolve();
    };
    const onSeeked = () => {
      if (typeof video.requestVideoFrameCallback === "function") {
        video.requestVideoFrameCallback(() => finish());
        setTimeout(finish, 250); // respaldo si rVFC no dispara al hacer seek
      } else {
        requestAnimationFrame(() => requestAnimationFrame(finish));
      }
    };
    video.addEventListener("seeked", onSeeked);
    const dur = isFinite(video.duration) ? video.duration : 0;
    video.currentTime = Math.min(t, Math.max(0, dur - 0.05));
    // Si el tiempo no cambia, "seeked" no dispara: forzamos la resolución.
    setTimeout(() => { if (!settled) onSeeked(); }, 500);
  });
}

// Espera a tener metadata (readyState >= HAVE_METADATA), con respaldo por si
// el evento ya disparó o el navegador se demora.
function whenMetadataBasic(video) {
  return new Promise((resolve) => {
    if (video.readyState >= 1) { resolve(); return; }
    const on = () => { video.removeEventListener("loadedmetadata", on); resolve(); };
    video.addEventListener("loadedmetadata", on);
    setTimeout(resolve, 5000);
  });
}

// Devuelve una duración válida. iOS/Safari a veces reporta Infinity/NaN hasta que
// se hace un seek al final; en ese caso saltamos muy lejos para forzar el cálculo.
async function ensureDuration(video) {
  await whenMetadataBasic(video);
  if (isFinite(video.duration) && video.duration > 0) return video.duration;
  return await new Promise((resolve) => {
    let settled = false;
    const done = (d) => {
      if (settled) return;
      settled = true;
      video.removeEventListener("durationchange", onChange);
      video.removeEventListener("timeupdate", onChange);
      resolve(d);
    };
    const onChange = () => {
      if (isFinite(video.duration) && video.duration > 0) done(video.duration);
    };
    video.addEventListener("durationchange", onChange);
    video.addEventListener("timeupdate", onChange);
    try { video.currentTime = 1e7; } catch (_) {}
    setTimeout(() => done(isFinite(video.duration) ? video.duration : 0), 3000);
  });
}

// Reproduce y pausa el video para que iOS decodifique fotogramas antes de hacer
// seeks (sin esto, en Safari los seeks devuelven cuadros en blanco a detect()).
async function primeDecoder(video) {
  try {
    video.muted = true;
    video.playsInline = true;
    const p = video.play();
    if (p && typeof p.then === "function") await p;
    video.pause();
  } catch (_) {
    // iOS puede bloquear el play fuera de un gesto; seguimos igual.
  }
}

// Analiza el video muestreando ~15 fps. Devuelve { poses, duration, thumb }.
async function analyzeVideo(videoEl, onProgress) {
  await setMode("IMAGE");
  await whenMetadataBasic(videoEl);
  // iOS necesita que el video se haya reproducido para decodificar fotogramas.
  await primeDecoder(videoEl);
  const duration = await ensureDuration(videoEl);
  if (!duration || !isFinite(duration)) throw new Error("Duración inválida");
  // Tras el truco de duración el video queda al final; volvemos al inicio.
  await seekTo(videoEl, 0);

  const step = 1 / 15;
  const poses = [];

  for (let t = 0; t < duration; t += step) {
    await seekTo(videoEl, t);
    // El campo se sigue llamando `angles` por compatibilidad con coreos ya
    // guardadas, pero ahora contiene el vector de FEATURES (ver computeFeatures).
    let angles = FEATURES.map(() => null);
    try {
      const res = landmarker.detect(videoEl);
      if (res && res.landmarks && res.landmarks[0]) {
        angles = computeFeatures(res.landmarks[0]);
      }
    } catch (err) {
      console.warn("detect() falló en t=", t, err);
    }
    poses.push({ t, angles });
    if (onProgress) onProgress(Math.min(1, t / duration));
  }

  // Miniatura.
  let thumb = "";
  try {
    await seekTo(videoEl, Math.min(1, duration / 2));
    const canvas = document.createElement("canvas");
    canvas.width = 320;
    canvas.height = 180;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);
    thumb = canvas.toDataURL("image/jpeg", 0.7);
  } catch (err) {
    console.warn("No se pudo generar miniatura:", err);
  }

  if (onProgress) onProgress(1);
  return { poses, duration, thumb };
}

async function saveChoreo() {
  const saveBtn = $("add-save");
  const nameInput = $("add-name");
  const preview = $("add-preview");
  if (!pendingFile || !nameInput || !preview) return;

  const name = nameInput.value.trim();
  if (!name) {
    toast("Ponle un nombre a la coreografía.");
    return;
  }
  if (!landmarker) {
    toast("El modelo aún se está cargando, espera un momento.");
    return;
  }

  if (saveBtn) saveBtn.disabled = true;

  const prog = $("add-progress");
  const label = $("add-progress-label");
  const pct = $("add-progress-pct");
  const bar = $("add-progress-bar");
  if (prog) prog.classList.remove("hidden");
  if (label) label.textContent = "Analizando la coreografía…";

  const setProgress = (p) => {
    const v = Math.round(p * 100);
    if (pct) pct.textContent = `${v}%`;
    if (bar) bar.style.width = `${v}%`;
  };
  setProgress(0);

  try {
    const { poses, duration, thumb } = await analyzeVideo(preview, setProgress);

    const existing = await getAllChoreos();
    const accent = ACCENTS[existing.length % ACCENTS.length];

    const rec = {
      id: crypto.randomUUID(),
      name,
      accent,
      duration,
      poses,
      thumb,
      videoBlob: pendingFile,
      bestScore: null,
      createdAt: Date.now(),
    };
    await putChoreo(rec);
    toast("Coreografía guardada ✅");
    resetAddForm();
    showView("library");
  } catch (err) {
    console.error(err);
    toast("No se pudo analizar el video. Intenta con otro archivo.");
    if (saveBtn) saveBtn.disabled = false;
  }
}

// =========================================================
// 9. Práctica
// =========================================================
let practiceState = {
  choreo: null,
  raf: null,
  running: false,
  refIdx: 0, // caché del índice de pose de referencia más cercano
  disp: 0, // score suavizado mostrado
  buckets: {}, // { segundo: { sum, n, late, early, jointBad: {featureIdx: count} } }
  lastText: 0, // throttle de textos
  camStream: null,
  speed: 1, // velocidad de reproducción de la referencia
  loop: null, // { start, end } en segundos cuando se repite un tramo; null si no
  loopCount: 0, // repeticiones completadas en el bucle actual
  loopBest: 0, // mejor puntaje entre las repeticiones del bucle
  loopSum: 0, // acumulador de la repetición en curso
  loopN: 0,
  // ---- Grabación del intento ----
  recEnabled: true, // toggle "grabar mi intento" (default on)
  recWithSkeleton: false, // toggle "incluir esqueleto" (se fija al arrancar)
  recording: false, // hay una grabación en curso
  recorder: null, // MediaRecorder activo
  recChunks: [], // trozos de datos acumulados
  recStream: null, // stream que alimenta al recorder (canvas o cámara)
  recCanvas: null, // canvas compuesto en memoria
  recCtx: null, // contexto 2d del canvas de grabación
  recMime: "", // mime elegido (para la extensión)
  recBlob: null, // blob final
  recUrl: null, // objectURL del blob (para <video> y descarga)
};

const $$ = {
  get title() { return $("practice-title"); },
  get feedback() { return $("feedback"); },
  get light() { return $("light"); },
  get main() { return $("feedback-main"); },
  get sub() { return $("feedback-sub"); },
  get scoreNum() { return $("score-num"); },
  get cam() { return $("cam"); },
  get overlay() { return $("overlay"); },
  get ref() { return $("ref-play"); },
  get countdown() { return $("countdown"); },
  get summary() { return $("summary"); },
  get startBtn() { return $("start-btn"); },
  get stopBtn() { return $("stop-btn"); },
  get recEnabled() { return $("rec-enabled"); },
  get recSkeleton() { return $("rec-skeleton"); },
  get review() { return $("review"); },
  get reviewVideo() { return $("review-video"); },
  get reviewDownload() { return $("review-download"); },
};

function setFeedback(state, lightClass, main, sub) {
  const fb = $$.feedback;
  const lt = $$.light;
  if (fb) {
    fb.classList.remove("state-idle", "state-good", "state-timing", "state-wrong");
    fb.classList.add(state);
  }
  if (lt) {
    lt.classList.remove("gray", "green", "yellow", "red");
    lt.classList.add(lightClass);
  }
  if (main != null && $$.main) $$.main.textContent = main;
  if (sub != null && $$.sub) $$.sub.textContent = sub;
}

function resetFeedbackIdle() {
  setFeedback("state-idle", "gray", "Ponte frente a la cámara", "Pulsa «Empezar» cuando estés lista");
  if ($$.scoreNum) $$.scoreNum.textContent = "--";
}

// Enciende la cámara y prepara el video de referencia. Devuelve true si todo ok.
// Se reutiliza tanto en la práctica completa como al entrar en un bucle desde el
// resumen (donde la cámara quedó apagada).
async function setupCameraAndRef(choreo) {
  // Cambiar el modelo a modo VIDEO para la detección en vivo.
  try {
    await setMode("VIDEO");
  } catch (err) {
    console.warn("No se pudo cambiar a modo VIDEO:", err);
  }

  // Cámara.
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { width: 1280, height: 720 },
      audio: false,
    });
    practiceState.camStream = stream;
    const cam = $$.cam;
    cam.srcObject = stream;
    await cam.play();
    // Ajustar overlay cuando haya dimensiones.
    const sizeOverlay = () => {
      if (cam.videoWidth && cam.videoHeight) {
        $$.overlay.width = cam.videoWidth;
        $$.overlay.height = cam.videoHeight;
      }
    };
    if (cam.videoWidth) sizeOverlay();
    else cam.addEventListener("loadedmetadata", sizeOverlay, { once: true });
  } catch (err) {
    console.error(err);
    toast("Necesito acceso a la cámara para practicar. Actívala y vuelve a intentar.");
    leaveToLibrary();
    return false;
  }

  // Video de referencia (con su audio = la música). NO se mutea.
  const ref = $$.ref;
  ref.muted = false;
  if (practiceState.refUrl) URL.revokeObjectURL(practiceState.refUrl);
  practiceState.refUrl = URL.createObjectURL(choreo.videoBlob);
  ref.src = practiceState.refUrl;
  ref.currentTime = 0;
  ref.pause();
  applySpeed();
  return true;
}

async function startPractice(choreo) {
  practiceState.choreo = choreo;
  practiceState.loop = null; // práctica completa, no bucle
  hideLoopBar();
  showView("practice");
  if ($$.title) $$.title.textContent = choreo.name || "Coreografía";
  $$.summary?.classList.add("hidden");
  resetFeedbackIdle();

  const ok = await setupCameraAndRef(choreo);
  if (!ok) return;

  // Estado de botones.
  if ($$.startBtn) $$.startBtn.disabled = false;
  if ($$.stopBtn) $$.stopBtn.disabled = true;
}

function wirePractice() {
  $$.startBtn?.addEventListener("click", onStartClick);
  $$.stopBtn?.addEventListener("click", () => {
    if (practiceState.loop) exitLoop();
    else finishPractice();
  });
  $("loop-exit")?.addEventListener("click", exitLoop);
  wireSpeed();
  wireRecording();
}

// Cablea los toggles de grabación. El estado se lee al arrancar la práctica.
function wireRecording() {
  const en = $$.recEnabled;
  const sk = $$.recSkeleton;
  if (en) {
    practiceState.recEnabled = en.checked;
    en.addEventListener("change", () => {
      practiceState.recEnabled = en.checked;
    });
  }
  if (sk) {
    practiceState.recWithSkeleton = sk.checked;
    sk.addEventListener("change", () => {
      practiceState.recWithSkeleton = sk.checked;
    });
  }
}

// Aplica la velocidad elegida al video de referencia, conservando el tono de la
// música al ralentizar (preservesPitch + prefijos de compatibilidad).
function applySpeed() {
  const ref = $$.ref;
  if (!ref) return;
  ref.playbackRate = practiceState.speed || 1;
  ref.preservesPitch = true;
  ref.mozPreservesPitch = true;
  ref.webkitPreservesPitch = true;
}

function wireSpeed() {
  const sc = $("speed-control");
  if (!sc) return;
  const btns = sc.querySelectorAll("button[data-speed]");
  btns.forEach((btn) => {
    btn.addEventListener("click", () => {
      practiceState.speed = parseFloat(btn.getAttribute("data-speed")) || 1;
      btns.forEach((b) => b.classList.toggle("active", b === btn));
      applySpeed(); // aplica al instante, incluso durante la práctica
    });
  });
}

async function onStartClick() {
  if (practiceState.running) return;
  practiceState.loop = null; // botón «Empezar» = práctica completa
  hideLoopBar();
  const cd = $$.countdown;
  if ($$.startBtn) $$.startBtn.disabled = true;
  $$.summary?.classList.add("hidden");
  hideReview(); // limpia la revisión del intento anterior

  // Reasegurar la cámara: al terminar un intento, finishPractice la apaga.
  // Sin esto, volver a pulsar «Empezar» corría sin cámara (había que refrescar).
  if (!practiceState.camStream) {
    const ok = await setupCameraAndRef(practiceState.choreo);
    if (!ok) {
      if ($$.startBtn) $$.startBtn.disabled = false;
      return;
    }
  }

  // Cuenta regresiva 3, 2, 1.
  if (cd) {
    cd.classList.remove("hidden");
    for (const n of [3, 2, 1]) {
      cd.textContent = String(n);
      await sleep(1000);
    }
    cd.classList.add("hidden");
  }

  // Reset de acumuladores.
  practiceState.buckets = {};
  practiceState.refIdx = 0;
  practiceState.disp = 0;
  practiceState.lastText = 0;

  const ref = $$.ref;
  try {
    ref.currentTime = 0;
    applySpeed();
    await ref.play();
  } catch (err) {
    console.error(err);
    toast("No se pudo reproducir el video de referencia.");
    if ($$.startBtn) $$.startBtn.disabled = false;
    return;
  }

  // Grabación del intento (solo práctica completa, nunca en bucle).
  practiceState.recEnabled = !$$.recEnabled || $$.recEnabled.checked;
  if (practiceState.recEnabled && practiceState.camStream) {
    startRecording();
  } else {
    practiceState.recording = false;
  }

  practiceState.running = true;
  if ($$.stopBtn) $$.stopBtn.disabled = false;
  practiceState.raf = requestAnimationFrame(loop);
}

// ---- Bucle de un tramo (repetir los segundos difíciles) ----

function hideLoopBar() {
  $("loop-bar")?.classList.add("hidden");
}

function updateLoopBar(thisScore) {
  const info = $("loop-info");
  if (!info || !practiceState.loop) return;
  const { start, end } = practiceState.loop;
  const rango = `${fmtTime(start)} – ${fmtTime(end)}`;
  if (practiceState.loopCount === 0) {
    info.textContent = `🔁 Repitiendo ${rango}`;
  } else {
    info.textContent =
      `🔁 ${rango} · repetición ${practiceState.loopCount}` +
      ` · esta vez ${thisScore}% · mejor ${practiceState.loopBest}%`;
  }
}

// Entra al modo bucle sobre [startSec, endSec]. Se llama desde el resumen, donde
// la cámara ya se apagó, así que la volvemos a encender.
async function startLoop(startSec, endSec) {
  const choreo = practiceState.choreo;
  if (!choreo) return;
  if (practiceState.running) return;

  const dur = choreo.duration || endSec;
  const start = Math.max(0, Math.min(startSec, dur - 0.2));
  const end = Math.max(start + 0.2, Math.min(endSec, dur));

  practiceState.loop = { start, end };
  practiceState.loopCount = 0;
  practiceState.loopBest = 0;
  practiceState.loopSum = 0;
  practiceState.loopN = 0;
  practiceState.refIdx = 0;
  practiceState.disp = 0;
  practiceState.lastText = 0;

  $$.summary?.classList.add("hidden");
  hideReview(); // el bucle no graba: oculta la revisión del run previo
  abortRecording(); // por si quedara algún recorder colgando
  resetFeedbackIdle();

  const ok = await setupCameraAndRef(choreo);
  if (!ok) return;

  // Mostrar la barra del bucle.
  const bar = $("loop-bar");
  if (bar) bar.classList.remove("hidden");
  updateLoopBar(0);

  // Cuenta regresiva y arranque en el inicio del tramo.
  const cd = $$.countdown;
  if (cd) {
    cd.classList.remove("hidden");
    for (const n of [3, 2, 1]) {
      cd.textContent = String(n);
      await sleep(1000);
    }
    cd.classList.add("hidden");
  }

  const ref = $$.ref;
  try {
    ref.currentTime = start;
    applySpeed();
    await ref.play();
  } catch (err) {
    console.error(err);
    toast("No se pudo reproducir el tramo.");
    exitLoop();
    return;
  }

  practiceState.running = true;
  if ($$.startBtn) $$.startBtn.disabled = true;
  if ($$.stopBtn) $$.stopBtn.disabled = false;
  practiceState.raf = requestAnimationFrame(loop);
}

// Sale del bucle y vuelve a mostrar el resumen (que sigue poblado).
function exitLoop() {
  if (practiceState.raf) cancelAnimationFrame(practiceState.raf);
  practiceState.raf = null;
  practiceState.running = false;
  practiceState.loop = null;
  const ref = $$.ref;
  if (ref) ref.pause();
  stopCamera();
  hideLoopBar();
  const cd = $$.countdown;
  if (cd) cd.classList.add("hidden");
  $$.summary?.classList.remove("hidden");
  if ($$.startBtn) $$.startBtn.disabled = false;
  if ($$.stopBtn) $$.stopBtn.disabled = true;
}

// Busca la pose de referencia más cercana en el tiempo, cacheando el índice.
function nearestPose(poses, t) {
  let i = practiceState.refIdx;
  if (i >= poses.length) i = poses.length - 1;
  if (i < 0) i = 0;
  // Avanzar mientras la siguiente esté más cerca.
  while (i < poses.length - 1 && Math.abs(poses[i + 1].t - t) <= Math.abs(poses[i].t - t)) {
    i++;
  }
  // Retroceder si nos pasamos.
  while (i > 0 && Math.abs(poses[i - 1].t - t) < Math.abs(poses[i].t - t)) {
    i--;
  }
  practiceState.refIdx = i;
  return { pose: poses[i], index: i };
}

function drawSkeleton(landmarks, accent) {
  const canvas = $$.overlay;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (!landmarks) return;

  const W = canvas.width;
  const H = canvas.height;
  const px = (p) => [p.x * W, p.y * H];

  // Líneas (blanco semitransparente grueso).
  ctx.lineWidth = Math.max(3, W * 0.006);
  ctx.strokeStyle = "rgba(255,255,255,0.72)";
  ctx.lineCap = "round";
  for (const [a, b] of CONNECTIONS) {
    const pa = landmarks[a];
    const pb = landmarks[b];
    if (!pa || !pb) continue;
    if ((pa.visibility ?? 1) < VIS_MIN || (pb.visibility ?? 1) < VIS_MIN) continue;
    const [ax, ay] = px(pa);
    const [bx, by] = px(pb);
    ctx.beginPath();
    ctx.moveTo(ax, ay);
    ctx.lineTo(bx, by);
    ctx.stroke();
  }

  // Puntos con el accent de la coreo.
  const r = Math.max(4, W * 0.008);
  ctx.fillStyle = accent || "#7C5CFF";
  for (const p of landmarks) {
    if (!p || (p.visibility ?? 1) < VIS_MIN) continue;
    const [x, y] = px(p);
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
}

// =========================================================
// Grabación del intento (canvas compuesto)
// =========================================================

// Preferimos mp4 (mejor compatibilidad iOS/QuickTime); si no, webm.
const REC_MIME_CANDIDATES = [
  "video/mp4;codecs=h264",
  "video/mp4",
  "video/webm;codecs=vp9",
  "video/webm;codecs=vp8",
  "video/webm",
];

// Colores del semáforo para el overlay grabado (independientes del CSS).
const REC_LIGHT_COLORS = {
  green: "#22C55E",
  yellow: "#F5A524",
  red: "#EF4444",
  gray: "#9AA0A6",
};

// Oculta la sección de revisión y libera el objectURL previo.
function hideReview() {
  const sec = $$.review;
  if (sec) sec.classList.add("hidden");
  const vid = $$.reviewVideo;
  if (vid) vid.removeAttribute("src");
  if (practiceState.recUrl) {
    URL.revokeObjectURL(practiceState.recUrl);
    practiceState.recUrl = null;
  }
  practiceState.recBlob = null;
}

// Rellena y muestra la sección "Tu intento" con el blob grabado; si no hay,
// deja la sección oculta. Libera recorder/stream una vez usados.
function showReview(blob) {
  // Ya no necesitamos el recorder ni el stream.
  practiceState.recorder = null;
  practiceState.recStream = null;
  practiceState.recChunks = [];

  const sec = $$.review;
  const vid = $$.reviewVideo;
  const dl = $$.reviewDownload;
  if (!blob || !sec || !vid || !dl) {
    if (sec) sec.classList.add("hidden");
    return;
  }
  if (practiceState.recUrl) URL.revokeObjectURL(practiceState.recUrl);
  practiceState.recBlob = blob;
  practiceState.recUrl = URL.createObjectURL(blob);

  const ext = (practiceState.recMime || blob.type || "").includes("mp4") ? "mp4" : "webm";
  vid.src = practiceState.recUrl;
  dl.href = practiceState.recUrl;
  dl.setAttribute("download", `mi-intento.${ext}`);
  sec.classList.remove("hidden");
}

// Crea/redimensiona el canvas de grabación al aspecto de la cámara, con alto ≤480.
function ensureRecCanvas() {
  const cam = $$.cam;
  if (!cam || !cam.videoWidth || !cam.videoHeight) return null;
  const maxH = 480;
  const scale = Math.min(1, maxH / cam.videoHeight);
  const W = Math.round(cam.videoWidth * scale);
  const H = Math.round(cam.videoHeight * scale);
  if (!practiceState.recCanvas) {
    practiceState.recCanvas = document.createElement("canvas");
    practiceState.recCtx = practiceState.recCanvas.getContext("2d");
    // Safari solo captura el stream de un canvas que esté en el DOM y se pinte;
    // lo dejamos presente pero fuera de pantalla (no `display:none`, que lo pausa).
    const c = practiceState.recCanvas;
    c.style.cssText =
      "position:fixed;left:-10000px;top:0;width:1px;height:1px;opacity:0;pointer-events:none;";
    document.body.appendChild(c);
  }
  if (practiceState.recCanvas.width !== W || practiceState.recCanvas.height !== H) {
    practiceState.recCanvas.width = W;
    practiceState.recCanvas.height = H;
  }
  return practiceState.recCanvas;
}

// Pinta un frame del canvas de grabación: cámara espejada (+ esqueleto opcional)
// y, sin espejar, el semáforo con el texto principal para que se lea normal.
function drawRecordFrame(live, state, lightClass, mainText) {
  const canvas = practiceState.recCanvas;
  const ctx = practiceState.recCtx;
  const cam = $$.cam;
  if (!canvas || !ctx || !cam) return;
  const W = canvas.width;
  const H = canvas.height;

  // ---- Capa espejada: cámara + (opcional) esqueleto ----
  ctx.save();
  ctx.translate(W, 0);
  ctx.scale(-1, 1);
  try {
    ctx.drawImage(cam, 0, 0, W, H);
  } catch (_) {
    // Si el frame no está listo, dejamos lo anterior.
  }
  if (practiceState.recWithSkeleton && live) {
    ctx.lineWidth = Math.max(2, W * 0.006);
    ctx.strokeStyle = "rgba(255,255,255,0.72)";
    ctx.lineCap = "round";
    for (const [a, b] of CONNECTIONS) {
      const pa = live[a];
      const pb = live[b];
      if (!pa || !pb) continue;
      if ((pa.visibility ?? 1) < VIS_MIN || (pb.visibility ?? 1) < VIS_MIN) continue;
      ctx.beginPath();
      ctx.moveTo(pa.x * W, pa.y * H);
      ctx.lineTo(pb.x * W, pb.y * H);
      ctx.stroke();
    }
    const accent = practiceState.choreo?.accent || "#7C5CFF";
    const r = Math.max(3, W * 0.008);
    ctx.fillStyle = accent;
    for (const p of live) {
      if (!p || (p.visibility ?? 1) < VIS_MIN) continue;
      ctx.beginPath();
      ctx.arc(p.x * W, p.y * H, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();

  // ---- Capa de feedback (sin espejar, esquina SUPERIOR izquierda) ----
  // Va arriba a propósito: abajo lo taparía la barra de controles del
  // reproductor al revisar el video.
  const dotR = Math.max(7, W * 0.018);
  const pad = Math.max(10, W * 0.02);
  const fontSize = Math.max(14, Math.round(W * 0.038));
  ctx.font = `600 ${fontSize}px -apple-system, system-ui, sans-serif`;
  ctx.textBaseline = "middle";
  const text = mainText || "";
  const textW = ctx.measureText(text).width;
  const cy = pad + dotR; // arriba, fuera del alcance de los controles del video
  const gap = dotR * 0.9;
  const boxH = dotR * 2 + pad * 0.5;
  const boxW = dotR * 2 + gap + textW + pad;

  // Fondo semitransparente para legibilidad sobre cualquier imagen.
  ctx.fillStyle = "rgba(0,0,0,0.5)";
  const boxY = cy - boxH / 2;
  const boxX = pad - dotR * 0.5;
  const rad = Math.min(boxH / 2, 14);
  ctx.beginPath();
  ctx.moveTo(boxX + rad, boxY);
  ctx.arcTo(boxX + boxW, boxY, boxX + boxW, boxY + boxH, rad);
  ctx.arcTo(boxX + boxW, boxY + boxH, boxX, boxY + boxH, rad);
  ctx.arcTo(boxX, boxY + boxH, boxX, boxY, rad);
  ctx.arcTo(boxX, boxY, boxX + boxW, boxY, rad);
  ctx.closePath();
  ctx.fill();

  // Semáforo.
  const dotX = pad + dotR;
  ctx.fillStyle = REC_LIGHT_COLORS[lightClass] || REC_LIGHT_COLORS.gray;
  ctx.beginPath();
  ctx.arc(dotX, cy, dotR, 0, Math.PI * 2);
  ctx.fill();

  // Texto principal en blanco con sombra.
  ctx.fillStyle = "#FFFFFF";
  ctx.shadowColor = "rgba(0,0,0,0.7)";
  ctx.shadowBlur = 4;
  ctx.fillText(text, dotX + dotR + gap, cy);
  ctx.shadowBlur = 0;
}

// Arranca la grabación del intento. No lanza: si algo falla, avisa y sigue.
function startRecording() {
  practiceState.recording = false;
  practiceState.recChunks = [];
  practiceState.recBlob = null;
  practiceState.recWithSkeleton = !!($$.recSkeleton && $$.recSkeleton.checked);

  if (typeof MediaRecorder === "undefined") {
    toast("Tu navegador no permite grabar el intento.");
    return;
  }
  const canvas = ensureRecCanvas();
  if (!canvas) {
    toast("No se pudo preparar la grabación del intento.");
    return;
  }

  // Stream: preferimos el canvas compuesto; respaldo a la cámara cruda.
  let stream = null;
  try {
    if (typeof canvas.captureStream === "function") {
      stream = canvas.captureStream(30);
    }
  } catch (_) {}
  if (!stream) {
    if (practiceState.camStream) {
      stream = practiceState.camStream; // respaldo: cámara sin overlays
    } else {
      toast("Tu navegador no permite grabar el intento.");
      return;
    }
  }
  practiceState.recStream = stream;

  // Mime soportado.
  let mime = "";
  for (const m of REC_MIME_CANDIDATES) {
    if (MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(m)) {
      mime = m;
      break;
    }
  }
  practiceState.recMime = mime;

  try {
    practiceState.recorder = mime
      ? new MediaRecorder(stream, { mimeType: mime })
      : new MediaRecorder(stream);
  } catch (err) {
    console.warn("MediaRecorder falló:", err);
    toast("Tu navegador no permite grabar el intento.");
    practiceState.recorder = null;
    return;
  }

  practiceState.recorder.ondataavailable = (e) => {
    if (e.data && e.data.size > 0) practiceState.recChunks.push(e.data);
  };
  try {
    // timeslice: Safari suele no emitir datos sin él (dataavailable periódico).
    practiceState.recorder.start(250);
    practiceState.recording = true;
  } catch (err) {
    console.warn("No se pudo iniciar la grabación:", err);
    toast("Tu navegador no permite grabar el intento.");
    practiceState.recorder = null;
    practiceState.recording = false;
  }
}

// Detiene el recorder y resuelve con el Blob final (o null si no había datos).
function stopRecordingAndBuild() {
  return new Promise((resolve) => {
    const rec = practiceState.recorder;
    practiceState.recording = false;
    if (!rec) {
      resolve(null);
      return;
    }
    if (rec.state === "inactive") {
      const blob = practiceState.recChunks.length
        ? new Blob(practiceState.recChunks, { type: practiceState.recMime || "video/webm" })
        : null;
      resolve(blob);
      return;
    }
    rec.onstop = () => {
      const blob = practiceState.recChunks.length
        ? new Blob(practiceState.recChunks, { type: practiceState.recMime || "video/webm" })
        : null;
      resolve(blob);
    };
    try {
      rec.requestData?.();
    } catch (_) {}
    try {
      rec.stop();
    } catch (_) {
      resolve(null);
    }
  });
}

// Aborta cualquier grabación en curso sin construir blob (al salir/entrar bucle).
function abortRecording() {
  const rec = practiceState.recorder;
  if (rec && rec.state !== "inactive") {
    rec.ondataavailable = null;
    rec.onstop = null;
    try { rec.stop(); } catch (_) {}
  }
  practiceState.recorder = null;
  practiceState.recStream = null;
  practiceState.recChunks = [];
  practiceState.recording = false;
}

function loop() {
  if (!practiceState.running) return;
  const ref = $$.ref;
  const cam = $$.cam;
  const choreo = practiceState.choreo;

  if (practiceState.loop) {
    // Modo bucle: al llegar al final del tramo, cerramos la repetición y
    // volvemos al inicio en vez de terminar.
    if (ref.ended || ref.currentTime >= practiceState.loop.end) {
      const thisScore = practiceState.loopN
        ? Math.round(practiceState.loopSum / practiceState.loopN)
        : 0;
      practiceState.loopCount += 1;
      if (thisScore > practiceState.loopBest) practiceState.loopBest = thisScore;
      practiceState.loopSum = 0;
      practiceState.loopN = 0;
      practiceState.refIdx = 0;
      updateLoopBar(thisScore);
      try {
        ref.currentTime = practiceState.loop.start;
        if (ref.paused) ref.play();
      } catch (_) {}
      practiceState.raf = requestAnimationFrame(loop);
      return;
    }
  } else if (ref.paused || ref.ended) {
    finishPractice();
    return;
  }

  let live = null;
  try {
    const res = landmarker.detectForVideo(cam, performance.now());
    if (res && res.landmarks && res.landmarks[0]) live = res.landmarks[0];
  } catch (err) {
    // Ignorar frames sueltos que fallen.
  }

  const now = performance.now();
  const canUpdateText = now - practiceState.lastText > 333; // ~3/s

  if (!live) {
    drawSkeleton(null, choreo.accent);
    if (practiceState.recording && !practiceState.loop) {
      drawRecordFrame(null, "state-idle", "gray", "No te veo 👀");
    }
    if (canUpdateText) {
      setFeedback("state-idle", "gray", "No te veo 👀", "acomódate para salir completa en cámara");
      practiceState.lastText = now;
    }
    practiceState.raf = requestAnimationFrame(loop);
    return;
  }

  drawSkeleton(live, choreo.accent);

  // Features en vivo (directas y espejadas) UNA sola vez por frame; así la
  // ventana de ritmo no recalcula el espejo 12+ veces.
  const featuresLive = computeFeatures(live);
  const featuresLiveMirror = computeFeatures(mirrorLandmarks(live));
  const t = ref.currentTime;
  const poses = choreo.poses;

  const { pose: nearest } = nearestPose(poses, t);
  const onTime = bestOfMirror(
    featuresLive,
    featuresLiveMirror,
    nearest ? nearest.angles : null
  );

  // ---- Ritmo: mejor calce en ventana ±0.4s ----
  let best = onTime;
  let bestT = t;
  for (let i = 0; i < poses.length; i++) {
    const p = poses[i];
    if (Math.abs(p.t - t) > 0.4) continue;
    const cmp = bestOfMirror(featuresLive, featuresLiveMirror, p.angles);
    if (cmp.score > best.score) {
      best = cmp;
      bestT = p.t;
    }
  }
  const offset = bestT - t; // >0 adelantada, <0 tarde

  // ---- Decisión de estado (cada frame, para acumular y para el texto) ----
  const worstLabel =
    onTime.worstIndex != null ? FEATURES[onTime.worstIndex].label : null;

  let state, lightClass, mainText, subText;
  if (best.score < 45) {
    state = "state-wrong";
    lightClass = "red";
    mainText = worstLabel ? `Revisá ${worstLabel}` : "Revisá la postura";
    subText = "el movimiento no coincide";
  } else if (Math.abs(offset) > 0.13) {
    state = "state-timing";
    lightClass = "yellow";
    mainText = offset > 0 ? "Vas adelantada ⏩" : "Vas tarde ⏪";
    subText = "ajustá al ritmo de la música";
  } else if (onTime.score >= 65) {
    state = "state-good";
    lightClass = "green";
    mainText = "¡Muy bien! 🔥";
    subText = "seguí así";
  } else {
    state = "state-wrong";
    lightClass = "red";
    mainText = worstLabel ? `Revisá ${worstLabel}` : "Revisá la postura";
    subText = "acomodá la postura";
  }

  if (practiceState.recording && !practiceState.loop) {
    drawRecordFrame(live, state, lightClass, mainText);
  }

  if (canUpdateText) {
    setFeedback(state, lightClass, mainText, subText);
    practiceState.lastText = now;
  }

  // ---- Score suavizado (cada frame) ----
  practiceState.disp = practiceState.disp * 0.8 + onTime.score * 0.2;
  if ($$.scoreNum) $$.scoreNum.textContent = String(Math.round(practiceState.disp));

  // ---- Acumular el puntaje de la repetición en curso (modo bucle) ----
  if (practiceState.loop) {
    practiceState.loopSum += onTime.score;
    practiceState.loopN += 1;
  }

  // ---- Acumular por segundo (para el resumen) ----
  const sec = Math.floor(t);
  let bucket = practiceState.buckets[sec];
  if (!bucket) {
    bucket = practiceState.buckets[sec] = { sum: 0, n: 0, late: 0, early: 0, jointBad: {} };
  }
  bucket.sum += onTime.score;
  bucket.n += 1;
  if (state === "state-timing") {
    if (offset < 0) bucket.late += 1;
    else if (offset > 0) bucket.early += 1;
  } else if (state === "state-wrong" && onTime.worstIndex != null) {
    bucket.jointBad[onTime.worstIndex] = (bucket.jointBad[onTime.worstIndex] || 0) + 1;
  }

  practiceState.raf = requestAnimationFrame(loop);
}

async function finishPractice() {
  if (practiceState.raf) cancelAnimationFrame(practiceState.raf);
  practiceState.raf = null;
  practiceState.running = false;

  const ref = $$.ref;
  ref.pause();

  // Detener la grabación y obtener el blob ANTES de apagar la cámara (así el
  // último frame del canvas stream no queda congelado prematuramente).
  let recBlob = null;
  if (practiceState.recording || practiceState.recorder) {
    try {
      recBlob = await stopRecordingAndBuild();
    } catch (err) {
      console.warn("No se pudo cerrar la grabación:", err);
    }
  }

  // Apagar cámara.
  stopCamera();

  // Rellenar la sección "Tu intento" si hubo grabación.
  showReview(recBlob);
  // Si se pidió grabar pero no salió video, avisar (en vez de fallar en silencio).
  if (practiceState.recEnabled && !recBlob) {
    toast("No se pudo grabar el intento en este navegador.");
  }

  const choreo = practiceState.choreo;
  const buckets = practiceState.buckets;

  // Promedios por segundo.
  const secKeys = Object.keys(buckets).map(Number).sort((a, b) => a - b);
  const perSec = secKeys.map((s) => ({
    sec: s,
    avg: buckets[s].n ? buckets[s].sum / buckets[s].n : 0,
  }));

  const avg =
    perSec.length > 0
      ? Math.round(perSec.reduce((acc, x) => acc + x.avg, 0) / perSec.length)
      : 0;

  if ($("sum-avg")) $("sum-avg").textContent = `${avg}%`;

  // Actualizar mejor marca (solo si hubo datos reales de la práctica).
  if (choreo && perSec.length > 0 && avg > (choreo.bestScore ?? -1)) {
    choreo.bestScore = avg;
    try {
      await putChoreo(choreo);
    } catch (err) {
      console.warn("No se pudo guardar la mejor marca:", err);
    }
  }
  const best = choreo ? choreo.bestScore ?? avg : avg;
  if ($("sum-best")) $("sum-best").textContent = `${best}%`;

  // Sugerencia.
  const hint = $("sum-hint");
  if (hint) {
    if (avg > 80) hint.textContent = "¡Excelente! La tenés dominada.";
    else if (avg >= 60) hint.textContent = "Vas muy bien, pulí los detalles.";
    else hint.textContent = "Seguí practicando, vas por buen camino.";
  }

  // Tramos flojos (avg < 60), fusionando segundos consecutivos.
  const tough = $("tough-list");
  if (tough) {
    tough.innerHTML = "";
    const weak = perSec.filter((x) => x.avg < 60).map((x) => x.sec);
    const ranges = [];
    for (const s of weak) {
      const last = ranges[ranges.length - 1];
      if (last && s === last.end + 1) last.end = s;
      else ranges.push({ start: s, end: s });
    }
    if (ranges.length === 0) {
      const li = document.createElement("li");
      li.textContent = "¡Ningún tramo flojo, felicitaciones! 🎉";
      tough.appendChild(li);
    } else {
      for (const r of ranges.slice(0, 6)) {
        // Agrega los contadores de todos los segundos del tramo.
        let late = 0;
        let early = 0;
        const jointAgg = {};
        for (let s = r.start; s <= r.end; s++) {
          const b = buckets[s];
          if (!b) continue;
          late += b.late || 0;
          early += b.early || 0;
          for (const k in b.jointBad || {}) {
            jointAgg[k] = (jointAgg[k] || 0) + b.jointBad[k];
          }
        }
        const timingTotal = late + early;
        let jointTotal = 0;
        let topIdx = null;
        let topCount = -1;
        for (const k in jointAgg) {
          jointTotal += jointAgg[k];
          if (jointAgg[k] > topCount) {
            topCount = jointAgg[k];
            topIdx = Number(k);
          }
        }

        // Problema dominante del tramo.
        let fix;
        if (timingTotal > jointTotal) {
          fix = late >= early ? "vas tarde" : "vas adelantada";
        } else if (jointTotal > timingTotal && topIdx != null && FEATURES[topIdx]) {
          fix = `revisá ${FEATURES[topIdx].label}`;
        } else {
          fix = "afiná este tramo"; // empate o sin datos claros
        }

        const timeTxt =
          r.start === r.end
            ? `en el ${fmtTime(r.start)}`
            : `${fmtTime(r.start)} – ${fmtTime(r.end + 1)}`;

        const li = document.createElement("li");
        li.innerHTML =
          `<span class="tough-time">${timeTxt}</span>` +
          `<span class="tough-sep">·</span>` +
          `<span class="tough-fix">${escapeHtml(fix)}</span>`;
        // Botón para practicar ese tramo en bucle.
        const rep = document.createElement("button");
        rep.type = "button";
        rep.className = "tough-repeat";
        rep.textContent = "🔁 Repetir";
        const loopStart = r.start;
        const loopEnd = r.end + 1; // el tramo mostrado llega hasta end+1
        rep.addEventListener("click", () => startLoop(loopStart, loopEnd));
        li.appendChild(rep);
        tough.appendChild(li);
      }
    }
  }

  $$.summary?.classList.remove("hidden");
  if ($$.startBtn) $$.startBtn.disabled = false;
  if ($$.stopBtn) $$.stopBtn.disabled = true;
}

function stopCamera() {
  if (practiceState.camStream) {
    practiceState.camStream.getTracks().forEach((tr) => tr.stop());
    practiceState.camStream = null;
  }
  const cam = $$.cam;
  if (cam && cam.srcObject) cam.srcObject = null;
}

// Apagado total (al salir de la vista práctica).
function stopPracticeHard() {
  if (practiceState.raf) cancelAnimationFrame(practiceState.raf);
  practiceState.raf = null;
  practiceState.running = false;
  practiceState.loop = null;
  const ref = $$.ref;
  if (ref) {
    ref.pause();
    ref.removeAttribute("src");
    ref.load();
  }
  if (practiceState.refUrl) {
    URL.revokeObjectURL(practiceState.refUrl);
    practiceState.refUrl = null;
  }
  stopCamera();
  abortRecording();
  hideReview();
  hideLoopBar();
  const cd = $$.countdown;
  if (cd) cd.classList.add("hidden");
}

// =========================================================
// Arranque
// =========================================================
function boot() {
  wireNav();
  wireAdd();
  wirePractice();
  showView("library");
  initLandmarker();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot);
} else {
  boot();
}
