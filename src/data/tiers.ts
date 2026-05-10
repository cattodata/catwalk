import type { CO2Tier } from '../types/shop'

/**
 * CO₂-savings gamification tier — sprout → bronze → silver → gold.
 * Total kg saved across all walks.
 */
export function tierFromCo2(kg: number): CO2Tier {
  if (kg >= 5)   return { id: 'gold',   label: 'Gold',   emoji: '🏆', min: 5,   next: null, color: '#F5C842' }
  if (kg >= 1.5) return { id: 'silver', label: 'Silver', emoji: '🥈', min: 1.5, next: 5,    color: '#B49EFB' }
  if (kg >= 0.3) return { id: 'bronze', label: 'Bronze', emoji: '🥉', min: 0.3, next: 1.5,  color: '#FF6B9D' }
  return         { id: 'sprout', label: 'Sprout', emoji: '🌱', min: 0,   next: 0.3,  color: '#7BC97F' }
}
