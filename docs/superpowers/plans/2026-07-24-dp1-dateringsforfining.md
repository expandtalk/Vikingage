# DP1 — Dateringsförfinings-motor — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Per runinskrift beräkna ett *förfinat* dateringsintervall som snittet av oberoende villkor (stilkuvert ∩ ristarfönster ∩ händelseankare + relations-kanter), med konfidensklass och proveniens, materialiserat till en tabell som UI kan läsa.

**Architecture:** En ren, DB-fri TS-motor (`src/domain/dating/`) gör allt tungt: intervall-aritmetik, ristarfönster-härledning, och en villkorsgraf med propagering. En adapter mappar dagens DB-rader → motorns indata. Ett batch-skript kör motorn över hela korpusen och skriver `refined_datings`. Ett hook exponerar resultatet. UI (tidslinje/carvers) läser det förfinade datumet i stället för det råa stilkuvertet.

**Tech Stack:** TypeScript, Vitest (`vitest run`), Supabase/Postgres (migrations + RLS), `@supabase/supabase-js` i Node-skript (mönster: `scripts/data/*.mjs`), React Query-hooks.

## Global Constraints

- **Konfidensklasser, inte siffror.** Osäkerhet uttrycks som `'high' | 'medium' | 'low'` — inga numeriska sannolikheter/fördelningar i DP1 (beslut 2026-07-24). Numeriska fördelningar skjuts till DP3.
- **Cirkularitetsvägg.** Varje villkor bär `isLinguistic: boolean`. Motorn körs i två lägen: `'all'` och `'non_linguistic'`. `refined_datings` materialiserar BÅDA. DP2 får bara läsa `non_linguistic`-raden. Språkliga villkor (formel/ordval/titel/versmått) får aldrig ingå i `non_linguistic`-datumet.
- **Proveniens på allt.** Varje förfinat datum bär en lista över vilka villkor som bidrog (kind + källa). Aldrig en siffra utan spårbarhet.
- **Datum = intervall, aldrig punkt.** Konflikt (tomt snitt) → behåll det bredaste ingående kuvertet och flagga `conflict: true` snarare än att gissa.
- **`style_group` är mjukt.** Gräslund-faser modelleras som överlappande intervall med osäkerhet + citerad källa (`graslundPhases.ts`), aldrig skarpa årtal. Väger under absoluta ankare (`dating_methods.gives_absolute`).
- **Reproducerbarhet.** All härledningslogik är rena funktioner i `src/domain/dating/`, testbara utan DB, och används identiskt i batch-skript och (framtida) RPC.
- **Filspråk:** JSDoc och testbeskrivningar på svenska (matchar `runeDensity.ts`/`.test.ts`).

---

## File Structure

- `src/domain/dating/refinementTypes.ts` — domäntyper (inga beroenden).
- `src/domain/dating/interval.ts` — intervall-aritmetik + konfidenskombination (rena).
- `src/domain/dating/graslundPhases.ts` — `style_group` → mjukt intervall + konfidens + källa.
- `src/domain/dating/carverWindow.ts` — härled ristarens aktiva fönster.
- `src/domain/dating/refineGraph.ts` — villkorsgrafen: snitt + relations-propagering + läges-filter.
- `src/domain/dating/assembleConstraints.ts` — adapter DB-rad → motor-indata.
- `supabase/migrations/20260724210000_refined_datings.sql` — tabell + RLS.
- `scripts/data/materialize-refined-datings.mjs` — batch-materialisering.
- `src/hooks/useRefinedDating.ts` — läs-hook.
- Test: samlokaliserade `*.test.ts` bredvid varje ren modul.

Motorn (domain) är det enda gränssnittet mellan datakällan (adapter/skript) och konsumenterna (hook/UI). Man ska kunna byta hur ett villkor *härleds* utan att röra hur det *snittas*.

---

### Task 1: Domäntyper

**Files:**
- Create: `src/domain/dating/refinementTypes.ts`

**Interfaces:**
- Produces: `YearInterval`, `ConfidenceClass`, `ConstraintKind`, `DatingConstraint`, `RefineMode`, `RefinedDating`, `Provenance`.

- [ ] **Step 1: Skapa typfilen**

