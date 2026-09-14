import { useEffect, useState } from 'react'
import { Timer as TimerIcon } from 'lucide-react'

function format(totalSeconds) {
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = Math.floor(totalSeconds % 60)
  const pad = (n) => String(n).padStart(2, '0')
  return h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`
}

export default function Timer({ startedAt }) {
  const [now, setNow] = useState(Date.now())

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  const elapsed = Math.max(0, Math.floor((now - startedAt) / 1000))

  return (
    <div className="flex items-center justify-center gap-2 py-3 bg-panel border-b border-border sticky top-0 z-20">
      <TimerIcon size={18} className="text-lime" />
      <span className="text-2xl font-bold tabular-nums text-white tracking-wider">
        {format(elapsed)}
      </span>
    </div>
  )
}

export function elapsedSecondsFrom(startedAt) {
  return Math.max(0, Math.floor((Date.now() - startedAt) / 1000))
}
