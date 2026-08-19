// Center-fallback i entity_answer_context: rena ortnamn (Färjestaden) fick center=null → hela
// högerkolumnen + kartan blev tom. Lägger resolve_place(p_name) som sista fallback i ctr-CTE:t
// (concept-safe — resolve_place ger tomt för "viking"/"njord"/"svamp"). Idempotent.
// Kör: node scripts/data/patch-answer-center-fallback.mjs
import fs from 'fs'; import pg from 'pg';
const env = Object.fromEntries(fs.readFileSync('.env','utf8').split('\n').filter(l=>l.includes('=')).map(l=>{const i=l.indexOf('=');return [l.slice(0,i).trim(),l.slice(i+1).trim()];}));
const c = new pg.Client({ host:'aws-0-eu-north-1.pooler.supabase.com', port:5432, user:'postgres.mnuifmcjspeaauzehasj', password:env.SUPABASE_DB_PASSWORD, database:'postgres', ssl:{rejectUnauthorized:false} });
await c.connect();
let d=(await c.query(`select pg_get_functiondef(oid) d from pg_proc where proname='entity_answer_context'`)).rows[0].d;
if (d.includes('resolve_place(p_name)')) { console.log('center-fallback finns redan'); await c.end(); process.exit(0); }
const reps = [
  ['SELECT CASE WHEN EXISTS(SELECT 1 FROM page) THEN (SELECT lat FROM page)',
   'SELECT coalesce(CASE WHEN EXISTS(SELECT 1 FROM page) THEN (SELECT lat FROM page)'],
  ['THEN (SELECT avg(lat) FROM ins) END AS lat,',
   'THEN (SELECT avg(lat) FROM ins) END, CASE WHEN NOT EXISTS(SELECT 1 FROM theme) THEN (SELECT lat FROM resolve_place(p_name) LIMIT 1) END) AS lat,'],
  ['CASE WHEN EXISTS(SELECT 1 FROM page) THEN (SELECT lng FROM page)',
   'coalesce(CASE WHEN EXISTS(SELECT 1 FROM page) THEN (SELECT lng FROM page)'],
  ['THEN (SELECT avg(lng) FROM ins) END AS lng',
   'THEN (SELECT avg(lng) FROM ins) END, CASE WHEN NOT EXISTS(SELECT 1 FROM theme) THEN (SELECT lng FROM resolve_place(p_name) LIMIT 1) END) AS lng'],
];
for (const [a,b] of reps) { if (!d.includes(a)) { console.error('MATCH SAKNAS:', a.slice(0,50)); process.exit(1);} d=d.replace(a,b); }
await c.query(d);
console.log('center-fallback injicerad');
await c.end();
