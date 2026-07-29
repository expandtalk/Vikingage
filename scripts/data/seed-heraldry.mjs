// Heraldik-seed: motiv + kärnvapen + stadsvapenkorpus (Daniels lista) + ontologiregistrering.
// Idempotent (guardar på namn/kod). Kör:  node scripts/data/seed-heraldry.mjs [--apply]
// Utan --apply = dry run (visar vad som skulle skrivas). Källkritik: inga koordinater fabriceras,
// stadssigill-dateringar ur Daniels sammanställning + Nevéus & Kälde, Ny svensk vapenbok (1992).
import pg from 'pg';
import { readFileSync } from 'node:fs';

const APPLY = process.argv.includes('--apply');
const env = Object.fromEntries(
  readFileSync(new URL('../../.env', import.meta.url), 'utf8')
    .split(/\r?\n/).filter(l => l && !l.startsWith('#') && l.includes('='))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; })
);

// Stadssigill/-vapen (Daniels lista). year = exakt år; approx: 'century' → start=sekelstart,end=sekelslut;
// 'ante' → terminus ante quem (senast). note = extra.
const TOWNS = [
  { town: 'Kalmar', year: 1247, note: 'Sveriges äldsta stadsvapen, känt från 1247' },
  { town: 'Skara', year: 1280, note: '1280-tal (äldsta sigill)' },
  { town: 'Stockholm', year: 1280, note: '1280-tal; vapnet (S:t Erik) har ändrat form flera gånger' },
  { town: 'Linköping', year: 1290, note: '1290-tal' },
  { town: 'Söderköping', year: 1290, note: '1290-tal' },
  { town: 'Västerås', year: 1307 },
  { town: 'Skänninge', year: 1310, note: '1310-tal' },
  { town: 'Helsingborg', year: 1310, note: '1310-tal' },
  { town: 'Sigtuna', year: 1311 },
  { town: 'Enköping', year: 1320, note: '1320-tal' },
  { town: 'Arboga', year: 1330, note: '1330-tal' },
  { town: 'Örebro', year: 1331 },
  { town: 'Visby', year: 1340, note: '1340-tal' },
  { town: 'Lund', year: 1350, note: '1350-tal' },
  { town: 'Norrköping', year: 1367 },
  { town: 'Jönköping', year: 1370, note: '1370-tal' },
  { town: 'Lödöse', year: 1374, note: 'Lödöse kommuns vapen numera Lilla Edets kommunvapen' },
  { town: 'Köping', year: 1378 },
  { town: 'Trosa', year: 1383 },
  { town: 'Södertälje', year: 1386 },
  { town: 'Laholm', approx: 'century', century: 1300 },
  { town: 'Torshälla', approx: 'century', century: 1300 },
  { town: 'Uppsala', approx: 'century', century: 1300 },
  { town: 'Ystad', approx: 'century', century: 1300 },
  { town: 'Landskrona', year: 1410, note: '1410-tal' },
  { town: 'Vadstena', year: 1410, note: '1410-tal' },
  { town: 'Malmö', year: 1437, note: 'Vapenbrev' },
  { town: 'Eksjö', year: 1439 },
  { town: 'Falköping', year: 1440, note: '1440-tal' },
  { town: 'Trelleborg', year: 1471 },
  { town: 'Ulricehamn', year: 1480, note: 'Bogesund t.o.m. 1700-tal (då namn- + vapenbyte); idén densamma — namnets initial krönt', approx: 'centuryish' },
  { town: 'Lidköping', year: 1505 },
  { town: 'Staffanstorp', year: 1524 },
  { town: 'Skövde', approx: 'century', century: 1400 },
  { town: 'Växjö', approx: 'century', century: 1400 },
  { town: 'Sölvesborg', approx: 'ante', year: 1535, note: 'senast 1535' },
  { town: 'Varberg', approx: 'ante', year: 1536, note: 'senast 1536' },
];

const client = new pg.Client({
  host: 'aws-0-eu-north-1.pooler.supabase.com', port: 5432,
  user: 'postgres.mnuifmcjspeaauzehasj', password: env.SUPABASE_DB_PASSWORD,
  database: 'postgres', ssl: { rejectUnauthorized: false }, statement_timeout: 300000,
});
await client.connect();

