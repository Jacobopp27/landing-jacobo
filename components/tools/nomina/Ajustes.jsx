import { useState } from 'react'
import { AJUSTES_DEFAULT } from './useAjustes'

const CAMPOS = [
  {
    key: 'maxHorasSemanales',
    label: 'Máximo horas semanales',
    descripcion: 'A partir de este límite se cobran horas extra',
    unidad: 'h',
    min: 1,
    max: 60,
  },
  {
    key: 'horaInicioDiurno',
    label: 'Inicio jornada diurna',
    descripcion: 'Hora en que empieza el turno diurno (formato 24h)',
    unidad: 'h',
    min: 0,
    max: 12,
  },
  {
    key: 'horaFinDiurno',
    label: 'Fin jornada diurna',
    descripcion: 'Hora en que termina el turno diurno (formato 24h)',
    unidad: 'h',
    min: 12,
    max: 23,
  },
  {
    key: 'recargoNocturno',
    label: 'Recargo nocturno',
    descripcion: 'Porcentaje adicional por trabajar en horario nocturno',
    unidad: '%',
    min: 0,
    max: 200,
  },
  {
    key: 'recargoExtraDiurna',
    label: 'Recargo hora extra diurna',
    descripcion: 'Porcentaje adicional por hora extra en horario diurno',
    unidad: '%',
    min: 0,
    max: 200,
  },
  {
    key: 'recargoExtraNocturna',
    label: 'Recargo hora extra nocturna',
    descripcion: 'Porcentaje adicional por hora extra en horario nocturno',
    unidad: '%',
    min: 0,
    max: 200,
  },
  {
    key: 'recargoDomFest',
    label: 'Recargo dominical / festivo',
    descripcion: 'Porcentaje adicional por trabajar domingo o festivo (aplica hasta medianoche)',
    unidad: '%',
    min: 0,
    max: 200,
  },
]

export default function Ajustes({ ajustes, setAjustes, resetAjustes }) {
  const [abierto, setAbierto] = useState(false)
  const [confirmReset, setConfirmReset] = useState(false)

  function handleChange(key, valor) {
    const num = Number(valor)
    if (!isNaN(num)) setAjustes({ [key]: num })
  }

  function handleReset() {
    if (confirmReset) {
      resetAjustes()
      setConfirmReset(false)
    } else {
      setConfirmReset(true)
      setTimeout(() => setConfirmReset(false), 3000)
    }
  }

  const hayModificaciones = CAMPOS.some(
    (c) => ajustes[c.key] !== AJUSTES_DEFAULT[c.key]
  )

  return (
    <div className="ajustes card">
      <button
        className="ajustes-toggle"
        onClick={() => setAbierto((v) => !v)}
        type="button"
      >
        <span>⚙️ Ajustes de recargos</span>
        <span className="ajustes-indicadores">
          {hayModificaciones && <span className="badge-mod">Modificado</span>}
          <span className="ajustes-chevron">{abierto ? '▲' : '▼'}</span>
        </span>
      </button>

      {abierto && (
        <div className="ajustes-contenido">
          <p className="ajustes-aviso">
            Modifica los valores si la ley cambia. Los recargos combinados (ej: dominical nocturno) se calculan automáticamente.
          </p>

          <div className="ajustes-grid">
            {CAMPOS.map((campo) => {
              const esModificado = ajustes[campo.key] !== AJUSTES_DEFAULT[campo.key]
              return (
                <div key={campo.key} className={`ajuste-item ${esModificado ? 'ajuste-modificado' : ''}`}>
                  <div className="ajuste-header">
                    <label htmlFor={campo.key}>{campo.label}</label>
                    {esModificado && (
                      <span className="ajuste-original">
                        Por defecto: {AJUSTES_DEFAULT[campo.key]}{campo.unidad}
                      </span>
                    )}
                  </div>
                  <p className="ajuste-desc">{campo.descripcion}</p>
                  <div className="ajuste-input-row">
                    <input
                      id={campo.key}
                      type="number"
                      inputMode="decimal"
                      min={campo.min}
                      max={campo.max}
                      step="1"
                      value={ajustes[campo.key]}
                      onChange={(e) => handleChange(campo.key, e.target.value)}
                    />
                    <span className="ajuste-unidad">{campo.unidad}</span>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="ajustes-footer">
            <div className="ajustes-combinados">
              <p className="combinados-titulo">Recargos combinados resultantes:</p>
              <div className="combinados-lista">
                <span>🌙 Nocturno normal: +{ajustes.recargoNocturno}%</span>
                <span>⚡ Extra diurna: +{ajustes.recargoExtraDiurna}%</span>
                <span>🌟 Extra nocturna: +{ajustes.recargoExtraNocturna}%</span>
                <span>🎉 Dom/fest diurno: +{ajustes.recargoDomFest}%</span>
                <span>🌛 Dom/fest nocturno: +{ajustes.recargoDomFest + ajustes.recargoNocturno}%</span>
                <span>💥 Extra dom/fest diurno: +{ajustes.recargoDomFest + ajustes.recargoExtraDiurna}%</span>
                <span>🔥 Extra dom/fest nocturno: +{ajustes.recargoDomFest + ajustes.recargoExtraNocturna}%</span>
              </div>
            </div>

            <button
              className={`btn-reset ${confirmReset ? 'btn-confirmar' : ''}`}
              onClick={handleReset}
              type="button"
            >
              {confirmReset ? '⚠️ ¿Restaurar valores legales?' : '↺ Restaurar valores por defecto'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
