# Kulturmiljö-navigator Fas 1 · Plan 2: Korridor-zoner + hastighetsgrindning (frontend-only)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Dela upp den befintliga rutt-korridoren i zoner (närzon / synfältszon) och grinda vad som visas efter körhastighet — helt klientsidigt, ovanpå den data `useNearbyAlongRoute` redan ger.

**Architecture:** Rena, testbara funktioner (`navCorridor.ts`) ovanpå `AlongRouteFeature[]` från `useNearbyAlongRoute`; wiring i `NearMeControl` bil-lägets "Sevärt längs vägen"-lista. INGEN RPC-ändring, INGEN migration (undviker krock med pågående ocommittade DB-migrationer i arbetsträdet).

**Tech Stack:** React 18 + TS, Vitest, Leaflet (oförändrad).

## Global Constraints

- **Frontend-only.** Rör INTE `supabase/migrations/**`, RPC:er eller DB. Om en task verkar kräva DB-ändring → STOPP, rapportera BLOCKED.
- **Lagren ÄR källan.** Zon/hastighet är filter ovanpå de påslagna lagren; ingen ny datakälla.
- **Bygg på befintligt:** `useNearbyAlongRoute` → `AlongRouteFeature { feature_type, feature_id, label, lat, lng, detour_km, frac_along, significance, score, rank_reason }`; hastighet ur `useFieldNav().pos.speed` (m/s, kan vara null); billäge via `useDrivingMode`.
- **Svenska** i synlig text.
- **Icke-brytande:** befintlig korridor-lista måste fungera även utan position/hastighet (fallback = visa allt, en enda grupp).
- Stage endast task-filer (arbetsträdet har orelaterat ocommittat arbete) — aldrig `git add -A`.
- Test: `npx vitest run <fil>`; före commit `npx tsc --noEmit -p tsconfig.json`.

---

### Task 1: Zon-indelning av korridoren (ren funktion)

**Files:**
- Create: `src/utils/navCorridor.ts`
- Test: `src/utils/navCorridor.test.ts`

**Interfaces:**
- Consumes: `AlongRouteFeature` from `@/hooks/useRoadtrip` (redan exporterad därifrån).
- Produces:
  - `export type CorridorZone = 'near' | 'sight'`
  - `export interface ZonedCorridor { near: AlongRouteFeature[]; sight: AlongRouteFeature[] }`
  - `export function zoneOf(detourKm: number): CorridorZone`  (near ≤ 0.1 km; annars sight)
  - `export function bucketCorridor(features: AlongRouteFeature[]): ZonedCorridor` (behåller inbördes ordning per zon efter `frac_along`)

- [ ] **Step 1: Write the failing test**

```ts
// src/utils/navCorridor.test.ts
import { describe, it, expect } from 'vitest';
import { zoneOf, bucketCorridor } from './navCorridor';
import type { AlongRouteFeature } from '@/hooks/useRoadtrip';

const f = (id: string, detour_km: number, frac_along: number): AlongRouteFeature => ({
  feature_type: 'runestone', feature_id: id, label: id, lat: 0, lng: 0,
  detour_km, frac_along, significance: 1, score: 1, rank_reason: '',
});

describe('zoneOf', () => {
  it('classifies <=100 m as near, beyond as sight', () => {
    expect(zoneOf(0)).toBe('near');
    expect(zoneOf(0.1)).toBe('near');
    expect(zoneOf(0.1001)).toBe('sight');
    expect(zoneOf(1.5)).toBe('sight');
  });
});

describe('bucketCorridor', () => {
  it('splits features into near/sight and orders each by frac_along', () => {
    const out = bucketCorridor([f('a', 0.05, 0.9), f('b', 1.2, 0.2), f('c', 0.02, 0.1), f('d', 0.5, 0.5)]);
    expect(out.near.map((x) => x.feature_id)).toEqual(['c', 'a']); // 0.1 then 0.9 frac
    expect(out.sight.map((x) => x.feature_id)).toEqual(['b', 'd']); // 0.2 then 0.5 frac
  });
  it('handles an empty list', () => {
    expect(bucketCorridor([])).toEqual({ near: [], sight: [] });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/utils/navCorridor.test.ts`
