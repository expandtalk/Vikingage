// Backfyll typologisk period på gravlämningar i Kalmar-områdets två kluster (Västra sjön + Kläckeberga).
// FLAGGAT "(typologiskt)" — monumenttyp-baserad tolkning, ej Fornsök-kalenderdatering. Scopat till bbox
// + period IS NULL + gravtyper. Kör: node scripts/data/backfill-kalmar-grave-periods.mjs [--apply]
import pg from 'pg'; import { readFileSync } from 'node:fs';
const APPLY = process.argv.includes('--apply');
const env = Object.fromEntries(readFileSync('./.env','utf8').split(/\r?\n/).filter(l=>l&&!l.startsWith('#')&&l.includes('=')).map(l=>{const i=l.indexOf('=');return [l.slice(0,i).trim(),l.slice(i+1).trim().replace(/^["']|["']$/g,'')];}));
const c=new pg.Client({host:'aws-0-eu-north-1.pooler.supabase.com',port:5432,user:'postgres.mnuifmcjspeaauzehasj',password:env.SUPABASE_DB_PASSWORD,database:'postgres',ssl:{rejectUnauthorized:false}});
await c.connect();
try{
  await c.query('BEGIN');
  const r=await c.query(`
    update heritage_sites set period = case lower(raa_type)
      when 'stenkammargrav' then 'neolitikum (typologiskt)'
      when 'röse' then 'bronsålder–äldre järnålder (typologiskt)'
      when 'domarring' then 'romersk järnålder–folkvandringstid (typologiskt)'
      else 'järnålder (typologiskt)' end
    where period is null and lat between 56.60 and 56.78 and lng between 16.18 and 16.38
      and lower(raa_type) in ('gravfält','domarring','stensättning','röse','stenkammargrav')`);
  console.log(`backfyll: ${r.rowCount} gravlämningar fick typologisk period`);
  const chk=await c.query(`select period, count(*)::int n from heritage_sites where lat between 56.60 and 56.78 and lng between 16.18 and 16.38 and period ilike '%typolog%' group by period order by n desc`);
  chk.rows.forEach(x=>console.log(`  ${x.period}: ${x.n}`));
  // coast-chain: Rockneby + Mönsterås (read-only inom samma tx)
  for(const [namn,a,b,d,e] of [['Rockneby',56.80,56.88,16.22,16.36],['Mönsterås',56.98,57.10,16.34,16.52]]){
    const g=await c.query(`select count(*)::int n from heritage_sites where lat between ${a} and ${b} and lng between ${d} and ${e} and lower(raa_type) in ('gravfält','domarring','stensättning','röse','stenkammargrav','fornborg','runristning')`);
    console.log(`  ${namn}-bbox gravlämningar: ${g.rows[0].n}`);
  }
  if(APPLY){ await c.query('COMMIT'); console.log('APPLIED.'); } else { await c.query('ROLLBACK'); console.log('DRY RUN (rollback). --apply för skarpt.'); }
}catch(e){ await c.query('ROLLBACK'); console.error('FAILED:',e.message); process.exitCode=1; }
finally{ await c.end(); }
