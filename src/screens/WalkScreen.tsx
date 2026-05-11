import { lazy, Suspense } from 'react'
import type { Shop, CuisineId, ShopTag, TransportId } from '../types/shop'
import { MapFilters } from '../components/MapFilters'
import { WalkPanel } from '../components/WalkPanel'
import type { GeoPosition } from '../hooks/useGeolocation'
import type { WalkPhase } from '../hooks/useWalkSession'

const RealMap = lazy(() => import('../components/RealMap').then((m) => ({ default: m.RealMap })))

export interface WalkScreenProps {
  shops: Shop[]
  shopsAreReal: boolean
  selectedShop: Shop | null
  walkPhase: WalkPhase
  walkProgress: number
  distanceToShop: number | null
  isVerifiedGps: boolean
  onMapSelect: (shop: Shop) => void
  onStart: () => void
  onConfirm: () => void
  onReset: () => void
  onSmartPick: () => void
  smartPickReasons: string[] | null

  cuisine: CuisineId
  setCuisine: (c: CuisineId) => void
  tagFilter: ShopTag[]
  setTagFilter: (t: ShopTag[]) => void
  showHeatmap: boolean
  setShowHeatmap: (v: boolean) => void

  transport: TransportId
  setTransport: (t: TransportId) => void
  totalCo2: number

  geo: { position: GeoPosition | null; isSupported: boolean }
  geolocationPermission: 'granted' | 'prompt' | 'denied' | 'unknown'
  demoMode: boolean
  setDemoMode: (v: boolean) => void
}

export function WalkScreen(p: WalkScreenProps) {
  return (
    <main id="main-content" className="cc-grid cc-grid-walk" tabIndex={-1}>
      <div className="cc-map-card">
        <div className="cc-map-head">
          <div className="cc-eyebrow">
            {p.shops.length} shops near Chatswood Station
            {p.shopsAreReal ? '' : ' · pilot personas'}
          </div>
          <div
            className="cc-map-legend"
            title="Walk farther = earn more points. 3× = triple the points of a 1× shop."
          >
            <span className="cc-chip"><span className="cc-chip-dot" style={{ background: '#5B9BD5' }} /> 1× near</span>
            <span className="cc-chip"><span className="cc-chip-dot" style={{ background: '#F5C842' }} /> 2× mid</span>
            <span className="cc-chip"><span className="cc-chip-dot" style={{ background: '#FF6B9D' }} /> 3× far</span>
          </div>
        </div>

        {!p.selectedShop && (
          <div className="cc-map-hint">
            👆 ① Tap any shop pin to see distance + points
          </div>
        )}

        <MapFilters
          cuisine={p.cuisine}
          setCuisine={p.setCuisine}
          tags={p.tagFilter}
          setTags={p.setTagFilter}
          showHeatmap={p.showHeatmap}
          setShowHeatmap={p.setShowHeatmap}
        />

        <Suspense fallback={<MapFallback />}>
          <RealMap
            shops={p.shops}
            selectedShop={p.selectedShop}
            walkProgress={p.walkPhase === 'idle' ? null : p.walkProgress}
            walking={p.walkPhase === 'walking'}
            completed={p.walkPhase === 'completed' || p.walkPhase === 'arrived'}
            onSelect={p.onMapSelect}
            cuisineFilter={p.cuisine}
            tagFilter={p.tagFilter}
            showHeatmap={p.showHeatmap}
            transport={p.transport}
            userPosition={p.geo.position}
          />
        </Suspense>
      </div>

      <div className="cc-side">
        <WalkPanel
          shop={p.selectedShop}
          walking={p.walkPhase === 'walking'}
          arrived={p.walkPhase === 'arrived'}
          completed={p.walkPhase === 'completed'}
          onStart={p.onStart}
          onConfirm={p.onConfirm}
          onReset={p.onReset}
          onSmartPick={p.onSmartPick}
          smartPickReasons={p.smartPickReasons ?? undefined}
          transport={p.transport}
          setTransport={p.setTransport}
          totalCo2={p.totalCo2}
          distanceToShop={p.distanceToShop}
          isVerifiedGps={p.isVerifiedGps}
          geolocationSupported={p.geo.isSupported}
          geolocationPermission={p.geolocationPermission}
          demoMode={p.demoMode}
          setDemoMode={p.setDemoMode}
        />
      </div>
    </main>
  )
}

function MapFallback() {
  return (
    <div
      style={{
        height: 280,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 16,
        background: 'rgba(91,155,213,.08)',
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: 11,
        color: 'var(--ink-soft)',
        letterSpacing: 1.4,
      }}
    >
      LOADING MAP …
    </div>
  )
}
