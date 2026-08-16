// Lägger RAÄ-flygbilden (Jan Norrman 1991) som LÄNK-ONLY extern referens på Gettlinge.
// Ingen rehosting: CC-BY 4.0 men spridning kräver Lantmäteri-tillstånd (lag 2016:319, RAÄ-2020-157).
// Kör: node scripts/data/gettlinge-aerial-ref.mjs [--apply]
import pg from 'pg'; import { readFileSync } from 'node:fs';
const APPLY = process.argv.includes('--apply');
const env = Object.fromEntries(readFileSync('./.env','utf8').split(/\r?\n/).filter(l=>l&&!l.startsWith('#')&&l.includes('=')).map(l=>{const i=l.indexOf('=');return [l.slice(0,i).trim(),l.slice(i+1).trim().replace(/^["']|["']$/g,'')];}));
const c=new pg.Client({host:'aws-0-eu-north-1.pooler.supabase.com',port:5432,user:'postgres.mnuifmcjspeaauzehasj',password:env.SUPABASE_DB_PASSWORD,database:'postgres',ssl:{rejectUnauthorized:false}});
await c.connect();
const ID='deae7694-42f0-4a49-8d56-bd820badec79';
const media = {
  kind: 'aerial_photo',
  title: 'Gettlinge gravfält — flygbild 1991-09-11 (mot SSV)',
  photographer: 'Jan Norrman',
  collection: 'RAÄ Kulturmiljöbild — Jan Norrmans flygbilder',
  object_id: '16000700026637',
  uri: 'https://pub.raa.se/visa/dokumentation/60a033fb-4e13-4ed9-87ae-b972084be592',
  license: 'CC-BY 4.0',
  rights_note: 'Spridning kräver tillstånd från Lantmäteriet enligt lag (2016:319) om skydd för geografisk information (RAÄ-2020-157). Endast utlänk till RAÄ — får ej rehostas.',
  display: 'link_only',
};
try {
  await c.query('BEGIN');
  const before = (await c.query(`select visitor_info from heritage_sites where id=$1`,[ID])).rows[0];
  console.log('FÖRE visitor_info:', JSON.stringify(before?.visitor_info ?? null));
  const r = await c.query(
    `update heritage_sites
       set visitor_info = jsonb_set(coalesce(visitor_info,'{}'::jsonb), '{external_media}',
             coalesce(visitor_info->'external_media','[]'::jsonb) || $2::jsonb, true),
           updated_at = now()
     where id=$1 returning visitor_info`, [ID, JSON.stringify([media])]);
  console.log('EFTER visitor_info:', JSON.stringify(r.rows[0].visitor_info, null, 2));
  if (APPLY) { await c.query('COMMIT'); console.log('\n== APPLIED. =='); }
  else { await c.query('ROLLBACK'); console.log('\n== DRY RUN (rollback). --apply för skarpt. =='); }
} catch(e){ await c.query('ROLLBACK'); console.error('FAILED (rollback):', e.message); process.exitCode=1; }
finally { await c.end(); }
