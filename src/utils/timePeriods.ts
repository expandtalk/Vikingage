// Historiska periodintervall (matchar TimePeriodSelector). Används för att filtrera
// kartans runinskrifter på vald tidslinjeperiod — runor fanns inte i förhistorien.
export const PERIOD_RANGES: Record<string, { start: number; end: number }> = {
  paleolithic: { start: -45000, end: -8000 },
  mesolithic: { start: -8000, end: -4000 },
  neolithic: { start: -4000, end: -1700 },
  bronze_age: { start: -1700, end: -500 },
  pre_roman_iron: { start: -500, end: 1 },
  roman_iron: { start: 1, end: 400 },
  migration_period: { start: 400, end: 550 },
  vendel_period: { start: 550, end: 793 },
  viking_age: { start: 793, end: 1066 },
};

// Äldsta kända runinskrifterna är från ~150 e.Kr. (urnordiska, äldre futhark).
const RUNIC_EPOCH = 150;

interface DatedInscription {
  period_start?: number | null;
  period_end?: number | null;
}

/**
 * Filtrera runinskrifter på vald tidslinjeperiod.
 * - 'all'/okänd period → oförändrat.
 * - Period helt före runornas tid (slutar före ~150 e.Kr.) → INGA runinskrifter
 *   (fixar buggen att runstenar visades i paleolitikum/bronsålder osv.).
 * - Runtida period → visa inskrifter vars datering överlappar perioden; odaterade
 *   visas (kan inte uteslutas), eftersom de flesta odaterade är från runtiden.
 */
export const filterInscriptionsByPeriod = <T extends DatedInscription>(
  inscriptions: T[],
  periodId: string | null | undefined,
): T[] => {
  if (!periodId || periodId === 'all') return inscriptions;
  const r = PERIOD_RANGES[periodId];
  if (!r) return inscriptions;
  if (r.end < RUNIC_EPOCH) return [];
  return inscriptions.filter((i) => {
    const s = i.period_start;
    const e = i.period_end;
    if ((s === null || s === undefined) && (e === null || e === undefined)) return true;
    const from = s ?? e!;
    const to = e ?? s!;
    return from <= r.end && to >= r.start;
  });
};
