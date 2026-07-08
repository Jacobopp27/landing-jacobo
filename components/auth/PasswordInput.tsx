'use client'

import { useState } from 'react'

type Props = {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  autoComplete?: string
  minLength?: number
  required?: boolean
}

// Campo de contraseña con botón de ojito para ver/ocultar.
export default function PasswordInput({
  label,
  value,
  onChange,
  placeholder,
  autoComplete = 'current-password',
  minLength,
  required = true,
}: Props) {
  const [show, setShow] = useState(false)

  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-mono text-text-muted">{label}</span>
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          required={required}
          minLength={minLength}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          placeholder={placeholder}
          className="w-full rounded-lg bg-surface border border-border px-3 py-2.5 pr-10 text-sm text-text-primary
                     placeholder:text-text-muted focus:border-accent/50 focus:outline-none
                     focus:ring-1 focus:ring-accent/30 transition-colors"
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          aria-label={show ? 'Ocultar contraseña' : 'Ver contraseña'}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-text-muted hover:text-accent transition-colors"
        >
          {show ? (
            // ojo tachado
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9.88 9.88a3 3 0 104.24 4.24" />
              <path d="M10.73 5.08A10.43 10.43 0 0112 5c7 0 10 7 10 7a13.16 13.16 0 01-1.67 2.68" />
              <path d="M6.61 6.61A13.526 13.526 0 002 12s3 7 10 7a9.74 9.74 0 005.39-1.61" />
              <line x1="2" y1="2" x2="22" y2="22" />
            </svg>
          ) : (
            // ojo abierto
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          )}
        </button>
      </div>
    </label>
  )
}
