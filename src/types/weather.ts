export interface OpenMeteoCurrent {
  time: string
  interval: number
  temperature_2m: number
  weather_code: number
  wind_speed_10m: number
}

export interface OpenMeteoDaily {
  time: string[]
  temperature_2m_max: number[]
  temperature_2m_min: number[]
  precipitation_sum: number[]
  weather_code: number[]
}

export interface OpenMeteoResponse {
  latitude: number
  longitude: number
  timezone: string
  current: OpenMeteoCurrent
  current_units: Record<string, string>
  daily: OpenMeteoDaily
  daily_units: Record<string, string>
}

export interface WeatherSummary {
  temp: number
  code: number
  emoji: string
  label: string
  precipitation: number
  isRain: boolean
  isHot: boolean
  isCold: boolean
}
