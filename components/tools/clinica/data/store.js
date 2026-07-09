// ============================================================================
//  CAPA DE DATOS — versión Supabase (integrada al marketplace)
// ----------------------------------------------------------------------------
//  Mismos nombres, misma firma y mismas Promises que la versión localStorage
//  original: los componentes no cambian. La separación por clínica es
//  automática — cada fila lleva user_id (por defecto auth.uid()) y el RLS de
//  Supabase garantiza que cada cuenta vea SOLO sus propios datos.
// ============================================================================

import { createClient } from '@/lib/supabase/client'

let _sb
function sb() {
  return (_sb ||= createClient())
}

// --- Mapeo columnas (snake_case en DB) → campos que usa la UI (camelCase) ---
function mapPatient(r) {
  if (!r) return null
  return {
    id: r.id,
    nombre: r.nombre || '',
    telefono: r.telefono || '',
    email: r.email || '',
    condicion: r.condicion || '',
    notas: r.notas || '',
    createdAt: r.created_at,
  }
}
function mapReminder(r) {
  if (!r) return null
  return {
    id: r.id,
    patientId: r.patient_id,
    fecha: r.fecha,
    hora: r.hora || '',
    motivo: r.motivo || '',
    estado: r.estado,
    createdAt: r.created_at,
  }
}
function mapCita(r) {
  if (!r) return null
  return {
    id: r.id,
    patientId: r.patient_id,
    fecha: r.fecha,
    hora: r.hora || '',
    duracion: r.duracion,
    motivo: r.motivo || '',
    estado: r.estado,
    createdAt: r.created_at,
  }
}

const s = (v) => (typeof v === 'string' ? v.trim() : v)

// ===========================================================================
//  PACIENTES
// ===========================================================================

export async function listPatients() {
  const { data, error } = await sb().from('patients').select('*').order('nombre')
  if (error) throw error
  return (data || []).map(mapPatient)
}

export async function getPatient(id) {
  const { data } = await sb().from('patients').select('*').eq('id', id).maybeSingle()
  return mapPatient(data)
}

export async function createPatient(data) {
  const row = {
    nombre: s(data.nombre) || '',
    telefono: s(data.telefono) || '',
    email: s(data.email) || '',
    condicion: s(data.condicion) || '',
    notas: s(data.notas) || '',
  }
  const { data: created, error } = await sb().from('patients').insert(row).select().single()
  if (error) throw error
  return mapPatient(created)
}

export async function updatePatient(id, data) {
  const row = {}
  for (const k of ['nombre', 'telefono', 'email', 'condicion', 'notas']) {
    if (k in data) row[k] = s(data[k])
  }
  const { data: updated, error } = await sb()
    .from('patients')
    .update(row)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return mapPatient(updated)
}

export async function deletePatient(id) {
  // El FK con ON DELETE CASCADE borra sus recordatorios y citas automáticamente.
  const { error } = await sb().from('patients').delete().eq('id', id)
  if (error) throw error
}

// ===========================================================================
//  RECORDATORIOS
// ===========================================================================

export async function listReminders({ patientId, from, to } = {}) {
  let q = sb().from('reminders').select('*')
  if (patientId) q = q.eq('patient_id', patientId)
  if (from) q = q.gte('fecha', from)
  if (to) q = q.lte('fecha', to)
  const { data, error } = await q.order('fecha').order('hora')
  if (error) throw error
  return (data || []).map(mapReminder)
}

export async function createReminder(data) {
  const row = {
    patient_id: data.patientId,
    fecha: data.fecha,
    hora: s(data.hora) || '',
    motivo: s(data.motivo) || '',
    estado: data.estado === 'hecho' ? 'hecho' : 'pendiente',
  }
  const { data: created, error } = await sb().from('reminders').insert(row).select().single()
  if (error) throw error
  return mapReminder(created)
}

export async function updateReminder(id, data) {
  const row = {}
  if ('patientId' in data) row.patient_id = data.patientId
  for (const k of ['fecha', 'hora', 'motivo', 'estado']) {
    if (k in data) row[k] = s(data[k])
  }
  const { data: updated, error } = await sb()
    .from('reminders')
    .update(row)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return mapReminder(updated)
}

export async function deleteReminder(id) {
  const { error } = await sb().from('reminders').delete().eq('id', id)
  if (error) throw error
}

// ===========================================================================
//  CITAS
// ===========================================================================

export async function listCitas({ patientId, from, to } = {}) {
  let q = sb().from('citas').select('*')
  if (patientId) q = q.eq('patient_id', patientId)
  if (from) q = q.gte('fecha', from)
  if (to) q = q.lte('fecha', to)
  const { data, error } = await q.order('fecha').order('hora')
  if (error) throw error
  return (data || []).map(mapCita)
}

export async function createCita(data) {
  const row = {
    patient_id: data.patientId,
    fecha: data.fecha,
    hora: s(data.hora) || '',
    duracion: Number(data.duracion) || 30,
    motivo: s(data.motivo) || '',
    estado: ['programada', 'atendida', 'cancelada'].includes(data.estado)
      ? data.estado
      : 'programada',
  }
  const { data: created, error } = await sb().from('citas').insert(row).select().single()
  if (error) throw error
  return mapCita(created)
}

export async function updateCita(id, data) {
  const row = {}
  if ('patientId' in data) row.patient_id = data.patientId
  for (const k of ['fecha', 'hora', 'motivo', 'estado']) {
    if (k in data) row[k] = s(data[k])
  }
  if ('duracion' in data) row.duracion = Number(data.duracion) || 30
  const { data: updated, error } = await sb()
    .from('citas')
    .update(row)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return mapCita(updated)
}

export async function deleteCita(id) {
  const { error } = await sb().from('citas').delete().eq('id', id)
  if (error) throw error
}
