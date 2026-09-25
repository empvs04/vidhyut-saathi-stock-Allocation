import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function buildSeniorDesignerMaster() {
  const pristinePath = path.resolve(__dirname, '../../storage/clean_pristine_template.png');
  const userMasterPath = path.resolve(__dirname, '../../storage/new_master_user_label.png');

  // 1. Extract the exact barcode box outline from userMaster
  // In userMaster (1200x900), the barcode box outline is at top: 540, left: 24, width: 1152, height: 232
  const boxOutlineCrop = await sharp(userMasterPath)
    .extract({ left: 24, top: 540, width: 1152, height: 232 })
    .toBuffer();

  // 2. Corner border repair SVG (fixes old test artifacts at top corners: x=20..60, y=10..35)
  // Ensure the black perimeter border is 100% solid, crisp, and continuous
  const cornerFixSvg = Buffer.from(`
    <svg width="1200" height="900" xmlns="http://www.w3.org/2000/svg">
      <!-- Fill top left corner defect -->
      <rect x="18" y="10" width="45" height="25" fill="#000000"/>
      <!-- Fill top right corner defect -->
      <rect x="1135" y="10" width="45" height="25" fill="#000000"/>
    </svg>
  `);

  // 3. Composite onto pristine base
  const masterBuffer = await sharp(pristinePath)
    .composite([
      { input: boxOutlineCrop, top: 540, left: 24 },
      { input: cornerFixSvg, top: 0, left: 0 }
    ])
    .png()
    .toBuffer();

  // 4. Save to all production locations
  const outputs = [
    path.resolve(__dirname, '../assets/clean_label_template.png'),
    path.resolve(__dirname, '../assets/VidhyutSaathi_Label_2x1.5in.png'),
    path.resolve(__dirname, '../../../frontend/public/clean_label_template.png'),
    path.resolve(__dirname, '../../../frontend/public/VidhyutSaathi_Label_2x1.5in.png'),
    path.resolve(__dirname, '../../../VidhyutSaathi_Label_2x1.5in.png'),
    path.resolve(__dirname, '../../storage/master_approved_exact_label.png')
  ];

  for (const dest of outputs) {
    await sharp(masterBuffer).png().toFile(dest);
    console.log('✓ Saved PNG to:', dest);
  }

  const jpegOutputs = [
    path.resolve(__dirname, '../assets/clean_label_template.jpg'),
    path.resolve(__dirname, '../assets/master_label.jpg'),
    path.resolve(__dirname, '../../../frontend/public/master_label.jpg'),
  ];
  for (const dest of jpegOutputs) {
    await sharp(masterBuffer).jpeg({ quality: 98, chromaSubsampling: '4:4:4' }).toFile(dest);
    console.log('✓ Saved JPEG to:', dest);
  }

  console.log('\n🌟 Perfect senior designer master label created successfully!');
}

buildSeniorDesignerMaster().catch(console.error);
