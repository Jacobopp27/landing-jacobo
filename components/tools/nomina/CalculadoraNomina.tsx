'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import './nomina.css'
import { useDias } from './useDias'
import { useAjustes } from './useAjustes'
import { calcularQuincena } from './calculos'
import SalarioInput from './SalarioInput'
import FormularioDia from './FormularioDia'
import ListaDias from './ListaDias'
import Resumen from './Resumen'
import Ajustes from './Ajustes'

// Entrada de la herramienta. La lógica interna solo se monta en el navegador
// (gate `mounted`) para que el localStorage nunca corra en el servidor.
export default function CalculadoraNomina() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  if (!mounted) {
    return (
      <div className="nomina-app">
        <div className="app">
          <p style={{ padding: 40, textAlign: 'center', color: '#64748b' }}>Cargando…</p>
        </div>
      </div>
    )
  }

  return <CalculadoraInner />
}

function CalculadoraInner() {
  const { dias, salario, setSalario, agregarDia, editarDia, eliminarDia, limpiarQuincena } = useDias()
  const { ajustes, setAjustes, resetAjustes } = useAjustes()
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [confirmLimpiar, setConfirmLimpiar] = useState(false)
  const [ayuda, setAyuda] = useState(true)

  const resultado = useMemo(
    () => calcularQuincena(dias, salario, ajustes),
    [dias, salario, ajustes]
  )

  function handleAgregarDia(datos: any) {
    agregarDia(datos)
    setMostrarFormulario(false)
  }

  function handleLimpiar() {
    if (confirmLimpiar) {
      limpiarQuincena()
      setConfirmLimpiar(false)
    } else {
      setConfirmLimpiar(true)
      setTimeout(() => setConfirmLimpiar(false), 3000)
    }
  }

  return (
    <div className="nomina-app">
      <div className="app">
        <Link href="/herramientas" className="nomina-back">
          ← Herramientas
        </Link>

        <header className="app-header">
          <h1>💰 Calculadora de Nómina</h1>
          <p className="app-subtitle">Calcula lo que ganaste en tu quincena según la ley colombiana</p>
        </header>

        <main className="app-main">
          <div className="card nomina-como">
            <button type="button" className="nomina-como-toggle" onClick={() => setAyuda((v) => !v)}>
              <span>📖 ¿Cómo funciona?</span>
              <span className="ajustes-chevron">{ayuda ? '▲' : '▼'}</span>
            </button>
            {ayuda && (
              <ol className="nomina-como-lista">
                <li>Escribe tu <strong>salario mensual base</strong>.</li>
                <li>Agrega cada <strong>día que trabajaste</strong> con su hora de entrada y salida.</li>
                <li>Marca si hubo <strong>hora de almuerzo</strong> (−1h) o si fue <strong>domingo/festivo</strong> (+80%).</li>
                <li>La calculadora reparte tus horas en diurnas, nocturnas, extra y dominicales, y calcula los <strong>recargos según la ley colombiana</strong>.</li>
                <li>Mira el <strong>total y el desglose</strong> en el resumen, y expórtalo a <strong>Excel</strong>.</li>
                <li>¿Cambió la ley? Ajusta los porcentajes en <strong>⚙️ Ajustes de recargos</strong>.</li>
              </ol>
            )}
          </div>

          <SalarioInput salario={salario} setSalario={setSalario} ajustes={ajustes} />

        <Ajustes ajustes={ajustes} setAjustes={setAjustes} resetAjustes={resetAjustes} />

        <Resumen resultado={resultado} dias={dias} salario={salario} />

        <section className="seccion-dias">
          <div className="seccion-header">
            <h2>
              Días trabajados <span className="badge-count">{dias.length}</span>
            </h2>
            <div className="seccion-acciones">
              {dias.length > 0 && (
                <button
                  className={`btn-limpiar ${confirmLimpiar ? 'btn-confirmar' : ''}`}
                  onClick={handleLimpiar}
                >
                  {confirmLimpiar ? '⚠️ ¿Confirmar?' : '🗑 Limpiar quincena'}
                </button>
              )}
              <button className="btn-primary" onClick={() => setMostrarFormulario((v) => !v)}>
                {mostrarFormulario ? '✕ Cancelar' : '+ Agregar día'}
              </button>
            </div>
          </div>

          {mostrarFormulario && (
            <FormularioDia
              diaEditar={null}
              onAgregar={handleAgregarDia}
              onCancelar={() => setMostrarFormulario(false)}
            />
          )}

          <ListaDias dias={dias} onEliminar={eliminarDia} onEditar={editarDia} />
        </section>
        </main>

        <footer className="app-footer">
          <p>Basado en el Código Sustantivo del Trabajo de Colombia · Solo para referencia</p>
        </footer>
      </div>
    </div>
  )
}
