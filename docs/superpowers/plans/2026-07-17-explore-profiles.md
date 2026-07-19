# Intresseprofiler — enad Explore-config Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ena Explore-profilen till en Supabase-backad config-källa (med kod-fallback) och göra de sex disciplinära profilerna synligt distinkta över fem dimensioner: baskarta, lagerstack, symbologi, tid, panellayout.

**Architecture:** All *testbar* logik läggs i rena moduler (`src/config/exploreCapabilities.ts`, `src/config/exploreProfiles.ts`) som Vitest kör i node-env. Hooks blir tunna wrappers runt de rena funktionerna. En profil bor som rad i `explore_profiles` (Supabase); `useExploreProfiles()` läser tabellen och faller tillbaka på typade kod-seeds. Aktiv profil hålls i den befintliga `useActiveExploreRole`-storen (localStorage `activePreset`), nu med `ProfileId`. Panel-, lager-, baskarte-, symbologi- och tidsdimensionerna härleds alla från den aktiva profilen — inte från tre olika ställen.

**Tech Stack:** React 18, TypeScript, Vite, Leaflet/React-Leaflet, TanStack Query, Supabase, Tailwind, shadcn/ui, Vitest (node-env), lucide-react.

## Global Constraints

- **Testmiljö = Vitest node-env** (`vitest.config.ts`: `environment: "node"`). Enhetstester får **endast** täcka rena funktioner — ingen DOM, ingen `localStorage`, inga React-hooks i test. Hooks/komponenter verifieras via `tsc --noEmit`, `vite build` och runtime-QA.
- **Migrationer appliceras via SQL-editorn + `supabase migration repair --status applied <version>`** — **aldrig** `supabase db push` (migrationshistoriken är trasig i detta repo).
- **RLS-mönster för ny tabell:** `SELECT` för `anon` + `authenticated`; `INSERT/UPDATE/DELETE` endast via `is_admin()`.
- **Kod-fallback är obligatorisk:** appen måste fungera fullt ut om `explore_profiles`-hämtningen fallerar eller returnerar tomt (fallback till `PROFILE_SEEDS`).
- **DB kan bara peka på lager koden kan rita:** varje lagernyckel valideras mot `KNOWN_LAYER_KEYS`; okända nycklar droppas.
- **Bevara publika API-ytor** som andra filer konsumerar: `usePanelManager` måste fortsatt exportera typen `PanelConfig` och returnera `{ panels, activePreset, presets, applyPreset, updatePanel, togglePanelVisibility, togglePanelMinimized, setPanelPosition, setPanelSize, resetToDefaults }`.
- **Commit-meddelanden** avslutas med `Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>`.
- **Profil-id:n:** `explore | geographer | linguist | archaeologist | trade | geneticist`. Default/normaliserings-fallback = `explore`. Legacy localStorage-värden (`explorer`, `researcher`) mappas till `explore`.

---

## Filstruktur

**Nya filer:**
- `src/config/exploreCapabilities.ts` — capability-register (baskartor→tile-config, teman→accenter, ikoner→komponenter, kända lagernycklar). Rent.
- `src/config/exploreCapabilities.test.ts` — enhetstester.
- `src/config/exploreProfiles.ts` — typer, `PROFILE_SEEDS` (6), och rena resolvers (`normalizeProfileId`, `resolveProfileLayers`, `deriveLayoutFlags`, `layerEmphasis`, `emphasisStyle`, `profileToPanels`, `validateProfile`, `buildProfilesFromRows`). Rent.
- `src/config/exploreProfiles.test.ts` — enhetstester.
- `src/hooks/useExploreProfiles.ts` — `useExploreProfiles()` (DB + fallback) och `useActiveExploreProfile()`.
- `supabase/migrations/20260717130000_explore_profiles.sql` — tabell, RLS, seed.

**Ändrade filer:**
- `src/hooks/useActiveExploreRole.ts` — `ProfileId`, legacy-normalisering.
- `src/hooks/usePanelManager.ts` — panels/presets härleds från aktiv profil; `activePreset` från storen.
- `src/hooks/useLayoutManager.ts` — flaggor via `deriveLayoutFlags`.
- `src/components/panels/PanelLayoutSelector.tsx` — renderar från profiler, skriver en gång.
- `src/hooks/useMapTileLayer.ts` — baskarta via `BasemapId` istället för `isVikingMode`.
- `src/hooks/useMapInitialization.ts` — löser baskarta från aktiv profil, trådar till tile-hooken.
- `src/hooks/useLegendManager.ts` — tar färdiglöst lager-preset istället för roll-sträng.
- `src/components/explorer/hooks/useExplorerData.ts` — löser profil; `selectedTimePeriod` blir state; skickar löst preset + emphasis; exponerar `setSelectedTimePeriod` + `showTimeline`.
- `src/components/explorer/ExplorerLayout.tsx` — kopplar `onPeriodChange` till riktig setter; `=== 'explorer'` → `=== 'explore'`.
- `src/components/map/MapCore.tsx` — `=== 'explorer'` → `=== 'explore'`; baskarta.
- Lager/marker-rendering (Task 10) — respekterar emphasis.

---

## Task 1: Capability-register (rent)

**Files:**
- Create: `src/config/exploreCapabilities.ts`
- Test: `src/config/exploreCapabilities.test.ts`

**Interfaces:**
- Produces: `type BasemapId = 'osm' | 'terrain' | 'light'`; `interface BasemapConfig { url: string; attribution: string; maxZoom: number; className: string }`; `getBasemapConfig(id: BasemapId): BasemapConfig`; `type ThemeId`; `THEME_ACCENTS: Record<ThemeId,string>`; `type ProfileIcon`; `PROFILE_ICONS: Record<ProfileIcon, LucideIcon>`; `KNOWN_LAYER_KEYS: readonly string[]`; `isKnownLayerKey(k: string): boolean`.

- [ ] **Step 1: Write the failing test**

Create `src/config/exploreCapabilities.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import {
  BASEMAPS,
  getBasemapConfig,
  isKnownLayerKey,
  PROFILE_ICONS,
  THEME_ACCENTS,
} from "./exploreCapabilities";

describe("exploreCapabilities", () => {
  it("every basemap has an https tile URL and attribution", () => {
    for (const cfg of Object.values(BASEMAPS)) {
      expect(cfg.url).toMatch(/^https:\/\//);
      expect(cfg.attribution.length).toBeGreaterThan(0);
      expect(cfg.maxZoom).toBeGreaterThan(0);
    }
  });

  it("getBasemapConfig falls back to osm for an unknown id", () => {
    // @ts-expect-error runtime fallback for a value outside the union
    expect(getBasemapConfig("nope")).toBe(BASEMAPS.osm);
    expect(getBasemapConfig("terrain")).toBe(BASEMAPS.terrain);
  });

  it("isKnownLayerKey accepts real layers and rejects junk", () => {
    expect(isKnownLayerKey("place_names")).toBe(true);
    expect(isKnownLayerKey("runic_inscriptions")).toBe(true);
    expect(isKnownLayerKey("water_routes")).toBe(true);
    expect(isKnownLayerKey("not_a_layer")).toBe(false);
  });

  it("has an icon component and accent for the profile keys", () => {
    expect(PROFILE_ICONS.dna).toBeTruthy();
    expect(PROFILE_ICONS.globe).toBeTruthy();
    expect(THEME_ACCENTS.typology).toMatch(/^#/);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/config/exploreCapabilities.test.ts`
Expected: FAIL — "Failed to resolve import './exploreCapabilities'".

- [ ] **Step 3: Write minimal implementation**

Create `src/config/exploreCapabilities.ts`:

