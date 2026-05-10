import { COUNCIL_OUTCOMES, DATA_SOURCES } from '../data/council'

export function Footer() {
  return (
    <footer className="cc-foot">
      <div>
        <h5>Council strategic alignment</h5>
        {COUNCIL_OUTCOMES.map((o, i) => (
          <div key={i} className="outcome">
            <div className="em">{o.em}</div>
            <div>
              <b>{o.b}</b>
              <p>{o.t}</p>
            </div>
          </div>
        ))}
      </div>
      <div>
        <h5>Data sources</h5>
        <ul>
          {DATA_SOURCES.map((s, i) => (
            <li key={i}>
              <a href={s.url} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit' }}>
                {s.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h5>Pilot proposal</h5>
        <p>
          <b>30-day pilot · 10 opt-in Chatswood CBD shops</b>
          <br />
          Currently demo'd with <b>6 fictional pilot personas</b> across Victoria Ave, Help St, Spring St &amp; Albert
          Ave. Council adjusts multipliers as a measurable policy lever for underserved streets.
        </p>
      </div>
      <div>
        <h5>Built for</h5>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
          <img
            src="/assets/willoughby-council.png"
            alt="Willoughby City Council"
            style={{ width: 54, height: 54, objectFit: 'contain' }}
          />
          <div style={{ lineHeight: 1.2 }}>
            <b style={{ color: '#006B5C', fontWeight: 700, fontSize: 13 }}>Willoughby City Council</b>
            <div style={{ fontStyle: 'italic', fontSize: 11, color: '#D9531E' }}>City of Diversity</div>
          </div>
        </div>
        <p>
          Chatswood Hackathon · 16 May 2026 · Sydney NSW.
          <br />
          Aligned with <b>Our Future Willoughby 2036</b>. Mascot, name and concept original. Open data as listed.
        </p>
      </div>
    </footer>
  )
}
