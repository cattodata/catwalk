import type { TransportId } from '../types/shop'
import { Footprints, Bike, TrainFront, ParkingSquare } from 'lucide-react'

interface ModeDef {
  id: TransportId
  label: string
  sub: string
  Icon: typeof Footprints
}

const FULL_MODES: ModeDef[] = [
  { id: 'walk',  label: 'Walk',   sub: '7 min', Icon: Footprints },
  { id: 'bike',  label: 'Bike',   sub: '+1×',   Icon: Bike },
  { id: 'bus',   label: 'Train',  sub: '+1×',   Icon: TrainFront },
  { id: 'scoot', label: 'Park&W', sub: '+2×',   Icon: ParkingSquare },
]

interface Props {
  active: TransportId
  onChange: (id: TransportId) => void
  /** Compact 3-mode variant for shop-selected sheet (Walk / Bike / Train+W) */
  compact?: boolean
}

export function TransportModesRow({ active, onChange, compact = false }: Props) {
  const modes = compact ? FULL_MODES.slice(0, 3) : FULL_MODES
  return (
    <div className="cc-modes-row" role="radiogroup" aria-label="Transport mode">
      {modes.map(({ id, label, sub, Icon }) => {
        const on = id === active
        return (
          <button
            key={id}
            type="button"
            role="radio"
            aria-checked={on}
            className={`cc-mode-pill${on ? ' is-on' : ''}`}
            onClick={() => onChange(id)}
          >
            <Icon size={16} strokeWidth={2} aria-hidden="true" />
            <span className="cc-mode-pill-l">{label}</span>
            <span className="cc-mode-pill-s">{sub}</span>
          </button>
        )
      })}
    </div>
  )
}
