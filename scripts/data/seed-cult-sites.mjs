// Seedar cult_sites-tabellen från den hårdkodade RELIGIOUS_PLACES (religiousPlacesData.ts).
// Kör: node scripts/data/seed-cult-sites.mjs
// Läser TS-filen som text och extraherar array-literalen (giltig JS) → undviker TS-import.
// Idempotent: upsert på id.
import fs from 'fs';
import pg from 'pg';

const env = Object.fromEntries(
  fs.readFileSync('.env', 'utf8').split('\n')
    .map((l) => l.trim()).filter((l) => l && !l.startsWith('#') && l.includes('='))
    .map((l) => { const i = l.indexOf('='); return [l.slice(0, i), l.slice(i + 1)]; })
);
const PW = env.SUPABASE_DB_PASSWORD;
if (!PW) { console.error('Saknar SUPABASE_DB_PASSWORD'); process.exit(1); }

const txt = fs.readFileSync('src/utils/religiousLocations/religiousPlacesData.ts', 'utf8');
const arrStart = txt.indexOf('[', txt.indexOf('RELIGIOUS_PLACES: ReligiousPlace[] = ['));
const endMarker = txt.indexOf('export const getChristianCenters');
let seg = txt.slice(arrStart, endMarker);
seg = seg.slice(0, seg.lastIndexOf('];') + 1); // fram t.o.m. avslutande ]
// eslint-disable-next-line no-new-func
const RELIGIOUS_PLACES = new Function('return ' + seg)();
console.log(`Extraherade ${RELIGIOUS_PLACES.length} kultplatser ur källfilen.`);

const client = new pg.Client({
  host: 'aws-0-eu-north-1.pooler.supabase.com', port: 5432, user: 'postgres.mnuifmcjspeaauzehasj',
  password: PW, database: 'postgres', ssl: { rejectUnauthorized: false },
});
await client.connect();

let n = 0;
for (const p of RELIGIOUS_PLACES) {
  await client.query(
    `insert into public.cult_sites
       (id,name,lat,lng,deity,type,evidence,description,historical_periods,established_period,paired_with,is_multiple,region,sources,updated_at)
     values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,now())
     on conflict (id) do update set
       name=excluded.name, lat=excluded.lat, lng=excluded.lng, deity=excluded.deity, type=excluded.type,
       evidence=excluded.evidence, description=excluded.description, historical_periods=excluded.historical_periods,
       established_period=excluded.established_period, paired_with=excluded.paired_with, is_multiple=excluded.is_multiple,
       region=excluded.region, sources=excluded.sources, updated_at=now()`,
    [p.id, p.name, p.coordinates?.lat ?? null, p.coordinates?.lng ?? null, p.deity, p.type,
     p.evidence ?? [], p.description ?? '', p.historicalPeriods ?? [], p.establishedPeriod ?? null,
     p.pairedWith ?? null, p.isMultiple ?? false, p.region ?? null, p.sources ?? []]
  );
  n++;
}
console.log(`Seedade ${n} kultplatser till cult_sites.`);
await client.end();
