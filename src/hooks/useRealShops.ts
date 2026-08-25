import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchRealShops } from '../lib/realShops'
import type { Shop } from '../types/shop'
import { SHOPS as FALLBACK_SHOPS } from '../data/shops'
import { getActiveCityId } from '../config/cities'

const CACHE_PREFIX = 'cc-real-shops-cache-v3'
const CACHE_TTL_MS = 24 * 60 * 60_000 // 24h

function cacheKey(cityId: string) {
  return `${CACHE_PREFIX}:${cityId}`
}

function readCache(cityId: string): Shop[] | null {
  try {
    const raw = window.localStorage.getItem(cacheKey(cityId))
    if (!raw) return null
    const wrap = JSON.parse(raw) as { _at: number; shops: Shop[] }
    if (Date.now() - wrap._at > CACHE_TTL_MS) return null
    return wrap.shops
  } catch {
    return null
  }
}
function writeCache(cityId: string, shops: Shop[]) {
  try {
    window.localStorage.setItem(cacheKey(cityId), JSON.stringify({ _at: Date.now(), shops }))
  } catch {
    /* noop */
  }
}

export function useRealShops() {
  const cityId = getActiveCityId()
  const query = useQuery({
    queryKey: ['real-shops-v3', cityId],
    queryFn: async ({ signal }) => {
      const cached = readCache(cityId)
      if (cached && cached.length) return cached
      const fresh = await fetchRealShops(signal)
      writeCache(cityId, fresh)
      return fresh
    },
    staleTime: CACHE_TTL_MS,
    gcTime: CACHE_TTL_MS,
  })

  // Fallback to fictional pilot personas if API fails or returns empty
  const baseShops = query.data && query.data.length > 0 ? query.data : FALLBACK_SHOPS
  const isReal = query.data != null && query.data.length > 0

  // Stable-reference merge — wrap in useMemo so downstream effects (useGooglePlaces, map render)
  // don't see a new array identity on every parent render. Without this, panning the map
  // causes useGooglePlaces' effect to refire continuously and shops can flicker out.
  const shops = useMemo(() => {
    const demoGongcha = FALLBACK_SHOPS.find((s) => s.id === 'demo-gongcha')
    const hasGongcha = baseShops.some((s) => /gong\s*cha/i.test(s.name))
    return !hasGongcha && demoGongcha ? [demoGongcha, ...baseShops] : baseShops
  }, [baseShops])

  return {
    shops,
    isReal,
    isLoading: query.isLoading,
    isError: query.isError,
  }
}
