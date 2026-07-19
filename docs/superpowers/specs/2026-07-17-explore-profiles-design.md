# Intresseprofiler — enad Explore-config (grundrunda)

**Datum:** 2026-07-17
**Status:** Design godkänd, redo för implementeringsplan
**Författare:** Daniel Larsson (Expandtalk) m. Claude Code

---

## 1. Sammanfattning

Explore-vyn har redan ett läges-system (fyra roller: `explorer`, `linguist`,
`geographer`, `researcher`), men det upplevs otydligt. Rotorsaken är arkitektonisk:
"profilen" bor på **tre ställen** — `LAYOUT_PRESETS` (`usePanelManager.ts`),
flagg-logik (`useLayoutManager.ts`) och lager-presets (`legend/rolePresets.ts`) — med
**två parallella state-vägar** (`usePanelManager`s per-instans-`activePreset` och den
delade `useActiveExploreRole`-storen) som bryggas för hand i `PanelLayoutSelector`.

Denna grundrunda **enar profilen till en config-källa** och gör varje läge **synligt
distinkt** över fem dimensioner: baskarta, lagerstack, symbologi, tid och panellayout.
Rostern formas om till **disciplinära profiler som befintlig data bär**. Ingen ny extern
data introduceras.

Grunden är fundamentet för senare rundor (komponerbara profiler, ny data som strandlinje/
LiDAR/Fornsök, symbologi-motor, analysverktyg) — se avsnitt 9.

---

## 2. Bakgrund: nuläget i koden

- **Roller/presets:** `explorer | linguist | geographer | researcher`
  (`legend/rolePresets.ts:3`, `useActiveExploreRole.ts:15`).
- **Skiljer sig idag på två sätt:** panellayout (`usePanelManager` + `useLayoutManager`)
  och default tända lager (`getRoleBasedLegendPresets` i `rolePresets.ts`).
- **Två parallella state-vägar** keyade på samma localStorage-`activePreset`, bryggade i
  `PanelLayoutSelector.tsx:70-74` (dokumenterat i `useActiveExploreRole.ts:4-13`).
- **Baskartan är i praktiken hårdkodad OSM** — `useMapTileLayer.ts` växlar bara på
  `isVikingMode`, som är hårdkodat `false` i Explore-flödet.
- **Tidsreglaget är frånkopplat** — `TimelineModule` renderas men wiras med
  `onPeriodChange={() => {}}` i `ExplorerLayout.tsx` (latent bugg).
- **Panelgeometrin är vestigial** — `PanelConfig` bär x/y/zIndex/size men rendering sker
  via flex/absolut layout i `LayoutContent`, inte via de värdena.

Av användarens fem dimensioner finns alltså i praktiken bara **lagerstack** och
**panellayout**; baskarta, symbologi och tid saknas som profil-styrda dimensioner.

---

## 3. Scope-beslut

| Fråga | Beslut |
|---|---|
| Vad rundan levererar | **Grund: ena config-källan + särskilj lägena.** Nuvarande stack, ingen ny extern data. |
| Roster | **Disciplinära profiler som data bär** (avsnitt 5). |
| Config-hem | **Supabase-tabell `explore_profiles` + typad kod-fallback**, capability-register i kod (avsnitt 4). |
| Symbologi-djup | **Tema + primärlager-betoning** (ingen omsymbolisering per lins ännu). |
| State-modell | **Exklusivt val** (en aktiv profil). Komponerbarhet är nästa runda. |

---

## 4. Datamodell & config-hem

En profil består av två sorters innehåll, och seamet mellan dem är medvetet:

- **Konfiguration (ren data)** → i Supabase: vilka lager som är tända, baskarta,
  startperiod, panelsynlighet, `primaryLayers`, labels/beskrivningar.
- **Maskineri (koddbundet)** → i kod: vilket lager en nyckel ritar, symbologi-rendering,
  tema-tokens, ikoner. DB:n bär *rattarna*, inte *maskinen*.

