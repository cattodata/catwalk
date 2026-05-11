import type { ParkingOption } from '../data/parking'

interface Props {
  option: ParkingOption
  selected?: boolean
  onSelect?: (id: string) => void
}

export function ParkOption({ option, selected = false, onSelect }: Props) {
  return (
    <button
      type="button"
      className={`cc-po cc-po-${option.variant}${selected ? ' is-selected' : ''}`}
      onClick={() => onSelect?.(option.id)}
      disabled={option.variant === 'bad'}
      aria-pressed={selected}
    >
      <span className="cc-po-em" aria-hidden="true">{option.emoji}</span>
      <span className="cc-po-body">
        <span className="cc-po-h">
          {option.name}
          {option.variant === 'best' && <span className="cc-po-badge">BEST</span>}
        </span>
        <span className="cc-po-meta">{option.meta}</span>
      </span>
      <span className="cc-po-right">
        <span className={`cc-po-pts ${option.variant === 'bad' ? 'is-bad' : ''}`}>{option.mult}</span>
        <span className={`cc-po-co2 ${option.variant === 'bad' ? 'is-bad' : ''}`}>{option.co2}</span>
      </span>
    </button>
  )
}
