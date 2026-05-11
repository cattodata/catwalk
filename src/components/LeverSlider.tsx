interface Props {
  label: string
  value: string // formatted value e.g. "−20%", "3×", "+$2k/wk"
  pct: number // 0..100 (display position of knob + fill)
  onChange: (pct: number) => void
}

export function LeverSlider({ label, value, pct, onChange }: Props) {
  return (
    <div className="cc-lever">
      <div className="cc-lever-top">
        <span className="cc-lever-label">{label}</span>
        <b className="cc-lever-val">{value}</b>
      </div>
      <div className="cc-lever-track" aria-hidden="true">
        <div className="cc-lever-fill" style={{ width: `${pct}%` }} />
        <div className="cc-lever-knob" style={{ left: `${pct}%` }} />
      </div>
      <input
        type="range"
        min={0}
        max={100}
        value={pct}
        onChange={(e) => onChange(Number(e.target.value))}
        className="cc-lever-input"
        aria-label={label}
      />
    </div>
  )
}