### 4.1 TypeScript-form (`ExploreProfile`) — radform + fallback

Lever i `src/config/exploreProfiles.ts` som (a) typad radform och (b) seed/fallback.

```ts
type ProfileId = 'explore' | 'geographer' | 'linguist'
               | 'archaeologist' | 'trade' | 'geneticist';

type BasemapId = 'osm' | 'terrain' | 'light';           // framtid: 'shoreline' | 'lidar'
type ThemeId   = 'neutral' | 'earth' | 'typology' | 'chronology' | 'flow' | 'genetic';
type PanelState = { visible: boolean; emphasis?: 'primary' | 'minimized' };

interface ExploreProfile {
  id: ProfileId;
  sortOrder: number;
  label:       { sv: string; en: string };
  description: { sv: string; en: string };
  icon:        string;                    // capability-registernyckel, ej komponenten

  basemap:       BasemapId;               // 1. baskarta
  layers:        Partial<LegendPreset>;   // 2. lagerstack: default tända
  theme:         ThemeId;                 // 3a. symbologi: accent-tema
  primaryLayers: string[];                // 3b. full mättnad; övriga dämpas
  defaultPeriod: TimePeriod;              // 4. tid: startperiod
  showTimeline:  boolean;                 // 4. tid: reglaget aktivt?
  panels: Record<'legend'|'results'|'search'|'filters', PanelState>; // 5. panellayout
}
```

### 4.2 Supabase-tabell `explore_profiles`

| kolumn | typ | not |
|---|---|---|
| `id` | text PK | = `ProfileId` (`explore`, `geographer`, …) |
| `sort_order` | int NOT NULL | ordning i väljaren |
| `is_active` | boolean NOT NULL default true | dölj profil utan att radera |
| `label` | jsonb NOT NULL | `{sv,en}` |
| `description` | jsonb | `{sv,en}` |
| `config` | jsonb NOT NULL | `{icon, basemap, layers, theme, primaryLayers, defaultPeriod, showTimeline, panels}` |
| `created_at` / `updated_at` | timestamptz default now() | |

- **RLS:** `SELECT` för `anon` + `authenticated`; `INSERT/UPDATE/DELETE` endast via
  `is_admin()` (samma mönster som referensdata efter commit `0f89659` / `20260717120000`).
- **Seed:** migration seedar de sex profilerna från kod-seeds (avsnitt 5).
- **Migration appliceras** via SQL-editor + `supabase migration repair --status applied
  <version>` — **inte** `db push` (migrationshistoriken är trasig i detta repo).

### 4.3 Capability-register (kod)

`src/config/exploreCapabilities.ts` — enda källan för vad som är *giltigt* att referera:
giltiga lagernycklar (måste ha en renderande layer/hook), baskartor (`BasemapId` → tile-URL/
options), teman (`ThemeId` → tokens) och ikoner (`icon`-nyckel → Lucide-komponent).
`useExploreProfiles()` validerar DB-rader mot registret och droppar okända nycklar — så
DB:n aldrig kan peka på ett lager koden inte kan rita (drift-skydd).

### 4.4 Läsning & fallback

Ny hook `src/hooks/useExploreProfiles.ts` läser `explore_profiles` (TanStack Query),
validerar mot capability-registret, och **faller tillbaka på kod-seeds** om hämtningen
fallerar eller returnerar tomt (samma robusthetsmönster som env-fallback i
`integrations/supabase/client.ts`).

---

## 5. Profil-roster & matris

Sex profiler. Alla lagernycklar finns redan i systemet. Baskartor tillgängliga nu:
`osm`, `terrain` (Esri World Physical), `light` (CartoDB Positron).

