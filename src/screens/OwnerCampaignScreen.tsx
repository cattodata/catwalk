import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { CULTURAL_EVENTS } from '../data/culturalEvents'
import { ArrowLeft, Sparkles, Copy, Share, CloudRain, MapPin, TrainFront, TrendingUp } from 'lucide-react'
import type { BizType } from '../types/shop'

import { CattoPill } from '../components/CattoPill'
import { OwnerStepper } from '../components/OwnerStepper'
import { PhotoDrop } from '../components/PhotoDrop'
import { BizPills } from '../components/BizPills'
import { InsightsLiveCard } from '../components/InsightsLiveCard'

import { useWeather } from '../hooks/useWeather'
import { useCompetitorCounts } from '../hooks/useCompetitorCounts'
import { useNow } from '../hooks/useNow'
import { generateInsights } from '../lib/insights'
import { getTodayEvent } from '../data/events'

type Step = 1 | 2 | 3
type Lang = 'en' | 'zh' | 'ko'

const STATE_KEY = 'cc:owner-campaign'
interface PersistedState {
  step?: Step
  bizType?: BizType
  lang?: Lang
}
function readCampaignState(): PersistedState {
  if (typeof window === 'undefined') return {}
  try {
    const raw = window.localStorage.getItem(STATE_KEY)
    return raw ? (JSON.parse(raw) as PersistedState) : {}
  } catch {
    return {}
  }
}
function writeCampaignState(s: PersistedState) {
  try {
    window.localStorage.setItem(STATE_KEY, JSON.stringify(s))
  } catch {
    /* ignore */
  }
}
function defaultBizFromShopName(name: string): BizType {
  const n = name.toLowerCase()
  if (/(bakery|patisserie|honor|crois|cake|pastry|donut)/.test(n)) return 'Bakery'
  if (/(restaurant|ramen|sushi|thai|pho|noodle|grill|kitchen)/.test(n)) return 'Restaurant'
  return 'Cafe'
}

const LANGS: { id: Lang; label: string }[] = [
  { id: 'en', label: 'EN' },
  { id: 'zh', label: '中文' },
  { id: 'ko', label: '한국어' },
]

const COPY_BY_LANG: Record<Lang, { title: string; head: string; body: string; uplift: string; ship: string }> = {
  en: {
    title: 'Croissant + flat white · $9',
    head: 'Beat the rain. Croissant + flat white for $9.',
    body: 'Walk in before 1:30. Warm pastry, warm cup, dry seat. We speak EN · 中文 · 한국어.',
    uplift: 'Predicted uplift',
    ship: 'Ship to walkers nearby',
  },
  zh: {
    title: '可颂 + 拿铁 · $9',
    head: '雨天暖心套餐 · 可颂 + 拿铁 $9',
    body: '1:30 之前到店。暖香酥皮、热咖啡、干净座位。',
    uplift: '预计提升',
    ship: '推送给附近的步行者',
  },
  ko: {
    title: '크루아상 + 플랫화이트 · $9',
    head: '비 오는 날 · 크루아상 + 플랫화이트 $9',
    body: '1:30 전에 들러주세요. 따뜻한 페이스트리, 따뜻한 커피, 마른 자리.',
    uplift: '예상 증가',
    ship: '근처 워커에게 보내기',
  },
}

