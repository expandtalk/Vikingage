// Stad-lead-fallback i entity_answer_context: rena stadsnamn (Visby) gav center + kartlager men TOM
// ledtext → kändes som "bara en karta" (Daniel). Lägger viking_cities.description + town_formation_profiles.notes
// som lead-fallback (efter hit/exc). Concept-safe: matchar bara exakta ortnamn. Idempotent.
// Kör: node scripts/data/patch-answer-city-lead.mjs   (en riktig content_page supersederar sedan den tunna texten)
import fs from 'fs'; import pg from 'pg';
const env = Object.fromEntries(fs.readFileSync('.env','utf8').split('\n').filter(l=>l.includes('=')).map(l=>{const i=l.indexOf('=');return [l.slice(0,i).trim(),l.slice(i+1).trim()];}));
const c = new pg.Client({ host:'aws-0-eu-north-1.pooler.supabase.com', port:5432, user:'postgres.mnuifmcjspeaauzehasj', password:env.SUPABASE_DB_PASSWORD, database:'postgres', ssl:{rejectUnauthorized:false} });
await c.connect();
let d=(await c.query(`select pg_get_functiondef(oid) d from pg_proc where proname='entity_answer_context'`)).rows[0].d;
const old = `(SELECT description_sv FROM exc)),`;
const neu = `(SELECT description_sv FROM exc), (SELECT nullif(vc.description,'') FROM viking_cities vc WHERE lower(vc.name)=lower(p_name) LIMIT 1), (SELECT nullif(tf.notes,'') FROM town_formation_profiles tf WHERE lower(tf.name)=lower(p_name) AND tf.notes IS NOT NULL LIMIT 1)),`;
if (d.includes('viking_cities vc WHERE lower(vc.name)')) console.log('finns redan');
else if (!d.includes(old)) { console.error('MATCH SAKNAS'); process.exit(1); }
else { await c.query(d.replace(old,neu)); console.log('stad-lead-fallback injicerad'); }
await c.end();
