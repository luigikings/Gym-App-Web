import Modal from './Modal'
import { AlertTriangle } from 'lucide-react'

export default function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title = 'Confirmar',
  message,
  confirmLabel = 'Eliminar',
  danger = true,
}) {
  return (
    <Modal open={open} onClose={onClose} title={title}>
      <div className="flex gap-3 mb-5">
        {danger && (
          <div className="shrink-0 w-9 h-9 rounded-full bg-red-500/15 text-red-400 flex items-center justify-center">
            <AlertTriangle size={18} />
          </div>
        )}
        <p className="text-sm text-neutral-300 leading-relaxed">{message}</p>
      </div>
      <div className="flex gap-3">
        <button
          onClick={onClose}
          className="flex-1 py-2.5 rounded-xl bg-panel-2 text-neutral-200 font-medium hover:bg-white/10 transition-colors"
        >
          Cancelar
        </button>
        <button
          onClick={() => {
            onConfirm()
            onClose()
          }}
          className={`flex-1 py-2.5 rounded-xl font-semibold transition-colors ${
            danger
              ? 'bg-red-500/90 text-white hover:bg-red-500'
              : 'bg-lime text-black hover:bg-lime-glow'
          }`}
        >
          {confirmLabel}
        </button>
      </div>
    </Modal>
  )
}
