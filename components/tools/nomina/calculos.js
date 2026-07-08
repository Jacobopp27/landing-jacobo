/**
 * Lógica de cálculo de nómina según legislación colombiana.
 *
 * Jornada máxima: 44h semanales
 * Diurno: 06:00 - 19:00
 * Nocturno: 19:00 - 06:00
 *
 * Recargos acumulativos:
 *  - Nocturno:            +35%
 *  - Extra diurna:        +25%
 *  - Extra nocturna:      +75%
 *  - Dominical/festivo:   +80%
 */

import { AJUSTES_DEFAULT } from './useAjustes'

function esHoraDiurna(hora, ini, fin) {
  return hora >= ini && hora < fin
}

/**
 * Obtiene el número de semana ISO de una fecha (string YYYY-MM-DD).
 * Usamos lunes como inicio de semana (estándar ISO 8601).
 */
function getSemanaISO(fechaStr) {
  const fecha = new Date(fechaStr + 'T00:00:00')
  const diaSemana = fecha.getDay() === 0 ? 7 : fecha.getDay() // domingo = 7
  const jueves = new Date(fecha)
  jueves.setDate(fecha.getDate() - diaSemana + 4)
  const inicioAno = new Date(jueves.getFullYear(), 0, 1)
  return Math.ceil(((jueves - inicioAno) / 86400000 + 1) / 7)
}

/**
 * Dada una fecha y un string de hora "HH:MM", devuelve un objeto Date.
 * Si horaFin es menor que horaInicio, se asume que cae al día siguiente.
 */
function parsearHora(fechaStr, horaStr) {
  const [h, m] = horaStr.split(':').map(Number)
  const d = new Date(fechaStr + 'T00:00:00')
  d.setHours(h, m, 0, 0)
  return d
}

/**
 * Clasifica los minutos trabajados en 4 categorías:
 *  - domFestDiurna:   diurna dentro del día dom/fest (antes de medianoche)
 *  - domFestNocturna: nocturna dentro del día dom/fest (antes de medianoche)
 *  - normalDiurna:    diurna en día normal O después de medianoche
 *  - normalNocturna:  nocturna en día normal O después de medianoche
 *
 * El recargo dominical/festivo (+80%) solo aplica hasta las 00:00 del día siguiente.
 */
function clasificarMinutos(inicio, fin, esDomFestivo, iniDiurno, finDiurno) {
  let domFestDiurna = 0
  let domFestNocturna = 0
  let normalDiurna = 0
  let normalNocturna = 0

  // Medianoche del día de inicio (límite del recargo dom/fest)
  const medianoche = new Date(inicio)
  medianoche.setHours(24, 0, 0, 0)

  const cur = new Date(inicio)
  while (cur < fin) {
    const h = cur.getHours()
    const diurna = esHoraDiurna(h, iniDiurno, finDiurno)
    const enDomFest = esDomFestivo && cur < medianoche

    if (enDomFest) {
      if (diurna) domFestDiurna++
      else domFestNocturna++
    } else {
      if (diurna) normalDiurna++
      else normalNocturna++
    }
    cur.setMinutes(cur.getMinutes() + 1)
  }

  return { domFestDiurna, domFestNocturna, normalDiurna, normalNocturna }
}

/**
 * Calcula el total ganado en la quincena.
 *
 * @param {Array} dias
 * @param {number} salarioMensual
 * @param {object} ajustes - configuración de recargos y jornada
 */
