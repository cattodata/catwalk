import type { ReactNode } from 'react'

interface ReadingRow {
  icon: ReactNode
  signal: ReactNode
  conclusion: ReactNode
}

interface Props {
  rows: ReadingRow[]
}

/**
 * Inline "showing its work" — each row is [icon] signal → conclusion.
 * Replaces the v5 duplicate (chip strip + reasoning panel) with a single
 * compact block. AI is helpful, not showing off.
 */
export function OwnerReading({ rows }: Props) {
  return (
    <section className="cc-or" role="region" aria-label="Catto reading">
      <header className="cc-or-head">
        <span className="cc-or-dot" aria-hidden="true" />
        <span className="cc-or-h">CATTO SEES</span>
        <span className="cc-or-src">{rows.length} signals · 0.8s</span>
      </header>
      <ul className="cc-or-list">
        {rows.map((r, i) => (
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
    </section>
  )
}
