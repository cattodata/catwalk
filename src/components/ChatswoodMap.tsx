import { useMemo } from 'react'
import type { Shop, Landmark, CuisineId, ShopTag, TransportId } from '../types/shop'
import { Catto } from './Catto'
import { BIKE_RACKS, HEATMAP_PREDICTED } from '../data/landmarks'
import { CHATSWOOD } from '../config/chatswood'

interface ChatswoodMapProps {
  shops: Shop[]
  landmarks: Landmark[]
  selectedShop: Shop | null
  walkProgress: number | null
  walking: boolean
  completed: boolean
  onSelect: (shop: Shop) => void
  cuisineFilter?: CuisineId
  tagFilter?: ShopTag[]
  showHeatmap?: boolean
  transport?: TransportId
}

export function ChatswoodMap({
  shops,
  landmarks,
  selectedShop,
  walkProgress,
  walking,
  completed,
  onSelect,
  cuisineFilter = 'all',
  tagFilter = [],
  showHeatmap = false,
  transport,
}: ChatswoodMapProps) {
  const W = CHATSWOOD.map.width
  const H = CHATSWOOD.map.height
  const station = CHATSWOOD.station

  const { cattoPos, cattoDir, routeD } = useMemo(() => {
    const routePoints = selectedShop?.route ?? null
    let pos = { x: station.x, y: station.y }
    let dir: 1 | -1 = 1
    let d = ''
    if (routePoints) {
      d = 'M ' + routePoints.map((p) => `${p[0]},${p[1]}`).join(' L ')
      if (walkProgress != null) {
        const segs: { from: [number, number]; to: [number, number]; len: number }[] = []
        let total = 0
        for (let i = 0; i < routePoints.length - 1; i++) {
          const dx = routePoints[i + 1][0] - routePoints[i][0]
          const dy = routePoints[i + 1][1] - routePoints[i][1]
          const len = Math.hypot(dx, dy)
          segs.push({ from: routePoints[i], to: routePoints[i + 1], len })
          total += len
        }
        let target = walkProgress * total
        let acc = 0
        for (const s of segs) {
          if (acc + s.len >= target) {
            const t = (target - acc) / s.len
            pos = {
              x: s.from[0] + (s.to[0] - s.from[0]) * t,
              y: s.from[1] + (s.to[1] - s.from[1]) * t,
            }
            dir = s.to[0] >= s.from[0] ? 1 : -1
            break
          }
          acc += s.len
        }
      }
    }
    return { cattoPos: pos, cattoDir: dir, routeD: d }
  }, [selectedShop, walkProgress, station.x, station.y])

  return (
    <svg className="cc-map-svg" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Chatswood map">
      <defs>
        <linearGradient id="popG" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FF6B9D" />
          <stop offset="100%" stopColor="#F5C842" />
        </linearGradient>
        <linearGradient id="skyG" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#E8F0F9" />
          <stop offset="100%" stopColor="#F4F8FC" />
        </linearGradient>
        <pattern id="tilePattern" width="14" height="14" patternUnits="userSpaceOnUse">
          <rect width="14" height="14" fill="#FFFFFF" />
          <rect x="0" y="0" width="14" height="14" fill="none" stroke="rgba(154,128,90,0.10)" strokeWidth="1" />
        </pattern>
        <radialGradient id="heatG" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FF6B9D" stopOpacity=".55" />
          <stop offset="55%" stopColor="#F5C842" stopOpacity=".30" />
          <stop offset="100%" stopColor="#F5C842" stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width={W} height={H} fill="url(#skyG)" />

      <ellipse cx="120" cy="180" rx="80" ry="40" fill="#FFF8E8" opacity=".7" />
      <ellipse cx="600" cy="320" rx="90" ry="55" fill="#FFF8E8" opacity=".55" />
      <ellipse cx="430" cy="430" rx="70" ry="35" fill="#FFF8E8" opacity=".5" />

      <g stroke="#FFFFFF" strokeLinecap="round" strokeWidth="22" fill="none" opacity=".95">
        <line x1="20" y1="340" x2="680" y2="340" />
        <line x1="350" y1="40" x2="350" y2="500" />
        <line x1="20" y1="200" x2="680" y2="200" />
        <line x1="20" y1="450" x2="680" y2="450" />
        <line x1="200" y1="40" x2="200" y2="500" />
        <line x1="500" y1="40" x2="500" y2="500" />
      </g>
      <g opacity=".22">
        <rect x="0" y="328" width={W} height="24" fill="url(#tilePattern)" />
        <rect x="338" y="0" width="24" height={H} fill="url(#tilePattern)" />
        <rect x="0" y="188" width={W} height="24" fill="url(#tilePattern)" />
        <rect x="0" y="438" width={W} height="24" fill="url(#tilePattern)" />
      </g>

      <g>
        <line x1="20" y1="270" x2="680" y2="270" stroke="#FFFFFF" strokeWidth="20" strokeLinecap="round" />
        <line x1="20" y1="270" x2="680" y2="270" stroke="#F5C842" strokeWidth="6" strokeLinecap="round" strokeDasharray="14 10" opacity=".75" />
        <g className="cc-pedestrians">
          <circle cx="120" cy="270" r="3" fill="#2D2418" />
          <circle cx="280" cy="270" r="3" fill="#2D2418" />
          <circle cx="430" cy="270" r="3" fill="#2D2418" />
          <circle cx="600" cy="270" r="3" fill="#2D2418" />
        </g>
      </g>

      {landmarks.map((L) => (
        <g key={L.id}>
          <rect x={L.x + 3} y={L.y + 4} width={L.w} height={L.h} rx="14" fill="rgba(45,36,24,.16)" />
          <rect x={L.x} y={L.y} width={L.w} height={L.h} rx="14" fill={L.fill} stroke="#2D2418" strokeWidth="1.8" />
          <text x={L.x + L.w / 2} y={L.y + L.h / 2 + 5} textAnchor="middle" fontSize="22" style={{ userSelect: 'none' }}>
            {L.icon}
          </text>
          <text
            x={L.x + L.w / 2}
            y={L.y + L.h + 14}
            textAnchor="middle"
            fontFamily="JetBrains Mono, monospace"
            fontSize="9.5"
            letterSpacing="1.5"
            fill="#2D2418"
            opacity=".55"
          >
            {L.name.toUpperCase()}
          </text>
        </g>
      ))}

      <g fontFamily="JetBrains Mono, monospace" fontSize="9" fill="#2D2418" opacity=".4" letterSpacing="2">
        <text x="40" y="335">PACIFIC HWY</text>
        <text x="360" y="60" transform="rotate(90 360 60)">ANDERSON ST</text>
        <text x="40" y="265">VICTORIA AVE  ·  PEDESTRIAN MALL</text>
        <text x="40" y="195">HELP ST</text>
        <text x="40" y="445">ALBERT AVE</text>
      </g>

      {showHeatmap && (
        <g style={{ pointerEvents: 'none' }}>
          {HEATMAP_PREDICTED.map((h, i) => (
            <g key={i}>
              <circle cx={h.x} cy={h.y} r={h.r} fill="url(#heatG)" opacity={h.intensity} />
              <text
                x={h.x}
                y={h.y - h.r - 4}
                textAnchor="middle"
                fontFamily="JetBrains Mono, monospace"
                fontSize="8.5"
                letterSpacing="1.4"
                fill="#2D2418"
                opacity=".55"
              >
                {h.label.toUpperCase()}
              </text>
            </g>
          ))}
        </g>
      )}

      <g style={{ pointerEvents: 'none' }}>
        {BIKE_RACKS.map((b, i) => (
          <g key={i} transform={`translate(${b.x},${b.y})`} opacity={transport === 'bike' ? 1 : 0.55}>
            <rect x="-9" y="-9" width="18" height="18" rx="4" fill="#FFFFFF" stroke="#2D2418" strokeWidth="1.5" />
            <text textAnchor="middle" y="4" fontSize="11">🚲</text>
          </g>
        ))}
      </g>

      <g transform="translate(640, 60)">
        <circle r="18" fill="#FFFFFF" stroke="rgba(154,128,90,0.2)" strokeWidth="1.5" />
        <path d="M 0,-12 L 4,0 L 0,12 L -4,0 Z" fill="#FF6B9D" />
        <text textAnchor="middle" y="-19" fontFamily="JetBrains Mono, monospace" fontSize="9" fill="#2D2418">N</text>
      </g>

      {selectedShop?.route && walking && (
        <path
          d={routeD}
          fill="none"
          stroke="url(#popG)"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray="900"
          strokeDashoffset={900 * (1 - (walkProgress ?? 0))}
          style={{ transition: 'stroke-dashoffset 60ms linear' }}
        />
      )}
      {selectedShop?.route && completed && (
        <path d={routeD} fill="none" stroke="url(#popG)" strokeWidth="6" strokeLinecap="round" />
      )}
      {selectedShop?.route && !walking && !completed && (
        <path d={routeD} fill="none" stroke="rgba(255,107,157,.4)" strokeWidth="3.5" strokeDasharray="6 5" />
      )}

      <g transform={`translate(${station.x},${station.y})`}>
        <circle r="26" fill="#2D2418" />
        <circle r="20" fill="#FFFFFF" />
        <text textAnchor="middle" y="6" fontFamily="Outfit, sans-serif" fontSize="20" fontWeight="800" fill="#2D2418">M</text>
        <text textAnchor="middle" y="44" fontFamily="JetBrains Mono, monospace" fontSize="10" letterSpacing="1.5" fill="#2D2418" opacity=".7">CHATSWOOD</text>
      </g>

      {shops.map((s) => {
        const sel = selectedShop?.id === s.id
        const cuisineMatch = cuisineFilter === 'all' || s.cuisine === cuisineFilter
        const tagMatch = !tagFilter.length || tagFilter.every((t) => s.tags.includes(t))
        const dim = !(cuisineMatch && tagMatch)
        return (
          <g
            key={s.id}
            transform={`translate(${s.x},${s.y})`}
            onClick={() => !dim && onSelect(s)}
            style={{ cursor: dim ? 'not-allowed' : 'pointer', opacity: dim ? 0.25 : 1, transition: 'opacity .25s' }}
          >
            {sel && (
              <circle r="34" fill="none" stroke="#FF6B9D" strokeWidth="2" opacity=".4">
                <animate attributeName="r" values="22;38;22" dur="1.4s" repeatCount="indefinite" />
                <animate attributeName="opacity" values=".7;0;.7" dur="1.4s" repeatCount="indefinite" />
              </circle>
            )}
            <circle r={sel ? 24 : 20} fill="#FFFFFF" stroke="#2D2418" strokeWidth={sel ? '2.5' : '1.8'} />
            <text textAnchor="middle" y={sel ? 7 : 6} fontSize={sel ? 22 : 18}>{s.emoji}</text>
            {s.mult >= 2 && (
              <g transform={`translate(${sel ? 16 : 13},${sel ? -14 : -12})`}>
                <circle r="11" fill={s.mult === 3 ? '#FF6B9D' : '#F5C842'} stroke="#FFFFFF" strokeWidth="2" />
                <text textAnchor="middle" y="3.5" fontFamily="Outfit" fontSize="11" fontWeight="800" fill="#FFFFFF">
                  {s.mult}×
                </text>
              </g>
            )}
          </g>
        )
      })}

      {(() => {
        const msg = completed
          ? 'Made it! 🎉'
          : walking
            ? 'On my way…'
            : selectedShop
              ? `Walk ${selectedShop.dist}m → ${selectedShop.mult}× pts`
              : "Pick a shop, I'll walk it!"
        const bubbleW = msg.length * 7 + 30
        return (
          <foreignObject x={cattoPos.x - 18} y={cattoPos.y - 78} width={Math.max(220, bubbleW)} height="44">
            <div style={{ pointerEvents: 'none', position: 'relative' }}>
              <div className="cc-speech" key={msg} style={{ position: 'static', display: 'inline-block' }}>
                {msg}
              </div>
            </div>
          </foreignObject>
        )
      })()}

      <foreignObject x={cattoPos.x - 24} y={cattoPos.y - 38} width="48" height="48">
        <div style={{ pointerEvents: 'none' }} className="catto-sticker">
          <Catto
            scale={1.6}
            state={completed ? 'cheering' : walking ? 'walking' : selectedShop ? 'thinking' : 'idle'}
            dir={cattoDir}
          />
        </div>
      </foreignObject>
    </svg>
  )
}
