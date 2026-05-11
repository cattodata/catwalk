import { useEffect, useMemo, useState } from 'react'
import { Calendar, RotateCcw } from 'lucide-react'

import { BottomNav } from '../components/BottomNav'
import { SwitchRoleGear } from '../components/SwitchRoleSheet'
import { SegmentedTabs } from '../components/SegmentedTabs'
import { CouncilHero } from '../components/CouncilHero'
import { BoostedStreetsList } from '../components/BoostedStreets'
import { LangDonut } from '../components/LangDonut'
import { LeverSlider } from '../components/LeverSlider'
import { SimOutputCard } from '../components/SimOutput'
import { AiSuggestCard } from '../components/AiSuggestCard'

import { useCouncilStats } from '../hooks/useCouncilStats'
import { useDemographics } from '../hooks/useDemographics'
import { fetchPolicySuggestion, type PolicyResult } from '../lib/ai-policy'

type TabId = 'stats' | 'sandbox'

const TABS = [
  { id: 'stats' as const, label: 'Stats' },
  { id: 'sandbox' as const, label: 'Sandbox' },
]

const INIT_LEVERS = {
  parkingPct: 30,
  bikeMult: 60,
  rewardBudget: 45,
}

export function CouncilSandboxScreen() {
  const council = useCouncilStats('chatswood')
  const { demographics } = useDemographics()
  const [tab, setTab] = useState<TabId>('sandbox')
  const [levers, setLevers] = useState(INIT_LEVERS)
  const [policy, setPolicy] = useState<PolicyResult | null>(null)

  // Format slider value (0..100) → display copy
  const parkingPctValue = `−${levers.parkingPct - 10}%`
  const bikeMultValue = `${1 + Math.round(levers.bikeMult / 25)}×`
  const rewardBudgetValue = `+$${(levers.rewardBudget / 25).toFixed(0)}k/wk`

  // Debounced policy refresh on lever change
  useEffect(() => {
    if (tab !== 'sandbox') return
    const t = setTimeout(() => {
      fetchPolicySuggestion({
        leverParkingPct: -(levers.parkingPct - 10),
        leverBikeMult: 1 + Math.round(levers.bikeMult / 25),
        leverRewardBudget: levers.rewardBudget / 25,
        currentWalks: council.stats.total_walks,
        currentCo2Kg: council.stats.total_co2,
      }).then(setPolicy)
    }, 600)
    return () => clearTimeout(t)
  }, [levers, tab, council.stats])

  // Deterministic delta math from levers
  const deltas = useMemo(() => {
    const parkingScale = (levers.parkingPct - 10) / 100
    const bikeScale = levers.bikeMult / 100
    const budgetScale = levers.rewardBudget / 100
    const co2 = (10 + parkingScale * 12 + bikeScale * 6).toFixed(1)
    const rev = Math.round(280 + parkingScale * 200 + bikeScale * 80)
    const share = Math.round(7 + parkingScale * 10 + bikeScale * 4)
    const parkLost = Math.round(20 + parkingScale * 60 + budgetScale * 4)
    return [
      { value: `+${co2}t`, label: 'CO₂ AVOIDED', tone: 'pos' as const },
      { value: `+$${rev}k`, label: 'SHOP REVENUE', tone: 'pos' as const },
      { value: `+${share}%`, label: 'WALK SHARE', tone: 'pos' as const },
      { value: `−$${parkLost}k`, label: 'PARKING LOST', tone: 'neg' as const },
    ]
  }, [levers])

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
          <button type="button" className="cc-icon-btn" aria-label="Date range">
            <Calendar size={18} aria-hidden="true" />
          </button>
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
        <div className="cc-council-body">
          <CouncilHero
            eyebrow="LIVE · SINCE LAUNCH"
            title="Walking right now"
            stats={[
              { value: council.stats.walking_now ?? 12, label: 'WALKING NOW' },
              { value: (council.stats.total_walks ?? 1247).toLocaleString(), label: 'TOTAL WALKS' },
              { value: `${(council.stats.total_co2 ?? 84.6).toFixed(1)} kg`, label: 'CO₂ SAVED' },
            ]}
          />
          <BoostedStreetsList
            rows={[
              { name: 'Help St', mult: '3×', variant: 'x3', sub: 'UNTIL 6PM · UNDERSERVED' },
              { name: 'Spring St', mult: '2×', variant: 'x2', sub: 'UNTIL 5PM · MARKETS' },
            ]}
            projection={{
              label: 'Project: Help St → 5×',
              onClick: () => setTab('sandbox'),
            }}
          />
          <div className="cc-council-lang-card">
            <h5>Reach by language</h5>
            <LangDonut enPct={enHero} zhPct={cnHero} koPct={koHero} />
            <div className="cc-council-lang-legend">
              <span className="cc-lang-dot" style={{ background: '#5B9BD5' }} /> EN {Math.round(enHero)}%
              <span className="cc-lang-dot" style={{ background: '#B49EFB' }} /> 中文 {Math.round(cnHero)}%
              <span className="cc-lang-dot" style={{ background: '#FF6B9D' }} /> 한국어 {Math.round(koHero)}%
            </div>
          </div>
        </div>
      ) : (
        <div className="cc-council-body">
          <div className="cc-policy-hero">
            <span className="cc-policy-eb">🎛 LEVERS · 12-MO SIM</span>
            <h3>What if we...</h3>
            <LeverSlider
              label="Parking on Victoria Ave"
              value={parkingPctValue}
              pct={levers.parkingPct}
              onChange={(v) => setLevers((s) => ({ ...s, parkingPct: v }))}
            />
            <LeverSlider
              label="Bike multiplier Help St"
              value={bikeMultValue}
              pct={levers.bikeMult}
              onChange={(v) => setLevers((s) => ({ ...s, bikeMult: v }))}
            />
            <LeverSlider
              label="Walker reward budget"
              value={rewardBudgetValue}
              pct={levers.rewardBudget}
              onChange={(v) => setLevers((s) => ({ ...s, rewardBudget: v }))}
            />
          </div>
          <SimOutputCard deltas={deltas} />
          <AiSuggestCard
            body={policy?.suggestion ?? 'Computing…'}
            source={policy?.source}
          />
        </div>
      )}

      <div style={{ height: 72 }} aria-hidden="true" />
      <BottomNav />
    </div>
  )
}
