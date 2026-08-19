// Litteratur-intag via OpenAlex (nyckelfritt): kör lit_queries mot senaste N dagarna → lit_intake.
// Metadata + DOI-utlänk (fritt); is_oa markeras (CC BY/OA får visas fylligare). Rå-intag, ej kanon.
// Kör: node scripts/data/ingest-lit-openalex.mjs [dagar]
import fs from 'fs'; import pg from 'pg';
const env = Object.fromEntries(fs.readFileSync('.env','utf8').split('\n').filter(l=>l.includes('=')).map(l=>{const i=l.indexOf('=');return [l.slice(0,i).trim(),l.slice(i+1).trim()];}));
const DAYS = parseInt(process.argv[2]||'60',10);
const since = new Date(Date.now()-DAYS*864e5).toISOString().slice(0,10);
const MAIL = 'daniel.larsson@expandtalk.se';
const c = new pg.Client({host:'aws-0-eu-north-1.pooler.supabase.com',port:5432,user:'postgres.mnuifmcjspeaauzehasj',password:env.SUPABASE_DB_PASSWORD,database:'postgres',ssl:{rejectUnauthorized:false}});
await c.connect();
const journals = new Set((await c.query(`select lower(name) n from lit_journals`)).rows.map(r=>r.n));
const queries = (await c.query(`select query, label from lit_queries where active`)).rows;
const abstractOf = (inv) => { if(!inv) return null; const a=[]; for(const [w,ps] of Object.entries(inv)) for(const p of ps) a[p]=w; return a.join(' ').slice(0,1500); };
let ins=0, seen=0;
for (const q of queries) {
  const u = `https://api.openalex.org/works?search=${encodeURIComponent(q.query)}&filter=from_publication_date:${since}&per-page=25&mailto=${MAIL}`;
  let d; try { const r=await fetch(u,{headers:{'User-Agent':'VikingAgeResearch/1.0 ('+MAIL+')'}}); if(!r.ok){console.log('  ✗',q.label,r.status);continue;} d=await r.json(); } catch(e){ console.log('  ✗',q.label,e.message); continue; }
  for (const w of (d.results||[])) {
    seen++;
    const journal = w.primary_location?.source?.display_name || null;
    const authors = (w.authorships||[]).slice(0,6).map(a=>a.author?.display_name).filter(Boolean).join(', ');
    const concepts = (w.concepts||[]).filter(x=>x.score>0.3).slice(0,6).map(x=>x.display_name);
    const doi = w.doi ? w.doi.replace('https://doi.org/','') : null;
    let rel = w.relevance_score || 0;
    if (journal && journals.has(journal.toLowerCase())) rel += 50; // boost bevakade tidskrifter
    const res = await c.query(`insert into lit_intake (source,ext_id,doi,title,authors,journal,publication_date,url,oa_url,is_oa,abstract,concepts,matched_query,relevance)
      values ('openalex',$1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
      on conflict (source,ext_id) do nothing`,
      [w.id, doi, (w.title||w.display_name||'').slice(0,500), authors, journal, w.publication_date||null,
       w.doi||w.primary_location?.landing_page_url||null, w.best_oa_location?.landing_page_url||w.open_access?.oa_url||null,
       !!w.open_access?.is_oa, abstractOf(w.abstract_inverted_index), concepts, q.label, rel]);
    ins += res.rowCount;
  }
  process.stdout.write(`\r  ${q.label}: klart`);
  await new Promise((r) => setTimeout(r, 400)); // artig mot OpenAlex (undvik 429)
}
console.log(`\nOpenAlex-intag (${since}→): ${seen} sedda, ${ins} nya i lit_intake.`);
console.log('topp bevakade-tidskrift-träffar:', (await c.query(`select journal, title, publication_date from lit_intake where relevance>=50 order by publication_date desc limit 6`)).rows.map(r=>`${r.journal}: ${r.title.slice(0,55)} (${r.publication_date})`).join('\n  '));
console.log('totalt i lit_intake:', (await c.query(`select count(*) n from lit_intake`)).rows[0].n, '| is_oa:', (await c.query(`select count(*) n from lit_intake where is_oa`)).rows[0].n);
await c.end();
