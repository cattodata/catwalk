interface Axis {
  key: string
  label: string
  /** 0–1 current pilot value (e.g. 0.23 = 23% of target) */
  current: number
}

interface Props {
  axes: Axis[]
  size?: number
}

/**
 * 5-axis SVG radar comparing current pilot trajectory vs 2036 Willoughby
 * targets. Outer dotted ring = target (1.0). Filled coral polygon =
 * current pilot. Axis labels JetBrains Mono caps.
 */
export function GoalRadarChart({ axes, size = 280 }: Props) {
  const pad = 44 // SVG viewBox padding so axis labels have room to breathe
  const cx = size / 2
  const cy = size / 2 - 4
  const r = size * 0.36
  const labelR = r + 20

  // Axis angles starting from top (12 o'clock) clockwise
  const angles = axes.map((_, i) => -Math.PI / 2 + (i * Math.PI * 2) / axes.length)

  const ringPoints = (frac: number) =>
    angles
      .map((a) => `${cx + Math.cos(a) * r * frac},${cy + Math.sin(a) * r * frac}`)
      .join(' ')

  const currentPoints = axes
    .map((ax, i) => {
      const a = angles[i]
      const f = Math.max(0.04, Math.min(1, ax.current))
      return `${cx + Math.cos(a) * r * f},${cy + Math.sin(a) * r * f}`
    })
    .join(' ')

  const avgPct = Math.round(
    (axes.reduce((s, a) => s + Math.min(1, a.current), 0) / axes.length) * 100,
  )

  return (
    <div className="cc-radar-wrap">
      <svg
        viewBox={`${-pad} ${-pad} ${size + pad * 2} ${size + pad * 2}`}
        width={size + pad * 2}
        height={size + pad * 2}
        aria-label="Goal alignment radar"
        style={{ overflow: 'visible' }}
      >
        {/* Concentric guide rings */}
        {[0.25, 0.5, 0.75, 1].map((f, i) => (
          <polygon
            key={i}
            points={ringPoints(f)}
            fill="none"
            stroke={f === 1 ? '#2d1a22' : 'rgba(45, 26, 34, 0.08)'}
            strokeWidth={f === 1 ? 1.2 : 1}
            strokeDasharray={f === 1 ? '3 4' : undefined}
          />
        ))}
        {/* Axis lines */}
        {angles.map((a, i) => (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={cx + Math.cos(a) * r}
            y2={cy + Math.sin(a) * r}
            stroke="rgba(45, 26, 34, 0.1)"
            strokeWidth={1}
          />
        ))}
        {/* Current pilot polygon */}
        <polygon
          points={currentPoints}
          fill="rgba(255, 107, 157, 0.32)"
          stroke="#FF6B9D"
          strokeWidth={2}
          strokeLinejoin="round"
        />
        {/* Axis labels */}
        {axes.map((ax, i) => {
          const a = angles[i]
          const x = cx + Math.cos(a) * labelR
          const y = cy + Math.sin(a) * labelR
          const anchor = Math.abs(Math.cos(a)) < 0.3 ? 'middle' : Math.cos(a) > 0 ? 'start' : 'end'
          return (
            <text
              key={ax.key}
              x={x}
              y={y}
              fontSize={9.5}
              fontFamily="var(--font-mono)"
              fontWeight={700}
              letterSpacing={0.8}
              textAnchor={anchor}
              dominantBaseline="middle"
              fill="#5d4a52"
            >
              {ax.label.toUpperCase()}
            </text>
          )
        })}
      </svg>
      <div className="cc-radar-caption">
        <mark>{avgPct}%</mark> of 2036 targets reached at week 3
      </div>
    </div>
  )
}
