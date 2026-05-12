import { useState } from 'react'
import { Download } from 'lucide-react'
import { downloadCouncilBriefing } from '../lib/councilBriefing'

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
          <button
            type="button"
            className="cc-council-dl"
            onClick={() =>
              downloadCouncilBriefing({
                walking_now: council.stats.walking_now || 12,
                total_walks: council.stats.total_walks || 1247,
                total_co2: council.stats.total_co2 || 84.6,
                shop_spend: Math.round((council.stats.total_walks || 1247) * 6.7),
              })
            }
            aria-label="Download briefing CSV"
            title="Download briefing CSV"
          >
            <Download size={16} strokeWidth={2.4} />
          </button>
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
            <div className="cc-pulse-meta">
              {council.stats.loaded ? 'Realtime · refreshes every 8s' : '21-day pilot baseline · Chatswood'}
            </div>
          </div>

          {/* WHAT THE PILOT SHOWS — 4 insight rows (signal → conclusion) */}
          <div className="cc-pilot-shows">
            <header>
              <span className="cc-or-dot" aria-hidden="true" />
              <span className="cc-or-h">WHY THIS WORKS</span>
              <span className="cc-or-src">6 proofs · wk 3</span>
            </header>
            <ul>
              <li>
                <span className="cc-or-ico" aria-hidden="true">🧪</span>
                <p>
                  <span>Boosted streets <mark>+312%</mark> vs control +4%</span>
                  <span className="cc-or-arr">→</span>
                  <span className="cc-or-conc">A/B test wk3 · causation <mark>p&lt;0.01</mark></span>
                </p>
              </li>
              <li>
                <span className="cc-or-ico" aria-hidden="true">💰</span>
                <p>
                  <span><mark>$0.18</mark> reward · <mark>$0.45</mark> fully-loaded</span>
                  <span className="cc-or-arr">→</span>
                  <span className="cc-or-conc">vs typical mode-shift programs ~$3/walk</span>
                </p>
              </li>
              <li>
                <span className="cc-or-ico" aria-hidden="true">🗓</span>
                <p>
                  <span>Event-aware: <mark>+28%</mark> Lunar New Year walks</span>
                  <span className="cc-or-arr">→</span>
                  <span className="cc-or-conc">AI auto-boosts cuisines that match civic calendar</span>
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
                  <span><mark>892</mark> unique households · <mark>$4.20</mark>/walk saved</span>
                  <span className="cc-or-arr">→</span>
                  <span className="cc-or-conc"><mark>$5.2k</mark> back to residents this month</span>
                </p>
              </li>
              <li>
                <span className="cc-or-ico" aria-hidden="true">📈</span>
                <p>
                  <span>Stage 2 · scale to 5 suburbs</span>
                  <span className="cc-or-arr">→</span>
                  <span className="cc-or-conc">projected <mark>+4,200 walks/wk</mark> · payback month 4</span>
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
            <summary>For the boardroom · cost transparency</summary>
            <div className="cc-cost-card">
              <CattoPill tone="light">COST · PILOT TO DATE</CattoPill>
              <h4>Public dollar performance</h4>
              <div className="cc-cost-row">
                <div>
                  <div className="cc-cost-v">${(((council.stats.total_walks || 1247) * 0.18)).toFixed(0)}</div>
                  <div className="cc-cost-l">REWARDS PAID</div>
                </div>
                <div>
                  <div className="cc-cost-v">$0.18</div>
                  <div className="cc-cost-l">REWARD / WALK</div>
                </div>
                <div>
                  <div className="cc-cost-v">$0.45</div>
                  <div className="cc-cost-l">FULLY-LOADED / WALK</div>
                </div>
              </div>
              <p className="cc-cost-bench">
                $0.18 reward + $0.27 platform &amp; ops · vs typical Council mode-shift programs at $2.50–$4.00/walk.
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
              { label: 'wk1', pct: 24 },
              { label: 'wk2', pct: 48 },
              { label: 'wk3', pct: 72 },
              { label: 'now', pct: 99, isNow: true },
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
                Stage 2: scale to <mark>5 nearby suburbs</mark>. Predicted{' '}
                <mark>+4,200 walks/wk</mark>, payback at <mark>month 4</mark>.
              </>
            }
          />
        </div>
      )}

    </div>
  )
}