export function calcularQuincena(dias, salarioMensual, ajustes = AJUSTES_DEFAULT) {
  const cfg = { ...AJUSTES_DEFAULT, ...ajustes }
  if (!salarioMensual || salarioMensual <= 0 || dias.length === 0) {
    return {
      totalGanado: 0,
      desglose: {
        normalDiurna: { horas: 0, valor: 0 },
        normalNocturna: { horas: 0, valor: 0 },
        extraDiurna: { horas: 0, valor: 0 },
        extraNocturna: { horas: 0, valor: 0 },
        domFestDiurna: { horas: 0, valor: 0 },
        domFestNocturna: { horas: 0, valor: 0 },
        extraDomFestDiurna: { horas: 0, valor: 0 },
        extraDomFestNocturna: { horas: 0, valor: 0 },
      },
      horasSemanales: {},
      totalHoras: 0,
    }
  }

  // Divisor: (horasSemanales / 6 días) × 30 días = horasSemanales × 5
  // 44h/sem → 44×5 = 220 | 42h/sem → 42×5 = 210 | 48h/sem → 48×5 = 240
  const divisorHoras = cfg.maxHorasSemanales * 5
  const valorHora = salarioMensual / divisorHoras

  // Factores derivados de los ajustes (base 1 + recargo en decimal)
  const fNocturno = 1 + cfg.recargoNocturno / 100
  const fExtraDiurna = 1 + cfg.recargoExtraDiurna / 100
  const fExtraNocturna = 1 + cfg.recargoExtraNocturna / 100
  const fDomFest = 1 + cfg.recargoDomFest / 100
  const fDomFestNocturna = fDomFest + cfg.recargoNocturno / 100
  const fExtraDomFestDiurna = fDomFest + cfg.recargoExtraDiurna / 100
  const fExtraDomFestNocturna = fDomFest + cfg.recargoExtraNocturna / 100

  // Acumular horas por semana para detectar extras
  const horasPorSemana = {}

  // Primero calculamos los minutos de cada día y los agrupamos por semana
  const diasConMinutos = dias.map((dia) => {
    const inicio = parsearHora(dia.fecha, dia.horaInicio)
    let fin = parsearHora(dia.fecha, dia.horaFin)

    // Si fin <= inicio, asumimos que termina al día siguiente
    if (fin <= inicio) {
      fin.setDate(fin.getDate() + 1)
    }

    // Descontar 1 hora de almuerzo
    if (dia.tieneAlmuerzo) {
      fin = new Date(fin.getTime() - 60 * 60 * 1000)
      if (fin <= inicio) fin = new Date(inicio)
    }

    const semana = getSemanaISO(dia.fecha)
    const { domFestDiurna, domFestNocturna, normalDiurna, normalNocturna } =
      clasificarMinutos(inicio, fin, dia.esDomFestivo, cfg.horaInicioDiurno, cfg.horaFinDiurno)
    const totalMin = domFestDiurna + domFestNocturna + normalDiurna + normalNocturna
    const totalHoras = totalMin / 60

    if (!horasPorSemana[semana]) horasPorSemana[semana] = 0
    horasPorSemana[semana] += totalHoras

    return { ...dia, semana, domFestDiurna, domFestNocturna, normalDiurna, normalNocturna, totalMin, totalHoras }
  })

  // Ahora ordenamos por fecha para procesar en orden cronológico
  diasConMinutos.sort((a, b) => new Date(a.fecha) - new Date(b.fecha))

  // Acumulados por semana (para detectar en qué punto se pasan las 44h)
  const acumSemana = {}

  const desglose = {
    normalDiurna: { horas: 0, valor: 0 },
    normalNocturna: { horas: 0, valor: 0 },
    extraDiurna: { horas: 0, valor: 0 },
    extraNocturna: { horas: 0, valor: 0 },
    domFestDiurna: { horas: 0, valor: 0 },
    domFestNocturna: { horas: 0, valor: 0 },
    extraDomFestDiurna: { horas: 0, valor: 0 },
    extraDomFestNocturna: { horas: 0, valor: 0 },
  }

  for (const dia of diasConMinutos) {
    const semana = dia.semana
    if (!acumSemana[semana]) acumSemana[semana] = 0

    const horasAntesDelDia = acumSemana[semana]
    const horasTotalesDia = dia.totalMin / 60

    // Cuántas horas de este día son extra
    const horasNormalesRestantes = Math.max(0, cfg.maxHorasSemanales - horasAntesDelDia)
    const horasNormalesEnEsteDia = Math.min(horasTotalesDia, horasNormalesRestantes)
    const horasExtraEnEsteDia = horasTotalesDia - horasNormalesEnEsteDia

    acumSemana[semana] += horasTotalesDia

    // Las 4 categorías de minutos ya están separadas correctamente
    const { domFestDiurna, domFestNocturna, normalDiurna, normalNocturna } = dia
    if (dia.totalMin === 0) continue

    // Distribuir las horas extra proporcionalmente entre las 4 categorías
    const minNormalesDisp = horasNormalesEnEsteDia * 60
    const minExtraDisp = horasExtraEnEsteDia * 60

    // Proporciones de cada categoría sobre el total
    const total = dia.totalMin
    const prop = {
      domFestDiurna: domFestDiurna / total,
      domFestNocturna: domFestNocturna / total,
      normalDiurna: normalDiurna / total,
      normalNocturna: normalNocturna / total,
    }

    // Horas normales por categoría
    const hNorm = {
      domFestDiurna: (minNormalesDisp * prop.domFestDiurna) / 60,
      domFestNocturna: (minNormalesDisp * prop.domFestNocturna) / 60,
      normalDiurna: (minNormalesDisp * prop.normalDiurna) / 60,
      normalNocturna: (minNormalesDisp * prop.normalNocturna) / 60,
    }

    // Horas extra por categoría
    const hExtra = {
      domFestDiurna: (minExtraDisp * prop.domFestDiurna) / 60,
      domFestNocturna: (minExtraDisp * prop.domFestNocturna) / 60,
      normalDiurna: (minExtraDisp * prop.normalDiurna) / 60,
      normalNocturna: (minExtraDisp * prop.normalNocturna) / 60,
    }

    desglose.domFestDiurna.horas += hNorm.domFestDiurna
    desglose.domFestDiurna.valor += hNorm.domFestDiurna * valorHora * fDomFest

    desglose.domFestNocturna.horas += hNorm.domFestNocturna
    desglose.domFestNocturna.valor += hNorm.domFestNocturna * valorHora * fDomFestNocturna

    desglose.extraDomFestDiurna.horas += hExtra.domFestDiurna
    desglose.extraDomFestDiurna.valor += hExtra.domFestDiurna * valorHora * fExtraDomFestDiurna

    desglose.extraDomFestNocturna.horas += hExtra.domFestNocturna
    desglose.extraDomFestNocturna.valor += hExtra.domFestNocturna * valorHora * fExtraDomFestNocturna

    desglose.normalDiurna.horas += hNorm.normalDiurna
    desglose.normalDiurna.valor += hNorm.normalDiurna * valorHora * 1.0

    desglose.normalNocturna.horas += hNorm.normalNocturna
    desglose.normalNocturna.valor += hNorm.normalNocturna * valorHora * fNocturno

    desglose.extraDiurna.horas += hExtra.normalDiurna
    desglose.extraDiurna.valor += hExtra.normalDiurna * valorHora * fExtraDiurna

    desglose.extraNocturna.horas += hExtra.normalNocturna
    desglose.extraNocturna.valor += hExtra.normalNocturna * valorHora * fExtraNocturna
  }

  const totalGanado = Object.values(desglose).reduce((sum, cat) => sum + cat.valor, 0)
  const totalHoras = Object.values(desglose).reduce((sum, cat) => sum + cat.horas, 0)

  // Salario base = todas las horas al valor hora sin recargos
  const salarioBase = totalHoras * valorHora
  // Recargos = lo adicional por encima del salario base
  const totalRecargos = totalGanado - salarioBase

  return { totalGanado, salarioBase, totalRecargos, desglose, horasSemanales: acumSemana, totalHoras, valorHora }
}

export function calcularValorHora(salario, ajustes = AJUSTES_DEFAULT) {
  const cfg = { ...AJUSTES_DEFAULT, ...ajustes }
  return salario / (cfg.maxHorasSemanales * 5)
}

export function formatCOP(valor) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(valor)
}

export function formatHoras(horas) {
  const h = Math.floor(horas)
  const m = Math.round((horas - h) * 60)
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}
