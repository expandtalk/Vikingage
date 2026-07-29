// Källkritisk pass över alla avrättningsplatser: läser RAÄ-beskrivningen och sätter
//  (1) omtaggar namn-only-fall (röse/hög som bara BÄR galgbacke-namn) → rätt lämningstyp
//  (2) evidence_class = belagd | tradition | namn
//  (3) period ur beskrivningen (även bara-årtal 1779/1853, inte bara "1600-tal")
// Kör: node scripts/data/classify-execution-sites.mjs [--apply]
import pg from 'pg'; import { readFileSync } from 'node:fs';
const APPLY=process.argv.includes('--apply');
const UA='VikingageBot/1.0 (daniel.larsson@expandtalk.se)';
const env=Object.fromEntries(readFileSync('./.env','utf8').split(/\r?\n/).filter(l=>l&&!l.startsWith('#')&&l.includes('=')).map(l=>{const i=l.indexOf('=');return[l.slice(0,i).trim(),l.slice(i+1).trim().replace(/^["']|["']$/g,'')]}));
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const dec=s=>(s||'').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/\s+/g,' ').trim();

// Andra lämningstyper som kan bära galgbacke-NAMN utan att vara avrättningsplats
const OTHER=/(röse|skärvstenshög|stensättning|domarring|hög|naturbildning|fornlämningsliknande|gravfält|boplats)/i;
function realType(itemLabel){ // "Galgbacken, Röse" → "Röse"
  const parts=itemLabel.split(',').map(s=>s.trim());
  for(const p of parts.slice(1)){ if(OTHER.test(p) && !/avrätt|galg|stegl/i.test(p)) return p; }
  return null;
}
function classify(desc){
  const d=desc.toLowerCase();
  const belagd=/karta (från )?1[5-8]\d\d|enskifteskart|historisk karta|avbildar|arkeolog|skelett|utgräv|halshugg|sista avrättning|avrättad|avrättades|galge (var |restes|stod)|schavott/.test(d);
  const trad=/tradition|gängse uppfattning|i folkmun|folkmun|sägen|ryktas|skall enligt|ska enligt|enligt.*(ska|skall) ha|muntlig/.test(d);
  if(belagd) return 'belagd';
  if(trad) return 'tradition';
  return null;
}
function period(desc){
  const d=desc.toLowerCase(); const p=[];
  if(/medeltid/.test(d)) p.push('medeltid');
  const cent=[...d.matchAll(/(1[2-8]00)-?\s*tal/g)].map(m=>m[1]+'-tal');
  const years=[...d.matchAll(/\b(1[2-8]\d\d)\b/g)].map(m=>+m[1]).filter(y=>y>=1250&&y<=1899);
  p.push(...new Set(cent));
  // enskilda årtal (avrättnings-/kartår) — ta min–max om flera
  if(years.length){ const mn=Math.min(...years),mx=Math.max(...years); p.push(mn===mx?String(mn):`${mn}–${mx}`); }
  return p.length ? [...new Set(p)].join(', ')+' (RAÄ)' : null;
}

const c=new pg.Client({host:'aws-0-eu-north-1.pooler.supabase.com',port:5432,user:'postgres.mnuifmcjspeaauzehasj',password:env.SUPABASE_DB_PASSWORD,database:'postgres',ssl:{rejectUnauthorized:false},statement_timeout:300000});
await c.connect();
const sites=(await c.query(`select id,name,raa_type,period,source_uri from heritage_sites where lower(raa_type) ~ 'avrätt|galg|stegl' and source_uri ~ 'raa/lamning'`)).rows;
console.log(`avrättningsplatser att gå igenom: ${sites.length}`);
let done=0; const stat={belagd:0,tradition:0,namn:0,oklar:0}; let reclass=0, dated=0;
try{
  await c.query('BEGIN');
  for(const s of sites){
    done++;
    let xml=''; try{ const r=await fetch('https://'+s.source_uri.replace(/^https?:\/\//,''),{headers:{'User-Agent':UA}}); if(r.ok) xml=await r.text(); }catch{}
    const itemLabel=dec((xml.match(/<pres:itemLabel>([^<]+)/)||[])[1])||s.name||'';
    const desc=dec((xml.match(/<pres:description>([\s\S]*?)<\/pres:description>/)||[])[1]);
    const rt=realType(itemLabel);
    const hasExecInDesc=/avrätt|galg|stegl|halshugg|schavott/i.test(desc);
    let ev, newRaa=null;
    if(rt && !hasExecInDesc){ ev='namn'; newRaa=rt; reclass++; }   // röse m. galgbacke-namn, ingen avrättning i texten
    else { ev=classify(desc)||'oklar'; }
    stat[ev]=(stat[ev]||0)+1;
    const per=period(desc);
    if(per && !s.period) dated++;
    if(APPLY){
      await c.query(`update heritage_sites set evidence_class=$2, raa_type=coalesce($3,raa_type),
          period=coalesce(period,$4),
          description = case when $3 is not null then coalesce(description,'')||' (Omtaggad: RAÄ-lämningstyp är '||$3||' — bär galgbacke-namn men ingen belagd avrättning.)' else description end
        where id=$1`,[s.id, ev, newRaa, per]);
    }
    if(done%100===0) console.log(`  …${done}/${sites.length}`);
    await sleep(120);
  }
  console.log(`\nevidensklass: belagd ${stat.belagd} · tradition ${stat.tradition} · namn ${stat.namn} · oklar ${stat.oklar}`);
  console.log(`omtaggade (namn→rätt typ, lämnar avrättnings-lagret): ${reclass} · nydaterade: ${dated}`);
  if(APPLY){ await c.query('COMMIT'); console.log('APPLIED.'); } else { await c.query('ROLLBACK'); console.log('DRY RUN (rollback).'); }
}catch(e){ await c.query('ROLLBACK'); console.error('FAILED:',e.message); process.exitCode=1; }
finally{ await c.end(); }
