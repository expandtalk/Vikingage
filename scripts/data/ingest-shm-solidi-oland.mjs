// Öland-solidi ur SHM:s CC-BY-export (samlingar.shm.se) → solidi.
// Fyndplats på SOCKEN-nivå → sockencentroid ur heritage_sites (Öland). Ej exakt fyndplats.
// Kör: node scripts/data/ingest-shm-solidi-oland.mjs [csv-path] [--apply]
import { readFileSync } from 'node:fs'; import pg from 'pg';
const args=process.argv.slice(2); const APPLY=args.includes('--apply');
const CSV=args.find(a=>!a.startsWith('--')) || 'C:/Users/Lenovo/Downloads/shm_sis_object_20260731_155753.csv';
function parseCSV(txt){const rows=[];let f='',row=[],q=false;txt=txt.replace(/^\uFEFF/,'');
  for(let i=0;i<txt.length;i++){const c=txt[i];
    if(q){if(c==='"'){if(txt[i+1]==='"'){f+='"';i++;}else q=false;}else f+=c;}
    else{if(c==='"')q=true;else if(c===','){row.push(f);f='';}else if(c==='\n'){row.push(f);rows.push(row);row=[];f='';}else if(c==='\r'){}else f+=c;}}
  if(f.length||row.length){row.push(f);rows.push(row);}return rows;}
const rows=parseCSV(readFileSync(CSV,'utf8')); const H=rows[0]; const ix=n=>H.indexOf(n);
const iNum=ix('Föremålsnummer'),iAcc=ix('Förvärvsnummer'),iOther=ix('Andra nummer'),iBen=ix('Föremålsbenämning'),
  iLand=ix('Fyndplats, Landskap'),iSock=ix('Fyndplats, Socken'),iPlats=ix('Fyndplats, Plats'),iDesc=ix('Beskrivning'),iMat=ix('Material');
// ALLA Öland-guldmynt (solidi + imitationer + övrigt guld), inte bara benämning "solidus".
const data=rows.slice(1).filter(r=>r.length>iSock && (r[iLand]||'').trim()==='Öland'
  && (/solidus/i.test(r[iBen]||'') || /guld/i.test(r[iMat]||'') || /solid|imitation/i.test(r[iDesc]||'')));
const cap=s=>s? s.replace(/\b\w/g,m=>m.toUpperCase()):s;
const ruler=d=>{const m=(d||'').match(/^([a-zåäö\s]+?)(?:\s*\(|,|$)/i);return m?cap(m[1].trim()).slice(0,40)||null:null;};

const env=Object.fromEntries(readFileSync('./.env','utf8').split(/\r?\n/).filter(l=>l&&!l.startsWith('#')&&l.includes('=')).map(l=>{const i=l.indexOf('=');return[l.slice(0,i).trim(),l.slice(i+1).trim().replace(/^["']|["']$/g,'')]}));
const c=new pg.Client({host:'aws-0-eu-north-1.pooler.supabase.com',port:5432,user:'postgres.mnuifmcjspeaauzehasj',password:env.SUPABASE_DB_PASSWORD,database:'postgres',ssl:{rejectUnauthorized:false}});
await c.connect();
if(APPLY){await c.query(readFileSync('./supabase/migrations/20260731230000_solidi_shm_source.sql','utf8'));}
const udt=(await c.query(`SELECT udt_name FROM information_schema.columns WHERE table_name='solidi' AND column_name='coordinates'`)).rows[0].udt_name;
const isGeom = udt==='geometry';
// sockencentroider (Öland)
const cent={}; for(const r of (await c.query(`SELECT parish, avg(lat) lat, avg(lng) lng FROM heritage_sites WHERE landscape='Öland' AND parish IS NOT NULL GROUP BY parish`)).rows) cent[r.parish.toLowerCase()]={lat:+r.lat,lng:+r.lng};

let ins=0,skip=0,nocoord=0; const missing=new Set();
for(const r of data){
  const sock=(r[iSock]||'').replace(/\s*socken/i,'').trim();
  const geo=cent[sock.toLowerCase()];
  if(!geo){missing.add(sock);nocoord++;}
  const uri='shm:'+(r[iNum]||'').trim();
  if(!APPLY) continue;
  const coordSql = geo ? (isGeom?`ST_SetSRID(ST_MakePoint(${geo.lng},${geo.lat}),4326)`:`point(${geo.lng},${geo.lat})`) : 'NULL';
  const inv=[(r[iNum]||'').trim(), r[iAcc]&&('förv '+r[iAcc]), r[iOther]].filter(Boolean).join(' · ');
  const res=await c.query(
    `INSERT INTO solidi (museum_inv, ruler, find_place, parish, county, coordinates, source, source_uri)
     VALUES ($1,$2,$3,$4,'Kalmar',${coordSql},$5,$6) ON CONFLICT (source_uri) DO NOTHING`,
    [inv, ruler(r[iDesc]), (r[iPlats]||'').trim()||null, sock||null,
     'SHM samlingar.shm.se (CC BY 4.0); sockencentroid-koord', uri]);
  if(res.rowCount>0)ins++; else skip++;
}
console.log(`Öland-solidi i CSV: ${data.length} | ${APPLY?`insatta ${ins}, fanns ${skip}`:'DRY-RUN'} | utan sockencentroid: ${nocoord}`);
if(missing.size) console.log('socknar utan centroid:', [...missing].join(', '));
if(APPLY) console.log('solidi totalt nu:', (await c.query(`SELECT count(*) n FROM solidi`)).rows[0].n);
await c.end();
