'use client'

import { useState } from 'react'

// Herramienta de ejemplo (placeholder). Cuando construyas una herramienta real,
// creas un componente como este y lo registras en registry.tsx.
export default function DemoTool() {
  const [text, setText] = useState('')

  const words = text.trim() ? text.trim().split(/\s+/).length : 0
  const chars = text.length

  return (
    <div className="flex flex-col gap-4">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={6}
        placeholder="Escribe algo aquí…"
        className="w-full rounded-lg bg-surface border border-border px-4 py-3 text-sm text-text-primary
                   placeholder:text-text-muted focus:border-accent/50 focus:outline-none
                   focus:ring-1 focus:ring-accent/30 transition-colors resize-y"
      />

      <div className="grid grid-cols-2 gap-4">
        <Stat label="Palabras" value={words} />
        <Stat label="Caracteres" value={chars} />
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setText((t) => t.toUpperCase())}
          className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-secondary hover:text-accent hover:border-accent/30 transition-colors"
        >
          MAYÚSCULAS
        </button>
        <button
          onClick={() => setText((t) => t.toLowerCase())}
          className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-secondary hover:text-accent hover:border-accent/30 transition-colors"
        >
          minúsculas
        </button>
        <button
          onClick={() => setText('')}
          className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-secondary hover:text-red-400 hover:border-red-500/30 transition-colors"
        >
          Limpiar
        </button>
      </div>

      <p className="text-xs text-text-muted">
        🧪 Esta es una herramienta de ejemplo. Aquí es donde vivirá la funcionalidad real de cada
        herramienta que construyas.
      </p>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-border bg-surface p-4 text-center">
      <div className="text-2xl font-semibold text-accent">{value}</div>
      <div className="text-xs text-text-muted mt-1">{label}</div>
    </div>
  )
}
