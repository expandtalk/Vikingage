// Arkeologiska undersökningar per ort — K-samsök → archaeological_investigations
// Spec: docs/superpowers/specs/2026-07-26-archaeological-investigations-design.md
//
// COPYRIGHT: lagrar BARA metadata (titel, typ, år, ort, nyckelord) + LÄNK till rapporten.
// Ingen rapporttext/PDF/bild lyfts. Bibliografisk metadata + länk är fakta, ej skyddat.
//
// Användning:
//   node scripts/data/ingest-arch-investigations.mjs <TEMA> [--apply] [--max N] [--sleep MS]
//   TEMA: arsta | gravhog | romerskt | soldat | valla   (eller --query "<cql>" --tags a,b)
//   default = dry-run (skriver inget). --apply = upsert till prod (dedup på source_uri).

import pg from 'pg';
import { readFileSync } from 'node:fs';

const UA = 'VikingAge-research/1.0 (daniel.larsson@expandtalk.se)';
const SRC = 'Riksantikvarieämbetet (K-samsök)';

// Riktat mot RAÄ:s rapport-tjänst (serviceName=arkiv-dokument, itemType=book) → placerade
// undersökningsrapporter, inte museiobjekt/foton. Verifierat: hög sockentäckning.
const RAP = 'serviceName=arkiv-dokument and ';
const THEMES = {
  arsta:    { q: RAP + 'text=Årsta', tags: ['Årsta'] },
  gravhog:  { q: RAP + 'text=gravhög', tags: ['gravhög'] },
  romerskt: { q: RAP + 'text=romersk', tags: ['romerskt'] },
  soldat:   { q: RAP + 'text=soldat', tags: ['soldat'] },
  valla:    { q: RAP + 'text=Valla', tags: ['Valla'] },
};

const argv = process.argv.slice(2);
const THEME = argv.find(a => !a.startsWith('--'));
const APPLY = argv.includes('--apply');
const MAX = Number((argv.find(a => a.startsWith('--max=')) || '').split('=')[1]) ||
            (argv.includes('--max') ? Number(argv[argv.indexOf('--max') + 1]) : 120);
const SLEEP = Number((argv.find(a => a.startsWith('--sleep=')) || '').split('=')[1]) || 300;
const QUERY = (argv.find(a => a.startsWith('--query=')) || '').split('=').slice(1).join('=');
const TAGS = ((argv.find(a => a.startsWith('--tags=')) || '').split('=')[1] || '').split(',').filter(Boolean);

const cfg = QUERY ? { q: QUERY, tags: TAGS } : THEMES[THEME];
if (!cfg) { console.error('Ange TEMA (arsta|gravhog|romerskt|soldat|valla) eller --query "<cql>"'); process.exit(1); }

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
  if (/särskild utredning|arkeologisk utredning|\butredning\b/.test(t)) return 'utredning';
  if (/slutundersök|särskild undersök|arkeologisk undersök|\bundersökning\b/.test(t)) return 'undersökning';
  if (/inventering/.test(t)) return 'inventering';
  return null;
}
const PERIOD_TERMS = ['stenålder','bronsålder','järnålder','romersk järnålder','folkvandringstid','vendeltid','vikingatid','medeltid','neolitikum','mesolitikum'];
function periodOf(s) { const t=(s||'').toLowerCase(); return PERIOD_TERMS.filter(p=>t.includes(p)).join(', ') || null; }
const KW_TERMS = ['gravhög','hög','röse','stensättning','boplats','grav','skelett','brandgrav','mynt','romerskt','romersk','soldat','offerfynd','depåfynd','skärvsten','härd','fornborg'];
function kwOf(s) { const t=(s||'').toLowerCase(); return KW_TERMS.filter(k=>t.includes(k)); }

function parsePlace(placeLabel) {
  const g = k => rx(placeLabel, new RegExp(k + ':\\s*([^;]+)'));
  return { county: g('Län'), municipality: g('Kommun'), landscape: g('Landskap'), parish: g('Socken') };
}

