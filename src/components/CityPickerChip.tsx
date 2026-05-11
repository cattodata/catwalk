import { Drawer } from 'vaul'
import { useState } from 'react'
import { MapPin, Check } from 'lucide-react'
import { CITY_LIST, getActiveCityId, setActiveCityId } from '../config/cities'

/**
 * Pilot-city picker — chip + vaul drawer. Tap any city → save to localStorage
 * → full-reload to flush all city-derived queries (weather/shops/etc).
 * Hidden when `?judge=1` is in the URL.
 */
export function CityPickerChip() {
  const [activeId, setActiveId] = useState(() => getActiveCityId())
  const active = CITY_LIST.find((c) => c.slug === activeId) ?? CITY_LIST[0]

  // Hide for judges
  if (typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('judge') === '1') {
    return null
  }

  const pickCity = (slug: string) => {
    setActiveCityId(slug)
    setActiveId(slug)
    // Hard-reload so every hook re-derives from the new active city.
    window.location.reload()
  }

  return (
    <Drawer.Root>
      <Drawer.Trigger asChild>
        <button type="button" className="cc-city-chip" aria-label="Switch pilot city">
          <MapPin size={11} strokeWidth={2.4} aria-hidden="true" />
          <span>{active.name}</span>
          <small>· pilot</small>
        </button>
      </Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Overlay className="cc-vaul-overlay" />
        <Drawer.Content className="cc-vaul-content">
          <div className="cc-vaul-grab" aria-hidden="true" />
          <Drawer.Title className="cc-srs-title">Choose a pilot city</Drawer.Title>
          <Drawer.Description className="cc-srs-desc">
            Each city pulls live OSM shops + Open-Meteo weather + ABS Census for its bounds. Switching reloads the app.
          </Drawer.Description>
          <div className="cc-city-list">
            {CITY_LIST.map((c) => (
              <button
                key={c.slug}
                type="button"
                className={`cc-city-row${c.slug === activeId ? ' is-active' : ''}`}
                onClick={() => pickCity(c.slug)}
              >
                <span className="cc-city-row-body">
                  <b>{c.name}</b>
                  <small>{c.council}</small>
                </span>
                {c.slug === activeId && <Check size={16} aria-hidden="true" />}
              </button>
            ))}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  )
}
