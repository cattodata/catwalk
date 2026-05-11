import type { CuisineId } from '../types/shop'

const CUISINES: { id: CuisineId; label: string; emoji: string }[] = [
  { id: 'all',     label: 'All',     emoji: '✨' },
  { id: 'Asian',   label: 'Asian',   emoji: '🍜' },
  { id: 'Western', label: 'Western', emoji: '🥐' },
  { id: 'Drinks',  label: 'Drinks',  emoji: '☕' },
  { id: 'Sweets',  label: 'Sweets',  emoji: '🍩' },
]

interface Props {
  active: CuisineId
  onChange: (id: CuisineId) => void
}

/**
 * Horizontal scrolling chip row of cuisine filters. Lets the walker
 * narrow shops by taste (Asian / Western / Drinks / Sweets) before
 * tapping a card. Reduces "forced-choice" feel of Smart Pick alone.
 */
export function CuisineRow({ active, onChange }: Props) {
  return (
    <div className="cc-cuisine-row" role="radiogroup" aria-label="Cuisine filter">
      {CUISINES.map((c) => (
        <button
          key={c.id}
          type="button"
          role="radio"
          aria-checked={c.id === active}
          className={`cc-cuisine-chip${c.id === active ? ' is-on' : ''}`}
          onClick={() => onChange(c.id)}
        >
          <span className="cc-cuisine-chip-em" aria-hidden="true">{c.emoji}</span>
          {c.label}
        </button>
      ))}
    </div>
  )
}
