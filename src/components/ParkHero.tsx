import { Car } from 'lucide-react'

export function ParkHero() {
  return (
    <div className="cc-park-hero">
      <span className="cc-park-eyebrow">
        <Car size={11} strokeWidth={2.4} aria-hidden="true" /> DETECTED · 8 MIN AWAY
      </span>
      <h3>Park here, walk in — still earn 2×</h3>
      <p>Mall is full till 11:30am. Park 450m out, beat the queue.</p>
    </div>
  )
}
