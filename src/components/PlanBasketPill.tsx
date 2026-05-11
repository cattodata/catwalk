import { useNavigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import type { Shop } from '../types/shop'
import { usePlanBasket } from '../hooks/usePlanBasket'

interface Props {
  shops: Shop[]
}

export function PlanBasketPill({ shops }: Props) {
  const navigate = useNavigate()
  const ids = usePlanBasket()
  const picked = ids.map((id) => shops.find((s) => s.id === id)).filter((s): s is Shop => Boolean(s))
  if (picked.length === 0) return null

  const totalPts = picked.reduce((sum, s) => sum + s.pts, 0)
  const chain = picked.length >= 3 ? 1.2 : 1
  const pts = Math.round(totalPts * chain)

  return (
    <button
      type="button"
      className="cc-basket-pill"
      onClick={() => navigate('/walk/plan')}
      aria-label={`Open plan with ${picked.length} stops`}
    >
      <span className="cc-basket-emoji" aria-hidden="true">🐾</span>
      <span className="cc-basket-body">
        <span className="cc-basket-count">{picked.length} stop{picked.length === 1 ? '' : 's'}</span>
        <small>
          {pts} pts{chain > 1 ? ' · chain bonus' : ''}
        </small>
      </span>
      <span className="cc-basket-cta">
        Plan day
        <ArrowRight size={14} strokeWidth={2.4} />
      </span>
    </button>
  )
}
