interface Props {
  tierLevel: number
  tierName: string
  progressPct: number // 0..100
  kgSaved: number
}

/**
 * Tier progress ribbon on Walker Home — avatar w/ number + name + bar + KG SAVED.
 */
export function TierRibbon({ tierLevel, tierName, progressPct, kgSaved }: Props) {
  const pct = Math.max(0, Math.min(100, progressPct))
  return (
    <div className="cc-tier-ribbon">
      <span className="cc-tier-av" aria-hidden="true">
        {tierLevel}
      </span>
      <div className="cc-tier-copy">
        <span className="cc-tier-name">{tierName} · Tier {tierLevel}</span>
        <span className="cc-tier-bar" aria-hidden="true">
          <span className="cc-tier-fill" style={{ width: `${pct}%` }} />
        </span>
      </div>
      <div className="cc-tier-kg">
        <span className="cc-tier-kg-num">{kgSaved.toFixed(2)}</span>
        <small>KG SAVED</small>
      </div>
    </div>
  )
}
