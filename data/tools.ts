// ─── Catálogo de Herramientas ─────────────────────────────────────────────
// Cada herramienta que publiques va aquí. Es una lista simple: agregar una
// herramienta nueva = agregar un objeto a este array.
//
// Reglas de acceso (ver lib/entitlements.ts):
//   - price === 0  → gratis: cualquier usuario con sesión puede entrar.
//   - price  >  0  → de pago: requiere acceso (comprado o regalado).

export type Tool = {
  slug: string
  name: string
  tagline: string
  description: string
  /** Precio en USD. 0 = gratis para cualquier usuario registrado. */
  price: number
  category: string
  icon?: string
  status: 'available' | 'coming-soon'
  /** Si es true, la herramienta ocupa toda la pantalla (sin el marco del sitio). */
  fullPage?: boolean
  /** ID del producto en Lemon Squeezy (se agrega cuando conectemos el pago). */
  lemonVariantId?: string
}

export const tools: Tool[] = [
  {
    slug: 'calculadora-nomina',
    name: 'Calculadora de Nómina',
    tagline: 'Calcula lo que ganaste en tu quincena según la ley laboral colombiana.',
    description:
      'Registra tus días y horas trabajadas y calcula automáticamente los recargos nocturnos, dominicales, festivos y horas extra. Ajusta los porcentajes si la ley cambia y exporta el resultado a Excel.',
    price: 5, // precio en USD — ajústalo a lo que quieras cobrar
    category: 'Finanzas',
    icon: '💰',
    status: 'available',
    fullPage: true,
  },
  {
    slug: 'agenda-pacientes',
    name: 'Agenda de Pacientes',
    tagline: 'Lleva el control de tus pacientes, citas y recordatorios de seguimiento.',
    description:
      'Un CRM sencillo para clínicas y profesionales de salud: registra pacientes con su historial, agenda citas y crea recordatorios de seguimiento. Cada cuenta ve solo sus propios datos, de forma privada y segura.',
    price: 12, // precio en USD — ajústalo a lo que quieras cobrar
    category: 'Salud',
    icon: '🩺',
    status: 'available',
    fullPage: true,
  },
  {
    slug: 'demo-gratis',
    name: 'Herramienta Demo (Gratis)',
    tagline: 'Ejemplo gratuito para probar el sistema de cuentas y acceso.',
    description:
      'Una mini herramienta de ejemplo. Al ser gratuita, cualquier persona con una cuenta puede entrar y usarla. Sirve para comprobar que el login y el candado funcionan.',
    price: 0,
    category: 'Demo',
    icon: '🧪',
    status: 'available',
  },
  {
    slug: 'demo-premium',
    name: 'Herramienta Demo (De pago)',
    tagline: 'Ejemplo de pago: bloqueada hasta que tengas acceso.',
    description:
      'Esta herramienta simula un producto de pago. Está bloqueada hasta que compres el acceso (cuando conectemos el pago) o hasta que te lo regalen desde el panel. Sirve para comprobar el candado de pago.',
    price: 15,
    category: 'Demo',
    icon: '🔒',
    status: 'available',
  },
]

export function getToolBySlug(slug: string): Tool | undefined {
  return tools.find((t) => t.slug === slug)
}
