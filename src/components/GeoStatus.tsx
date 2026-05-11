import { MapPin, MapPinOff, Loader } from 'lucide-react'

type Permission = 'granted' | 'prompt' | 'denied' | 'unknown'

interface Props {
  permission: Permission
  accuracy?: number | null
}

/**
 * Small ground-truth indicator for geolocation state. Goes inline near
 * the tier ribbon. Doesn't bring attention unless denied.
 */
export function GeoStatus({ permission, accuracy }: Props) {
  if (permission === 'granted' && accuracy != null) {
    return (
      <div className="cc-geo-status cc-geo-ok" role="status">
        <MapPin size={11} strokeWidth={2.4} aria-hidden="true" />
        <span>GPS · ±{Math.round(accuracy)}m</span>
      </div>
    )
  }
  if (permission === 'denied') {
    return (
      <div className="cc-geo-status cc-geo-denied" role="status">
        <MapPinOff size={11} strokeWidth={2.4} aria-hidden="true" />
        <span>Demo mode · no GPS</span>
      </div>
    )
  }
  return (
    <div className="cc-geo-status cc-geo-loading" role="status">
      <Loader size={11} strokeWidth={2.4} aria-hidden="true" className="cc-geo-spin" />
      <span>Locating…</span>
    </div>
  )
}
