// BBR-ingest — strukturerad byggnadshistorik per kyrka ur Bebyggelseregistret (RAÄ) via K-samsök.
// Motor för "uppdatera fler kyrkor": nycklad på BYGGNADEN (BBR-id), inte socknen → undviker boplats-bruset
// som fällde Fas II (K-samsök arkiv-dokument). K-samsök stannar för utgrävningar; BBR = byggnadshistorik.
//
// Flöde per kyrka:
//   1. slå upp kyrkan i ecclesiastical_sites (id, namn, parish, county, landscape)
//   2. K-samsök: itemType="byggnad" and text="<namn>" → kandidat-BBR-objekt
//   3. matcha rätt byggnad (namn-token + geografi) → BBR-id
//   4. hämta objektets RDF (kulturarvsdata.se/raa/bbr/<id>) → parsa ns5:Context-event
//      (contextLabel + fromTime/toTime + ev. ns7:fullName=arkitekt)
//   5. upsert i church_datings (dedup via unik-index)
//
// COPYRIGHT: bara FAKTA (händelse, datum, arkitekt, BBR-id + länk). Ingen brödtext lyft.
//
// Användning:
//   node scripts/data/ingest-bbr-church-history.mjs [--names "Skara domkyrka,Hossmo kyrka,..."] [--apply]
//                                                    [--max-cand N] [--sleep MS]
//   default = dry-run (skriver inget); default names = pilotlistan nedan.

import pg from 'pg';
import { readFileSync } from 'node:fs';

const UA = 'VikingAge-research/1.0 (daniel.larsson@expandtalk.se)';
const SRC = 'Riksantikvarieämbetet (BBR)';

const DEFAULT_NAMES = [
  'Skara domkyrka', 'Mariakyrkan Sigtuna', 'Brännkyrka kyrka', 'Hossmo kyrka', 'Dörby kyrka',
  'Kläckeberga kyrka', 'Resmo kyrka', 'Gårdby kyrka',
];

const argv = process.argv.slice(2);
const APPLY = argv.includes('--apply');
const rawNames = (argv.find(a => a.startsWith('--names=')) || '').split('=').slice(1).join('=') ||
  (argv.includes('--names') ? argv[argv.indexOf('--names') + 1] : '');
const NAMES = rawNames.split(',').map(s => s.trim()).filter(Boolean);
const CHURCH_NAMES = NAMES.length ? NAMES : DEFAULT_NAMES;
const MAXCAND = Number((argv.find(a => a.startsWith('--max-cand=')) || '').split('=')[1]) || 12;
const SLEEP = Number((argv.find(a => a.startsWith('--sleep=')) || '').split('=')[1]) || 300;
const ALL = argv.includes('--all');                 // iterera HELA ecclesiastical_sites
const REFRESH = argv.includes('--refresh');          // bearbeta även kyrkor som redan har rader
const LIMIT = Number((argv.find(a => a.startsWith('--limit=')) || '').split('=')[1]) || 0;
const OFFSET = Number((argv.find(a => a.startsWith('--offset=')) || '').split('=')[1]) || 0;

const sleep = ms => new Promise(r => setTimeout(r, ms));
const env = Object.fromEntries(
  readFileSync(new URL('../../.env', import.meta.url), 'utf8')
    .split(/\r?\n/).filter(l => l && !l.startsWith('#') && l.includes('='))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; })
);

