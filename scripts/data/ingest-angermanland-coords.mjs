// Ångermanlands vikingatida centralorter — koordinatsättning ur Agnetas forskning (Daniel).
// SWEREF99 TM (EPSG:3006) → WGS84 (4326) via PostGIS. Uppdaterar befintliga central_place_names
// (41, koord saknades) + 3 central_places, och infogar nya klusterpunkter. Upsert på (cp, namn).
// Kör:  node scripts/data/ingest-angermanland-coords.mjs           (DRY-RUN)
//       node scripts/data/ingest-angermanland-coords.mjs --apply
import pg from 'pg';
import { readFileSync } from 'node:fs';
const APPLY = process.argv.includes('--apply');
const SRC = 'Agnetas forskning kring Ångermanland (SWEREF99 TM); Ortnamnsregistret; Bucht, Ortnamn i Västernorrlands län';

// Centralorter (uppdaterar central_places): [namn, easting, northing]
const CENTRAL = [
  ['Härnösand–Säbrå', 650660, 6948049],
  ['Nora',            656700, 6975109],
  ['Torsåker',        638575, 6997380],
];

// Klusterpunkter: [centralort, namn, easting, northing, kategori, note]
const N = 'Nora', T = 'Torsåker', H = 'Härnösand–Säbrå';
const PTS = [
  // --- Härnösand–Säbrå ---
  [H,'Hov',651503,6947648,'sacral','Kultcentrum (hov/gudahus)'],
  [H,'Storhögen (Hovsjorden)',651186,6947991,'sacral','Kungshög ~38 m diam, borttagen 1700–1800-tal'],
  [H,'Valnäs',647870,6948285,'sacral','"hon som beskyddar näset"'],
  [H,'Hovsberget',647105,6948912,'sacral',null],
  [H,'Säbrå',646078,6948919,'sacral','Sioboradh; gravfält vid kyrkans centrum'],
  [H,'Fröland',647808,6945488,'sacral','Fröjas land'],
  [H,'Fälleberget',648455,6944019,'sacral','tidigare Frölandsberget'],
  [H,'Katthavet',649771,6946244,'sacral','idag Södra sundet; Fröjas katter'],
  [H,'Kattan (Hovet)',650544,6946724,'sacral','Härnön skrevs Kattan'],
  [H,'Kattastrand',651150,6947121,'sacral',null],
  [H,'Lintjärn',645071,6948891,'sacral','lin = Fröjas kultväxt'],
  [H,'Tjusarklinten (Vitberget)',648463,6946290,'sacral','möjlig Gull-plats'],
  [H,'Stavkällan',646835,6946239,'sacral','helig källa, senare trefaldighetskälla'],
  [H,'Stavgården',646862,6948115,'sacral','tidigare gravfält'],
  [H,'Gådeåberget',648260,6947005,'sacral','"Gudarnas berg" (Godo)'],
  [H,'Godtjärn',648858,6948963,'sacral','ev. Gudarnas tjärn'],
  [H,'Ed',647158,6946753,'power','edsplats'],
  [H,'Edsberget',646180,6946587,'power',null],
  [H,'Helgum',645909,6948172,'sacral','"det heliga rummet"'],
  [H,'Hårsta',644411,6947807,'sacral','tidigare Horsta; heliga hästen'],
  [H,'Norrstig (hammarplats)',645664,6951497,'power','hammarplats + kungsgård vid Norrstig'],
  [H,'Saltvik',646747,6951010,'power','ev. äldre Salvik'],
  // --- Nora ---
  [N,'Höven',656937,6976058,'sacral','1563 Hoffuan; tidigare hov'],
  [N,'Salom',657205,6976190,'power','1314 Saleme; maktelitens säte'],
  [N,'Salom gravfält',656640,6976190,'sacral','ett av Ångermanlands största gravfält'],
  [N,'Härna',657729,6976584,'sacral','Härna/Härnatorpet; binamn på Fröja'],
  [N,'Grötom',658406,6977268,'sacral','-om = hög ålder; gröt/fruktbarhet'],
  [N,'Gullön',654731,6972656,'sacral','sockertoppsberg; fruktbar kraft'],
  [N,'Gräta',655956,6975279,'sacral','Gull i Gräta; ev. hovsgård'],
  [N,'Frök',659857,6975038,'sacral','ev. Frö/Fröja'],
  [N,'Kattismyran',658887,6974946,'sacral','Fröjas katter'],
  [N,'Asphammar',657257,6975234,'power','hammar = tingsplats'],
  [N,'Torrom',657043,6974841,'sacral','Torem = "Tors hem"'],
  [N,'Östanö',662131,6972736,'power','1500-tal Östanedeh; edsplats'],
  [N,'Svalaåker',662201,6972953,'sacral','ev. äldre Valaåker; depåfynd 1989'],
  [N,'Valkallen',658168,6966409,'sacral','"Vals huvud"'],
  [N,'Rossvik',655904,6974111,'sacral','Ross = heliga hästen'],
  [N,'Valfridsro',656539,6974190,'sacral','silverskatt 355 mynt (arabiska/England/Irland m.fl.)'],
  [N,'Rossvik gravhögar',655797,6973672,'sacral','fem gravhögar 12–16 m'],
  [N,'Holshögen',655493,6974530,'sacral','18 m; ev. Holl/hall'],
  [N,'Folkja',654851,6974230,'sacral','Falkia/Falkan; handelsplats; ev. falk/Fröja'],
  // --- Torsåker ---
  [T,'Torsåker',638486,6997367,'sacral','Hovsgården vid kyrkan; offeraltare under koret'],
  [T,'Salum',637957,6998059,'power','maktelitens säte; vid vårdkasberg'],
  [T,'Salum högstatusgrav',637942,6998093,'power','kvinnlig kammargrav ("begravd som drottning Tyra")'],
  [T,'Kyrkdal',632615,6994986,'sacral','tidigare Frea (lat. Fröja)'],
  [T,'Ärsta',633334,6994678,'sacral','möjligt Fröja-centrum (Bucht)'],
  [T,'Ärsta gravhögar',633104,6994863,'sacral','stora gravhögar'],
  [T,'Valasjön',626233,6988411,'sacral',null],
  [T,'Lusseberget',632135,6991644,'sacral','Lusse ev. Fröja'],
  [T,'Pannsjön',632298,6995872,'sacral','Pansjön; häxprocesser; ev. äldre helig plats'],
  [T,'Frök',640900,6994926,'sacral','ev. Fröj (jfr Nora); andra sidan älven'],
  [T,'Björned',638767,6999748,'power','äldsta kyrkan; edsplats; samisk betydelse'],
  [T,'Hämra',636682,7000525,'power','1500-tal Hambra; mindre hammarplats'],
  [T,'Hammar',639663,6990658,'power','stora hammarplatsen'],
  [T,'Västhammar',639488,6992472,'power',null],
  [T,'Hammarsön (kungsgård)',641273,6991413,'power','kungsgårdens säte'],
  [T,'Rogsta',637515,6997499,'sacral','tidigare Rossta; Ross'],
  [T,'Rogsta fornborg',637282,6997216,'power','fornborg'],
  [T,'Rossön',639874,6988132,'sacral','Ross'],
  [T,'Valaberget',641655,6995045,'sacral',null],
  [T,'Vangsta',637928,6994908,'sacral','heliga vagnen'],
];

