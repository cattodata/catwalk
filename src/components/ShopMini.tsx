import type { Shop } from '../types/shop'
import { Plus, Check, Star } from 'lucide-react'

interface Props {
  shop: Shop
  walkMin: number
  onSelect: (s: Shop) => void
  onAdd?: (s: Shop) => void
  picked?: boolean
}

export function ShopMini({ shop, walkMin, onSelect, onAdd, picked = false }: Props) {
  const multColor = shop.mult === 3 ? 'var(--coral)' : shop.mult === 2 ? '#cf9a17' : 'var(--blue)'
  return (
    <div className={`cc-shop-mini${picked ? ' is-picked' : ''}`}>
      <button type="button" className="cc-shop-mini-tap" onClick={() => onSelect(shop)}>
        <span className="cc-shop-mini-em" aria-hidden="true">{shop.emoji}</span>
        <span className="cc-shop-mini-body">
          <span className="cc-shop-mini-top">
            <b>{shop.name}</b>
            <span className="cc-shop-mini-mult" style={{ color: multColor, borderColor: multColor }}>
              {shop.mult}×
            </span>
          </span>
          <small>
            {shop.rating != null && (
              <span className="cc-rating" title={shop.ratingReal ? 'Google rating' : 'Estimated rating'}>
                <Star size={10} strokeWidth={2.4} fill="currentColor" />
                {shop.rating.toFixed(1)}
                {shop.reviewCount != null && (
                  <span className="cc-rating-n">({shop.reviewCount})</span>
                )}
                {' · '}
              </span>
            )}
            {shop.dist}m · {walkMin} min · {shop.pts} pts
          </small>
        </span>
      </button>
      {onAdd && (
        <button
          type="button"
          className={`cc-shop-mini-add${picked ? ' is-on' : ''}`}
          onClick={(e) => {
            e.stopPropagation()
            onAdd(shop)
          }}
          aria-pressed={picked}
          aria-label={picked ? `Remove ${shop.name} from plan` : `Add ${shop.name} to plan`}
        >
          {picked ? <Check size={14} strokeWidth={3} /> : <Plus size={14} strokeWidth={3} />}
        </button>
      )}
    </div>
  )
}

interface RailProps {
  shops: Shop[]
  onSelect: (s: Shop) => void
  onAdd?: (s: Shop) => void
  pickedIds?: string[]
}

export function ShopMiniRail({ shops, onSelect, onAdd, pickedIds = [] }: RailProps) {
  if (!shops.length) return null
  return (
    <div className="cc-shop-mini-rail" role="list">
      {shops.map((s) => (
        <ShopMini
          key={s.id}
          shop={s}
          walkMin={Math.max(1, Math.round(s.dist / 80))}
          onSelect={onSelect}
          onAdd={onAdd}
          picked={pickedIds.includes(s.id)}
        />
      ))}
    </div>
  )
}
