// Vattenleds-/handelsledsmodell. (1) Valdemars segelled migreras in ur valdemar_route_points.
// (3) Östleden (Rus-floderna) byggs ur viking_cities (verifierade koord). (2) Paleo-hydrografisk
// validering: varje punkt testas mot paleo_shorelines vid routens år (låg i vatten då? nu på land?).
// Idempotent (route-slug; punkter raderas+återskapas per route). Kör: [--apply]
import pg from 'pg'; import { readFileSync } from 'node:fs';
const APPLY=process.argv.includes('--apply');
const env=Object.fromEntries(readFileSync('./.env','utf8').split(/\r?\n/).filter(l=>l&&!l.startsWith('#')&&l.includes('=')).map(l=>{const i=l.indexOf('=');return[l.slice(0,i).trim(),l.slice(i+1).trim().replace(/^["']|["']$/g,'')]}));
const c=new pg.Client({host:'aws-0-eu-north-1.pooler.supabase.com',port:5432,user:'postgres.mnuifmcjspeaauzehasj',password:env.SUPABASE_DB_PASSWORD,database:'postgres',ssl:{rejectUnauthorized:false}});await c.connect();

// paleo-validering mot paleo_shorelines. Klassning tar hänsyn till att modellen är REGIONAL:
//   water_then  = punkten låg i vatten vid årtalet (inuti vattenpolygon)
//   shore_then  = ≤1500 m från dåtida vattenlinje (rimlig hamn/ankarplats)
//   review      = 1,5–30 km från modellerat vatten inom täckning → manuell koll (ev. landhöjning)
//   outside_model = >30 km till närmaste modellerat vatten → ej validerbar (utländsk/otäckt kust)
async function validate(lng,lat,year){
  const {rows:[r]}=await c.query(`
    with yr as (select year_ce from (select distinct year_ce from paleo_shorelines) t order by abs(year_ce-$3) limit 1),
         pt as (select ST_SetSRID(ST_MakePoint($1,$2),4326) g)
    select
      exists (select 1 from paleo_shorelines s,yr where s.year_ce=yr.year_ce and ST_Contains(s.geom,(select g from pt))) as contains,
      (select ST_Distance(s.geom::geography,(select g from pt)::geography)::int
         from paleo_shorelines s,yr where s.year_ce=yr.year_ce
         order by s.geom <-> (select g from pt) limit 1) as dist_m,
      (select year_ce from yr) as yr`, [lng,lat,year]);
  let status;
  if(r.dist_m==null) status='outside_model';
  else if(r.contains) status='water_then';
  else if(r.dist_m<=1500) status='shore_then';
  else if(r.dist_m<=30000) status='review';
  else status='outside_model';
  return {status, dist_m:r.dist_m, yr:r.yr};
}
async function upsertRoute(r){
  const {rows:[x]}=await c.query(`insert into trade_routes (slug,name,route_kind,orientation,year_from,year_to,description,source,license,link)
    values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
    on conflict (slug) do update set name=excluded.name,route_kind=excluded.route_kind,orientation=excluded.orientation,
      year_from=excluded.year_from,year_to=excluded.year_to,description=excluded.description,source=excluded.source,
      license=excluded.license,link=excluded.link returning id`,
    [r.slug,r.name,r.route_kind,r.orientation,r.year_from,r.year_to,r.description,r.source,r.license,r.link]);
  await c.query(`delete from trade_route_points where route_id=$1`,[x.id]);
  return x.id;
}
async function insPoint(routeId,p,valYear){
  const v = (p.lat!=null&&p.lng!=null) ? await validate(p.lng,p.lat,valYear) : {status:'unchecked',dist_m:null,yr:null};
  let note = v.status==='unchecked' ? null
    : v.status==='outside_model' ? `Utanför strandmodellens täckning (Mälardalen/Kalmar/Ångermanland) — ej paleo-validerbar här`
    : `Paleo ${v.yr} e.Kr.: ${v.status}${v.dist_m!=null?` (${v.dist_m} m till dåtida vattenlinje)`:''}`;
  if(valYear>950 && v.status && !['outside_model','unchecked'].includes(v.status))
    note += ` — OBS modellens max är 950; överskattar vattenstånd vs ${valYear}`;
  await c.query(`insert into trade_route_points (route_id,seq,name,lat,lng,point_kind,is_major,section,description,shoreline_status,shoreline_note,source)
    values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
    [routeId,p.seq,p.name,p.lat,p.lng,p.kind,!!p.major,p.section,p.desc,v.status,note,p.source]);
  return v.status;
}

try{
  await c.query('BEGIN');
  const tally={};
  const bump=s=>tally[s]=(tally[s]||0)+1;

  // ---- (2→migrera) VALDEMARS SEGELLED ur valdemar_route_points, validerad mot ~1300 (klamp 950) ----
  const vid=await upsertRoute({slug:'valdemar-segelled',name:'Kung Valdemars segelled',route_kind:'segelled',orientation:'kust',
    year_from:1250,year_to:1300,
    description:'Dansk kustitinerär (Danmark→Estland) nedtecknad i Kong Valdemars Jordebog, ~1300. Kustnära segelled med lotsstationer längs svenska ostkusten. OBS: medeltida dansk farled, inte en vikingatida handelsled.',
    source:'Kong Valdemars Jordebog (Danmarks jordebog)',license:'PD',link:null});
  const vp=(await c.query(`select seq,name,lat,lng,is_lotstation,is_major_waypoint,section,description from valdemar_route_points order by seq`)).rows;
  for(const r of vp){
    const st=await insPoint(vid,{seq:r.seq,name:r.name,lat:r.lat,lng:r.lng,
      kind:r.is_lotstation?'lotsstation':(r.is_major_waypoint?'hamn':'waypoint'),
      major:r.is_major_waypoint,section:r.section,desc:r.description,source:'Kong Valdemars Jordebog'},1300);
    bump('V:'+st);
  }

  // ---- (3) ÖSTLEDEN (Rus-floderna) ur viking_cities, validerad mot 950 (vikingatid) ----
  const oid=await upsertRoute({slug:'ostvagen',name:'Östvägen (Rus-floderna)',route_kind:'flodled',orientation:'öst',
    year_from:750,year_to:1050,
    description:'Väringarnas väg österut: rodd och drag över Östersjön → Neva → Ladoga → Volchov → Novgorod, portage till Dnjepr → Kiev → forsarna → Svarta havet → Miklagård (Bysans); Volga-gren mot kalifatet. Silver/dirham strömmar tillbaka. Etymologin bär leden: fornsv. *róþer* (rodd) → Roslagen/Roden → finskans *Ruotsi* → *Rus*.',
    source:'viking_cities (koord) + allmän forskningskonsensus',license:'CC0/allmän',link:null});
  // Dnjepr-grenen mot Bysans (Gnezdovo = portage-nod på övre Dnjepr, finns i viking_cities)
  const east=[
    {name:'Birka',norse:null,section:'Mälaren (avresa)'},
    {name:'Staraja Ladoga',norse:'Aldeigjuborg',section:'Ladoga'},
    {name:'Novgorod',norse:'Holmgård',section:'Volchov'},
    {name:'Gnezdovo',norse:null,section:'Dnjepr-portaget',desc:'Stor skandinavisk-rysk handelsplats/gravfält vid övre Dnjepr — portaget mellan Dvina och Dnjepr'},
    {name:'Kiev',norse:'Könugård',section:'Dnjepr'},
    {name:'Konstantinopel',norse:'Miklagård',section:'Bysans (slutmål)'},
  ];
  let seq=1;
  for(const e of east){
    const {rows:[cy]}=await c.query(`select coordinates[1] lat, coordinates[0] lng from viking_cities where name=$1 limit 1`,[e.name]);
    if(!cy){ console.log('SAKNAS i viking_cities:',e.name); continue; }
    const disp = e.norse ? `${e.name} (${e.norse})` : e.name;
    const st=await insPoint(oid,{seq:seq++,name:disp,lat:cy.lat,lng:cy.lng,kind:'stad',major:true,section:e.section,
      desc:e.desc||null,source:'viking_cities'},950);
    bump('Ö:'+st);
  }

  // ---- (3) VOLGA-GRENEN mot kalifatet (silver/dirham-artären via Bulgar) ----
  const gid=await upsertRoute({slug:'volgavagen',name:'Volgavägen (mot kalifatet)',route_kind:'flodled',orientation:'öst',
    year_from:800,year_to:1000,
    description:'Den östligare grenen: via Volga till Bulgar (Volgabulgariens emporium) och vidare mot Khazariska riket/Itil och det abbasidiska kalifatet. Detta var SILVERARTÄREN — huvudflödet av islamiska dirhamer som fyller Gotlands och Mälardalens skatter. Ibn Fadlan mötte Rus-köpmän vid Bulgar 922.',
    source:'viking_cities + Ibn Fadlan / allmän forskningskonsensus',license:'CC0/allmän',link:null});
  // Bulgar (Bolgar, Tatarstan) — välkänd UNESCO-lokal; koord allmänt etablerad
  const volga=[
    {name:'Birka',fromCity:true,section:'Mälaren (avresa)'},
    {name:'Staraja Ladoga',fromCity:true,norse:'Aldeigjuborg',section:'Ladoga'},
    {name:'Bulgar (Bolgar)',lat:54.9785,lng:49.0294,section:'Volgabulgarien',major:true,
      desc:'Volgabulgariens handelsstad — dirham-marknaden där Rus mötte kalifatets silver (Ibn Fadlan 922)',source:'Wikidata (allmänt känd UNESCO-lokal), approximativ'},
  ];
  let vseq=1;
  for(const e of volga){
    let lat=e.lat,lng=e.lng,src=e.source;
    if(e.fromCity){ const {rows:[cy]}=await c.query(`select coordinates[1] lat, coordinates[0] lng from viking_cities where name=$1 limit 1`,[e.name]); if(cy){lat=cy.lat;lng=cy.lng;src='viking_cities';} }
    const disp = e.norse ? `${e.name} (${e.norse})` : e.name;
    const st=await insPoint(gid,{seq:vseq++,name:disp,lat,lng,kind:'stad',major:e.major!==false,section:e.section,desc:e.desc||null,source:src},950);
    bump('Vo:'+st);
  }

  const nV=(await c.query(`select count(*)::int n from trade_route_points where route_id=$1`,[vid])).rows[0].n;
  const nO=(await c.query(`select count(*)::int n from trade_route_points where route_id=$1`,[oid])).rows[0].n;
  console.log(`Valdemar-punkter: ${nV}, Östvägen-punkter: ${nO}`);
  console.log('Paleo-status:', JSON.stringify(tally));
  if(APPLY){ await c.query('COMMIT'); console.log('APPLIED.'); } else { await c.query('ROLLBACK'); console.log('DRY RUN.'); }
}catch(e){ await c.query('ROLLBACK'); console.error('FAILED:',e.message); process.exitCode=1; }
finally{ await c.end(); }
