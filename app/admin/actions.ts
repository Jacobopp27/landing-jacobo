'use server'

import { revalidatePath } from 'next/cache'
import { getUser } from '@/lib/entitlements'
import { isAdminEmail, hasServiceKey } from '@/lib/admin'
import { createAdminClient } from '@/lib/supabase/admin'
import { getToolBySlug } from '@/data/tools'

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
