import { useEffect } from 'react'
import confetti from 'canvas-confetti'

const COLORS = ['#FF6B9D', '#F5C842', '#7BC97F', '#B49EFB', '#5B9BD5']

/**
 * Two-shot canvas-confetti burst on mount. Used for Reward · Payoff moment.
 */
export function ConfettiBurst() {
  useEffect(() => {
    // Honour user's reduced-motion preference (a11y)
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return

    const fire = (angle: number, originX: number) => {
      confetti({
        particleCount: 80,
        angle,
        spread: 70,
        startVelocity: 38,
        decay: 0.92,
        scalar: 1,
        colors: COLORS,
        origin: { x: originX, y: 0.6 },
        zIndex: 1000,
      })
    }
    fire(60, 0.25)
    const t = setTimeout(() => fire(120, 0.75), 120)
    return () => clearTimeout(t)
  }, [])
  return null
}
