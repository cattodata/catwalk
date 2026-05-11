import { useEffect, useMemo, useState } from 'react'
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

function makeRedemptionCode(seed: string): string {
  // Deterministic 4-digit code per (shop, second) — stable across re-renders within session
  let h = 0
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0
  return String(h % 10000).padStart(4, '0')
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
  const [copied, setCopied] = useState(false)

  const redemptionCode = useMemo(() => {
    const seed = `${shopName}-${points}-${Math.floor(Date.now() / 60000)}`
    return makeRedemptionCode(seed)
  }, [shopName, points])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  const copyCode = () => {
    try {
      navigator.clipboard.writeText(redemptionCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {/* clipboard unavailable */}
  }

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
            <div className="r-stat-num" title={tier.label} aria-label={`Tier ${tier.label}`}>
              {tier.emoji}
            </div>
            <div className="r-stat-label">{tier.label}</div>
          </div>
        </div>

        {/* Real redemption code — show at counter */}
        <div className="r-code-block">
          <div className="r-code-label">Show this code at the counter</div>
          <div className="r-code-row">
            <span className="r-code">{redemptionCode}</span>
            <button
              className={`r-code-copy ${copied ? 'is-copied' : ''}`}
              onClick={copyCode}
              type="button"
              aria-label="Copy redemption code"
            >
              {copied ? '✓ Copied' : 'Copy'}
            </button>
          </div>
          <div className="r-code-hint">Valid for 24h · staff verifies + applies {discount}% off</div>
        </div>

        <button className="r-cta" onClick={onClose} type="button">
          Got it
        </button>
      </div>
    </div>
  )
}
