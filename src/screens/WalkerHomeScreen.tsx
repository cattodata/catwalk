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

  const top3 = useMemo(() => shops.slice(0, 3), [shops])
  const railShops = useMemo(() => top3.slice(0, 2), [top3])

  const smart = useMemo(() => smartPick(shops, weather, now.getHours()), [shops, weather, now])
  const smartSubtext = useMemo(() => {
    if (!smart) return 'Pick a shop on the map'
    const tags: string[] = [`${smart.shop.mult}×`]
    if (weather?.isRain) tags.push('beat the rain')
    if (smart.shop.tags?.includes('Late-night')) tags.push('open late')
    if (now.getHours() >= 17) tags.push('peak window')
    if (tags.length < 3) tags.push(smart.shop.name)
    return tags.slice(0, 3).join(' · ')
  }, [smart, weather, now])

  const onSmartPick = () => {
    if (smart) setSelectedShop(smart.shop)
  }

  const onStartWalk = () => {
    if (!selectedShop) return
    sessionStorage.setItem('cc:selectedShopId', selectedShop.id)
    navigate('/walk/live')
  }

  const conditionRow = useMemo(() => {
    const parts: string[] = []
    if (weather) parts.push(`${Math.round(weather.temp)} °C · ${weather.label.toUpperCase()}`)
    if (todayEvent) parts.push(`${todayEvent.title.toUpperCase()} @ ${todayEvent.window?.split('-')[0] ?? 'TODAY'}`)
    return parts.join(' · ')
  }, [weather, todayEvent])

  const shopsCount = shops.length

  return (
    <div className="cc-walker">
      <AppBarLockup hasUnread />
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
            <TransportModesRow active={transport} onChange={setTransport} />
          </>
        )}
      </section>

      <BottomNav />
    </div>
  )
}
