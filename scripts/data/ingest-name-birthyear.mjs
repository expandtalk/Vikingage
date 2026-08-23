// Parsar SCB TAB615 (förnamn × födelseår 1922–2021, topp-100 kvinnor+män) → name_birthyear_stats,
// + beräknar topp-decennium per namn → name_authority. ".." = SCB-maskning → hoppas över.
import pg from 'pg';import {readFileSync} from 'node:fs';
const env=Object.fromEntries(readFileSync('./.env','utf8').split(/\r?\n/).filter(l=>l&&!l.startsWith('#')&&l.includes('=')).map(l=>{const i=l.indexOf('=');return[l.slice(0,i).trim(),l.slice(i+1).trim().replace(/^["']|["']$/g,'')]}));
const c=new pg.Client({host:'aws-0-eu-north-1.pooler.supabase.com',port:5432,user:'postgres.mnuifmcjspeaauzehasj',password:env.SUPABASE_DB_PASSWORD,database:'postgres',ssl:{rejectUnauthorized:false},statement_timeout:300000});
await c.connect();const q=async(t,p)=>(await c.query(t,p)).rows;
const CSV='C:/Users/Lenovo/AppData/Local/Temp/claude/C--Users-Lenovo-projects-vikingage/8cda15a4-a47e-42db-a83f-719aefd5f172/scratchpad/tab615/TAB615_sv.csv';
const lines=readFileSync(CSV,'utf8').split(/\r?\n/);
const rows=[]; // {name,year,count}
for(const line of lines){
  const m=line.match(/^"([^"]*)","(\d{4})",(.*)$/);
  if(!m) continue;
  const name=m[1].trim(), year=+m[2]; let v=m[3].trim().replace(/^"|"$/g,'').replace(/\s/g,'');
  if(!v || v==='..' || v==='.' || !/^\d+$/.test(v)) continue;
  rows.push({name,year,count:+v});
}
console.log(`Parsade ${rows.length} namn×år-rader. Distinkta namn: ${new Set(rows.map(r=>r.name.toLowerCase())).size}.`);

// full reload
await q(`delete from name_birthyear_stats`);
const cols=['name','birth_year','count'];
for(let i=0;i<rows.length;i+=1000){
  const ch=rows.slice(i,i+1000);
  const ph=ch.map((_,r)=>`($${r*3+1},$${r*3+2},$${r*3+3})`).join(',');
  await c.query(`insert into name_birthyear_stats (name,birth_year,count) values ${ph}`,ch.flatMap(r=>[r.name,r.year,r.count]));
}
console.log('Infogat i name_birthyear_stats.');

// topp-decennium + total per namn
const agg=new Map(); // lower→{tot, dec:{}}
for(const r of rows){
  const k=r.name.toLowerCase(); let a=agg.get(k); if(!a){a={name:r.name,tot:0,dec:{}};agg.set(k,a);}
  a.tot+=r.count; const d=Math.floor(r.year/10)*10; a.dec[d]=(a.dec[d]||0)+r.count;
}
const existing=new Map((await q(`select id, lower(canonical) k from name_authority`)).map(r=>[r.k,r.id]));
let upd=0,miss=0;
for(const [k,a] of agg){
  const id=existing.get(k); if(!id){miss++;continue;}
  let peakDec=null,peakCnt=0; for(const [d,n] of Object.entries(a.dec)){ if(n>peakCnt){peakCnt=n;peakDec=+d;} }
  await q(`update name_authority set birthyear_peak_decade=$2, birthyear_peak_count=$3, birthyear_total=$4, updated_at=now() where id=$1`,
    [id, peakDec?peakDec+'-tal':null, peakCnt, a.tot]);
  upd++;
}
console.log(`Topp-decennium satt på ${upd} namn (${miss} saknades i name_authority).`);
console.log('\n=== stickprov: trendnamn ===');
console.log(JSON.stringify(await q(`select canonical, birthyear_peak_decade peak, birthyear_total tot, swedish_usage_layer layer from name_authority where lower(canonical) in ('kenneth','ronny','conny','sven','anna','daniel','vera','astrid','margareta','elvis','linnéa') order by birthyear_peak_decade nulls last`),null,1));
await c.end();
