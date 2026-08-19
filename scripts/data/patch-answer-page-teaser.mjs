// Ytar content_pages.teaser_sv/en + url i entity_answer_context('...').page så svarssidan kan visa
// en populärvetenskaplig ingress + "läs hela sidan"-länk (systemfel: Birka-svaret saknade text trots
// att /sv/birka har den). String-patch av RPC:n (page-CTE + page-utdata). Idempotent.
import pg from 'pg';
import fs from 'fs';
const env = Object.fromEntries(fs.readFileSync('.env','utf8').split('\n').filter(l=>l.includes('=')).map(l=>{const i=l.indexOf('=');return [l.slice(0,i).trim(), l.slice(i+1).trim()];}));
const c = new pg.Client({ host:'aws-0-eu-north-1.pooler.supabase.com', port:5432, user:'postgres.mnuifmcjspeaauzehasj', password:env.SUPABASE_DB_PASSWORD, database:'postgres', ssl:{rejectUnauthorized:false} });
await c.connect();

const def0 = (await c.query(`select pg_get_functiondef(p.oid) def from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and p.proname='entity_answer_context' limit 1`)).rows[0].def;
if (def0.includes("'teaser', teaser_sv")) { console.log('RPC redan patchad'); }
else {
  let def = def0.replace(
    'SELECT cp.id, cp.slug, cp.title_sv, ST_Y(ST_Centroid(cp.geom)) AS lat, ST_X(ST_Centroid(cp.geom)) AS lng, cp.geom',
    'SELECT cp.id, cp.slug, cp.title_sv, cp.teaser_sv, cp.teaser_en, cp.url, ST_Y(ST_Centroid(cp.geom)) AS lat, ST_X(ST_Centroid(cp.geom)) AS lng, cp.geom');
  def = def.replace(
    `'page', (SELECT jsonb_build_object('slug', slug, 'title', title_sv) FROM page),`,
    `'page', (SELECT jsonb_build_object('slug', slug, 'title', title_sv, 'teaser', teaser_sv, 'teaser_en', teaser_en, 'url', url) FROM page),`);
  if (!def.includes("'teaser', teaser_sv") || !def.includes('cp.teaser_sv, cp.teaser_en, cp.url,')) throw new Error('patch-anchor missade');
  await c.query(def);
  console.log('RPC patchad: page.teaser + url');
}

// Har Birka en teaser? annars skriv en kort, källbelagd ingress (fakta i egna ord).
const b = await c.query(`select id, teaser_sv, url from content_pages where slug='birka' limit 1`);
console.log('Birka teaser_sv:', JSON.stringify(b.rows[0]?.teaser_sv), '| url:', b.rows[0]?.url);
if (b.rows.length && (!b.rows[0].teaser_sv || b.rows[0].teaser_sv.trim().length < 40)) {
  const teaser = 'Birka på ön Björkö i Mälaren var en av Skandinaviens första städer och ett vikingatida handelscentrum ca 750–970. Här möttes fjärrhandel (bl.a. med orienten och Frankerriket), hantverk och tidig kristen mission — Ansgar besökte platsen på 830-talet. Staden är sedan Hjalmar Stolpes utgrävningar (1870-talet) och det moderna Birkaprojektet ett av Nordens mest undersökta fornlämningsområden och är världsarv sedan 1993. Källkritik: dateringar och folkmängd är forskningsuppskattningar.';
  await c.query(`update content_pages set teaser_sv=$2 where id=$1`, [b.rows[0].id, teaser]);
  console.log('Birka teaser tillagd (var tom).');
}
const v = await c.query(`select (entity_answer_context('Birka'))->'page' page`);
console.log('verifiering Birka.page:', JSON.stringify(v.rows[0].page));
await c.end();
