import { motion, useAnimation } from 'framer-motion'
import { Trash2 } from 'lucide-react'

export default function SetRow({ index, kg, reps, onChangeKg, onChangeReps, onDelete, canDelete }) {
  const controls = useAnimation()

  function handleDragEnd(_, info) {
    if (canDelete && info.offset.x < -70) {
      controls.start({ x: -400, opacity: 0, transition: { duration: 0.2 } }).then(onDelete)
    } else {
      controls.start({ x: 0, transition: { type: 'spring', stiffness: 400, damping: 30 } })
    }
  }

  return (
    <div className="relative overflow-hidden rounded-xl">
      <div className="absolute inset-0 flex items-center justify-end pr-4 bg-red-500/80 text-white">
        <Trash2 size={16} />
      </div>
      <motion.div
        drag={canDelete ? 'x' : false}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={{ left: 0.6, right: 0 }}
        animate={controls}
        onDragEnd={handleDragEnd}
        className="relative flex items-center gap-2 bg-panel-2 rounded-xl px-3 py-2"
      >
        <span className="w-6 text-center text-xs font-semibold text-neutral-500">{index + 1}</span>
        <div className="flex-1 flex items-center gap-2">
          <input
            type="number"
            inputMode="decimal"
            value={kg}
            onChange={(e) => onChangeKg(e.target.value)}
            placeholder="kg"
            className="w-full bg-panel border border-border rounded-lg px-2.5 py-2 text-center text-white outline-none focus:border-lime transition-colors"
          />
          <span className="text-neutral-600 text-xs">×</span>
          <input
            type="number"
            inputMode="numeric"
            value={reps}
            onChange={(e) => onChangeReps(e.target.value)}
            placeholder="reps"
            className="w-full bg-panel border border-border rounded-lg px-2.5 py-2 text-center text-white outline-none focus:border-lime transition-colors"
          />
        </div>
      </motion.div>
    </div>
  )
}