```ts
import { Monitor, Globe, Microscope, Shovel, Ship, Dna, type LucideIcon } from "lucide-react";

export type BasemapId = "osm" | "terrain" | "light";

export interface BasemapConfig {
  url: string;
  attribution: string;
  maxZoom: number;
  className: string;
}

export const BASEMAPS: Record<BasemapId, BasemapConfig> = {
  osm: {
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: "© OpenStreetMap contributors",
    maxZoom: 19,
    className: "modern-detailed-tiles",
  },
  terrain: {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Physical_Map/MapServer/tile/{z}/{y}/{x}",
    attribution: "Tiles © Esri — Source: US National Park Service",
    maxZoom: 18,
    className: "viking-terrain-tiles",
  },
  light: {
    url: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
    attribution: "© OpenStreetMap contributors © CARTO",
    maxZoom: 20,
    className: "light-neutral-tiles",
  },
};

export const getBasemapConfig = (id: BasemapId): BasemapConfig =>
  BASEMAPS[id] ?? BASEMAPS.osm;

export type ThemeId =
  | "neutral"
  | "earth"
  | "typology"
  | "chronology"
  | "flow"
  | "genetic";

/** Accent-hex per tema — återanvänds av symbologi-emphasis och väljar-chrome. */
export const THEME_ACCENTS: Record<ThemeId, string> = {
  neutral: "#3b82f6",
  earth: "#65a30d",
  typology: "#a855f7",
  chronology: "#f59e0b",
  flow: "#0ea5e9",
  genetic: "#ec4899",
};

export type ProfileIcon = "monitor" | "globe" | "microscope" | "shovel" | "ship" | "dna";

export const PROFILE_ICONS: Record<ProfileIcon, LucideIcon> = {
  monitor: Monitor,
  globe: Globe,
  microscope: Microscope,
  shovel: Shovel,
  ship: Ship,
  dna: Dna,
};

/** Lagernycklar som appen faktiskt kan rita (topp-nivå lager). */
export const KNOWN_LAYER_KEYS = [
  "runic_inscriptions",
  "foreign_inscriptions",
  "archaeological_sites",
  "archaeological_finds",
  "viking_fortresses",
  "viking_cities",
  "viking_regions",
  "germanic_groups",
  "germanic_timeline",
  "stake_barriers",
  "valdemar_route",
  "river_routes",
  "water_routes",
  "trade_routes",
  "battle_sites",
  "carvers",
  "gods",
  "hundreds",
  "parishes",
  "folk_groups",
  "religious_places",
  "place_names",
  "viking_roads",
] as const;

export type KnownLayerKey = (typeof KNOWN_LAYER_KEYS)[number];

const LAYER_KEY_SET = new Set<string>(KNOWN_LAYER_KEYS);

export const isKnownLayerKey = (k: string): boolean => LAYER_KEY_SET.has(k);
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/config/exploreCapabilities.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add src/config/exploreCapabilities.ts src/config/exploreCapabilities.test.ts
git commit -m "$(cat <<'EOF'
feat(explore): capability-register för profiler (baskartor/teman/ikoner/lager)

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 2: Profil-typer, seeds och rena resolvers

**Files:**
- Create: `src/config/exploreProfiles.ts`
- Test: `src/config/exploreProfiles.test.ts`

**Interfaces:**
- Consumes (Task 1): `BasemapId`, `ThemeId`, `ProfileIcon`, `isKnownLayerKey`, `BASEMAPS`, `THEME_ACCENTS`, `PROFILE_ICONS`.
- Produces:
  - `type ProfileId = 'explore'|'geographer'|'linguist'|'archaeologist'|'trade'|'geneticist'`
  - `type TimePeriod = 'all'|'viking_age'`; `interface PanelState { visible: boolean; emphasis?: 'primary'|'minimized' }`; `type PanelKey = 'legend'|'results'|'search'|'filters'`
  - `interface ExploreProfile { id; sortOrder; label; description; icon; basemap; layers; theme; primaryLayers; defaultPeriod; showTimeline; panels }`
  - `PROFILE_IDS: ProfileId[]`; `PROFILE_SEEDS: ExploreProfile[]`
  - `normalizeProfileId(v: string|null|undefined): ProfileId`
  - `resolveProfileLayers(profile: ExploreProfile, focus: string|null): LegendPreset`
  - `deriveLayoutFlags(profile: ExploreProfile): { shouldShowControls: boolean; shouldShowMap: boolean; shouldShowFilters: boolean; shouldShowTimeline: boolean }`
  - `layerEmphasis(profile: ExploreProfile, layerKey: string): 'primary'|'muted'`
  - `emphasisStyle(e: 'primary'|'muted'): { opacity: number; filterCss: string }`
  - `validateProfile(profile: ExploreProfile): string[]`
  - `buildProfilesFromRows(rows: ExploreProfileRow[]|null|undefined): ExploreProfile[]`
  - `interface ExploreProfileRow { id: string; sort_order?: number; label?: {sv:string;en:string}; description?: {sv:string;en:string}; config?: Partial<...> }`

- [ ] **Step 1: Write the failing test**

Create `src/config/exploreProfiles.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import {
  PROFILE_IDS,
  PROFILE_SEEDS,
  normalizeProfileId,
  resolveProfileLayers,
  deriveLayoutFlags,
  layerEmphasis,
  emphasisStyle,
  validateProfile,
  buildProfilesFromRows,
} from "./exploreProfiles";

const seed = (id: string) => PROFILE_SEEDS.find((p) => p.id === id)!;

describe("normalizeProfileId", () => {
  it("keeps valid ids", () => {
    expect(normalizeProfileId("linguist")).toBe("linguist");
    expect(normalizeProfileId("trade")).toBe("trade");
  });
  it("maps legacy ids to explore", () => {
    expect(normalizeProfileId("explorer")).toBe("explore");
    expect(normalizeProfileId("researcher")).toBe("explore");
  });
  it("defaults unknown/empty to explore", () => {
    expect(normalizeProfileId(null)).toBe("explore");
    expect(normalizeProfileId("garbage")).toBe("explore");
  });
});

describe("PROFILE_SEEDS", () => {
  it("has exactly the six profile ids", () => {
    expect(PROFILE_SEEDS.map((p) => p.id).sort()).toEqual([...PROFILE_IDS].sort());
  });
  it("every seed passes validation (all refs known)", () => {
    for (const p of PROFILE_SEEDS) {
      expect(validateProfile(p)).toEqual([]);
    }
  });
  it("every primaryLayer is also enabled in that profile's layers", () => {
    for (const p of PROFILE_SEEDS) {
      for (const key of p.primaryLayers) {
        expect(p.layers[key]).toBe(true);
      }
    }
  });
});

describe("resolveProfileLayers", () => {
  it("enables the profile's own layers on an all-false base", () => {
    const preset = resolveProfileLayers(seed("linguist"), null);
    expect(preset.place_names).toBe(true);
    expect(preset.runic_inscriptions).toBe(true);
    expect(preset.hundreds).toBe(false);
  });
  it("applies focus overrides on top of the profile", () => {
    const preset = resolveProfileLayers(seed("explore"), "gods");
    expect(preset.religious_places).toBe(true);
    expect(preset.religious_odin).toBe(true);
    expect(preset.runic_inscriptions).toBe(false); // gods-focus hides runestones
  });
  it("rivers focus turns on the water network", () => {
    const preset = resolveProfileLayers(seed("explore"), "rivers");
    expect(preset.river_routes).toBe(true);
    expect(preset.water_routes).toBe(true);
    expect(preset.viking_fortresses).toBe(false);
  });
});

describe("deriveLayoutFlags", () => {
  it("linguist hides the timeline; geographer shows it", () => {
    expect(deriveLayoutFlags(seed("linguist")).shouldShowTimeline).toBe(false);
    expect(deriveLayoutFlags(seed("geographer")).shouldShowTimeline).toBe(true);
  });
  it("geographer hides filters (map maximized)", () => {
    expect(deriveLayoutFlags(seed("geographer")).shouldShowFilters).toBe(false);
  });
});

describe("layerEmphasis + emphasisStyle", () => {
  it("primary layers read primary, others muted", () => {
    expect(layerEmphasis(seed("linguist"), "place_names")).toBe("primary");
    expect(layerEmphasis(seed("linguist"), "gods")).toBe("muted");
  });
  it("muted style is dimmer than primary", () => {
    expect(emphasisStyle("muted").opacity).toBeLessThan(emphasisStyle("primary").opacity);
  });
});

