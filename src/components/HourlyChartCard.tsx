interface Props {
  title: string
  context: string // mono label e.g. "RAIN @5PM · MARKETS · SCHOOL HOLIDAY"
  /** 12 bar heights (0..100) for 8am..7pm */
  bars: number[]
  /** indices of peak bars (rendered with g-bars-peak gradient) */
  peakIndices?: number[]
}

const HOURS = ['8', '9', '10', '11', '12', '1', '2', '3', '4', '5', '6', '7']

export function HourlyChartCard({ title, context, bars, peakIndices = [] }: Props) {
  return (
    <div className="cc-chart-card">
      <h5>{title}</h5>
      <span className="cc-chart-lab">{context}</span>
      <div className="cc-chart-bars" role="img" aria-label={`Hourly forecast 8am to 7pm`}>
        {bars.map((h, i) => {
          const isPeak = peakIndices.includes(i)
          return (
            <div key={i} className={`cc-bar-col${isPeak ? ' is-peak' : ''}`}>
              <span className="cc-bar-b" style={{ height: `${Math.max(4, h)}%` }} />
              <span className="cc-bar-h">{HOURS[i]}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