```typescript
// src/domain/dating/refinementTypes.ts

/** Slutet årsintervall (inklusivt). Negativt år = f.Kr. (ej relevant för runstenar men tillåtet). */
export interface YearInterval {
  from: number;
  to: number;
}

/** Osäkerhet uttrycks som klass — inga numeriska sannolikheter i DP1. */
export type ConfidenceClass = 'high' | 'medium' | 'low';

/** Vilken sorts villkor ett dateringsintervall kommer ifrån. */
export type ConstraintKind =
  | 'style'        // stilkronologi (Gräslund) — mjukt kuvert
  | 'carver'       // ristarens aktiva fönster
  | 'event'        // daterbar händelse (Ingvarståget m.fl.)
  | 'terminus'     // terminus post/ante quem (kyrka/ting)
  | 'absolute';    // externt absolut daterad (dating_methods.gives_absolute)

/** Ett enskilt dateringsvillkor på en nod. */
export interface DatingConstraint {
  kind: ConstraintKind;
  interval: YearInterval;
  confidence: ConfidenceClass;
  /** Språkligt villkor får ej ingå i non_linguistic-läget (cirkularitetsväggen). */
  isLinguistic: boolean;
  /** Absolut ankare väger tyngst och kan inte skalas bort. */
  isAbsolute: boolean;
  /** Källhänvisning för proveniens (t.ex. "Gräslund Pr2", "SRDB U 344", "Ingvarståget ~1041"). */
  source: string;
}

export type RefineMode = 'all' | 'non_linguistic';

/** Vad som bidrog till ett förfinat datum — spårbarhet. */
export interface Provenance {
  kind: ConstraintKind;
  source: string;
  interval: YearInterval;
}

/** Motorns utdata per nod och läge. */
export interface RefinedDating {
  inscriptionId: string;
  mode: RefineMode;
  interval: YearInterval;
  confidence: ConfidenceClass;
  /** True om villkoren var motstridiga (tomt snitt) → bredaste kuvertet behölls. */
  conflict: boolean;
  provenance: Provenance[];
}
```

- [ ] **Step 2: Verifiera typkompilering**

Run: `npx tsc --noEmit`
Expected: PASS (inga fel; filen har inga körbara satser).

- [ ] **Step 3: Commit**

```bash
git add src/domain/dating/refinementTypes.ts
git commit -m "feat(dating): DP1 domäntyper (YearInterval, DatingConstraint, RefinedDating)"
```

---

### Task 2: Intervall-aritmetik + konfidenskombination

**Files:**
- Create: `src/domain/dating/interval.ts`
- Test: `src/domain/dating/interval.test.ts`

**Interfaces:**
- Consumes: `YearInterval`, `ConfidenceClass` (Task 1).
- Produces: `intersect(a, b): YearInterval | null`, `width(i): number`, `minConfidence(...cs): ConfidenceClass`, `narrowerWins(a, b): ConfidenceClass`.

- [ ] **Step 1: Skriv de fallerande testerna**

```typescript
// src/domain/dating/interval.test.ts
import { describe, it, expect } from 'vitest';
import { intersect, width, minConfidence } from './interval';

describe('intersect', () => {
  it('returnerar överlappet av två intervall', () => {
    expect(intersect({ from: 980, to: 1070 }, { from: 1010, to: 1130 }))
      .toEqual({ from: 1010, to: 1070 });
  });
  it('returnerar null när de inte överlappar', () => {
    expect(intersect({ from: 980, to: 1000 }, { from: 1050, to: 1100 })).toBeNull();
  });
  it('hanterar tangerande kanter som överlapp', () => {
    expect(intersect({ from: 980, to: 1015 }, { from: 1015, to: 1070 }))
      .toEqual({ from: 1015, to: 1015 });
  });
});

describe('width', () => {
  it('beräknar årsbredd inklusivt', () => {
    expect(width({ from: 1010, to: 1070 })).toBe(60);
  });
});

describe('minConfidence', () => {
  it('väljer den svagaste klassen', () => {
    expect(minConfidence('high', 'low', 'medium')).toBe('low');
    expect(minConfidence('high', 'high')).toBe('high');
  });
  it('returnerar high för tom indata (neutral)', () => {
    expect(minConfidence()).toBe('high');
  });
});
```

- [ ] **Step 2: Kör testerna, verifiera att de fallerar**

Run: `npx vitest run src/domain/dating/interval.test.ts`
Expected: FAIL ("intersect is not a function" / import-fel).

- [ ] **Step 3: Implementera modulen**

```typescript
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
```

- [ ] **Step 4: Kör testerna, verifiera PASS**

Run: `npx vitest run src/domain/dating/interval.test.ts`
Expected: PASS (6 tester gröna).

- [ ] **Step 5: Commit**

```bash
git add src/domain/dating/interval.ts src/domain/dating/interval.test.ts
git commit -m "feat(dating): intervall-snitt + konfidenskombination (rena, testade)"
```

---

### Task 3: Gräslund-faser (mjukt stilkuvert)

**Files:**
- Create: `src/domain/dating/graslundPhases.ts`
- Test: `src/domain/dating/graslundPhases.test.ts`

**Interfaces:**
- Consumes: `YearInterval`, `ConfidenceClass`, `DatingConstraint` (Task 1).
- Produces: `styleConstraint(styleGroup: string | null | undefined): DatingConstraint | null`.

**Bakgrund (spec §5, §8, stil-diskussion):** `style_group`-koderna är Gräslunds ornamentfaser. Årtalen är *interpolerade* (±10–15 år), faserna *överlappar*, och 1015 m.fl. är mjuka gränser — inte skarpa. Vi modellerar dem som breda intervall med `confidence` som sjunker för de mest omdiskuterade faserna. Icke-språkligt (ornamentik) → `isLinguistic: false`.

- [ ] **Step 1: Skriv de fallerande testerna**

