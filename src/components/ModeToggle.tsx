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
      <div className="cc-mode-segments" role="tablist">
        <button className={mode === 'walk' ? 'is-active' : ''} onClick={() => setMode('walk')} role="tab">
          🚶 Walk to Earn
        </button>
        <button className={mode === 'shop' ? 'is-active' : ''} onClick={() => setMode('shop')} role="tab">
          🛍️ Shop Booster
        </button>
        <button className={mode === 'council' ? 'is-active' : ''} onClick={() => setMode('council')} role="tab">
          📊 Council View
        </button>
      </div>
      <div className="cc-mode-hint">{HINTS[mode]}</div>
    </div>
  )
}
