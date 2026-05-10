import type { VitalCard } from '../types/campaign'

/**
 * Static fallback Vitals strip — used when real APIs (Open-Meteo, Overpass)
 * fail or while loading. Real values overwrite these via hooks.
 */
export const FALLBACK_VITALS: VitalCard[] = [
  {
    id: 'weather',
    emoji: '🌤️',
    num: '—',
    label: 'Weather',
    sub: 'Loading…',
    accent: '#5B9BD5',
    bg: 'rgba(91,155,213,.14)',
    isLive: true,
    source: 'open-meteo.com',
  },
  {
    id: 'station',
    emoji: '🚇',
    num: '47.8K',
    label: 'Station · Daily avg',
    sub: 'Opal taps · TfNSW Aug 2024',
    accent: '#7BC97F',
    bg: 'rgba(123,201,127,.14)',
    isLive: false,
    source: 'TfNSW Opal monthly aggregate',
  },
  {
    id: 'comp',
    emoji: '🏪',
    num: '—',
    small: '/—',
    label: 'Cafes · 700m',
    sub: 'Loading from OSM…',
    accent: '#B49EFB',
    bg: 'rgba(180,158,251,.14)',
    isLive: true,
    source: 'overpass-api.de',
  },
  {
    id: 'events',
    emoji: '📅',
    num: '—',
    label: 'Today',
    sub: 'Loading…',
    accent: '#F5C842',
    bg: 'rgba(245,200,66,.18)',
    isLive: true,
  },
]
