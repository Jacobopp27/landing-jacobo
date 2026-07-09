import { useMemo, useState } from 'react'
import { Badge, EmptyState, Button } from './ui.jsx'
import { classifyDate } from '../utils/dates.js'
import { exportAgendaItems } from '../calendar/ics.js'
import { AgendaRow, isDone } from './AgendaRow.jsx'
import CalendarView from './CalendarView.jsx'

// Agenda: citas + recordatorios. Dos vistas (lista / calendario) y filtro por
// tipo (Todo / Citas / Follow-ups). Recibe una lista UNIFICADA de items ya
// enriquecidos con patientName y un campo `kind`.
const SECTIONS = [
  { key: 'vencido', title: 'Vencidos', tone: 'red' },
  { key: 'hoy', title: 'Hoy', tone: 'amber' },
  { key: 'semana', title: 'Esta semana', tone: 'blue' },
  { key: 'proximo', title: 'Próximos', tone: 'slate' },
]

const FILTERS = [
  { key: 'todo', label: 'Todo' },
  { key: 'citas', label: 'Citas' },
  { key: 'recordatorios', label: 'Follow-ups' },
]

export default function Agenda({
  items,
  loading,
  onlyPending,
  onToggleOnlyPending,
  onToggleItem,
  onOpenPatient,
}) {
  const [filter, setFilter] = useState('todo')
  const [view, setView] = useState('lista') // 'lista' | 'calendario'

  // Filtrado común a ambas vistas.
  const visible = useMemo(() => {
    let vis = items
    if (filter === 'citas') vis = vis.filter((i) => i.kind === 'cita')
    if (filter === 'recordatorios') vis = vis.filter((i) => i.kind === 'recordatorio')
    if (onlyPending) vis = vis.filter((i) => !isDone(i))
    return vis
  }, [items, filter, onlyPending])

  // Agrupado por secciones (solo para la vista de lista).
  const grouped = useMemo(() => {
    const g = { vencido: [], hoy: [], semana: [], proximo: [] }
    for (const it of visible) {
      let cls = classifyDate(it.fecha)
      if (isDone(it) && cls === 'vencido') cls = 'proximo'
      g[cls].push(it)
    }
    return g
  }, [visible])

  const total = visible.length

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-800">Agenda</h2>
        {/* Toggle Lista / Calendario */}
        <div className="flex gap-1 rounded-lg bg-slate-100 p-1">
          <ViewButton active={view === 'lista'} onClick={() => setView('lista')} label="Lista">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
            </svg>
          </ViewButton>
          <ViewButton active={view === 'calendario'} onClick={() => setView('calendario')} label="Calendario">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" />
            </svg>
          </ViewButton>
        </div>
      </div>

      {/* Filtro por tipo */}
      <div className="flex gap-1 rounded-xl bg-slate-100 p-1">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`flex-1 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              filter === f.key
                ? 'bg-white text-brand-700 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between gap-2">
        <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-600">
          <input
            type="checkbox"
            checked={onlyPending}
            onChange={onToggleOnlyPending}
            className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
          />
          Solo pendientes
        </label>
        {!loading && total > 0 && (
          <Button variant="secondary" size="sm" onClick={() => exportAgendaItems(visible)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" />
              <path d="M12 14v4M10 16h4" />
            </svg>
            Añadir todo ({total})
          </Button>
        )}
      </div>

      {loading ? (
        <p className="py-8 text-center text-sm text-slate-400">Cargando…</p>
      ) : view === 'calendario' ? (
        <CalendarView items={visible} onToggleItem={onToggleItem} onOpenPatient={onOpenPatient} />
      ) : total === 0 ? (
        <EmptyState
          title={onlyPending ? 'Nada pendiente' : 'Sin nada agendado'}
          subtitle={
            onlyPending
              ? '¡Al día! No tienes citas ni follow-ups pendientes.'
              : 'Agenda citas o crea recordatorios desde la ficha de un paciente.'
          }
        />
      ) : (
        <div className="space-y-5">
          {SECTIONS.map((s) => {
            const list = grouped[s.key]
            if (list.length === 0) return null
            return (
              <section key={s.key}>
                <div className="mb-2 flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-slate-700">{s.title}</h3>
                  <Badge tone={s.tone}>{list.length}</Badge>
                </div>
                <ul className="space-y-2">
                  {list.map((it) => (
                    <AgendaRow
                      key={`${it.kind}-${it.id}`}
                      item={it}
                      onToggle={() => onToggleItem(it)}
                      onOpenPatient={() => onOpenPatient(it.patientId)}
                    />
                  ))}
                </ul>
              </section>
            )
          })}
        </div>
      )}
    </div>
  )
}

function ViewButton({ active, onClick, label, children }) {
  return (
    <button
      onClick={onClick}
      title={label}
      className={`flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors ${
        active ? 'bg-white text-brand-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
      }`}
    >
      {children}
      <span className="hidden sm:inline">{label}</span>
    </button>
  )
}
