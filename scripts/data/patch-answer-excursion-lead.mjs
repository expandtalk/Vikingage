// #1: utflykt som lead-källa i entity_answer_context — en ren utflyktsplats (utan inskrift) får nu
// sin description_sv som ingress + /excursions/<id> som "läs mer" (inskrift har företräde via coalesce).
import pg from 'pg';
import fs from 'fs';
const env = Object.fromEntries(fs.readFileSync('.env','utf8').split('\n').filter(l=>l.includes('=')).map(l=>{const i=l.indexOf('=');return [l.slice(0,i).trim(), l.slice(i+1).trim()];}));
const c = new pg.Client({ host:'aws-0-eu-north-1.pooler.supabase.com', port:5432, user:'postgres.mnuifmcjspeaauzehasj', password:env.SUPABASE_DB_PASSWORD, database:'postgres', ssl:{rejectUnauthorized:false} });
await c.connect();
const def0 = (await c.query(`select pg_get_functiondef(p.oid) def from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and p.proname='entity_answer_context' limit 1`)).rows[0].def;
if (def0.includes('FROM exc')) { console.log('redan patchad (exc)'); }
else {
  let def = def0.replace('related AS (', `exc AS (
  SELECT id, description_sv FROM excursions WHERE lower(name) = lower(p_name) LIMIT 1
),
related AS (`);
  def = def.replace(
    `'lead', (SELECT coalesce(nullif(historical_context,''), nullif(translation_sv,'')) FROM hit),`,
    `'lead', coalesce((SELECT coalesce(nullif(historical_context,''), nullif(translation_sv,'')) FROM hit), (SELECT description_sv FROM exc)),`);
  def = def.replace(
    `'leadUrl', (SELECT '/inscription/' || signum FROM hit),`,
    `'leadUrl', coalesce((SELECT '/inscription/' || signum FROM hit), (SELECT '/excursions/' || id FROM exc)),`);
  if (!def.includes('FROM exc')) throw new Error('patch-anchor missade');
  await c.query(def);
  console.log('RPC patchad: utflykt som lead');
}
// testa några utflyktsnamn
const ex = await c.query(`select name from excursions where description_sv is not null and char_length(description_sv)>60 limit 4`);
for (const r of ex.rows) {
  const a = await c.query(`select left(coalesce((entity_answer_context($1))->>'lead',''),70) lead, (entity_answer_context($1))->>'leadUrl' url`, [r.name]);
  console.log(`${r.name}: lead=${JSON.stringify(a.rows[0].lead)} url=${a.rows[0].url}`);
}
await c.end();
