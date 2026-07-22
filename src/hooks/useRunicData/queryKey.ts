import type { UseRunicDataProps } from './types';

/**
 * Bygg React Query-nyckeln för inskriftsdatan. Nyckeln får BARA innehålla fält som
 * faktiskt påverkar DB-resultatet, dvs. exakt de fält enhancedDataLoader läser
 * (searchQuery, godNameSearch, landskap, land). Klient-endast-fält
 * (selectedTimePeriod/selectedPeriod/selectedStatus/selectedObjectType/isVikingMode/
 * selectedVikingCategory) filtreras i minnet nedströms (filterInscriptionsByPeriod m.fl.)
 * och får INTE ligga i nyckeln.
 *
 * Regression: låg de med hela filter-objektet triggade focus=inscriptions period-coercion
 * ('all'→'viking_age' direkt efter mount) en full omladdning av ~6400 rader (~6 MB, 7 sidor)
 * EN GÅNG TILL → dubbelladdning + dubbel markörrendering → blockerad main thread → frusen
 * Explore-flik.
 *
 * Ren funktion, inga sidoeffekter (ingen supabase-import) → enhetstestbar.
 */
export const buildRunicInscriptionsQueryKey = (filters: UseRunicDataProps) =>
  ['runic-inscriptions-enhanced-v2', {
    searchQuery: filters.searchQuery ?? '',
    godNameSearch: filters.godNameSearch ?? '',
    selectedLandscape: filters.selectedLandscape ?? 'all',
    selectedCountry: filters.selectedCountry ?? 'all',
  }] as const;
