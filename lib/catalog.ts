import { tools as staticTools, type Tool } from '@/data/tools'
import { createClient } from '@/lib/supabase/server'

// Lee los precios editados en el panel (tabla tool_settings).
async function loadPriceOverrides(): Promise<Record<string, number>> {
  try {
    const supabase = createClient()
    const { data } = await supabase.from('tool_settings').select('slug, price')
    const map: Record<string, number> = {}
    for (const row of data ?? []) map[row.slug] = row.price
    return map
  } catch {
    return {}
  }
}

// Catálogo efectivo: herramientas del código con el precio sobreescrito por el panel.
export async function getCatalog(): Promise<Tool[]> {
  const overrides = await loadPriceOverrides()
  return staticTools.map((t) =>
    overrides[t.slug] !== undefined ? { ...t, price: overrides[t.slug] } : t
  )
}

export async function getTool(slug: string): Promise<Tool | undefined> {
  const list = await getCatalog()
  return list.find((t) => t.slug === slug)
}
