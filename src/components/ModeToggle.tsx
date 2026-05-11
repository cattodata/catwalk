export type AppMode = 'walk' | 'shop' | 'council'

interface ModeToggleProps {
  mode: AppMode
  setMode: (m: AppMode) => void
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
          aria-controls="main-content"
        >
          🚶 Walk
        </button>
        <button
          className={mode === 'shop' ? 'is-active' : ''}
          onClick={() => setMode('shop')}
          role="tab"
          aria-selected={mode === 'shop'}
          aria-controls="main-content"
        >
          🛍️ For Owners
        </button>
        <button
          className={mode === 'council' ? 'is-active' : ''}
          onClick={() => setMode('council')}
          role="tab"
          aria-selected={mode === 'council'}
          aria-controls="main-content"
        >
          📊 Pilot Stats
        </button>
      </div>
    </div>
  )
}
