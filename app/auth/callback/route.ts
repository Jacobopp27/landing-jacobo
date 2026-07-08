import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Recibe el enlace de confirmación de email / magic link y canjea el código
// por una sesión, luego redirige a donde el usuario iba.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/cuenta'

  if (code) {
    const supabase = createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`)
}
