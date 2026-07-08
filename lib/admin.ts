// ¿Este email está en la lista de administradores? (ADMIN_EMAILS en .env.local)
export function isAdminEmail(email?: string | null): boolean {
  if (!email) return false
  const admins = (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
  return admins.includes(email.toLowerCase())
}

// ¿Ya está configurada la service_role key? (sin ella el panel no puede escribir)
export function hasServiceKey(): boolean {
  const k = process.env.SUPABASE_SERVICE_ROLE_KEY
  return !!k && k !== 'PEGA_AQUI_TU_SERVICE_ROLE_KEY'
}
