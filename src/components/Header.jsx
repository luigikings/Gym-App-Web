import { LogOut } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Header({ title, right }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  return (
    <header className="sticky top-0 z-20 bg-ink/90 backdrop-blur border-b border-border px-4 py-3 flex items-center justify-between">
      <div>
        <h1 className="text-lg font-bold text-white leading-tight">{title}</h1>
        <p className="text-xs text-neutral-500">{user?.name}</p>
      </div>
      <div className="flex items-center gap-2">
        {right}
        <button
          onClick={() => {
            logout()
            navigate('/')
          }}
          className="p-2 rounded-full text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
          aria-label="Cambiar de usuario"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  )
}
