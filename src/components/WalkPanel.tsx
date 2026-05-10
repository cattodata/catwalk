import type { Shop, TransportId } from '../types/shop'
import { TRANSPORT } from '../data/shops'
import { tierFromCo2 } from '../data/tiers'

interface WalkPanelProps {
  shop: Shop | null
  walking: boolean
  completed: boolean
  arrived: boolean
  onStart: () => void
  onConfirm: () => void
  onReset: () => void
  onSmartPick?: () => void
  smartPickReasons?: string[]
  transport: TransportId
  setTransport: (t: TransportId) => void
  totalCo2: number
  distanceToShop: number | null
  isVerifiedGps: boolean
  geolocationSupported: boolean
  geolocationPermission: 'granted' | 'prompt' | 'denied' | 'unknown'
  demoMode: boolean
  setDemoMode: (v: boolean) => void
}

export function WalkPanel({
  shop,
  walking,
  completed,
  arrived,
  onStart,
  onConfirm,
  onReset,
  onSmartPick,
  smartPickReasons,
  transport,
  setTransport,
  totalCo2,
  distanceToShop,
  isVerifiedGps,
  geolocationSupported,
  geolocationPermission,
  demoMode,
  setDemoMode,
}: WalkPanelProps) {
  const t = TRANSPORT.find((x) => x.id === transport) ?? TRANSPORT[0]
  const pts = shop ? Math.round(shop.pts * t.ptsMult) : 0
  const co2 = shop ? +(shop.co2 * t.co2Mult).toFixed(2) : 0
  const mins = shop ? Math.max(1, Math.round(shop.mins * t.speed)) : 0
  const tier = tierFromCo2(totalCo2)
  const tierNext = tier.next
  const tierPct = tierNext ? Math.min(1, (totalCo2 - tier.min) / (tierNext - tier.min)) : 1

  const transportRow = (
    <div className="cc-transport">
      <div className="cc-eyebrow" style={{ margin: '2px 0 8px' }}>How will you go?</div>
      <div className="cc-transport-row">
        {TRANSPORT.map((m) => (
          <button
            key={m.id}
            className={`cc-tmode ${transport === m.id ? 'is-on' : ''}`}
            onClick={() => setTransport(m.id)}
            type="button"
          >
            <span className="tm-emoji">{m.emoji}</span>
            <span className="tm-label">{m.label}</span>
          </button>
        ))}
      </div>
      <div className="cc-tmode-hint">{t.hint}</div>
    </div>
  )

  const statusLine = (() => {
    if (demoMode) return { color: '#B49EFB', icon: '🎭', text: 'Demo mode · no GPS check (perfect for indoor demo)' }
    if (!geolocationSupported) return { color: '#FF6B9D', icon: '⚠️', text: 'Geolocation not supported · enable demo mode' }
    if (geolocationPermission === 'denied')
      return { color: '#FF6B9D', icon: '🚫', text: 'Location permission denied · enable demo mode' }
    if (geolocationPermission === 'prompt')
      return { color: '#5B9BD5', icon: '📍', text: 'Will ask for location when you start' }
    if (distanceToShop == null)
      return { color: '#7BC97F', icon: '📍', text: 'GPS ready' }
    if (distanceToShop <= 100)
      return { color: '#7BC97F', icon: '✓', text: `${distanceToShop}m · within geofence — ready to claim!` }
    return { color: '#5B9BD5', icon: '🚶', text: `${distanceToShop}m to ${shop?.name ?? 'shop'} · keep walking` }
  })()

  const geolocationCard = (
    <div
      className="cc-card"
      style={{
        padding: 14,
        fontSize: 13,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        borderLeft: `4px solid ${statusLine.color}`,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 18 }}>{statusLine.icon}</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 13 }}>Walk verification</div>
          <div style={{ fontSize: 12, opacity: 0.75, marginTop: 2 }}>{statusLine.text}</div>
        </div>
      </div>
      <label
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 10px',
          background: demoMode ? 'rgba(180,158,251,.14)' : 'rgba(154,128,90,.06)',
          borderRadius: 10,
          cursor: 'pointer',
          fontSize: 12,
        }}
      >
        <input type="checkbox" checked={demoMode} onChange={(e) => setDemoMode(e.target.checked)} />
        <span>
          <b>Demo mode</b> — skip GPS for indoor demo (judges &amp; testing)
        </span>
      </label>
    </div>
  )

  const tierStrip = (
    <div className="cc-tier" style={{ borderColor: tier.color + '55' }}>
      <div className="cc-tier-head">
        <div className="ct-emoji" style={{ background: tier.color + '22' }}>
          {tier.emoji}
        </div>
        <div style={{ flex: 1 }}>
          <div className="ct-eyebrow">YOUR TIER · WEEK</div>
          <div className="ct-name">
            {tier.label} <span className="ct-co2">· {totalCo2.toFixed(2)} kg saved</span>
          </div>
        </div>
      </div>
      <div className="cc-tier-bar">
        <div className="cc-tier-fill" style={{ width: tierPct * 100 + '%', background: tier.color }} />
      </div>
      <div className="ct-foot">
        {tierNext ? <span>{(tierNext - totalCo2).toFixed(2)} kg to next tier</span> : <span>Top tier reached 🏆</span>}
      </div>
    </div>
  )

  if (completed && shop) {
    const drove = +((shop.dist / 1000) * 0.18).toFixed(2)
    return (
      <div className="cc-side-stack">
        <div className="cc-reward">
          <div className="r-eyebrow">
            Walk Complete · {shop.dist}m · {t.label}{' '}
            {isVerifiedGps && <span style={{ marginLeft: 6, color: '#7BC97F' }}>· ✓ GPS verified</span>}
          </div>
          <div className="r-num">+{pts} pts unlocked</div>
          <div className="r-list">
            <span>🎁  <b>{shop.off}% off</b> at {shop.name}</span>
            <span>🌱  <b>{co2.toFixed(2)} kg CO₂</b> saved by going {t.label.toLowerCase()}</span>
            <span>⚡  <b>{shop.mult}× multiplier</b> banked toward your tier</span>
          </div>
          <div className="r-drove">
            <div className="rd-eyebrow">IF YOU'D DRIVEN</div>
            <div className="rd-row">
              <span>🚗 +{drove.toFixed(2)} kg CO₂ emitted</span>
              <span>💸 ~${t.driveCost.toFixed(2)} parking</span>
              <span>⏱ +{Math.max(2, mins - 1)} min stuck in traffic</span>
            </div>
          </div>
          <button className="r-cta" onClick={onReset}>Pick another shop →</button>
        </div>
        {tierStrip}
      </div>
    )
  }

  if (!shop) {
    return (
      <div className="cc-side-stack">
        <div className="cc-card cc-empty">
          <div className="e-emoji">👆</div>
          <h2>Pick a shop on the map</h2>
          <p>Further shops + bigger multipliers = bigger rewards. Filter by cuisine or tap any pin to start.</p>
          <div style={{ display: 'flex', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
            <span className="cc-chip"><span className="cc-chip-dot" style={{ background: '#5B9BD5' }} /> 1× near</span>
            <span className="cc-chip"><span className="cc-chip-dot" style={{ background: '#F5C842' }} /> 2× mid</span>
            <span className="cc-chip"><span className="cc-chip-dot" style={{ background: '#FF6B9D' }} /> 3× far</span>
          </div>
          {onSmartPick && (
            <button
              onClick={onSmartPick}
              style={{
                marginTop: 14,
                width: '100%',
                background: 'linear-gradient(135deg, #FF6B9D, #F5C842)',
                color: '#fff',
                border: 0,
                borderRadius: 999,
                padding: '12px 18px',
                fontFamily: 'Outfit, sans-serif',
                fontWeight: 700,
                fontSize: 14,
                cursor: 'pointer',
              }}
            >
              ✨ Smart pick for now — best ROI
            </button>
          )}
          {smartPickReasons && smartPickReasons.length > 0 && (
            <div style={{ fontSize: 11, color: 'var(--ink-soft)', marginTop: 8, lineHeight: 1.5 }}>
              <b>Why this shop?</b>
              <ul style={{ margin: '4px 0 0 18px', padding: 0 }}>
                {smartPickReasons.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
        {transportRow}
        {geolocationCard}
        {tierStrip}
      </div>
    )
  }

  const tierClass = shop.mult === 3 ? 'tier-3' : shop.mult === 2 ? 'tier-2' : 'tier-1'

  return (
    <div className="cc-side-stack">
      <div className="cc-card cc-shop-card">
        <div className="sc-head">
          <div className="sc-emoji">{shop.emoji}</div>
          <div>
            <h2>{shop.name}</h2>
            <div className="sc-meta">
              {shop.dist}M · {mins} MIN · {t.emoji}
              {t.label.toUpperCase()}
              <span className="sc-tags">
                {shop.tags.map((tg) => (
                  <em key={tg}>{tg}</em>
                ))}
              </span>
            </div>
          </div>
          <div className={`cc-mult-badge ${tierClass}`}>{shop.mult}×</div>
        </div>

        <div className="cc-stat-grid">
          <div className="cc-stat s-coral">
            <div className="s-num">{pts}</div>
            <div className="s-label">Points</div>
          </div>
          <div className="cc-stat s-amber">
            <div className="s-num">
              {shop.off}<small style={{ fontSize: 14 }}>%</small>
            </div>
            <div className="s-label">Off today</div>
          </div>
          <div className="cc-stat s-sage">
            <div className="s-num">{co2.toFixed(2)}</div>
            <div className="s-label">kg CO₂</div>
          </div>
        </div>

        {arrived && !completed ? (
          <button className="cc-cta" onClick={onConfirm}>
            ✅ I've arrived · Claim reward
          </button>
        ) : (
          <button className={`cc-cta ${walking ? 'is-loading' : ''}`} onClick={onStart} disabled={walking}>
            {walking ? (
              <>
                <span className="cc-spinner" />
                Catto's on the move…
              </>
            ) : (
              <>🐾  Start the {t.label.toLowerCase().replace(' + walk', '')}</>
            )}
          </button>
        )}

        <div className="cc-drove-hint">
          vs. driving: <b>+${t.driveCost.toFixed(2)}</b> parking ·{' '}
          <b>+{((shop.dist / 1000) * 0.18).toFixed(2)} kg CO₂</b>
        </div>
      </div>

      {transportRow}
      {geolocationCard}
      {tierStrip}
    </div>
  )
}
