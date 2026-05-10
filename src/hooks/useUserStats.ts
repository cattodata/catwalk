import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export interface UserStats {
  total_walks: number
  total_co2: number
  total_points: number
}

const LS_KEY = 'cc-user-stats-cache'

/**
 * Live user stats from Supabase view `user_points`.
 * Falls back to localStorage cache + 0 when no Supabase / no auth.
 */
export function useUserStats(userId: string | null) {
  const [stats, setStats] = useState<UserStats>(() => {
    try {
      const raw = window.localStorage.getItem(LS_KEY)
      if (raw) return JSON.parse(raw) as UserStats
    } catch {/* noop */}
    return { total_walks: 0, total_co2: 0, total_points: 0 }
  })

  useEffect(() => {
    const sb = supabase
    if (!sb || !userId) return

    let cancelled = false
    const refetch = async () => {
      const { data, error } = await sb
        .from('user_points')
        .select('total_walks, total_co2, total_points')
        .eq('user_id', userId)
        .maybeSingle()
      if (cancelled) return
      if (error) {
        console.warn('useUserStats fetch failed:', error.message)
        return
      }
      const next: UserStats = {
        total_walks: data?.total_walks ?? 0,
        total_co2: Number(data?.total_co2 ?? 0),
        total_points: data?.total_points ?? 0,
      }
      setStats(next)
      try {
        window.localStorage.setItem(LS_KEY, JSON.stringify(next))
      } catch {/* noop */}
    }
    refetch()

    // Realtime: re-fetch when this user's walks change
    const channel = sb
      .channel(`user-walks-${userId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'walks', filter: `user_id=eq.${userId}` },
        () => refetch(),
      )
      .subscribe()

    return () => {
      cancelled = true
      sb.removeChannel(channel)
    }
  }, [userId])

  return stats
}
