import { useEffect, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { History, ListChecks, Plus } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  listRoutines,
  createRoutine,
  deleteRoutine,
  listExercises,
  addExerciseToRoutine,
  removeExerciseFromRoutine,
  startActiveSession,
  getActiveSession,
} from '../lib/api'
import Header from '../components/Header'
import RoutineCard from '../components/RoutineCard'
import RoutineFormModal from '../components/RoutineFormModal'
import AddExerciseToRoutineModal from '../components/AddExerciseToRoutineModal'
import ConfirmModal from '../components/ConfirmModal'
import EmptyState from '../components/EmptyState'

export default function RoutinesPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [routines, setRoutines] = useState([])
  const [exercises, setExercises] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [toDelete, setToDelete] = useState(null)
  const [addExerciseTarget, setAddExerciseTarget] = useState(null)
  const [toPlay, setToPlay] = useState(null)

  useEffect(() => {
    refresh()
  }, [user])

  async function refresh() {
    setLoading(true)
    try {
      const [r, e] = await Promise.all([listRoutines(user.id), listExercises(user.id)])
      setRoutines(r)
      setExercises(e)
    } finally {
      setLoading(false)
    }
  }

  async function handleCreate({ name, photoFile }) {
    const routine = await createRoutine({ userId: user.id, name, photoFile })
    await refresh()
    setAddExerciseTarget({ ...routine, exercises: [] })
  }

  async function handleDelete(routine) {
    await deleteRoutine(routine.id)
    setRoutines((prev) => prev.filter((r) => r.id !== routine.id))
  }

  async function handleAddExercises(routine, exerciseIds) {
    const startOrder = routine.exercises.length
    await Promise.all(
      exerciseIds.map((exId, idx) => addExerciseToRoutine(routine.id, exId, startOrder + idx)),
    )
    await refresh()
  }

  async function handleRemoveExercise(routineExerciseId) {
    await removeExerciseFromRoutine(routineExerciseId)
    await refresh()
  }

  async function handlePlay(routine) {
    // Si ya hay un entrenamiento en curso (de cualquier rutina), lo retomamos.
    const existing = await getActiveSession(user.id)
    if (existing) {
      navigate(`/app/entrenar/${existing.routine_id}`)
      return
    }
    await startActiveSession({ userId: user.id, routineId: routine.id, routineName: routine.name })
    navigate(`/app/entrenar/${routine.id}`)
  }

  return (
    <div>
      <Header
        title="Rutinas"
        right={
          <Link
            to="/app/rutinas/historial"
            className="p-2 rounded-full text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Historial"
          >
            <History size={18} />
          </Link>
        }
      />
      <div className="px-4 py-4 max-w-2xl mx-auto">
        <button
          onClick={() => setShowForm(true)}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border border-dashed border-lime/40 text-lime font-medium hover:bg-lime/5 transition-colors mb-4"
        >
          <Plus size={18} />
          Crear rutina
        </button>

        {!loading && routines.length === 0 && (
          <EmptyState
            icon={ListChecks}
            title="Aún no tienes rutinas"
            message="Crea una rutina y agrégale ejercicios de tu lista."
          />
        )}

        <div className="space-y-3">
          <AnimatePresence>
            {routines.map((r) => (
              <RoutineCard
                key={r.id}
                routine={r}
                onDelete={setToDelete}
                onPlay={setToPlay}
                onAddExercise={setAddExerciseTarget}
                onRemoveExercise={handleRemoveExercise}
              />
            ))}
          </AnimatePresence>
        </div>
      </div>

      <RoutineFormModal open={showForm} onClose={() => setShowForm(false)} onSave={handleCreate} />

      {addExerciseTarget && (
        <AddExerciseToRoutineModal
          open={!!addExerciseTarget}
          onClose={() => setAddExerciseTarget(null)}
          allExercises={exercises}
          existingExerciseIds={addExerciseTarget.exercises.map((e) => e.id)}
          onAdd={(ids) => handleAddExercises(addExerciseTarget, ids)}
        />
      )}

      <ConfirmModal
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={() => handleDelete(toDelete)}
        title="Eliminar rutina"
        message={`¿Seguro que quieres borrar "${toDelete?.name}"? Esto no borra tus ejercicios ni tu historial.`}
      />

      <ConfirmModal
        open={!!toPlay}
        onClose={() => setToPlay(null)}
        onConfirm={() => handlePlay(toPlay)}
        title="Empezar rutina"
        message={`¿Quieres empezar "${toPlay?.name}" ahora? El cronómetro arrancará enseguida.`}
        confirmLabel="Empezar"
        danger={false}
      />
    </div>
  )
}
