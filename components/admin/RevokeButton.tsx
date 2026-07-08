'use client'

import { useFormStatus } from 'react-dom'
import { revokeAccess } from '@/app/admin/actions'

function Btn() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="text-xs text-text-muted hover:text-red-400 transition-colors disabled:opacity-50"
    >
      {pending ? 'Quitando…' : 'Quitar'}
    </button>
  )
}

export default function RevokeButton({ id }: { id: string }) {
  return (
    <form action={revokeAccess}>
      <input type="hidden" name="id" value={id} />
      <Btn />
    </form>
  )
}
