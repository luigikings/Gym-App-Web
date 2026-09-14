import { AlertTriangle, Dumbbell } from 'lucide-react'

export default function SetupNotice() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-16">
      <div className="max-w-md w-full text-center">
        <div className="flex items-center justify-center gap-2 mb-6">
          <Dumbbell className="text-lime" size={26} />
          <h1 className="text-xl font-bold">
            Gym <span className="text-lime">Tracker</span>
          </h1>
        </div>
        <div className="bg-panel border border-yellow-500/30 rounded-2xl p-5 text-left">
          <div className="flex items-center gap-2 text-yellow-400 font-semibold mb-2">
            <AlertTriangle size={18} />
            Falta configurar Supabase
          </div>
          <p className="text-sm text-neutral-400 leading-relaxed">
            Crea un archivo <code className="text-lime">.env</code> a partir de{' '}
            <code className="text-lime">.env.example</code> con la URL y la clave anónima de tu
            proyecto de Supabase. Mira el <code className="text-lime">README.md</code> para los
            pasos completos (crear proyecto, correr <code className="text-lime">supabase/schema.sql</code>).
          </p>
        </div>
      </div>
    </div>
  )
}
