import { useEffect, useMemo } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet.markercluster'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'
import type { Shop, CuisineId, ShopTag, TransportId } from '../types/shop'
import { CHATSWOOD } from '../config/chatswood'
import { Catto } from './Catto'
import { renderToStaticMarkup } from 'react-dom/server'
import type { GeoPosition } from '../hooks/useGeolocation'

interface RealMapProps {
  shops: Shop[]
  selectedShop: Shop | null
  walkProgress: number | null
  walking: boolean
  completed: boolean
  onSelect: (shop: Shop) => void
  cuisineFilter?: CuisineId
  tagFilter?: ShopTag[]
  showHeatmap?: boolean
  transport?: TransportId
  userPosition?: GeoPosition | null
  /** Increment this number to re-aim the map at the user (or station fallback). */
  recenterNonce?: number
}

/** Build a Leaflet DivIcon from any inline HTML string (no missing-icon issue) */
function makeShopIcon(shop: Shop, selected: boolean) {
  const color = shop.mult === 3 ? '#FF6B9D' : shop.mult === 2 ? '#F5C842' : '#5B9BD5'
  const html = `
    <div class="cc-leaf-pin ${selected ? 'is-selected' : ''}" style="--pin-c:${color}">
      <div class="cc-leaf-pin-bubble">
        <span class="cc-leaf-pin-emoji">${shop.emoji}</span>
        ${shop.mult >= 2 ? `<span class="cc-leaf-pin-mult">${shop.mult}×</span>` : ''}
      </div>
      <div class="cc-leaf-pin-tail"></div>
    </div>
  `
  return L.divIcon({
    html,
    className: 'cc-leaf-pin-wrap',
    iconSize: [44, 56],
    iconAnchor: [22, 52],
    popupAnchor: [0, -50],
  })
}

const stationIcon = L.divIcon({
  html: `<div class="cc-leaf-station"><div class="cc-leaf-station-inner">M</div></div>`,
  className: 'cc-leaf-station-wrap',
  iconSize: [44, 44],
  iconAnchor: [22, 22],
})

function makeCattoIcon(state: 'idle' | 'walking' | 'cheering' | 'thinking', dir: 1 | -1) {
  const html = renderToStaticMarkup(<Catto scale={1.6} state={state} dir={dir} />)
  return L.divIcon({
    html: `<div class="cc-leaf-catto">${html}</div>`,
    className: 'cc-leaf-catto-wrap',
    iconSize: [40, 36],
    iconAnchor: [20, 36],
  })
}

const userIcon = L.divIcon({
  html: `<div class="cc-leaf-user"><div class="cc-leaf-user-pulse"></div><div class="cc-leaf-user-dot"></div></div>`,
  className: 'cc-leaf-user-wrap',
  iconSize: [22, 22],
  iconAnchor: [11, 11],
})

/**
 * Cluster shop markers — solves "60 pins overlapping" problem.
 * When zoomed out, nearby pins merge into a single bubble showing count.
 * Click cluster to zoom in and split.
 */
