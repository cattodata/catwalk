import type { AppMode } from './ModeToggle'

interface HeroProps {
  mode: AppMode
  onSmartPick?: () => void
  smartPickReady?: boolean
  hasSelectedShop?: boolean
}

export function Hero({ mode, onSmartPick, smartPickReady, hasSelectedShop }: HeroProps) {
  if (mode === 'council') {
    // Council View: skip hero — dashboard speaks for itself
    return null
  }

  if (mode === 'shop') {
    return (
      <div className="cc-hero cc-hero-shop">
        <h1>
          <span className="grad-pop">Plan today's</span>{' '}
          <span className="grad-amber">marketing play.</span>
        </h1>
        <p>
          Snap a product photo → AI vision + live weather + foot-traffic signals → ready-to-post campaign in
          EN · 中文 · 한국어 in under 20 seconds.
        </p>
      </div>
    )
  }

  // walk (default)
  return (
    <div className="cc-hero cc-hero-walk">
      <h1>
        <span className="grad-pop">Walk Chatswood.</span>{' '}
        <span className="grad-amber">Earn rewards.</span>
      </h1>
      <p>
        Pick a local shop. Walk there. Earn points + a discount + log CO₂ saved. Bigger walks earn bigger
        multipliers.
      </p>
      {onSmartPick && !hasSelectedShop && (
        <button
          className="cc-hero-cta"
          onClick={onSmartPick}
          disabled={!smartPickReady}
          aria-label="Smart pick — find me the best shop right now"
        >
          ✨ Smart pick — find me a shop
        </button>
      )}
    </div>
  )
}
