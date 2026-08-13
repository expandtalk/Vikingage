#!/usr/bin/env node
// Ingest av Lantmäteriets administrativa gränser (kommun/län/rike) → public.admin_boundaries.
// Källa: "Kommun, län och rike Direkt" (OGC API Features), avgiftsfri under värdefulla datamängder-
// villkoren, © Lantmäteriet. Kräver BEHÖRIGHET (beställ på Geotorget) — sätt antingen LM_TOKEN
// (OAuth2 bearer) ELLER LM_USER + LM_PASS (Basic). Gränserna transformeras till WGS84 (EPSG:4326)
// via OGC:s crs-parameter. Idempotent (upsert på level+code+year).
//
// Kör:  DATABASE_URL=... LM_TOKEN=...  node scripts/data/ingest-admin-boundaries.mjs
//   ev.  LM_USER=... LM_PASS=...  istället för LM_TOKEN.
//
// OBS: modern indelning ≠ landskap/socken. För medeltida socknar → Lantmäteriets "Socken och stad".

import pg from 'pg';

const BASE = 'https://api.lantmateriet.se/ogc-features/v1/administrativ-indelning';
const CRS84 = 'http://www.opengis.net/def/crs/EPSG/0/4326';
// Aktuella samlingar (ej årsvisa) → level. Lägg till 'kommuner-2026' etc. om årsvisa behövs.
const COLLECTIONS = { kommuner: 'kommun', lan: 'lan', rike: 'rike' };

const { DATABASE_URL, LM_TOKEN, LM_USER, LM_PASS } = process.env;
if (!DATABASE_URL) { console.error('Saknar DATABASE_URL (Supabase pooler-connection).'); process.exit(1); }
if (!LM_TOKEN && !(LM_USER && LM_PASS)) { console.error('Saknar LM_TOKEN (OAuth2) eller LM_USER+LM_PASS (Basic). Beställ behörighet på Geotorget.'); process.exit(1); }

const authHeader = LM_TOKEN ? `Bearer ${LM_TOKEN}` : `Basic ${Buffer.from(`${LM_USER}:${LM_PASS}`).toString('base64')}`;

// Gissa kod/namn ur properties defensivt (nyckelnamn kan variera i test-specen).
const pick = (props, keys) => { for (const k of keys) { const v = props?.[k]; if (v != null && v !== '') return String(v); } return null; };
const getCode = (p) => pick(p, ['kommunkod', 'lanskod', 'länskod', 'kod', 'code', 'objektidentitet']);
const getName = (p) => pick(p, ['kommunnamn', 'lansnamn', 'länsnamn', 'namn', 'name', 'rike']);

async function fetchAll(collection) {
  const feats = [];
  let url = `${BASE}/collections/${collection}/items?crs=${encodeURIComponent(CRS84)}&limit=1000`;
  while (url) {
    const res = await fetch(url, { headers: { Authorization: authHeader, Accept: 'application/geo+json' } });
    if (!res.ok) throw new Error(`${collection}: HTTP ${res.status} ${res.statusText} — ${await res.text().catch(() => '')}`);
    const json = await res.json();
    for (const f of json.features ?? []) feats.push(f);
    const next = (json.links ?? []).find((l) => l.rel === 'next');
    url = next?.href ?? null;
  }
  return feats;
}

const db = new pg.Client({ connectionString: DATABASE_URL });
await db.connect();
let total = 0;
try {
  for (const [collection, level] of Object.entries(COLLECTIONS)) {
    process.stdout.write(`Hämtar ${collection} … `);
    const feats = await fetchAll(collection);
    console.log(`${feats.length} features`);
    for (const f of feats) {
      const geojson = JSON.stringify(f.geometry);
      const code = getCode(f.properties), name = getName(f.properties);
      await db.query(
        `INSERT INTO public.admin_boundaries (level, code, name, year, geom, centroid)
         VALUES ($1,$2,$3,NULL,
           ST_Multi(ST_SetSRID(ST_GeomFromGeoJSON($4),4326))::geometry(MultiPolygon,4326),
           ST_PointOnSurface(ST_SetSRID(ST_GeomFromGeoJSON($4),4326)))
         ON CONFLICT (level, coalesce(code,''), coalesce(year,0))
         DO UPDATE SET name=EXCLUDED.name, geom=EXCLUDED.geom, centroid=EXCLUDED.centroid, updated_at=now()`,
        [level, code, name, geojson]
      );
      total++;
    }
  }
  console.log(`Klart: ${total} gränsytor upsertade i admin_boundaries (© Lantmäteriet).`);
} finally {
  await db.end();
}
