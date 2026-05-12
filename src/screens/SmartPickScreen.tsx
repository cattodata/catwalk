import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight } from 'lucide-react'

import { CattoPill } from '../components/CattoPill'
import { useRealShops } from '../hooks/useRealShops'
import { useGooglePlaces } from '../hooks/useGooglePlaces'
import { useWeather } from '../hooks/useWeather'
import { useNow } from '../hooks/useNow'
import { smartPick } from '../lib/smartPick'

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

  const { shop, reasons } = pick
  const walkMin = Math.max(1, Math.round(shop.dist / 80))
  const treatDollars = +(shop.off * 0.35).toFixed(2)

  // Build a single prose insight from the highest-impact reason
  const quote = useMemo(() => {
    const rainBonus = reasons.find((r) => r.includes('rainy'))
    if (rainBonus && weather?.isRain) {
      return (
        <>
          It's <mark>raining soon</mark> — grab a warm pastry on the way to work.
        </>
      )
    }
    const hot = reasons.find((r) => r.includes('hot'))
    if (hot) {
      return (
        <>
          It's a <mark>hot one</mark> — cold drinks at {shop.name} are tracking +20%.
        </>
      )
    }
    const morn = reasons.find((r) => r.includes('morning'))
    if (morn) {
      return (
        <>
          <mark>Morning</mark> bakery peak. Fresh pastry timing — beat the queue at {shop.name}.
        </>
      )
    }
    const lunch = reasons.find((r) => r.includes('lunch'))
    if (lunch) {
      return (
        <>
          <mark>Lunch peak</mark> — restaurants like {shop.name} are humming right now.
        </>
      )
    }
    const arvo = reasons.find((r) => r.includes('arvo'))
    if (arvo) {
      return (
        <>
          <mark>Afternoon slump</mark> — a coffee at {shop.name} fixes that.
        </>
      )
    }
    const evening = reasons.find((r) => r.includes('PM commute'))
    if (evening) {
      return (
        <>
          <mark>Evening commute</mark> peak — dinner at {shop.name} pairs with the walk home.
        </>
      )
    }
    // fallback — multiplier-driven
    return (
      <>
        {shop.name} hits <mark>{shop.mult}× points</mark> right now — best ROI on the map.
      </>
    )
  }, [reasons, weather, shop.name, shop.mult])

  const onStart = () => {
    sessionStorage.setItem('cc:selectedShopId', shop.id)
    sessionStorage.setItem('cc:transport', 'walk')
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
            {now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })} · CHATSWOOD
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
          <div className="cc-pick-stat-l">WALK</div>
        </div>
        <div>
          <div className="cc-pick-stat-v">+{shop.pts} pts</div>
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
