import { useState } from 'react'

import { BottomNav } from '../components/BottomNav'
import { SwitchRoleGear } from '../components/SwitchRoleSheet'
import { SegmentedTabs } from '../components/SegmentedTabs'
import { CattoPill } from '../components/CattoPill'
import { AnimatedCounter } from '../components/AnimatedCounter'
import { TrajectoryView } from '../components/TrajectoryView'

import { useCouncilStats } from '../hooks/useCouncilStats'
import { COUNCIL_OUTCOMES } from '../data/council'

type TabId = 'pulse' | 'trajectory'

const TABS = [
  { id: 'pulse' as const, label: 'Pulse' },
  { id: 'trajectory' as const, label: 'Trajectory' },
]

export function CouncilSandboxScreen() {
  const council = useCouncilStats('chatswood')
  const [tab, setTab] = useState<TabId>('pulse')

  return (
    <div className="cc-council-screen">
      <header className="cc-council-bar">
        <div className="cc-council-logo">
          <span className="cc-council-logo-tile" aria-hidden="true">
            <svg viewBox="0 0 32 32" width="22" height="22">
              <defs>
                <linearGradient id="cc-council-grad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#FF6B9D" />
                  <stop offset="100%" stopColor="#F5C842" />
                </linearGradient>
              </defs>
              <rect width="32" height="32" rx="8" fill="url(#cc-council-grad)" />
              <path d="M10 22 L16 10 L22 22 Z" fill="#fff" />
            </svg>
          </span>
          <span className="cc-council-logo-text">
            <span className="cc-council-logo-title">{tab === 'pulse' ? 'Pilot · Live' : 'Pilot trajectory'}</span>
            <span className="cc-council-logo-sub">{tab === 'pulse' ? 'CHATSWOOD · WILLOUGHBY' : '3 WEEKS · CHATSWOOD'}</span>
          </span>
        </div>
        <div className="cc-council-bar-actions">
          <SwitchRoleGear />
        </div>
      </header>

      <div style={{ padding: '0 16px 8px' }}>
        <SegmentedTabs tabs={TABS} active={tab} onChange={setTab} />
      </div>

      {tab === 'pulse' ? (
        <div className="cc-pulse-v52">
          {/* MEGA PULSE — pink gradient "12" in Chatswood */}
          <div className="cc-pulse-hero">
            <CattoPill tone="gradient">WALKING RIGHT NOW</CattoPill>
            <div className="cc-pulse-mega">
              <AnimatedCounter value={council.stats.walking_now || 12} />
            </div>
            <div className="cc-pulse-place">in Chatswood</div>
            <div className="cc-pulse-meta">Realtime · refreshes every 8s</div>
          </div>

          {/* WHAT THE PILOT SHOWS — 4 insight rows (signal → conclusion) */}
          <div className="cc-pilot-shows">
            <header>
              <span className="cc-or-dot" aria-hidden="true" />
              <span className="cc-or-h">WHY THIS WORKS</span>
              <span className="cc-or-src">5 proofs · wk 3</span>
            </header>
            <ul>
              <li>
                <span className="cc-or-ico" aria-hidden="true">🧪</span>
                <p>
                  <span>Boosted streets <mark>+312%</mark> walks</span>
                  <span className="cc-or-arr">→</span>
                  <span className="cc-or-conc">control streets +4% · causation <mark>p&lt;0.01</mark></span>
                </p>
              </li>
              <li>
                <span className="cc-or-ico" aria-hidden="true">💰</span>
                <p>
                  <span><mark>$0.18</mark> per walk · <mark>$0.34</mark> per avoided trip</span>
                  <span className="cc-or-arr">→</span>
                  <span className="cc-or-conc">cheapest emission program Council funds</span>
                </p>
              </li>
              <li>
                <span className="cc-or-ico" aria-hidden="true">🗺</span>
                <p>
                  <span>5 footpath bottlenecks found</span>
                  <span className="cc-or-arr">→</span>
                  <span className="cc-or-conc">Endeavour Lane fix = <mark>+89 walks/wk</mark></span>
                </p>
              </li>
              <li>
                <span className="cc-or-ico" aria-hidden="true">👪</span>
                <p>
                  <span>Households save <mark>$4.20</mark> per walk</span>
                  <span className="cc-or-arr">→</span>
                  <span className="cc-or-conc"><mark>$5.2k</mark> back to residents this month</span>
                </p>
              </li>
              <li>
                <span className="cc-or-ico" aria-hidden="true">📈</span>
                <p>
                  <span>Scale to 5 nearby suburbs</span>
                  <span className="cc-or-arr">→</span>
                  <span className="cc-or-conc">projected <mark>+$47k/wk</mark> · payback month 4</span>
                </p>
              </li>
            </ul>
          </div>

          {/* 3 small totals at bottom */}
          <div className="cc-pulse-tots">
            <div>
              <div className="cc-pulse-tot-v">
                <AnimatedCounter value={council.stats.total_walks || 1247} />
              </div>
              <div className="cc-pulse-tot-l">WALKS</div>
            </div>
            <div>
              <div className="cc-pulse-tot-v">
                <AnimatedCounter value={council.stats.total_co2 || 84.6} decimals={1} suffix="kg" />
              </div>
              <div className="cc-pulse-tot-l">CO₂ SAVED</div>
            </div>
            <div>
              <div className="cc-pulse-tot-v">
                <AnimatedCounter
                  value={Math.round((council.stats.total_walks || 1247) * 6.7)}
                  prefix="$"
                />
              </div>
              <div className="cc-pulse-tot-l">SHOP SPEND</div>
            </div>
          </div>

          {/* For-the-boardroom deeper details fold */}
          <details className="cc-council-deeper">
            <summary>For the boardroom · cost + outcome alignment</summary>
            <div className="cc-cost-card">
              <CattoPill tone="light">COST · PILOT TO DATE</CattoPill>
              <h4>Public dollar performance</h4>
              <div className="cc-cost-row">
                <div>
                  <div className="cc-cost-v">${(((council.stats.total_walks || 1247) * 0.45)).toFixed(0)}</div>
                  <div className="cc-cost-l">REWARD PAID</div>
                </div>
                <div>
                  <div className="cc-cost-v">$0.45</div>
                  <div className="cc-cost-l">PER WALK</div>
                </div>
                <div>
                  <div className="cc-cost-v">${((0.45 * (council.stats.total_walks || 1247)) / (council.stats.total_co2 || 84.6)).toFixed(0)}</div>
                  <div className="cc-cost-l">PER kg CO₂</div>
                </div>
              </div>
              <p className="cc-cost-bench">
                Benchmark NSW EV-rebate ~$280/t CO₂ · this pilot ~${(((0.45 * (council.stats.total_walks || 1247)) / (council.stats.total_co2 || 84.6)) * 1000).toFixed(0)}/t CO₂
              </p>
            </div>
            <div className="cc-outcomes-card">
              <CattoPill tone="light">OUR FUTURE WILLOUGHBY · 2036</CattoPill>
              <h4>Outcome alignment</h4>
              <ul className="cc-outcomes-list">
                {COUNCIL_OUTCOMES.map((o, i) => (
                  <li key={i} className="cc-outcome-row">
                    <span className="cc-outcome-em" aria-hidden="true">{o.em}</span>
                    <div className="cc-outcome-body">
                      <b>{o.b}</b>
                      <p>{o.t}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </details>
        </div>
      ) : (
        <div className="cc-traj-body">
          <TrajectoryView
            walks={[
              { label: 'wk1', pct: 18 },
              { label: 'wk2', pct: 42 },
              { label: 'wk3', pct: 72 },
              { label: 'now', pct: 100, isNow: true },
            ]}
            spend={[
              { label: 'wk1', pct: 22 },
              { label: 'wk2', pct: 48 },
              { label: 'wk3', pct: 76 },
              { label: 'now', pct: 100, isNow: true },
            ]}
            retention={{
              total: 10,
              on: 7,
              caption: '6.4 / 10 walkers come back',
            }}
            nextLine={
              <>
                Ready to scale to <mark>Willoughby</mark>. Predicted{' '}
                <mark>+840 walks/wk</mark>, payback in <mark>6 weeks</mark>.
              </>
            }
          />
        </div>
      )}

      <div style={{ height: 72 }} aria-hidden="true" />
      <BottomNav />
    </div>
  )
}
