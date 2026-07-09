import { useState } from 'react'
import { Input, Textarea, Button } from './ui.jsx'
import { todayStr } from '../utils/dates.js'

// Formulario para agendar una cita dentro de la ficha del paciente.
// Devuelve los datos vía onSave (sin patientId; lo agrega el padre).
const DURACIONES = [15, 20, 30, 45, 60, 90]

export default function CitaForm({ onSave, onCancel }) {
  const [form, setForm] = useState({
    fecha: todayStr(),
    hora: '09:00',
    duracion: 30,
    motivo: '',
  })
  const [saving, setSaving] = useState(false)

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.fecha || !form.hora || !form.motivo.trim()) return
    setSaving(true)
    try {
      await onSave({ ...form, duracion: Number(form.duracion) })
      setForm({ fecha: todayStr(), hora: '09:00', duracion: 30, motivo: '' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-3 rounded-xl border border-brand-200 bg-brand-50/50 p-4"
    >
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Input label="Fecha *" type="date" value={form.fecha} onChange={set('fecha')} required />
        <Input label="Hora *" type="time" value={form.hora} onChange={set('hora')} required />
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-600">Duración</span>
          <select
            value={form.duracion}
            onChange={set('duracion')}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          >
            {DURACIONES.map((d) => (
              <option key={d} value={d}>
                {d} min
              </option>
            ))}
          </select>
        </label>
      </div>
      <Textarea
        label="Motivo de la cita *"
        value={form.motivo}
        onChange={set('motivo')}
        placeholder="Ej. Consulta de control, valoración, procedimiento…"
        rows={2}
        required
      />
      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
            Cancelar
          </Button>
        )}
        <Button type="submit" size="sm" disabled={saving || !form.motivo.trim()}>
          {saving ? 'Guardando…' : 'Agendar cita'}
        </Button>
      </div>
    </form>
  )
}
