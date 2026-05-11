import { Sparkles, ArrowRight } from 'lucide-react'

interface Props {
  subtext: string
  onClick: () => void
}

export function SmartPickCta({ subtext, onClick }: Props) {
  return (
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
  )
}
