import { BOOSTED_STREETS } from '../data/council'

interface CouncilPanelProps {
  onSimulateBoost: () => void
  onResetBoost: () => void
  boostedExtra: { walks: number; kg: number; rev: number } | null
  langReach: { en: number; zh: number; ko: number }
  chinesePct?: number
  koreanPct?: number
}

export function CouncilPanel({
  onSimulateBoost,
  onResetBoost,
  boostedExtra,
  langReach,
  chinesePct,
  koreanPct,
}: CouncilPanelProps) {
  return (
    <div className="cc-side-stack">
      <div className="cc-card cc-council-card">
        <div className="cco-eyebrow">📊 POLICY LEVER · LIVE</div>
        <h3 className="cco-h">Boosted streets right now</h3>
        <p className="cco-sub">
          Council adjusts multipliers on underserved streets to redirect foot traffic — measured live.
        </p>
        {BOOSTED_STREETS.map((s) => (
          <div key={s.name} className="cco-street">
            <div className="cs-row">
              <b>{s.name}</b>
              <span className={`cs-mult cs-m${s.mult}`}>{s.mult}×</span>
            </div>
            <div className="cs-meta">until {s.until} · {s.reason}</div>
          </div>
        ))}
        <button className="cco-cta" onClick={onSimulateBoost}>
          ✨ Project: Boost Help St → 5× (forecast)
        </button>
        {boostedExtra && (
          <div className="cco-result">
            +{boostedExtra.walks} walks projected · +{boostedExtra.kg} kg CO₂ · +${boostedExtra.rev}
            <button className="cco-reset" onClick={onResetBoost}>Reset</button>
          </div>
        )}
        <div style={{ fontSize: 11, opacity: 0.55, marginTop: 8, fontStyle: 'italic' }}>
          Forecast based on 4× multiplier elasticity model · not real-time data.
        </div>
      </div>

      <div className="cc-card cco-langs">
        <div className="cco-eyebrow">🌏 LANGUAGE REACH · WEEK</div>
        <h3 className="cco-h">Multicultural fit</h3>
        <p className="cco-sub" style={{ marginBottom: 14 }}>
          Every campaign auto-translated. <b>{(chinesePct ?? 39.7).toFixed(1)}%</b> Chinese ancestry,{' '}
          <b>{(koreanPct ?? 7.8).toFixed(1)}%</b> Korean — ABS Census 2021 (Outcome 2).
        </p>
        <LangDonut data={langReach} />
      </div>
    </div>
  )
}

function LangDonut({ data }: { data: { en: number; zh: number; ko: number } }) {
  const total = data.en + data.zh + data.ko || 1
  const segs = [
    { v: data.en, label: 'EN', col: '#5B9BD5' },
    { v: data.zh, label: '中文', col: '#B49EFB' },
    { v: data.ko, label: '한국어', col: '#FF6B9D' },
  ]
  let acc = 0
  const r = 54
  const c = 70
  const sw = 18
  const C = 2 * Math.PI * r
  return (
    <div className="lang-donut">
      <svg viewBox="0 0 140 140" width="140" height="140">
        <circle cx={c} cy={c} r={r} stroke="var(--border)" strokeWidth={sw} fill="none" />
        {segs.map((s, i) => {
          const dash = (s.v / total) * C
          const offset = -((acc / total) * C)
          acc += s.v
          return (
            <circle
              key={i}
              cx={c}
              cy={c}
              r={r}
              stroke={s.col}
              strokeWidth={sw}
              fill="none"
              strokeDasharray={`${dash} ${C - dash}`}
              strokeDashoffset={offset}
              transform={`rotate(-90 ${c} ${c})`}
            />
          )
        })}
        <text x={c} y={c - 4} textAnchor="middle" fontFamily="Outfit" fontWeight="800" fontSize="22" fill="var(--ink)">
          3
        </text>
        <text x={c} y={c + 12} textAnchor="middle" fontFamily="JetBrains Mono" fontSize="8" letterSpacing="1.2" fill="var(--ink-soft)">
          LANGS
        </text>
      </svg>
      <div className="lang-legend">
        {segs.map((s) => (
          <div key={s.label} className="ll-row">
            <span className="ll-dot" style={{ background: s.col }} />
            <span className="ll-name">{s.label}</span>
            <span className="ll-pct">{Math.round((s.v / total) * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}
