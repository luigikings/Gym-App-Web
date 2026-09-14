import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Dumbbell, Trophy } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { listRecords } from '../lib/api'
import { publicPhotoUrl } from '../lib/supabaseClient'
import Header from '../components/Header'
import EmptyState from '../components/EmptyState'

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function RecordsPage() {
  const { user } = useAuth()
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    listRecords(user.id)
      .then(setRecords)
      .finally(() => setLoading(false))
  }, [user])

  if (loading) {
    return (
      <div>
        <Header title="Récords" />
      </div>
    )
  }

  if (records.length === 0) {
    return (
      <div>
        <Header title="Récords" />
        <EmptyState
          icon={Trophy}
          title="Todavía no hay récords"
          message="Termina un entrenamiento para empezar a registrar tus récords."
        />
      </div>
    )
  }

  const [latest, ...rest] = records

  return (
    <div>
      <Header title="Récords" />
      <div className="px-4 py-4 max-w-2xl mx-auto space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-lime/10 to-transparent border border-lime/30 rounded-3xl p-5"
        >
          <div className="flex items-center gap-2 mb-4 text-lime">
            <Trophy size={18} />
            <span className="text-sm font-semibold uppercase tracking-wide">
              Último récord roto
            </span>
          </div>
          <p className="text-xl font-bold text-white mb-4">{latest.exercise?.name}</p>
          <div className="flex items-center justify-between gap-3">
            <div className="flex-1 bg-black/30 rounded-2xl p-3 text-center">
              <p className="text-xs text-neutral-500 mb-1">Antes</p>
              {latest.prev_kg != null ? (
                <>
                  <p className="text-lg font-bold text-neutral-300">
                    {latest.prev_kg}kg × {latest.prev_reps}
                  </p>
                  <p className="text-[11px] text-neutral-600 mt-0.5">{formatDate(latest.prev_date)}</p>
                </>
              ) : (
                <p className="text-sm text-neutral-600">Sin récord previo</p>
              )}
            </div>
            <span className="text-2xl text-lime">→</span>
            <div className="flex-1 bg-lime/10 rounded-2xl p-3 text-center border border-lime/30">
              <p className="text-xs text-lime/70 mb-1">Ahora</p>
              <p className="text-lg font-bold text-lime">
                {latest.kg}kg × {latest.reps}
              </p>
              <p className="text-[11px] text-lime/50 mt-0.5">{formatDate(latest.date)}</p>
            </div>
          </div>
        </motion.div>

        {rest.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-neutral-400 mb-3 px-1">Todos los récords</h2>
            <div className="space-y-2">
              {rest
                .slice()
                .sort((a, b) => (a.exercise?.name ?? '').localeCompare(b.exercise?.name ?? ''))
                .map((r) => {
                  const photoUrl = publicPhotoUrl(r.exercise?.photo_url)
                  return (
                    <div
                      key={r.id}
                      className="flex items-center gap-3 bg-panel border border-border rounded-2xl p-3"
                    >
                      <div className="w-11 h-11 rounded-xl bg-panel-2 overflow-hidden flex items-center justify-center shrink-0">
                        {photoUrl ? (
                          <img src={photoUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <Dumbbell size={18} className="text-neutral-500" />
                        )}
                      </div>
                      <p className="flex-1 font-medium text-white truncate">{r.exercise?.name}</p>
                      <p className="text-sm font-bold text-lime">
                        {r.kg}kg × {r.reps}
                      </p>
                    </div>
                  )
                })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
