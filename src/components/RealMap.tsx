import { useEffect, useMemo } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
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
        style={{ width: '100%', height: 520, borderRadius: 16 }}
        attributionControl={true}
      >
        {/* CartoDB Positron — clean light tiles, no API key required */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
          subdomains="abcd"
          maxZoom={20}
        />

        <FlyToShop shop={selectedShop} />

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

        {/* Shop pins */}
        {shops.map((s) => {
          if (!s.lat || !s.lng) return null
          const cuisineMatch = cuisineFilter === 'all' || s.cuisine === cuisineFilter
          const tagMatch = !tagFilter.length || tagFilter.every((t) => s.tags.includes(t))
          if (!(cuisineMatch && tagMatch)) return null
          return (
            <Marker
              key={s.id}
              position={[s.lat, s.lng]}
              icon={makeShopIcon(s, selectedShop?.id === s.id)}
              eventHandlers={{ click: () => onSelect(s) }}
            >
              <Popup>
                <b>
                  {s.emoji} {s.name}
                </b>
                <br />
                {s.type} · {s.dist}m walk · {s.mult}× pts
                <br />
                <small>{s.street}</small>
              </Popup>
            </Marker>
          )
        })}

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
