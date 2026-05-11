import type { Shop } from '../types/shop'

interface Props {
  shop: Shop
  walkMin: number
  onSelect: (s: Shop) => void
}

export function ShopMini({ shop, walkMin, onSelect }: Props) {
  const multColor = shop.mult === 3 ? 'var(--coral)' : shop.mult === 2 ? '#cf9a17' : 'var(--blue)'
  return (
    <button type="button" className="cc-shop-mini" onClick={() => onSelect(shop)}>
      <span className="cc-shop-mini-em" aria-hidden="true">{shop.emoji}</span>
      <span className="cc-shop-mini-body">
        <span className="cc-shop-mini-top">
          <b>{shop.name}</b>
          <span className="cc-shop-mini-mult" style={{ color: multColor, borderColor: multColor }}>
            {shop.mult}×
          </span>
        </span>
        <small>{shop.dist}m · {walkMin} min</small>
      </span>
    </button>
  )
}

export function ShopMiniRail({ shops, onSelect }: { shops: Shop[]; onSelect: (s: Shop) => void }) {
  if (!shops.length) return null
  return (
    <div className="cc-shop-mini-rail" role="list">
      {shops.map((s) => (
        <ShopMini key={s.id} shop={s} walkMin={Math.max(1, Math.round(s.dist / 80))} onSelect={onSelect} />
      ))}
    </div>
  )
}