```typescript
// src/domain/dating/graslundPhases.test.ts
import { describe, it, expect } from 'vitest';
import { styleConstraint } from './graslundPhases';

describe('styleConstraint', () => {
  it('mappar RAK till tidigt, brett kuvert', () => {
    const c = styleConstraint('RAK')!;
    expect(c.kind).toBe('style');
    expect(c.isLinguistic).toBe(false);
    expect(c.interval.from).toBeLessThanOrEqual(990);
    expect(c.interval.to).toBeGreaterThanOrEqual(1015);
  });
  it('mappar Pr5 till sen fas', () => {
    expect(styleConstraint('Pr5')!.interval.to).toBeGreaterThanOrEqual(1120);
  });
  it('är skiftlägesokänslig och trimmar', () => {
    expect(styleConstraint('  pr2 ')!.kind).toBe('style');
  });
  it('returnerar null för okänd/saknad kod (odaterad)', () => {
    expect(styleConstraint(null)).toBeNull();
    expect(styleConstraint('')).toBeNull();
    expect(styleConstraint('Frobnicate')).toBeNull();
  });
});
```

- [ ] **Step 2: Kör testerna, verifiera FAIL**

Run: `npx vitest run src/domain/dating/graslundPhases.test.ts`
Expected: FAIL (import-fel).

- [ ] **Step 3: Implementera modulen**

```typescript
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
```

- [ ] **Step 4: Kör testerna, verifiera PASS**

Run: `npx vitest run src/domain/dating/graslundPhases.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/domain/dating/graslundPhases.ts src/domain/dating/graslundPhases.test.ts
git commit -m "feat(dating): Gräslund-faser som mjuka överlappande kuvert (källbelagda)"
```

---

### Task 4: Ristarfönster-härledning

**Files:**
- Create: `src/domain/dating/carverWindow.ts`
- Test: `src/domain/dating/carverWindow.test.ts`

**Interfaces:**
- Consumes: `YearInterval`, `DatingConstraint` (Task 1).
- Produces: `carverWindow(input: CarverWindowInput): DatingConstraint | null` och typen `CarverWindowInput`.

**Bakgrund (spec §5):** En ristares hela produktion ligger inom ett aktivt fönster ≤ ~50 år (aktiv ~30–70, livslängd ≤ ~90). Om `floruit` (från `carvers.period_active_start/end`) finns används det direkt. Annars härleds fönstret ur ristarens daterade stenars intervall — men klipps till max 50 år runt medianen så det inte blir orimligt brett. Konfidens: `medium` vid explicit floruit, `low` vid härlett.

- [ ] **Step 1: Skriv de fallerande testerna**

```typescript
// src/domain/dating/carverWindow.test.ts
import { describe, it, expect } from 'vitest';
import { carverWindow } from './carverWindow';

describe('carverWindow', () => {
  it('använder explicit floruit när det finns', () => {
    const c = carverWindow({ floruitStart: 1010, floruitEnd: 1050, stoneMidpoints: [1200] })!;
    expect(c.interval).toEqual({ from: 1010, to: 1050 });
    expect(c.confidence).toBe('medium');
    expect(c.kind).toBe('carver');
    expect(c.isLinguistic).toBe(false);
  });
  it('härleder fönster ur stenarnas mittpunkter när floruit saknas', () => {
    const c = carverWindow({ stoneMidpoints: [1020, 1035, 1050] })!;
    expect(c.interval.from).toBeLessThanOrEqual(1020);
    expect(c.interval.to).toBeGreaterThanOrEqual(1050);
    expect(c.confidence).toBe('low');
  });
  it('klipper ett orimligt brett härlett fönster till max 50 år', () => {
    const c = carverWindow({ stoneMidpoints: [980, 1130] })!;
    expect(c.interval.to - c.interval.from).toBeLessThanOrEqual(50);
  });
  it('returnerar null utan både floruit och stenar', () => {
    expect(carverWindow({ stoneMidpoints: [] })).toBeNull();
    expect(carverWindow({})).toBeNull();
  });
});
```

- [ ] **Step 2: Kör testerna, verifiera FAIL**

Run: `npx vitest run src/domain/dating/carverWindow.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implementera modulen**

```typescript
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
```

- [ ] **Step 4: Kör testerna, verifiera PASS**

Run: `npx vitest run src/domain/dating/carverWindow.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/domain/dating/carverWindow.ts src/domain/dating/carverWindow.test.ts
git commit -m "feat(dating): ristarfönster-härledning (floruit el. klippt ur stenmittpunkter)"
```

---

### Task 5: Villkorsgrafen (snitt + läges-filter + relations-propagering)

**Files:**
- Create: `src/domain/dating/refineGraph.ts`
- Test: `src/domain/dating/refineGraph.test.ts`

**Interfaces:**
- Consumes: `intersect`, `width`, `minConfidence` (Task 2); typerna från Task 1.
- Produces: `refineNode(constraints, mode): { interval, confidence, conflict, provenance }`, `refineGraph(nodes, edges, mode): Map<string, RefinedDating>`, samt typerna `GraphNode`, `BeforeEdge`.

**Bakgrund (spec §5):** Per nod = snittet av dess villkor (filtrerade efter läge). Tomt snitt → bredaste kuvertet + `conflict:true`. Relations-kanter (`A före B`) propagerar: B:s undre gräns kan inte vara tidigare än A:s. MVP: en propageringsomgång (edges är få tills kurering finns); dokumentera att fixpunkt-iteration är en senare utbyggnad.

- [ ] **Step 1: Skriv de fallerande testerna**

```typescript
// src/domain/dating/refineGraph.test.ts
import { describe, it, expect } from 'vitest';
import { refineNode, refineGraph } from './refineGraph';
import type { DatingConstraint } from './refinementTypes';

