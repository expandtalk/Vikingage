// Delad pipeline för Lantmäteriets NEDLADDNING-produkt "Markhöjdmodell" (STAC-hojd → COG-GeoTIFF-tiles).
// © Lantmäteriet, "Användningsvillkor för värdefulla datamängder" (attribution, EJ CC0).
//
// DTM (markhöjdmodell = bar jord, 1 m-grid, EPSG:5845 SWEREF99 TM + RH2000). Trädkronor/byggnader är
// per definition bortfiltrerade — detta är den trädlösa terrängytan. (Ythöjdmodell/DSM = med träd, ej denna.)
//
// Ingen ny native-dep: ren fetch + STAC POST /search. GDAL/geotiff.js behövs FÖRST i ett senare
// härledningssteg (hillshade / kontur / PostGIS-raster) — inte för själva nedladdningen.
//
// Återanvänder auth/env-hjälpare från lm-gpkg.mjs (samma Basic-credential, samma dl1-host).

export { loadEnv, authHeader, databaseUrl, NotAuthorizedError, REPO_ROOT } from './lm-gpkg.mjs';
import { NotAuthorizedError } from './lm-gpkg.mjs';

export const STAC_HOJD = 'https://api.lantmateriet.se/stac-hojd/v1';

/** true om två bbox [minx,miny,maxx,maxy] (samma CRS) överlappar. */
export function bboxIntersects(a, b) {
  return a[0] <= b[2] && a[2] >= b[0] && a[1] <= b[3] && a[3] >= b[1];
}

/**
 * Hämta de kaklade 1 m-DTM-collectionerna (mhm-*) vars utbredning skär AOI (WGS84-bbox).
 * Exkluderar rikstäckande dtm-cog (mosaik) och dsm-skoglig-copc (punktmoln) medvetet.
 */
export async function mhmCollectionsForBbox(bbox, auth) {
  const res = await fetch(`${STAC_HOJD}/collections`, { headers: { Authorization: auth, Accept: 'application/json' } });
  if (!res.ok) throw new Error(`STAC /collections: HTTP ${res.status} ${res.statusText}`);
  const { collections = [] } = await res.json();
  return collections
    .filter((c) => /^mhm-/.test(c.id))
    .filter((c) => {
      const bb = c.extent?.spatial?.bbox?.[0];
      return bb && bboxIntersects(bbox, bb);
    })
    .map((c) => c.id);
}

/**
 * POST /search tvärs givna collections + AOI-bbox, följ `next`-länkar (paginering).
 * Returnerar en platt lista av tile-poster { id, collection, bbox, datetime, epsg, res, href, size, ursprungHref }.
 * safetyPages kapar runaway (default 400 sidor).
 */
export async function searchTiles({ bbox, collections, auth, limit = 100, safetyPages = 400 }) {
  const out = [];
  let body = { bbox, collections, limit };
  let url = `${STAC_HOJD}/search`;
  let method = 'POST';
  for (let page = 0; page < safetyPages; page++) {
    const res = await fetch(url, {
      method,
      headers: { Authorization: auth, 'Content-Type': 'application/json', Accept: 'application/json' },
      body: method === 'POST' ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) throw new Error(`STAC /search: HTTP ${res.status} ${res.statusText}`);
    const json = await res.json();
    for (const f of json.features || []) {
      const data = f.assets?.data;
      if (!data?.href) continue;
      out.push({
        id: f.id,
        collection: f.collection,
        bbox: f.bbox,
        datetime: f.properties?.datetime ?? null,
        epsg: f.properties?.['proj:epsg'] ?? data['proj:epsg'] ?? null,
        res: f.properties?.geometriskupplosning ?? null,
        href: data.href,
        size: data['file:size'] ?? null,
        ursprungHref: f.assets?.metadata?.href ?? null,
      });
    }
    const next = (json.links || []).find((l) => l.rel === 'next');
    if (!next) break;
    // STAC POST-paginering: next kan bära egen method/body (merge) eller bara href (GET).
    method = (next.method || 'GET').toUpperCase();
    url = next.href;
    if (method === 'POST') body = next.body?.merge ? { ...body, ...next.body } : (next.body || body);
  }
  return out;
}

/** Ladda ner en tile-asset (Basic auth). 401/403 → NotAuthorizedError (dl1-behörighet ej aktiv än). */
export async function downloadAsset(href, auth) {
  const res = await fetch(href, { headers: { Authorization: auth } });
  if (res.status === 401 || res.status === 403) throw new NotAuthorizedError(res.status);
  if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText} vid nedladdning av ${href}`);
  return Buffer.from(await res.arrayBuffer());
}
