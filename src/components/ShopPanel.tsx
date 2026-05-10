import { useRef, useState } from 'react'
import type { Shop, BizType } from '../types/shop'
import type { Insight } from '../types/campaign'

const BIZ_TYPES: { id: BizType; emoji: string }[] = [
  { id: 'Cafe', emoji: '☕' },
  { id: 'Restaurant', emoji: '🍜' },
  { id: 'Bakery', emoji: '🥐' },
]

interface ShopPanelProps {
  shop: Shop | null
  bizType: BizType
  setBizType: (b: BizType) => void
  photoUrl: string | null
  onPhotoChange: (file: File | null) => void
  liveAi: boolean
  setLiveAi: (v: boolean) => void
  generating: boolean
  scanStep: number
  onGenerate: () => void
  insights: Insight[]
}

export function ShopPanel({
  shop,
  bizType,
  setBizType,
  photoUrl,
  onPhotoChange,
  liveAi,
  setLiveAi,
  generating,
  scanStep,
  onGenerate,
  insights,
}: ShopPanelProps) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [drag, setDrag] = useState(false)

  const handlePick = (file: File | null) => {
    if (!file) return
    onPhotoChange(file)
  }

  const scanLabels = [
    'Reading photo with AI vision',
    'Pinging weather (Open-Meteo)',
    'Scanning station flow',
    'Mapping competitors (OSM)',
    'Choosing the play',
  ]

  return (
    <div className="cc-side">
      <div className="cc-card">
        <div className="cc-step-eyebrow"><span className="cc-step-num">1</span> YOUR SHOP</div>
        {shop ? (
          <div className="cc-shop-card" style={{ paddingTop: 0 }}>
            <div className="sc-head" style={{ marginBottom: 0 }}>
              <div className="sc-emoji">{shop.emoji}</div>
              <div>
                <h3>{shop.name}</h3>
                <div className="sc-meta">
                  {shop.type.toUpperCase()} · {shop.dist}M FROM STATION
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            <p style={{ margin: '0 0 12px', color: 'var(--ink-soft)', fontSize: 13.5 }}>
              Pick a pin on the map, or choose a business type:
            </p>
            <div className="cc-pills">
              {BIZ_TYPES.map((b) => (
                <button
                  key={b.id}
                  className={`cc-pill ${bizType === b.id ? 'is-active' : ''}`}
                  onClick={() => setBizType(b.id)}
                >
                  <span>{b.emoji}</span> {b.id}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {(shop || bizType) && (
        <div className="cc-card cc-insights">
          <div className="ins-head">
            <h3>👁️ What Catto sees right now</h3>
            <span
              className="cc-eyebrow"
              style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--sage)' }}
            >
              <span
                style={{
                  display: 'inline-block',
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  background: 'var(--sage)',
                  animation: 'pulse 1.6s infinite',
                }}
              />
              LIVE
            </span>
          </div>
          <div className="cc-ins-list">
            {insights.map((i, idx) => (
              <div
                key={idx}
                className="cc-ins"
                style={{ ['--accent' as string]: i.color, animationDelay: `${idx * 50}ms` } as React.CSSProperties}
              >
                <div className="ins-icon">{i.icon}</div>
                <div className="ins-body">
                  <strong>{i.title}</strong>
                  <span>{i.sub}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="cc-ins-foot">— Catto will turn these into one campaign 🐾 —</div>
        </div>
      )}

      <div className="cc-card">
        <div className="cc-step-eyebrow"><span className="cc-step-num">2</span> SNAP A HERO PRODUCT</div>
        {!photoUrl ? (
          <div
            className={`cc-upload ${drag ? 'is-dragover' : ''}`}
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault()
              setDrag(true)
            }}
            onDragLeave={() => setDrag(false)}
            onDrop={(e) => {
              e.preventDefault()
              setDrag(false)
              handlePick(e.dataTransfer.files[0] ?? null)
            }}
          >
            <div className="u-icon">📸</div>
            <h4>Drop a product photo</h4>
            <p>or tap to browse · used for AI vision read</p>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => handlePick(e.target.files?.[0] ?? null)}
            />
          </div>
        ) : (
          <div className="cc-upload-preview">
            <img src={photoUrl} alt="Hero product" />
            <button
              className="cc-upload-replace"
              onClick={() => {
                onPhotoChange(null)
                if (fileRef.current) fileRef.current.value = ''
              }}
            >
              Replace
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => handlePick(e.target.files?.[0] ?? null)}
            />
          </div>
        )}
      </div>

      <div
        className={`cc-ai-toggle ${liveAi ? 'on' : ''}`}
        onClick={() => setLiveAi(!liveAi)}
        role="switch"
        aria-checked={liveAi}
        style={{ cursor: 'pointer' }}
      >
        <div className="ai-track" />
        <div>
          <div className="ai-label">{liveAi ? '● Live AI' : 'Demo mode'}</div>
          <div style={{ fontSize: 12, color: 'var(--ink-soft)' }}>
            {liveAi ? 'Calls Claude · slower' : 'Instant · sample data'}
          </div>
        </div>
      </div>

      <button
        className={`cc-cta ${generating ? 'is-loading' : ''}`}
        onClick={onGenerate}
        disabled={generating || (!shop && !bizType)}
      >
        {generating ? (
          <>
            <span className="cc-spinner" /> Catto's thinking…
          </>
        ) : (
          <>✨  Generate today's play</>
        )}
      </button>

      {generating && (
        <div className="cc-scan">
          {scanLabels.map((s, i) => (
            <div
              key={i}
              className={`cc-scan-row ${i < scanStep ? 'is-done' : i === scanStep ? 'is-active' : ''}`}
            >
              <span className="dot" />
              <span>{s}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
