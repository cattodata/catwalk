import type { ReactNode } from 'react'

interface Props {
  children: ReactNode
  /** Variant adjusts background + text color */
  tone?: 'dark' | 'light' | 'gradient'
  /** Show pulsing gold dot prefix */
  dot?: boolean
  className?: string
}

/**
 * The single AI-signature pill used across all v5 screens — black rounded
 * 99px pill, JetBrains Mono 10px uppercase, with optional pulsing gold dot.
 * This is the cross-screen visual identity for "Catto is at work".
 */
export function CattoPill({ children, tone = 'dark', dot = true, className }: Props) {
  return (
    <span className={`cc-ai-pill cc-ai-pill-${tone}${className ? ` ${className}` : ''}`}>
      {dot && <span className="cc-ai-pill-dot" aria-hidden="true" />}
      {children}
    </span>
  )
}
