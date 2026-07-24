// src/domain/dating/refineGraph.test.ts
import { describe, it, expect } from 'vitest';
import { refineNode, refineGraph } from './refineGraph';
import type { DatingConstraint } from './refinementTypes';

const style = (from: number, to: number): DatingConstraint =>
  ({ kind: 'style', interval: { from, to }, confidence: 'medium', isLinguistic: false, isAbsolute: false, source: 'S' });
const carver = (from: number, to: number): DatingConstraint =>
  ({ kind: 'carver', interval: { from, to }, confidence: 'medium', isLinguistic: false, isAbsolute: false, source: 'C' });
const lingformula = (from: number, to: number): DatingConstraint =>
  ({ kind: 'event', interval: { from, to }, confidence: 'high', isLinguistic: true, isAbsolute: false, source: 'L' });

describe('refineNode', () => {
  it('snittar villkor och sänker konfidens till svagaste', () => {
    const r = refineNode([style(980, 1070), carver(1010, 1040)], 'all');
    expect(r.interval).toEqual({ from: 1010, to: 1040 });
    expect(r.conflict).toBe(false);
    expect(r.provenance).toHaveLength(2);
  });
  it('flaggar konflikt och behåller bredaste kuvertet vid tomt snitt', () => {
    const r = refineNode([style(980, 1000), carver(1050, 1100)], 'all');
    expect(r.conflict).toBe(true);
    expect(r.interval).toEqual({ from: 980, to: 1100 });
  });
  it('non_linguistic-läget exkluderar språkliga villkor', () => {
    const r = refineNode([style(980, 1070), lingformula(1041, 1041)], 'non_linguistic');
    expect(r.interval).toEqual({ from: 980, to: 1070 }); // språkformeln ignorerad
  });
  it('all-läget inkluderar språkliga villkor', () => {
    const r = refineNode([style(980, 1070), lingformula(1041, 1041)], 'all');
    expect(r.interval).toEqual({ from: 1041, to: 1041 });
  });
  it('returnerar null-intervall när inga villkor gäller i läget', () => {
    const r = refineNode([lingformula(1041, 1041)], 'non_linguistic');
    expect(r.interval).toBeNull();
  });
});

describe('refineGraph', () => {
  it('propagerar en "före"-kant: lärlingens undre gräns lyfts till mästarens', () => {
    const nodes = [
      { id: 'master', constraints: [style(980, 1015)] },
      { id: 'apprentice', constraints: [style(950, 1070)] }, // börjar FÖRE mästaren
    ];
    const edges = [{ before: 'master', after: 'apprentice' }];
    const out = refineGraph(nodes, edges, 'all');
    expect(out.get('apprentice')!.interval.from).toBe(980); // lyft 950 → 980
    expect(out.get('apprentice')!.provenance.some((p) => p.source.includes('före'))).toBe(true);
  });

  it('en icke-bindande "före"-kant ändrar inget och lägger ingen proveniens', () => {
    const nodes = [
      { id: 'master', constraints: [style(980, 1015)] },
      { id: 'apprentice', constraints: [style(1000, 1070)] }, // börjar redan EFTER mästaren
    ];
    const edges = [{ before: 'master', after: 'apprentice' }];
    const out = refineGraph(nodes, edges, 'all');
    expect(out.get('apprentice')!.interval).toEqual({ from: 1000, to: 1070 });
    expect(out.get('apprentice')!.provenance.some((p) => p.source.includes('före'))).toBe(false);
  });
});
