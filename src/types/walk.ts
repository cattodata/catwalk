import type { TransportId } from './shop'

export interface WalkRecord {
  id: string
  user_id: string
  shop_id: string
  transport_mode: TransportId
  distance_m: number
  co2_saved_kg: number
  points_earned: number
  verified_geolocation: boolean
  start_lat: number | null
  start_lng: number | null
  end_lat: number | null
  end_lng: number | null
  created_at: string
}

export interface CouncilStats {
  total_walks: number
  total_co2: number
  walking_now: number
  unique_users: number
  top_streets: { street: string; count: number; pct: number; boosted?: boolean }[]
  daily_spark: number[]
  lang_reach: { en: number; zh: number; ko: number }
}