Expected: FAIL — module/functions undefined.

- [ ] **Step 3: Implement `src/utils/navCorridor.ts`**

```ts
import type { AlongRouteFeature } from '@/hooks/useRoadtrip';

export type CorridorZone = 'near' | 'sight';
export interface ZonedCorridor { near: AlongRouteFeature[]; sight: AlongRouteFeature[] }

// Närzon = det man passerar precis (≤100 m från vägen); synfältszon = längre bort men längs vägen.
// Riktningszon (centralorter) hanteras separat (Plan 3), inte här.
const NEAR_KM = 0.1;

export function zoneOf(detourKm: number): CorridorZone {
  return detourKm <= NEAR_KM ? 'near' : 'sight';
}

export function bucketCorridor(features: AlongRouteFeature[]): ZonedCorridor {
  const near: AlongRouteFeature[] = [];
  const sight: AlongRouteFeature[] = [];
  for (const f of features) (zoneOf(f.detour_km) === 'near' ? near : sight).push(f);
  const byFrac = (a: AlongRouteFeature, b: AlongRouteFeature) => a.frac_along - b.frac_along;
  near.sort(byFrac);
  sight.sort(byFrac);
  return { near, sight };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/utils/navCorridor.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/utils/navCorridor.ts src/utils/navCorridor.test.ts
git commit -m "feat(navigator): corridor zone bucketing (near/sight) — pure"
```

---

### Task 2: Hastighetsgrindning + zonad rendering i billäget

**Files:**
- Modify: `src/utils/navCorridor.ts` (lägg till hastighetsfilter)
- Modify: `src/utils/navCorridor.test.ts` (test för filtret)
- Modify: `src/components/overlay/NearMeControl.tsx` (rendera zonat + hastighetsgrindat)

**Interfaces:**
- Consumes: `bucketCorridor`/`ZonedCorridor` (Task 1), `AlongRouteFeature`, `useFieldNav`.
- Produces:
  - `export function minSignificanceForSpeed(speedMps: number | null): number` — högre fart → högre tröskel (110 km/h ≈ 30 m/s visar bara toppen; stillastående visar allt).
  - `export function gateBySpeed(features: AlongRouteFeature[], speedMps: number | null): AlongRouteFeature[]`

- [ ] **Step 1: Write the failing test (append)**

```ts
// append to src/utils/navCorridor.test.ts
import { minSignificanceForSpeed, gateBySpeed } from './navCorridor';

describe('minSignificanceForSpeed', () => {
  it('rises with speed; null/står still shows everything (threshold 0)', () => {
    expect(minSignificanceForSpeed(null)).toBe(0);
    expect(minSignificanceForSpeed(0)).toBe(0);
    const slow = minSignificanceForSpeed(8);   // ~30 km/h
    const fast = minSignificanceForSpeed(30);  // ~108 km/h
    expect(fast).toBeGreaterThan(slow);
  });
});

describe('gateBySpeed', () => {
  it('drops features below the speed-derived significance threshold', () => {
    const hi = f('hi', 0.05, 0.1); hi.significance = 5;
    const lo = f('lo', 0.05, 0.2); lo.significance = 1;
    const kept = gateBySpeed([hi, lo], 30); // fast → only high significance
    expect(kept.map((x) => x.feature_id)).toContain('hi');
    expect(kept.map((x) => x.feature_id)).not.toContain('lo');
    expect(gateBySpeed([hi, lo], null)).toHaveLength(2); // still → keep all
  });
});
```

