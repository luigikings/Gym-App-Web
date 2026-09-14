import { useEffect, useState } from 'react'
import { Navigate, Outlet, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Timer } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { getActiveSession } from '../lib/api'
import BottomNav from '../components/BottomNav'

export default function DashboardLayout() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  const [activeSession, setActiveSession] = useState(null)

  useEffect(() => {
    if (!user) return
    getActiveSession(user.id).then(setActiveSession).catch(() => {})
  }, [user])

  if (loading) return null
  if (!user) return <Navigate to="/" replace />

  return (
    <div className="min-h-screen pb-20">
      {activeSession && (
        <motion.button
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          onClick={() => navigate(`/app/entrenar/${activeSession.routine_id}`)}
          className="w-full flex items-center justify-center gap-2 bg-lime text-black text-sm font-semibold py-2 animate-pulse"
        >
          <Timer size={16} />
          Tienes un entrenamiento en curso: {activeSession.routine_name} — Continuar
        </motion.button>
      )}
      <Outlet />
      <BottomNav />
    </div>
  )
}
