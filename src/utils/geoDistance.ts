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
