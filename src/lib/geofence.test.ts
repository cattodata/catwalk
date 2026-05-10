import { describe, expect, it } from 'vitest'
import { haversineMeters, isWithinGeofence } from './geofence'

describe('geofence', () => {
  // Chatswood Station coords
  const station = { lat: -33.7969, lng: 151.1804 }

  describe('haversineMeters', () => {
    it('returns 0 for identical points', () => {
      expect(haversineMeters(station, station)).toBe(0)
    })

    it('computes ~180m for Aoba Matcha (180m walk per data)', () => {
      const aoba = { lat: -33.7960, lng: 151.1820 }
      const d = haversineMeters(station, aoba)
      // Within 50m of expected (Aoba is approximately 180m by walking, less as crow flies)
      expect(d).toBeGreaterThan(80)
      expect(d).toBeLessThan(250)
    })

    it('computes ~5km between Chatswood and Macquarie Park', () => {
      const macquarie = { lat: -33.7754, lng: 151.1145 }
      const d = haversineMeters(station, macquarie)
      // ~6.4 km airline
      expect(d).toBeGreaterThan(5000)
      expect(d).toBeLessThan(8000)
    })

    it('is symmetric', () => {
      const a = { lat: -33.79, lng: 151.18 }
      const b = { lat: -33.80, lng: 151.19 }
      expect(haversineMeters(a, b)).toBeCloseTo(haversineMeters(b, a), 5)
    })
  })

  describe('isWithinGeofence', () => {
    it('returns true for same point', () => {
      expect(isWithinGeofence(station, station, 100)).toBe(true)
    })

    it('returns true within 100m geofence', () => {
      // Move ~50m east (~0.0005 deg lng at this lat)
      const nearby = { lat: station.lat, lng: station.lng + 0.0005 }
      expect(isWithinGeofence(nearby, station, 100)).toBe(true)
    })

    it('returns false outside 100m geofence', () => {
      // Move ~500m
      const far = { lat: station.lat, lng: station.lng + 0.005 }
      expect(isWithinGeofence(far, station, 100)).toBe(false)
    })
  })
})
