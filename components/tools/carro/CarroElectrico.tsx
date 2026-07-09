'use client'

import dynamic from 'next/dynamic'
import Link from 'next/link'

// Leaflet usa `window` al importarse → no puede correr en SSR.
// Con ssr:false, la app (y el mapa) se cargan SOLO en el navegador.
const App = dynamic(() => import('./App'), {
  ssr: false,
  loading: () => (
    <div
      style={{
        minHeight: '100vh',
        background: '#0b1020',
        color: '#64748b',
        display: 'grid',
        placeItems: 'center',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      Cargando mapa…
    </div>
  ),
})

export default function CarroElectrico() {
  return (
    <div className="carro-app">
      <Link
        href="/herramientas"
        className="fixed top-3 right-3 z-[1001] rounded-md bg-slate-900/90 px-2.5 py-1 text-xs
                   font-semibold text-slate-300 ring-1 ring-slate-700 hover:text-white transition-colors"
      >
        ← Herramientas
      </Link>
      <App />
    </div>
  )
}
