import { useEffect, useState } from 'react'
import type { Shop } from '../types/shop'
import { getActiveCityId } from '../config/cities'

interface PlacesItemOut {
  id: string
  rating?: number
  reviewCount?: number
  priceLevel?: 1 | 2 | 3 | 4
  real: boolean
}

const CACHE_PREFIX = 'cc-places-cache-v1'
const CACHE_TTL_MS = 7 * 24 * 60 * 60_000
const BATCH_SIZE = 25

type CacheShape = Record<string, { _at: number; data: PlacesItemOut }>

function cacheKey(cityId: string) {
  return `${CACHE_PREFIX}:${cityId}`
}

function readCache(cityId: string): CacheShape {
  try {
    const raw = window.localStorage.getItem(cacheKey(cityId))
    return raw ? (JSON.parse(raw) as CacheShape) : {}
  } catch {
    return {}
  }
}

function writeCache(cityId: string, cache: CacheShape) {
  try {
    window.localStorage.setItem(cacheKey(cityId), JSON.stringify(cache))
  } catch {
    /* ignore */
  }
}

/**
 * Enriches shops with Google Places ratings. Reads localStorage cache first
 * (7d TTL). For uncached shops, batch-fetches via /api/places. If the API key
 * isn't set in production, the function 503s and the shop keeps its seed rating.
 */
export function useGooglePlaces(shops: Shop[]): Shop[] {
  const [enriched, setEnriched] = useState<Record<string, PlacesItemOut>>({})

  useEffect(() => {
    if (shops.length === 0) return
    // Skip in dev (no Vercel runtime) and when explicitly disabled. Deterministic
    // seed ratings still render so the demo looks complete offline.
    if (import.meta.env.DEV) return
    if (import.meta.env.VITE_DISABLE_PLACES === '1') return
    const cityId = getActiveCityId()
    const cache = readCache(cityId)
    const now = Date.now()
    const seeded: Record<string, PlacesItemOut> = {}
    const toFetch: Shop[] = []

    for (const s of shops) {
      const hit = cache[s.id]
      if (hit && now - hit._at < CACHE_TTL_MS) {
        seeded[s.id] = hit.data
      } else if (s.lat != null && s.lng != null) {
        toFetch.push(s)
      }
    }
    if (Object.keys(seeded).length > 0) {
      setEnriched((cur) => ({ ...cur, ...seeded }))
    }
    if (toFetch.length === 0) return

    let cancelled = false
    ;(async () => {
      for (let i = 0; i < toFetch.length; i += BATCH_SIZE) {
        if (cancelled) return
        const batch = toFetch.slice(i, i + BATCH_SIZE)
        try {
          const r = await fetch('/api/places', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              items: batch.map((s) => ({ id: s.id, name: s.name, lat: s.lat, lng: s.lng })),
            }),
          })
          if (!r.ok) {
            // 503 = no API key. Stop trying; deterministic seed will show in UI.
            return
          }
          const data = (await r.json()) as { items?: PlacesItemOut[] }
          if (!data.items || cancelled) return
          const nextCache = readCache(cityId)
          const nextEnriched: Record<string, PlacesItemOut> = {}
          for (const item of data.items) {
            if (!item.real) continue
            nextCache[item.id] = { _at: Date.now(), data: item }
            nextEnriched[item.id] = item
          }
          writeCache(cityId, nextCache)
          setEnriched((cur) => ({ ...cur, ...nextEnriched }))
        } catch {
          return
        }
      }
    })()

    return () => {
      cancelled = true
    }
  }, [shops])

  if (Object.keys(enriched).length === 0) return shops
  return shops.map((s) => {
    const e = enriched[s.id]
    if (!e || !e.real) return s
    return {
      ...s,
      rating: e.rating ?? s.rating,
      reviewCount: e.reviewCount ?? s.reviewCount,
      priceLevel: e.priceLevel ?? s.priceLevel,
      ratingReal: true,
    }
  })
}
