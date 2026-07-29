// Sköldebrev/härold-seed: Simon Hendel (Kalmarunionens härold) + källor + acquisition-backfill.
// Copyright: fakta + citat, ingen klistrad prosa. Prosopografisk osäkerhet kodad (is_identity_certain=false).
// Kör: node scripts/data/seed-heralds.mjs [--apply]
import pg from 'pg'; import { readFileSync } from 'node:fs';
const APPLY = process.argv.includes('--apply');
const env = Object.fromEntries(readFileSync('./.env','utf8').split(/\r?\n/).filter(l=>l&&!l.startsWith('#')&&l.includes('=')).map(l=>{const i=l.indexOf('=');return [l.slice(0,i).trim(),l.slice(i+1).trim().replace(/^["']|["']$/g,'')];}));
const c=new pg.Client({host:'aws-0-eu-north-1.pooler.supabase.com',port:5432,user:'postgres.mnuifmcjspeaauzehasj',password:env.SUPABASE_DB_PASSWORD,database:'postgres',ssl:{rejectUnauthorized:false},statement_timeout:120000});
await c.connect();
const one = async (sql,p) => (await c.query(sql,p)).rows[0];
async function source(title, author, kind, rights){
  const r=await one(`select id from historical_sources where title=$1`,[title]);
  if(r){ await c.query(`update historical_sources set rights=$2 where id=$1 and rights='unknown'`,[r.id,rights]); return r.id; }
  return (await one(`insert into historical_sources (title,title_en,author,reliability,language,kind,rights) values ($1,$1,$2,'secondary','sv',$3,$4) returning id`,[title,author,kind,rights])).id;
}

try {
  await c.query('BEGIN');
  const srcWik = await source('Wiktorsson, Per-Axel (1989): Svenska sköldebrev från medeltiden (i "Individ och historia", Sthlm 1989)','Wiktorsson, Per-Axel','publication','copyrighted');
  const srcVer = await source('Verwohlt, E.: Valdemar Atterdags och Erik av Pommerns herolder (Historisk Tidskrift)','Verwohlt, E.','publication','copyrighted');
  const srcDD  = await source('Diplomatarium Danicum (diplomatarium.dk) — medeltidsbrev','Det Danske Sprog- og Litteraturselskab','archive_item','public_domain');

  // --- Simon Hendel ---
  let simon = await one(`select herald_id from heralds where name=$1 and coalesce(byname,'')=$2`,['Simon','Hendel']);
  if (!simon) {
    simon = await one(
      `insert into heralds (name,byname,office,realm,origin_note,active_start,active_end,is_identity_certain,biography,source_id,source_refs)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) returning herald_id`,
      ['Simon','Hendel','härold över tre kungariken','Kalmarunionen',
       'Sannolikt tysk (indicium, ej bevis: brodern Kristian befann sig i Danzig).',
       1404, 1423, false,
       'Kalmarunionens första kända härold. Titulerar sig "härold över tre kungariken" i ett brev till Danzigs magistrat 1423 (bevarat i Danzigs stadsarkiv), där han ber dem ta hand om brodern Kristian på ett hospital. Verksamheten i Norden är delvis okänd. OSÄKRA identifikationer: en "Simon Tennemark" utsågs till härold av kung Sigismund av Ungern 1411 (DD 14110812001) — kanske samme man (Tennemark = Danmark/häroldsnamn?); en onämnd härold sändes till Ungern av drottning Margareta före 1411 (DD 14049999045) men behöver ej vara Simon (kanske Bernt Traveman); 1416 är Simon härold vid Fehmarnsund tillsammans med Bernd Traveman (DD 14160713001), nämnd tre gånger. Flera personer kan ha delat förnamnet — identiteten är inte säkerställd.',
       srcVer,
       ['Diplomatarium Danicum 14110812001','Diplomatarium Danicum 14049999045','Diplomatarium Danicum 14160713001','Verwohlt (HT), s. 30–32']]);
    await c.query(`insert into entity_registry (id,entity_type,label) values ($1,'herald',$2) on conflict (id) do nothing`,[simon.herald_id,'Simon Hendel']);
  }

  // --- acquisition-backfill: svensk norm = antaget; Malmö = vapenbrev (granted_charter) ---
  const rTown = await c.query(`update armorial_bearers set acquisition='assumed' where bearer_kind='town' and acquisition='unknown'`);
  const rMalmo = await c.query(
    `update armorial_bearers b set acquisition='granted_charter'
       from coats_of_arms a where b.arms_id=a.arms_id and b.bearer_kind='town' and a.name ilike 'Malmö%'`);
  const rDyn = await c.query(`update armorial_bearers set acquisition='inherited' where bearer_kind='dynasty' and acquisition='unknown'`);

  console.log(`Simon Hendel: ${simon.herald_id ? 'ok' : 'fanns'}; acquisition: ${rTown.rowCount} town→assumed, ${rMalmo.rowCount} Malmö→granted_charter, ${rDyn.rowCount} dynasty→inherited`);
  if (APPLY) { await c.query('COMMIT'); console.log('SEEDED (committed).'); }
  else { await c.query('ROLLBACK'); console.log('DRY RUN (rolled back). Kör med --apply.'); }
} catch (e) { await c.query('ROLLBACK'); console.error('FAILED (rolled back):', e.message); process.exitCode=1; }
finally { await c.end(); }
