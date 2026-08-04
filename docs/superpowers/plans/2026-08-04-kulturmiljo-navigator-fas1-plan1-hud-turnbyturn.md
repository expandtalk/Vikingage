# Kulturmiljö-navigator Fas 1 · Plan 1: Navigator-HUD + turn-by-turn

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ge billäget en navigator-HUD (aktuell väg överst; riktningspil + vägnamn + klocka + ETA + kvarvarande km nederst) och turn-by-turn ur OSRM, byggt ovanpå den befintliga roadtrip-/billägesinfrastrukturen.

**Architecture:** Bygger vidare på `NearMeControl` bil-läge + `useRoadtrip` + `useFieldNav` + `services/routing.ts`. Ingen ny datamodell, ingen ny kartmotor. Logiken (OSRM-maneuver-parsning, aktiv manöver, ETA, HUD-modell) läggs i **rena, testbara funktioner**; en tunn `NavigatorHud`-komponent renderar dem i billäget.

**Tech Stack:** React 18 + TypeScript, Vitest (befintlig testrunner), Leaflet (oförändrad), OSRM demo-server (redan använd i `services/routing.ts`).

## Global Constraints

- **Lagren ÄR källan.** Ingen ny innehållslista/datakälla; navigatorn är en lins över befintliga lager. (Denna plan rör bara ruttning/HUD, inte lagerurval.)
- **Säkerhet: ljudprimärt under körning** — HUD:en ska vara glesa, stora glyfer, inte kräva läsning. (Ljud = separat plan.)
- **Leaflet-only, ingen motorbyte** i Fas 1 (3D = Fas 2).
- **Inga uppfunna koordinater/vägnamn** — allt kommer ur OSRM-svaret; saknas vägnamn visas tomt, aldrig gissat.
- **Svenska** i all synlig text.
- **Icke-brytande:** `RouteResult` behåller sina fält; nya fält är additiva så `NearMeControl` fortsätter fungera oförändrat.
- Testrunner: `npx vitest run <fil>`.

---

### Task 1: OSRM-steg → maneuvrar (ren parser, additivt i routing.ts)

**Files:**
- Modify: `src/services/routing.ts`
- Test: `src/services/routing.maneuvers.test.ts`

**Interfaces:**
- Consumes: inget nytt.
- Produces:
  - `export interface Maneuver { type: string; modifier: string | null; lat: number; lng: number; road: string; distanceM: number }`
  - `export function parseManeuvers(osrm: unknown): Maneuver[]`
  - `RouteResult` får ett additivt fält: `maneuvers: Maneuver[]` (tom array om steg saknas).

- [ ] **Step 1: Write the failing test**

```ts
// src/services/routing.maneuvers.test.ts
import { describe, it, expect } from 'vitest';
import { parseManeuvers } from './routing';

const OSRM_FIXTURE = {
  routes: [{
    legs: [{
      steps: [
        { name: 'Storgatan', distance: 240, maneuver: { type: 'depart', modifier: null, location: [16.36, 56.66] } },
        { name: 'Väg 258',   distance: 1800, maneuver: { type: 'turn', modifier: 'left', location: [16.37, 56.67] } },
        { name: '',          distance: 0,    maneuver: { type: 'arrive', modifier: null, location: [16.39, 56.70] } },
      ],
    }],
  }],
};

describe('parseManeuvers', () => {
  it('flattens legs→steps into maneuvers with lat/lng from [lng,lat]', () => {
    const m = parseManeuvers(OSRM_FIXTURE);
    expect(m).toHaveLength(3);
    expect(m[0]).toEqual({ type: 'depart', modifier: null, lat: 56.66, lng: 16.36, road: 'Storgatan', distanceM: 240 });
    expect(m[1]).toEqual({ type: 'turn', modifier: 'left', lat: 56.67, lng: 16.37, road: 'Väg 258', distanceM: 1800 });
    expect(m[2].type).toBe('arrive');
  });

  it('returns [] for malformed/empty input (never throws)', () => {
    expect(parseManeuvers(null)).toEqual([]);
    expect(parseManeuvers({})).toEqual([]);
    expect(parseManeuvers({ routes: [{}] })).toEqual([]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/services/routing.maneuvers.test.ts`
Expected: FAIL — `parseManeuvers is not a function`.

- [ ] **Step 3: Implement `parseManeuvers` + wire into `route()`**

Add to `src/services/routing.ts`:

