import type { AppMode } from './ModeToggle'

interface MobileNavProps {
  mode: AppMode
  setMode: (m: AppMode) => void
}

/**
 * Bottom nav — mobile-only (hidden on desktop via CSS @media >= 880px).
 * Inspired by stitch_catto_compass design mockup.
 */
export function MobileNav({ mode, setMode }: MobileNavProps) {
  const items: { id: AppMode; emoji: string; label: string }[] = [
    { id: 'walk', emoji: '🚶', label: 'Walk' },
    { id: 'shop', emoji: '🛍️', label: 'Shop' },
    { id: 'council', emoji: '📊', label: 'Council' },
  ]
  return (
    <nav className="cc-mobile-nav" aria-label="Primary">
      {items.map((it) => (
        <button
          key={it.id}
          className={`cc-mn-item ${mode === it.id ? 'is-active' : ''}`}
          onClick={() => setMode(it.id)}
          aria-current={mode === it.id ? 'page' : undefined}
        >
          <span className="cc-mn-emoji">{it.emoji}</span>
          <span className="cc-mn-label">{it.label}</span>
        </button>
      ))}
    </nav>
  )
}
