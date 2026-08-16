#!/usr/bin/env node
// Ladda härledda MHM-strandlinjer (paleo_shorelines, model_version='mhm_lantmateri').
// Indata: shoreline_<year>.geojson från derive-shoreline-mhm.py (EPSG:4326, hav-polygoner).
// Idempotent: raderar befintliga mhm_lantmateri-rader först. Kör:
//   node scripts/data/load-shorelines-mhm.mjs --dir ../shoreline-mhm
//
// LICENS: MHM = Lantmäteriet "värdefulla datamängder" (attribution krävs, EJ CC0). Vi publicerar
// HÄRLEDDA strandlinje-polygoner (ej råhöjdrastret) med attribution — tillåtet.
import fs from 'node:fs';
import path from 'node:path';
import pg from 'pg';

const argDir = (() => { const i = process.argv.indexOf('--dir'); return i > -1 ? process.argv[i + 1] : '../shoreline-mhm'; })();
// --bbox=minLon,minLat,maxLon,maxLat → radera BARA mhm-rader i detta område (så en region-ingest
// inte torkar en annan; t.ex. Mälaren ska ej radera Öland). Utan --bbox: full mhm-radering (Öland-omkörning).
const argBbox = (() => {
  const i = process.argv.indexOf('--bbox');
  if (i < 0) return null;
  const b = String(process.argv[i + 1]).split(',').map(Number);
  return b.length === 4 && b.every((n) => !Number.isNaN(n)) ? b : null;
})();

// år → relativ havsnivå (m RH2000), samma som derive-steget (spårbarhet). Default = Kalmar/Öland-regionen.
// Region med annan landhöjning (Mälaren 4,7 mm/år) lägger en rsl.json i --dir som skriver över detta.
let RSL = { 950: 1.26, 750: 1.50, 450: 1.86, 250: 2.10, 50: 2.34 };
{
  const rslFile = path.join(argDir, 'rsl.json');
  if (fs.existsSync(rslFile)) RSL = JSON.parse(fs.readFileSync(rslFile, 'utf8'));
}

function dbPassword() {
  const env = fs.readFileSync(path.resolve('.env'), 'utf8');
  const m = env.split('\n').find((l) => l.startsWith('SUPABASE_DB_PASSWORD='));
  return m.split('=').slice(1).join('=').trim().replace(/^["']|["']$/g, '');
}

async function main() {
  const client = new pg.Client({
    host: 'aws-0-eu-north-1.pooler.supabase.com', port: 5432,
    user: 'postgres.mnuifmcjspeaauzehasj', password: dbPassword(), database: 'postgres',
  });
  await client.connect();
  try {
    if (argBbox) {
      const del = await client.query(
        "DELETE FROM paleo_shorelines WHERE model_version = 'mhm_lantmateri' AND ST_Intersects(geom, ST_MakeEnvelope($1,$2,$3,$4,4326))",
        argBbox,
      );
      console.log(`Raderade ${del.rowCount} befintliga mhm-rader i AOI ${argBbox.join(',')} (övriga regioner orörda).`);
    } else {
      await client.query("DELETE FROM paleo_shorelines WHERE model_version = 'mhm_lantmateri'");
    }
    const source = '© Lantmäteriet, Markhöjdmodell 1 m (bar jord, RH2000, EPSG:5845). Härledd strandlinje: DEM tröskladt mot relativ havsnivå (RSL ur paleo_rsl); nedsamplad 10 m.';
    const license = 'Lantmäteriet – värdefulla datamängder (attribution krävs, ej CC0)';
    const attribution = '© Lantmäteriet';
    let total = 0;
    for (const [yearStr, rsl] of Object.entries(RSL)) {
      const year = Number(yearStr);
      const file = path.join(argDir, `shoreline_${year}.geojson`);
      if (!fs.existsSync(file)) { console.log(`SAKNAS: ${file} — hoppar över`); continue; }
      const fc = JSON.parse(fs.readFileSync(file, 'utf8'));
      const feat = fc.features?.[0];
      if (!feat?.geometry) { console.log(`tom geometri i ${file}`); continue; }
      const geom = JSON.stringify(feat.geometry);
      const label = `ca ${year} e.Kr.`;
      // rsl_bound: osäkerhetsgräns min/median/max. Vi lägger central RSL-skattning → 'median'.
      // RSL-värdet (m) bevaras i source för spårbarhet (schemat saknar numerisk RSL-kolumn).
      const srcY = `${source} RSL +${rsl} m (median).`;
      const res = await client.query(
        `INSERT INTO paleo_shorelines
           (period_label, year_ce, rsl_bound, water_body_type, geom, model_version, source, license, attribution)
         VALUES ($1,$2,'median','sea',
                 ST_MakeValid(ST_SetSRID(ST_GeomFromGeoJSON($3),4326)),
                 'mhm_lantmateri',$4,$5,$6)`,
        [label, year, geom, srcY, license, attribution],
      );
      total += res.rowCount;
      console.log(`år ${year} (RSL +${rsl} m): laddad`);
    }
    console.log(`KLART: ${total} strandlinje-rader (mhm_lantmateri).`);
  } finally {
    await client.end();
  }
}
main().catch((e) => { console.error(e); process.exit(1); });
