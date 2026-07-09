'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
// @ts-ignore — App es un componente .jsx (sin tipos), se resuelve por allowJs.
import App from './App'

// Entrada de la herramienta "Agenda de Pacientes".
// La app real solo se monta en el navegador (gate `mounted`).
export default function AgendaPacientes() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  if (!mounted) return <div className="min-h-screen bg-slate-50" />

  return (
    <div className="relative">
      <Link
        href="/herramientas"
        className="fixed top-3 right-3 z-50 rounded-md bg-white/90 px-2.5 py-1 text-xs font-semibold
                   text-slate-500 shadow-sm ring-1 ring-slate-200 hover:text-slate-800"
      >
        ← Herramientas
      </Link>
      <App />
    </div>
  )
}
