import type { BoostedStreet } from '../types/shop'
import type { Strategy } from '../types/campaign'

/** Council policy levers — boosted street multipliers. Real council can edit these. */
export const BOOSTED_STREETS: BoostedStreet[] = [
  { name: 'Help St',   mult: 4, until: '4:00 PM', reason: 'Underserved · 2024 Discussion Paper' },
  { name: 'Spring St', mult: 3, until: '6:00 PM', reason: 'East-side foot-traffic gap' },
]

/** Strategy taxonomy — Claude picks one as "Chosen" per campaign */
export const STRATEGIES: Strategy[] = [
  { id: 'discount', emoji: '🎯', name: 'Discount',  desc: 'Cut price to drive volume' },
  { id: 'bundle',   emoji: '📦', name: 'Bundle',    desc: 'Lift average basket size' },
  { id: 'traffic',  emoji: '🚇', name: 'Traffic',   desc: 'Capture station flow' },
  { id: 'stock',    emoji: '🧹', name: 'Stock',     desc: 'Move slow inventory' },
  { id: 'aware',    emoji: '📢', name: 'Awareness', desc: 'Build long-term brand' },
]

export const COUNCIL_OUTCOMES = [
  { em: '🌱', b: 'Outcome 1 · Green city',                t: 'Net Zero 2025 — every walk logs CO₂ saved, visible in the reward card.' },
  { em: '🌏', b: 'Outcome 2 · Connected & inclusive',     t: 'Every campaign in EN + 中文 + 한국어 — serving the 40% Chinese & 8% Korean demographic.' },
  { em: '💰', b: 'Outcome 4 · Prosperous & vibrant',      t: 'Revives the CBD per the 2024 Discussion Paper. Multipliers steer foot-traffic to underserved streets.' },
]

export const DATA_SOURCES = [
  { label: 'Open-Meteo · live weather API',                          url: 'https://open-meteo.com/' },
  { label: 'ABS 2021 Census · Chatswood demographics',                url: 'https://www.abs.gov.au/census/find-census-data' },
  { label: 'TfNSW · Opal taps · monthly aggregate',                  url: 'https://opendata.transport.nsw.gov.au/dataset/opal-trips-train' },
  { label: 'OpenStreetMap / Overpass · live cafe + restaurant counts', url: 'https://overpass-api.de/' },
  { label: 'Anthropic Claude · vision + multilingual generation',    url: 'https://www.anthropic.com/claude' },
  { label: 'Browser Geolocation API · walk verification',             url: 'https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API' },
  { label: 'Supabase · realtime walks aggregation',                   url: 'https://supabase.com/' },
]