(Reuse the `f` helper already defined at the top of the file.)

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/utils/navCorridor.test.ts`
Expected: FAIL — `minSignificanceForSpeed`/`gateBySpeed` undefined.

- [ ] **Step 3: Implement the speed gate in `navCorridor.ts`**

```ts
// append to src/utils/navCorridor.ts
// Hastighet → minsta signifikans som visas. Stillastående/okänd = 0 (visa allt).
// Linjär upptrappning upp till motorvägsfart (~30 m/s ≈ 108 km/h → tröskel 4).
export function minSignificanceForSpeed(speedMps: number | null): number {
  if (speedMps == null || speedMps <= 0) return 0;
  const capped = Math.min(speedMps, 30);
  return (capped / 30) * 4;
}

export function gateBySpeed(features: AlongRouteFeature[], speedMps: number | null): AlongRouteFeature[] {
  const min = minSignificanceForSpeed(speedMps);
  if (min <= 0) return features;
  return features.filter((f) => f.significance >= min);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/utils/navCorridor.test.ts`
Expected: PASS (all).

- [ ] **Step 5: Wire zoned + speed-gated rendering into `NearMeControl`**

In `src/components/overlay/NearMeControl.tsx`, the car-mode "Sevärt längs vägen" section currently renders a flat `corridorList` (sorted by `frac_along`). Replace that flat list with a speed-gated, zoned rendering:

- Import at top: `import { bucketCorridor, gateBySpeed } from '@/utils/navCorridor';` and `import { useFieldNav } from '@/hooks/useFieldNav';`
- Near the other hooks, read speed: `const { pos: fieldPos } = useFieldNav();`
- Replace the `corridorList` derivation with:
  ```tsx
  const zoned = bucketCorridor(gateBySpeed(corridorData ?? [], fieldPos?.speed ?? null));
  ```
- Render two labelled sub-groups (keep the existing item button/markup for each row — same `flyToAlong`, same label logic). Group headers in Swedish: **"Precis här (≤100 m)"** for `zoned.near` and **"Längs vägen"** for `zoned.sight`. Only render a header when its array is non-empty. If both are empty, render nothing (as today).
- Keep the existing `flyToAlong`, `heritageName`, `capFirst` helpers.

Follow the existing list markup exactly for each row so styling is unchanged — only the grouping and the speed-gate are new.

- [ ] **Step 6: Typecheck + focused test + manual smoke**

Run: `npx tsc --noEmit -p tsconfig.json` → no errors.
Run: `npx vitest run src/utils/navCorridor.test.ts` → pass.
Manual (dev): billäge + rutt → the corridor list now shows two labelled groups; at speed (or simulated), low-significance items drop out.

- [ ] **Step 7: Commit**

```bash
git add src/utils/navCorridor.ts src/utils/navCorridor.test.ts src/components/overlay/NearMeControl.tsx
git commit -m "feat(navigator): zone + speed-gate the along-route corridor in driving mode"
```

---

## Self-review (utförd)

- **Spec-täckning:** Fas 1-spec:ens "tre korridor-zoner" (närzon/synfält; riktningszon = Plan 3) + "hastighetsgrindning" täcks. Synlighetsviktning (DEM) = separat datagap, ej här.
- **Placeholder-scan:** ingen; all kod utskriven.
- **Typkonsistens:** `AlongRouteFeature` importeras från `@/hooks/useRoadtrip` (verifierad export); `ZonedCorridor`/`gateBySpeed`/`bucketCorridor` konsistenta mellan Task 1–2.
- **Frontend-only bekräftat:** inga migrations/RPC rörs.
- **Medveten förenkling:** zon-trösklar (100 m) och hastighets→signifikans-rampen är v1-heuristik, inte kalibrerad — dokumenterad i kod.

## Efterföljande (ej denna plan)
- Plan 3: off-screen riktningsindikatorer mot centralorter.
- Senare: flytta zon-logiken till RPC:n `nearby_along_route` (DB) när in-flight-migrationerna landat; synlighetsviktning via `signal_weights` (DEM).
