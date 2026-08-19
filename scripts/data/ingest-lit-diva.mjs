// DiVA-OAI-källa till lit_intake (nyckelfritt). OAI är datum-/set-baserat (ingen sökning) → vi skördar
// FÄRSKA poster och filtrerar på våra ämnesord (nordisk arkeologi/vikingatid/aDNA…), DOI-dedup mot
// befintligt intag (DOI-poster täcks redan av Crossref/OpenAlex → additivt = svensk grå-lit utan DOI).
// Avgränsad (max sidor). Kör: node scripts/data/ingest-lit-diva.mjs [dagar] [maxsidor]
import fs from 'fs'; import pg from 'pg';
const env = Object.fromEntries(fs.readFileSync('.env','utf8').split('\n').filter(l=>l.includes('=')).map(l=>{const i=l.indexOf('=');return [l.slice(0,i).trim(),l.slice(i+1).trim()];}));
const DAYS=parseInt(process.argv[2]||'45',10), MAXPAGES=parseInt(process.argv[3]||'8',10);
const since=new Date(Date.now()-DAYS*864e5).toISOString().slice(0,10);
const KW=/\b(viking|runst|rune|runic|runolog|mesolit|neolit|bronsålder|bronze age|järnålder|iron age|vikingatid|fornläm|gravfält|hällrist|rock art|arkeolog|archaeolog|medeltid|medieval|ortnamn|onomast|ancient dna|adna|aDNA|palaeogen|paleogen|numismat|solidus|hoard|skattfynd|silverskatt|osteolog|Öland|Gotland|Birka|Uppland|Sápmi|fornnord|old norse|norrön)\b/i;
const c=new pg.Client({host:'aws-0-eu-north-1.pooler.supabase.com',port:5432,user:'postgres.mnuifmcjspeaauzehasj',password:env.SUPABASE_DB_PASSWORD,database:'postgres',ssl:{rejectUnauthorized:false}});
await c.connect();
const haveDoi=new Set((await c.query(`select lower(doi) d from lit_intake where doi is not null`)).rows.map(r=>r.d));
const strip=s=>String(s||'').replace(/<[^>]*>/g,'').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/\s+/g,' ').trim();
const tag=(rec,t)=>{const re=new RegExp(`<dc:${t}>([\s\S]*?)</dc:${t}>`,'g');const out=[];let m;while((m=re.exec(rec))){out.push(strip(m[1]));}return out;};
let url=`https://www.diva-portal.org/dice/oai?verb=ListRecords&metadataPrefix=oai_dc&from=${since}`;
let page=0, seen=0, kept=0, ins=0;
while (url && page<MAXPAGES) {
  let xml; try { xml=await (await fetch(url,{headers:{'User-Agent':'VikingAgeResearch/1.0'}})).text(); } catch(e){ console.log('fetch-fel',e.message); break; }
  const recs=xml.split('<record>').slice(1);
  for (const rec of recs) {
    seen++;
    const title=tag(rec,'title')[0]||''; const subj=tag(rec,'subject').join(' '); const desc=tag(rec,'description')[0]||'';
    if (!KW.test(`${title} ${subj} ${desc}`)) continue;
    kept++;
    const ids=tag(rec,'identifier'); const doi=(ids.map(x=>x.match(/10\.\d{4,}\/\S+/)?.[0]).find(Boolean))||null;
    if (doi && haveDoi.has(doi.toLowerCase())) continue;
    const link=ids.find(x=>/^https?:\/\//.test(x))||(doi?'https://doi.org/'+doi:null);
    const idm=rec.match(/<identifier>(oai:DiVA[^<]+)<\/identifier>/); const ext=doi||idm?.[1]||link;
    const r=await c.query(`insert into lit_intake (source,ext_id,doi,title,authors,journal,publication_date,url,is_oa,abstract,matched_query,relevance)
      values ('diva',$1,$2,$3,$4,$5,$6,$7,true,$8,'diva',0) on conflict (source,ext_id) do nothing`,
      [ext, doi, title.slice(0,500), tag(rec,'creator').slice(0,6).join(', '), tag(rec,'publisher')[0]||'DiVA', (tag(rec,'date')[0]||'').slice(0,10)||null, link, desc.slice(0,1500)]);
    ins+=r.rowCount; if(r.rowCount&&doi) haveDoi.add(doi.toLowerCase());
  }
  const tok=xml.match(/<resumptionToken[^>]*>([^<]+)<\/resumptionToken>/); page++;
  url = tok && tok[1] ? `https://www.diva-portal.org/dice/oai?verb=ListRecords&resumptionToken=${encodeURIComponent(tok[1])}` : null;
  await new Promise(r=>setTimeout(r,500));
}
console.log(`DiVA (${since}→, ${page} sidor): ${seen} sedda, ${kept} ämnesmatchade, ${ins} nya i lit_intake (DOI-dedupade).`);
console.log('lit_intake per källa:', (await c.query(`select source, count(*) n from lit_intake group by 1 order by 2 desc`)).rows.map(r=>`${r.source} ${r.n}`).join(' · '));
await c.end();
