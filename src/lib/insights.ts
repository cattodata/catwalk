import type { Insight, VitalCard } from '../types/campaign'
import type { BizType, Shop } from '../types/shop'
import type { WeatherSummary } from '../types/weather'
import type { CompetitorCounts } from './overpass'
import type { ChatswoodEvent } from '../data/events'

interface InsightContext {
  bizType: BizType
  shop: Shop | null
  weather: WeatherSummary | null
  competitors: CompetitorCounts | null
  /** 0-23 in Sydney local time */
  hour: number
  /** 0=Sun..6=Sat */
  dayOfWeek: number
  /** Today's curated Chatswood event (if any) */
  todayEvent?: ChatswoodEvent | null
  isMobile?: boolean
}

/**
 * Reactive insight engine — Spec §15.3.
 * Triggers on: weather code, hour-of-day brackets, day-of-week, business type,
 * competitor density, selected-shop distance.
 * Capped at 5 insights to avoid panel bloat.
 */
export function generateInsights(ctx: InsightContext): Insight[] {
  const out: Insight[] = []

  // Weather insights
  if (ctx.weather?.isRain) {
    out.push({
      icon: '🌧️',
      color: '#5B9BD5',
      title: `Rain · ${ctx.weather.precipitation.toFixed(1)}mm today`,
      sub: 'Push warm, cosy indoor offers',
    })
  } else if (ctx.weather?.isHot) {
    out.push({
      icon: '🥵',
      color: '#FF6B9D',
      title: `Hot · ${ctx.weather.temp}°C`,
      sub: 'Cold drinks + outdoor signs convert 1.7×',
    })
  } else if (ctx.weather?.isCold) {
    out.push({
      icon: '🥶',
      color: '#5B9BD5',
      title: `Cold · ${ctx.weather.temp}°C`,
      sub: 'Hot bowls + warm pastries lead the day',
    })
  }

  // Time-of-day brackets
  const h = ctx.hour
  if (h >= 6 && h <= 10) {
    out.push({ icon: '☕', color: '#7BC97F', title: 'Morning commute · 7–10am', sub: 'Pair pastry with coffee for the platform run' })
  } else if (h >= 11 && h <= 13) {
    out.push({ icon: '🍱', color: '#F5C842', title: 'Lunch peak · 11am–1pm', sub: 'Quick set-meals win over à la carte' })
  } else if (h >= 14 && h <= 16) {
    out.push({ icon: '💤', color: '#B49EFB', title: 'Afternoon slump · 2–4pm', sub: 'Bundle to lift basket size' })
  } else if (h >= 17 && h <= 20) {
    out.push({ icon: '🚇', color: '#5B9BD5', title: 'PM commute · 5–8pm', sub: 'Pre-plated dinners catch platform exits' })
  }

  // Day-of-week — prefer real curated event over generic message
  if (ctx.todayEvent) {
    out.push({
      icon: ctx.todayEvent.emoji,
      color: '#F5C842',
      title: `${ctx.todayEvent.title} · ${ctx.todayEvent.venue}`,
      sub: `${ctx.todayEvent.window ?? 'today'} · ${ctx.todayEvent.footTraffic ?? 'mid'} foot traffic`,
    })
  } else if (ctx.dayOfWeek >= 1 && ctx.dayOfWeek <= 5) {
    out.push({ icon: '📅', color: '#7BC97F', title: 'Weekday · 47.8K Opal taps', sub: 'Commuter ritual is your moment' })
  }

  // Business type
  if (ctx.bizType === 'Cafe' && ctx.competitors) {
    out.push({
      icon: '☕',
      color: '#7BC97F',
      title: `${ctx.competitors.cafes} cafes within 700m`,
      sub: 'Bundle beats discount in saturated mkt',
    })
  } else if (ctx.bizType === 'Restaurant' && ctx.competitors) {
    out.push({
      icon: '🍜',
      color: '#7BC97F',
      title: `${ctx.competitors.restaurants} restaurants within 700m`,
      sub: 'Niche language signals win share',
    })
  } else if (ctx.bizType === 'Bakery') {
    out.push({
      icon: '🥐',
      color: '#7BC97F',
      title: 'Morning leverage · 7–10am',
      sub: 'Pair pastry with commuter coffee',
    })
  }

  // Distance
  if (ctx.shop && ctx.shop.dist > 300) {
    out.push({
      icon: '🚶',
      color: '#FF6B9D',
      title: `${ctx.shop.dist}m walk · ${ctx.shop.mult}× multiplier`,
      sub: 'Locals earn extra to discover you',
    })
  }

  return out.slice(0, 5)
}

