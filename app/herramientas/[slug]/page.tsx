import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { getTool } from '@/lib/catalog'
import { canAccessTool } from '@/lib/entitlements'
import { toolComponents } from '@/components/tools/registry'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const tool = await getTool(params.slug)
  return { title: tool ? `${tool.name} — Jacobo Posada` : 'Herramienta' }
}

export default async function ToolPage({ params }: { params: { slug: string } }) {
  const tool = await getTool(params.slug)
  if (!tool) notFound()

  const access = await canAccessTool(tool)

  // No ha iniciado sesión → al login, y que vuelva aquí después.
  if (!access.ok && access.reason === 'auth') {
    redirect(`/login?next=/herramientas/${tool.slug}`)
  }

  // Logueado pero sin acceso (herramienta de pago) → pantalla de candado.
  if (!access.ok) {
    return (
      <LockedScreen
        slug={tool.slug}
        name={tool.name}
        price={tool.price}
        description={tool.description}
      />
    )
  }

  // Tiene acceso → renderiza la herramienta.
  const ToolComponent = toolComponents[tool.slug]

  // Modo página completa: la herramienta controla toda la pantalla.
  if (tool.fullPage) {
    return ToolComponent ? <ToolComponent /> : notFound()
  }

  return (
    <main className="min-h-screen max-w-3xl mx-auto px-6 py-12">
      <Nav />
      <header className="mb-8">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{tool.icon ?? '◆'}</span>
          <div>
            <h1 className="text-2xl font-semibold text-text-primary">{tool.name}</h1>
            <p className="text-sm text-text-secondary">{tool.tagline}</p>
          </div>
        </div>
      </header>

      <section className="rounded-xl border border-border bg-surface/50 p-6">
        {ToolComponent ? (
          <ToolComponent />
        ) : (
          <p className="text-text-secondary text-sm">
            Esta herramienta aún no tiene su componente registrado.
          </p>
        )}
      </section>
    </main>
  )
}

function LockedScreen({
  slug,
  name,
  price,
  description,
}: {
  slug: string
  name: string
  price: number
  description: string
}) {
  return (
    <main className="min-h-screen max-w-lg mx-auto px-6 py-16">
      <Nav />
      <div className="rounded-2xl border border-border bg-surface p-8 text-center">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-purple-dim">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2">
            <rect x="3" y="11" width="18" height="11" rx="2" />
            <path d="M7 11V7a5 5 0 0110 0v4" />
          </svg>
        </div>
        <h1 className="text-xl font-semibold text-text-primary">{name}</h1>
        <p className="mt-3 text-sm text-text-secondary leading-relaxed">{description}</p>
        <p className="mt-3 text-sm text-text-muted">
          Obtén acceso para usarla las veces que quieras desde tu cuenta.
        </p>

        <div className="mt-6 rounded-lg border border-border bg-background/50 p-4 text-left text-sm text-text-secondary">
          <p className="mb-2">
            <span className="text-text-primary font-medium">Precio: ${price}</span> — pago único.
          </p>
          <p className="text-text-muted text-xs">
            El botón de compra se activará cuando conectemos el pago. Si alguien te regaló el
            acceso, entra con el mismo email con el que te lo dieron.
          </p>
        </div>

        <button
          disabled
          className="mt-6 w-full rounded-lg bg-accent/40 text-background px-4 py-2.5 text-sm font-medium cursor-not-allowed"
        >
          Obtener acceso (próximamente)
        </button>

        <Link
          href="/herramientas"
          className="mt-4 inline-block text-sm text-accent hover:text-accent-hover"
        >
          ← Volver al catálogo
        </Link>
      </div>
    </main>
  )
}

function Nav() {
  return (
    <div className="mb-10 flex items-center justify-between">
      <Link href="/herramientas" className="text-sm text-text-secondary hover:text-accent transition-colors">
        ← Herramientas
      </Link>
      <Link href="/cuenta" className="text-sm text-text-secondary hover:text-text-primary transition-colors">
        Mi cuenta
      </Link>
    </div>
  )
}
