/**
 * Multi-suburb pilot configs. Each entry drives:
 *   - Open-Meteo weather (lat/lng)
 *   - OSM Overpass shop + competitor queries (lat/lng + radius)
 *   - ABS Census 2021 demographic lookup (SA2 codes)
 *   - Azure Maps tile center
 *   - Council branding
 *   - Supabase aggregation slug (`cc:cityId`)
 *
 * "Real-time" parts (weather, OSM Overpass) are queried per-city per-mount.
 * "Cached" parts (ABS Census) are static per-SA2.
 */
import { CHATSWOOD, type CityConfig } from './chatswood'

const MACQUARIE_PARK: CityConfig = {
  slug: 'macquarie-park',
  name: 'Macquarie Park',
  council: 'City of Ryde',
  state: 'NSW',
  country: 'Australia',
  station: { name: 'Macquarie Park Station', lat: -33.7773, lng: 151.1252, x: 350, y: 340 },
  map: { viewBox: '0 0 700 520', width: 700, height: 520, mobileBreakpoint: 880 },
  absSa2: { east: '120031385', west: '120031386', label: 'Macquarie Park - Marsfield' },
  weather: { lat: -33.7773, lng: 151.1252, timezone: 'Australia/Sydney' },
  overpass: { radius_m: 800 },
  timings: CHATSWOOD.timings,
  geofence_m: 120,
}

const PARRAMATTA: CityConfig = {
  slug: 'parramatta',
  name: 'Parramatta',
  council: 'City of Parramatta',
  state: 'NSW',
  country: 'Australia',
  station: { name: 'Parramatta Station', lat: -33.8175, lng: 151.0027, x: 350, y: 340 },
  map: { viewBox: '0 0 700 520', width: 700, height: 520, mobileBreakpoint: 880 },
  absSa2: { east: '125021501', west: '125021502', label: 'Parramatta - Rosehill' },
  weather: { lat: -33.8175, lng: 151.0027, timezone: 'Australia/Sydney' },
  overpass: { radius_m: 900 },
  timings: CHATSWOOD.timings,
  geofence_m: 100,
}

const ST_LEONARDS: CityConfig = {
  slug: 'st-leonards',
  name: 'St Leonards',
  council: 'North Sydney Council',
  state: 'NSW',
  country: 'Australia',
  station: { name: 'St Leonards Station', lat: -33.8231, lng: 151.1948, x: 350, y: 340 },
  map: { viewBox: '0 0 700 520', width: 700, height: 520, mobileBreakpoint: 880 },
  absSa2: { east: '121011411', west: '121011412', label: 'St Leonards - Naremburn' },
  weather: { lat: -33.8231, lng: 151.1948, timezone: 'Australia/Sydney' },
  overpass: { radius_m: 700 },
  timings: CHATSWOOD.timings,
  geofence_m: 90,
}

export const CITIES: Record<string, CityConfig> = {
  chatswood: CHATSWOOD,
  'macquarie-park': MACQUARIE_PARK,
  parramatta: PARRAMATTA,
  'st-leonards': ST_LEONARDS,
}

export const CITY_LIST: CityConfig[] = [CHATSWOOD, MACQUARIE_PARK, PARRAMATTA, ST_LEONARDS]

const CITY_STORAGE_KEY = 'cc:cityId'

export function getActiveCityId(): string {
  if (typeof window === 'undefined') return CHATSWOOD.slug
  const v = window.localStorage.getItem(CITY_STORAGE_KEY)
  return v && v in CITIES ? v : CHATSWOOD.slug
}

export function setActiveCityId(id: string): void {
  if (typeof window === 'undefined') return
  if (id in CITIES) window.localStorage.setItem(CITY_STORAGE_KEY, id)
}

export function getActiveCity(): CityConfig {
  return CITIES[getActiveCityId()] ?? CHATSWOOD
}
