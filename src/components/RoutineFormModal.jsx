import { useState } from 'react'
import Modal from './Modal'
import PhotoInput from './PhotoInput'
import { ListChecks } from 'lucide-react'

export default function RoutineFormModal({ open, onClose, onSave }) {
  const [name, setName] = useState('')
  const [photo, setPhoto] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function reset() {
    setName('')
    setPhoto(null)
    setError('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim()) {
      setError('Ponle un nombre a la rutina.')
      return
    }
    setSaving(true)
    try {
      await onSave({ name: name.trim(), photoFile: photo })
      reset()
      onClose()
    } catch (err) {
      setError(err.message ?? 'No se pudo guardar la rutina.')
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
      title="Nueva rutina"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <PhotoInput onChange={setPhoto} icon={ListChecks} />
        <div>
          <label className="text-xs text-neutral-400 mb-1 block">Nombre de la rutina</label>
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej. Día de empuje"
            className="w-full bg-panel-2 border border-border rounded-xl px-4 py-3 text-white placeholder:text-neutral-500 outline-none focus:border-lime transition-colors"
          />
        </div>
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button
          type="submit"
          disabled={saving}
          className="w-full py-3 rounded-xl bg-lime text-black font-semibold hover:bg-lime-glow transition-colors disabled:opacity-60"
        >
          {saving ? 'Guardando…' : 'Crear rutina'}
        </button>
      </form>
    </Modal>
  )
}
