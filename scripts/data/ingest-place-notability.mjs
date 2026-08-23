// Backfyller NOTABILITET (wikidata_sitelinks) på place_names för svenska tätorter → homonym-sök
// (t.ex. "Sandviken", 153 likalydande) kan rankas mot den KÄNDA orten i st.f. en slumpvald vik.
//
// KÄLLKRITIK / INGEN GISSNING: notabilitet = antal Wikipedia-språklänkar (wikibase:sitelinks) per
// Wikidata-tätort (P31 Q12813115) med verifierad P625-koordinat. Matchas mot NÄRMASTE place_names-rad
// med SAMMA namn inom 3 km (kräver båda — ingen fuzzy). Uppdaterar bara den rad som är närmast
// Wikidata-koordinaten, och bara om nytt värde är högre (idempotent, monotont).
//
// Användning:  node scripts/data/ingest-place-notability.mjs [--apply] [--min-sitelinks N]
//   default = dry-run. --min-sitelinks default 2.
import pg from 'pg';
import { readFileSync } from 'node:fs';

const UA = 'VikingAge-research/1.0 (daniel.larsson@expandtalk.se)';
const WDQS = 'https://query.wikidata.org/sparql';
const argv = process.argv.slice(2);
const APPLY = argv.includes('--apply');
const MIN = Number((argv.find(a => a.startsWith('--min-sitelinks=')) || '').split('=')[1]) ||
            (argv.includes('--min-sitelinks') ? Number(argv[argv.indexOf('--min-sitelinks') + 1]) : 2);

const env = Object.fromEntries(
  readFileSync(new URL('../../.env', import.meta.url), 'utf8')
    .split(/\r?\n/).filter(l => l && !l.startsWith('#') && l.includes('='))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; })
);
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function wdqs(q) {
  const url = `${WDQS}?query=${encodeURIComponent(q)}&format=json`;
  for (let a = 0; a < 4; a++) {
    try {
      const r = await fetch(url, { headers: { 'User-Agent': UA, Accept: 'application/sparql-results+json' } });
      if (r.status === 200) return r.json();
      if (r.status === 429 || r.status >= 500) { await sleep(1500 * (a + 1)); continue; }
      return null;
    } catch { await sleep(900 * (a + 1)); }
  }
  return null;
}

async function swedishTowns() {
  // Svenska tätorter (Q12813115) med koordinat + sitelinks + svensk etikett.
  const q = `SELECT ?item ?label ?lat ?lng ?sitelinks WHERE {
    ?item wdt:P31 wd:Q12813115 ; wdt:P625 ?coord ; wikibase:sitelinks ?sitelinks .
    ?item rdfs:label ?label . FILTER(LANG(?label)="sv")
    BIND(geof:latitude(?coord) AS ?lat) BIND(geof:longitude(?coord) AS ?lng)
    FILTER(?sitelinks >= ${MIN})
  }`;
  const d = await wdqs(q);
  const b = d?.results?.bindings || [];
  const out = [];
  for (const r of b) {
    const label = (r.label?.value || '').trim();
    const lat = Number(r.lat?.value), lng = Number(r.lng?.value), s = Number(r.sitelinks?.value);
    if (!label || Number.isNaN(lat) || Number.isNaN(lng) || Number.isNaN(s)) continue;
    out.push({ label, lat, lng, sitelinks: s });
  }
  return out;
}

async function main() {
  const towns = await swedishTowns();
  console.log(`Wikidata → ${towns.length} svenska tätorter (>=${MIN} sitelinks).`);
  if (!towns.length) return;

  const client = new pg.Client({
    host: 'aws-0-eu-north-1.pooler.supabase.com', port: 5432,
    user: 'postgres.mnuifmcjspeaauzehasj', password: env.SUPABASE_DB_PASSWORD, database: 'postgres',
    ssl: { rejectUnauthorized: false }, statement_timeout: 300000,
  });
  await client.connect();
  try {
    let matched = 0, upd = 0, examples = [];
    for (const t of towns) {
      // Närmaste place_names-rad med samma namn inom 3 km.
      const { rows } = await client.query(
        `select id, name, lat, lng,
                (6371000*acos(least(1, cos(radians($2))*cos(radians(lat))*cos(radians(lng)-radians($3))+sin(radians($2))*sin(radians(lat))))) as dist
         from place_names
         where lower(name)=lower($1) and lat is not null
           and lat between $2-0.05 and $2+0.05 and lng between $3-0.09 and $3+0.09
         order by dist asc limit 1`,
        [t.label, t.lat, t.lng]);
      const hit = rows[0];
      if (!hit || hit.dist > 3000) continue;
      matched++;
      if (examples.length < 12) examples.push(`${t.label} (${t.sitelinks} sitelinks) → id ${hit.id.slice(0,8)} @ ${Math.round(hit.dist)} m`);
      if (APPLY) {
        const res = await client.query(
          `update place_names set wikidata_sitelinks=$1, updated_at=now()
           where id=$2 and (wikidata_sitelinks is null or wikidata_sitelinks < $1)`,
          [t.sitelinks, hit.id]);
        upd += res.rowCount;
      }
    }
    console.log(`Matchade ${matched} tätorter mot place_names (namn+<3km).`);
    console.log('Prov:'); examples.forEach(e => console.log('  ' + e));
    if (!APPLY) { console.log('\nDRY-RUN — inget skrivet. Kör med --apply.'); return; }
    console.log(`\n✅ APPLY klar: ${upd} place_names-rader fick/höjde wikidata_sitelinks.`);
  } finally {
    await client.end();
  }
}
main().catch(e => { console.error(e); process.exit(1); });
