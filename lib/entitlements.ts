import { createClient } from '@/lib/supabase/server'
import { isAdminEmail } from '@/lib/admin'
import type { Tool } from '@/data/tools'

// Usuario actual (o null si no hay sesión).
export async function getUser() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

// Lista de slugs a los que el usuario actual tiene acceso (comprado o regalado).
// La consulta está protegida por RLS: solo devuelve las filas del email del usuario.
export async function getUserEntitlements(): Promise<string[]> {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user?.email) return []

  const { data, error } = await supabase
    .from('entitlements')
    .select('tool_slug')
    .eq('email', user.email)

  if (error) return []
  return data.map((row) => row.tool_slug)
}

export type AccessResult =
  | { ok: true }
  | { ok: false; reason: 'auth' } // no ha iniciado sesión
  | { ok: false; reason: 'entitlement' } // logueado pero sin acceso a esta herramienta

// Decide si el usuario actual puede usar una herramienta.
export async function canAccessTool(tool: Tool): Promise<AccessResult> {
  // Gratis: pública, cualquiera la usa sin necesidad de cuenta.
  if (tool.price === 0) return { ok: true }

  const user = await getUser()
  if (!user) return { ok: false, reason: 'auth' }

  // El admin (dueño) tiene acceso a todas las herramientas.
  if (isAdminEmail(user.email)) return { ok: true }

  // De pago: requiere un acceso registrado.
  const entitlements = await getUserEntitlements()
  return entitlements.includes(tool.slug)
    ? { ok: true }
    : { ok: false, reason: 'entitlement' }
}
