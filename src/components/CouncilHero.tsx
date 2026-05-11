interface Stat {
  value: string | number
  label: string
}

interface Props {
  eyebrow: string
  title: string
  stats: Stat[]
}

/** Sky→sage gradient hero w/ 3 glassmorphic stat tiles inside */
export function CouncilHero({ eyebrow, title, stats }: Props) {
  return (
    <div className="cc-chero">
      <span className="cc-chero-eb">{eyebrow}</span>
      <h3>{title}</h3>
      <div className="cc-chero-stats">
        {stats.map((s, i) => (
          <div key={i} className="cc-cs">
            <span className="cc-cs-v">{s.value}</span>
            <span className="cc-cs-l">{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
