import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { X } from 'lucide-react'

import { ConfettiBurst } from '../components/ConfettiBurst'
import { PointsDisplay } from '../components/PointsDisplay'
import { TierRibbon } from '../components/TierRibbon'
import { tierFromCo2 } from '../data/tiers'
import { seedTotals } from '../data/walkHistory'

interface RewardData {
  shopName: string
  shopEmoji: string
  dist: number
  points: number
  co2Kg: number
  discount: number
  isVerifiedGps: boolean
}

const DEMO: RewardData = {
  shopName: 'Gongcha',
  shopEmoji: '🧋',
  dist: 480,
  points: 96,
  co2Kg: 0.08,
  discount: 15,
  isVerifiedGps: false,
}

export function RewardScreen() {
  const navigate = useNavigate()
  const [search] = useSearchParams()
  const isDemo = search.get('demo') === '1'
  // Use the same shared seed as /walk + /walk/rewards + /walk/profile so the
  // reward screen's KG SAVED matches the rest of the app instead of reading
  // the empty Supabase store (which always returns 0 in pitch demo).
  const total_co2 = useMemo(() => seedTotals().co2, [])

  const [data, setData] = useState<RewardData | null>(null)
  useEffect(() => {
    const raw = sessionStorage.getItem('cc:reward')
    if (raw) {
      try {
        setData(JSON.parse(raw))
        return
      } catch {
        /* fall through */
      }
    }
    if (isDemo) {
      setData(DEMO)
      return
    }
    navigate('/walk', { replace: true })
  }, [navigate, isDemo])

  const co2Delta = data?.co2Kg ?? 0
  const tierBefore = useMemo(() => tierFromCo2(Math.max(0, total_co2 - co2Delta)), [total_co2, co2Delta])
  const tierAfter = useMemo(() => tierFromCo2(total_co2), [total_co2])
  const tierLevelOf = (id: string) =>
    id === 'sprout' ? 1 : id === 'bronze' ? 2 : id === 'silver' ? 3 : 4
  const isTierUp = tierBefore.id !== tierAfter.id
  const tierPct =
    tierAfter.next != null ? Math.round(((total_co2 - tierAfter.min) / (tierAfter.next - tierAfter.min)) * 100) : 100

  if (!data) return null

  const walkMin = Math.max(1, Math.round(data.dist / 80))

  return (
    <div className="cc-reward-v55">
      <ConfettiBurst />

      <header className="cc-reward-v55-bar">
        <TierRibbon
          tierLevel={tierLevelOf(tierAfter.id)}
          tierName={tierAfter.label}
          progressPct={tierPct}
          kgSaved={total_co2}
        />
        <button
          type="button"
          className="cc-reward-v55-close"
          aria-label="Close"
          onClick={() => navigate('/walk')}
        >
          <X size={18} strokeWidth={2.4} />
        </button>
      </header>

      <span className="cc-reward-v55-eb">
        You made it 🎉 · <span>{walkMin} MIN WALK</span>
      </span>

      <div className="cc-reward-v55-hero" aria-hidden="true">
        {/* sparkle decorations */}
        <span className="cc-sparkle s1">✦</span>
        <span className="cc-sparkle s2">✧</span>
        <span className="cc-sparkle s3">✦</span>
        <span className="cc-sparkle s4">✧</span>
        <span className="cc-sparkle s5">✦</span>
        <div className="cc-reward-v55-disc">
          <span className="cc-reward-v55-emoji">{data.shopEmoji}</span>
        </div>
      </div>

      <h2 className="cc-reward-v55-h">Treat unlocked!</h2>
      <p className="cc-reward-v55-body">
        Show this at the counter for your <b>{data.discount}% off</b> at {data.shopName}.
      </p>

      <div className="cc-reward-v55-points">
        <PointsDisplay value={data.points} />
        <span className="cc-reward-v55-pl">POINTS EARNED</span>
      </div>

      {isTierUp && (
        <span className="cc-tier-up">
          UNLOCKED · TIER {tierLevelOf(tierBefore.id)} → TIER {tierLevelOf(tierAfter.id)} 🎉
        </span>
      )}

      <button type="button" className="cc-reward-v55-cta" onClick={() => navigate('/walk')}>
        Show code at counter
      </button>
    </div>
  )
}
