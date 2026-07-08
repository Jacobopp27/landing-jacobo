import { useState, useEffect } from 'react'

const KEY_DIAS = 'nomina_dias'
const KEY_SALARIO = 'nomina_salario'

export function useDias() {
  const [dias, setDias] = useState(() => {
    try {
      const stored = localStorage.getItem(KEY_DIAS)
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  })

  const [salario, setSalarioState] = useState(() => {
    try {
      const stored = localStorage.getItem(KEY_SALARIO)
      return stored ? Number(stored) : 0
    } catch {
      return 0
    }
  })

  useEffect(() => {
    localStorage.setItem(KEY_DIAS, JSON.stringify(dias))
  }, [dias])

  function setSalario(valor) {
    setSalarioState(valor)
    localStorage.setItem(KEY_SALARIO, String(valor))
  }

  function agregarDia(dia) {
    const nuevo = { ...dia, id: crypto.randomUUID() }
    setDias((prev) => [...prev, nuevo])
  }

  function editarDia(id, datos) {
    setDias((prev) => prev.map((d) => (d.id === id ? { ...d, ...datos } : d)))
  }

  function eliminarDia(id) {
    setDias((prev) => prev.filter((d) => d.id !== id))
  }

  function limpiarQuincena() {
    setDias([])
  }

  return { dias, salario, setSalario, agregarDia, editarDia, eliminarDia, limpiarQuincena }
}
