import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function deployExactMaster() {
  const masterSource = 'C:/Users/USER/.gemini/antigravity-ide/brain/3ae79501-f73b-4c4b-9e6d-4ddec9fb7aef/.user_uploaded/media_1790151917987.png';
  
  // 1. Crop actual label card (eliminating empty top minY=59 and bottom maxY=712 margins)
  // Outer card bounds: left: 8, top: 59, width: 1008, height: 654
  const croppedCard = await sharp(masterSource)
    .extract({ left: 8, top: 59, width: 1008, height: 654 })
    .toBuffer();

  // 2. Resize to exact 1200x900 (filling 2"x1.5" at 600 DPI with proper 1.5" height)
  const full1200 = await sharp(croppedCard)
    .resize(1200, 900, { fit: 'fill' })
    .toBuffer();

  // 3. Clear ONLY the interior of the barcode box with pure white #FFFFFF
  // Preserving the rounded rectangle outline intact
  const innerLeft = 36;
  const innerTop = 565;
  const innerWidth = 1128;
  const innerHeight = 237;
  const rx = 10;

  const clearMaskSvg = `
    <svg width="1200" height="900" xmlns="http://www.w3.org/2000/svg">
      <rect x="${innerLeft}" y="${innerTop}" width="${innerWidth}" height="${innerHeight}" rx="${rx}" fill="#FFFFFF"/>
    </svg>
  `;

  const cleanTemplateBuffer = await sharp(full1200)
    .composite([
      { input: Buffer.from(clearMaskSvg), top: 0, left: 0 }
    ])
    .png()
    .toBuffer();

  // 4. Save to all PNG destinations
  const pngDestinations = [
    path.resolve(__dirname, '../assets/clean_label_template.png'),
    path.resolve(__dirname, '../assets/VidhyutSaathi_Label_2x1.5in.png'),
    path.resolve(__dirname, '../../../frontend/public/clean_label_template.png'),
    path.resolve(__dirname, '../../../frontend/public/VidhyutSaathi_Label_2x1.5in.png'),
    path.resolve(__dirname, '../../../VidhyutSaathi_Label_2x1.5in.png'),
    path.resolve(__dirname, '../../storage/master_approved_exact_label.png'),
  ];

  if (fs.existsSync(path.resolve(__dirname, '../../../frontend/dist'))) {
    pngDestinations.push(
      path.resolve(__dirname, '../../../frontend/dist/clean_label_template.png'),
      path.resolve(__dirname, '../../../frontend/dist/VidhyutSaathi_Label_2x1.5in.png')
    );
  }

  for (const dest of pngDestinations) {
    await sharp(cleanTemplateBuffer).png().toFile(dest);
    console.log('✓ Deployed PNG:', dest);
  }

  // 5. Save to all JPEG destinations
  const jpegBuffer = await sharp(cleanTemplateBuffer)
    .jpeg({ quality: 98, chromaSubsampling: '4:4:4' })
    .toBuffer();

  const jpegDestinations = [
    path.resolve(__dirname, '../assets/clean_label_template.jpg'),
    path.resolve(__dirname, '../assets/master_label.jpg'),
    path.resolve(__dirname, '../../../frontend/public/master_label.jpg'),
  ];

  if (fs.existsSync(path.resolve(__dirname, '../../../frontend/dist'))) {
    jpegDestinations.push(
      path.resolve(__dirname, '../../../frontend/dist/master_label.jpg')
    );
  }

  for (const dest of jpegDestinations) {
    await sharp(jpegBuffer).toFile(dest);
    console.log('✓ Deployed JPEG:', dest);
  }

  console.log('\n✅ Full-height 2x1.5 inch master template deployed everywhere!');
}

deployExactMaster().catch(console.error);
