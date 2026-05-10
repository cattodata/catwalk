import type { Campaign } from '../types/campaign'
import type { BizType } from '../types/shop'
import type { WeatherSummary } from '../types/weather'

export interface GenerateCampaignArgs {
  photoBase64: string
  photoMime: string
  bizType: BizType
  weather: WeatherSummary | null
  /** 0-23 in Sydney time */
  hour: number
  /** 0=Sun..6=Sat */
  dayOfWeek: number
  shopName?: string
  competitorCounts?: { cafes: number; restaurants: number; bakeries: number }
  /** ABS demographics for context */
  demographics?: { population: number; chinese_pct: number; korean_pct: number }
}

export interface GenerateCampaignResponse {
  campaign: Campaign
  source: 'live' | 'mock'
  durationMs: number
}

/**
 * Calls our Vercel Function `/api/claude` which proxies Anthropic.
 * Server holds the API key — never exposed to browser bundle.
 */
export async function generateCampaign(
  args: GenerateCampaignArgs,
  signal?: AbortSignal,
): Promise<GenerateCampaignResponse> {
  const res = await fetch('/api/claude', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(args),
    signal,
  })
  if (!res.ok) {
    const errBody = await res.text().catch(() => '')
    throw new Error(`/api/claude ${res.status}: ${errBody.slice(0, 200)}`)
  }
  return res.json()
}
