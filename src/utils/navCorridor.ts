import type { AlongRouteFeature } from '@/hooks/useRoadtrip';

export type CorridorZone = 'near' | 'sight';
export interface ZonedCorridor { near: AlongRouteFeature[]; sight: AlongRouteFeature[] }

// Närzon = det man passerar precis (≤100 m från vägen); synfältszon = längre bort men längs vägen.
// Riktningszon (centralorter) hanteras separat (Plan 3), inte här.
const NEAR_KM = 0.1;

export function zoneOf(detourKm: number): CorridorZone {
  return detourKm <= NEAR_KM ? 'near' : 'sight';
}

export function bucketCorridor(features: AlongRouteFeature[]): ZonedCorridor {
  const near: AlongRouteFeature[] = [];
  const sight: AlongRouteFeature[] = [];
  for (const f of features) (zoneOf(f.detour_km) === 'near' ? near : sight).push(f);
  const byFrac = (a: AlongRouteFeature, b: AlongRouteFeature) => a.frac_along - b.frac_along;
  near.sort(byFrac);
  sight.sort(byFrac);
  return { near, sight };
}

// Hastighet → minsta signifikans som visas. significance är 0–1 (RPC kapar med
// least(1.0,…)); vid motorvägsfart ~30 m/s → tröskel 0.7 (bara toppen).
// Stillastående/okänd = 0 (visa allt). v1-heuristik, ej kalibrerad.
export function minSignificanceForSpeed(speedMps: number | null): number {
  if (speedMps == null || speedMps <= 0) return 0;
  const capped = Math.min(speedMps, 30);
  return (capped / 30) * 0.7;
}

export function gateBySpeed(features: AlongRouteFeature[], speedMps: number | null): AlongRouteFeature[] {
  const min = minSignificanceForSpeed(speedMps);
  if (min <= 0) return features;
  return features.filter((f) => f.significance >= min);
}
