interface Props {
  /** 0..1 progress along the walk (1 = arrived) */
  progress: number
  /** Distance remaining in metres */
  metersLeft: number
  /** Minutes-left subline */
  minsLeft: number
}

const SIZE = 200
const RADIUS = 88
const STROKE = 14
const CIRC = 2 * Math.PI * RADIUS // ≈ 553

export function ProgressRing({ progress, metersLeft, minsLeft }: Props) {
  const p = Math.max(0, Math.min(1, progress))
  const dashOffset = CIRC * (1 - p)
  return (
    <div className="cc-ring">
      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} aria-hidden="true">
        <defs>
          <linearGradient id="cc-ring-g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FF6B9D" />
            <stop offset="100%" stopColor="#F5C842" />
          </linearGradient>
        </defs>
        <g transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}>
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke="#F0E8D6"
            strokeWidth={STROKE}
          />
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke="url(#cc-ring-g)"
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeDasharray={CIRC}
            strokeDashoffset={dashOffset}
            style={{ transition: 'stroke-dashoffset 900ms cubic-bezier(0.4, 0, 0.2, 1)' }}
          />
        </g>
      </svg>
      <div className="cc-ring-center">
        <span className="cc-ring-big">
          {Math.round(metersLeft)}
          <small>m</small>
        </span>
        <span className="cc-ring-sub">~ {minsLeft} MIN LEFT</span>
      </div>
    </div>
  )
}
