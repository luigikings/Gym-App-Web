import { useRef, useState } from 'react'
import { Camera, Dumbbell } from 'lucide-react'

export default function PhotoInput({ onChange, previewUrl, icon: Icon = Dumbbell }) {
  const inputRef = useRef(null)
  const [preview, setPreview] = useState(previewUrl ?? null)

  function handleFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setPreview(URL.createObjectURL(file))
    onChange(file)
  }

  return (
    <button
      type="button"
      onClick={() => inputRef.current?.click()}
      className="relative w-24 h-24 rounded-2xl bg-panel-2 border border-dashed border-border overflow-hidden flex items-center justify-center mx-auto group"
    >
      {preview ? (
        <img src={preview} alt="Vista previa" className="w-full h-full object-cover" />
      ) : (
        <Icon size={30} className="text-neutral-500 group-hover:text-lime transition-colors" />
      )}
      <div className="absolute bottom-0 right-0 bg-lime text-black rounded-tl-lg p-1.5">
        <Camera size={13} />
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />
    </button>
  )
}
