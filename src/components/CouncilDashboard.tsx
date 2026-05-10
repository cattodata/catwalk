import type { CouncilStatsLive, TopStreet, DailyWalk } from '../hooks/useCouncilStats'
import { BOOSTED_STREETS } from '../data/council'

interface CouncilDashboardProps {
  stats: CouncilStatsLive
  topStreets: TopStreet[]
  dailyWalks: DailyWalk[]
  boostedExtra: { walks: number; kg: number; rev: number } | null
  /** When supabase isn't connected, show pilot projection numbers instead of zeros */
  fallbackProjections?: {
    walks: number
    co2Kg: number
    extraRev: number
    walkingNow: number
  }
}

export function CouncilDashboard({ stats, topStreets, dailyWalks, boostedExtra, fallbackProjections }: CouncilDashboardProps) {
  const showFallback = !stats.loaded && fallbackProjections
  const walks = showFallback ? fallbackProjections!.walks : stats.total_walks
  const co2 = showFallback ? fallbackProjections!.co2Kg : stats.total_co2
  const walkingNow = showFallback ? fallbackProjections!.walkingNow : stats.walking_now
  const extraRev = showFallback ? fallbackProjections!.extraRev : stats.total_walks * 11.4 // Avg estimated uplift per walk

  const boosted = (n: number) => n + (boostedExtra?.walks ?? 0)
  const boostedKg = (n: number) => n + (boostedExtra?.kg ?? 0)
  const boostedRev = (n: number) => n + (boostedExtra?.rev ?? 0)

  // Build top-streets list with boosted flag merged from BOOSTED_STREETS
  const boostedNames = new Set(BOOSTED_STREETS.map((s) => s.name))
  const streetRows: TopStreet[] = topStreets.length
    ? topStreets.map((s) => ({ ...s, boosted: boostedNames.has(s.street) } as TopStreet & { boosted: boolean }))
    : [
        { street: 'Victoria Ave', count: 0, pct: 0 },
        { street: 'Help St', count: 0, pct: 0 },
        { street: 'Albert Ave', count: 0, pct: 0 },
        { street: 'Spring St', count: 0, pct: 0 },
        { street: 'Railway St', count: 0, pct: 0 },
      ]

  return (
    <section className="cco-dash">
      <div className="cco-dash-eyebrow">
        📊 COUNCIL LIVE VIEW · {showFallback ? 'PILOT PROJECTION' : 'REAL-TIME'} ·{' '}
        {new Date().toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}
      </div>
      <h2 className="cco-dash-h">Chatswood pilot — at a glance</h2>

      <div className="cco-stats">
        <KpiCard
          color="#7BC97F"
          emoji="🌱"
          big={boostedKg(co2).toFixed(1)}
          unit="kg"
          label="CO₂ saved · pilot week"
          sub="vs. car trips · Outcome 1"
        />
        <KpiCard
          color="#FF6B9D"
          emoji="🚶"
          big={boosted(walks).toLocaleString()}
          unit=""
          label="Sustainable trips logged"
          sub={`${walkingNow} walking right now`}
        />
        <KpiCard
          color="#F5C842"
          emoji="💰"
          big={'$' + (boostedRev(extraRev) / 1000).toFixed(1) + 'K'}
          unit=""
          label="Extra shop revenue"
          sub="10-shop pilot · Victoria Ave"
        />
        <KpiCard color="#B49EFB" emoji="🌏" big={'3'} unit="" label="Languages served" sub="EN · 中文 · 한국어" />
      </div>

      <div className="cco-row">
        <div className="cco-streets">
          <div className="cs-eyebrow">TOP STREETS · WEEK</div>
          <h3 className="cs-h">Where Chatswood actually walks</h3>
          {streetRows.map((s) => {
            const isBoosted = (s as TopStreet & { boosted?: boolean }).boosted
            return (
              <div key={s.street} className="cs-bar-row">
                <div className="csb-name">
                  {s.street}
                  {isBoosted && <span className="csb-tag">BOOSTED</span>}
                </div>
                <div className="csb-track">
                  <div
                    className="csb-fill"
                    style={{
                      width: s.pct * 100 + '%',
                      background: isBoosted
                        ? 'linear-gradient(90deg,#FF6B9D,#F5C842)'
                        : '#5B9BD5',
                    }}
                  />
                </div>
                <div className="csb-num">{s.count}</div>
              </div>
            )
          })}
          {!stats.loaded && (
            <div style={{ fontSize: 11, opacity: 0.55, marginTop: 8, fontStyle: 'italic' }}>
              Live data unavailable — showing pilot projection. Real users walking will populate this in real-time.
            </div>
          )}
        </div>

        <div className="cco-trend">
          <div className="cs-eyebrow">DAILY WALKS · 26 DAYS</div>
          <h3 className="cs-h">Trending up · pilot launch</h3>
          <Sparkline data={dailyWalks.length ? dailyWalks.map((d) => d.count) : Array(26).fill(0)} />
          <div className="cs-trend-foot">
            {dailyWalks.length ? (
              <span className="ct-up">{dailyWalks.reduce((a, b) => a + b.count, 0)} walks</span>
            ) : (
              <span style={{ opacity: 0.6 }}>Awaiting first pilot walks</span>
            )}{' '}
            this period
          </div>
        </div>
      </div>
    </section>
  )
}

function KpiCard({
  color, emoji, big, unit, label, sub,
}: { color: string; emoji: string; big: string; unit: string; label: string; sub: string }) {
  return (
    <div className="cco-kpi" style={{ ['--kpi-c' as string]: color } as React.CSSProperties}>
      <div className="kpi-emoji">{emoji}</div>
      <div className="kpi-big">
        {big}
        {unit && <small>{unit}</small>}
      </div>
      <div className="kpi-label">{label}</div>
      <div className="kpi-sub">{sub}</div>
    </div>
  )
}

function Sparkline({ data }: { data: number[] }) {
  const W = 320
  const H = 90
  const pad = 6
  const max = Math.max(...data, 1)
  const min = Math.min(...data, 0)
  const pts = data.map((v, i) => {
    const x = pad + (i / (data.length - 1 || 1)) * (W - pad * 2)
    const y = pad + (1 - (v - min) / (max - min || 1)) * (H - pad * 2)
    return [x, y] as [number, number]
  })
  const d = 'M ' + pts.map((p) => p.join(',')).join(' L ')
  const fillD = pts.length
    ? d + ` L ${pts[pts.length - 1][0]},${H} L ${pts[0][0]},${H} Z`
    : ''
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="cco-spark">
      <defs>
        <linearGradient id="sparkG" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FF6B9D" stopOpacity=".35" />
          <stop offset="100%" stopColor="#FF6B9D" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="popG2" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#FF6B9D" />
          <stop offset="100%" stopColor="#F5C842" />
        </linearGradient>
      </defs>
      {fillD && <path d={fillD} fill="url(#sparkG)" />}
      <path d={d} fill="none" stroke="url(#popG2)" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      {pts.length > 0 && (
        <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r="4" fill="#FF6B9D" stroke="#fff" strokeWidth="2" />
      )}
    </svg>
  )
}
