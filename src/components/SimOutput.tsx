interface Delta {
  value: string
  label: string
  tone: 'pos' | 'neg'
}

export function SimOutputCard({ deltas }: { deltas: Delta[] }) {
  return (
    <div className="cc-sim-out">
      <h5>Projected 12-mo impact</h5>
      <span className="cc-sim-lab">CLAUDE + AGENT-BASED MODEL · N=8,400</span>
      <div className="cc-delta-grid">
        {deltas.map((d, i) => (
          <div key={i} className={`cc-delta cc-delta-${d.tone}`}>
            <span className="cc-delta-v">{d.value}</span>
            <span className="cc-delta-l">{d.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
