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

export function useWalkSession({
  shop,
  transport,
  position,
  userId,
  demoMode = false,
}: UseWalkSessionArgs) {
  const [state, setState] = useState<WalkSessionState>({
    phase: 'idle',
    progress: 0,
    distanceToShop: null,
    isVerifiedGps: false,
    errorMessage: null,
    rewardSummary: null,
  })
  const startedAtRef = useRef<number | null>(null)
  const startPosRef = useRef<GeoPosition | null>(null)
  const rafRef = useRef<number | null>(null)

  /** Compute live distance to selected shop on every position update */
  useEffect(() => {
    if (!shop || !position || !shop.lat || !shop.lng) return
    const d = haversineMeters(position, { lat: shop.lat, lng: shop.lng })
    setState((s) => ({ ...s, distanceToShop: Math.round(d) }))

    // If walking and within geofence → mark arrived
    if (s_phase_walking(state.phase) && d <= CHATSWOOD.geofence_m) {
      setState((s) => ({ ...s, phase: 'arrived', progress: 1, isVerifiedGps: true }))
    }
  }, [position, shop, state.phase])

  const start = useCallback(() => {
    if (!shop) return
    const t = TRANSPORT.find((x) => x.id === transport) ?? TRANSPORT[0]
    startedAtRef.current = performance.now()
    startPosRef.current = position
    setState({
      phase: 'walking',
      progress: 0,
      distanceToShop: state.distanceToShop,
      isVerifiedGps: false,
      errorMessage: null,
      rewardSummary: null,
    })

    if (demoMode || !position || !shop.lat || !shop.lng) {
      // Demo: animate progress over 3.5s × speed mult
      const dur = CHATSWOOD.timings.walk * t.speed
      const tick = (tt: number) => {
        const t0 = startedAtRef.current ?? tt
        const p = Math.min(1, (tt - t0) / dur)
        setState((s) => ({ ...s, progress: p }))
        if (p < 1) {
          rafRef.current = requestAnimationFrame(tick)
        } else {
          setState((s) => ({ ...s, phase: 'arrived', isVerifiedGps: false }))
        }
      }
      rafRef.current = requestAnimationFrame(tick)
    } else {
      // Real-walk mode: animate map progress from current position to shop
      // (geofence effect above flips to 'arrived' when user actually arrives)
      const startDist = state.distanceToShop ?? haversineMeters(position, { lat: shop.lat, lng: shop.lng })
      const animate = () => {
        const here = position
        if (!here || !shop.lat || !shop.lng) return
        const remaining = haversineMeters(here, { lat: shop.lat, lng: shop.lng })
        const p = Math.max(0, Math.min(1, 1 - remaining / startDist))
        setState((s) => ({ ...s, progress: p }))
        // Stop when arrived (effect handles phase change)
        rafRef.current = requestAnimationFrame(animate)
      }
      rafRef.current = requestAnimationFrame(animate)
    }
  }, [shop, transport, position, demoMode, state.distanceToShop])

  /** Confirm arrival → save walk to Supabase + return reward */
  const confirmArrival = useCallback(async () => {
    if (!shop) return
    const t = TRANSPORT.find((x) => x.id === transport) ?? TRANSPORT[0]
    const co2 = +(shop.co2 * t.co2Mult).toFixed(4)
    const points = Math.round(shop.pts * t.ptsMult)
    const reward = { points, co2Kg: co2, discount: shop.off }

    setState((s) => ({ ...s, phase: 'completed', rewardSummary: reward }))

    // Persist to Supabase if available
    if (supabase && userId) {
      try {
        const { error } = await supabase.from('walks').insert({
          user_id: userId,
          shop_id: shop.id,
          transport_mode: transport,
          distance_m: shop.dist,
          co2_saved_kg: co2,
          points_earned: points,
          verified_geolocation: state.isVerifiedGps,
          start_lat: startPosRef.current?.lat ?? null,
          start_lng: startPosRef.current?.lng ?? null,
          end_lat: position?.lat ?? null,
          end_lng: position?.lng ?? null,
        })
        if (error) console.warn('walks insert failed:', error.message)
      } catch (err) {
        console.warn('walks insert threw:', err)
      }
    }
  }, [shop, transport, position, state.isVerifiedGps, userId])

  const reset = useCallback(() => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    rafRef.current = null
    startedAtRef.current = null
    startPosRef.current = null
    setState({
      phase: 'idle',
      progress: 0,
      distanceToShop: null,
      isVerifiedGps: false,
      errorMessage: null,
      rewardSummary: null,
    })
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

function s_phase_walking(p: WalkPhase): boolean {
  return p === 'walking'
}
