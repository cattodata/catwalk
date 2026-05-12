import type { CulturalEvent } from '../data/culturalEvents'
import type { CuisineId } from '../types/shop'
import { Radar, ArrowRight } from 'lucide-react'

interface Props {
  event: CulturalEvent
  upcoming?: boolean
  /** Walker-discover mode (filter cuisine on tap) or Owner-sell mode (open campaign generator). Default: 'sell' */
  mode?: 'discover' | 'sell'
  onSelectCuisine?: (id: CuisineId) => void
  onSellAction?: () => void
}

/**
 * v5.5: EventRadarCard is now Owner-side sell-mode by default. Walker
 * removed the radar from Discover (calm v2 silhouette); Owner uses it
 * as a sell signal — "today's event near you" with a CTA into the
 * campaign generator pre-filled with event context.
 */
export function EventRadarCard({
  event,
  upcoming = false,
  mode = 'sell',
  onSelectCuisine,
  onSellAction,
}: Props) {
  const onClick = mode === 'sell' ? onSellAction : () => onSelectCuisine?.(event.cuisineHint)
  const eyebrowText =
    mode === 'sell' ? "TODAY'S EVENT NEAR YOU" : upcoming ? "WHAT'S NEXT" : "TODAY'S VIBE"

  return (
    <button
      type="button"
      className={`cc-radar-card cc-radar-${mode}`}
      onClick={onClick}
      aria-label={mode === 'sell' ? `Open campaign for ${event.name}` : `Filter by ${event.cuisineHint}`}
    >
      <span className="cc-radar-eb" aria-hidden="true">
        <Radar size={11} strokeWidth={2.4} />
        <span>{eyebrowText}</span>
      </span>
      <span className="cc-radar-body">
        <span className="cc-radar-em" aria-hidden="true">{event.emoji}</span>
        <span>
          <b>{event.name}</b>
          <small>
            {mode === 'sell' ? (
              <>
                Peak walk-by · <mark>+{event.predictedLift}%</mark> nearby
              </>
            ) : (
              <>
                <mark>+{event.predictedLift}%</mark> {event.cuisineHint.toLowerCase()} walks
              </>
            )}
          </small>
        </span>
      </span>
      <span className="cc-radar-cta">
        {mode === 'sell' ? <>Catto play <ArrowRight size={12} strokeWidth={2.4} /></> : <ArrowRight size={14} strokeWidth={2.4} />}
      </span>
    </button>
  )
}
