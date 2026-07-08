'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import type { Tool } from '@/data/tools'

type Props = {
  tool: Tool
  /** Estado del usuario frente a esta herramienta. */
  state: 'open' | 'locked' | 'login'
  index?: number
}

export default function ToolCard({ tool, state, index = 0 }: Props) {
  const cta =
    state === 'open'
      ? { label: 'Abrir herramienta', sub: null }
      : state === 'login'
        ? { label: tool.price === 0 ? 'Entrar para usar' : `Obtener · $${tool.price}`, sub: null }
        : { label: `Obtener · $${tool.price}`, sub: 'No tienes acceso todavía' }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className="group relative flex flex-col bg-surface border border-border rounded-xl overflow-hidden
                 shadow-card hover:shadow-card-hover hover:border-accent/30 transition-all duration-300"
    >
      <div className="h-px w-full bg-gradient-to-r from-transparent via-accent/40 to-transparent
                      opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="flex flex-col flex-1 p-6 gap-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{tool.icon ?? '◆'}</span>
            <div className="flex flex-col">
              <span className="text-xs font-mono text-text-muted tracking-wide">{tool.category}</span>
              <h3 className="text-lg font-semibold text-text-primary group-hover:text-accent transition-colors">
                {tool.name}
              </h3>
            </div>
          </div>
          <span
            className={`shrink-0 text-xs font-mono px-2 py-1 rounded-md border ${
              tool.price === 0
                ? 'text-green-400 border-green-500/20 bg-green-500/10'
                : 'text-purple border-purple/20 bg-purple-dim'
            }`}
          >
            {tool.price === 0 ? 'Gratis' : `$${tool.price}`}
          </span>
        </div>

        <p className="text-text-secondary text-sm leading-relaxed flex-1">{tool.tagline}</p>

        <div className="pt-3 border-t border-border">
          <Link
            href={`/herramientas/${tool.slug}`}
            className="inline-flex items-center gap-2 text-sm font-medium text-accent hover:text-accent-hover transition-colors"
          >
            {state === 'locked' && (
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0110 0v4" />
              </svg>
            )}
            {cta.label}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
          {cta.sub && <p className="mt-1 text-[11px] text-text-muted">{cta.sub}</p>}
        </div>
      </div>
    </motion.div>
  )
}
