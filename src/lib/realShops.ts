import type { Shop, BizType } from '../types/shop'
import { CHATSWOOD } from '../config/chatswood'

const ENDPOINT = 'https://overpass-api.de/api/interpreter'

interface OverpassNode {
  type: 'node'
  id: number
  lat: number
  lon: number
  tags?: Record<string, string>
}

/**
 * Fetch real Chatswood shops from OSM Overpass.
 * Returns a normalized list of Shop objects with computed distance/multiplier.
 */
export async function fetchRealShops(signal?: AbortSignal): Promise<Shop[]> {
  const { lat, lng, x, y } = CHATSWOOD.station
  const r = CHATSWOOD.overpass.radius_m
  const query = `[out:json][timeout:25];
(
  node["amenity"="cafe"]["name"](around:${r},${lat},${lng});
  node["amenity"="restaurant"]["name"](around:${r},${lat},${lng});
  node["shop"="bakery"]["name"](around:${r},${lat},${lng});
);
out tags center;`

  const res = await fetch(ENDPOINT, {
    method: 'POST',
    body: 'data=' + encodeURIComponent(query),
    signal,
  })
  if (!res.ok) throw new Error(`Overpass ${res.status}`)
  const data = (await res.json()) as { elements: OverpassNode[] }

  return (data.elements ?? [])
    .filter((n) => n.tags?.name)
    .map((n) => normalize(n, lat, lng, x, y))
    .sort((a, b) => a.dist - b.dist)
    .slice(0, 60) // top 60 closest — covers most of Chatswood CBD
}

function normalize(node: OverpassNode, stLat: number, stLng: number, stX: number, stY: number): Shop {
  const tags = node.tags ?? {}
  const type: BizType =
    tags.amenity === 'cafe' ? 'Cafe' : tags.amenity === 'restaurant' ? 'Restaurant' : 'Bakery'

  // Compute distance via Haversine
  const dist = Math.round(haversineMeters({ lat: stLat, lng: stLng }, { lat: node.lat, lng: node.lon }))
  // Walking time at 5 km/h
  const mins = Math.max(1, Math.round((dist / 1000) * 12))

  // Multiplier based on distance (encourages walking further)
  const mult: 1 | 2 | 3 = dist >= 350 ? 3 : dist >= 200 ? 2 : 1

  // Points = 1 pt per metre × multiplier (rough rule of thumb)
  const pts = Math.round(dist * mult * 0.6)
  const off = mult === 3 ? 20 : mult === 2 ? 15 : 10
  const co2 = +((dist / 1000) * 0.18).toFixed(3) // 0.18 kg/km vs driving

  // Convert lat/lng to SVG coords (legacy fallback for old map renderer)
  const lngSpan = 0.0085 // approx +/- 350m at this lat
  const latSpan = 0.0072
  const x = stX + ((node.lon - stLng) / lngSpan) * 350
  const y = stY - ((node.lat - stLat) / latSpan) * 260

  // Cuisine guess from name/type tags
  const cuisineTag = tags.cuisine?.toLowerCase() ?? ''
  const cuisine: Shop['cuisine'] =
    cuisineTag.includes('chinese') || cuisineTag.includes('japanese') || cuisineTag.includes('korean') || cuisineTag.includes('thai') || cuisineTag.includes('vietnamese') || cuisineTag.includes('asian')
      ? 'Asian'
      : cuisineTag.includes('coffee') || cuisineTag.includes('tea') || cuisineTag.includes('drink') || cuisineTag.includes('bubble')
        ? 'Drinks'
        : type === 'Bakery' || cuisineTag.includes('dessert') || cuisineTag.includes('sweet')
          ? 'Sweets'
          : 'Western'

  // Tag detection from OSM tags
  const cTags: Shop['tags'] = []
  if (tags.diet_halal === 'yes') cTags.push('Halal')
  if (tags.diet_vegan === 'yes' || tags.diet_vegetarian === 'yes') cTags.push('Vegan')
  if (tags.opening_hours?.includes('00:00') || tags.opening_hours?.includes('24/7')) cTags.push('Late-night')

  // Emoji from type/cuisine
  const emoji = getEmoji(type, cuisine)

  // Route polyline: straight from station for SVG fallback
  const route: [number, number][] = [
    [stX, stY],
    [Math.round((stX + x) / 2), Math.round((stY + y) / 2)],
    [Math.round(x), Math.round(y)],
  ]

  return {
    id: `osm-${node.id}`,
    name: tags.name ?? 'Unknown',
    emoji,
    type,
    cuisine,
    tags: cTags,
    mult,
    x: Math.round(x),
    y: Math.round(y),
    dist,
    mins,
    pts,
    off,
    co2,
    route,
    lat: node.lat,
    lng: node.lon,
    street: tags['addr:street'],
  }
}

function getEmoji(type: BizType, cuisine: Shop['cuisine']): string {
  if (type === 'Bakery') return cuisine === 'Sweets' ? '🍩' : '🥐'
  if (type === 'Cafe') return cuisine === 'Drinks' ? '🧋' : '☕'
  if (cuisine === 'Asian') return '🍜'
  return '🍽️'
}

function haversineMeters(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6_371_000
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const lat1 = toRad(a.lat)
  const lat2 = toRad(b.lat)
  const sinLat = Math.sin(dLat / 2)
  const sinLng = Math.sin(dLng / 2)
  const h = sinLat * sinLat + Math.cos(lat1) * Math.cos(lat2) * sinLng * sinLng
  return 2 * R * Math.asin(Math.sqrt(h))
}
