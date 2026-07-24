// src/domain/dating/interval.ts
import type { YearInterval, ConfidenceClass } from './refinementTypes';

/** Snittet av två intervall, eller null om de inte överlappar. Tangerande kant räknas som överlapp. */
export const intersect = (a: YearInterval, b: YearInterval): YearInterval | null => {
  const from = Math.max(a.from, b.from);
  const to = Math.min(a.to, b.to);
  return from <= to ? { from, to } : null;
};

/** Årsbredd, inklusivt (1010–1070 = 60). */
export const width = (i: YearInterval): number => i.to - i.from;

const RANK: Record<ConfidenceClass, number> = { low: 0, medium: 1, high: 2 };
const BY_RANK: ConfidenceClass[] = ['low', 'medium', 'high'];

/** Svagaste klassen av flera (ett snitt är aldrig säkrare än sitt osäkraste villkor). */
export const minConfidence = (...cs: ConfidenceClass[]): ConfidenceClass => {
  if (cs.length === 0) return 'high';
  return cs.reduce((acc, c) => (RANK[c] < RANK[acc] ? c : acc), 'high' as ConfidenceClass);
};

export { BY_RANK };
