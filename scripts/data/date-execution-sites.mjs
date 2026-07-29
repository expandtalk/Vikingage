// Backfyll period på avrättnings-/galgplatser ur RAÄ-beskrivningen (pres:description). Skannar epok-ord.
// Fakta (CC0 RAÄ). Flaggar medeltida. Kör: node scripts/data/date-execution-sites.mjs [--apply]
import pg from 'pg'; import { readFileSync } from 'node:fs';
const APPLY=process.argv.includes('--apply');
const UA='VikingageBot/1.0 (https://www.vikingage.se; daniel.larsson@expandtalk.se)';
const env=Object.fromEntries(readFileSync('./.env','utf8').split(/\r?\n/).filter(l=>l&&!l.startsWith('#')&&l.includes('=')).map(l=>{const i=l.indexOf('=');return[l.slice(0,i).trim(),l.slice(i+1).trim().replace(/^["']|["']$/g,'')]}));
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const dec=s=>(s||'').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/\s+/g,' ').trim();
function periodFrom(desc){
  const d=desc.toLowerCase(); const p=[];
  // Bara 1200–1800-tal = trolig brukningstid. 1900-/2000-tal = inventeringsår, ej avrättningsperiod.
  const cent=[...d.matchAll(/(1[2-8]00)-?\s*tal/g)].map(m=>m[1]+'-tal');
  if(/medeltid/.test(d)) p.push('medeltid');
  if(cent.length) p.push(...[...new Set(cent)]);
  if(/järnålder/.test(d)) p.push('järnålder');
  if(!p.length && /(historisk tid|nyare tid|efterreformatorisk)/.test(d)) p.push('historisk tid');
  if(!p.length) return null;
  return [...new Set(p)].join(', ')+' (RAÄ)';
}
const c=new pg.Client({host:'aws-0-eu-north-1.pooler.supabase.com',port:5432,user:'postgres.mnuifmcjspeaauzehasj',password:env.SUPABASE_DB_PASSWORD,database:'postgres',ssl:{rejectUnauthorized:false},statement_timeout:300000});
await c.connect();
const sites=(await c.query(`select id, source_uri, name from heritage_sites where period is null and lower(raa_type) ~ 'avrätt|galg|stegl' and source_uri ~ 'raa/lamning'`)).rows;
console.log(`avrättningsplatser utan period: ${sites.length}`);
let dated=0, medieval=0, done=0; const dist={};
try{
  await c.query('BEGIN');
  for(const s of sites){
    done++;
    let desc=''; try{ const r=await fetch('https://'+s.source_uri.replace(/^https?:\/\//,''),{headers:{'User-Agent':UA}}); if(r.ok){ const t=await r.text(); desc=dec((t.match(/<pres:description>([\s\S]*?)<\/pres:description>/)||[])[1]); } }catch{}
    const per=periodFrom(desc);
    if(per){ dated++; if(/medeltid/.test(per)) medieval++; dist[per]=(dist[per]||0)+1;
      await c.query(`update heritage_sites set period=$2, description = coalesce(description,'') || $3 where id=$1`,
        [s.id, per, desc? ' RAÄ: '+desc.slice(0,300):'']); }
    if(done%100===0) console.log(`  …${done}/${sites.length} (daterade ${dated})`);
    await sleep(200);
  }
  console.log(`\ndaterade: ${dated}/${sites.length}, varav medeltida: ${medieval}`);
  console.log('fördelning (topp):', Object.entries(dist).sort((a,b)=>b[1]-a[1]).slice(0,10).map(([k,v])=>`${k}=${v}`).join(' · '));
  if(APPLY){ await c.query('COMMIT'); console.log('APPLIED.'); } else { await c.query('ROLLBACK'); console.log('DRY RUN (rollback).'); }
}catch(e){ await c.query('ROLLBACK'); console.error('FAILED:',e.message); process.exitCode=1; }
finally{ await c.end(); }
