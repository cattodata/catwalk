import type { Landmark, BikeRack, HeatmapBlob } from '../types/shop'

export const LANDMARKS: Landmark[] = [
  { id: 'westfield', name: 'Westfield',       fill: '#E8D5F2', x: 510, y: 110, w: 150, h: 70, icon: '🏬' },
  { id: 'concourse', name: 'The Concourse',   fill: '#FFE8D5', x: 320, y: 90,  w: 130, h: 60, icon: '🎭' },
  { id: 'chase',     name: 'Chatswood Chase', fill: '#D5E8F2', x: 360, y: 450, w: 150, h: 56, icon: '🏪' },
  { id: 'library',   name: 'Library',         fill: '#E8F2D5', x: 60,  y: 280, w: 110, h: 60, icon: '📚' },
  { id: 'markets',   name: 'Mall Markets',    fill: '#FFD5E8', x: 170, y: 90,  w: 130, h: 56, icon: '🏮' },
]

export const BIKE_RACKS: BikeRack[] = [
  { x: 380, y: 130 },
  { x: 100, y: 340 },
  { x: 540, y: 340 },
  { x: 280, y: 470 },
]

/**
 * Predicted foot-traffic blobs.
 * Source: TfNSW Opal historical pattern + day-of-week heuristic.
 * (No real-time foot-traffic API exists for Chatswood — Google Popular Times has no public API.)
 */
export const HEATMAP_PREDICTED: HeatmapBlob[] = [
  { x: 350, y: 340, r: 90, intensity: 0.85, label: 'Station peak (TfNSW pattern)' },
  { x: 320, y: 175, r: 65, intensity: 0.55, label: 'Markets flow' },
  { x: 510, y: 110, r: 75, intensity: 0.70, label: 'Westfield exit' },
  { x: 320, y: 90,  r: 60, intensity: 0.60, label: 'Concourse event' },
  { x: 175, y: 410, r: 50, intensity: 0.30, label: 'Albert Ave south' },
  { x: 60,  y: 280, r: 45, intensity: 0.25, label: 'Library quiet' },
]
