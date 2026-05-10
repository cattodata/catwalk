import { describe, expect, it } from 'vitest'
import { smartPick } from './smartPick'
import type { Shop } from '../types/shop'
import type { WeatherSummary } from '../types/weather'

const mkShop = (over: Partial<Shop>): Shop => ({
  id: 'x',
  name: 'X',
  emoji: '🍵',
  type: 'Cafe',
  cuisine: 'Asian',
  tags: [],
  mult: 1,
  x: 0,
  y: 0,
  dist: 200,
  mins: 3,
  pts: 100,
  off: 10,
  co2: 0.04,
  route: [],
  lat: -33.79,
  lng: 151.18,
  ...over,
})

const sun: WeatherSummary = {
  temp: 22,
  code: 0,
  emoji: '☀️',
  label: 'Clear',
  precipitation: 0,
  isRain: false,
  isHot: false,
  isCold: false,
}
const rainy: WeatherSummary = {
  temp: 14,
  code: 61,
  emoji: '🌧️',
  label: 'Rain',
  precipitation: 4,
  isRain: true,
  isHot: false,
  isCold: false,
}

describe('smartPick', () => {
  it('returns null for empty shops list', () => {
    expect(smartPick([], sun, 12)).toBe(null)
  })

  it('picks the higher ROI shop', () => {
    const cheap = mkShop({ id: 'cheap', pts: 50, mins: 3, mult: 1 }) // 50/3 = 16.6
    const rich = mkShop({ id: 'rich', pts: 200, mins: 4, mult: 2 }) // 200*2/4 = 100
    const result = smartPick([cheap, rich], sun, 12)
    expect(result?.shop.id).toBe('rich')
  })

  it('boosts cafe in rainy afternoon (cosy indoor +20%)', () => {
    const cafe = mkShop({ id: 'cafe', type: 'Cafe', pts: 100, mult: 1, mins: 4 })
    const restaurant = mkShop({ id: 'rest', type: 'Restaurant', pts: 100, mult: 1, mins: 4 })
    // Tied baseline; rain should tip to cafe at hour 15
    const pick = smartPick([cafe, restaurant], rainy, 15)
    expect(pick?.shop.id).toBe('cafe')
    expect(pick?.reasons.some((r) => r.includes('rainy'))).toBe(true)
  })

  it('boosts bakery in morning hour 8 (+30%)', () => {
    const bakery = mkShop({ id: 'b', type: 'Bakery' })
    const cafe = mkShop({ id: 'c', type: 'Cafe' })
    const pick = smartPick([cafe, bakery], sun, 8)
    expect(pick?.shop.id).toBe('b')
    expect(pick?.reasons.some((r) => r.includes('morning'))).toBe(true)
  })

  it('penalises walks > 600m by 10%', () => {
    const close = mkShop({ id: 'close', dist: 200, mins: 3, pts: 100 })
    const far = mkShop({ id: 'far', dist: 700, mins: 12, pts: 100 })
    const pick = smartPick([close, far], sun, 13)
    expect(pick?.shop.id).toBe('close')
  })

  it('returns transparent reasons array', () => {
    const pick = smartPick([mkShop({})], sun, 10)
    expect(pick?.reasons.length).toBeGreaterThan(0)
    expect(pick?.score).toBeGreaterThan(0)
  })
})
