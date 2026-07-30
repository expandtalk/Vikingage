// Parsar swedish_hillforts.period (fritext) → period_start/period_end (heltal, f.Kr = negativt).
// Prioritet: explicit årtalsintervall i texten → enskilt f.Kr-årtal → periodnamn-fallback.
// Idempotent (skriver bara over med parsat värde). Kör: [--apply]
import pg from 'pg'; import { readFileSync } from 'node:fs';
const APPLY=process.argv.includes('--apply');
const env=Object.fromEntries(readFileSync('./.env','utf8').split(/\r?\n/).filter(l=>l&&!l.startsWith('#')&&l.includes('=')).map(l=>{const i=l.indexOf('=');return[l.slice(0,i).trim(),l.slice(i+1).trim().replace(/^["']|["']$/g,'')]}));
const c=new pg.Client({host:'aws-0-eu-north-1.pooler.supabase.com',port:5432,user:'postgres.mnuifmcjspeaauzehasj',password:env.SUPABASE_DB_PASSWORD,database:'postgres',ssl:{rejectUnauthorized:false}});await c.connect();

const NAMES=[
  [/bronsålder/, -1700,-500],
  [/förromersk järnålder/, -500,0],
  [/romersk järnålder|romartid/, 0,400],
  [/folkvandringstid/, 400,550],
  [/vendeltid/, 550,800],
  [/vikingatid/, 800,1050],
  [/mellersta järnålder|mellanjärnålder/, 0,550],
  [/äldre järnålder/, -500,400],
  [/yngre järnålder/, 400,1050],
  [/\bjärnålder/, -500,1050],
  [/medeltid/, 1050,1520],
  [/stenålder|neolit/, -4000,-1700],
];
function parse(period){
  if(!period) return null;
  const t=period.toLowerCase();
  let m;
  // intervall f.Kr (t.ex. "1700–500 f.Kr.")
  m=t.match(/(\d{3,4})\s*[–-]\s*(\d{3,4})\s*f\.?\s*kr/);
  if(m) return [-(+m[1]), -(+m[2])];
  // intervall e.Kr / neutralt (t.ex. "400–1050", "ca 300–700 e.Kr.")
  m=t.match(/(\d{2,4})\s*[–-]\s*(\d{2,4})/);
  if(m){ let a=+m[1],b=+m[2]; if(/f\.?\s*kr/.test(t)&&!/e\.?\s*kr/.test(t)){a=-a;b=-b;} if(b>a) return [a,b]; }
  // enskilt f.Kr-årtal → ±100
  m=t.match(/(\d{3,4})\s*f\.?\s*kr/);
  if(m) return [-(+m[1])-100, -(+m[1])+100];
  // periodnamn-fallback (första träff)
  for(const [re,a,b] of NAMES) if(re.test(t)) return [a,b];
  return null;
}

try{
  const rows=(await c.query(`select id, period from swedish_hillforts where period is not null`)).rows;
  let parsed=0, un=0; const miss=[];
  await c.query('BEGIN');
  for(const r of rows){
    const iv=parse(r.period);
    if(!iv){ un++; if(miss.length<10) miss.push(r.period.slice(0,50)); continue; }
    await c.query(`update swedish_hillforts set period_start=$1, period_end=$2 where id=$3`,[iv[0],iv[1],r.id]);
    parsed++;
  }
  console.log(`Parsade ${parsed}/${rows.length} (oparsade ${un}). Ex. oparsat:`, miss);
  if(APPLY){ await c.query('COMMIT'); console.log('APPLIED.'); } else { await c.query('ROLLBACK'); console.log('DRY RUN.'); }
}catch(e){ await c.query('ROLLBACK'); console.error('FAILED:',e.message); process.exitCode=1; }
finally{ await c.end(); }
