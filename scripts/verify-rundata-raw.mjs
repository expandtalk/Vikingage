// P0: jämför laddade radantal i rundata_raw mot dumpens manifest.
// Kör: node scripts/verify-rundata-raw.mjs <sökväg-till-load-logg>
import { readFileSync } from 'node:fs';

const logPath = process.argv[2];
const log = readFileSync(logPath, 'utf8');
const manifest = JSON.parse(readFileSync('scripts/data/rundata-raw/manifest.json', 'utf8')).tables;

const db = {};
for (const line of log.split('\n')) {
  const m = line.trim().match(/^([a-zA-Z0-9_-]+)=(\d+)$/);
  if (m) db[m[1]] = +m[2];
}

let ok = 0;
const bad = [];
for (const [t, n] of Object.entries(manifest)) {
  const d = db[t.toLowerCase()];
  if (d === n) ok++;
  else bad.push(`${t}: dump=${n} db=${d ?? 'SAKNAS'}`);
}
console.log(`Tabeller OK: ${ok} / ${Object.keys(manifest).length}`);
if (bad.length) {
  console.log('AVVIKELSER:');
  bad.forEach((b) => console.log(' ', b));
}
console.log('Totalt i DB:', Object.values(db).reduce((a, b) => a + b, 0));
