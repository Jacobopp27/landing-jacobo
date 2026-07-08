'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/actualizar-clave`,
    })

    if (error) setError(error.message)
    else setSent(true)
    setLoading(false)
  }

  if (sent) {
    return (
      <div className="w-full max-w-sm text-center">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-accent-dim">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" strokeWidth="2">
            <path d="M4 4h16v16H4z" />
            <path d="M22 6l-10 7L2 6" />
          </svg>
        </div>
        <h1 className="text-xl font-semibold text-text-primary">Revisa tu correo</h1>
        <p className="mt-2 text-sm text-text-secondary">
          Si <span className="text-text-primary">{email}</span> tiene una cuenta, te enviamos un
          enlace para restablecer tu contraseña.
        </p>
        <Link href="/login" className="mt-6 inline-block text-sm text-accent hover:text-accent-hover">
          ← Volver al login
        </Link>
      </div>
    )
  }

  return (
    <div className="w-full max-w-sm">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-semibold text-text-primary">Recuperar contraseña</h1>
        <p className="mt-2 text-sm text-text-secondary">
          Te enviaremos un enlace para crear una nueva.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-mono text-text-muted">Email</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            placeholder="tu@email.com"
            className="rounded-lg bg-surface border border-border px-3 py-2.5 text-sm text-text-primary
                       placeholder:text-text-muted focus:border-accent/50 focus:outline-none
                       focus:ring-1 focus:ring-accent/30 transition-colors"
          />
        </label>

        {error && (
          <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-2 inline-flex items-center justify-center rounded-lg bg-accent text-background
                     px-4 py-2.5 text-sm font-medium hover:bg-accent-hover transition-colors
                     shadow-glow-sm disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? 'Enviando…' : 'Enviar enlace'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-text-secondary">
        <Link href="/login" className="text-accent hover:text-accent-hover">
          ← Volver al login
        </Link>
      </p>
    </div>
  )
}
