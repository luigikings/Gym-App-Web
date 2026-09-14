import { useState } from 'react'
import Modal from './Modal'
import PhotoInput from './PhotoInput'
import { Dumbbell } from 'lucide-react'

export default function ExerciseFormModal({ open, onClose, onSave }) {
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
      setError('Ponle un nombre al ejercicio.')
      return
    }
    setSaving(true)
    try {
      await onSave({ name: name.trim(), photoFile: photo })
      reset()
      onClose()
    } catch (err) {
      setError(err.message ?? 'No se pudo guardar el ejercicio.')
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
      title="Nuevo ejercicio"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <PhotoInput onChange={setPhoto} icon={Dumbbell} />
        <div>
          <label className="text-xs text-neutral-400 mb-1 block">Nombre del ejercicio</label>
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej. Press banca"
            className="w-full bg-panel-2 border border-border rounded-xl px-4 py-3 text-white placeholder:text-neutral-500 outline-none focus:border-lime transition-colors"
          />
        </div>
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button
          type="submit"
          disabled={saving}
          className="w-full py-3 rounded-xl bg-lime text-black font-semibold hover:bg-lime-glow transition-colors disabled:opacity-60"
        >
          {saving ? 'Guardando…' : 'Agregar ejercicio'}
        </button>
      </form>
    </Modal>
  )
}
