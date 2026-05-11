import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import type { Shop, BizType, CuisineId, ShopTag, TransportId } from './types/shop'
import type { Campaign } from './types/campaign'
import type { AppMode } from './components/ModeToggle'
import { MOCK_CAMPAIGNS } from './data/mockCampaigns'
import { getTodayEvent } from './data/events'

import { Header } from './components/Header'
import { PulseTicker } from './components/PulseTicker'
import { Hero } from './components/Hero'
import { Vitals } from './components/Vitals'
import { ModeToggle } from './components/ModeToggle'
import { MapFilters } from './components/MapFilters'
import { WalkPanel } from './components/WalkPanel'
import { ShopPanel } from './components/ShopPanel'
import { CouncilPanel } from './components/CouncilPanel'
import { Footer } from './components/Footer'
import { MobileNav } from './components/MobileNav'
import { RewardOverlay } from './components/RewardOverlay'

// Heavy chunks lazy-loaded for faster first paint
const RealMap = lazy(() => import('./components/RealMap').then((m) => ({ default: m.RealMap })))
const ResultSection = lazy(() =>
  import('./components/ResultSection').then((m) => ({ default: m.ResultSection })),
)
const CouncilDashboard = lazy(() =>
  import('./components/CouncilDashboard').then((m) => ({ default: m.CouncilDashboard })),
)

import { useTheme } from './hooks/useTheme'
import { useWeather } from './hooks/useWeather'
import { useCompetitorCounts } from './hooks/useCompetitorCounts'
import { useRealShops } from './hooks/useRealShops'
import { useDemographics } from './hooks/useDemographics'
import { useGeolocation } from './hooks/useGeolocation'
import { useSupabaseAuth } from './hooks/useSupabaseAuth'
import { useUserStats } from './hooks/useUserStats'
import { useCouncilStats } from './hooks/useCouncilStats'
import { useWalkSession } from './hooks/useWalkSession'
import { useNow } from './hooks/useNow'

import { generateInsights, buildOwnerVitals, buildWalkerVitals } from './lib/insights'
import { generateCampaign } from './lib/claude'
import { smartPick } from './lib/smartPick'
import { tierFromCo2 } from './data/tiers'

const STATION_DAILY_AVG = 47832 // TfNSW Aug 2024 monthly aggregate

