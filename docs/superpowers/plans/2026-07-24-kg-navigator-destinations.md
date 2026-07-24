# KG-navigator: koppla-vidare-destinationer i söket — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** När en sökning resolvar till en entitet, visa dess kunskapsgraf-grannar som klickbara destinationskort ("gå vidare hit") — så söket blir en dörr, inte en återvändsgränd.

**Architecture:** En ren, testad vägvisar-config (entity_type → destination) extraherad ur GlobalSearch:s `META`. En hook som anropar `graph_neighborhood(p_id)` och mappar grannar → destinationer. En "Gå vidare"-sektion i GlobalSearch som visar entitetens grannar. Återanvänder allt från KG-Plan-1 (grafen) + söket.

**Tech Stack:** React 18 + TypeScript, TanStack Query, Supabase-js (`sb.rpc`), vitest.

## Global Constraints

- **Ingen ny DB/migration** — `graph_neighborhood(p_id uuid)` finns redan (RETURNS TABLE: `direction text, predicate text, other_id uuid, other_type text, other_label text, notes text`).
- **Tvåspråkigt** — destinationer bär `labelSv`/`labelEn`; välj via `useLanguage().language`.
- **Icke-förstörande mot söket** — befintliga grupper/AI-svar orörda; destinationskorten är ett additivt lager.
- **Följ befintliga mönster** — `sb.rpc(...)` som i `GlobalSearch` (`neighbors_v1`/`search_v1`); routing som `/carvers`+`/sv/ristare`.

---

## Filstruktur

- `src/config/entityDestinations.ts` — `Destination`-typ + `destinationFor(entityType, hitLike)` (extraherad + utökad ur `META`). Enda sanningskälla för entity_type→destination.
- `src/config/entityDestinations.test.ts` — enhetstest.
- `src/hooks/useEntityNeighbors.ts` — `graph_neighborhood`-anrop → `NeighborDestination[]`.
- `src/hooks/useEntityNeighbors.test.ts` — test av mappningen (ren funktion `mapNeighbor`).
- `src/components/search/GlobalSearch.tsx` — importera `destinationFor`; rendera "Gå vidare"-sektion.

## Referens: verifierat i kod (2026-07-24)

- `GlobalSearch.tsx` (426 rader) har `META: Record<string,{labelSv,labelEn,icon,route:(h)=>string}>` (rad 61–84) som täcker inscription/carver/parish/place/christian_site/fortress/hillfort/folk_group/city/king/dynasty/coin/god/viking_name/source/road/excursion/theme/landscape. **Saknar:** `estate`, `church`, `cult_site`, `hundred` (nod-typer ur KG-Plan-1).
- `entity_registry`-nodtyper med grannar: inscription, carver, artefact, king, dynasty, estate, church, parish, hundred, cult_site, god, coin, source, road, theme, landscape, city.
- Klient-RPC-mönster: `const sb = supabase as unknown as { rpc: (fn,args)=>Promise<{data,error}> }; sb.rpc('graph_neighborhood', { p_id })`.
- `useLanguage()` ger `{ language }` ('sv'|'en').

---

## Task 1: Extrahera + utöka vägvisar-configen

**Files:**
- Create: `src/config/entityDestinations.ts`
- Test: `src/config/entityDestinations.test.ts`

**Interfaces:**
- Produces:
  ```ts
  export interface DestinationInput { entity_id: string; label: string; signum?: string | null }
  export interface Destination { labelSv: string; labelEn: string; icon: LucideIcon; route: string }
  export function destinationFor(entityType: string, input: DestinationInput): Destination | null
  ```
  Returnerar `null` för okänd typ.

- [ ] **Step 1: Skriv failing test**

```ts
// src/config/entityDestinations.test.ts
import { describe, it, expect } from 'vitest';
import { destinationFor } from './entityDestinations';

describe('destinationFor', () => {
  it('king -> royal-chronicles', () => {
    const d = destinationFor('king', { entity_id: 'k1', label: 'Magnus Eriksson' });
    expect(d?.route).toBe('/royal-chronicles');
    expect(d?.labelSv).toBe('Kungar');
  });
  it('church -> /kyrkor (ny typ)', () => {
    const d = destinationFor('church', { entity_id: 'c1', label: 'Hossmo kyrka' });
    expect(d?.route).toBe('/kyrkor');
  });
  it('estate -> maktsäten-fokus med flyTo-namn (ny typ)', () => {
    const d = destinationFor('estate', { entity_id: 'e1', label: 'Kalmar (slott)' });
    expect(d?.route).toContain('focus=fortresses');
  });
  it('okänd typ -> null', () => {
    expect(destinationFor('nonsense', { entity_id: 'x', label: 'y' })).toBeNull();
  });
});
```

