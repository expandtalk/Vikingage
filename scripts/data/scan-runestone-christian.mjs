// Heuristisk skanning: kristna åkallanden (helgon/själabön) + latinska formler i runinskrifter.
// Textfält: normalization (fornnordiska) + translation_sv/en. Latin flaggas som EV. SENARE TILLÄGG
// (jfr Karlevi Öl 1 där latinord kan vara sekundära) — ej nödvändigtvis inskriftens ursprungsspråk.
// Idempotent. Kör: node scripts/data/scan-runestone-christian.mjs
import pg from 'pg';
import { readFileSync } from 'node:fs';
const env = Object.fromEntries(readFileSync('./.env', 'utf8').split(/\r?\n/).filter((l) => l && !l.startsWith('#') && l.includes('=')).map((l) => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; }));
const c = new pg.Client({ host: 'aws-0-eu-north-1.pooler.supabase.com', port: 5432, user: 'postgres.mnuifmcjspeaauzehasj', password: env.SUPABASE_DB_PASSWORD, database: 'postgres', ssl: { rejectUnauthorized: false } });
await c.connect();
await c.query(`alter table public.runic_inscriptions
  add column if not exists christian_invocation text,
  add column if not exists has_latin boolean not null default false,
  add column if not exists latin_note text`);
await c.query(`update runic_inscriptions set christian_invocation=null, has_latin=false, latin_note=null`); // ren omkörning
const T = `coalesce(normalization,'')||' '||coalesce(translation_sv,'')||' '||coalesce(translation_en,'')`;
const inv = [
  ['Mikael', `${T} ~* '(mikja|mikia|mikael|michael|mikkja)'`],
  ['Maria/Guds moder', `${T} ~* '(guðs mó|guds mo|god''s mother|mother of god|sancta maria|jungfru maria)'`],
  ['Kristr', `${T} ~* '(kristr|krist |christ )' and ${T} !~* 'kristin|kristn'`],
  ['själabön (Gud hjälpe själen)', `${T} ~* '(hjalpi.{0,12}(sal|and)|hjälpe.{0,12}själ|help.{0,12}soul|guð hjalpi|gud hjälpe)'`],
];
for (const [label, cond] of inv) {
  const r = await c.query(`update runic_inscriptions set christian_invocation=case when christian_invocation is null then $1 else christian_invocation||'; '||$1 end where (${cond})`, [label]);
  console.log(`  ${label}: ${r.rowCount}`);
}
const latinRe = `${T} ~* '(hic iacet|requiesc|orate pro|anno domini|pater noster|ave maria|in pace|cuius anima|dominus|amen\\M|\\mpax\\M|obiit)'`;
const rl = await c.query(`update runic_inscriptions set has_latin=true, latin_note='Latinsk formel i texten — kan vara SENARE TILLÄGG (jfr Karlevi Öl 1), ej nödvändigtvis inskriftens ursprungsspråk' where (${latinRe})`);
console.log(`Latin-flaggade: ${rl.rowCount}`);
console.log('Kristna åkallanden totalt:', (await c.query(`select count(*) n from runic_inscriptions where christian_invocation is not null`)).rows[0].n,
  '| kors+åkallan:', (await c.query(`select count(*) n from runic_inscriptions where has_cross and christian_invocation is not null`)).rows[0].n);
await c.end();
