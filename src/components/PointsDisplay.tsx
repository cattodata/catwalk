import { useEffect } from 'react'
import { motion, useMotionValue, useTransform, animate } from 'framer-motion'

/**
 * Counter animation 0 → {value} with framer-motion spring.
 * Renders "+{n} pts" — the `+` and unit are static, the number animates.
 */
export function PointsDisplay({ value }: { value: number }) {
  const mv = useMotionValue(0)
  const rounded = useTransform(mv, (latest) => `${Math.round(latest)}`)

  useEffect(() => {
    mv.set(0)
    const controls = animate(mv, value, {
      type: 'spring',
      stiffness: 100,
      damping: 14,
      duration: 0.8,
    })
    return () => controls.stop()
  }, [value, mv])

  return (
    <h2 className="cc-pts">
      +<motion.span>{rounded}</motion.span>
      <small> pts</small>
    </h2>
  )
}
