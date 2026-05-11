interface Props {
  score: number // 0..100
  witness: string // e.g. "RAIN · STATION PEAK · LOW COMPETITORS @ 5PM"
}

export function OpportunityScoreBar({ score, witness }: Props) {
  const pct = Math.max(0, Math.min(100, score))
  return (
    <div className="cc-opp">
      <div className="cc-opp-top">
        <span className="cc-opp-label">Opportunity score</span>
        <span className="cc-opp-val">{Math.round(pct)}/100</span>
      </div>
      <div className="cc-opp-track" aria-hidden="true">
        <div className="cc-opp-fill" style={{ width: `${pct}%` }} />
      </div>
      <div className="cc-opp-witness">{witness}</div>
    </div>
  )
}
