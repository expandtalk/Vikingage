// SHM CC-BY-guldmynt (samlingar.shm.se) → solidi. HELA Sverige (Öland/Gotland/fastland),
// provenienssatt (landskap+socken). Fyndplats sockennivå → sockencentroid ur heritage_sites
// (landskap+parish). Oproveniens (tomt landskap) hoppas. Kör: node scripts/data/ingest-shm-gold.mjs [csv] [--apply]
import { readFileSync } from 'node:fs'; import pg from 'pg';
const args=process.argv.slice(2); const APPLY=args.includes('--apply');
const CSV=args.find(a=>!a.startsWith('--')) || 'C:/Users/Lenovo/Downloads/shm_sis_object_20260731_155747.csv';
function parseCSV(txt){const rows=[];let f='',row=[],q=false;txt=txt.replace(/^\uFEFF/,'');
  for(let i=0;i<txt.length;i++){const c=txt[i];
    if(q){if(c==='"'){if(txt[i+1]==='"'){f+='"';i++;}else q=false;}else f+=c;}
    else{if(c==='"')q=true;else if(c===','){row.push(f);f='';}else if(c==='\n'){row.push(f);rows.push(row);row=[];f='';}else if(c==='\r'){}else f+=c;}}
  if(f.length||row.length){row.push(f);rows.push(row);}return rows;}
const rows=parseCSV(readFileSync(CSV,'utf8')); const H=rows[0]; const ix=n=>H.indexOf(n);
const iNum=ix('Föremålsnummer'),iAcc=ix('Förvärvsnummer'),iOther=ix('Andra nummer'),iBen=ix('Föremålsbenämning'),
  iLand=ix('Fyndplats, Landskap'),iSock=ix('Fyndplats, Socken'),iPlats=ix('Fyndplats, Plats'),iDesc=ix('Beskrivning'),iMat=ix('Material');
const cap=s=>s?s.replace(/\b\w/g,m=>m.toUpperCase()):s;
const ruler=d=>{const m=(d||'').match(/^([a-zåäö\s]+?)(?:\s*\(|,|$)/i);return m?cap(m[1].trim()).slice(0,40)||null:null;};
const norm=s=>(s||'').replace(/\s*socken/i,'').trim().toLowerCase();
// provenienssatt guld
const data=rows.slice(1).filter(r=>r.length>iSock && (r[iLand]||'').trim() && (r[iSock]||'').trim()
  && (/guld/i.test(r[iMat]||'') || /solidus/i.test(r[iBen]||'') || /solid|imitation/i.test(r[iDesc]||'')));

const env=Object.fromEntries(readFileSync('./.env','utf8').split(/\r?\n/).filter(l=>l&&!l.startsWith('#')&&l.includes('=')).map(l=>{const i=l.indexOf('=');return[l.slice(0,i).trim(),l.slice(i+1).trim().replace(/^["']|["']$/g,'')]}));
const c=new pg.Client({host:'aws-0-eu-north-1.pooler.supabase.com',port:5432,user:'postgres.mnuifmcjspeaauzehasj',password:env.SUPABASE_DB_PASSWORD,database:'postgres',ssl:{rejectUnauthorized:false}});
await c.connect();
if(APPLY){ await c.query(`ALTER TABLE solidi ADD COLUMN IF NOT EXISTS landscape text`);
  await c.query(readFileSync('./supabase/migrations/20260731230000_solidi_shm_source.sql','utf8')).catch(()=>{}); }
const isGeom=(await c.query(`SELECT udt_name FROM information_schema.columns WHERE table_name='solidi' AND column_name='coordinates'`)).rows[0].udt_name==='geometry';
const cent={}; for(const r of (await c.query(`SELECT landscape, parish, avg(lat) lat, avg(lng) lng FROM heritage_sites WHERE parish IS NOT NULL AND lat IS NOT NULL GROUP BY landscape,parish`)).rows) cent[norm(r.landscape)+'|'+norm(r.parish)]={lat:+r.lat,lng:+r.lng};

const perLand={}, missLand={}; let ins=0,upd=0,nocoord=0;
for(const r of data){
  const land=(r[iLand]||'').trim(), sock=(r[iSock]||'').replace(/\s*socken/i,'').trim();
  perLand[land]=(perLand[land]||0)+1;
  const geo=cent[norm(land)+'|'+norm(sock)]; if(!geo){nocoord++; missLand[land]=(missLand[land]||0)+1;}
  if(!APPLY) continue;
  const coordSql=geo?(isGeom?`ST_SetSRID(ST_MakePoint(${geo.lng},${geo.lat}),4326)`:`point(${geo.lng},${geo.lat})`):'NULL';
  const inv=[(r[iNum]||'').trim(), r[iAcc]&&('förv '+r[iAcc]), r[iOther]].filter(Boolean).join(' · ');
  const res=await c.query(
    `INSERT INTO solidi (museum_inv, ruler, find_place, parish, landscape, coordinates, source, source_uri)
     VALUES ($1,$2,$3,$4,$5,${coordSql},$6,$7)
     ON CONFLICT (source_uri) DO UPDATE SET landscape=EXCLUDED.landscape, parish=EXCLUDED.parish,
       find_place=EXCLUDED.find_place, coordinates=COALESCE(EXCLUDED.coordinates, solidi.coordinates)`,
    [inv, ruler(r[iDesc]), (r[iPlats]||'').trim()||null, sock||null, land, 'SHM samlingar.shm.se (CC BY 4.0); sockencentroid-koord', 'shm:'+(r[iNum]||'').trim()]);
  if(res.rowCount>0) ins++;
}
console.log(`Provenienssatt guld i CSV: ${data.length} | ${APPLY?`upsertade ${ins}`:'DRY-RUN'} | utan sockencentroid: ${nocoord}`);
console.log('per landskap:', JSON.stringify(perLand));
if(Object.keys(missLand).length) console.log('utan centroid per landskap:', JSON.stringify(missLand));
if(APPLY){ await c.query(`NOTIFY pgrst, 'reload schema'`);
  console.log('solidi per landskap nu:', JSON.stringify((await c.query(`SELECT landscape, count(*) n FROM solidi GROUP BY landscape ORDER BY n DESC`)).rows)); }
await c.end();
