import { useEffect, useMemo, useState } from 'react'
import { RotateCcw } from 'lucide-react'

import { BottomNav } from '../components/BottomNav'
import { SwitchRoleGear } from '../components/SwitchRoleSheet'
import { SegmentedTabs } from '../components/SegmentedTabs'
import { CattoPill } from '../components/CattoPill'
import { AnimatedCounter } from '../components/AnimatedCounter'
import { BoostedStreetsList } from '../components/BoostedStreets'
import { LangDonut } from '../components/LangDonut'
import { LeverSlider } from '../components/LeverSlider'

import { useCouncilStats } from '../hooks/useCouncilStats'
import { useDemographics } from '../hooks/useDemographics'
import { fetchPolicySuggestion, type PolicyResult } from '../lib/ai-policy'

type TabId = 'stats' | 'sandbox'

const TABS = [
  { id: 'stats' as const, label: 'Stats' },
  { id: 'sandbox' as const, label: 'Sandbox' },
]

// Single source of truth for slider → policy mapping.
// Each lever stores a slider-position 0..100 with a fixed BASELINE.
const INIT_LEVERS = {
  parkingPct: 30,    // baseline 30 ↔ display "−20%" (range: 0 ↔ +30%, 100 ↔ −70%)
  bikeMult: 60,      // baseline 60 ↔ display "3×"  (range: 0 ↔ 1×, 100 ↔ 5×)
  rewardBudget: 45,  // baseline 45 ↔ display "+$2k/wk" (range: 0 ↔ $0, 100 ↔ $4.4k)
}

// Pure helpers — display and prompt MUST agree (Council P0-16 fix).
function parkingSignedPct(pct: number): number {
  // 0..100 → +30%..−70%. Round to int so display & AI see the same number.
  return Math.round(30 - pct)
}
function bikeMultiplierX(pct: number): number {
  return Math.round(1 + (pct / 100) * 4)
}
function rewardBudgetK(pct: number): number {
  return +((pct / 100) * 4.4).toFixed(1)
}

function formatSignedPct(n: number): string {
  if (n === 0) return '0%'
  return n > 0 ? `+${n}%` : `−${Math.abs(n)}%`
}
function formatBudget(k: number): string {
  return `+$${k.toFixed(k === Math.round(k) ? 0 : 1)}k/wk`
}

