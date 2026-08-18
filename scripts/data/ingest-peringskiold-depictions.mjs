// Ingest av Peringskiölds (m.fl.) avbildningar av ICKE-runsten-objekt ur Wikimedia Commons-API:t
// (verkliga PD/CC0-URL:er, deterministiskt — ingen gissning). Kyrkor (som de såg ut före
// 1800-talets ombyggnad), klosterruiner, offerlundar/källor, gravhögar, kungar/dynasti →
// historical_depictions. Runstensteckningar (signum i titeln) → inscription_media (teckning).
// Porträtt av honom själv och moderna bilder (199x/20xx) exkluderas. DRY som standard; --apply skriver.
import pg from 'pg';
import { readFileSync } from 'node:fs';

const APPLY = process.argv.includes('--apply');
const env = Object.fromEntries(readFileSync('./.env', 'utf8').split(/\r?\n/).filter(l => l && !l.startsWith('#') && l.includes('=')).map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; }));
const UA = { 'User-Agent': 'VikingAge-research/1.0 (daniel.larsson@expandtalk.se)' };

const CATEGORIES = [
  { cat: 'Johan Peringskiöld', work: 'Monumenta / lösteckning' },
  { cat: 'Monumenta Sveo-Gothorum', work: 'Monumenta (Sveo-Gothorum)' },
  { cat: 'Ättartal för Swea och Götha konungahus (1725) by Peringskiöld', work: 'Ättartal för Swea och Götha konungahus (1725)' },
];

async function catFiles(cat) {
  let files = [], cont;
  do {
    const u = new URL('https://commons.wikimedia.org/w/api.php');
    u.search = new URLSearchParams({ action: 'query', format: 'json', generator: 'categorymembers', gcmtitle: 'Category:' + cat, gcmlimit: '500', gcmtype: 'file', prop: 'imageinfo', iiprop: 'url|extmetadata', iiextmetadatafilter: 'LicenseShortName', ...(cont ? { gcmcontinue: cont } : {}) }).toString();
    const j = await (await fetch(u, { headers: UA })).json();
    for (const p of Object.values(j?.query?.pages || {})) {
      const ii = p.imageinfo?.[0];
      if (ii?.url) files.push({ title: p.title.replace(/^File:/, ''), url: ii.url.split('?')[0], lic: ii.extmetadata?.LicenseShortName?.value || null });
    }
    cont = j?.continue?.gcmcontinue;
  } while (cont);
  return files;
}

// Regler
const EXCLUDE = /^Johan Peringsk|Peringskiöld x |om Bure|Kat nr|Gamla Uppsala museum|from Busser|Monumenta-Västgötadelen|Peringskiölds-Monumenta|Erican Dynasty|\b(199\d|20\d\d)\b/i;
const SIGNUM = /\b(U|Sö|Sm|Ög|Öl|Vg|Vs|Nä|Gs|Hs|G|N|M|DR|Br|Da|Vr)\s?\d+\b/;
function classify(t) {
  if (/källa|offerlund|\boffer/i.test(t)) return 'cult_site';
  if (/högen|\bhög\b|röse/i.test(t)) return 'mound';
  if (/kyrka|domkyrka|kyrkplats|kyrkoruin|klosterruin|Templum|church of|kyrko|Monumenta/i.test(t)) return 'church';
  if (/Ättartal|titelblad|battle|\bcoin\b|Coin of|konung|dynasti|Dynasty/i.test(t)) return 'king';
  return 'other';
}
function placeName(base, type) {
  let p = base.split(' - ')[0].split(' (')[0].trim();
  if (type === 'church') p = p.replace(/\s*(gamla\s+)?(dom)?kyrk(a|oruin|plats)$/i, '').replace(/\s*klosterruin$/i, '').trim();
  return p || base;
}
function yearOf(t, fallback) { const m = t.match(/\b(16\d\d|17\d\d)\b/); return m ? m[1] : (fallback || null); }
const commonsPage = (title) => 'https://commons.wikimedia.org/wiki/File:' + encodeURIComponent(title.replace(/ /g, '_'));

// 1) hämta + dedup över kategorier (första kategorin vinner work_ref)
const seen = new Map();
for (const { cat, work } of CATEGORIES) {
  for (const f of await catFiles(cat)) {
    if (!seen.has(f.title)) seen.set(f.title, { ...f, work });
  }
}
const all = [...seen.values()];
const freeOnly = all.filter(f => /^(Public domain|PD|CC0)/i.test(f.lic || ''));
console.log(`Totalt ${all.length} filer i kategorierna; ${freeOnly.length} med PD/CC0.`);