const style = (from: number, to: number): DatingConstraint =>
  ({ kind: 'style', interval: { from, to }, confidence: 'medium', isLinguistic: false, isAbsolute: false, source: 'S' });
const carver = (from: number, to: number): DatingConstraint =>
  ({ kind: 'carver', interval: { from, to }, confidence: 'medium', isLinguistic: false, isAbsolute: false, source: 'C' });
const lingformula = (from: number, to: number): DatingConstraint =>
  ({ kind: 'event', interval: { from, to }, confidence: 'high', isLinguistic: true, isAbsolute: false, source: 'L' });

describe('refineNode', () => {
  it('snittar villkor och sänker konfidens till svagaste', () => {
    const r = refineNode([style(980, 1070), carver(1010, 1040)], 'all');
    expect(r.interval).toEqual({ from: 1010, to: 1040 });
    expect(r.conflict).toBe(false);
    expect(r.provenance).toHaveLength(2);
  });
  it('flaggar konflikt och behåller bredaste kuvertet vid tomt snitt', () => {
    const r = refineNode([style(980, 1000), carver(1050, 1100)], 'all');
    expect(r.conflict).toBe(true);
    expect(r.interval).toEqual({ from: 980, to: 1100 });
  });
  it('non_linguistic-läget exkluderar språkliga villkor', () => {
    const r = refineNode([style(980, 1070), lingformula(1041, 1041)], 'non_linguistic');
    expect(r.interval).toEqual({ from: 980, to: 1070 }); // språkformeln ignorerad
  });
  it('all-läget inkluderar språkliga villkor', () => {
    const r = refineNode([style(980, 1070), lingformula(1041, 1041)], 'all');
    expect(r.interval).toEqual({ from: 1041, to: 1041 });
  });
  it('returnerar null-intervall när inga villkor gäller i läget', () => {
    const r = refineNode([lingformula(1041, 1041)], 'non_linguistic');
    expect(r.interval).toBeNull();
  });
});

describe('refineGraph', () => {
  it('propagerar en "före"-kant: lärlingen kan inte börja före mästaren', () => {
    const nodes = [
      { id: 'master', constraints: [style(980, 1015)] },
      { id: 'apprentice', constraints: [style(980, 1070)] },
    ];
    const edges = [{ before: 'master', after: 'apprentice' }];
    const out = refineGraph(nodes, edges, 'all');
    // lärlingens undre gräns lyfts till mästarens undre gräns
    expect(out.get('apprentice')!.interval.from).toBeGreaterThanOrEqual(980);
    expect(out.get('apprentice')!.provenance.some((p) => p.source.includes('före'))).toBe(true);
  });
});
```

- [ ] **Step 2: Kör testerna, verifiera FAIL**

Run: `npx vitest run src/domain/dating/refineGraph.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implementera modulen**

```typescript
// src/domain/dating/refineGraph.ts
import type {
  DatingConstraint, RefineMode, RefinedDating, Provenance, YearInterval, ConfidenceClass,
} from './refinementTypes';
import { intersect, width, minConfidence } from './interval';

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
  // Konflikt: behåll det bredaste ingående kuvertet, flagga.
  const widest = active.reduce((w, c) => (width(c.interval) > width(w.interval) ? c : w), active[0]);
  return { interval: widest.interval, confidence: 'low', conflict: true, provenance };
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
    if (after.interval.from < before.interval.from) {
      const lifted = Math.min(before.interval.from, after.interval.to);
      after.interval = { from: lifted, to: after.interval.to };
      after.confidence = minConfidence(after.confidence, before.confidence);
      after.provenance = [
        ...after.provenance,
        { kind: 'terminus', source: `före ${e.before}`, interval: before.interval },
      ];
    }
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
```

- [ ] **Step 4: Kör testerna, verifiera PASS**

Run: `npx vitest run src/domain/dating/refineGraph.test.ts`
Expected: PASS (6 tester).

- [ ] **Step 5: Commit**

```bash
git add src/domain/dating/refineGraph.ts src/domain/dating/refineGraph.test.ts
git commit -m "feat(dating): villkorsgraf — snitt, läges-filter (cirkularitetsvägg), före-propagering"
```

---

### Task 6: Adapter DB-rad → motor-indata

**Files:**
- Create: `src/domain/dating/assembleConstraints.ts`
- Test: `src/domain/dating/assembleConstraints.test.ts`

**Interfaces:**
- Consumes: `styleConstraint` (Task 3), `carverWindow` (Task 4), typerna från Task 1, `GraphNode` (Task 5).
- Produces: `assembleNode(row: InscriptionRow): GraphNode` och typen `InscriptionRow`.

