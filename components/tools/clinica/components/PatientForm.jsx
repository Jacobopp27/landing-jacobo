import { useState } from 'react'
import { Modal, Input, Textarea, Button } from './ui.jsx'

// Formulario de alta / edición de paciente. Recibe un paciente opcional
// (para editar) y devuelve los datos vía onSave. NO toca el store: eso lo
// hace el componente padre.
export default function PatientForm({ patient, onSave, onClose }) {
  const [form, setForm] = useState({
    nombre: patient?.nombre || '',
    telefono: patient?.telefono || '',
    email: patient?.email || '',
    condicion: patient?.condicion || '',
    notas: patient?.notas || '',
  })
  const [saving, setSaving] = useState(false)

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.nombre.trim()) return
    setSaving(true)
    try {
      await onSave(form)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal title={patient ? 'Editar paciente' : 'Nuevo paciente'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Nombre *"
          value={form.nombre}
          onChange={set('nombre')}
          placeholder="Ej. María González"
          autoFocus
          required
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Teléfono"
            value={form.telefono}
            onChange={set('telefono')}
            placeholder="Ej. 300 123 4567"
            inputMode="tel"
          />
          <Input
            label="Email"
            value={form.email}
            onChange={set('email')}
            placeholder="opcional"
            type="email"
          />
        </div>
        <Textarea
          label="Condición / diagnóstico"
          value={form.condicion}
          onChange={set('condicion')}
          placeholder="Qué tiene o tenía, tratamiento actual…"
          rows={3}
        />
        <Textarea
          label="Notas"
          value={form.notas}
          onChange={set('notas')}
          placeholder="Notas libres…"
          rows={3}
        />
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={saving || !form.nombre.trim()}>
            {saving ? 'Guardando…' : 'Guardar'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
