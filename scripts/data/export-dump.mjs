// INTEROP steg 3: öppen datadump i flera format.
//  - JSON      : rå rader (generellt utbyte)
//  - GeoJSON   : GIS (QGIS/ArcGIS/Leaflet) — FeatureCollection per spatialt dataset
//  - Turtle    : RDF/linked data med owl:sameAs → Wikidata/RAÄ (ur external_ids)
//  - GEDCOM    : släktforskning — endast person-/släktdata (historical_kings-kedjor), TODO-hook
// Skriver till exports/. Kör: node scripts/data/export-dump.mjs [--format=all|json|geojson|ttl]
import pg from 'pg'; import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
const FMT=(process.argv.find(a=>a.startsWith('--format='))||'--format=all').split('=')[1];
const env=Object.fromEntries(readFileSync('./.env','utf8').split(/\r?\n/).filter(l=>l&&!l.startsWith('#')&&l.includes('=')).map(l=>{const i=l.indexOf('=');return[l.slice(0,i).trim(),l.slice(i+1).trim().replace(/^["']|["']$/g,'')]}));
const c=new pg.Client({host:'aws-0-eu-north-1.pooler.supabase.com',port:5432,user:'postgres.mnuifmcjspeaauzehasj',password:env.SUPABASE_DB_PASSWORD,database:'postgres',ssl:{rejectUnauthorized:false}});await c.connect();
mkdirSync('exports',{recursive:true});
const want=f=>FMT==='all'||FMT===f;
const BASE='https://vikingage.se/id';

// [namn, sql (måste ge id,label,lat,lng + valfria), entity_table för sameAs]
const SETS=[
  ['elite_monuments', `select id, name label, lat, lng, kind, sphere, dating from elite_monuments where lat is not null`, 'elite_monuments'],
  ['viking_cities',   `select id, name label, coordinates[1] lat, coordinates[0] lng from viking_cities where coordinates is not null`, 'viking_cities'],
  ['trade_route_points', `select p.id, p.name label, p.lat, p.lng, tr.slug route, p.shoreline_status, p.rsl_rise_m from trade_route_points p join trade_routes tr on tr.id=p.route_id where p.lat is not null`, 'trade_route_points'],
  ['tingsplatser', `select id, name label, lat, lng, raa_type from heritage_sites where raa_type='tingsplats' and lat is not null`, 'heritage_sites'],
  ['fornborgar_daterade', `select id, name label, coordinates[1] lat, coordinates[0] lng, period_start, period_end from swedish_hillforts where period_start is not null`, 'swedish_hillforts'],
];

// external_ids → { "table|id": [{scheme,identifier,uri}] }
const xrows=(await c.query(`select entity_table, entity_id, scheme, identifier, uri from external_ids`)).rows;
const xmap={}; for(const x of xrows){ (xmap[x.entity_table+'|'+x.entity_id] ||= []).push(x); }

const esc=s=>String(s??'').replace(/\\/g,'\\\\').replace(/"/g,'\\"').replace(/\n/g,' ');
let ttl=`@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .\n@prefix geo: <http://www.w3.org/2003/01/geo/wgs84_pos#> .\n@prefix owl: <http://www.w3.org/2002/07/owl#> .\n@prefix crm: <http://www.cidoc-crm.org/cidoc-crm/> .\n\n`;
let counts={};

for(const [name, sql, table] of SETS){
  const rows=(await c.query(sql)).rows;
  counts[name]=rows.length;
  if(want('json')) writeFileSync(`exports/${name}.json`, JSON.stringify(rows,null,1));
  if(want('geojson')){
    const fc={type:'FeatureCollection', name, features: rows.filter(r=>r.lat!=null&&r.lng!=null).map(r=>{
      const {lat,lng,id,...props}=r; props.sameAs=(xmap[table+'|'+id]||[]).map(x=>x.uri);
      return {type:'Feature', id, geometry:{type:'Point',coordinates:[+lng,+lat]}, properties:props};
    })};
    writeFileSync(`exports/${name}.geojson`, JSON.stringify(fc));
  }
  if(want('ttl')){
    for(const r of rows){
      const uri=`<${BASE}/${table}/${r.id}>`;
      ttl+=`${uri} a crm:E27_Site ;\n  rdfs:label "${esc(r.label)}" ;\n`;
      if(r.lat!=null) ttl+=`  geo:lat "${r.lat}" ; geo:long "${r.lng}" ;\n`;
      for(const x of (xmap[table+'|'+r.id]||[])) ttl+=`  owl:sameAs <${x.uri}> ;\n`;
      ttl=ttl.replace(/;\n$/,'.\n\n');
    }
  }
}
if(want('ttl')) writeFileSync('exports/vikingage.ttl', ttl);

// Manifest (licens + format + räkning) — publiceras med dumpen.
writeFileSync('exports/manifest.json', JSON.stringify({
  generated_note:'kör med timestamp via CI', license:'CC0/CC-BY per dataset (se license-fält)',
  formats:['json','geojson','ttl'], api:'https://mnuifmcjspeaauzehasj.supabase.co/rest/v1/<tabell>',
  join_keys:'external_ids (scheme: wikidata|raa_lamning|…)', sets:counts,
},null,1));

console.log('Exporterat till exports/:', JSON.stringify(counts));
console.log('Format:', FMT, '| filer: *.json, *.geojson, vikingage.ttl, manifest.json');
await c.end();
