interface StatDef {
  tone: 'coral' | 'amber' | 'sage'
  label: string
  value: string
}

export function Stat3Grid({ stats }: { stats: StatDef[] }) {
  return (
    <div className="cc-stat3">
      {stats.map((s, i) => (
        <div key={i} className={`cc-stat3-tile cc-stat3-${s.tone}`}>
          <span className="cc-stat3-v">{s.value}</span>
          <span className="cc-stat3-l">{s.label}</span>
        </div>
      ))}
    </div>
  )
}
