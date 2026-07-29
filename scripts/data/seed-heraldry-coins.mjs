// Koppla heraldik-domänen till coins (Klackenbergs Moneta nostra-fält): attesteringar target='coin'
// mot verkliga myntrader. Idempotent. Kör: node scripts/data/seed-heraldry-coins.mjs [--apply]
// Källkritik: evidence_class ärlig (omtvistad där bara element finns); source flaggad för per-mynt-precisering.
import pg from 'pg'; import { readFileSync } from 'node:fs';
const APPLY = process.argv.includes('--apply');
const env = Object.fromEntries(readFileSync('./.env','utf8').split(/\r?\n/).filter(l=>l&&!l.startsWith('#')&&l.includes('=')).map(l=>{const i=l.indexOf('=');return [l.slice(0,i).trim(),l.slice(i+1).trim().replace(/^["']|["']$/g,'')];}));
const c = new pg.Client({host:'aws-0-eu-north-1.pooler.supabase.com',port:5432,user:'postgres.mnuifmcjspeaauzehasj',password:env.SUPABASE_DB_PASSWORD,database:'postgres',ssl:{rejectUnauthorized:false},statement_timeout:120000});
await c.connect();
const one = async (sql,p) => (await c.query(sql,p)).rows[0];

const coinId  = async n => (await one(`select id from coins where name=$1 limit 1`,[n]))?.id;
const armsId  = async n => (await one(`select arms_id from coats_of_arms where name=$1 limit 1`,[n]))?.arms_id;
const motifId = async n => (await one(`select motif_id from iconographic_motifs where name=$1 limit 1`,[n]))?.motif_id;

try {
  await c.query('BEGIN');
  const SRC_TITLE = 'Numismatisk-heraldisk attribuering (standardlitteratur; att precisera per mynt)';
  const srcRow = (await one(
    `insert into historical_sources (title,title_en,author,reliability,language,kind,rights)
     select $1,$2,'Numismatisk standardlitteratur (sammanställt, att precisera)','secondary','sv','publication','unknown'
     where not exists (select 1 from historical_sources where title=$1)
     returning id`,
    [SRC_TITLE, 'Numismatic-heraldic attribution (standard literature; to be sourced per coin)']))
    ?? await one(`select id from historical_sources where title=$1`,[SRC_TITLE]);
  const src = srcRow.id;

  async function attestCoin(subj, coinName, opts) {
    const target_id = await coinId(coinName);
    if (!target_id) { console.log(`  SAKNAS i coins: "${coinName}" — hoppar`); return false; }
    const where = subj.arms_id ? 'arms_id=$1' : 'motif_id=$1';
    const key = subj.arms_id ?? subj.motif_id;
    if (!key) { console.log(`  motiv/vapen saknas för "${coinName}"`); return false; }
    const dup = await one(`select attestation_id from heraldic_attestations where ${where} and target='coin' and target_id=$2 limit 1`,[key,target_id]);
    if (dup) return false;
    await c.query(
      `insert into heraldic_attestations (motif_id,arms_id,target,target_id,side,evidence_class,start_year,end_year,source_id,notes)
       values ($1,$2,'coin',$3,$4,$5,$6,$7,$8,$9)`,
      [subj.motif_id??null, subj.arms_id??null, target_id, opts.side??null, opts.evidence_class??'belagd',
       opts.start_year??null, opts.end_year??null, src, opts.notes??null]);
    return true;
  }

  const folkung = await armsId('Folkungavapnet (Bjälboätten)');
  const trekron = await armsId('Sveriges lilla riksvapen (Tre kronor)');
  const krona   = await motifId('Krona');

  let n = 0;
  n += await attestCoin({arms_id:folkung}, 'Magnus Ladulås sigill',
    { side:'sigill', evidence_class:'belagd', start_year:1275, end_year:1290,
      notes:'Bjälbokungens sigill bär Folkungalejonet.' });
  n += await attestCoin({arms_id:folkung}, 'Penning, Knut Långe',
    { side:'mynt', evidence_class:'omtvistad', start_year:1229, end_year:1234,
      notes:'Myntet bär tre bjälkar/strängar (ginbalks-elementet); lejonet saknas — attribution till Folkungavapnet är tolkning, ej belägg.' });
  n += await attestCoin({arms_id:trekron}, 'Magnus Erikssons sigill',
    { side:'sigill', evidence_class:'belagd', start_year:1319, end_year:1364,
      notes:'Tre kronor säkert belagt först under Magnus Eriksson (sigill ca 1336).' });
  n += await attestCoin({motif_id:krona}, 'Solidus "Leo Perpetuus" (feb 457)',
    { side:'åtsida', evidence_class:'belagd', start_year:457, end_year:457,
      notes:'Kejsar Leo I:s diadem — förlaga (imitatio imperii) för krona-/diademmotivet som når Norden via solidi och guldbrakteater.' });

  if (APPLY) { await c.query('COMMIT'); console.log(`SEEDED (committed): ${n} mynt-attesteringar.`); }
  else { await c.query('ROLLBACK'); console.log(`DRY RUN (rolled back): ${n} mynt-attesteringar. Kör med --apply.`); }
} catch (e) { await c.query('ROLLBACK'); console.error('FAILED (rolled back):', e.message); process.exitCode = 1; }
finally { await c.end(); }
