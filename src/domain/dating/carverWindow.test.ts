// src/domain/dating/carverWindow.test.ts
import { describe, it, expect } from 'vitest';
import { carverWindow } from './carverWindow';

describe('carverWindow', () => {
  it('använder explicit floruit när det finns', () => {
    const c = carverWindow({ floruitStart: 1010, floruitEnd: 1050, stoneMidpoints: [1200] })!;
    expect(c.interval).toEqual({ from: 1010, to: 1050 });
    expect(c.confidence).toBe('medium');
    expect(c.kind).toBe('carver');
    expect(c.isLinguistic).toBe(false);
  });
  it('härleder fönster ur stenarnas mittpunkter när floruit saknas', () => {
    const c = carverWindow({ stoneMidpoints: [1020, 1035, 1050] })!;
    expect(c.interval.from).toBeLessThanOrEqual(1020);
    expect(c.interval.to).toBeGreaterThanOrEqual(1050);
    expect(c.confidence).toBe('low');
  });
  it('klipper ett orimligt brett härlett fönster till max 50 år', () => {
    const c = carverWindow({ stoneMidpoints: [980, 1130] })!;
    expect(c.interval.to - c.interval.from).toBeLessThanOrEqual(50);
  });
  it('returnerar null utan både floruit och stenar', () => {
    expect(carverWindow({ stoneMidpoints: [] })).toBeNull();
    expect(carverWindow({})).toBeNull();
  });
});
