import type { Maneuver, RouteResult } from '@/services/routing';

export type LatLng = { lat: number; lng: number };

// Straight-line meters (Haversine). Räcker för "avstånd till nästa manöver" i v1.
export function haversineM(a: LatLng, b: LatLng): number {
  const R = 6371000, toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat), dLng = toRad(b.lng - a.lng);
  const s = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(s)));
}

// v1-förenkling: närmaste manöver (fågelvägen), exkl. 'depart' och 'arrive' (arrive har
// modifier null och tomt vägnamn — skulle annars renderas som en missvisande "sväng").
// Förfinas i senare task med rutt-progress. Returnerar null om inga maneuvrar finns.
export function nextManeuver(maneuvers: Maneuver[], pos: LatLng): { maneuver: Maneuver; distanceM: number } | null {
  const cands = maneuvers.filter((m) => m.type !== 'depart' && m.type !== 'arrive');
  if (cands.length === 0) return null;
  let best = cands[0], bestD = haversineM(pos, best);
  for (const m of cands.slice(1)) {
    const d = haversineM(pos, m);
    if (d < bestD) { best = m; bestD = d; }
  }
  return { maneuver: best, distanceM: Math.round(bestD) };
}

const pad = (n: number) => String(n).padStart(2, '0');

export function formatEta(remainingMin: number, nowMs: number): { arrival: string; remaining: string } {
  const arr = new Date(nowMs + remainingMin * 60000);
  return { arrival: `${pad(arr.getHours())}:${pad(arr.getMinutes())}`, remaining: `${Math.round(remainingMin)} min` };
}

const km1 = (km: number) => `${km.toFixed(1).replace('.', ',')} km`;

export interface HudModel {
  currentRoad: string;
  nextTurn: { modifier: string | null; road: string; inM: number } | null;
  arrival: string;
  remaining: string;
  remainingKm: string;
}

// v1: ETA pinnas vid ruttstart; remaining/km är helrutts-totaler — live nedräkning kommer
// i Plan 2 (rutt-progress). `nowMs` ska vara en STABIL tidsstämpel satt när rutten startade,
// inte en färsk Date.now() per anrop — annars kryper ankomsttiden framåt vid varje omrendering.
export function hudModel(route: RouteResult, pos: LatLng | null, nowMs: number): HudModel {
  const eta = formatEta(route.durationMin, nowMs);
  const nt = pos ? nextManeuver(route.maneuvers, pos) : null;
  // Aktuell väg = vägen på den manöver vi senast passerade (närmaste 'depart'/väg med namn),
  // v1: första namngivna manövern. Förfinas med rutt-progress i senare task.
  const currentRoad = route.maneuvers.find((m) => m.road)?.road ?? '';
  return {
    currentRoad,
    nextTurn: nt ? { modifier: nt.maneuver.modifier, road: nt.maneuver.road, inM: nt.distanceM } : null,
    arrival: eta.arrival,
    remaining: eta.remaining,
    remainingKm: km1(route.distanceKm),
  };
}
