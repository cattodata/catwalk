import type { OpenMeteoResponse, WeatherSummary } from '../types/weather'
import { CHATSWOOD } from '../config/chatswood'

const ENDPOINT = 'https://api.open-meteo.com/v1/forecast'

export async function fetchWeather(signal?: AbortSignal): Promise<OpenMeteoResponse> {
  const params = new URLSearchParams({
    latitude: String(CHATSWOOD.weather.lat),
    longitude: String(CHATSWOOD.weather.lng),
    current: 'temperature_2m,weather_code,wind_speed_10m',
    daily: 'temperature_2m_max,temperature_2m_min,precipitation_sum,weather_code',
    timezone: CHATSWOOD.weather.timezone,
  })
  const res = await fetch(`${ENDPOINT}?${params}`, { signal })
  if (!res.ok) throw new Error(`Open-Meteo ${res.status}`)
  return res.json()
}

/**
 * WMO weather codes → emoji + label.
 * https://open-meteo.com/en/docs (search "weather variable documentation")
 */
function codeToDisplay(code: number): { emoji: string; label: string; isRain: boolean } {
  if (code === 0) return { emoji: '☀️', label: 'Clear sky', isRain: false }
  if (code <= 3) return { emoji: '⛅', label: 'Partly cloudy', isRain: false }
  if (code <= 48) return { emoji: '🌫️', label: 'Foggy', isRain: false }
  if (code <= 57) return { emoji: '🌦️', label: 'Drizzle', isRain: true }
  if (code <= 67) return { emoji: '🌧️', label: 'Rain', isRain: true }
  if (code <= 77) return { emoji: '🌨️', label: 'Snow', isRain: false }
  if (code <= 82) return { emoji: '🌧️', label: 'Showers', isRain: true }
  if (code <= 86) return { emoji: '🌨️', label: 'Snow showers', isRain: false }
  if (code <= 99) return { emoji: '⛈️', label: 'Thunderstorm', isRain: true }
  return { emoji: '🌤️', label: 'Mild', isRain: false }
}

export function summarizeWeather(data: OpenMeteoResponse): WeatherSummary {
  const c = data.current
  const display = codeToDisplay(c.weather_code)
  const precipitation = data.daily.precipitation_sum?.[0] ?? 0
  return {
    temp: Math.round(c.temperature_2m),
    code: c.weather_code,
    emoji: display.emoji,
    label: display.label,
    precipitation,
    isRain: display.isRain || precipitation > 0.5,
    isHot: c.temperature_2m >= 28,
    isCold: c.temperature_2m <= 12,
  }
}
