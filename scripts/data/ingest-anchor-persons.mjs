// Adderar specifika ankar-personer (svenska kopplingar i Sverige-connection-dossiéerna) till persons
// via Wikidata (CC0). Resolvar QID via wbsearchentities och VERIFIERAR mot förväntade födelse-/dödsår
// (rätt person — ingen gissad QID). Återanvänder metoden i ingest-persons-wikidata.mjs
// (persons upsert on wikidata_qid + entity_registry + external_ids). Bilder: fil hämtas, licens senare.
import fs from 'fs'; import pg from 'pg';
const env=Object.fromEntries(fs.readFileSync('.env','utf8').split('\n').filter(l=>l.includes('=')).map(l=>{const i=l.indexOf('=');return[l.slice(0,i).trim(),l.slice(i+1).trim()];}));
const c=new pg.Client({host:'aws-0-eu-north-1.pooler.supabase.com',port:5432,user:'postgres.mnuifmcjspeaauzehasj',password:env.SUPABASE_DB_PASSWORD,database:'postgres',ssl:{rejectUnauthorized:false}});
await c.connect();
const UA={'User-Agent':'VikingAge-research/1.0 (daniel@expandtalk.se)'};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const wd=async q=>{for(let a=0;a<6;a++){try{const r=await fetch('https://query.wikidata.org/sparql?format=json&query='+encodeURIComponent(q),{headers:{...UA,'Accept':'application/sparql-results+json'}});if(r.status===200)return (await r.json()).results.bindings;console.log('  WDQS '+r.status+' retry '+(a+1));}catch(e){console.log('  WDQS nätfel retry '+(a+1));}await sleep(6000);}throw new Error('WDQS gav upp');};

// Personlistor med förväntade årtal (ur dossiéerna) för verifiering. Välj lista via argv[2].
const LISTS={
 anchors:[
  {q:'Sven Hedin',       by:1865, dy:1952},
  {q:'Eric von Rosen',   by:1879, dy:1948},
  {q:'Birger Dahlerus',  by:1891, dy:1957},
  {q:'Carin Göring',     by:1888, dy:1931},
  {q:'Birger Nerman',    by:1888, dy:1971},
 ],
 subjects:[
  {q:'Hermann Göring',   by:1893, dy:1946},
  {q:'Adolf Hitler',     by:1889, dy:1945},
  {q:'Winston Churchill',by:1874, dy:1965},
 ],
};
const ANCHORS=LISTS[process.argv[2]]||LISTS.anchors;
const yearOf=t=>{if(!t)return null;const m=String(t).match(/^[+-]?(\d{1,4})/);return m?+m[1]:null;};
async function api(params){const u='https://www.wikidata.org/w/api.php?format=json&origin=*&'+new URLSearchParams(params);for(let a=0;a<5;a++){try{const r=await fetch(u,{headers:UA});if(r.ok)return await r.json();}catch(e){}await sleep(3000);}throw new Error('api gav upp: '+params.action);}

// 1) resolva + verifiera QID
const resolved=[];
for(const an of ANCHORS){
  let picked=null;
  for(const lang of ['sv','en']){
    const s=await api({action:'wbsearchentities',search:an.q,language:lang,uselang:lang,type:'item',limit:'10'});
    const ids=(s.search||[]).map(x=>x.id);
    if(!ids.length)continue;
    const e=await api({action:'wbgetentities',ids:ids.join('|'),props:'claims|labels'});
    for(const id of ids){
      const cl=e.entities?.[id]?.claims||{};
      const isHuman=(cl.P31||[]).some(x=>x.mainsnak?.datavalue?.value?.id==='Q5');
      if(!isHuman)continue;
      const by=yearOf(cl.P569?.[0]?.mainsnak?.datavalue?.value?.time);
      const dy=yearOf(cl.P570?.[0]?.mainsnak?.datavalue?.value?.time);
      if(by!=null&&Math.abs(by-an.by)<=2 && (an.dy==null|| (dy!=null&&Math.abs(dy-an.dy)<=2))){picked={id,by,dy};break;}
    }
    if(picked)break;
  }
  if(picked){resolved.push({...an,qid:picked.id});console.log(`✓ ${an.q} → ${picked.id} (${picked.by}–${picked.dy})`);}
  else console.log(`✗ ${an.q} — INGEN verifierad match (hoppar över, ingen gissning)`);
  await sleep(500);
}
if(!resolved.length){console.log('Inget att lägga in.');await c.end();process.exit(0);}

