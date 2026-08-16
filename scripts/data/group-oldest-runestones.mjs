// Task 2: hypotesgrupp "Nordens äldsta runstenar" — ENDAST genuina runstenar (object_category
// runestone), äldre futhark / romersk järnålder–folkvandringstid (period_start <= 450).
// Lösföremål (fibula, lansspets, kam, krukskärva) EXKLUDERAS. Rör ej stenar som redan har grupp.
// Kör: node scripts/data/group-oldest-runestones.mjs [--apply]
import pg from 'pg'; import { readFileSync } from 'node:fs';
const APPLY = process.argv.includes('--apply');
const env = Object.fromEntries(readFileSync('./.env','utf8').split(/\r?\n/).filter(l=>l&&!l.startsWith('#')&&l.includes('=')).map(l=>{const i=l.indexOf('=');return [l.slice(0,i).trim(),l.slice(i+1).trim().replace(/^["']|["']$/g,'')];}));
const c=new pg.Client({host:'aws-0-eu-north-1.pooler.supabase.com',port:5432,user:'postgres.mnuifmcjspeaauzehasj',password:env.SUPABASE_DB_PASSWORD,database:'postgres',ssl:{rejectUnauthorized:false}});
await c.connect();
const GROUP='Nordens äldsta runstenar (hypotes)';
// Exkludera DK Bl-dubbletterna (Istaby/Björketorp finns redan som DR 359/360 i Blekinge-gruppen).
const WHERE=`object_category='runestone' and period_start is not null and period_start <= 450 and inscription_group is null and signum not ilike 'DK Bl%'`;
try {
  await c.query('BEGIN');
  const cand = await c.query(`select signum, name, object_type, style_group, dating_text, period_start from runic_inscriptions where ${WHERE} order by period_start asc, signum`);
  console.log(`### KANDIDATER (${cand.rowCount})`);
  for (const r of cand.rows) console.log(JSON.stringify(r));
  const upd = await c.query(`update runic_inscriptions set inscription_group=$1, updated_at=now() where ${WHERE} returning signum`,[GROUP]);
  console.log(`\nSatte '${GROUP}' på ${upd.rowCount} genuina runstenar.`);
  if (APPLY) { await c.query('COMMIT'); console.log('== APPLIED. =='); }
  else { await c.query('ROLLBACK'); console.log('== DRY RUN (rollback). --apply för skarpt. =='); }
} catch(e){ await c.query('ROLLBACK'); console.error('FAILED:', e.message); process.exitCode=1; }
finally { await c.end(); }
