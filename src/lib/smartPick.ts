import type { Shop } from '../types/shop'
import type { WeatherSummary } from '../types/weather'

/**
 * "What's worth it for me right now?" — simple ROI ranker.
 * Returns the best-ROI shop given current conditions.
 *
 * Scoring rubric (transparent so we can show the user *why*):
 *   base score = (points × multiplier) / walking_minutes      ← reward density
 *   weather bonus: rain → bakery/cafe +20%; hot → drinks +20%
 *   time bonus: morning (7-10) → bakery +30%; lunch (11-13) → restaurant +25%; arvo (14-16) → cafe +20%; pm (17-20) → restaurant +20%
 *   distance penalty: walks > 600m get -10% (we want feasible walks)
 */
export interface SmartPick {
  shop: Shop
  score: number
  reasons: string[]
}

export function smartPick(
  shops: Shop[],
  weather: WeatherSummary | null,
  hour: number,
): SmartPick | null {
  if (!shops.length) return null

  const scored = shops.map((s) => {
    const reasons: string[] = []
    let score = (s.pts * s.mult) / Math.max(1, s.mins)
    reasons.push(`${s.pts} pts × ${s.mult}× / ${s.mins} min`)

    if (weather?.isRain && (s.type === 'Bakery' || s.type === 'Cafe')) {
      score *= 1.2
      reasons.push('rainy → cosy indoor +20%')
    }
    if (weather?.isHot && s.cuisine === 'Drinks') {
      score *= 1.2
      reasons.push('hot → cold drinks +20%')
    }
    if (hour >= 7 && hour <= 10 && s.type === 'Bakery') {
      score *= 1.3
      reasons.push('morning · bakery peak +30%')
    } else if (hour >= 11 && hour <= 13 && s.type === 'Restaurant') {
      score *= 1.25
      reasons.push('lunch · restaurant peak +25%')
    } else if (hour >= 14 && hour <= 16 && s.type === 'Cafe') {
      score *= 1.2
      reasons.push('arvo slump · cafe pick-me-up +20%')
    } else if (hour >= 17 && hour <= 20 && s.type === 'Restaurant') {
      score *= 1.2
      reasons.push('PM commute · restaurant +20%')
    }
    if (s.dist > 600) {
      score *= 0.9
      reasons.push('long walk -10%')
    }

    return { shop: s, score: +score.toFixed(2), reasons }
  })

  scored.sort((a, b) => b.score - a.score)
  return scored[0]
}
