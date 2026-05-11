import { haversineMeters } from './geofence'
import type { Shop } from '../types/shop'

export interface PlanTotals {
  walkMeters: number
  walkMins: number
  co2KgSaved: number
  parkingSavedAud: number
  points: number
  chainBonus: number
}

const WALK_MPS = 1.35
const CAR_CO2_PER_KM = 0.171
const PARKING_AUD_PER_STOP = 4.5
const CHAIN_THRESHOLD = 3
const CHAIN_MULT = 1.2

function shopCoord(s: Shop): { lat: number; lng: number } | null {
  if (typeof s.lat !== 'number' || typeof s.lng !== 'number') return null
  return { lat: s.lat, lng: s.lng }
}

export function computePlanTotals(
  stops: Shop[],
  origin: { lat: number; lng: number } | null,
): PlanTotals {
  if (stops.length === 0) {
    return { walkMeters: 0, walkMins: 0, co2KgSaved: 0, parkingSavedAud: 0, points: 0, chainBonus: 1 }
  }

  let meters = 0
  let prev = origin
  for (const s of stops) {
    const cur = shopCoord(s)
    if (prev && cur) meters += haversineMeters(prev, cur)
    else meters += s.dist
    prev = cur ?? prev
  }

  const km = meters / 1000
  const mins = Math.round((meters / WALK_MPS) / 60)
  const co2 = +(km * CAR_CO2_PER_KM).toFixed(2)
  const parking = +(stops.length * PARKING_AUD_PER_STOP).toFixed(2)
  const basePoints = stops.reduce((sum, s) => sum + s.pts, 0)
  const chain = stops.length >= CHAIN_THRESHOLD ? CHAIN_MULT : 1
  const points = Math.round(basePoints * chain)

  return {
    walkMeters: meters,
    walkMins: mins,
    co2KgSaved: co2,
    parkingSavedAud: parking,
    points,
    chainBonus: chain,
  }
}

export interface DayPreset {
  id: string
  label: string
  emoji: string
  hint: string
  pick: (shops: Shop[]) => Shop[]
}

export const DAY_PRESETS: DayPreset[] = [
  {
    id: 'lunch-coffee',
    label: 'Lunch & coffee',
    emoji: '🍜',
    hint: 'Eat + drink, 2 stops',
    pick: (shops) => {
      const eat = shops.find((s) => s.type === 'Restaurant')
      const coffee = shops.find((s) => s.type === 'Cafe')
      return [eat, coffee].filter((s): s is Shop => Boolean(s))
    },
  },
  {
    id: 'sweet-tour',
    label: 'Sweet tour',
    emoji: '🍩',
    hint: 'Bakery + cafe + dessert, 3 stops',
    pick: (shops) => {
      const bakery = shops.find((s) => s.type === 'Bakery')
      const sweets = shops.filter((s) => s.cuisine === 'Sweets').slice(0, 1)
      const cafe = shops.find((s) => s.type === 'Cafe')
      return [bakery, ...sweets, cafe].filter((s): s is Shop => Boolean(s)).slice(0, 3)
    },
  },
  {
    id: 'cafe-crawl',
    label: 'Café crawl',
    emoji: '☕',
    hint: 'Three cafés, chain bonus',
    pick: (shops) => shops.filter((s) => s.type === 'Cafe').slice(0, 3),
  },
]

export function buildDayFromPreset(preset: DayPreset, shops: Shop[]): Shop[] {
  return preset.pick(shops)
}
