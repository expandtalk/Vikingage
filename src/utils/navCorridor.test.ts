import { describe, it, expect } from 'vitest';
import { zoneOf, bucketCorridor } from './navCorridor';
import type { AlongRouteFeature } from '@/hooks/useRoadtrip';

const f = (id: string, detour_km: number, frac_along: number): AlongRouteFeature => ({
  feature_type: 'runestone', feature_id: id, label: id, lat: 0, lng: 0,
  detour_km, frac_along, significance: 1, score: 1, rank_reason: '',
});

describe('zoneOf', () => {
  it('classifies <=100 m as near, beyond as sight', () => {
    expect(zoneOf(0)).toBe('near');
    expect(zoneOf(0.1)).toBe('near');
    expect(zoneOf(0.1001)).toBe('sight');
    expect(zoneOf(1.5)).toBe('sight');
  });
});

describe('bucketCorridor', () => {
  it('splits features into near/sight and orders each by frac_along', () => {
    const out = bucketCorridor([f('a', 0.05, 0.9), f('b', 1.2, 0.2), f('c', 0.02, 0.1), f('d', 0.5, 0.5)]);
    expect(out.near.map((x) => x.feature_id)).toEqual(['c', 'a']); // 0.1 then 0.9 frac
    expect(out.sight.map((x) => x.feature_id)).toEqual(['b', 'd']); // 0.2 then 0.5 frac
  });
  it('handles an empty list', () => {
    expect(bucketCorridor([])).toEqual({ near: [], sight: [] });
  });
});
