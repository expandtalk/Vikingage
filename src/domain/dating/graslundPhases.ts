// src/domain/dating/graslundPhases.ts
import type { DatingConstraint, YearInterval, ConfidenceClass } from './refinementTypes';

/**
 * Gräslunds ornamentfaser → mjukt, överlappande dateringskuvert.
 * Årtalen är interpolerade (±10–15 år) och gränserna mjuka; confidence
 * sänks för de mest omdiskuterade/breda faserna. Källa: Gräslund 1994/2006.
 * Icke-språkligt (ornamentik) → isLinguistic:false, får datera i non_linguistic-läge.
 */
const PHASES: Record<string, { interval: YearInterval; confidence: ConfidenceClass }> = {
  RAK: { interval: { from: 980, to: 1015 }, confidence: 'medium' },
  FP:  { interval: { from: 1010, to: 1050 }, confidence: 'medium' },
  PR1: { interval: { from: 1010, to: 1040 }, confidence: 'low' },
  PR2: { interval: { from: 1020, to: 1050 }, confidence: 'medium' },
  PR3: { interval: { from: 1045, to: 1075 }, confidence: 'medium' },
  PR4: { interval: { from: 1060, to: 1100 }, confidence: 'medium' },
  PR5: { interval: { from: 1100, to: 1130 }, confidence: 'low' },
};

export const styleConstraint = (styleGroup: string | null | undefined): DatingConstraint | null => {
  if (!styleGroup) return null;
  const key = styleGroup.trim().toUpperCase();
  const phase = PHASES[key];
  if (!phase) return null;
  return {
    kind: 'style',
    interval: phase.interval,
    confidence: phase.confidence,
    isLinguistic: false,
    isAbsolute: false,
    source: `Gräslund ${styleGroup.trim()}`,
  };
};
