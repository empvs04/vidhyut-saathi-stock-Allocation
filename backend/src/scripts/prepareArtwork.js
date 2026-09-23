import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function prepareNewArtwork() {
  const userLabelPath = 'C:/Users/USER/.gemini/antigravity-ide/brain/3ae79501-f73b-4c4b-9e6d-4ddec9fb7aef/.user_uploaded/media_1790151917987.png';
  const userLogoPath = 'C:/Users/USER/.gemini/antigravity-ide/brain/3ae79501-f73b-4c4b-9e6d-4ddec9fb7aef/.user_uploaded/media_1790151891345.jpg';

  const backendAssetsDir = path.resolve(__dirname, '../assets');
  const frontendPublicDir = path.resolve(__dirname, '../../../frontend/public');

  // Ensure directories exist
  fs.mkdirSync(backendAssetsDir, { recursive: true });
  fs.mkdirSync(frontendPublicDir, { recursive: true });

  // 1. Process Color Logo to Pure Black & Transparent/White if needed
  let processedLogoBuffer = null;
  if (fs.existsSync(userLogoPath)) {
    // Threshold or convert logo to pure black
    processedLogoBuffer = await sharp(userLogoPath)
      .greyscale()
      .linear(1.5, -40) // enhance contrast
      .threshold(180) // pure black & white
      .toBuffer();
  }

  // 2. Load the new label design (1024x768)
  const baseLabel = await sharp(userLabelPath)
    .resize(1024, 768, { fit: 'fill' })
    .toBuffer();

  // 3. White out the inner barcode box area (leaving outer borders intact)
  // In 1024x768:
  // Barcode box outer border: x=34 to 990, y=465 to 650
  // Inner white area: x=40, y=475, width=944, height=165
  const cleanBarcodeBoxSvg = Buffer.from(
    `<svg width="1024" height="768">
      <rect x="42" y="475" width="940" height="165" fill="#FFFFFF" />
    </svg>`
  );

  const cleanLabelBuffer = await sharp(baseLabel)
    .composite([
      {
        input: cleanBarcodeBoxSvg,
        top: 0,
        left: 0,
      },
    ])
    .png()
    .toBuffer();

  // Save to backend assets
  await sharp(cleanLabelBuffer).png().toFile(path.join(backendAssetsDir, 'clean_label_template.png'));
  await sharp(cleanLabelBuffer).jpeg({ quality: 98, chromaSubsampling: '4:4:4' }).toFile(path.join(backendAssetsDir, 'clean_label_template.jpg'));
  await sharp(baseLabel).jpeg({ quality: 98, chromaSubsampling: '4:4:4' }).toFile(path.join(backendAssetsDir, 'master_label.jpg'));

  // Save to frontend public
  await sharp(cleanLabelBuffer).png().toFile(path.join(frontendPublicDir, 'clean_label_template.png'));
  await sharp(baseLabel).jpeg({ quality: 98, chromaSubsampling: '4:4:4' }).toFile(path.join(frontendPublicDir, 'master_label.jpg'));

  console.log('Successfully prepared new monochrome label template and assets (1024x768, 2"x1.5")!');
}

prepareNewArtwork().catch(console.error);
