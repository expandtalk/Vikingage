// Ingest ursprunglig vs nuvarande plats för runstenar ur rundata.sql (Samnordisk runtextdatabas)
// → inscription_locations. Bara stenar som FLYTTATS (två koordinater som skiljer, ELLER en
// originallocation-text). Idempotent: hoppar inskrifter som redan har rader (bevarar kurerade
// Sm 144/147). Kör: node scripts/data/ingest-runestone-locations.mjs [--apply]
import pg from 'pg';
import { readFileSync } from 'node:fs';

const APPLY = process.argv.includes('--apply');
const sql = readFileSync('rundata.sql', 'utf8');

const hexToUuid = (h) => `${h.slice(0,8)}-${h.slice(8,12)}-${h.slice(12,16)}-${h.slice(16,20)}-${h.slice(20,32)}`.toLowerCase();

function blocks(table) {
  const marker = 'INSERT INTO `' + table + '`';
  let i = 0, out = '';
  while ((i = sql.indexOf(marker, i)) !== -1) {
    const end = sql.indexOf(';\n', i);
    out += sql.slice(i, end === -1 ? undefined : end) + '\n';
    if (end === -1) break; i = end + 1;
  }
  return out;
}

// coordinates: (X'coordid',X'objectid',current,lat,lng)
const coords = new Map(); // objectid -> {0:{lat,lng},1:{lat,lng}}
{
  const b = blocks('coordinates');
  const re = /\(X'[0-9A-F]{32}',X'([0-9A-F]{32})',([01]),(-?[\d.]+),(-?[\d.]+)\)/g;
  let m; while ((m = re.exec(b))) {
    const oid = hexToUuid(m[1]);
    if (!coords.has(oid)) coords.set(oid, {});
    coords.get(oid)[m[2]] = { lat: parseFloat(m[3]), lng: parseFloat(m[4]) };
  }
}
// originallocations + locations: (X'objectid','text','lang') — föredra sv-se
function textMap(table) {
  const b = blocks(table);
  const re = /\(X'([0-9A-F]{32})','((?:[^'\\]|\\.|'')*)','([a-z-]+)'\)/g;
  const map = new Map(); let m;
  while ((m = re.exec(b))) {
    const oid = hexToUuid(m[1]); const txt = m[2].replace(/\\'/g, "'").replace(/''/g, "'").replace(/\\"/g, '"').trim();
    if (!txt) continue;
    const cur = map.get(oid);
    if (!cur || m[3] === 'sv-se') map.set(oid, txt);
  }
  return map;
}
const origText = textMap('originallocations');
const locText = textMap('locations');

console.log(`Dump: ${coords.size} objekt m. koordinater, ${origText.size} m. originallocation-text, ${locText.size} m. location-text.`);

const env = Object.fromEntries(readFileSync('./.env','utf8').split(/\r?\n/).filter(l=>l&&!l.startsWith('#')&&l.includes('=')).map(l=>{const i=l.indexOf('=');return [l.slice(0,i).trim(),l.slice(i+1).trim().replace(/^["']|["']$/g,'')];}));
const c = new pg.Client({ host:'aws-0-eu-north-1.pooler.supabase.com', port:5432, user:'postgres.mnuifmcjspeaauzehasj', password:env.SUPABASE_DB_PASSWORD, database:'postgres', ssl:{rejectUnauthorized:false} });
await c.connect();

const insc = (await c.query(`
  select ri.id, ri.signum, ri.rundata_objectid::text oid
  from runic_inscriptions ri
  where ri.rundata_objectid is not null
    and not exists (select 1 from inscription_locations il where il.inscription_id = ri.id)`)).rows;

const differ = (a,b) => !a || !b || Math.abs(a.lat-b.lat) > 1e-5 || Math.abs(a.lng-b.lng) > 1e-5;
const rows = [];
let moved = 0;
for (const r of insc) {
  const co = coords.get(r.oid) || {};
  const c0 = co['0'], c1 = co['1'];
  const oTxt = origText.get(r.oid) || null;
  const lTxt = locText.get(r.oid) || null;
  const hasCoordMove = c0 && c1 && differ(c0, c1);
  if (!hasCoordMove && !oTxt) continue; // ingen flyttinfo → hoppa (in situ, redan i coordinates)
  moved++;
  // current
  const cur = c1 || c0 || null;
  rows.push([r.id, r.signum, 'current', 10, lTxt, cur?.lat ?? null, cur?.lng ?? null, 'probable',
    'Rundata (Samnordisk runtextdatabas)', null]);
  // original
  const origLat = hasCoordMove ? c0.lat : null, origLng = hasCoordMove ? c0.lng : null;
  rows.push([r.id, r.signum, 'original', 0, oTxt, origLat, origLng,
    hasCoordMove ? 'probable' : 'possible', 'Rundata (Samnordisk runtextdatabas)',
    oTxt ? `Rundatas originallocation: "${oTxt}"` : 'Rundatas ursprungliga koordinat (current=0).']);
}
console.log(`Inskrifter utan befintliga platsrader: ${insc.length}. Flyttade (får original+current): ${moved} → ${rows.length} rader.`);
console.log('Exempel:'); rows.slice(0,10).forEach(x=>console.log(`  ${x[1]} ${x[2]} · ${x[4]??'—'} · ${x[5]??'—'},${x[6]??'—'}`));

if (APPLY && rows.length) {
  for (let i=0;i<rows.length;i+=500) {
    const chunk = rows.slice(i,i+500);
    const vals = chunk.map((_,j)=>`($${j*10+1},$${j*10+2},$${j*10+3},$${j*10+4},$${j*10+5},$${j*10+6},$${j*10+7},$${j*10+8},$${j*10+9},$${j*10+10})`).join(',');
    await c.query(`insert into inscription_locations (inscription_id, signum, role, seq, place_name, lat, lng, certainty, source, note) values ${vals}`, chunk.flat());
  }
  console.log(`APPLIED: ${rows.length} rader insatta.`);
} else {
  console.log('DRY-RUN (ingen skrivning). Kör med --apply för att skriva.');
}
await c.end();
