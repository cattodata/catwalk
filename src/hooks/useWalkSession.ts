import { useCallback, useEffect, useRef, useState } from 'react'
import type { Shop, TransportId } from '../types/shop'
import { TRANSPORT } from '../data/shops'
import { CHATSWOOD } from '../config/chatswood'
import { haversineMeters } from '../lib/geofence'
import { supabase } from '../lib/supabase'
import type { GeoPosition } from './useGeolocation'

export type WalkPhase = 'idle' | 'walking' | 'arrived' | 'completed' | 'error'

interface UseWalkSessionArgs {
  shop: Shop | null
  transport: TransportId
  position: GeoPosition | null
  userId: string | null
  /** Allow demo mode = bypass geolocation, use animated 3.5s walk */
  demoMode?: boolean
}

export interface WalkSessionState {
  phase: WalkPhase
  progress: number // 0..1 along route polyline (for map animation)
  distanceToShop: number | null // metres remaining
  isVerifiedGps: boolean
  errorMessage: string | null
  rewardSummary: { points: number; co2Kg: number; discount: number } | null
}

const INITIAL_STATE: WalkSessionState = {
  phase: 'idle',
  progress: 0,
  distanceToShop: null,
  isVerifiedGps: false,
  errorMessage: null,
  rewardSummary: null,
}

export function useWalkSession({
  shop,
  transport,
  position,
  userId,
  demoMode = false,
}: UseWalkSessionArgs) {
  const [state, setState] = useState<WalkSessionState>(INITIAL_STATE)
  const startedAtRef = useRef<number | null>(null)
  const startPosRef = useRef<GeoPosition | null>(null)
  const startDistRef = useRef<number | null>(null)
  const rafRef = useRef<number | null>(null)
  const phaseRef = useRef<WalkPhase>('idle')
  // Latest position mirror so the RAF animate() always sees fresh GPS, not the
  // closure-captured value at start() time. (Senior tester P0-4 fix.)
  const positionRef = useRef<GeoPosition | null>(position)
  useEffect(() => { positionRef.current = position }, [position])
  // Latest verified-GPS flag for confirmArrival (senior tester P0-5 fix).
  const verifiedRef = useRef<boolean>(false)
  useEffect(() => { verifiedRef.current = state.isVerifiedGps }, [state.isVerifiedGps])

  // Mirror phase to ref so async callbacks always see latest value
  useEffect(() => {
    phaseRef.current = state.phase
  }, [state.phase])

  /** Compute live distance to selected shop on every position update */
  useEffect(() => {
    if (!shop || !position || !shop.lat || !shop.lng) return
    const d = haversineMeters(position, { lat: shop.lat, lng: shop.lng })
    setState((s) => ({ ...s, distanceToShop: Math.round(d) }))

    // If walking and within geofence → mark arrived (use ref, not closure-captured state)
    if (phaseRef.current === 'walking' && d <= CHATSWOOD.geofence_m) {
      setState((s) => ({ ...s, phase: 'arrived', progress: 1, isVerifiedGps: true }))
    }
  }, [position, shop])

  const start = useCallback(() => {
    if (!shop) return
    const t = TRANSPORT.find((x) => x.id === transport) ?? TRANSPORT[0]
    // Cancel any in-flight RAF before starting a new one (senior tester P1-12)
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    rafRef.current = null

    startedAtRef.current = performance.now()
    const startPos = positionRef.current
    startPosRef.current = startPos
    startDistRef.current =
      startPos && shop.lat && shop.lng
        ? haversineMeters(startPos, { lat: shop.lat, lng: shop.lng })
        : null

    setState((s) => ({
      ...s,
      phase: 'walking',
      progress: 0,
      isVerifiedGps: false,
      errorMessage: null,
      rewardSummary: null,
    }))

    if (demoMode || !startPos || !shop.lat || !shop.lng) {
      // Demo: animate progress over 3.5s × speed mult, then auto-arrive
      const dur = CHATSWOOD.timings.walk * t.speed
      const tick = (tt: number) => {
        const t0 = startedAtRef.current ?? tt
        const p = Math.min(1, (tt - t0) / dur)
        setState((s) => (s.phase === 'walking' ? { ...s, progress: p } : s))
        if (p < 1 && phaseRef.current === 'walking') {
          rafRef.current = requestAnimationFrame(tick)
        } else if (p >= 1 && phaseRef.current === 'walking') {
          rafRef.current = null
          setState((s) => ({ ...s, phase: 'arrived', isVerifiedGps: false }))
        } else {
          rafRef.current = null
        }
      }
      rafRef.current = requestAnimationFrame(tick)
    } else {
      // Real-walk mode: read positionRef live (P0-4 fix)
      const sd = startDistRef.current ?? 1
      const animate = () => {
        if (phaseRef.current !== 'walking') {
          rafRef.current = null
          return
        }
        const here = positionRef.current
        if (!here || !shop.lat || !shop.lng) {
          rafRef.current = requestAnimationFrame(animate)
          return
        }
        const remaining = haversineMeters(here, { lat: shop.lat, lng: shop.lng })
        const p = Math.max(0, Math.min(1, 1 - remaining / sd))
        setState((s) => (s.phase === 'walking' ? { ...s, progress: p } : s))
        rafRef.current = requestAnimationFrame(animate)
      }
      rafRef.current = requestAnimationFrame(animate)
    }
  }, [shop, transport, demoMode])

  /** Confirm arrival → save walk to Supabase + return reward */
  const confirmArrival = useCallback(async () => {
    if (!shop) return
    const t = TRANSPORT.find((x) => x.id === transport) ?? TRANSPORT[0]
    const co2 = +(shop.co2 * t.co2Mult).toFixed(4)
    const points = Math.round(shop.pts * t.ptsMult)
    const reward = { points, co2Kg: co2, discount: shop.off }

    setState((s) => ({ ...s, phase: 'completed', rewardSummary: reward }))

    // Persist to Supabase if available — read verifiedRef (P0-5 fix, fresh value)
    const sb = supabase
    if (sb && userId) {
      try {
        const { error } = await sb.from('walks').insert({
          user_id: userId,
          shop_id: shop.id,
          transport_mode: transport,
          distance_m: shop.dist,
          co2_saved_kg: co2,
          points_earned: points,
          verified_geolocation: verifiedRef.current,
          start_lat: startPosRef.current?.lat ?? null,
          start_lng: startPosRef.current?.lng ?? null,
          end_lat: positionRef.current?.lat ?? null,
          end_lng: positionRef.current?.lng ?? null,
        })
        if (error) console.warn('walks insert failed:', error.message)
      } catch (err) {
        console.warn('walks insert threw:', err)
      }
    }
  }, [shop, transport, userId])

  const reset = useCallback(() => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    rafRef.current = null
    startedAtRef.current = null
    startPosRef.current = null
    startDistRef.current = null
    setState(INITIAL_STATE)
  }, [])

  // Cleanup raf on unmount
  useEffect(() => {
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  return {
    ...state,
    start,
    confirmArrival,
    reset,
  }
}