// 2) full SPARQL för de verifierade QID:na
const values='VALUES ?p { '+resolved.map(r=>'wd:'+r.qid).join(' ')+' }';
const q=`SELECT ?p ?pLabel ?birth ?death ?genderLabel ?pob ?pobLabel ?coord ?viaf ?libris ?sbl ?desc ?sl ?img (GROUP_CONCAT(DISTINCT ?occL;separator="; ") AS ?occs) WHERE {
 ${values}
 ?p rdfs:label ?pLabel FILTER(lang(?pLabel)="sv").
 OPTIONAL{?p wikibase:sitelinks ?sl}
 OPTIONAL{?p wdt:P19 ?pob. ?pob rdfs:label ?pobLabel FILTER(lang(?pobLabel)="sv"). OPTIONAL{?pob wdt:P625 ?coord}}
 OPTIONAL{?p wdt:P569 ?birth} OPTIONAL{?p wdt:P570 ?death}
 OPTIONAL{?p wdt:P21 ?g. ?g rdfs:label ?genderLabel FILTER(lang(?genderLabel)="sv")}
 OPTIONAL{?p wdt:P214 ?viaf} OPTIONAL{?p wdt:P906 ?libris} OPTIONAL{?p wdt:P3217 ?sbl}
 OPTIONAL{?p wdt:P18 ?img}
 OPTIONAL{?p wdt:P106 ?occ. ?occ rdfs:label ?occL FILTER(lang(?occL)="sv")}
 OPTIONAL{?p schema:description ?desc FILTER(lang(?desc)="sv")}
} GROUP BY ?p ?pLabel ?birth ?death ?genderLabel ?pob ?pobLabel ?coord ?viaf ?libris ?sbl ?desc ?sl ?img`;
const yr=s=>{if(!s)return null;const m=s.match(/^-?\d{1,4}/);return m?+m[0].replace(/^-/,''):null;};
const parse=r=>{const g=k=>r[k]?.value??null;let lat=null,lng=null;const co=g('coord');if(co){const m=co.match(/Point\(([-\d.]+) ([-\d.]+)\)/);if(m){lng=+m[1];lat=+m[2];}}const by=yr(g('birth')),dy=yr(g('death'));const iu=g('img');const imgfile=iu?decodeURIComponent((iu.split('/').pop()||'')):null;return{qid:g('p').split('/').pop(),name:g('pLabel'),gender:g('genderLabel'),by,dy,living:dy==null&&by!=null&&by>1916,occ:g('occs')?g('occs').split('; ').filter(Boolean):null,desc:g('desc'),sl:+g('sl')||0,pobq:g('pob')?.split('/').pop(),pob:g('pobLabel'),lat,lng,viaf:g('viaf'),libris:g('libris'),sbl:g('sbl'),imgfile};};
const rowsRaw=(await wd(q)).map(parse);
const seen=new Set();const rows=rowsRaw.filter(r=>{if(seen.has(r.qid))return false;seen.add(r.qid);return true;});

// 3) upsert (samma logik som ingest-persons-wikidata.mjs)
const cols=['wikidata_qid','name','name_sort','gender','birth_year','death_year','is_living','occupations','description_sv','sitelinks','birthplace_qid','birthplace_label','birthplace_lat','birthplace_lng','viaf','libris','sbl','image_commons_file'];
const rv=p=>[p.qid,p.name,p.name,p.gender,p.by,p.dy,p.living,p.occ,p.desc,p.sl,p.pobq,p.pob,p.lat,p.lng,p.viaf,p.libris,p.sbl,p.imgfile];
const idByQid={};
{const ph=rows.map((_,r)=>'('+cols.map((__,ci)=>'$'+(r*cols.length+ci+1)).join(',')+')').join(',');
 const r=await c.query(`insert into persons (${cols.join(',')}) values ${ph} on conflict (wikidata_qid) do update set name=excluded.name,sitelinks=excluded.sitelinks,birth_year=excluded.birth_year,death_year=excluded.death_year,occupations=excluded.occupations,description_sv=excluded.description_sv,birthplace_qid=excluded.birthplace_qid,birthplace_label=excluded.birthplace_label,birthplace_lat=excluded.birthplace_lat,birthplace_lng=excluded.birthplace_lng,image_commons_file=excluded.image_commons_file,updated_at=now() returning id,wikidata_qid`,rows.flatMap(rv));
 for(const x of r.rows)idByQid[x.wikidata_qid]=x.id;}
{const ph=rows.map((_,r)=>`($${r*2+1},'person',$${r*2+2})`).join(',');
 await c.query(`insert into entity_registry (id,entity_type,label) values ${ph} on conflict (id) do update set label=excluded.label,entity_type='person'`,rows.flatMap(p=>[idByQid[p.qid],p.name]));}
await c.query(`delete from external_ids where entity_table='persons' and entity_id in (select id::text from persons where wikidata_qid = any($1))`,[rows.map(r=>r.qid)]);
const ext=[];for(const p of rows){const id=idByQid[p.qid];ext.push(['persons',id,'wikidata',p.qid,'https://www.wikidata.org/entity/'+p.qid]);if(p.viaf)ext.push(['persons',id,'viaf',p.viaf,'https://viaf.org/viaf/'+p.viaf]);if(p.libris)ext.push(['persons',id,'libris',p.libris,null]);if(p.sbl)ext.push(['persons',id,'sbl',p.sbl,'https://sok.riksarkivet.se/sbl/Presentation.aspx?id='+p.sbl]);}
if(ext.length){const ph=ext.map((_,r)=>`($${r*5+1},$${r*5+2},$${r*5+3},$${r*5+4},$${r*5+5},'wikidata')`).join(',');
 await c.query(`insert into external_ids (entity_table,entity_id,scheme,identifier,uri,source) values ${ph}`,ext.flat());}
console.log('\nINLAGDA/uppdaterade i persons:');
for(const p of rows)console.log(`  ${p.name} (${p.by}–${p.dy||''}) ${p.qid} — ${p.desc||''}${p.imgfile?' [bild:'+p.imgfile+']':''}`);
await c.end();
