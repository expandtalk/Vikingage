// Backfill av place_names.province via NÄRMASTE heritage_site med landskap (KNN, GiST-index).
// Utan landskapspolygoner är detta bästa spatiala härledningen. APPROXIMATIV → märks i attribution.
// Avståndsgräns 25 km: är närmaste lämning längre bort lämnas province NULL (ärligt: för osäkert).
// Keyset-batchat (id-ordning) så varje rad processas en gång. Idempotent (rör bara province IS NULL).
import pg from 'pg';
import { readFileSync } from 'node:fs';

const APPLY = process.argv.includes('--apply');
const env = Object.fromEntries(
  readFileSync(new URL('../../.env', import.meta.url), 'utf8')
    .split(/\r?\n/).filter(l => l && !l.startsWith('#') && l.includes('='))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; })
);

async function main() {
  const client = new pg.Client({
    host: 'aws-0-eu-north-1.pooler.supabase.com', port: 5432,
    user: 'postgres.mnuifmcjspeaauzehasj', password: env.SUPABASE_DB_PASSWORD, database: 'postgres',
    ssl: { rejectUnauthorized: false }, statement_timeout: 0,
  });
  await client.connect();
  try {
    const todo = (await client.query(
      `select count(*) n from place_names where (province is null or province='') and geom is not null`)).rows[0].n;
    console.log(`Att backfilla: ${todo} ortnamn. Läge: ${APPLY ? 'APPLY' : 'DRY-RUN'}.`);
    if (!APPLY) { console.log('DRY-RUN — kör med --apply.'); return; }

    let lastId = '00000000-0000-0000-0000-000000000000';
    let assigned = 0, skipped = 0, done = 0;
    for (;;) {
      const batch = await client.query(
        `select id from place_names where id > $1 and geom is not null order by id limit 4000`, [lastId]);
      if (batch.rows.length === 0) break;
      lastId = batch.rows[batch.rows.length - 1].id;
      const ids = batch.rows.map(r => r.id);
      const res = await client.query(
        `update place_names p
         set province = c.landscape,
             attribution = case when coalesce(p.attribution,'')='' then '' else p.attribution || ' · ' end
                           || 'province spatialt härledd (närmaste heritage_site-landskap ≤25 km, approximativ)'
         from (select id, geom from place_names where id = any($1)) b
         join lateral (
           select h.landscape, h.geom from heritage_sites h
           where h.geom is not null and h.landscape is not null and h.landscape <> ''
           order by h.geom <-> b.geom limit 1
         ) c on true
         where p.id = b.id and (p.province is null or p.province='')
           and ST_DWithin(b.geom::geography, c.geom::geography, 25000)`, [ids]);
      assigned += res.rowCount;
      done += batch.rows.length;
      if (done % 20000 === 0 || batch.rows.length < 4000)
        console.log(`  …${done} processade, ${assigned} fick province`);
    }
    skipped = todo - assigned;
    console.log(`\n✅ KLART: ${assigned} ortnamn fick province (spatialt härledd). ~${skipped} lämnade NULL (>25 km till närmaste landskaps-lämning / redan satt).`);
  } finally { await client.end(); }
}
main().catch(e => { console.error(e); process.exit(1); });
