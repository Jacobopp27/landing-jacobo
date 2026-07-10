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

// seekTo: coloca el video en t y resuelve cuando el frame está disponible.
function seekTo(video, t) {
  return new Promise((resolve) => {
    const onSeeked = () => {
      video.removeEventListener("seeked", onSeeked);
      resolve();
    };
    video.addEventListener("seeked", onSeeked);
    // Clamp para no pasarse del final.
    video.currentTime = Math.min(t, Math.max(0, (video.duration || 0) - 0.001));
  });
}

function whenMetadata(video) {
  return new Promise((resolve) => {
    if (video.readyState >= 1 && video.duration && isFinite(video.duration)) {
      resolve();
    } else {
      const on = () => {
        video.removeEventListener("loadedmetadata", on);
        resolve();
      };
      video.addEventListener("loadedmetadata", on);
    }
  });
}

// Analiza el video muestreando ~15 fps. Devuelve { poses, duration, thumb }.
async function analyzeVideo(videoEl, onProgress) {
  await setMode("IMAGE");
  await whenMetadata(videoEl);
  const duration = videoEl.duration;
  if (!duration || !isFinite(duration)) throw new Error("Duración inválida");

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

async function startPractice(choreo) {
  practiceState.choreo = choreo;
  showView("practice");
  if ($$.title) $$.title.textContent = choreo.name || "Coreografía";
  $$.summary?.classList.add("hidden");
  resetFeedbackIdle();

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
    return;
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

  // Estado de botones.
  if ($$.startBtn) $$.startBtn.disabled = false;
  if ($$.stopBtn) $$.stopBtn.disabled = true;
}

function wirePractice() {
  $$.startBtn?.addEventListener("click", onStartClick);
  $$.stopBtn?.addEventListener("click", () => finishPractice());
  wireSpeed();
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
  const cd = $$.countdown;
  if ($$.startBtn) $$.startBtn.disabled = true;
  $$.summary?.classList.add("hidden");

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

  practiceState.running = true;
  if ($$.stopBtn) $$.stopBtn.disabled = false;
  practiceState.raf = requestAnimationFrame(loop);
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

function loop() {
  if (!practiceState.running) return;
  const ref = $$.ref;
  const cam = $$.cam;
  const choreo = practiceState.choreo;

  if (ref.paused || ref.ended) {
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

  if (canUpdateText) {
    setFeedback(state, lightClass, mainText, subText);
    practiceState.lastText = now;
  }

  // ---- Score suavizado (cada frame) ----
  practiceState.disp = practiceState.disp * 0.8 + onTime.score * 0.2;
  if ($$.scoreNum) $$.scoreNum.textContent = String(Math.round(practiceState.disp));

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

  // Apagar cámara.
  stopCamera();

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
