// Filolog-översättning av lit_intake till svenska — ENDAST open access-poster (rättighetssäkert att
// visa översatt text; non-OA lämnas på engelska = "huvudspåret"). AI-märkt i UI. Kräver OPENROUTER_API_KEY
// (env/CI/edge — ej i lokal .env). Modell via LIT_TRANSLATE_MODEL (default sonnet). Kör i cron-svepet.
// Kör: node scripts/data/translate-lit-oa.mjs [max]
import fs from 'fs'; import pg from 'pg';
const env=Object.fromEntries(fs.readFileSync('.env','utf8').split('\n').filter(l=>l.includes('=')).map(l=>{const i=l.indexOf('=');return[l.slice(0,i).trim(),l.slice(i+1).trim()];}));
const KEY=process.env.OPENROUTER_API_KEY||env.OPENROUTER_API_KEY;
if(!KEY){ console.error('OPENROUTER_API_KEY saknas — översättning hoppas (körs i CI/edge där nyckeln finns).'); process.exit(0); }
const MODEL=process.env.LIT_TRANSLATE_MODEL||'anthropic/claude-sonnet-4-5';
const MAX=parseInt(process.argv[2]||'60',10);
const c=new pg.Client({host:'aws-0-eu-north-1.pooler.supabase.com',port:5432,user:'postgres.mnuifmcjspeaauzehasj',password:env.SUPABASE_DB_PASSWORD,database:'postgres',ssl:{rejectUnauthorized:false}});await c.connect();
const rows=(await c.query(`select id, title, abstract from lit_intake where is_oa and status='relevant' and title_sv is null order by publication_date desc nulls last limit $1`,[MAX])).rows;
console.log(`${rows.length} OA-poster att översätta (modell ${MODEL}).`);
let ok=0;
for (const r of rows) {
  const prompt=`Översätt till svenska. Behåll fackuttryck korrekt (arkeologi/genetik/numismatik). Svara ENDAST med JSON {"title_sv":"…","abstract_sv":"…"} — ingen kommentar.\nTITEL: ${r.title}\nSAMMANFATTNING: ${(r.abstract||'').slice(0,1200)}`;
  try {
    const res=await fetch('https://openrouter.ai/api/v1/chat/completions',{method:'POST',headers:{'Authorization':`Bearer ${KEY}`,'Content-Type':'application/json','HTTP-Referer':'https://vikingage.se','X-Title':'Viking Age lit-translate'},
      body:JSON.stringify({model:MODEL,messages:[{role:'user',content:prompt}],temperature:0.1})});
    const d=await res.json(); let txt=d.choices?.[0]?.message?.content||''; txt=txt.replace(/```json|```/g,'').trim();
    const j=JSON.parse(txt.slice(txt.indexOf('{'), txt.lastIndexOf('}')+1));
    if(j.title_sv){ await c.query(`update lit_intake set title_sv=$1, abstract_sv=$2, translated_at=now() where id=$3`,[j.title_sv.slice(0,500), (j.abstract_sv||'').slice(0,1500), r.id]); ok++; }
  } catch(e){ console.log('  ✗', r.title?.slice(0,40), e.message); }
  await new Promise(x=>setTimeout(x,400));
}
console.log(`Översatta: ${ok}/${rows.length}.`);
await c.end();
