import type { ComponentType } from 'react'
import DemoTool from './DemoTool'
import CalculadoraNomina from './nomina/CalculadoraNomina'
import AgendaPacientes from './clinica/AgendaPacientes'
import CarroElectrico from './carro/CarroElectrico'
import Baila from './baila/Baila'

// Registro de herramientas: mapea el slug de cada herramienta a su componente.
// Cuando agregues una herramienta nueva:
//   1. Crea su componente (p. ej. components/tools/MiHerramienta.tsx)
//   2. Regístralo aquí:  'mi-herramienta': MiHerramienta
//   3. Agrégala al catálogo en data/tools.ts
export const toolComponents: Record<string, ComponentType> = {
  'calculadora-nomina': CalculadoraNomina,
  'agenda-pacientes': AgendaPacientes,
  'carro-electrico-medellin': CarroElectrico,
  'baila': Baila,
  'demo-gratis': DemoTool,
  'demo-premium': DemoTool,
}
