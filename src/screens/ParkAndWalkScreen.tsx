import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, ParkingSquare } from 'lucide-react'
import { ParkHero } from '../components/ParkHero'
import { ParkOption } from '../components/ParkOption'
import { PARKING_OPTIONS } from '../data/parking'

export function ParkAndWalkScreen() {
  const [selectedId, setSelectedId] = useState<string>('albert-ave')
  const selected = PARKING_OPTIONS.find((p) => p.id === selectedId) ?? PARKING_OPTIONS[0]

  return (
    <div className="cc-park-screen">
      <header className="cc-park-bar">
        <Link to="/walk" className="cc-icon-btn" aria-label="Back">
          <ArrowLeft size={18} aria-hidden="true" />
        </Link>
        <span className="cc-park-bar-title">Driving? No worries.</span>
        <span style={{ width: 36 }} />
      </header>

      <div className="cc-park-body">
        <ParkHero />
        <div className="cc-park-options">
          {PARKING_OPTIONS.map((p) => (
            <ParkOption key={p.id} option={p} selected={p.id === selectedId} onSelect={setSelectedId} />
          ))}
        </div>
        <a
          href={`https://www.google.com/maps/dir/?api=1&destination=${selected.lat},${selected.lng}&travelmode=driving`}
          target="_blank"
          rel="noopener noreferrer"
          className="cc-park-cta"
        >
          <ParkingSquare size={16} strokeWidth={2.2} aria-hidden="true" />
          Navigate to {selected.shortName}
        </a>
      </div>
    </div>
  )
}