```ts
export interface Maneuver {
  type: string;
  modifier: string | null;
  lat: number;
  lng: number;
  road: string;
  distanceM: number;
}

// OSRM legs[].steps[] → platt maneuver-lista. Tålig: allt oväntat → [].
export function parseManeuvers(osrm: unknown): Maneuver[] {
  const route = (osrm as any)?.routes?.[0];
  const legs = route?.legs;
  if (!Array.isArray(legs)) return [];
  const out: Maneuver[] = [];
  for (const leg of legs) {
    const steps = leg?.steps;
    if (!Array.isArray(steps)) continue;
    for (const s of steps) {
      const loc = s?.maneuver?.location;
      if (!Array.isArray(loc) || loc.length < 2) continue;
      out.push({
        type: String(s.maneuver?.type ?? ''),
        modifier: s.maneuver?.modifier ?? null,
        lat: Number(loc[1]),
        lng: Number(loc[0]),
        road: String(s.name ?? ''),
        distanceM: Number(s.distance ?? 0),
      });
    }
  }
  return out;
}
```

Update the `RouteResult` interface to add `maneuvers: Maneuver[]`, request steps, and populate it:

```ts
export interface RouteResult { coords: [number, number][]; distanceKm: number; durationMin: number; maneuvers: Maneuver[] }
```

In `route()`, change the URL to include steps and parse them:

```ts
  const url = `${OSRM}/${from.lng},${from.lat};${to.lng},${to.lat}?overview=full&geometries=geojson&steps=true`;
  // …after obtaining `json` and `r`:
  const coords = (c as [number, number][]).map(([lng, lat]) => [lat, lng] as [number, number]);
  return { coords, distanceKm: r.distance / 1000, durationMin: r.duration / 60, maneuvers: parseManeuvers(json) };
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/services/routing.maneuvers.test.ts`
Expected: PASS (both tests).

- [ ] **Step 5: Typecheck (RouteResult är additivt — inga trasiga anropare)**

Run: `npx tsc --noEmit -p tsconfig.json`
Expected: inga fel.

- [ ] **Step 6: Commit**

```bash
git add src/services/routing.ts src/services/routing.maneuvers.test.ts
git commit -m "feat(navigator): parse OSRM turn-by-turn maneuvers into RouteResult"
```

---

### Task 2: Ren HUD-modell (aktiv manöver, ETA, kvarvarande) 

**Files:**
- Create: `src/utils/navHud.ts`
- Test: `src/utils/navHud.test.ts`

**Interfaces:**
- Consumes: `Maneuver` (Task 1), `RouteResult` (Task 1).
- Produces:
  - `export function haversineM(a: LatLng, b: LatLng): number`
  - `export function nextManeuver(maneuvers: Maneuver[], pos: LatLng): { maneuver: Maneuver; distanceM: number } | null`
  - `export function formatEta(remainingMin: number, nowMs: number): { arrival: string; remaining: string }`
  - `export interface HudModel { currentRoad: string; nextTurn: { modifier: string | null; road: string; inM: number } | null; arrival: string; remaining: string; remainingKm: string }`
  - `export function hudModel(route: RouteResult, pos: LatLng | null, nowMs: number): HudModel`
  - `export type LatLng = { lat: number; lng: number }`

- [ ] **Step 1: Write the failing test**

