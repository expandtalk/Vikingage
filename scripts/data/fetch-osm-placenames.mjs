// OSM-ortnamn (place=*-noder) via Overpass → place_names med PUNKTKOORDINATER.
// Gratis, inget konto (ODbL, kräver attribuering). FULL gazetteer för baslinjetest —
// därför skrivs ALLA namn direkt via pg (även oklassade; edge-funktionen släpper
// oklassade och duger inte till baslinje). Klassning på efterled/teofort förled.
// Körs: node fetch-osm-placenames.mjs [place1,place2,...]   (kräver SUPABASE_DB_PASSWORD i .env)
import https from 'https';
import fs from 'fs';
import pg from 'pg';

const env = Object.fromEntries(fs.readFileSync('.env', 'utf8').split('\n').filter(l => l.includes('=')).map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; }));
const PW = env.SUPABASE_DB_PASSWORD;
if (!PW) { console.error('SUPABASE_DB_PASSWORD saknas i .env'); process.exit(1); }
const TYPES = (process.argv[2] || 'city,town,village,hamlet').split(',');
const OVERPASS = 'https://overpass-api.de/api/interpreter';
const UA = 'VikingageBot/1.0 (https://www.vikingage.se; daniel.larsson@expandtalk.se)';

const overpassOnce = (q) => new Promise((res, rej) => {
  const body = 'data=' + encodeURIComponent(q);
  const req = https.request(OVERPASS, { method: 'POST', headers: { 'User-Agent': UA, 'Content-Type': 'application/x-www-form-urlencoded', 'Content-Length': Buffer.byteLength(body) } },
    (r) => { let d = ''; r.on('data', c => d += c); r.on('end', () => { try { res(JSON.parse(d)); } catch { rej('parse: ' + d.slice(0, 120)); } }); });
  req.on('error', rej); req.write(body); req.end();
});
const overpass = async (q) => {
  for (let i = 0; i < 4; i++) { try { return await overpassOnce(q); } catch (e) { if (i === 3) throw e; await new Promise(r => setTimeout(r, 5000 * (i + 1))); } }
};

function classify(raw) {
  const n = raw.toLowerCase().replace(/\s+(gamla|nya|norra|södra|östra|västra|lilla|stora)\s+/g, ' ').trim();
  const keys = []; let cat = null;
  const add = (k, c) => { if (!keys.includes(k)) { keys.push(k); if (!cat) cat = c; } };
  if (/^oden|^odin/.test(n)) add('oden', 'sakralt');
  if (/^tors|^thors|^tor(?=[bghlsvö])/.test(n)) add('tor', 'sakralt');
  if (/^frö|^frøy|^fröj|^frös/.test(n)) add('frö', 'sakralt');
  if (/^ull(e|en|er|a)?/.test(n)) add('ull', 'sakralt');
  if (/^njär|^njord/.test(n)) add('njärd', 'sakralt');
  if (/lunda?$/.test(n)) add('lund', 'sakralt');
  if (/harg$/.test(n)) add('harg', 'sakralt');
  if (/hov$/.test(n)) add('hov', 'sakralt');
  if (/tuna$/.test(n)) add('tuna', 'centralort');
  if (/sala$/.test(n)) add('sala', 'centralort');
  if (/^husby|^husaby|husby$/.test(n)) add('husby', 'centralort');
  if (/karleby$|karlby$/.test(n)) add('karleby', 'centralort');
  if (/sätuna$|sätra$/.test(n)) add('sätuna', 'centralort');
  if (/hammar/.test(n)) add('hammar', 'ting_ratt');
  if (/hundra/.test(n)) add('hundra', 'ting_ratt');
  if (/härad|harad/.test(n)) add('härad', 'ting_ratt');
  if (/anger$|ånger$/.test(n)) add('anger', 'kust_hamn');
  if (/inge$/.test(n)) add('inge', 'bebyggelse');
  if (/[a-zåäö]hem$/.test(n)) add('hem', 'bebyggelse');
  if (/[a-zåäö]by$/.test(n)) add('by', 'bebyggelse');
  if (/(sta|stad)$/.test(n)) add('sta', 'bebyggelse');
  if (/torp$/.test(n)) add('torp', 'bebyggelse');
  if (/vi$/.test(n) && !/vik$|vind$/.test(n)) add('vi', 'sakralt');
  return { keys, cat };
}

const client = new pg.Client({ host: 'aws-0-eu-north-1.pooler.supabase.com', port: 5432, user: 'postgres.mnuifmcjspeaauzehasj', password: PW, database: 'postgres', ssl: { rejectUnauthorized: false }, statement_timeout: 300000 });
await client.connect();
const seen = new Set(); let total = 0;
try {
  for (const type of TYPES) {
    const q = `[out:json][timeout:240];area["ISO3166-1"="SE"][admin_level=2]->.se;node["place"="${type}"]["name"](area.se);out body;`;
    let r; try { r = await overpass(q); } catch (e) { console.log(type, 'hoppad:', String(e).slice(0, 80)); continue; }
    const rows = [];
    for (const el of (r.elements || [])) {
      const id = 'osm-' + el.id; if (seen.has(id)) continue; seen.add(id);
      const name = el.tags?.name; if (!name || el.lat == null || el.lon == null) continue;
      const cl = classify(name);
      rows.push([name, el.lat, el.lon, cl.keys, cl.cat, 'osm_' + type, 'osm', 'ODbL', id]);
    }
    for (let i = 0; i < rows.length; i += 500) {
      const batch = rows.slice(i, i + 500);
      const vals = batch.map((_, j) => { const b = j * 9; return `($${b+1},$${b+2},$${b+3},$${b+4},$${b+5},$${b+6},$${b+7},$${b+8},$${b+9})`; }).join(',');
      const params = batch.flat();
      const res = await client.query(
        `INSERT INTO place_names (name, lat, lng, element_keys, element_category, feature_type, source, source_license, external_id)
         VALUES ${vals} ON CONFLICT (external_id) DO NOTHING`, params);
      total += res.rowCount;
    }
    console.log(`${type}: ${(r.elements || []).length} noder → +${rows.length} (totalt insatta ${total})`);
    await new Promise(r => setTimeout(r, 1500));
  }
} finally { await client.end(); }
console.log('OSM klart. Nya rader:', total);
