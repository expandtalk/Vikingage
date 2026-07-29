// Kyrkor i Kalmar Gamla stan → christian_sites. Källa: Kalmar läns museum
// (medeltiden.kalmarlansmuseum.se) — copyright: FAKTA + citat, ingen klistrad prosa.
// Bykyrkan: VERIFIERAD koord (Daniel via Lantmäteriet, WGS84 56°39'24"N 16°21'11.3"E, Kalmar Gamla Stan 2:3).
// Birgittakyrkan: exakt läge okänt → Gamla stan-approx, flaggat. Kör: node scripts/data/seed-kalmar-churches.mjs [--apply]
import pg from 'pg'; import { readFileSync } from 'node:fs';
const APPLY = process.argv.includes('--apply');
const env = Object.fromEntries(readFileSync('./.env','utf8').split(/\r?\n/).filter(l=>l&&!l.startsWith('#')&&l.includes('=')).map(l=>{const i=l.indexOf('=');return [l.slice(0,i).trim(),l.slice(i+1).trim().replace(/^["']|["']$/g,'')];}));
const c=new pg.Client({host:'aws-0-eu-north-1.pooler.supabase.com',port:5432,user:'postgres.mnuifmcjspeaauzehasj',password:env.SUPABASE_DB_PASSWORD,database:'postgres',ssl:{rejectUnauthorized:false}});
await c.connect();
const one = async (sql,p) => (await c.query(sql,p)).rows[0];

const CHURCHES = [
  { name:'Kalmar Bykyrka (Storkyrkan, S:t Nicolaus)', name_en:'Kalmar Town Church (St Nicholas)',
    lat:56.656667, lng:16.353139, founded:1200, sig:'very_high', status:'archaeological',
    desc:'Stadens huvudkyrka i Gamla stan, tillägnad S:t Nicolaus (sjöfararnas och köpmännens helgon). Byggd omkring 1200, utvidgad kring 1300; kapell tillbyggda vid långsidorna sent 1300-tal (6 resp. 7). Färdig som stor femskeppig kyrka tidigt 1400-tal — ca 75×38 m, kalksten på gråstensgrund, tegelgolv. En av Sveriges största kyrkor.',
    notes:'1430 förklarade Erik av Pommern kyrkan "halvan dom" (nästan domkyrkoklass). Tyska prästnamn de första århundradena → betydande tyskt inflytande vid val av kyrkoherde. I Kalmar kröntes Erik av Pommern till unionskung över de tre nordiska rikena trefaldighetssöndagen 17 juni 1397; 133 adelsmän dubbades till riddare. Prästen Claus (Nicolaus) Köning blev biskop Nils av Linköping men bodde kvar i Kalmar. KOORDINAT: verifierad (Lantmäteriet, Kalmar Gamla Stan 2:3, WGS84 56°39\'24"N 16°21\'11.3"E; SWEREF99TM N6279988 E582953). Kyrkan revs sedan staden flyttades till Kvarnholmen på 1600-talet; grundmurar syns i Gamla stan. Källa: Kalmar läns museum.',
    cond:'Ruinlämningar/grundmurar synliga i Gamla stan' },
  { name:'Birgittakyrkan, Kalmar', name_en:'St Bridget\'s chapel, Kalmar',
    lat:56.6562, lng:16.3540, founded:1440, sig:'medium', status:'historical',
    desc:'Mindre kyrka i Kalmar, omtalad första gången på 1440-talet. Kanske inrymd i ett hus som ursprungligen tillhört birgittasystrarna i Vadstena.',
    notes:'KOORDINAT: exakt läge OKÄNT — satt approximativt till Gamla stan (Kalmar), att verifiera. Källa: Kalmar läns museum.',
    cond:'Läge ej fastställt' },
];

try {
  await c.query('BEGIN');
  let added=0, skipped=0;
  for (const h of CHURCHES) {
    if (await one(`select id from christian_sites where name=$1`,[h.name])) { skipped++; continue; }
    await c.query(
      `insert into christian_sites (name,name_en,coordinates,site_type,founded_year,period,status,significance_level,description,historical_notes,current_condition,region,county,province)
       values ($1,$2,point(${h.lng},${h.lat}),'church',$3,'medieval',$4,$5,$6,$7,$8,'Sydöstra Sverige','Kalmar','Småland')`,
      [h.name,h.name_en,h.founded,h.status,h.sig,h.desc,h.notes,h.cond]);
    added++;
  }
  console.log(`kyrkor tillagda: ${added}, hoppade: ${skipped}`);
  if (APPLY) { await c.query('COMMIT'); console.log('SEEDED (committed).'); }
  else { await c.query('ROLLBACK'); console.log('DRY RUN (rolled back). Kör med --apply.'); }
} catch (e) { await c.query('ROLLBACK'); console.error('FAILED (rolled back):', e.message); process.exitCode=1; }
finally { await c.end(); }
