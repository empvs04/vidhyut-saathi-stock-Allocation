import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { buildBadgeSvg } from './render_screenshot2_badge.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function applyToAll() {
  const baseTemplate = path.resolve(__dirname, '../../../VidhyutSaathi_Label_2x1.5in.png');
  const baseBuf = fs.readFileSync(baseTemplate);

  const svgStr = buildBadgeSvg();
  const resultBuf = await sharp(baseBuf)
    .composite([{ input: Buffer.from(svgStr), top: 0, left: 0 }])
    .png()
    .toBuffer();

  const outputs = [
    path.resolve(__dirname, '../assets/clean_label_template.png'),
    path.resolve(__dirname, '../assets/VidhyutSaathi_Label_2x1.5in.png'),
    path.resolve(__dirname, '../../../frontend/public/clean_label_template.png'),
    path.resolve(__dirname, '../../../frontend/public/VidhyutSaathi_Label_2x1.5in.png'),
    path.resolve(__dirname, '../../../VidhyutSaathi_Label_2x1.5in.png'),
  ];

  for (const dest of outputs) {
    await sharp(resultBuf).png().toFile(dest);
    console.log('✓ Saved PNG:', dest);
  }

  const jpegOutputs = [
    path.resolve(__dirname, '../assets/clean_label_template.jpg'),
    path.resolve(__dirname, '../assets/master_label.jpg'),
    path.resolve(__dirname, '../../../frontend/public/master_label.jpg'),
  ];
  for (const dest of jpegOutputs) {
    await sharp(resultBuf).jpeg({ quality: 98, chromaSubsampling: '4:4:4' }).toFile(dest);
    console.log('✓ Saved JPEG:', dest);
  }

  console.log('\n✅ All production label templates updated successfully with Screenshot 2 design!');
}

applyToAll().catch(console.error);
