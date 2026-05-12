import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Drawer } from 'vaul'
import { Sun, Moon, MapPin, ArrowRight, Check } from 'lucide-react'

import { AppBarLockup } from '../components/AppBarLockup'
import { BottomNav } from '../components/BottomNav'
import { TierRibbon } from '../components/TierRibbon'
import { useUserStats } from '../hooks/useUserStats'
import { useSupabaseAuth } from '../hooks/useSupabaseAuth'
import { useTheme } from '../hooks/useTheme'
import { useUserRole } from '../context/UserRoleContext'
import { tierFromCo2 } from '../data/tiers'
import { CITY_LIST, getActiveCityId, setActiveCityId } from '../config/cities'

const TIERS = [
  { id: 'sprout', label: 'Sprout', emoji: '🌱', threshold: 0 },
  { id: 'bronze', label: 'Bronze', emoji: '🥉', threshold: 0.3 },
  { id: 'silver', label: 'Silver', emoji: '🥈', threshold: 1.5 },
  { id: 'gold', label: 'Gold', emoji: '🏆', threshold: 5 },
]

const SEED_HISTORY = [
  { id: 'w1', shop: 'Saint Honoré', emoji: '🥐', pts: 96, daysAgo: 0 },
  { id: 'w2', shop: 'Gong Cha', emoji: '🧋', pts: 248, daysAgo: 1 },
  { id: 'w3', shop: 'Mamak', emoji: '🍜', pts: 28, daysAgo: 2 },
]

export function ProfileScreen() {
  const navigate = useNavigate()
  const auth = useSupabaseAuth()
  const { total_co2 } = useUserStats(auth.user?.id ?? null)
  const { theme, toggle } = useTheme()
  const { switchRole } = useUserRole()

  const tier = useMemo(() => tierFromCo2(total_co2), [total_co2])
  const tierLevel = tier.id === 'sprout' ? 1 : tier.id === 'bronze' ? 2 : tier.id === 'silver' ? 3 : 4
  const tierPct = tier.next != null ? Math.round(((total_co2 - tier.min) / (tier.next - tier.min)) * 100) : 100

  const activeCity = getActiveCityId()
  const activeCityName = CITY_LIST.find((c) => c.slug === activeCity)?.name ?? 'Chatswood'

  const onSwitchRole = () => {
    switchRole()
    navigate('/onboarding')
  }

  return (
    <div className="cc-profile-screen">
      <AppBarLockup />

      <div className="cc-profile-body">
        <div className="cc-profile-id">
          <div className="cc-profile-avatar" aria-hidden="true">
            <span>🐱</span>
          </div>
          <div className="cc-profile-name">
            <h2>Walker</h2>
            <small>Tier {tierLevel} · {tier.label} · {total_co2.toFixed(2)} kg saved</small>
          </div>
        </div>

        <TierRibbon
          tierLevel={tierLevel}
          tierName={tier.label}
          progressPct={tierPct}
          kgSaved={total_co2}
        />

        <section className="cc-profile-section">
          <h3>ACHIEVEMENT BADGES</h3>
          <div className="cc-rewards-badge-grid">
            {TIERS.map((t, i) => {
              const earned = i + 1 <= tierLevel
              return (
                <div key={t.id} className={`cc-rewards-badge${earned ? ' is-on' : ''}`}>
                  <span className="cc-rewards-badge-em" aria-hidden="true">{t.emoji}</span>
                  <span className="cc-rewards-badge-l">{t.label}</span>
                  <small>{t.threshold === 0 ? 'Start' : `${t.threshold}kg`}</small>
                </div>
              )
            })}
          </div>
        </section>

        <section className="cc-profile-section">
          <h3>RECENT WALKS</h3>
          <ul className="cc-profile-walks">
            {SEED_HISTORY.map((w) => (
              <li key={w.id}>
                <span className="cc-rewards-hist-em" aria-hidden="true">{w.emoji}</span>
                <span className="cc-rewards-hist-body">
                  <span>{w.shop}</span>
                  <small>{w.daysAgo === 0 ? 'today' : w.daysAgo === 1 ? 'yesterday' : `${w.daysAgo}d ago`}</small>
                </span>
                <span className="cc-rewards-hist-pts">+{w.pts}</span>
              </li>
            ))}
          </ul>
          <button
            type="button"
            className="cc-profile-link"
            onClick={() => navigate('/walk/rewards')}
          >
            <span>See all rewards</span>
            <ArrowRight size={14} strokeWidth={2.4} />
          </button>
        </section>

        <section className="cc-profile-section">
          <h3>SETTINGS</h3>
          <div className="cc-profile-settings">
            <button type="button" className="cc-profile-row" onClick={toggle}>
              <span className="cc-profile-row-ic" aria-hidden="true">
                {theme === 'dark' ? <Moon size={16} /> : <Sun size={16} />}
              </span>
              <span className="cc-profile-row-body">
                <b>Appearance</b>
                <small>{theme === 'dark' ? 'Dark' : 'Light'} · tap to toggle</small>
              </span>
              <ArrowRight size={14} strokeWidth={2.4} />
            </button>

            <Drawer.Root>
              <Drawer.Trigger asChild>
                <button type="button" className="cc-profile-row">
                  <span className="cc-profile-row-ic" aria-hidden="true">
                    <MapPin size={16} />
                  </span>
                  <span className="cc-profile-row-body">
                    <b>Pilot city</b>
                    <small>{activeCityName}</small>
                  </span>
                  <ArrowRight size={14} strokeWidth={2.4} />
                </button>
              </Drawer.Trigger>
              <Drawer.Portal>
                <Drawer.Overlay className="cc-vaul-overlay" />
                <Drawer.Content className="cc-vaul-content">
                  <div className="cc-vaul-grab" aria-hidden="true" />
                  <Drawer.Title className="cc-srs-title">Pilot city</Drawer.Title>
                  <Drawer.Description className="cc-srs-desc">
                    Demo the app on different SA2 datasets
                  </Drawer.Description>
                  <div className="cc-city-list">
                    {CITY_LIST.map((c) => (
                      <button
                        key={c.slug}
                        type="button"
                        className={`cc-city-row${c.slug === activeCity ? ' is-active' : ''}`}
                        onClick={() => {
                          setActiveCityId(c.slug)
                          window.location.reload()
                        }}
                      >
                        <span className="cc-city-row-body">
                          <b>{c.name}</b>
                          <small>{c.council}</small>
                        </span>
                        {c.slug === activeCity && <Check size={16} aria-hidden="true" />}
                      </button>
                    ))}
                  </div>
                </Drawer.Content>
              </Drawer.Portal>
            </Drawer.Root>

            <button type="button" className="cc-profile-row" onClick={onSwitchRole}>
              <span className="cc-profile-row-ic" aria-hidden="true">↻</span>
              <span className="cc-profile-row-body">
                <b>Switch role</b>
                <small>Go back to the role picker</small>
              </span>
              <ArrowRight size={14} strokeWidth={2.4} />
            </button>
          </div>
        </section>
      </div>

      <BottomNav />
    </div>
  )
}
