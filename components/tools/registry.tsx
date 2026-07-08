import type { ComponentType } from 'react'
import DemoTool from './DemoTool'
import CalculadoraNomina from './nomina/CalculadoraNomina'

// Registro de herramientas: mapea el slug de cada herramienta a su componente.
// Cuando agregues una herramienta nueva:
//   1. Crea su componente (p. ej. components/tools/MiHerramienta.tsx)
//   2. Regístralo aquí:  'mi-herramienta': MiHerramienta
//   3. Agrégala al catálogo en data/tools.ts
export const toolComponents: Record<string, ComponentType> = {
  'calculadora-nomina': CalculadoraNomina,
  'demo-gratis': DemoTool,
  'demo-premium': DemoTool,
}
