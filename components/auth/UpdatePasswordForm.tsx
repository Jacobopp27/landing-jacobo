'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import PasswordInput from './PasswordInput'

export default function UpdatePasswordForm() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (password !== confirm) {
      setError('Las contraseñas no coinciden.')
      return
    }

    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      setError(traducir(error.message))
      setLoading(false)
    } else {
      setDone(true)
      setTimeout(() => {
        router.push('/cuenta')
        router.refresh()
      }, 1200)
    }
  }

  if (done) {
    return (
      <div className="w-full max-w-sm text-center">
        <p className="text-accent text-lg">✅ Contraseña actualizada</p>
        <p className="mt-2 text-sm text-text-secondary">Entrando a tu cuenta…</p>
      </div>
    )
  }

  return (
    <div className="w-full max-w-sm">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-semibold text-text-primary">Nueva contraseña</h1>
        <p className="mt-2 text-sm text-text-secondary">Escribe tu nueva contraseña.</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <PasswordInput
          label="Nueva contraseña"
          value={password}
          onChange={setPassword}
          minLength={6}
          autoComplete="new-password"
          placeholder="Mínimo 6 caracteres"
        />
        <PasswordInput
          label="Confirmar contraseña"
          value={confirm}
          onChange={setConfirm}
          minLength={6}
          autoComplete="new-password"
          placeholder="Repite tu contraseña"
        />

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
          {loading ? 'Guardando…' : 'Guardar contraseña'}
        </button>
      </form>
    </div>
  )
}

function traducir(msg: string): string {
  const m = msg.toLowerCase()
  if (m.includes('should be at least')) return 'La contraseña debe tener al menos 6 caracteres.'
  if (m.includes('different from the old')) return 'La nueva contraseña debe ser distinta a la anterior.'
  if (m.includes('auth session missing') || m.includes('session'))
    return 'El enlace expiró o no es válido. Pide uno nuevo desde "¿Olvidaste tu contraseña?".'
  return msg
}
