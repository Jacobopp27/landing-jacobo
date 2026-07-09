import Link from 'next/link'
import { getCatalog } from '@/lib/catalog'
import { getUser, getUserEntitlements } from '@/lib/entitlements'
import { isAdminEmail } from '@/lib/admin'
import ToolCard from '@/components/tools/ToolCard'

export const metadata = {
  title: 'Herramientas — Jacobo Posada',
  description: 'Herramientas web útiles. Úsalas directamente desde tu cuenta.',
}
export const dynamic = 'force-dynamic'

export default async function ToolsPage() {
  const tools = (await getCatalog()).filter((t) => t.published !== false)
  const user = await getUser()
  const entitlements = user ? await getUserEntitlements() : []
  const admin = isAdminEmail(user?.email)

  function stateFor(price: number, slug: string): 'open' | 'locked' | 'login' {
    if (price === 0) return 'open' // gratis = pública
    if (!user) return 'login'
    if (admin || entitlements.includes(slug)) return 'open'
    return 'locked'
  }

  return (
    <main className="min-h-screen bg-hero-glow">
      {/* Barra superior */}
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link
          href="/"
          className="font-mono text-sm text-text-secondary hover:text-accent transition-colors"
        >
          <span className="text-accent">~/</span>jacoboposada
        </Link>
        <Link
          href={user ? '/cuenta' : '/login'}
          className="text-sm text-text-secondary hover:text-text-primary transition-colors"
        >
          {user ? 'Mi cuenta' : 'Iniciar sesión'}
        </Link>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12">
        <header className="mb-12 max-w-2xl">
          <span className="text-xs font-mono text-accent tracking-wide">HERRAMIENTAS</span>
          <h1 className="mt-2 text-4xl font-bold text-text-primary">
            Herramientas útiles, listas para usar
          </h1>
          <p className="mt-4 text-text-secondary leading-relaxed">
            Herramientas web que puedes usar directamente desde tu cuenta. Algunas son gratis;
            otras se obtienen con un pago único. Las que compres o te regale quedan siempre
            disponibles en tu cuenta.
          </p>
        </header>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool, i) => (
            <ToolCard key={tool.slug} tool={tool} state={stateFor(tool.price, tool.slug)} index={i} />
          ))}
        </div>
      </div>
    </main>
  )
}
