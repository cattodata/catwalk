import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { X, Check, CloudRain, Cloud } from 'lucide-react'
import type { Shop, TransportId } from '../types/shop'

import { ProgressRing } from '../components/ProgressRing'
import { InsightStrip } from '../components/InsightStrip'
import { Catto } from '../components/Catto'

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
    icon: '🌧️',
    title: 'Almost there',
    sub: "You're on the best route to earn your multiplier.",
  }

  const isRainy = weather?.isRain ?? false

  return (
    <div className="cc-walking">
      <header className="cc-walk-top">
        <button type="button" className="cc-icon-btn" onClick={() => navigate('/walk')} aria-label="Close">
          <X size={16} strokeWidth={2.2} aria-hidden="true" />
        </button>
        <span className="cc-live">
          <span className="cc-live-dot" aria-hidden="true" /> LIVE GPS
        </span>
        {/* Removed dead More button (Walker P1#9) — no menu actions defined */}
        <span style={{ width: 36 }} aria-hidden="true" />
      </header>

      <div className="cc-destination">
        <span className="cc-destination-eb">Walking to</span>
        <h3>
          {shop?.name ?? '…'} <span aria-hidden="true">{shop?.emoji ?? ''}</span>
        </h3>
      </div>

      <ProgressRing progress={session.progress} metersLeft={metersLeft} minsLeft={minsLeft} />

      <div className="cc-catto-walk" aria-hidden="true">
        <Catto scale={1.4} state="walking" dir={1} />
      </div>

      <InsightStrip
        emoji={isRainy ? <CloudRain size={20} strokeWidth={2} /> : <Cloud size={20} strokeWidth={2} />}
        title={insight.title}
        body={insight.sub}
      />

      <button
        type="button"
        className={`cc-arrive-cta${session.phase === 'arrived' ? ' is-pulsing' : ''}`}
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
