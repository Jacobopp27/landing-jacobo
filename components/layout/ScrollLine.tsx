'use client'

import { useEffect, useState } from 'react'

export default function ScrollLine() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const update = () => {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      setProgress(docHeight > 0 ? scrollTop / docHeight : 0)
    }
    window.addEventListener('scroll', update, { passive: true })
    update()
    return () => window.removeEventListener('scroll', update)
  }, [])

  const pct = Math.round(progress * 100)

  return (
    <div className="fixed left-6 top-1/2 -translate-y-1/2 z-40 hidden lg:flex flex-col items-center gap-0 h-48">
      {/* Track */}
      <div className="relative w-px flex-1 bg-border/40 rounded-full overflow-visible">
        {/* Filled portion */}
        <div
          className="absolute top-0 left-0 w-full bg-accent rounded-full transition-all duration-75"
          style={{ height: `${pct}%` }}
        />
        {/* Glowing dot */}
        <div
          className="absolute left-1/2 -translate-x-1/2 w-2 h-2 -ml-px rounded-full bg-accent
                     shadow-[0_0_8px_rgba(6,182,212,0.9)] transition-all duration-75"
          style={{ top: `calc(${pct}% - 4px)` }}
        />
      </div>
    </div>
  )
}
