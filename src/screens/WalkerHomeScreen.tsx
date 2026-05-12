import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Shop, TransportId, CuisineId } from '../types/shop'

import { AppBarLockup } from '../components/AppBarLockup'
import { BottomNav } from '../components/BottomNav'
import { TierRibbon } from '../components/TierRibbon'
import { MapFab } from '../components/MapFab'
import { MapPulseChip } from '../components/MapPulseChip'
import { SmartPickCta } from '../components/SmartPickCta'
import { ShopMiniRail } from '../components/ShopMini'
import { ShopDetailSheet } from '../components/ShopDetailSheet'
import { CuisineRow } from '../components/CuisineRow'
import { ShopSearchBar, type SortBy } from '../components/ShopSearchBar'
import { PlanBasketPill } from '../components/PlanBasketPill'
import { PlanBasketToast } from '../components/PlanBasketToast'
import { RealMap } from '../components/RealMap'

import { usePlanBasket } from '../hooks/usePlanBasket'
import { planBasket } from '../lib/planBasket'
import { useGooglePlaces } from '../hooks/useGooglePlaces'
import { useRealShops } from '../hooks/useRealShops'
import { useWeather } from '../hooks/useWeather'
import { useGeolocation } from '../hooks/useGeolocation'
import { useUserStats } from '../hooks/useUserStats'
import { useSupabaseAuth } from '../hooks/useSupabaseAuth'
import { useNow } from '../hooks/useNow'
import { smartPick } from '../lib/smartPick'
import { tierFromCo2 } from '../data/tiers'
import { getTodayEvent } from '../data/events'

