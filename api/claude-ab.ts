import type { VercelRequest, VercelResponse } from '@vercel/node'

/**
 * POST /api/claude/ab
 * Owner A/B test prediction — given current signals, returns 2 offer options
 * with predicted revenue + confidence + which one wins. Backed by Azure OpenAI
 * gpt-4.1-nano (same deployment as /api/claude). Falls back to deterministic
 * pick from STRATEGIES if Azure errors.
 */

interface ReqBody {
  bizType: 'Cafe' | 'Restaurant' | 'Bakery'
  weather?: { temp: number; label: string; isRain: boolean }
  hour: number
  dayOfWeek: number
  shopName?: string
}

interface AbOption {
  copy: string
  predRevenue: number
  confidence: number
}

interface AbResult {
  optionA: AbOption
  optionB: AbOption
  winner: 'a' | 'b'
  source: 'live' | 'mock'
}

const FALLBACK_BY_BIZ: Record<ReqBody['bizType'], AbResult> = {
  Cafe: {
    optionA: { copy: '15% off till 7pm', predRevenue: 185, confidence: 78 },
    optionB: { copy: 'Free croissant w/ coffee', predRevenue: 285, confidence: 84 },
    winner: 'b',
    source: 'mock',
  },
  Restaurant: {
    optionA: { copy: 'Lunch combo $14.90', predRevenue: 220, confidence: 76 },
    optionB: { copy: 'Free dessert w/ main', predRevenue: 310, confidence: 81 },
    winner: 'b',
    source: 'mock',
  },
  Bakery: {
    optionA: { copy: '2-for-1 pastries 3-5pm', predRevenue: 165, confidence: 80 },
    optionB: { copy: 'Coffee + croissant $8.50', predRevenue: 240, confidence: 86 },
    winner: 'b',
    source: 'mock',
  },
}

function buildPrompt(b: ReqBody): string {
  const dayName = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][b.dayOfWeek]
  const w = b.weather
    ? `${b.weather.temp}°C ${b.weather.label}${b.weather.isRain ? ' (raining)' : ''}`
    : 'unknown weather'
  return `You are a hyperlocal marketing AI for Chatswood NSW small businesses. Given current signals, propose two competing offers (A and B) for the next 2 hours.

Signals:
- Business: ${b.bizType}${b.shopName ? ` (${b.shopName})` : ''}
- Time: ${dayName} ${b.hour}:00 Sydney
- Weather: ${w}

Return STRICT JSON only, no markdown, exactly this shape:
{
  "optionA": { "copy": "<short offer text 4-7 words>", "predRevenue": <integer AUD 100-500>, "confidence": <integer 50-95> },
  "optionB": { "copy": "<short offer text 4-7 words>", "predRevenue": <integer AUD 100-500>, "confidence": <integer 50-95> },
  "winner": "a" or "b"
}

Make A safer (lower revenue, moderate confidence) and B bolder (higher revenue, higher confidence — but only if signals justify it). Winner = whichever has higher predRevenue.`
}

async function callAzure(b: ReqBody): Promise<AbResult | null> {
  const endpoint = process.env.AZURE_OPENAI_ENDPOINT
  const apiKey = process.env.AZURE_OPENAI_API_KEY
  const deployment = process.env.AZURE_OPENAI_DEPLOYMENT
  if (!endpoint || !apiKey || !deployment) return null

  const url = `${endpoint.replace(/\/$/, '')}/openai/deployments/${deployment}/chat/completions?api-version=2024-08-01-preview`

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'api-key': apiKey },
    body: JSON.stringify({
      messages: [{ role: 'user', content: buildPrompt(b) }],
      response_format: { type: 'json_object' },
      max_tokens: 300,
      temperature: 0.7,
    }),
  })
  if (!res.ok) return null
  const data = (await res.json()) as { choices: { message: { content: string } }[] }
  const text = data.choices?.[0]?.message?.content ?? ''
  try {
    const parsed = JSON.parse(text)
    if (parsed.optionA?.copy && parsed.optionB?.copy) {
      return { ...parsed, source: 'live' } as AbResult
    }
  } catch {
    /* fall through */
  }
  return null
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' })

  const body = (req.body ?? {}) as ReqBody
  if (!body.bizType) return res.status(400).json({ error: 'bizType required' })

  try {
    const live = await callAzure(body)
    if (live) return res.status(200).json(live)
  } catch (err) {
    console.warn('claude-ab azure failed:', err)
  }
  return res.status(200).json(FALLBACK_BY_BIZ[body.bizType] ?? FALLBACK_BY_BIZ.Cafe)
}
