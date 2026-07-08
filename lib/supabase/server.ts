import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Cliente de Supabase para el servidor (Server Components, Route Handlers, Server Actions).
// Lee la sesión del usuario desde las cookies.
export function createClient() {
  const cookieStore = cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Llamado desde un Server Component: se ignora.
            // El middleware se encarga de refrescar la sesión.
          }
        },
      },
    }
  )
}