| Profil | Baskarta | Default-lager (tända) | Primärlager (full mättnad) | Tid | Paneler |
|---|---|---|---|---|---|
| **Utforska** *(default)* | osm | runic_inscriptions, religious_places, viking_fortresses | runic_inscriptions | all, reglage på | legend + filter (min.) |
| **Kulturgeograf** | terrain | viking_regions, hundreds, parishes, folk_groups, river_routes, trade_routes, viking_roads, viking_cities | hundreds, parishes, viking_regions, river_routes | all, reglage på | karta maximerad |
| **Lingvist** | light | place_names, carvers, gods, runic_inscriptions | place_names, runic_inscriptions | all, reglage **av** | resultat + filter (höger) |
| **Arkeolog** | terrain | archaeological_sites, archaeological_finds, viking_fortresses, runic_inscriptions, battle_sites | archaeological_sites, runic_inscriptions | all, reglage på | resultat + filter + legend |
| **Handelshistoriker** | osm | trade_routes, trade_cities/viking_cities, river_routes, water_routes, valdemar_route, stake_barriers | trade_routes, viking_cities, river_routes | viking_age, reglage på | karta + legend |
| **Genetiker** | osm | archaeological_sites, geneticEvents (focus), runic_inscriptions | archaeological_sites + genetiska markörer | all, reglage på | genetik-panel + resultat |

**Noteringar:**
- **Lingvisten** har tidsreglaget av — profilen filtrerar på namnelement, inte period
  (godkänt beslut).
- **Genetikern** lutar sig på befintlig `GeneticEvolutionExplorerView` (`focus=geneticEvents`)
  — profilen defaultar dit snarare än att uppfinna ett nytt lager.
- **Symbologin** är enbart tema + primär/dämpad i denna runda. Färga runstenar *per period*
  (arkeolog) vs *per namnelement* (lingvist) är nästa runds "omsymbolisering per lins".

---

## 6. Arkitekturändringar

1. **State enas.** `useActiveExploreRole`-storen blir enda källan för aktiv profil;
   `usePanelManager`s per-instans-`activePreset` tas bort. Allt (layout-flaggor, lager,
   baskarta, symbologi, paneler) härleds från den aktiva profilens config.
   `PanelLayoutSelector` skriver en gång till storen.

2. **Baskartan blir dynamisk.** `useMapTileLayer` byter från `isVikingMode`-boolean till
   `basemap`-id och swappar Leaflet-`TileLayer` när profilen byts (ta bort gammalt lager,
   lägg till nytt). Tiles nu: `osm`, `terrain`, `light`. `shoreline`/`lidar` blir framtida
   id:n i samma fält.

3. **Tidsreglaget kopplas in.** `TimelineModule.onPeriodChange` kopplas till riktiga
   `selectedTimePeriod` (idag no-op i `ExplorerLayout`). Profilen sätter `defaultPeriod` +
   `showTimeline`. `selectedTimePeriod` blir state (profil-default + reglage), inte enbart
   härlett från focus.

4. **Symbologi: tema + emphasis.** Layers får en `emphasis`-signal (`primary` | `muted`)
   per lagernyckel härledd från profilens `primaryLayers`. Icke-primära lager renderas
   dämpade (lägre opacitet / avmättad `divIcon`-färg; polylines lägre opacitet). Appliceras
   på huvudlagren (inskrifter, ortnamn, arkeologiska platser, forten, handelsvägar,
   regioner/polygoner). Temat sätter accent-tokens.

5. **Panelmodellen städas.** Vestigial x/y/zIndex/size tas bort ur preset-formen;
   `profile.panels` (`visible` + `emphasis`) driver befintlig flex/absolut-layout i
   `LayoutContent`. `useLayoutManager`s hårdkodade sträng-checkar (`activePreset === …`)
   ersätts av härledning från profilens `panels`/`showTimeline`.

6. **`getCombinedLegendPresets(role, focus)`** behålls men läser lager-defaults från
   profilens `layers` istället för `getRoleBasedLegendPresets`; focus-overrides
   (`rivers/gods/…`) lämnas oförändrade ovanpå.

### 6.1 Berörda filer (preliminärt)

