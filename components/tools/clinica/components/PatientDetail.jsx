import { useEffect, useState } from 'react'
import { Button, Badge, EmptyState } from './ui.jsx'
import ReminderForm from './ReminderForm.jsx'
import CitaForm from './CitaForm.jsx'
import { formatFechaRelativa, classifyDate } from '../utils/dates.js'
import { exportCita, exportReminder } from '../calendar/ics.js'

// Ícono "añadir al calendario" reutilizable.
function CalendarButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      title="Añadir al calendario del teléfono"
      className="rounded-lg p-1.5 text-slate-400 hover:bg-brand-50 hover:text-brand-600"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" />
        <path d="M12 14v4M10 16h4" />
      </svg>
    </button>
  )
}

// Ficha del paciente: datos completos + condición + citas + recordatorios.
// Todas las operaciones sobre datos se reciben como callbacks del padre (App).
export default function PatientDetail({
  patient,
  onBack,
  onEdit,
  onDelete,
  loadReminders,
  onCreateReminder,
  onToggleReminder,
  onDeleteReminder,
  loadCitas,
  onCreateCita,
  onUpdateCita,
  onDeleteCita,
}) {
  const [reminders, setReminders] = useState([])
  const [citas, setCitas] = useState([])
  const [loading, setLoading] = useState(true)
  const [showReminderForm, setShowReminderForm] = useState(false)
  const [showCitaForm, setShowCitaForm] = useState(false)

  async function refresh() {
    setLoading(true)
    const [rem, cit] = await Promise.all([
      loadReminders(patient.id),
      loadCitas(patient.id),
    ])
    setReminders(rem)
    setCitas(cit)
    setLoading(false)
  }

  useEffect(() => {
    refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patient.id])

  // --- Recordatorios ---
  async function handleCreateReminder(data) {
    await onCreateReminder({ ...data, patientId: patient.id })
    setShowReminderForm(false)
    refresh()
  }
  async function handleToggleReminder(reminder) {
    await onToggleReminder(reminder)
    refresh()
  }
  async function handleDeleteReminder(id) {
    await onDeleteReminder(id)
    refresh()
  }

  // --- Citas ---
  async function handleCreateCita(data) {
    await onCreateCita({ ...data, patientId: patient.id })
    setShowCitaForm(false)
    refresh()
  }
  async function handleUpdateCita(id, data) {
    await onUpdateCita(id, data)
    refresh()
  }
  async function handleDeleteCita(id) {
    await onDeleteCita(id)
    refresh()
  }

  const pendientes = reminders.filter((r) => r.estado === 'pendiente')
  const proximasCitas = citas.filter((c) => c.estado === 'programada')

  return (
    <div className="space-y-5">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1 text-sm font-medium text-brand-700 hover:text-brand-800"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="m15 18-6-6 6-6" />
        </svg>
        Pacientes
      </button>

      {/* Cabecera con datos */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-100 text-lg font-semibold text-brand-700">
              {initials(patient.nombre)}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-800">{patient.nombre}</h2>
              <p className="text-sm text-slate-500">
                {proximasCitas.length > 0 && (
                  <span>
                    {proximasCitas.length} cita{proximasCitas.length === 1 ? '' : 's'}
                  </span>
                )}
                {proximasCitas.length > 0 && pendientes.length > 0 && ' · '}
                {pendientes.length > 0 && (
                  <span>
                    {pendientes.length} follow-up{pendientes.length === 1 ? '' : 's'}
                  </span>
                )}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={onEdit}>
              Editar
            </Button>
            <Button variant="danger" size="sm" onClick={onDelete}>
              Eliminar
            </Button>
          </div>
        </div>

        <dl className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Teléfono" value={patient.telefono} />
          <Field label="Email" value={patient.email} />
          <Field label="Condición / diagnóstico" value={patient.condicion} full />
          <Field label="Notas" value={patient.notas} full />
        </dl>
      </div>

      {/* Citas */}
      <Section
        title="Citas"
        onNew={() => setShowCitaForm(true)}
        showNew={!showCitaForm}
      >
        {showCitaForm && (
          <div className="mb-3">
            <CitaForm onSave={handleCreateCita} onCancel={() => setShowCitaForm(false)} />
          </div>
        )}
        {loading ? (
          <Loading />
        ) : citas.length === 0 ? (
          <EmptyState title="Sin citas" subtitle="Agenda una cita para este paciente." />
        ) : (
          <ul className="space-y-2">
            {citas.map((c) => (
              <CitaRow
                key={c.id}
                cita={c}
                patientName={patient.nombre}
                onSetEstado={(estado) => handleUpdateCita(c.id, { estado })}
                onDelete={() => handleDeleteCita(c.id)}
              />
            ))}
          </ul>
        )}
      </Section>

      {/* Recordatorios */}
      <Section
        title="Recordatorios / follow-ups"
        onNew={() => setShowReminderForm(true)}
        showNew={!showReminderForm}
      >
        {showReminderForm && (
          <div className="mb-3">
            <ReminderForm onSave={handleCreateReminder} onCancel={() => setShowReminderForm(false)} />
          </div>
        )}
        {loading ? (
          <Loading />
        ) : reminders.length === 0 ? (
          <EmptyState title="Sin recordatorios" subtitle="Crea un seguimiento para este paciente." />
        ) : (
          <ul className="space-y-2">
            {reminders.map((r) => (
              <ReminderRow
                key={r.id}
                reminder={r}
                patientName={patient.nombre}
                onToggle={() => handleToggleReminder(r)}
                onDelete={() => handleDeleteReminder(r.id)}
              />
            ))}
          </ul>
        )}
      </Section>
    </div>
  )
}

function Section({ title, onNew, showNew, children }) {
  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-semibold text-slate-700">{title}</h3>
        {showNew && (
          <Button size="sm" onClick={onNew}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Nuevo
          </Button>
        )}
      </div>
      {children}
    </div>
  )
}

