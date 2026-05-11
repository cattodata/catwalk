import { describe, expect, it } from 'vitest'
import { generateInsights } from './insights'
import type { WeatherSummary } from '../types/weather'
import type { ChatswoodEvent } from '../data/events'

const sunny: WeatherSummary = {
  temp: 22,
  code: 0,
  emoji: '☀️',
  label: 'Clear',
  precipitation: 0,
  isRain: false,
  isHot: false,
  isCold: false,
}
const rainy: WeatherSummary = { ...sunny, isRain: true, label: 'Rain', emoji: '🌧️', precipitation: 4 }

describe('generateInsights', () => {
  it('caps at 5 insights max', () => {
    const result = generateInsights({
      bizType: 'Cafe',
      shop: null,
      weather: rainy,
      competitors: { cafes: 47, restaurants: 89, bakeries: 12, fetchedAt: '' },
      hour: 15,
      dayOfWeek: 6,
      todayEvent: { dow: 6, emoji: '👨‍👩‍👧', title: 'Family Day', venue: 'Concourse' },
    })
    expect(result.length).toBeLessThanOrEqual(5)
  })

  it('shows rain insight when raining', () => {
    const result = generateInsights({
      bizType: 'Cafe',
      shop: null,
      weather: rainy,
      competitors: null,
      hour: 12,
      dayOfWeek: 3,
    })
    expect(result.some((i) => i.title.includes('Rain'))).toBe(true)
  })

  it('shows competitor count for Cafe when data present', () => {
    const result = generateInsights({
      bizType: 'Cafe',
      shop: null,
      weather: sunny,
      competitors: { cafes: 51, restaurants: 89, bakeries: 12, fetchedAt: '' },
      hour: 12,
      dayOfWeek: 3,
    })
    expect(result.some((i) => i.title.includes('51 cafes'))).toBe(true)
  })

  it('uses real today event when provided', () => {
    const event: ChatswoodEvent = {
      dow: 6,
      emoji: '👨‍👩‍👧',
      title: 'Family Day',
      venue: 'Concourse',
      window: '10am-3pm',
      footTraffic: 'high',
    }
    const result = generateInsights({
      bizType: 'Cafe',
      shop: null,
      weather: sunny,
      competitors: null,
      hour: 12,
      dayOfWeek: 6,
      todayEvent: event,
    })
    expect(result.some((i) => i.title.includes('Family Day'))).toBe(true)
  })
})

