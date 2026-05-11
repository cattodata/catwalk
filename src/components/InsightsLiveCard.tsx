import type { ReactNode } from 'react'

interface Row {
  icon?: ReactNode
  emoji?: string
  text: string
}

export function InsightsLiveCard({ rows }: { rows: Row[] }) {
  return (
    <div className="cc-ins-now">
      <div className="cc-ins-now-head">
        <span className="cc-ins-live-dot" aria-hidden="true" />
        <span>CATTO SEES RIGHT NOW</span>
      </div>
      <div className="cc-ins-now-rows">
        {rows.map((r, i) => (
          <div key={i} className="cc-ins-now-row">
            <span className="cc-ins-now-em" aria-hidden="true">{r.icon ?? r.emoji}</span>
            <span>{r.text}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
