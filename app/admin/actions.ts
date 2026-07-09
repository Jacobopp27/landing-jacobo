'use server'

import { revalidatePath } from 'next/cache'
import { getUser } from '@/lib/entitlements'
import { isAdminEmail, hasServiceKey } from '@/lib/admin'
import { createAdminClient } from '@/lib/supabase/admin'
import { getToolBySlug } from '@/data/tools'
import { getCatalog } from '@/lib/catalog'

type Result = { ok: boolean; message: string }

// Verifica en el SERVIDOR que quien llama es admin. Nunca confiar en el cliente.
async function assertAdmin() {
  const user = await getUser()
  if (!isAdminEmail(user?.email)) {
    throw new Error('No autorizado')
  }
}

export async function grantAccess(_prev: Result | null, formData: FormData): Promise<Result> {
  await assertAdmin()

  if (!hasServiceKey()) {
    return { ok: false, message: 'Falta configurar la SUPABASE_SERVICE_ROLE_KEY en .env.local.' }
  }

  const email = String(formData.get('email') || '').trim().toLowerCase()
  const toolSlug = String(formData.get('toolSlug') || '').trim()

  if (!email || !email.includes('@')) return { ok: false, message: 'Email inválido.' }
  if (!getToolBySlug(toolSlug)) return { ok: false, message: 'Selecciona una herramienta.' }

  const admin = createAdminClient()
  const { error } = await admin
    .from('entitlements')
    .upsert({ email, tool_slug: toolSlug, source: 'grant' }, { onConflict: 'email,tool_slug' })

  if (error) return { ok: false, message: 'Error: ' + error.message }

  revalidatePath('/admin')
  return { ok: true, message: `✅ Acceso otorgado a ${email}.` }
}

export async function revokeAccess(formData: FormData): Promise<void> {
  await assertAdmin()
  const id = String(formData.get('id') || '')
  if (!id) return

  const admin = createAdminClient()
  await admin.from('entitlements').delete().eq('id', id)
  revalidatePath('/admin')
}

// Cambia el precio de una herramienta (0 = gratis, >0 = de pago).
export async function setToolPrice(formData: FormData): Promise<void> {
  await assertAdmin()
  if (!hasServiceKey()) return

  const slug = String(formData.get('slug') || '')
  const price = Math.max(0, Math.round(Number(formData.get('price') || 0)))
  if (!slug || !getToolBySlug(slug)) return

  const admin = createAdminClient()
  await admin.from('tool_settings').upsert({ slug, price }, { onConflict: 'slug' })

  revalidatePath('/admin')
  revalidatePath('/herramientas')
  revalidatePath(`/herramientas/${slug}`)
  revalidatePath('/cuenta')
}

// Muestra u oculta una herramienta del catálogo (preserva el precio y el orden).
export async function setToolPublished(formData: FormData): Promise<void> {
  await assertAdmin()
  if (!hasServiceKey()) return

  const slug = String(formData.get('slug') || '')
  const published = String(formData.get('published')) === 'true'
  const tool = (await getCatalog()).find((t) => t.slug === slug)
  if (!tool) return

  const admin = createAdminClient()
  await admin.from('tool_settings').upsert(
    { slug, published, price: tool.price, sort_order: tool.sortOrder },
    { onConflict: 'slug' }
  )

  revalidatePath('/admin')
  revalidatePath('/herramientas')
}

// Sube o baja una herramienta en el orden del catálogo.
export async function moveTool(formData: FormData): Promise<void> {
  await assertAdmin()
  if (!hasServiceKey()) return

  const slug = String(formData.get('slug') || '')
  const dir = String(formData.get('dir') || '')

  const catalog = await getCatalog() // ya viene ordenado
  const order = catalog.map((t) => t.slug)
  const i = order.indexOf(slug)
  if (i === -1) return
  const j = dir === 'up' ? i - 1 : i + 1
  if (j < 0 || j >= order.length) return

  ;[order[i], order[j]] = [order[j], order[i]]

  // Reescribe filas completas (precio + visibilidad + nuevo orden) para no pisar nada.
  const bySlug = Object.fromEntries(catalog.map((t) => [t.slug, t]))
  const rows = order.map((s, idx) => ({
    slug: s,
    price: bySlug[s].price,
    published: bySlug[s].published ?? true,
    sort_order: idx,
  }))

  const admin = createAdminClient()
  await admin.from('tool_settings').upsert(rows, { onConflict: 'slug' })

  revalidatePath('/admin')
  revalidatePath('/herramientas')
}
