import { Crosshair, Car, Search } from 'lucide-react'
import { Link } from 'react-router-dom'

interface Props {
  onRecenter?: () => void
  onSearch?: () => void
}

/**
 * Floating action buttons stacked top-right over the map.
 * - Recenter: re-aim map at user position (or Chatswood Station fallback)
 * - Search: open shop search overlay sheet (v2 mockup pattern)
 * - Park-and-Walk: deep-link to /walk/park
 */
export function MapFab({ onRecenter, onSearch }: Props) {
  return (
    <div className="cc-map-fab">
      <button type="button" className="cc-fab" onClick={onRecenter} aria-label="Recenter map">
        <Crosshair size={16} strokeWidth={2} aria-hidden="true" />
      </button>
      {onSearch && (
        <button type="button" className="cc-fab" onClick={onSearch} aria-label="Search shops">
          <Search size={16} strokeWidth={2} aria-hidden="true" />
        </button>
      )}
      <Link to="/walk/park" className="cc-fab" aria-label="Driving? Find parking">
        <Car size={16} strokeWidth={2} aria-hidden="true" />
      </Link>
    </div>
  )
}
