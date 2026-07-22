// Seedar de fyra hårdkodade dataseten → DB. Använder esbuild för att bundla+evaluera
// TS-modulerna (löser spreads/nästlade importer korrekt), sedan pg-upsert.
// Kör: node scripts/data/seed-hardcoded-datasets.mjs
import esbuild from 'esbuild';
import pg from 'pg';
import fs from 'fs';

const env = Object.fromEntries(
  fs.readFileSync('.env', 'utf8').split('\n')
    .map((l) => l.trim()).filter((l) => l && !l.startsWith('#') && l.includes('='))
    .map((l) => { const i = l.indexOf('='); return [l.slice(0, i), l.slice(i + 1)]; })
);
const PW = env.SUPABASE_DB_PASSWORD;
if (!PW) { console.error('Saknar SUPABASE_DB_PASSWORD'); process.exit(1); }

// Bundla en TS-modul och läs ut en named export (via data:-URL-import).
async function load(entry, exportName) {
  const res = await esbuild.build({
    entryPoints: [entry], bundle: true, format: 'esm', write: false,
    platform: 'neutral', logLevel: 'silent',
  });
  const code = res.outputFiles[0].text;
  const mod = await import('data:text/javascript;base64,' + Buffer.from(code, 'utf8').toString('base64'));
  return mod[exportName];
}

const finds = await load('src/utils/archaeologicalFinds/index.ts', 'ARCHAEOLOGICAL_FINDS');
const regions = await load('src/utils/vikingRegions/vikingRegionData.ts', 'VIKING_REGIONS');
const routeFn = await load('src/utils/valdemarsRoute.ts', 'valdemarsRoute');
const route = routeFn();
const periods = await load('src/utils/germanicTimeline/periods/index.ts', 'GERMANIC_TIME_PERIODS');
console.log(`Laddade: ${finds.length} fynd, ${regions.length} regioner, ${route.length} ruttpunkter, ${periods.length} perioder.`);

const client = new pg.Client({
  host: 'aws-0-eu-north-1.pooler.supabase.com', port: 5432, user: 'postgres.mnuifmcjspeaauzehasj',
  password: PW, database: 'postgres', ssl: { rejectUnauthorized: false },
});
await client.connect();

// 1. archaeological_finds
let n = 0;
for (const f of finds) {
  await client.query(
    `insert into public.archaeological_finds (id,name,name_en,lat,lng,period,culture,significance,description,start_year,end_year,country,find_type,updated_at)
     values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,now())
     on conflict (id) do update set name=excluded.name,name_en=excluded.name_en,lat=excluded.lat,lng=excluded.lng,
       period=excluded.period,culture=excluded.culture,significance=excluded.significance,description=excluded.description,
       start_year=excluded.start_year,end_year=excluded.end_year,country=excluded.country,find_type=excluded.find_type,updated_at=now()`,
    [f.id, f.name, f.nameEn ?? null, f.lat ?? null, f.lng ?? null, f.period ?? null, f.culture ?? null,
     f.significance ?? null, f.description ?? null, f.startYear ?? null, f.endYear ?? null, f.country ?? null, f.findType ?? null]
  );
  n++;
}
console.log(`  archaeological_finds: ${n}`);

// 2. viking_regions (index-baserat id, inget id i källan)
n = 0;
for (let i = 0; i < regions.length; i++) {
  const r = regions[i];
  await client.query(
    `insert into public.viking_regions (id,viking_name,modern_name,lat,lng,description,category,timeperiod,type,updated_at)
     values ($1,$2,$3,$4,$5,$6,$7,$8,$9,now())
     on conflict (id) do update set viking_name=excluded.viking_name,modern_name=excluded.modern_name,lat=excluded.lat,lng=excluded.lng,
       description=excluded.description,category=excluded.category,timeperiod=excluded.timeperiod,type=excluded.type,updated_at=now()`,
    [`vr-${i}`, r.vikingName ?? r.viking_name ?? null, r.modernName ?? null, r.lat ?? null, r.lng ?? null,
     r.description ?? null, r.category ?? null, r.timeperiod ?? null, r.type ?? null]
  );
  n++;
}
console.log(`  viking_regions: ${n}`);

// 3. valdemar_route_points (ordning bevaras via seq)
n = 0;
for (let i = 0; i < route.length; i++) {
  const p = route[i];
  await client.query(
    `insert into public.valdemar_route_points (id,route,seq,name,lat,lng,is_lotstation,is_major_waypoint,section,description,updated_at)
     values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,now())
     on conflict (id) do update set seq=excluded.seq,name=excluded.name,lat=excluded.lat,lng=excluded.lng,
       is_lotstation=excluded.is_lotstation,is_major_waypoint=excluded.is_major_waypoint,section=excluded.section,description=excluded.description,updated_at=now()`,
    [`vrp-${i}`, p.section ?? null, i, p.name ?? null, p.coordinates?.lat ?? null, p.coordinates?.lng ?? null,
     p.isLotstation ?? false, p.isMajorWaypoint ?? false, p.section ?? null, p.description ?? null]
  );
  n++;
}
console.log(`  valdemar_route_points: ${n}`);

// 4. germanic_periods (scalars + full objekt i detail jsonb)
n = 0;
for (const p of periods) {
  await client.query(
    `insert into public.germanic_periods (id,name,name_en,start_year,end_year,color,description,description_en,detail,updated_at)
     values ($1,$2,$3,$4,$5,$6,$7,$8,$9,now())
     on conflict (id) do update set name=excluded.name,name_en=excluded.name_en,start_year=excluded.start_year,end_year=excluded.end_year,
       color=excluded.color,description=excluded.description,description_en=excluded.description_en,detail=excluded.detail,updated_at=now()`,
    [p.id, p.name, p.nameEn ?? null, p.startYear ?? null, p.endYear ?? null, p.color ?? null,
     p.description ?? null, p.descriptionEn ?? null, JSON.stringify(p)]
  );
  n++;
}
console.log(`  germanic_periods: ${n}`);

await client.end();
console.log('Klart.');
