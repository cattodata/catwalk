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

export function PulseTicker({ liveSinceLaunch, pilotProjection }: PulseTickerProps) {
  const live = [
    { e: '👥', v: String(liveSinceLaunch.walkingNow), l: 'walking right now' },
    { e: '🚶', v: liveSinceLaunch.walks.toLocaleString(), l: 'walks since launch' },
    { e: '🌱', v: `${liveSinceLaunch.co2Kg.toFixed(2)} kg`, l: 'CO₂ saved · real users' },
  ]
  const projected = [
    { e: '📊', v: pilotProjection.walks.toLocaleString(), l: '30-day pilot model · walks' },
    { e: '💰', v: `$${(pilotProjection.extraRev / 1000).toFixed(1)}K`, l: 'extra revenue · forecast' },
    { e: '🚲', v: `${pilotProjection.km.toFixed(0)} km`, l: 'covered · forecast' },
    { e: '🌏', v: 'EN · 中文 · 한국어', l: 'every campaign' },
  ]
  const items = [...live, ...projected]
  return (
    <div className="cc-pulse">
      <div className="cc-pulse-dot">●</div>
      <div className="cc-pulse-label">PULSE · CHATSWOOD · LIVE + 30-DAY MODEL</div>
      <div className="cc-pulse-track">
        <div className="cc-pulse-strip">
          {[...items, ...items].map((it, i) => (
            <span key={i} className="cc-pulse-item">
              <span className="ppe">{it.e}</span>
              <b>{it.v}</b>
              <em>{it.l}</em>
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
