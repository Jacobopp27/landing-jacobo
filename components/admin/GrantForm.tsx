'use client'

import { useEffect, useRef } from 'react'
import { useFormState, useFormStatus } from 'react-dom'
import { grantAccess } from '@/app/admin/actions'
import { tools } from '@/data/tools'

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg bg-accent text-background px-4 py-2.5 text-sm font-medium
                 hover:bg-accent-hover transition-colors shadow-glow-sm
                 disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {pending ? 'Otorgando…' : 'Dar acceso'}
    </button>
  )
}

export default function GrantForm() {
  const [state, formAction] = useFormState(grantAccess, null)
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (state?.ok) formRef.current?.reset()
  }, [state])

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-mono text-text-muted">Email de la persona</span>
          <input
            name="email"
            type="email"
            required
            placeholder="persona@email.com"
            className="rounded-lg bg-surface border border-border px-3 py-2.5 text-sm text-text-primary
                       placeholder:text-text-muted focus:border-accent/50 focus:outline-none
                       focus:ring-1 focus:ring-accent/30 transition-colors"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-mono text-text-muted">Herramienta</span>
          <select
            name="toolSlug"
            required
            defaultValue=""
            className="rounded-lg bg-surface border border-border px-3 py-2.5 text-sm text-text-primary
                       focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/30 transition-colors"
          >
            <option value="" disabled>
              Elige…
            </option>
            {tools.map((t) => (
              <option key={t.slug} value={t.slug}>
                {t.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="flex items-center gap-4">
        <SubmitButton />
        {state && (
          <p className={`text-sm ${state.ok ? 'text-accent' : 'text-red-400'}`}>{state.message}</p>
        )}
      </div>

      <p className="text-xs text-text-muted">
        💡 Puedes dar acceso a un email aunque la persona todavía no se haya registrado. Cuando cree
        su cuenta con ese mismo email, el acceso ya estará esperándola.
      </p>
    </form>
  )
}
