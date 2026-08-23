// Applicerar filolog-batcharnas TSV (axel 1+2) + korrigerar axel 3 för runsten-flaggade importnamn.
// Runologisk insikt (Daniel/Karlevistenen): gammal sten kan bära SENARE ristning → bibliskt/klassiskt/
// lågtyskt namn "på runsten" är ett sent/kristet skikt, EJ vikingatida namnskatt. Korsa tradition mot lager.
import pg from 'pg';import {readFileSync} from 'node:fs';
const env=Object.fromEntries(readFileSync('./.env','utf8').split(/\r?\n/).filter(l=>l&&!l.startsWith('#')&&l.includes('=')).map(l=>{const i=l.indexOf('=');return[l.slice(0,i).trim(),l.slice(i+1).trim().replace(/^["']|["']$/g,'')]}));
const c=new pg.Client({host:'aws-0-eu-north-1.pooler.supabase.com',port:5432,user:'postgres.mnuifmcjspeaauzehasj',password:env.SUPABASE_DB_PASSWORD,database:'postgres',ssl:{rejectUnauthorized:false}});
await c.connect();const q=async(t,p)=>(await c.query(t,p)).rows;
const TSV='C:/Users/Lenovo/AppData/Local/Temp/claude/C--Users-Lenovo-projects-vikingage/8cda15a4-a47e-42db-a83f-719aefd5f172/scratchpad/filolog_batch.tsv';
const NORSE=new Set(['fornnordiskt','fornnordiskt-teofort']);

// 1) applicera TSV
let n=0, miss=0;
for(const line of readFileSync(TSV,'utf8').split(/\r?\n/)){
  if(!line.trim()) continue;
  const [can,tl,ol,me,et,theo]=line.split('\t');
  if(!can||!tl) continue;
  const r=await c.query(`update name_authority set tradition_layer=$2, origin_language=$3, meaning=coalesce($4,meaning),
     etymology=$5, theophoric=$6, notes_sv=coalesce(notes_sv,'Etymologi: filolog-agent (fria källor, egen prosa)'),
     updated_at=now() where lower(canonical)=lower($1)`,
     [can.trim(),tl.trim(),ol?.trim()||null,me?.trim()||null,et?.trim()||null,(theo?.trim()==='true')]);
  if(r.rowCount) n++; else {miss++; if(miss<=15) console.log('   ej match:',can.trim());}
}
console.log(`TSV applicerad: ${n} namn uppdaterade (${miss} matchade ej).`);

// 2) axel-3-korrigering: on_runestone + icke-fornnordiskt ursprung → sent/kristet runbelägg
const fix=await q(`update name_authority set
   swedish_usage_layer='sent runbelägg (kristet/medeltida — ej vikingatida namnskatt)',
   notes_sv = coalesce(notes_sv,'')||' [Axel3: runbelägg omklassat — bibliskt/klassiskt/importnamn på runsten är sekundärt/sent skikt (jfr Karlevistenen), ej vikingatida. Kräver per-signum-datering (runolog) för säkerhet.]'
   where on_runestone=true and tradition_layer is not null and tradition_layer not in ('fornnordiskt','fornnordiskt-teofort')
   returning canonical`);
console.log(`Axel-3 korrigerad för ${fix.length} importnamn på runsten:`, fix.map(r=>r.canonical).join(', '));

console.log('\n=== lager-fördelning efter korrigering ===');
console.log(JSON.stringify(await q(`select swedish_usage_layer, count(*)::int n from name_authority group by 1 order by 2 desc`)));
console.log('etymologi-täckning:',JSON.stringify(await q(`select count(*) filter(where etymology is not null)::int med, count(*)::int totalt from name_authority`)));
console.log('tradition_layer:',JSON.stringify(await q(`select tradition_layer, count(*)::int n from name_authority where tradition_layer is not null group by 1 order by 2 desc`)));
console.log('\n=== stickprov: importnamn som stod som "runsvenskt" ===');
console.log(JSON.stringify(await q(`select canonical, tradition_layer trad, swedish_usage_layer layer, on_runestone onrun from name_authority where lower(canonical) in ('anna','david','petrus','thomas','andreas','lucas','maria','björn','tor','karl') order by canonical`),null,1));
await c.end();
