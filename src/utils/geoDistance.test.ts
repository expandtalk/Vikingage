import { describe, it, expect } from 'vitest';
import { bearingDeg, compassPoint8 } from './geoDistance';

describe('bearingDeg', () => {
  const near = (a: number, b: number, tol = 0.5) => Math.abs(a - b) <= tol;
  it('points north for a target due north', () => {
    expect(near(bearingDeg({ lat: 0, lng: 0 }, { lat: 1, lng: 0 }), 0)).toBe(true);
  });
  it('points east for a target due east', () => {
    expect(near(bearingDeg({ lat: 0, lng: 0 }, { lat: 0, lng: 1 }), 90)).toBe(true);
  });
  it('points south for a target due south', () => {
    expect(near(bearingDeg({ lat: 0, lng: 0 }, { lat: -1, lng: 0 }), 180)).toBe(true);
  });
  it('points west for a target due west', () => {
    expect(near(bearingDeg({ lat: 0, lng: 0 }, { lat: 0, lng: -1 }), 270)).toBe(true);
  });
  it('always returns a value in [0,360)', () => {
    const b = bearingDeg({ lat: 59.33, lng: 18.06 }, { lat: 56.66, lng: 16.36 });
    expect(b).toBeGreaterThanOrEqual(0);
    expect(b).toBeLessThan(360);
  });
});

describe('compassPoint8', () => {
  it('maps cardinal + intercardinal degrees to Swedish points', () => {
    expect(compassPoint8(0)).toBe('N');
    expect(compassPoint8(45)).toBe('NÖ');
    expect(compassPoint8(90)).toBe('Ö');
    expect(compassPoint8(135)).toBe('SÖ');
    expect(compassPoint8(180)).toBe('S');
    expect(compassPoint8(225)).toBe('SV');
    expect(compassPoint8(270)).toBe('V');
    expect(compassPoint8(315)).toBe('NV');
  });
  it('wraps near 360 back to N', () => {
    expect(compassPoint8(350)).toBe('N');
  });
  it('rounds to the nearest sector', () => {
    expect(compassPoint8(23)).toBe('NÖ');
    expect(compassPoint8(22)).toBe('N');
  });
});
