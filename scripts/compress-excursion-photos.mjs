// Komprimerar utflyktsfoton: images/<mapp>/*.{jpg,jpeg,png}
//   -> public/excursion-photos/<slug>/<slug>.jpg (max 1500px, mozjpeg q78).
// EXIF-rotation respekteras (mobilfoton). Rena URL-vänliga slug-namn.
// Kör: node scripts/compress-excursion-photos.mjs
import sharp from 'sharp';
import { readdir, mkdir, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';

const SRC_ROOT = 'images';
const DEST_ROOT = 'public/excursion-photos';
const MAX_W = 1500, QUALITY = 78;

const slug = (s) =>
  s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const dirs = await readdir(SRC_ROOT, { withFileTypes: true }).catch(() => []);
for (const d of dirs) {
  if (!d.isDirectory()) continue;
  const srcDir = path.join(SRC_ROOT, d.name);
  const destDir = path.join(DEST_ROOT, slug(d.name));
  await mkdir(destDir, { recursive: true });
  for (const f of await readdir(srcDir)) {
    if (!/\.(jpe?g|png)$/i.test(f)) continue;
    const out = path.join(destDir, slug(f.replace(/\.(jpe?g|png)$/i, '')) + '.jpg');
    await sharp(path.join(srcDir, f))
      .rotate()
      .resize({ width: MAX_W, withoutEnlargement: true })
      .jpeg({ quality: QUALITY, mozjpeg: true })
      .toFile(out);
    const { size } = await stat(out);
    console.log(`${out}  (${(size / 1024).toFixed(0)} KB)`);
  }
}

// Manifest (slug-mapp -> filer) för galleriet på utflyktsdetaljsidan.
const manifest = {};
for (const d of await readdir(DEST_ROOT, { withFileTypes: true }).catch(() => [])) {
  if (!d.isDirectory()) continue;
  const files = (await readdir(path.join(DEST_ROOT, d.name))).filter((f) => /\.jpg$/i.test(f)).sort();
  if (files.length) manifest[d.name] = files;
}
await writeFile(path.join(DEST_ROOT, 'manifest.json'), JSON.stringify(manifest));
console.log('manifest.json skrivet:', Object.keys(manifest).length, 'mappar');
