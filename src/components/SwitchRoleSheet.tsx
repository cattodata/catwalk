import { Drawer } from 'vaul'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Settings, ArrowRight, MapPin, Check } from 'lucide-react'
import { useUserRole } from '../context/UserRoleContext'
import { CITY_LIST, getActiveCityId, setActiveCityId } from '../config/cities'

export function SwitchRoleGear() {
  return (
    <Drawer.Root>
      <Drawer.Trigger asChild>
        <button
          type="button"
          className="cc-icon-btn"
          aria-label="Settings"
        >
          <Settings size={18} strokeWidth={2} aria-hidden="true" />
        </button>
      </Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Overlay className="cc-vaul-overlay" />
        <Drawer.Content className="cc-vaul-content">
          <div className="cc-vaul-grab" aria-hidden="true" />
          <SwitchRoleSheetContent />
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  )
}

function SwitchRoleSheetContent() {
  const { switchRole } = useUserRole()
  const navigate = useNavigate()
  const [activeCity, setActiveCity] = useState(() => getActiveCityId())
  const isJudge =
    typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).get('judge') === '1'

  const handleSwitchRole = () => {
    switchRole()
    navigate('/onboarding')
  }

  const handleSwitchCity = (slug: string) => {
    setActiveCityId(slug)
    setActiveCity(slug)
    window.location.reload()
  }

  return (
    <div className="cc-srs">
      <Drawer.Title className="cc-srs-title">Settings</Drawer.Title>
      <Drawer.Description className="cc-srs-desc">
        Demo this app from a different perspective
      </Drawer.Description>
      <button type="button" className="cc-srs-action" onClick={handleSwitchRole}>
        <span className="cc-srs-action-body">
          <b>Switch mode</b>
          <small>Walker · Shop owner · Council</small>
        </span>
        <ArrowRight size={16} aria-hidden="true" />
      </button>

      {!isJudge && (
        <div className="cc-srs-section">
          <h4>
            <MapPin size={12} strokeWidth={2.4} aria-hidden="true" /> Pilot city
          </h4>
          <div className="cc-city-list">
            {CITY_LIST.map((c) => (
              <button
                key={c.slug}
                type="button"
                className={`cc-city-row${c.slug === activeCity ? ' is-active' : ''}`}
                onClick={() => handleSwitchCity(c.slug)}
              >
                <span className="cc-city-row-body">
                  <b>{c.name}</b>
                  <small>{c.council}</small>
                </span>
                {c.slug === activeCity && <Check size={16} aria-hidden="true" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
