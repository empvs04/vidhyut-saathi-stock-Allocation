import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function optimizeAssets() {
  const pngPath = path.resolve(__dirname, '../assets/clean_label_template.png');
  const jpgPath = path.resolve(__dirname, '../assets/clean_label_template.jpg');

  await sharp(pngPath)
    .jpeg({ quality: 95, chromaSubsampling: '4:4:4' }) // maximum color fidelity for print
    .toFile(jpgPath);

  console.log('Optimized clean_label_template.jpg created for super-fast PDF embedding!');
}

optimizeAssets().catch(console.error);
