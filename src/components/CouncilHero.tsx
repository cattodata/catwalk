import { AnimatedCounter } from './AnimatedCounter'

interface NumericStat {
  value: number
  label: string
  prefix?: string
  suffix?: string
  decimals?: number
}

interface Props {
  eyebrow: string
  title: string
  stats: NumericStat[]
  /** Show pulsing live dot in the eyebrow */
  isLive?: boolean
}

/** Sky→sage gradient hero w/ 3 glassmorphic stat tiles + animated counters */
export function CouncilHero({ eyebrow, title, stats, isLive = false }: Props) {
  return (
    <div className="cc-chero">
      <span className="cc-chero-eb">
        {isLive && <span className="cc-chero-live-dot" aria-hidden="true" />}
        {eyebrow}
      </span>
      <h3>{title}</h3>
      <div className="cc-chero-stats">
        {stats.map((s, i) => (
          <div key={i} className="cc-cs">
            <span className="cc-cs-v">
              <AnimatedCounter
                value={s.value}
                prefix={s.prefix}
                suffix={s.suffix}
                decimals={s.decimals}
              />
            </span>
            <span className="cc-cs-l">{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
