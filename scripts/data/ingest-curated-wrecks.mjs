// Kurerade välkända svenska vrak → shipwrecks
//
// KURERAD lista (namn + belagt sjunkår som historiskt faktum). Koordinaten hämtas ALLTID från
// Wikidata (P625) — aldrig ur minnet; vrak utan Wikidata-koordinat hoppas över (ingen påhittad plats).
// Sjunkåret är väletablerade fakta (regalskepp m.fl.); år satt till null = medvetet obelagt här.
// Idempotent på source_ref = 'wikidata:<QID>'.
//
// Användning: node scripts/data/ingest-curated-wrecks.mjs [--apply]

import pg from 'pg';
import { readFileSync } from 'node:fs';

const APPLY = process.argv.includes('--apply');
const UA = 'VikingAge-research/1.0 (daniel.larsson@expandtalk.se; runologi)';

// namn, ev. alias för sökning, belagt sjunkår (null = lämnas obelagt). Källa för år: standardverk
// (Sjöhistoriska/VRAK, allmänt vedertagna). Koordinat verifieras mot Wikidata nedan.
const CURATED = [
  { name: 'Gribshunden', year: 1495 },
  { name: 'Mars', aka: 'Makalös', year: 1564 },
  { name: 'Vasa', aka: 'Vasa (skepp)', year: 1628 },
  { name: 'Äpplet', aka: 'Äpplet (skepp, 1629)', year: 1659 },
  { name: 'Resande Man', year: 1660 },
  { name: 'Kronan', aka: 'Kronan (skepp)', year: 1676 },
  { name: 'Svärdet', aka: 'Svärdet (skepp)', year: 1676 },
  { name: 'Riksäpplet', year: 1676 },
  { name: 'Concordia', aka: 'Älvsnabbenvraket', year: 1754 },
  { name: 'Jutholmsvraket', year: null },
  { name: 'Dalarövraket', year: null },
  { name: 'Sankt Mikael', year: 1747 },
];

const env = Object.fromEntries(
  readFileSync(new URL('../../.env', import.meta.url), 'utf8')
    .split(/\r?\n/).filter(l => l && !l.startsWith('#') && l.includes('='))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; })
);
const sleep = ms => new Promise(r => setTimeout(r, ms));
const wd = async (u) => (await fetch(u, { headers: { 'User-Agent': UA, Accept: 'application/json' } })).json();

// Resolvera ett namn → {qid,label,lat,lon} via Wikidata (kräver P625 i Sveriges bbox).
async function resolve(entry) {
  // Skepp/vrak-typer i Wikidata (P31 måste vara någon av dessa, direkt eller via P279*).
  const SHIP = new Set(['Q11446','Q852190','Q207452','Q1229765','Q17210272','Q106364','Q2055880','Q3389302','Q192944','Q182531','Q3411307']);
  const BAD = /palats|palace|kvarter|slott|byggnad|building|block|gata|street|kyrka|museum/i;
  const terms = [entry.aka, entry.name].filter(Boolean);
  for (const term of terms) {
    const s = await wd(`https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${encodeURIComponent(term)}&language=sv&uselang=sv&format=json&limit=6`);
    for (const c of (s.search || [])) {
      if (c.description && BAD.test(c.description)) continue;           // uteslut palats/kvarter/byggnad
      const e = await wd(`https://www.wikidata.org/w/api.php?action=wbgetentities&ids=${c.id}&props=labels|claims&languages=sv|en&format=json`);
      const ent = e.entities?.[c.id]; if (!ent) continue;
      const p625 = ent.claims?.P625?.[0]?.mainsnak?.datavalue?.value;
      if (!p625) { await sleep(120); continue; }
      // typkontroll: P31 är skepps/vraktyp ELLER beskrivningen säger skepp/vrak (aldrig palats/kvarter,
      // de föll redan bort via BAD ovan) → fångar även vrak vars P31 ligger utanför tillåtlistan.
      const GOOD = /skepp|fartyg|vrak|örlogs|regalskepp|ship|wreck|carrack|kravel|kogg|galär|vessel|warship|båt/i;
      const p31 = (ent.claims?.P31 || []).map(s => s.mainsnak?.datavalue?.value?.id).filter(Boolean);
      const isShip = p31.some(q => SHIP.has(q)) || (c.description && GOOD.test(c.description));
      const { latitude: lat, longitude: lon } = p625;
      const inSweden = lat > 55 && lat < 66.5 && lon > 10.5 && lon < 20;
      if (isShip && inSweden) {
        return { qid: c.id, label: ent.labels?.sv?.value || ent.labels?.en?.value || entry.name, lat, lon, p31 };
      }
      await sleep(120);
    }
    await sleep(150);
  }
  return null;
}

async function main() {
  console.log(`Kurerade vrak → Wikidata-koordinat… (${APPLY ? 'APPLY' : 'DRY-RUN'})`);
  const resolved = []; const missing = [];
  for (const entry of CURATED) {
    const r = await resolve(entry);
    if (r) resolved.push({ ...entry, ...r });
    else missing.push(entry.name);
    await sleep(200);
  }
  console.log(`\nResolverade (med Wikidata-koordinat): ${resolved.length}/${CURATED.length}`);
  console.log(`Med belagt sjunkår: ${resolved.filter(r => r.year).length}`);
  resolved.forEach(r => console.log(`  ${r.label} — ${r.year ?? 'år obelagt'} (${r.lat.toFixed(3)},${r.lon.toFixed(3)}) [${r.qid}]`));
  if (missing.length) console.log('Ej resolverade (ingen Wikidata-koordinat i SV):', missing.join(', '));

  if (!APPLY) { console.log('\nDRY-RUN — inget skrivet. Kör med --apply.'); return; }

  const client = new pg.Client({
    host: 'aws-0-eu-north-1.pooler.supabase.com', port: 5432,
    user: 'postgres.mnuifmcjspeaauzehasj', password: env.SUPABASE_DB_PASSWORD, database: 'postgres',
    ssl: { rejectUnauthorized: false }, statement_timeout: 300000,
  });
  await client.connect();
  try {
    let ins = 0;
    for (const r of resolved) {
      const ref = `wikidata:${r.qid}`;
      const res = await client.query(
        `INSERT INTO shipwrecks (name, sinking_year, geom, coord_source, coord_precision_m, source_ref, source_license, source_attribution, notes)
         SELECT $1,$2, ST_SetSRID(ST_MakePoint($3,$4),4326), 'Wikidata (P625)', 200, $5, 'CC0', 'Wikidata',
                'Kurerat välkänt vrak; koordinat Wikidata P625, sjunkår belagt historiskt faktum'
         WHERE NOT EXISTS (SELECT 1 FROM shipwrecks WHERE source_ref = $5)`,
        [r.label, r.year, r.lon, r.lat, ref]);
      ins += res.rowCount;
    }
    console.log(`\n✅ APPLY klar: ${ins} vrak insatta (idempotent).`);
  } finally { await client.end(); }
}
main().catch(e => { console.error(e); process.exit(1); });
