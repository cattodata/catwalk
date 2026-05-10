interface HeaderProps {
  totalCo2: number
  theme: 'light' | 'dark'
  onToggleTheme: () => void
  todayLabel: string
}

export function Header({ totalCo2, theme, onToggleTheme, todayLabel }: HeaderProps) {
  return (
    <header className="cc-header">
      <div className="cc-logo-lockup">
        <div className="cc-logo-mark cc-logo-brand">
          <img src="/assets/cattodata-brand.png" alt="Cattodata" />
        </div>
        <div className="cc-logo-text">
          <b>Catto Compass</b>
          <span>by Cattodata · Chatswood Hackathon</span>
        </div>
      </div>
      <div className="cc-header-right">
        <div className="cc-co2-pill" title={`${totalCo2.toFixed(2)} kg CO₂ saved this week`}>
          <span className="co2-em">🌱</span>
          <b>{totalCo2.toFixed(2)}</b>
          <small>kg saved</small>
        </div>
        <div className="cc-council-lockup" title="Built for Willoughby City Council">
          <img src="/assets/willoughby-council.png" alt="Willoughby City Council" />
          <div className="ccl-text">
            <span>Built for</span>
            <b>Willoughby City Council</b>
          </div>
        </div>
        <div className="cc-pill-event">{todayLabel}</div>
        <button className="cc-theme-btn" onClick={onToggleTheme} aria-label="Toggle theme">
          {theme === 'light' ? '🌙' : '☀️'}
        </button>
      </div>
    </header>
  )
}
