import { describe, it, expect } from 'vitest';
import { projectOntoRoute, routeProgress, routeLengthM, hudModelLive, OFF_ROUTE_M } from './routeProgress';
import type { RouteResult } from '@/services/routing';

// L-formad rutt: österut längs 56.60, sedan norrut längs 16.50.
const ROUTE: RouteResult = {
  coords: [[56.60, 16.40], [56.60, 16.50], [56.70, 16.50]],
  distanceKm: 17.2, durationMin: 20,
  maneuvers: [
    { type: 'depart', modifier: null, lat: 56.60, lng: 16.40, road: 'Storgatan', distanceM: 6100 },
    { type: 'turn', modifier: 'left', lat: 56.60, lng: 16.50, road: 'Nordvägen', distanceM: 11100 },
    { type: 'arrive', modifier: null, lat: 56.70, lng: 16.50, road: '', distanceM: 0 },
  ],
} as RouteResult;

describe('projectOntoRoute', () => {
  it('snaps a point that is on the route with ~0 off-route distance and increasing alongM', () => {
    const early = projectOntoRoute(ROUTE.coords, { lat: 56.60, lng: 16.43 });
    const later = projectOntoRoute(ROUTE.coords, { lat: 56.60, lng: 16.48 });
    expect(early!.offRouteM).toBeLessThan(30);
    expect(later!.alongM).toBeGreaterThan(early!.alongM); // längre österut = längre in i rutten
  });
  it('reports a large off-route distance for a point far from the line', () => {
    const p = projectOntoRoute(ROUTE.coords, { lat: 56.65, lng: 16.30 });
    expect(p!.offRouteM).toBeGreaterThan(OFF_ROUTE_M);
  });
  it('returns null for a degenerate route', () => {
    expect(projectOntoRoute([[1, 1]], { lat: 1, lng: 1 })).toBeNull();
  });
});

describe('routeProgress — advancement (kärnan i P0)', () => {
  it('points to the upcoming turn while on the first leg, current road = departed road', () => {
    const p = routeProgress(ROUTE, { lat: 56.60, lng: 16.43 })!;
    expect(p.nextManeuver?.maneuver.road).toBe('Nordvägen');
    expect(p.nextManeuver?.distanceM).toBeGreaterThan(0);
    expect(p.currentRoad).toBe('Storgatan');
    expect(p.offRoute).toBe(false);
  });

  it('ADVANCES past the turn: current road updates, no further turn ahead', () => {
    const p = routeProgress(ROUTE, { lat: 56.65, lng: 16.50 })!; // förbi svängen, på norr-benet
    expect(p.currentRoad).toBe('Nordvägen');       // manövern har avancerat
    expect(p.nextManeuver).toBeNull();             // inga fler svängar (arrive exkluderas)
  });

  it('counts DOWN: traveled increases and remaining shrinks as I move along', () => {
    const a = routeProgress(ROUTE, { lat: 56.60, lng: 16.43 })!;
    const b = routeProgress(ROUTE, { lat: 56.65, lng: 16.50 })!;
    expect(b.traveledM).toBeGreaterThan(a.traveledM);
    expect(b.remainingM).toBeLessThan(a.remainingM);
    expect(b.remainingMin).toBeLessThan(a.remainingMin);
    expect(a.remainingM).toBeLessThanOrEqual(Math.round(routeLengthM(ROUTE.coords)) + 1);
  });

  it('flags off-route when I leave the line', () => {
    const p = routeProgress(ROUTE, { lat: 56.65, lng: 16.30 })!;
    expect(p.offRoute).toBe(true);
  });
});

describe('hudModelLive — live HUD-data', () => {
  const now = Date.UTC(2026, 7, 12, 10, 0, 0);
  it('advances the turn and shrinks remaining across positions', () => {
    const a = hudModelLive(ROUTE, { lat: 56.60, lng: 16.43 }, now);
    const b = hudModelLive(ROUTE, { lat: 56.65, lng: 16.50 }, now);
    expect(a.nextTurn?.road).toBe('Nordvägen');
    expect(a.currentRoad).toBe('Storgatan');
    expect(b.nextTurn).toBeNull();          // svängen passerad
    expect(b.currentRoad).toBe('Nordvägen');
    const km = (s: string) => parseFloat(s.replace(' km', '').replace(',', '.'));
    expect(km(b.remainingKm)).toBeLessThan(km(a.remainingKm)); // räknar ner
  });
  it('falls back to whole-route totals without a position', () => {
    const m = hudModelLive(ROUTE, null, now);
    expect(m.nextTurn).toBeNull();
    expect(m.remainingKm).toBe('17,2 km');
    expect(m.offRoute).toBe(false);
  });
});
