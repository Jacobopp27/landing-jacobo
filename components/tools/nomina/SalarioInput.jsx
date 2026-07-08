import { useState, useEffect } from 'react'
import { formatCOP, calcularValorHora } from './calculos'

export default function SalarioInput({ salario, setSalario, ajustes }) {
  const [inputVal, setInputVal] = useState(salario > 0 ? String(salario) : '')

  useEffect(() => {
    if (salario > 0) setInputVal(String(salario))
  }, [])

  function handleChange(e) {
    const raw = e.target.value.replace(/\D/g, '')
    setInputVal(raw)
    const num = Number(raw)
    if (!isNaN(num)) setSalario(num)
  }

  return (
    <div className="salario-input card">
      <label htmlFor="salario">
        <span className="label-icon">💼</span>
        Salario mensual base
      </label>
      <div className="input-wrapper">
        <span className="currency-prefix">$</span>
        <input
          id="salario"
          type="tel"
          inputMode="numeric"
          placeholder="Ej: 1423500"
          value={inputVal}
          onChange={handleChange}
        />
      </div>
      {salario > 0 && (
        <p className="salario-preview">
          {formatCOP(salario)} · Valor hora: {formatCOP(calcularValorHora(salario, ajustes))}
        </p>
      )}
    </div>
  )
}
