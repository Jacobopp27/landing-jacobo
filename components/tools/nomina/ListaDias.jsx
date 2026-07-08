import { useState } from 'react'
import FormularioDia from './FormularioDia'

const DIAS_SEMANA = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

function calcDuracion(horaInicio, horaFin, tieneAlmuerzo) {
  const [h1, m1] = horaInicio.split(':').map(Number)
  const [h2, m2] = horaFin.split(':').map(Number)
  let min = h2 * 60 + m2 - (h1 * 60 + m1)
  if (min <= 0) min += 1440
  if (tieneAlmuerzo) min = Math.max(0, min - 60)
  const h = Math.floor(min / 60)
  const m = min % 60
  return m === 0 ? `${h}h` : `${h}h ${m}m`
}

function formatFecha(fechaStr) {
  const d = new Date(fechaStr + 'T00:00:00')
  const dia = DIAS_SEMANA[d.getDay()]
  return `${dia} ${d.getDate()}/${d.getMonth() + 1}`
}

export default function ListaDias({ dias, onEliminar, onEditar }) {
  const [editandoId, setEditandoId] = useState(null)

  if (dias.length === 0) {
    return (
      <div className="lista-vacia">
        <p>📋 Aún no has registrado días en esta quincena.</p>
      </div>
    )
  }

  const diasOrdenados = [...dias].sort((a, b) => new Date(a.fecha) - new Date(b.fecha))

  function handleGuardarEdicion(datos) {
    onEditar(editandoId, datos)
    setEditandoId(null)
  }

  return (
    <div className="lista-dias">
      {diasOrdenados.map((dia) => (
        <div key={dia.id}>
          {editandoId === dia.id ? (
            <FormularioDia
              diaEditar={dia}
              onAgregar={handleGuardarEdicion}
              onCancelar={() => setEditandoId(null)}
            />
          ) : (
            <div className={`dia-card ${dia.esDomFestivo ? 'dom-festivo' : ''}`}>
              <div className="dia-info">
                <span className="dia-fecha">{formatFecha(dia.fecha)}</span>
                {dia.esDomFestivo && <span className="badge-dom">Dom/Fest</span>}
                <span className="dia-horas">
                  {dia.horaInicio} – {dia.horaFin}
                </span>
                <span className="dia-duracion">
                  ⏱ {calcDuracion(dia.horaInicio, dia.horaFin, dia.tieneAlmuerzo)}
                  {dia.tieneAlmuerzo && ' 🍽'}
                </span>
              </div>
              <div className="dia-acciones">
                <button
                  className="btn-icon"
                  title="Editar"
                  onClick={() => setEditandoId(dia.id)}
                >
                  ✏️
                </button>
                <button
                  className="btn-icon btn-danger"
                  title="Eliminar"
                  onClick={() => onEliminar(dia.id)}
                >
                  🗑️
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
