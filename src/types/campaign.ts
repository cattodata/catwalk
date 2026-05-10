export type Lang = 'en' | 'zh' | 'ko'
export type AssetKey = 'ig' | 'google' | 'sign' | 'script' | 'plan'
export type StrategyId = 'discount' | 'bundle' | 'traffic' | 'stock' | 'aware'

export interface Strategy {
  id: StrategyId
  emoji: string
  name: string
  desc: string
}

export interface Signal {
  name: string
  impact: string
}

export interface SignAsset {
  big: string
  sub: string
}

export interface AssetBundle {
  ig: Record<Lang, string>
  google: Record<Lang, string>
  sign: Record<Lang, SignAsset>
  script: Record<Lang, string>
  plan: Record<Lang, string[]>
}

export interface Campaign {
  chosen: StrategyId
  name: string
  tag: string
  offer: string
  why: string
  signals: Signal[]
  revenue: number
  orders: number
  avg: number
  score: number
  windowText: string
  visionRead?: string
  assets: AssetBundle
}

export interface Insight {
  icon: string
  color: string
  title: string
  sub: string
}

export interface VitalCard {
  id: string
  emoji: string
  num: string
  small?: string
  label: string
  sub: string
  accent: string
  bg: string
  isLive?: boolean
  source?: string
}
