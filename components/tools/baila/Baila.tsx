'use client'

import { useState } from 'react'
import Link from 'next/link'

// Herramienta vanilla (HTML/JS + cámara + MediaPipe) servida estática desde
// /public y embebida en un iframe. Primero mostramos cómo se usa; al pulsar
// "Comenzar" se carga el iframe (y ahí el navegador pide permiso de cámara).
export default function Baila() {
  const [started, setStarted] = useState(false)

  if (started) {
    return (
      <div className="fixed inset-0 bg-black">
        <Link
          href="/herramientas"
          className="fixed top-3 right-3 z-[1001] rounded-md bg-black/70 px-2.5 py-1 text-xs
                     font-semibold text-white/80 ring-1 ring-white/20 hover:text-white transition-colors"
        >
          ← Herramientas
        </Link>
        <iframe
          src="/tools/baila/index.html"
          title="Baila — feedback de ritmo"
          allow="camera; fullscreen"
          className="h-full w-full border-0"
        />
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-background bg-hero-glow text-text-primary px-6 py-10">
      <div className="mx-auto max-w-lg">
        <Link href="/herramientas" className="text-sm text-text-secondary hover:text-accent transition-colors">
          ← Herramientas
        </Link>

        <div className="mt-6 rounded-2xl border border-border bg-surface p-8">
          <div className="text-4xl">💃</div>
          <h1 className="mt-3 text-2xl font-semibold text-text-primary">Baila — feedback de ritmo en vivo</h1>
          <p className="mt-2 text-sm text-text-secondary leading-relaxed">
            Practica coreografías frente a tu cámara y recibe feedback en tiempo real, estilo Just
            Dance. Compara tus movimientos con un video de referencia usando IA de detección de pose.
          </p>

          <h2 className="mt-6 text-sm font-mono text-accent tracking-wide">CÓMO SE USA</h2>
          <ol className="mt-3 flex flex-col gap-3 text-sm text-text-secondary">
            <li>
              <span className="text-text-primary font-medium">1. Añade una coreografía</span> — sube el
              video donde está bien hecha y ponle nombre. Se analiza una sola vez (extrae los
              movimientos con IA).
            </li>
            <li>
              <span className="text-text-primary font-medium">2. Practica</span> — el video de
              referencia suena con su música mientras tu cámara te graba.
            </li>
            <li>
              <span className="text-text-primary font-medium">3. Semáforo en vivo</span> — 🟢 vas bien ·
              🟡 vas tarde o adelantada · 🔴 el movimiento no coincide (te dice qué articulación revisar).
            </li>
            <li>
              <span className="text-text-primary font-medium">4. Resumen</span> — al terminar ves tu
              precisión promedio y tu mejor marca.
            </li>
          </ol>

          <div className="mt-6 rounded-lg border border-border bg-background/50 p-4 text-xs text-text-muted leading-relaxed">
            <p className="text-text-secondary font-medium mb-1">Para que funcione bien:</p>
            💡 Buena iluminación y sal de <span className="text-text-secondary">cuerpo completo</span> (cabeza a pies) ·
            📷 concede permiso de <span className="text-text-secondary">cámara</span> ·
            🌐 necesita <span className="text-text-secondary">internet la primera vez</span> (carga el modelo de IA).
          </div>

          <button
            onClick={() => setStarted(true)}
            className="mt-6 w-full rounded-lg bg-accent text-background px-4 py-3 text-sm font-semibold
                       hover:bg-accent-hover transition-colors shadow-glow-sm"
          >
            Comenzar 💃
          </button>

          <p className="mt-3 text-center text-xs text-text-muted">
            Todo corre en tu navegador · tus videos se guardan solo en este dispositivo.
          </p>
        </div>
      </div>
    </main>
  )
}
