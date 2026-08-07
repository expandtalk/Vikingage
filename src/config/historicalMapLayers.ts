// Historiska/Lantmäteri-kartor som TOGGLEBARA OVERLAY-lager (opt-in, opacitets-styrda).
//
// Tiles serveras STATISKT från FTP-webbhotellet: public_html/map/tiles/<folder>/{z}/{x}/{y}.png
// (genererade av scripts/data/tile-historical-maps.sh → EPSG:3857 XYZ). Tills tiles laddats
// upp visar lagren inget (errorTileUrl = genomskinlig) — inget kraschar, allt är AV som default.
//
// Projektion: allt omprojiceras till 3857 vid tiling → samsas med befintliga vektorlager.
// Ingen Proj4Leaflet, inget kartsystem-byte. Se projektminnet map-raster-assets.

export interface HistoricalMapLayer {
  key: string;          // legend-toggle-nyckel
  labelSv: string;
  labelEn: string;
  tilesFolder: string;  // public_html/map/tiles/<folder>/
  attribution: string;
  opacity: number;      // overlay-opacitet (halvtransparent = se gamla namn + modern referens)
  maxNativeZoom: number;// sista zoom där tiles finns (Leaflet skalar upp bortom)
  minZoom?: number;
}

// Bas-URL för tiles. Kan pekas om via VITE_MAP_TILES_BASE om de läggs på annan host/CDN.
export const MAP_TILES_BASE =
  (import.meta.env?.VITE_MAP_TILES_BASE as string | undefined)?.replace(/\/$/, '') ||
  'https://vikingage.se/map/tiles';

export const tileUrl = (folder: string) => `${MAP_TILES_BASE}/${folder}/{z}/{x}/{y}.png`;

// De dataset som passar raster-overlay-spåret. (GSD-vektor & historicmaps-skeva blad kräver
// egna pipelines och ingår inte här; se DB-TODO/kart-status.)
const ALL_HISTORICAL_MAP_LAYERS: HistoricalMapLayer[] = [
  {
    key: 'histmap_haradsekonomiska', labelSv: 'Häradsekonomiska kartan', labelEn: 'Cadastral economic map (c. 1900)',
    tilesFolder: 'haradsekonomiska', attribution: 'Häradsekonomiska kartan © Lantmäteriet',
    opacity: 0.75, maxNativeZoom: 16, minZoom: 9,
  },
  {
    key: 'histmap_generalstab', labelSv: 'Generalstabskartan', labelEn: 'General Staff map (19th c.)',
    tilesFolder: 'generalstab', attribution: 'Generalstabskartan © Lantmäteriet',
    opacity: 0.7, maxNativeZoom: 15, minZoom: 6,
  },
  {
    key: 'histmap_karta10k', labelSv: 'Karta 1:10 000 (raster)', labelEn: 'Map 1:10,000 (raster)',
    tilesFolder: 'karta10k', attribution: '© Lantmäteriet',
    opacity: 0.8, maxNativeZoom: 16, minZoom: 10,
  },
  {
    key: 'histmap_topo', labelSv: 'Topografisk webbkarta', labelEn: 'Topographic web map',
    tilesFolder: 'topo', attribution: 'Topografisk webbkarta © Lantmäteriet',
    opacity: 1.0, maxNativeZoom: 17, minZoom: 4,
  },
  {
    key: 'histmap_relief', labelSv: 'Höjdrelief (terräng)', labelEn: 'Elevation hillshade',
    tilesFolder: 'relief', attribution: 'Höjddata Grid 50+ © Lantmäteriet (hillshade)',
    opacity: 0.5, maxNativeZoom: 15, minZoom: 5,
  },
];

// EJ LANSERADE ännu: tiles är inte uppladdade till FTP → overlays blir tomma/konstiga och
// "fylls i" utan att visa något vettigt (Daniel). Håll AV i UI tills tiles finns — flip till true
// när public_html/map/tiles/<folder>/ är uppladdat. Då dyker lagren upp i legenden igen automatiskt.
export const HISTORICAL_MAPS_LAUNCHED = false;
export const HISTORICAL_MAP_LAYERS: HistoricalMapLayer[] =
  HISTORICAL_MAPS_LAUNCHED ? ALL_HISTORICAL_MAP_LAYERS : [];

// Legend-parent för hela gruppen.
export const HISTORICAL_MAPS_PARENT = 'historical_maps';
