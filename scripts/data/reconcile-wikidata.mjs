// INTEROP steg 2: Wikidata-reconciliation. För varje entitet med koordinat söker vi Wikidata-
// objekt INOM ~3 km (wikibase:around) och matchar etikett → verifierad QID i external_ids.
// VERIFIERAD, ej gissad: kräver antingen etikettmatchning ELLER mycket nära (<0.4 km).
// Kör: node scripts/data/reconcile-wikidata.mjs [--apply]
import pg from 'pg'; import { readFileSync } from 'node:fs';
const APPLY=process.argv.includes('--apply');
const env=Object.fromEntries(readFileSync('./.env','utf8').split(/\r?\n/).filter(l=>l&&!l.startsWith('#')&&l.includes('=')).map(l=>{const i=l.indexOf('=');return[l.slice(0,i).trim(),l.slice(i+1).trim().replace(/^["']|["']$/g,'')]}));
const c=new pg.Client({host:'aws-0-eu-north-1.pooler.supabase.com',port:5432,user:'postgres.mnuifmcjspeaauzehasj',password:env.SUPABASE_DB_PASSWORD,database:'postgres',ssl:{rejectUnauthorized:false}});await c.connect();
const UA='VikingageBot/1.0 (https://www.vikingage.se; daniel.larsson@expandtalk.se)';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const norm=s=>(s||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/stenen|runsten|borg|båtgravfält|\(.*?\)|[^a-z0-9]/g,'').trim();

async function around(lat,lng){
  const sparql=`SELECT ?item ?itemLabel ?dist WHERE {
    SERVICE wikibase:around { ?item wdt:P625 ?loc.
      bd:serviceParam wikibase:center "Point(${lng} ${lat})"^^geo:wktLiteral.
      bd:serviceParam wikibase:radius "3". bd:serviceParam wikibase:distance ?dist. }
    SERVICE wikibase:label { bd:serviceParam wikibase:language "sv,en". }
  } ORDER BY ?dist LIMIT 20`;
  const url='https://query.wikidata.org/sparql?format=json&query='+encodeURIComponent(sparql);
  for(let a=0;a<3;a++){ try{ const r=await fetch(url,{headers:{'User-Agent':UA,'Accept':'application/sparql-results+json'}});
    if(r.status===200){ const j=await r.json(); return j.results.bindings.map(b=>({qid:b.item.value.split('/').pop(),label:b.itemLabel?.value||'',dist:+b.dist.value})); }
    await sleep(2000*(a+1)); }catch{ await sleep(1500*(a+1)); } }
  return null;
}
function pick(cands,name){
  if(!cands||!cands.length) return null;
  const n=norm(name);
  // 1) etikettmatch (normaliserad innehåller/lika)
  const lab=cands.find(x=>{const l=norm(x.label); return l&&(l===n||l.includes(n)||n.includes(l));});
  if(lab) return {...lab, conf: lab.dist<1?'säker':'trolig'};
  // 2) mycket nära utan etikettmatch → trolig (samma punkt = sannolikt samma sak)
  if(cands[0].dist<0.4) return {...cands[0], conf:'osäker'};
  return null;
}

async function run(table, rows){
  let hit=0,miss=0;
  for(const r of rows){
    if(r.lat==null||r.lng==null) continue;
    const cands=await around(r.lat,r.lng);
    const m=pick(cands,r.name);
    if(m){ hit++; console.log(`  ✓ ${r.name} → ${m.qid} (${m.label||'?'}, ${m.dist.toFixed(2)}km, ${m.conf})`);
      if(APPLY) await c.query(`insert into external_ids (entity_table,entity_id,scheme,identifier,uri,confidence,source)
        values ($1,$2,'wikidata',$3,$4,$5,'reconcile-wikidata (around+label)')
        on conflict (entity_table,entity_id,scheme,identifier) do update set confidence=excluded.confidence`,
        [table,String(r.id),m.qid,'https://www.wikidata.org/wiki/'+m.qid,m.conf]);
    } else { miss++; console.log(`  · ${r.name} — ingen säker match`); }
    await sleep(900);
  }
  console.log(`${table}: ${hit} matchade, ${miss} utan match.`);
}

try{
  const em=(await c.query(`select id,name,lat,lng from elite_monuments where lat is not null`)).rows;
  const vc=(await c.query(`select id,name,coordinates[1] lat,coordinates[0] lng from viking_cities where coordinates is not null`)).rows;
  console.log(`\n== elite_monuments (${em.length}) ==`); await run('elite_monuments',em);
  console.log(`\n== viking_cities (${vc.length}) ==`); await run('viking_cities',vc);
  console.log(APPLY?'\nAPPLIED.':'\nDRY RUN (kör --apply för att skriva).');
}catch(e){ console.error('FAILED:',e.message); process.exitCode=1; }
finally{ await c.end(); }
