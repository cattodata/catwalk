import { lazy, Suspense } from 'react'
import type { Shop, BizType, CuisineId, ShopTag, TransportId } from '../types/shop'
import type { Campaign, Insight } from '../types/campaign'
import type { WeatherSummary } from '../types/weather'
import type { GeoPosition } from '../hooks/useGeolocation'
import { MapFilters } from '../components/MapFilters'
import { ShopPanel } from '../components/ShopPanel'

const RealMap = lazy(() => import('../components/RealMap').then((m) => ({ default: m.RealMap })))
const ResultSection = lazy(() =>
  import('../components/ResultSection').then((m) => ({ default: m.ResultSection })),
)

export interface OwnerScreenProps {
  shops: Shop[]
  shopsAreReal: boolean
  selectedShop: Shop | null
  onMapSelect: (shop: Shop) => void

  cuisine: CuisineId
  setCuisine: (c: CuisineId) => void
  tagFilter: ShopTag[]
  setTagFilter: (t: ShopTag[]) => void
  showHeatmap: boolean
  setShowHeatmap: (v: boolean) => void
  transport: TransportId

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
  weather: WeatherSummary | null
  hour: number
  dayOfWeek: number
  devMode: boolean

  campaign: Campaign | null
  campaignSource: 'live' | 'mock'
  geo: { position: GeoPosition | null }
}

export function OwnerScreen(p: OwnerScreenProps) {
  return (
    <>
      <main id="main-content" className="cc-grid cc-grid-owner" tabIndex={-1}>
        <div className="cc-map-card">
          <div className="cc-map-head">
            <div className="cc-eyebrow">
              {p.shops.length} shops near Chatswood Station
              {p.shopsAreReal ? '' : ' · pilot personas'}
            </div>
          </div>
          {!p.selectedShop && (
            <div className="cc-map-hint">
              👆 ① Tap any shop pin to plan a campaign
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
          <Suspense fallback={<div style={{ height: 280 }} />}>
            <RealMap
              shops={p.shops}
              selectedShop={p.selectedShop}
              walkProgress={null}
              walking={false}
              completed={false}
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
          <ShopPanel
            shop={p.selectedShop}
            bizType={p.bizType}
            setBizType={p.setBizType}
            photoUrl={p.photoUrl}
            onPhotoChange={p.onPhotoChange}
            liveAi={p.liveAi}
            setLiveAi={p.setLiveAi}
            generating={p.generating}
            scanStep={p.scanStep}
            onGenerate={p.onGenerate}
            insights={p.insights}
            allShops={p.shops}
            weather={p.weather}
            hour={p.hour}
            dayOfWeek={p.dayOfWeek}
            devMode={p.devMode}
          />
        </div>
        <div id="cc-result-anchor">
          {p.campaign && (
            <Suspense fallback={<div style={{ height: 200 }} />}>
              <ResultSection campaign={p.campaign} photoUrl={p.photoUrl} source={p.campaignSource} />
            </Suspense>
          )}
        </div>
      </main>
    </>
  )
}