const rx1 = (s, re) => { const m = re.exec(s || ''); return m ? m[1].trim() : null; };
const val = n => (n && typeof n === 'object') ? (n['@value'] ?? n['@id'] ?? null) : (n ?? null);
const norm = s => (s || '').toLowerCase().normalize('NFC').replace(/[^a-zåäö0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();

// ---- K-samsök sök (JSON) ----
async function ksamsok(cql, hits) {
  const url = `https://kulturarvsdata.se/ksamsok/api?method=search&version=1.1&hitsPerPage=${hits}&startRecord=1&query=${encodeURIComponent(cql)}`;
  for (let a = 0; a < 4; a++) {
    try {
      const r = await fetch(url, { headers: { 'User-Agent': UA, 'Accept': 'application/json' } });
      if (r.status === 200) return r.json();
      if (r.status === 429 || r.status >= 500) { await sleep(1500 * (a + 1)); continue; }
      return null;
    } catch { await sleep(1000 * (a + 1)); }
  }
  return null;
}

// ---- hämta BBR-objektets RDF ----
async function bbrRdf(uri) {
  for (let a = 0; a < 4; a++) {
    try {
      const r = await fetch(uri, { headers: { 'User-Agent': UA, 'Accept': 'application/rdf+xml' } });
      if (r.status === 200) return r.text();
      if (r.status === 429 || r.status >= 500) { await sleep(1500 * (a + 1)); continue; }
      return null;
    } catch { await sleep(1000 * (a + 1)); }
  }
  return null;
}

// ---- normalisera händelse ----
const KNOWN_PARTS = ['Torn', 'Sakristia', 'Vapenhus', 'Korparti', 'Kor', 'Långhus', 'Absid', 'Gravkor', 'Läktare', 'Orgel', 'Altare', 'Predikstol', 'Dopfunt'];
function eventTypeOf(label) {
  const t = (label || '').toLowerCase();
  if (/nybyggnad/.test(t)) return 'nybyggnad';
  if (/tillbyggnad/.test(t)) return 'tillbyggnad';
  if (/ombyggnad|ändring/.test(t)) return 'ombyggnad';
  if (/\bbrand\b/.test(t)) return 'brand';
  if (/valvslagning|valv/.test(t)) return 'valvslagning';
  if (/inredning|inventarier|orgel|altar|predikstol|läktare|dopfunt|bänk/.test(t)) return 'inredning';
  if (/rivning|riven/.test(t)) return 'rivning';
  return 'other';
}
function partOf(label) {
  for (const p of KNOWN_PARTS) if (new RegExp(`-\\s*${p}\\b`, 'i').test(label || '')) return p;
  return null;
}
const yearOf = d => { const m = /^(\d{4})/.exec(d || ''); return m ? +m[1] : null; };

// ---- parsa byggnadshändelser ur RDF ----
// Endast BBR:s KONTROLLERADE händelsevokabulär — INTE fritext-"händelse"/historik (som dessutom är
// upphovsrättslig brödtext). Så "Kyrkan byggs"/hela historik-stycken faller bort; Nybyggnad/Ändring/
// Brand/Valvslagning/inredning/rivning med datum behålls.
const STRUCT_EVENT = /^(nybyggnad|ändring|om- eller tillbyggnad|tillbyggnad|ombyggnad|brand|valvslagning|fast inredning|specifika inventarier|rivning|restaurering|underhåll)\b/;
function parseEvents(rdf, uri) {
  const out = [];
  const blocks = String(rdf || '').split('<ns5:Context>').slice(1).map(s => s.split('</ns5:Context>')[0]);
  for (const b of blocks) {
    const label = rx1(b, /<ns5:contextLabel>([^<]*)<\/ns5:contextLabel>/);
    if (!label || !STRUCT_EVENT.test(label.toLowerCase())) continue;   // narrativ historik → hoppa
    const from = rx1(b, /<ns5:fromTime>([^<]*)<\/ns5:fromTime>/);
    const to = rx1(b, /<ns5:toTime>([^<]*)<\/ns5:toTime>/);
    if (!from && !to) continue;                       // ej ett daterat event → hoppa
    const isArch = /<ns7:title>Arkitekt<\/ns7:title>/.test(b);
    const architect = isArch ? rx1(b, /<ns7:fullName>([^<]*)<\/ns7:fullName>/) : null;
    out.push({
      event_label: label, event_type: eventTypeOf(label), building_part: partOf(label),
      date_from: from || null, date_to: to || null, year_from: yearOf(from), year_to: yearOf(to),
      architect: architect || null, source_uri: uri,
    });
  }
  // dedup inom objektet (label+from+to)
  const seen = new Set();
  return out.filter(e => { const k = `${e.event_label}|${e.date_from}|${e.date_to}`; if (seen.has(k)) return false; seen.add(k); return true; });
}

// ---- matcha rätt BBR-byggnad mot kyrkan ----
function pickBbr(records, church) {
  const base = norm(church.name).split(' ').filter(w => !['kyrka', 'kyrkan', 'domkyrka', 'domkyrkan', 'klosterkyrka', 'kloster', 'kapell'].includes(w)).sort((a, b) => b.length - a.length)[0] || '';
  const place = norm([church.parish, church.municipality, church.county, church.landscape].filter(Boolean).join(' '));
  const cands = [];
  for (const r of records) {
    const graph = r.record?.['@graph'] || [];
    const top = graph.find(n => String(n['@id'] || '').includes('/raa/bbr/') && n['ns5:itemLabel']);
    if (!top) continue;
    const uri = String(top['@id']);
    const label = norm(val(top['ns5:itemLabel']));
    const presVal = top['ns5:presentation'] ? (top['ns5:presentation']['@value'] ?? val(top['ns5:presentation'])) : '';
    const placeLabel = rx1(String(presVal || ''), /<pres:placeLabel>([^<]*)<\/pres:placeLabel>/);
    const pl = norm(placeLabel);
    let score = 0;
    if (base && label.includes(base)) score += 3;
    if (/\bkyrka|domkyrka|klosterkyrka|kapell\b/.test(label)) score += 1;
    if (base && place && (pl.includes(base) || place.split(' ').some(w => w.length > 3 && pl.includes(w)))) score += 2;
    if (score >= 4) cands.push({ uri, label, placeLabel, score });
  }
  cands.sort((a, b) => b.score - a.score);
  return cands;   // alla matchande poster (anläggning + byggnadsdelar) — event slås ihop i main
}

async function main() {
  const client = new pg.Client({
    host: 'aws-0-eu-north-1.pooler.supabase.com', port: 5432,
    user: 'postgres.mnuifmcjspeaauzehasj', password: env.SUPABASE_DB_PASSWORD, database: 'postgres',
    ssl: { rejectUnauthorized: false }, statement_timeout: 300000,
  });
  await client.connect();
  try {
    // Kyrkolista: --all = hela ecclesiastical_sites (m. --limit/--offset); annars namnlistan.
    let churches = [];
    if (ALL) {
      // Exkludera redan gjorda kyrkor på SQL-nivå (om ej --refresh) → varje batch plockar nästa
      // ogjorda; batch-drivern kan köra om skriptet med färsk anslutning tills 0 kvarstår.
      const skipDone = REFRESH ? '' : 'AND id NOT IN (SELECT church_id FROM church_datings)';
      const q = `SELECT id,name,parish,municipality,county,landscape FROM ecclesiastical_sites
                 WHERE lat IS NOT NULL AND name IS NOT NULL ${skipDone} ORDER BY name OFFSET ${OFFSET}${LIMIT ? ` LIMIT ${LIMIT}` : ''}`;
      churches = (await client.query(q)).rows;
    } else {
      for (const cname of CHURCH_NAMES) {
        const cr = await client.query(`SELECT id,name,parish,municipality,county,landscape FROM ecclesiastical_sites WHERE lower(name)=lower($1) LIMIT 1`, [cname]);
        if (cr.rows[0]) churches.push(cr.rows[0]); else console.log(`  ⚠ ${cname}: saknas i ecclesiastical_sites`);
      }
    }
    // Resume: hoppa kyrkor som redan har rader (om ej --refresh) → jobbet är återstartbart.
    const done = new Set();
    if (!REFRESH) for (const r of (await client.query(`SELECT DISTINCT church_id FROM church_datings`)).rows) done.add(r.church_id);
    console.log(`Kyrkor: ${churches.length} | Läge: ${APPLY ? 'APPLY' : 'DRY-RUN'} | hoppar redan gjorda: ${done.size}\n`);

    let evTotal = 0, churchesOk = 0, processed = 0, skipped = 0, errors = 0;
    for (const church of churches) {
      processed++;
      if (!REFRESH && done.has(church.id)) { skipped++; continue; }
      try {
      const j = await ksamsok(`itemType="byggnad" and text="${church.name}"`, MAXCAND);
      const recs = j?.result?.records || [];
      const cands = pickBbr(recs, church).slice(0, 5);
      if (!cands.length) { if (!ALL) console.log(`  ✗ ${church.name}: ingen matchande BBR-post`); await sleep(SLEEP); continue; }
      // BBR-modell: anläggning (kyrkomiljö) hasPart byggnad(er); de rika eventen (arkitekt/faser)
      // bor på BYGGNADS-posterna. Följ hasPart en nivå så vi når dem även när sökningen bara gav
      // anläggningen. Kö med dedup + tak, så det inte skenar.
      const merged = []; const seen = new Set();
      const toFetch = cands.map(c => c.uri); const fetched = new Set();
      for (let i = 0; i < toFetch.length && fetched.size < 12; i++) {
        const uri = toFetch[i];
        if (fetched.has(uri) || !uri.includes('/raa/bbr/')) continue;
        fetched.add(uri);
        const rdf = await bbrRdf(uri);
        for (const m of String(rdf || '').matchAll(/<ns5:hasPart[^>]*rdf:resource="([^"]+)"/g)) {
          const p = m[1];
          if (p.includes('/raa/bbr/') && !fetched.has(p) && !toFetch.includes(p)) toFetch.push(p);
        }
        const lic = rx1(String(rdf || ''), /<ns5:itemLicenseUrl[^>]*rdf:resource="([^"]+)"/) || rx1(String(rdf || ''), /<ns5:itemLicenseUrl[^>]*>([^<]+)</);
        for (const e of parseEvents(rdf, uri)) {
          const k = `${e.event_label}|${e.date_from}|${e.date_to}`;
          if (seen.has(k)) continue;
          seen.add(k); e.license = lic; merged.push(e);
        }
        await sleep(SLEEP);
      }
      merged.sort((a, b) => (a.year_from || 9999) - (b.year_from || 9999));
      if (merged.length) churchesOk++;
      if (!ALL) {
        const place = (cands[0].placeLabel || '?').replace(/\s+/g, ' ').trim();
        console.log(`  ${church.name} (${place}): ${merged.length} strukturerade händelser ur ${fetched.size} BBR-poster`);
        merged.slice(0, 12).forEach(e => console.log(`     · ${e.year_from || '?'}${e.year_to && e.year_to !== e.year_from ? '–' + e.year_to : ''} [${e.event_type}]${e.building_part ? ' ' + e.building_part : ''} ${e.event_label}${e.architect ? '  · ' + e.architect : ''}`));
      } else if (merged.length) {
        console.log(`  ✓ ${church.name}: ${merged.length}`);
      }

      if (APPLY) {
        for (const e of merged) {
          const bbrId = String(e.source_uri).replace('http://kulturarvsdata.se/', '');
          await client.query(
            `INSERT INTO church_datings
               (church_id,church_name,event_label,event_type,building_part,date_from,date_to,year_from,year_to,architect,bbr_id,source_uri,source_institution,license,verification_status)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,'verified')
             ON CONFLICT (church_id, event_label, (COALESCE(date_from, DATE '0001-01-01')), (COALESCE(date_to, DATE '0001-01-01')))
             DO UPDATE SET event_type=EXCLUDED.event_type, building_part=EXCLUDED.building_part,
               architect=EXCLUDED.architect, bbr_id=EXCLUDED.bbr_id, year_from=EXCLUDED.year_from,
               year_to=EXCLUDED.year_to, updated_at=now()`,
            [church.id, church.name, e.event_label, e.event_type, e.building_part, e.date_from, e.date_to,
             e.year_from, e.year_to, e.architect, bbrId, e.source_uri, SRC, e.license]);
          evTotal++;
        }
      } else { evTotal += merged.length; }
      } catch (e) { errors++; console.log(`  ! ${church.name}: fel — ${String((e && e.message) || e).slice(0, 140)}`); }
      if (ALL && processed % 50 === 0) console.log(`   … ${processed}/${churches.length} · m.event ${churchesOk} · event ${evTotal} · fel ${errors}`);
      await sleep(SLEEP);
    }
    console.log(`\n=== ${APPLY ? 'APPLY klar' : 'DRY-RUN'} === bearbetade ${processed} (hoppade ${skipped}), kyrkor m. händelser ${churchesOk}, händelser ${APPLY ? 'skrivna' : 'funna'} ${evTotal}, fel ${errors}`);
    if (!APPLY) console.log('Kör med --apply för att skriva.');
  } finally { await client.end(); }
}
main().catch(e => { console.error(e); process.exit(1); });
