/**
 * ingest-raa-beacons.mjs — auktoritativa vårdkasar (böte) ur RAÄ Fornsök via K-samsök.
 *
 * Ersätter ungefärliga (OSM/Sölve-bok) vårdkase-lägen med RAÄ:s registrerade lämningar
 * (exakt läge, WGS84). Query: fritext "vårdkase", recordSchema=rdf → filtrera till
 * EntityType#monument med raa/lamning-URI + gml:coordinates (EPSG:4326, lon,lat — ingen
 * reprojektion). Källa/attribuering: kulturarvsdata.se/raa/lamning/<uuid> (RAÄ, CC0-metadata).
 *
 * Icke-destruktivt mot Sölve-raderna: raderar bara tidigare raa/lamning-rader och lägger nya.
 *   node scripts/data/ingest-raa-beacons.mjs
 */
import { readFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';

const UA = 'vikingage-ingest/1.0 (research platform; https://www.vikingage.se)';
const KSAMSOK = 'https://kulturarvsdata.se/ksamsok/api';

function loadEnv() {
  try {
    const raw = readFileSync(new URL('../../.env', import.meta.url), 'utf8');
    return Object.fromEntries(raw.split(/\r?\n/).filter((l) => l && !l.startsWith('#') && l.includes('='))
      .map((l) => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; }));
  } catch { return {}; }
}
const env = loadEnv();
const supabase = createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const pick = (re, s) => { const m = re.exec(s); return m ? m[1].trim() : null; };

async function main() {
  const url = `${KSAMSOK}?x-api=test&method=search&query=${encodeURIComponent('text=vårdkase')}&hitsPerPage=500&recordSchema=rdf`;
  const xml = await (await fetch(url, { headers: { 'User-Agent': UA } })).text();
  const total = pick(/<totalHits>(\d+)/, xml);
  const chunks = xml.split('</record>');
  console.log(`K-samsök totalHits=${total}, records=${chunks.length}`);

  const rows = [];
  const seen = new Set();
  for (const c of chunks) {
    if (!/EntityType#monument/.test(c)) continue;                 // bara lämningar, ej foton
    const uri = pick(/(kulturarvsdata\.se\/raa\/lamning\/[a-f0-9-]+)/, c);
    if (!uri || seen.has(uri)) continue;
    const coord = pick(/<gml:coordinates[^>]*>([0-9.]+,[0-9.]+)/, c); // lon,lat WGS84
    if (!coord) continue;
    const [lng, lat] = coord.split(',').map(Number);
    if (!isFinite(lat) || !isFinite(lng)) continue;
    seen.add(uri);
    const label = pick(/<pres:itemLabel>([^<]+)/, c) || 'Vårdkase';
    const place = pick(/<pres:placeLabel>([^<]+)/, c);
    rows.push({
      name: place ? `${label} – ${place}` : label,
      lat, lng,
      parish: place,
      source_uri: uri.startsWith('http') ? uri : 'https://' + uri,
    });
  }
  console.log(`Vårdkase-lämningar med koordinat: ${rows.length}`);
  if (!rows.length) { console.log('Inget att lägga in — avbryter.'); return; }

  // icke-destruktivt: ta bort tidigare RAÄ-lämningsrader, behåll Sölve/OSM
  const { error: delErr } = await supabase.from('beacon_sites').delete().like('source_uri', '%raa/lamning%');
  if (delErr) console.log('delete-varning:', delErr.message);
  for (let i = 0; i < rows.length; i += 200) {
    const { error } = await supabase.from('beacon_sites').insert(rows.slice(i, i + 200));
    if (error) { console.error('insert-fel:', error.message); process.exit(1); }
  }
  console.log(`KLART. La in ${rows.length} RAÄ-vårdkasar (källa kulturarvsdata.se/raa/lamning).`);
}
main().catch((e) => { console.error(e); process.exit(1); });
