import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, History } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { listHistory } from '../lib/api'
import Header from '../components/Header'
import EmptyState from '../components/EmptyState'

function formatDuration(totalSeconds) {
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = Math.floor(totalSeconds % 60)
  const pad = (n) => String(n).padStart(2, '0')
  return h > 0 ? `${h}h ${pad(m)}m` : `${m}m ${pad(s)}s`
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('es-ES', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export default function HistoryPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [openId, setOpenId] = useState(null)

  useEffect(() => {
    if (!user) return
    listHistory(user.id)
      .then(setSessions)
      .finally(() => setLoading(false))
  }, [user])

  return (
    <div>
      <Header title="Historial" right={<span className="text-xs text-neutral-500">{sessions.length}/30</span>} />
      <div className="px-4 py-4 max-w-2xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="text-sm text-neutral-400 hover:text-white transition-colors mb-4"
        >
          ← Volver a rutinas
        </button>

        {!loading && sessions.length === 0 && (
          <EmptyState
            icon={History}
            title="Todavía no hay entrenamientos"
            message="Cuando termines una rutina, aparecerá aquí."
          />
        )}

        <div className="space-y-3">
          {sessions.map((s) => (
            <div key={s.id} className="bg-panel border border-border rounded-2xl overflow-hidden">
              <button
                onClick={() => setOpenId(openId === s.id ? null : s.id)}
                className="w-full flex items-center justify-between p-4 text-left"
              >
                <div>
                  <p className="font-semibold text-white">{s.routine_name}</p>
                  <p className="text-xs text-neutral-500 capitalize">{formatDate(s.date)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-lime font-medium">
                    {formatDuration(s.duration_seconds)}
                  </span>
                  <motion.div animate={{ rotate: openId === s.id ? 180 : 0 }}>
                    <ChevronDown size={18} className="text-neutral-500" />
                  </motion.div>
                </div>
              </button>

              <AnimatePresence>
                {openId === s.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-border overflow-hidden"
                  >
                    <div className="p-4 space-y-3">
                      {s.exercises.map((ex) => (
                        <div key={ex.name}>
                          <p className="text-sm font-medium text-neutral-200 mb-1.5">{ex.name}</p>
                          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                            {ex.sets.map((set) => (
                              <span
                                key={set.id}
                                className="shrink-0 bg-panel-2 border border-border rounded-lg px-3 py-1.5 text-xs text-neutral-300 whitespace-nowrap"
                              >
                                {set.kg}kg × {set.reps}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
