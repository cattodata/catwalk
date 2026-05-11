import type { CulturalEvent } from '../data/culturalEvents'
import type { CuisineId } from '../types/shop'
import { Radar, ArrowRight } from 'lucide-react'

interface Props {
  event: CulturalEvent
  upcoming?: boolean
  onSelectCuisine?: (id: CuisineId) => void
}

/**
 * "Today's vibe" event radar — surfaces an active or upcoming cultural event
 * with the predicted cuisine boost. Tap to apply the cuisine filter on the
 * Walker home. AI sees the world outside, not just the shop data.
 */
export function EventRadarCard({ event, upcoming = false, onSelectCuisine }: Props) {
  return (
    <button
      type="button"
      className="cc-radar-card"
      onClick={() => onSelectCuisine?.(event.cuisineHint)}
      aria-label={`Filter by ${event.cuisineHint}`}
    >
      <span className="cc-radar-eb" aria-hidden="true">
        <Radar size={11} strokeWidth={2.4} />
        <span>{upcoming ? "WHAT'S NEXT" : "TODAY'S VIBE"}</span>
      </span>
      <span className="cc-radar-body">
        <span className="cc-radar-em" aria-hidden="true">{event.emoji}</span>
        <span>
          <b>{event.name}</b>
          <small>
            <mark>+{event.predictedLift}%</mark> {event.cuisineHint.toLowerCase()} walks
          </small>
        </span>
      </span>
      <ArrowRight size={14} strokeWidth={2.4} aria-hidden="true" />
    </button>
  )
}
