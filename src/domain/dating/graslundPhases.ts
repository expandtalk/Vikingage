// src/domain/dating/graslundPhases.ts
import type { DatingConstraint, YearInterval, ConfidenceClass } from './refinementTypes';

/**
 * Gräslunds ornamentfaser → mjukt, brett överlappande dateringskuvert.
 * Kalibrerat mot Källström 2007 (Mästare och minnesmärken, s. 65–75): bara
 * Pr3–5 har säkra arkeologiska ankare (säkrast Pr4–5), Rak/Kb är tvetydiga
 * (förekommer tidigt OCH sent), och intervallen är bredare/mer överlappande än
 * Gräslunds Tabell 4. Därför: Pr4/Pr5 = high, Pr3 = medium, Fp/Pr1/Pr2 = low,
 * Rak = low + bredast. Stilgrupp är ett MJUKT kuvert, aldrig ett hårt ankare.
 * Icke-språkligt (ornamentik) → isLinguistic:false, får datera i non_linguistic-läge.
 */
const PHASES: Record<string, { interval: YearInterval; confidence: ConfidenceClass }> = {
  RAK: { interval: { from: 980, to: 1075 }, confidence: 'low' },    // tvetydig (tidig+sen) → bredast
  FP:  { interval: { from: 1010, to: 1055 }, confidence: 'low' },
  PR1: { interval: { from: 1010, to: 1050 }, confidence: 'low' },
  PR2: { interval: { from: 1015, to: 1055 }, confidence: 'low' },
  PR3: { interval: { from: 1045, to: 1085 }, confidence: 'medium' },
  PR4: { interval: { from: 1070, to: 1100 }, confidence: 'high' },  // säkrast ankrad
  PR5: { interval: { from: 1100, to: 1130 }, confidence: 'high' },  // säkrast ankrad
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