```ts
// src/utils/navHud.test.ts
import { describe, it, expect } from 'vitest';
import { haversineM, nextManeuver, formatEta, hudModel } from './navHud';
import type { RouteResult } from '@/services/routing';

const ROUTE: RouteResult = {
  coords: [[56.66, 16.36], [56.70, 16.39]],
  distanceKm: 4.2, durationMin: 6,
  maneuvers: [
    { type: 'depart', modifier: null, lat: 56.66, lng: 16.36, road: 'Storgatan', distanceM: 240 },
    { type: 'turn', modifier: 'left', lat: 56.67, lng: 16.37, road: 'Väg 258', distanceM: 1800 },
    { type: 'arrive', modifier: null, lat: 56.70, lng: 16.39, road: '', distanceM: 0 },
  ],
};

describe('haversineM', () => {
  it('is ~0 for the same point and positive for different points', () => {
    expect(haversineM({ lat: 56.66, lng: 16.36 }, { lat: 56.66, lng: 16.36 })).toBeCloseTo(0, 5);
    expect(haversineM({ lat: 56.66, lng: 16.36 }, { lat: 56.67, lng: 16.37 })).toBeGreaterThan(500);
  });
});

describe('nextManeuver', () => {
  it('returns the nearest maneuver and straight-line distance to it', () => {
    const r = nextManeuver(ROUTE.maneuvers, { lat: 56.669, lng: 16.369 });
    expect(r?.maneuver.road).toBe('Väg 258');
    expect(r?.distanceM).toBeGreaterThan(0);
  });
  it('returns null when there are no maneuvers', () => {
    expect(nextManeuver([], { lat: 0, lng: 0 })).toBeNull();
  });
});

describe('formatEta', () => {
  it('adds remaining minutes to now and formats HH:MM + remaining label', () => {
    const now = Date.UTC(2026, 7, 4, 10, 0, 0); // 10:00 UTC
    const { arrival, remaining } = formatEta(6, now);
    expect(arrival).toMatch(/^\d{2}:\d{2}$/);
    expect(remaining).toBe('6 min');
  });
});

describe('hudModel', () => {
  it('derives current road, next turn, remaining km and ETA', () => {
    const m = hudModel(ROUTE, { lat: 56.669, lng: 16.369 }, Date.UTC(2026, 7, 4, 10, 0, 0));
    expect(m.currentRoad).toBeTypeOf('string');
    expect(m.nextTurn?.road).toBe('Väg 258');
    expect(m.remainingKm).toBe('4,2 km');
    expect(m.remaining).toBe('6 min');
  });
  it('falls back gracefully with no position', () => {
    const m = hudModel(ROUTE, null, Date.UTC(2026, 7, 4, 10, 0, 0));
    expect(m.nextTurn).toBeNull();
    expect(m.remainingKm).toBe('4,2 km');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/utils/navHud.test.ts`
Expected: FAIL — module not found / functions undefined.

- [ ] **Step 3: Implement `src/utils/navHud.ts`**

```ts
import type { Maneuver, RouteResult } from '@/services/routing';

export type LatLng = { lat: number; lng: number };

// Straight-line meters (Haversine). Räcker för "avstånd till nästa manöver" i v1.
export function haversineM(a: LatLng, b: LatLng): number {
  const R = 6371000, toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat), dLng = toRad(b.lng - a.lng);
  const s = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(s)));
}

// v1-förenkling: närmaste manöver (fågelvägen), exkl. 'depart'. Förfinas i senare task med
// rutt-progress. Returnerar null om inga maneuvrar finns.
export function nextManeuver(maneuvers: Maneuver[], pos: LatLng): { maneuver: Maneuver; distanceM: number } | null {
  const cands = maneuvers.filter((m) => m.type !== 'depart');
  if (cands.length === 0) return null;
  let best = cands[0], bestD = haversineM(pos, best);
  for (const m of cands.slice(1)) {
    const d = haversineM(pos, m);
    if (d < bestD) { best = m; bestD = d; }
  }
  return { maneuver: best, distanceM: Math.round(bestD) };
}

const pad = (n: number) => String(n).padStart(2, '0');

export function formatEta(remainingMin: number, nowMs: number): { arrival: string; remaining: string } {
  const arr = new Date(nowMs + remainingMin * 60000);
  return { arrival: `${pad(arr.getHours())}:${pad(arr.getMinutes())}`, remaining: `${Math.round(remainingMin)} min` };
}

const km1 = (km: number) => `${km.toFixed(1).replace('.', ',')} km`;

export interface HudModel {
  currentRoad: string;
  nextTurn: { modifier: string | null; road: string; inM: number } | null;
  arrival: string;
  remaining: string;
  remainingKm: string;
}

export function hudModel(route: RouteResult, pos: LatLng | null, nowMs: number): HudModel {
  const eta = formatEta(route.durationMin, nowMs);
  const nt = pos ? nextManeuver(route.maneuvers, pos) : null;
  // Aktuell väg = vägen på den manöver vi senast passerade (närmaste 'depart'/väg med namn),
  // v1: första namngivna manövern. Förfinas med rutt-progress i senare task.
  const currentRoad = route.maneuvers.find((m) => m.road)?.road ?? '';
  return {
    currentRoad,
    nextTurn: nt ? { modifier: nt.maneuver.modifier, road: nt.maneuver.road, inM: nt.distanceM } : null,
    arrival: eta.arrival,
    remaining: eta.remaining,
    remainingKm: km1(route.distanceKm),
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/utils/navHud.test.ts`
Expected: PASS (alla).

Obs: `formatEta`-testet läser lokal tid via `getHours()`; regex `^\d{2}:\d{2}$` är tidszons-oberoende. Behåll regex-assert (inte exakt sträng).

