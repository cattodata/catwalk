import { useState, useMemo } from 'react'
import { X, Send, Loader2, Languages, Check, AlertCircle } from 'lucide-react'
import type { BusinessRecord } from '../lib/businessHealth'

interface Props {
  recipients: BusinessRecord[]
  open: boolean
  onClose: () => void
}

type Template = 'road-works' | 'event' | 'survey' | 'custom'

const TEMPLATES: Record<Template, { subject: string; body: string }> = {
  'road-works': {
    subject: 'Pacific Hwy works · Mon–Wed · revised foot traffic plan',
    body:
      'Hi {{name}},\n\nQuick heads-up from Willoughby City Council: Pacific Hwy resurfacing runs Mon–Wed 7am–4pm next week. Expect ~20% lower foot traffic on the {{street}} side.\n\nWe will redirect Catto Wheels e-bike riders past your front entry and amplify your shop in this weekend\'s Walker rewards.\n\nNeed anything? Reply to this email.\n\n— Willoughby City Council',
  },
  event: {
    subject: 'Lunar New Year Lantern Festival · feature your shop',
    body:
      'Hi {{name}},\n\nThe Chatswood Lunar New Year Lantern Festival lands on Saturday. We would love to feature {{name}} in council comms across EN / 中文 / 한국어.\n\nAll we need: a 1-line offer (e.g. 10% off, free taster) by Thursday. We will include you in the council push and Catto Compass walker rewards.\n\n— Willoughby City Council',
  },
  survey: {
    subject: 'Quick 2-min survey · shop-front improvements 2026',
    body:
      'Hi {{name}},\n\nCouncil is shaping the 2026 shop-front grants program. A 2-min survey helps us prioritise improvements on your strip ({{street}}).\n\nWe will share the aggregated results — you will see exactly where {{street}} ranks against the rest of the LGA.\n\n— Willoughby City Council',
  },
  custom: { subject: '', body: '' },
}

type SendState =
  | { kind: 'idle' }
  | { kind: 'sending' }
  | { kind: 'done'; accepted: number; rejected: number; id?: string }
  | { kind: 'error'; message: string }

