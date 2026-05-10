import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { Shop, BizType, CuisineId, ShopTag, TransportId } from './types/shop'
import type { Campaign } from './types/campaign'
import type { AppMode } from './components/ModeToggle'
import { SHOPS } from './data/shops'
import { MOCK_CAMPAIGNS } from './data/mockCampaigns'

import { Header } from './components/Header'
import { PulseTicker } from './components/PulseTicker'
import { Hero } from './components/Hero'
import { Vitals } from './components/Vitals'
import { ModeToggle } from './components/ModeToggle'
import { MapFilters } from './components/MapFilters'
import { RealMap } from './components/RealMap'
import { WalkPanel } from './components/WalkPanel'
import { ShopPanel } from './components/ShopPanel'
import { CouncilPanel } from './components/CouncilPanel'
import { CouncilDashboard } from './components/CouncilDashboard'
import { ResultSection } from './components/ResultSection'
import { Footer } from './components/Footer'
import { MobileNav } from './components/MobileNav'

import { useTheme } from './hooks/useTheme'
import { useWeather } from './hooks/useWeather'
import { useCompetitorCounts } from './hooks/useCompetitorCounts'
import { useDemographics } from './hooks/useDemographics'
import { useGeolocation } from './hooks/useGeolocation'
import { useSupabaseAuth } from './hooks/useSupabaseAuth'
import { useUserStats } from './hooks/useUserStats'
import { useCouncilStats } from './hooks/useCouncilStats'
import { useWalkSession } from './hooks/useWalkSession'
import { useNow } from './hooks/useNow'

import { generateInsights, buildVitals } from './lib/insights'
import { generateCampaign } from './lib/claude'

const STATION_DAILY_AVG = 47832 // TfNSW Aug 2024 monthly aggregate

export function App() {
  // ---------- Theme ----------
  const { theme, toggle } = useTheme()

  // ---------- Mode ----------
  const [mode, setMode] = useState<AppMode>('walk')

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

  // ---------- Real-data hooks ----------
  const now = useNow(60_000)
  const { weather } = useWeather()
  const { counts: competitors } = useCompetitorCounts()
  const { demographics } = useDemographics()

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
    })
  }, [bizType, selectedShop, weather, competitors, now])

  // ---------- Vitals ----------
  const vitals = useMemo(() => {
    return buildVitals({
      weather,
      competitors,
      bizType,
      stationDailyAvg: STATION_DAILY_AVG,
      date: now,
    })
  }, [weather, competitors, bizType, now])

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

  const confirmArrival = useCallback(() => {
    walkSession.confirmArrival()
  }, [walkSession])

  const resetWalk = useCallback(() => {
    setSelectedShop(null)
    walkSession.reset()
  }, [walkSession])

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
      <Header totalCo2={totalCo2} theme={theme} onToggleTheme={toggle} todayLabel={todayLabel} />

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

      <Hero />

      <Vitals cards={vitals} />

      <ModeToggle mode={mode} setMode={setMode} />

      <div className="cc-grid">
        <div className="cc-map-card">
          <div className="cc-map-head">
            <div className="cc-eyebrow">
              {mode === 'council'
                ? 'Chatswood CBD · live foot traffic + boosted streets'
                : `Chatswood CBD · 6 shops · 5 landmarks · 4 bike racks${competitors ? ` · ${competitors.cafes + competitors.restaurants} eateries (live OSM)` : ''}`}
            </div>
            <div className="cc-map-legend">
              <span className="cc-chip"><span className="cc-chip-dot" style={{ background: '#5B9BD5' }} /> 1× near</span>
              <span className="cc-chip"><span className="cc-chip-dot" style={{ background: '#F5C842' }} /> 2× mid</span>
              <span className="cc-chip"><span className="cc-chip-dot" style={{ background: '#FF6B9D' }} /> 3× far</span>
            </div>
          </div>

          {mode !== 'council' && !selectedShop && (
            <div className="cc-map-hint">👆 Tap any shop pin to {mode === 'walk' ? 'start a walk' : 'plan a campaign'}</div>
          )}

          {mode !== 'council' && (
            <MapFilters
              cuisine={cuisine}
              setCuisine={setCuisine}
              tags={tagFilter}
              setTags={setTagFilter}
              showHeatmap={showHeatmap}
              setShowHeatmap={setShowHeatmap}
            />
          )}

          <RealMap
            shops={SHOPS}
            selectedShop={selectedShop}
            walkProgress={walkSession.phase === 'idle' ? null : walkSession.progress}
            walking={walkSession.phase === 'walking'}
            completed={walkSession.phase === 'completed' || walkSession.phase === 'arrived'}
            onSelect={onMapSelect}
            cuisineFilter={cuisine}
            tagFilter={tagFilter}
            showHeatmap={showHeatmap || mode === 'council'}
            transport={transport}
            userPosition={geo.position}
          />
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
            />
          )}
          {mode === 'council' && (
            <CouncilPanel
              boostedExtra={boostedExtra}
              onSimulateBoost={simulateBoost}
              onResetBoost={resetBoost}
              langReach={langReach}
              chinesePct={demographics?.chinese_ancestry_pct}
              koreanPct={demographics?.korean_ancestry_pct}
            />
          )}
        </div>
      </div>

      {mode === 'council' && (
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
      )}

      <div id="cc-result-anchor">
        {mode === 'shop' && campaign && (
          <ResultSection campaign={campaign} photoUrl={photoUrl} source={campaignSource} />
        )}
      </div>

      <Footer />

      <MobileNav mode={mode} setMode={setMode} />
    </div>
  )
}
