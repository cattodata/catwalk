import type { BizType } from '../types/shop'

const TYPES: BizType[] = ['Cafe', 'Restaurant', 'Bakery']

export function BizPills({ value, onChange }: { value: BizType; onChange: (b: BizType) => void }) {
  return (
    <div className="cc-biz-pills" role="radiogroup" aria-label="Business type">
      {TYPES.map((t) => (
        <button
          key={t}
          type="button"
          role="radio"
          aria-checked={t === value}
          className={`cc-biz-pill${t === value ? ' is-on' : ''}`}
          onClick={() => onChange(t)}
        >
          {t}
        </button>
      ))}
    </div>
  )
}