**Bakgrund (spec §8):** Mappar dagens DB-form till villkor. `style_group` → `styleConstraint`. `period_start/end` → ett brett `style`-kuvert om det finns men style_group saknas (fallback). Ristarens floruit + stenmittpunkter → `carverWindow`. `dating_methods.gives_absolute` → `absolute`-villkor. Rena data in, inga DB-anrop här (testbart).

- [ ] **Step 1: Skriv de fallerande testerna**

```typescript
// src/domain/dating/assembleConstraints.test.ts
import { describe, it, expect } from 'vitest';
import { assembleNode } from './assembleConstraints';

describe('assembleNode', () => {
  it('bygger style-villkor ur style_group', () => {
    const node = assembleNode({ id: 'U344', styleGroup: 'Pr3' });
    expect(node.id).toBe('U344');
    expect(node.constraints.some((c) => c.kind === 'style')).toBe(true);
  });
  it('faller tillbaka på period_start/end när style_group saknas', () => {
    const node = assembleNode({ id: 'X', styleGroup: null, periodStart: 800, periodEnd: 1050 });
    const s = node.constraints.find((c) => c.kind === 'style')!;
    expect(s.interval).toEqual({ from: 800, to: 1050 });
    expect(s.confidence).toBe('low'); // rått brett kuvert = låg konfidens
  });
  it('lägger till ristarfönster ur floruit', () => {
    const node = assembleNode({ id: 'Y', carverFloruitStart: 1010, carverFloruitEnd: 1050 });
    expect(node.constraints.some((c) => c.kind === 'carver')).toBe(true);
  });
  it('lägger till absolut ankare när gives_absolute', () => {
    const node = assembleNode({ id: 'Z', absoluteFrom: 1041, absoluteTo: 1041, absoluteSource: 'Ingvarståget' });
    const a = node.constraints.find((c) => c.kind === 'absolute')!;
    expect(a.isAbsolute).toBe(true);
    expect(a.confidence).toBe('high');
  });
  it('ger tom villkorslista för helt odaterad sten', () => {
    expect(assembleNode({ id: 'Q' }).constraints).toEqual([]);
  });
});
```

- [ ] **Step 2: Kör testerna, verifiera FAIL**

Run: `npx vitest run src/domain/dating/assembleConstraints.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implementera modulen**

```typescript
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
```

- [ ] **Step 4: Kör testerna, verifiera PASS**

Run: `npx vitest run src/domain/dating/assembleConstraints.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/domain/dating/assembleConstraints.ts src/domain/dating/assembleConstraints.test.ts
git commit -m "feat(dating): adapter DB-rad → grafnod (style/period/carver/absolut)"
```

---

### Task 7: Tabell `refined_datings` (migration + RLS)

**Files:**
- Create: `supabase/migrations/20260724210000_refined_datings.sql`

**Interfaces:**
- Produces: tabell `refined_datings(inscription_id uuid, mode text, refined_from int, refined_to int, confidence text, conflict bool, provenance jsonb, computed_at timestamptz)`, unik på `(inscription_id, mode)`. Publik läsning; skrivning endast admin (mönster: befintliga RLS-policyer).

- [ ] **Step 1: Skriv migrationen**

```sql
-- supabase/migrations/20260724210000_refined_datings.sql
-- DP1: materialiserade förfinade dateringar per inskrift och läge (all / non_linguistic).
-- Beräknas av scripts/data/materialize-refined-datings.mjs ur src/domain/dating-motorn.

create table if not exists public.refined_datings (
  inscription_id uuid not null references public.runic_inscriptions(id) on delete cascade,
  mode           text not null check (mode in ('all', 'non_linguistic')),
  refined_from   integer,
  refined_to     integer,
  confidence     text not null check (confidence in ('high', 'medium', 'low')),
  conflict       boolean not null default false,
  provenance     jsonb not null default '[]'::jsonb,
  computed_at    timestamptz not null default now(),
  primary key (inscription_id, mode)
);

create index if not exists refined_datings_mode_idx on public.refined_datings (mode);
create index if not exists refined_datings_range_idx on public.refined_datings (refined_from, refined_to);

alter table public.refined_datings enable row level security;

-- Publik läsning (samma mönster som övriga läsbara tabeller).
create policy "refined_datings_read" on public.refined_datings
  for select using (true);

-- Skrivning endast admin.
create policy "refined_datings_admin_write" on public.refined_datings
  for all using (public.is_admin()) with check (public.is_admin());
