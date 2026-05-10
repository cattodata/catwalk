import type { VitalCard } from '../types/campaign'

interface VitalsProps {
  cards: VitalCard[]
}

/**
 * Vitals strip — 4 cards with real-time data sources.
 * Each card shows the data source (clickable on hover) so judges can verify nothing is faked.
 */
export function Vitals({ cards }: VitalsProps) {
  return (
    <div className="cc-vitals">
      {cards.map((v) => (
        <div
          key={v.id}
          className="cc-vital"
          style={{ ['--accent' as string]: v.accent, ['--accent-bg' as string]: v.bg } as React.CSSProperties}
          title={v.source ? `Source: ${v.source}` : undefined}
        >
          {v.isLive && <div className="v-live" title="Refetched on every load">● LIVE</div>}
          {!v.isLive && v.source && <div className="v-live" style={{ background: 'rgba(154,128,90,.18)', color: 'var(--ink)' }}>📊 {v.source.startsWith('TfNSW') ? 'TfNSW' : 'STATIC'}</div>}
          <div className="v-icon">{v.emoji}</div>
          <div className="v-num">
            {v.num}
            {v.small ? <small>{v.small}</small> : null}
          </div>
          <div className="v-label">{v.label}</div>
          <div className="v-sub">{v.sub}</div>
        </div>
      ))}
    </div>
  )
}
