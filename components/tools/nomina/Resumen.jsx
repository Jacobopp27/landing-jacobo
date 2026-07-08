import * as XLSX from 'xlsx'
import { formatCOP, formatHoras } from './calculos'

const CATEGORIAS = [
  {
    key: 'normalDiurna',
    label: 'Horas normales diurnas',
    recargo: '0%',
    emoji: '☀️',
    descripcion: (h) => `Trabajaste ${formatHoras(h)} diurnas en horario normal (6am–7pm)`,
  },
  {
    key: 'normalNocturna',
    label: 'Recargo nocturno',
    recargo: '+35%',
    emoji: '🌙',
    descripcion: (h) => `Trabajaste ${formatHoras(h)} nocturnas con un recargo del 35%`,
  },
  {
    key: 'extraDiurna',
    label: 'Horas extra diurnas',
    recargo: '+25%',
    emoji: '⚡',
    descripcion: (h) => `Trabajaste ${formatHoras(h)} extra diurnas (más de 44h/semana) con recargo del 25%`,
  },
  {
    key: 'extraNocturna',
    label: 'Horas extra nocturnas',
    recargo: '+75%',
    emoji: '🌟',
    descripcion: (h) => `Trabajaste ${formatHoras(h)} extra nocturnas con recargo del 75%`,
  },
  {
    key: 'domFestDiurna',
    label: 'Dominical/festivo diurno',
    recargo: '+80%',
    emoji: '🎉',
    descripcion: (h) => `Trabajaste ${formatHoras(h)} en domingo o festivo (diurno) con recargo del 80%`,
  },
  {
    key: 'domFestNocturna',
    label: 'Dominical/festivo nocturno',
    recargo: '+115%',
    emoji: '🌛',
    descripcion: (h) => `Trabajaste ${formatHoras(h)} en domingo o festivo (nocturno) con recargo acumulado del 115%`,
  },
  {
    key: 'extraDomFestDiurna',
    label: 'Extra dominical diurno',
    recargo: '+105%',
    emoji: '💥',
    descripcion: (h) => `Trabajaste ${formatHoras(h)} extra en domingo o festivo diurno con recargo del 105%`,
  },
  {
    key: 'extraDomFestNocturna',
    label: 'Extra dominical nocturno',
    recargo: '+155%',
    emoji: '🔥',
    descripcion: (h) => `Trabajaste ${formatHoras(h)} extra en domingo o festivo nocturno con recargo del 155%`,
  },
]

export default function Resumen({ resultado, dias, salario }) {
  const { totalGanado, salarioBase, totalRecargos, desglose, horasSemanales, totalHoras } = resultado

  const categoriasConValor = CATEGORIAS.filter(
    (cat) => desglose[cat.key] && desglose[cat.key].horas > 0.01
  )

  function exportarExcel() {
    const filas = categoriasConValor.map((cat) => ({
      Categoría: cat.label,
      Recargo: cat.recargo,
      Horas: Number(desglose[cat.key].horas.toFixed(2)),
      'Valor ($)': Math.round(desglose[cat.key].valor),
    }))
    filas.push({ Categoría: '', Recargo: '', Horas: '', 'Valor ($)': '' })
    filas.push({
      Categoría: 'Salario base',
      Recargo: '0%',
      Horas: Number(totalHoras.toFixed(2)),
      'Valor ($)': Math.round(salarioBase),
    })
    filas.push({
      Categoría: 'Recargos y extras',
      Recargo: '',
      Horas: '',
      'Valor ($)': Math.round(totalRecargos),
    })
    filas.push({
      Categoría: 'TOTAL QUINCENA',
      Recargo: '',
      Horas: Number(totalHoras.toFixed(2)),
      'Valor ($)': Math.round(totalGanado),
    })

    const ws = XLSX.utils.json_to_sheet(filas)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Quincena')
    XLSX.writeFile(wb, 'quincena.xlsx')
  }

  if (totalGanado === 0) {
    return (
      <div className="resumen card resumen-vacio">
        <p>💡 Ingresa tu salario y agrega días trabajados para ver el cálculo.</p>
      </div>
    )
  }

  return (
    <div className="resumen card">
      <div className="resumen-total">
        <span className="total-label">Total ganado en la quincena</span>
        <span className="total-valor">{formatCOP(totalGanado)}</span>
        <span className="total-sub">{formatHoras(totalHoras)} trabajadas en total</span>

        <div className="total-desglose">
          <div className="total-desglose-item">
            <span className="total-desglose-icono">💼</span>
            <div className="total-desglose-info">
              <span className="total-desglose-label">Salario base</span>
              <span className="total-desglose-desc">{formatHoras(totalHoras)} × valor hora</span>
            </div>
            <span className="total-desglose-valor">{formatCOP(salarioBase)}</span>
          </div>
          <div className="total-desglose-divider" />
          <div className="total-desglose-item">
            <span className="total-desglose-icono">📈</span>
            <div className="total-desglose-info">
              <span className="total-desglose-label">Recargos y extras</span>
              <span className="total-desglose-desc">Nocturnos, dominicales, horas extra</span>
            </div>
            <span className="total-desglose-valor total-desglose-recargo">{formatCOP(totalRecargos)}</span>
          </div>
        </div>
      </div>

      {Object.keys(horasSemanales).length > 0 && (
        <div className="horas-semanales">
          {Object.entries(horasSemanales).map(([semana, horas]) => (
            <span key={semana} className={`semana-badge ${horas > 44 ? 'semana-extra' : ''}`}>
              Sem. {semana}: {formatHoras(horas)} {horas > 44 ? '⚠️ +extras' : ''}
            </span>
          ))}
        </div>
      )}

      <div className="desglose">
        <h4>Desglose detallado</h4>
        {categoriasConValor.map((cat) => {
          const { horas, valor } = desglose[cat.key]
          return (
            <div key={cat.key} className="desglose-item">
              <div className="desglose-header">
                <span className="desglose-emoji">{cat.emoji}</span>
                <span className="desglose-label">{cat.label}</span>
                <span className="desglose-recargo">{cat.recargo}</span>
                <span className="desglose-valor">{formatCOP(valor)}</span>
              </div>
              <p className="desglose-desc">{cat.descripcion(horas)}</p>
            </div>
          )
        })}
      </div>

      <div className="resumen-nota">
        <p>Este es el valor que generaste en la quincena basado en tus horas trabajadas. No incluye deducciones de ley.</p>
      </div>

      <button className="btn-export" onClick={exportarExcel}>
        📊 Exportar a Excel
      </button>
    </div>
  )
}
