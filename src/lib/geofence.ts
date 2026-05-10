/**
 * Haversine distance between two lat/lng points in metres.
 */
export function haversineMeters(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  const R = 6_371_000
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const lat1 = toRad(a.lat)
  const lat2 = toRad(b.lat)
  const sinLat = Math.sin(dLat / 2)
  const sinLng = Math.sin(dLng / 2)
  const h = sinLat * sinLat + Math.cos(lat1) * Math.cos(lat2) * sinLng * sinLng
  return 2 * R * Math.asin(Math.sqrt(h))
}

/**
 * Returns true if `pos` is within `radiusMeters` of `target`.
 */
export function isWithinGeofence(
  pos: { lat: number; lng: number },
  target: { lat: number; lng: number },
  radiusMeters: number,
): boolean {
  return haversineMeters(pos, target) <= radiusMeters
}
