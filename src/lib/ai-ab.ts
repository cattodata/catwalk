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

function clientFallback(input: AbInput): AbResult {
  const jitter = (input.hour * 7 + (input.weather?.isRain ? 13 : 0)) % 11 - 5
  const rainBump = input.weather?.isRain ? 20 : 0
  return {
    optionA: { copy: '15% off till 7pm', predRevenue: 185 + jitter, confidence: 78 },
    optionB: {
      copy: input.weather?.isRain ? 'Free brown sugar boba w/ milk tea' : 'Buy 1 pearl milk tea get 1 half',
      predRevenue: 285 + jitter + rainBump,
      confidence: 84,
    },
    winner: 'b',
    source: 'mock',
  }
}

export async function fetchAbForecast(input: AbInput): Promise<AbResult> {
  try {
    const res = await fetch('/api/claude-ab', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(input),
    })
    if (!res.ok) return clientFallback(input)
    return (await res.json()) as AbResult
  } catch {
    return clientFallback(input)
  }
}
