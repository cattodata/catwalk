import { useQuery } from '@tanstack/react-query'
import { fetchRealShops } from '../lib/realShops'
import type { Shop } from '../types/shop'
import { SHOPS as FALLBACK_SHOPS } from '../data/shops'

const CACHE_KEY = 'cc-real-shops-cache-v1'
const CACHE_TTL_MS = 24 * 60 * 60_000 // 24h

function readCache(): Shop[] | null {
  try {
    const raw = window.localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const wrap = JSON.parse(raw) as { _at: number; shops: Shop[] }
    if (Date.now() - wrap._at > CACHE_TTL_MS) return null
    return wrap.shops
  } catch {
    return null
  }
}
function writeCache(shops: Shop[]) {
  try {
    window.localStorage.setItem(CACHE_KEY, JSON.stringify({ _at: Date.now(), shops }))
  } catch {/* noop */}
}

export function useRealShops() {
  const query = useQuery({
    queryKey: ['real-shops'],
    queryFn: async ({ signal }) => {
      const cached = readCache()
      if (cached && cached.length) return cached
      const fresh = await fetchRealShops(signal)
      writeCache(fresh)
      return fresh
    },
    staleTime: CACHE_TTL_MS,
    gcTime: CACHE_TTL_MS,
  })

  // Fallback to fictional pilot personas if API fails or returns empty
  const shops = query.data && query.data.length > 0 ? query.data : FALLBACK_SHOPS
  const isReal = query.data != null && query.data.length > 0

  return {
    shops,
    isReal,
    isLoading: query.isLoading,
    isError: query.isError,
  }
}