```

- [ ] **Step 2: Verifiera SQL-syntax lokalt (torr parsning)**

Run: `node -e "const fs=require('fs');const s=fs.readFileSync('supabase/migrations/20260724210000_refined_datings.sql','utf8');if(!/create table/i.test(s)||!/enable row level security/i.test(s))throw new Error('migration ofullständig');console.log('OK: migration innehåller tabell + RLS')"`
Expected: `OK: migration innehåller tabell + RLS`

- [ ] **Step 3: Applicera mot live-DB via pooler-psql**

Följ minnesnoten *psql-prod migrations-referens*: applicera via pooler-psql (INTE `db push`), och regenerera typer via `--linked`. Kör (Daniel/behörig, med `$DATABASE_URL` satt):

Run: `psql "$DATABASE_URL" -f supabase/migrations/20260724210000_refined_datings.sql`
Expected: `CREATE TABLE` … `CREATE POLICY` utan fel.

- [ ] **Step 4: Regenerera Supabase-typer**

Run: `npx supabase gen types typescript --linked > src/integrations/supabase/types.ts`
Expected: diff som lägger till `refined_datings` i `types.ts`. Verifiera: `git diff --stat src/integrations/supabase/types.ts` visar ändring.

- [ ] **Step 5: Commit**

```bash
git add supabase/migrations/20260724210000_refined_datings.sql src/integrations/supabase/types.ts
git commit -m "feat(dating): refined_datings-tabell (RLS: publik läsning, admin-skrivning) + types"
```

---

### Task 8: Batch-materialisering

**Files:**
- Create: `scripts/data/materialize-refined-datings.mjs`

**Interfaces:**
- Consumes: `assembleNode` (Task 6), `refineGraph` (Task 5), tabellen (Task 7).
- Produces: rader i `refined_datings` för båda lägena.

**Bakgrund:** Grafpropageringen är global → görs som batch, inte per request. Skriptet hämtar inskrifter (id, style_group, period_start/end) + ristar-floruit + ev. absoluta ankare, bygger noder, kör `refineGraph` i BÅDA lägena, och upsertar. Följer `scripts/data/*.mjs`-mönstret (`@supabase/supabase-js`, service-role-nyckel ur env).

- [ ] **Step 1: Skriv skriptet**

```javascript
// scripts/data/materialize-refined-datings.mjs
// Kör: node scripts/data/materialize-refined-datings.mjs
// Kräver SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY i env.
import { createClient } from '@supabase/supabase-js';
import { assembleNode } from '../../src/domain/dating/assembleConstraints.ts';
import { refineGraph } from '../../src/domain/dating/refineGraph.ts';

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) { console.error('Saknar SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY'); process.exit(1); }
const db = createClient(url, key);

async function fetchInscriptions() {
  const rows = [];
  const PAGE = 1000;
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await db
      .from('runic_inscriptions')
      .select('id, style_group, period_start, period_end')
      .range(from, from + PAGE - 1);
    if (error) throw error;
    rows.push(...data);
    if (data.length < PAGE) break;
  }
  return rows;
}

async function main() {
  const inscriptions = await fetchInscriptions();
  console.log(`Hämtade ${inscriptions.length} inskrifter`);

  // MVP: style/period + (framtida) carver/absolut fylls på när de kopplas in.
  const nodes = inscriptions.map((r) =>
    assembleNode({ id: r.id, styleGroup: r.style_group, periodStart: r.period_start, periodEnd: r.period_end }),
  );
  const edges = []; // relations-kanter läggs till när ristar-relationer kurerats (spec §8)

  const upserts = [];
  for (const mode of ['all', 'non_linguistic']) {
    const out = refineGraph(nodes, edges, mode);
    for (const [id, r] of out) {
      const hasInterval = Number.isFinite(r.interval.from) && Number.isFinite(r.interval.to);
      upserts.push({
        inscription_id: id,
        mode,
        refined_from: hasInterval ? r.interval.from : null,
        refined_to: hasInterval ? r.interval.to : null,
        confidence: r.confidence,
        conflict: r.conflict,
        provenance: r.provenance,
      });
    }
  }

  const CHUNK = 500;
  for (let i = 0; i < upserts.length; i += CHUNK) {
    const { error } = await db.from('refined_datings').upsert(upserts.slice(i, i + CHUNK), {
      onConflict: 'inscription_id,mode',
    });
    if (error) throw error;
    console.log(`Upsertade ${Math.min(i + CHUNK, upserts.length)} / ${upserts.length}`);
  }
  console.log('Klart.');
}

main().catch((e) => { console.error(e); process.exit(1); });
```

- [ ] **Step 2: Torrkör mot typer (kompilering av importerade moduler)**

Run: `npx vitest run src/domain/dating/` 
Expected: PASS — bekräftar att motorn skriptet importerar är grön (skriptet självt körs mot live-DB separat i steg 3).

- [ ] **Step 3: Kör materialiseringen (behörig, env satt)**

Run: `node scripts/data/materialize-refined-datings.mjs`
Expected: loggar `Hämtade N inskrifter` … `Upsertade … / …` … `Klart.` utan fel.

- [ ] **Step 4: Commit**

```bash
git add scripts/data/materialize-refined-datings.mjs
git commit -m "feat(dating): batch-materialisering av refined_datings (båda lägena)"
```

---

### Task 9: Läs-hook + verifiering av täckning

**Files:**
- Create: `src/hooks/useRefinedDating.ts`
- Test: `src/hooks/useRefinedDating.test.ts`

**Interfaces:**
- Consumes: `refined_datings`-tabellen (Task 7), Supabase-klient (`@/integrations/supabase/client`).
- Produces: `useRefinedDatings(mode?: 'all' | 'non_linguistic')` (React Query-hook) + ren hjälpare `pickInterval(rows, id, mode)` som är enhetstestbar.

- [ ] **Step 1: Skriv det fallerande testet för den rena hjälparen**

```typescript
// src/hooks/useRefinedDating.test.ts
import { describe, it, expect } from 'vitest';
import { pickInterval } from './useRefinedDating';

const rows = [
  { inscription_id: 'A', mode: 'all', refined_from: 1010, refined_to: 1040, confidence: 'medium', conflict: false, provenance: [] },
  { inscription_id: 'A', mode: 'non_linguistic', refined_from: 980, refined_to: 1070, confidence: 'low', conflict: false, provenance: [] },
];

describe('pickInterval', () => {
  it('väljer rätt rad per id och läge', () => {
    expect(pickInterval(rows, 'A', 'all')).toEqual({ from: 1010, to: 1040 });
    expect(pickInterval(rows, 'A', 'non_linguistic')).toEqual({ from: 980, to: 1070 });
  });
  it('returnerar null för okänt id', () => {
    expect(pickInterval(rows, 'ZZZ', 'all')).toBeNull();
  });
});
```

- [ ] **Step 2: Kör testet, verifiera FAIL**

Run: `npx vitest run src/hooks/useRefinedDating.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implementera hook + hjälpare**

```typescript
// src/hooks/useRefinedDating.ts
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { YearInterval, RefineMode } from '@/domain/dating/refinementTypes';

export interface RefinedRow {
  inscription_id: string;
  mode: RefineMode;
  refined_from: number | null;
  refined_to: number | null;
  confidence: 'high' | 'medium' | 'low';
  conflict: boolean;
  provenance: unknown;
}

/** Ren hjälpare: plocka intervallet för ett id+läge ur en radlista. Testbar utan DB. */
export const pickInterval = (rows: RefinedRow[], id: string, mode: RefineMode): YearInterval | null => {
  const r = rows.find((x) => x.inscription_id === id && x.mode === mode);
  if (!r || r.refined_from == null || r.refined_to == null) return null;
  return { from: r.refined_from, to: r.refined_to };
};

