import { Car } from 'lucide-react'

export function DroveHint({ parkingDollars, kg }: { parkingDollars: number; kg: number }) {
  return (
    <div className="cc-drove-hint">
      <Car size={14} strokeWidth={2} aria-hidden="true" />
      <span>
        vs. driving: <b>+${parkingDollars.toFixed(2)} parking</b> · <b>+{kg.toFixed(2)} kg CO₂</b>
      </span>
    </div>
  )
}
