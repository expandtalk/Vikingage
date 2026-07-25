import { GERMANIC_TIME_PERIODS } from './periods';

// Delad periodlogik för ALLA kartlager. Sanningskälla = GERMANIC_TIME_PERIODS
// (samma som folkgrupperna och eventlinjen använder), så objekt tänds bara i
// perioder som överlappar deras egen aktiva datering.

/** Årsintervall [start, slut] för en period-id, eller null för 'all'/okänd. */
export const periodYearRange = (periodId?: string | null): [number, number] | null => {
  if (!periodId || periodId === 'all') return null;
  const p = GERMANIC_TIME_PERIODS.find((x) => x.id === periodId);
  return p ? [p.startYear, p.endYear] : null;
};

/**
 * True om objektets aktiva period [itemStart, itemEnd] överlappar den valda perioden.
 * Fallback: 'all'/okänd period → visa; saknad datering (null) → visa (filtrera inte bort
 * odaterat). Så filtret döljer bara objekt vars kända datering ligger UTANFÖR perioden.
 */
export const overlapsPeriod = (
  selectedPeriod?: string | null,
  itemStart?: number | null,
  itemEnd?: number | null,
): boolean => {
  const range = periodYearRange(selectedPeriod);
  if (!range) return true;
  if (itemStart == null && itemEnd == null) return true;
  const [rangeStart, rangeEnd] = range;
  const s = itemStart ?? itemEnd ?? rangeStart;
  const e = itemEnd ?? itemStart ?? rangeEnd;
  return s <= rangeEnd && e >= rangeStart;
};