/** Hämta alla förfinade dateringar för ett läge (default 'all'). */
export const useRefinedDatings = (mode: RefineMode = 'all') =>
  useQuery({
    queryKey: ['refined-datings', mode],
    queryFn: async (): Promise<RefinedRow[]> => {
      const { data, error } = await supabase
        .from('refined_datings')
        .select('inscription_id, mode, refined_from, refined_to, confidence, conflict, provenance')
        .eq('mode', mode);
      if (error) throw error;
      return (data ?? []) as RefinedRow[];
    },
    staleTime: 5 * 60 * 1000,
  });
```

- [ ] **Step 4: Kör testet + typecheck, verifiera PASS**

Run: `npx vitest run src/hooks/useRefinedDating.test.ts && npx tsc --noEmit`
Expected: PASS + inga typfel.

- [ ] **Step 5: Verifiera täckning mot live-DB (rapport, ej assertion)**

Kör mot live-DB (behörig): räkna hur många inskrifter som fått ett *snävare* `all`-intervall än det råa kuvertet, och fördelningen som klarar <300-årsgrinden i `non_linguistic`. Detta är spec §8:s kvarvarande mätning.

Run: `psql "$DATABASE_URL" -c "select mode, count(*) filter (where refined_to - refined_from < 300) as under_300, count(*) as total from refined_datings group by mode;"`
Expected: en tabell med antal per läge — dokumentera siffrorna i designdokets §8 (ersätt 'kvarstår att mäta').

- [ ] **Step 6: Commit**

```bash
git add src/hooks/useRefinedDating.ts src/hooks/useRefinedDating.test.ts
git commit -m "feat(dating): useRefinedDatings-hook + pickInterval (testad) + täckningsmätning"
```

---

### Task 10: Gräslund-kalibrering (invariant-test)

**Files:**
- Create: `src/domain/dating/calibration.test.ts`

**Interfaces:**
- Consumes: `styleConstraint` (Task 3), `refineNode` (Task 5), `carverWindow` (Task 4).

**Bakgrund (spec §2 princip 7):** Systemet kalibreras först mot Gräslund. Detta test låser invarianten: (a) en sten med enbart stildatering återger *exakt* Gräslund-fasens intervall, (b) ett smalare icke-motstridigt villkor förfinar *inom* fasen (avvikelse = snävning, inte motsägelse), (c) ett motstridigt villkor sätter `conflict:true` — motorn åsidosätter aldrig tyst Gräslund. Fasen finns kvar i proveniensen som overlay-lager.

- [ ] **Step 1: Skriv kalibreringstesterna**

```typescript
// src/domain/dating/calibration.test.ts
import { describe, it, expect } from 'vitest';
import { styleConstraint } from './graslundPhases';
import { carverWindow } from './carverWindow';
import { refineNode } from './refineGraph';

const PHASES = ['RAK', 'Fp', 'Pr1', 'Pr2', 'Pr3', 'Pr4', 'Pr5'];

