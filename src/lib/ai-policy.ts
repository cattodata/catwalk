export interface PolicyResult {
  suggestion: string
  source: 'live' | 'mock'
}

interface PolicyInput {
  leverParkingPct: number
  leverBikeMult: number
  leverRewardBudget: number
  currentWalks?: number
  currentCo2Kg?: number
}

const FALLBACK: PolicyResult = {
  suggestion:
    'Pair with weekend market shuttle on Spring St. +6% mode-share @ $9k/mo — payback 4 mo via biz rate uplift.',
  source: 'mock',
}

export async function fetchPolicySuggestion(input: PolicyInput): Promise<PolicyResult> {
  try {
    const res = await fetch('/api/claude-policy', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(input),
    })
    if (!res.ok) return FALLBACK
    return (await res.json()) as PolicyResult
  } catch {
    return FALLBACK
  }
}
