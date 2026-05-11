export interface ParkingOption {
  id: string
  emoji: string
  name: string
  variant: 'best' | 'default' | 'bad'
  /** Display meta line: e.g. "450M · 6 MIN WALK · 12 SPOTS" */
  meta: string
  /** Multiplier copy (e.g. "+2×", "+1×", "0×") */
  mult: string
  /** CO₂ copy (e.g. "−0.08 kg", "+$8 fee") */
  co2: string
  /** Cost label (free | $ | $$ | FULL) */
  cost?: string
}

export const PARKING_OPTIONS: ParkingOption[] = [
  {
    id: 'albert-ave',
    emoji: '🅿️',
    name: 'Albert Ave (free)',
    variant: 'best',
    meta: '450M · 6 MIN WALK · 12 SPOTS',
    mult: '+2×',
    co2: '−0.08 kg',
    cost: 'free',
  },
  {
    id: 'westfield',
    emoji: '🏢',
    name: 'Westfield ($)',
    variant: 'default',
    meta: '90M · 2 MIN · 41 SPOTS',
    mult: '+1×',
    co2: '−0.02 kg',
    cost: '$',
  },
  {
    id: 'chatswood-mall',
    emoji: '🚫',
    name: 'Chatswood Mall',
    variant: 'bad',
    meta: 'FULL · ~14 MIN WAIT',
    mult: '0×',
    co2: '+$8 fee',
    cost: 'FULL',
  },
]