describe('Gräslund-kalibrering', () => {
  it('återger exakt Gräslund-intervallet för en sten med enbart stildatering', () => {
    for (const phase of PHASES) {
      const s = styleConstraint(phase)!;
      const r = refineNode([s], 'all');
      expect(r.interval).toEqual(s.interval);
      expect(r.conflict).toBe(false);
      // fasen finns kvar i proveniensen som overlay-lager
      expect(r.provenance.some((p) => p.kind === 'style' && p.source.startsWith('Gräslund'))).toBe(true);
    }
  });

  it('förfinar INOM fasen när ett smalare icke-motstridigt villkor läggs till', () => {
    const s = styleConstraint('Pr3')!;                 // {1045,1075}
    const c = carverWindow({ floruitStart: 1050, floruitEnd: 1065 })!;
    const r = refineNode([s, c], 'all');
    expect(r.interval).toEqual({ from: 1050, to: 1065 });
    expect(r.interval!.from).toBeGreaterThanOrEqual(s.interval.from);
    expect(r.interval!.to).toBeLessThanOrEqual(s.interval.to);
    expect(r.conflict).toBe(false);
  });

  it('åsidosätter aldrig tyst Gräslund: motstridigt villkor flaggas', () => {
    const s = styleConstraint('RAK')!;                 // {980,1015}
    const c = carverWindow({ floruitStart: 1060, floruitEnd: 1090 })!;
    const r = refineNode([s, c], 'all');
    expect(r.conflict).toBe(true);
  });
});
```

- [ ] **Step 2: Kör testerna, verifiera PASS**

Run: `npx vitest run src/domain/dating/calibration.test.ts`
Expected: PASS (bygger bara på redan implementerade moduler — grön direkt om Task 3–5 stämmer; röd = kalibreringsbrott att åtgärda).

- [ ] **Step 3: Commit**

```bash
git add src/domain/dating/calibration.test.ts
git commit -m "test(dating): Gräslund-kalibrering — reproducerar fas, förfinar inom, flaggar konflikt"
```

**Live-kalibreringsrapport (behörig, efter Task 8):** komplettera Task 9 steg 5 med fördelningen refinement-vinst vs Gräslund-baslinje och antal konflikter:

Run: `psql "$DATABASE_URL" -c "select confidence, count(*) filter (where conflict) as konflikter, count(*) as total from refined_datings where mode='all' group by confidence;"`
Expected: en tabell; ett fåtal konflikter förväntas (och ska granskas), inte en majoritet — annars är ett villkor felkalibrerat.

---

## Self-Review

**1. Spec coverage (mot §5 nav + §8 datagrund + §10 byggordning):**
- Snitt av villkor → Task 5. ✓
- Ristarfönster (floruit/härlett) → Task 4. ✓
- Stilkuvert mjukt/överlappande + källbelagt → Task 3. ✓
- Absolut ankare (`dating_methods.gives_absolute`) → modelleras som `absolute`-villkor i Task 6 (skriptets ankar-hämtning kopplas in när `dating`-tabellen läses; MVP-skriptet i Task 8 fyller style/period, ankare/carver är förberedda i adaptern).
- Cirkularitetsvägg (all vs non_linguistic) → Task 5 + Task 7 (båda materialiseras) + Task 9 (läsning per läge). ✓
- Konfidensklasser, inga siffror → genomgående (`ConfidenceClass`). ✓
- Proveniens → `provenance` genom Task 5/7/8. ✓
- Konflikt behåller bredaste kuvert → Task 5. ✓
- Materialisering (global graf som batch) → Task 8. ✓
- Täckningsmätning (spec §8 kvarstående) → Task 9 steg 5. ✓
- Gräslund-kalibrering (spec §2 princip 7 — reproducera fas, förfina inom, flagga konflikt, fas som overlay i proveniens) → Task 10. ✓
- **Gap noterat:** relations-kanter (mästar/förebild/samarbete) — motorn stödjer dem (Task 5 `BeforeEdge`) men `edges=[]` i MVP tills ristar-relationer kurerats (spec §8: fritextnamn → `relationship`-kanter). Detta är medvetet YAGNI; en separat kureringsuppgift, ej del av DP1-MVP. UI-inkoppling i tidslinje/carvers är avsiktligt NÄSTA plan (DP1 levererar motorn + materialiserad data + hook; visning är eget, testbart steg).

**2. Placeholder-scan:** Inga TBD/TODO. All kod komplett; kommandon konkreta.

**3. Typkonsistens:** `YearInterval`, `DatingConstraint`, `ConfidenceClass`, `RefineMode`, `GraphNode`, `BeforeEdge`, `RefinedDating` används identiskt i Task 1→9. `refineGraph`/`refineNode`/`assembleNode`/`carverWindow`/`styleConstraint`/`intersect`/`minConfidence`/`pickInterval` — samma namn genomgående.

---

## Öppna beroenden (behörighet/data — inte kod)

- Task 7 steg 3–4, Task 8 steg 3, Task 9 steg 5 kräver live-DB-behörighet (pooler-psql + service-role). Ren-logik-tasksen (1–6, 9 steg 1–4) kräver ingen DB och kan köras/granskas helt lokalt.
- Ristar-floruit + absoluta ankare hämtas i skriptet först när `carvers`/`dating`-läsningen kopplas in (adaptern är redan förberedd). MVP-materialiseringen körs på style/period för att bevisa hela kedjan end-to-end.
