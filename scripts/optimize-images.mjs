/**
 * Makes photos light for phones: for every .jpg in public/images (and subfolders)
 *   - name-640.webp and name-1280.webp for the site (picked by screen size)
 *   - the .jpg itself shrunk to at most 1600 px wide (kept for link previews)
 *
 *   npm run images
 */
import { existsSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import sharp from 'sharp';

sharp.cache(false); // Windows: don't keep files open

const root = join(import.meta.dirname, '..', 'public', 'images');
const jpgs = dir =>
  readdirSync(dir).flatMap(f => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? jpgs(p) : f.endsWith('.jpg') ? [p] : [];
  });

for (const file of jpgs(root)) {
  if (existsSync(file.replace(/\.jpg$/, '-640.webp'))) continue; // done before
  const before = statSync(file).size;
  const input = await sharp(file).rotate().toBuffer(); // read fully first, then overwrite safely
  for (const width of [640, 1280]) {
    await sharp(input)
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: 72 })
      .toFile(file.replace(/\.jpg$/, `-${width}.webp`));
  }
  writeFileSync(
    file,
    await sharp(input)
      .resize({ width: 1600, withoutEnlargement: true })
      .jpeg({ quality: 80, mozjpeg: true })
      .toBuffer(),
  );
  console.log(
    `${file.slice(root.length + 1)}: ${Math.round(before / 1024)} KB → ${Math.round(statSync(file).size / 1024)} KB jpg, ${Math.round(statSync(file.replace(/\.jpg$/, '-640.webp')).size / 1024)} KB on phones`,
  );
}
