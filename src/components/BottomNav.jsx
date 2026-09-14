import { NavLink } from 'react-router-dom'
import { Dumbbell, ListChecks, Trophy } from 'lucide-react'

const items = [
  { to: '/app/ejercicios', label: 'Ejercicios', icon: Dumbbell },
  { to: '/app/rutinas', label: 'Rutinas', icon: ListChecks },
  { to: '/app/records', label: 'Récords', icon: Trophy },
]

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-panel/95 backdrop-blur border-t border-border pb-[env(safe-area-inset-bottom)]">
      <div className="max-w-2xl mx-auto flex">
        {items.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center gap-1 py-2.5 text-xs transition-colors ${
                isActive ? 'text-lime' : 'text-neutral-500 hover:text-neutral-300'
              }`
            }
          >
            <Icon size={20} />
            {label}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
