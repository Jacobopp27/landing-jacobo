'use client'

import { useFormStatus } from 'react-dom'
import { setToolPrice } from '@/app/admin/actions'

type ToolRow = { slug: string; name: string; icon?: string; price: number }

function SaveButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg bg-accent text-background px-3 py-2 text-sm font-medium
                 hover:bg-accent-hover transition-colors disabled:opacity-60"
    >
      {pending ? '…' : 'Guardar'}
    </button>
  )
}

export default function ToolPricing({ tools }: { tools: ToolRow[] }) {
  return (
    <div className="rounded-xl border border-border bg-surface overflow-hidden divide-y divide-border">
      {tools.map((t) => (
        <form
          key={t.slug}
          action={setToolPrice}
          className="flex flex-wrap items-center gap-3 px-5 py-4"
        >
          <input type="hidden" name="slug" value={t.slug} />

          <div className="flex items-center gap-2 flex-1 min-w-[160px]">
            <span className="text-xl">{t.icon ?? '◆'}</span>
            <span className="text-sm text-text-primary">{t.name}</span>
          </div>

          <span
            className={`text-xs font-mono px-2 py-1 rounded-md border ${
              t.price === 0
                ? 'text-green-400 border-green-500/20 bg-green-500/10'
                : 'text-purple border-purple/20 bg-purple-dim'
            }`}
          >
            {t.price === 0 ? 'Gratis' : 'De pago'}
          </span>

          <div className="flex items-center gap-1 rounded-lg border border-border bg-background px-2">
            <span className="text-text-muted text-sm">$</span>
            <input
              name="price"
              type="number"
              min={0}
              step={1}
              defaultValue={t.price}
              className="w-20 bg-transparent py-2 text-sm text-text-primary focus:outline-none"
            />
          </div>

          <SaveButton />
        </form>
      ))}
    </div>
  )
}
