interface Dial {
  id: string
  emoji: string
  label: string
  /** 0–1 fraction of 2036 target reached */
  pct: number
  /** small caption shown under the label */
  caption: string
}

interface Props {
  dials: Dial[]
}

/**
 * 2x2 grid of conic-gradient progress rings — each cell is one KPI as a
 * percentage of its 2036 Willoughby target. No chart library; pure CSS.
 */
export function KpiDialGrid({ dials }: Props) {
  return (
    <div className="cc-kpi-grid">
      {dials.map((d) => {
        const deg = Math.round(Math.min(1, d.pct) * 360)
        return (
          <article key={d.id} className="cc-kpi-tile">
            <div
              className="cc-kpi-ring"
              style={{
                background: `conic-gradient(var(--coral) ${deg}deg, rgba(45, 26, 34, 0.08) ${deg}deg)`,
              }}
            >
              <div className="cc-kpi-ring-inner">
                <span className="cc-kpi-em" aria-hidden="true">{d.emoji}</span>
                <span className="cc-kpi-pct">{Math.round(d.pct * 100)}%</span>
              </div>
            </div>
            <div className="cc-kpi-meta">
              <b>{d.label}</b>
              <small>{d.caption}</small>
            </div>
          </article>
        )
      })}
    </div>
  )
}