async function main() {
  const client = new pg.Client({
    host: 'aws-0-eu-north-1.pooler.supabase.com', port: 5432,
    user: 'postgres.mnuifmcjspeaauzehasj', password: env.SUPABASE_DB_PASSWORD, database: 'postgres',
    ssl: { rejectUnauthorized: false }, statement_timeout: 300000,
  });
  await client.connect();
  const geoCache = new Map();
  async function geocodeOne(socken) {
    const c = await client.query(
      `SELECT avg(pn.lat) lat, avg(pn.lng) lng
         FROM parishes p JOIN place_names pn ON pn.parish_id = p.id
        WHERE pn.lat IS NOT NULL AND (lower(p.name)=lower($1) OR lower(p.rundata_name)=lower($1))`, [socken]);
    if (c.rows[0]?.lat) return { lat: +c.rows[0].lat, lng: +c.rows[0].lng, prec: 'socken' };
    const p = await client.query(
      `SELECT lat, lng FROM place_names WHERE lat IS NOT NULL AND lower(name)=lower($1) LIMIT 1`, [socken]);
    if (p.rows[0]) return { lat: +p.rows[0].lat, lng: +p.rows[0].lng, prec: 'socken' };
    return null;
  }
  async function geocodeSocken(socken) {
    if (!socken) return null;
    if (geoCache.has(socken)) return geoCache.get(socken);
    let g = null;
    // sammansatt socken ("Västerhaninge, Österhaninge") → prova varje del, ta första träff
    for (const part of socken.split(',').map(s => s.trim()).filter(Boolean)) {
      g = await geocodeOne(part);
      if (g) break;
    }
    geoCache.set(socken, g);
    return g;
  }

  try {
    console.log(`TEMA ${THEME || '(custom)'} | query: ${cfg.q}\nLäge: ${APPLY ? 'APPLY' : 'DRY-RUN'} | max ${MAX}`);
    const rows = [];
    const seen = new Set();
    let start = 1, total = null;
    while (rows.length < MAX) {
      const j = await ksamsok(cfg.q, 50, start);
      if (!j) break;
      total = total ?? j.result?.totalHits;
      const recs = j.result?.records || [];
      if (!recs.length) break;
      for (const r of recs) {
        const graph = r.record?.['@graph'] || [];
        const top = graph.find(n => n['ksam:itemLabel']);
        if (!top) continue;
        const uri = String(top['@id'] || '');
        if (!uri || seen.has(uri)) continue;
        const title = val(top['ksam:itemLabel']);
        if (!title) continue;
        // Skippa råa fornminnesinventerings-scans (ej undersökningar) — noise i arkiv-dokument.
        if (/inventeringsbokuppslag/i.test(title)) continue;
        const presNode = graph.find(n => n['ksam:presentation']?.['@value']);
        const placeLabel = presNode ? rx(presNode['ksam:presentation']['@value'], /<pres:placeLabel>([^<]*)<\/pres:placeLabel>/) : null;
        const place = parsePlace(placeLabel);
        if (!place.parish) continue;                       // utan socken = ej kartbar → hoppa (pilot)
        seen.add(uri);
        const ft = val(top['ksam:fromTime']); const tt = val(top['ksam:toTime']);
        const yr = s => { const m=/(\d{4})/.exec(String(s||'')); const y=m?+m[1]:null; return (y&&y>=1600&&y<=2035)?y:null; };
        const kws = [...new Set([...cfg.tags, ...arr(top['ksam:itemKeyword']).map(val).filter(Boolean), ...kwOf(title)])];
        const geo = await geocodeSocken(place.parish);
        rows.push({
          title,
          investigation_type: typeOf(title),
          year_from: yr(ft), year_to: yr(tt),
          ...place,
          lat: geo?.lat ?? null, lng: geo?.lng ?? null, geo_precision: geo?.prec ?? null,
          period: periodOf(title),
          keywords: kws,
          finds_summary: `Arkeologisk ${typeOf(title) || 'undersökning'} i ${place.parish} socken.`,
          report_url: val(top['ksam:url']) || uri,
          source_uri: uri,
          license: val(top['ksam:itemLicenseUrl']),
        });
        if (rows.length >= MAX) break;
      }
      start += recs.length;
      if (total && start > total) break;
      await sleep(SLEEP);
    }

    const geo = rows.filter(r => r.lat).length;
    console.log(`\n=== RAPPORT === totalHits=${total}, insamlade=${rows.length}, geokodade=${geo} (socken-precision)`);
    const byType = {}; rows.forEach(r => byType[r.investigation_type||'?']=(byType[r.investigation_type||'?']||0)+1);
    console.log('Typer:', JSON.stringify(byType));
    console.log('Exempel (upp till 8):');
    rows.slice(0, 8).forEach(r => console.log(`  [${r.investigation_type||'?'}|${r.year_from||'?'}] ${r.parish} ${r.lat?`(${r.lat.toFixed(3)},${r.lng.toFixed(3)})`:'(EJ GEO)'} — ${r.title.slice(0,70)}`));

    if (!APPLY) { console.log('\nDRY-RUN — inget skrivet. Kör med --apply.'); return; }

    let up = 0;
    for (const r of rows) {
      const res = await client.query(
        `INSERT INTO archaeological_investigations
           (title,investigation_type,year_from,year_to,parish,municipality,county,landscape,lat,lng,geo_precision,period,keywords,finds_summary,report_url,source_uri,source_institution,license)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)
         ON CONFLICT (source_uri) DO UPDATE SET
           title=EXCLUDED.title, investigation_type=EXCLUDED.investigation_type, keywords=EXCLUDED.keywords,
           lat=EXCLUDED.lat, lng=EXCLUDED.lng, geo_precision=EXCLUDED.geo_precision, updated_at=now()`,
        [r.title,r.investigation_type,r.year_from,r.year_to,r.parish,r.municipality,r.county,r.landscape,
         r.lat,r.lng,r.geo_precision,r.period,r.keywords,r.finds_summary,r.report_url,r.source_uri,SRC,r.license]);
      up += res.rowCount;
    }
    console.log(`\n✅ APPLY klar: ${up} rader upsertade.`);
  } finally { await client.end(); }
}
main().catch(e => { console.error(e); process.exit(1); });