- [ ] **Step 2: Kör → FAIL**

Run: `npx vitest run src/config/entityDestinations.test.ts`
Expected: FAIL (modulen finns ej).

- [ ] **Step 3: Skriv `entityDestinations.ts`** (flytta META hit, lägg till estate/church/cult_site/hundred)

```ts
import {
  MapPin, BookOpen, Hammer, Church, Castle, Users2, Crown, Users,
  Sparkles, ScrollText, Compass, Coins as CoinsIcon, type LucideIcon,
} from 'lucide-react';

export interface DestinationInput { entity_id: string; label: string; signum?: string | null }
export interface Destination { labelSv: string; labelEn: string; icon: LucideIcon; route: string }

const enc = (s: string) => encodeURIComponent(s);

type Def = { labelSv: string; labelEn: string; icon: LucideIcon; route: (h: DestinationInput) => string };

const DEFS: Record<string, Def> = {
  landscape:      { labelSv: 'Landskap & regioner', labelEn: 'Landscapes & regions', icon: MapPin, route: (h) => `/explore?searchQuery=${enc(h.label)}` },
  inscription:    { labelSv: 'Runinskrifter', labelEn: 'Inscriptions', icon: BookOpen, route: (h) => `/inscription/${enc(h.signum ?? h.label)}` },
  carver:         { labelSv: 'Ristare', labelEn: 'Carvers', icon: Hammer, route: (h) => `/carvers?carver=${h.entity_id}` },
  parish:         { labelSv: 'Socknar', labelEn: 'Parishes', icon: MapPin, route: (h) => `/explore?focus=parishes&region=${enc(h.label)}` },
  hundred:        { labelSv: 'Härader', labelEn: 'Hundreds', icon: MapPin, route: (h) => `/explore?focus=hundreds&region=${enc(h.label)}` },
  place:          { labelSv: 'Ortnamn', labelEn: 'Place names', icon: MapPin, route: (h) => `/explore?searchQuery=${enc(h.label)}` },
  christian_site: { labelSv: 'Heliga platser', labelEn: 'Holy sites', icon: Church, route: (h) => `/explore?searchQuery=${enc(h.label)}` },
  church:         { labelSv: 'Kyrkor & stift', labelEn: 'Churches & dioceses', icon: Church, route: () => '/kyrkor' },
  fortress:       { labelSv: 'Försvar', labelEn: 'Fortresses', icon: Castle, route: () => '/fortresses' },
  hillfort:       { labelSv: 'Fornborgar', labelEn: 'Hillforts', icon: Castle, route: () => '/fortresses' },
  estate:         { labelSv: 'Maktsäten', labelEn: 'Power seats', icon: Castle, route: (h) => `/explore?focus=fortresses&searchQuery=${enc(h.label)}` },
  cult_site:      { labelSv: 'Kultplatser', labelEn: 'Cult sites', icon: Sparkles, route: () => '/explore?focus=cultSites' },
  folk_group:     { labelSv: 'Folkgrupper', labelEn: 'Peoples', icon: Users2, route: () => '/explore?focus=folkGroups' },
  city:           { labelSv: 'Städer', labelEn: 'Cities', icon: Castle, route: () => '/fortresses' },
  king:           { labelSv: 'Kungar', labelEn: 'Kings', icon: Crown, route: () => '/royal-chronicles' },
  dynasty:        { labelSv: 'Släkter', labelEn: 'Dynasties', icon: Users2, route: () => '/royal-chronicles' },
  coin:           { labelSv: 'Mynt', labelEn: 'Coins', icon: CoinsIcon, route: () => '/coins' },
  god:            { labelSv: 'Gudar', labelEn: 'Gods', icon: Sparkles, route: () => '/explore?focus=gods' },
  viking_name:    { labelSv: 'Namn', labelEn: 'Names', icon: Users, route: () => '/explore?focus=names' },
  source:         { labelSv: 'Källor', labelEn: 'Sources', icon: ScrollText, route: (h) => `/sources/${h.entity_id}` },
  road:           { labelSv: 'Vägar & leder', labelEn: 'Roads', icon: MapPin, route: () => '/explore' },
  excursion:      { labelSv: 'Utflykter', labelEn: 'Excursions', icon: Compass, route: () => '/excursions' },
  theme:          { labelSv: 'Teman', labelEn: 'Themes', icon: Sparkles, route: () => '/explore' },
};

export function destinationFor(entityType: string, input: DestinationInput): Destination | null {
  const def = DEFS[entityType];
  if (!def) return null;
  return { labelSv: def.labelSv, labelEn: def.labelEn, icon: def.icon, route: def.route(input) };
}
```

