import { describe, it, expect } from 'vitest';
import { easterSunday, swedishHolidays, nextHoliday, isoWeek } from './swedishCalendar';

const ymd = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

describe('easterSunday', () => {
  // Kända, verifierbara påskdagar (gregoriansk påsk).
  it.each([
    [2024, '2024-03-31'],
    [2025, '2025-04-20'],
    [2026, '2026-04-05'],
    [2027, '2027-03-28'],
    [2030, '2030-04-21'],
  ])('påskdagen %i = %s', (year, expected) => {
    expect(ymd(easterSunday(year))).toBe(expected);
  });
});

describe('swedishHolidays', () => {
  it('midsommardagen är en lördag 20–26 juni', () => {
    const mid = swedishHolidays(2026).find((h) => h.name_sv === 'Midsommardagen')!;
    expect(mid.date.getDay()).toBe(6); // lördag
    expect(mid.date.getMonth()).toBe(5); // juni
    expect(mid.date.getDate()).toBeGreaterThanOrEqual(20);
    expect(mid.date.getDate()).toBeLessThanOrEqual(26);
  });
  it('alla helgons dag är en lördag 31 okt–6 nov', () => {
    const d = swedishHolidays(2026).find((h) => h.name_sv === 'Alla helgons dag')!.date;
    expect(d.getDay()).toBe(6);
    const okNov = (d.getMonth() === 9 && d.getDate() === 31) || (d.getMonth() === 10 && d.getDate() >= 1 && d.getDate() <= 6);
    expect(okNov).toBe(true);
  });
  it('nationaldagen 6 juni finns och är lagstadgad', () => {
    const nd = swedishHolidays(2026).find((h) => h.name_sv === 'Sveriges nationaldag')!;
    expect(ymd(nd.date)).toBe('2026-06-06');
    expect(nd.statutory).toBe(true);
  });
});

describe('nextHoliday', () => {
  it('från 2026-08-21 är nästa helgdag Alla helgons dag (2026-10-31)', () => {
    const r = nextHoliday(new Date(2026, 7, 21))!;
    expect(r.holiday.name_sv).toBe('Alla helgons dag');
    expect(ymd(r.holiday.date)).toBe('2026-10-31');
  });
});

describe('isoWeek', () => {
  it('4 januari ligger alltid i vecka 1', () => {
    expect(isoWeek(new Date(2026, 0, 4))).toBe(1);
    expect(isoWeek(new Date(2027, 0, 4))).toBe(1);
  });
  it('2026-08-21 ligger i vecka 34', () => {
    expect(isoWeek(new Date(2026, 7, 21))).toBe(34);
  });
});
