// Derives nav/footer logo variants from the original brand PNG.
// Run: npm run logos
import sharp from 'sharp';

const SRC = 'src/assets/brand/offsure-original.png';
const meta = await sharp(SRC).metadata();
console.log('source', meta.width, meta.height, 'alpha:', meta.hasAlpha);

// Wordmark only (drop the tagline row), trimmed tight.
const cropped = await sharp(SRC)
  .extract({ left: 0, top: 0, width: meta.width, height: Math.round(meta.height * 0.66) })
  .png()
  .toBuffer();
const wordmark = await sharp(cropped).trim().png().toBuffer();
await sharp(wordmark).toFile('src/assets/brand/wordmark.png');

// Light variant for dark backgrounds: navy letters become white, the orange U stays.
const { data, info } = await sharp(wordmark).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
for (let i = 0; i < data.length; i += 4) {
  const r = data[i], b = data[i + 2];
  if (b > r) { data[i] = 255; data[i + 1] = 255; data[i + 2] = 255; }
}
await sharp(data, { raw: info }).png().toFile('src/assets/brand/wordmark-light.png');
const m2 = await sharp('src/assets/brand/wordmark.png').metadata();
console.log('wordmark', m2.width, m2.height);
