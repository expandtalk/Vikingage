// Ingest av nedladdade Fornsök-geometrier (GeoJSON, EPSG:3006) → lamning_geometry.
// Linjer/polygoner (vägsträckningar, ringmurar) — inte bara punkter. Transformerar 3006→4326.
// Länkar lamning_id till heritage_sites.id där register_id matchar, annars bara register_id (decouplat).
// Idempotent per register_id (raderar tidigare nedladdnings-import innan ny). Filnamn: L1957_426_geometrier.json → L1957:426.
//
// Användning: node scripts/data/ingest-lamning-geometries.mjs [dir] [--apply]
import pg from 'pg';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const argv = process.argv.slice(2);
const APPLY = argv.includes('--apply');
const DIR = argv.find(a => !a.startsWith('--')) || 'C:/Users/Lenovo/Downloads';
const METHOD = 'map_digitised'; // Fornsök Mätmetod "Manuell inprickning" (majoriteten); approx
const NOTE = 'Fornsök geometri-nedladdning (EPSG:3006→4326)';

const env = Object.fromEntries(
  readFileSync(new URL('../../.env', import.meta.url), 'utf8')
    .split(/\r?\n/).filter(l => l && !l.startsWith('#') && l.includes('='))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; })
);

// L1957_426_geometrier.json → L1957:426
const ridFromFile = f => { const b = f.replace(/_geometrier\.json$/i, ''); const i = b.indexOf('_'); return i < 0 ? b : b.slice(0, i) + ':' + b.slice(i + 1); };

async function main() {
  const files = readdirSync(DIR).filter(f => /_geometrier\.json$/i.test(f));
  console.log(`Geometri-filer i ${DIR}: ${files.length}. Läge: ${APPLY ? 'APPLY' : 'DRY-RUN'}.`);
  const client = new pg.Client({
    host: 'aws-0-eu-north-1.pooler.supabase.com', port: 5432,
    user: 'postgres.mnuifmcjspeaauzehasj', password: env.SUPABASE_DB_PASSWORD, database: 'postgres',
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();
  const SRC_ID = (await client.query("select id from historical_sources where source_key='src_fornsok_kmr'")).rows[0].id;
  let totalFeat = 0, linked = 0, byRid = 0;
  try {
    for (const f of files) {
      const rid = ridFromFile(f);
      const fc = JSON.parse(readFileSync(join(DIR, f), 'utf8'));
      const feats = fc.features || [];
      const lam = (await client.query('select id from heritage_sites where register_id=$1 limit 1', [rid])).rows[0]?.id || null;
      const gtypes = feats.map(x => x.geometry?.type).join(',');
      console.log(`  ${rid.padEnd(13)} ${feats.length} geom [${gtypes}] ${lam ? 'länkad→heritage' : 'endast register_id'}`);
      if (lam) linked++; else byRid++;
      if (!APPLY) { totalFeat += feats.length; continue; }
      await client.query(`delete from lamning_geometry where register_id=$1 and transform_note=$2`, [rid, NOTE]);
      // Ersätt ev. äldre aktuell geometri (t.ex. punkt) — den nedladdade linjen/polygonen är bättre.
      if (lam) await client.query('update lamning_geometry set is_current=false where lamning_id=$1 and is_current', [lam]);
      let firstCurrent = true; // one_current_geom: bara EN aktuell per lamning_id (uuid)
      for (const ft of feats) {
        if (!ft.geometry) continue;
        const isCur = lam ? firstCurrent : true; // register_id-only (lam null) omfattas ej av unik-vakten
        if (lam) firstCurrent = false;
        await client.query(
          `insert into lamning_geometry (lamning_id, register_id, geom, metric_srid, source_crs, was_transformed, method, transform_note, source_id, is_current, recorded_at)
           values ($1,$2, ST_Transform(ST_SetSRID(ST_GeomFromGeoJSON($3),3006),4326), 3006,'EPSG:3006',true,$4,$5,$6,$7, now())`,
          [lam, rid, JSON.stringify(ft.geometry), METHOD, NOTE, SRC_ID, isCur]);
        totalFeat++;
      }
    }
    console.log(`\n=== RAPPORT ===`);
    console.log(`Filer: ${files.length} (${linked} länkade till heritage_sites, ${byRid} endast register_id). Geometrier: ${totalFeat}.`);
    if (!APPLY) console.log('DRY-RUN — inget skrivet. Kör med --apply.');
    else console.log('✅ APPLY klar.');
  } finally { await client.end(); }
}
main().catch(e => { console.error(e); process.exit(1); });
