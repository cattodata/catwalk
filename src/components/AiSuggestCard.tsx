import { Bot } from 'lucide-react'

export function AiSuggestCard({ body, source }: { body: string; source?: 'live' | 'mock' }) {
  return (
    <div className="cc-ai-suggest">
      <span className="cc-ai-em" aria-hidden="true">
        <Bot size={20} strokeWidth={1.8} />
      </span>
      <div className="cc-ai-body">
        <b>Catto suggests</b>
        <p>{body}</p>
        {source === 'live' && <span className="cc-ai-tag">LIVE · gpt-4.1-nano</span>}
      </div>
    </div>
  )
}
