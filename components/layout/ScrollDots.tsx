'use client'

import { useEffect, useState } from 'react'

const sections = [
  { id: 'hero', label: 'Home' },
  { id: 'projects', label: 'Work' },
  { id: 'stack', label: 'Stack' },
  { id: 'experience', label: 'Experience' },
  { id: 'contact', label: 'Contact' },
]

export default function ScrollDots() {
  const [active, setActive] = useState('hero')

  useEffect(() => {
    const observers: IntersectionObserver[] = []

    sections.forEach(({ id }) => {
      const el = document.getElementById(id)
      if (!el) return

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActive(id)
        },
        { rootMargin: '-40% 0px -40% 0px', threshold: 0 }
      )
      observer.observe(el)
      observers.push(observer)
    })

    return () => observers.forEach((o) => o.disconnect())
  }, [])

  return (
    <nav
      className="fixed right-6 top-1/2 -translate-y-1/2 z-40 hidden lg:flex flex-col items-center gap-3"
      aria-label="Page sections"
    >
      {sections.map(({ id, label }) => {
        const isActive = active === id
        return (
          <a
            key={id}
            href={`#${id}`}
            aria-label={label}
            className="group relative flex items-center justify-end gap-2"
          >
            {/* Label — appears on hover */}
            <span
              className={`absolute right-5 font-mono text-[10px] tracking-widest uppercase whitespace-nowrap
                          transition-all duration-200 opacity-0 group-hover:opacity-100 translate-x-1 group-hover:translate-x-0
                          ${isActive ? 'text-accent' : 'text-text-muted'}`}
            >
              {label}
            </span>

            {/* Dot */}
            <span
              className={`block rounded-full transition-all duration-300
                          ${isActive
                            ? 'w-2 h-2 bg-accent shadow-[0_0_6px_rgba(6,182,212,0.8)]'
                            : 'w-1.5 h-1.5 bg-border group-hover:bg-text-muted'
                          }`}
            />
          </a>
        )
      })}
    </nav>
  )
}
