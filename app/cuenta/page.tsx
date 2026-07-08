import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getUser, getUserEntitlements } from '@/lib/entitlements'
import { isAdminEmail } from '@/lib/admin'
import { getCatalog } from '@/lib/catalog'
import SignOutButton from '@/components/account/SignOutButton'

export const metadata = { title: 'Mi cuenta — Jacobo Posada' }
export const dynamic = 'force-dynamic'

export default async function AccountPage() {
  const user = await getUser()
  if (!user) redirect('/login?next=/cuenta')

  const entitlements = await getUserEntitlements()
  const admin = isAdminEmail(user.email)
  const tools = await getCatalog()

  // Herramientas a las que este usuario puede entrar.
  // Admin: todas. Resto: gratis + las que tiene.
  const myTools = admin
    ? tools
    : tools.filter((t) => t.price === 0 || entitlements.includes(t.slug))

  return (
    <main className="min-h-screen max-w-4xl mx-auto px-6 py-16">
      <div className="flex items-center justify-between mb-12">
        <Link
          href="/"
          className="font-mono text-sm text-text-secondary hover:text-accent transition-colors"
        >
          <span className="text-accent">~/</span>jacoboposada
        </Link>
        <div className="flex items-center gap-5">
          {isAdminEmail(user.email) && (
            <Link href="/admin" className="text-sm text-purple hover:text-accent transition-colors">
              🎁 Panel
            </Link>
          )}
          <SignOutButton />
        </div>
      </div>

      <header className="mb-10">
        <h1 className="text-3xl font-semibold text-text-primary">
          {user.user_metadata?.full_name ? `Hola, ${user.user_metadata.full_name}` : 'Mi cuenta'}
        </h1>
        <p className="mt-2 text-sm text-text-secondary">
          Sesión iniciada como <span className="text-text-primary">{user.email}</span>
        </p>
      </header>

      <section>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-medium text-text-primary">Mis herramientas</h2>
          <Link href="/herramientas" className="text-sm text-accent hover:text-accent-hover">
            Ver catálogo →
          </Link>
        </div>

        {myTools.length === 0 ? (
          <div className="rounded-xl border border-border bg-surface p-8 text-center">
            <p className="text-text-secondary">
              Todavía no tienes herramientas.{' '}
              <Link href="/herramientas" className="text-accent hover:text-accent-hover">
                Explora el catálogo
              </Link>
              .
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {myTools.map((tool) => (
              <Link
                key={tool.slug}
                href={`/herramientas/${tool.slug}`}
                className="group flex items-center gap-4 rounded-xl border border-border bg-surface p-5
                           hover:border-accent/30 hover:shadow-card-hover transition-all"
              >
                <span className="text-2xl">{tool.icon ?? '◆'}</span>
                <div className="flex-1">
                  <h3 className="text-text-primary font-medium group-hover:text-accent transition-colors">
                    {tool.name}
                  </h3>
                  <p className="text-xs text-text-muted">{tool.category}</p>
                </div>
                <span className="text-text-muted group-hover:text-accent group-hover:translate-x-1 transition-all">
                  →
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
