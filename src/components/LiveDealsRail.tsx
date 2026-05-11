import type { Shop } from '../types/shop'
import { Flame, Plus, Check, Star } from 'lucide-react'

interface Props {
  shops: Shop[]
  onSelect: (shop: Shop) => void
  onAdd?: (shop: Shop) => void
  pickedIds?: string[]
}

/**
 * Live deals rail — surfaces shops with high discount (off >= 15) as
 * a horizontal scrolling rail. Real shop data, real % off. Encourages
 * walker to pick a discount-heavy shop right now.
 */
export function LiveDealsRail({ shops, onSelect, onAdd, pickedIds = [] }: Props) {
  if (!shops.length) return null
  return (
    <section className="cc-deals" aria-label="Live deals nearby">
      <header className="cc-deals-head">
        <Flame size={13} strokeWidth={2.4} aria-hidden="true" />
        <span>LIVE DEALS NEARBY</span>
        <span className="cc-deals-count">{shops.length} active</span>
      </header>
      <div className="cc-deals-row">
        {shops.slice(0, 6).map((s) => {
          const picked = pickedIds.includes(s.id)
          return (
            <div key={s.id} className={`cc-deal-card${picked ? ' is-picked' : ''}`}>
              <button
                type="button"
                className="cc-deal-tap"
                onClick={() => onSelect(s)}
                aria-label={`View ${s.name}`}
              >
                <span className="cc-deal-off">{s.off}%</span>
                <span className="cc-deal-off-l">OFF</span>
                <span className="cc-deal-em" aria-hidden="true">{s.emoji}</span>
                <span className="cc-deal-name">{s.name}</span>
                <span className="cc-deal-meta">
                  {s.rating != null && (
                    <span className="cc-rating" title={s.ratingReal ? 'Google rating' : 'Estimated'}>
                      <Star size={10} strokeWidth={2.4} fill="currentColor" />
                      {s.rating.toFixed(1)}
                      {' · '}
                    </span>
                  )}
                  {s.dist}m · {Math.max(1, Math.round(s.dist / 75))} min
                </span>
              </button>
              {onAdd && (
                <button
                  type="button"
                  className={`cc-deal-add${picked ? ' is-on' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation()
                    onAdd(s)
                  }}
                  aria-pressed={picked}
                  aria-label={picked ? `Remove ${s.name} from plan` : `Add ${s.name} to plan`}
                >
                  {picked ? <Check size={13} strokeWidth={3} /> : <Plus size={13} strokeWidth={3} />}
                </button>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