- [ ] **Step 4: Kör → PASS**

Run: `npx vitest run src/config/entityDestinations.test.ts`
Expected: 4 passed.

- [ ] **Step 5: Commit**

```bash
git add src/config/entityDestinations.ts src/config/entityDestinations.test.ts
git commit -m "feat(search): extract+extend wayfinding config (entityDestinations) with estate/church/cult_site/hundred"
```

---

## Task 2: Grannskaps-hook (graph_neighborhood → destinationer)

**Files:**
- Create: `src/hooks/useEntityNeighbors.ts`
- Test: `src/hooks/useEntityNeighbors.test.ts`

**Interfaces:**
- Consumes: `destinationFor` (Task 1).
- Produces:
  ```ts
  export interface NeighborRow { direction: string; predicate: string; other_id: string; other_type: string; other_label: string }
  export interface NeighborDestination { predicate: string; label: string; destination: Destination }
  export function mapNeighbor(row: NeighborRow): NeighborDestination | null   // ren, testbar
  export function useEntityNeighbors(entityId: string | null): { data: NeighborDestination[]; isLoading: boolean }
  ```

- [ ] **Step 1: Skriv failing test för `mapNeighbor`**

```ts
// src/hooks/useEntityNeighbors.test.ts
import { describe, it, expect } from 'vitest';
import { mapNeighbor } from './useEntityNeighbors';

describe('mapNeighbor', () => {
  it('estate-granne -> destination med grannens etikett', () => {
    const d = mapNeighbor({ direction: 'out', predicate: 'has_estate', other_id: 'e1', other_type: 'estate', other_label: 'Nyköpingshus' });
    expect(d?.label).toBe('Nyköpingshus');
    expect(d?.destination.route).toContain('focus=fortresses');
    expect(d?.predicate).toBe('has_estate');
  });
  it('okänd other_type -> null', () => {
    expect(mapNeighbor({ direction: 'out', predicate: 'x', other_id: 'y', other_type: 'nonsense', other_label: 'z' })).toBeNull();
  });
});
```

- [ ] **Step 2: Kör → FAIL**

Run: `npx vitest run src/hooks/useEntityNeighbors.test.ts`
Expected: FAIL.

- [ ] **Step 3: Skriv `useEntityNeighbors.ts`**

```ts
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { destinationFor, type Destination } from '@/config/entityDestinations';

export interface NeighborRow { direction: string; predicate: string; other_id: string; other_type: string; other_label: string }
export interface NeighborDestination { predicate: string; label: string; destination: Destination }

const sb = supabase as unknown as { rpc: (fn: string, args: Record<string, unknown>) => Promise<{ data: unknown; error: unknown }> };

export function mapNeighbor(row: NeighborRow): NeighborDestination | null {
  const dest = destinationFor(row.other_type, { entity_id: row.other_id, label: row.other_label });
  if (!dest) return null;
  return { predicate: row.predicate, label: row.other_label, destination: dest };
}

export function useEntityNeighbors(entityId: string | null) {
  const q = useQuery({
    queryKey: ['entity-neighbors', entityId],
    enabled: !!entityId,
    queryFn: async (): Promise<NeighborDestination[]> => {
      const { data, error } = await sb.rpc('graph_neighborhood', { p_id: entityId });
      if (error || !Array.isArray(data)) return [];
      return (data as NeighborRow[]).map(mapNeighbor).filter((x): x is NeighborDestination => x !== null);
    },
  });
  return { data: q.data ?? [], isLoading: q.isLoading };
}
```

- [ ] **Step 4: Kör → PASS**

