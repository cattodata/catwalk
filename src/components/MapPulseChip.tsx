export function MapPulseChip({ children, tone = 'coral' }: { children: React.ReactNode; tone?: 'coral' | 'sage' }) {
  const dotColor = tone === 'sage' ? 'var(--sage)' : 'var(--coral)'
  return (
    <div className="cc-map-pulse">
      <span
        className="cc-map-pulse-dot"
        style={{ background: dotColor, boxShadow: `0 0 0 4px ${tone === 'sage' ? 'rgba(123,201,127,.25)' : 'rgba(255,107,157,.25)'}` }}
        aria-hidden="true"
      />
      <span>{children}</span>
    </div>
  )
}
