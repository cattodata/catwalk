export type BizType = 'Cafe' | 'Restaurant' | 'Bakery'
export type CuisineId = 'all' | 'Asian' | 'Western' | 'Drinks' | 'Sweets'
export type ShopTag = 'Halal' | 'Vegan' | 'Late-night'
export type TransportId = 'walk' | 'bike' | 'scoot' | 'bus' | 'ev'

export interface Shop {
  id: string
  name: string
  emoji: string
  type: BizType
  cuisine: Exclude<CuisineId, 'all'>
  tags: ShopTag[]
  mult: 1 | 2 | 3
  x: number
  y: number
  dist: number
  mins: number
  pts: number
  off: number
  co2: number
  route: [number, number][]
  /** Real-world coordinates for Geolocation verification */
  lat?: number
  lng?: number
  /** Street name for council aggregation */
  street?: string
  /** 1.0–5.0 Google Places rating (real when API key set, else deterministic seed) */
  rating?: number
  /** Google Places user_ratings_total */
  reviewCount?: number
  /** 1–4 = $ to $$$$ */
  priceLevel?: 1 | 2 | 3 | 4
  /** Provenance flag — true when rating came from Google Places API */
  ratingReal?: boolean
}

export interface CuisineOption {
  id: CuisineId
  label: string
  emoji: string
}

export interface Transport {
  id: TransportId
  emoji: string
  label: string
  co2Mult: number
  ptsMult: number
  speed: number
  driveCost: number
  hint: string
}

export interface Landmark {
  id: string
  name: string
  fill: string
  x: number
  y: number
  w: number
  h: number
  icon: string
}

export interface BikeRack {
  x: number
  y: number
}

export interface HeatmapBlob {
  x: number
  y: number
  r: number
  intensity: number
  label: string
}

export interface BoostedStreet {
  name: string
  mult: number
  until: string
  reason: string
}

export interface CO2Tier {
  id: 'sprout' | 'bronze' | 'silver' | 'gold'
  label: string
  emoji: string
  min: number
  next: number | null
  color: string
}
