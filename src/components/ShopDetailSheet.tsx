import type { Shop, TransportId } from '../types/shop'
import { Footprints, ChevronLeft, Star } from 'lucide-react'
import { Stat3Grid } from './Stat3Grid'
import { TransportModesRow } from './TransportModesRow'
import { DroveHint } from './DroveHint'

interface Props {
  shop: Shop
  transport: TransportId
  onTransport: (t: TransportId) => void
  onStart: () => void
  onBack: () => void
}

/**
 * Sheet content when a shop pin is tapped. Shop name + meta + Stat3Grid +
 * transport pills + Start CTA + DroveHint anti-car comparison.
 */
export function ShopDetailSheet({ shop, transport, onTransport, onStart, onBack }: Props) {
  const walkMin = Math.max(1, Math.round(shop.dist / 80))
  return (
    <div className="cc-sd">
      <header className="cc-sd-head">
        <button type="button" className="cc-icon-btn cc-sd-back" onClick={onBack} aria-label="Back">
          <ChevronLeft size={18} aria-hidden="true" />
        </button>
        <div className="cc-sd-title">
          <h3>
            {shop.name} <span aria-hidden="true">{shop.emoji}</span>
          </h3>
          <span className="cc-sd-meta">
            {shop.rating != null && (
              <span className="cc-rating cc-rating-lg" title={shop.ratingReal ? 'Google rating' : 'Estimated'}>
                <Star size={12} strokeWidth={2.4} fill="currentColor" />
                {shop.rating.toFixed(1)}
                {shop.reviewCount != null && (
                  <span className="cc-rating-n">({shop.reviewCount})</span>
                )}
                {' · '}
              </span>
            )}
            {shop.dist}M · {walkMin} MIN · <Footprints size={11} strokeWidth={2.4} aria-hidden="true" /> WALK
          </span>
        </div>
      </header>

      <Stat3Grid
        stats={[
          { tone: 'coral', value: `${shop.pts}`, label: 'POINTS' },
          { tone: 'amber', value: `${shop.off}%`, label: 'OFF TODAY' },
          { tone: 'sage', value: shop.co2.toFixed(2), label: 'KG CO₂' },
        ]}
      />

      <TransportModesRow
        active={transport}
        onChange={onTransport}
        walkMin={walkMin}
        basePts={shop.pts}
        baseCo2={shop.co2}
      />

      <button type="button" className="cc-sd-cta" onClick={onStart}>
        <span aria-hidden="true">🐾</span> Start the walk
      </button>

      <DroveHint parkingDollars={8.5} kg={0.09} />
    </div>
  )
}
