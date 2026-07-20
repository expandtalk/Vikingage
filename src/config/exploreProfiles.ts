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
    layers: on(
      "runic_inscriptions", "religious_places", "viking_fortresses",
      "river_routes", "water_routes", "valdemar_route",
    ),
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
      "water_routes",
      "valdemar_route",
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
    // I synk med focus=rivers: hela vattennätverket + vägar + hamnar, inga runstenar.
    layers: on(
      "trade_routes",
      "viking_cities",
      "river_routes",
      "water_routes",
      "valdemar_route",
      "stake_barriers",
      "viking_roads",
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
    // Genetiker vill se folkslag + provplatser/DNA — INTE runstenar (de går inte att
    // stänga av om de är på). Runstenar utelämnas → false via EMPTY_LEGEND_PRESET.
    layers: on("archaeological_sites", "folk_groups"),
    theme: "genetic",
    primaryLayers: ["archaeological_sites", "folk_groups"],
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
      // Exclusive water/route view: show the water network + roads + ports,
      // and explicitly hide everything the active profile might otherwise add
      // (runestones, regions, folk groups, etc.) so the focus is actually the
      // rivers/roads/waterways the user asked for.
      Object.assign(o, {
        river_routes: true,
        water_routes: true,
        trade_routes: true,
        valdemar_route: true,
        eriksgatan: true,
        stake_barriers: true,
        viking_roads: true,
        viking_cities: true,
        runic_inscriptions: false,
        foreign_inscriptions: false,
        viking_fortresses: false,
        religious_places: false,
        viking_regions: false,
        hundreds: false,
        parishes: false,
        folk_groups: false,
        germanic_groups: false,
        germanic_timeline: false,
        carvers: false,
        gods: false,
        archaeological_finds: false,
        archaeological_sites: false,
        place_names: false,
        historical_events: false,
        battle_sites: false,
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
    case "cultSites":
      // Heliga källor & kultplatser: PLATSERNA i fokus (lista + karta), inga gudakort.
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
      // Folkgrupper + DNA/provplatser (arkeologiska platser med genetik) — INTE runstenar.
      Object.assign(o, {
        folk_groups: true,
        archaeological_sites: true,
        runic_inscriptions: false,
        foreign_inscriptions: false,
      });
      break;
    case "inscriptions":
      // Fokus på runinskrifterna själva — BÅDE svenska och utländska ifyllda.
      Object.assign(o, { runic_inscriptions: true, foreign_inscriptions: true });
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
