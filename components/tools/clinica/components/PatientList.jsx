import { useMemo, useState } from 'react'
import { Button, Input, Badge, EmptyState } from './ui.jsx'

// Lista de pacientes con búsqueda por nombre. Muestra nombre, teléfono y la
// condición resumida. Delega alta/edición/eliminación al padre (App).
export default function PatientList({ patients, onOpen, onNew, loading }) {
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return patients
    return patients.filter(
      (p) =>
        p.nombre.toLowerCase().includes(q) ||
        (p.telefono || '').toLowerCase().includes(q)
    )
  }, [patients, query])

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <svg
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar paciente…"
            className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm shadow-sm placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>
        <Button onClick={onNew} className="shrink-0">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12h14" />
          </svg>
          <span className="hidden sm:inline">Nuevo</span>
        </Button>
      </div>

      {loading ? (
        <p className="py-8 text-center text-sm text-slate-400">Cargando…</p>
      ) : filtered.length === 0 ? (
        <EmptyState
          title={query ? 'Sin resultados' : 'Aún no hay pacientes'}
          subtitle={
            query ? 'Prueba con otro nombre.' : 'Agrega tu primer paciente para empezar.'
          }
          action={!query && <Button onClick={onNew}>Agregar paciente</Button>}
        />
      ) : (
        <ul className="space-y-2">
          {filtered.map((p) => (
            <li key={p.id}>
              <button
                onClick={() => onOpen(p.id)}
                className="flex w-full items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 text-left transition-colors hover:border-brand-300 hover:bg-brand-50/40"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-100 font-semibold text-brand-700">
                  {initials(p.nombre)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-slate-800">{p.nombre}</p>
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500">
                    {p.telefono && <span>{p.telefono}</span>}
                    {p.condicion && (
                      <>
                        {p.telefono && <span className="text-slate-300">·</span>}
                        <span className="truncate">{p.condicion}</span>
                      </>
                    )}
                    {!p.telefono && !p.condicion && (
                      <span className="text-slate-400">Sin datos adicionales</span>
                    )}
                  </div>
                </div>
                <svg className="shrink-0 text-slate-300" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </button>
            </li>
          ))}
        </ul>
      )}

      {!loading && filtered.length > 0 && (
        <p className="text-center text-xs text-slate-400">
          {filtered.length} {filtered.length === 1 ? 'paciente' : 'pacientes'}
        </p>
      )}
    </div>
  )
}

function initials(name) {
  const parts = (name || '').trim().split(/\s+/).slice(0, 2)
  return parts.map((p) => p[0]?.toUpperCase() || '').join('') || '?'
}
