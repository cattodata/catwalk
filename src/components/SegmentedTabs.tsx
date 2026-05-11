interface Tab<T extends string> {
  id: T
  label: string
}

interface Props<T extends string> {
  tabs: Tab<T>[]
  active: T
  onChange: (id: T) => void
}

export function SegmentedTabs<T extends string>({ tabs, active, onChange }: Props<T>) {
  return (
    <div className="cc-seg-tabs" role="tablist">
      {tabs.map((t) => (
        <button
          key={t.id}
          type="button"
          role="tab"
          aria-selected={t.id === active}
          className={`cc-seg-tab${t.id === active ? ' is-act' : ''}`}
          onClick={() => onChange(t.id)}
        >
          {t.label}
        </button>
      ))}
    </div>
  )
}
