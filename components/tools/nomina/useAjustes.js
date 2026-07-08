import { useState } from 'react'

const KEY = 'nomina_ajustes'

export const AJUSTES_DEFAULT = {
  maxHorasSemanales: 44,
  recargoNocturno: 35,
  recargoExtraDiurna: 25,
  recargoExtraNocturna: 75,
  recargoDomFest: 80,
  horaInicioDiurno: 6,
  horaFinDiurno: 19,
}

export function useAjustes() {
  const [ajustes, setAjustesState] = useState(() => {
    try {
      const stored = localStorage.getItem(KEY)
      return stored ? { ...AJUSTES_DEFAULT, ...JSON.parse(stored) } : AJUSTES_DEFAULT
    } catch {
      return AJUSTES_DEFAULT
    }
  })

  function setAjustes(nuevos) {
    const merged = { ...ajustes, ...nuevos }
    setAjustesState(merged)
    localStorage.setItem(KEY, JSON.stringify(merged))
  }

  function resetAjustes() {
    setAjustesState(AJUSTES_DEFAULT)
    localStorage.setItem(KEY, JSON.stringify(AJUSTES_DEFAULT))
  }

  return { ajustes, setAjustes, resetAjustes }
}
