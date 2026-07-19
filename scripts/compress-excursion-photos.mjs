// Komprimerar utflyktsfoton: images/<mapp>/*.{jpg,jpeg,png}
//   -> public/excursion-photos/<slug>/<slug>.jpg (max 1500px, mozjpeg q78).
// EXIF-rotation respekteras (mobilfoton). Rena URL-vänliga slug-namn.
// Kör: node scripts/compress-excursion-photos.mjs
import sharp from 'sharp';
import { readdir, mkdir, stat, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

// Handplockade thumbnail-motiv (visuellt granskade 2026-07-19): visa MONUMENTET,
// aldrig informationsskyltar. `file` = källbild i destmappen, `position` = beskärning,
// `extra` = ytterligare namngivna thumbs när flera utflykter delar samma fotomapp.
const THUMB_PICKS = {
  'haga-hogen-kungs-bjorns-hog': { file: 'img-1860.jpg' },            // högen i landskapet
  'boglosa': { file: 'img-0639.jpg' },                                // röda figurer & djur
  'runor-u357': { file: 'img-1746.jpg' },                             // hela runstenen
  'gaseborg': { file: 'img-0751.jpg' },                               // utsikten över Görvälnfjärden
  'morastenar': { file: 'img-1868.jpg' },                             // stenraden i stenhuset
  'rosaring-processionsvag-labyrint': { file: 'img-1189-1.jpg' },     // processionsvägen genom tallskogen
  'langhundraleden-broborg': {
    file: 'img-1743.jpg',                                             // borgplatån (Broborg)
    extra: [{ name: 'thumb-2.jpg', file: 'img-1744.jpg' }],           // utsikten över ledens dalgång (Långhundraleden)
  },
  'ismantorp-borg-oland': {
    file: 'img-0940.jpg',                                             // Ismantorp (bekräftat bra)
    extra: [{ name: 'thumb-2.jpg', file: 'img-0942.jpg' }],           // ringmur + husgrunder (Ölands fornborgar)
  },
  'karlevistenen': { position: 'centre' },                            // runorna mitt på stenen, inte foten
  'ingemarstaget': { position: 'top' },                               // visa ansiktet, inte bara kroppen
};

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
    if (existsSync(out)) continue; // originalen ändras aldrig — hoppa över redan komprimerade
    await sharp(path.join(srcDir, f))
      .rotate()
      .resize({ width: MAX_W, withoutEnlargement: true })
      .jpeg({ quality: QUALITY, mozjpeg: true })
      .toFile(out);
    const { size } = await stat(out);
    console.log(`${out}  (${(size / 1024).toFixed(0)} KB)`);
  }
}

// Thumbnails: en snabbladdad thumb.jpg (480×300, q70) per mapp ur första bilden —
// används av utflyktslistan (/excursions). Konvention: finns photoDir → finns thumb.
const THUMB_W = 480, THUMB_H = 300, THUMB_Q = 70;
const isThumb = (f) => /^thumb(-\d+)?\.jpg$/i.test(f);
for (const d of await readdir(DEST_ROOT, { withFileTypes: true }).catch(() => [])) {
  if (!d.isDirectory()) continue;
  const dir = path.join(DEST_ROOT, d.name);
  const files = (await readdir(dir)).filter((f) => /\.jpg$/i.test(f) && !isThumb(f)).sort();
  if (!files.length) continue;
  const pick = THUMB_PICKS[d.name] ?? {};
  const jobs = [
    { name: 'thumb.jpg', file: pick.file ?? files[0], position: pick.position ?? 'attention' },
    ...(pick.extra ?? []).map((e) => ({ position: 'attention', ...e })),
  ];
  for (const job of jobs) {
    if (!files.includes(job.file)) { console.error(`SAKNAS: ${d.name}/${job.file}`); continue; }
    const out = path.join(dir, job.name);
    await sharp(path.join(dir, job.file))
      .resize({ width: THUMB_W, height: THUMB_H, fit: 'cover', position: job.position })
      .jpeg({ quality: THUMB_Q, mozjpeg: true })
      .toFile(out);
    const { size } = await stat(out);
    console.log(`${out} ← ${job.file}  (${(size / 1024).toFixed(0)} KB)`);
  }
}

// Manifest (slug-mapp -> filer, exkl. thumb) för galleriet på utflyktsdetaljsidan.
const manifest = {};
for (const d of await readdir(DEST_ROOT, { withFileTypes: true }).catch(() => [])) {
  if (!d.isDirectory()) continue;
  const files = (await readdir(path.join(DEST_ROOT, d.name)))
    .filter((f) => /\.jpg$/i.test(f) && !isThumb(f)).sort();
  if (files.length) manifest[d.name] = files;
}
await writeFile(path.join(DEST_ROOT, 'manifest.json'), JSON.stringify(manifest));
console.log('manifest.json skrivet:', Object.keys(manifest).length, 'mappar');
