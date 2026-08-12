import { haversineM, formatEta, type LatLng, type HudModel } from './navHud';
import type { Maneuver, RouteResult } from '@/services/routing';

// ── Turn-by-turn PROGRESS-motor (P0, "Plan 2" i mobile-field-mode-spec §13.2) ──────────────
// Ren funktion: (rutt, GPS-position) → var är jag LÄNGS rutten, vilken manöver är NÄST framför
// mig, hur långt/länge kvar, är jag off-route. Ersätter navHud v1:s "närmaste manöver fågelvägen"
// (som flippade och aldrig avancerade). Ingen Leaflet/DOM-import → enhetstestbar med syntetiska
// positioner (löser "kan ej reproducera GPS headless").

// Projicera punkt p på segment a→b i lokalt plan (ekvirektangulärt kring a). Returnerar närmaste
// punkt på segmentet + t∈[0,1] (hur långt in på segmentet).
function projectOnSegment(p: LatLng, a: LatLng, b: LatLng): { pt: LatLng; t: number } {
  const R = 6371000, toRad = (d: number) => (d * Math.PI) / 180;
  const lat0 = toRad(a.lat);
  const bx = toRad(b.lng - a.lng) * Math.cos(lat0) * R, by = toRad(b.lat - a.lat) * R;
  const px = toRad(p.lng - a.lng) * Math.cos(lat0) * R, py = toRad(p.lat - a.lat) * R;
  const len2 = bx * bx + by * by;
  let t = len2 === 0 ? 0 : (px * bx + py * by) / len2;
  t = Math.max(0, Math.min(1, t));
  return { pt: { lat: a.lat + (b.lat - a.lat) * t, lng: a.lng + (b.lng - a.lng) * t }, t };
}

export interface RouteProjection {
  snapped: LatLng;   // närmaste punkt PÅ rutten
  alongM: number;    // sträcka från ruttstart till den snäppta punkten
  offRouteM: number; // vinkelrätt avstånd position→rutt (för off-route-detektion)
  segIndex: number;
}

// Snäpp en position till ruttlinjen: returnera den punkt (och along-sträcka) med minst avvikelse.
export function projectOntoRoute(coords: [number, number][], pos: LatLng): RouteProjection | null {
  if (!coords || coords.length < 2) return null;
  let cum = 0;
  let best: RouteProjection | null = null;
  for (let i = 0; i < coords.length - 1; i++) {
    const a = { lat: coords[i][0], lng: coords[i][1] };
    const b = { lat: coords[i + 1][0], lng: coords[i + 1][1] };
    const segLen = haversineM(a, b);
    const { pt, t } = projectOnSegment(pos, a, b);
    const off = haversineM(pos, pt);
    if (!best || off < best.offRouteM) {
      best = { snapped: pt, alongM: cum + segLen * t, offRouteM: Math.round(off), segIndex: i };
    }
    cum += segLen;
  }
  return best;
}

export function routeLengthM(coords: [number, number][]): number {
  let m = 0;
  for (let i = 0; i < coords.length - 1; i++) {
    m += haversineM({ lat: coords[i][0], lng: coords[i][1] }, { lat: coords[i + 1][0], lng: coords[i + 1][1] });
  }
  return m;
}

export interface RouteProgress {
  snapped: LatLng;
  traveledM: number;
  remainingM: number;
  remainingMin: number;
  offRouteM: number;
  offRoute: boolean;            // > OFF_ROUTE_M → dags att räkna om rutten
  currentRoad: string;         // vägen jag är PÅ nu (senast passerade namngivna manöver)
  nextManeuver: { maneuver: Maneuver; alongM: number; distanceM: number } | null; // NÄST framför mig
}

export const OFF_ROUTE_M = 50;

// Kärnan: projicera positionen, projicera varje manöver, och välj nästa manöver vars along-sträcka
// ligger FRAMFÖR min → manövern avancerar monotont när jag kör (ej fågelväg). Nedräkning = total −
// traveled. currentRoad = senast passerade namngivna manövern.
export function routeProgress(route: RouteResult, pos: LatLng): RouteProgress | null {
  const proj = projectOntoRoute(route.coords, pos);
  if (!proj) return null;
  const totalM = routeLengthM(route.coords);
  const manAlong = route.maneuvers.map((m) => projectOntoRoute(route.coords, { lat: m.lat, lng: m.lng })?.alongM ?? 0);

  let nextManeuver: RouteProgress['nextManeuver'] = null;
  for (let i = 0; i < route.maneuvers.length; i++) {
    const m = route.maneuvers[i];
    if (m.type === 'depart' || m.type === 'arrive') continue;
    if (manAlong[i] > proj.alongM + 1) {
      nextManeuver = { maneuver: m, alongM: manAlong[i], distanceM: Math.round(manAlong[i] - proj.alongM) };
      break;
    }
  }

  let currentRoad = '';
  for (let i = 0; i < route.maneuvers.length; i++) {
    if (manAlong[i] <= proj.alongM + 1 && route.maneuvers[i].road) currentRoad = route.maneuvers[i].road;
  }
  if (!currentRoad) currentRoad = route.maneuvers.find((m) => m.road)?.road ?? '';

  const remainingM = Math.max(0, totalM - proj.alongM);
  const remainingMin = totalM > 0 ? route.durationMin * (remainingM / totalM) : 0;

  return {
    snapped: proj.snapped,
    traveledM: Math.round(proj.alongM),
    remainingM: Math.round(remainingM),
    remainingMin,
    offRouteM: proj.offRouteM,
    offRoute: proj.offRouteM > OFF_ROUTE_M,
    currentRoad,
    nextManeuver,
  };
}

const km1 = (km: number) => `${km.toFixed(1).replace('.', ',')} km`;

// Progress-medveten HUD-modell (ersätter navHud.hudModel v1 i NavigatorHud): live nedräkning +
// avancerande manöver från routeProgress. nowMs = FÄRSK tid (arrival = nu + kvarvarande min);
// eftersom kvarvarande sjunker med positionen står ankomsttiden stilla (ingen klock-creep).
// Utan position → helrutts-fallback (kort, innan första GPS-fixen).
export function hudModelLive(route: RouteResult, pos: LatLng | null, nowMs: number): HudModel & { offRoute: boolean } {
  const prog = pos ? routeProgress(route, pos) : null;
  if (prog) {
    const eta = formatEta(prog.remainingMin, nowMs);
    return {
      currentRoad: prog.currentRoad,
      nextTurn: prog.nextManeuver
        ? { modifier: prog.nextManeuver.maneuver.modifier, road: prog.nextManeuver.maneuver.road, inM: prog.nextManeuver.distanceM }
        : null,
      arrival: eta.arrival,
      remaining: eta.remaining,
      remainingKm: km1(prog.remainingM / 1000),
      offRoute: prog.offRoute,
    };
  }
  const eta = formatEta(route.durationMin, nowMs);
  return {
    currentRoad: route.maneuvers.find((m) => m.road)?.road ?? '',
    nextTurn: null,
    arrival: eta.arrival,
    remaining: eta.remaining,
    remainingKm: km1(route.distanceKm),
    offRoute: false,
  };
}