function CitaRow({ cita, patientName, onSetEstado, onDelete }) {
  const cls = classifyDate(cita.fecha)
  const activa = cita.estado === 'programada'
  const tone =
    cita.estado === 'atendida'
      ? 'emerald'
      : cita.estado === 'cancelada'
      ? 'slate'
      : cls === 'vencido'
      ? 'red'
      : cls === 'hoy'
      ? 'amber'
      : 'brand'

  return (
    <li className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3">
      <div className="flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-lg bg-brand-50 text-brand-700">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" />
        </svg>
      </div>
      <div className="min-w-0 flex-1">
        <p
          className={`text-sm ${
            cita.estado === 'cancelada' ? 'text-slate-400 line-through' : 'text-slate-800'
          }`}
        >
          {cita.motivo}
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs">
          <Badge tone={tone}>
            {formatFechaRelativa(cita.fecha)}
            {cita.hora ? ` · ${cita.hora}` : ''}
          </Badge>
          <span className="text-slate-400">{cita.duracion} min</span>
          {cita.estado !== 'programada' && (
            <Badge tone={cita.estado === 'atendida' ? 'emerald' : 'slate'}>
              {cita.estado === 'atendida' ? 'Atendida' : 'Cancelada'}
            </Badge>
          )}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <CalendarButton onClick={() => exportCita(cita, patientName)} />
        {activa ? (
          <>
            <button
              onClick={() => onSetEstado('atendida')}
              title="Marcar como atendida"
              className="rounded-lg p-1.5 text-emerald-600 hover:bg-emerald-50"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 6 9 17l-5-5" />
              </svg>
            </button>
            <button
              onClick={() => onSetEstado('cancelada')}
              title="Cancelar cita"
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </>
        ) : (
          <button
            onClick={() => onSetEstado('programada')}
            title="Reactivar (volver a programada)"
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12a9 9 0 1 0 9-9 9 9 0 0 0-6.5 2.8L3 8" />
              <path d="M3 3v5h5" />
            </svg>
          </button>
        )}
        <button
          onClick={onDelete}
          title="Eliminar cita"
          className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
          </svg>
        </button>
      </div>
    </li>
  )
}

function ReminderRow({ reminder, patientName, onToggle, onDelete }) {
  const hecho = reminder.estado === 'hecho'
  const cls = classifyDate(reminder.fecha)
  const tone =
    hecho ? 'emerald' : cls === 'vencido' ? 'red' : cls === 'hoy' ? 'amber' : 'slate'

  return (
    <li className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3">
      <button
        onClick={onToggle}
        title={hecho ? 'Marcar como pendiente' : 'Marcar como hecho'}
        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
          hecho
            ? 'border-emerald-500 bg-emerald-500 text-white'
            : 'border-slate-300 hover:border-brand-500'
        }`}
      >
        {hecho && (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        )}
      </button>
      <div className="min-w-0 flex-1">
        <p className={`text-sm ${hecho ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
          {reminder.motivo}
        </p>
        <div className="mt-0.5 flex items-center gap-2 text-xs">
          <Badge tone={tone}>
            {formatFechaRelativa(reminder.fecha)}
            {reminder.hora ? ` · ${reminder.hora}` : ''}
          </Badge>
        </div>
      </div>
      <CalendarButton onClick={() => exportReminder(reminder, patientName)} />
      <button
        onClick={onDelete}
        className="shrink-0 rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500"
        title="Eliminar recordatorio"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
        </svg>
      </button>
    </li>
  )
}

function Field({ label, value, full }) {
  return (
    <div className={full ? 'sm:col-span-2' : ''}>
      <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</dt>
      <dd className="mt-0.5 whitespace-pre-wrap text-sm text-slate-700">
        {value ? value : <span className="text-slate-300">—</span>}
      </dd>
    </div>
  )
}

function Loading() {
  return <p className="py-6 text-center text-sm text-slate-400">Cargando…</p>
}

function initials(name) {
  const parts = (name || '').trim().split(/\s+/).slice(0, 2)
  return parts.map((p) => p[0]?.toUpperCase() || '').join('') || '?'
}
