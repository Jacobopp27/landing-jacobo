import { tools as staticTools, type Tool } from '@/data/tools'
import { createClient } from '@/lib/supabase/server'

type Settings = { price?: number | null; published?: boolean | null; sort_order?: number | null }

// Lee los ajustes editados en el panel (precio / visibilidad / orden).
async function loadSettings(): Promise<Record<string, Settings>> {
  try {
    const supabase = createClient()
    const { data } = await supabase
      .from('tool_settings')
      .select('slug, price, published, sort_order')
    const map: Record<string, Settings> = {}
    for (const row of data ?? []) map[row.slug] = row
    return map
  } catch {
    return {}
  }
}

// Catálogo efectivo: herramientas del código con precio/visibilidad/orden del panel.
export async function getCatalog(): Promise<Tool[]> {
  const settings = await loadSettings()
  const merged = staticTools.map((t, i) => {
    const s = settings[t.slug]
    return {
      ...t,
      price: s && s.price != null ? s.price : t.price,
      published: s && s.published != null ? s.published : true,
      sortOrder: s && s.sort_order != null ? s.sort_order : i,
    }
  })
  merged.sort((a, b) => (a.sortOrder as number) - (b.sortOrder as number))
  return merged
}

export async function getTool(slug: string): Promise<Tool | undefined> {
  const list = await getCatalog()
  return list.find((t) => t.slug === slug)
}