- [ ] **Step 5: Commit**

```bash
git add src/utils/navHud.ts src/utils/navHud.test.ts
git commit -m "feat(navigator): pure HUD model — next maneuver, ETA, remaining"
```

---

### Task 3: `NavigatorHud`-komponent, renderad i billäget

**Files:**
- Create: `src/components/navigator/NavigatorHud.tsx`
- Test: `src/components/navigator/navHudView.test.ts` (ren vy-hjälpare)
- Modify: `src/pages/Explore.tsx` (rendera HUD:en när `driving` är på)

**Interfaces:**
- Consumes: `hudModel` (Task 2), `useRoadtrip` (`{ route }`), `useFieldNav` (`{ pos }`), `useDrivingMode`.
- Produces: `export const NavigatorHud: React.FC` + `export function turnGlyph(modifier: string | null): string`

- [ ] **Step 1: Write the failing test (ren glyf-mappning)**

```ts
// src/components/navigator/navHudView.test.ts
import { describe, it, expect } from 'vitest';
import { turnGlyph } from './NavigatorHud';

describe('turnGlyph', () => {
  it('maps OSRM modifiers to arrow glyphs', () => {
    expect(turnGlyph('left')).toBe('↰');
    expect(turnGlyph('right')).toBe('↱');
    expect(turnGlyph('straight')).toBe('↑');
    expect(turnGlyph(null)).toBe('↑'); // default rakt fram
    expect(turnGlyph('slight left')).toBe('↖');
    expect(turnGlyph('slight right')).toBe('↗');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/navigator/navHudView.test.ts`
Expected: FAIL — module/`turnGlyph` saknas.

- [ ] **Step 3: Implement `NavigatorHud.tsx`**

```tsx
import React from 'react';
import { hudModel } from '@/utils/navHud';
import { useRoadtrip } from '@/hooks/useRoadtrip';
import { useFieldNav } from '@/hooks/useFieldNav';
import { useDrivingMode } from '@/hooks/useDrivingMode';

// OSRM-modifier → pil-glyf. Default (okänd/null) = rakt fram.
export function turnGlyph(modifier: string | null): string {
  switch (modifier) {
    case 'left': return '↰';
    case 'right': return '↱';
    case 'slight left': return '↖';
    case 'slight right': return '↗';
    case 'sharp left': return '↰';
    case 'sharp right': return '↱';
    case 'uturn': return '↩';
    case 'straight':
    default: return '↑';
  }
}

const fmtM = (m: number) => (m < 1000 ? `${Math.round(m / 10) * 10} m` : `${(m / 1000).toFixed(1).replace('.', ',')} km`);

// HUD i billäget: överst aktuell väg + nästa manöver; nederst pil + vägnamn + klocka + ETA + km.
// Ren vy — all härledning i hudModel(). Nu-tid läses en gång per render (billäget re-renderar
// vid varje positionsuppdatering från useFieldNav).
export const NavigatorHud: React.FC = () => {
  const driving = useDrivingMode();
  const { route } = useRoadtrip();
  const { pos } = useFieldNav();
  if (!driving || !route) return null;
  const nowMs = new Date().getTime();
  const m = hudModel(route, pos ? { lat: pos.lat, lng: pos.lng } : null, nowMs);

  return (
    <>
      {/* Överst: aktuell väg + nästa manöver */}
      <div className="fixed top-0 inset-x-0 z-[1200] bg-slate-900/90 backdrop-blur-md text-white px-4 py-2 flex items-center gap-3">
        {m.nextTurn && <span className="text-3xl leading-none" aria-hidden>{turnGlyph(m.nextTurn.modifier)}</span>}
        <div className="min-w-0">
          {m.nextTurn
            ? <div className="text-base font-semibold truncate">{m.nextTurn.road || 'Fortsätt'} <span className="text-slate-300 font-normal">om {fmtM(m.nextTurn.inM)}</span></div>
            : <div className="text-base font-semibold truncate">{m.currentRoad || 'Kör'}</div>}
          {m.currentRoad && <div className="text-xs text-slate-400 truncate">på {m.currentRoad}</div>}
        </div>
      </div>

      {/* Nederst: pil + vägnamn + klocka + ETA + kvarvarande km */}
      <div className="fixed bottom-0 inset-x-0 z-[1200] bg-slate-900/90 backdrop-blur-md text-white px-4 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-4xl leading-none" aria-hidden>{m.nextTurn ? turnGlyph(m.nextTurn.modifier) : '↑'}</span>
          <span className="text-lg font-semibold truncate">{m.currentRoad || '—'}</span>
        </div>
        <div className="shrink-0 text-right leading-tight">
          <div className="text-lg font-bold tabular-nums">{m.arrival}</div>
          <div className="text-xs text-slate-300 tabular-nums">{m.remaining} · {m.remainingKm}</div>
        </div>
      </div>
    </>
  );
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/navigator/navHudView.test.ts`
Expected: PASS.

