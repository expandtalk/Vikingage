// src/domain/dating/carverWindow.ts
import type { DatingConstraint } from './refinementTypes';

const MAX_ACTIVE_YEARS = 50;

export interface CarverWindowInput {
  /** carvers.period_active_start, om ifyllt. */
  floruitStart?: number | null;
  /** carvers.period_active_end, om ifyllt. */
  floruitEnd?: number | null;
  /** Mittpunkt av varje av ristarens daterade stenars intervall (för härledning). */
  stoneMidpoints?: number[];
}

/**
 * Ristarens aktiva fönster som ett dateringsvillkor. Explicit floruit → medium.
 * Härlett ur stenarnas mittpunkter (klippt till ≤50 år runt medianen) → low.
 * Icke-språkligt (biografisk/attribuerings-baserat), får datera i non_linguistic-läge.
 */
export const carverWindow = (input: CarverWindowInput): DatingConstraint | null => {
  const { floruitStart, floruitEnd } = input;
  if (typeof floruitStart === 'number' && typeof floruitEnd === 'number' && floruitStart <= floruitEnd) {
    return {
      kind: 'carver',
      interval: { from: floruitStart, to: floruitEnd },
      confidence: 'medium',
      isLinguistic: false,
      isAbsolute: false,
      source: 'Ristare floruit',
    };
  }
  const mids = (input.stoneMidpoints ?? []).filter((n) => typeof n === 'number').sort((a, b) => a - b);
  if (mids.length === 0) return null;
  let from = mids[0];
  let to = mids[mids.length - 1];
  if (to - from > MAX_ACTIVE_YEARS) {
    const median = mids[Math.floor(mids.length / 2)];
    from = median - MAX_ACTIVE_YEARS / 2;
    to = median + MAX_ACTIVE_YEARS / 2;
  }
  return {
    kind: 'carver',
    interval: { from, to },
    confidence: 'low',
    isLinguistic: false,
    isAbsolute: false,
    source: 'Ristarfönster (härlett)',
  };
};
