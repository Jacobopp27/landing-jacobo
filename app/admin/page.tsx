import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getUser } from '@/lib/entitlements'
import { isAdminEmail, hasServiceKey } from '@/lib/admin'
import { createAdminClient } from '@/lib/supabase/admin'
import { getToolBySlug } from '@/data/tools'
import { getCatalog } from '@/lib/catalog'
import GrantForm from '@/components/admin/GrantForm'
import RevokeButton from '@/components/admin/RevokeButton'
import ToolPricing from '@/components/admin/ToolPricing'

export const metadata = { title: 'Panel — Jacobo Posada' }
export const dynamic = 'force-dynamic'

type Entitlement = {
  id: string
  email: string
  tool_slug: string
  source: string
  created_at: string
}

export default async function AdminPage() {
  const user = await getUser()

  // Si no es admin, ni siquiera revelamos que la página existe.
  if (!isAdminEmail(user?.email)) notFound()

  const serviceReady = hasServiceKey()
  let grants: Entitlement[] = []

  if (serviceReady) {
    const admin = createAdminClient()
    const { data } = await admin
      .from('entitlements')
      .select('*')
      .order('created_at', { ascending: false })
    grants = (data as Entitlement[]) ?? []
  }

  const catalog = await getCatalog()

  return (
    <main className="min-h-screen max-w-3xl mx-auto px-6 py-16">
      <div className="flex items-center justify-between mb-12">
        <Link href="/" className="font-mono text-sm text-text-secondary hover:text-accent transition-colors">
          <span className="text-accent">~/</span>jacoboposada
        </Link>
        <Link href="/cuenta" className="text-sm text-text-secondary hover:text-text-primary transition-colors">
          Mi cuenta
        </Link>
      </div>

      <header className="mb-10">
        <span className="text-xs font-mono text-accent tracking-wide">PANEL PRIVADO</span>
        <h1 className="mt-2 text-3xl font-semibold text-text-primary">🎁 Regalar acceso</h1>
        <p className="mt-2 text-sm text-text-secondary">
          Da acceso gratis a una herramienta por email — para quien la pidió en TikTok.
        </p>
      </header>

      {!serviceReady && (
        <div className="mb-8 rounded-xl border border-orange-500/30 bg-orange-500/10 p-5 text-sm">
          <p className="text-orange-300 font-medium">Falta un paso para activar el panel</p>
          <p className="mt-1 text-text-secondary">
            Agrega tu <span className="font-mono text-text-primary">SUPABASE_SERVICE_ROLE_KEY</span> en el
            archivo <span className="font-mono text-text-primary">.env.local</span> (la sacas de Supabase →
            Settings → API → <span className="font-mono">service_role</span>) y reinicia el servidor.
          </p>
        </div>
      )}

      {/* Formulario para dar acceso */}
      <section className="rounded-xl border border-border bg-surface p-6 mb-10">
        <GrantForm />
      </section>

      {/* Precios de las herramientas */}
      <section className="mb-10">
        <h2 className="text-lg font-medium text-text-primary mb-1">Precios de herramientas</h2>
        <p className="text-sm text-text-secondary mb-4">
          Pon <span className="text-text-primary">0</span> para dejarla <span className="text-green-400">gratis</span>,
          o un precio para hacerla de pago.
        </p>
        <ToolPricing
          tools={catalog.map((t) => ({ slug: t.slug, name: t.name, icon: t.icon, price: t.price }))}
        />
        <p className="mt-3 text-xs text-text-muted">
          ⚠️ Cuando conectemos el pago, el precio de las herramientas de pago debe coincidir con el
          del producto en Lemon Squeezy.
        </p>
      </section>

      {/* Lista de accesos otorgados */}
      <section>
        <h2 className="text-lg font-medium text-text-primary mb-4">
          Accesos otorgados {grants.length > 0 && <span className="text-text-muted">({grants.length})</span>}
        </h2>

        {grants.length === 0 ? (
          <div className="rounded-xl border border-border bg-surface p-8 text-center text-text-secondary text-sm">
            Todavía no has dado ningún acceso.
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-surface overflow-hidden divide-y divide-border">
            {grants.map((g) => {
              const tool = getToolBySlug(g.tool_slug)
              return (
                <div key={g.id} className="flex items-center gap-4 px-5 py-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-text-primary truncate">{g.email}</p>
                    <p className="text-xs text-text-muted">
                      {tool?.name ?? g.tool_slug}
                      {' · '}
                      <span className={g.source === 'purchase' ? 'text-green-400' : 'text-purple'}>
                        {g.source === 'purchase' ? 'comprado' : 'regalado'}
                      </span>
                    </p>
                  </div>
                  <RevokeButton id={g.id} />
                </div>
              )
            })}
          </div>
        )}
      </section>
    </main>
  )
}
