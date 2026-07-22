import { describe, it, expect } from 'vitest';
import { hashKey } from '@tanstack/react-query';
import { buildRunicInscriptionsQueryKey } from './queryKey';
import type { UseRunicDataProps } from './types';

/**
 * Regression: focus=inscriptions frös Explore-fliken. Orsak: React Query-nyckeln
 * innehöll HELA filter-objektet (inkl. selectedTimePeriod). När focus tvingade
 * period 'all'→'viking_age' direkt efter mount bytte nyckeln värde → full omladdning
 * av ~6400 inskrifter (~6 MB) en andra gång → dubbel markörrendering → frusen flik.
 *
 * Invariant: nyckeln får bara bero på fält som enhancedDataLoader läser mot DB.
 * Klient-endast-fält (period/status/objekttyp/vikingläge) får ALDRIG ändra nyckeln.
 */
describe('buildRunicInscriptionsQueryKey', () => {
  const base: UseRunicDataProps = {
    searchQuery: '',
    godNameSearch: '',
    selectedLandscape: 'all',
    selectedCountry: 'all',
    selectedPeriod: 'all',
    selectedStatus: 'all',
    selectedObjectType: 'all',
    selectedTimePeriod: 'all',
    isVikingMode: false,
    selectedVikingCategory: 'all',
  };

  const key = (f: UseRunicDataProps) => hashKey(buildRunicInscriptionsQueryKey(f) as unknown as unknown[]);

  it('är STABIL när endast klient-fält ändras (period/status/objekttyp/vikingläge)', () => {
    const before = key(base);
    // Detta är exakt focus=inscriptions-övergången som orsakade dubbelladdningen.
    expect(key({ ...base, selectedTimePeriod: 'viking_age' })).toBe(before);
    expect(key({ ...base, selectedPeriod: 'V' })).toBe(before);
    expect(key({ ...base, selectedStatus: 'verified' })).toBe(before);
    expect(key({ ...base, selectedObjectType: 'runsten' })).toBe(before);
    expect(key({ ...base, isVikingMode: true })).toBe(before);
    expect(key({ ...base, selectedVikingCategory: 'weapons' })).toBe(before);
  });

  it('ÄNDRAS när ett server-relevant fält ändras (search/gudnamn/landskap/land)', () => {
    const before = key(base);
    expect(key({ ...base, searchQuery: 'Rök' })).not.toBe(before);
    expect(key({ ...base, godNameSearch: 'Tor' })).not.toBe(before);
    expect(key({ ...base, selectedLandscape: 'Uppland' })).not.toBe(before);
    expect(key({ ...base, selectedCountry: 'Danmark' })).not.toBe(before);
  });

  it('är stabil oavsett fält-ordning / extra klient-fält (deterministisk hash)', () => {
    expect(key(base)).toBe(key({ selectedCountry: 'all', selectedLandscape: 'all', godNameSearch: '', searchQuery: '' }));
  });
});
