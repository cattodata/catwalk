/**
 * Seed walk history used by RewardsHomeScreen + ProfileScreen.
 * Single source of truth so the two tabs never disagree (mobile audit M3).
 * When Supabase is wired, swap to a real fetch hook.
 */
export interface WalkHistoryEntry {
  id: string
  shop: string
  emoji: string
  pts: number
  daysAgo: number
  co2: number
}

export const SEED_WALK_HISTORY: WalkHistoryEntry[] = [
  { id: 'w1', shop: 'Gongcha', emoji: '🧋', pts: 248, daysAgo: 0, co2: 0.05 },
  { id: 'w2', shop: 'Gong Cha', emoji: '🧋', pts: 248, daysAgo: 1, co2: 0.05 },
  { id: 'w3', shop: 'Mamak', emoji: '🍜', pts: 28, daysAgo: 2, co2: 0.04 },
  { id: 'w4', shop: 'Three Beans', emoji: '☕', pts: 16, daysAgo: 3, co2: 0.02 },
  { id: 'w5', shop: 'Hakata Maru', emoji: '🍜', pts: 34, daysAgo: 5, co2: 0.06 },
]

export interface WalkHistoryTotals {
  walks: number
  pts: number
  co2: number
}

export function seedTotals(): WalkHistoryTotals {
  return {
    walks: SEED_WALK_HISTORY.length,
    pts: SEED_WALK_HISTORY.reduce((s, w) => s + w.pts, 0),
    co2: +SEED_WALK_HISTORY.reduce((s, w) => s + w.co2, 0).toFixed(2),
  }
}

export function fmtDaysAgo(d: number): string {
  if (d === 0) return 'today'
  if (d === 1) return 'yesterday'
  return `${d}d ago`
}
