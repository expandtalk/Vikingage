// Grimskär lotsstation-/sjömärke-hypotes (Daniel) + Skansgrundet + Svanholmarna. Fångas som
// interpretation/hypotes (tolkning, ej dom). Grimskärs medeltida steglings-tolkning BEHÅLLS —
// hypotesen APPENDAS (samma skär, olika epoker). Koordinat: nya = placeholder (geotag-kö), inga gissade.
import pg from 'pg'; import { readFileSync } from 'node:fs';
const APPLY = process.argv.includes('--apply');
const env = Object.fromEntries(readFileSync('./.env','utf8').split(/\r?\n/).filter(l=>l&&!l.startsWith('#')&&l.includes('=')).map(l=>{const i=l.indexOf('=');return [l.slice(0,i).trim(),l.slice(i+1).trim().replace(/^["']|["']$/g,'')];}));
const c=new pg.Client({host:'aws-0-eu-north-1.pooler.supabase.com',port:5432,user:'postgres.mnuifmcjspeaauzehasj',password:env.SUPABASE_DB_PASSWORD,database:'postgres',ssl:{rejectUnauthorized:false}});
await c.connect();
const one = async (sql,p) => (await c.query(sql,p)).rows[0];
async function addIfMissing(name, row){
  if (await one(`select id from kalmar_place_names where name=$1`,[name])) return false;
  const cols=Object.keys(row), ph=cols.map((_,i)=>`$${i+2}`).join(',');
  await c.query(`insert into kalmar_place_names (name,${cols.join(',')}) values ($1,${ph})`, [name, ...Object.values(row)]);
  return true;
}
try {
  await c.query('BEGIN');
  const gr = await c.query(
    `update kalmar_place_names set interpretation = interpretation ||
       ' | Hypotes (Daniel): Grimskär kan ha varit sjömärke/lotsstation mycket tidigt. Det farliga Skansgrundet ligger strax innan och Valdemars segelled (ca 1250) passerar; en tidig markör (symbol på stolpe) skulle ha varnat — eller lockat — fartyg. Grundstötning här driver mot platsen för nuvarande Kalmar slott. Den medeltida steglings-funktionen är senare; samma skär, olika epoker. Prövbart mot strandförskjutning (landhöjning), ännu ej modellerad för Kalmarsund.'
     where name ilike '%grimskär%' and interpretation not ilike '%lotsstation%'`);
  const s1 = await addIfMissing('Skansgrundet', {
    category:'skär_grund', sol_match:'none', head_element:'skans + grund',
    element_reading:'grund vid skans/befästning',
    interpretation:'Farligt grund i inloppet strax utanför Grimskär; "skans"-elementet pekar på befästning. Nyckel i lotsstation-hypotesen (Daniel): fartyg som grundstötte här drev mot Kalmar slotts läge. Tolkning/lokalkännedom.',
    semantic_domain:'vatten_kust', period_stratum:'okänd', gazetteer_match:false,
    coord_precision:'placeholder', lat:null, lng:null, source:'Lokalkännedom; Valdemars segelled' });
  const s2 = await addIfMissing('Svanholmarna', {
    category:'ö', sol_match:'none', head_element:'svan + holme',
    element_reading:'holmar (svan-)',
    interpretation:'Öar i Kalmarsund; möjlig roll i seglings-/lotsgeografin (hypotes, Daniel). Vindarna i sundet är ofta riktningsstabila, vilket kan ha gett förutsägbara seglingsförhållanden.',
    semantic_domain:'vatten_kust', period_stratum:'okänd', gazetteer_match:false,
    coord_precision:'placeholder', lat:null, lng:null, source:'Lokalkännedom' });
  // Elverslösa + Kläckeberga → järnålder (-lösa/-berga = etablerade järnålderstyper; Daniels klassning)
  const ja = await c.query(
    `update kalmar_place_names set period_stratum='järnålder'
     where (name ilike 'elverslösa%' or name ilike 'kläckeberga%') and period_stratum is distinct from 'järnålder'`);
  console.log(`Grimskär uppdaterad: ${gr.rowCount}; Skansgrundet ny: ${s1}; Svanholmarna ny: ${s2}; →järnålder: ${ja.rowCount}`);
  if (APPLY) { await c.query('COMMIT'); console.log('SEEDED (committed).'); }
  else { await c.query('ROLLBACK'); console.log('DRY RUN (rolled back). Kör med --apply.'); }
} catch (e) { await c.query('ROLLBACK'); console.error('FAILED (rolled back):', e.message); process.exitCode=1; }
finally { await c.end(); }
