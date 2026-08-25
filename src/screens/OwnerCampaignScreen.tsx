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
import { useDemographics } from '../hooks/useDemographics'
import { useNow } from '../hooks/useNow'
import { generateInsights } from '../lib/insights'
import { MOCK_CAMPAIGNS } from '../data/mockCampaigns'
import { getTodayEvent } from '../data/events'
import { generateCampaign } from '../lib/claude'
import type { Campaign } from '../types/campaign'

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
  if (/(gongcha|bubble|boba|tea|milk[ -]?tea)/.test(n)) return 'Cafe'
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
    title: 'Pearl milk tea + brown sugar boba · $9',
    head: 'Beat the rain. Pearl milk tea + brown sugar boba for $9.',
    body: 'Walk in before 1:30. Warm cup, chewy pearls, dry seat. We speak EN · 中文 · 한국어.',
    uplift: 'Predicted uplift',
    ship: 'Ship to walkers nearby',
  },
  zh: {
    title: '珍珠奶茶 + 黑糖珍珠 · $9',
    head: '雨天暖心套餐 · 珍珠奶茶 + 黑糖珍珠 $9',
    body: '1:30 之前到店。温暖的奶茶、Q 弹珍珠、干净的座位。',
    uplift: '预计提升',
    ship: '推送给附近的步行者',
  },
  ko: {
    title: '펄밀크티 + 흑당버블 · $9',
    head: '비 오는 날 · 펄밀크티 + 흑당버블 $9',
    body: '1:30 전에 들러주세요. 따뜻한 버블티, 쫄깃한 펄, 마른 자리.',
    uplift: '예상 증가',
    ship: '근처 워커에게 보내기',
  },
}

