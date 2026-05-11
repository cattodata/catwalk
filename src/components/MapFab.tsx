import { Crosshair, Car } from 'lucide-react'
import { Link } from 'react-router-dom'

interface Props {
  onRecenter?: () => void
}

/**
 * Floating action buttons stacked top-right over the map.
 * - Recenter: re-aim map at user position (or Chatswood Station fallback)
 * - Park-and-Walk: deep-link to /walk/park (entry point for the parking screen)
 */
export function MapFab({ onRecenter }: Props) {
  return (
    <div className="cc-map-fab">
      <button type="button" className="cc-fab" onClick={onRecenter} aria-label="Recenter map">
        <Crosshair size={16} strokeWidth={2} aria-hidden="true" />
      </button>
      <Link to="/walk/park" className="cc-fab" aria-label="Driving? Find parking">
        <Car size={16} strokeWidth={2} aria-hidden="true" />
      </Link>
    </div>
  )
}
