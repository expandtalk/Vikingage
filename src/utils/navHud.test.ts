import { describe, it, expect } from 'vitest';
import { haversineM, nextManeuver, formatEta, hudModel } from './navHud';
import type { RouteResult } from '@/services/routing';

const ROUTE: RouteResult = {
  coords: [[56.66, 16.36], [56.70, 16.39]],
  distanceKm: 4.2, durationMin: 6,
  maneuvers: [
    { type: 'depart', modifier: null, lat: 56.66, lng: 16.36, road: 'Storgatan', distanceM: 240 },
    { type: 'turn', modifier: 'left', lat: 56.67, lng: 16.37, road: 'Väg 258', distanceM: 1800 },
    { type: 'arrive', modifier: null, lat: 56.70, lng: 16.39, road: '', distanceM: 0 },
  ],
};

describe('haversineM', () => {
  it('is ~0 for the same point and positive for different points', () => {
    expect(haversineM({ lat: 56.66, lng: 16.36 }, { lat: 56.66, lng: 16.36 })).toBeCloseTo(0, 5);
    expect(haversineM({ lat: 56.66, lng: 16.36 }, { lat: 56.67, lng: 16.37 })).toBeGreaterThan(500);
  });
});

describe('nextManeuver', () => {
  it('returns the nearest maneuver and straight-line distance to it', () => {
    const r = nextManeuver(ROUTE.maneuvers, { lat: 56.669, lng: 16.369 });
    expect(r?.maneuver.road).toBe('Väg 258');
    expect(r?.distanceM).toBeGreaterThan(0);
  });
  it('returns null when there are no maneuvers', () => {
    expect(nextManeuver([], { lat: 0, lng: 0 })).toBeNull();
  });
  it('excludes the arrive step (no maneuver to render as "next turn" on approach)', () => {
    const onlyArrive = [
      { type: 'depart', modifier: null, lat: 56.66, lng: 16.36, road: 'Storgatan', distanceM: 240 },
      { type: 'arrive', modifier: null, lat: 56.70, lng: 16.39, road: '', distanceM: 0 },
    ] as RouteResult['maneuvers'];
    expect(nextManeuver(onlyArrive, { lat: 56.699, lng: 16.389 })).toBeNull();
  });
});

describe('formatEta', () => {
  it('adds remaining minutes to now and formats HH:MM + remaining label', () => {
    const now = Date.UTC(2026, 7, 4, 10, 0, 0); // 10:00 UTC
    const { arrival, remaining } = formatEta(6, now);
    expect(arrival).toMatch(/^\d{2}:\d{2}$/);
    expect(remaining).toBe('6 min');
  });
});

describe('hudModel', () => {
  it('derives current road, next turn, remaining km and ETA', () => {
    const m = hudModel(ROUTE, { lat: 56.669, lng: 16.369 }, Date.UTC(2026, 7, 4, 10, 0, 0));
    expect(m.currentRoad).toBe('Storgatan');
    expect(m.nextTurn?.road).toBe('Väg 258');
    expect(m.remainingKm).toBe('4,2 km');
    expect(m.remaining).toBe('6 min');
  });
  it('falls back gracefully with no position', () => {
    const m = hudModel(ROUTE, null, Date.UTC(2026, 7, 4, 10, 0, 0));
    expect(m.nextTurn).toBeNull();
    expect(m.remainingKm).toBe('4,2 km');
  });
});