- **Nya:** `src/config/exploreProfiles.ts`, `src/config/exploreCapabilities.ts`,
  `src/hooks/useExploreProfiles.ts`, migration `explore_profiles` (SQL-editor).
- **Ändrade:** `useActiveExploreRole.ts` (typ → `ProfileId`), `legend/rolePresets.ts`
  (lager-defaults från profil), `usePanelManager.ts` + `useLayoutManager.ts` (härled från
  profil, drop geometri), `PanelLayoutSelector.tsx` (labels/ikoner/skriv en gång),
  `useMapTileLayer.ts` + `useMapInitialization.ts` (baskarta per id), marker-/layer-hooks
  och layer-komponenter (emphasis), `ExplorerLayout.tsx` (koppla reglaget),
  `useExplorerData.ts` (`selectedTimePeriod` som state).

---

## 7. Tester & verifiering

- **Enhetstester (Vitest):** profil-seeds validerar mot capability-registret (varje
  `layers`-nyckel/`basemap`/`theme`/`icon` finns i registret); `useExploreProfiles`
  fallback-väg (tom/felande DB → kod-seeds); `getCombinedLegendPresets(profile, focus)`
  merge-logik; `useActiveExploreRole`-normalisering av ogiltiga värden.
- **Runtime-QA:** varje profil ska *synligt* skilja sig — baskarta byts, rätt lager tända,
  primärlager framträder, panellayout ändras, reglaget driver lagren (utom lingvist).
  Verifieras end-to-end (qa/browse-skill) i `/explore`.

---

## 8. Acceptanskriterier

1. `explore_profiles`-tabell finns med RLS (publik läs, admin-skriv) och är seedad med de
   sex profilerna.
2. `useExploreProfiles()` läser tabellen och faller robust tillbaka på kod-seeds.
3. Profilen bor på **en** källa — de tre gamla ställena (`LAYOUT_PRESETS`, `useLayoutManager`
   sträng-checkar, `getRoleBasedLegendPresets`) läser/härleds från profilconfigen; de två
   parallella state-vägarna är ihopslagna till en.
4. Att byta profil byter **synligt**: baskarta, tända lager, primärlager-betoning,
   panellayout och (utom lingvist) tidsperiod.
5. Tidsreglaget driver `selectedTimePeriod` (no-op-buggen borta).
6. `tsc --noEmit` rent, `vite build` grönt, nya enhetstester gröna.

---

## 9. Utanför scope (nästa rundor, förberett)

- **Komponerbara profiler** (linser som staplas, ej exklusiva) — kräver ändrad state-modell.
- **Ny baskarte-data:** SGU strandlinjerekonstruktion, Lantmäteriet LiDAR-hillshade
  (`shoreline`/`lidar` är redan förberedda `BasemapId`-värden).
- **Profiler som kräver ny/tunn data:** Militärhistoriker (LiDAR), Religionshistoriker
  (`christian_sites` ~24 rader).
- **Omsymbolisering per lins** (data-driven styling: runstenar per period/namnelement).
- **Analysverktyg** (buffertanalys, siktlinjer, täthetskartor, nätverksgrafer) — läggs som
  ny dimension i `ExploreProfile`.
- **Ny data:** Fornsök/KMR, Isof äldsta belägg, K-samsök. PostGIS-migration om raster/
  geometrianalys behövs (stacken är lat/lng idag).
- **Admin-UI** för att redigera `explore_profiles` (tabellen möjliggör det; UI:t byggs senare).

---

## 10. Öppna frågor

1. **Tema-tokens:** ska teman återanvända befintliga Tailwind/designtokens, eller definieras
   nya accent-paletter per profil? (Förslag: återanvänd befintliga, minsta churn.)
2. **`light`-baskarta:** CartoDB Positron kräver attribuering — bekräfta att gratisnivån
   räcker för trafiken, annars falla tillbaka på OSM för lingvisten.
