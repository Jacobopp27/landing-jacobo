// ============================================================================
//  CAPA DE CALENDARIO (.ics)  —  src/calendar/ics.js
// ----------------------------------------------------------------------------
//  Genera archivos iCalendar (.ics) y los descarga. Al abrir el archivo, el
//  sistema ofrece "Añadir al calendario" (Apple Calendar, Google Calendar,
//  etc.). A partir de ahí, es EL CALENDARIO DEL DISPOSITIVO quien avisa —así el
//  recordatorio funciona aunque el navegador/app esté cerrado.
//
//  Único archivo que sabe cómo se arma un .ics. La UI solo llama a
//  exportCita / exportReminder / exportAgendaItems.
//
//  Las horas se escriben en "hora local flotante" (sin zona horaria): la cita
//  ocurre a esa hora local en el dispositivo, que es lo que espera una clínica.
// ============================================================================

// Escapa caracteres especiales de un valor de texto iCalendar.
function escapeText(str = '') {
  return String(str)
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n')
}

// Plegado de líneas: iCalendar recomienda máx. 75 octetos por línea.
function foldLine(line) {
  if (line.length <= 74) return line
  const chunks = []
  let rest = line
  chunks.push(rest.slice(0, 74))
  rest = rest.slice(74)
  while (rest.length > 73) {
    chunks.push(' ' + rest.slice(0, 73))
    rest = rest.slice(73)
  }
  if (rest.length) chunks.push(' ' + rest)
  return chunks.join('\r\n')
}

// 'YYYY-MM-DD' + 'HH:MM' -> objeto Date local.
function toDate(fecha, hora) {
  const [y, m, d] = fecha.split('-').map(Number)
  const [hh, mm] = (hora || '00:00').split(':').map(Number)
  return new Date(y, m - 1, d, hh || 0, mm || 0, 0, 0)
}

function pad(n) {
  return String(n).padStart(2, '0')
}

// Date -> 'YYYYMMDDTHHMMSS' en hora LOCAL (flotante, sin Z).
function formatLocal(date) {
  return (
    date.getFullYear() +
    pad(date.getMonth() + 1) +
    pad(date.getDate()) +
    'T' +
    pad(date.getHours()) +
    pad(date.getMinutes()) +
    '00'
  )
}

// Date -> 'YYYYMMDDTHHMMSSZ' en UTC (para DTSTAMP).
function formatUTC(date) {
  return (
    date.getUTCFullYear() +
    pad(date.getUTCMonth() + 1) +
    pad(date.getUTCDate()) +
    'T' +
    pad(date.getUTCHours()) +
    pad(date.getUTCMinutes()) +
    pad(date.getUTCSeconds()) +
    'Z'
  )
}

// minutos antes -> string de TRIGGER (-P1D, -PT1H, -PT30M).
function triggerFor(min) {
  if (min % 1440 === 0) return `-P${min / 1440}D`
  if (min % 60 === 0) return `-PT${min / 60}H`
  return `-PT${min}M`
}

// Construye un VEVENT a partir de un evento normalizado:
//   { uid, title, description, fecha, hora, durationMin, alarms: [minAntes] }
function buildEvent(ev, dtstamp) {
  const start = toDate(ev.fecha, ev.hora)
  const end = new Date(start.getTime() + (ev.durationMin || 30) * 60000)

  const lines = [
    'BEGIN:VEVENT',
    `UID:${ev.uid}`,
    `DTSTAMP:${dtstamp}`,
    `DTSTART:${formatLocal(start)}`,
    `DTEND:${formatLocal(end)}`,
    `SUMMARY:${escapeText(ev.title)}`,
  ]
  if (ev.description) lines.push(`DESCRIPTION:${escapeText(ev.description)}`)

  for (const min of ev.alarms || []) {
    lines.push(
      'BEGIN:VALARM',
      `TRIGGER:${triggerFor(min)}`,
      'ACTION:DISPLAY',
      `DESCRIPTION:${escapeText(ev.title)}`,
      'END:VALARM'
    )
  }
  lines.push('END:VEVENT')
  return lines
}

// Arma el documento .ics completo a partir de varios eventos normalizados.
function buildCalendar(events) {
  const dtstamp = formatUTC(new Date())
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Agenda de Pacientes//ES',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
  ]
  for (const ev of events) lines.push(...buildEvent(ev, dtstamp))
  lines.push('END:VCALENDAR')
  return lines.map(foldLine).join('\r\n')
}

// Descarga el contenido como archivo .ics.
function download(filename, content) {
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  // Liberar el object URL un momento después.
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

function slug(str = '') {
  return (
    String(str)
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-zA-Z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .toLowerCase() || 'evento'
  )
}

// --- Normalizadores: de nuestros modelos a evento de calendario ------------

function citaToEvent(cita, patientName) {
  return {
    uid: `cita-${cita.id}@agenda-pacientes`,
    title: `Cita: ${patientName}${cita.motivo ? ` — ${cita.motivo}` : ''}`,
    description: `Paciente: ${patientName}\nMotivo: ${cita.motivo || ''}\nDuración: ${
      cita.duracion || 30
    } min`,
    fecha: cita.fecha,
    hora: cita.hora || '09:00',
    durationMin: cita.duracion || 30,
    alarms: [1440, 60], // 1 día antes y 1 hora antes
  }
}

function reminderToEvent(reminder, patientName) {
  return {
    uid: `rec-${reminder.id}@agenda-pacientes`,
    title: `Follow-up: ${patientName}${reminder.motivo ? ` — ${reminder.motivo}` : ''}`,
    description: `Paciente: ${patientName}\nSeguimiento: ${reminder.motivo || ''}`,
    fecha: reminder.fecha,
    hora: reminder.hora || '09:00',
    durationMin: 30,
    alarms: [60], // 1 hora antes
  }
}

// --- API pública -----------------------------------------------------------

export function exportCita(cita, patientName) {
  const ics = buildCalendar([citaToEvent(cita, patientName)])
  download(`cita-${slug(patientName)}.ics`, ics)
}

export function exportReminder(reminder, patientName) {
  const ics = buildCalendar([reminderToEvent(reminder, patientName)])
  download(`followup-${slug(patientName)}.ics`, ics)
}

// Exporta varios items de la Agenda (cada uno con `kind` y `patientName`) en un
// solo archivo .ics.
export function exportAgendaItems(items) {
  const events = items.map((it) =>
    it.kind === 'cita'
      ? citaToEvent(it, it.patientName)
      : reminderToEvent(it, it.patientName)
  )
  if (events.length === 0) return
  download('agenda-pacientes.ics', buildCalendar(events))
}
