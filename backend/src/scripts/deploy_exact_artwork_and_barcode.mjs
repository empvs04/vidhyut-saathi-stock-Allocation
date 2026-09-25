import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function deployExactMaster() {
  const masterSource = 'C:/Users/USER/.gemini/antigravity-ide/brain/3ae79501-f73b-4c4b-9e6d-4ddec9fb7aef/.user_uploaded/media_1790151917987.png';
  
  // 1. Upscale masterSource (1024x768) to 1200x900 (ultra crisp 600 DPI for 2x1.5in)
  const master1200 = await sharp(masterSource)
    .resize(1200, 900, { kernel: 'lanczos3' })
    .toBuffer();

  // 2. Clear ONLY the interior of the barcode box with pure white #FFFFFF
  // Preserving the rounded rectangle outline intact
  const innerLeft = 71;
  const innerTop = 560;
  const innerWidth = 1058;
  const innerHeight = 186;
  const rx = 10;

  const clearMaskSvg = `
    <svg width="1200" height="900" xmlns="http://www.w3.org/2000/svg">
      <rect x="${innerLeft}" y="${innerTop}" width="${innerWidth}" height="${innerHeight}" rx="${rx}" fill="#FFFFFF"/>
    </svg>
  `;

  const cleanTemplateBuffer = await sharp(master1200)
    .composite([
      { input: Buffer.from(clearMaskSvg), top: 0, left: 0 }
    ])
    .png()
    .toBuffer();

  // 3. Save to all PNG destinations
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

  // 4. Save to all JPEG destinations
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

  console.log('\n✅ Master template successfully deployed everywhere!');
}

deployExactMaster().catch(console.error);
