// Utilidades de fecha. Todo trabaja con fechas locales en formato 'YYYY-MM-DD'
// (el mismo que guardan los recordatorios), evitando líos de zona horaria.

// Fecha de hoy en formato 'YYYY-MM-DD' según la hora local del dispositivo.
export function todayStr() {
  const d = new Date()
  return toISODate(d)
}

// Convierte un objeto Date a 'YYYY-MM-DD' local (no UTC).
export function toISODate(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

// 'YYYY-MM-DD' del día dentro de N días a partir de hoy (N puede ser negativo).
export function addDaysStr(days, base = new Date()) {
  const d = new Date(base)
  d.setDate(d.getDate() + days)
  return toISODate(d)
}

// Fin de "esta semana": consideramos los próximos 7 días desde hoy (incluido).
export function endOfWeekStr() {
  return addDaysStr(6)
}

// Clasifica un recordatorio según su fecha respecto de hoy.
// Devuelve: 'vencido' | 'hoy' | 'semana' | 'proximo'
export function classifyDate(fecha) {
  const hoy = todayStr()
  const finSemana = endOfWeekStr()
  if (fecha < hoy) return 'vencido'
  if (fecha === hoy) return 'hoy'
  if (fecha <= finSemana) return 'semana'
  return 'proximo'
}

// Formatea 'YYYY-MM-DD' a algo legible: "lun 8 jul 2026".
export function formatFecha(fecha) {
  if (!fecha) return ''
  const [y, m, d] = fecha.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  return date.toLocaleDateString('es', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

// Formato relativo corto y humano: "Hoy", "Mañana", "Ayer" o la fecha.
export function formatFechaRelativa(fecha) {
  if (!fecha) return ''
  const hoy = todayStr()
  if (fecha === hoy) return 'Hoy'
  if (fecha === addDaysStr(1)) return 'Mañana'
  if (fecha === addDaysStr(-1)) return 'Ayer'
  return formatFecha(fecha)
}

// --- Ayudas para la vista de calendario (mes) ------------------------------

// Encabezados de la semana (empezando en lunes).
export const WEEKDAYS = ['lun', 'mar', 'mié', 'jue', 'vie', 'sáb', 'dom']

// Año/mes de hoy: { year, month } (month base 0).
export function todayParts() {
  const d = new Date()
  return { year: d.getFullYear(), month: d.getMonth() }
}

// Etiqueta legible del mes: "Julio 2026".
export function monthLabel(year, month) {
  const d = new Date(year, month, 1)
  const s = d.toLocaleDateString('es', { month: 'long', year: 'numeric' })
  return s.charAt(0).toUpperCase() + s.slice(1)
}

// Matriz de 6 semanas × 7 días para el mes dado. Cada celda:
//   { fecha: 'YYYY-MM-DD', inMonth: boolean, isToday: boolean, dia: number }
// La semana empieza en lunes.
export function monthMatrix(year, month) {
  const first = new Date(year, month, 1)
  const weekday = first.getDay() // 0=domingo … 6=sábado
  const offset = (weekday + 6) % 7 // días desde el lunes anterior
  const hoy = todayStr()

  const weeks = []
  let cursor = 1 - offset
  for (let w = 0; w < 6; w++) {
    const week = []
    for (let d = 0; d < 7; d++) {
      const date = new Date(year, month, cursor)
      const fecha = toISODate(date)
      week.push({
        fecha,
        dia: date.getDate(),
        inMonth: date.getMonth() === month,
        isToday: fecha === hoy,
      })
      cursor++
    }
    weeks.push(week)
  }
  return weeks
}

// Navega al mes anterior/siguiente. Devuelve { year, month }.
export function shiftMonth(year, month, delta) {
  const d = new Date(year, month + delta, 1)
  return { year: d.getFullYear(), month: d.getMonth() }
}
