// Laddar DEM-härledda strandlinje-GeoJSON (från derive-shoreline-dem.py) -> public.paleo_shorelines
// under egen model_version (default 'copernicus_dem'), så SGU:s rader lämnas orörda.
// Idempotent: bbox-skopad DELETE per model_version före insert (samma mönster som SGU-ingesten).
//
// Kör: node scripts/data/load-dem-shorelines.mjs --dir <geojson-dir> --bbox 16.18,56.55,16.46,56.72
// Kräver SUPABASE_DB_PASSWORD i .env.
import pg from 'pg';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

const args = Object.fromEntries(process.argv.slice(2).reduce((a, v, i, arr) => {
  if (v.startsWith('--')) a.push([v.slice(2), arr[i + 1]]); return a;
}, []));
const DIR = args.dir;
const MODEL = args.model || 'copernicus_dem';
const BBOX = (args.bbox || '16.18,56.55,16.46,56.72').split(',').map(Number);
if (!DIR) { console.error('--dir krävs'); process.exit(1); }

const env = Object.fromEntries(readFileSync(new URL('../../.env', import.meta.url), 'utf8')
  .split(/\r?\n/).filter(l => l && !l.startsWith('#') && l.includes('='))
  .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; }));
if (!env.SUPABASE_DB_PASSWORD) { console.error('SUPABASE_DB_PASSWORD saknas i .env'); process.exit(1); }

const LABEL = (y) => {
  const t = y >= 800 ? 'Vikingatid' : y >= 550 ? 'Vendeltid' : y >= 400 ? 'Folkvandringstid'
    : y >= 100 ? 'Romersk järnålder' : 'Äldre järnålder';
  return `${t} ~${y} e.Kr.`;
};

async function main() {
  const client = new pg.Client({
    host: 'aws-0-eu-north-1.pooler.supabase.com', port: 5432,
    user: 'postgres.mnuifmcjspeaauzehasj', password: env.SUPABASE_DB_PASSWORD, database: 'postgres',
    ssl: { rejectUnauthorized: false }, statement_timeout: 300000,
  });
  await client.connect();
  try {
    await client.query('BEGIN');
    const [x1, y1, x2, y2] = BBOX;
    const del = await client.query(
      `DELETE FROM paleo_shorelines WHERE model_version=$1
         AND ST_Intersects(geom, ST_MakeEnvelope($2,$3,$4,$5,4326))`,
      [MODEL, x1, y1, x2, y2]);
    console.log(`Raderade ${del.rowCount} tidigare ${MODEL}-rader i bboxen`);

    const files = readdirSync(DIR).filter(f => /kalmar_shoreline_\d+\.geojson$/.test(f));
    let inserted = 0;
    for (const f of files) {
      const year = parseInt(f.match(/(\d+)\.geojson$/)[1], 10);
      const fc = JSON.parse(readFileSync(path.join(DIR, f), 'utf8'));
      for (const feat of fc.features) {
        const wtype = feat.properties.water_body_type;
        const res = await client.query(
          `INSERT INTO paleo_shorelines
             (period_label, year_ce, rsl_bound, water_body_type, geom, model_version, source, license, attribution)
           VALUES ($1,$2,'median',$3,
             ST_Multi(ST_CollectionExtract(ST_MakeValid(ST_SetSRID(ST_GeomFromGeoJSON($4),4326)),3)),
             $5,$6,$7,$8)
           RETURNING ST_NPoints(geom) npts, round((ST_Area(geom::geography)/1e6)::numeric) km2`,
          [LABEL(year), year, wtype, JSON.stringify(feat.geometry), MODEL,
           'Copernicus DEM GLO-30 (ESA) + paleo_rsl',
           'Copernicus (free & open)',
           '© ESA/Copernicus DEM GLO-30; RSL: projektets paleo_rsl (SGU-kalibrerad)']);
        inserted++;
        console.log(`  ${year} ${wtype}: npts=${res.rows[0].npts} km2=${res.rows[0].km2}`);
      }
    }
    await client.query('COMMIT');
    console.log(`\nInfogat ${inserted} rader (model_version=${MODEL}).`);
    const chk = await client.query(
      `SELECT model_version, count(*), min(year_ce) y0, max(year_ce) y1
         FROM paleo_shorelines GROUP BY model_version ORDER BY model_version`);
    console.table(chk.rows);
  } catch (e) { await client.query('ROLLBACK').catch(() => {}); throw e; }
  finally { await client.end(); }
}
main().catch(e => { console.error('FEL:', e.message); process.exit(1); });
