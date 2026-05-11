import { Sparkles } from 'lucide-react'

interface Row {
  name: string
  mult: '2×' | '3×' | '5×'
  variant: 'x2' | 'x3' | 'x5'
  sub: string // e.g. "UNTIL 6PM · UNDERSERVED"
}

interface Props {
  rows: Row[]
  projection?: { label: string; onClick?: () => void }
}

export function BoostedStreetsList({ rows, projection }: Props) {
  return (
    <div className="cc-bs">
      <h5 className="cc-bs-title">Boosted streets</h5>
      <div className="cc-bs-rows">
        {rows.map((r) => (
          <div key={r.name} className="cc-bs-row">
            <span className={`cc-bs-m cc-bs-${r.variant}`}>{r.mult}</span>
            <div className="cc-bs-body">
              <span className="cc-bs-name">{r.name}</span>
              <span className="cc-bs-sub">{r.sub}</span>
            </div>
          </div>
        ))}
      </div>
      {projection && (
        <button type="button" className="cc-projection-cta" onClick={projection.onClick}>
          <Sparkles size={14} strokeWidth={2.2} aria-hidden="true" />
          {projection.label}
        </button>
      )}
    </div>
  )
}
