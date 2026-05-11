import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Shop, TransportId } from '../types/shop'

import { AppBarLockup } from '../components/AppBarLockup'
import { TierRibbon } from '../components/TierRibbon'
import { BottomNav } from '../components/BottomNav'
import { MapPulseChip } from '../components/MapPulseChip'
import { MapFab } from '../components/MapFab'
import { GeoStatus } from '../components/GeoStatus'
import { SmartPickCta } from '../components/SmartPickCta'
import { ShopMiniRail } from '../components/ShopMini'
import { TransportModesRow } from '../components/TransportModesRow'
import { ShopDetailSheet } from '../components/ShopDetailSheet'
import { RealMap } from '../components/RealMap'

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
  const { shops } = useRealShops()
  const { weather } = useWeather()
  const geo = useGeolocation(true) // try real GPS; falls back to demo coords if denied
  const auth = useSupabaseAuth()
  const { total_co2 } = useUserStats(auth.user?.id ?? null)
  const tier = tierFromCo2(total_co2)
  const tierLevel = tier.id === 'sprout' ? 1 : tier.id === 'bronze' ? 2 : tier.id === 'silver' ? 3 : 4
  const tierPct = tier.next != null ? Math.round(((total_co2 - tier.min) / (tier.next - tier.min)) * 100) : 100
  const todayEvent = getTodayEvent(now)

  const [selectedShop, setSelectedShop] = useState<Shop | null>(null)
  const [transport, setTransport] = useState<TransportId>('walk')
  const [recenterNonce, setRecenterNonce] = useState(0)
  const geoPermission: 'granted' | 'prompt' | 'denied' | 'unknown' = geo.error
    ? 'denied'
    : geo.position
      ? 'granted'
      : geo.isSupported ? 'prompt' : 'unknown'

  const railShops = useMemo(() => shops.slice(0, 4), [shops])

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
    if (smart) setSelectedShop(smart.shop)
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
      <TierRibbon tierLevel={tierLevel} tierName="Walker" progressPct={tierPct} kgSaved={total_co2} />
      <div className="cc-geo-row">
        <GeoStatus permission={geoPermission} accuracy={geo.position?.accuracy ?? null} />
      </div>

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
        <div className="cc-map-overlays">
          <MapPulseChip>
            {selectedShop ? `ROUTE READY · ${Math.max(1, Math.round(selectedShop.dist / 80))} MIN` : `${shopsCount || '…'} SHOPS OPEN`}
          </MapPulseChip>
        </div>
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
            <SmartPickCta subtext={smartSubtext} onClick={onSmartPick} />
            {railShops.length > 0 && <ShopMiniRail shops={railShops} onSelect={(s) => setSelectedShop(s)} />}
            <TransportModesRow active={transport} onChange={setTransport} walkMin={smart ? Math.max(1, Math.round(smart.shop.dist / 75)) : undefined} />
          </>
        )}
      </section>

      <BottomNav />
    </div>
  )
}
