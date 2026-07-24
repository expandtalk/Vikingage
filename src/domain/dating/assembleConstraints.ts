// src/domain/dating/assembleConstraints.ts
import type { DatingConstraint } from './refinementTypes';
import type { GraphNode } from './refineGraph';
import { styleConstraint } from './graslundPhases';
import { carverWindow } from './carverWindow';

/** Platt indata per inskrift, mappad från DB i batch-skriptet (Task 8). */
export interface InscriptionRow {
  id: string;
  styleGroup?: string | null;
  periodStart?: number | null;
  periodEnd?: number | null;
  carverFloruitStart?: number | null;
  carverFloruitEnd?: number | null;
  carverStoneMidpoints?: number[];
  absoluteFrom?: number | null;
  absoluteTo?: number | null;
  absoluteSource?: string | null;
}

/** Bygg en grafnod (id + villkor) ur en inskriftsrad. Ren funktion — inga DB-anrop. */
export const assembleNode = (row: InscriptionRow): GraphNode => {
  const constraints: DatingConstraint[] = [];

  const style = styleConstraint(row.styleGroup);
  if (style) {
    constraints.push(style);
  } else if (typeof row.periodStart === 'number' && typeof row.periodEnd === 'number' && row.periodStart <= row.periodEnd) {
    constraints.push({
      kind: 'style',
      interval: { from: row.periodStart, to: row.periodEnd },
      confidence: 'low',
      isLinguistic: false,
      isAbsolute: false,
      source: 'Rå datering (period_start/end)',
    });
  }

  const carver = carverWindow({
    floruitStart: row.carverFloruitStart,
    floruitEnd: row.carverFloruitEnd,
    stoneMidpoints: row.carverStoneMidpoints,
  });
  if (carver) constraints.push(carver);

  if (typeof row.absoluteFrom === 'number' && typeof row.absoluteTo === 'number') {
    constraints.push({
      kind: 'absolute',
      interval: { from: row.absoluteFrom, to: row.absoluteTo },
      confidence: 'high',
      isLinguistic: false,
      isAbsolute: true,
      source: row.absoluteSource ?? 'Absolut datering',
    });
  }

  return { id: row.id, constraints };
};
