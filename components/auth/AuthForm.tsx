'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import PasswordInput from './PasswordInput'

type Mode = 'login' | 'signup'

export default function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get('next') || '/cuenta'

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)

  const isSignup = mode === 'signup'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setInfo(null)

    if (isSignup && password !== confirm) {
      setError('Las contraseñas no coinciden.')
      return
    }

    setLoading(true)
    const supabase = createClient()

    if (isSignup) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: name.trim(), phone: phone.trim() },
          emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
        },
      })
      if (error) {
        setError(traducirError(error.message))
      } else if (data.session) {
        router.push(next)
        router.refresh()
      } else {
        setInfo('¡Casi listo! Te enviamos un correo para confirmar tu cuenta. Ábrelo y haz clic en el enlace.')
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setError(traducirError(error.message))
      } else {
        router.push(next)
        router.refresh()
      }
    }

    setLoading(false)
  }

  return (
    <div className="w-full max-w-sm">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-semibold text-text-primary">
          {isSignup ? 'Crea tu cuenta' : 'Inicia sesión'}
        </h1>
        <p className="mt-2 text-sm text-text-secondary">
          {isSignup ? 'Para acceder a tus herramientas.' : 'Bienvenido de vuelta.'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {isSignup && (
          <>
            <TextField
              label="Nombre"
              type="text"
              value={name}
              onChange={setName}
              autoComplete="name"
              placeholder="Tu nombre"
            />
            <TextField
              label="Número de celular"
              type="tel"
              value={phone}
              onChange={setPhone}
              autoComplete="tel"
              placeholder="+57 300 000 0000"
            />
          </>
        )}

        <TextField
          label="Email"
          type="email"
          value={email}
          onChange={setEmail}
          autoComplete="email"
          placeholder="tu@email.com"
        />

        <PasswordInput
          label="Contraseña"
          value={password}
          onChange={setPassword}
          minLength={6}
          autoComplete={isSignup ? 'new-password' : 'current-password'}
          placeholder={isSignup ? 'Mínimo 6 caracteres' : 'Tu contraseña'}
        />

        {isSignup && (
          <PasswordInput
            label="Confirmar contraseña"
            value={confirm}
            onChange={setConfirm}
            minLength={6}
            autoComplete="new-password"
            placeholder="Repite tu contraseña"
          />
        )}

        {!isSignup && (
          <div className="-mt-1 text-right">
            <Link href="/recuperar" className="text-xs text-text-muted hover:text-accent transition-colors">
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
        )}

        {error && (
          <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
            {error}
          </p>
        )}
        {info && (
          <p className="text-sm text-accent bg-accent-dim border border-accent/20 rounded-lg px-3 py-2">
            {info}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-2 inline-flex items-center justify-center rounded-lg bg-accent text-background
                     px-4 py-2.5 text-sm font-medium hover:bg-accent-hover transition-colors
                     shadow-glow-sm disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? 'Un momento…' : isSignup ? 'Crear cuenta' : 'Entrar'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-text-secondary">
        {isSignup ? (
          <>
            ¿Ya tienes cuenta?{' '}
            <Link href="/login" className="text-accent hover:text-accent-hover">
              Inicia sesión
            </Link>
          </>
        ) : (
          <>
            ¿No tienes cuenta?{' '}
            <Link href="/signup" className="text-accent hover:text-accent-hover">
              Regístrate
            </Link>
          </>
        )}
      </p>
    </div>
  )
}

// Campo de texto simple reutilizable.
function TextField({
  label,
  type,
  value,
  onChange,
  autoComplete,
  placeholder,
}: {
  label: string
  type: string
  value: string
  onChange: (v: string) => void
  autoComplete?: string
  placeholder?: string
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-mono text-text-muted">{label}</span>
      <input
        type={type}
        required
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        placeholder={placeholder}
        className="rounded-lg bg-surface border border-border px-3 py-2.5 text-sm text-text-primary
                   placeholder:text-text-muted focus:border-accent/50 focus:outline-none
                   focus:ring-1 focus:ring-accent/30 transition-colors"
      />
    </label>
  )
}

function traducirError(msg: string): string {
  const m = msg.toLowerCase()
  if (m.includes('invalid login credentials')) return 'Email o contraseña incorrectos.'
  if (m.includes('user already registered')) return 'Ese email ya tiene una cuenta. Inicia sesión.'
  if (m.includes('password should be at least')) return 'La contraseña debe tener al menos 6 caracteres.'
  if (m.includes('email not confirmed')) return 'Confirma tu email primero (revisa tu correo).'
  if (m.includes('unable to validate email') || m.includes('invalid')) return 'Revisa que el email y los datos sean válidos.'
  return msg
}
