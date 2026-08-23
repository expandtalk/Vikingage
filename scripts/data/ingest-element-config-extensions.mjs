// Utökar ortnamnsled-katalogen `ortnamn_element_config` ur filolog-agentens KÄLLCITERADE förslag
// (människa-i-loopen). NYA led INSERT:as (on conflict do nothing — rör aldrig befintliga); OMKATEGORI-
// SERINGAR (is_new=nej) UPDATE:ar bara activity_category (+ category) och lägger källa i note — clobbrar
// inget annat fält. INGEN GISSNING: status (belagt/hypotes) + källa skrivs in i note; ingen rad utan källa.
//
// Förslagsfil (pipe): element_key|label|category|strength|forms|language_origin|activity_category|period_stratum|status|is_new|note|källa
//   '#'/tom = hoppa. status=belagt|hypotes. is_new=ja|nej.
//
// Användning:  node scripts/data/ingest-element-config-extensions.mjs <fil> [--apply]
import pg from 'pg';
import { readFileSync } from 'node:fs';

const argv = process.argv.slice(2);
const FILE = argv.find(a => !a.startsWith('--'));
const APPLY = argv.includes('--apply');
if (!FILE) { console.log('Ange förslagsfil.'); process.exit(1); }

const env = Object.fromEntries(
  readFileSync(new URL('../../.env', import.meta.url), 'utf8')
    .split(/\r?\n/).filter(l => l && !l.startsWith('#') && l.includes('='))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; })
);
const clean = s => (s == null ? null : String(s).trim() || null);
const VOCAB_LANG = new Set(['pie','proto_norse','old_norse','low_german','latin','sami','finnic','baltic','slavic','unknown']);
const VOCAB_ACT = new Set(['shipbuilding','seafaring','trade','defence','cult','agriculture','administration','communication','topographic','personal_name','flora','fauna','folk_group']);

// match_affix ur forms: leder med '-X' = suffix, 'X-' = prefix; annars either.
function affixOf(forms) {
  const f = (forms || '').toLowerCase();
  const hasSuffix = /(^|[,\s])-\p{L}/u.test(f);
  const hasPrefix = /\p{L}-([,\s]|$)/u.test(f);
  if (hasSuffix && !hasPrefix) return 'suffix';
  if (hasPrefix && !hasSuffix) return 'prefix';
  if (hasSuffix && hasPrefix) return 'either';
  return 'either';
}

function parse(txt) {
  const out = [];
  for (const raw of txt.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith('#') || line.toLowerCase().startsWith('element_key')) continue;
    const p = line.split('|').map(s => s.trim());
    if (p.length < 10) continue;
    const [element_key, label, category, strength, forms, language_origin, activity_category, period_stratum, status, is_new, note, kalla] = p;
    if (!element_key) continue;
    // Vokabulär-vakt: okänt language_origin/activity_category → varna men behåll (fritext-kolumn).
    const warn = [];
    if (language_origin && !VOCAB_LANG.has(language_origin)) warn.push(`lang?${language_origin}`);
    if (activity_category && !VOCAB_ACT.has(activity_category)) warn.push(`act?${activity_category}`);
    out.push({ element_key, label, category, strength, forms, language_origin, activity_category,
      period_stratum, status: (status||'').toLowerCase(), is_new: /^ja/i.test(is_new||''),
      note, kalla, warn });
  }
  return out;
}

async function main() {
  const rows = parse(readFileSync(FILE, 'utf8'));
  console.log(`${rows.length} förslag. ${APPLY ? 'APPLY' : 'DRY'}.`);
  const client = new pg.Client({ host: 'aws-0-eu-north-1.pooler.supabase.com', port: 5432,
    user: 'postgres.mnuifmcjspeaauzehasj', password: env.SUPABASE_DB_PASSWORD, database: 'postgres',
    ssl: { rejectUnauthorized: false }, statement_timeout: 300000 });
  await client.connect();
  let ins = 0, upd = 0, skip = 0;
  try {
    for (const r of rows) {
      const noteFull = clean([r.note, r.kalla ? `Källa: ${r.kalla}` : null, r.status ? `[${r.status}]` : null].filter(Boolean).join(' | '));
      if (r.is_new) {
        // NYTT led: insert, rör aldrig befintligt (on conflict do nothing). include=false (icke-kult).
        console.log(`  NY  ${r.element_key.padEnd(10)} ${r.activity_category||'—'}/${r.language_origin||'—'} ${r.warn.length?'⚠'+r.warn.join(','):''}`);
        if (APPLY) {
          const res = await client.query(
            `insert into public.ortnamn_element_config
               (element_key,label,category,strength,include,forms,owner,note,period_stratum,language_origin,activity_category,match_affix)
             values ($1,$2,$3,$4,false,$5,'gemensam',$6,$7,$8,$9,$10)
             on conflict (element_key) do nothing`,
            [r.element_key, clean(r.label), clean(r.category), clean(r.strength), clean(r.forms),
             noteFull, clean(r.period_stratum), clean(r.language_origin), clean(r.activity_category),
             // Hydronym-substrat matchas som HELNAMN (primärnamn), ej som affix.
             r.category === 'hydronym' ? 'whole' : affixOf(r.forms)]);
          ins += res.rowCount; if (!res.rowCount) { console.log(`      (fanns redan → hoppar)`); }
        }
      } else {
        // OMKATEGORISERING: bara activity_category (+ category om angiven) + note-tillägg. Clobbra inget annat.
        console.log(`  OMK ${r.element_key.padEnd(10)} → activity=${r.activity_category||'—'}`);
        if (APPLY) {
          const res = await client.query(
            `update public.ortnamn_element_config set
               activity_category = coalesce($2, activity_category),
               category = coalesce($3, category),
               note = case when note is null or note='' then $4 else note || ' | ' || $4 end,
               updated_at = now()
             where element_key = $1`,
            [r.element_key, clean(r.activity_category), clean(r.category), noteFull]);
          upd += res.rowCount; if (!res.rowCount) { console.log(`      (element_key saknas → hoppar)`); skip++; }
        }
      }
    }
    console.log(`\n=== ${APPLY ? `insatta ${ins}, omkategoriserade ${upd}, hoppade ${skip}` : 'DRY — inget skrivet'} ===`);
  } finally { await client.end(); }
}
main().catch(e => { console.error(e); process.exit(1); });
