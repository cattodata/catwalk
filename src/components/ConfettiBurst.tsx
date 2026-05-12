import { useEffect } from 'react'
import confetti from 'canvas-confetti'

const COLORS = ['#FF6B9D', '#F5C842', '#7BC97F', '#B49EFB', '#5B9BD5']

/**
 * Single-shot canvas-confetti burst on mount. v5.5: reduced from 2 shots
 * × 80 particles → 1 shot × 40 with faster decay for a calmer payoff.
 */
export function ConfettiBurst() {
  useEffect(() => {
    // Honour user's reduced-motion preference (a11y)
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return

    confetti({
      particleCount: 40,
      angle: 90,
      spread: 120,
      startVelocity: 30,
      decay: 0.95,
      scalar: 1,
      colors: COLORS,
      origin: { x: 0.5, y: 0.35 },
      zIndex: 1000,
    })
  }, [])
  return null
}
