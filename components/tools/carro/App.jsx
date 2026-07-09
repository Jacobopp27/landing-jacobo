import { useEffect, useMemo, useState } from "react";
import "leaflet/dist/leaflet.css";
import "./App.css";
import MapPanel from "./components/MapPanel";
import { EV_CARS, GAS_CARS } from "./lib/cars";
import { routeDistanceKm } from "./lib/routing";
import { geocode } from "./lib/geocode";
import {
  DEFAULTS,
  routeKmPerMonth,
  totalKmPerMonth,
  compare,
  cumulativeSeries,
  fmtCOP,
} from "./lib/calc";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, CartesianGrid,
} from "recharts";

const EMOJIS = ["🏢", "🎓", "🛒", "🏖️", "🏋️", "👪"];
let nextId = 1;

// ---- Buscador de direcciones (geocoder) ----
function AddressSearch({ placeholder, onPick }) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (q.trim().length < 3) { setResults([]); return; }
    setLoading(true);
    const t = setTimeout(async () => {
      const r = await geocode(q);
      setResults(r);
      setOpen(true);
      setLoading(false);
    }, 450);
    return () => clearTimeout(t);
  }, [q]);

  return (
    <div className="addr">
      <input
        placeholder={placeholder}
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onFocus={() => results.length && setOpen(true)}
      />
      {loading && <span className="addr-spin">…</span>}
      {open && results.length > 0 && (
        <ul className="addr-list">
          {results.map((r, i) => (
            <li key={i} onClick={() => { onPick(r); setOpen(false); setQ(""); setResults([]); }}>
              {r.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function App() {
  const [routes, setRoutes] = useState([]);
  const [draft, setDraft] = useState({ origin: null, dest: null });
  const [adding, setAdding] = useState(false);
  const [busy, setBusy] = useState(false);

  const [evCar, setEvCar] = useState(EV_CARS[0]);
  const [gasCar, setGasCar] = useState(GAS_CARS[0]);
  const [cfg, setCfg] = useState(DEFAULTS);

  // clic en el mapa: llena origen y luego destino
  function handleMapClick(pt) {
    if (!adding) return;
    const point = { ...pt, label: `📍 ${pt.lat.toFixed(4)}, ${pt.lng.toFixed(4)}` };
    setDraft((d) => (!d.origin ? { ...d, origin: point } : !d.dest ? { ...d, dest: point } : d));
  }

  async function createRoute() {
    if (!draft.origin || !draft.dest) return;
    setBusy(true);
    const { km, coords } = await routeDistanceKm(draft.origin, draft.dest);
    const idx = routes.length;
    setRoutes((r) => [
      ...r,
      {
        id: nextId++,
        name: draft.dest.label?.replace("📍 ", "").split(",")[0] || "Ruta " + (idx + 1),
        emoji: EMOJIS[idx % EMOJIS.length],
        origin: draft.origin,
        dest: draft.dest,
        coords,
        distanceKm: km,
        times: 5,
        period: "semana",
        roundTrip: true,
        active: true,
      },
    ]);
    setDraft({ origin: null, dest: null });
    setAdding(false);
    setBusy(false);
  }

  function startAdding() {
    setAdding((a) => !a);
    setDraft({ origin: null, dest: null });
  }

  function updateRoute(id, patch) {
    setRoutes((r) => r.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  }
  function removeRoute(id) {
    setRoutes((r) => r.filter((x) => x.id !== id));
  }

  const kmMonth = useMemo(() => totalKmPerMonth(routes), [routes]);
  const result = useMemo(() => compare(kmMonth, evCar, gasCar, cfg), [kmMonth, evCar, gasCar, cfg]);
  const series = useMemo(
    () => cumulativeSeries(evCar, gasCar, result.ev.cost, result.gas.cost),
    [evCar, gasCar, result]
  );

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">⚡ ¿Eléctrico o Gasolina? <span>· Medellín</span></div>
        <div className="km-badge">
          <strong>{kmMonth.toFixed(0)}</strong> km / mes
        </div>
      </header>

      <div className="layout">
        {/* ---------- IZQUIERDA: MAPA + RUTAS ---------- */}
        <section className="left">
          <div className="map-wrap">
            <MapPanel routes={routes} draft={draft} onMapClick={handleMapClick} />
            {adding && (
              <div className="map-hint">
                {!draft.origin ? "📍 Busca o haz clic en tu PARTIDA" : !draft.dest ? "🏁 Ahora el DESTINO" : "✓ Listo, crea la ruta"}
              </div>
            )}
          </div>

          <div className="routes">
            <div className="routes-head">
              <h3>Rutas frecuentes</h3>
              <button className={"btn-add" + (adding ? " active" : "")} onClick={startAdding}>
                {adding ? "Cancelar" : "➕ Nueva ruta"}
              </button>
            </div>

            {/* ---- editor de ruta nueva ---- */}
            {adding && (
              <div className="draft">
                <div className="draft-field">
                  <span className="dot a">A</span>
                  {draft.origin ? (
                    <span className="chip">
                      {draft.origin.label}
                      <button onClick={() => setDraft((d) => ({ ...d, origin: null }))}>✕</button>
                    </span>
                  ) : (
                    <AddressSearch placeholder="Buscar dirección de partida…" onPick={(p) => setDraft((d) => ({ ...d, origin: p }))} />
                  )}
                </div>
                <div className="draft-field">
                  <span className="dot b">B</span>
                  {draft.dest ? (
                    <span className="chip">
                      {draft.dest.label}
                      <button onClick={() => setDraft((d) => ({ ...d, dest: null }))}>✕</button>
                    </span>
                  ) : (
                    <AddressSearch placeholder="Buscar dirección de destino…" onPick={(p) => setDraft((d) => ({ ...d, dest: p }))} />
                  )}
                </div>
                <div className="draft-actions">
                  <small>Puedes buscar la dirección o hacer clic en el mapa</small>
                  <button className="btn-create" disabled={!draft.origin || !draft.dest || busy} onClick={createRoute}>
                    {busy ? "Calculando…" : "Crear ruta"}
                  </button>
                </div>
              </div>
            )}

            {routes.length === 0 && !adding && (
              <p className="empty">Aún no hay rutas. Pulsa <b>Nueva ruta</b> y busca o marca casa y destino.</p>
            )}

            {routes.map((r) => (
              <div className={"route-card" + (r.active ? "" : " off")} key={r.id}>
                <input className="r-emoji" value={r.emoji} onChange={(e) => updateRoute(r.id, { emoji: e.target.value })} />
                <div className="r-body">
                  <input className="r-name" value={r.name} onChange={(e) => updateRoute(r.id, { name: e.target.value })} />
                  <div className="r-controls">
                    <input type="number" min="1" className="r-times" value={r.times}
                      onChange={(e) => updateRoute(r.id, { times: +e.target.value })} />
                    <span>veces por</span>
                    <select value={r.period} onChange={(e) => updateRoute(r.id, { period: e.target.value })}>
                      <option value="semana">semana</option>
                      <option value="mes">mes</option>
                    </select>
                    <label className="r-round">
                      <input type="checkbox" checked={r.roundTrip}
                        onChange={(e) => updateRoute(r.id, { roundTrip: e.target.checked })} />
                      ida y vuelta
                    </label>
                  </div>
                  <div className="r-meta">
                    {r.distanceKm} km/trayecto · <b>{routeKmPerMonth(r).toFixed(0)} km/mes</b>
                  </div>
                </div>
                <div className="r-actions">
                  <button title="Activar/Desactivar" onClick={() => updateRoute(r.id, { active: !r.active })}>
                    {r.active ? "👁️" : "🚫"}
                  </button>
                  <button title="Eliminar" onClick={() => removeRoute(r.id)}>🗑️</button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ---------- DERECHA: COMPARADOR + RESULTADOS ---------- */}
        <section className="right">
          <div className="cars">
            <div className="car-pick ev">
              <label>🔋 Eléctrico</label>
              <select value={evCar.id} onChange={(e) => setEvCar(EV_CARS.find((c) => c.id === e.target.value))}>
                {EV_CARS.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <div className="car-spec">{evCar.kwhPerKm} kWh/km · {fmtCOP(evCar.priceCOP)}</div>
            </div>
            <div className="vs">VS</div>
            <div className="car-pick gas">
              <label>⛽ Gasolina</label>
              <select value={gasCar.id} onChange={(e) => setGasCar(GAS_CARS.find((c) => c.id === e.target.value))}>
                {GAS_CARS.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <div className="car-spec">{gasCar.kmPerLiter} km/L · {fmtCOP(gasCar.priceCOP)}</div>
            </div>
          </div>

          <div className="hero-result">
            <div className="hero-label">Ahorras al mes</div>
            <div className={"hero-num" + (result.monthlySaving < 0 ? " neg" : "")}>
              {fmtCOP(result.monthlySaving)}
            </div>
            <div className="hero-sub">
              ⛽ {fmtCOP(result.gas.cost)} &nbsp;vs&nbsp; 🔋 {fmtCOP(result.ev.cost)} por mes
            </div>
          </div>

          <div className="cards">
            <div className="stat">
              <div className="stat-num">{isFinite(result.breakEvenYears) ? result.breakEvenYears.toFixed(1) : "∞"}</div>
              <div className="stat-lbl">años para recuperar el sobrecosto</div>
            </div>
            <div className="stat">
              <div className="stat-num">{result.co2SavedMonth.toFixed(1)} kg</div>
              <div className="stat-lbl">CO₂ evitado al mes</div>
            </div>
            <div className="stat">
              <div className="stat-num">🌳 {result.treesPerYear.toFixed(1)}</div>
              <div className="stat-lbl">árboles/año equivalentes</div>
            </div>
          </div>

          <div className="chart-box">
            <h4>Punto de equilibrio (costo acumulado)</h4>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={series} margin={{ left: 10, right: 10, top: 10 }}>
                <CartesianGrid stroke="#1e293b" />
                <XAxis dataKey="mes" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                <YAxis tick={{ fill: "#94a3b8", fontSize: 10 }} tickFormatter={(v) => (v / 1e6).toFixed(0) + "M"} />
                <Tooltip formatter={(v) => fmtCOP(v)} contentStyle={{ background: "#0b1020", border: "1px solid #1e293b" }} />
                {isFinite(result.breakEvenMonths) && (
                  <ReferenceLine x={Math.round(result.breakEvenMonths / 2) * 2} stroke="#22d3ee" strokeDasharray="4 4" />
                )}
                <Line type="monotone" dataKey="Eléctrico" stroke="#22d3ee" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="Gasolina" stroke="#f472b6" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <details className="physics">
            <summary>🔬 La física detrás (energía por km)</summary>
            <div className="phys-grid">
              <div>
                <b>Eléctrico</b>
                <p>{result.physics.evMJperKm.toFixed(2)} MJ/km consumidos</p>
                <p>~{(cfg.effElectric * 100).toFixed(0)}% se convierte en movimiento</p>
              </div>
              <div>
                <b>Gasolina</b>
                <p>{result.physics.gasMJperKm.toFixed(2)} MJ/km consumidos</p>
                <p>~{(cfg.effGasoline * 100).toFixed(0)}% se convierte en movimiento (el resto es calor)</p>
              </div>
            </div>
            <div className="cfg">
              <label>Gasolina $/gal
                <input type="number" value={cfg.gasPricePerGallon}
                  onChange={(e) => setCfg({ ...cfg, gasPricePerGallon: +e.target.value })} />
              </label>
              <label>Energía $/kWh
                <input type="number" value={cfg.kwhPrice}
                  onChange={(e) => setCfg({ ...cfg, kwhPrice: +e.target.value })} />
              </label>
            </div>
          </details>
        </section>
      </div>
    </div>
  );
}
