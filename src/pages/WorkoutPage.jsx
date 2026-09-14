import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Dumbbell, Plus } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import {
  getActiveSession,
  getRoutine,
  listRecords,
  saveActiveSessionProgress,
  deleteActiveSession,
  startActiveSession,
  finishWorkout,
} from '../lib/api'
import { publicPhotoUrl } from '../lib/supabaseClient'
import Timer, { elapsedSecondsFrom } from '../components/Timer'
import SetRow from '../components/SetRow'
import ConfirmModal from '../components/ConfirmModal'
import RecordCelebration from '../components/RecordCelebration'

const emptySet = () => ({ kg: '', reps: '' })

export default function WorkoutPage() {
  const { routineId } = useParams()
  const { user, loading: authLoading } = useAuth()
  const navigate = useNavigate()

  const [routine, setRoutine] = useState(null)
  const [setsData, setSetsData] = useState({})
  const [startedAt, setStartedAt] = useState(null)
  const [records, setRecords] = useState({})
  const [loading, setLoading] = useState(true)
  const [showCancel, setShowCancel] = useState(false)
  const [showFinish, setShowFinish] = useState(false)
  const [finishing, setFinishing] = useState(false)
  const [brokenRecords, setBrokenRecords] = useState(null)

  const saveTimeout = useRef(null)

  useEffect(() => {
    if (!authLoading && user) init()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, user, routineId])

  async function init() {
    setLoading(true)
    try {
      let session = await getActiveSession(user.id)

      if (session && session.routine_id !== routineId) {
        // Hay otra sesión activa de otra rutina: vamos a ella en vez de crear una nueva.
        navigate(`/app/entrenar/${session.routine_id}`, { replace: true })
        return
      }

      if (!session) {
        const routineData = await getRoutine(routineId)
        session = await startActiveSession({
          userId: user.id,
          routineId,
          routineName: routineData.name,
        })
      }

      const routineData = await getRoutine(routineId)
      const recordList = await listRecords(user.id)
      const recordsMap = {}
      recordList.forEach((r) => {
        recordsMap[r.exercise_id] = { kg: r.kg, reps: r.reps }
      })

      const initialSets = {}
      routineData.exercises.forEach((ex) => {
        const saved = session.sets_data?.[ex.id]
        initialSets[ex.id] = saved && saved.length > 0 ? saved : [emptySet()]
      })

      setRoutine(routineData)
      setSetsData(initialSets)
      setStartedAt(new Date(session.started_at).getTime())
      setRecords(recordsMap)
    } finally {
      setLoading(false)
    }
  }

  function persist(nextSetsData) {
    if (!startedAt) return
    clearTimeout(saveTimeout.current)
    saveTimeout.current = setTimeout(() => {
      saveActiveSessionProgress(user.id, {
        setsData: nextSetsData,
        elapsedSeconds: elapsedSecondsFrom(startedAt),
      }).catch(() => {})
    }, 500)
  }

  function updateSet(exerciseId, index, field, value) {
    setSetsData((prev) => {
      const next = {
        ...prev,
        [exerciseId]: prev[exerciseId].map((s, i) => (i === index ? { ...s, [field]: value } : s)),
      }
      persist(next)
      return next
    })
  }

  function addSet(exerciseId) {
    setSetsData((prev) => {
      const next = { ...prev, [exerciseId]: [...prev[exerciseId], emptySet()] }
      persist(next)
      return next
    })
  }

  function deleteSet(exerciseId, index) {
    setSetsData((prev) => {
      if (prev[exerciseId].length <= 1) return prev
      const next = { ...prev, [exerciseId]: prev[exerciseId].filter((_, i) => i !== index) }
      persist(next)
      return next
    })
  }

  async function handleCancel() {
    await deleteActiveSession(user.id)
    navigate('/app/rutinas', { replace: true })
  }

  async function handleFinish() {
    setFinishing(true)
    try {
      const exercisesWithSets = routine.exercises.map((ex) => ({
        id: ex.id,
        name: ex.name,
        sets: setsData[ex.id] ?? [],
      }))
      const { brokenRecords: broken } = await finishWorkout({
        userId: user.id,
        routineId: routine.id,
        routineName: routine.name,
        durationSeconds: elapsedSecondsFrom(startedAt),
        exercisesWithSets,
      })
      if (broken.length > 0) {
        setBrokenRecords(broken)
      } else {
        navigate('/app/rutinas', { replace: true })
      }
    } finally {
      setFinishing(false)
    }
  }

  if (authLoading || loading || !routine) {
    return (
      <div className="min-h-screen flex items-center justify-center text-neutral-500 text-sm">
        Cargando entrenamiento…
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-28">
      <Timer startedAt={startedAt} />

      <div className="px-4 py-4 max-w-2xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold text-white">{routine.name}</h1>
          <button
            onClick={() => setShowCancel(true)}
            className="text-sm text-red-400 hover:text-red-300 transition-colors"
          >
            Cancelar
          </button>
        </div>

        {routine.exercises.map((ex) => {
          const record = records[ex.id]
          const photoUrl = publicPhotoUrl(ex.photo_url)
          return (
            <div key={ex.id} className="bg-panel border border-border rounded-2xl p-3">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-panel-2 overflow-hidden flex items-center justify-center shrink-0">
                  {photoUrl ? (
                    <img src={photoUrl} alt={ex.name} className="w-full h-full object-cover" />
                  ) : (
                    <Dumbbell size={18} className="text-neutral-500" />
                  )}
                </div>
                <div>
                  <p className="font-semibold text-white">{ex.name}</p>
                  {record && (
                    <p className="text-xs text-lime">
                      Récord: {record.kg}kg × {record.reps} reps
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <AnimatePresence initial={false}>
                  {setsData[ex.id]?.map((set, idx) => (
                    <motion.div key={idx} exit={{ height: 0, opacity: 0 }} layout>
                      <SetRow
                        index={idx}
                        kg={set.kg}
                        reps={set.reps}
                        canDelete={setsData[ex.id].length > 1}
                        onChangeKg={(v) => updateSet(ex.id, idx, 'kg', v)}
                        onChangeReps={(v) => updateSet(ex.id, idx, 'reps', v)}
                        onDelete={() => deleteSet(ex.id, idx)}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              <button
                onClick={() => addSet(ex.id)}
                className="mt-2 w-full flex items-center justify-center gap-1.5 py-2 rounded-lg border border-dashed border-border text-neutral-400 text-sm hover:border-lime hover:text-lime transition-colors"
              >
                <Plus size={14} />
                Serie
              </button>
            </div>
          )
        })}

        <button
          onClick={() => setShowFinish(true)}
          className="w-full py-4 rounded-2xl bg-lime text-black font-bold text-base hover:bg-lime-glow transition-colors mt-6"
        >
          Terminar rutina
        </button>
      </div>

      <ConfirmModal
        open={showCancel}
        onClose={() => setShowCancel(false)}
        onConfirm={handleCancel}
        title="Cancelar entrenamiento"
        message="Se descartará todo el progreso de este entrenamiento. No se guardará nada."
        confirmLabel="Sí, cancelar"
      />

      <ConfirmModal
        open={showFinish}
        onClose={() => setShowFinish(false)}
        onConfirm={handleFinish}
        title="Terminar rutina"
        message="Se guardará tu entrenamiento en el historial y se actualizarán tus récords si corresponde."
        confirmLabel={finishing ? 'Guardando…' : 'Terminar'}
        danger={false}
      />

      <AnimatePresence>
        {brokenRecords && (
          <RecordCelebration
            brokenRecords={brokenRecords}
            onClose={() => navigate('/app/rutinas', { replace: true })}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
