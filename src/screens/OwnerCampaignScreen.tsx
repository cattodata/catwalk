import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Sparkles, Copy, Share, CloudRain, MapPin, TrainFront } from 'lucide-react'
import type { BizType } from '../types/shop'

import { CattoPill } from '../components/CattoPill'
import { OwnerStepper } from '../components/OwnerStepper'
import { PhotoDrop } from '../components/PhotoDrop'
import { BizPills } from '../components/BizPills'
import { InsightsLiveCard } from '../components/InsightsLiveCard'
import { ForecastHero } from '../components/ForecastHero'
import { OpportunityScoreBar } from '../components/OpportunityScoreBar'

import { useWeather } from '../hooks/useWeather'
import { useCompetitorCounts } from '../hooks/useCompetitorCounts'
import { useNow } from '../hooks/useNow'
import { generateInsights } from '../lib/insights'
import { getTodayEvent } from '../data/events'

type Step = 1 | 2 | 3
type Lang = 'en' | 'zh' | 'ko'
type AssetTab = 'instagram' | 'google' | 'sign' | 'script'

const ASSET_TABS: { id: AssetTab; label: string; emoji: string }[] = [
  { id: 'instagram', label: 'Instagram', emoji: '📷' },
  { id: 'google',    label: 'Google',    emoji: '🔍' },
  { id: 'sign',      label: 'Sign',      emoji: '🪧' },
  { id: 'script',    label: 'Script',    emoji: '🎭' },
]

const LANGS: { id: Lang; label: string }[] = [
  { id: 'en', label: 'EN' },
  { id: 'zh', label: '中文' },
  { id: 'ko', label: '한국어' },
]

const COPY_BY_LANG: Record<Lang, Record<AssetTab, { title: string; body: string }>> = {
  en: {
    instagram: { title: 'Rainy Day Pour-Over Push', body: '☔️ Stay cosy. Free croissant with every pour-over today after 5pm. Indoor seating. Tap to grab yours. #ChatswoodEats' },
    google:    { title: 'Free croissant w/ pour-over', body: 'Saint Honoré · Chatswood · 5–7pm · today only · indoor seating, dry feet, deep aroma.' },
    sign:      { title: 'POUR-OVER · FREE CROISSANT', body: 'Window sign · A4 · stays up until 7pm tonight.' },
    script:    { title: 'Counter script', body: '“Hey — quick one. Pour-over with a free croissant tonight if you’re escaping the rain. Same price, lasts till 7.”' },
  },
  zh: {
    instagram: { title: '雨天手冲咖啡', body: '☔️ 今晚 5 点后买手冲，免费送一只可颂！室内座位等你来。#车士活' },
    google:    { title: '手冲 + 免费可颂', body: 'Saint Honoré · 车士活 · 今晚 5-7 点 · 干爽座位，温暖香气。' },
    sign:      { title: '手冲咖啡 · 免费可颂', body: '橱窗标牌 · 今晚 7 点前有效。' },
    script:    { title: '柜台话术', body: '“手冲今晚买一送一（送可颂），下雨天暖暖喝一杯。”' },
  },
  ko: {
    instagram: { title: '비 오는 날 푸어오버', body: '☔️ 오후 5시 이후 푸어오버 주문하면 크루아상 무료! 따뜻한 실내석. #차츠우드' },
    google:    { title: '푸어오버 + 무료 크루아상', body: 'Saint Honoré · 차츠우드 · 오늘 5-7pm · 실내석 · 향긋한 커피.' },
    sign:      { title: '푸어오버 · 무료 크루아상', body: '윈도우 사인 · 오늘 7시까지.' },
    script:    { title: '카운터 멘트', body: '“푸어오버에 크루아상 하나 무료로 드립니다 — 비 피하면서 따뜻하게 한 잔 하세요.”' },
  },
}

