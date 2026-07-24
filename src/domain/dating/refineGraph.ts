// src/domain/dating/refineGraph.ts
import type {
  DatingConstraint, RefineMode, RefinedDating, Provenance, YearInterval, ConfidenceClass,
} from './refinementTypes';
import { intersect, minConfidence } from './interval';

export interface GraphNode {
  id: string;
  constraints: DatingConstraint[];
}

/** Riktad "före"-kant: `before` var verksam före `after` (mästar→lärling, förebild→efterföljd). */
export interface BeforeEdge {
  before: string;
  after: string;
}

interface NodeResult {
  interval: YearInterval | null;
  confidence: ConfidenceClass;
  conflict: boolean;
  provenance: Provenance[];
}

/** Snittet av en nods villkor i ett givet läge. Tomt snitt → bredaste kuvert + conflict. */
export const refineNode = (constraints: DatingConstraint[], mode: RefineMode): NodeResult => {
  const active = constraints.filter((c) => (mode === 'non_linguistic' ? !c.isLinguistic : true));
  if (active.length === 0) {
    return { interval: null, confidence: 'low', conflict: false, provenance: [] };
  }
  const provenance: Provenance[] = active.map((c) => ({ kind: c.kind, source: c.source, interval: c.interval }));
  let acc: YearInterval | null = active[0].interval;
  for (let i = 1; i < active.length; i++) {
    const next = acc ? intersect(acc, active[i].interval) : null;
    acc = next;
    if (!acc) break;
  }
  if (acc) {
    return { interval: acc, confidence: minConfidence(...active.map((c) => c.confidence)), conflict: false, provenance };
  }
  // Konflikt: behåll det bredaste ingående kuvertet (unionen av alla motstridiga villkor), flagga.
  const from = Math.min(...active.map((c) => c.interval.from));
  const to = Math.max(...active.map((c) => c.interval.to));
  return { interval: { from, to }, confidence: 'low', conflict: true, provenance };
};

/**
 * Kör hela grafen. Först snittas varje nod, sedan propageras "före"-kanter en omgång:
 * after.from lyfts till max(after.from, before.from). (Fixpunkt-iteration över djupa
 * kedjor är en senare utbyggnad — MVP har få kanter tills relationer kurerats.)
 */
export const refineGraph = (
  nodes: GraphNode[],
  edges: BeforeEdge[],
  mode: RefineMode,
): Map<string, RefinedDating> => {
  const results = new Map<string, NodeResult>();
  for (const n of nodes) results.set(n.id, refineNode(n.constraints, mode));

  for (const e of edges) {
    const before = results.get(e.before);
    const after = results.get(e.after);
    if (!before?.interval || !after?.interval) continue;
    const lifted = Math.min(Math.max(after.interval.from, before.interval.from), after.interval.to);
    if (lifted <= after.interval.from) continue; // icke-bindande kant → ingen ändring, ingen proveniens
    after.interval = { from: lifted, to: after.interval.to };
    after.confidence = minConfidence(after.confidence, before.confidence);
    after.provenance = [
      ...after.provenance,
      { kind: 'terminus', source: `före ${e.before}`, interval: before.interval },
    ];
  }

  const out = new Map<string, RefinedDating>();
  for (const n of nodes) {
    const r = results.get(n.id)!;
    out.set(n.id, {
      inscriptionId: n.id,
      mode,
      interval: r.interval ?? { from: NaN, to: NaN },
      confidence: r.confidence,
      conflict: r.conflict,
      provenance: r.provenance,
    });
  }
  return out;
};
