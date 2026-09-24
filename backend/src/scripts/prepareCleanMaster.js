import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function cleanMasterArtwork() {
  const rootArtworkPath = path.resolve(__dirname, '../../../VidhyutSaathi_Label_2x1.5in.png');
  const backendAssetsDir = path.resolve(__dirname, '../assets');
  const frontendPublicDir = path.resolve(__dirname, '../../../frontend/public');

  if (!fs.existsSync(rootArtworkPath)) {
    throw new Error(`Master artwork not found at ${rootArtworkPath}`);
  }

  // Load 1200 x 900 approved artwork
  const baseImg = await sharp(rootArtworkPath).toBuffer();

  // Create pure white mask over ONLY the barcode area (x: 22..1178, y: 532..766)
  // This removes the old baked-in barcode, old serial number, and inner container border
  // while strictly preserving:
  // - Top elements (Logo, Hindi tagline, MRP box, 10 Years Long Life, 3 Years Card Warranty)
  // - Outer label border (x: 10..18, x: 1180..1188)
  // - Bottom black footer bar (y >= 768)
  const maskSvg = Buffer.from(
    `<svg width="1200" height="900"><rect x="22" y="532" width="1156" height="234" fill="#FFFFFF" /></svg>`
  );

  const cleanBuffer = await sharp(baseImg)
    .composite([{ input: maskSvg, top: 0, left: 0 }])
    .png()
    .toBuffer();

  // Save to backend assets
  fs.writeFileSync(path.join(backendAssetsDir, 'clean_label_template.png'), cleanBuffer);
  fs.writeFileSync(path.join(backendAssetsDir, 'VidhyutSaathi_Label_2x1.5in.png'), cleanBuffer);

  // Save to frontend public
  fs.writeFileSync(path.join(frontendPublicDir, 'clean_label_template.png'), cleanBuffer);
  fs.writeFileSync(path.join(frontendPublicDir, 'VidhyutSaathi_Label_2x1.5in.png'), cleanBuffer);

  // Verify
  const { data, info } = await sharp(cleanBuffer).raw().toBuffer({ resolveWithObject: true });
  let count = 0;
  for (let y = 532; y < 766; y++) {
    for (let x = 22; x < 1178; x++) {
      const idx = (y * 1200 + x) * info.channels;
      if (data[idx] < 200 || data[idx + 1] < 200 || data[idx + 2] < 200) count++;
    }
  }

  console.log(`Master artwork successfully cleaned! Remaining dark pixels in barcode area: ${count}`);
}

cleanMasterArtwork().catch(console.error);
