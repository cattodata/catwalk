import { getActiveCity } from '../config/cities'

const ENDPOINT = 'https://overpass-api.de/api/interpreter'

export interface CompetitorCounts {
  cafes: number
  restaurants: number
  bakeries: number
  fetchedAt: string
}

/**
 * Real-time count of cafes / restaurants / bakeries within Spec radius of station.
 * Cached in localStorage 24h to respect Overpass rate limits (~10k/day across all users of the API).
 */
export async function fetchCompetitorCounts(signal?: AbortSignal): Promise<CompetitorCounts> {
  const city = getActiveCity()
  const { lat, lng } = city.station
  const r = city.overpass.radius_m
  const query = `[out:json][timeout:25];
(
  node["amenity"="cafe"](around:${r},${lat},${lng});
  node["amenity"="restaurant"](around:${r},${lat},${lng});
  node["shop"="bakery"](around:${r},${lat},${lng});
);
out tags;`

  const res = await fetch(ENDPOINT, {
    method: 'POST',
    body: 'data=' + encodeURIComponent(query),
    signal,
  })
  if (!res.ok) throw new Error(`Overpass ${res.status}`)
  const data = (await res.json()) as { elements: { tags?: Record<string, string> }[] }

  let cafes = 0
  let restaurants = 0
  let bakeries = 0
  for (const el of data.elements ?? []) {
    const t = el.tags ?? {}
    if (t.amenity === 'cafe') cafes++
    else if (t.amenity === 'restaurant') restaurants++
    else if (t.shop === 'bakery') bakeries++
  }

  return {
    cafes,
    restaurants,
    bakeries,
    fetchedAt: new Date().toISOString(),
  }
}
