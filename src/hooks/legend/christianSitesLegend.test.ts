import { describe, it, expect } from 'vitest';
import { generateChristianSitesLegendItems } from './christianSitesLegend';
import type { ChristianSite } from '@/hooks/useChristianSites';

/**
 * Regression: på focus=eriksgatan (m.fl.) gick "tidig kristendom", "medeltida kloster"
 * och "senmedeltida kloster" INTE att avaktivera i legenden. Orsak: posterna var
 * hårdkodade `enabled: true` och generatorn tog inte emot enabledLegendItems, så varje
 * render återställde krysset. Fix: väg in toggle-tillståndet med bevarade defaults.
 */
const t = (k: string) => k; // identitets-översättare räcker för id/enabled-assertioner

const site = (over: Partial<ChristianSite>): ChristianSite => ({
  id: 'x', name: 'X', coordinates: [0, 0], site_type: 'monastery',
  period: 'medieval', status: 'ruins', significance_level: 'high',
  created_at: '', updated_at: '', ...over,
});

const sites: ChristianSite[] = [
  site({ id: 'e', period: 'early_christian', site_type: 'church' }),
  site({ id: 'm', period: 'medieval', site_type: 'monastery', religious_order: 'cistercian' }),
  site({ id: 'l', period: 'late_medieval', site_type: 'monastery' }),
  site({ id: 'h', period: 'medieval', site_type: 'holy_place' }),
];

const findById = (items: ReturnType<typeof generateChristianSitesLegendItems>, id: string): any => {
  const walk = (arr: any[]): any => {
    for (const it of arr) {
      if (it.id === id) return it;
      if (it.children) { const f = walk(it.children); if (f) return f; }
    }
    return null;
  };
  return walk(items);
};

describe('generateChristianSitesLegendItems — enabled speglar toggle-tillståndet', () => {
  it('default (inga toggles satta): periodlager PÅ, parent/ordnar/heliga AV', () => {
    const items = generateChristianSitesLegendItems(sites, t, {});
    expect(findById(items, 'early_christian_sites').enabled).toBe(true);
    expect(findById(items, 'medieval_monasteries').enabled).toBe(true);
    expect(findById(items, 'late_medieval_sites').enabled).toBe(true);
    expect(findById(items, 'christian_sites').enabled).toBe(false);
    expect(findById(items, 'holy_places').enabled).toBe(false);
    expect(findById(items, 'cistercian_monasteries').enabled).toBe(false);
  });

  it('går att STÄNGA AV periodlagren (buggen som rapporterades)', () => {
    const items = generateChristianSitesLegendItems(sites, t, {
      early_christian_sites: false,
      medieval_monasteries: false,
      late_medieval_sites: false,
    });
    expect(findById(items, 'early_christian_sites').enabled).toBe(false);
    expect(findById(items, 'medieval_monasteries').enabled).toBe(false);
    expect(findById(items, 'late_medieval_sites').enabled).toBe(false);
  });

  it('går att SLÅ PÅ de som är av som standard (ordnar/heliga platser)', () => {
    const items = generateChristianSitesLegendItems(sites, t, {
      holy_places: true,
      cistercian_monasteries: true,
    });
    expect(findById(items, 'holy_places').enabled).toBe(true);
    expect(findById(items, 'cistercian_monasteries').enabled).toBe(true);
  });
});
