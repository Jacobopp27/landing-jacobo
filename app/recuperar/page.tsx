import { Suspense } from 'react'
import Link from 'next/link'
import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm'

export const metadata = { title: 'Recuperar contraseña — Jacobo Posada' }

export default function RecoverPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 bg-hero-glow">
      <Link
        href="/"
        className="mb-10 font-mono text-sm text-text-secondary hover:text-accent transition-colors"
      >
        <span className="text-accent">~/</span>jacoboposada
      </Link>
      <Suspense>
        <ForgotPasswordForm />
      </Suspense>
    </main>
  )
}
