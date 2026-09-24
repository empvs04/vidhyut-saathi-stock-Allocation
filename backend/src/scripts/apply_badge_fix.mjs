/**
 * APPLY BADGE FIX — Save to all production locations
 */
import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load the approved preview
const previewPath = 'C:/Users/USER/Desktop/barcode/backend/src/assets/badge_fix_preview.png';
const previewBuffer = fs.readFileSync(previewPath);

// Save to all output locations
const outputs = [
  'C:/Users/USER/Desktop/barcode/backend/src/assets/clean_label_template.png',
  'C:/Users/USER/Desktop/barcode/backend/src/assets/VidhyutSaathi_Label_2x1.5in.png',
  'C:/Users/USER/Desktop/barcode/frontend/public/clean_label_template.png',
  'C:/Users/USER/Desktop/barcode/frontend/public/VidhyutSaathi_Label_2x1.5in.png',
  'C:/Users/USER/Desktop/barcode/VidhyutSaathi_Label_2x1.5in.png',
];

for (const dest of outputs) {
  await sharp(previewBuffer).png().toFile(dest);
  console.log('✓ Saved:', dest);
}

// Also save JPEG versions
const jpegOutputs = [
  'C:/Users/USER/Desktop/barcode/backend/src/assets/clean_label_template.jpg',
  'C:/Users/USER/Desktop/barcode/backend/src/assets/master_label.jpg',
  'C:/Users/USER/Desktop/barcode/frontend/public/master_label.jpg',
];
for (const dest of jpegOutputs) {
  await sharp(previewBuffer).jpeg({ quality: 98, chromaSubsampling: '4:4:4' }).toFile(dest);
  console.log('✓ Saved JPEG:', dest);
}

console.log('\n✅ All production label files updated with corrected badge alignment!');
console.log('   Label dimensions remain locked at 1200×900 px (2.00" × 1.50" at 600 DPI)');
