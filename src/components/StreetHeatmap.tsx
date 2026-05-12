import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet.heat'

// Chatswood center
const CENTER: [number, number] = [-33.7969, 151.1832]

// Synthetic walk-density points along boosted streets (Victoria/Help/Spring
// heavy; Pacific Hwy = control = sparse). Each tuple [lat, lng, intensity].
const HEAT_POINTS: Array<[number, number, number]> = [
  // Victoria Ave — boosted, very hot
  ...Array.from({ length: 18 }, (_, i): [number, number, number] => [
    -33.7965 + (i - 9) * 0.0002,
    151.1832 + i * 0.00008,
    0.95,
  ]),
  // Help St — mid
  ...Array.from({ length: 10 }, (_, i): [number, number, number] => [
    -33.7977 + i * 0.0001,
    151.1820 - (i - 5) * 0.00012,
    0.65,
  ]),
  // Spring St — boosted, hot
  ...Array.from({ length: 14 }, (_, i): [number, number, number] => [
    -33.7958 - i * 0.00014,
    151.1845 + (i - 7) * 0.0001,
    0.85,
  ]),
  // Albert Ave — moderate
  ...Array.from({ length: 8 }, (_, i): [number, number, number] => [
    -33.7990 - i * 0.00006,
    151.1838 + (i - 4) * 0.0001,
    0.5,
  ]),
  // Pacific Hwy — control, sparse
  ...Array.from({ length: 5 }, (_, i): [number, number, number] => [
    -33.7935 + i * 0.0007,
    151.1815,
    0.15,
  ]),
]

const LABELS = [
  { lat: -33.7968, lng: 151.1828, text: 'Victoria Ave · +312%', tone: 'hot' as const },
  { lat: -33.7951, lng: 151.1852, text: 'Spring St · +247%', tone: 'hot' as const },
  { lat: -33.7938, lng: 151.1818, text: 'Pacific Hwy · control', tone: 'control' as const },
]

interface LayerWithHeat {
  setLatLngs: (pts: Array<[number, number, number]>) => unknown
  addTo: (map: L.Map) => unknown
  remove: () => void
}

interface LeafletWithHeat {
  heatLayer: (
    points: Array<[number, number, number]>,
    opts: Record<string, unknown>,
  ) => LayerWithHeat
}

/**
 * Mini Leaflet heatmap (200px) showing walk density on Chatswood streets.
 * Static synthetic data; ready to swap to real Supabase walk-session
 * GPS points when env wired.
 */
export function StreetHeatmap() {
  const elRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<L.Map | null>(null)

  useEffect(() => {
    if (!elRef.current || mapRef.current) return
    const map = L.map(elRef.current, {
      center: CENTER,
      zoom: 16,
      zoomControl: false,
      scrollWheelZoom: false,
      dragging: false,
      doubleClickZoom: false,
      touchZoom: false,
      keyboard: false,
      attributionControl: false,
    })
    mapRef.current = map

    const key = import.meta.env.VITE_AZURE_MAPS_KEY as string | undefined
    if (key) {
      L.tileLayer(
        `https://atlas.microsoft.com/map/tile?subscription-key=${key}&api-version=2.1&tilesetId=microsoft.base.road&zoom={z}&x={x}&y={y}&tileSize=256&language=en-AU&view=Auto`,
        { maxZoom: 20 },
      ).addTo(map)
    } else {
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map)
    }

    const heat = (L as unknown as LeafletWithHeat).heatLayer(HEAT_POINTS, {
      radius: 22,
      blur: 24,
      maxZoom: 17,
      gradient: {
        0.2: '#5B9BD5',
        0.4: '#F5C842',
        0.7: '#FF6B9D',
        1.0: '#b62963',
      },
    })
    heat.addTo(map)

    for (const lbl of LABELS) {
      const icon = L.divIcon({
        className: 'cc-heat-label-wrap',
        html: `<span class="cc-heat-label cc-heat-${lbl.tone}">${lbl.text}</span>`,
        iconSize: [120, 22],
        iconAnchor: [60, 11],
      })
      L.marker([lbl.lat, lbl.lng], { icon, interactive: false, keyboard: false }).addTo(map)
    }

    return () => {
      heat.remove()
      map.remove()
      mapRef.current = null
    }
  }, [])

  return <div ref={elRef} className="cc-heatmap" aria-label="Chatswood walk density heatmap" />
}
