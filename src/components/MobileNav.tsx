import type { AppMode } from './ModeToggle'

interface MobileNavProps {
  mode: AppMode
  setMode: (m: AppMode) => void
}

/**
 * Bottom nav — mobile-only (hidden on desktop via CSS @media >= 880px).
 */
export function MobileNav({ mode, setMode }: MobileNavProps) {
  const items: { id: AppMode; emoji: string; label: string }[] = [
    { id: 'walk', emoji: '🚶', label: 'Walk' },
    { id: 'shop', emoji: '🛍️', label: 'Owners' },
    { id: 'council', emoji: '📊', label: 'Stats' },
  ]
  return (
    <nav className="cc-mobile-nav" aria-label="Primary">
      {items.map((it) => (
        <button
          key={it.id}
          className={`cc-mn-item ${mode === it.id ? 'is-active' : ''}`}
          onClick={() => setMode(it.id)}
          aria-current={mode === it.id ? 'page' : undefined}
          type="button"
        >
          <span className="cc-mn-emoji" aria-hidden="true">{it.emoji}</span>
          <span className="cc-mn-label">{it.label}</span>
        </button>
      ))}
    </nav>
  )
}
