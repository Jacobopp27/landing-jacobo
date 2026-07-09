'use client'

import { useFormStatus } from 'react-dom'
import { setToolPrice, setToolPublished, moveTool } from '@/app/admin/actions'

type ToolRow = {
  slug: string
  name: string
  icon?: string
  price: number
  published: boolean
}

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

function MoveButton({ slug, dir, disabled }: { slug: string; dir: 'up' | 'down'; disabled: boolean }) {
  return (
    <form action={moveTool}>
      <input type="hidden" name="slug" value={slug} />
      <input type="hidden" name="dir" value={dir} />
      <button
        type="submit"
        disabled={disabled}
        aria-label={dir === 'up' ? 'Subir' : 'Bajar'}
        className="px-1.5 leading-none text-text-muted hover:text-accent disabled:opacity-20 disabled:hover:text-text-muted transition-colors"
      >
        {dir === 'up' ? '▲' : '▼'}
      </button>
    </form>
  )
}

export default function ToolPricing({ tools }: { tools: ToolRow[] }) {
  return (
    <div className="rounded-xl border border-border bg-surface overflow-hidden divide-y divide-border">
      {tools.map((t, i) => (
        <div key={t.slug} className="flex flex-wrap items-center gap-3 px-4 py-3">
          {/* Orden */}
          <div className="flex flex-col">
            <MoveButton slug={t.slug} dir="up" disabled={i === 0} />
            <MoveButton slug={t.slug} dir="down" disabled={i === tools.length - 1} />
          </div>

          {/* Nombre */}
          <div className="flex items-center gap-2 flex-1 min-w-[140px]">
            <span className="text-xl">{t.icon ?? '◆'}</span>
            <span className={`text-sm ${t.published ? 'text-text-primary' : 'text-text-muted line-through'}`}>
              {t.name}
            </span>
          </div>

          {/* Visibilidad */}
          <form action={setToolPublished}>
            <input type="hidden" name="slug" value={t.slug} />
            <input type="hidden" name="published" value={t.published ? 'false' : 'true'} />
            <button
              type="submit"
              className={`text-xs font-mono px-2 py-1 rounded-md border transition-colors ${
                t.published
                  ? 'text-green-400 border-green-500/20 bg-green-500/10 hover:bg-green-500/20'
                  : 'text-text-muted border-border bg-background hover:text-text-secondary'
              }`}
            >
              {t.published ? '👁 Visible' : '🚫 Oculta'}
            </button>
          </form>

          {/* Precio */}
          <form action={setToolPrice} className="flex items-center gap-2">
            <input type="hidden" name="slug" value={t.slug} />
            <div className="flex items-center gap-1 rounded-lg border border-border bg-background px-2">
              <span className="text-text-muted text-sm">$</span>
              <input
                name="price"
                type="number"
                min={0}
                step={1}
                defaultValue={t.price}
                className="w-16 bg-transparent py-2 text-sm text-text-primary focus:outline-none"
              />
            </div>
            <SaveButton />
          </form>
        </div>
      ))}
    </div>
  )
}
