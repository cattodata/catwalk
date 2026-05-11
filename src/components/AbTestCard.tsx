import { FlaskConical } from 'lucide-react'
import type { AbResult } from '../lib/ai-ab'

export function AbTestCard({ result }: { result: AbResult | null }) {
  if (!result) {
    return (
      <div className="cc-ab-test">
        <span className="cc-ab-eb"><FlaskConical size={11} strokeWidth={2.4} aria-hidden="true" /> A/B TEST · CLAUDE PREDICTS</span>
        <h5>Two offers — pick the winner</h5>
        <div className="cc-ab-row">
          <div className="cc-ab-side cc-ab-skel"><span /></div>
          <div className="cc-ab-side cc-ab-skel"><span /></div>
        </div>
      </div>
    )
  }
  const winnerKey = result.winner
  return (
    <div className="cc-ab-test">
      <span className="cc-ab-eb"><FlaskConical size={11} strokeWidth={2.4} aria-hidden="true" /> A/B TEST · CLAUDE PREDICTS</span>
      <h5>Two offers — pick the winner</h5>
      <div className="cc-ab-row">
        <AbOption label="A" copy={result.optionA.copy} pred={result.optionA.predRevenue} conf={result.optionA.confidence} winner={winnerKey === 'a'} />
        <AbOption label="B" copy={result.optionB.copy} pred={result.optionB.predRevenue} conf={result.optionB.confidence} winner={winnerKey === 'b'} />
      </div>
    </div>
  )
}

function AbOption({ label, copy, pred, conf, winner }: { label: string; copy: string; pred: number; conf: number; winner: boolean }) {
  return (
    <div className={`cc-ab-side${winner ? ' is-winner' : ''}`}>
      <span className="cc-ab-h">{label} · {copy}</span>
      <span className="cc-ab-pred">+${pred}</span>
      <span className="cc-ab-lab">{conf}% {winner ? '· WIN' : 'CONF'}</span>
    </div>
  )
}
