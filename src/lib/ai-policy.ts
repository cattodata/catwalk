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

/** Quadrant-aware deterministic fallback. Varies by lever combination so
 *  the demo doesn't repeat the same string when judges play with sliders. */
function localFallback(input: PolicyInput): PolicyResult {
  const parkingHeavy = input.leverParkingPct <= -20
  const bikeHeavy = input.leverBikeMult >= 3
  const budgetHeavy = input.leverRewardBudget >= 2.5

  let suggestion = 'Pair with weekend market shuttle on Spring St. +6% mode-share @ $9k/mo — payback 4 mo via biz rate uplift.'
  if (parkingHeavy && bikeHeavy) {
    suggestion = 'Pair Victoria Ave parking restriction with secure Help St bike-cage (180 spaces, $42k cap-ex) — captures +14% mode-share, payback 7 mo.'
  } else if (parkingHeavy) {
    suggestion = 'Replace 1-in-3 Victoria Ave spaces with parklets (4 weekday cafes adjacent) — adds 320 sqm trading space, +$84k/yr biz rates.'
  } else if (bikeHeavy) {
    suggestion = 'Add Help St → Concourse bike corridor signalling ($120k Capex) — +9% bike share, eligible for Active Transport Grant 50% match.'
  } else if (budgetHeavy) {
    suggestion = 'Top-up walker rewards with Wednesday lunch double-multiplier on Spring St (low-baseline day) — projected +180 walks/wk @ $1.6k/wk.'
  } else if (input.leverParkingPct >= 10) {
    suggestion = 'Hold parking, pilot Saturday-only Spring St pedestrianisation 11am–4pm. Cost-neutral. Measure shop foot-traffic delta over 6 Saturdays.'
  }
  return { suggestion, source: 'mock' }
}

export async function fetchPolicySuggestion(input: PolicyInput): Promise<PolicyResult> {
  try {
    const res = await fetch('/api/claude-policy', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(input),
    })
    if (!res.ok) return localFallback(input)
    return (await res.json()) as PolicyResult
  } catch {
    return localFallback(input)
  }
}
