import { useCallback, useEffect, useMemo, useState } from 'react'
import * as store from './data/store.js'
import { todayStr, classifyDate } from './utils/dates.js'
import SummaryBar from './components/SummaryBar.jsx'
import PatientList from './components/PatientList.jsx'
import PatientDetail from './components/PatientDetail.jsx'
import PatientForm from './components/PatientForm.jsx'
import Agenda from './components/Agenda.jsx'
import { Sidebar, BottomNav, MobileHeader } from './components/NavBar.jsx'

const NAV_ITEMS = [
  { key: 'pacientes', label: 'Pacientes' },
  { key: 'agenda', label: 'Agenda' },
]

// App es el único orquestador: habla con el store y la capa de notificación,
// y reparte datos + callbacks a los componentes.
export default function App() {
  const [tab, setTab] = useState('pacientes') // 'pacientes' | 'agenda'
  const [patients, setPatients] = useState([])
  const [allReminders, setAllReminders] = useState([])
  const [allCitas, setAllCitas] = useState([])
  const [loadingPatients, setLoadingPatients] = useState(true)
  const [loadingReminders, setLoadingReminders] = useState(true)
  const [loadingCitas, setLoadingCitas] = useState(true)

  const [selectedId, setSelectedId] = useState(null)
  const [editing, setEditing] = useState(null)
  const [onlyPending, setOnlyPending] = useState(true)

  // --- Carga de datos -------------------------------------------------------

  const refreshPatients = useCallback(async () => {
    setLoadingPatients(true)
    setPatients(await store.listPatients())
    setLoadingPatients(false)
  }, [])

  const refreshReminders = useCallback(async () => {
    setLoadingReminders(true)
    setAllReminders(await store.listReminders())
    setLoadingReminders(false)
  }, [])

  const refreshCitas = useCallback(async () => {
    setLoadingCitas(true)
    setAllCitas(await store.listCitas())
    setLoadingCitas(false)
  }, [])

  useEffect(() => {
    refreshPatients()
    refreshReminders()
    refreshCitas()
  }, [refreshPatients, refreshReminders, refreshCitas])

  // --- Derivados ------------------------------------------------------------

  const patientsById = useMemo(() => {
    const map = {}
    for (const p of patients) map[p.id] = p
    return map
  }, [patients])

  const hoy = todayStr()

  // Conteos para el resumen superior.
  const { citasHoy, followupsHoy, vencidos } = useMemo(() => {
    let cHoy = 0
    let fHoy = 0
    let venc = 0
    for (const r of allReminders) {
      if (r.estado !== 'pendiente') continue
      if (r.fecha === hoy) fHoy++
      else if (classifyDate(r.fecha) === 'vencido') venc++
    }
    for (const c of allCitas) {
      if (c.estado !== 'programada') continue
      if (c.fecha === hoy) cHoy++
      else if (classifyDate(c.fecha) === 'vencido') venc++
    }
    return { citasHoy: cHoy, followupsHoy: fHoy, vencidos: venc }
  }, [allReminders, allCitas, hoy])

  // Lista UNIFICADA de citas + recordatorios para la Agenda, enriquecida con
  // el nombre del paciente y un campo `kind`.
  const agendaItems = useMemo(() => {
    const nombre = (id) => patientsById[id]?.nombre || 'Paciente eliminado'
    const rem = allReminders.map((r) => ({
      ...r,
      kind: 'recordatorio',
      patientName: nombre(r.patientId),
    }))
    const cit = allCitas.map((c) => ({
      ...c,
      kind: 'cita',
      patientName: nombre(c.patientId),
    }))
    const merged = [...rem, ...cit]
    merged.sort((a, b) => {
      if (a.fecha !== b.fecha) return a.fecha < b.fecha ? -1 : 1
      return (a.hora || '') < (b.hora || '') ? -1 : (a.hora || '') > (b.hora || '') ? 1 : 0
    })
    return merged
  }, [allReminders, allCitas, patientsById])

  const selectedPatient = selectedId ? patientsById[selectedId] : null

  // --- Acciones sobre pacientes --------------------------------------------

  async function handleSavePatient(data) {
    if (editing && editing.id) {
      await store.updatePatient(editing.id, data)
    } else {
      const created = await store.createPatient(data)
      setSelectedId(created.id)
    }
    setEditing(null)
    await refreshPatients()
  }

  async function handleDeletePatient(id) {
    const p = patientsById[id]
    if (!window.confirm(`¿Eliminar a ${p?.nombre || 'este paciente'}, sus citas y recordatorios?`)) {
      return
    }
    await store.deletePatient(id)
    setSelectedId(null)
    await Promise.all([refreshPatients(), refreshReminders(), refreshCitas()])
  }

  // --- Acciones sobre recordatorios ----------------------------------------

  const loadRemindersForPatient = useCallback(
    (patientId) => store.listReminders({ patientId }),
    []
  )

  async function handleCreateReminder(data) {
    await store.createReminder(data)
    await refreshReminders()
  }

  async function handleToggleReminder(reminder) {
    const nuevoEstado = reminder.estado === 'hecho' ? 'pendiente' : 'hecho'
    await store.updateReminder(reminder.id, { estado: nuevoEstado })
    await refreshReminders()
  }

  async function handleDeleteReminder(id) {
    await store.deleteReminder(id)
    await refreshReminders()
  }

  // --- Acciones sobre citas -------------------------------------------------

  const loadCitasForPatient = useCallback((patientId) => store.listCitas({ patientId }), [])

  async function handleCreateCita(data) {
    await store.createCita(data)
    await refreshCitas()
  }

  async function handleUpdateCita(id, data) {
    await store.updateCita(id, data)
    await refreshCitas()
  }

  async function handleDeleteCita(id) {
    await store.deleteCita(id)
    await refreshCitas()
  }

  // Acción del check en la Agenda: depende del tipo de item.
  async function handleToggleAgendaItem(item) {
    if (item.kind === 'cita') {
      const nuevo = item.estado === 'atendida' ? 'programada' : 'atendida'
      await store.updateCita(item.id, { estado: nuevo })
      await refreshCitas()
    } else {
      await handleToggleReminder(item)
    }
  }

  function openPatientFromAgenda(id) {
    if (!patientsById[id]) return
    setSelectedId(id)
    setTab('pacientes')
  }

  // --- Render ---------------------------------------------------------------

  // Al cambiar de sección, salir de la ficha abierta.
  function goToSection(key) {
    setSelectedId(null)
    setTab(key)
  }

  return (
    <div className="min-h-screen bg-slate-50 md:pl-60">
      <Sidebar items={NAV_ITEMS} active={tab} onChange={goToSection} />
      <MobileHeader />

      <main className="mx-auto max-w-3xl space-y-5 px-4 pb-24 pt-5 md:pb-10 md:pt-8">
        <SummaryBar citasHoy={citasHoy} followupsHoy={followupsHoy} vencidos={vencidos} />

        {tab === 'pacientes' &&
          (selectedPatient ? (
            <PatientDetail
              patient={selectedPatient}
              onBack={() => setSelectedId(null)}
              onEdit={() => setEditing(selectedPatient)}
              onDelete={() => handleDeletePatient(selectedPatient.id)}
              loadReminders={loadRemindersForPatient}
              onCreateReminder={handleCreateReminder}
              onToggleReminder={handleToggleReminder}
              onDeleteReminder={handleDeleteReminder}
              loadCitas={loadCitasForPatient}
              onCreateCita={handleCreateCita}
              onUpdateCita={handleUpdateCita}
              onDeleteCita={handleDeleteCita}
            />
          ) : (
            <PatientList
              patients={patients}
              loading={loadingPatients}
              onOpen={(id) => setSelectedId(id)}
              onNew={() => setEditing({})}
            />
          ))}

        {tab === 'agenda' && (
          <Agenda
            items={agendaItems}
            loading={loadingReminders || loadingCitas}
            onlyPending={onlyPending}
            onToggleOnlyPending={() => setOnlyPending((v) => !v)}
            onToggleItem={handleToggleAgendaItem}
            onOpenPatient={openPatientFromAgenda}
          />
        )}
      </main>

      <BottomNav items={NAV_ITEMS} active={tab} onChange={goToSection} />

      {editing && (
        <PatientForm
          patient={editing.id ? editing : null}
          onSave={handleSavePatient}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  )
}
