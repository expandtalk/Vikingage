// Genererar public/excursion-photos/manifest.json FRÅN serverns faktiska filer, via list.php.
// Svar på "måste jag gå igenom alla FTP-kataloger?": NEJ — ladda upp list.php en gång, kör sedan
// detta så fångas allt (nya mappar, nya filer) automatiskt. Visar en diff mot nuvarande manifest.
// Kör:  node scripts/data/sync-manifest.mjs          (skriv om manifest.json)
//       node scripts/data/sync-manifest.mjs --dry     (visa bara diffen, skriv inte)
import fs from 'fs';

const BASE = process.env.SITE || 'https://vikingage.se';
const DRY = process.argv.includes('--dry');
const LIST = `${BASE}/excursion-photos/list.php`;
const OUT = 'public/excursion-photos/manifest.json';

const r = await fetch(LIST, { headers: { 'Cache-Control': 'no-cache' } });
const ct = (r.headers.get('content-type') || '').toLowerCase();
const text = await r.text();
// Soft-404-vakt: saknas list.php serverar SPA:n index.html (200 text/html) → ingen giltig JSON.
if (!ct.includes('json') && text.trim().startsWith('<')) {
  console.error(`✗ list.php verkar inte finnas på servern (fick HTML, inte JSON).\n  Ladda upp public/excursion-photos/list.php till public_html/excursion-photos/ först.`);
  process.exit(1);
}
let server;
try { server = JSON.parse(text); } catch { console.error('✗ Kunde inte tolka svaret som JSON:', text.slice(0, 200)); process.exit(1); }

const current = fs.existsSync(OUT) ? JSON.parse(fs.readFileSync(OUT, 'utf8')) : {};
const keys = [...new Set([...Object.keys(current), ...Object.keys(server)])].sort();
let changes = 0;
console.log(`Jämför manifest mot ${LIST}\n`);
for (const k of keys) {
  const a = current[k] || [], b = server[k] || [];
  const added = b.filter((f) => !a.includes(f));
  const removed = a.filter((f) => !b.includes(f));
  if (!current[k]) { console.log(`+ NY mapp ${k} (${b.length} filer)`); changes++; }
  else if (!server[k]) { console.log(`- BORTA på servern: ${k} (${a.length} filer i manifest)`); changes++; }
  else if (added.length || removed.length) {
    console.log(`~ ${k}: ${added.length ? '+' + added.join(', +') : ''}${added.length && removed.length ? '  ' : ''}${removed.length ? '-' + removed.join(', -') : ''}`);
    changes++;
  }
}
if (!changes) { console.log('✓ Manifestet är redan i synk med servern.'); process.exit(0); }

if (DRY) { console.log(`\n(${changes} ändringar — kör utan --dry för att skriva ${OUT})`); process.exit(0); }
// Sortera nycklar + filer deterministiskt.
const sorted = {};
for (const k of Object.keys(server).sort()) sorted[k] = [...server[k]].sort();
fs.writeFileSync(OUT, JSON.stringify(sorted) + '\n');
console.log(`\n✓ Skrev ${OUT} (${Object.keys(sorted).length} mappar). Bygg + FTP:a dist/ för att publicera.`);