export function CouncilSandboxScreen() {
  const council = useCouncilStats('chatswood')
  const { demographics } = useDemographics()
  const [tab, setTab] = useState<TabId>('sandbox')
  const [levers, setLevers] = useState(INIT_LEVERS)
  const [policy, setPolicy] = useState<PolicyResult | null>(null)

  // Computed signed values — single source of truth for both display and prompt
  const signedParking = parkingSignedPct(levers.parkingPct)
  const bikeMult = bikeMultiplierX(levers.bikeMult)
  const rewardBudget = rewardBudgetK(levers.rewardBudget)

  // Display copies derive from the same signed numbers
  const parkingPctValue = formatSignedPct(signedParking)
  const bikeMultValue = `${bikeMult}×`
  const rewardBudgetValue = formatBudget(rewardBudget)

  // Debounced policy refresh on lever change. Depend on STABLE scalars so
  // realtime stats updates don't re-fire the Azure call (senior tester P1-17).
  const totalWalks = council.stats.total_walks
  const totalCo2 = council.stats.total_co2
  useEffect(() => {
    if (tab !== 'sandbox') return
    const t = setTimeout(() => {
      fetchPolicySuggestion({
        leverParkingPct: signedParking,
        leverBikeMult: bikeMult,
        leverRewardBudget: rewardBudget,
        currentWalks: totalWalks,
        currentCo2Kg: totalCo2,
      }).then(setPolicy)
    }, 800)
    return () => clearTimeout(t)
  }, [signedParking, bikeMult, rewardBudget, tab, totalWalks, totalCo2])

  // Illustrative deltas from published-elasticity model (Litman / TfNSW VKT)
  const deltas = useMemo(() => {
    // Parking restriction: a 10% cut → +0.6% walk share + 0.8t CO₂ (Litman 2018)
    const parkingCutFactor = -signedParking / 10
    const bikeFactor = (bikeMult - 1) / 2
    const budgetFactor = rewardBudget / 2
    const co2 = (4 + parkingCutFactor * 2.6 + bikeFactor * 1.8 + budgetFactor * 0.4).toFixed(1)
    const rev = Math.round(120 + parkingCutFactor * 60 + bikeFactor * 28 + budgetFactor * 12)
    const share = Math.round(3 + parkingCutFactor * 2 + bikeFactor * 1.2)
    const parkLost = Math.round(8 + Math.max(0, parkingCutFactor) * 8 + budgetFactor * 1.6)
    return [
      { value: `+${co2}t`, label: 'CO₂ AVOIDED', tone: 'pos' as const },
      { value: `+$${rev}k`, label: 'SHOP REVENUE', tone: 'pos' as const },
      { value: `+${share}%`, label: 'WALK SHARE', tone: 'pos' as const },
      { value: `−$${parkLost}k`, label: 'PARKING LOST', tone: 'neg' as const },
    ]
  }, [signedParking, bikeMult, rewardBudget])

  const reset = () => setLevers(INIT_LEVERS)

  const cnHero = demographics?.chinese_ancestry_pct ?? 40
  const koHero = demographics?.korean_ancestry_pct ?? 8
  const enHero = Math.max(10, 100 - cnHero - koHero)

  return (
    <div className="cc-council-screen">
      <header className="cc-council-bar">
        <div className="cc-council-logo">
          <span className="cc-council-logo-tile" aria-hidden="true">
            <svg viewBox="0 0 32 32" width="22" height="22">
              <defs>
                <linearGradient id="cc-council-grad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#5B9BD5" />
                  <stop offset="100%" stopColor="#7BC97F" />
                </linearGradient>
              </defs>
              <rect width="32" height="32" rx="8" fill="url(#cc-council-grad)" />
              <path d="M10 22 L16 10 L22 22 Z" fill="#fff" />
            </svg>
          </span>
          <span className="cc-council-logo-text">
            <span className="cc-council-logo-title">Pilot Stats</span>
            <span className="cc-council-logo-sub">WILLOUGHBY</span>
          </span>
        </div>
        <div className="cc-council-bar-actions">
          {tab === 'sandbox' && (
            <button type="button" className="cc-icon-btn" aria-label="Reset" onClick={reset}>
              <RotateCcw size={16} aria-hidden="true" />
            </button>
          )}
          <SwitchRoleGear />
        </div>
      </header>

      <div style={{ padding: '0 16px 8px' }}>
        <SegmentedTabs tabs={TABS} active={tab} onChange={setTab} />
      </div>

      {tab === 'stats' ? (
        <div className="cc-council-v5">
          {/* V5 MEGA PULSE — single AI moment */}
          <div className="cc-pulse-block">
            <CattoPill tone="gradient">WALKING RIGHT NOW</CattoPill>
            <div className="cc-pulse-num">
              <AnimatedCounter value={council.stats.walking_now || 12} />
            </div>
            <div className="cc-pulse-ttl">in Chatswood</div>
            <div className="cc-pulse-sub">
              {council.stats.loaded ? 'Realtime · refreshes every 8s' : 'Demo · pilot baseline'}
            </div>
          </div>

          {/* 3 small totals strip */}
          <div className="cc-tots">
            <div className="cc-tot">
              <div className="cc-tot-v">
                <AnimatedCounter value={council.stats.total_walks || 1247} />
              </div>
              <div className="cc-tot-l">WALKS</div>
            </div>
            <div className="cc-tot">
              <div className="cc-tot-v">
                <AnimatedCounter value={council.stats.total_co2 || 84.6} decimals={1} suffix="kg" />
              </div>
              <div className="cc-tot-l">CO₂ SAVED</div>
            </div>
            <div className="cc-tot">
              <div className="cc-tot-v">
                <AnimatedCounter
                  value={Math.round((council.stats.total_walks || 1247) * 6.7)}
                  prefix="$"
                />
              </div>
              <div className="cc-tot-l">SHOP SPEND</div>
            </div>
          </div>

          {/* Why-tab (existing pieces) — under "Why this works" reveal */}
          <details className="cc-council-why">
            <summary>Why this works · boosted streets + ancestry</summary>
            <div className="cc-council-why-inner">
              <BoostedStreetsList
                rows={[
                  { name: 'Help St', mult: '3×', variant: 'x3', sub: 'UNTIL 6PM · UNDERSERVED' },
                  { name: 'Spring St', mult: '2×', variant: 'x2', sub: 'UNTIL 5PM · MARKETS' },
                ]}
                projection={{
                  label: 'Project: Help St → 5×',
                  onClick: () => {
                    setLevers((s) => ({ ...s, bikeMult: 100 }))
                    setTab('sandbox')
                  },
                }}
              />
              <div className="cc-council-lang-card">
                <h5>Resident ancestry · ABS 2021</h5>
                <LangDonut enPct={enHero} zhPct={cnHero} koPct={koHero} />
                <div className="cc-council-lang-legend">
                  <span className="cc-lang-dot" style={{ background: '#5B9BD5' }} /> Other {Math.round(enHero)}%
                  <span className="cc-lang-dot" style={{ background: '#B49EFB' }} /> Chinese {Math.round(cnHero)}%
                  <span className="cc-lang-dot" style={{ background: '#FF6B9D' }} /> Korean {Math.round(koHero)}%
                </div>
                <span className="cc-cite">Source: ABS 2021 Census · Chatswood SA2</span>
              </div>
            </div>
          </details>
        </div>
      ) : (
        <div className="cc-council-body">
          <div className="cc-policy-hero">
            <span className="cc-policy-eb">🎛 What if we tried this policy?</span>
            <h3>Drag a lever — Catto forecasts 12 months out</h3>
            <LeverSlider
              label="Remove some Victoria Ave parking"
              value={parkingPctValue}
              pct={levers.parkingPct}
              onChange={(v) => setLevers((s) => ({ ...s, parkingPct: v }))}
            />
            <LeverSlider
              label="Reward bikes on Help St (×)"
              value={bikeMultValue}
              pct={levers.bikeMult}
              onChange={(v) => setLevers((s) => ({ ...s, bikeMult: v }))}
            />
            <LeverSlider
              label="Council top-up to walker rewards / week"
              value={rewardBudgetValue}
              pct={levers.rewardBudget}
              onChange={(v) => setLevers((s) => ({ ...s, rewardBudget: v }))}
            />
          </div>
          {/* V5: dark Catto forecast card replaces SimOutput + AiSuggest */}
          <div className="cc-forecast-card-v5">
            <CattoPill tone="light">CATTO FORECAST · ~12 MONTHS</CattoPill>
            <div className="cc-forecast-card-v5-row">
              <div>
                <div className="cc-forecast-card-v5-l">EXTRA WALKS / WK</div>
                <div className="cc-forecast-card-v5-v">+{Math.round(312 + bikeMult * 40)}</div>
              </div>
              <div>
                <div className="cc-forecast-card-v5-l">SHOP REVENUE</div>
                <div className="cc-forecast-card-v5-v">{deltas[1].value}</div>
              </div>
              <div>
                <div className="cc-forecast-card-v5-l">CO₂ AVOIDED</div>
                <div className="cc-forecast-card-v5-v">{deltas[0].value}</div>
              </div>
            </div>
            <p className="cc-forecast-card-v5-q">
              <b>Catto suggests:</b> {policy?.suggestion ?? 'Computing scenario…'}
            </p>
            <span className="cc-forecast-card-v5-cite">
              Illustrative · static elasticities · {policy?.source === 'live' ? 'live · gpt-4.1-nano' : 'demo data'}
            </span>
          </div>
        </div>
      )}

      <div style={{ height: 72 }} aria-hidden="true" />
      <BottomNav />
    </div>
  )
}
