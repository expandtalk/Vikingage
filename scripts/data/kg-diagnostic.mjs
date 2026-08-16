// READ-ONLY KG-diagnostik: räknar relationship-predikat + entity_registry-typer live.
// Kör: node scripts/data/kg-diagnostic.mjs
import pg from 'pg';
import { readFileSync } from 'node:fs';

const env = Object.fromEntries(
  readFileSync('./.env', 'utf8').split(/\r?\n/)
    .filter(l => l && !l.startsWith('#') && l.includes('='))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; })
);

const client = new pg.Client({
  host: 'aws-0-eu-north-1.pooler.supabase.com', port: 5432,
  user: 'postgres.mnuifmcjspeaauzehasj', password: env.SUPABASE_DB_PASSWORD,
  database: 'postgres', ssl: { rejectUnauthorized: false }, statement_timeout: 120000,
});

const q = async (label, sql) => {
  const r = await client.query(sql);
  console.log(`\n=== ${label} ===`);
  for (const row of r.rows) console.log(Object.values(row).map(v => String(v)).join('  |  '));
  return r.rows;
};

await client.connect();
try {
  const relTot = await client.query('select count(*)::int n from relationship');
  const erTot = await client.query('select count(*)::int n from entity_registry');
  console.log(`relationship-kanter TOTALT: ${relTot.rows[0].n}`);
  console.log(`entity_registry-noder TOTALT: ${erTot.rows[0].n}`);

  await q('relationship: predikat-fördelning (alla)',
    `select predicate, count(*)::int n, round(100.0*count(*)/sum(count(*)) over (),1) pct
     from relationship group by predicate order by n desc`);

  await q('entity_registry: nod-typer',
    `select entity_type, count(*)::int n from entity_registry group by entity_type order by n desc`);

  await q('Navigerings-kritiska predikat (finns de?)',
    `with want(p) as (values ('buried_at'),('dated_to'),('belongs_to_parish'),('part_of_hundred'),
        ('commissioned_by'),('kin_of'),('near'),('depicts'),('written_in'),('located_in'),
        ('has_estate'),('has_theme'),('related_to'))
     select w.p predikat, coalesce(c.n,0)::int antal
     from want w left join (select predicate, count(*) n from relationship group by predicate) c
       on c.predicate=w.p order by antal desc, predikat`);

  await q('Stora innehållstabeller registrerade som noder? (0 = ej skördad)',
    `with t(name) as (values ('place_name'),('heritage_site'),('parish'),('hundred'),
        ('interpretation'),('reading'),('church'),('ecclesiastical_site'),('event'),('charter'))
     select t.name typ, coalesce(c.n,0)::int noder
     from t left join (select entity_type, count(*) n from entity_registry group by entity_type) c
       on c.entity_type=t.name order by noder desc, typ`);

  // finns rel_predicates-katalogen och hur många predikat är definierade vs använda
  await q('rel_predicates: definierade predikat vs använda',
    `select p.predicate, coalesce(u.n,0)::int anvant
     from rel_predicates p left join (select predicate, count(*) n from relationship group by predicate) u
       on u.predicate=p.predicate order by anvant desc, p.predicate`);
} catch (e) {
  console.error('FEL:', e.message);
  process.exitCode = 1;
} finally {
  await client.end();
}
