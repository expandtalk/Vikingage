// SHM-samlingsimport → museum_objects, ATTRIBUERADE till rätt museum (museum_id).
// SHM CC BY 4.0: fakta/metadata fritt + attribution obligatorisk. Fyndplats → sockencentroid
// (approx). Osteologi → jsonb. Kör: node scripts/data/ingest-shm-collection.mjs [--apply]
import { readFileSync } from 'node:fs'; import pg from 'pg';
const APPLY = process.argv.includes('--apply');
const CSV = process.argv.find(a=>a.endsWith('.csv')) || 'docs/shm_sis_object_20260724_093302.csv';
const env = Object.fromEntries(readFileSync('./.env','utf8').split(/\r?\n/).filter(l=>l&&!l.startsWith('#')&&l.includes('=')).map(l=>{const i=l.indexOf('=');return[l.slice(0,i).trim(),l.slice(i+1).trim().replace(/^["']|["']$/g,'')]}));
const Q='"';
function parseCSV(text){ text=text.replace(/^﻿/,''); const rows=[]; let row=[], f='', q=false;
  for(let i=0;i<text.length;i++){ const ch=text[i];
    if(q){ if(ch===Q){ if(text[i+1]===Q){f+=Q;i++;} else q=false; } else f+=ch; }
    else { if(ch===Q) q=true; else if(ch===','){ row.push(f); f=''; } else if(ch==='\n'){ row.push(f); rows.push(row); row=[]; f=''; } else if(ch==='\r'){} else f+=ch; } }
  if(f.length||row.length){ row.push(f); rows.push(row); } return rows; }

const PERIODS = [
  ['förromersk järnålder',-500,0],['romersk järnålder',0,400],['folkvandringstid',400,550],
  ['vendeltid',550,793],['vikingatid',793,1066],['yngre järnålder',400,1066],['äldre järnålder',-500,400],
  ['järnålder',-500,1050],['bronsålder',-1700,-500],['neolitikum',-4000,-1700],['stenålder',-9000,-1700],
  ['medeltid',1050,1520],['nyare tid',1520,1900]];
const parsePeriod = t => { const s=(t||'').toLowerCase(); for(const [n,a,b] of PERIODS) if(s.includes(n)) return [a,b]; return [null,null]; };

const c=new pg.Client({host:'aws-0-eu-north-1.pooler.supabase.com',port:5432,user:'postgres.mnuifmcjspeaauzehasj',password:env.SUPABASE_DB_PASSWORD,database:'postgres',ssl:{rejectUnauthorized:false}});
await c.connect();
try {
  const rows=parseCSV(readFileSync(CSV,'utf8'));
  const H=rows[0].map(h=>h.replace(/\s+/g,' ').trim());
  const col=(pred)=>H.findIndex(pred);
  const ix={ no:col(h=>h==='Föremålsnummer'), mus:col(h=>h==='Museum'), name:col(h=>h==='Föremålsbenämning'),
    material:col(h=>h==='Material'), technique:col(h=>h==='Teknik'), size:col(h=>h==='Storlek'), denom:col(h=>h==='Valör'),
    country:col(h=>h.endsWith('Land')), landscape:col(h=>h.endsWith('Landskap')), socken:col(h=>h.endsWith('Socken')),
    kommun:col(h=>h.endsWith('Kommun')), place:col(h=>h.endsWith('Plats')), fornl:col(h=>h.includes('Fornlämning')),
    context:col(h=>h==='Arkeologisk kontext'), period:col(h=>h==='Tidsperiod'), title:col(h=>h==='Titel'),
    desc:col(h=>h==='Beskrivning'), cat:col(h=>h==='Kategori'), bild:col(h=>h==='Bild'), url:col(h=>h==='URL'),
    ostArt:col(h=>h.includes('artbedömning')), ostBen:col(h=>h.includes('benslag')), ostAlder:col(h=>h.includes('åldersbedömning')),
    ostSkada:col(h=>h.includes('skador')), ostKon:col(h=>h.includes('könsbest')) };

  // Museum-registret: CSV-namn → museum_id (attribution).
  const musRows=(await c.query('SELECT id, name FROM museums')).rows;
  const findMuseum=(csvName)=>{ const n=(csvName||'').toLowerCase();
    if(n.includes('myntkabinett')) return musRows.find(m=>/myntkabinett/i.test(m.name))?.id;
    if(n.includes('historiska')) return musRows.find(m=>/historiska museet/i.test(m.name))?.id;
    return null; };

  // Sockencentroid ur heritage_sites (approx koordinat).
  const cen=new Map();
  for(const r of (await c.query("SELECT lower(parish) p, avg(lat) lat, avg(lng) lng FROM heritage_sites WHERE parish IS NOT NULL AND lat IS NOT NULL GROUP BY lower(parish)")).rows) cen.set(r.p,[+r.lat,+r.lng]);

  const data=rows.slice(1).filter(r=>r[ix.no]);
  const musCount={}, noMus=[]; let withCoord=0, withOst=0, ins=0;
  for(const r of data){
    const museum_id=findMuseum(r[ix.mus]); const mk=r[ix.mus]||'(tom)'; musCount[mk]=(musCount[mk]||0)+1;
    if(!museum_id) noMus.push(mk);
    const socken=(r[ix.socken]||'').trim(); const co=socken?cen.get(socken.toLowerCase()):null; if(co) withCoord++;
    const [ps,pe]=parsePeriod(r[ix.period]);
    const ost={}; for(const [k,i] of [['art',ix.ostArt],['benslag',ix.ostBen],['ålder',ix.ostAlder],['skador',ix.ostSkada],['kön',ix.ostKon]]) { const v=(r[i]||'').trim(); if(v) ost[k]=v; }
    const hasOst=Object.keys(ost).length>0; if(hasOst) withOst++;
    if(APPLY && museum_id){
      const res=await c.query(
        `INSERT INTO museum_objects (museum_id,object_no,name,title,description,category,material,technique,size,denomination,
           find_country,find_landscape,find_socken,find_kommun,find_place,find_fornlamning,context,period,period_start,period_end,
           osteology,image_url,source_url,source,attribution,lat,lng)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,
           'SHM (Statens historiska museer)','CC BY 4.0 · Statens historiska museer (SHM)',$24,$25)
         ON CONFLICT (museum_id,object_no) DO NOTHING`,
        [museum_id, r[ix.no], r[ix.name]||null, r[ix.title]||null, r[ix.desc]||null, r[ix.cat]||null, r[ix.material]||null,
         r[ix.technique]||null, r[ix.size]||null, r[ix.denom]||null, r[ix.country]||null, r[ix.landscape]||null, socken||null,
         r[ix.kommun]||null, r[ix.place]||null, r[ix.fornl]||null, r[ix.context]||null, r[ix.period]||null, ps, pe,
         hasOst?JSON.stringify(ost):null, r[ix.bild]||null, r[ix.url]||null, co?co[0]:null, co?co[1]:null]);
      ins+=res.rowCount;
    }
  }
  console.log('Museer i CSV:', musCount);
  if(noMus.length) console.log('⚠ UTAN museum-matchning:', [...new Set(noMus)]);
  console.log(`Objekt: ${data.length} | med sockenkoord: ${withCoord} | med osteologi: ${withOst}`);
  console.log(APPLY?`\n✅ APPLY: ${ins} objekt insatta (attribuerade till museum).`:'\nDRY-RUN (kör --apply).');
} finally { await c.end(); }
