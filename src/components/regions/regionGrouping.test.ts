import { describe, it, expect } from 'vitest';
import { buildRegionGroups } from './regionGrouping';

/**
 * Regression: focus=parishes grupperade på socken-NAMN enbart → samnamniga socknar i
 * olika landskap slogs ihop (Kalmar Uppland/Håbo + Småland/Norra Möre → EN rad med fel
 * antal och fel landskap). Nu disambigueras på härad-annars-landskap.
 */
const insc = (over: Record<string, unknown>) => ({
  coordinates: { lat: 59, lng: 17 },
  ...over,
});

describe('buildRegionGroups — namnkollisions-säker gruppering', () => {
  it('delar Kalmar i två rader på härad (10 Uppland/Håbo, 6 Småland/Norra Möre)', () => {
    const rows = [
      ...Array.from({ length: 10 }, (_, i) => insc({ signum: `U ${i}`, socken: 'Kalmar', harad: 'Håbo härad', landscape: 'Uppland' })),
      ...Array.from({ length: 6 }, (_, i) => insc({ signum: `Sm ${i}`, socken: 'Kalmar', harad: 'Norra Möre härad', landscape: 'Småland' })),
    ];
    const groups = buildRegionGroups(rows, 'parishes').filter((g) => g.name === 'Kalmar');
    expect(groups).toHaveLength(2);
    const habo = groups.find((g) => g.harad === 'Håbo härad');
    const more = groups.find((g) => g.harad === 'Norra Möre härad');
    expect(habo?.count).toBe(10);
    expect(habo?.landscape).toBe('Uppland');
    expect(more?.count).toBe(6);
    expect(more?.landscape).toBe('Småland');
    // Unika nycklar → var för sig valbara.
    expect(habo?.key).not.toBe(more?.key);
  });

  it('delar Stockholm på landskap när härad saknas (U/Sö vid Söderström)', () => {
    const rows = [
      insc({ signum: 'U 53', socken: 'Stockholm', harad: 'Okänd', landscape: 'Uppland' }),
      insc({ signum: 'U 54', socken: 'Stockholm', harad: 'Okänd', landscape: 'Uppland' }),
      insc({ signum: 'Sö 274', socken: 'Stockholm', harad: 'Okänd', landscape: 'Södermanland' }),
    ];
    const groups = buildRegionGroups(rows, 'parishes').filter((g) => g.name === 'Stockholm');
    expect(groups).toHaveLength(2);
    expect(groups.find((g) => g.landscape === 'Uppland')?.count).toBe(2);
    expect(groups.find((g) => g.landscape === 'Södermanland')?.count).toBe(1);
    // Härad okänt → tomt, disambiguering sker på landskap.
    expect(groups.every((g) => g.harad === '')).toBe(true);
  });

  it('hoppar över fynd utan koordinat', () => {
    const rows = [
      insc({ signum: 'U 1', socken: 'Test', harad: 'Tests härad', landscape: 'Uppland' }),
      { signum: 'U 2', socken: 'Test', harad: 'Tests härad', landscape: 'Uppland' }, // ingen coordinates
    ];
    const g = buildRegionGroups(rows, 'parishes').filter((r) => r.name === 'Test');
    expect(g[0].count).toBe(1);
  });
});
