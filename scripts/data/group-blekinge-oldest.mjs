// Task 1: gruppera de 4 senurnordiska Blekinge-stenarna (inscription_group).
// Task 2 (read-only): visa kandidater till "äldsta" (äldre-futhark-typologi) för beslut.
// Kör: node scripts/data/group-blekinge-oldest.mjs [--apply]
import pg from 'pg'; import { readFileSync } from 'node:fs';
const APPLY = process.argv.includes('--apply');
const env = Object.fromEntries(readFileSync('./.env','utf8').split(/\r?\n/).filter(l=>l&&!l.startsWith('#')&&l.includes('=')).map(l=>{const i=l.indexOf('=');return [l.slice(0,i).trim(),l.slice(i+1).trim().replace(/^["']|["']$/g,'')];}));
const c=new pg.Client({host:'aws-0-eu-north-1.pooler.supabase.com',port:5432,user:'postgres.mnuifmcjspeaauzehasj',password:env.SUPABASE_DB_PASSWORD,database:'postgres',ssl:{rejectUnauthorized:false}});
await c.connect();
const q = async (label,sql,p=[]) => { const r=await c.query(sql,p); console.log(`\n### ${label} (${r.rowCount})`); for(const row of r.rows) console.log(JSON.stringify(row)); return r; };
const GROUP='Blekinges senurnordiska runstenar';
const FOUR=['DR 357','DR 358','DR 359','DR 360'];
try {
  await c.query('BEGIN');
  // TASK 1
  await q('FÖRE (4 stenar)',`select signum, inscription_group from runic_inscriptions where signum = any($1) order by signum`,[FOUR]);
  const upd = await c.query(`update runic_inscriptions set inscription_group=$2, updated_at=now() where signum = any($1) returning signum`,[FOUR,GROUP]);
  console.log(`\nTASK1: satte inscription_group='${GROUP}' på ${upd.rowCount} stenar: ${upd.rows.map(r=>r.signum).join(', ')}`);

  // TASK 2 (read-only) — kandidater till äldsta: äldre-futhark-typologi + tidiga dateringar
  await q('TASK2 kandidater: äldre-futhark-stilar (C/B/D-koder, Protogermansk, Tidig)',
   `select signum, name, style_group, dating_text, period_start, dating_tpq, dating_taq
    from runic_inscriptions
    where style_group ~* '^(protogermansk|tidig|b2|c1|c2|c3|d1)' or style_group ilike '%protogermansk%'
    order by coalesce(period_start, dating_tpq, 9999) asc, signum limit 30`);
  await q('TASK2 äldsta via numerisk period_start (topp 15)',
   `select signum, name, style_group, dating_text, period_start from runic_inscriptions
    where period_start is not null order by period_start asc limit 15`);

  if (APPLY) { await c.query('COMMIT'); console.log('\n== TASK1 APPLIED. =='); }
  else { await c.query('ROLLBACK'); console.log('\n== DRY RUN (TASK1 rollback). TASK2 är read-only. =='); }
} catch(e){ await c.query('ROLLBACK'); console.error('FAILED (rollback):', e.message); process.exitCode=1; }
finally { await c.end(); }
