// Dominikankonventens nätverk i medeltidens Sverige (Daniels lista) → christian_sites.
// coordinates NOT NULL → STADSCENTROID som flaggad approximation (plattformsmönster: "inga koord →
// centroid", jfr arkeologi-ingesten). Centroider ur place_names-gazetteern (verifierade); Åbo ur Wikidata.
// EJ exakt konventsläge — flaggat i historical_notes. Idempotent (hoppar befintliga namn).
// Redan i DB (hoppas): Kalmar (1243), Sigtuna (Mariakyrkan), Skänninge nunnekloster, Stockholm, Visby.
// Viborg utelämnad (ingen verifierad koord ännu). Kör: node scripts/data/seed-dominican-convents.mjs [--apply]
import pg from 'pg'; import { readFileSync } from 'node:fs';
const APPLY = process.argv.includes('--apply');
const env = Object.fromEntries(readFileSync('./.env','utf8').split(/\r?\n/).filter(l=>l&&!l.startsWith('#')&&l.includes('=')).map(l=>{const i=l.indexOf('=');return [l.slice(0,i).trim(),l.slice(i+1).trim().replace(/^["']|["']$/g,'')];}));
const c=new pg.Client({host:'aws-0-eu-north-1.pooler.supabase.com',port:5432,user:'postgres.mnuifmcjspeaauzehasj',password:env.SUPABASE_DB_PASSWORD,database:'postgres',ssl:{rejectUnauthorized:false}});
await c.connect();
const one = async (sql,p) => (await c.query(sql,p)).rows[0];

// [namn, name_en, lat, lng, founded|null, dateNote, län, landskap, danskt?, koordkälla]
const CONV = [
  ['Skara dominikankonvent','Skara Dominican Priory',58.3846,13.4398,null,'1237–1268 (exakt år osäkert)','Västra Götaland','Västergötland',false,'place_names'],
  ['Skänninge dominikankonvent (brödrakonvent)','Skänninge Dominican Priory (friars)',58.3921,15.0877,null,'1237–1268','Östergötland','Östergötland',false,'place_names'],
  ['Strängnäs dominikankonvent','Strängnäs Dominican Priory',59.3763,17.0268,null,'1237–1268','Södermanland','Södermanland',false,'place_names'],
  ['Västerås dominikankonvent','Västerås Dominican Priory',59.6111,16.5464,null,'1237–1268','Västmanland','Västmanland',false,'place_names'],
  ['Lödöse dominikankonvent','Lödöse Dominican Priory',58.0338,12.1546,1243,'1243','Västra Götaland','Västergötland',false,'place_names'],
  ['Lunds dominikankonvent (Svartbröder)','Lund Dominican Priory',55.7083,13.1992,1222,'1222','Skåne','Skåne',true,'place_names'],
  ['Åhus dominikankonvent','Åhus Dominican Priory',55.9235,14.2955,1254,'omnämnt första gången 1254','Skåne','Skåne',true,'place_names'],
  ['Halmstads svartbrödrakloster','Halmstad Dominican Priory',56.6740,12.8575,null,'1200-talet','Halland','Halland',true,'place_names'],
  ['Kalmar nunnekloster (dominikansystrar)','Kalmar Dominican Nunnery',56.6634,16.3568,1299,'1299 (systrakonvent)','Kalmar','Småland',false,'place_names (Kalmar)'],
  ['Åbo dominikankonvent','Turku Dominican Priory',60.45167,22.26694,null,'1237–1268','Egentliga Finland','Finland',false,'Wikidata Q38511'],
];

try {
  await c.query('BEGIN');
  let added=0, skipped=0;
  for (const [name,name_en,lat,lng,founded,dateNote,county,province,danish,src] of CONV) {
    if (await one(`select id from christian_sites where name=$1`,[name])) { skipped++; continue; }
    const notes = `Dominikankonvent, ${province}${danish?' (då danskt)':''}. Etablerat ${dateNote}. KOORDINAT: stadscentroid (${src}) — EJ exakt konventsläge, att verifiera mot Fornsök/arkeologi. Del av dominikanernas klosternätverk i medeltidens svenska rike.`;
    const desc = `${danish?'Då danskt. ':''}Ett av dominikanordens (svartbrödernas) konvent i medeltidens svenska rike. ${founded?`Grundat ${founded}.`:`Etablerat ${dateNote}.`}`;
    await c.query(
      `insert into christian_sites (name,name_en,coordinates,site_type,religious_order,founded_year,period,status,significance_level,description,historical_notes,current_condition,region,county,province)
       values ($1,$2,point(${lng},${lat}),'monastery','dominican',$3,'medieval','historical','medium',$4,$5,$6,$7,$8,$9)`,
      [name,name_en,founded,desc,notes,'Läge approximerat (stadscentroid) — att verifiera','Sverige/Norden',county,province]);
    added++;
  }
  console.log(`tillagda: ${added}, hoppade (fanns): ${skipped}`);
  if (APPLY) { await c.query('COMMIT'); console.log('SEEDED (committed).'); }
  else { await c.query('ROLLBACK'); console.log('DRY RUN (rolled back). Kör med --apply.'); }
} catch (e) { await c.query('ROLLBACK'); console.error('FAILED (rolled back):', e.message); process.exitCode=1; }
finally { await c.end(); }
