// src/domain/dating/assembleConstraints.test.ts
import { describe, it, expect } from 'vitest';
import { assembleNode } from './assembleConstraints';

describe('assembleNode', () => {
  it('bygger style-villkor ur style_group', () => {
    const node = assembleNode({ id: 'U344', styleGroup: 'Pr3' });
    expect(node.id).toBe('U344');
    expect(node.constraints.some((c) => c.kind === 'style')).toBe(true);
  });
  it('faller tillbaka på period_start/end när style_group saknas', () => {
    const node = assembleNode({ id: 'X', styleGroup: null, periodStart: 800, periodEnd: 1050 });
    const s = node.constraints.find((c) => c.kind === 'style')!;
    expect(s.interval).toEqual({ from: 800, to: 1050 });
    expect(s.confidence).toBe('low'); // rått brett kuvert = låg konfidens
  });
  it('lägger till ristarfönster ur floruit', () => {
    const node = assembleNode({ id: 'Y', carverFloruitStart: 1010, carverFloruitEnd: 1050 });
    expect(node.constraints.some((c) => c.kind === 'carver')).toBe(true);
  });
  it('lägger till absolut ankare när gives_absolute', () => {
    const node = assembleNode({ id: 'Z', absoluteFrom: 1041, absoluteTo: 1041, absoluteSource: 'Ingvarståget' });
    const a = node.constraints.find((c) => c.kind === 'absolute')!;
    expect(a.isAbsolute).toBe(true);
    expect(a.confidence).toBe('high');
  });
  it('ger tom villkorslista för helt odaterad sten', () => {
    expect(assembleNode({ id: 'Q' }).constraints).toEqual([]);
  });
});