/**
 * Compose the Vitals strip from real-time inputs. Falls back to "—" loading state.
 */
/** Owner-facing vitals — competition, opal taps */
export function buildOwnerVitals(args: {
  weather: WeatherSummary | null
  competitors: CompetitorCounts | null
  bizType: BizType
  stationDailyAvg: number
  date: Date
}): VitalCard[] {
  const { weather, competitors, bizType, stationDailyAvg, date } = args
  const dayName = date.toLocaleDateString('en-AU', { weekday: 'short' })
  const compNum =
    bizType === 'Cafe'
      ? competitors?.cafes
      : bizType === 'Restaurant'
        ? competitors?.restaurants
        : competitors?.bakeries
  const compLabel =
    bizType === 'Cafe' ? 'Cafes nearby' : bizType === 'Restaurant' ? 'Restaurants nearby' : 'Bakeries nearby'

  return [
    {
      id: 'weather',
      emoji: weather?.emoji ?? '🌤️',
      num: weather ? `${weather.temp}°` : '—',
      label: 'Weather now',
      sub: weather ? `${weather.label} · rain ${weather.precipitation.toFixed(1)}mm` : 'Loading…',
      accent: '#5B9BD5',
      bg: 'rgba(91,155,213,.14)',
      isLive: true,
      source: 'open-meteo.com',
    },
    {
      id: 'station',
      emoji: '🚇',
      num: `${(stationDailyAvg / 1000).toFixed(1)}K`,
      label: 'Daily Opal taps',
      sub: 'TfNSW · monthly avg',
      accent: '#7BC97F',
      bg: 'rgba(123,201,127,.14)',
      isLive: false,
      source: 'TfNSW Opal Aug 2024 monthly aggregate',
    },
    {
      id: 'comp',
      emoji: bizType === 'Cafe' ? '☕' : bizType === 'Restaurant' ? '🍜' : '🥐',
      num: compNum != null ? String(compNum) : '—',
      label: compLabel,
      sub: competitors ? 'Within 700m of station' : 'Loading from OSM…',
      accent: '#B49EFB',
      bg: 'rgba(180,158,251,.14)',
      isLive: true,
      source: 'overpass-api.de',
    },
    {
      id: 'events',
      emoji: '📅',
      num: dayName,
      label: 'Today',
      sub: date.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' }),
      accent: '#F5C842',
      bg: 'rgba(245,200,66,.18)',
      isLive: true,
    },
  ]
}

/** Walker-facing vitals — weather + nearest shop + tier progress + today */
export function buildWalkerVitals(args: {
  weather: WeatherSummary | null
  nearestShop: { name: string; dist: number; mult: number } | null
  tier: { label: string; emoji: string; co2: number; nextAt: number | null }
  date: Date
}): VitalCard[] {
  const { weather, nearestShop, tier, date } = args
  const dayName = date.toLocaleDateString('en-AU', { weekday: 'short' })
  const remaining = tier.nextAt != null ? Math.max(0, tier.nextAt - tier.co2) : 0

  return [
    {
      id: 'weather',
      emoji: weather?.emoji ?? '🌤️',
      num: weather ? `${weather.temp}°` : '—',
      label: 'Weather now',
      sub: weather ? `${weather.label}` : 'Loading…',
      accent: '#5B9BD5',
      bg: 'rgba(91,155,213,.14)',
      isLive: true,
      source: 'open-meteo.com',
    },
    {
      id: 'nearest',
      emoji: '📍',
      num: nearestShop ? `${nearestShop.dist}m` : '—',
      label: 'Nearest shop',
      sub: nearestShop ? `${nearestShop.name} · ${nearestShop.mult}×` : 'Loading shops…',
      accent: '#FF6B9D',
      bg: 'rgba(255,107,157,.14)',
      isLive: true,
    },
    {
      id: 'tier',
      emoji: tier.emoji,
      num: tier.label,
      label: 'Your tier',
      sub: tier.nextAt
        ? `${remaining.toFixed(2)} kg to next`
        : 'Top tier · keep walking!',
      accent: '#7BC97F',
      bg: 'rgba(123,201,127,.14)',
    },
    {
      id: 'events',
      emoji: '📅',
      num: dayName,
      label: 'Today',
      sub: date.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' }),
      accent: '#F5C842',
      bg: 'rgba(245,200,66,.18)',
      isLive: true,
    },
  ]
}

/** Back-compat alias */
export const buildVitals = buildOwnerVitals
