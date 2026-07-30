// Byggår för Skåne-kyrkor ur Wikidata P571 (inception) → ecclesiastical_sites.built_from.
// Vetenskapliga principer: (1) bara sourcade Wikidata-värden (CC0), (2) bara MEDELTIDA (≤1400,
// konsolideringseran — undviker 1800-talsombyggnader), (3) svenska Skåne (lng≥12.75, ej danska
// Öresund-kyrkor), (4) koordinatmatch <500 m mot vår kyrka, (5) skriv BARA där built_from saknas,
// (6) proveniens sparas. Kör: node scripts/data/ingest-skane-church-dates.mjs [--apply]
import pg from 'pg'; import { readFileSync } from 'node:fs';
const APPLY=process.argv.includes('--apply');
const UA={headers:{'User-Agent':'VikingageBot/1.0 (daniel.larsson@expandtalk.se)','Accept':'application/sparql-results+json'}};
const env=Object.fromEntries(readFileSync('./.env','utf8').split(/\r?\n/).filter(l=>l&&!l.startsWith('#')&&l.includes('=')).map(l=>{const i=l.indexOf('=');return[l.slice(0,i).trim(),l.slice(i+1).trim().replace(/^["']|["']$/g,'')]}));
const q=`SELECT ?c ?cLabel ?inception ?coord WHERE { SERVICE wikibase:box { ?c wdt:P625 ?coord . bd:serviceParam wikibase:cornerWest "Point(12.75 55.3)"^^geo:wktLiteral . bd:serviceParam wikibase:cornerEast "Point(14.6 56.55)"^^geo:wktLiteral . } ?c wdt:P31/wdt:P279* wd:Q16970 . ?c wdt:P571 ?inception . SERVICE wikibase:label { bd:serviceParam wikibase:language "sv,en". } } LIMIT 900`;
const r=await fetch('https://query.wikidata.org/sparql?format=json&query='+encodeURIComponent(q),UA);
const rows=(await r.json()).results.bindings;
const churches=[];
for(const x of rows){
  const cm=(x.coord?.value||'').match(/Point\(([-\d.]+) ([-\d.]+)\)/); if(!cm) continue;
  const y=+(x.inception?.value||'').slice(0,4); if(!y || y>1400) continue;   // bara medeltida
  churches.push({qid:x.c.value.split('/').pop(), label:x.cLabel?.value||'', lng:+cm[1], lat:+cm[2], year:y});
}
console.log(`Wikidata: ${rows.length} kyrkor i svenska Skåne-bbox; ${churches.length} med medeltida byggår (≤1400)`);

const c=new pg.Client({host:'aws-0-eu-north-1.pooler.supabase.com',port:5432,user:'postgres.mnuifmcjspeaauzehasj',password:env.SUPABASE_DB_PASSWORD,database:'postgres',ssl:{rejectUnauthorized:false}});
await c.connect();
const cols=(await c.query(`select column_name from information_schema.columns where table_name='ecclesiastical_sites'`)).rows.map(r=>r.column_name);
const hasSrc=cols.includes('dating_source'); const hasNote=cols.includes('notes');
try{
  await c.query('BEGIN'); let upd=0, nomatch=0, hadDate=0;
  for(const ch of churches){
    const m=await c.query(`select id, built_from, name from ecclesiastical_sites
      where geom is not null and ST_DWithin(geom, ST_SetSRID(ST_MakePoint($1,$2),4326)::geography, 500)
      order by geom <-> ST_SetSRID(ST_MakePoint($1,$2),4326) limit 1`,[ch.lng,ch.lat]);
    if(!m.rowCount){ nomatch++; continue; }
    const row=m.rows[0];
    if(row.built_from!=null){ hadDate++; continue; }               // rör ej befintliga
    const setSrc = hasSrc ? `, dating_source='Wikidata:${ch.qid}'` : '';
    await c.query(`update ecclesiastical_sites set built_from=$1${setSrc} where id=$2`,[ch.year,row.id]);
    upd++;
  }
  console.log(`nya byggår satta: ${upd} · redan daterade (rörda ej): ${hadDate} · Wikidata-kyrka utan matchning i vår DB: ${nomatch}`);
  if(APPLY){ await c.query('COMMIT'); console.log('APPLIED.'); } else { await c.query('ROLLBACK'); console.log('DRY RUN.'); }
}catch(e){ await c.query('ROLLBACK'); console.error('FAILED:',e.message); process.exitCode=1; }
finally{ await c.end(); }
