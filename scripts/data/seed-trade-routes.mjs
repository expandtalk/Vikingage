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
  // Metrisk RSL vid ROUTENS egen epok (valYear) — så en forntida korridor valideras rätt.
  let rslM=null, rslConf=null;
  if(p.lat!=null && p.lng!=null){
    const {rows:[rr]}=await c.query(`select rsl_rise_m, confidence from paleo_rsl($1,$2,$3)`,[p.lng,p.lat,valYear]);
    if(rr){ rslM=rr.rsl_rise_m; rslConf=rr.confidence; }
  }
  await c.query(`insert into trade_route_points (route_id,seq,name,lat,lng,point_kind,is_major,section,description,shoreline_status,shoreline_note,source,rsl_rise_m,rsl_confidence)
    values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)`,
    [routeId,p.seq,p.name,p.lat,p.lng,p.kind,!!p.major,p.section,p.desc,v.status,note,p.source,rslM,rslConf]);
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

  // ---- GOTLAND–BALTIKUM (österled över havet; Öland/Gotland som språngbräda) ----
  const bid=await upsertRoute({slug:'gotland-baltikum',name:'Gotland–Baltikum (österled över havet)',route_kind:'segelled',orientation:'öst',
    year_from:600,year_to:1000,
    description:'Havsleden som band samman Öland och Gotland med östra Östersjön och vidare mot flodmynningarna. Salme-skeppsgravarna på Saaremaa (~750, mälardalska krigare stupade i strid) och Grobin i Kurland (skandinavisk koloni) visar österledens tidiga hav-ben — före Rus-floderna. Salvefynden knyter Kalmarsund/Öland till Baltikum.',
    source:'viking_cities + Salme/Grobin (allmän forskningskonsensus)',license:'CC0/allmän',link:null});
  const balt=[
    {name:'Köpingsvik (Öland)',lat:56.9008,lng:16.7286,section:'Öland',major:true,desc:'Ölands vikingatida hamn/handelsplats',source:'strandkontroll'},
    {name:'Visby',fromCity:true,section:'Gotland',major:true,desc:'Gotlands hamn — silverskatternas ö'},
    {name:'Salme (Saaremaa)',lat:58.3842,lng:22.2203,section:'Ösel/Estland',major:true,desc:'Salme-skeppsgravarna ~750 — mälardalska krigare stupade; tidigaste kända vikingaskeppständ österut',source:'Wikidata (approx), skeppsgravslokal'},
    {name:'Grobin (Grobiņa)',lat:56.5486,lng:21.1667,section:'Kurland/Lettland',major:true,desc:'Skandinavisk koloni/emporium i Kurland (gravfält à la Birka/Gotland)',source:'Wikidata (approx)'},
  ];
  let bseq=1;
  for(const e of balt){
    let lat=e.lat,lng=e.lng,src=e.source;
    if(e.fromCity){ const {rows:[cy]}=await c.query(`select coordinates[1] lat, coordinates[0] lng from viking_cities where name=$1 limit 1`,[e.name]); if(cy){lat=cy.lat;lng=cy.lng;src='viking_cities';} }
    const st=await insPoint(bid,{seq:bseq++,name:e.name,lat,lng,kind:'stad',major:true,section:e.section,desc:e.desc||null,source:src},950);
    bump('Ba:'+st);
  }

  // ---- GÖTAVIRKE-KORRIDOREN (Slätbaken↔Vättern) — förhistorisk öst-västlig inlandsled ----
  const cid=await upsertRoute({slug:'gotavirke-korridoren',name:'Götavirke-korridoren (Slätbaken–Vättern)',route_kind:'inreled',orientation:'inre',
    year_from:-7000,year_to:1350,
    description:'Förhistorisk öst-västlig korridor över Östgötaslätten som band Östersjön (Slätbaken/Söderköping) med Vättern (Motala/Vadstena). Naturligt färdstråk sedan stenåldern — Motala hör till Sveriges äldsta boplatser (Strandvägen/Kanaljorden, mesolitikum ~7000 f.Kr.). Götavirke-vallen (kulturlager folkvandringstid 400–550, vallen vikingatid 800–1050) spärrade passagen mellan Asplången och Lillsjön. EJ sammanhängande farled: Motala ström är för forsig (fallen) → portage + landtransport. Namnet "Götavirke" är sannolikt en senare bildning (Danevirke-modell), ej belagt originalnamn.',
    source:'viking_cities + vikingRegionData (Götavirke) + Länsstyrelsen Östergötland',license:'CC0/allmän',link:null});
  const corr=[
    {name:'Söderköping (Slätbaken)',lat:58.4806,lng:16.3222,kind:'hamn',section:'Östersjö-änden',desc:'Slätbaken var en längre havsvik inåt land förr (~4 m högre vattenstånd vid 500 e.Kr.)',source:'viking_cities'},
    {name:'Götavirke (spärrvall)',lat:58.4847,lng:16.1747,kind:'spärrvall',section:'Passagen Asplången–Lillsjön',desc:'3,5 km försvarsvall; äldre kulturlager 400–550, vallen 800–1050 — kontrollerade korridoren',source:'vikingRegionData/RAÄ'},
    {name:'Linköping (Stångån/Roxen)',lat:58.4108,lng:15.6214,kind:'stad',section:'Roxen',desc:'Central knutpunkt på slätten',source:'viking_cities'},
    {name:'Motala (Vätterns utlopp)',lat:58.5371,lng:15.0365,kind:'portage',section:'Vättern-änden',desc:'Vätterns utlopp; Motala ström för forsig → portage. Mesolitisk boplats (Strandvägen/Kanaljorden). OBS: Vättern är eget nivåregim — RSL-siffran (Slätbaken-kalibrerad) gäller ej sjön.',source:'allmänt känd stadskoord'},
    {name:'Vadstena (Vättern)',lat:58.4503,lng:14.8894,kind:'stad',section:'Vättern-änden',desc:'Vätterns strand; senare kungsgård → Birgittinerkloster',source:'allmänt känd stadskoord'},
  ];
  let cseq=1;
  for(const e of corr){ const st=await insPoint(cid,{seq:cseq++,name:e.name,lat:e.lat,lng:e.lng,kind:e.kind,major:true,section:e.section,desc:e.desc,source:e.source},500); bump('Gv:'+st); }

  const nV=(await c.query(`select count(*)::int n from trade_route_points where route_id=$1`,[vid])).rows[0].n;
  const nO=(await c.query(`select count(*)::int n from trade_route_points where route_id=$1`,[oid])).rows[0].n;
  console.log(`Valdemar-punkter: ${nV}, Östvägen-punkter: ${nO}`);
  console.log('Paleo-status:', JSON.stringify(tally));
  if(APPLY){ await c.query('COMMIT'); console.log('APPLIED.'); } else { await c.query('ROLLBACK'); console.log('DRY RUN.'); }
}catch(e){ await c.query('ROLLBACK'); console.error('FAILED:',e.message); process.exitCode=1; }
finally{ await c.end(); }
