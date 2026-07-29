// Hansa/tyska-Östersjön-lagret: Lübeck-nod + Tyska orden-heraldik + Sankt Peters kista.
// COPYRIGHT: fakta + citat, ingen klistrad prosa. Källor rights-taggade (Wikipedia CC BY-SA,
// hanse.org skyddat, Nordisk familjebok PD, Gotlands museum skyddat). Koordinater: väletablerade
// landmärken (Lübeck Altstadt, Visby domkyrka). Kör: node scripts/data/seed-hansa-baltic.mjs [--apply]
import pg from 'pg'; import { readFileSync } from 'node:fs';
const APPLY = process.argv.includes('--apply');
const env = Object.fromEntries(readFileSync('./.env','utf8').split(/\r?\n/).filter(l=>l&&!l.startsWith('#')&&l.includes('=')).map(l=>{const i=l.indexOf('=');return [l.slice(0,i).trim(),l.slice(i+1).trim().replace(/^["']|["']$/g,'')];}));
const c=new pg.Client({host:'aws-0-eu-north-1.pooler.supabase.com',port:5432,user:'postgres.mnuifmcjspeaauzehasj',password:env.SUPABASE_DB_PASSWORD,database:'postgres',ssl:{rejectUnauthorized:false}});
await c.connect();
const one=async(sql,p)=>(await c.query(sql,p)).rows[0];
async function source(title,author,kind,rights,url){
  const r=await one(`select id from historical_sources where title=$1`,[title]);
  if(r){ await c.query(`update historical_sources set rights=$2 where id=$1 and rights='unknown'`,[r.id,rights]); return r.id; }
  return (await one(`insert into historical_sources (title,title_en,author,reliability,language,kind,rights,url) values ($1,$1,$2,'secondary','sv',$3,$4,$5) returning id`,[title,author,kind,rights,url])).id;
}
try{
  await c.query('BEGIN');
  const srcWiki=await source('Wikipedia: Hansestad / Tyska orden','Wikipedia-bidragsgivare','dataset','cc_by_sa','https://sv.wikipedia.org/wiki/Hansestad');
  await source('Europäisches Hansemuseum: The medieval Hanseatic League (hanse.org)','Europäisches Hansemuseum','publication','copyrighted','https://www.hanse.org/en/the-medieval-hanseatic-league/');
  await source('Nordisk familjebok (Uggleupplagan): Hansestäder','Nordisk familjebok','publication','public_domain',null);
  await source('Gotlands museum / Svenska kyrkan: Hanseköpmännens kista (Sankt Peters kista), 2024','Widerström, Per (Gotlands museum)','publication','copyrighted',null);

  // ---- LÜBECK ----
  let lubeck=await one(`select id from viking_cities where name='Lübeck'`);
  if(!lubeck){
    lubeck=await one(
      `insert into viking_cities (name,coordinates,category,period_start,period_end,country,region,status,description,historical_significance)
       values ('Lübeck',point(10.6866,53.8655),'trading_post',1143,1669,'Tyskland','Schleswig-Holstein','active',$1,$2) returning id`,
      ['Hansans huvudstad. Grundad 1143, återgrundad 1159 av Henrik Lejonet. "Lübisches Recht" (lübsk stadsrätt, byggd på Soest-rätten) antogs av 100+ östersjöstäder. Källor: Wikipedia (CC BY-SA); hanse.org.',
       'Ledande stad i Hansan; nära handels- och rättsband till Visby och Kalmar (Kalmars äldsta stadssigill 1247–1269 satt på brev till Lübecks råd; brev från Kalmar slott till Lübeck 1261).']);
  }

  // ---- TYSKA ORDEN (heraldik) ----
  const m_kors=(await one(`select motif_id from iconographic_motifs where name='Kors'`)) ??
    (await one(`insert into iconographic_motifs (name,name_en,category,heraldic_term,origin_note) values ('Kors','Cross','kors','kors','Kristen huvudsymbol; i heraldiken otaliga varianter.') returning motif_id`));
  await c.query(`insert into entity_registry (id,entity_type,label) values ($1,'iconographic_motif','Kors') on conflict (id) do nothing`,[m_kors.motif_id]);
  let arms=await one(`select arms_id from coats_of_arms where name ilike 'Tyska orden%'`);
  if(!arms){
    arms=await one(`insert into coats_of_arms (name,name_en,blazon,earliest_year,notes) values ('Tyska orden (svart kors på vitt)','Teutonic Order (sable cross on argent)','I vitt fält ett svart kors',1198,'Grundad som brödraskap av köpmän från Lübeck och Bremen (Acre 1189–90), riddarorden 1198. Innehade Gotland 1398–1408.') returning arms_id`);
    await c.query(`insert into entity_registry (id,entity_type,label) values ($1,'coat_of_arms','Tyska orden') on conflict (id) do nothing`,[arms.arms_id]);
  }
  await c.query(`insert into coat_charges (arms_id,motif_id,tincture,field_tincture,ordinary,source_id) values ($1,$2,'svart','vitt','kors',$3) on conflict (arms_id,motif_id,ordinary) do nothing`,[arms.arms_id,m_kors.motif_id,srcWiki]);
  const b=await one(`select id from armorial_bearers where arms_id=$1 and bearer_kind='institution'`,[arms.arms_id]);
  if(!b) await c.query(`insert into armorial_bearers (arms_id,bearer_kind,bearer_name,period_start,evidence,acquisition,source_id,notes) values ($1,'institution','Tyska orden (Deutscher Orden)',1198,'belagd','adopted',$2,'Riddarorden; korsherrar.')`,[arms.arms_id,srcWiki]);
  const at=await one(`select attestation_id from heraldic_attestations where arms_id=$1 and target='external' and target_ref ilike 'Gotland%'`,[arms.arms_id]);
  if(!at) await c.query(`insert into heraldic_attestations (arms_id,target,target_ref,evidence_class,start_year,end_year,source_id,notes) values ($1,'external','Gotland/Visby — Tyska ordens innehav 1398–1408 (avtal 1399)','belagd',1398,1408,$2,'Orden intog Gotland 1398 (mot vitaliebröderna), avträdde till unionen 1408.')`,[arms.arms_id,srcWiki]);

  // ---- SANKT PETERS KISTA ----
  const kista=await one(`select id from historical_events where event_name ilike '%Sankt Peters kista%'`);
  if(!kista){
    await c.query(
      `insert into historical_events (year_start,event_name,event_name_en,description,significance_level,region_affected,sources,lat,lng,location_status)
       values (1240,'Hansans kista (Sankt Peters kista) i Visby domkyrka','Hanseatic chest (St Peter''s chest), Visby cathedral',$1,'high',ARRAY['Gotland'],$2,57.6408,18.2960,'verified')`,
      ['Dendrokronologiskt daterad till ca 1240 (virke från 1209). Hansan förvarade handelsinkomster i kistan; företrädare för Visby, Lübeck, Soest och Dortmund hade var sin nyckel och måste samlas för att öppna den två gånger/år. Källa: Gotlands museum / Svenska kyrkan 2024 (Per Widerström).',
       ['Gotlands museum / Svenska kyrkan 2024','Europäisches Hansemuseum (hanse.org)']]);
  }
  console.log(`Lübeck ${lubeck?.id?'ok':'?'}; Tyska orden-vapen ${arms?.arms_id?'ok':'?'}; kista ${kista?'fanns':'infogad'}`);
  if(APPLY){ await c.query('COMMIT'); console.log('APPLIED.'); } else { await c.query('ROLLBACK'); console.log('DRY RUN (rollback). --apply för skarpt.'); }
}catch(e){ await c.query('ROLLBACK'); console.error('FAILED:',e.message); process.exitCode=1; }
finally{ await c.end(); }
