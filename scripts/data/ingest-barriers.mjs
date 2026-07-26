// Spärranläggningar (pålspärrar/farledsspärrar) → heritage_sites, raa_type='spärranläggning'.
// Kuraterat marint försvarslager: Årsta L2013:4298, Foteviken L1989:6082, Norrström, Bulverket m.fl.
// Endast ÄKTA RAÄ-lämningar (/raa/lamning/) med riktiga koordinater. Fornsök=CC0.
//   node scripts/data/ingest-barriers.mjs [--apply]

import pg from 'pg';
import { readFileSync } from 'node:fs';
const UA = 'VikingageBot/1.0 (https://www.vikingage.se; daniel.larsson@expandtalk.se)';
const APPLY = process.argv.includes('--apply');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const env = Object.fromEntries(readFileSync(new URL('../../.env', import.meta.url), 'utf8')
  .split(/\r?\n/).filter(l => l && !l.startsWith('#') && l.includes('='))
  .map(l => { const i = l.indexOf('='); return [l.slice(0,i).trim(), l.slice(i+1).trim().replace(/^["']|["']$/g,'')]; }));
const m1 = (s, re) => { const m = re.exec(s); return m ? m[1].trim() : ''; };

async function ksamsok(q, hits, start) {
  const url = `https://kulturarvsdata.se/ksamsok/api?x-api=test&method=search&hitsPerPage=${hits}&startRecord=${start}&recordSchema=presentation&query=${encodeURIComponent(q)}`;
  for (let a = 0; a < 4; a++) { try { const r = await fetch(url, { headers: { 'User-Agent': UA } }); if (r.status === 200) return r.text(); await sleep(1500*(a+1)); } catch { await sleep(1000*(a+1)); } }
  return '';
}

// Termer som fångar farledsspärrar; label/tags måste matcha en av dessa (ej fritext-nämnd).
const RE = /spärranläggning|pålspärr|pålrad|palissad|stockspärr|spärr(en|ar)?\b|timmerspärr/i;
function parseItem(it) {
  const ent = m1(it, /<pres:entityUri>([^<]*)</);
  if (!/\/raa\/lamning\//.test(ent)) return null;
  const cm = it.match(/<gml:coordinates[^>]*>([-\d.]+)[, ]([-\d.]+)</);
  if (!cm) return null;
  const lng = parseFloat(cm[1]), lat = parseFloat(cm[2]);
  if (!(lat > 54 && lat < 70 && lng > 10 && lng < 25)) return null;
  const label = m1(it, /<pres:itemLabel[^>]*>([^<]*)</);
  const tags = [...it.matchAll(/<pres:tag[^>]*>([^<]*)</g)].map(x => x[1]).join(' ');
  const desc = m1(it, /<pres:description[^>]*>([^<]*)</).replace(/\s+/g, ' ').trim() || null;
  if (!RE.test(label + ' ' + tags + ' ' + (desc || ''))) return null;
  const place = m1(it, /<pres:placeLabel[^>]*>([^<]*)</).split(',').map(x => x.trim());
  return { raa_type: 'spärranläggning', name: label.split(',')[0].trim() || 'Spärranläggning',
           landscape: place[3]||null, municipality: place[2]||null, parish: place[4]||null,
           lat, lng, description: desc, source_uri: ent.replace(/^https?:\/\//, '') };
}

async function main() {
  console.log(`Spärranläggningar | Läge: ${APPLY ? 'APPLY' : 'DRY-RUN'}`);
  const client = new pg.Client({ host: 'aws-0-eu-north-1.pooler.supabase.com', port: 5432,
    user: 'postgres.mnuifmcjspeaauzehasj', password: env.SUPABASE_DB_PASSWORD, database: 'postgres',
    ssl: { rejectUnauthorized: false }, statement_timeout: 300000 });
  await client.connect();
  try {
    const rows = new Map();
    const terms = ['spärranläggning', 'pålspärr', 'stockspärr', 'timmerspärr', 'pålrad',
                   'L2013:4298', 'L1989:6082', 'Bulverket'];
    for (const term of terms) {
      for (let page = 0; page < 6; page++) {
        const xml = await ksamsok(`text="${term}"`, 100, page*100+1);
        const items = xml.split('<pres:item ').slice(1);
        if (!items.length) break;
        for (const it of items) { const r = parseItem(it); if (r) rows.set(r.source_uri, r); }
        if (items.length < 100) break;
        await sleep(400);
      }
    }
    const all = [...rows.values()];
    const byLan = {}; all.forEach(r => { const k = r.landscape || '?'; byLan[k] = (byLan[k]||0)+1; });
    console.log(`\n${all.length} äkta spärranläggnings-lämningar. Landskap:`, JSON.stringify(byLan));
    all.slice(0, 14).forEach(r => console.log(`  ⛓️ ${r.name} (${r.parish||r.municipality}, ${r.landscape}) ${r.lat.toFixed(4)},${r.lng.toFixed(4)} — ${(r.description||'').slice(0,50)}`));
    if (!APPLY) { console.log('\nDRY-RUN — inget skrivet.'); return; }
    let up = 0;
    for (const r of all) {
      const res = await client.query(
        `INSERT INTO heritage_sites (raa_type,name,landscape,municipality,parish,lat,lng,description,source_uri)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
         ON CONFLICT (source_uri) DO UPDATE SET raa_type=EXCLUDED.raa_type, name=EXCLUDED.name, description=EXCLUDED.description, updated_at=now()`,
        [r.raa_type, r.name, r.landscape, r.municipality, r.parish, r.lat, r.lng, r.description, r.source_uri]);
      up += res.rowCount;
    }
    console.log(`\n✅ APPLY: ${up} rader upsertade.`);
  } finally { await client.end(); }
}
main().catch(e => { console.error(e); process.exit(1); });
