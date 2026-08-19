// Persondomän-ingest ur Wikidata (CC0). Hämtar notabla personer FÖDDA i svenska län (P19 → plats
// P131* → län) och upsertar till persons + entity_registry (person-nod) + external_ids (QID/VIAF/
// LIBRIS/SBL). Rankas på wikibase:sitelinks (notabilitet). Bilder hämtas EJ här (licens per Commons-
// fil måste verifieras i separat pass). Levande personer = bara notabla offentliga (Wikidata-tröskeln).
//
// Kör:  node scripts/data/ingest-persons-wikidata.mjs            (ALLA 21 län)
//       node scripts/data/ingest-persons-wikidata.mjs Q103707 Q104926   (utvalda län-QID)
// Idempotent (on conflict wikidata_qid). Se migration 20260819140000_persons_domain.sql + memory
// person-domain-wikidata.
import fs from 'fs'; import pg from 'pg';
const env=Object.fromEntries(fs.readFileSync('.env','utf8').split('\n').filter(l=>l.includes('=')).map(l=>{const i=l.indexOf('=');return[l.slice(0,i).trim(),l.slice(i+1).trim()];}));
const c=new pg.Client({host:'aws-0-eu-north-1.pooler.supabase.com',port:5432,user:'postgres.mnuifmcjspeaauzehasj',password:env.SUPABASE_DB_PASSWORD,database:'postgres',ssl:{rejectUnauthorized:false}});
await c.connect();
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const wd=async q=>{for(let a=0;a<5;a++){const r=await fetch('https://query.wikidata.org/sparql?format=json&query='+encodeURIComponent(q),{headers:{'User-Agent':'VikingAge-research/1.0 (daniel@expandtalk.se)','Accept':'application/sparql-results+json'}});if(r.status===200)return (await r.json()).results.bindings;console.log('  WDQS '+r.status+' – retry '+(a+1));await sleep(7000);}throw new Error('WDQS gav upp');};

// Läns-QID: från argv, annars resolva alla "county of Sweden" (Q200547).
let counties=process.argv.slice(2).filter(x=>/^Q\d+$/.test(x)).map(x=>'wd:'+x);
if(!counties.length){counties=(await wd(`SELECT ?c WHERE { ?c wdt:P31 wd:Q200547. }`)).map(b=>'wd:'+b.c.value.split('/').pop());}
console.log('Län att hämta:',counties.length);

const qFor=vals=>`SELECT ?p ?pLabel ?birth ?death ?genderLabel ?pob ?pobLabel ?coord ?viaf ?libris ?sbl ?desc ?sl (GROUP_CONCAT(DISTINCT ?occL;separator="; ") AS ?occs) WHERE {
 ${vals}
 ?p rdfs:label ?pLabel FILTER(lang(?pLabel)="sv"). ?pob rdfs:label ?pobLabel FILTER(lang(?pobLabel)="sv").
 OPTIONAL{?pob wdt:P625 ?coord} OPTIONAL{?p wdt:P569 ?birth} OPTIONAL{?p wdt:P570 ?death}
 OPTIONAL{?p wdt:P21 ?g. ?g rdfs:label ?genderLabel FILTER(lang(?genderLabel)="sv")}
 OPTIONAL{?p wdt:P214 ?viaf} OPTIONAL{?p wdt:P906 ?libris} OPTIONAL{?p wdt:P3217 ?sbl}
 OPTIONAL{?p wdt:P106 ?occ. ?occ rdfs:label ?occL FILTER(lang(?occL)="sv")}
 OPTIONAL{?p schema:description ?desc FILTER(lang(?desc)="sv")}
} GROUP BY ?p ?pLabel ?birth ?death ?genderLabel ?pob ?pobLabel ?coord ?viaf ?libris ?sbl ?desc ?sl ORDER BY DESC(?sl) LIMIT 4000`;
const yr=s=>{if(!s)return null;const m=s.match(/^-?\d{1,4}/);return m?+m[0].replace(/^-/,''):null;};
const parse=r=>{const g=k=>r[k]?.value??null;let lat=null,lng=null;const co=g('coord');if(co){const m=co.match(/Point\(([-\d.]+) ([-\d.]+)\)/);if(m){lng=+m[1];lat=+m[2];}}const by=yr(g('birth')),dy=yr(g('death'));return{qid:g('p').split('/').pop(),name:g('pLabel'),gender:g('genderLabel'),by,dy,living:dy==null&&by!=null&&by>1916,occ:g('occs')?g('occs').split('; ').filter(Boolean):null,desc:g('desc'),sl:+g('sl')||0,pobq:g('pob')?.split('/').pop(),pob:g('pobLabel'),lat,lng,viaf:g('viaf'),libris:g('libris'),sbl:g('sbl')};};

