interface Props {
  revenue: number
  orders: number
  avgTicket: number
  windowText: string // e.g. "5–7PM"
  playName: string // e.g. "Rainy Day Pour-Over Push"
  opportunityScore: number // 0..100
}

export function ForecastHero({ revenue, orders, avgTicket, windowText, playName, opportunityScore }: Props) {
  return (
    <div className="cc-fhero">
      <span className="cc-fhero-eb">EST. EXTRA REVENUE · TODAY</span>
      <div className="cc-fhero-num">+${revenue}</div>
      <div className="cc-fhero-meta">
        +{orders} ORDERS @ ${avgTicket} AVG · WINDOW {windowText}
      </div>
      <div className="cc-fhero-play">
        <span className="cc-fhero-play-name">{playName}</span>
        <span className="cc-fhero-play-meta">chosen strategy · {opportunityScore}/100 opportunity</span>
      </div>
    </div>
  )
}