const depictions = [], runestones = [], skipped = [];
for (const f of freeOnly) {
  if (EXCLUDE.test(f.title)) { skipped.push(f.title + '  [exkl]'); continue; }
  const sig = f.title.match(SIGNUM);
  if (sig) { runestones.push({ ...f, signum: sig[0].replace(/([A-Za-zÖÄÅ]+)\s?(\d+)/, '$1 $2') }); continue; }
  const type = classify(f.title);
  if (type === 'other') { skipped.push(f.title + '  [ej klassad]'); continue; }
  const base = f.title.replace(/\.(png|jpg|jpeg|gif|tif|tiff)$/i, '');
  depictions.push({
    subject_type: type, title: base, place_name: type === 'king' ? null : placeName(base, type),
    image_url: f.url, artist: 'Johan Peringskiöld', work_ref: f.work,
    year: yearOf(f.title, /1725/.test(f.work) ? '1725' : null),
    license_code: /cc0/i.test(f.lic) ? 'CC0' : 'PD',
    source_institution: 'Wikimedia Commons', source_url: commonsPage(f.title),
    note: 'Historisk avbildning ur ' + f.work + ' (tidigt 1700-tal). Objektet kan se annorlunda ut i dag.',
  });
}

console.log(`\n→ historical_depictions: ${depictions.length}`);
const byType = {}; depictions.forEach(d => byType[d.subject_type] = (byType[d.subject_type] || 0) + 1);
console.log('   per typ:', JSON.stringify(byType));
depictions.slice(0, 20).forEach(d => console.log(`   [${d.subject_type}] ${d.place_name} — ${d.title}`));
console.log(`\n→ runstensteckningar → inscription_media: ${runestones.length}`);
runestones.forEach(r => console.log(`   ${r.signum}  (${r.title})`));
console.log(`\n→ hoppade över: ${skipped.length}`);
skipped.forEach(s => console.log('   ' + s));

const c = new pg.Client({ host: 'aws-0-eu-north-1.pooler.supabase.com', port: 5432, user: 'postgres.mnuifmcjspeaauzehasj', password: env.SUPABASE_DB_PASSWORD, database: 'postgres', ssl: { rejectUnauthorized: false }, statement_timeout: 120000 });
await c.connect();

// runstensteckningar → matcha + dedup + insert
let rsIns = 0, rsDup = 0, rsNo = 0;
for (const r of runestones) {
  const row = (await c.query(`select id, signum from runic_inscriptions where upper(replace(signum,' ',''))=upper(replace($1,' ','')) limit 1`, [r.signum])).rows[0];
  if (!row) { rsNo++; continue; }
  const ex = (await c.query(`select 1 from inscription_media where inscription_id=$1 and media_url=$2 limit 1`, [row.id, r.url])).rows[0];
  if (ex) { rsDup++; continue; }
  if (APPLY) {
    await c.query(`insert into inscription_media (inscription_id, media_url, media_type, description, motive, photographer, source_institution, license_code, copyright_info)
      values ($1,$2,'teckning',$3,$4,$5,$6,$7,$8)`,
      [row.id, r.url, `Historisk avbildning. ${row.signum}.`, `Runsten ${row.signum} — historisk avbildning`, 'Johan Peringskiöld', 'Wikimedia Commons (Peringskiöld)', /cc0/i.test(r.lic) ? 'CC0' : 'PD', /cc0/i.test(r.lic) ? 'https://creativecommons.org/publicdomain/zero/1.0/' : 'https://creativecommons.org/publicdomain/mark/1.0/']);
  }
  rsIns++;
}

// depictions → insert on conflict do nothing
let dIns = 0;
if (APPLY) {
  for (const d of depictions) {
    const r = await c.query(`insert into historical_depictions (subject_type,title,place_name,image_url,artist,work_ref,year,license_code,source_institution,source_url,note)
      values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) on conflict (image_url) do nothing`,
      [d.subject_type, d.title, d.place_name, d.image_url, d.artist, d.work_ref, d.year, d.license_code, d.source_institution, d.source_url, d.note]);
    dIns += r.rowCount;
  }
}

console.log(`\n=== ${APPLY ? 'APPLAT' : 'DRY'} ===`);
console.log(`historical_depictions nya: ${APPLY ? dIns : depictions.length}`);
console.log(`inscription_media (runsten) nya: ${APPLY ? rsIns : runestones.length} | dedup: ${rsDup} | ingen match: ${rsNo}`);
if (!APPLY) console.log('\nKör med --apply för att skriva.');
await c.end();
