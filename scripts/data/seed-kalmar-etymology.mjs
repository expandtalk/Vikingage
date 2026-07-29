// Kalmar-etymologin + Stensö + Västra sjön i kalmar_place_names. Fakta/standardläsning (SOL 2003;
// Kalmar stads historia) + Daniels lokalkännedom, som interpretation (tolkning, ej dom). Koordinat-
// disciplin: bara Kalmar får en (approx, flaggad); Västra sjön placeholder. Kör: [--apply]
import pg from 'pg'; import { readFileSync } from 'node:fs';
const APPLY = process.argv.includes('--apply');
const env = Object.fromEntries(readFileSync('./.env','utf8').split(/\r?\n/).filter(l=>l&&!l.startsWith('#')&&l.includes('=')).map(l=>{const i=l.indexOf('=');return [l.slice(0,i).trim(),l.slice(i+1).trim().replace(/^["']|["']$/g,'')];}));
const c=new pg.Client({host:'aws-0-eu-north-1.pooler.supabase.com',port:5432,user:'postgres.mnuifmcjspeaauzehasj',password:env.SUPABASE_DB_PASSWORD,database:'postgres',ssl:{rejectUnauthorized:false}});
await c.connect();
const one = async (sql,p) => (await c.query(sql,p)).rows[0];

async function upsert(name, row){
  const ex = await one(`select id from kalmar_place_names where name=$1`,[name]);
  if (ex) return { id: ex.id, created: false };
  const cols = Object.keys(row), vals = Object.values(row);
  const ph = cols.map((_,i)=>`$${i+2}`).join(',');
  const r = await one(`insert into kalmar_place_names (name,${cols.join(',')}) values ($1,${ph}) returning id`, [name, ...vals]);
  return { id: r.id, created: true };
}

try {
  await c.query('BEGIN');
  let created = 0;

  const kalmar = await upsert('Kalmar', {
    category: 'terräng', sol_match: 'locality',
    sol_note: 'Kalmar behandlas i SOL 2003.',
    head_element: 'kalm (sten/stenröse) + mar (grund vik)',
    element_reading: '"stenarna vid den grunda viken"',
    interpretation: 'Kalmar = kalm (stenar/stenröse) + mar (grund vik). Västra sjön är den grunda viken; på Stensös andra sida ligger Kalmarsund, som är djupare. Standardläsning (SOL; Kalmar stads historia) — tolkning, ej dom.',
    semantic_domain: 'terräng_sten', period_stratum: 'vikingatid',
    gazetteer_match: true, coord_precision: 'approx-osm', lat: 56.6634, lng: 16.3568,
    source: 'SOL 2003 (diva2:1175717); Kalmar stads historia 1',
  });
  created += kalmar.created ? 1 : 0;

  const vastra = await upsert('Västra sjön', {
    category: 'vattendrag', sol_match: 'none',
    head_element: 'grund vik (mar)',
    element_reading: 'grund vik väster om Stensö',
    interpretation: 'Den grunda viken väster om Stensö — "mar"-elementet i namnet Kalmar. Grund, till skillnad från Kalmarsund öster om Stensö som är djupt.',
    semantic_domain: 'vatten_kust', period_stratum: 'okänd',
    gazetteer_match: false, coord_precision: 'placeholder', lat: null, lng: null,
    source: 'Lokalkännedom; SOL 2003 (mar-elementet)',
  });
  created += vastra.created ? 1 : 0;

  // Stensö — berika tolkningen (kanalen, 1500-talsbefästningarna, grund/djup-kontrasten)
  const st = await c.query(
    `update kalmar_place_names set
       semantic_domain = coalesce(semantic_domain,'terräng_sten'),
       interpretation = $1
     where name='Stensö'`,
    ['Stensö = "sten" + ö. Halvön har mycket sten; en kanal har grävts ut genom åren och stenarna i kanalbotten har troligen använts till befästningar på 1500-talet (befästningsanläggningar på Stensö är omskrivna). Väster om Stensö ligger Västra sjön (grund vik); öster om ligger Kalmarsund (djupt). Tolkning/lokalkännedom.']);

  console.log(`Kalmar: ${kalmar.created?'ny':'fanns'}, Västra sjön: ${vastra.created?'ny':'fanns'}, Stensö uppdaterad: ${st.rowCount}`);
  if (APPLY) { await c.query('COMMIT'); console.log(`SEEDED (committed): ${created} nya, Stensö berikad.`); }
  else { await c.query('ROLLBACK'); console.log(`DRY RUN (rolled back): ${created} nya, Stensö-uppdatering ${st.rowCount}. Kör med --apply.`); }
} catch (e) { await c.query('ROLLBACK'); console.error('FAILED (rolled back):', e.message); process.exitCode=1; }
finally { await c.end(); }
