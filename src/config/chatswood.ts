/**
 * Multi-tenant config: each city/pilot gets its own file.
 * Path: /pilot/[city] reads from this. V1 is hardcoded to Chatswood.
 */
export const CHATSWOOD = {
  slug: 'chatswood',
  name: 'Chatswood',
  council: 'Willoughby City Council',
  state: 'NSW',
  country: 'Australia',

  /** Train station (geofence center) */
  station: {
    name: 'Chatswood Station',
    lat: -33.7969,
    lng: 151.1804,
    /** SVG map coords */
    x: 350,
    y: 340,
  },

  /** Map SVG dimensions */
  map: {
    viewBox: '0 0 700 520',
    width: 700,
    height: 520,
    mobileBreakpoint: 880,
  },

  /** ABS SA2 codes for census lookups */
  absSa2: {
    east: '121011404',
    west: '121011405',
    label: 'Chatswood (East) - Artarmon',
  },

  /** Open-Meteo lat/lng (same as station) */
  weather: {
    lat: -33.7969,
    lng: 151.1804,
    timezone: 'Australia/Sydney',
  },

  /** OSM Overpass radius for competitor counts */
  overpass: {
    radius_m: 700,
  },

  /** Animation timings (ms) — from Spec §22.1 */
  timings: {
    walk: 3500,
    scan: 2400,
    copyFeedback: 1600,
    scoreAnimate: 1100,
    revenueAnimate: 1400,
  },

  /** Geolocation verification radius — bumped to 100m for indoor Wi-Fi accuracy */
  geofence_m: 100,
}

export type CityConfig = typeof CHATSWOOD
