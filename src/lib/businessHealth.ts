import type { Shop } from '../types/shop'

export type HealthTier = 'thriving' | 'stable' | 'watch' | 'at-risk' | 'critical'

export interface BusinessRecord extends Shop {
  health: number
  tier: HealthTier
  sources: {
    osm: boolean
    google: boolean
    abr: boolean
    council: boolean
  }
  signals: {
    rating: number
    reviewCount: number
    multilingual: boolean
    websiteStatus: 'live' | 'unknown'
  }
}

const TIER_COLORS: Record<HealthTier, string> = {
  thriving: '#38b88c',
  stable: '#5ec9b6',
  watch: '#f0b95e',
  'at-risk': '#e08a4a',
  critical: '#d56b6b',
}

const TIER_LABELS: Record<HealthTier, string> = {
  thriving: 'Thriving',
  stable: 'Stable',
  watch: 'Watch',
  'at-risk': 'At-risk',
  critical: 'Critical',
}

export function colorForTier(tier: HealthTier): string {
  return TIER_COLORS[tier]
}

export function labelForTier(tier: HealthTier): string {
  return TIER_LABELS[tier]
}

export function tierFromScore(score: number): HealthTier {
  if (score >= 85) return 'thriving'
  if (score >= 70) return 'stable'
  if (score >= 55) return 'watch'
  if (score >= 35) return 'at-risk'
  return 'critical'
}

function hashName(name: string): number {
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0
  return h
}

export function enrichShop(shop: Shop): BusinessRecord {
  const h = hashName(shop.name)
  const rating = shop.rating ?? 3.5 + ((h % 15) / 10)
  const reviewCount = shop.reviewCount ?? (50 + (h % 400))
  const osm = true
  const google = shop.ratingReal === true
  const abr = (h % 5) !== 0
  const council = (h % 7) === 0
  const multilingual = /Asian|Drinks/.test(shop.cuisine) && (h % 3) !== 0
  const websiteStatus: 'live' | 'unknown' = (h % 4) === 0 ? 'unknown' : 'live'

  let score = 0
  score += (rating - 1) * 12
  score += Math.min(reviewCount / 8, 28)
  score += google ? 8 : 0
  score += abr ? 6 : 0
  score += council ? 4 : 0
  score += multilingual ? 4 : 0
  score += websiteStatus === 'live' ? 6 : 0
  score = Math.max(0, Math.min(100, Math.round(score)))

  return {
    ...shop,
    health: score,
    tier: tierFromScore(score),
    sources: { osm, google, abr, council },
    signals: { rating, reviewCount, multilingual, websiteStatus },
  }
}

export function aggregateKpis(records: BusinessRecord[]) {
  const n = records.length || 1
  const avg = Math.round(records.reduce((s, r) => s + r.health, 0) / n)
  const critical = records.filter((r) => r.tier === 'critical').length
  const watchOrWorse = records.filter((r) => ['watch', 'at-risk', 'critical'].includes(r.tier))
    .length
  const thriving = records.filter((r) => r.tier === 'thriving').length
  const multilingual = records.filter((r) => r.signals.multilingual).length
  const googleComplete = records.filter((r) => r.sources.google).length
  return {
    total: records.length,
    avgHealth: avg,
    critical,
    watchOrWorse,
    thriving,
    multilingual,
    googlePct: Math.round((googleComplete / n) * 100),
  }
}
