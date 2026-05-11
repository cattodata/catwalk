import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Camera, Copy, Share, TrendingUp } from 'lucide-react'

import { CattoPill } from '../components/CattoPill'

type Lang = 'en' | 'zh' | 'ko'

const LANGS: { id: Lang; label: string }[] = [
  { id: 'en', label: 'EN' },
  { id: 'zh', label: '中文' },
  { id: 'ko', label: '한국어' },
]

const COPY_BY_LANG: Record<Lang, {
  title: string
  head: string
  body: string
  uplift: string
  ship: string
}> = {
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
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [lang, setLang] = useState<Lang>('en')
  const [copied, setCopied] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
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
        <span className="cc-camp-bar-title">Today's play</span>
        <span className="cc-camp-bar-sub">Generated · 0.8s</span>
      </header>

      <div className="cc-camp-v5">
        {/* Hero photo — single AI moment via CATTO WROTE THIS pill */}
        <label className="cc-camp-hero-photo" onClick={() => inputRef.current?.click()}>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={(e) => setPhotoFile(e.target.files?.[0] ?? null)}
            style={{ display: 'none' }}
          />
          {photoUrl ? (
            <img src={photoUrl} alt="" className="cc-camp-hero-img" />
          ) : (
            <div className="cc-camp-hero-placeholder">
              <Camera size={40} strokeWidth={1.6} aria-hidden="true" />
              <b>Tap to swap photo</b>
              <small>Catto will rewrite caption for the new shot</small>
            </div>
          )}
          <div className="cc-camp-hero-meta">
            <CattoPill tone="dark">CATTO WROTE THIS</CattoPill>
            <h3>{asset.title}</h3>
          </div>
        </label>

        {/* Lang switcher */}
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

        {/* Caption card */}
        <div className="cc-camp-caption">
          <div className="cc-camp-caption-head">{asset.head}</div>
          <p className="cc-camp-caption-body">{asset.body}</p>
          <div className="cc-camp-uplift">
            <TrendingUp size={14} strokeWidth={2.4} aria-hidden="true" />
            <span>{asset.uplift}</span>
            <b>+${upliftValue}</b>
          </div>
        </div>

        {/* Action row */}
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
    </div>
  )
}
