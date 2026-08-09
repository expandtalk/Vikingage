// EEA/WISE badvattenkvalitet → experiences.water_quality (matchas på NUTSKOD)
//
// Hämtar EU:s badvattenklassificering för Sverige ur EEA:s öppna ArcGIS-tjänst (senaste årsskikt)
// och sätter water_quality (Utmärkt/Bra/…) + water_quality_year på våra HaV-badplatser, matchat på
// bathingWaterIdentifier = NUTSKOD (våra rader har source_uri='hav:<NUTSKOD>'). Endast EU-klassade
// bad får en klass; övriga lämnas null (ärligt — de saknar formell klassning).
//
// Användning: node scripts/data/ingest-eea-badvattenkvalitet.mjs [--apply] [--year 2025]

import pg from 'pg';
import { readFileSync } from 'node:fs';

const APPLY = process.argv.includes('--apply');
const yi = process.argv.indexOf('--year');
const YEAR = yi > -1 ? Number(process.argv[yi + 1]) : 2025;
const SVC = `https://water.discomap.eea.europa.eu/arcgis/rest/services/BathingWater/BathingWater_Dyna_WM_${YEAR}/MapServer/3/query`;
const KLASS = { Excellent: 'Utmärkt', Good: 'Bra', Sufficient: 'Tillfredsställande', Poor: 'Dålig', 'Not classified': 'Ej klassad' };

const env = Object.fromEntries(
  readFileSync(new URL('../../.env', import.meta.url), 'utf8')
    .split(/\r?\n/).filter(l => l && !l.startsWith('#') && l.includes('='))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; })
);

async function fetchSE() {
  const rows = []; let off = 0;
  for (;;) {
    const p = new URLSearchParams({ where: "countryCode='SE'", outFields: 'bathingWaterIdentifier,qualityStatus',
      returnGeometry: 'false', f: 'json', resultRecordCount: '1000', resultOffset: String(off) });
    const d = await (await fetch(`${SVC}?${p}`)).json();
    const fs = d.features || [];
    rows.push(...fs.map(f => f.attributes));
    if (fs.length < 1000) break;
    off += 1000;
  }
  return rows;
}

async function main() {
  console.log(`Hämtar EEA badvattenkvalitet ${YEAR} (SE)… (${APPLY ? 'APPLY' : 'DRY-RUN'})`);
  const eea = await fetchSE();
  console.log(`EEA: ${eea.length} svenska badvatten.`);

  const client = new pg.Client({
    host: 'aws-0-eu-north-1.pooler.supabase.com', port: 5432,
    user: 'postgres.mnuifmcjspeaauzehasj', password: env.SUPABASE_DB_PASSWORD, database: 'postgres',
    ssl: { rejectUnauthorized: false }, statement_timeout: 300000,
  });
  await client.connect();
  try {
    let matched = 0, updated = 0; const dist = {};
    for (const r of eea) {
      const klass = KLASS[r.qualityStatus] || r.qualityStatus;
      dist[klass] = (dist[klass] || 0) + 1;
      const uri = `hav:${r.bathingWaterIdentifier}`;
      const hit = await client.query(`SELECT id FROM experiences WHERE source_uri = $1`, [uri]);
      if (!hit.rowCount) continue;
      matched++;
      if (APPLY) {
        const res = await client.query(
          `UPDATE experiences SET water_quality=$1, water_quality_year=$2, updated_at=now() WHERE source_uri=$3`,
          [klass, YEAR, uri]);
        updated += res.rowCount;
      }
    }
    console.log(`\n=== RAPPORT ===`);
    console.log('Klassfördelning (EEA SE):', JSON.stringify(dist));
    console.log(`Matchade mot våra HaV-badplatser (NUTSKOD): ${matched}/${eea.length}`);
    if (APPLY) console.log(`✅ Uppdaterade: ${updated}`);
    else console.log('DRY-RUN — inget skrivet. Kör med --apply.');
  } finally { await client.end(); }
}
main().catch(e => { console.error(e); process.exit(1); });
