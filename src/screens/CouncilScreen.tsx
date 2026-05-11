import { lazy, Suspense } from 'react'
import type { Shop, CuisineId, ShopTag, TransportId } from '../types/shop'
import type { GeoPosition } from '../hooks/useGeolocation'
import { CouncilPanel } from '../components/CouncilPanel'
import type { CouncilStatsLive, TopStreet, DailyWalk } from '../hooks/useCouncilStats'

const RealMap = lazy(() => import('../components/RealMap').then((m) => ({ default: m.RealMap })))
const CouncilDashboard = lazy(() =>
  import('../components/CouncilDashboard').then((m) => ({ default: m.CouncilDashboard })),
)

export interface CouncilScreenProps {
  shops: Shop[]
  selectedShop: Shop | null
  onMapSelect: (shop: Shop) => void

  cuisine: CuisineId
  tagFilter: ShopTag[]
  transport: TransportId

  council: { stats: CouncilStatsLive; topStreets: TopStreet[]; dailyWalks: DailyWalk[] }
  boostedExtra: { walks: number; kg: number; rev: number } | null
  simulateBoost: () => void
  resetBoost: () => void
  isDemo: boolean

  langReach: { en: number; zh: number; ko: number }
  chinesePct?: number
  koreanPct?: number

  geo: { position: GeoPosition | null }
}

export function CouncilScreen(p: CouncilScreenProps) {
  return (
    <main id="main-content" className="cc-grid cc-grid-council" tabIndex={-1}>
      <div className="cc-map-card">
        <div className="cc-map-head">
          <div className="cc-eyebrow">Chatswood CBD · live foot traffic + boosted streets</div>
          <div className="cc-map-legend">
            <span className="cc-chip"><span className="cc-chip-dot" style={{ background: '#5B9BD5' }} /> 1×</span>
            <span className="cc-chip"><span className="cc-chip-dot" style={{ background: '#F5C842' }} /> 2×</span>
            <span className="cc-chip"><span className="cc-chip-dot" style={{ background: '#FF6B9D' }} /> 3×</span>
          </div>
        </div>
        <Suspense fallback={<div style={{ height: 360 }} />}>
          <RealMap
            shops={p.shops}
            selectedShop={p.selectedShop}
            walkProgress={null}
            walking={false}
            completed={false}
            onSelect={p.onMapSelect}
            cuisineFilter={p.cuisine}
            tagFilter={p.tagFilter}
            showHeatmap
            transport={p.transport}
            userPosition={p.geo.position}
          />
        </Suspense>
      </div>
      <div className="cc-side">
        <CouncilPanel
          boostedExtra={p.boostedExtra}
          onSimulateBoost={p.simulateBoost}
          onResetBoost={p.resetBoost}
          langReach={p.langReach}
          chinesePct={p.chinesePct}
          koreanPct={p.koreanPct}
        />
      </div>
      <Suspense fallback={<div style={{ height: 280 }} />}>
        <CouncilDashboard
          stats={p.council.stats}
          topStreets={p.council.topStreets}
          dailyWalks={p.council.dailyWalks}
          boostedExtra={p.boostedExtra}
          fallbackProjections={
            p.isDemo || !p.council.stats.loaded
              ? { walks: 1247, co2Kg: 84.6, extraRev: 14200, walkingNow: 0 }
              : undefined
          }
        />
      </Suspense>
    </main>
  )
}