function ShopClusterLayer({
  shops,
  selectedShop,
  cuisineFilter,
  tagFilter,
  onSelect,
}: {
  shops: Shop[]
  selectedShop: Shop | null
  cuisineFilter: CuisineId
  tagFilter: ShopTag[]
  onSelect: (s: Shop) => void
}) {
  const map = useMap()

  useEffect(() => {
    const cluster = L.markerClusterGroup({
      showCoverageOnHover: false,
      spiderfyOnMaxZoom: true,
      removeOutsideVisibleBounds: false,
      maxClusterRadius: 60,
      iconCreateFunction: (c: L.MarkerCluster) => {
        const count = c.getChildCount()
        const size = count < 10 ? 36 : count < 30 ? 44 : 52
        return L.divIcon({
          html: `<div class="cc-cluster"><span>${count}</span></div>`,
          className: 'cc-cluster-wrap',
          iconSize: [size, size],
        })
      },
    })

    for (const s of shops) {
      if (!s.lat || !s.lng) continue
      const cuisineMatch = cuisineFilter === 'all' || s.cuisine === cuisineFilter
      const tagMatch = !tagFilter.length || tagFilter.every((t) => s.tags.includes(t))
      if (!cuisineMatch || !tagMatch) continue
      const m = L.marker([s.lat, s.lng], {
        icon: makeShopIcon(s, selectedShop?.id === s.id),
        // Larger touch keepInView on mobile; default 7px tolerance is too tight
        riseOnHover: true,
        keyboard: false,
      })
      // No bindPopup — the bottom sheet (ShopDetailSheet) handles details.
      // Popups + cluster + flyTo all fighting for the same gesture caused the
      // "bouncing, can't tap" feel on mobile (Issue: map marker tap).
      m.on('click', () => onSelect(s))
      cluster.addLayer(m)
    }

    map.addLayer(cluster)
    return () => {
      map.removeLayer(cluster)
    }
  }, [shops, selectedShop, cuisineFilter, tagFilter, onSelect, map])

  return null
}

/** Pan map to selected shop when it changes */
function FlyToShop({ shop }: { shop: Shop | null }) {
  const map = useMap()
  useEffect(() => {
    if (shop?.lat && shop?.lng) {
      map.flyTo([shop.lat, shop.lng], 17, { duration: 0.7 })
    }
  }, [shop, map])
  return null
}