describe("buildProfilesFromRows", () => {
  it("falls back to seeds when rows are empty or null", () => {
    expect(buildProfilesFromRows(null)).toBe(PROFILE_SEEDS);
    expect(buildProfilesFromRows([])).toBe(PROFILE_SEEDS);
  });
  it("builds and sorts valid rows, dropping unknown layer keys", () => {
    const rows = [
      {
        id: "linguist",
        sort_order: 2,
        label: { sv: "Lingvist", en: "Linguist" },
        config: {
          icon: "microscope",
          basemap: "light",
          theme: "typology",
          layers: { place_names: true, bogus_layer: true },
          primaryLayers: ["place_names"],
          defaultPeriod: "all",
          showTimeline: false,
          panels: seed("linguist").panels,
        },
      },
    ];
    const built = buildProfilesFromRows(rows as never);
    expect(built).toHaveLength(1);
    expect(built[0].layers.place_names).toBe(true);
    expect(built[0].layers.bogus_layer).toBeUndefined();
  });
  it("falls back to seeds when every row is invalid", () => {
    const rows = [{ id: "x", config: { basemap: "moon" } }];
    expect(buildProfilesFromRows(rows as never)).toBe(PROFILE_SEEDS);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/config/exploreProfiles.test.ts`
Expected: FAIL — "Failed to resolve import './exploreProfiles'".

- [ ] **Step 3: Write minimal implementation**

Create `src/config/exploreProfiles.ts`:

```ts
import type { LegendPreset } from "@/types/legend";
import {
  BASEMAPS,
  PROFILE_ICONS,
  THEME_ACCENTS,
  isKnownLayerKey,
  type BasemapId,
  type ProfileIcon,
  type ThemeId,
} from "./exploreCapabilities";

export type ProfileId =
  | "explore"
  | "geographer"
  | "linguist"
  | "archaeologist"
  | "trade"
  | "geneticist";

export type TimePeriod = "all" | "viking_age";

export interface PanelState {
  visible: boolean;
  emphasis?: "primary" | "minimized";
}

export type PanelKey = "legend" | "results" | "search" | "filters";

export interface ExploreProfile {
  id: ProfileId;
  sortOrder: number;
  label: { sv: string; en: string };
  description: { sv: string; en: string };
  icon: ProfileIcon;
  basemap: BasemapId;
  layers: Record<string, boolean>;
  theme: ThemeId;
  primaryLayers: string[];
  defaultPeriod: TimePeriod;
  showTimeline: boolean;
  panels: Record<PanelKey, PanelState>;
}

export const PROFILE_IDS: ProfileId[] = [
  "explore",
  "geographer",
  "linguist",
  "archaeologist",
  "trade",
  "geneticist",
];

/** Legacy localStorage-id:n (pre-refaktor-roster) → nya id:n. */
const LEGACY_ID_MAP: Record<string, ProfileId> = {
  explorer: "explore",
  researcher: "explore",
  linguist: "linguist",
  geographer: "geographer",
};

export const normalizeProfileId = (v: string | null | undefined): ProfileId => {
  if (!v) return "explore";
  if ((PROFILE_IDS as string[]).includes(v)) return v as ProfileId;
  return LEGACY_ID_MAP[v] ?? "explore";
};

/** Alla legend-nycklar (topp-lager + underkategorier) med false som utgångsläge. */
export const EMPTY_LEGEND_PRESET: LegendPreset = {
  runic_inscriptions: false,
  foreign_inscriptions: false,
  archaeological_sites: false,
  archaeological_finds: false,
  viking_fortresses: false,
  viking_cities: false,
  viking_regions: false,
  germanic_groups: false,
  germanic_timeline: false,
  stake_barriers: false,
  valdemar_route: false,
  river_routes: false,
  water_routes: false,
  trade_routes: false,
  battle_sites: false,
  carvers: false,
  gods: false,
  hundreds: false,
  parishes: false,
  folk_groups: false,
  religious_places: false,
  place_names: false,
  viking_roads: false,
  religious_odin: false,
  religious_thor: false,
  religious_frey: false,
  religious_freyja: false,
  religious_frigg: false,
  religious_ull: false,
  religious_njord: false,
  religious_other: false,
  well_preserved: false,
  damaged: false,
  fragmentary: false,
  underwater: false,
  finland: false,
  norway: false,
  denmark: false,
  sweden: false,
  royal_center: false,
  ring_fortress: false,
  fortress: false,
  hillfort: false,
  longphort: false,
  coastal_defense: false,
};

const on = (...keys: string[]): Record<string, boolean> =>
  Object.fromEntries(keys.map((k) => [k, true]));

export const PROFILE_SEEDS: ExploreProfile[] = [
  {
    id: "explore",
    sortOrder: 0,
    label: { sv: "Utforska", en: "Explore" },
    description: { sv: "Balanserat läge för allmän utforskning", en: "Balanced mode for general exploration" },
    icon: "monitor",
    basemap: "osm",
    layers: on("runic_inscriptions", "religious_places", "viking_fortresses"),
    theme: "neutral",
    primaryLayers: ["runic_inscriptions"],
    defaultPeriod: "all",
    showTimeline: true,
    panels: {
      legend: { visible: true },
      results: { visible: false },
      search: { visible: false },
      filters: { visible: true, emphasis: "minimized" },
    },
  },
  {
    id: "geographer",
    sortOrder: 1,
    label: { sv: "Kulturgeograf", en: "Cultural Geographer" },
    description: { sv: "Landskapet som system — polygoner och nätverk", en: "The landscape as a system — polygons and networks" },
    icon: "globe",
    basemap: "terrain",
    layers: on(
      "runic_inscriptions",
      "viking_regions",
      "hundreds",
      "parishes",
      "folk_groups",
      "river_routes",
      "trade_routes",
      "viking_roads",
      "viking_cities",
    ),
    theme: "earth",
    primaryLayers: ["hundreds", "parishes", "viking_regions", "river_routes"],
    defaultPeriod: "all",
    showTimeline: true,
    panels: {
      legend: { visible: true },
      results: { visible: false },
      search: { visible: false },
      filters: { visible: false },
    },
  },
  {
    id: "linguist",
    sortOrder: 2,
    label: { sv: "Lingvist", en: "Linguist" },
    description: { sv: "Ortnamn som distributionsmönster", en: "Place names as distribution patterns" },
    icon: "microscope",
    basemap: "light",
    layers: on("place_names", "carvers", "gods", "runic_inscriptions"),
    theme: "typology",
    primaryLayers: ["place_names", "runic_inscriptions"],
    defaultPeriod: "all",
    showTimeline: false,
    panels: {
      legend: { visible: true },
      results: { visible: true, emphasis: "primary" },
      search: { visible: false },
      filters: { visible: true, emphasis: "primary" },
    },
  },
  {
    id: "archaeologist",
    sortOrder: 3,
    label: { sv: "Arkeolog", en: "Archaeologist" },
    description: { sv: "Högupplöst punktdata och fornlämningar", en: "High-precision point data and monuments" },
    icon: "shovel",
    basemap: "terrain",
    layers: on(
      "archaeological_sites",
      "archaeological_finds",
      "viking_fortresses",
      "runic_inscriptions",
      "battle_sites",
    ),
    theme: "chronology",
    primaryLayers: ["archaeological_sites", "runic_inscriptions"],
    defaultPeriod: "all",
    showTimeline: true,
    panels: {
      legend: { visible: true },
      results: { visible: true },
      search: { visible: false },
      filters: { visible: true },
    },
  },
  {
    id: "trade",
    sortOrder: 4,
    label: { sv: "Handelshistoriker", en: "Trade Historian" },
    description: { sv: "Flöden, emporier och farleder", en: "Flows, emporia and waterways" },
    icon: "ship",
    basemap: "osm",
    layers: on(
      "trade_routes",
      "viking_cities",
      "river_routes",
      "water_routes",
      "valdemar_route",
      "stake_barriers",
    ),
    theme: "flow",
    primaryLayers: ["trade_routes", "viking_cities", "river_routes"],
    defaultPeriod: "viking_age",
    showTimeline: true,
    panels: {
      legend: { visible: true },
      results: { visible: false },
      search: { visible: false },
      filters: { visible: true, emphasis: "minimized" },
    },
  },
  {
    id: "geneticist",
    sortOrder: 5,
    label: { sv: "Genetiker", en: "Geneticist" },
    description: { sv: "Provplatser och gravkontext", en: "Sample sites and grave context" },
    icon: "dna",
    basemap: "osm",
    layers: on("archaeological_sites", "runic_inscriptions"),
    theme: "genetic",
    primaryLayers: ["archaeological_sites"],
    defaultPeriod: "all",
    showTimeline: true,
    panels: {
      legend: { visible: true },
      results: { visible: true, emphasis: "primary" },
      search: { visible: false },
      filters: { visible: true, emphasis: "minimized" },
    },
  },
];

/** Fokus-overrides ovanpå ett löst lager-preset (flyttat från rolePresets). */
const applyFocusOverrides = (preset: LegendPreset, focus: string | null): LegendPreset => {
  if (!focus) return preset;
  const o: Partial<LegendPreset> = {};
  switch (focus) {
    case "rivers":
      Object.assign(o, {
        river_routes: true,
        water_routes: true,
        trade_routes: true,
        valdemar_route: true,
        stake_barriers: true,
        viking_fortresses: false,
        viking_cities: true,
        runic_inscriptions: false,
        religious_places: false,
      });
      break;
    case "fortresses":
      Object.assign(o, { viking_fortresses: true, runic_inscriptions: true });
      break;
    case "carvers":
      Object.assign(o, { carvers: true, runic_inscriptions: true });
      break;
    case "gods":
      Object.assign(o, {
        gods: false,
        religious_places: true,
        runic_inscriptions: false,
        religious_odin: true,
        religious_thor: true,
        religious_frey: true,
        religious_freyja: true,
        religious_frigg: true,
        religious_ull: true,
        religious_njord: true,
        religious_other: true,
      });
      break;
    case "hundreds":
      Object.assign(o, { hundreds: true, runic_inscriptions: true });
      break;
    case "parishes":
      Object.assign(o, { parishes: true, runic_inscriptions: true });
      break;
    case "folkGroups":
      Object.assign(o, { folk_groups: true, runic_inscriptions: true });
      break;
  }
  return { ...preset, ...o };
};

export const resolveProfileLayers = (
  profile: ExploreProfile,
  focus: string | null,
): LegendPreset => {
  const base: LegendPreset = { ...EMPTY_LEGEND_PRESET };
  for (const [k, v] of Object.entries(profile.layers)) {
    if (v) base[k] = true;
  }
  return applyFocusOverrides(base, focus);
};

export const deriveLayoutFlags = (p: ExploreProfile) => ({
  shouldShowControls: p.panels.filters.visible,
  shouldShowMap: true,
  shouldShowFilters: p.panels.filters.visible,
  shouldShowTimeline: p.showTimeline,
});

export const layerEmphasis = (
  p: ExploreProfile,
  layerKey: string,
): "primary" | "muted" => (p.primaryLayers.includes(layerKey) ? "primary" : "muted");

export const emphasisStyle = (e: "primary" | "muted") =>
  e === "primary"
    ? { opacity: 1, filterCss: "none" }
    : { opacity: 0.55, filterCss: "saturate(0.35)" };

export const validateProfile = (p: ExploreProfile): string[] => {
  const errors: string[] = [];
  if (!(p.basemap in BASEMAPS)) errors.push(`basemap:${p.basemap}`);
  if (!(p.theme in THEME_ACCENTS)) errors.push(`theme:${p.theme}`);
  if (!(p.icon in PROFILE_ICONS)) errors.push(`icon:${p.icon}`);
  for (const k of Object.keys(p.layers)) {
    if (p.layers[k] && !isKnownLayerKey(k)) errors.push(`layer:${k}`);
  }
  for (const k of p.primaryLayers) {
    if (!isKnownLayerKey(k)) errors.push(`primary:${k}`);
  }
  return errors;
};

export interface ExploreProfileRow {
  id: string;
  sort_order?: number;
  label?: { sv: string; en: string };
  description?: { sv: string; en: string };
  config?: Partial<{
    icon: ProfileIcon;
    basemap: BasemapId;
    theme: ThemeId;
    layers: Record<string, boolean>;
    primaryLayers: string[];
    defaultPeriod: TimePeriod;
    showTimeline: boolean;
    panels: Record<PanelKey, PanelState>;
  }>;
}

const filterKnownLayers = (layers: Record<string, boolean>): Record<string, boolean> =>
  Object.fromEntries(Object.entries(layers).filter(([k, v]) => v && isKnownLayerKey(k)));

export const buildProfilesFromRows = (
  rows: ExploreProfileRow[] | null | undefined,
): ExploreProfile[] => {
  if (!rows || rows.length === 0) return PROFILE_SEEDS;
  const built: ExploreProfile[] = [];
  for (const row of rows) {
    const cfg = row.config ?? {};
    const id = normalizeProfileId(row.id);
    const candidate: ExploreProfile = {
      id,
      sortOrder: row.sort_order ?? 0,
      label: row.label ?? { sv: id, en: id },
      description: row.description ?? { sv: "", en: "" },
      icon: cfg.icon ?? "monitor",
      basemap: cfg.basemap ?? "osm",
      layers: filterKnownLayers(cfg.layers ?? {}),
      theme: cfg.theme ?? "neutral",
      primaryLayers: (cfg.primaryLayers ?? []).filter(isKnownLayerKey),
      defaultPeriod: cfg.defaultPeriod ?? "all",
      showTimeline: cfg.showTimeline ?? true,
      panels: cfg.panels ?? PROFILE_SEEDS[0].panels,
    };
    if (validateProfile(candidate).length === 0) built.push(candidate);
  }
  return built.length ? built.sort((a, b) => a.sortOrder - b.sortOrder) : PROFILE_SEEDS;
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/config/exploreProfiles.test.ts`
Expected: PASS (all describe blocks green).

- [ ] **Step 5: Commit**

```bash
git add src/config/exploreProfiles.ts src/config/exploreProfiles.test.ts
git commit -m "$(cat <<'EOF'
feat(explore): profil-typer, sex seeds och rena resolvers

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 3: Supabase-tabell `explore_profiles` + seed

**Files:**
- Create: `supabase/migrations/20260717130000_explore_profiles.sql`

**Interfaces:**
- Produces: tabell `public.explore_profiles(id text pk, sort_order int, is_active bool, label jsonb, description jsonb, config jsonb, created_at, updated_at)` med publik läs-RLS + admin-skriv, seedad med de sex profilerna.

> **Not:** Ingen enhetstest (DB-lager). Verifiering sker i SQL-editorn. Kod-fallbacken (Task 4) gör att appen fungerar även innan denna körs.

- [ ] **Step 1: Skriv migrationsfilen**

Create `supabase/migrations/20260717130000_explore_profiles.sql`:

```sql
-- Intresseprofiler för Explore-vyn: config-rattar per profil (maskineriet bor i kod).
create table if not exists public.explore_profiles (
  id text primary key,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  label jsonb not null,
  description jsonb not null default '{}'::jsonb,
  config jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.explore_profiles enable row level security;

drop policy if exists "explore_profiles public read" on public.explore_profiles;
create policy "explore_profiles public read"
  on public.explore_profiles for select
  to anon, authenticated
  using (true);

drop policy if exists "explore_profiles admin insert" on public.explore_profiles;
create policy "explore_profiles admin insert"
  on public.explore_profiles for insert
  to authenticated
  with check (is_admin());

drop policy if exists "explore_profiles admin update" on public.explore_profiles;
create policy "explore_profiles admin update"
  on public.explore_profiles for update
  to authenticated
  using (is_admin()) with check (is_admin());

drop policy if exists "explore_profiles admin delete" on public.explore_profiles;
create policy "explore_profiles admin delete"
  on public.explore_profiles for delete
  to authenticated
  using (is_admin());

insert into public.explore_profiles (id, sort_order, is_active, label, description, config) values
('explore', 0, true,
 '{"sv":"Utforska","en":"Explore"}',
 '{"sv":"Balanserat läge för allmän utforskning","en":"Balanced mode for general exploration"}',
 '{"icon":"monitor","basemap":"osm","theme":"neutral","defaultPeriod":"all","showTimeline":true,"primaryLayers":["runic_inscriptions"],"layers":{"runic_inscriptions":true,"religious_places":true,"viking_fortresses":true},"panels":{"legend":{"visible":true},"results":{"visible":false},"search":{"visible":false},"filters":{"visible":true,"emphasis":"minimized"}}}'),
('geographer', 1, true,
 '{"sv":"Kulturgeograf","en":"Cultural Geographer"}',
 '{"sv":"Landskapet som system — polygoner och nätverk","en":"The landscape as a system — polygons and networks"}',
 '{"icon":"globe","basemap":"terrain","theme":"earth","defaultPeriod":"all","showTimeline":true,"primaryLayers":["hundreds","parishes","viking_regions","river_routes"],"layers":{"runic_inscriptions":true,"viking_regions":true,"hundreds":true,"parishes":true,"folk_groups":true,"river_routes":true,"trade_routes":true,"viking_roads":true,"viking_cities":true},"panels":{"legend":{"visible":true},"results":{"visible":false},"search":{"visible":false},"filters":{"visible":false}}}'),
('linguist', 2, true,
 '{"sv":"Lingvist","en":"Linguist"}',
 '{"sv":"Ortnamn som distributionsmönster","en":"Place names as distribution patterns"}',
 '{"icon":"microscope","basemap":"light","theme":"typology","defaultPeriod":"all","showTimeline":false,"primaryLayers":["place_names","runic_inscriptions"],"layers":{"place_names":true,"carvers":true,"gods":true,"runic_inscriptions":true},"panels":{"legend":{"visible":true},"results":{"visible":true,"emphasis":"primary"},"search":{"visible":false},"filters":{"visible":true,"emphasis":"primary"}}}'),
('archaeologist', 3, true,
 '{"sv":"Arkeolog","en":"Archaeologist"}',
 '{"sv":"Högupplöst punktdata och fornlämningar","en":"High-precision point data and monuments"}',
 '{"icon":"shovel","basemap":"terrain","theme":"chronology","defaultPeriod":"all","showTimeline":true,"primaryLayers":["archaeological_sites","runic_inscriptions"],"layers":{"archaeological_sites":true,"archaeological_finds":true,"viking_fortresses":true,"runic_inscriptions":true,"battle_sites":true},"panels":{"legend":{"visible":true},"results":{"visible":true},"search":{"visible":false},"filters":{"visible":true}}}'),
('trade', 4, true,
 '{"sv":"Handelshistoriker","en":"Trade Historian"}',
 '{"sv":"Flöden, emporier och farleder","en":"Flows, emporia and waterways"}',
 '{"icon":"ship","basemap":"osm","theme":"flow","defaultPeriod":"viking_age","showTimeline":true,"primaryLayers":["trade_routes","viking_cities","river_routes"],"layers":{"trade_routes":true,"viking_cities":true,"river_routes":true,"water_routes":true,"valdemar_route":true,"stake_barriers":true},"panels":{"legend":{"visible":true},"results":{"visible":false},"search":{"visible":false},"filters":{"visible":true,"emphasis":"minimized"}}}'),
('geneticist', 5, true,
 '{"sv":"Genetiker","en":"Geneticist"}',
 '{"sv":"Provplatser och gravkontext","en":"Sample sites and grave context"}',
 '{"icon":"dna","basemap":"osm","theme":"genetic","defaultPeriod":"all","showTimeline":true,"primaryLayers":["archaeological_sites"],"layers":{"archaeological_sites":true,"runic_inscriptions":true},"panels":{"legend":{"visible":true},"results":{"visible":true,"emphasis":"primary"},"search":{"visible":false},"filters":{"visible":true,"emphasis":"minimized"}}}')
on conflict (id) do update set
  sort_order = excluded.sort_order,
  is_active = excluded.is_active,
  label = excluded.label,
  description = excluded.description,
  config = excluded.config,
  updated_at = now();
```

- [ ] **Step 2: Applicera i SQL-editorn**

Öppna Supabase-projektets SQL-editor (`mnuifmcjspeaauzehasj`), klistra in filens innehåll, kör. Verifiera:

Run (i SQL-editorn):
```sql
select id, sort_order, config->>'basemap' as basemap from public.explore_profiles order by sort_order;
```
Expected: 6 rader, `explore … geneticist`, basemaps `osm, terrain, light, terrain, osm, osm`.

Run (verifiera RLS):
```sql
select policyname, cmd from pg_policies where tablename = 'explore_profiles';
```
Expected: en `SELECT`-policy + tre admin-policies (INSERT/UPDATE/DELETE).

- [ ] **Step 3: Registrera migrationen**

Run: `supabase migration repair --status applied 20260717130000`
Expected: "Repaired migration history: 20260717130000 => applied".

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/20260717130000_explore_profiles.sql
git commit -m "$(cat <<'EOF'
feat(db): explore_profiles-tabell + RLS + seed (6 profiler)

Applicerad via SQL-editor + migration repair (db push är trasig i repot).

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 4: `useExploreProfiles` + `useActiveExploreProfile`

**Files:**
- Create: `src/hooks/useExploreProfiles.ts`

**Interfaces:**
- Consumes: `buildProfilesFromRows`, `PROFILE_SEEDS`, `ExploreProfile`, `ProfileId` (Task 2); `useActiveExploreRole` (Task 5 — men typen finns redan idag); `supabase` från `@/integrations/supabase/client`.
- Produces: `useExploreProfiles(): ExploreProfile[]`; `useActiveExploreProfile(): ExploreProfile`.

> **Not:** Ingen enhetstest — logiken (`buildProfilesFromRows`) är redan täckt i Task 2. Hooken är en tunn TanStack-Query-wrapper; verifieras via typecheck/build/runtime.

- [ ] **Step 1: Skriv hooken**

Create `src/hooks/useExploreProfiles.ts`:

```ts
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useActiveExploreRole } from "./useActiveExploreRole";
import {
  buildProfilesFromRows,
  PROFILE_SEEDS,
  type ExploreProfile,
  type ExploreProfileRow,
} from "@/config/exploreProfiles";

/**
 * Läser Explore-profilerna från Supabase. Faller robust tillbaka på de typade
 * kod-seeds om hämtningen fallerar, returnerar tomt, eller inte finns ännu.
 */
export const useExploreProfiles = (): ExploreProfile[] => {
  const { data } = useQuery({
    queryKey: ["explore-profiles"],
    queryFn: async (): Promise<ExploreProfile[]> => {
      const { data, error } = await supabase
        .from("explore_profiles")
        .select("id, sort_order, label, description, config")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return buildProfilesFromRows(data as unknown as ExploreProfileRow[]);
    },
    staleTime: 5 * 60 * 1000,
    placeholderData: PROFILE_SEEDS,
  });

  return data && data.length ? data : PROFILE_SEEDS;
};

/** Den för närvarande aktiva profilen (store-id upplöst mot profil-listan). */
export const useActiveExploreProfile = (): ExploreProfile => {
  const id = useActiveExploreRole();
  const profiles = useExploreProfiles();
  return profiles.find((p) => p.id === id) ?? profiles[0] ?? PROFILE_SEEDS[0];
};
```

- [ ] **Step 2: Verifiera typecheck**

Run: `npx tsc --noEmit`
Expected: inga nya fel i `src/hooks/useExploreProfiles.ts`. (Om `useActiveExploreRole` ännu returnerar den gamla `UserRole`-unionen: `p.id === id`-jämförelsen är fortfarande giltig eftersom `linguist`/`geographer` överlappar; Task 5 gör typen exakt.)

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useExploreProfiles.ts
git commit -m "$(cat <<'EOF'
feat(explore): useExploreProfiles + useActiveExploreProfile (DB + kod-fallback)

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 5: `useActiveExploreRole` → `ProfileId`

**Files:**
- Modify: `src/hooks/useActiveExploreRole.ts`

**Interfaces:**
- Consumes: `ProfileId`, `PROFILE_IDS`, `normalizeProfileId` (Task 2).
- Produces: `setActiveExploreRole(role: ProfileId)`; `useActiveExploreRole(): ProfileId`.

- [ ] **Step 1: Ersätt rolldefinitionen**

I `src/hooks/useActiveExploreRole.ts`, byt importen och `VALID`/`normalize`:

Ersätt rad 2:
```ts
import type { UserRole } from './legend/rolePresets';
```
med:
```ts
import { normalizeProfileId, PROFILE_IDS, type ProfileId } from '@/config/exploreProfiles';
```

Ersätt raderna 15 och 18-19:
```ts
const VALID: UserRole[] = ['explorer', 'linguist', 'geographer', 'researcher'];
```
```ts
const normalize = (v: string | null): UserRole =>
  VALID.includes(v as UserRole) ? (v as UserRole) : 'explorer';
```
med:
```ts
const VALID: ProfileId[] = PROFILE_IDS;
```
```ts
const normalize = (v: string | null): ProfileId => normalizeProfileId(v);
```

Byt alla återstående `UserRole` → `ProfileId` och `'explorer'`-defaults → `'explore'` i filen: `getSnapshot` returtyp och catch (`return 'explore';`), `setActiveExploreRole` param-typ, `useActiveExploreRole` returtyp och `useSyncExternalStore(..., () => 'explore')`.

- [ ] **Step 2: Verifiera normalisering (redan testad rent)**

Run: `npx vitest run src/config/exploreProfiles.test.ts -t normalizeProfileId`
Expected: PASS (legacy `explorer`/`researcher` → `explore`).

- [ ] **Step 3: Verifiera typecheck**

Run: `npx tsc --noEmit`
Expected: fel enbart i filer som ännu jämför mot gamla id:n — de fixas i Task 6-11. Notera dem men fortsätt.

- [ ] **Step 4: Commit**

```bash
git add src/hooks/useActiveExploreRole.ts
git commit -m "$(cat <<'EOF'
refactor(explore): useActiveExploreRole använder ProfileId + legacy-normalisering

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 6: `PanelLayoutSelector` renderar från profiler

**Files:**
- Modify: `src/components/panels/PanelLayoutSelector.tsx`

**Interfaces:**
- Consumes: `useExploreProfiles` (Task 4), `useActiveExploreRole` + `setActiveExploreRole` (Task 5), `PROFILE_ICONS` (Task 1).

- [ ] **Step 1: Ersätt komponentens innehåll**

Ersätt hela `src/components/panels/PanelLayoutSelector.tsx` med:

```tsx
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { useExploreProfiles } from "@/hooks/useExploreProfiles";
import { useActiveExploreRole, setActiveExploreRole } from "@/hooks/useActiveExploreRole";
import { PROFILE_ICONS } from "@/config/exploreCapabilities";

export const PanelLayoutSelector: React.FC = () => {
  const profiles = useExploreProfiles();
  const activeId = useActiveExploreRole();
  const { language } = useLanguage();
  const lang = language === "en" ? "en" : "sv";
  const activeProfile = profiles.find((p) => p.id === activeId) ?? profiles[0];

  return (
    <Card className="bg-slate-800/60 backdrop-blur-md border-slate-600/30">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-slate-200">
            {lang === "en" ? "Interest profile" : "Intresseprofil"}
          </h3>
          <Badge variant="outline" className="text-xs text-slate-300 border-slate-500">
            {activeProfile?.label[lang]}
          </Badge>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
          {profiles.map((profile) => {
            const IconComponent = PROFILE_ICONS[profile.icon];
            const isActive = activeId === profile.id;

            return (
              <Button
                key={profile.id}
                onClick={() => setActiveExploreRole(profile.id)}
                variant={isActive ? "default" : "outline"}
                size="sm"
                className={`h-auto p-3 flex flex-col items-center gap-2 transition-all ${
                  isActive
                    ? "bg-blue-600 hover:bg-blue-700 text-white border-blue-500"
                    : "bg-slate-700/50 hover:bg-slate-600/60 text-slate-200 border-slate-500/50"
                }`}
              >
                {IconComponent ? <IconComponent className="h-4 w-4" /> : null}
                <div className="text-center">
                  <div className="text-xs font-medium">{profile.label[lang]}</div>
                  <div className="text-xs opacity-75 mt-1">{profile.description[lang]}</div>
                </div>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
```

- [ ] **Step 2: Verifiera build**

Run: `npx tsc --noEmit && npx vite build`
Expected: PanelLayoutSelector kompilerar (inga referenser kvar till `usePanelManager`/`applyPreset` i denna fil).

- [ ] **Step 3: Runtime-verifiering**

Run: `npm run dev` och öppna `/explore`.
Expected: sex profil-knappar (Utforska, Kulturgeograf, Lingvist, Arkeolog, Handelshistoriker, Genetiker) med rätt ikoner; klick markerar aktiv och uppdaterar badgen.

- [ ] **Step 4: Commit**

```bash
git add src/components/panels/PanelLayoutSelector.tsx
git commit -m "$(cat <<'EOF'
feat(explore): profil-väljaren renderar de sex profilerna från config

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 7: `usePanelManager` + `useLayoutManager` härleds från profil

**Files:**
- Modify: `src/hooks/usePanelManager.ts`
- Modify: `src/hooks/useLayoutManager.ts`
- Modify: `src/components/map/MapCore.tsx` (rad 39: `=== 'explorer'` → `=== 'explore'`)
- Modify: `src/components/explorer/ExplorerLayout.tsx` (rad 127: `=== 'explorer'` → `=== 'explore'`)
- Add pure helper + test in `src/config/exploreProfiles.ts` / `.test.ts` (`profileToPanels`)

**Interfaces:**
- Consumes: `useActiveExploreProfile` (Task 4), `deriveLayoutFlags`, `PROFILE_SEEDS` (Task 2).
- Produces: `profileToPanels(profile: ExploreProfile): Record<string, PanelConfig-lik>`; `usePanelManager` behåller sin publika retur-yta (Global Constraints).

- [ ] **Step 1: Skriv failing test för `profileToPanels`**

Lägg till i `src/config/exploreProfiles.test.ts`:

```ts
import { profileToPanels } from "./exploreProfiles";

describe("profileToPanels", () => {
  it("map is always visible; profile drives legend/results/filters visibility", () => {
    const panels = profileToPanels(seed("geographer"));
    expect(panels.map.visible).toBe(true);
    expect(panels.filters.visible).toBe(false); // geographer maximizes the map
    expect(panels.legend.visible).toBe(true);
  });
  it("minimized emphasis maps to minimized:true", () => {
    const panels = profileToPanels(seed("explore"));
    expect(panels.filters.visible).toBe(true);
    expect(panels.filters.minimized).toBe(true);
  });
});
```

- [ ] **Step 2: Kör testet — förvänta FAIL**

Run: `npx vitest run src/config/exploreProfiles.test.ts -t profileToPanels`
Expected: FAIL — `profileToPanels is not a function`.

- [ ] **Step 3: Lägg till `profileToPanels` i `exploreProfiles.ts`**

Lägg till (efter `emphasisStyle`):

```ts
export interface ResolvedPanel {
  id: string;
  visible: boolean;
  minimized: boolean;
  position: { x: number; y: number };
  size: { width: number; height: number };
  zIndex: number;
}

const PANEL_GEOMETRY: Record<string, Omit<ResolvedPanel, "visible" | "minimized">> = {
  map: { id: "map", position: { x: 0, y: 0 }, size: { width: 100, height: 600 }, zIndex: 1 },
  legend: { id: "legend", position: { x: 0, y: 20 }, size: { width: 300, height: 500 }, zIndex: 1000 },
  results: { id: "results", position: { x: 20, y: 110 }, size: { width: 380, height: 480 }, zIndex: 1001 },
  search: { id: "search", position: { x: 420, y: 110 }, size: { width: 320, height: 450 }, zIndex: 1002 },
  filters: { id: "filters", position: { x: 20, y: 20 }, size: { width: 320, height: 500 }, zIndex: 1003 },
};

export const profileToPanels = (profile: ExploreProfile): Record<string, ResolvedPanel> => {
  const state = (key: PanelKey) => {
    const s = profile.panels[key];
    return { visible: s.visible, minimized: s.emphasis === "minimized" };
  };
  return {
    map: { ...PANEL_GEOMETRY.map, visible: true, minimized: false },
    legend: { ...PANEL_GEOMETRY.legend, ...state("legend") },
    results: { ...PANEL_GEOMETRY.results, ...state("results") },
    search: { ...PANEL_GEOMETRY.search, ...state("search") },
    filters: { ...PANEL_GEOMETRY.filters, ...state("filters") },
  };
};
```

- [ ] **Step 4: Kör testet — förvänta PASS**

Run: `npx vitest run src/config/exploreProfiles.test.ts -t profileToPanels`
Expected: PASS.

- [ ] **Step 5: Skriv om `usePanelManager` att härleda från profil**

Ersätt hela `src/hooks/usePanelManager.ts` med:

```ts
import { useCallback } from "react";
import { useActiveExploreProfile, useExploreProfiles } from "./useExploreProfiles";
import { useActiveExploreRole, setActiveExploreRole } from "./useActiveExploreRole";
import { profileToPanels, normalizeProfileId, type ResolvedPanel } from "@/config/exploreProfiles";

/** Bakåtkompatibel typ som paneler-komponenterna importerar. */
export type PanelConfig = ResolvedPanel;

export interface PanelPreset {
  name: string;
  description: string;
}

export const usePanelManager = () => {
  const activeProfile = useActiveExploreProfile();
  const profiles = useExploreProfiles();
  const activePreset = useActiveExploreRole();

  const panels = profileToPanels(activeProfile);

  // Presets härleds från profillistan (för legacy-konsumenter, t.ex. admin-vyn).
  const presets: Record<string, PanelPreset> = Object.fromEntries(
    profiles.map((p) => [p.id, { name: p.label.sv, description: p.description.sv }]),
  );

  const applyPreset = useCallback((presetName: string) => {
    setActiveExploreRole(normalizeProfileId(presetName));
  }, []);

  // Panelgeometri är nu profil-styrd; drag/resize/toggle är no-ops som bevarar API-ytan.
  const noop = useCallback(() => {}, []);

  return {
    panels,
    activePreset,
    presets,
    updatePanel: noop as (panelId: string, updates: Partial<PanelConfig>) => void,
    togglePanelVisibility: noop as (panelId: string) => void,
    togglePanelMinimized: noop as (panelId: string) => void,
    setPanelPosition: noop as (panelId: string, position: { x: number; y: number }) => void,
    setPanelSize: noop as (panelId: string, size: { width: number; height: number }) => void,
    applyPreset,
    resetToDefaults: useCallback(() => setActiveExploreRole("explore"), []),
  };
};
```

- [ ] **Step 6: Skriv om `useLayoutManager`**

Ersätt hela `src/hooks/useLayoutManager.ts` med:

```ts
import { usePanelManager } from "./usePanelManager";
import { useActiveExploreProfile } from "./useExploreProfiles";
import { deriveLayoutFlags } from "@/config/exploreProfiles";

export const useLayoutManager = () => {
  const { panels, activePreset } = usePanelManager();
  const profile = useActiveExploreProfile();
  const flags = deriveLayoutFlags(profile);

  return {
    panels,
    activePreset,
    shouldShowControls: flags.shouldShowControls,
    shouldShowMap: flags.shouldShowMap,
    shouldShowFilters: flags.shouldShowFilters,
    shouldShowTimeline: flags.shouldShowTimeline,
  };
};
```

- [ ] **Step 7: Uppdatera de två strängcheckarna**

I `src/components/map/MapCore.tsx` rad 39, ändra:
```ts
  const showLegend = activePreset === 'explorer';
```
till:
```ts
  const showLegend = activePreset === 'explore';
```

I `src/components/explorer/ExplorerLayout.tsx` rad 127, ändra:
```ts
  const isExplorerMode = activePreset === 'explorer';
```
till:
```ts
  const isExplorerMode = activePreset === 'explore';
```

- [ ] **Step 8: Verifiera build + runtime**

Run: `npx tsc --noEmit && npx vite build`
Expected: grönt (panel-komponenter som importerar `PanelConfig` kompilerar mot alias-typen).

Run: `npm run dev`, `/explore`, växla profiler.
Expected: panellayouten ändras synligt — Kulturgeograf döljer filter (maximerad karta), Lingvist visar resultat+filter, m.m.

- [ ] **Step 9: Commit**

```bash
git add src/config/exploreProfiles.ts src/config/exploreProfiles.test.ts src/hooks/usePanelManager.ts src/hooks/useLayoutManager.ts src/components/map/MapCore.tsx src/components/explorer/ExplorerLayout.tsx
git commit -m "$(cat <<'EOF'
refactor(explore): panellayout + layout-flaggor härleds från aktiv profil

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 8: Dynamisk baskarta per profil

**Files:**
- Modify: `src/hooks/useMapTileLayer.ts`
- Modify: `src/hooks/useMapInitialization.ts`

**Interfaces:**
- Consumes: `getBasemapConfig`, `BasemapId` (Task 1); `useActiveExploreProfile` (Task 4).
- Produces: `useMapTileLayer` tar `basemap: BasemapId` istället för `isVikingMode`.

- [ ] **Step 1: Skriv om `useMapTileLayer` att ta `basemap`**

Ersätt hela `src/hooks/useMapTileLayer.ts` med:

```ts
import { useEffect, useRef } from "react";
import L from "leaflet";
import { getBasemapConfig, type BasemapId } from "@/config/exploreCapabilities";

interface UseMapTileLayerProps {
  map: L.Map | null;
  basemap: BasemapId;
  enabledLegendItems: { [key: string]: boolean };
  isMapReady: React.MutableRefObject<boolean>;
  mapContainer: React.RefObject<HTMLDivElement>;
  safelyAddLayer: (layer: L.Layer) => boolean;
}

export const useMapTileLayer = ({
  map,
  basemap,
  isMapReady,
  mapContainer,
  safelyAddLayer,
}: UseMapTileLayerProps) => {
  const currentTileLayer = useRef<L.TileLayer | null>(null);

  useEffect(() => {
    if (!map || !isMapReady.current || !mapContainer.current) return;
    if (!document.contains(mapContainer.current)) return;

    if (currentTileLayer.current) {
      try {
        currentTileLayer.current.remove();
      } catch (error) {
        console.error("Error removing tile layer:", error);
      }
    }

    const cfg = getBasemapConfig(basemap);
    const tileLayer = L.tileLayer(cfg.url, {
      attribution: cfg.attribution,
      maxZoom: cfg.maxZoom,
      opacity: 1.0,
      className: cfg.className,
    });

    if (safelyAddLayer(tileLayer)) {
      currentTileLayer.current = tileLayer;
    }

    return () => {
      if (currentTileLayer.current) {
        try {
          currentTileLayer.current.remove();
        } catch (error) {
          console.error("Error removing tile layer on cleanup:", error);
        }
      }
    };
  }, [map, basemap, isMapReady, mapContainer, safelyAddLayer]);

  return { currentTileLayer };
};
```

- [ ] **Step 2: Trådа baskartan i `useMapInitialization`**

I `src/hooks/useMapInitialization.ts`:

Lägg till import högst upp (efter rad 8):
```ts
import { useActiveExploreProfile } from './useExploreProfiles';
```

Inuti hooken, efter `const { mapContainer, map } = useMapInstance({ isVikingMode });` (rad 29), lägg till:
```ts
  const activeProfile = useActiveExploreProfile();
```

Ersätt `useMapTileLayer`-anropet (raderna 65-72):
```ts
  useMapTileLayer({ 
    map: map.current, 
    isVikingMode, 
    enabledLegendItems,
    isMapReady: isMapReadyRef,
    mapContainer,
    safelyAddLayer
  });
```
med:
```ts
  useMapTileLayer({
    map: map.current,
    basemap: activeProfile.basemap,
    enabledLegendItems,
    isMapReady: isMapReadyRef,
    mapContainer,
    safelyAddLayer,
  });
```

- [ ] **Step 3: Verifiera build + runtime**

Run: `npx tsc --noEmit && npx vite build`
Expected: grönt.

Run: `npm run dev`, `/explore`, växla mellan Lingvist (ljus CartoDB), Kulturgeograf/Arkeolog (terräng) och Utforska/Handel/Genetiker (OSM).
Expected: bakgrundskartan byts synligt vid profilbyte.

- [ ] **Step 4: Commit**

```bash
git add src/hooks/useMapTileLayer.ts src/hooks/useMapInitialization.ts
git commit -m "$(cat <<'EOF'
feat(explore): baskartan styrs av aktiv profil (osm/terrain/light)

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 9: Lagerstack från löst profil-preset

**Files:**
- Modify: `src/hooks/useLegendManager.ts`
- Modify: `src/components/explorer/hooks/useExplorerData.ts`

**Interfaces:**
- Consumes: `resolveProfileLayers` (Task 2), `useActiveExploreProfile` (Task 4), `useFocusManager`.
- Produces: `useLegendManager(inscriptions, isVikingMode, selectedTimePeriod, roleLayerPreset: LegendPreset, dbStats?, hasActiveSearch?, searchResultInscriptions?)` — 4:e argumentet är nu ett färdiglöst preset istället för en roll-sträng.

- [ ] **Step 1: Ändra `useLegendManager`-signaturen**

I `src/hooks/useLegendManager.ts`:

Ersätt raderna 7-9:
```ts
import { getCombinedLegendPresets, UserRole } from './legend/rolePresets';
import { useChristianSites } from './useChristianSites';
import type { LegendPreset } from '@/types/legend';
```
med:
```ts
import { useChristianSites } from './useChristianSites';
import type { LegendPreset } from '@/types/legend';
```

Ersätt raderna 11-19 (parameterlistan):
```ts
export const useLegendManager = (
  inscriptions: any[],
  isVikingMode: boolean,
  selectedTimePeriod: string,
  userRole: UserRole = 'explorer',
  dbStats?: any,
  hasActiveSearch?: boolean,
  searchResultInscriptions?: any[]
) => {
```
med:
```ts
export const useLegendManager = (
  inscriptions: any[],
  isVikingMode: boolean,
  selectedTimePeriod: string,
  roleLayerPreset: LegendPreset,
  dbStats?: any,
  hasActiveSearch?: boolean,
  searchResultInscriptions?: any[]
) => {
```

Ersätt effekten (raderna 27-33):
```ts
  useEffect(() => {
    console.log(`🎭 Legend Manager: Focus changed to -> ${currentFocus}, Role: ${userRole}. Updating presets.`);
    const presets = getCombinedLegendPresets(userRole, currentFocus);
    // Convert LegendPreset to generic object
    const presetsObject: { [key: string]: boolean } = { ...presets };
    setEnabledLegendItems(presetsObject);
  }, [currentFocus, userRole]);
```
med:
```ts
  useEffect(() => {
    setEnabledLegendItems({ ...roleLayerPreset });
  }, [roleLayerPreset]);
```

> **Not:** `currentFocus` används fortfarande i loggen längre ned (rad 38); `useFocusManager()`-anropet (rad 20) behålls. Fokus-mergen görs nu uppströms i `useExplorerData` (Steg 2), så preset:et som kommer in är redan fokusjusterat.

- [ ] **Step 2: Lös profil-preset i `useExplorerData` och skicka in det**

I `src/components/explorer/hooks/useExplorerData.ts`:

Ersätt raderna 6-7:
```ts
import { useActiveExploreRole } from '@/hooks/useActiveExploreRole';
import { useQueryClient } from '@tanstack/react-query';
```
med:
```ts
import { useActiveExploreProfile } from '@/hooks/useExploreProfiles';
import { resolveProfileLayers } from '@/config/exploreProfiles';
import { useQueryClient } from '@tanstack/react-query';
```

Ersätt rad 25:
```ts
  const activeRole = useActiveExploreRole();
```
med:
```ts
  const activeProfile = useActiveExploreProfile();
```

Efter `selectedTimePeriod`-memon (efter rad 57), lägg till den lösta lager-preseten:
```ts
  const roleLayerPreset = useMemo(
    () => resolveProfileLayers(activeProfile, currentFocus),
    [activeProfile, currentFocus],
  );
```

Ersätt `useLegendManager`-anropet (raderna 82-90) — byt 4:e argumentet från `activeRole` till `roleLayerPreset`:
```ts
  } = useLegendManager(
    inscriptions,
    false,
    selectedTimePeriod,
    activeRole,
    dbStats,
    hasActiveSearch,
    inscriptions
  );
```
med:
```ts
  } = useLegendManager(
    inscriptions,
    false,
    selectedTimePeriod,
    roleLayerPreset,
    dbStats,
    hasActiveSearch,
    inscriptions
  );
```

- [ ] **Step 3: Verifiera build + runtime**

Run: `npx tsc --noEmit && npx vite build`
Expected: grönt.

Run: `npm run dev`, `/explore`, växla profiler.
Expected: tända lager ändras per profil (Kulturgeograf: härader/socknar/regioner/vägar; Lingvist: ortnamn/ristare/gudar; Handel: handelsvägar/städer). Fokus-rutter (`?focus=gods`, `?focus=rivers`) fungerar fortfarande.

- [ ] **Step 4: Commit**

```bash
git add src/hooks/useLegendManager.ts src/components/explorer/hooks/useExplorerData.ts
git commit -m "$(cat <<'EOF'
refactor(explore): legend-lager kommer från löst profil-preset (+ fokus uppströms)

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 10: Symbologi — tema + primärlager-betoning

**Files:**
- Modify: `src/hooks/useMapMarkers.ts` (härled emphasis per lagernyckel och applicera opacitet)
- Modify: `src/components/map/layers/PlaceNamesLayer.tsx` (emphasis på ortnamnsmarkörer)
- Modify: `src/components/map/layers/TradeRoutesLayer.tsx` (emphasis på rutt-polylines)

> **Scope-not:** Denna runda applicerar tema+betoning på huvudlagren via `emphasisStyle`. Full data-driven omsymbolisering (färg per period/namnelement) ligger utanför scope (nästa dimension). Betoningen läses från aktiv profil via `useActiveExploreProfile().primaryLayers`.

**Interfaces:**
- Consumes: `layerEmphasis`, `emphasisStyle` (Task 2), `useActiveExploreProfile` (Task 4).

- [ ] **Step 1: Applicera emphasis på ortnamnslagret**

I `src/components/map/layers/PlaceNamesLayer.tsx`:

Lägg till import (bland de övriga importerna högst upp):
```tsx
import { useActiveExploreProfile } from "@/hooks/useExploreProfiles";
import { layerEmphasis, emphasisStyle } from "@/config/exploreProfiles";
```

Inuti komponentfunktionen (nära toppen, efter övriga hook-anrop), lägg till:
```tsx
  const activeProfile = useActiveExploreProfile();
  const emphasis = emphasisStyle(layerEmphasis(activeProfile, "place_names"));
```

Där varje markörs `L.divIcon`/`L.marker` skapas, sätt lager-opaciteten. Om markörerna läggs i en `L.layerGroup` med referens (t.ex. `layerGroupRef.current`), lägg till efter att gruppen fyllts:
```tsx
  // Dämpa hela lagret när profilen inte har ortnamn som primärlager.
  layerGroupRef.current?.eachLayer((layer: any) => {
    if (typeof layer.setOpacity === "function") layer.setOpacity(emphasis.opacity);
  });
```

> Om lagret använder `divIcon` (ingen `setOpacity`), sätt istället `opacity` på markören vid skapande: `L.marker(pos, { icon, opacity: emphasis.opacity })`.

- [ ] **Step 2: Applicera emphasis på handelsvägslagret**

I `src/components/map/layers/TradeRoutesLayer.tsx`:

Lägg till importerna (som i Steg 1) och hämta:
```tsx
  const activeProfile = useActiveExploreProfile();
  const emphasis = emphasisStyle(layerEmphasis(activeProfile, "trade_routes"));
```

Där rutt-`L.polyline` skapas, lägg `opacity: emphasis.opacity` till dess options (och multiplicera eventuell befintlig opacitet: `opacity: baseOpacity * emphasis.opacity`).

- [ ] **Step 3: Applicera emphasis på inskriftsmarkörer**

I `src/hooks/useMapMarkers.ts`, hämta aktiv profil och beräkna emphasis för `runic_inscriptions`:

Lägg till import:
```ts
import { useActiveExploreProfile } from './useExploreProfiles';
import { layerEmphasis, emphasisStyle } from '@/config/exploreProfiles';
```

Nära hookens topp:
```ts
  const activeProfile = useActiveExploreProfile();
  const inscriptionEmphasis = emphasisStyle(layerEmphasis(activeProfile, 'runic_inscriptions'));
```

Där inskriftsmarkörer skapas, sätt `opacity: inscriptionEmphasis.opacity` i `L.marker`-options (eller `.setOpacity(...)` efter skapande).

- [ ] **Step 4: Verifiera build + runtime**

Run: `npx tsc --noEmit && npx vite build`
Expected: grönt.

Run: `npm run dev`, `/explore`.
Expected: i Lingvist framträder ortnamn (full opacitet) medan sekundära lager är dämpade; i Handel framträder handelsvägar; i Utforska framträder runstenar. Icke-primära lager är synligt nedtonade.

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useMapMarkers.ts src/components/map/layers/PlaceNamesLayer.tsx src/components/map/layers/TradeRoutesLayer.tsx
git commit -m "$(cat <<'EOF'
feat(explore): symbologi — primärlager i full mättnad, sekundära dämpade

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 11: Koppla in tidsreglaget

**Files:**
- Modify: `src/components/explorer/hooks/useExplorerData.ts` (`selectedTimePeriod` → state, init från profil; exponera `setSelectedTimePeriod` + `showTimeline`)
- Modify: `src/components/explorer/ExplorerMain.tsx` (skicka vidare `setSelectedTimePeriod`)
- Modify: `src/components/explorer/ExplorerLayout.tsx` (rad 423: byt no-op mot riktig setter)

**Interfaces:**
- Consumes: `useActiveExploreProfile` (Task 4).
- Produces: `useExplorerData` returnerar `selectedTimePeriod`, `setSelectedTimePeriod: (v: string) => void`, `showTimeline: boolean`.

- [ ] **Step 1: Gör `selectedTimePeriod` till state i `useExplorerData`**

I `src/components/explorer/hooks/useExplorerData.ts`:

Säkerställ `useState` finns i React-importen (rad 2 importerar redan `useState`).

Ersätt `selectedTimePeriod`-memon (raderna 47-57):
```ts
  // Automatically switch to appropriate periods for different focuses
  const selectedTimePeriod = useMemo(() => {
    if (currentFocus === 'rivers') {
      console.log('🌊 Rivers focus detected - switching to viking_age time period');
      return 'viking_age';
    }
    if (currentFocus === 'inscriptions') {
      console.log('📿 Inscriptions focus detected - switching to viking_age time period');
      return 'viking_age';
    }
    return 'all';
  }, [currentFocus]);
```
med:
```ts
  // Startperiod = profilens default; focus kan tvinga viking_age; reglaget kan sedan ändra.
  const [selectedTimePeriod, setSelectedTimePeriod] = useState<string>(activeProfile.defaultPeriod);

  useEffect(() => {
    if (currentFocus === 'rivers' || currentFocus === 'inscriptions') {
      setSelectedTimePeriod('viking_age');
    } else {
      setSelectedTimePeriod(activeProfile.defaultPeriod);
    }
  }, [currentFocus, activeProfile.id, activeProfile.defaultPeriod]);
```

I retur-objektet, efter `selectedTimePeriod,` (rad 175), lägg till:
```ts
    setSelectedTimePeriod,
    showTimeline: activeProfile.showTimeline,
```

- [ ] **Step 2: Tråda settern genom `ExplorerMain` → `ExplorerLayout`**

I `src/components/explorer/ExplorerMain.tsx`, där `useExplorerData(...)` destруктureras, lägg till `setSelectedTimePeriod` och `showTimeline` i destrukturering och skicka dem som props till `<ExplorerLayout ... />` (matcha komponentens övriga prop-vidareföring).

Run (hitta anropspunkten först): `grep -n "selectedTimePeriod" src/components/explorer/ExplorerMain.tsx` — lägg `setSelectedTimePeriod`/`showTimeline` intill befintlig `selectedTimePeriod`-prop.

- [ ] **Step 3: Byt no-op mot riktig setter i `ExplorerLayout`**

I `src/components/explorer/ExplorerLayout.tsx`:

Lägg till `setSelectedTimePeriod` i komponentens props-interface (nära `onPeriodChange` rad 64 / `selectedTimePeriod` rad 75) och i destruktureringen (nära rad 122):
```ts
  setSelectedTimePeriod?: (value: string) => void;
```

Ersätt `TimelineModule`-wiringen (rad 423):
```tsx
            onPeriodChange={() => {}}
```
med:
```tsx
            onPeriodChange={(value: string) => setSelectedTimePeriod?.(value)}
```

- [ ] **Step 4: Verifiera build + runtime**

Run: `npx tsc --noEmit && npx vite build`
Expected: grönt.

Run: `npm run dev`, `/explore`.
Expected: att dra tidsreglaget filtrerar kartlagren (period-filtrering slår igenom). Lingvist-profilen visar inget reglage (`showTimeline: false`); övriga visar det. Handel startar i `viking_age`.

- [ ] **Step 5: Commit**

```bash
git add src/components/explorer/hooks/useExplorerData.ts src/components/explorer/ExplorerMain.tsx src/components/explorer/ExplorerLayout.tsx
git commit -m "$(cat <<'EOF'
fix(explore): koppla tidsreglaget till selectedTimePeriod (no-op-buggen borta)

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 12: Städning + slutverifiering

**Files:**
- Modify: `src/hooks/legend/rolePresets.ts` (ta bort död kod om inga andra konsumenter)
- Verify: hela sviten

**Interfaces:** inga nya.

- [ ] **Step 1: Kontrollera kvarvarande konsumenter av gammal roll-logik**

Run: `grep -rn "getCombinedLegendPresets\|getRoleBasedLegendPresets\|legend/rolePresets" src`
Expected: endast `src/hooks/legend/rolePresets.ts` självt (definitionen). Om andra filer dyker upp — uppdatera dem att använda `resolveProfileLayers`/`ProfileId` innan borttagning.

- [ ] **Step 2: Ta bort död roll-logik**

Om Steg 1 visar inga externa konsumenter: i `src/hooks/legend/rolePresets.ts`, behåll enbart en bakåtkompatibel typ-export och ta bort `getRoleBasedLegendPresets` + `getCombinedLegendPresets`. Ersätt filens innehåll med:

```ts
import type { ProfileId } from '@/config/exploreProfiles';

/** @deprecated Använd ProfileId från @/config/exploreProfiles. Behålls som alias. */
export type UserRole = ProfileId;
```

- [ ] **Step 3: Kör hela testsviten**

Run: `npx vitest run`
Expected: alla test gröna (searchFilter + exploreCapabilities + exploreProfiles).

- [ ] **Step 4: Full typecheck + build**

Run: `npx tsc --noEmit && npx vite build`
Expected: `tsc` rent; `vite build` grönt utan nya varningar.

- [ ] **Step 5: Runtime-QA över alla sex profiler**

Run: `npm run dev` och gå igenom `/explore`:
- [ ] Varje profil byter **baskarta** synligt (light/terrain/osm).
- [ ] Varje profil tänder **rätt lager** enligt matrisen (avsnitt 5 i speccen).
- [ ] **Primärlager** framträder, sekundära är dämpade.
- [ ] **Panellayouten** ändras (geograf maximerar karta; lingvist visar resultat+filter).
- [ ] **Tidsreglaget** driver lagren; lingvisten saknar reglage.
- [ ] Legacy-localStorage (`activePreset: 'explorer'`) laddar utan krasch (→ Utforska).
- [ ] Fokus-rutter (`?focus=gods`, `?focus=rivers`, `?focus=carvers`) fungerar oförändrat.
- [ ] Med `explore_profiles`-tabellen tom/otillgänglig faller appen tillbaka på seeds (simulera: byt namn på tabellen i en testmiljö, eller blockera nätverket för queryn) och fungerar ändå.

- [ ] **Step 6: Commit**

```bash
git add src/hooks/legend/rolePresets.ts
git commit -m "$(cat <<'EOF'
chore(explore): städa död roll-preset-logik, behåll UserRole-alias

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Self-Review-anteckningar (spec-täckning)

- Spec §4 (datamodell/config-hem) → Task 1 (register), 2 (typer/seeds/fallback), 3 (tabell), 4 (hook + fallback). ✓
- Spec §5 (roster/matris) → Task 2 (`PROFILE_SEEDS`), 3 (seed). ✓
- Spec §6.1 arkitektur (state enas, baskarta, tid, symbologi, panelstädning, legend-presets) → Task 5 (state), 8 (baskarta), 11 (tid), 10 (symbologi), 7 (paneler), 9 (legend). ✓
- Spec §7 (tester) → rena tester i Task 1/2/7; runtime-QA i Task 12. ✓
- Spec §8 acceptanskriterier 1-6 → Task 3 (1), 4 (2), 5-9 (3), 6-11 (4), 11 (5), 12 (6). ✓
- Öppna frågor §10: (1) teman återanvänder Tailwind-nära hex-accenter (`THEME_ACCENTS`, Task 1) — ingen ny palett-motor; (2) `light`-baskartan = CartoDB Positron med attribuering (Task 1) — faller tillbaka på `osm` via `getBasemapConfig` vid behov.
