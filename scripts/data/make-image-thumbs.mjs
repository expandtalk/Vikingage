// Genererar KOMPRIMERADE thumbs för galleriets rutnät (full upplösning behålls för lightboxen).
// Sidan laddar /excursion-photos/<dir>/thumbs/<fil> i rutnätet och /excursion-photos/<dir>/<fil>
// (full) när man klickar. Kräver `sharp`:  npm i -D sharp
//
// Så här:
//   1. Ladda NER en lokal kopia av bildmapparna från FTP (public_html/excursion-photos/<dir>/)
//      till en mapp, t.ex.  ./_thumbsrc/<dir>/*.jpg
//   2. node scripts/data/make-image-thumbs.mjs ./_thumbsrc
//      → skapar ./_thumbsrc/<dir>/thumbs/<fil> (max 800px bred, ~72% kvalitet)
//   3. Ladda upp varje <dir>/thumbs/-mapp till motsvarande mapp på FTP.
//   4. node scripts/data/check-image-links.mjs --thumbs   (verifiera att de finns)
//
// Rör ALDRIG originalen — skriver bara nya filer i undermappen thumbs/.
import fs from 'fs';
import path from 'path';

const ROOT = process.argv[2];
if (!ROOT) { console.error('Ange källmapp: node scripts/data/make-image-thumbs.mjs ./_thumbsrc'); process.exit(1); }

let sharp;
try { sharp = (await import('sharp')).default; }
catch { console.error('Saknar sharp. Kör:  npm i -D sharp'); process.exit(1); }

const MAX_W = 800;      // rutnätskorten är små → 800px räcker och räcker för retina-thumbs
const QUALITY = 72;
const IMG = /\.(jpe?g|png|webp)$/i;

const dirs = fs.readdirSync(ROOT, { withFileTypes: true }).filter((d) => d.isDirectory() && d.name !== 'thumbs');
let made = 0, skipped = 0;
for (const d of dirs) {
  const dir = path.join(ROOT, d.name);
  const outDir = path.join(dir, 'thumbs');
  const files = fs.readdirSync(dir).filter((f) => IMG.test(f) && !/^thumb\./i.test(f));
  if (!files.length) continue;
  fs.mkdirSync(outDir, { recursive: true });
  for (const f of files) {
    const out = path.join(outDir, f);
    if (fs.existsSync(out)) { skipped++; continue; }
    try {
      // Behåll filändelsen; jpeg/webp får kvalitet, png komprimeras. Rotera efter EXIF.
      const ext = path.extname(f).toLowerCase();
      let pipe = sharp(path.join(dir, f)).rotate().resize({ width: MAX_W, withoutEnlargement: true });
      if (ext === '.png') pipe = pipe.png({ compressionLevel: 9 });
      else if (ext === '.webp') pipe = pipe.webp({ quality: QUALITY });
      else pipe = pipe.jpeg({ quality: QUALITY, mozjpeg: true });
      await pipe.toFile(out);
      made++;
    } catch (e) { console.error(`  fel: ${d.name}/${f} — ${e.message}`); }
  }
  console.log(`${d.name}: ${files.length} bilder → ${outDir}`);
}
console.log(`\nKlart: ${made} thumbs skapade, ${skipped} fanns redan. Ladda upp <dir>/thumbs/ till FTP.`);
