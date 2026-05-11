export interface AbOption {
  copy: string
  predRevenue: number
  confidence: number
}

export interface AbResult {
  optionA: AbOption
  optionB: AbOption
  winner: 'a' | 'b'
  source: 'live' | 'mock'
}

interface AbInput {
  bizType: 'Cafe' | 'Restaurant' | 'Bakery'
  weather?: { temp: number; label: string; isRain: boolean }
  hour: number
  dayOfWeek: number
  shopName?: string
}

const STATIC_FALLBACK: AbResult = {
  optionA: { copy: '15% off till 7pm', predRevenue: 185, confidence: 78 },
  optionB: { copy: 'Free croissant w/ coffee', predRevenue: 285, confidence: 84 },
  winner: 'b',
  source: 'mock',
}

export async function fetchAbForecast(input: AbInput): Promise<AbResult> {
  try {
    const res = await fetch('/api/claude-ab', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(input),
    })
    if (!res.ok) return STATIC_FALLBACK
    return (await res.json()) as AbResult
  } catch {
    return STATIC_FALLBACK
  }
}
