// src/domain/dating/interval.test.ts
import { describe, it, expect } from 'vitest';
import { intersect, width, minConfidence } from './interval';

describe('intersect', () => {
  it('returnerar överlappet av två intervall', () => {
    expect(intersect({ from: 980, to: 1070 }, { from: 1010, to: 1130 }))
      .toEqual({ from: 1010, to: 1070 });
  });
  it('returnerar null när de inte överlappar', () => {
    expect(intersect({ from: 980, to: 1000 }, { from: 1050, to: 1100 })).toBeNull();
  });
  it('hanterar tangerande kanter som överlapp', () => {
    expect(intersect({ from: 980, to: 1015 }, { from: 1015, to: 1070 }))
      .toEqual({ from: 1015, to: 1015 });
  });
});

describe('width', () => {
  it('beräknar årsbredd inklusivt', () => {
    expect(width({ from: 1010, to: 1070 })).toBe(60);
  });
});

describe('minConfidence', () => {
  it('väljer den svagaste klassen', () => {
    expect(minConfidence('high', 'low', 'medium')).toBe('low');
    expect(minConfidence('high', 'high')).toBe('high');
  });
  it('returnerar high för tom indata (neutral)', () => {
    expect(minConfidence()).toBe('high');
  });
});
