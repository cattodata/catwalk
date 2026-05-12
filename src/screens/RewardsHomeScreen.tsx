import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

import { AppBarLockup } from '../components/AppBarLockup'
import { BottomNav } from '../components/BottomNav'
import { TierRibbon } from '../components/TierRibbon'
import { CattoPill } from '../components/CattoPill'
import { useUserStats } from '../hooks/useUserStats'
import { useSupabaseAuth } from '../hooks/useSupabaseAuth'
import { tierFromCo2 } from '../data/tiers'

const TIERS = [
  { id: 'sprout', label: 'Sprout', emoji: '🌱', threshold: 0, color: '#7BC97F' },
  { id: 'bronze', label: 'Bronze', emoji: '🥉', threshold: 0.3, color: '#FF6B9D' },
  { id: 'silver', label: 'Silver', emoji: '🥈', threshold: 1.5, color: '#B49EFB' },
  { id: 'gold', label: 'Gold', emoji: '🏆', threshold: 5, color: '#F5C842' },
]

// Seed walk history for demo (when Supabase env empty). Each walk = real
// shop name + emoji + points + date.
const SEED_HISTORY = [
  { id: 'w1', shop: 'Saint Honoré', emoji: '🥐', pts: 96, daysAgo: 0, co2: 0.08 },
  { id: 'w2', shop: 'Gong Cha', emoji: '🧋', pts: 248, daysAgo: 1, co2: 0.05 },
  { id: 'w3', shop: 'Mamak', emoji: '🍜', pts: 28, daysAgo: 2, co2: 0.04 },
  { id: 'w4', shop: 'Three Beans', emoji: '☕', pts: 16, daysAgo: 3, co2: 0.02 },
  { id: 'w5', shop: 'Hakata Maru', emoji: '🍜', pts: 34, daysAgo: 5, co2: 0.06 },
]

function fmtDaysAgo(d: number): string {
  if (d === 0) return 'today'
  if (d === 1) return 'yesterday'
  return `${d}d ago`
}

export function RewardsHomeScreen() {
  const navigate = useNavigate()
  const auth = useSupabaseAuth()
  const { total_co2 } = useUserStats(auth.user?.id ?? null)

  const tier = useMemo(() => tierFromCo2(total_co2), [total_co2])
  const tierLevel = tier.id === 'sprout' ? 1 : tier.id === 'bronze' ? 2 : tier.id === 'silver' ? 3 : 4
  const tierPct = tier.next != null ? Math.round(((total_co2 - tier.min) / (tier.next - tier.min)) * 100) : 100

  const totalWalks = SEED_HISTORY.length
  const totalPts = SEED_HISTORY.reduce((s, w) => s + w.pts, 0)
  const totalCo2 = +SEED_HISTORY.reduce((s, w) => s + w.co2, 0).toFixed(2)

  return (
    <div className="cc-rewards-screen">
      <AppBarLockup />

      <div className="cc-rewards-body">
        <div className="cc-rewards-tier">
          <TierRibbon
            tierLevel={tierLevel}
            tierName={tier.label}
            progressPct={tierPct}
            kgSaved={total_co2}
          />
          <p className="cc-rewards-tier-cta">
            {tier.next != null ? (
              <>
                <mark>{(tier.next - total_co2).toFixed(2)} kg</mark> until next tier
              </>
            ) : (
              <>Max tier · keep stacking points</>
            )}
          </p>
        </div>

        <section className="cc-rewards-badges">
          <header>
            <span className="cc-rewards-h">ACHIEVEMENT BADGES</span>
            <span className="cc-rewards-h-r">{tierLevel} of {TIERS.length}</span>
          </header>
          <div className="cc-rewards-badge-grid">
            {TIERS.map((t, i) => {
              const earned = i + 1 <= tierLevel
              return (
                <div key={t.id} className={`cc-rewards-badge${earned ? ' is-on' : ''}`}>
                  <span className="cc-rewards-badge-em" aria-hidden="true">{t.emoji}</span>
                  <span className="cc-rewards-badge-l">{t.label}</span>
                  <small>{t.threshold === 0 ? 'Start' : `${t.threshold}kg`}</small>
                </div>
              )
            })}
          </div>
        </section>

        <section className="cc-rewards-history">
          <header>
            <span className="cc-rewards-h">RECENT WALKS</span>
            <span className="cc-rewards-h-r">{SEED_HISTORY.length} walks</span>
          </header>
          <ul>
            {SEED_HISTORY.map((w) => (
              <li key={w.id}>
                <span className="cc-rewards-hist-em" aria-hidden="true">{w.emoji}</span>
                <span className="cc-rewards-hist-body">
                  <span>{w.shop}</span>
                  <small>{fmtDaysAgo(w.daysAgo)} · {w.co2.toFixed(2)} kg saved</small>
                </span>
                <span className="cc-rewards-hist-pts">+{w.pts}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="cc-rewards-lifetime">
          <CattoPill tone="dark">LIFETIME</CattoPill>
          <div className="cc-rewards-life-grid">
            <div>
              <div className="cc-rewards-life-v">{totalWalks}</div>
              <div className="cc-rewards-life-l">WALKS</div>
            </div>
            <div>
              <div className="cc-rewards-life-v">{totalCo2}kg</div>
              <div className="cc-rewards-life-l">CO₂ SAVED</div>
            </div>
            <div>
              <div className="cc-rewards-life-v">{totalPts}</div>
              <div className="cc-rewards-life-l">POINTS</div>
            </div>
          </div>
        </section>

        <button
          type="button"
          className="cc-rewards-profile-link"
          onClick={() => navigate('/walk/profile')}
        >
          <span>View profile</span>
          <ArrowRight size={14} strokeWidth={2.4} />
        </button>
      </div>

      <BottomNav />
    </div>
  )
}
