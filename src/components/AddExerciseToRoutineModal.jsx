import { useMemo, useState } from 'react'
import Modal from './Modal'
import ExerciseCard from './ExerciseCard'
import EmptyState from './EmptyState'
import { Dumbbell } from 'lucide-react'

export default function AddExerciseToRoutineModal({
  open,
  onClose,
  allExercises,
  existingExerciseIds,
  onAdd,
}) {
  const [selectedIds, setSelectedIds] = useState([])
  const [saving, setSaving] = useState(false)

  const available = useMemo(
    () => allExercises.filter((e) => !existingExerciseIds.includes(e.id)),
    [allExercises, existingExerciseIds],
  )

  function toggle(id) {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  async function handleSave() {
    if (selectedIds.length === 0) return
    setSaving(true)
    try {
      await onAdd(selectedIds)
      setSelectedIds([])
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={() => {
        setSelectedIds([])
        onClose()
      }}
      title="Agregar ejercicios"
    >
      {available.length === 0 ? (
        <EmptyState
          icon={Dumbbell}
          title="No hay más ejercicios"
          message="Ya agregaste todos tus ejercicios a esta rutina, o aún no creaste ninguno."
        />
      ) : (
        <>
          <div className="space-y-2 max-h-[45vh] overflow-y-auto no-scrollbar mb-4">
            {available.map((ex) => (
              <ExerciseCard
                key={ex.id}
                exercise={ex}
                selectable
                selected={selectedIds.includes(ex.id)}
                onToggle={() => toggle(ex.id)}
              />
            ))}
          </div>
          <button
            onClick={handleSave}
            disabled={selectedIds.length === 0 || saving}
            className="w-full py-3 rounded-xl bg-lime text-black font-semibold hover:bg-lime-glow transition-colors disabled:opacity-40"
          >
            {saving
              ? 'Agregando…'
              : `Agregar ${selectedIds.length > 0 ? `(${selectedIds.length})` : ''}`}
          </button>
        </>
      )}
    </Modal>
  )
}
