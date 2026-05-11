import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Gift, Leaf, Car, ArrowRight } from 'lucide-react'

import { ConfettiBurst } from '../components/ConfettiBurst'
import { PointsDisplay } from '../components/PointsDisplay'
import { useUserStats } from '../hooks/useUserStats'
import { useSupabaseAuth } from '../hooks/useSupabaseAuth'
import { tierFromCo2 } from '../data/tiers'

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
  shopName: 'Saint Honoré',
  shopEmoji: '🥐',
  dist: 480,
  points: 96,
  co2Kg: 0.08,
  discount: 15,
  isVerifiedGps: true,
}

export function RewardScreen() {
  const navigate = useNavigate()
  const auth = useSupabaseAuth()
  const { total_co2 } = useUserStats(auth.user?.id ?? null)

  const [data, setData] = useState<RewardData>(DEMO)
  useEffect(() => {
    const raw = sessionStorage.getItem('cc:reward')
    if (raw) {
      try {
        setData(JSON.parse(raw))
      } catch {
        /* keep demo */
      }
    }
  }, [])

  const tierBefore = useMemo(() => tierFromCo2(Math.max(0, total_co2 - data.co2Kg)), [total_co2, data.co2Kg])
  const tierAfter = useMemo(() => tierFromCo2(total_co2), [total_co2])
  const tierLevelOf = (id: string) =>
    id === 'sprout' ? 1 : id === 'bronze' ? 2 : id === 'silver' ? 3 : 4
  const isTierUp = tierBefore.id !== tierAfter.id

  return (
    <div className="cc-reward">
      <ConfettiBurst />
      <div className="cc-reward-inner">
        <span className="cc-reward-eb">
          ✓ GPS VERIFIED · {data.dist}M · WALK <span className="cc-reward-verif" aria-hidden="true">●</span>
        </span>

        <div className="cc-reward-mascot" aria-hidden="true">
          <span>🐱</span>
        </div>

        <PointsDisplay value={data.points} />

        {isTierUp && (
          <span className="cc-tier-up">
            UNLOCKED · TIER {tierLevelOf(tierBefore.id)} → TIER {tierLevelOf(tierAfter.id)} 🎉
          </span>
        )}

        <div className="cc-reward-cards">
          <button type="button" className="cc-rc cc-rc-action">
            <span className="cc-rc-em" aria-hidden="true"><Gift size={20} /></span>
            <span className="cc-rc-body">
              <b>{data.discount}% off</b> at {data.shopName}
            </span>
            <ArrowRight size={16} aria-hidden="true" />
          </button>
          <div className="cc-rc">
            <span className="cc-rc-em" aria-hidden="true"><Leaf size={20} /></span>
            <span className="cc-rc-body">
              <b>{data.co2Kg.toFixed(2)} kg CO₂</b> saved · trip receipt
            </span>
          </div>
          <div className="cc-rc">
            <span className="cc-rc-em" aria-hidden="true"><Car size={20} /></span>
            <span className="cc-rc-body">
              You'd have paid <b>$8.50 parking</b>
            </span>
          </div>
        </div>

        <button type="button" className="cc-reward-cta" onClick={() => navigate('/walk')}>
          Show code at counter →
        </button>
      </div>
    </div>
  )
}
