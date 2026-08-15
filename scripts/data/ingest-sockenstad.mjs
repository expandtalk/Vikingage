#!/usr/bin/env node
// Ingest av Lantmäteriets "Socken och stad" (Nedladdning, vektor) → public.admin_boundaries.
//
// KÄLLA: Geotorget-produkten "Socken och stad" (ärende LM2026/113294), **CC0** (fri, ingen
// attributionsplikt). GeoPackage i EPSG:3006. Läser en LOKAL zip (Daniel laddade ner manuellt).
// Distriktsindelningen utgår från territoriella församlingsindelningen 1999-12-31 (statisk sedan 2016).
//
// GPKG-modell (verifierad): EN tabell `sockenstad`, 6138 DELYTOR, 2473 unika enheter.
//   sockenstadtyp 1=socken, 2=stad · sockenstadkod (unik per enhet) · sockenstadnamn.
// Delytor (omraden) unionas per (level, kod) → MultiPolygon. Idempotent upsert på (level,code,year=NULL).
//
// Kör:  node scripts/data/ingest-sockenstad.mjs [zip-path] [--dry]
import pg from 'pg';
import fs from 'fs';
import { loadEnv, databaseUrl, openGpkgFromZip, geomMeta, extractWKB } from './lib/lm-gpkg.mjs';

const ZIP = process.argv.find((a) => a.endsWith('.zip'))
  || 'C:/Users/Lenovo/Downloads/da60e4b6-3b48-4bd3-bb91-e7e724d544ae.zip';
const DRY = process.argv.includes('--dry');
const TYP_LEVEL = { '1': 'socken', '2': 'stad' };

async function main() {
  const env = loadEnv();
  const { gp, rowsOf } = await openGpkgFromZip(fs.readFileSync(ZIP));
  const { geomCol, srsId } = geomMeta(rowsOf, 'sockenstad'); // SHAPE, 3006
  const rows = rowsOf(`SELECT sockenstadtyp AS typ, sockenstadkod AS kod, sockenstadnamn AS namn, "${geomCol}" AS geom FROM sockenstad`);
  const socken = rows.filter((r) => String(r.typ) === '1').length;
  const stad = rows.filter((r) => String(r.typ) === '2').length;
  const uniq = new Set(rows.map((r) => `${r.typ}:${r.kod}`)).size;
  console.log(`sockenstad: ${rows.length} delytor (socken ${socken}, stad ${stad}) → ${uniq} unika enheter · geom=${geomCol} srs=${srsId}`);

  if (DRY) { console.log('torrläge: ingen DB-skrivning.'); gp.close(); return; }

  const db = new pg.Client({ connectionString: databaseUrl(env) });
  await db.connect();
  try {
    await db.query('BEGIN');
    await db.query(`CREATE TEMP TABLE _ss_stage (level text, code text, name text, geom geometry(Geometry,4326))`);
    let n = 0;
    for (const row of rows) {
      const level = TYP_LEVEL[String(row.typ)];
      if (!level) continue;
      const wkbHex = extractWKB(row.geom).toString('hex');
      await db.query(
        `INSERT INTO _ss_stage (level, code, name, geom)
         VALUES ($1,$2,$3, ST_MakeValid(ST_Transform(ST_GeomFromWKB(decode($4,'hex'), $5), 4326)))`,
        [level, String(row.kod), String(row.namn), wkbHex, srsId],
      );
      n++;
    }
    console.log(`  stagade ${n} delytor — unionar per (level,code)…`);
    const up = await db.query(
      `INSERT INTO public.admin_boundaries (level, code, name, year, geom, centroid, source)
       SELECT s.level, s.code, min(s.name), NULL, g.mp, ST_PointOnSurface(g.mp),
              'Lantmäteriet Socken och stad (CC0)'
       FROM (
         SELECT level, code, ST_Multi(ST_CollectionExtract(ST_Union(geom), 3))::geometry(MultiPolygon,4326) AS mp
         FROM _ss_stage GROUP BY level, code
       ) g
       JOIN _ss_stage s ON s.level=g.level AND s.code=g.code
       GROUP BY s.level, s.code, g.mp
       ON CONFLICT (level, coalesce(code,''), coalesce(year,0))
       DO UPDATE SET name=EXCLUDED.name, geom=EXCLUDED.geom, centroid=EXCLUDED.centroid, source=EXCLUDED.source, updated_at=now()`,
    );
    await db.query('COMMIT');
    console.log(`Klart: ${up.rowCount} socken/stad upsertade i admin_boundaries (CC0).`);
  } catch (e) {
    await db.query('ROLLBACK').catch(() => {});
    throw e;
  } finally {
    await db.end();
    gp.close();
  }
}

main().catch((e) => { console.error('\nFEL:', e.message); process.exit(1); });
