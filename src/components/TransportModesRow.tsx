import type { TransportId } from '../types/shop'
import { Footprints, Bike, TrainFront } from 'lucide-react'

interface ModeDef {
  id: TransportId
  label: string
  sub: string
  Icon: typeof Footprints
}

const BUILD_MODES = (walkSub: string): ModeDef[] => [
  { id: 'walk',  label: 'Walk',  sub: walkSub, Icon: Footprints },
  { id: 'bike',  label: 'Bike',  sub: '+1×',   Icon: Bike },
  { id: 'bus',   label: 'Train', sub: '+1×',   Icon: TrainFront },
]

interface Props {
  active: TransportId
  onChange: (id: TransportId) => void
  /** Compact variant for shop-selected sheet (same 3 modes). Kept for back-compat. */
  compact?: boolean
  /** Optional walk-minutes sub-label, e.g. "7 min". Default "best" when unknown. */
  walkMin?: number
}

export function TransportModesRow({ active, onChange, walkMin }: Props) {
  const walkSub = walkMin && walkMin > 0 ? `${walkMin} min` : 'best'
  const modes = BUILD_MODES(walkSub)
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
