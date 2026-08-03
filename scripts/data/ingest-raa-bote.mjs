/**
 * ingest-raa-bote.mjs — breddning: fånga vårdkasar registrerade som "böte" i RAÄ Fornsök.
 *
 * Öland/Gotland-ordet för vårdkase-höjd är "böte" (jfr Vårdböte, Gräsgård-böte). Fritext
 * "vårdkase" missar en del av dessa. Denna hämtar EntityType#monument via text=böte, filtrerar
 * till raa/lamning + koordinat (WGS84), och lägger ADDITIVT till de URIs som inte redan finns
 * i beacon_sites (ingen delete). Källa: kulturarvsdata.se/raa/lamning (RAÄ).
 *
 *   node scripts/data/ingest-raa-bote.mjs
 */
import { readFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';

const UA = 'vikingage-ingest/1.0 (https://www.vikingage.se)';
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
  const url = `${KSAMSOK}?x-api=test&method=search&query=${encodeURIComponent('text=böte')}&hitsPerPage=500&recordSchema=rdf`;
  const xml = await (await fetch(url, { headers: { 'User-Agent': UA } })).text();
  const chunks = xml.split('</record>');

  // befintliga RAÄ-URIs (för additiv dedup)
  const existing = new Set();
  for (let from = 0; ; from += 1000) {
    const { data } = await supabase.from('beacon_sites').select('source_uri').range(from, from + 999);
    if (!data || !data.length) break;
    data.forEach((r) => r.source_uri && existing.add(r.source_uri.replace(/^https?:\/\//, '')));
    if (data.length < 1000) break;
  }

  const rows = []; const seen = new Set();
  for (const c of chunks) {
    if (!/EntityType#monument/.test(c)) continue;
    const uri = pick(/(kulturarvsdata\.se\/raa\/lamning\/[a-f0-9-]+)/, c);
    if (!uri || seen.has(uri) || existing.has(uri)) continue;   // additivt: hoppa befintliga
    const coord = pick(/<gml:coordinates[^>]*>([0-9.]+,[0-9.]+)/, c);
    if (!coord) continue;
    const [lng, lat] = coord.split(',').map(Number);
    if (!isFinite(lat) || !isFinite(lng)) continue;
    seen.add(uri);
    const label = pick(/<pres:itemLabel>([^<]+)/, c) || 'Böte/vårdkase';
    const place = pick(/<pres:placeLabel>([^<]+)/, c);
    rows.push({ name: place ? `${label} – ${place}` : label, lat, lng, parish: place, source_uri: 'https://' + uri });
  }
  console.log(`Nya böte-lämningar (ej redan i beacon_sites): ${rows.length}`);
  if (rows.length) {
    const { error } = await supabase.from('beacon_sites').insert(rows);
    if (error) { console.error('insert-fel:', error.message); process.exit(1); }
    rows.forEach((r) => console.log(`  + ${r.name}  [${r.lat.toFixed(4)},${r.lng.toFixed(4)}]`));
  }
  console.log('KLART.');
}
main().catch((e) => { console.error(e); process.exit(1); });
