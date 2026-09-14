import { useState } from 'react'
import Modal from './Modal'

export default function AddUserModal({ open, onClose, admins, onCreate }) {
  const [adminClave, setAdminClave] = useState('')
  const [name, setName] = useState('')
  const [clave, setClave] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  function reset() {
    setAdminClave('')
    setName('')
    setClave('')
    setError('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    const isValidAdmin = admins.some((a) => a.clave === adminClave)
    if (!isValidAdmin) {
      setError('La palabra clave de admin no es correcta.')
      return
    }
    if (!name.trim() || !clave.trim()) {
      setError('Rellena el nombre y la palabra clave del nuevo usuario.')
      return
    }
    setSaving(true)
    try {
      await onCreate({ name: name.trim(), clave: clave.trim() })
      reset()
      onClose()
    } catch (err) {
      setError(err.message ?? 'No se pudo crear el usuario.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={() => {
        reset()
        onClose()
      }}
      title="Nuevo usuario"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-xs text-neutral-400 mb-1 block">Palabra clave de Admin</label>
          <input
            type="password"
            value={adminClave}
            onChange={(e) => setAdminClave(e.target.value)}
            placeholder="Solo el admin puede crear usuarios"
            className="w-full bg-panel-2 border border-border rounded-xl px-4 py-3 text-white placeholder:text-neutral-500 outline-none focus:border-lime transition-colors"
          />
        </div>
        <div>
          <label className="text-xs text-neutral-400 mb-1 block">Nombre del nuevo usuario</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej. María"
            className="w-full bg-panel-2 border border-border rounded-xl px-4 py-3 text-white placeholder:text-neutral-500 outline-none focus:border-lime transition-colors"
          />
        </div>
        <div>
          <label className="text-xs text-neutral-400 mb-1 block">Su palabra clave</label>
          <input
            value={clave}
            onChange={(e) => setClave(e.target.value)}
            placeholder="Ej. tigre123"
            className="w-full bg-panel-2 border border-border rounded-xl px-4 py-3 text-white placeholder:text-neutral-500 outline-none focus:border-lime transition-colors"
          />
        </div>
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button
          type="submit"
          disabled={saving}
          className="w-full py-3 rounded-xl bg-lime text-black font-semibold hover:bg-lime-glow transition-colors disabled:opacity-60"
        >
          {saving ? 'Creando…' : 'Crear usuario'}
        </button>
      </form>
    </Modal>
  )
}