export function BulkContactSheet({ recipients, open, onClose }: Props) {
  const [template, setTemplate] = useState<Template>('road-works')
  const [subject, setSubject] = useState(TEMPLATES[template].subject)
  const [body, setBody] = useState(TEMPLATES[template].body)
  const [lang, setLang] = useState<'en' | 'zh' | 'ko'>('en')
  const [translating, setTranslating] = useState(false)
  const [translated, setTranslated] = useState<{ zh?: string; ko?: string }>({})
  const [send, setSend] = useState<SendState>({ kind: 'idle' })

  const handleTemplate = (t: Template) => {
    setTemplate(t)
    setSubject(TEMPLATES[t].subject)
    setBody(TEMPLATES[t].body)
    setTranslated({})
    setLang('en')
  }

  const renderedBody = useMemo(() => {
    const base = lang === 'en' ? body : translated[lang] ?? body
    return base
  }, [body, lang, translated])

  const translate = async () => {
    setTranslating(true)
    try {
      const res = await fetch('/api/claude-text', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          system:
            'You translate council outreach emails into 中文 (Simplified) and Korean. Output STRICT JSON: { "zh": "...", "ko": "..." } — no extra text, no markdown fences.',
          user: `Translate this email body. Keep merge tokens {{name}} and {{street}} EXACTLY as-is.\n\n--- EN BODY ---\n${body}\n--- END ---`,
        }),
      })
      const data = await res.json()
      const text = typeof data.text === 'string' ? data.text : data.content ?? ''
      const cleaned = text.replace(/```json|```/g, '').trim()
      try {
        const parsed = JSON.parse(cleaned)
        setTranslated({ zh: parsed.zh, ko: parsed.ko })
      } catch {
        setTranslated({})
      }
    } catch {
      setTranslated({})
    } finally {
      setTranslating(false)
    }
  }

  const handleSend = async () => {
    if (recipients.length === 0) return
    setSend({ kind: 'sending' })
    try {
      const html = `<p>${renderedBody.replace(/\n/g, '</p><p>')}</p>`
      const res = await fetch('/api/resend', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          to: recipients.map((r) => ({
            email: `${r.id}@cattodata.example`,
            name: r.name,
            street: r.street ?? 'Chatswood',
          })),
          subject,
          html,
          from: 'Willoughby Council Pilot <pilot@cattodata.com>',
        }),
      })
      if (!res.ok) {
        const text = await res.text().catch(() => '')
        setSend({ kind: 'error', message: text || `Resend HTTP ${res.status}` })
        return
      }
      const data = await res.json()
      setSend({
        kind: 'done',
        accepted: data.accepted ?? recipients.length,
        rejected: data.rejected ?? 0,
        id: data.id,
      })
    } catch (err) {
      setSend({ kind: 'error', message: err instanceof Error ? err.message : 'Send failed' })
    }
  }

  if (!open) return null

  return (
    <div className="cc-bulk" role="dialog" aria-modal="true" aria-label="Bulk contact">
      <button type="button" className="cc-bulk-overlay" aria-label="Close" onClick={onClose} />
      <div className="cc-bulk-sheet">
        <header className="cc-bulk-head">
          <div>
            <h3>Bulk contact</h3>
            <small>
              {recipients.length} recipient{recipients.length === 1 ? '' : 's'} ·{' '}
              {(() => {
                const n = new Set(recipients.map((r) => r.street ?? 'Chatswood')).size
                return `${n} street${n === 1 ? '' : 's'}`
              })()}
            </small>
          </div>
          <button type="button" className="cc-bulk-close" onClick={onClose} aria-label="Close">
            <X size={18} strokeWidth={2.2} />
          </button>
        </header>

        <section className="cc-bulk-body">
          <div className="cc-bulk-templates">
            {(
              [
                { id: 'road-works' as Template, lab: 'Road works' },
                { id: 'event' as Template, lab: 'Event invite' },
                { id: 'survey' as Template, lab: 'Survey' },
                { id: 'custom' as Template, lab: 'Custom' },
              ]
            ).map((t) => (
              <button
                key={t.id}
                type="button"
                className={`cc-bulk-tpl${template === t.id ? ' is-on' : ''}`}
                onClick={() => handleTemplate(t.id)}
              >
                {t.lab}
              </button>
            ))}
          </div>

          <label className="cc-bulk-field">
            <span>Subject</span>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Council subject line"
            />
          </label>

          <label className="cc-bulk-field">
            <span>Body · {lang === 'en' ? 'English' : lang === 'zh' ? '中文' : '한국어'}</span>
            <textarea
              rows={9}
              value={renderedBody}
              onChange={(e) => {
                if (lang === 'en') setBody(e.target.value)
                else setTranslated({ ...translated, [lang]: e.target.value })
              }}
            />
          </label>

          <div className="cc-bulk-lang">
            <button
              type="button"
              className={`cc-bulk-lang-btn${lang === 'en' ? ' is-on' : ''}`}
              onClick={() => setLang('en')}
            >
              EN
            </button>
            <button
              type="button"
              className={`cc-bulk-lang-btn${lang === 'zh' ? ' is-on' : ''}`}
              onClick={() => setLang('zh')}
              disabled={!translated.zh}
            >
              中文
            </button>
            <button
              type="button"
              className={`cc-bulk-lang-btn${lang === 'ko' ? ' is-on' : ''}`}
              onClick={() => setLang('ko')}
              disabled={!translated.ko}
            >
              한국어
            </button>
            <button
              type="button"
              className="cc-bulk-translate"
              onClick={translate}
              disabled={translating || !body.trim()}
            >
              {translating ? (
                <>
                  <Loader2 size={12} className="cc-spin" /> translating
                </>
              ) : (
                <>
                  <Languages size={12} /> auto-translate · 中文 · 한국어
                </>
              )}
            </button>
          </div>

          <ul className="cc-bulk-chips">
            {recipients.slice(0, 10).map((r) => (
              <li key={r.id}>{r.name}</li>
            ))}
            {recipients.length > 10 && <li className="more">+{recipients.length - 10} more</li>}
          </ul>
        </section>

        <footer className="cc-bulk-foot">
          {send.kind === 'done' ? (
            <div className="cc-bulk-status is-ok">
              <Check size={14} strokeWidth={2.4} />
              <span>
                Dispatched <b>{send.accepted}</b> · rejected {send.rejected}
                {send.id ? ` · id ${send.id}` : ''}
              </span>
              <button type="button" onClick={onClose}>
                done
              </button>
            </div>
          ) : send.kind === 'error' ? (
            <div className="cc-bulk-status is-err">
              <AlertCircle size={14} strokeWidth={2.4} />
              <span>{send.message}</span>
              <button type="button" onClick={() => setSend({ kind: 'idle' })}>
                retry
              </button>
            </div>
          ) : (
            <>
              <small>
                Sends via Resend (free tier, 100/day). From <code>pilot@cattodata.com</code>.
              </small>
              <button
                type="button"
                className="cc-bulk-send"
                disabled={send.kind === 'sending' || recipients.length === 0}
                onClick={handleSend}
              >
                {send.kind === 'sending' ? (
                  <>
                    <Loader2 size={14} className="cc-spin" /> sending
                  </>
                ) : (
                  <>
                    <Send size={14} strokeWidth={2.4} /> Send to {recipients.length}
                  </>
                )}
              </button>
            </>
          )}
        </footer>
      </div>
    </div>
  )
}
