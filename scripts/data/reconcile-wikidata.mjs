// INTEROP: Wikidata-reconciliation. För varje entitet med koordinat söker vi Wikidata-
// objekt INOM ~3 km (wikibase:around) och matchar etikett → verifierad QID i external_ids.
// VERIFIERAD, ej gissad: kräver antingen etikettmatchning ELLER mycket nära (<0.4 km).
//
// place_names-läge (god ortnamnssed): sätter dessutom name_authority='wikidata' + normed_name
// = Wikidatas (LM-proxy) form vid säker/trolig match, och sparar OSM-formen som variant i
// place_name_forms. Idempotent — kör om för att fortsätta backfilla.
//
// Kör:
//   node scripts/data/reconcile-wikidata.mjs [--apply]                     # elite_monuments + viking_cities (som förr)
//   node scripts/data/reconcile-wikidata.mjs --table=place_names --curated --limit=150 [--apply]
//     --curated  = bara namn med onomastisk analys (element_category satt) — de vi faktiskt visar
//     --limit=N  = max N rader denna körning (default 0 = alla kvarvarande o-normerade)
import pg from 'pg'; import { readFileSync } from 'node:fs';
const argv=process.argv.slice(2);
const APPLY=argv.includes('--apply');
const CURATED=argv.includes('--curated');
const TABLE=(argv.find(a=>a.startsWith('--table='))||'').split('=')[1]||null;
const LIMIT=Number((argv.find(a=>a.startsWith('--limit='))||'').split('=')[1])||0;
const env=Object.fromEntries(readFileSync('./.env','utf8').split(/\r?\n/).filter(l=>l&&!l.startsWith('#')&&l.includes('=')).map(l=>{const i=l.indexOf('=');return[l.slice(0,i).trim(),l.slice(i+1).trim().replace(/^["']|["']$/g,'')]}));
const c=new pg.Client({host:'aws-0-eu-north-1.pooler.supabase.com',port:5432,user:'postgres.mnuifmcjspeaauzehasj',password:env.SUPABASE_DB_PASSWORD,database:'postgres',ssl:{rejectUnauthorized:false}});await c.connect();
let formErrWarned=false;
const logFormErr=(e)=>{ if(!formErrWarned){ console.log('  ⚠ form-insert fel (visas en gång):', e.message); formErrWarned=true; } };
const UA='VikingageBot/1.0 (https://www.vikingage.se; daniel.larsson@expandtalk.se)';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const norm=s=>(s||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/stenen|runsten|borg|båtgravfält|\(.*?\)|[^a-z0-9åäö]/g,'').trim();

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
function pick(cands,name,strict){
  if(!cands||!cands.length) return null;
  const n=norm(name);
  if(strict){
    // place_names: KRÄV exakt normaliserad etikettlikhet (annars fångas "Åkerby skans",
    // "Algustorpasjön", "Ålem" för "Ålems kyrkby" — fel form vore brott mot god ortnamnssed).
    const eq=cands.filter(x=>{const l=norm(x.label); return l && l===n;}).sort((a,b)=>a.dist-b.dist)[0];
    if(eq && eq.dist<3) return {...eq, conf: eq.dist<1.5?'säker':'trolig'};
    return null;
  }
  const lab=cands.find(x=>{const l=norm(x.label); return l&&(l===n||l.includes(n)||n.includes(l));});
  if(lab) return {...lab, conf: lab.dist<1?'säker':'trolig'};
  if(cands[0].dist<0.4) return {...cands[0], conf:'osäker'};
  return null;
}

async function writeCrosswalk(table,id,m){
  await c.query(`insert into external_ids (entity_table,entity_id,scheme,identifier,uri,confidence,source)
    values ($1,$2,'wikidata',$3,$4,$5,'reconcile-wikidata (around+label)')
    on conflict (entity_table,entity_id,scheme,identifier) do update set confidence=excluded.confidence`,
    [table,String(id),m.qid,'https://www.wikidata.org/wiki/'+m.qid,m.conf]);
}

async function run(table, rows, opts={}){
  let hit=0,miss=0,normed=0,related=0;
  for(const r of rows){
    if(r.lat==null||r.lng==null) continue;
    const cands=await around(r.lat,r.lng);
    const n=norm(r.name);
    const m=pick(cands,r.name,!!opts.placeNames);
    if(m){ hit++; console.log(`  ✓ ${r.name} → ${m.qid} (${m.label||'?'}, ${m.dist.toFixed(2)}km, ${m.conf})`);
      if(APPLY){
        await writeCrosswalk(table,r.id,m);
        // Ortnamnssed: bara säker/trolig får bli gällande form (osäker = crosswalk men ej normering).
        if(opts.placeNames && (m.conf==='säker'||m.conf==='trolig') && m.label){
          await c.query(`update place_names set name_authority='wikidata', normed_name=$2 where id=$1`,[r.id,m.label]);
          normed++;
          if(norm(m.label)!==norm(r.name)){  // OSM-stavningen bevaras som variant av SAMMA ort
            await c.query(`insert into place_name_forms (pn_id,place_name,attested_form,relation_kind,form_kind,source,language_layer,framework,verified)
              values ($1,$2,$3,'same_place','osm_variant','osm','modern_svenska','god-ortnamnssed',false)
              on conflict (coalesce(place_id, pn_id), lower(attested_form), coalesce(relation_kind,'')) do nothing`,
              [r.id,m.label,r.name]).catch(e=>logFormErr(e));
          }
        }
      }
    } else { miss++; }
    // Relaterade namngivna företeelser: Wikidata-objekt med DELAD ortnamnsstam (ej exakt lika),
    // inom 3 km — "Åkerby skans", "Ålems kyrkby", "Algustorpasjön". Informationsvärde, ej brus.
    if(APPLY && opts.placeNames && cands){
      for(const cand of cands){
        const l=norm(cand.label);
        if(!l || l===n || cand.dist>3) continue;
        if(l.includes(n) || n.includes(l)){
          const res=await c.query(`insert into place_name_forms
            (pn_id,place_name,attested_form,relation_kind,form_kind,source,language_layer,framework,external_ref,verified)
            values ($1,$2,$3,'related_feature','wikidata_label','reconcile-wikidata','modern_svenska','namn-diakron',$4,false)
            on conflict (coalesce(place_id, pn_id), lower(attested_form), coalesce(relation_kind,'')) do nothing`,
            [r.id,r.name,cand.label,'https://www.wikidata.org/wiki/'+cand.qid]).catch(e=>{logFormErr(e);return{rowCount:0};});
          related+=res.rowCount||0;
        }
      }
    }
    await sleep(900);
  }
  console.log(`${table}: ${hit} matchade, ${miss} utan match${opts.placeNames?`, ${normed} normerade, ${related} relaterade företeelser`:''}.`);
}

try{
  if(TABLE==='place_names'){
    // Alla kurerade (ej bara o-normerade): normering hoppar redan satta (idempotent),
    // men relaterade företeelser ska fångas ÄVEN för orter som redan har gällande form.
    const where=`lat is not null${CURATED?' and element_category is not null':''}`;
    const q=`select id,name,lat,lng,name_authority from place_names where ${where} order by element_category nulls last, name ${LIMIT?`limit ${LIMIT}`:''}`;
    const rows=(await c.query(q)).rows;
    console.log(`\n== place_names (${rows.length} o-normerade${CURATED?', curated':''}) ==`);
    await run('place_names',rows,{placeNames:true});
  } else {
    const em=(await c.query(`select id,name,lat,lng from elite_monuments where lat is not null`)).rows;
    const vc=(await c.query(`select id,name,coordinates[1] lat,coordinates[0] lng from viking_cities where coordinates is not null`)).rows;
    console.log(`\n== elite_monuments (${em.length}) ==`); await run('elite_monuments',em);
    console.log(`\n== viking_cities (${vc.length}) ==`); await run('viking_cities',vc);
  }
  console.log(APPLY?'\nAPPLIED.':'\nDRY RUN (kör --apply för att skriva).');
}catch(e){ console.error('FAILED:',e.message); process.exitCode=1; }
finally{ await c.end(); }
