// Titel-/yrkeslager ur runcorpusen → inscription_titles. Disambiguerat: matchar i första hand
// FORNNORDISK normalisering (þegn, drengr, bryti, goði…), för de tvetydiga (bryti/goði) ENBART
// normalisering (annars fångas verbet "bryter" och adjektivet "god"). Kör: node scripts/data/ingest-inscription-titles.mjs [--apply]
import pg from 'pg';
import { readFileSync } from 'node:fs';

const APPLY = process.argv.includes('--apply');
// code, label_sv, category, normRe (fornnordiskt), translRe (null = normalisering-ONLY, disambiguering)
const LEX = [
  ['thegn',     'þegn (hederstitel)',        'honorific',    'þegn|tegn',        'thegn|tegn|thane'],
  ['drengr',    'drengr/dräng (ung krigare)','honorific',    'drengr|dræng',     'dreng'],
  ['jarl',      'jarl',                      'rank',         '\\yjarl',          'jarl|earl'],
  ['konungr',   'konungr (kung)',            'rank',         'konungr|kunung',   null],
  ['hersir',    'hersir (hövding)',          'rank',         'hersir',           null],
  ['smidr',     'smiðr (smed)',              'craft',        'smiðr',            'smith'],
  ['steinsmidr','steinsmiðr (stenmästare)',  'craft',        'steinsmið',        'stonemason|stone-?mason'],
  ['gildi',     'gildi (gillesbroder)',      'guild',        'gildi|félag',      'guild-?brother'],
  ['styrimadr', 'stýrimaðr (styrman)',       'naval',        'stýrimað|styrima', 'helmsman'],
  ['skipari',   'skipari (skeppskarl)',      'naval',        'skipari',          'shipmate'],
  ['bryti',     'bryti (godsförvaltare)',    'administrative','bryti',           null],  // disambiguering: EJ "bryter"
  ['odal',      'óðal/hauldr (självägande)', 'landholding',  'óðal|hauldr|hauld','allodial'],
  ['landbo',    'landbo (arrendator)',       'landholding',  'landbo',           null],
  ['thrall',    'þræll (träl/slav)',         'servile',      'þræl',             'thrall'],
  ['ambatt',    'ambátt (trälkvinna)',       'servile',      'ambátt|ambat',     null],
  ['godi',      'goði (kultledare)',         'cultic',       'goði',             null],  // disambiguering: EJ "god/goda"
];

const env = Object.fromEntries(readFileSync('./.env','utf8').split(/\r?\n/).filter(l=>l&&!l.startsWith('#')&&l.includes('=')).map(l=>{const i=l.indexOf('=');return [l.slice(0,i).trim(),l.slice(i+1).trim().replace(/^["']|["']$/g,'')];}));
const c = new pg.Client({ host:'aws-0-eu-north-1.pooler.supabase.com', port:5432, user:'postgres.mnuifmcjspeaauzehasj', password:env.SUPABASE_DB_PASSWORD, database:'postgres', ssl:{rejectUnauthorized:false} });
await c.connect();

const rows = [];
for (const [code, label, cat, normRe, translRe] of LEX) {
  // normalisering-match = certain; översättnings-match = probable (bara om translRe satt)
  const conds = [`coalesce(normalization,'') ~* '${normRe}'`];
  if (translRe) conds.push(`(coalesce(translation_sv,'')||' '||coalesce(translation_en,'')) ~* '${translRe}'`);
  const q = `select id, signum, case when coalesce(normalization,'') ~* '${normRe}' then 'certain' else 'probable' end conf
             from runic_inscriptions where ${conds.join(' or ')}`;
  const res = await c.query(q);
  for (const r of res.rows) rows.push([r.id, r.signum, code, label, cat, r.conf]);
  console.log(`  ${code.padEnd(11)} ${res.rows.length}`);
}
console.log(`Totalt titel-taggningar: ${rows.length} (${new Set(rows.map(r=>r[0])).size} unika inskrifter)`);

if (APPLY && rows.length) {
  for (let i=0;i<rows.length;i+=500) {
    const chunk = rows.slice(i,i+500);
    const vals = chunk.map((_,j)=>`($${j*6+1},$${j*6+2},$${j*6+3},$${j*6+4},$${j*6+5},$${j*6+6},'regex normalisering+översättning')`).join(',');
    await c.query(`insert into inscription_titles (inscription_id, signum, title_code, label_sv, category, confidence, source) values ${vals} on conflict (inscription_id, title_code) do nothing`, chunk.flat());
  }
  console.log(`APPLIED.`);
} else console.log('DRY-RUN — kör med --apply.');
await c.end();
