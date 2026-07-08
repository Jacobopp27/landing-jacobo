import { Suspense } from 'react'
import Link from 'next/link'
import UpdatePasswordForm from '@/components/auth/UpdatePasswordForm'

export const metadata = { title: 'Nueva contraseña — Jacobo Posada' }

export default function UpdatePasswordPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 bg-hero-glow">
      <Link
        href="/"
        className="mb-10 font-mono text-sm text-text-secondary hover:text-accent transition-colors"
      >
        <span className="text-accent">~/</span>jacoboposada
      </Link>
      <Suspense>
        <UpdatePasswordForm />
      </Suspense>
    </main>
  )
}
