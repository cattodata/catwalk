import type { ReactNode } from 'react'

interface Props {
  emoji: ReactNode
  title: string
  body: string
}

export function InsightStrip({ emoji, title, body }: Props) {
  return (
    <div className="cc-insight-strip">
      <span className="cc-insight-em" aria-hidden="true">{emoji}</span>
      <span className="cc-insight-text">
        <b>{title}</b>
        <small>{body}</small>
      </span>
    </div>
  )
}
