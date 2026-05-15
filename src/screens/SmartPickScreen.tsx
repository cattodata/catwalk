import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight } from 'lucide-react'

import { CattoPill } from '../components/CattoPill'
import { useRealShops } from '../hooks/useRealShops'
import { useGooglePlaces } from '../hooks/useGooglePlaces'
import { useWeather } from '../hooks/useWeather'
import { useNow } from '../hooks/useNow'
import { smartPick } from '../lib/smartPick'
import { TRANSPORT } from '../data/shops'
import type { TransportId } from '../types/shop'

const MODE_LABEL: Record<TransportId, string> = {
  walk: 'WALK',
  bike: 'BIKE',
  scoot: 'SCOOT',
  bus: 'TRAIN',
  ev: 'EV',
}

/**
 * v5.5 "Smart pick · 1 quote" full-bleed destination page.
 * Hero card with product · 1 prose quote · 3 stats · dark CTA.
 */
export function SmartPickScreen() {
  const navigate = useNavigate()
  const now = useNow(60_000)
  const { shops: rawShops } = useRealShops()
  const shops = useGooglePlaces(rawShops)
  const { weather } = useWeather()
  const hour = now.getHours()

  const overrideId = typeof window !== 'undefined' ? sessionStorage.getItem('cc:smartPickShopId') : null
  const auto = useMemo(() => smartPick(shops, weather, hour), [shops, weather, hour])
  const pick = useMemo(() => {
    if (overrideId) {
      const s = shops.find((x) => x.id === overrideId)
      if (s) return { shop: s, reasons: auto?.reasons ?? [] }
    }
    return auto
  }, [overrideId, shops, auto])

  if (!pick) {
    return (
      <div className="cc-pick-screen">
        <header className="cc-pick-bar">
          <button
            type="button"
            className="cc-pick-back"
            aria-label="Back"
            onClick={() => navigate('/walk')}
          >
            <ArrowLeft size={18} strokeWidth={2.4} />
          </button>
          <div className="cc-pick-bar-title">
            <span className="cc-pick-bar-h">Today's pick</span>
            <span className="cc-pick-bar-sub">Finding the best…</span>
          </div>
        </header>
        <div className="cc-pick-empty">Loading…</div>
      </div>
    )
  }

  const { shop } = pick
  const baseWalkMin = Math.max(1, Math.round(shop.dist / 80))
  const transportId = (typeof window !== 'undefined'
    ? (sessionStorage.getItem('cc:transport') as TransportId | null)
    : null) ?? 'walk'
  const transportEntry = TRANSPORT.find((t) => t.id === transportId) ?? TRANSPORT[0]
  const walkMin = Math.max(1, Math.round(baseWalkMin * transportEntry.speed))
  const modeLabel = MODE_LABEL[transportId] ?? 'WALK'
  const treatDollars = +(shop.off * 0.35).toFixed(2)
  const earnedPts = Math.round(shop.pts * transportEntry.ptsMult)

  // Build a single prose insight — gated by shop category so the copy never
  // contradicts the picked shop (e.g. "warm pastry" when the pick is bubble tea).
  const quote = useMemo(() => {
    const isBakery = shop.type === 'Bakery' || shop.cuisine === 'Sweets'
    const isCafe = shop.type === 'Cafe'
    const isRestaurant = shop.type === 'Restaurant'
    const isDrinks = shop.cuisine === 'Drinks'

    if (weather?.isRain) {
      if (isBakery) return <>It's <mark>raining soon</mark> — grab a warm pastry on the way.</>
      if (isCafe) return <>It's <mark>raining soon</mark> — duck inside for a warm cup.</>
      if (isDrinks) return <>It's <mark>raining soon</mark> — chase the chill with a hot bubble tea.</>
      if (isRestaurant) return <>It's <mark>raining soon</mark> — beat the rush, eat inside.</>
    }
    if (weather?.isHot && isDrinks) {
      return <>It's a <mark>hot one</mark> — cold drinks at {shop.name} are tracking +20%.</>
    }
    if (hour >= 7 && hour <= 10 && isBakery) {
      return <><mark>Morning</mark> bakery peak — beat the queue at {shop.name}.</>
    }
    if (hour >= 11 && hour <= 13 && isRestaurant) {
      return <><mark>Lunch peak</mark> — {shop.name} is humming right now.</>
    }
    if (hour >= 14 && hour <= 16 && isCafe) {
      return <><mark>Afternoon slump</mark> — a coffee at {shop.name} fixes that.</>
    }
    if (hour >= 17 && hour <= 20 && isRestaurant) {
      return <><mark>Evening commute</mark> peak — dinner at {shop.name} pairs with the walk home.</>
    }
    // fallback — multiplier-driven, always safe
    return <>{shop.name} hits <mark>{shop.mult}× points</mark> right now — best ROI on the map.</>
  }, [weather, hour, shop])

  const onStart = () => {
    sessionStorage.setItem('cc:selectedShopId', shop.id)
    if (!sessionStorage.getItem('cc:transport')) sessionStorage.setItem('cc:transport', 'walk')
    sessionStorage.removeItem('cc:smartPickShopId')
    navigate('/walk/live')
  }

  return (
    <div className="cc-pick-screen">
      <header className="cc-pick-bar">
        <button
          type="button"
          className="cc-pick-back"
          aria-label="Back"
          onClick={() => navigate('/walk')}
        >
          <ArrowLeft size={18} strokeWidth={2.4} />
        </button>
        <div className="cc-pick-bar-title">
          <span className="cc-pick-bar-h">Today's pick</span>
          <span className="cc-pick-bar-sub">
            {hour < 6 ? 'Late night' : hour < 11 ? 'Morning' : hour < 14 ? 'Lunch' : hour < 17 ? 'Arvo' : 'Evening'} · CHATSWOOD
          </span>
        </div>
      </header>

      <div className="cc-pick-hero">
        <CattoPill tone="dark">CATTO PICKED</CattoPill>
        <h2 className="cc-pick-name">{shop.name}</h2>
        <div className="cc-pick-emoji" aria-hidden="true">{shop.emoji}</div>
      </div>

      <p className="cc-pick-quote">{quote}</p>

      <div className="cc-pick-stats">
        <div>
          <div className="cc-pick-stat-v">{walkMin} min</div>
          <div className="cc-pick-stat-l">{modeLabel}</div>
        </div>
        <div>
          <div className="cc-pick-stat-v">+{earnedPts} pts</div>
          <div className="cc-pick-stat-l">TREAT</div>
        </div>
        <div>
          <div className="cc-pick-stat-v">${treatDollars.toFixed(2)}</div>
          <div className="cc-pick-stat-l">TODAY</div>
        </div>
      </div>

      <button type="button" className="cc-pick-cta" onClick={onStart}>
        <span>Walk me there</span>
        <ArrowRight size={16} strokeWidth={2.4} />
      </button>
    </div>
  )
}
