// Roadtrip-läge: geokodning (adress → koordinat) + bilrutt. Bägge via fria, nyckellösa
// tjänster med CORS: Nominatim (OpenStreetMap) för geokodning, OSRM demo för ruttning.
// INGEN koordinat uppfinns — allt kommer från tjänstens svar. Låg volym (interaktiv sökning).
export interface GeoPoint { lat: number; lng: number }
export interface GeocodeResult { lat: number; lng: number; label: string }
export interface Maneuver {
  type: string;
  modifier: string | null;
  lat: number;
  lng: number;
  road: string;
  distanceM: number;
}
export interface RouteResult { coords: [number, number][]; distanceKm: number; durationMin: number; maneuvers: Maneuver[] }

const NOMINATIM = 'https://nominatim.openstreetmap.org/search';
const OSRM = 'https://router.project-osrm.org/route/v1/driving';

// Adress/ortnamn → koordinat. Sverige-begränsat (countrycodes=se), första träffen.
export async function geocode(query: string): Promise<GeocodeResult | null> {
  const q = query.trim();
  if (!q) return null;
  const params = new URLSearchParams({ q, format: 'jsonv2', limit: '1', countrycodes: 'se', addressdetails: '0' });
  const res = await fetch(`${NOMINATIM}?${params.toString()}`, { headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error(`Adressökningen svarade ${res.status}`);
  const arr = await res.json();
  if (!Array.isArray(arr) || arr.length === 0) return null;
  const r = arr[0];
  const lat = parseFloat(r.lat), lng = parseFloat(r.lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return { lat, lng, label: String(r.display_name || q).split(',')[0].trim() || q };
}

// OSRM legs[].steps[] → platt maneuver-lista. Tålig: allt oväntat → [].
export function parseManeuvers(osrm: unknown): Maneuver[] {
  const route = (osrm as any)?.routes?.[0];
  const legs = route?.legs;
  if (!Array.isArray(legs)) return [];
  const out: Maneuver[] = [];
  for (const leg of legs) {
    const steps = leg?.steps;
    if (!Array.isArray(steps)) continue;
    for (const s of steps) {
      const loc = s?.maneuver?.location;
      if (!Array.isArray(loc) || loc.length < 2) continue;
      out.push({
        type: String(s.maneuver?.type ?? ''),
        modifier: s.maneuver?.modifier ?? null,
        lat: Number(loc[1]),
        lng: Number(loc[0]),
        road: String(s.name ?? ''),
        distanceM: Number(s.distance ?? 0),
      });
    }
  }
  return out;
}

// Bilrutt från → till (OSRM driving). Returnerar geometrin som [lat,lng]-par + avstånd/tid + turn-by-turn.
export async function route(from: GeoPoint, to: GeoPoint): Promise<RouteResult | null> {
  const url = `${OSRM}/${from.lng},${from.lat};${to.lng},${to.lat}?overview=full&geometries=geojson&steps=true`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Ruttberäkningen svarade ${res.status}`);
  const json = await res.json();
  const r = json?.routes?.[0];
  const c = r?.geometry?.coordinates;
  if (!Array.isArray(c) || c.length === 0) return null;
  const coords = (c as [number, number][]).map(([lng, lat]) => [lat, lng] as [number, number]);
  return { coords, distanceKm: r.distance / 1000, durationMin: r.duration / 60, maneuvers: parseManeuvers(json) };
}
