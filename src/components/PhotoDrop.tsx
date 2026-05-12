import { useRef } from 'react'
import { Camera, Image as ImageIcon } from 'lucide-react'

interface Props {
  photoUrl: string | null
  onFile: (f: File | null) => void
}

export function PhotoDrop({ photoUrl, onFile }: Props) {
  // Two inputs so the user can pick camera OR album explicitly.
  // (A single input without `capture` on mobile still shows both, but the
  // explicit buttons remove ambiguity and let desktop work too.)
  const cameraRef = useRef<HTMLInputElement>(null)
  const albumRef = useRef<HTMLInputElement>(null)
  return (
    <div className="cc-photo-drop">
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={(e) => onFile(e.target.files?.[0] ?? null)}
        style={{ display: 'none' }}
      />
      <input
        ref={albumRef}
        type="file"
        accept="image/*"
        onChange={(e) => onFile(e.target.files?.[0] ?? null)}
        style={{ display: 'none' }}
      />
      {photoUrl ? (
        <img src={photoUrl} alt="" className="cc-photo-drop-img" />
      ) : (
        <div className="cc-photo-drop-empty">
          <span className="cc-photo-drop-em" aria-hidden="true">📸</span>
          <b>Add your hero product photo</b>
          <small>Catto reads it + live signals → 3-lang captions</small>
          <div className="cc-photo-drop-row">
            <button
              type="button"
              className="cc-photo-drop-btn cc-photo-drop-btn-primary"
              onClick={() => cameraRef.current?.click()}
            >
              <Camera size={16} strokeWidth={2.2} aria-hidden="true" />
              <span>Take photo</span>
            </button>
            <button
              type="button"
              className="cc-photo-drop-btn"
              onClick={() => albumRef.current?.click()}
            >
              <ImageIcon size={16} strokeWidth={2.2} aria-hidden="true" />
              <span>From album</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
