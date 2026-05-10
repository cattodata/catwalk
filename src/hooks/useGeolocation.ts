import { useEffect, useRef, useState } from 'react'

export interface GeoPosition {
  lat: number
  lng: number
  accuracy: number
  timestamp: number
}

export interface GeoState {
  position: GeoPosition | null
  error: string | null
  isWatching: boolean
  isSupported: boolean
}

/**
 * Watch geolocation. Pass `enabled=false` to pause without unmounting.
 */
export function useGeolocation(enabled: boolean = true): GeoState {
  const [position, setPosition] = useState<GeoPosition | null>(null)
  const [error, setError] = useState<string | null>(null)
  const watchIdRef = useRef<number | null>(null)
  const isSupported = typeof navigator !== 'undefined' && 'geolocation' in navigator

  useEffect(() => {
    if (!enabled || !isSupported) return

    const onSuccess: PositionCallback = (p) => {
      setPosition({
        lat: p.coords.latitude,
        lng: p.coords.longitude,
        accuracy: p.coords.accuracy,
        timestamp: p.timestamp,
      })
      setError(null)
    }
    const onError: PositionErrorCallback = (e) => {
      setError(e.message || 'Geolocation error')
    }

    watchIdRef.current = navigator.geolocation.watchPosition(onSuccess, onError, {
      enableHighAccuracy: true,
      maximumAge: 5_000,
      timeout: 15_000,
    })

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current)
        watchIdRef.current = null
      }
    }
  }, [enabled, isSupported])

  return {
    position,
    error,
    isWatching: watchIdRef.current !== null,
    isSupported,
  }
}
