/** 3-segment SVG donut: EN / 中文 / 한국어 with "3 LANGS" center text */
export function LangDonut({ enPct = 52, zhPct = 40, koPct = 8 }: { enPct?: number; zhPct?: number; koPct?: number }) {
  const total = enPct + zhPct + koPct
  const norm = (p: number) => (p / total) * 360
  const r = 36
  const cx = 50
  const cy = 50
  const stroke = 12

  const arc = (start: number, end: number, color: string) => {
    const c = 2 * Math.PI * r
    const dash = ((end - start) / 360) * c
    const offset = -((start / 360) * c)
    return (
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeDasharray={`${dash} ${c}`}
        strokeDashoffset={offset}
        transform={`rotate(-90 ${cx} ${cy})`}
      />
    )
  }

  const a1 = norm(enPct)
  const a2 = a1 + norm(zhPct)

  return (
    <div className="cc-donut">
      <svg viewBox="0 0 100 100" width="120" height="120" aria-hidden="true">
        {arc(0, a1, '#5B9BD5')}
        {arc(a1, a2, '#B49EFB')}
        {arc(a2, 360, '#FF6B9D')}
      </svg>
      <span className="cc-donut-center">3<br/>LANGS</span>
    </div>
  )
}
