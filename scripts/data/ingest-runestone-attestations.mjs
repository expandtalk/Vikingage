// PRE-1000/PRE-1100-lager: sätt ÄLDSTA BELÄGG på place_names ur RUNINSKRIFTER som NÄMNER orten
// (tidigast-över-källor). Drivs av runolog-agentens KÄLLKRITISKA förslag (människa-i-loopen) men med
// egna GISSNINGS-VAKTER — inget skrivs som inte maskinellt verifierats:
//   (1) inskriften finns, dating_taq <= 1100;
//   (2) toponymen (modernt namn ELLER runform, foldad) står FAKTISKT i normalization/translation_sv;
//   (3) en place_names-rad med EXAKT det moderna namnet ligger inom MAXKM km av stenen.
// Först då: earliest_attestation_year = LEAST(befintligt, dating_taq); attested_form = runform;
// attestation_source = 'Runinskrift {signum}, {dating_text}' — men BARA där runstenen är tidigast-eller-lika.
//
// Förslagsfil (pipe-separerad, en rad per (inskrift,ort); '#'/tom = hoppa):
//   signum | tpq | taq | runform | modernt_namn | lat | lng | konfidens | motivering
//
// Användning:  node scripts/data/ingest-runestone-attestations.mjs <förslag.txt> [--apply] [--maxkm N]
//   default = dry-run. --maxkm default 50. Endast konfidens hög/medel skrivs.
import pg from 'pg';
import { readFileSync } from 'node:fs';

const argv = process.argv.slice(2);
const FILE = argv.find(a => !a.startsWith('--'));
const APPLY = argv.includes('--apply');
const MAXKM = Number((argv.find(a => a.startsWith('--maxkm=')) || '').split('=')[1]) ||
              (argv.includes('--maxkm') ? Number(argv[argv.indexOf('--maxkm') + 1]) : 50);
if (!FILE) { console.log('Ange förslagsfil. node ingest-runestone-attestations.mjs <fil> [--apply]'); process.exit(1); }

const env = Object.fromEntries(
  readFileSync(new URL('../../.env', import.meta.url), 'utf8')
    .split(/\r?\n/).filter(l => l && !l.startsWith('#') && l.includes('='))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; })
);
const fold = s => (s || '').toLowerCase().normalize('NFC').replace(/[̀-ͯ]/g, '').replace(/[þ]/g, 'th').replace(/[ǫøö]/g, 'o').replace(/[æä]/g, 'a').replace(/[å]/g, 'a').replace(/\s+/g, ' ').trim();
const haversine = (a, b, c, d) => { const R = 6371, t = x => x * Math.PI / 180, dLa = t(c - a), dLo = t(d - b); const h = Math.sin(dLa / 2) ** 2 + Math.cos(t(a)) * Math.cos(t(c)) * Math.sin(dLo / 2) ** 2; return 2 * R * Math.asin(Math.sqrt(h)); };

function parseProposals(txt) {
  const out = [];
  for (const raw of txt.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith('#') || line.startsWith('signum')) continue;
    const p = line.split('|').map(s => s.trim());
    if (p.length < 8) continue;
    const [signum, tpq, taq, runform, modern, lat, lng, konf] = p;
    if (!signum || !modern || !/hög|hog|medel/i.test(konf)) continue;
    out.push({ signum, tpq: Number(tpq) || null, taq: Number(taq) || null, runform, modern,
      lat: Number(lat), lng: Number(lng), konf });
  }
  return out;
}

async function main() {
  const proposals = parseProposals(readFileSync(FILE, 'utf8'));
  console.log(`${proposals.length} förslag (konfidens hög/medel) att verifiera. ${APPLY ? 'APPLY' : 'DRY'} (maxkm ${MAXKM}).`);
  const client = new pg.Client({ host: 'aws-0-eu-north-1.pooler.supabase.com', port: 5432,
    user: 'postgres.mnuifmcjspeaauzehasj', password: env.SUPABASE_DB_PASSWORD, database: 'postgres',
    ssl: { rejectUnauthorized: false }, statement_timeout: 300000 });
  await client.connect();
  let written = 0, skipped = 0;
  try {
    for (const r of proposals) {
      // (1) inskriften finns + text + dating.
      const insc = (await client.query(
        `select signum, normalization, translation_sv, dating_taq, dating_text,
                coalesce((coordinates)[1], null) as lat, coalesce((coordinates)[0], null) as lng
         from runic_inscriptions where signum = $1 limit 1`, [r.signum])).rows[0];
      if (!insc) { console.log(`  SKIP ${r.signum}: inskrift saknas`); skipped++; continue; }
      const taq = insc.dating_taq ?? r.taq;
      if (!taq || taq > 1100) { console.log(`  SKIP ${r.signum}: dating_taq ${taq} (ej <=1100)`); skipped++; continue; }

      // (2) toponymen står FAKTISKT i texten (modern ELLER runform, foldad).
      const hay = fold((insc.normalization || '') + ' ' + (insc.translation_sv || ''));
      const needleM = fold(r.modern), needleR = fold(r.runform);
      const inText = (needleM && hay.includes(needleM)) || (needleR && needleR.length >= 3 && hay.includes(needleR));
      if (!inText) { console.log(`  SKIP ${r.signum}: "${r.modern}"/"${r.runform}" ej i texten (gissnings-vakt)`); skipped++; continue; }

      // (3) place_names-rad med exakt modernt namn nära stenen.
      const slat = insc.lat ?? r.lat, slng = insc.lng ?? r.lng;
      const cands = (await client.query(
        `select id, name, lat, lng, earliest_attestation_year from place_names
         where lower(name) = lower($1) and lat is not null`, [r.modern])).rows;
      let best = null;
      for (const c of cands) {
        if (slat == null || slng == null) { best = best || { ...c, km: null }; continue; }
        const km = haversine(slat, slng, +c.lat, +c.lng);
        if (km <= MAXKM && (!best || best.km == null || km < best.km)) best = { ...c, km };
      }
      if (!best) { console.log(`  SKIP ${r.signum}: ingen place_names "${r.modern}" inom ${MAXKM} km`); skipped++; continue; }

      const src = `Runinskrift ${insc.signum}${insc.dating_text ? ', ' + insc.dating_text : ''} — ortnamn i inskriften (${r.runform})`;
      console.log(`  OK  ${r.signum} (taq ${taq}) → ${best.name} @ ${best.km == null ? '?' : Math.round(best.km)} km  [bef. ${best.earliest_attestation_year ?? '—'}]  ${r.konf}`);
      if (APPLY) {
        const res = await client.query(
          `update place_names set
             attested_form = case when coalesce(earliest_attestation_year, 9999) >= $2 then $3 else attested_form end,
             attestation_source = case when coalesce(earliest_attestation_year, 9999) >= $2 then $4 else attestation_source end,
             earliest_attestation_year = least(coalesce(earliest_attestation_year, 9999), $2),
             updated_at = now()
           where id = $1`,
          [best.id, taq, r.runform || null, src]);
        written += res.rowCount;
      }
    }
    console.log(`\n=== ${APPLY ? 'skrivna' : 'skulle skriva'}: ${written} · hoppade: ${skipped} ===`);
  } finally { await client.end(); }
}
main().catch(e => { console.error(e); process.exit(1); });
