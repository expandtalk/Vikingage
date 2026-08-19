// Fler litteratur-källor till lit_intake (nyckelfria): Crossref (alla tidskrifter/DOI, färskast) +
// Europe PMC (biomed + preprints/bioRxiv, abstracts + OA-flagga). DOI-dedup mot allt befintligt intag.
// Kör: node scripts/data/ingest-lit-sources.mjs [dagar]
import fs from 'fs'; import pg from 'pg';
const env = Object.fromEntries(fs.readFileSync('.env','utf8').split('\n').filter(l=>l.includes('=')).map(l=>{const i=l.indexOf('=');return [l.slice(0,i).trim(),l.slice(i+1).trim()];}));
const DAYS = parseInt(process.argv[2]||'60',10);
const since = new Date(Date.now()-DAYS*864e5).toISOString().slice(0,10);
const MAIL='daniel.larsson@expandtalk.se'; const UA='VikingAgeResearch/1.0 ('+MAIL+')';
const c = new pg.Client({host:'aws-0-eu-north-1.pooler.supabase.com',port:5432,user:'postgres.mnuifmcjspeaauzehasj',password:env.SUPABASE_DB_PASSWORD,database:'postgres',ssl:{rejectUnauthorized:false}});
await c.connect();
const journals = new Set((await c.query(`select lower(name) n from lit_journals`)).rows.map(r=>r.n));
const queries = (await c.query(`select query,label from lit_queries where active`)).rows;
const haveDoi = new Set((await c.query(`select lower(doi) d from lit_intake where doi is not null`)).rows.map(r=>r.d));
const strip = (s)=>String(s||'').replace(/<[^>]*>/g,'').replace(/\s+/g,' ').trim();
const boost = (j)=> j && journals.has(j.toLowerCase()) ? 50 : 0;
const upsert = async (row)=>{ // dedup: DOI globalt, annars (source,ext_id)
  if (row.doi && haveDoi.has(row.doi.toLowerCase())) return 0;
  const r = await c.query(`insert into lit_intake (source,ext_id,doi,title,authors,journal,publication_date,url,oa_url,is_oa,abstract,matched_query,relevance)
    values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) on conflict (source,ext_id) do nothing`,
    [row.source,row.ext_id,row.doi,(row.title||'').slice(0,500),row.authors,row.journal,row.pub||null,row.url,row.oa_url,row.is_oa,row.abstract,row.q,row.rel]);
  if (r.rowCount && row.doi) haveDoi.add(row.doi.toLowerCase());
  return r.rowCount;
};
let cr=0, ep=0;
for (const q of queries) {
  // Crossref
  try {
    const u=`https://api.crossref.org/works?query=${encodeURIComponent(q.query)}&filter=from-pub-date:${since}&rows=20&select=title,DOI,container-title,author,published,abstract,URL,license&mailto=${MAIL}`;
    const d=await (await fetch(u,{headers:{'User-Agent':UA}})).json();
    for (const it of (d.message?.items||[])) {
      const doi=it.DOI||null; const jr=(it['container-title']||[])[0]||null;
      const lic=(it.license||[]).map(l=>l.URL).find(x=>/creativecommons/.test(x))||null;
      const dp=it.published?.['date-parts']?.[0]; const pub=dp?`${dp[0]}-${String(dp[1]||1).padStart(2,'0')}-${String(dp[2]||1).padStart(2,'0')}`:null;
      cr+=await upsert({source:'crossref',ext_id:doi,doi,title:(it.title||[])[0],authors:(it.author||[]).slice(0,6).map(a=>[a.given,a.family].filter(Boolean).join(' ')).join(', '),journal:jr,pub,url:it.URL||(doi?'https://doi.org/'+doi:null),oa_url:lic?(doi?'https://doi.org/'+doi:null):null,is_oa:!!lic,abstract:strip(it.abstract).slice(0,1500),q:q.label,rel:boost(jr)});
    }
  } catch(e){ /* skip */ }
  await new Promise(r=>setTimeout(r,300));
  // Europe PMC (core → abstract + OA)
  try {
    const u=`https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=${encodeURIComponent(q.query+' AND (FIRST_PDATE:['+since+' TO 3000])')}&format=json&pageSize=20&resultType=core`;
    const d=await (await fetch(u,{headers:{'User-Agent':UA}})).json();
    for (const it of (d.resultList?.result||[])) {
      const doi=it.doi||null; const jr=it.journalInfo?.journal?.title||it.journalTitle||null;
      ep+=await upsert({source:'europepmc',ext_id:it.id||doi||it.pmid,doi,title:it.title,authors:it.authorString,journal:jr,pub:it.firstPublicationDate||null,url:doi?'https://doi.org/'+doi:(it.fullTextUrlList?.fullTextUrl?.[0]?.url||null),oa_url:it.isOpenAccess==='Y'?(doi?'https://doi.org/'+doi:null):null,is_oa:it.isOpenAccess==='Y',abstract:strip(it.abstractText).slice(0,1500),q:q.label,rel:boost(jr)});
    }
  } catch(e){ /* skip */ }
  await new Promise(r=>setTimeout(r,300));
  process.stdout.write(`\r  ${q.label}: klart`);
}
console.log(`\nCrossref: +${cr} · Europe PMC: +${ep} nya (DOI-dedupade).`);
console.log('lit_intake per källa:', (await c.query(`select source, count(*) n, count(*) filter (where is_oa) oa from lit_intake group by 1 order by 2 desc`)).rows.map(r=>`${r.source} ${r.n}(${r.oa} OA)`).join(' · '));
console.log('totalt:', (await c.query(`select count(*) n from lit_intake`)).rows[0].n);
await c.end();
