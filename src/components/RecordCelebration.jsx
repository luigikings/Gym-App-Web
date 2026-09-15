import { useEffect } from 'react'
import { motion } from 'framer-motion'
import confetti from 'canvas-confetti'
import { Trophy } from 'lucide-react'

export default function RecordCelebration({ brokenRecords, onClose }) {
  useEffect(() => {
    let cancelled = false
    const duration = 1500
    const end = Date.now() + duration
    ;(function frame() {
      if (cancelled) return
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 70,
        origin: { x: 0 },
        colors: ['#c6ff00', '#ffffff', '#9be000'],
      })
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 70,
        origin: { x: 1 },
        colors: ['#c6ff00', '#ffffff', '#9be000'],
      })
      if (Date.now() < end) requestAnimationFrame(frame)
    })()
    return () => {
      cancelled = true
      confetti.reset()
    }
  }, [])

  return (
    <motion.div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/85 backdrop-blur-sm p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 16 }}
        className="w-full max-w-sm bg-panel border border-lime/40 rounded-3xl p-6 text-center shadow-[0_0_40px_-5px_rgba(198,255,0,0.4)]"
      >
        <div className="w-16 h-16 mx-auto rounded-full bg-lime/15 text-lime flex items-center justify-center mb-4">
          <Trophy size={30} />
        </div>
        <h2 className="text-xl font-bold text-lime mb-1">¡Nuevo récord!</h2>
        <p className="text-neutral-400 text-sm mb-5">
          Rompiste {brokenRecords.length > 1 ? 'estos récords' : 'este récord'} 🔥
        </p>
        <div className="space-y-3 mb-6 max-h-[40vh] overflow-y-auto no-scrollbar">
          {brokenRecords.map((r) => (
            <div key={r.exerciseId} className="bg-panel-2 rounded-2xl p-3 text-left">
              <p className="font-semibold text-white text-sm mb-2">{r.exerciseName}</p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-neutral-500">
                  {r.prev ? `${r.prev.kg}kg × ${r.prev.reps}` : 'Sin récord previo'}
                </span>
                <span className="text-neutral-600">→</span>
                <span className="text-lime font-bold">
                  {r.next.kg}kg × {r.next.reps}
                </span>
              </div>
            </div>
          ))}
        </div>
        <button
          onClick={onClose}
          className="w-full py-3 rounded-xl bg-lime text-black font-semibold hover:bg-lime-glow transition-colors"
        >
          Genial
        </button>
      </motion.div>
    </motion.div>
  )
}
