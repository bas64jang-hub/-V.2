import { Transformer, NearbyTransformer } from '../types';

/**
 * Calculates the great-circle distance between two points on the Earth's surface
 * using the Haversine formula (returns distance in kilometers).
 */
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  if (isNaN(lat1) || isNaN(lon1) || isNaN(lat2) || isNaN(lon2)) {
    return Infinity;
  }

  const R = 6371; // Earth's mean radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Formats distance into localized Thai string (meters or kilometers)
 */
export function formatDistance(distanceKm: number): string {
  if (!isFinite(distanceKm)) return '-';
  if (distanceKm < 1) {
    const meters = Math.round(distanceKm * 1000);
    return `${meters} ม.`;
  }
  return `${distanceKm.toFixed(2)} กม.`;
}

/**
 * Provides an estimated travel time (walk or drive)
 */
export function getTravelEstimate(distanceKm: number): string {
  if (distanceKm < 0.8) {
    const walkMins = Math.max(1, Math.round((distanceKm / 4.5) * 60));
    return `เดิน ~${walkMins} นาที`;
  }
  const driveMins = Math.max(2, Math.round((distanceKm / 35) * 60));
  return `ขับรถ ~${driveMins} นาที`;
}

/**
 * Default realistic demo coordinates in Ban Hong, Lamphun
 * Centered around Ban Hong PEA Service area & primary distribution line
 */
export const DEMO_BAN_HONG_COORDS = {
  lat: 18.3312,
  lng: 98.7708,
  name: 'กฟส.บ้านโฮ่ง / โรงเรียนบ้านน้ำเพอะพะ (จุดสาธิตหน้างาน)',
};

/**
 * Calculates distances to all transformers, sorts by nearest first,
 * and returns enriched NearbyTransformer array.
 */
export function getSortedNearbyTransformers(
  userLat: number,
  userLng: number,
  transformers: Transformer[],
  limit?: number
): NearbyTransformer[] {
  const list: NearbyTransformer[] = transformers.map((t) => {
    const tLat = parseFloat(t.lat);
    const tLng = parseFloat(t.lng);
    const distKm = calculateDistanceKm(userLat, userLng, tLat, tLng);
    return {
      ...t,
      distanceKm: distKm,
      distanceFormatted: formatDistance(distKm),
    };
  });

  list.sort((a, b) => a.distanceKm - b.distanceKm);

  if (typeof limit === 'number' && limit > 0) {
    return list.slice(0, limit);
  }

  return list;
}
