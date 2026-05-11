import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { X, Check } from 'lucide-react'
import type { Shop, TransportId } from '../types/shop'

import { useRealShops } from '../hooks/useRealShops'
import { useWeather } from '../hooks/useWeather'
import { useNow } from '../hooks/useNow'
import { useWalkSession } from '../hooks/useWalkSession'
import { useGeolocation } from '../hooks/useGeolocation'
import { useSupabaseAuth } from '../hooks/useSupabaseAuth'
import { generateInsights } from '../lib/insights'
import { getTodayEvent } from '../data/events'

export function WalkingLiveScreen() {
  const navigate = useNavigate()
  const now = useNow(60_000)
  const { shops } = useRealShops()
  const { weather } = useWeather()
  const auth = useSupabaseAuth()

  // Restore selected shop + transport from sessionStorage (set by Walker Home Start CTA)
  const [shop, setShop] = useState<Shop | null>(null)
  const transport = useMemo<TransportId>(() => {
    const t = sessionStorage.getItem('cc:transport') as TransportId | null
    return t === 'bike' || t === 'scoot' || t === 'bus' ? t : 'walk'
  }, [])

  useEffect(() => {
    const id = sessionStorage.getItem('cc:selectedShopId')
    if (!shops.length) return
    if (!id) {
      navigate('/walk', { replace: true })
      return
    }
    const found = shops.find((s) => s.id === id)
    if (!found) {
      navigate('/walk', { replace: true })
      return
    }
    setShop(found)
  }, [shops, navigate])

  // Real GPS during walk; if denied/unavailable, useWalkSession falls back to demo RAF.
  const geo = useGeolocation(true)
  const session = useWalkSession({
    shop,
    transport,
    position: geo.position,
    userId: auth.user?.id ?? null,
    demoMode: !geo.position,
  })

  // Auto-start exactly once when shop loaded (idempotent under StrictMode double-mount)
  const startedRef = useRef(false)
  useEffect(() => {
    if (shop && session.phase === 'idle' && !startedRef.current) {
      startedRef.current = true
      session.start()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shop, session.phase])

  // Fire confirmArrival once when phase flips to 'arrived' (idempotent)
  const confirmedRef = useRef(false)
  useEffect(() => {
    if (session.phase === 'arrived' && shop && !confirmedRef.current) {
      confirmedRef.current = true
      session.confirmArrival()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.phase])

  // Persist reward + navigate once rewardSummary is populated by confirmArrival
  useEffect(() => {
    if (session.phase === 'completed' && session.rewardSummary && shop) {
      sessionStorage.setItem(
        'cc:reward',
        JSON.stringify({
          shopName: shop.name,
          shopEmoji: shop.emoji,
          dist: shop.dist,
          points: session.rewardSummary.points,
          co2Kg: session.rewardSummary.co2Kg,
          discount: session.rewardSummary.discount,
          isVerifiedGps: session.isVerifiedGps,
          transport,
        }),
      )
      const t = setTimeout(() => navigate('/walk/reward'), 400)
      return () => clearTimeout(t)
    }
  }, [session.phase, session.rewardSummary, session.isVerifiedGps, shop, navigate, transport])

  const totalMeters = shop?.dist ?? 480
  const metersLeft = Math.max(0, Math.round(totalMeters * (1 - session.progress)))
  const minsLeft = Math.max(1, Math.round(metersLeft / 75))

  const insights = useMemo(() => {
    if (!shop) return []
    return generateInsights({
      bizType: shop.type,
      shop,
      weather,
      competitors: null,
      hour: now.getHours(),
      dayOfWeek: now.getDay(),
      todayEvent: getTodayEvent(now),
    })
  }, [shop, weather, now])

  const insight = insights[0] ?? {
    icon: '🌦',
    title: 'Almost there',
    sub: "You're on the best route to earn your multiplier.",
  }

  // Conic-gradient ring: end of pink stops at progress fraction of 360°
  const progressDeg = Math.max(0, Math.min(360, Math.round(session.progress * 360)))
  const conicBg = `conic-gradient(from -90deg, #FF6B9D 0deg, #F5C842 ${progressDeg}deg, rgba(0,0,0,.06) ${progressDeg + 30}deg 360deg)`

  return (
    <div className="cc-walking-v5">
      <div className="cc-walking-v5-top">
        <button
          type="button"
          className="cc-icon-btn"
          onClick={() => navigate('/walk')}
          aria-label="Close"
        >
          <X size={16} strokeWidth={2.2} aria-hidden="true" />
        </button>
        <span className="cc-walking-v5-gps">
          <span className="cc-walking-v5-gps-dot" aria-hidden="true" /> LIVE GPS
        </span>
        <span style={{ width: 34 }} aria-hidden="true" />
      </div>

      <div style={{ textAlign: 'center' }}>
        <span className="cc-walking-v5-head">Walking to</span>
        <h2 className="cc-walking-v5-h2">
          {shop?.name ?? '…'} <span aria-hidden="true">{shop?.emoji ?? ''}</span>
        </h2>
      </div>

      <div className="cc-walking-v5-ring" style={{ background: conicBg }}>
        <div className="cc-walking-v5-ring-in">
          <div className="cc-walking-v5-km">
            {metersLeft}
            <span className="u">m</span>
          </div>
          <div className="cc-walking-v5-lab">~ {minsLeft} MIN LEFT</div>
        </div>
      </div>

      <div className="cc-walking-v5-mascot" aria-hidden="true">
        🐱
      </div>

      <div className="cc-walking-v5-weather">
        <span className="em" aria-hidden="true">{insight.icon}</span>
        <div>
          <b>{insight.title}</b>
          <span>{insight.sub}</span>
        </div>
      </div>

      <button
        type="button"
        className={`cc-walking-v5-arrive${session.phase === 'arrived' ? ' is-ready' : ''}`}
        disabled={session.phase !== 'arrived'}
        onClick={() => {
          if (session.phase === 'arrived') navigate('/walk/reward')
        }}
      >
        <Check size={18} strokeWidth={2.6} aria-hidden="true" />
        I've arrived · Claim reward
      </button>
    </div>
  )
}
