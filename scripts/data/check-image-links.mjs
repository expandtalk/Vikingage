// Reconciliering: kontrollerar att varje bild som manifest.json PEKAR PÅ faktiskt finns på servern
// (HEAD-anrop mot https://vikingage.se). Svar på "måste jag gå igenom alla kataloger på FTP?": NEJ —
// kör detta efter uppladdning. Rapporterar 404:or (manifest → saknad fil) och, om --thumbs anges,
// vilka /thumbs/-kopior som saknas. Kan INTE upptäcka filer som finns på FTP men SAKNAS i manifestet
// (för det behövs en kataloglistning) — se check-image-dirs nedan.
// Kör:  node scripts/data/check-image-links.mjs            (kolla fullbilder)
//       node scripts/data/check-image-links.mjs --thumbs   (kolla även komprimerade thumbs)
import fs from 'fs';

const BASE = process.env.SITE || 'https://vikingage.se';
const wantThumbs = process.argv.includes('--thumbs');
const manifest = JSON.parse(fs.readFileSync('public/excursion-photos/manifest.json', 'utf8'));

// Bygg alla URL:er ur manifestet.
const urls = [];
for (const [dir, files] of Object.entries(manifest)) {
  for (const f of files) {
    urls.push({ dir, file: f, url: `${BASE}/excursion-photos/${dir}/${f}`, kind: 'full' });
    if (wantThumbs) urls.push({ dir, file: f, url: `${BASE}/excursion-photos/${dir}/thumbs/${f}`, kind: 'thumb' });
  }
}

console.log(`Kontrollerar ${urls.length} bild-URL:er mot ${BASE} …\n`);
// VIKTIGT: servern SOFT-404:ar — saknade filer ger 200 + text/html (SPA-fallbackens index.html), inte
// 404. Status räcker alltså INTE; vi hämtar bara första byten (Range) och kräver content-type image/*.
const check = async (u) => {
  try {
    const r = await fetch(u, { headers: { Range: 'bytes=0-0' } });
    const ct = (r.headers.get('content-type') || '').toLowerCase();
    return { ok: (r.status === 200 || r.status === 206) && ct.startsWith('image/'), status: r.status, ct };
  } catch { return { ok: false, status: 0, ct: 'nätfel' }; }
};

// Kör i småbatcher så vi inte spammar servern.
const missing = [];
const BATCH = 12;
for (let i = 0; i < urls.length; i += BATCH) {
  const chunk = urls.slice(i, i + BATCH);
  const res = await Promise.all(chunk.map((c) => check(c.url)));
  chunk.forEach((c, j) => { if (!res[j].ok) missing.push({ ...c, status: `${res[j].status} ${res[j].ct}` }); });
  process.stdout.write(`\r  ${Math.min(i + BATCH, urls.length)}/${urls.length}`);
}
console.log('\n');

if (!missing.length) {
  console.log(`✓ Alla ${urls.length} bilder finns på servern (${wantThumbs ? 'full + thumbs' : 'full'}).`);
} else {
  const full = missing.filter((m) => m.kind === 'full');
  const thumb = missing.filter((m) => m.kind === 'thumb');
  if (full.length) {
    console.log(`✗ ${full.length} FULLBILDER i manifestet saknas på servern (ladda upp, eller ta bort ur manifest.json):`);
    full.forEach((m) => console.log(`   [${m.status || 'nätfel'}] ${m.dir}/${m.file}`));
  }
  if (thumb.length) {
    console.log(`\n· ${thumb.length} thumbs saknas (kör make-image-thumbs.mjs + ladda upp /thumbs/; sidan faller ändå tillbaka till fullbilden):`);
    const byDir = {};
    thumb.forEach((m) => { (byDir[m.dir] ||= 0); byDir[m.dir]++; });
    Object.entries(byDir).forEach(([d, n]) => console.log(`   ${d}/thumbs/ — ${n} st`));
  }
  process.exitCode = 1;
}
