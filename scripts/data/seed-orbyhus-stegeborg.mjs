// Örbyhus slott (nytt) + Stegeborg koordinat + Erik XIV dödsår + Örbyhus som Vasa-ägo.
// Källor: Det medeltida Sverige 1:4 (Tiundaland); koordinater Wikidata P625
//   Örbyhus Q2371512 (60.2, 17.7092), Stegeborg Q661338 (58.441389, 16.598889).
// Kör: node scripts/data/seed-orbyhus-stegeborg.mjs [--apply]
import pg from 'pg'; import { readFileSync } from 'node:fs';
const APPLY = process.argv.includes('--apply');
const env = Object.fromEntries(readFileSync('./.env','utf8').split(/\r?\n/).filter(l=>l&&!l.startsWith('#')&&l.includes('=')).map(l=>{const i=l.indexOf('=');return [l.slice(0,i).trim(),l.slice(i+1).trim().replace(/^["']|["']$/g,'')];}));
const c=new pg.Client({host:'aws-0-eu-north-1.pooler.supabase.com',port:5432,user:'postgres.mnuifmcjspeaauzehasj',password:env.SUPABASE_DB_PASSWORD,database:'postgres',ssl:{rejectUnauthorized:false}});
await c.connect();
const one = async (sql,p=[]) => (await c.query(sql,p)).rows[0];
const VASA = 'adc999b6-9e7e-4b43-97f8-37f1cef86a61'; // Vasaätten (royal_dynasties)
const SRC = 'Det medeltida Sverige 1:4 (Tiundaland); koordinat Wikidata Q2371512 (P625)';

try {
  await c.query('BEGIN');

  // --- A. medieval_castles: Örbyhus slott (ny) ---
  let cRow = await one(`select id from medieval_castles where name ilike '%rbyhus%'`);
  if (cRow) { console.log('A) medieval_castles Örbyhus finns redan:', cRow.id); }
  else {
    cRow = await one(
      `insert into medieval_castles (name,category,region,country_now,lat,lng,coord_status,period,source,note)
       values ($1,'riksborg','Uppland','Sverige',60.2,17.7092,'wikidata',$2,$3,$4) returning id`,
      ['Örbyhus slott',
       'medeltid: tornhus ~1450-tal (Johan Kristiernsson, Vasa); befäst av Gustav Vasa 1538; kungligt statsfängelse; ombyggt till barockpalats 1600-tal',
       SRC,
       'Erik XIV:s sista fängelse — dog här 26 feb 1577 (enligt uppgift arsenikförgiftad). Vasa-ägo: Johan Kristiernsson köpte 1451 och byggde tornhuset, Gustav Vasa köpte 1538 och lät befästa slottet.']);
    console.log('A) medieval_castles Örbyhus INSERT:', cRow.id);
  }

  // --- B. medieval_castles: Stegeborg koordinat ---
  const steg = await one(`select id,lat,lng,coord_status from medieval_castles where name ilike '%stegeborg%'`);
  if (!steg) { console.log('B) VARNING: Stegeborg saknas i medieval_castles (oväntat)'); }
  else {
    await c.query(
      `update medieval_castles set lat=58.441389, lng=16.598889, coord_status='wikidata',
         source=$2,
         period=coalesce(period,$3)
       where id=$1`,
      [steg.id,
       'Wikipedia: Lista över borgar i Sverige och Finland; koordinat Wikidata Q661338 (P625)',
       'medeltid: kastal 1200-tal (skydd av inloppet till Söderköping), bostadsborg 1300-tal; renässansslott under Vasatiden (Hans Fleming 1580-tal); ruin efter 1689']);
    console.log(`B) Stegeborg UPPDATERAD (var lat=${steg.lat}, status=${steg.coord_status}) -> 58.441389/16.598889 wikidata`);
  }

  // --- C. historical_kings: Erik XIV dödsår + dödsplats ---
  const erik = await one(`select id,birth_year,death_year,description from historical_kings where name ilike 'Erik XIV'`);
  if (!erik) { console.log('C) VARNING: Erik XIV saknas'); }
  else {
    const addDeath = /Örbyhus/.test(erik.description||'') ? '' :
      ' Fängslades 1574 och dog på Örbyhus slott 26 februari 1577 (enligt uppgift arsenikförgiftad).';
    await c.query(
      `update historical_kings set death_year=1577, birth_year=coalesce(birth_year,1533),
         description=coalesce(description,'')||$2 where id=$1`,
      [erik.id, addDeath]);
    console.log(`C) Erik XIV UPPDATERAD: death_year 1577 (var ${erik.death_year}), birth_year=${erik.birth_year??1533}; dödsplats-text ${addDeath?'tillagd':'fanns redan'}`);
  }

  // --- D. estates: Örbyhus (maktgeografi) ---
  let est = await one(`select id from estates where name ilike '%rbyhus%'`);
  if (est) { console.log('D) estates Örbyhus finns redan:', est.id); }
  else {
    est = await one(
      `insert into estates (name,estate_type,lat,lng,geom,first_attested,description,source,confidence)
       values ($1,'borg',60.2,17.7092,ST_SetSRID(ST_MakePoint(17.7092,60.2),4326),1352,$2,$3,'certain') returning id`,
      ['Örbyhus',
       'Sätesgård omtalad 1352 ("in curia mea Örby"), sätesgård för Magnus Gislesson (Sparre av Aspnäs). Befäst tornhus från ~1450-talet; kungligt slott och statsfängelse under 1500-talet.',
       'Det medeltida Sverige 1:4 (Tiundaland)']);
    console.log('D) estates Örbyhus INSERT:', est.id);
  }

  // --- E. estate_holdings: Vasa-ägo ---
  const addHolding = async (holder_kind, dynasty_id, king_id, holder_name, ps, pe, via, jord, note) => {
    const ex = await one(
      `select id from estate_holdings where estate_id=$1 and holder_name=$2 and coalesce(period_start,-1)=$3`,
      [est.id, holder_name, ps]);
    if (ex) { console.log(`E) holding "${holder_name}" finns redan:`, ex.id); return; }
    const r = await one(
      `insert into estate_holdings (estate_id,holder_kind,dynasty_id,king_id,holder_name,role,acquired_via,period_start,period_end,jordnatur,confidence,source,note)
       values ($1,$2,$3,$4,$5,'ägo',$6,$7,$8,$9,'certain',$10,$11) returning id`,
      [est.id, holder_kind, dynasty_id, king_id, holder_name, via, ps, pe, jord,
       'Det medeltida Sverige 1:4 (Tiundaland)', note]);
    console.log(`E) holding "${holder_name}" INSERT:`, r.id);
  };
  await addHolding('dynasty', VASA, null, 'Vasaätten (Johan Kristiernsson)', 1451, 1538, 'kop', 'fralse',
    'Johan Kristiernsson (Vasa) köpte Örbyhus 1451 och byggde det gamla tornhuset; kvarblev i ättens ägo via arv fram till Gustav Vasas köp 1538.');
  const gv = await one(`select id from historical_kings where name ilike 'Gustav Vasa'`);
  await addHolding('king', null, gv?.id ?? null, 'Gustav Vasa', 1538, null, 'kop', 'krono',
    'Gustav Vasa köpte godset av sina kusiner 1538 och lät befästa Örbyhus med murar och kasematter; kronans statsfängelse (Erik XIV 1574–1577).');

  if (APPLY) { await c.query('COMMIT'); console.log('\n== SEEDED (committed). =='); }
  else { await c.query('ROLLBACK'); console.log('\n== DRY RUN (rollback). Kör med --apply för att spara. =='); }
} catch (e) { await c.query('ROLLBACK'); console.error('FAILED (rollback):', e.message); process.exitCode=1; }
finally { await c.end(); }
