#!/usr/bin/env node
// Ingest av Lantmäteriets administrativa gränser (kommun/län/rike) → public.admin_boundaries.
//
// KÄLLA: NEDLADDNING-produkten "Kommun, Län och Rike" via STAC-vektor (collection kommun-lan-rike).
// ZIP med EN GeoPackage i EPSG:3006, uppdateras veckovis. © Lantmäteriet, "Användningsvillkor för
// värdefulla datamängder" (attribution, EJ CC0). Beställs på Geotorget. (Detta är Nedladdning, ej Direkt.)
//
// Kör:  node scripts/data/ingest-admin-boundaries.mjs   (LM_USER/LM_PASS + DATABASE_URL läses ur .env)
// Pipeline i scripts/data/lib/lm-gpkg.mjs. Idempotent: upsert på (level, coalesce(code,''), coalesce(year,0)).

import pg from 'pg';
import {
  loadEnv, authHeader, databaseUrl, stacZipHref, downloadZip, openGpkgFromZip,
  featureTables, geomMeta, tableColumns, extractWKB, pick, NotAuthorizedError,
} from './lib/lm-gpkg.mjs';

const COLLECTION = 'kommun-lan-rike';
// NGP-modellen (Nationella geodataplattformen): kod = kommunkod/lanskod/nationellidentifieringskod;
// namn = namnkortform ("Upplands Väsby", "Kalmar") med beslutatnamn ("… kommun/län") som fallback.
const CODE_KEYS = ['kommunkod', 'lanskod', 'länskod', 'nationellidentifieringskod', 'landskod', 'kod', 'code', 'objektidentitet', 'id'];
const NAME_KEYS = ['namnkortform', 'beslutatnamn', 'kommunnamn', 'lansnamn', 'länsnamn', 'namn', 'name'];

function tableToLevel(name) {
  const n = name.toLowerCase();
  if (n.includes('kommun')) return 'kommun';
  if (n.includes('lan') || n.includes('län')) return 'lan';
  if (n.includes('rike')) return 'rike';
  return null;
}

async function main() {
  const env = loadEnv();
  const auth = authHeader(env);
  const { href } = await stacZipHref(COLLECTION, auth);
  const zipBuf = await downloadZip(href, auth);
  const { gp, rowsOf } = await openGpkgFromZip(zipBuf);

  const tables = featureTables(rowsOf);
  console.log(`Feature-tabeller i GPKG: ${tables.join(', ') || '(inga)'}`);

  const db = new pg.Client({ connectionString: databaseUrl(env) });
  await db.connect();
  let total = 0;
  try {
    for (const table of tables) {
      const level = tableToLevel(table);
      const { geomCol, srsId } = geomMeta(rowsOf, table);
      const cols = tableColumns(rowsOf, table);
      if (!level) { console.warn(`⚠  Tabell "${table}" matchar ingen level — HOPPAS ÖVER. Kolumner: ${cols.join(', ')}`); continue; }
      if (!geomCol) { console.warn(`⚠  Tabell "${table}" saknar geometrikolumn — hoppar över.`); continue; }

      const rows = rowsOf(`SELECT * FROM "${table}"`);
      console.log(`  ${table} → level=${level}: ${rows.length} rader (geom=${geomCol}, srs=${srsId})`);
      if (rows.length && !pick(rows[0], CODE_KEYS)) console.warn(`   (obs: ingen kod-kolumn hittad — verifiera CODE_KEYS mot: ${cols.join(', ')})`);
      for (const row of rows) {
        const wkbHex = extractWKB(row[geomCol]).toString('hex');
        await db.query(
          `INSERT INTO public.admin_boundaries (level, code, name, year, geom, centroid)
           VALUES ($1,$2,$3,NULL,
             ST_Multi(ST_Transform(ST_GeomFromWKB(decode($4,'hex'), $5), 4326))::geometry(MultiPolygon,4326),
             ST_PointOnSurface(ST_Transform(ST_GeomFromWKB(decode($4,'hex'), $5), 4326)))
           ON CONFLICT (level, coalesce(code,''), coalesce(year,0))
           DO UPDATE SET name=EXCLUDED.name, geom=EXCLUDED.geom, centroid=EXCLUDED.centroid, updated_at=now()`,
          [level, pick(row, CODE_KEYS), pick(row, NAME_KEYS), wkbHex, srsId]
        );
        total++;
      }
    }
    console.log(`\nKlart: ${total} gränsytor upsertade i admin_boundaries (© Lantmäteriet).`);
  } finally {
    await db.end();
    gp.close();
  }
}

main().catch((e) => {
  if (e instanceof NotAuthorizedError) {
    console.error(`\n⛔ ${e.message}. Geotorget-beställningen är inte godkänd/aktiverad än.`);
    console.error(`   När den är det flippar nedladdningen till 200 — kör om scriptet då.`);
    process.exit(2);
  }
  console.error('\nFEL:', e.message); process.exit(1);
});
