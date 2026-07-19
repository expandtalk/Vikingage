import { Monitor, Globe, Microscope, Shovel, Ship, Dna, type LucideIcon } from "lucide-react";

export type BasemapId = "osm" | "terrain" | "light";

export interface BasemapConfig {
  url: string;
  attribution: string;
  maxZoom: number;        // hur långt kartan får zooma
  maxNativeZoom: number;  // sista zoom där källan HAR tiles (Leaflet skalar upp bortom)
  className: string;
}

export const BASEMAPS: Record<BasemapId, BasemapConfig> = {
  osm: {
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: "© OpenStreetMap contributors",
    maxZoom: 19,
    maxNativeZoom: 19,
    className: "modern-detailed-tiles",
  },
  terrain: {
    // Var World_Physical_Map (tiles bara till z~8) → "Map data not available" vid
    // inzoomning. World_Topo_Map har detaljerade tiles till z19.
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}",
    attribution: "Tiles © Esri — Esri, HERE, Garmin, USGS, NGA",
    maxZoom: 19,
    maxNativeZoom: 19,
    className: "viking-terrain-tiles",
  },
  light: {
    url: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
    attribution: "© OpenStreetMap contributors © CARTO",
    maxZoom: 20,
    maxNativeZoom: 20,
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