- [ ] **Step 5: Rendera HUD:en i billäget**

I `src/pages/Explore.tsx`: importera och rendera `NavigatorHud` inuti `<main>` (den renderar sig själv bara när `driving` + rutt finns, så den är säker att alltid montera).

```tsx
import { NavigatorHud } from '@/components/navigator/NavigatorHud';
// … i JSX, direkt efter <main ...>:
<NavigatorHud />
```

- [ ] **Step 6: Typecheck + manuell rök-test**

Run: `npx tsc --noEmit -p tsconfig.json` → inga fel.
Manuellt (dev): öppna `/explore` på mobilbredd → Near me → färdsätt **Kör** → skriv ett mål → *Kör dit*. Verifiera: topp-band visar nästa manöver + väg; botten-band visar pil, vägnamn, klocka, ETA (min) + km. Byt till Gående → HUD:en försvinner (driving av).

- [ ] **Step 7: Commit**

```bash
git add src/components/navigator/NavigatorHud.tsx src/components/navigator/navHudView.test.ts src/pages/Explore.tsx
git commit -m "feat(navigator): navigator HUD (current road + next turn + ETA) in driving mode"
```

---

## Self-review (utförd)

- **Spec-täckning:** denna plan täcker spec:ens UI-skal (topp: aktuell väg + nästa manöver; nederst: vägnamn/klocka/ETA/km) + turn-by-turn (OSRM-steg). Övriga spec-punkter → Plan 2–6 nedan.
- **Placeholder-scan:** inga TBD; all kod utskriven.
- **Typkonsistens:** `Maneuver`/`RouteResult.maneuvers` (Task 1) konsumeras oförändrat i Task 2–3; `hudModel`/`LatLng`/`turnGlyph`-signaturer matchar över tasks.
- **Känd förenkling (medveten, ej placeholder):** `nextManeuver`/`currentRoad` använder fågelvägen resp. första namngivna vägen i v1; rutt-progress-förfining är en egen task i Plan 2.

---

## Fas 1 — återstående delplaner (skrivs var för sig när vi når dem)

Varje delplan ger körbar, testbar programvara och bygger vidare på billäget. Ordnade:

- **Plan 2 — Korridor-zoner + hastighetsgrindning.** Generalisera `useNearbyAlongRoute`/`nearby_along_route` från en buffert till tre zoner (närzon 0–100 m / synfält 100 m–2 km / riktning). Rutt-progress för `nextManeuver`/`currentRoad`. Hastighet (`useFieldNav().pos.speed`) grindar synliga signifikans-tiers. Testbar kärna: zon-bucketing + fart→tier-tak.
- **Plan 3 — Off-screen riktningsindikatorer** mot centralorter (`central_place_profiles`): bäring + avstånd → kant-chip ("Birka 34 km ↗"). Testbar kärna: bäringsberäkning + skärmkant-projektion.
- **Plan 4 — Ljudprompter** (Web Speech API): "om 300 m, X till höger" vid närzons-passage. Säkerhetsprincipen. Testbar kärna: prompt-trigger (avstånd/enkel-gång) + frasbyggare.
- **Plan 5 — Milsten-lins (1700-talsväg).** Eget lager (milstolpe/väghållningssten). Källkritik: väglinje ur **ursprungligt** läge; flyttade/museistenar utanför linjen tills ursprungsläge belagt. Deluppgift: ursprungsläge-data. Testbar kärna: linje-rekonstruktion filtrerar på belagd ursprungsposition.
- **Plan 6 — "Stanna & läs".** Stillastående: tryck landmärke → läspanel som återanvänder `InscriptionModal`/`ChurchHistoryModal`/hub-länkar.
- **Lager-wiring (små):** exponera `svamp.stalle` som kartlager; säkerställ `badplats`-lagret (finns, 57) togglas i billäget; seeda bad→sommar / svamp→höst i `seasonal_relevance`.
