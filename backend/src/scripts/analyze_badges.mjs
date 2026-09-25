/**
 * Analyze badge pixel regions in the current label PNG
 */
import sharp from 'sharp';

const labelPath = 'C:/Users/USER/Desktop/barcode/backend/src/assets/clean_label_template.png';

const img = sharp(labelPath);
const meta = await img.metadata();
console.log('Image dimensions:', meta.width, 'x', meta.height);

// Get raw pixel data
const { data, info } = await sharp(labelPath)
  .raw()
  .toBuffer({ resolveWithObject: true });

console.log('Actual image info:', info.width, 'x', info.height, 'channels:', info.channels);

const w = info.width;
const h = info.height;
const channels = info.channels;

// Scan column x=50 (inside left badge area) for vertical dark/light transitions
const x = 50;
let prevDark = null;
const transitions = [];
for (let y = 0; y < h; y++) {
  const r = data[(y * w + x) * channels];
  const isDark = r < 100;
  if (isDark !== prevDark) {
    transitions.push({ y, isDark, r });
    prevDark = isDark;
  }
}
console.log('\nVertical transitions at x=50:');
transitions.forEach(t => console.log(`  y=${t.y}: ${t.isDark ? 'DARK' : 'LIGHT'} (r=${t.r})`));

// Scan for badge rows - scan many columns at y=40%-60% of height
const sampleY = Math.round(h * 0.48);
console.log(`\nSample row brightness at y=${sampleY}:`);
const rowSamples = [];
for (let sx = 0; sx < w; sx += 20) {
  const r = data[(sampleY * w + sx) * channels];
  rowSamples.push(`x${sx}:${r}`);
}
console.log(rowSamples.join(', '));
