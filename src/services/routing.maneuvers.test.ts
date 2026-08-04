import { describe, it, expect } from 'vitest';
import { parseManeuvers } from './routing';

const OSRM_FIXTURE = {
  routes: [{
    legs: [{
      steps: [
        { name: 'Storgatan', distance: 240, maneuver: { type: 'depart', modifier: null, location: [16.36, 56.66] } },
        { name: 'Väg 258',   distance: 1800, maneuver: { type: 'turn', modifier: 'left', location: [16.37, 56.67] } },
        { name: '',          distance: 0,    maneuver: { type: 'arrive', modifier: null, location: [16.39, 56.70] } },
      ],
    }],
  }],
};

describe('parseManeuvers', () => {
  it('flattens legs→steps into maneuvers with lat/lng from [lng,lat]', () => {
    const m = parseManeuvers(OSRM_FIXTURE);
    expect(m).toHaveLength(3);
    expect(m[0]).toEqual({ type: 'depart', modifier: null, lat: 56.66, lng: 16.36, road: 'Storgatan', distanceM: 240 });
    expect(m[1]).toEqual({ type: 'turn', modifier: 'left', lat: 56.67, lng: 16.37, road: 'Väg 258', distanceM: 1800 });
    expect(m[2].type).toBe('arrive');
  });

  it('returns [] for malformed/empty input (never throws)', () => {
    expect(parseManeuvers(null)).toEqual([]);
    expect(parseManeuvers({})).toEqual([]);
    expect(parseManeuvers({ routes: [{}] })).toEqual([]);
  });
});
