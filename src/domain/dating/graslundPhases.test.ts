// src/domain/dating/graslundPhases.test.ts
import { describe, it, expect } from 'vitest';
import { styleConstraint } from './graslundPhases';

describe('styleConstraint', () => {
  it('mappar RAK till tidigt, brett kuvert', () => {
    const c = styleConstraint('RAK')!;
    expect(c.kind).toBe('style');
    expect(c.isLinguistic).toBe(false);
    expect(c.interval.from).toBeLessThanOrEqual(990);
    expect(c.interval.to).toBeGreaterThanOrEqual(1015);
  });
  it('mappar Pr5 till sen fas', () => {
    expect(styleConstraint('Pr5')!.interval.to).toBeGreaterThanOrEqual(1120);
  });
  it('är skiftlägesokänslig och trimmar', () => {
    expect(styleConstraint('  pr2 ')!.kind).toBe('style');
  });
  it('returnerar null för okänd/saknad kod (odaterad)', () => {
    expect(styleConstraint(null)).toBeNull();
    expect(styleConstraint('')).toBeNull();
    expect(styleConstraint('Frobnicate')).toBeNull();
  });
});
