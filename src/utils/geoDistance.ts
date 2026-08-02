// Enkel geografisk avståndsberäkning (haversine) för närhetssökning.

export interface LatLng {
  lat: number;
  lng: number;
}

/** Avstånd mellan två punkter i kilometer. */
export const haversineKm = (a: LatLng, b: LatLng): number => {
  const R = 6371; // jordens radie i km
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
};

/** Returnerar de N närmaste posterna inom radie (km), sorterade närmast först. */
export const nearestWithin = <T>(
  origin: LatLng,
  items: T[],
  coordOf: (item: T) => LatLng,
  radiusKm: number,
  limit = 5,
): Array<{ item: T; km: number }> =>
  items
    .map((item) => ({ item, km: haversineKm(origin, coordOf(item)) }))
    .filter((x) => x.km <= radiusKm)
    .sort((a, b) => a.km - b.km)
    .slice(0, limit);

// Initial bäring (grader medurs från norr, [0,360)) från a till b. Standard atan2-formeln.
export function bearingDeg(a: LatLng, b: LatLng): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const phi1 = toRad(a.lat);
  const phi2 = toRad(b.lat);
  const dLambda = toRad(b.lng - a.lng);
  const y = Math.sin(dLambda) * Math.cos(phi2);
  const x = Math.cos(phi1) * Math.sin(phi2) - Math.sin(phi1) * Math.cos(phi2) * Math.cos(dLambda);
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

// 8-strecks kompassros på svenska (N i mitten av sitt sektorintervall).
const COMPASS_8 = ['N', 'NÖ', 'Ö', 'SÖ', 'S', 'SV', 'V', 'NV'];
export function compassPoint8(deg: number): string {
  const norm = ((deg % 360) + 360) % 360;
  return COMPASS_8[Math.round(norm / 45) % 8];
}