Run: `npx vitest run src/hooks/useEntityNeighbors.test.ts`
Expected: 2 passed.

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useEntityNeighbors.ts src/hooks/useEntityNeighbors.test.ts
git commit -m "feat(search): useEntityNeighbors hook (graph_neighborhood -> destinations)"
```

---

## Task 3: "Gå vidare"-sektion i GlobalSearch

**Files:**
- Modify: `src/components/search/GlobalSearch.tsx`

**Interfaces:**
- Consumes: `destinationFor` (Task 1), `useEntityNeighbors` (Task 2).

- [ ] **Step 1: Ersätt lokal META med importerad config**

I `GlobalSearch.tsx`: ta bort det lokala `META`-objektet (rad ~61–84) och dess `enc`-helper om oanvänd, importera i stället:
```ts
import { destinationFor } from '@/config/entityDestinations';
```
Byt de två `META[...]`-användningarna (i `groupHits` rad ~102–119 och tema-grenen rad ~187–191) till `destinationFor(entity_type, hit)` (returnerar `null` → hoppa raden, samma beteende som `if (!meta) continue`). Bygg-verifiera att inget annat refererar `META`.

- [ ] **Step 2: Lägg state för topp-entiteten**

Efter free-text-resolven (`setGroups(groupHits(hits))`, rad ~239): härled den starkaste entiteten som har en nod: första hit vars `entity_id` finns (icke-inscription föredras för navigation). Spara `const [topEntity, setTopEntity] = useState<Hit | null>(null)` och sätt den i free-text-effekten; nollställ vid tom query/tema.

- [ ] **Step 3: Rendera "Gå vidare"-sektionen**

I render-delen, ovanför/under grupperna när `topEntity` finns:
```tsx
{topEntity && <GoFurther hit={topEntity} onGo={go} sv={sv} />}
```
Definiera komponenten i samma fil:
```tsx
const GoFurther: React.FC<{ hit: Hit; onGo: (r: string) => void; sv: boolean }> = ({ hit, onGo, sv }) => {
  const { data } = useEntityNeighbors(hit.entity_id);
  if (!data.length) return null;
  return (
    <div className="px-2 py-3 border-t">
      <div className="text-xs text-muted-foreground mb-2">{sv ? 'Gå vidare' : 'Explore further'}</div>
      <div className="flex flex-wrap gap-2">
        {data.slice(0, 12).map((n, i) => {
          const Icon = n.destination.icon;
          return (
            <button key={`${n.other_type ?? ''}-${i}`} onClick={() => onGo(n.destination.route)}
              className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm hover:bg-accent">
              <Icon className="h-3.5 w-3.5" /> {n.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};
```
(Import `useEntityNeighbors` överst.)

- [ ] **Step 4: Bygg + typecheck**

Run: `npx tsc --noEmit && npm run build 2>&1 | tail -5`
Expected: inga typfel; build lyckas.

- [ ] **Step 5: Smoke-test i dev (manuellt)**

Run: `npm run dev` → öppna söket (Ctrl/Cmd+K) → sök "Bo Jonsson Grip" → förvänta "Gå vidare"-chips: dynasti (Ätten Grip) + kungsgårdar (Nyköpingshus…). Sök "Öland" → grannar om några. Verifiera klick navigerar.

- [ ] **Step 6: Commit**

```bash
git add src/components/search/GlobalSearch.tsx
git commit -m "feat(search): 'Gå vidare' destination cards from graph neighbors in GlobalSearch"
```

---

## Self-Review

**Spec-täckning (mot `2026-07-23-kg-navigator-design.md` 6.4):**
- Delad resolver (fråga→entitet→graph_neighborhood→destinationer): Task 2 ✓
- Vägvisar-config (entitet→destination, dedikerad route/focus): Task 1 ✓ (utökad med estate/church/cult_site/hundred)
- Destinationskort i GlobalSearch: Task 3 ✓
- Dedikerade `/kyrkor`+`/churches`-SIDA: **följdplan** (Task 1 pekar redan `church`→`/kyrkor`; routen/sidan byggs separat — noteras).
- Brainstorming-map (6.5): **följdplan** (v2).

**Placeholder-scan:** ingen TBD; all kod komplett.

**Typ-konsistens:** `Destination`/`DestinationInput` identiska Task 1↔2↔3; `destinationFor` signatur konsekvent; `graph_neighborhood`-kolumner (other_id/other_type/other_label) matchar RPC:ns faktiska retur.

**Beroendekedja:** Task 1 → Task 2 → Task 3.

**OBS följdplaner (ej denna plan):** (a) `/kyrkor`+`/churches` som riktig sida (route + komponent, tvåspråkig — Daniels uttalade önskemål; `church`-destinationen pekar dit redan men routen saknas → temporär 404 tills sidan finns, ELLER lägg en `Navigate`-redirect till `/explore?focus=churches` som interim). (b) Brainstorming-map. (c) Övriga dedikerade routes.
