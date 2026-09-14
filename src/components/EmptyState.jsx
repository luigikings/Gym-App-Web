export default function EmptyState({ icon: Icon, title, message }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6">
      <div className="w-16 h-16 rounded-2xl bg-panel-2 border border-border flex items-center justify-center mb-4 text-neutral-500">
        <Icon size={28} />
      </div>
      <h3 className="text-white font-semibold mb-1">{title}</h3>
      <p className="text-neutral-500 text-sm max-w-xs">{message}</p>
    </div>
  )
}