const env = Object.fromEntries(readFileSync('./.env','utf8').split(/\r?\n/)
  .filter(l=>l&&!l.startsWith('#')&&l.includes('=')).map(l=>{const i=l.indexOf('=');return [l.slice(0,i).trim(), l.slice(i+1).trim().replace(/^["']|["']$/g,'')];}));
const client = new pg.Client({ host:'aws-0-eu-north-1.pooler.supabase.com', port:5432, user:'postgres.mnuifmcjspeaauzehasj', password:env.SUPABASE_DB_PASSWORD, database:'postgres', ssl:{rejectUnauthorized:false} });
await client.connect();

const toWgs = async (e,n) => {
  const r = await client.query(`select ST_Y(p) lat, ST_X(p) lng from (select ST_Transform(ST_SetSRID(ST_MakePoint($1,$2),3006),4326) p) t`,[e,n]);
  return r.rows[0];
};

// central_place-id per namn
const cpRows = (await client.query(`select id, name from central_places`)).rows;
const cpId = Object.fromEntries(cpRows.map(r=>[r.name, r.id]));

let updated=0, inserted=0, cpUpdated=0;
if (APPLY) await client.query('BEGIN');
try {
  for (const [name,e,n] of CENTRAL) {
    const {lat,lng} = await toWgs(e,n);
    if (APPLY) { await client.query(`update central_places set lat=$1,lng=$2 where name=$3`,[lat,lng,name]); cpUpdated++; }
    else console.log(`CP ${name.padEnd(18)} → ${lat.toFixed(5)}, ${lng.toFixed(5)}`);
  }
  for (const [cp,name,e,n,cat,note] of PTS) {
    const id = cpId[cp]; if (!id) { console.log(`SKIP (okänd centralort ${cp})`); continue; }
    const {lat,lng} = await toWgs(e,n);
    if (!APPLY) { console.log(`  ${cp.slice(0,4)} ${name.padEnd(24)} → ${lat.toFixed(5)}, ${lng.toFixed(5)} [${cat}]`); continue; }
    const ex = await client.query(`select id from central_place_names where central_place_id=$1 and name=$2`,[id,name]);
    if (ex.rows[0]) {
      await client.query(`update central_place_names set lat=$1,lng=$2,note=coalesce(note,$3),source=$4 where id=$5`,[lat,lng,note,SRC,ex.rows[0].id]);
      updated++;
    } else {
      await client.query(`insert into central_place_names (central_place_id,name,category,lat,lng,note,source,project_id,confidence)
        select $1,$2,$3,$4,$5,$6,$7,(select project_id from central_places where id=$1),'trolig'`,[id,name,cat,lat,lng,note,SRC]);
      inserted++;
    }
  }
  if (APPLY) { await client.query('COMMIT'); console.log(`APPLIED: central_places ${cpUpdated}, central_place_names updated ${updated}, inserted ${inserted}`); }
  else console.log(`\n(DRY-RUN: ${CENTRAL.length} centralorter + ${PTS.length} klusterpunkter. --apply för att skriva.)`);
} catch(err){ if(APPLY) await client.query('ROLLBACK'); console.error('FAILED (rollback):', err.message); process.exitCode=1; }
finally { await client.end(); }
