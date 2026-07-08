import { useState } from 'react'

const HOY = new Date().toISOString().split('T')[0]

const ESTADO_INICIAL = {
  fecha: HOY,
  horaInicio: '08:00',
  horaFin: '17:00',
  esDomFestivo: false,
  tieneAlmuerzo: false,
}

export default function FormularioDia({ onAgregar, onCancelar, diaEditar }) {
  const [form, setForm] = useState(diaEditar || ESTADO_INICIAL)
  const [error, setError] = useState('')

  function handleChange(e) {
    const { name, value, type, checked } = e.target
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
    setError('')
  }

  function calcularHorasTrabajadas() {
    if (!form.horaInicio || !form.horaFin) return null
    const [h1, m1] = form.horaInicio.split(':').map(Number)
    const [h2, m2] = form.horaFin.split(':').map(Number)
    let minutos = (h2 * 60 + m2) - (h1 * 60 + m1)
    if (minutos <= 0) minutos += 24 * 60
    if (form.tieneAlmuerzo) minutos = Math.max(0, minutos - 60)
    const horas = Math.floor(minutos / 60)
    const mins = minutos % 60
    return mins === 0 ? `${horas}h` : `${horas}h ${mins}m`
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!form.fecha || !form.horaInicio || !form.horaFin) {
      setError('Completa todos los campos.')
      return
    }
    onAgregar(form)
    setForm(ESTADO_INICIAL)
  }

  const duracion = calcularHorasTrabajadas()

  return (
    <form className="formulario-dia card" onSubmit={handleSubmit}>
      <h3>{diaEditar ? 'Editar día' : 'Agregar día trabajado'}</h3>

      <div className="form-group">
        <label htmlFor="fecha">Fecha</label>
        <input
          id="fecha"
          type="date"
          name="fecha"
          value={form.fecha}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="horaInicio">Entrada</label>
          <input
            id="horaInicio"
            type="time"
            name="horaInicio"
            value={form.horaInicio}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="horaFin">Salida</label>
          <input
            id="horaFin"
            type="time"
            name="horaFin"
            value={form.horaFin}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      {duracion && (
        <p className="duracion-preview">⏱ {duracion} trabajadas</p>
      )}

      <label className="checkbox-label">
        <input
          type="checkbox"
          name="tieneAlmuerzo"
          checked={form.tieneAlmuerzo}
          onChange={handleChange}
        />
        <span>¿Hubo hora de almuerzo? (-1h)</span>
      </label>

      <label className="checkbox-label">
        <input
          type="checkbox"
          name="esDomFestivo"
          checked={form.esDomFestivo}
          onChange={handleChange}
        />
        <span>¿Es domingo o festivo? (+80%)</span>
      </label>

      {error && <p className="error-msg">{error}</p>}

      <div className="form-actions">
        <button type="submit" className="btn-primary">
          {diaEditar ? 'Guardar cambios' : '+ Agregar día'}
        </button>
        {onCancelar && (
          <button type="button" className="btn-secondary" onClick={onCancelar}>
            Cancelar
          </button>
        )}
      </div>
    </form>
  )
}
