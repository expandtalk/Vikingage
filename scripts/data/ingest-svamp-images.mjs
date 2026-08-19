// Ingest av FRIA svampbilder från Wikimedia Commons → svamp.art (ätliga) + svamp.giftsvamp (oätliga).
// KÄLLKRITIK/SÄKERHET: bilderna hämtas ur Commons-KATEGORIN som är namngiven efter det vetenskapliga
// namnet (t.ex. Category:Cantharellus cibarius) → artriktigt binder bild till art. Endast fria licenser
// (PD/CC0/CC BY/CC BY-SA) accepteras; NC/ND/okänt utesluts. Vi lagrar en HOTLÄNK till Commons-thumb
// (rehostar aldrig) + licens + fotograf + filsidans URL. Kör: node scripts/data/ingest-svamp-images.mjs
import fs from 'fs'; import pg from 'pg';

const env = Object.fromEntries(fs.readFileSync('.env','utf8').split('\n').filter(l=>l.includes('=')).map(l=>{const i=l.indexOf('=');return [l.slice(0,i).trim(),l.slice(i+1).trim()];}));
const UA = 'VikingAgeResearch/1.0 (https://vikingage.se; forskningsplattform) node-ingest';
const API = 'https://commons.wikimedia.org/w/api.php';

const stripHtml = (s) => String(s ?? '').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
// Fotografkredit: strippa HTML + Commons-mallar ({{{2}}}) + Mushroom-Observer-boilerplate → bara namnet.
const cleanCredit = (s) => {
  let t = stripHtml(s).replace(/\{\{\{[^}]*\}\}\}/g, '').replace(/this image was created by user\s*/i, '');
  t = t.split(/Mushroom Observer|You can contact|a source for mycological/i)[0];
  t = t.replace(/\s+/g, ' ').trim().replace(/[,.;]\s*$/, '').replace(/\s+at$/i, '').trim();
  // Tomt eller bara "at" (namnet var {{{2}}} → okänt) → ärlig fallback.
  if (!t || /^at\b/i.test(t) || t.length < 2) return 'Wikimedia Commons';
  return t;
};
// Icke-habitus-filter: hoppa sporavtryck, mikroskopi, teckningar, kartor, frimärken osv.
const BAD = /(spore|micro|section|drawing|illustration|zeichnung|map|distribution|chart|diagram|stamp|briefmarke|label|etikett|book|plate|tafel|dried|herbarium|modell|\bmodel\b|wax|wachs|replica|sculpt|painting|gemälde|\.svg$)/i;

function normLicense(em) {
  const short = stripHtml(em?.LicenseShortName?.value || '');
  const machine = String(em?.License?.value || '').toLowerCase();
  const t = (short + ' ' + machine).toLowerCase();
  if (/cc.?by.?nc|cc.?by.?nd|-nc-|-nd-|noncommercial|noderiv/.test(t)) return null; // ej fri nog
  if (/cc0|public.?domain|(^|[^a-z])pd([^a-z]|$)|pd-/.test(t)) return short || 'Public domain';
  if (/cc.?by.?sa/.test(t)) return short || 'CC BY-SA';
  if (/cc.?by/.test(t)) return short || 'CC BY';
  return null;
}

async function commonsBest(sciName) {
  // 1) försök kategorin (artriktig bindning); 2) fallback: filsök på namnet.
  for (const params of [
    { generator: 'categorymembers', gcmtitle: `Category:${sciName}`, gcmtype: 'file', gcmlimit: '30' },
    { generator: 'search', gsrsearch: `${sciName} filetype:bitmap`, gsrnamespace: '6', gsrlimit: '30' },
  ]) {
    const u = new URL(API);
    Object.entries({ action: 'query', format: 'json', prop: 'imageinfo', iiprop: 'url|extmetadata|mime|size', iiurlwidth: '900', ...params }).forEach(([k, v]) => u.searchParams.set(k, v));
    let d;
    try { const r = await fetch(u, { headers: { 'User-Agent': UA, Accept: 'application/json' } }); if (!r.ok) continue; d = await r.json(); } catch { continue; }
    const pages = Object.values(d?.query?.pages ?? {});
    const cands = [];
    for (const p of pages) {
      const title = p.title || '';
      if (BAD.test(title)) continue;
      const ii = p.imageinfo?.[0]; if (!ii) continue;
      if (ii.mime && !/jpeg|png/.test(ii.mime)) continue;
      const lic = normLicense(ii.extmetadata);
      if (!lic) continue;
      const artist = cleanCredit(ii.extmetadata?.Artist?.value);
      // poäng: större bild + jpeg + namnet i titeln (extra artsäkerhet)
      let score = Math.min(ii.width || 0, 4000) / 1000;
      if (/jpeg/.test(ii.mime || '')) score += 1;
      if (title.toLowerCase().includes(sciName.split(' ')[0].toLowerCase())) score += 1.5;
      cands.push({ score, url: ii.thumburl || ii.url, licens: lic, kredit: artist.slice(0, 140), kalla: ii.descriptionshorturl || ii.descriptionurl || `https://commons.wikimedia.org/wiki/${encodeURIComponent(title)}`, title });
    }
    cands.sort((a, b) => b.score - a.score);
    if (cands.length) return cands[0];
  }
  return null;
}

const c = new pg.Client({ host: 'aws-0-eu-north-1.pooler.supabase.com', port: 5432, user: 'postgres.mnuifmcjspeaauzehasj', password: env.SUPABASE_DB_PASSWORD, database: 'postgres', ssl: { rejectUnauthorized: false } });
await c.connect();

const targets = [
  ...(await c.query(`select id, svenskt_namn, vetenskapligt_namn from svamp.art where vetenskapligt_namn is not null`)).rows.map(r => ({ ...r, tbl: 'art' })),
  ...(await c.query(`select id, svenskt_namn, vetenskapligt_namn from svamp.giftsvamp where vetenskapligt_namn is not null`)).rows.map(r => ({ ...r, tbl: 'giftsvamp' })),
];

let ok = 0, miss = 0;
for (const t of targets) {
  const best = await commonsBest(t.vetenskapligt_namn);
  if (!best) { miss++; console.log(`  ✗ ${t.svenskt_namn} (${t.vetenskapligt_namn}) — ingen fri bild`); continue; }
  await c.query(`update svamp.${t.tbl} set bild_url=$1, bild_licens=$2, bild_kredit=$3, bild_kalla=$4 where id=$5`,
    [best.url, best.licens, best.kredit, best.kalla, t.id]);
  ok++;
  console.log(`  ✓ ${t.svenskt_namn} → ${best.licens} · ${best.kredit.slice(0, 40)} · ${best.title.slice(0, 50)}`);
}
console.log(`\nKlart: ${ok} bilder satta, ${miss} utan fri bild.`);
await c.end();
