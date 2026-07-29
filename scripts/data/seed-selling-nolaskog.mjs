// Selling & Hanæus 1986, "Androm till skräck och varnagel" — 27 avrättningsplatser i
// Ångermanland/Medelpad (publ. med tillstånd via Hässjö Hembygdsförening) + Kallbäcken-detaljen.
// FAKTA i egna ord (person/datum/brott/metod/bödel), attribuerat. Sockengräns-platser → koord =
// MITTPUNKT mellan sockencentroider (place_names), UNGEFÄRLIG. Fyller norrländska luckan (SCB:s
// oregistrerade historiska platser). Kör: node scripts/data/seed-selling-nolaskog.mjs [--apply]
import pg from 'pg'; import { readFileSync } from 'node:fs';
const APPLY=process.argv.includes('--apply');
const env=Object.fromEntries(readFileSync('./.env','utf8').split(/\r?\n/).filter(l=>l&&!l.startsWith('#')&&l.includes('=')).map(l=>{const i=l.indexOf('=');return[l.slice(0,i).trim(),l.slice(i+1).trim().replace(/^["']|["']$/g,'')]}));
const REF='Selling & Hanæus 1986, "Androm till skräck och varnagel" (MittInfo, Örnsköldsvik); Hässjö Hembygdsförening (publ. med tillstånd)';
const HS='halshuggning', HSB='halshuggning och bränning', HSTG='halshuggning och stegling';

// [nr, namn, [socknar för gräns-midpoint], landskap, [[person, år, datum|null, brott, metod|null]...]]
const SITES=[
  [1,'Levar avrättningsplats',['Nordmaling'],'Ångermanland',[]],
  [2,'Galgbacken (Själevad/Arnäs)',['Själevad','Arnäs'],'Ångermanland',[['Pehr Pehrsson',1812,'1812-05-20','mord (på sin måg)',HS]]],
  [3,'Galasjö avrättningsplats',['Anundsjö','Sidensjö'],'Ångermanland',[['Sven Svensson',1845,'1845-10-18','mord (på hustru och sju av nio barn)',HS]]],
  [4,'Bjätaback avrättningsplats',['Anundsjö','Sidensjö'],'Ångermanland',[['Beata Johansdotter ("Tjyv-Bjäta")',1747,'1747-02-25','stöld',HS]]],
  [5,'Skuleskogen avrättningsplats',['Nätra','Vibyggerå'],'Ångermanland',[['Jonas Johansson',1818,'1818-09-09','mord (på sin fästmö)',HS]]],
  [6,'Salteååsen avrättningsplats',['Nordingrå','Nora'],'Ångermanland',[]],
  [7,'Häxberget (Torsåker)',['Dal','Ytterlännäs'],'Ångermanland',[
      ['Nio personer (häxprocessen i Torsåker)',1675,'1675-03-28','trolldom (häxprocess)',HSB],
      ['62 personer (häxprocessen i Torsåker)',1675,'1675-06-01','trolldom (häxprocess)',HSB]]],
  [8,'Solumsholmen avrättningsplats',['Styrnäs'],'Ångermanland',[['Sigred i Djuped och Anna från Lo',1674,null,'trolldom (häxprocess)',null]]],
  [9,'Djupbäcken avrättningsplats',['Långsele','Helgum'],'Ångermanland',[['Margareta Nilsdotter',1694,null,'barnamord',null]]],
  [10,'Pålmon avrättningsplats',['Resele','Ådalsliden'],'Ångermanland',[]],
  [11,'Gråtsvedjan avrättningsplats',['Ramsele','Tåsjö'],'Ångermanland',[['Pehr Carlsson',1840,'1840-10-12','mord (på sin broder)',null]]],
  [12,'Flybäcken avrättningsplats',['Rossön','Hoting'],'Ångermanland',[]],
  [13,'Häxgropen (Högsjö)',['Högsjö'],'Ångermanland',[]],
  [14,'Säbrå avrättningsplats (häxprocesser)',['Säbrå'],'Ångermanland',[]],
  [15,'Härnösand (Hov/Brännan)',['Härnösand'],'Ångermanland',[]],
  [16,'Stigsberget (Säbrå)',['Säbrå'],'Ångermanland',[]],
  [17,'Hårstaberget (Säbrå)',['Säbrå'],'Ångermanland',[]],
  [18,'Kallbäckens avrättningsplats',['Hässjö','Häggdånger'],'Medelpad',[
      ['Olof Jonsson och Erik Michaelsson',1770,'1770-09-12','mord (på grannen Michel Ersson)',HSTG],
      ['Zara Zetterlund',1860,null,'mord',null],
      ['Jonas Jonsson',1860,null,'mord',null]]],
  [19,'Skönsmon avrättningsplats',['Skön'],'Medelpad',[['Pär Pärson',1798,'1798-04-16','dråp',null]]],
  [20,'Tivolibacken (Sundsvall)',['Selånger','Skön'],'Medelpad',[]],
  [21,'Källstaheden (Stöde)',['Stöde'],'Medelpad',[['Per Persson',1745,null,'tidelag',HS]]],
  [22,'Sockengränsen Tuna/Stöde',['Tuna','Stöde'],'Medelpad',[['"Diger-Janke"',1850,null,'rånmord',null]]],
  [23,'Tälje (Borgsjö)',['Borgsjö'],'Medelpad',[]],
  [24,'Tuvslättsbacken (Borgsjö)',['Borgsjö'],'Medelpad',[]],
  [25,'Bottersbodarna (Borgsjö)',['Borgsjö'],'Medelpad',[]],
  [26,'Johannisberg (Borgsjö/Torp)',['Borgsjö','Torp'],'Medelpad',[]],
  [27,'Årskogen avrättningsplats',['Ytterhogdal'],'Medelpad',[['Johan Andersson och Johan Höglund',1851,'1851-07-16','mord',null]]],
];

const c=new pg.Client({host:'aws-0-eu-north-1.pooler.supabase.com',port:5432,user:'postgres.mnuifmcjspeaauzehasj',password:env.SUPABASE_DB_PASSWORD,database:'postgres',ssl:{rejectUnauthorized:false}});
await c.connect();
const centroid=async name=>{const r=await c.query(`select ST_Y(ST_Centroid(geom)) lat, ST_X(ST_Centroid(geom)) lng from place_names where name=$1 and ST_Y(ST_Centroid(geom)) between 61 and 65 and ST_X(ST_Centroid(geom)) between 14 and 19 limit 1`,[name]); return r.rows[0]||null;};
const surname=n=>n.replace(/\(.*?\)/g,'').replace(/"/g,'').trim().split(/\s+och\s+|\s+/).filter(Boolean).pop();
const exists=async(p,y)=>{const r=await c.query(`select 1 from execution_events where event_year=$1 and lower(executed_person) like $2 limit 1`,[y,'%'+surname(p).toLowerCase()+'%']); return r.rowCount>0;};

try{
  await c.query('BEGIN');
  let sIns=0,sSkip=0,eIns=0,eSkip=0,noCoord=0;
  for(const [nr,name,socknar,landscape,events] of SITES){
    // koord = mittpunkt mellan sockencentroider
    const cs=[]; for(const s of socknar){ const g=await centroid(s); if(g) cs.push(g); }
    const coord = cs.length ? [cs.reduce((a,g)=>a+g.lng,0)/cs.length, cs.reduce((a,g)=>a+g.lat,0)/cs.length] : null;
    if(!coord) noCoord++;
    const suri='selling1986:'+nr;
    const gznote = socknar.length>1 ? ` På sockengränsen ${socknar.join('/')} (avrättningsplatser lades ofta vid sockengränser). Koordinat: mittpunkt mellan socknarna (ungefärlig).` : ` ${socknar[0]} socken. Koordinat: sockencentroid (ungefärlig).`;
    let siteId=null;
    if(coord){
      const ex=await c.query(`select id from heritage_sites where source_uri=$1 limit 1`,[suri]);
      if(ex.rowCount){ siteId=ex.rows[0].id; sSkip++; }
      else{
        const r=await c.query(`insert into heritage_sites (name,raa_type,lat,lng,landscape,source_uri,description)
          values ($1,'Avrättningsplats',$2,$3,$4,$5,$6) returning id`,
          [name,coord[1],coord[0],landscape,suri,`${name}.${gznote} Ur ${REF}. Ofta ej registrerad i Fornsök (jfr SCB:s oregistrerade historiska platser).`]);
        siteId=r.rows[0].id; sIns++;
      }
    }
    for(const [person,year,date,crime,method] of events){
      if(await exists(person,year)){ eSkip++; continue; }
      const desc=`${person} avrättades ${date||year} vid ${name}${method?' — '+method:''}, dömd för ${crime}. Fakta ur ${REF}.`;
      await c.query(`insert into execution_events (site_id,executed_person,crime,method,event_date,event_year,place_name,landscape,lat,lng,description,source_ref,source_rights)
        values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,'facts_only')`,
        [siteId,person,crime,method,date,year,name,landscape,coord?coord[1]:null,coord?coord[0]:null,desc,REF]);
      eIns++;
    }
  }
  // Komplettera Petter Hedin (Kallbäcken 1866) — bödel + metod + koppling till platsen
  const kb=await c.query(`select id,lat,lng from heritage_sites where source_uri='selling1986:18' limit 1`);
  if(kb.rowCount){
    const {id,lat,lng}=kb.rows[0];
    const u=await c.query(`update execution_events set site_id=$1, lat=$2, lng=$3, method='halshuggning', executioner='Jonas Persson (verkställde; ordinarie bödel Anders Lund)', landscape='Medelpad',
        description='Skräddaren Petter Hedin från Stavre, Ljustorps socken, halshöggs 14 februari 1866 vid Kallbäcken för mordet på Barbara Christina Bjelkström — ett legomord beställt av hennes man Lars Nyberg (som benådades till livstids straffarbete). Kallbäcken var den avrättningsplats som användes sist i Västernorrlands län; den använda bilan finns på Länsmuseet Murberget, Härnösand. Fakta ur '||$4
      where lower(executed_person) like '%hedin%' and event_year=1866 returning id`,[id,lat,lng,REF]);
    console.log('Petter Hedin kompletterad:',u.rowCount);
  }
  console.log(`platser nya: ${sIns} (fanns ${sSkip}, utan koord ${noCoord}) · händelser nya: ${eIns} (dubblett ${eSkip})`);
  if(APPLY){ await c.query('COMMIT'); console.log('APPLIED.'); } else { await c.query('ROLLBACK'); console.log('DRY RUN.'); }
}catch(e){ await c.query('ROLLBACK'); console.error('FAILED:',e.message); process.exitCode=1; }
finally{ await c.end(); }
