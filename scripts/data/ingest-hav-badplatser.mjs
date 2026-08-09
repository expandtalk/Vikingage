// HaV Badplatsen → experiences (kategori 'badplats')
//
// Nationell badplats-ingest ur Havs- och vattenmyndighetens öppna GeoJSON (Badplatsen).
// Auktoritativ, koordinatbärande (~2600 badplatser, 266 kommuner). Koordinater kommer ALLTID
// ur källan (aldrig ur minnet). Idempotent på NUTSKOD (source_uri = 'hav:<NUTSKOD>'), och
// proximity-dedup mot befintliga KURERADE rader (Wikidata-baden) så samma strand inte dubbleras.
//
// Användning:
//   node scripts/data/ingest-hav-badplatser.mjs [--apply]
//   (dry-run default: skriver inget, rapporterar nya/dubbletter)

import pg from 'pg';
import { readFileSync } from 'node:fs';

const APPLY = process.argv.includes('--apply');
const FEED = 'https://badplatsen.havochvatten.se/badplatsen/api/feature';
const SRC = 'HaV Badplatsen';
const RIGHTS = 'Havs- och vattenmyndigheten (Badplatsen), öppna data';
const DEDUP_M = 150; // skippa HaV-punkt inom 150 m av en befintlig kurerad badplats

const env = Object.fromEntries(
  readFileSync(new URL('../../.env', import.meta.url), 'utf8')
    .split(/\r?\n/).filter(l => l && !l.startsWith('#') && l.includes('='))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; })
);

const haversine = (a, b, c, d) => {
  const R = 6371000, rad = x => x * Math.PI / 180;
  const dLat = rad(c - a), dLng = rad(d - b);
  const s = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a)) * Math.cos(rad(c)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
};

async function main() {
  console.log(`Hämtar HaV-feed… (${APPLY ? 'APPLY' : 'DRY-RUN'})`);
  const gj = await (await fetch(FEED, { headers: { 'User-Agent': 'VikingAge-research/1.0 (daniel.larsson@expandtalk.se)' } })).json();
  const feats = (gj.features || []).filter(f => f.geometry?.coordinates?.length === 2 && f.properties?.NAMN);
  console.log(`HaV: ${feats.length} badplatser med namn+koordinat.`);

  const client = new pg.Client({
    host: 'aws-0-eu-north-1.pooler.supabase.com', port: 5432,
    user: 'postgres.mnuifmcjspeaauzehasj', password: env.SUPABASE_DB_PASSWORD, database: 'postgres',
    ssl: { rejectUnauthorized: false }, statement_timeout: 300000,
  });
  await client.connect();
  try {
    const ex = await client.query(`SELECT lat, lng, source, source_uri FROM experiences`);
    const existingNutskod = new Set(ex.rows.filter(r => (r.source_uri || '').startsWith('hav:')).map(r => r.source_uri));
    const curated = ex.rows.filter(r => r.source !== SRC && r.lat != null && r.lng != null); // Wikidata-baden

    let neu = 0, dupNutskod = 0, dupProx = 0;
    const toInsert = [];
    for (const f of feats) {
      const [lng, lat] = f.geometry.coordinates;
      const nutskod = f.properties.NUTSKOD || `${lat.toFixed(5)},${lng.toFixed(5)}`;
      const uri = `hav:${nutskod}`;
      if (existingNutskod.has(uri)) { dupNutskod++; continue; }
      if (curated.some(c => haversine(lat, lng, c.lat, c.lng) < DEDUP_M)) { dupProx++; continue; }
      toInsert.push({ name: f.properties.NAMN.trim(), municipality: (f.properties.KMN_NAMN || '').trim() || null, lat, lng, uri });
      neu++;
    }

    console.log(`\n=== RAPPORT ===`);
    console.log(`Nya: ${neu} | redan i DB (NUTSKOD): ${dupNutskod} | dubblett nära kurerad (<${DEDUP_M} m): ${dupProx}`);
    console.log('Exempel (upp till 8):');
    toInsert.slice(0, 8).forEach(r => console.log(`  ${r.name} — ${r.municipality || '—'} (${r.lat.toFixed(4)},${r.lng.toFixed(4)})`));

    if (!APPLY) { console.log('\nDRY-RUN — inget skrivet. Kör med --apply för att skriva.'); return; }

    let inserted = 0;
    for (const r of toInsert) {
      const res = await client.query(
        `INSERT INTO experiences (name, category, lat, lng, coord_source, coord_precision, municipality, source, source_uri, rights_note, season_from_month, season_to_month)
         SELECT $1,'badplats',$2,$3,'Havs- och vattenmyndigheten (Badplatsen)','exact',$4,$5,$6,$7,5,9
         WHERE NOT EXISTS (SELECT 1 FROM experiences WHERE source_uri = $6)`,
        [r.name, r.lat, r.lng, r.municipality, SRC, r.uri, RIGHTS]);
      inserted += res.rowCount;
    }
    console.log(`\n✅ APPLY klar: ${inserted} badplatser insatta (idempotent).`);
  } finally {
    await client.end();
  }
}
main().catch(e => { console.error(e); process.exit(1); });