export function OwnerCampaignScreen() {
  const navigate = useNavigate()
  const now = useNow(60_000)
  const { weather } = useWeather()
  const { counts } = useCompetitorCounts()
  const todayEvent = getTodayEvent(now)

  const [step, setStep] = useState<Step>(1)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [bizType, setBizType] = useState<BizType>('Cafe')
  const [assetTab, setAssetTab] = useState<AssetTab>('instagram')
  const [lang, setLang] = useState<Lang>('en')

  const lastUrlRef = useRef<string | null>(null)
  useEffect(() => {
    if (!photoFile) {
      if (lastUrlRef.current) URL.revokeObjectURL(lastUrlRef.current)
      lastUrlRef.current = null
      setPhotoUrl(null)
      return
    }
    const url = URL.createObjectURL(photoFile)
    lastUrlRef.current = url
    setPhotoUrl(url)
    return () => {
      URL.revokeObjectURL(url)
    }
  }, [photoFile])

  const insightRows = useMemo(() => {
    const ai = generateInsights({
      bizType,
      shop: null,
      weather,
      competitors: counts,
      hour: now.getHours(),
      dayOfWeek: now.getDay(),
      todayEvent,
    })
    // Translate to first-person Catto voice rows (icon + text)
    return ai.slice(0, 3).map((i) => ({ emoji: i.icon, text: `${i.title} — ${i.sub}` }))
  }, [bizType, weather, counts, now, todayEvent])

  const generate = () => {
    setStep(2)
    setTimeout(() => setStep(3), 1800)
  }

  const asset = COPY_BY_LANG[lang][assetTab]

  return (
    <div className="cc-camp-screen">
      <header className="cc-camp-bar">
        <Link to="/owner" className="cc-icon-btn" aria-label="Back">
          <ArrowLeft size={18} aria-hidden="true" />
        </Link>
        <span className="cc-camp-bar-title">Plan today's play</span>
        <span style={{ width: 36 }} />
      </header>

      <OwnerStepper step={step} />

      {step === 1 && (
        <div className="cc-camp-body">
          <div>
            <span className="cc-camp-eb">STEP 1 · SNAP & SCAN</span>
            <h2 className="cc-camp-h">Snap your hero product.</h2>
            <p className="cc-camp-sub">Catto reads it + live signals → ready-to-post campaign in 3 languages.</p>
          </div>
          <PhotoDrop photoUrl={photoUrl} onFile={setPhotoFile} />
          <BizPills value={bizType} onChange={setBizType} />
          <InsightsLiveCard
            rows={insightRows.length > 0 ? insightRows : [
              { icon: <CloudRain size={14} strokeWidth={2} />, text: 'Rain in 30 min — coffee jumps 32%' },
              { icon: <MapPin size={14} strokeWidth={2} />, text: '11 cafes in 700m — 4 have queues' },
              { icon: <TrainFront size={14} strokeWidth={2} />, text: 'Station peak in 22 min — 2,100 commuters' },
            ]}
          />
          <button type="button" className="cc-camp-cta" onClick={generate}>
            <Sparkles size={16} strokeWidth={2.2} aria-hidden="true" />
            Generate today's play
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="cc-camp-body cc-camp-scan">
          <div className="cc-camp-scan-card">
            <div className="cc-scan-spinner" aria-hidden="true" />
            <b>Catto is reading your photo + 5 live signals…</b>
            <small>Vision · weather · competitors · station peak · demographics</small>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="cc-camp-body">
          <ForecastHero
            revenue={285}
            orders={19}
            avgTicket={15}
            windowText="5–7PM"
            playName="Rainy Day Pour-Over Push"
            opportunityScore={96}
          />
          <OpportunityScoreBar score={96} witness="RAIN · STATION PEAK · LOW COMPETITORS @ 5PM" />

          {/* Asset tabs */}
          <div className="cc-asset-tabs" role="tablist">
            {ASSET_TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={t.id === assetTab}
                className={`cc-asset-tab${t.id === assetTab ? ' is-on' : ''}`}
                onClick={() => setAssetTab(t.id)}
              >
                <span aria-hidden="true">{t.emoji}</span>
                {t.label}
              </button>
            ))}
          </div>

          {/* Lang row */}
          <div className="cc-lang-row" role="radiogroup" aria-label="Language">
            {LANGS.map((l) => (
              <button
                key={l.id}
                type="button"
                role="radio"
                aria-checked={l.id === lang}
                className={`cc-lang-pill${l.id === lang ? ' is-on' : ''}`}
                onClick={() => setLang(l.id)}
              >
                {l.label}
              </button>
            ))}
          </div>

          {/* Asset card */}
          <div className="cc-asset-card">
            <CattoPill tone="dark" className="cc-asset-pill">
              CATTO WROTE THIS
            </CattoPill>
            <h4>{asset.title}</h4>
            <p>{asset.body}</p>
            <div className="cc-copy-row">
              <button
                type="button"
                className="cc-copy-btn"
                onClick={() => navigator.clipboard?.writeText(asset.body)}
              >
                <Copy size={14} strokeWidth={2.2} /> Copy caption
              </button>
              <button type="button" className="cc-copy-btn">
                <Share size={14} strokeWidth={2.2} /> Share
              </button>
            </div>
          </div>

          <button type="button" className="cc-camp-cta cc-camp-cta-ghost" onClick={() => navigate('/owner')}>
            ← Back to forecast
          </button>
        </div>
      )}
    </div>
  )
}
