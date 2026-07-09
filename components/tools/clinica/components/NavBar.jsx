// Navegación de la app: barra lateral en desktop, barra inferior en móvil.
// `items` = [{ key, label, icon }]. `active` y `onChange` controlan la sección.

function IconPacientes() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}

function IconAgenda() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" />
    </svg>
  )
}

const ICONS = { pacientes: IconPacientes, agenda: IconAgenda }

function Logo() {
  return (
    <div className="flex items-center gap-2">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white shadow-sm">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" />
          <path d="M9 16l2 2 4-4" />
        </svg>
      </div>
      <div className="leading-tight">
        <p className="text-sm font-bold text-slate-800">Agenda</p>
        <p className="text-xs text-slate-400">de Pacientes</p>
      </div>
    </div>
  )
}

// Barra lateral (desktop, md+). Fija a la izquierda.
export function Sidebar({ items, active, onChange }) {
  return (
    <aside className="fixed inset-y-0 left-0 hidden w-60 flex-col border-r border-slate-200 bg-white px-4 py-5 md:flex">
      <div className="px-2">
        <Logo />
      </div>
      <nav className="mt-8 flex flex-1 flex-col gap-1">
        {items.map((it) => {
          const Icon = ICONS[it.key]
          const isActive = active === it.key
          return (
            <button
              key={it.key}
              onClick={() => onChange(it.key)}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-brand-50 text-brand-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
              }`}
            >
              <Icon />
              {it.label}
            </button>
          )
        })}
      </nav>
      <p className="px-3 text-[11px] leading-snug text-slate-300">
        Datos guardados en la nube · privados de tu cuenta
      </p>
    </aside>
  )
}

// Barra inferior (móvil).
export function BottomNav({ items, active, onChange }) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 flex border-t border-slate-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
      {items.map((it) => {
        const Icon = ICONS[it.key]
        const isActive = active === it.key
        return (
          <button
            key={it.key}
            onClick={() => onChange(it.key)}
            className={`flex flex-1 flex-col items-center gap-1 py-2.5 text-xs font-medium transition-colors ${
              isActive ? 'text-brand-700' : 'text-slate-400'
            }`}
          >
            <Icon />
            {it.label}
          </button>
        )
      })}
    </nav>
  )
}

// Encabezado compacto solo para móvil (en desktop el logo vive en la sidebar).
export function MobileHeader() {
  return (
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur md:hidden">
      <Logo />
    </header>
  )
}
