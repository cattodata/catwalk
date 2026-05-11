import { useEffect } from 'react'
import { motion, useMotionValue, useTransform, animate } from 'framer-motion'

interface Props {
  value: number
  /** Number of decimal places (e.g. 1 for "84.6") */
  decimals?: number
  /** Prefix/suffix (e.g. "$", " kg") */
  prefix?: string
  suffix?: string
  /** Optional formatter (overrides decimals) */
  format?: (v: number) => string
  className?: string
}

/**
 * framer-motion counter — animates from 0 → value with spring physics.
 * Used in Council "Walking right now" hero counters.
 */
export function AnimatedCounter({ value, decimals = 0, prefix = '', suffix = '', format, className }: Props) {
  const mv = useMotionValue(0)
  const rounded = useTransform(mv, (latest) =>
    format
      ? format(latest)
      : `${prefix}${decimals > 0 ? latest.toFixed(decimals) : Math.round(latest).toLocaleString()}${suffix}`,
  )

  useEffect(() => {
    mv.set(0)
    const controls = animate(mv, value, {
      type: 'spring',
      stiffness: 80,
      damping: 18,
    })
    return () => controls.stop()
  }, [value, mv])

  return <motion.span className={className}>{rounded}</motion.span>
}
