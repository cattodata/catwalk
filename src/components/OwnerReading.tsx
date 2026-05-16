import { useState, type ReactNode } from 'react'

interface ReadingRow {
  icon: ReactNode
  signal: ReactNode
  conclusion: ReactNode
}

interface Props {
  rows: ReadingRow[]
  /** v6 — collapse rows beyond `initialCount` behind a "+N more ↓" expander */
  initialCount?: number
}

/**
 * Inline "showing its work" — each row is [icon] signal → conclusion.
 * v6 Calm Complete: defaults to TOP-3 rows + tap-expand for the rest.
 */
export function OwnerReading({ rows, initialCount }: Props) {
  const [expanded, setExpanded] = useState(false)
  const visibleRows = initialCount && !expanded ? rows.slice(0, initialCount) : rows
  const hiddenCount = rows.length - visibleRows.length

  return (
    <section className="cc-or" role="region" aria-label="Catto reading">
      <header className="cc-or-head">
        <span className="cc-or-dot" aria-hidden="true" />
        <span className="cc-or-h">CATTO SEES</span>
        <span className="cc-or-src">{rows.length} signals · 0.8s</span>
      </header>
      <ul className="cc-or-list">
        {visibleRows.map((r, i) => (
          <li key={i} className="cc-or-row">
            <span className="cc-or-ico" aria-hidden="true">{r.icon}</span>
            <p>
              <span>{r.signal}</span>
              <span className="cc-or-arr" aria-hidden="true">→</span>
              <span className="cc-or-conc">{r.conclusion}</span>
            </p>
          </li>
        ))}
      </ul>
      {hiddenCount > 0 && (
        <button
          type="button"
          className="cc-or-more"
          onClick={() => setExpanded(true)}
          aria-expanded="false"
        >
          +{hiddenCount} more ↓
        </button>
      )}
      <footer className="cc-or-sources">
        Sources · your POS 14d · Open-Meteo · ABS 2021 ancestry · competitor menu watch
      </footer>
    </section>
  )
}