const cols=['wikidata_qid','name','name_sort','gender','birth_year','death_year','is_living','occupations','description_sv','sitelinks','birthplace_qid','birthplace_label','birthplace_lat','birthplace_lng','viaf','libris','sbl'];
const rv=p=>[p.qid,p.name,p.name,p.gender,p.by,p.dy,p.living,p.occ,p.desc,p.sl,p.pobq,p.pob,p.lat,p.lng,p.viaf,p.libris,p.sbl];
async function upsert(list){
  const idByQid={};
  for(let i=0;i<list.length;i+=300){const ch=list.slice(i,i+300);const ph=ch.map((_,r)=>'('+cols.map((__,ci)=>'$'+(r*cols.length+ci+1)).join(',')+')').join(',');
    const r=await c.query(`insert into persons (${cols.join(',')}) values ${ph} on conflict (wikidata_qid) do update set name=excluded.name,sitelinks=excluded.sitelinks,birth_year=excluded.birth_year,death_year=excluded.death_year,occupations=excluded.occupations,description_sv=excluded.description_sv,birthplace_lat=excluded.birthplace_lat,birthplace_lng=excluded.birthplace_lng,updated_at=now() returning id,wikidata_qid`,ch.flatMap(rv));
    for(const x of r.rows)idByQid[x.wikidata_qid]=x.id;}
  for(let i=0;i<list.length;i+=300){const ch=list.slice(i,i+300);const ph=ch.map((_,r)=>`($${r*2+1},'person',$${r*2+2})`).join(',');
    await c.query(`insert into entity_registry (id,entity_type,label) values ${ph} on conflict (id) do update set label=excluded.label,entity_type='person'`,ch.flatMap(p=>[idByQid[p.qid],p.name]));}
  const ext=[];for(const p of list){const id=idByQid[p.qid];ext.push(['persons',id,'wikidata',p.qid,'https://www.wikidata.org/entity/'+p.qid]);if(p.viaf)ext.push(['persons',id,'viaf',p.viaf,'https://viaf.org/viaf/'+p.viaf]);if(p.libris)ext.push(['persons',id,'libris',p.libris,null]);if(p.sbl)ext.push(['persons',id,'sbl',p.sbl,'https://sok.riksarkivet.se/sbl/Presentation.aspx?id='+p.sbl]);}
  for(let i=0;i<ext.length;i+=500){const ch=ext.slice(i,i+500);const ph=ch.map((_,r)=>`($${r*5+1},$${r*5+2},$${r*5+3},$${r*5+4},$${r*5+5},'wikidata')`).join(',');
    // undvik dubletter: rensa dessa personers wikidata-ext först vore dyrt; förlita på NOT EXISTS via unik nyckel saknas → dedup i minnet räcker vid full körning
    await c.query(`insert into external_ids (entity_table,entity_id,scheme,identifier,uri,source) values ${ph}`,ch.flat());}
  return Object.keys(idByQid).length;
}

let total=0;
for(const county of counties){
  const rows=(await wd(qFor(`?p wdt:P31 wd:Q5; wdt:P19 ?pob; wikibase:sitelinks ?sl. ?pob wdt:P131* ${county}.`))).map(parse);
  // dedup mot redan hämtade i denna körning
  await c.query(`delete from external_ids where entity_table='persons' and entity_id in (select id from persons where wikidata_qid = any($1))`,[rows.map(r=>r.qid)]);
  const n=await upsert(rows);
  total+=rows.length;console.log(`${county}: ${rows.length} personer`);await sleep(1200);
}
console.log('KLART. Behandlade '+total+' (kan överlappa mellan län).');
const st=(await c.query(`select count(*) tot, count(*) filter(where is_living) living from persons`)).rows[0];
console.log('persons totalt:',st.tot,'(varav levande '+st.living+')');
await c.end();
