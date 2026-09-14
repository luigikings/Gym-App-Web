import { motion } from 'framer-motion'
import { Dumbbell, Trash2 } from 'lucide-react'
import { publicPhotoUrl } from '../lib/supabaseClient'

export default function ExerciseCard({ exercise, onDelete, selectable, selected, onToggle }) {
  const photoUrl = publicPhotoUrl(exercise.photo_url)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      onClick={selectable ? onToggle : undefined}
      className={`flex items-center gap-3 bg-panel border rounded-2xl p-3 transition-colors ${
        selectable ? 'cursor-pointer' : ''
      } ${selected ? 'border-lime bg-lime/5' : 'border-border'}`}
    >
      <div className="w-12 h-12 rounded-xl bg-panel-2 overflow-hidden flex items-center justify-center shrink-0">
        {photoUrl ? (
          <img src={photoUrl} alt={exercise.name} className="w-full h-full object-cover" />
        ) : (
          <Dumbbell size={20} className="text-neutral-500" />
        )}
      </div>
      <p className="flex-1 font-medium text-white truncate">{exercise.name}</p>
      {selectable ? (
        <div
          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
            selected ? 'border-lime bg-lime' : 'border-neutral-600'
          }`}
        >
          {selected && <div className="w-2 h-2 rounded-full bg-black" />}
        </div>
      ) : (
        onDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDelete(exercise)
            }}
            className="p-2 rounded-full text-neutral-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
            aria-label="Eliminar ejercicio"
          >
            <Trash2 size={17} />
          </button>
        )
      )}
    </motion.div>
  )
}
