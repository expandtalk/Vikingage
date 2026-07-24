// src/domain/dating/calibration.test.ts
import { describe, it, expect } from 'vitest';
import { styleConstraint } from './graslundPhases';
import { carverWindow } from './carverWindow';
import { refineNode } from './refineGraph';

const PHASES = ['RAK', 'Fp', 'Pr1', 'Pr2', 'Pr3', 'Pr4', 'Pr5'];

describe('Gräslund-kalibrering', () => {
  it('återger exakt Gräslund-intervallet för en sten med enbart stildatering', () => {
    for (const phase of PHASES) {
      const s = styleConstraint(phase)!;
      const r = refineNode([s], 'all');
      expect(r.interval).toEqual(s.interval);
      expect(r.conflict).toBe(false);
      // fasen finns kvar i proveniensen som overlay-lager
      expect(r.provenance.some((p) => p.kind === 'style' && p.source.startsWith('Gräslund'))).toBe(true);
    }
  });

  it('förfinar INOM fasen när ett smalare icke-motstridigt villkor läggs till', () => {
    const s = styleConstraint('Pr3')!;                 // {1045,1075}
    const c = carverWindow({ floruitStart: 1050, floruitEnd: 1065 })!;
    const r = refineNode([s, c], 'all');
    expect(r.interval).toEqual({ from: 1050, to: 1065 });
    expect(r.interval!.from).toBeGreaterThanOrEqual(s.interval.from);
    expect(r.interval!.to).toBeLessThanOrEqual(s.interval.to);
    expect(r.conflict).toBe(false);
  });

  it('åsidosätter aldrig tyst Gräslund: motstridigt villkor flaggas', () => {
    const s = styleConstraint('RAK')!;                 // {980,1015}
    const c = carverWindow({ floruitStart: 1060, floruitEnd: 1090 })!;
    const r = refineNode([s, c], 'all');
    expect(r.conflict).toBe(true);
  });
});
