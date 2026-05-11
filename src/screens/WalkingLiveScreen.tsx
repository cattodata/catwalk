import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { X, MoreHorizontal, Check, CloudRain, Cloud } from 'lucide-react'
import type { Shop } from '../types/shop'

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

  // Restore selected shop from sessionStorage (set by Walker Home Start CTA)
  const [shop, setShop] = useState<Shop | null>(null)
  useEffect(() => {
    const id = sessionStorage.getItem('cc:selectedShopId')
    if (!id || !shops.length) return
    setShop(shops.find((s) => s.id === id) ?? shops[0])
  }, [shops])

  // Real GPS during walk; if denied/unavailable, useWalkSession falls back to demo RAF.
  const geo = useGeolocation(true)
  const session = useWalkSession({
    shop,
    transport: 'walk',
    position: geo.position,
    userId: auth.user?.id ?? null,
    demoMode: !geo.position, // auto demo if no real GPS
  })

  // Auto-start on mount once shop loaded
  useEffect(() => {
    if (shop && session.phase === 'idle') session.start()
  }, [shop, session])

  // Fire confirmArrival once when phase flips to 'arrived'
  useEffect(() => {
    if (session.phase === 'arrived' && shop) {
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
        }),
      )
      const t = setTimeout(() => navigate('/walk/reward'), 400)
      return () => clearTimeout(t)
    }
  }, [session.phase, session.rewardSummary, session.isVerifiedGps, shop, navigate])

  const totalMeters = shop?.dist ?? 480
  const metersLeft = Math.round(totalMeters * (1 - session.progress))
  const minsLeft = Math.max(1, Math.round((metersLeft / 80)))

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
        <button type="button" className="cc-icon-btn" aria-label="More">
          <MoreHorizontal size={16} strokeWidth={2.2} aria-hidden="true" />
        </button>
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