export function OwnerCampaignScreen() {
  const now = useNow(60_000)
  const { weather } = useWeather()
  const { counts } = useCompetitorCounts()
  const todayEvent = getTodayEvent(now)
  const [searchParams] = useSearchParams()
  const eventId = searchParams.get('event')
  const linkedEvent = useMemo(() => CULTURAL_EVENTS.find((e) => e.id === eventId) ?? null, [eventId])

  // Persisted state — survives accidental refresh during demo.
  // Shop name "Saint Honoré" → Bakery as default (real bakery)
  const persisted = readCampaignState()
  const [step, setStep] = useState<Step>(persisted.step ?? 1)
  const [bizType, setBizType] = useState<BizType>(persisted.bizType ?? defaultBizFromShopName('Saint Honoré'))
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [lang, setLang] = useState<Lang>(persisted.lang ?? 'en')
  const [copied, setCopied] = useState(false)

  // Persist on every change so a mid-form refresh doesn't lose work
  useEffect(() => {
    writeCampaignState({ step, bizType, lang })
  }, [step, bizType, lang])

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
    return ai.slice(0, 3).map((i) => ({ emoji: i.icon, text: `${i.title} — ${i.sub}` }))
  }, [bizType, weather, counts, now, todayEvent])

  const generate = () => {
    setStep(2)
    setTimeout(() => setStep(3), 1800)
  }

  const asset = COPY_BY_LANG[lang]
  const upliftValue = useMemo(() => {
    const base = 285
    const jitter = (lang.charCodeAt(0) * 7) % 30
    return base + jitter
  }, [lang])

  const onCopy = async () => {
    try {
      await navigator.clipboard?.writeText(`${asset.head}\n${asset.body}`)
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    } catch {
      /* clipboard unavailable */
    }
  }
  const onShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: asset.title, text: `${asset.head}\n${asset.body}` })
      } catch {
        /* user dismissed */
      }
    } else {
      onCopy()
    }
  }

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
            <p className="cc-camp-sub">
              Catto reads it + live signals → ready-to-post campaign in 3 languages.
            </p>
          </div>
          {linkedEvent && (
            <div className="cc-camp-event-hint" role="note">
              <span className="cc-camp-event-em" aria-hidden="true">{linkedEvent.emoji}</span>
              <span>
                <b>Event: {linkedEvent.name}</b>
                <small>{linkedEvent.ownerAction} · predicted +{linkedEvent.predictedLift}% walks</small>
              </span>
            </div>
          )}
          <PhotoDrop photoUrl={photoUrl} onFile={setPhotoFile} />
          <BizPills value={bizType} onChange={setBizType} />
          <InsightsLiveCard
            rows={
              insightRows.length > 0
                ? insightRows
                : [
                    { icon: <CloudRain size={14} strokeWidth={2} />, text: 'Rain in 30 min — coffee jumps 32%' },
                    { icon: <MapPin size={14} strokeWidth={2} />, text: '11 cafes in 700m — 4 have queues' },
                    { icon: <TrainFront size={14} strokeWidth={2} />, text: 'Station peak in 22 min — 2,100 commuters' },
                  ]
            }
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
        <div className="cc-camp-v5">
          {/* Hero photo */}
          <div className="cc-camp-hero-photo">
            {photoUrl ? (
              <img src={photoUrl} alt="" className="cc-camp-hero-img" />
            ) : (
              <div className="cc-camp-hero-placeholder cc-camp-hero-placeholder-static">
                🥐
              </div>
            )}
            <div className="cc-camp-hero-meta">
              <CattoPill tone="dark">CATTO WROTE THIS</CattoPill>
              <h3>{asset.title}</h3>
            </div>
          </div>

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

          <div className="cc-camp-caption">
            <div className="cc-camp-caption-head">{asset.head}</div>
            <p className="cc-camp-caption-body">{asset.body}</p>
            <div className="cc-camp-uplift">
              <TrendingUp size={14} strokeWidth={2.4} aria-hidden="true" />
              <span>{asset.uplift}</span>
              <b>+${upliftValue}</b>
            </div>
          </div>

          <div className="cc-camp-actions">
            <button type="button" className="cc-camp-secondary" onClick={onCopy}>
              <Copy size={14} strokeWidth={2.2} aria-hidden="true" />
              {copied ? 'Copied!' : 'Copy caption'}
            </button>
            <button type="button" className="cc-camp-secondary" onClick={onShare}>
              <Share size={14} strokeWidth={2.2} aria-hidden="true" />
              Share
            </button>
          </div>

          <button type="button" className="cc-camp-cta">
            {asset.ship}
          </button>
        </div>
      )}
    </div>
  )
}
