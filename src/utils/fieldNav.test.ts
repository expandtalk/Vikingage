// src/utils/fieldNav.test.ts
import { describe, it, expect } from 'vitest';
import { resolveHeading, normalizeDeg, coneRotationDeg, GPS_HEADING_MIN_SPEED } from './fieldNav';

describe('normalizeDeg', () => {
  it('wraps into [0,360)', () => {
    expect(normalizeDeg(0)).toBe(0);
    expect(normalizeDeg(370)).toBe(10);
    expect(normalizeDeg(-10)).toBe(350);
    expect(normalizeDeg(360)).toBe(0);
  });
});

describe('resolveHeading', () => {
  it('uses GPS course when moving fast enough', () => {
    const r = resolveHeading({ gpsHeading: 90, gpsSpeed: GPS_HEADING_MIN_SPEED + 1, compassHeading: 200 });
    expect(r).toEqual({ deg: 90, source: 'gps' });
  });
  it('falls back to compass when stationary', () => {
    const r = resolveHeading({ gpsHeading: 90, gpsSpeed: 0, compassHeading: 200 });
    expect(r).toEqual({ deg: 200, source: 'compass' });
  });
  it('falls back to compass when GPS heading is null', () => {
    const r = resolveHeading({ gpsHeading: null, gpsSpeed: 5, compassHeading: 45 });
    expect(r).toEqual({ deg: 45, source: 'compass' });
  });
  it('returns null when neither source is available', () => {
    const r = resolveHeading({ gpsHeading: null, gpsSpeed: null, compassHeading: null });
    expect(r).toEqual({ deg: null, source: null });
  });
  it('normalizes an out-of-range GPS heading', () => {
    const r = resolveHeading({ gpsHeading: 361, gpsSpeed: 10, compassHeading: null });
    expect(r).toEqual({ deg: 1, source: 'gps' });
  });
});

describe('coneRotationDeg', () => {
  it('is 0 when heading is null (dot only)', () => {
    expect(coneRotationDeg(null)).toBe(0);
  });
  it('mirrors a normalized heading', () => {
    expect(coneRotationDeg(90)).toBe(90);
    expect(coneRotationDeg(-90)).toBe(270);
  });
});
