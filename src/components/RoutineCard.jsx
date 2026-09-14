import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, ListChecks, Play, Plus, Trash2, X } from 'lucide-react'
import { publicPhotoUrl } from '../lib/supabaseClient'

export default function RoutineCard({ routine, onDelete, onPlay, onAddExercise, onRemoveExercise }) {
  const [open, setOpen] = useState(false)
  const photoUrl = publicPhotoUrl(routine.photo_url)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-panel border border-border rounded-2xl overflow-hidden"
    >
      <div className="flex items-center gap-3 p-3">
        <div className="w-14 h-14 rounded-xl bg-panel-2 overflow-hidden flex items-center justify-center shrink-0">
          {photoUrl ? (
            <img src={photoUrl} alt={routine.name} className="w-full h-full object-cover" />
          ) : (
            <ListChecks size={22} className="text-neutral-500" />
          )}
        </div>

        <button className="flex-1 text-left" onClick={() => setOpen((v) => !v)}>
          <p className="font-semibold text-white truncate">{routine.name}</p>
          <p className="text-xs text-neutral-500">
            {routine.exercises.length} ejercicio{routine.exercises.length !== 1 && 's'}
          </p>
        </button>

        <button
          onClick={() => setOpen((v) => !v)}
          className="p-2 text-neutral-400 hover:text-white transition-colors"
          aria-label="Ver ejercicios"
        >
          <motion.div animate={{ rotate: open ? 180 : 0 }}>
            <ChevronDown size={18} />
          </motion.div>
        </button>

        <button
          onClick={() => onDelete(routine)}
          className="p-2 rounded-full text-neutral-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
          aria-label="Eliminar rutina"
        >
          <Trash2 size={17} />
        </button>

        <button
          onClick={() => onPlay(routine)}
          className="p-2.5 rounded-full bg-lime text-black hover:bg-lime-glow transition-colors"
          aria-label="Empezar rutina"
        >
          <Play size={16} fill="currentColor" />
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-border overflow-hidden"
          >
            <div className="p-3 space-y-2">
              {routine.exercises.length === 0 && (
                <p className="text-sm text-neutral-500 text-center py-2">
                  Esta rutina no tiene ejercicios todavía.
                </p>
              )}
              {routine.exercises.map((ex) => (
                <div
                  key={ex.routine_exercise_id}
                  className="flex items-center gap-2 bg-panel-2 rounded-xl px-3 py-2"
                >
                  <span className="flex-1 text-sm text-neutral-200 truncate">{ex.name}</span>
                  <button
                    onClick={() => onRemoveExercise(ex.routine_exercise_id)}
                    className="p-1 text-neutral-500 hover:text-red-400 transition-colors"
                    aria-label="Quitar de la rutina"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
              <button
                onClick={() => onAddExercise(routine)}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-xl border border-dashed border-lime/40 text-lime text-sm font-medium hover:bg-lime/5 transition-colors"
              >
                <Plus size={15} />
                Agregar ejercicio
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
