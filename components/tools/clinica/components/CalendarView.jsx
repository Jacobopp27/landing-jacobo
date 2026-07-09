import { useMemo, useState } from 'react'
import { AgendaRow, isDone } from './AgendaRow.jsx'
import { EmptyState } from './ui.jsx'
import {
  WEEKDAYS,
  monthMatrix,
  monthLabel,
  shiftMonth,
  todayParts,
  todayStr,
  formatFecha,
} from '../utils/dates.js'

// Vista de calendario mensual: cuadrícula con puntos por día. Al tocar un día
// se muestran sus items (citas + recordatorios) debajo. Recibe la lista ya
// filtrada (`items`) desde la Agenda.
export default function CalendarView({ items, onToggleItem, onOpenPatient }) {
  const t = todayParts()
  const hoy = todayStr()
  const [cur, setCur] = useState({ year: t.year, month: t.month })
  const [selected, setSelected] = useState(hoy)

  // Oculta semanas que quedan totalmente fuera del mes (p. ej. la 6ª fila).
  const weeks = useMemo(
    () => monthMatrix(cur.year, cur.month).filter((w) => w.some((c) => c.inMonth)),
    [cur]
  )

  // Agrupa los items por fecha para pintar los días.
  const byDate = useMemo(() => {
    const map = {}
    for (const it of items) {
      ;(map[it.fecha] = map[it.fecha] || []).push(it)
    }
    return map
  }, [items])

  const selectedItems = byDate[selected] || []

  function goToday() {
    setCur({ year: t.year, month: t.month })
    setSelected(hoy)
  }

  return (
    <div className="space-y-4">
      {/* Navegación de mes */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setCur(shiftMonth(cur.year, cur.month, -1))}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
          aria-label="Mes anterior"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-slate-700">
            {monthLabel(cur.year, cur.month)}
          </h3>
          <button
            onClick={goToday}
            className="rounded-full border border-slate-200 px-2 py-0.5 text-xs font-medium text-brand-700 hover:bg-brand-50"
          >
            Hoy
          </button>
        </div>
        <button
          onClick={() => setCur(shiftMonth(cur.year, cur.month, 1))}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
          aria-label="Mes siguiente"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="m9 18 6-6-6-6" />
          </svg>
        </button>
      </div>

      {/* Cuadrícula */}
      <div className="rounded-2xl border border-slate-200 bg-white p-2">
        <div className="grid grid-cols-7">
          {WEEKDAYS.map((d) => (
            <div key={d} className="py-1 text-center text-xs font-medium text-slate-400">
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {weeks.flat().map((cell) => {
            const dayItems = byDate[cell.fecha] || []
            const isSelected = cell.fecha === selected
            return (
              <button
                key={cell.fecha}
                onClick={() => setSelected(cell.fecha)}
                className={`flex h-12 flex-col items-center gap-0.5 rounded-lg p-1 transition-colors sm:h-16 ${
                  isSelected
                    ? 'bg-brand-100 ring-1 ring-brand-400'
                    : 'hover:bg-slate-50'
                }`}
              >
                <span
                  className={`flex h-6 w-6 items-center justify-center rounded-full text-xs ${
                    cell.isToday
                      ? 'bg-brand-600 font-semibold text-white'
                      : cell.inMonth
                      ? 'text-slate-700'
                      : 'text-slate-300'
                  }`}
                >
                  {cell.dia}
                </span>
                <Dots items={dayItems} />
              </button>
            )
          })}
        </div>
      </div>

      {/* Leyenda */}
      <div className="flex items-center justify-center gap-4 text-xs text-slate-500">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-brand-600" /> Cita
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-violet-500" /> Follow-up
        </span>
      </div>

      {/* Items del día seleccionado */}
      <div>
        <h3 className="mb-2 text-sm font-semibold text-slate-700">
          {selected === hoy ? 'Hoy · ' : ''}
          {formatFecha(selected)}
        </h3>
        {selectedItems.length === 0 ? (
          <EmptyState title="Sin nada este día" />
        ) : (
          <ul className="space-y-2">
            {selectedItems.map((it) => (
              <AgendaRow
                key={`${it.kind}-${it.id}`}
                item={it}
                onToggle={() => onToggleItem(it)}
                onOpenPatient={() => onOpenPatient(it.patientId)}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

// Puntos indicadores dentro de una celda del calendario (máx. 3 + contador).
function Dots({ items }) {
  if (items.length === 0) return <span className="h-1.5" />
  const shown = items.slice(0, 3)
  return (
    <span className="flex items-center gap-0.5">
      {shown.map((it) => (
        <span
          key={`${it.kind}-${it.id}`}
          className={`h-1.5 w-1.5 rounded-full ${
            isDone(it) ? 'bg-slate-300' : it.kind === 'cita' ? 'bg-brand-600' : 'bg-violet-500'
          }`}
        />
      ))}
      {items.length > 3 && <span className="text-[9px] leading-none text-slate-400">+{items.length - 3}</span>}
    </span>
  )
}
