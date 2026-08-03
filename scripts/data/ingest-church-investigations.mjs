// Fas ii — Kyrkoundersökningar per kyrka: K-samsök (arkiv-dokument) → archaeological_investigations
//          + länk i church_investigations (ankrat på ecclesiastical_sites).
// Spec: docs/superpowers/specs/2026-08-03-church-investigations-layer-design.md
//
// COPYRIGHT: lagrar BARA rapport-metadata (titel, typ, år, ort) + LÄNK. Ingen rapporttext lyfts.
// NO-GUESSING: what_found lämnas NULL (titeln citeras i source_citation). Relevans avgörs
// konservativt via titelmatch; auto-länkar märks "relevans ej manuellt granskad".
//
// Metod (undviker Brännkyrka/Salem-fällan):
//   - Strippa kyrkans bassnamn ur titeln, testa DÄREFTER om ett fristående kyrkoord finns
//     ("kyrka(n)/kyrkogård/domkyrka/klosterkyrka/kloster"). Så blir "Brännkyrka socken" → parish,
//     "Brännkyrka kyrka" → kyrka.
//   - Uteslut "boplats/grophus ... söder/norr/öster/väster/intill om ... kyrka" (nära, ej kyrkan).
//
// Användning:
//   node scripts/data/ingest-church-investigations.mjs [--names "Skara domkyrka,Hossmo kyrka,..."] [--apply]
//                                                       [--max-per-church N] [--sleep MS]
//   default names = pilotlistan nedan. default = dry-run (skriver inget).

import pg from 'pg';
import { readFileSync } from 'node:fs';

const UA = 'VikingAge-research/1.0 (daniel.larsson@expandtalk.se)';
const SRC = 'Riksantikvarieämbetet (K-samsök)';
const RAP = 'serviceName=arkiv-dokument and ';

const DEFAULT_NAMES = [
  'Skara domkyrka', 'Mariakyrkan Sigtuna', 'Varnhems klosterkyrka', 'Varnhems kloster',
  'Brännkyrka kyrka', 'Salems kyrka', 'Botkyrka kyrka', 'Hossmo kyrka', 'Dörby kyrka',
];

const argv = process.argv.slice(2);
const APPLY = argv.includes('--apply');
const NAMES = ((argv.find(a => a.startsWith('--names=')) || '').split('=').slice(1).join('=') ||
  (argv.includes('--names') ? argv[argv.indexOf('--names') + 1] : '')).split(',').map(s => s.trim()).filter(Boolean);
const CHURCH_NAMES = NAMES.length ? NAMES : DEFAULT_NAMES;
const MAXPC = Number((argv.find(a => a.startsWith('--max-per-church=')) || '').split('=')[1]) || 60;
const SLEEP = Number((argv.find(a => a.startsWith('--sleep=')) || '').split('=')[1]) || 300;

const sleep = ms => new Promise(r => setTimeout(r, ms));
const env = Object.fromEntries(
  readFileSync(new URL('../../.env', import.meta.url), 'utf8')
    .split(/\r?\n/).filter(l => l && !l.startsWith('#') && l.includes('='))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; })
);

