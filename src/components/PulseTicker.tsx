interface PulseTickerProps {
  /** Real numbers from Supabase, since-launch */
  liveSinceLaunch: {
    walks: number
    co2Kg: number
    walkingNow: number
  }
  /** 30-day pilot model projection (forecast, not real) */
  pilotProjection: {
    walks: number
    co2Kg: number
    extraRev: number
    km: number
  }
}

interface Item {
  e: string
  v: string
  l: string
  kind: 'live' | 'forecast'
}

export function PulseTicker({ liveSinceLaunch, pilotProjection }: PulseTickerProps) {
  const live: Item[] = [
    { e: '👥', v: String(liveSinceLaunch.walkingNow), l: 'walking right now', kind: 'live' },
    { e: '🚶', v: liveSinceLaunch.walks.toLocaleString(), l: 'walks since launch', kind: 'live' },
    { e: '🌱', v: `${liveSinceLaunch.co2Kg.toFixed(2)} kg`, l: 'CO₂ saved · real users', kind: 'live' },
  ]
  const projected: Item[] = [
    { e: '📊', v: pilotProjection.walks.toLocaleString(), l: '30-day pilot model · walks', kind: 'forecast' },
    { e: '💰', v: `$${(pilotProjection.extraRev / 1000).toFixed(1)}K`, l: 'extra revenue · forecast', kind: 'forecast' },
    { e: '🚲', v: `${pilotProjection.km.toFixed(0)} km`, l: 'covered · forecast', kind: 'forecast' },
    { e: '🌏', v: 'EN · 中文 · 한국어', l: 'every campaign', kind: 'live' },
  ]
  const items = [...live, ...projected]
  return (
    <div className="cc-pulse">
      <div className="cc-pulse-dot" aria-hidden="true">●</div>
      <div className="cc-pulse-label">PULSE · CHATSWOOD</div>
      <div className="cc-pulse-track" aria-label="Live and projected pilot stats">
        <div className="cc-pulse-strip">
          {items.map((it, i) => (
            <span key={i} className={`cc-pulse-item cc-pulse-${it.kind}`}>
              <span className="ppe">{it.e}</span>
              <b>{it.v}</b>
              <em>{it.l}</em>
              {it.kind === 'forecast' && <small className="cc-pulse-badge">FORECAST</small>}
              {it.kind === 'live' && <small className="cc-pulse-badge cc-pulse-badge-live">LIVE</small>}
            </span>
          ))}
          {items.map((it, i) => (
            <span key={`d${i}`} className={`cc-pulse-item cc-pulse-${it.kind}`} aria-hidden="true">
              <span className="ppe">{it.e}</span>
              <b>{it.v}</b>
              <em>{it.l}</em>
              {it.kind === 'forecast' && <small className="cc-pulse-badge">FORECAST</small>}
              {it.kind === 'live' && <small className="cc-pulse-badge cc-pulse-badge-live">LIVE</small>}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
