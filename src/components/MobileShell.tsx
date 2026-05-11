import type { ReactNode } from 'react'

/**
 * Mobile-first shell — 393×852 (iPhone 14 baseline). Centered on desktop.
 * Each screen renders inside this. min-height: 100dvh handles iOS safely.
 */
export function MobileShell({ children, bg }: { children: ReactNode; bg?: string }) {
  return (
    <div className="cc-mshell" style={bg ? { background: bg } : undefined}>
      <div className="cc-mshell-inner">{children}</div>
    </div>
  )
}
