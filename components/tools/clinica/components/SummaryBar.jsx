// Resumen superior: citas de hoy, follow-ups de hoy y elementos vencidos.
// Recibe los conteos ya calculados desde App.
export default function SummaryBar({ citasHoy, followupsHoy, vencidos }) {
  return (
    <div className="grid grid-cols-3 gap-2 sm:gap-3">
      <SummaryCard tone="brand" label="Citas hoy" value={citasHoy} />
      <SummaryCard tone="violet" label="Follow-ups hoy" value={followupsHoy} />
      <SummaryCard tone={vencidos > 0 ? 'red' : 'slate'} label="Vencidos" value={vencidos} />
    </div>
  )
}

function SummaryCard({ tone, label, value }) {
  const styles = {
    brand: 'border-brand-100 bg-brand-50 text-brand-700',
    violet: 'border-violet-100 bg-violet-50 text-violet-700',
    red: 'border-red-100 bg-red-50 text-red-700',
    slate: 'border-slate-200 bg-white text-slate-400',
  }
  const dot = {
    brand: 'bg-brand-500',
    violet: 'bg-violet-500',
    red: 'bg-red-500',
    slate: 'bg-slate-300',
  }
  return (
    <div className={`rounded-2xl border p-3 sm:p-4 ${styles[tone]}`}>
      <div className="flex items-center gap-1.5">
        <span className={`h-2 w-2 rounded-full ${dot[tone]}`} />
        <p className="text-2xl font-bold tabular-nums leading-none text-slate-800 sm:text-3xl">
          {value}
        </p>
      </div>
      <p className="mt-1.5 text-xs font-medium leading-tight">{label}</p>
    </div>
  )
}