export function OwnerCampaignScreen() {
  const now = useNow(60_000)
  const { weather } = useWeather()
  const { counts } = useCompetitorCounts()
  const { demographics } = useDemographics()
  const todayEvent = getTodayEvent(now)
  const [searchParams] = useSearchParams()
  const eventId = searchParams.get('event')
  const linkedEvent = useMemo(() => CULTURAL_EVENTS.find((e) => e.id === eventId) ?? null, [eventId])

  // Persisted state — survives accidental refresh during demo.
  // Shop name "Gongcha" → Cafe as default (bubble tea shop maps to Cafe BizType)
  // When URL has ?demo=1, always start fresh on STEP 1 (Snap & Scan) so the
  // upload buttons are visible — otherwise sessionStorage could jump straight
  // to step 3 (campaign result) and the presenter can't show the photo upload.
  const isDemo = searchParams.get('demo') === '1'
  const persisted = isDemo ? {} as ReturnType<typeof readCampaignState> : readCampaignState()
  const [step, setStep] = useState<Step>(persisted.step ?? 1)
  const [bizType, setBizType] = useState<BizType>(persisted.bizType ?? defaultBizFromShopName('Gongcha'))
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [lang, setLang] = useState<Lang>(persisted.lang ?? 'en')
  const [copied, setCopied] = useState(false)
  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [assetTab, setAssetTab] = useState<'ig' | 'google' | 'sign' | 'script'>('ig')
  const [error, setError] = useState<string | null>(null)

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

  const generate = async () => {
    setStep(2)
    setError(null)
    // Demo mode: skip API call entirely, show pre-baked Gongcha campaign instantly
    // (~800ms scan animation for visual effect, then jump to step 3 with mock)
    if (isDemo) {
      setTimeout(() => {
        setCampaign(MOCK_CAMPAIGNS[bizType])
        setStep(3)
      }, 800)
      return
    }
    if (!photoFile) {
      // Mock fallback when no photo — keeps demo flow working
      setTimeout(() => setStep(3), 1800)
      return
    }
    try {
      const photoBase64 = await fileToBase64(photoFile)
      const photoMime = photoFile.type || 'image/jpeg'
      const result = await generateCampaign({
        photoBase64,
        photoMime,
        bizType,
        weather,
        hour: now.getHours(),
        dayOfWeek: now.getDay(),
        shopName: 'Gongcha',
        competitorCounts: counts ? { cafes: counts.cafes, restaurants: counts.restaurants, bakeries: counts.bakeries } : undefined,
        demographics: demographics
          ? {
              population: demographics.population ?? 25000,
              chinese_pct: Math.round(demographics.chinese_ancestry_pct),
              korean_pct: Math.round(demographics.korean_ancestry_pct),
            }
          : undefined,
      })
      setCampaign(result.campaign)
      setStep(3)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error'
      console.warn('generate failed, falling back to mock:', msg)
      setError(msg)
      setTimeout(() => setStep(3), 600) // still advance with mock copy
    }
  }

  function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        const result = reader.result as string
        // Strip data:image/jpeg;base64, prefix — API wants raw base64
        const comma = result.indexOf(',')
        resolve(comma >= 0 ? result.slice(comma + 1) : result)
      }
      reader.onerror = () => reject(reader.error)
      reader.readAsDataURL(file)
    })
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
        <div className="cc-camp-v55-result">
          {/* DARK REVENUE HERO */}
          <div className="cc-camp-revenue">
            <span className="cc-camp-revenue-eb">EST. EXTRA REVENUE · TODAY</span>
            <h2 className="cc-camp-revenue-num">+${(campaign?.revenue ?? 285).toLocaleString()}</h2>
            <div className="cc-camp-revenue-meta">
              +{campaign?.orders ?? 19} orders @ ${campaign?.avg ?? 15} avg · window {campaign?.windowText ?? '5–7PM'}
            </div>
            <div className="cc-camp-play-card">
              <b>{campaign?.name ?? 'Rainy Day Pour-Over Push'}</b>
              <small>chosen strategy · {campaign?.score ?? 96}/100 opportunity</small>
            </div>
          </div>

          {/* OPPORTUNITY SCORE */}
          <div className="cc-camp-oppy">
            <header>
              <span>Opportunity score</span>
              <b>{campaign?.score ?? 96}<small>/100</small></b>
            </header>
            <div className="cc-camp-oppy-bar">
              <span style={{ width: `${campaign?.score ?? 96}%` }} />
            </div>
            <div className="cc-camp-oppy-sigs">
              {(campaign?.signals ?? [
                { name: 'RAIN', impact: '' },
                { name: 'STATION PEAK', impact: '' },
                { name: 'LOW COMPETITORS', impact: '@ 5PM' },
              ])
                .slice(0, 3)
                .map((s, i) => (
                  <span key={i}>{s.name}{s.impact ? ` ${s.impact}` : ''}</span>
                ))}
            </div>
          </div>

          {/* ASSET TABS */}
          <div className="cc-camp-asset-tabs" role="tablist">
            {[
              { id: 'ig' as const, emoji: '📷', label: 'Instagram' },
              { id: 'google' as const, emoji: '🔍', label: 'Google' },
              { id: 'sign' as const, emoji: '🪧', label: 'Sign' },
              { id: 'script' as const, emoji: '🎭', label: 'Script' },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={assetTab === t.id}
                className={`cc-camp-asset-tab${assetTab === t.id ? ' is-on' : ''}`}
                onClick={() => setAssetTab(t.id)}
              >
                <span aria-hidden="true">{t.emoji}</span> {t.label}
              </button>
            ))}
          </div>

          {/* LANG PILLS */}
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

          {/* ASSET CARD — IG-mock style */}
          <div className="cc-camp-asset-card">
            <header>
              <span className="cc-camp-asset-thumb" aria-hidden="true">
                {photoUrl ? <img src={photoUrl} alt="" /> : <span>🧋</span>}
              </span>
              <div>
                <b>@gongcha_chatswood</b>
                <small>sponsored · 3 langs</small>
              </div>
            </header>
            <p className="cc-camp-asset-body">
              {assetTab === 'ig' && (campaign?.assets.ig[lang] ?? COPY_BY_LANG[lang].body)}
              {assetTab === 'google' && (campaign?.assets.google[lang] ?? COPY_BY_LANG[lang].head)}
              {assetTab === 'sign' && (campaign
                ? `${campaign.assets.sign[lang].big} — ${campaign.assets.sign[lang].sub}`
                : COPY_BY_LANG[lang].head)}
              {assetTab === 'script' && (campaign?.assets.script[lang] ?? COPY_BY_LANG[lang].body)}
            </p>
            <div className="cc-camp-uplift">
              <TrendingUp size={14} strokeWidth={2.4} aria-hidden="true" />
              <span>Predicted uplift</span>
              <b>+${campaign?.revenue ?? upliftValue}</b>
            </div>
          </div>

          {/* SECONDARY ACTIONS */}
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
            {COPY_BY_LANG[lang].ship}
          </button>

          {/* "Live AI" badge when real data, error hint when fallback */}
          {campaign && (
            <div className="cc-camp-live-badge">
              <CattoPill tone="dark">⚡ LIVE · Azure OpenAI vision · {campaign.score}/100</CattoPill>
            </div>
          )}
          {!campaign && error && (
            <p className="cc-camp-error">Live AI unavailable — showing demo copy. ({error})</p>
          )}
        </div>
      )}
    </div>
  )
}
