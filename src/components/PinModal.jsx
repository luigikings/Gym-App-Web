import { useState } from 'react'
import Modal from './Modal'
import { KeyRound } from 'lucide-react'

export default function PinModal({ open, onClose, userName, onSubmit, error }) {
  const [clave, setClave] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    onSubmit(clave)
  }

  return (
    <Modal
      open={open}
      onClose={() => {
        setClave('')
        onClose()
      }}
      title={`Hola, ${userName}`}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center gap-2 text-neutral-400 text-sm">
          <KeyRound size={16} />
          <span>Escribe tu palabra clave para entrar</span>
        </div>
        <input
          autoFocus
          type="password"
          value={clave}
          onChange={(e) => setClave(e.target.value)}
          placeholder="Palabra clave"
          className="w-full bg-panel-2 border border-border rounded-xl px-4 py-3 text-white placeholder:text-neutral-500 outline-none focus:border-lime transition-colors"
        />
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button
          type="submit"
          className="w-full py-3 rounded-xl bg-lime text-black font-semibold hover:bg-lime-glow transition-colors"
        >
          Entrar
        </button>
      </form>
    </Modal>
  )
}
