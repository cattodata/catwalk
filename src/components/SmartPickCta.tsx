import { useState } from 'react'
import { Sparkles, ArrowRight, ChevronDown } from 'lucide-react'

interface Props {
  subtext: string
  reasons?: string[]
  onClick: () => void
}

export function SmartPickCta({ subtext, reasons = [], onClick }: Props) {
  const [open, setOpen] = useState(false)
  const hasReasons = reasons.length > 0
  return (
    <div className={`cc-smart-cta-wrap${open ? ' is-open' : ''}`}>
      <button type="button" className="cc-smart-cta" onClick={onClick}>
        <span className="cc-smart-cta-ic" aria-hidden="true">
          <Sparkles size={18} strokeWidth={2} />
        </span>
        <span className="cc-smart-cta-body">
          <span className="cc-smart-cta-lab">Smart pick</span>
          <small>{subtext}</small>
        </span>
        <span className="cc-smart-cta-arrow" aria-hidden="true">
          <ArrowRight size={16} strokeWidth={2.4} />
        </span>
      </button>
      {hasReasons && (
        <button
          type="button"
          className="cc-smart-why"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-controls="cc-smart-why-list"
        >
          <span>why this</span>
          <ChevronDown size={13} strokeWidth={2.4} aria-hidden="true" />
        </button>
      )}
      {open && hasReasons && (
        <ul id="cc-smart-why-list" className="cc-smart-why-list">
          {reasons.map((r, i) => (
            <li key={i}>
              <span className="cc-smart-why-dot" aria-hidden="true" />
              {r}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
