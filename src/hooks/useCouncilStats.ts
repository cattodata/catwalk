import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export interface CouncilStatsLive {
  total_walks: number
  total_co2: number
  total_km: number
  total_points: number
  walking_now: number
  unique_users: number
  window_days: number
  computed_at: string
  /** True after first successful fetch */
  loaded: boolean
}

export interface TopStreet {
  street: string
  count: number
  pct: number
}

export interface DailyWalk {
  day: string
  count: number
}

const ZERO: CouncilStatsLive = {
  total_walks: 0,
  total_co2: 0,
  total_km: 0,
  total_points: 0,
  walking_now: 0,
  unique_users: 0,
  window_days: 7,
  computed_at: '',
  loaded: false,
}

/**
 * Realtime council aggregate stats.
 * Calls SECURITY DEFINER RPC `council_stats(...)` and re-fetches on every walks insert.
 */
export function useCouncilStats(citySlug: string = 'chatswood') {
  const [stats, setStats] = useState<CouncilStatsLive>(ZERO)
  const [topStreets, setTopStreets] = useState<TopStreet[]>([])
  const [dailyWalks, setDailyWalks] = useState<DailyWalk[]>([])

  useEffect(() => {
    const sb = supabase
    if (!sb) return

    let cancelled = false

    const refetch = async () => {
      const [statsRes, streetsRes, dailyRes] = await Promise.all([
        sb.rpc('council_stats', { p_city_slug: citySlug, p_window_days: 7 }),
        sb.rpc('council_top_streets', {
          p_city_slug: citySlug,
          p_window_days: 7,
          p_limit: 5,
        }),
        sb.rpc('council_daily_walks', { p_city_slug: citySlug, p_days: 26 }),
      ])
      if (cancelled) return
      if (statsRes.error) {
        console.warn('council_stats failed:', statsRes.error.message)
      } else if (statsRes.data) {
        const d = statsRes.data as Omit<CouncilStatsLive, 'loaded'>
        setStats({ ...d, loaded: true })
      }
      if (!streetsRes.error && Array.isArray(streetsRes.data)) {
        setTopStreets(
          streetsRes.data.map((r: { street: string; count: number; pct: string | number }) => ({
            street: r.street,
            count: Number(r.count),
            pct: Number(r.pct),
          })),
        )
      }
      if (!dailyRes.error && Array.isArray(dailyRes.data)) {
        setDailyWalks(
          dailyRes.data.map((r: { day: string; count: number }) => ({
            day: r.day,
            count: Number(r.count),
          })),
        )
      }
    }
    refetch()

    // Realtime: re-fetch on any walks insert in this city
    const channel = sb
      .channel(`walks-city-${citySlug}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'walks', filter: `city_slug=eq.${citySlug}` },
        () => refetch(),
      )
      .subscribe()

    return () => {
      cancelled = true
      sb.removeChannel(channel)
    }
  }, [citySlug])

  return { stats, topStreets, dailyWalks }
}
