import type { ReactNode } from 'react'

interface PhoneFrameProps {
  children: ReactNode
  /** Right-side annotations (visible only on desktop) */
  annotations?: { emoji: string; title: string; body: string }[]
  /** Show "feels like app" on desktop. On mobile we render children directly. */
  enabled?: boolean
}

/**
 * Wraps walker/owner mode in an iPhone-like mockup on DESKTOP only,
 * so the experience looks like a phone app — not a dashboard.
 * On mobile (≤880px) the frame is hidden and children render fullscreen
 * (because the user *is* on a phone).
 *
 * Annotations on the right side provide pitch context for council judges
 * without polluting the walker UI itself.
 */
export function PhoneFrame({ children, annotations, enabled = true }: PhoneFrameProps) {
  if (!enabled) return <>{children}</>
  return (
    <div className="cc-phone-stage">
      <div className="cc-phone-frame">
        <div className="cc-phone-notch" aria-hidden="true">
          <span className="cc-phone-dot" />
        </div>
        <div className="cc-phone-screen">{children}</div>
        <div className="cc-phone-home-indicator" aria-hidden="true" />
      </div>
      {annotations && annotations.length > 0 && (
        <aside className="cc-phone-annotations" aria-label="Design context">
          <div className="cc-phone-ann-title">What you're looking at</div>
          {annotations.map((a, i) => (
            <div key={i} className="cc-phone-ann">
              <span className="cc-phone-ann-emoji" aria-hidden="true">{a.emoji}</span>
              <div>
                <b>{a.title}</b>
                <p>{a.body}</p>
              </div>
            </div>
          ))}
        </aside>
      )}
    </div>
  )
}
