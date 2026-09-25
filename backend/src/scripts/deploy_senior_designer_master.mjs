import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function deploySeniorDesignerMaster() {
  const masterSource = path.resolve(__dirname, '../../storage/senior_designer_preview.png');
  const masterBuffer = fs.readFileSync(masterSource);

  const pngDestinations = [
    path.resolve(__dirname, '../assets/clean_label_template.png'),
    path.resolve(__dirname, '../assets/VidhyutSaathi_Label_2x1.5in.png'),
    path.resolve(__dirname, '../../../frontend/public/clean_label_template.png'),
    path.resolve(__dirname, '../../../frontend/public/VidhyutSaathi_Label_2x1.5in.png'),
    path.resolve(__dirname, '../../../VidhyutSaathi_Label_2x1.5in.png'),
  ];

  if (fs.existsSync(path.resolve(__dirname, '../../../frontend/dist'))) {
    pngDestinations.push(
      path.resolve(__dirname, '../../../frontend/dist/clean_label_template.png'),
      path.resolve(__dirname, '../../../frontend/dist/VidhyutSaathi_Label_2x1.5in.png')
    );
  }

  for (const dest of pngDestinations) {
    await sharp(masterBuffer).png().toFile(dest);
    console.log('✓ Deployed PNG:', dest);
  }

  const jpegBuffer = await sharp(masterBuffer)
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

  console.log('\n🚀 Senior designer master label successfully deployed across all systems!');
}

deploySeniorDesignerMaster().catch(console.error);
