import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Dumbbell, ShieldCheck } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { listUsers, createUser, verifyUserClave } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import PinModal from '../components/PinModal'
import AddUserModal from '../components/AddUserModal'

export default function UserSelectPage() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [pinError, setPinError] = useState('')
  const [showAddUser, setShowAddUser] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    refresh()
  }, [])

  async function refresh() {
    setLoading(true)
    try {
      const data = await listUsers()
      setUsers(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function handlePinSubmit(clave) {
    setPinError('')
    try {
      const verified = await verifyUserClave(selected.id, clave)
      if (!verified) {
        setPinError('Palabra clave incorrecta.')
        return
      }
      login(verified)
      navigate('/app/rutinas')
    } catch (err) {
      setPinError(err.message ?? 'Algo salió mal.')
    }
  }

  const admins = users.filter((u) => u.is_admin)

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-16">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-2 mb-10"
      >
        <Dumbbell className="text-lime" size={28} />
        <h1 className="text-2xl font-bold tracking-tight">
          Gym <span className="text-lime">Tracker</span>
        </h1>
      </motion.div>

      <p className="text-neutral-400 text-sm mb-8">¿Quién entrena hoy?</p>

      {loading ? (
        <p className="text-neutral-500 text-sm">Cargando usuarios…</p>
      ) : (
        <div className="flex flex-wrap justify-center gap-6 max-w-2xl">
          {users.map((u, i) => (
            <motion.button
              key={u.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setSelected(u)}
              className="flex flex-col items-center gap-2 group"
            >
              <div className="relative w-20 h-20 rounded-2xl bg-panel-2 border border-border flex items-center justify-center text-2xl font-bold text-neutral-300 group-hover:border-lime group-hover:text-lime transition-colors">
                {u.name.slice(0, 2).toUpperCase()}
                {u.is_admin && (
                  <span className="absolute -top-2 -right-2 bg-lime text-black rounded-full p-1">
                    <ShieldCheck size={12} />
                  </span>
                )}
              </div>
              <span className="text-sm text-neutral-300 group-hover:text-white transition-colors">
                {u.name}
              </span>
            </motion.button>
          ))}

          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: users.length * 0.05 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowAddUser(true)}
            className="flex flex-col items-center gap-2 group"
          >
            <div className="w-20 h-20 rounded-2xl bg-transparent border border-dashed border-border flex items-center justify-center text-neutral-500 group-hover:border-lime group-hover:text-lime transition-colors">
              <Plus size={26} />
            </div>
            <span className="text-sm text-neutral-500 group-hover:text-white transition-colors">
              Añadir
            </span>
          </motion.button>
        </div>
      )}

      <PinModal
        open={!!selected}
        userName={selected?.name ?? ''}
        error={pinError}
        onClose={() => {
          setSelected(null)
          setPinError('')
        }}
        onSubmit={handlePinSubmit}
      />

      <AddUserModal
        open={showAddUser}
        admins={admins}
        onClose={() => setShowAddUser(false)}
        onCreate={async ({ name, clave }) => {
          await createUser({ name, clave, isAdmin: false })
          await refresh()
        }}
      />
    </div>
  )
}