/** Recenter to user (or station fallback) when the nonce changes */
function RecenterOnNonce({ nonce, user }: { nonce: number | undefined; user: GeoPosition | null }) {
  const map = useMap()
  useEffect(() => {
    if (nonce === undefined) return
    if (user) {
      map.flyTo([user.lat, user.lng], 17, { duration: 0.6 })
    } else {
      map.flyTo([CHATSWOOD.station.lat, CHATSWOOD.station.lng], 16, { duration: 0.6 })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nonce])
  return null
}

/**
 * Auto-fit map to include both Chatswood and user position (if user is far away).
 * Useful for users at e.g. Macquarie Park (~5km away) so they can see the whole journey.
 */
function FitToUser({ userPosition, hasShop }: { userPosition: GeoPosition | null; hasShop: boolean }) {
  const map = useMap()
  useEffect(() => {
    if (!userPosition || hasShop) return
    const userLatLng = L.latLng(userPosition.lat, userPosition.lng)
    const stationLatLng = L.latLng(CHATSWOOD.station.lat, CHATSWOOD.station.lng)
    const dist = userLatLng.distanceTo(stationLatLng)
    if (dist > 1500) {
      // Far away — fit both into view
      const bounds = L.latLngBounds([userLatLng, stationLatLng])
      map.fitBounds(bounds, { padding: [60, 60], maxZoom: 14 })
    }
  }, [userPosition, hasShop, map])
  return null
}

export function RealMap({
  shops,
  selectedShop,
  walkProgress,
  walking,
  completed,
  onSelect,
  cuisineFilter = 'all',
  tagFilter = [],
  showHeatmap = false,
  userPosition,
  recenterNonce,
}: RealMapProps) {
  const center: [number, number] = [CHATSWOOD.station.lat, CHATSWOOD.station.lng]

  const cattoLatLng = useMemo<[number, number]>(() => {
    if (!selectedShop?.lat || !selectedShop?.lng) return center
    if (walkProgress == null) return center
    const t = Math.min(1, Math.max(0, walkProgress))
    return [
      center[0] + (selectedShop.lat - center[0]) * t,
      center[1] + (selectedShop.lng - center[1]) * t,
    ]
  }, [selectedShop, walkProgress, center])

  const cattoState = completed ? 'cheering' : walking ? 'walking' : selectedShop ? 'thinking' : 'idle'
  const cattoDir: 1 | -1 = selectedShop?.lng && selectedShop.lng > center[1] ? 1 : -1

  return (
    <div className="cc-leaf-card">
      <MapContainer
        center={center}
        zoom={16}
        scrollWheelZoom={false}
        className="cc-leaf-map"
        attributionControl={true}
      >
        {/* Azure Maps — microsoft.base.road style (Google-Maps-like). Falls back to OSM if no key. */}
        {import.meta.env.VITE_AZURE_MAPS_KEY ? (
          <TileLayer
            url={`https://atlas.microsoft.com/map/tile?subscription-key=${import.meta.env.VITE_AZURE_MAPS_KEY}&api-version=2.1&tilesetId=microsoft.base.road&zoom={z}&x={x}&y={y}&tileSize=256&language=en-AU&view=Auto`}
            attribution='&copy; <a href="https://learn.microsoft.com/en-us/azure/azure-maps/legal-terms">Microsoft</a> &copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; TomTom'
            maxZoom={20}
          />
        ) : (
          <TileLayer
            url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            maxZoom={19}
          />
        )}

        <FlyToShop shop={selectedShop} />
        <FitToUser userPosition={userPosition ?? null} hasShop={!!selectedShop} />
        <RecenterOnNonce nonce={recenterNonce} user={userPosition ?? null} />

        {/* Station */}
        <Marker position={center} icon={stationIcon}>
          <Popup>
            <b>Chatswood Station</b>
            <br />
            ~47.8K daily Opal taps (TfNSW)
          </Popup>
        </Marker>

        {/* Geofence circle around selected shop */}
        {selectedShop?.lat && selectedShop?.lng && (
          <Circle
            center={[selectedShop.lat, selectedShop.lng]}
            radius={CHATSWOOD.geofence_m}
            pathOptions={{
              color: '#FF6B9D',
              fillColor: '#FF6B9D',
              fillOpacity: 0.08,
              weight: 1.5,
              dashArray: '6 4',
            }}
          />
        )}

        {/* User geolocation */}
        {userPosition && (
          <Marker position={[userPosition.lat, userPosition.lng]} icon={userIcon}>
            <Popup>
              <b>You are here</b>
              <br />
              accuracy ~{Math.round(userPosition.accuracy)}m
            </Popup>
          </Marker>
        )}

        {/* Heatmap predicted blobs */}
        {showHeatmap && (
          <>
            <Circle center={center} radius={120} pathOptions={{ color: '#FF6B9D', fillColor: '#FF6B9D', fillOpacity: 0.18, weight: 0 }} />
            <Circle center={[-33.79520, 151.18000]} radius={90} pathOptions={{ color: '#F5C842', fillColor: '#F5C842', fillOpacity: 0.15, weight: 0 }} />
            <Circle center={[-33.79430, 151.18250]} radius={100} pathOptions={{ color: '#FF6B9D', fillColor: '#FF6B9D', fillOpacity: 0.14, weight: 0 }} />
          </>
        )}

        {/* Shop pins — clustered to fix 60-pin overlap problem */}
        <ShopClusterLayer
          shops={shops}
          selectedShop={selectedShop}
          cuisineFilter={cuisineFilter}
          tagFilter={tagFilter}
          onSelect={onSelect}
        />

        {/* Walk route polyline */}
        {selectedShop?.lat && selectedShop?.lng && (
          <Polyline
            positions={[center, [selectedShop.lat, selectedShop.lng]]}
            pathOptions={{
              color: walking || completed ? '#FF6B9D' : '#FF6B9D',
              weight: walking ? 5 : completed ? 5 : 3,
              opacity: walking || completed ? 0.85 : 0.4,
              dashArray: walking || completed ? undefined : '8 6',
            }}
          />
        )}

        {/* Catto on the move */}
        {selectedShop && (
          <Marker position={cattoLatLng} icon={makeCattoIcon(cattoState, cattoDir)} interactive={false} />
        )}
      </MapContainer>
    </div>
  )
}
