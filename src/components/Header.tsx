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
          <img src="/assets/cattodata-brand.png" alt="Cattodata" loading="eager" />
        </div>
        <div className="cc-logo-text">
          <b>Catto Compass</b>
          <span className="cc-logo-sub">Chatswood, NSW</span>
        </div>
      </div>
      <div className="cc-header-right">
        <div className="cc-co2-pill" title={`${totalCo2.toFixed(2)} kg CO₂ saved this week`}>
          <span className="co2-em" aria-hidden="true">🌱</span>
          <b>{totalCo2.toFixed(2)}</b>
          <small>kg saved</small>
        </div>
        <div className="cc-pill-event cc-pill-event-desktop">{todayLabel}</div>
        <button
          className="cc-theme-btn"
          onClick={onToggleTheme}
          aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
          title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
          type="button"
        >
          {theme === 'light' ? '🌙' : '☀️'}
        </button>
      </div>
    </header>
  )
}
