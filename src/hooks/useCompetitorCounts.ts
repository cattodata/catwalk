import { useQuery } from '@tanstack/react-query'
import { fetchCompetitorCounts, type CompetitorCounts } from '../lib/overpass'
import { getActiveCityId } from '../config/cities'

const CACHE_PREFIX = 'cc-overpass-cache-v2'
const CACHE_TTL_MS = 24 * 60 * 60_000 // 24h

function cacheKey(cityId: string) {
  return `${CACHE_PREFIX}:${cityId}`
}

function readCache(cityId: string): CompetitorCounts | null {
  try {
    const raw = window.localStorage.getItem(cacheKey(cityId))
    if (!raw) return null
    const data = JSON.parse(raw) as CompetitorCounts & { _at: number }
    if (Date.now() - data._at > CACHE_TTL_MS) return null
    return data
  } catch {
    return null
  }
}

function writeCache(cityId: string, data: CompetitorCounts) {
  try {
    window.localStorage.setItem(cacheKey(cityId), JSON.stringify({ ...data, _at: Date.now() }))
  } catch {
    /* noop */
  }
}

export function useCompetitorCounts() {
  const cityId = getActiveCityId()
  const query = useQuery({
    queryKey: ['overpass', 'competitors', cityId],
    queryFn: async ({ signal }) => {
      const cached = readCache(cityId)
      if (cached) return cached
      const fresh = await fetchCompetitorCounts(signal)
      writeCache(cityId, fresh)
      return fresh
    },
    staleTime: CACHE_TTL_MS,
    gcTime: CACHE_TTL_MS,
  })

  return {
    counts: query.data ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
  }
}
