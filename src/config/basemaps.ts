// Central baskarte-konfiguration. Idag OSM (extern, cookiefri raster). Förberedd för
// Lantmäteris "Topografisk webbkarta Visning" (CC0) — svensk topokarta i färg + nedtonad
// gråskala, idealisk som dämpad baskarta under våra datalager.
//
// PLUG-AND-PLAY: LM-valen dyker upp i baskarte-väljaren AUTOMATISKT så snart URL:erna finns
// i miljön (VITE_LM_TOPO_*). Tills dess är de `available:false` → ingen synlig ändring.
// När Geotorget-beställningen är aktiverad: sätt VITE_LM_TOPO_GRAY_URL (+ ev. _COLOR_URL) till
// WMTS-tile-mallen ({z}/{y}/{x} eller {z}/{x}/{y} beroende på tjänsten) och bygg om.
//
// Åtkomst-not: kräver token i anropet. Om token är hemlig → proxa via edge-funktion (server-
// side, cookiefritt) och peka URL:en dit. Tillåts URL-nyckel för CC0-visning → direkt som OSM.
// Skala: LM topo är ÖVERSIKT (<1:30 236 ≈ zoom ≤~14) → OSM som djupzoom-fallback (overviewOnly).

export interface Basemap {
  id: string;
  label: { sv: string; en: string };
  url: string;                 // Leaflet-/MapLibre-tile-mall
  subdomains?: string[];
  maxZoom: number;
  attribution: string;
  available: boolean;          // visas i väljaren bara om sant
  overviewOnly?: boolean;      // översiktsskala → byt till OSM vid djupzoom
}

const LM_GRAY = import.meta.env.VITE_LM_TOPO_GRAY_URL as string | undefined;
const LM_COLOR = import.meta.env.VITE_LM_TOPO_COLOR_URL as string | undefined;
const LM_ATTR = '© Lantmäteriet, Topografisk webbkarta (CC0)';
// Under vilken zoom LM-topo har tiles (översikt). Över detta faller vi tillbaka på OSM.
export const LM_OVERVIEW_MAX_ZOOM = 14;

export const OSM_BASEMAP: Basemap = {
  id: 'osm',
  label: { sv: 'Baskarta (OSM)', en: 'Base map (OSM)' },
  url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  subdomains: ['a', 'b', 'c'],
  maxZoom: 18,
  attribution: '© OpenStreetMap contributors',
  available: true,
};

export const BASEMAPS: Basemap[] = [
  OSM_BASEMAP,
  {
    id: 'lm-gray',
    label: { sv: 'Lantmäteri topografisk (nedtonad)', en: 'Lantmäteri topographic (muted)' },
    url: LM_GRAY ?? '',
    maxZoom: LM_OVERVIEW_MAX_ZOOM,
    attribution: LM_ATTR,
    available: !!LM_GRAY,
    overviewOnly: true,
  },
  {
    id: 'lm-color',
    label: { sv: 'Lantmäteri topografisk (färg)', en: 'Lantmäteri topographic (colour)' },
    url: LM_COLOR ?? '',
    maxZoom: LM_OVERVIEW_MAX_ZOOM,
    attribution: LM_ATTR,
    available: !!LM_COLOR,
    overviewOnly: true,
  },
];

export const DEFAULT_BASEMAP = OSM_BASEMAP;
export const availableBasemaps = (): Basemap[] => BASEMAPS.filter((b) => b.available);
export const getBasemap = (id: string): Basemap => BASEMAPS.find((b) => b.id === id) ?? OSM_BASEMAP;

// Skapar en Leaflet-tile-URL/options-tupel för en baskarta (leaflet importeras av anroparen).
export const leafletTileOptions = (b: Basemap) => ({
  url: b.url,
  options: { attribution: b.attribution, maxZoom: b.maxZoom, ...(b.subdomains ? { subdomains: b.subdomains } : {}) },
});