const q = (sql, params) => client.query(sql, params);
// upsert-by-name helpers: returnerar id, skapar bara om namnet saknas
async function source(title, kind, extra = {}) {
  const r = await q(`select id from historical_sources where title=$1 limit 1`, [title]);
  if (r.rows[0]) return r.rows[0].id;
  const ins = await q(
    `insert into historical_sources (title, title_en, author, reliability, language, kind, url)
     values ($1,$2,$3,$4,$5,$6,$7) returning id`,
    [title, extra.title_en ?? title, extra.author ?? null, extra.reliability ?? 'secondary', extra.language ?? 'sv', kind, extra.url ?? null]);
  return ins.rows[0].id;
}
async function motif(name, name_en, category, heraldic_term, origin_note, description) {
  const r = await q(`select motif_id from iconographic_motifs where name=$1 limit 1`, [name]);
  if (r.rows[0]) return r.rows[0].motif_id;
  const ins = await q(
    `insert into iconographic_motifs (name,name_en,category,heraldic_term,origin_note,description)
     values ($1,$2,$3,$4,$5,$6) returning motif_id`,
    [name, name_en, category, heraldic_term, origin_note, description]);
  await q(`insert into entity_registry (id,entity_type,label) values ($1,'iconographic_motif',$2)
           on conflict (id) do nothing`, [ins.rows[0].motif_id, name]);
  return ins.rows[0].motif_id;
}
async function arms(name, opts = {}) {
  const r = await q(`select arms_id from coats_of_arms where name=$1 limit 1`, [name]);
  if (r.rows[0]) return r.rows[0].arms_id;
  const ins = await q(
    `insert into coats_of_arms (name,name_en,blazon,blazon_en,field_division,marshalling,is_attributed,earliest_year,origin_theories,notes)
     values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) returning arms_id`,
    [name, opts.name_en ?? null, opts.blazon ?? null, opts.blazon_en ?? null, opts.field_division ?? null,
     opts.marshalling ?? null, opts.is_attributed ?? false, opts.earliest_year ?? null,
     opts.origin_theories ?? [], opts.notes ?? null]);
  await q(`insert into entity_registry (id,entity_type,label) values ($1,'coat_of_arms',$2)
           on conflict (id) do nothing`, [ins.rows[0].arms_id, name]);
  return ins.rows[0].arms_id;
}
async function charge(arms_id, motif_id, tincture, field_tincture, ordinary, source_id) {
  await q(`insert into coat_charges (arms_id,motif_id,tincture,field_tincture,ordinary,source_id)
           values ($1,$2,$3,$4,$5,$6) on conflict (arms_id,motif_id,ordinary) do nothing`,
    [arms_id, motif_id, tincture, field_tincture, ordinary, source_id]);
}
async function edge(subject_id, predicate, object_id, confidence, source_ref, qualifiers) {
  const r = await q(`select id from relationship where subject_id=$1 and predicate=$2 and object_id=$3 limit 1`,
    [subject_id, predicate, object_id]);
  if (r.rows[0]) return;
  await q(`insert into relationship (subject_id,predicate,object_id,confidence,source_ref,qualifiers)
           values ($1,$2,$3,$4,$5,$6)`,
    [subject_id, predicate, object_id, confidence ?? null, source_ref ?? null, qualifiers ? JSON.stringify(qualifiers) : null]);
}
async function bearer(arms_id, kind, bearer_name, period_start, source_id, opts = {}) {
  const r = await q(`select id from armorial_bearers where arms_id=$1 and bearer_kind=$2 and bearer_name=$3 limit 1`,
    [arms_id, kind, bearer_name]);
  if (r.rows[0]) return r.rows[0].id;
  const ins = await q(
    `insert into armorial_bearers (arms_id,bearer_kind,bearer_id,bearer_name,period_start,period_end,evidence,source_id,notes)
     values ($1,$2,$3,$4,$5,$6,$7,$8,$9) returning id`,
    [arms_id, kind, opts.bearer_id ?? null, bearer_name, period_start ?? null, opts.period_end ?? null,
     opts.evidence ?? 'belagd', source_id, opts.notes ?? null]);
  return ins.rows[0].id;
}
async function attest(subj, target, opts) {
  // subj = {motif_id} | {arms_id}
  const where = subj.arms_id ? `arms_id=$1` : `motif_id=$1`;
  const key = subj.arms_id ?? subj.motif_id;
  const r = await q(
    `select attestation_id from heraldic_attestations where ${where} and target=$2 and coalesce(target_ref,'')=coalesce($3,'') limit 1`,
    [key, target, opts.target_ref ?? null]);
  if (r.rows[0]) return;
  await q(
    `insert into heraldic_attestations (motif_id,arms_id,target,target_id,target_ref,side,evidence_class,start_year,end_year,source_id,notes)
     values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
    [subj.motif_id ?? null, subj.arms_id ?? null, target, opts.target_id ?? null, opts.target_ref ?? null,
     opts.side ?? null, opts.evidence_class ?? 'belagd', opts.start_year ?? null, opts.end_year ?? null,
     opts.source_id, opts.notes ?? null]);
}

try {
  await q('BEGIN');

  // ---- KÄLLOR ----
  const src_nevaeus = await source('Nevéus, Clara & Kälde, Bengt Olof: Ny svensk vapenbok (1992)', 'publication',
    { author: 'Nevéus, Clara; Kälde, Bengt Olof', reliability: 'primary' });
  const src_adels = await source('Adelsvapen-Wiki (adelsvapen.com) — digitaliserad Elgenstierna, Den introducerade svenska adelns ättartavlor', 'dataset',
    { author: 'Elgenstierna, Gustaf (grund)', url: 'https://www.adelsvapen.com/genealogi/' });

  // ---- MOTIV ----
  const m_lejon = await motif('Lejon', 'Lion', 'djur', 'lejon',
    'Mediterran/främreorientalisk härskarsymbol; Mesopotamien (Ishtar) 3000-tal f.Kr., assyriska lejonjakter, Lejonporten i Mykene ca 1250 f.Kr. Bar 3000 år av kungligt symbolkapital in i heraldiken.',
    'Heraldikens vanligaste djur. Valt av England, Skottland, Danmark, Norge, Flandern, León och Bjälboätten.');
  const m_orn = await motif('Örn', 'Eagle', 'fagel', 'örn',
    'Himmelskoppling (Zeus/Jupiter); hettitisk dubbelörn 1300-tal f.Kr.; Marius gjorde aquila till legionens standar 104 f.Kr. → bysantinsk dubbelörn → Reichsadler → Ryssland/Österrike/Polen. Örn i europeisk heraldik = anspråk på romerskt imperiearv (channel: imperial_claim).',
    null);
  const m_krona = await motif('Krona', 'Crown', 'foremal', 'krona',
    'Antikens diadem/hellenistiska kungaband → Rom/Bysans → medeltidens byglade kronor. Symbol för kunglig värdighet i sig.',
    null);
  const m_korp = await motif('Korp', 'Raven', 'fagel', null,
    'Vikingatida fälttecken (Hrafnsmerki). EJ inhemsk kontinuitet — den nordiska symbolvärlden ärvdes INTE in i heraldiken; riddarkulturens märken importerades söderifrån med kristnandet. Seedas som exempel på BROTTET, ej som heraldisk anfader.',
    'Brott-exempel: dra ALDRIG derives_from korp → heraldiskt motiv.');

  // ---- KÄRNVAPEN ----
  const a_folkung = await arms('Folkungavapnet (Bjälboätten)', {
    name_en: 'Arms of the House of Bjälbo (Folkung)', blazon: 'I blått fält ett lejon över tre ginbalkar, allt av guld',
    earliest_year: 1250, notes: 'Bjälboättens (Folkungaättens) lejonvapen, 1200-tal.' });
  const a_stora = await arms('Sveriges stora riksvapen', {
    name_en: 'Greater coat of arms of Sweden', field_division: 'kvadrerad',
    marshalling: '1:a & 4:e fältet tre kronor; 2:a & 3:e fältet Folkungalejonet (lejon över ginbalkar)',
    notes: 'Folkungalejonet lever kvar i 2:a/3:e fältet. RÄTTELSE: lejonet sitter i STORA riksvapnet, ej i lilla.' });
  const a_lilla = await arms('Sveriges lilla riksvapen (Tre kronor)', {
    name_en: 'Lesser coat of arms of Sweden', blazon: 'I blått fält tre öppna kronor av guld, ordnade två och en',
    earliest_year: 1336,
    origin_theories: ['Heliga tre konungar (Kölnkulten)', 'Magnus Erikssons tre riken (Sverige/Norge/Skåne)', 'Allmän europeisk kunglighetssymbol (bl.a. Arthur-legenden)'],
    notes: 'Säkert belagt först under Magnus Eriksson (sigill ca 1336), etablerat riksvapen under Albrekt av Mecklenburg 1360-tal. Ursprung omtvistat.' });

  // ---- KOMPOSITION (bears_charge) ----
  await charge(a_folkung, m_lejon, 'guld', 'blått', 'lejon över ginbalkar', src_adels);
  await edge(a_folkung, 'bears_charge', m_lejon, 'certain', 'Bjälboättens vapen');
  await charge(a_stora, m_lejon, 'guld', 'blått', 'lejon över ginbalkar (2:a/3:e fältet)', src_nevaeus);
  await charge(a_stora, m_krona, 'guld', 'blått', 'tre kronor (1:a/4:e fältet)', src_nevaeus);
  await edge(a_stora, 'bears_charge', m_lejon, 'certain', 'Stora riksvapnet 2:a/3:e fältet');
  await edge(a_stora, 'bears_charge', m_krona, 'certain', 'Stora riksvapnet 1:a/4:e fältet');
  await charge(a_lilla, m_krona, 'guld', 'blått', 'tre kronor', src_nevaeus);
  await edge(a_lilla, 'bears_charge', m_krona, 'certain', 'Lilla riksvapnet = tre kronor');

  // ---- BÄRARE: Folkungalejonet → Bjälboätten (om dynastin finns) ----
  const dyn = await q(`select id, name from royal_dynasties where name ilike '%bjälbo%' or name ilike '%folkung%' limit 1`);
  if (dyn.rows[0]) {
    await bearer(a_folkung, 'dynasty', dyn.rows[0].name, 1250, src_adels, { bearer_id: dyn.rows[0].id, evidence: 'belagd' });
    await edge(a_folkung, 'borne_by', dyn.rows[0].id, 'certain', 'Bjälboätten förde lejonvapnet');
  }

  // ---- STADSVAPENKORPUS ----
  let n = 0;
  for (const t of TOWNS) {
    let start = null, end = null, evidence = 'belagd', extra = t.note ?? null;
    if (t.approx === 'century') { start = t.century; end = t.century + 99; extra = `${t.century}-tal (exakt år okänt)`; }
    else if (t.approx === 'ante') { end = t.year; extra = t.note ?? `senast ${t.year}`; }  // terminus ante quem
    else { start = t.year; end = t.year; }
    const nm = `${t.town} stadsvapen`;
    const a = await arms(nm, { earliest_year: start, notes: extra });
    await bearer(a, 'town', t.town, start, src_nevaeus, { period_end: null, evidence, notes: extra });
    await attest({ arms_id: a }, 'external', {
      target_ref: `Nevéus & Kälde 1992: ${t.town}`, side: 'sigill', evidence_class: 'belagd',
      start_year: start, end_year: end, source_id: src_nevaeus, notes: extra });
    n++;
  }

  if (APPLY) { await q('COMMIT'); console.log(`SEEDED (committed): ${n} stadsvapen + motiv/kärnvapen/ontologi.`); }
  else { await q('ROLLBACK'); console.log(`DRY RUN (rolled back): skulle seedat ${n} stadsvapen + motiv/kärnvapen/ontologi. Kör med --apply.`); }
} catch (e) {
  await q('ROLLBACK'); console.error('FAILED (rolled back):', e.message); process.exitCode = 1;
} finally {
  await client.end();
}
