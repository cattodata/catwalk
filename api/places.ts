import type { VercelRequest, VercelResponse } from '@vercel/node'

/**
 * POST /api/places — batch lookup Google Places ratings for OSM shops.
 *
 * Body: { items: [{ id, name, lat, lng }] }
 * Returns: { items: [{ id, rating, reviewCount, priceLevel, real: boolean }] }
 *
 * Requires GOOGLE_PLACES_API_KEY env. If missing, returns 503 so the client
 * falls back to deterministic seed ratings (no breakage in demo).
 */

interface PlacesItemIn {
  id: string
  name: string
  lat: number
  lng: number
}

interface PlacesItemOut {
  id: string
  rating?: number
  reviewCount?: number
  priceLevel?: 1 | 2 | 3 | 4
  real: boolean
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' })

  const apiKey = process.env.GOOGLE_PLACES_API_KEY
  if (!apiKey) return res.status(503).json({ error: 'GOOGLE_PLACES_API_KEY not set' })

  const items = Array.isArray(req.body?.items) ? (req.body.items as PlacesItemIn[]) : null
  if (!items || items.length === 0) return res.status(400).json({ error: 'items[] required' })
  if (items.length > 30) return res.status(400).json({ error: 'max 30 items per batch' })

  // Concurrency-limited fan-out (5 parallel) using Places API New Text Search
  const out: PlacesItemOut[] = []
  const queue = [...items]
  const workers = Array.from({ length: 5 }, () => worker())
  await Promise.all(workers)

  async function worker() {
    while (queue.length > 0) {
      const item = queue.shift()
      if (!item) return
      try {
        const r = await fetch('https://places.googleapis.com/v1/places:searchText', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': apiKey!,
            'X-Goog-FieldMask': 'places.rating,places.userRatingCount,places.priceLevel',
          },
          body: JSON.stringify({
            textQuery: item.name,
            locationBias: {
              circle: { center: { latitude: item.lat, longitude: item.lng }, radius: 80.0 },
            },
            maxResultCount: 1,
          }),
        })
        if (!r.ok) {
          out.push({ id: item.id, real: false })
          continue
        }
        const data = (await r.json()) as { places?: Array<{ rating?: number; userRatingCount?: number; priceLevel?: string }> }
        const top = data.places?.[0]
        if (!top || top.rating == null) {
          out.push({ id: item.id, real: false })
          continue
        }
        out.push({
          id: item.id,
          rating: top.rating,
          reviewCount: top.userRatingCount,
          priceLevel: mapPriceLevel(top.priceLevel),
          real: true,
        })
      } catch {
        out.push({ id: item.id, real: false })
      }
    }
  }

  res.setHeader('Cache-Control', 's-maxage=604800, stale-while-revalidate=86400')
  return res.status(200).json({ items: out })
}

function mapPriceLevel(s: string | undefined): 1 | 2 | 3 | 4 | undefined {
  switch (s) {
    case 'PRICE_LEVEL_INEXPENSIVE':
      return 1
    case 'PRICE_LEVEL_MODERATE':
      return 2
    case 'PRICE_LEVEL_EXPENSIVE':
      return 3
    case 'PRICE_LEVEL_VERY_EXPENSIVE':
      return 4
    default:
      return undefined
  }
}
