import { useQuery } from '@tanstack/react-query'
import { fetchCompetitorCounts, type CompetitorCounts } from '../lib/overpass'

const CACHE_KEY = 'cc-overpass-cache-v1'
const CACHE_TTL_MS = 24 * 60 * 60_000 // 24h

function readCache(): CompetitorCounts | null {
  try {
    const raw = window.localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const data = JSON.parse(raw) as CompetitorCounts & { _at: number }
    if (Date.now() - data._at > CACHE_TTL_MS) return null
    return data
  } catch {
    return null
  }
}

function writeCache(data: CompetitorCounts) {
  try {
    window.localStorage.setItem(CACHE_KEY, JSON.stringify({ ...data, _at: Date.now() }))
  } catch {
    /* localStorage full or denied — silently skip */
  }
}

export function useCompetitorCounts() {
  const query = useQuery({
    queryKey: ['overpass', 'competitors'],
    queryFn: async ({ signal }) => {
      const cached = readCache()
      if (cached) return cached
      const fresh = await fetchCompetitorCounts(signal)
      writeCache(fresh)
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
