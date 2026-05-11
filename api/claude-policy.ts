import type { VercelRequest, VercelResponse } from '@vercel/node'

/**
 * POST /api/claude/policy
 * Council Sandbox AI suggestion — given slider lever positions + current stats,
 * returns one natural-language policy suggestion. Backed by Azure OpenAI
 * gpt-4.1-nano. Falls back to deterministic suggestion if Azure errors.
 */

interface ReqBody {
  leverParkingPct: number      // e.g. -20 (percentage change)
  leverBikeMult: number        // e.g. 3 (multiplier)
  leverRewardBudget: number    // e.g. 2 ($k/wk)
  currentWalks?: number
  currentCo2Kg?: number
}

interface PolicyResult {
  suggestion: string
  source: 'live' | 'mock'
}

const FALLBACK: PolicyResult = {
  suggestion:
    'Pair with weekend market shuttle on Spring St. +6% mode-share @ $9k/mo — payback 4 mo via biz rate uplift.',
  source: 'mock',
}

function buildPrompt(b: ReqBody): string {
  return `You are Catto Compass — a hyperlocal civic-AI advising Willoughby City Council (Chatswood NSW).

Current policy levers (12-month simulation):
- Parking on Victoria Ave: ${b.leverParkingPct}%
- Bike multiplier on Help St: ${b.leverBikeMult}×
- Walker reward budget: $${b.leverRewardBudget}k/wk

Current pilot stats:
- Total walks logged: ${b.currentWalks ?? 1247}
- CO₂ saved: ${(b.currentCo2Kg ?? 84.6).toFixed(1)} kg

Suggest ONE complementary policy initiative (1 sentence, max 200 chars). Be concrete (street name, time window, $ figure, % uplift, payback period). Stay grounded in Chatswood context. No markdown, no quotes, plain text only.`
}

async function callAzure(b: ReqBody): Promise<PolicyResult | null> {
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
      max_tokens: 200,
      temperature: 0.6,
    }),
  })
  if (!res.ok) return null
  const data = (await res.json()) as { choices: { message: { content: string } }[] }
  const text = data.choices?.[0]?.message?.content?.trim() ?? ''
  if (!text) return null
  return { suggestion: text, source: 'live' }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' })

  const body = (req.body ?? {}) as ReqBody
  try {
    const live = await callAzure(body)
    if (live) return res.status(200).json(live)
  } catch (err) {
    console.warn('claude-policy azure failed:', err)
  }
  return res.status(200).json(FALLBACK)
}
