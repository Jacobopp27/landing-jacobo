import { Badge } from './ui.jsx'
import { classifyDate, formatFechaRelativa } from '../utils/dates.js'
import { exportAgendaItems } from '../calendar/ics.js'

// ¿El item ya está "resuelto" (no debe aparecer como vencido)?
export function isDone(item) {
  return item.kind === 'cita'
    ? item.estado === 'atendida' || item.estado === 'cancelada'
    : item.estado === 'hecho'
}

// Fila de un item de la Agenda (cita o recordatorio). Reutilizada por la vista
// de lista y por la vista de calendario.
export function AgendaRow({ item, onToggle, onOpenPatient }) {
  const esCita = item.kind === 'cita'
  const done = isDone(item)
  const cls = classifyDate(item.fecha)
  const tone = done ? 'emerald' : cls === 'vencido' ? 'red' : cls === 'hoy' ? 'amber' : 'slate'
  const cancelada = esCita && item.estado === 'cancelada'

  return (
    <li className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3">
      {esCita ? (
        <button
          onClick={onToggle}
          title={done ? 'Marcar como programada' : 'Marcar como atendida'}
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border-2 transition-colors ${
            item.estado === 'atendida'
              ? 'border-emerald-500 bg-emerald-500 text-white'
              : cancelada
              ? 'border-slate-200 bg-slate-100 text-slate-400'
              : 'border-brand-200 bg-brand-50 text-brand-600 hover:border-brand-400'
          }`}
        >
          {item.estado === 'atendida' ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <path d="M20 6 9 17l-5-5" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" />
            </svg>
          )}
        </button>
      ) : (
        <button
          onClick={onToggle}
          title={done ? 'Marcar como pendiente' : 'Marcar como hecho'}
          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
            done
              ? 'border-emerald-500 bg-emerald-500 text-white'
              : 'border-slate-300 hover:border-brand-500'
          }`}
        >
          {done && (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <path d="M20 6 9 17l-5-5" />
            </svg>
          )}
        </button>
      )}

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <button
            onClick={onOpenPatient}
            className="truncate text-sm font-medium text-slate-800 hover:text-brand-700 hover:underline"
          >
            {item.patientName}
          </button>
          {esCita ? <Badge tone="brand">Cita</Badge> : <Badge tone="violet">Follow-up</Badge>}
          {cancelada && <Badge tone="slate">Cancelada</Badge>}
        </div>
        <p className={`truncate text-sm ${done ? 'text-slate-400 line-through' : 'text-slate-500'}`}>
          {item.motivo}
          {esCita && item.duracion ? ` · ${item.duracion} min` : ''}
        </p>
      </div>

      <button
        onClick={() => exportAgendaItems([item])}
        title="Añadir al calendario del teléfono"
        className="shrink-0 rounded-lg p-1.5 text-slate-400 hover:bg-brand-50 hover:text-brand-600"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" />
          <path d="M12 14v4M10 16h4" />
        </svg>
      </button>
      <Badge tone={tone}>
        {formatFechaRelativa(item.fecha)}
        {item.hora ? ` · ${item.hora}` : ''}
      </Badge>
    </li>
  )
}
