import { useState } from 'react'
import { Input, Textarea, Button } from './ui.jsx'
import { todayStr } from '../utils/dates.js'

// Formulario compacto para crear un recordatorio dentro de la ficha del
// paciente. Devuelve los datos vía onSave (sin patientId; lo agrega el padre).
export default function ReminderForm({ onSave, onCancel }) {
  const [form, setForm] = useState({
    fecha: todayStr(),
    hora: '',
    motivo: '',
  })
  const [saving, setSaving] = useState(false)

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.fecha || !form.motivo.trim()) return
    setSaving(true)
    try {
      await onSave(form)
      setForm({ fecha: todayStr(), hora: '', motivo: '' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4"
    >
      <div className="grid grid-cols-2 gap-3">
        <Input label="Fecha *" type="date" value={form.fecha} onChange={set('fecha')} required />
        <Input label="Hora" type="time" value={form.hora} onChange={set('hora')} />
      </div>
      <Textarea
        label="Motivo *"
        value={form.motivo}
        onChange={set('motivo')}
        placeholder="Ej. Control de presión, llamar para resultados…"
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
          {saving ? 'Guardando…' : 'Agregar recordatorio'}
        </Button>
      </div>
    </form>
  )
}
