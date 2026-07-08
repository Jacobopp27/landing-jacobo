import { Suspense } from 'react'
import Link from 'next/link'
import AuthForm from '@/components/auth/AuthForm'

export const metadata = { title: 'Crear cuenta — Jacobo Posada' }

export default function SignupPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 bg-hero-glow">
      <Link
        href="/"
        className="mb-10 font-mono text-sm text-text-secondary hover:text-accent transition-colors"
      >
        <span className="text-accent">~/</span>jacoboposada
      </Link>
      <Suspense>
        <AuthForm mode="signup" />
      </Suspense>
    </main>
  )
}