async function ksamsok(cql, hits, start) {
  const url = `https://kulturarvsdata.se/ksamsok/api?method=search&version=1.1&hitsPerPage=${hits}&startRecord=${start}&query=${encodeURIComponent(cql)}`;
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

const rx = (s, re) => { const m = re.exec(s || ''); return m ? m[1].trim() : null; };
const val = n => (n && typeof n === 'object') ? (n['@value'] ?? n['@id'] ?? null) : (n ?? null);
const arr = n => n == null ? [] : (Array.isArray(n) ? n : [n]);

function typeOf(title) {
  const t = (title || '').toLowerCase();
  if (/schaktövervak/.test(t)) return 'schaktövervakning';
  if (/förundersök/.test(t)) return 'förundersökning';
  if (/antikvarisk kontroll/.test(t)) return 'antikvarisk kontroll';
  if (/särskild utredning|arkeologisk utredning|\butredning\b/.test(t)) return 'utredning';
  if (/slutundersök|särskild undersök|arkeologisk undersök|\bundersökning\b/.test(t)) return 'undersökning';
  if (/inventering/.test(t)) return 'inventering';
  return null;
}
const yr = s => { const m = /(\d{4})/.exec(String(s || '')); const y = m ? +m[1] : null; return (y && y >= 1600 && y <= 2035) ? y : null; };

// Bassnamn ur kyrknamn — TOKENBASERAT (så sockennamn som innehåller "kyrka" ej trasas):
// "Skara domkyrka"→"skara", "Brännkyrka kyrka"→"brännkyrka", "Botkyrka kyrka"→"botkyrka",
// "Varnhems klosterkyrka"→"varnhem", "Mariakyrkan Sigtuna"→"sigtuna", "Hossmo kyrka"→"hossmo".
const CHURCH_TYPE_TOKENS = new Set([
  'domkyrka', 'domkyrkan', 'klosterkyrka', 'klosterkyrkan', 'kyrka', 'kyrkan',
  'kloster', 'klostret', 'kapell', 'kapellet', 'mariakyrkan', 'gamla', 'nya', 'nye',
]);
function baseToken(name) {
  const toks = (name || '').toLowerCase().replace(/[^a-zåäö ]/g, ' ').split(/\s+/).filter(Boolean)
    .filter(w => !CHURCH_TYPE_TOKENS.has(w));
  if (!toks.length) return '';
  // längsta kvarvarande token = ortnamnet; strippa genitiv-s ("varnhems"→"varnhem","salems"→"salem")
  const base = toks.sort((a, b) => b.length - a.length)[0];
  return base.length > 4 && base.endsWith('s') ? base.slice(0, -1) : base;
}

// Relevans: 'church' = handlar om kyrkan/kyrkogården; 'nearby'/'parish_only' = ej kyrkan.
function churchRelevance(title, base) {
  const t = (title || '').toLowerCase();
  if (!base || !t.includes(base)) return 'parish_only';
  // "boplats/grophus ... (söder/norr/...) om ... kyrka" = nära kyrkan, ej kyrkan
  if (/(boplats|grophus|gravf|stensättning|röse)\b/.test(t) &&
      /(söder|norr|öster|väster|nordost|sydost|intill|nära|invid|utanför|vid)\b[^.]*kyrk/.test(t)) return 'nearby';
  // strippa bassnamnet, testa fristående kyrkoord (så "brännkyrka socken" faller bort)
  const stripped = t.split(base).join(' ');
  const churchWord = /\b(kyrkan|kyrkans|kyrka|kyrkogård|kyrkogården|domkyrkan|domkyrka|klosterkyrkan|klosterkyrka|klostret|kloster)\b/.test(stripped);
  if (!churchWord) return 'parish_only';
  return 'church';
}
function findContext(title) {
  const t = (title || '').toLowerCase();
  if (/(under|i|inom)\b[^.]*kyrk|kyrkgolv|under kyrkan/.test(t)) return 'under/i kyrkan';
  if (/kyrkogård/.test(t)) return 'kyrkogård';
  if (/kloster/.test(t)) return 'klosterområde';
  return 'kyrka';
}

async function main() {
  const client = new pg.Client({
    host: 'aws-0-eu-north-1.pooler.supabase.com', port: 5432,
    user: 'postgres.mnuifmcjspeaauzehasj', password: env.SUPABASE_DB_PASSWORD, database: 'postgres',
    ssl: { rejectUnauthorized: false }, statement_timeout: 300000,
  });
  await client.connect();
  try {
    console.log(`Kyrkor: ${CHURCH_NAMES.length} | Läge: ${APPLY ? 'APPLY' : 'DRY-RUN'} | max/kyrka ${MAXPC}\n`);
    let linkedTotal = 0, reportTotal = 0;
    for (const cname of CHURCH_NAMES) {
      const cr = await client.query(
        `SELECT id, name, landscape FROM ecclesiastical_sites WHERE lower(name)=lower($1) LIMIT 1`, [cname]);
      if (!cr.rows[0]) { console.log(`  ⚠ ${cname}: saknas i ecclesiastical_sites — hoppar`); continue; }
      const church = cr.rows[0];
      const base = baseToken(church.name);
      const j = await ksamsok(RAP + `text=${base}`, Math.min(50, MAXPC), 1);
      const recs = j?.result?.records || [];
      const cands = [];
      for (const r of recs) {
        const graph = r.record?.['@graph'] || [];
        const top = graph.find(n => n['ksam:itemLabel']);
        if (!top) continue;
        const uri = String(top['@id'] || '');
        const title = val(top['ksam:itemLabel']);
        if (!uri || !title || /inventeringsbokuppslag/i.test(title)) continue;
        const rel = churchRelevance(title, base);
        if (rel !== 'church') continue;
        const presNode = graph.find(n => n['ksam:presentation']?.['@value']);
        const placeLabel = presNode ? rx(presNode['ksam:presentation']['@value'], /<pres:placeLabel>([^<]*)<\/pres:placeLabel>/) : null;
        cands.push({
          uri, title,
          report_url: val(top['ksam:url']) || uri,
          license: val(top['ksam:itemLicenseUrl']),
          year_from: yr(val(top['ksam:fromTime'])), year_to: yr(val(top['ksam:toTime'])),
          parish: rx(placeLabel, /Socken:\s*([^;]+)/),
          county: rx(placeLabel, /Län:\s*([^;]+)/),
          municipality: rx(placeLabel, /Kommun:\s*([^;]+)/),
          landscape: rx(placeLabel, /Landskap:\s*([^;]+)/),
          investigation_type: typeOf(title),
          find_context: findContext(title),
        });
      }
      console.log(`  ${church.name} [bas="${base}"]: ${cands.length} kyrkoträffar av ${recs.length} dok`);
      cands.slice(0, 6).forEach(c => console.log(`     · [${c.investigation_type || '?'}|${c.find_context}] ${c.title.slice(0, 80)}`));

      if (APPLY) {
        for (const c of cands) {
          const ins = await client.query(
            `INSERT INTO archaeological_investigations
               (title,investigation_type,year_from,year_to,parish,municipality,county,landscape,period,keywords,finds_summary,report_url,source_uri,source_institution,license)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,NULL,'{}',NULL,$9,$10,$11,$12)
             ON CONFLICT (source_uri) DO UPDATE SET title=EXCLUDED.title, updated_at=now()
             RETURNING id`,
            [c.title, c.investigation_type, c.year_from, c.year_to, c.parish, c.municipality, c.county, c.landscape,
             c.report_url, c.uri, SRC, c.license]);
          const invId = ins.rows[0].id;
          const lk = await client.query(
            `INSERT INTO church_investigations
               (church_id,church_name,investigation_id,year_from,year_to,investigation_type,find_context,what_found,
                source_type,source_citation,source_url,license,evidence_class,verification_status,notes)
             VALUES ($1,$2,$3,$4,$5,$6,$7,NULL,'raa_ksamsok',$8,$9,$10,'report_index','verified',
                'Auto-länkad via K-samsök titelmatch; relevans ej manuellt granskad.')
             ON CONFLICT (church_id, investigation_id) WHERE investigation_id IS NOT NULL DO NOTHING`,
            [church.id, church.name, invId, c.year_from, c.year_to, c.investigation_type, c.find_context,
             c.title, c.report_url, c.license]);
          reportTotal++; linkedTotal += lk.rowCount;
        }
      }
      await sleep(SLEEP);
    }
    console.log(`\n=== ${APPLY ? 'APPLY klar' : 'DRY-RUN'} === rapporter: ${reportTotal}, nya länkar: ${linkedTotal}`);
    if (!APPLY) console.log('Kör med --apply för att skriva.');
  } finally { await client.end(); }
}
main().catch(e => { console.error(e); process.exit(1); });
