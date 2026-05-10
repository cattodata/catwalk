import { useEffect } from 'react'
import { tierFromCo2 } from '../data/tiers'

interface RewardOverlayProps {
  shopName: string
  points: number
  co2Kg: number
  discount: number
  totalCo2After: number
  isVerifiedGps: boolean
  onClose: () => void
}

export function RewardOverlay({
  shopName,
  points,
  co2Kg,
  discount,
  totalCo2After,
  isVerifiedGps,
  onClose,
}: RewardOverlayProps) {
  const tier = tierFromCo2(totalCo2After)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="cc-reward-toast" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="reward-title">
      <div className="cc-reward-card" onClick={(e) => e.stopPropagation()}>
        <div className="r-em" aria-hidden="true">🎉</div>
        <h3 id="reward-title">+{points} pts!</h3>
        <div className="r-sub">
          {isVerifiedGps ? '✓ GPS verified at ' : 'Banked at '}
          <b>{shopName}</b>
        </div>
        <div className="r-stats">
          <div className="r-stat">
            <div className="r-stat-num">{discount}%</div>
            <div className="r-stat-label">off in-store</div>
          </div>
          <div className="r-stat">
            <div className="r-stat-num">{co2Kg.toFixed(2)}<small>kg</small></div>
            <div className="r-stat-label">CO₂ saved</div>
          </div>
          <div className="r-stat">
            <div className="r-stat-num" title={tier.label}>
              {tier.emoji}
            </div>
            <div className="r-stat-label">{tier.label}</div>
          </div>
        </div>
        <button className="r-cta" onClick={onClose}>
          Show this code at the counter →
        </button>
      </div>
    </div>
  )
}
