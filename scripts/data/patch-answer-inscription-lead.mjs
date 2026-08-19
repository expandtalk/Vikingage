// Normalisering: ytar en 'lead' (populärvetenskaplig beskrivning) + 'leadUrl' i entity_answer_context
// för INSKRIFTER (Rökstenen/Karlevistenen visade "tomt" trots att historical_context/translation finns).
// Expanderar hit-CTE:n + lägger lead/leadUrl-utdata. content-page-teaser hanteras separat (page.teaser).
import pg from 'pg';
import fs from 'fs';
const env = Object.fromEntries(fs.readFileSync('.env','utf8').split('\n').filter(l=>l.includes('=')).map(l=>{const i=l.indexOf('=');return [l.slice(0,i).trim(), l.slice(i+1).trim()];}));
const c = new pg.Client({ host:'aws-0-eu-north-1.pooler.supabase.com', port:5432, user:'postgres.mnuifmcjspeaauzehasj', password:env.SUPABASE_DB_PASSWORD, database:'postgres', ssl:{rejectUnauthorized:false} });
await c.connect();
const def0 = (await c.query(`select pg_get_functiondef(p.oid) def from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and p.proname='entity_answer_context' limit 1`)).rows[0].def;
if (def0.includes("'lead',")) { console.log('RPC redan patchad (lead)'); }
else {
  let def = def0.replace(
    'SELECT r.coordinates[1] AS lat, r.coordinates[0] AS lng FROM runic_inscriptions r',
    'SELECT r.coordinates[1] AS lat, r.coordinates[0] AS lng, r.signum, r.historical_context, r.translation_sv FROM runic_inscriptions r');
  def = def.replace(
    `'page', (SELECT jsonb_build_object('slug', slug, 'title', title_sv, 'teaser', teaser_sv, 'teaser_en', teaser_en, 'url', url) FROM page),`,
    `'page', (SELECT jsonb_build_object('slug', slug, 'title', title_sv, 'teaser', teaser_sv, 'teaser_en', teaser_en, 'url', url) FROM page),
  'lead', (SELECT coalesce(nullif(historical_context,''), nullif(translation_sv,'')) FROM hit),
  'leadUrl', (SELECT '/inscription/' || signum FROM hit),`);
  if (!def.includes("'lead',") || !def.includes('r.historical_context, r.translation_sv FROM runic_inscriptions r')) throw new Error('patch-anchor missade');
  await c.query(def);
  console.log('RPC patchad: lead/leadUrl för inskrifter');
}
for (const t of ['Rökstenen','Karlevistenen','Ög 136','Birka']) {
  const r = await c.query(`select left(coalesce((entity_answer_context($1))->>'lead',''),80) lead, (entity_answer_context($1))->>'leadUrl' url, (entity_answer_context($1))->'page'->>'teaser' teaser`, [t]);
  console.log(`${t}: lead=${JSON.stringify(r.rows[0].lead)} url=${r.rows[0].url} teaser=${r.rows[0].teaser?'JA':'nej'}`);
}
await c.end();
