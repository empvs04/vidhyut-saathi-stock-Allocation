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

  // 2. Load the original label design (1024x768 - exact 4:3 2"x1.5" ratio)
  const baseLabel = await sharp(userLabelPath)
    .resize(1024, 768, { fit: 'fill' })
    .toBuffer();

  // 3. Remove inner barcode box border completely (top line at y=467, inner left/right, and bottom line)
  // while strictly PRESERVING:
  // - Top elements and the bottom border of the "10 YEARS" & "3 YEARS WARRANTY" cards at Y=454
  // - Outer card perimeter border (x=8..17, x=1004..1014)
  // - Solid black bottom footer bar (y>=655)
  const cleanBarcodeBoxSvg = Buffer.from(
    '<svg width="1024" height="768"><rect x="18" y="457" width="986" height="197" fill="#FFFFFF" /></svg>'
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

  console.log('Successfully prepared master template with preserved warranty card borders and borderless barcode container!');
}

prepareNewArtwork().catch(console.error);
