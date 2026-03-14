'use client'

import { useEffect, useState } from 'react'

export default function ScrollBar() {
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

  return (
    <div className="fixed right-6 top-1/2 -translate-y-1/2 z-40 hidden lg:flex flex-col items-center h-48">
      <div className="relative w-px flex-1 bg-border/40 rounded-full">
        <div
          className="absolute top-0 left-0 w-full bg-accent rounded-full transition-all duration-75"
          style={{ height: `${Math.round(progress * 100)}%` }}
        />
      </div>
    </div>
  )
}
