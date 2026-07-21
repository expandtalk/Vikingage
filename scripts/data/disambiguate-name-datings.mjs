// Koordinatsätter de tvetydiga Vikstrand-namnen (name_datings utan place_name_id).
// Metod: socken-centroid (Wikidata P625) används BARA för att välja rätt OSM-punkt
// med matchande namn (närmast socknen). Koordinaten = OSM-bebyggelsepunkten, ALDRIG
// sockencentroiden (annars cirkulärt mot kyrkan). Namn som ej kan lösas lämnas null.
// Körs: node disambiguate-name-datings.mjs   (kräver SUPABASE_DB_PASSWORD i .env)
import https from 'https';
import fs from 'fs';
import pg from 'pg';

const env = Object.fromEntries(fs.readFileSync('.env', 'utf8').split('\n').filter(l => l.includes('=')).map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; }));
const PW = env.SUPABASE_DB_PASSWORD;
if (!PW) { console.error('SUPABASE_DB_PASSWORD saknas'); process.exit(1); }
const UA = 'VikingageBot/1.0 (https://www.vikingage.se; daniel.larsson@expandtalk.se)';

const sparql = (q) => new Promise((res, rej) => {
  https.get('https://query.wikidata.org/sparql?format=json&query=' + encodeURIComponent(q),
    { headers: { 'User-Agent': UA, Accept: 'application/sparql-results+json' } },
    (r) => { let d = ''; r.on('data', c => d += c); r.on('end', () => { try { res(JSON.parse(d)); } catch { rej(d.slice(0, 150)); } }); }).on('error', rej);
});
// Socken-nyckel: gemener, ta bort " socken/församling/lfs/sn", fäll trailing genitiv-s.
const skey = (s) => (s || '').toLowerCase()
  .replace(/\s+(landsförsamling|församling|socken|lfs|sn)\.?$/g, '')
  .replace(/[^a-zåäö]/g, '').replace(/s$/, '');
const hav = (a, b, c, d) => { const R = 6371, t = Math.PI / 180, dlat = (c - a) * t, dlng = (d - b) * t; const x = Math.sin(dlat / 2) ** 2 + Math.cos(a * t) * Math.cos(c * t) * Math.sin(dlng / 2) ** 2; return 2 * R * Math.asin(Math.sqrt(x)); };

const client = new pg.Client({ host: 'aws-0-eu-north-1.pooler.supabase.com', port: 5432, user: 'postgres.mnuifmcjspeaauzehasj', password: PW, database: 'postgres', ssl: { rejectUnauthorized: false }, statement_timeout: 300000 });
await client.connect();
try {
  // 1. Socken-anker: medelläge av ALLA fornlämningar per socken (heritage_sites.parish).
  //    Ett socken-OMRÅDE-anker, inte en enskild kyrkpunkt → mindre kyrk-bias. Används
  //    ENDAST för att välja rätt OSM-instans; koordinaten blir OSM-punkten.
  const socken = new Map();
  for (const r of (await client.query(`select parish, avg(lat) lat, avg(lng) lng from heritage_sites where parish is not null and lat is not null group by parish`)).rows) {
    const k = skey(r.parish); if (k) socken.set(k, { lat: Number(r.lat), lng: Number(r.lng) });
  }
  // Komplettera med ecclesiastical_sites.socken (fler socknar).
  for (const r of (await client.query(`select parish, avg(lat) lat, avg(lng) lng from ecclesiastical_sites where parish is not null and lat is not null group by parish`)).rows) {
    const k = skey(r.parish); if (k && !socken.has(k)) socken.set(k, { lat: Number(r.lat), lng: Number(r.lng) });
  }
  console.log('socken-anker (heritage + ecclesiastical):', socken.size);
  // 2. OSM-punkter (namn → lista av lägen).
  const osm = new Map();
  for (const r of (await client.query(`select id, lower(name) n, lat, lng from place_names where source='osm' and lat is not null`)).rows) {
    if (!osm.has(r.n)) osm.set(r.n, []); osm.get(r.n).push(r);
  }
  // 3. Olösta dateringsrader.
  const rows = (await client.query(`select id, lower(name) n, socken from name_datings where place_name_id is null`)).rows;
  // 3b. Riktad Wikidata-uppslagning av just de socknar som saknas i ankaren (label-match,
  //     bara namn med flera OSM-kandidater). Snabb VALUES-fråga, ingen klassgissning.
  const needed = new Set();
  for (const row of rows) { const cand = osm.get(row.n); if (cand && cand.length && !socken.get(skey(row.socken))) needed.add(row.socken); }
  if (needed.size) {
    const vals = [...needed].map(s => `"${s} socken"@sv`).join(' '); // bara "X socken" — undvik homonymer
    try {
      const wr = await sparql(`SELECT ?l ?coord WHERE { VALUES ?l { ${vals} } ?s rdfs:label ?l ; wdt:P625 ?coord . }`);
      for (const b of wr.results.bindings) {
        const m = String(b.coord.value).match(/Point\(([-\d.]+) ([-\d.]+)\)/); if (!m) continue;
        const k = skey(b.l.value); if (k && !socken.has(k)) socken.set(k, { lat: parseFloat(m[2]), lng: parseFloat(m[1]) });
      }
      console.log(`riktad Wikidata: ${needed.size} socknar efterfrågade, anker nu ${socken.size}`);
    } catch (e) { console.log('Wikidata riktad uppslagning misslyckades:', String(e).slice(0, 80)); }
  }
  let resolved = 0, noSocken = 0, noOsm = 0, farAway = 0;
  for (const row of rows) {
    const cand = osm.get(row.n);
    if (!cand || !cand.length) { noOsm++; continue; }
    // STRIKT: kräv socken-anker för ALLA (även entydiga) namn. En "entydig" OSM-träff
    // kan ligga i fel landskap (t.ex. enda "Odenslunda" i OSM låg i Västergötland,
    // inte i Fresta/Uppland som Vikstrand avser). Utan anker kan vi inte verifiera
    // att träffen är rätt ort → lämna hellre null än att gissa (hitta inte på).
    const c = socken.get(skey(row.socken));
    if (!c) { noSocken++; continue; }
    const pick = cand.reduce((best, p) => hav(c.lat, c.lng, p.lat, p.lng) < hav(c.lat, c.lng, best.lat, best.lng) ? p : best);
    // Vaktdistans: rätt bebyggelse ligger inom socknen (~<20 km från ankaret).
    // Längre bort ⇒ fel homonym/fel ort → lämna null.
    if (hav(c.lat, c.lng, pick.lat, pick.lng) > 20) { farAway++; continue; }
    await client.query(`update name_datings set place_name_id=$1 where id=$2`, [pick.id, row.id]);
    resolved++;
  }
  console.log(`Löst: ${resolved} | utan socken-anker: ${noSocken} | >20km från anker (avvisad): ${farAway} | namn saknas i OSM: ${noOsm}`);
  const tot = (await client.query(`select count(*) t, count(place_name_id) c from name_datings`)).rows[0];
  console.log(`name_datings: ${tot.c}/${tot.t} har nu koordinat`);
} finally { await client.end(); }
