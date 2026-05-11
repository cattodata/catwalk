import type { Shop } from '../types/shop'
import { Flame } from 'lucide-react'

interface Props {
  shops: Shop[]
  onSelect: (shop: Shop) => void
}

/**
 * Live deals rail — surfaces shops with high discount (off >= 15) as
 * a horizontal scrolling rail. Real shop data, real % off. Encourages
 * walker to pick a discount-heavy shop right now.
 */
export function LiveDealsRail({ shops, onSelect }: Props) {
  if (!shops.length) return null
  return (
    <section className="cc-deals" aria-label="Live deals nearby">
      <header className="cc-deals-head">
        <Flame size={13} strokeWidth={2.4} aria-hidden="true" />
        <span>LIVE DEALS NEARBY</span>
        <span className="cc-deals-count">{shops.length} active</span>
      </header>
      <div className="cc-deals-row">
        {shops.slice(0, 6).map((s) => (
          <button
            key={s.id}
            type="button"
            className="cc-deal-card"
            onClick={() => onSelect(s)}
          >
            <span className="cc-deal-off">{s.off}%</span>
            <span className="cc-deal-off-l">OFF</span>
            <span className="cc-deal-em" aria-hidden="true">{s.emoji}</span>
            <span className="cc-deal-name">{s.name}</span>
            <span className="cc-deal-meta">
              {s.dist}m · {Math.max(1, Math.round(s.dist / 75))} min
            </span>
          </button>
        ))}
      </div>
    </section>
  )
}