export function WalkerHomeScreen() {
  const navigate = useNavigate()
  const now = useNow(60_000)
  const { shops: rawShops } = useRealShops()
  const shops = useGooglePlaces(rawShops)
  const { weather } = useWeather()
  const geo = useGeolocation(true)
  const auth = useSupabaseAuth()
  const { total_co2 } = useUserStats(auth.user?.id ?? null)
  const tier = tierFromCo2(total_co2)
  const tierLevel = tier.id === 'sprout' ? 1 : tier.id === 'bronze' ? 2 : tier.id === 'silver' ? 3 : 4
  const tierPct = tier.next != null ? Math.round(((total_co2 - tier.min) / (tier.next - tier.min)) * 100) : 100
  const todayEvent = getTodayEvent(now)

  const [selectedShop, setSelectedShop] = useState<Shop | null>(null)
  const [transport, setTransport] = useState<TransportId>('walk')
  const [recenterNonce, setRecenterNonce] = useState(0)
  const [cuisine, setCuisine] = useState<CuisineId>('all')
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<SortBy>('distance')
  const basketIds = usePlanBasket()

  const onTogglePlan = (s: Shop) => {
    if (basketIds.includes(s.id)) planBasket.remove(s.id)
    else planBasket.add(s.id)
  }

  const filteredShops = useMemo(() => {
    if (cuisine === 'all') return shops
    if (cuisine === 'Sweets') {
      const SWEET_NAME = /(bakery|patisserie|cake|cakery|dessert|sweet|donut|doughnut|gelato|ice ?cream|chocolate|cookie|crois|honor|pastry|tart)/i
      const SWEET_EMOJI = ['🥐', '🍩', '🍰', '🧁', '🍪', '🍫', '🍦']
      const matches = shops.filter(
        (s) =>
          s.cuisine === 'Sweets' ||
          s.type === 'Bakery' ||
          SWEET_NAME.test(s.name) ||
          SWEET_EMOJI.includes(s.emoji),
      )
      return matches.length > 0 ? matches : shops.filter((s) => s.type === 'Cafe')
    }
    return shops.filter((s) => s.cuisine === cuisine)
  }, [shops, cuisine])

  const searchedShops = useMemo(() => {
    const q = search.trim().toLowerCase()
    return q ? filteredShops.filter((s) => s.name.toLowerCase().includes(q)) : filteredShops
  }, [filteredShops, search])

  const railShops = useMemo(() => {
    const arr = [...searchedShops]
    if (sortBy === 'rating') arr.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
    else if (sortBy === 'points') arr.sort((a, b) => b.pts - a.pts)
    else arr.sort((a, b) => a.dist - b.dist)
    return arr
  }, [searchedShops, sortBy])

  const hour = now.getHours()
  const smart = useMemo(() => smartPick(shops, weather, hour), [shops, weather, hour])

  const smartSubtext = useMemo(() => {
    if (!smart) return 'Finding the best pick…'
    const bits: string[] = [`${smart.shop.mult}× points`]
    if (weather?.isRain) bits.push('indoor pick')
    else if (smart.shop.tags?.includes('Late-night') && hour >= 18) bits.push('open late')
    else if (hour >= 17) bits.push('great for tonight')
    return `${bits.join(' · ')} · ${smart.shop.name}`
  }, [smart, weather, hour])

  const onSmartPick = () => {
    if (!smart) return
    // v5.5: route to the dedicated "1 quote" page instead of opening inline sheet
    sessionStorage.setItem('cc:smartPickShopId', smart.shop.id)
    navigate('/walk/pick')
  }

  const onStartWalk = () => {
    if (!selectedShop) return
    sessionStorage.setItem('cc:selectedShopId', selectedShop.id)
    sessionStorage.setItem('cc:transport', transport)
    navigate('/walk/live')
  }

  const conditionRow = useMemo(() => {
    const parts: string[] = []
    if (weather) parts.push(`${Math.round(weather.temp)}°C · ${weather.label}`)
    else parts.push('Live conditions')
    if (todayEvent) parts.push(`${todayEvent.title} @ ${todayEvent.window?.split('-')[0] ?? 'today'}`)
    return parts.join('  ·  ')
  }, [weather, todayEvent])

  const shopsCount = shops.length

  return (
    <div className="cc-walker">
      <AppBarLockup />
      <TierRibbon
        tierLevel={tierLevel}
        tierName="Walker"
        progressPct={tierPct}
        kgSaved={total_co2}
      />

      <div className="cc-walker-map" aria-label="Chatswood map">
        <RealMap
          shops={shops}
          selectedShop={selectedShop}
          walkProgress={null}
          walking={false}
          completed={false}
          onSelect={(s) => setSelectedShop(s)}
          userPosition={geo.position}
          recenterNonce={recenterNonce}
        />
        {smart && !selectedShop && (
          <button
            type="button"
            className="cc-walker-ribbon"
            onClick={onSmartPick}
          >
            <span className="cc-walker-ribbon-dot" aria-hidden="true" />
            <span className="cc-walker-ribbon-txt">
              <b>Catto picked one</b> · {smart.shop.name}, {Math.max(1, Math.round(smart.shop.dist / 75))} min
            </span>
            <span className="cc-walker-ribbon-arr" aria-hidden="true">›</span>
          </button>
        )}
        {/* Show pulse chip only when the Catto ribbon isn't already up (mobile audit M1) */}
        {(!smart || selectedShop) && (
          <div className="cc-map-overlays">
            <MapPulseChip tone="sage">
              {selectedShop
                ? `ROUTE READY · ${Math.max(1, Math.round(selectedShop.dist / 80))} MIN`
                : `${shopsCount || '…'} SHOPS OPEN`}
            </MapPulseChip>
          </div>
        )}
        <MapFab onRecenter={() => setRecenterNonce((n) => n + 1)} />
      </div>

      <section className="cc-sheet" aria-label="Where to today">
        <span className="cc-sheet-grab" aria-hidden="true" />
        {selectedShop ? (
          <ShopDetailSheet
            shop={selectedShop}
            transport={transport}
            onTransport={setTransport}
            onStart={onStartWalk}
            onBack={() => setSelectedShop(null)}
          />
        ) : (
          <>
            <h4 className="cc-sheet-h4">Where to today?</h4>
            {conditionRow && <div className="cc-sheet-cond">{conditionRow}</div>}
            <SmartPickCta subtext={smartSubtext} reasons={smart?.reasons} onClick={onSmartPick} />
            <CuisineRow active={cuisine} onChange={setCuisine} />
            <ShopSearchBar
              query={search}
              onQueryChange={setSearch}
              sortBy={sortBy}
              onSortChange={setSortBy}
            />
            {railShops.length > 0 ? (
              <ShopMiniRail
                shops={railShops}
                onSelect={(s) => setSelectedShop(s)}
                onAdd={onTogglePlan}
                pickedIds={basketIds}
              />
            ) : (
              <div className="cc-empty-row">
                {search.trim()
                  ? `No shops match "${search}". Try a different name or clear search.`
                  : `No ${cuisine === 'all' ? 'shops' : cuisine.toLowerCase()} nearby. Try a different filter.`}
              </div>
            )}
          </>
        )}
      </section>

      <PlanBasketToast />
      <PlanBasketPill shops={shops} />
      <BottomNav />
    </div>
  )
}
