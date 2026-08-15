#!/usr/bin/env node
// Ingest av Sveriges landskap → public.admin_boundaries level='landskap'.
//
// PIPELINE (komplett, ej geoshape-patchwork):
//  1. Wikidata (P31=Q193556 "landskap i Sverige") → lista: qid, namn, ev. P402 (OSM-relations-ID).
//  2. Overpass → alla boundary=historic/type=boundary-relationer i Sverige (namn/short_name → relations-ID),
//     används för de landskap som saknar P402.
//  3. polygons.openstreetmap.fr/get_geojson.py?id=<rel> → färdigmonterad MultiPolygon-GeoJSON (OSM, ODbL).
//  4. Öland saknar historisk OSM-relation → fallback: union av kommunerna Borgholm(0885)+Mörbylånga(0840).
//
// Idempotent upsert på (level='landskap', code=QID, year=NULL). Kör: node scripts/data/ingest-landskap-wikidata.mjs [--dry]
import pg from 'pg';
import { loadEnv, databaseUrl } from './lib/lm-gpkg.mjs';

const UA = 'VikingAge/1.0 (info@expandtalk.se; runologisk forskningsplattform)';
const DRY = process.argv.includes('--dry');
const OLAND_QID = 'Q15981396';
const norm = (s) => (s || '').toLowerCase().replace(/^landskapet\s+/, '').replace(/\s+socken$/, '').trim();
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchJson(url, headers = {}) {
  const r = await fetch(url, { headers: { 'User-Agent': UA, ...headers } });
  if (!r.ok) throw new Error(`${r.status}`);
  return r.json();
}

async function landskapList() {
  const q = `SELECT ?item ?itemLabel ?rel WHERE { ?item wdt:P31 wd:Q193556 . ?item rdfs:label ?itemLabel FILTER(lang(?itemLabel)="sv") OPTIONAL { ?item wdt:P402 ?rel } } ORDER BY ?itemLabel`;
  const j = await fetchJson('https://query.wikidata.org/sparql?format=json&query=' + encodeURIComponent(q), { Accept: 'application/sparql-results+json' });
  const seen = new Set(); const out = [];
  for (const b of j.results.bindings) {
    const qid = b.item.value.split('/').pop();
    const name = b.itemLabel.value;
    if (name === qid || seen.has(name)) continue;
    seen.add(name);
    out.push({ qid, name, rel: b.rel ? b.rel.value : null });
  }
  return out;
}

async function overpassHistoricRels() {
  const Q = '[out:json][timeout:120];area["ISO3166-1"="SE"][admin_level="2"]->.se;rel(area.se)["boundary"="historic"]["type"="boundary"];out tags;';
  const r = await fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST', headers: { 'User-Agent': UA, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'data=' + encodeURIComponent(Q),
  });
  const j = await r.json();
  const map = new Map();
  for (const e of j.elements) {
    for (const key of [e.tags.short_name, e.tags.name]) {
      const n = norm(key);
      if (n && !map.has(n)) map.set(n, e.id);
    }
  }
  return map;
}

async function polygonGeoms(relId) {
  const j = await fetchJson(`https://polygons.openstreetmap.fr/get_geojson.py?id=${relId}&params=0`);
  const geoms = Array.isArray(j.geometries) ? j.geometries : (j.type ? [j] : []);
  return geoms.filter((g) => g && (g.type === 'Polygon' || g.type === 'MultiPolygon'));
}

const UPSERT_GEOJSON = `
  INSERT INTO public.admin_boundaries (level, code, name, year, geom, centroid, source)
  SELECT 'landskap', $1, $2, NULL, m.mp, ST_PointOnSurface(m.mp), $4
  FROM (SELECT ST_Multi(ST_CollectionExtract(ST_Union(u.g),3))::geometry(MultiPolygon,4326) AS mp
        FROM (SELECT ST_MakeValid(ST_SetSRID(ST_GeomFromGeoJSON(elem::text),4326)) g
              FROM jsonb_array_elements($3::jsonb) elem) u) m
  ON CONFLICT (level, coalesce(code,''), coalesce(year,0))
  DO UPDATE SET name=EXCLUDED.name, geom=EXCLUDED.geom, centroid=EXCLUDED.centroid, source=EXCLUDED.source, updated_at=now()`;

const UPSERT_OLAND = `
  INSERT INTO public.admin_boundaries (level, code, name, year, geom, centroid, source)
  SELECT 'landskap', $1, $2, NULL, m.mp, ST_PointOnSurface(m.mp),
         'Härledd: union av kommunerna Borgholm+Mörbylånga (© Lantmäteriet)'
  FROM (SELECT ST_Multi(ST_CollectionExtract(ST_Union(geom),3))::geometry(MultiPolygon,4326) mp
        FROM public.admin_boundaries WHERE level='kommun' AND code IN ('0885','0840')) m
  ON CONFLICT (level, coalesce(code,''), coalesce(year,0))
  DO UPDATE SET name=EXCLUDED.name, geom=EXCLUDED.geom, centroid=EXCLUDED.centroid, source=EXCLUDED.source, updated_at=now()`;

async function main() {
  const env = loadEnv();
  const list = await landskapList();
  const relMap = await overpassHistoricRels();
  console.log(`Wikidata: ${list.length} landskap · Overpass historic-relationer: ${relMap.size} namn.`);

  const resolved = []; const oland = []; const gap = [];
  for (const l of list) {
    const relId = l.rel || relMap.get(norm(l.name)) || null;
    if (l.qid === OLAND_QID) { if (relId) l.rel = relId; else { oland.push(l); continue; } }
    if (!relId) { gap.push(l); continue; }
    let geoms = [];
    try { geoms = await polygonGeoms(relId); } catch { /* tjänst */ }
    await sleep(300);
    if (geoms.length) resolved.push({ ...l, relId, geoms });
    else gap.push(l);
    process.stdout.write(geoms.length ? '.' : 'x');
  }
  console.log(`\nlöst: ${resolved.length} · Öland-fallback: ${oland.length} · utan geometri: ${gap.map((g) => g.name).join(', ') || '(inga)'}`);

  if (DRY) { console.log('torrläge: ingen DB-skrivning.'); return; }

  const db = new pg.Client({ connectionString: databaseUrl(env) });
  await db.connect();
  let n = 0;
  try {
    for (const l of resolved) {
      await db.query(UPSERT_GEOJSON, [l.qid, l.name, JSON.stringify(l.geoms),
        `OpenStreetMap contributors (ODbL) via polygons.osm.fr, landskapsrelation ${l.relId}`]);
      n++;
    }
    for (const l of oland) { const r = await db.query(UPSERT_OLAND, [l.qid, l.name]); if (r.rowCount) n++; }
    console.log(`Klart: ${n} landskap upsertade i admin_boundaries.` + (gap.length ? ` ⚠ saknar geometri: ${gap.map((g) => g.name).join(', ')}` : ''));
  } finally { await db.end(); }
}

main().catch((e) => { console.error('FEL:', e.message); process.exit(1); });
