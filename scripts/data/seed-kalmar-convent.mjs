// Kalmars dominikankonvent (1243) → christian_sites. Koordinat: Daniels Lantmäteriet-avläsning
// SWEREF99TM N6280092/E582802 → WGS84 56.657636/16.350714, ±100 m (exakt position kommer i helgen).
// Vrakstrand-hypotesen som FLAGGAD not (tolkning, ej dom). Kör: node scripts/data/seed-kalmar-convent.mjs [--apply]
import pg from 'pg'; import { readFileSync } from 'node:fs';
const APPLY = process.argv.includes('--apply');
const env = Object.fromEntries(readFileSync('./.env','utf8').split(/\r?\n/).filter(l=>l&&!l.startsWith('#')&&l.includes('=')).map(l=>{const i=l.indexOf('=');return [l.slice(0,i).trim(),l.slice(i+1).trim().replace(/^["']|["']$/g,'')];}));
const c=new pg.Client({host:'aws-0-eu-north-1.pooler.supabase.com',port:5432,user:'postgres.mnuifmcjspeaauzehasj',password:env.SUPABASE_DB_PASSWORD,database:'postgres',ssl:{rejectUnauthorized:false}});
await c.connect();
const one = async (sql,p) => (await c.query(sql,p)).rows[0];
const LAT=56.657636, LNG=16.350714;

try {
  await c.query('BEGIN');
  const exists = await one(`select id from christian_sites where name ilike '%dominikankonvent%' and county ilike '%kalmar%'`);
  if (exists) { console.log('Finns redan:', exists.id); await c.query('ROLLBACK'); process.exit(0); }

  // coordinates-kolumnens typ (geometry vs native point) → rätt uttryck
  const udt = (await one(`select udt_name from information_schema.columns where table_name='christian_sites' and column_name='coordinates'`))?.udt_name;
  const coordExpr = udt === 'point' ? `point($LNG,$LAT)`.replace('$LNG',LNG).replace('$LAT',LAT)
                                     : `ST_SetSRID(ST_MakePoint(${LNG},${LAT}),4326)`;
  console.log('coordinates udt:', udt, '→', coordExpr);

  const desc = 'Kalmars dominikankonvent (svartbröderna) — grundat 1243, ett av Sveriges äldsta dominikankonvent (samtida med Sigtuna och Skänninge). Låg i Gamla stan vid Kalmar slott; upplöst vid reformationen på 1500-talet. Gamla stan revs efter 1640-talet då staden flyttades till Kvarnholmen.';
  const notes = 'KOORDINAT: ±100 m — Daniels avläsning i Lantmäteriets ortofoto (SWEREF99TM N 6280092, E 582802 → WGS84 56.657636, 16.350714), pin vid synliga grundmurar ("kapellgrunden"). Exakt position kommer efter platsbesök. HYPOTES (Daniel, tolkning ej dom): konventet låg vid den strand dit fartyg som grundstötte på Skansgrundet drev, och kan som närmaste institution ha gynnats — bärgning, härbärge för skeppsbrutna, själagåvor. Källkritik: vrakrätt/strandrätt var i regel kunglig/manorial, ej klostrets utan brev; "positionerat att gynnas" håller, "predatoriskt system" kräver belägg. Kopplar till Grimskär-/Skansgrundet-hypotesen; prövbar mot strandförskjutningsmodell (saknas för Kalmarsund).';

  const ins = await one(
    `insert into christian_sites (name,name_en,coordinates,site_type,religious_order,founded_year,period,status,significance_level,description,historical_notes,current_condition,region,county,province)
     values ($1,$2,${coordExpr},'monastery','dominican',1243,'medieval','archaeological','high',$3,$4,$5,'Sydöstra Sverige','Kalmar','Småland') returning id`,
    ['Kalmars dominikankonvent (Svartbrödraklostret)','Kalmar Dominican Priory (Blackfriars)', desc, notes,
     'Grundmurar/lämningar (kapellgrund synlig på plats enligt observation)']);
  console.log('Infogat:', ins.id, `@ ${LAT}, ${LNG}`);

  if (APPLY) { await c.query('COMMIT'); console.log('SEEDED (committed).'); }
  else { await c.query('ROLLBACK'); console.log('DRY RUN (rolled back). Kör med --apply.'); }
} catch (e) { await c.query('ROLLBACK'); console.error('FAILED (rolled back):', e.message); process.exitCode=1; }
finally { await c.end(); }