export function App() {
  // ---------- Theme ----------
  const { theme, toggle } = useTheme()

  // ---------- Mode (URL-driven via ?mode=walk|shop|council) ----------
  const navigate = useNavigate()
  const location = useLocation()
  const urlParams = useMemo(() => new URLSearchParams(location.search), [location.search])
  const modeFromUrl = (urlParams.get('mode') as AppMode | null) ?? 'walk'
  const mode: AppMode = ['walk', 'shop', 'council'].includes(modeFromUrl) ? modeFromUrl : 'walk'
  const setMode = useCallback(
    (m: AppMode) => {
      const next = new URLSearchParams(location.search)
      next.set('mode', m)
      navigate({ search: '?' + next.toString() }, { replace: true })
    },
    [navigate, location.search],
  )

  // ---------- Walk-mode state ----------
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null)
  const [transport, setTransport] = useState<TransportId>('walk')
  const [demoMode, setDemoMode] = useState(true) // default to demo so judges can test indoors

  // ---------- Shop-mode state ----------
  const [bizType, setBizType] = useState<BizType>('Cafe')
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [liveAi, setLiveAi] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [scanStep, setScanStep] = useState(0)
  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [campaignSource, setCampaignSource] = useState<'live' | 'mock'>('mock')

  // ---------- Filter state ----------
  const [cuisine, setCuisine] = useState<CuisineId>('all')
  const [tagFilter, setTagFilter] = useState<ShopTag[]>([])
  const [showHeatmap, setShowHeatmap] = useState(false)

  // ---------- Council state ----------
  const [boostedExtra, setBoostedExtra] = useState<{ walks: number; kg: number; rev: number } | null>(null)

  // ---------- Reward overlay ----------
  const [showRewardOverlay, setShowRewardOverlay] = useState(false)

  // ---------- Smart pick reasons (shown after auto-pick) ----------
  const [smartPickReasons, setSmartPickReasons] = useState<string[] | null>(null)

  // ---------- Real-data hooks ----------
  const now = useNow(60_000)
  const { weather } = useWeather()
  const { counts: competitors } = useCompetitorCounts()
  const { demographics } = useDemographics()
  const { shops, isReal: shopsAreReal } = useRealShops()
  const todayEvent = useMemo(() => getTodayEvent(now), [now])

  // ---------- Supabase auth + user stats ----------
  const auth = useSupabaseAuth()
  const userStats = useUserStats(auth.user?.id ?? null)
  const totalCo2 = userStats.total_co2

  // ---------- Geolocation (only in walk mode, not in demo) ----------
  const geo = useGeolocation(mode === 'walk' && !demoMode)
  const geolocationPermission: 'granted' | 'prompt' | 'denied' | 'unknown' = geo.error
    ? 'denied'
    : geo.position
      ? 'granted'
      : 'prompt'

  // ---------- Walk session (geofence verification + Supabase insert) ----------
  const walkSession = useWalkSession({
    shop: selectedShop,
    transport,
    position: geo.position,
    userId: auth.user?.id ?? null,
    demoMode,
  })

  // ---------- Council stats (Supabase Realtime) ----------
  const council = useCouncilStats('chatswood')

  // ---------- Sync biz type when selecting a shop ----------
  useEffect(() => {
    if (selectedShop) setBizType(selectedShop.type)
  }, [selectedShop])

  // ---------- Auto-show heatmap in council mode ----------
  useEffect(() => {
    if (mode === 'council') setShowHeatmap(true)
  }, [mode])

  // ---------- Auto-reset walk session when leaving Walk tab ----------
  // Prevents the requestAnimationFrame loop from firing on a hidden flow.
  useEffect(() => {
    if (mode !== 'walk' && walkSession.phase !== 'idle') {
      walkSession.reset()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode])

  // ---------- Photo URL lifecycle ----------
  const lastObjectUrlRef = useRef<string | null>(null)
  useEffect(() => {
    if (!photoFile) {
      if (lastObjectUrlRef.current) URL.revokeObjectURL(lastObjectUrlRef.current)
      lastObjectUrlRef.current = null
      setPhotoUrl(null)
      return
    }
    const url = URL.createObjectURL(photoFile)
    lastObjectUrlRef.current = url
    setPhotoUrl(url)
    return () => {
      URL.revokeObjectURL(url)
    }
  }, [photoFile])

  // ---------- Insights ----------
  const insights = useMemo(() => {
    return generateInsights({
      bizType,
      shop: selectedShop,
      weather,
      competitors,
      hour: now.getHours(),
      dayOfWeek: now.getDay(),
      todayEvent,
    })
  }, [bizType, selectedShop, weather, competitors, now, todayEvent])

  // ---------- Vitals (mode-aware) ----------
  const nearestShop = useMemo(() => {
    if (!shops.length) return null
    const s = [...shops].sort((a, b) => a.dist - b.dist)[0]
    return { name: s.name, dist: s.dist, mult: s.mult }
  }, [shops])

  const walkerTier = useMemo(() => {
    const t = tierFromCo2(totalCo2)
    return { label: t.label, emoji: t.emoji, co2: totalCo2, nextAt: t.next }
  }, [totalCo2])

  const vitals = useMemo(() => {
    if (mode === 'walk') {
      return buildWalkerVitals({ weather, nearestShop, tier: walkerTier, date: now })
    }
    return buildOwnerVitals({
      weather,
      competitors,
      bizType,
      stationDailyAvg: STATION_DAILY_AVG,
      date: now,
    })
  }, [mode, weather, competitors, bizType, nearestShop, walkerTier, now])

  // ---------- Today label for header ----------
  const todayLabel = `${now.toLocaleDateString('en-AU', { weekday: 'short', day: 'numeric', month: 'short' })} · ${now.toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' })}`

  // ---------- Map shop click ----------
  const onMapSelect = useCallback(
    (s: Shop) => {
      setSelectedShop(s)
      walkSession.reset()
    },
    [walkSession],
  )

  // ---------- Walk handlers ----------
  const startWalk = useCallback(() => {
    walkSession.start()
  }, [walkSession])

  const confirmArrival = useCallback(async () => {
    await walkSession.confirmArrival()
    setShowRewardOverlay(true)
  }, [walkSession])

  const resetWalk = useCallback(() => {
    setSelectedShop(null)
    setSmartPickReasons(null)
    walkSession.reset()
  }, [walkSession])

  const onSmartPickClick = useCallback(() => {
    const pick = smartPick(shops, weather, now.getHours())
    if (!pick) return
    setSelectedShop(pick.shop)
    setSmartPickReasons(pick.reasons)
    walkSession.reset()
  }, [shops, weather, now, walkSession])

  // ---------- Campaign generation (real Claude API) ----------
  const fileToBase64 = (file: File): Promise<{ base64: string; mime: string }> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        const result = reader.result as string
        const [meta, b64] = result.split(',')
        const mimeMatch = meta.match(/data:([^;]+);/)
        resolve({ base64: b64, mime: mimeMatch?.[1] ?? 'image/jpeg' })
      }
      reader.onerror = () => reject(reader.error)
      reader.readAsDataURL(file)
    })

  const generate = useCallback(async () => {
    if (generating) return
    setGenerating(true)
    setScanStep(0)
    setCampaign(null)

    // Animate scan steps regardless of live/demo
    const stepDelay = liveAi ? 700 : 380
    const advanceSteps = (i: number) =>
      new Promise<void>((resolve) => {
        const tick = (j: number) => {
          if (j > 5) {
            resolve()
            return
          }
          setScanStep(j)
          setTimeout(() => tick(j + 1), stepDelay)
        }
        tick(i)
      })

    const stepsPromise = advanceSteps(0)

    try {
      if (liveAi && photoFile) {
        const { base64, mime } = await fileToBase64(photoFile)
        const response = await generateCampaign({
          photoBase64: base64,
          photoMime: mime,
          bizType,
          weather,
          hour: now.getHours(),
          dayOfWeek: now.getDay(),
          shopName: selectedShop?.name,
          competitorCounts: competitors ?? undefined,
          demographics: demographics
            ? {
                population: demographics.population,
                chinese_pct: demographics.chinese_ancestry_pct,
                korean_pct: demographics.korean_ancestry_pct,
              }
            : undefined,
        })
        await stepsPromise
        setCampaign(response.campaign)
        setCampaignSource(response.source)
      } else {
        await stepsPromise
        setCampaign(MOCK_CAMPAIGNS[bizType])
        setCampaignSource('mock')
      }
    } catch (err) {
      console.warn('generate failed, falling back to mock:', err)
      await stepsPromise
      setCampaign(MOCK_CAMPAIGNS[bizType])
      setCampaignSource('mock')
    } finally {
      setGenerating(false)
      setTimeout(() => {
        const el = document.getElementById('cc-result-anchor')
        if (el) {
          const top = el.getBoundingClientRect().top + window.scrollY - 80
          window.scrollTo({ top, behavior: 'smooth' })
        }
      }, 80)
    }
  }, [generating, liveAi, photoFile, bizType, weather, now, selectedShop, competitors, demographics])

  // ---------- Council handlers ----------
  const simulateBoost = useCallback(() => {
    setBoostedExtra({ walks: 142, kg: 9.6, rev: 1840 })
  }, [])
  const resetBoost = useCallback(() => setBoostedExtra(null), [])

  const langReach = useMemo(() => {
    if (demographics) {
      const en = 100 - demographics.chinese_ancestry_pct - demographics.korean_ancestry_pct
      return {
        en: Math.max(0, en) / 100,
        zh: demographics.chinese_ancestry_pct / 100,
        ko: demographics.korean_ancestry_pct / 100,
      }
    }
    return { en: 0.52, zh: 0.31, ko: 0.17 }
  }, [demographics])

  // ---------- Render ----------
  const isDemo = !auth.hasSupabase

  return (
    <div className="shell">
      <a
        href="#main-content"
        style={{
          position: 'absolute',
          left: '-9999px',
          top: 'auto',
          width: 1,
          height: 1,
          overflow: 'hidden',
        }}
        onFocus={(e) => Object.assign(e.currentTarget.style, { left: '20px', top: '20px', width: 'auto', height: 'auto', padding: '12px 16px', background: 'var(--card)', borderRadius: 8, zIndex: 10000 })}
        onBlur={(e) => Object.assign(e.currentTarget.style, { left: '-9999px', top: 'auto', width: '1px', height: '1px' })}
      >
        Skip to main content
      </a>
      <Header totalCo2={totalCo2} theme={theme} onToggleTheme={toggle} todayLabel={todayLabel} />

      {/* PulseTicker — Council-only (live + projection numbers are pitch material) */}
      {mode === 'council' && (
        <PulseTicker
          liveSinceLaunch={{
            walks: council.stats.total_walks,
            co2Kg: council.stats.total_co2,
            walkingNow: council.stats.walking_now,
          }}
          pilotProjection={{
            walks: 1247,
            co2Kg: 84.6,
            extraRev: 14200,
            km: 312.4,
          }}
        />
      )}

      <ModeToggle mode={mode} setMode={setMode} />

      {/* Walker / owner — real web 2-column on desktop, single column on mobile */}
      {(mode === 'walk' || mode === 'shop') ? (
        <>
          <Hero mode={mode} onSmartPick={onSmartPickClick} smartPickReady={shops.length > 0} hasSelectedShop={!!selectedShop} />
          <Vitals cards={vitals} />
          <main id="main-content" className="cc-grid" tabIndex={-1}>
        <div className="cc-map-card">
          <div className="cc-map-head">
            <div className="cc-eyebrow">
              {shops.length} shops near Chatswood Station
              {shopsAreReal ? '' : ' · pilot personas'}
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

          {!selectedShop && (
            <div className="cc-map-hint">
              👆 ① Tap any shop pin to {mode === 'walk' ? 'see distance + points' : 'plan a campaign'}
            </div>
          )}

          <MapFilters
            cuisine={cuisine}
            setCuisine={setCuisine}
            tags={tagFilter}
            setTags={setTagFilter}
            showHeatmap={showHeatmap}
            setShowHeatmap={setShowHeatmap}
          />

          <Suspense
            fallback={
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
            }
          >
            <RealMap
              shops={shops}
              selectedShop={selectedShop}
              walkProgress={walkSession.phase === 'idle' ? null : walkSession.progress}
              walking={walkSession.phase === 'walking'}
              completed={walkSession.phase === 'completed' || walkSession.phase === 'arrived'}
              onSelect={onMapSelect}
              cuisineFilter={cuisine}
              tagFilter={tagFilter}
              showHeatmap={showHeatmap}
              transport={transport}
              userPosition={geo.position}
            />
          </Suspense>
        </div>

        <div className="cc-side">
          {mode === 'walk' && (
            <WalkPanel
              shop={selectedShop}
              walking={walkSession.phase === 'walking'}
              arrived={walkSession.phase === 'arrived'}
              completed={walkSession.phase === 'completed'}
              onStart={startWalk}
              onConfirm={confirmArrival}
              onReset={resetWalk}
              onSmartPick={onSmartPickClick}
              smartPickReasons={smartPickReasons ?? undefined}
              transport={transport}
              setTransport={setTransport}
              totalCo2={totalCo2}
              distanceToShop={walkSession.distanceToShop}
              isVerifiedGps={walkSession.isVerifiedGps}
              geolocationSupported={geo.isSupported}
              geolocationPermission={geolocationPermission}
              demoMode={demoMode}
              setDemoMode={setDemoMode}
            />
          )}
          {mode === 'shop' && (
            <ShopPanel
              shop={selectedShop}
              bizType={bizType}
              setBizType={setBizType}
              photoUrl={photoUrl}
              onPhotoChange={setPhotoFile}
              liveAi={liveAi}
              setLiveAi={setLiveAi}
              generating={generating}
              scanStep={scanStep}
              onGenerate={generate}
              insights={insights}
              allShops={shops}
              weather={weather}
              hour={now.getHours()}
              dayOfWeek={now.getDay()}
            />
          )}
        </div>

      <div id="cc-result-anchor">
        {mode === 'shop' && campaign && (
          <Suspense fallback={<div style={{ height: 200 }} />}>
            <ResultSection campaign={campaign} photoUrl={photoUrl} source={campaignSource} />
          </Suspense>
        )}
      </div>
      </main>
        </>
      ) : (
        /* Council mode — full-width dashboard (no phone frame) */
        <main id="main-content" className="cc-grid" tabIndex={-1}>
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
                shops={shops}
                selectedShop={selectedShop}
                walkProgress={null}
                walking={false}
                completed={false}
                onSelect={onMapSelect}
                cuisineFilter={cuisine}
                tagFilter={tagFilter}
                showHeatmap
                transport={transport}
                userPosition={geo.position}
              />
            </Suspense>
          </div>
          <div className="cc-side">
            <CouncilPanel
              boostedExtra={boostedExtra}
              onSimulateBoost={simulateBoost}
              onResetBoost={resetBoost}
              langReach={langReach}
              chinesePct={demographics?.chinese_ancestry_pct}
              koreanPct={demographics?.korean_ancestry_pct}
            />
          </div>
          <Suspense fallback={<div style={{ height: 280 }} />}>
            <CouncilDashboard
              stats={council.stats}
              topStreets={council.topStreets}
              dailyWalks={council.dailyWalks}
              boostedExtra={boostedExtra}
              fallbackProjections={
                isDemo || !council.stats.loaded
                  ? { walks: 1247, co2Kg: 84.6, extraRev: 14200, walkingNow: 0 }
                  : undefined
              }
            />
          </Suspense>
        </main>
      )}

      <Footer mode={mode} />

      <MobileNav mode={mode} setMode={setMode} />

      {showRewardOverlay && walkSession.rewardSummary && selectedShop && (
        <RewardOverlay
          shopName={selectedShop.name}
          points={walkSession.rewardSummary.points}
          co2Kg={walkSession.rewardSummary.co2Kg}
          discount={walkSession.rewardSummary.discount}
          totalCo2After={totalCo2 + walkSession.rewardSummary.co2Kg}
          isVerifiedGps={walkSession.isVerifiedGps}
          onClose={() => {
            setShowRewardOverlay(false)
            resetWalk()
          }}
        />
      )}
    </div>
  )
}
