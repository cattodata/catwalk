import { useRef } from 'react'
import { Camera } from 'lucide-react'

interface Props {
  photoUrl: string | null
  onFile: (f: File | null) => void
}

export function PhotoDrop({ photoUrl, onFile }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  return (
    <label className="cc-photo-drop" onClick={() => inputRef.current?.click()}>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={(e) => onFile(e.target.files?.[0] ?? null)}
        style={{ display: 'none' }}
      />
      {photoUrl ? (
        <img src={photoUrl} alt="" className="cc-photo-drop-img" />
      ) : (
        <div className="cc-photo-drop-empty">
          <Camera size={28} strokeWidth={1.8} aria-hidden="true" />
          <b>Tap to capture hero product</b>
          <small>(jpg / png · stays on device)</small>
        </div>
      )}
    </label>
  )
}
