export type AppMode = 'walk' | 'shop' | 'council'

interface ModeToggleProps {
  mode: AppMode
  setMode: (m: AppMode) => void
}

const HINTS: Record<AppMode, string> = {
  walk: 'Locals · earn pts by walking, biking, scooting',
  shop: "Shop owners · plan today's campaign",
  council: 'Council · live policy levers + outcomes',
}

export function ModeToggle({ mode, setMode }: ModeToggleProps) {
  return (
    <div className="cc-mode">
      <div className="cc-mode-segments" role="tablist" aria-label="App mode">
        <button
          className={mode === 'walk' ? 'is-active' : ''}
          onClick={() => setMode('walk')}
          role="tab"
          aria-selected={mode === 'walk'}
          aria-controls="mode-panel"
        >
          🚶 Walk to Earn
        </button>
        <button
          className={mode === 'shop' ? 'is-active' : ''}
          onClick={() => setMode('shop')}
          role="tab"
          aria-selected={mode === 'shop'}
          aria-controls="mode-panel"
        >
          🛍️ Shop Booster
        </button>
        <button
          className={mode === 'council' ? 'is-active' : ''}
          onClick={() => setMode('council')}
          role="tab"
          aria-selected={mode === 'council'}
          aria-controls="mode-panel"
        >
          📊 Council View
        </button>
      </div>
      <div className="cc-mode-hint">{HINTS[mode]}</div>
    </div>
  )
}
