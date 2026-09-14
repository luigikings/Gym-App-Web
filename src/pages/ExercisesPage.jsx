import { useEffect, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { Dumbbell, Plus } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { listExercises, createExercise, deleteExercise } from '../lib/api'
import Header from '../components/Header'
import ExerciseCard from '../components/ExerciseCard'
import ExerciseFormModal from '../components/ExerciseFormModal'
import ConfirmModal from '../components/ConfirmModal'
import EmptyState from '../components/EmptyState'

export default function ExercisesPage() {
  const { user } = useAuth()
  const [exercises, setExercises] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [toDelete, setToDelete] = useState(null)

  useEffect(() => {
    refresh()
  }, [user])

  async function refresh() {
    setLoading(true)
    try {
      const data = await listExercises(user.id)
      setExercises(data)
    } finally {
      setLoading(false)
    }
  }

  async function handleCreate({ name, photoFile }) {
    await createExercise({ userId: user.id, name, photoFile })
    await refresh()
  }

  async function handleDelete(exercise) {
    await deleteExercise(exercise.id)
    setExercises((prev) => prev.filter((e) => e.id !== exercise.id))
  }

  return (
    <div>
      <Header title="Ejercicios" />
      <div className="px-4 py-4 max-w-2xl mx-auto">
        <button
          onClick={() => setShowForm(true)}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border border-dashed border-lime/40 text-lime font-medium hover:bg-lime/5 transition-colors mb-4"
        >
          <Plus size={18} />
          Agregar ejercicio
        </button>

        {!loading && exercises.length === 0 && (
          <EmptyState
            icon={Dumbbell}
            title="Aún no tienes ejercicios"
            message="Agrega tu primer ejercicio para empezar a armar rutinas."
          />
        )}

        <div className="space-y-2">
          <AnimatePresence>
            {exercises.map((ex) => (
              <ExerciseCard key={ex.id} exercise={ex} onDelete={setToDelete} />
            ))}
          </AnimatePresence>
        </div>
      </div>

      <ExerciseFormModal open={showForm} onClose={() => setShowForm(false)} onSave={handleCreate} />

      <ConfirmModal
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={() => handleDelete(toDelete)}
        title="Eliminar ejercicio"
        message={`Esto también borrará todos los registros y récords de "${toDelete?.name}". Esta acción no se puede deshacer.`}
      />
    </div>
  )
}
