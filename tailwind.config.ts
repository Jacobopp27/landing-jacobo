import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#0a0a0f',
        surface: '#111118',
        'surface-2': '#17171f',
        border: '#1e1e2e',
        'border-2': '#2a2a3e',
        'text-primary': '#e2e2f0',
        'text-secondary': '#8888aa',
        'text-muted': '#4a4a6a',
        accent: '#06b6d4',
        'accent-hover': '#0891b2',
        'accent-dim': 'rgba(6, 182, 212, 0.1)',
        'accent-glow': 'rgba(6, 182, 212, 0.15)',
        purple: '#8b5cf6',
        'purple-dim': 'rgba(139, 92, 246, 0.1)',
        // Paleta "brand" (azul clínico) usada por la herramienta Agenda de Pacientes.
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-fira)', 'Menlo', 'Monaco', 'monospace'],
      },
      backgroundImage: {
        'grid-pattern':
          'linear-gradient(rgba(6,182,212,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,0.03) 1px, transparent 1px)',
        'hero-glow':
          'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(6,182,212,0.12), transparent)',
        'section-glow':
          'radial-gradient(ellipse 60% 40% at 50% 100%, rgba(139,92,246,0.08), transparent)',
      },
      backgroundSize: {
        'grid-pattern': '60px 60px',
      },
      animation: {
        'fade-up': 'fadeUp 0.6s ease forwards',
        'fade-in': 'fadeIn 0.5s ease forwards',
        pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow-pulse': 'glowPulse 3s ease-in-out infinite',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        glowPulse: {
          '0%, 100%': { opacity: '0.6' },
          '50%': { opacity: '1' },
        },
      },
      boxShadow: {
        'card': '0 1px 3px rgba(0,0,0,0.4), 0 0 0 1px rgba(30,30,46,0.8)',
        'card-hover':
          '0 4px 20px rgba(0,0,0,0.5), 0 0 0 1px rgba(6,182,212,0.2), 0 0 30px rgba(6,182,212,0.05)',
        'glow-sm': '0 0 20px rgba(6,182,212,0.15)',
        'glow-md': '0 0 40px rgba(6,182,212,0.2)',
        'inner-glow': 'inset 0 1px 0 rgba(255,255,255,0.05)',
      },
    },
  },
  plugins: [],
}

export default config
