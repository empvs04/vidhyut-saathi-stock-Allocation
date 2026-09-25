import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateBarcodeBuffer } from '../services/barcodeService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testFinalRenderedLabel() {
  const masterPath = path.resolve(__dirname, '../../../VidhyutSaathi_Label_2x1.5in.png');
  const serial = '0020231501';

  // Generate barcode buffer
  const barcodePng = await generateBarcodeBuffer(serial, {
    scale: 3,
    height: 12,
    includetext: false,
    paddingwidth: 0,
    paddingheight: 0,
  });

  // Master is 1200 x 900
  // In the template, the barcode box outline is:
  // top: 548, bottom: 767, left: 36, right: 1164
  // We place the barcode cleanly inside this box:
  // Barcode width ~860, height ~100, centered horizontally
  // Serial number centered below barcode
  const barcodeResized = await sharp(barcodePng)
    .resize(870, 95, { fit: 'fill' })
    .toBuffer();

  const serialSvg = Buffer.from(`
    <svg width="1200" height="900" xmlns="http://www.w3.org/2000/svg">
      <text x="600" y="738" 
            font-family="'Arial Black', Arial, 'Segoe UI', sans-serif" 
            font-weight="900" 
            font-size="52" 
            fill="#000000" 
            letter-spacing="2" 
            text-anchor="middle">${serial}</text>
    </svg>
  `);

  const compositeResult = await sharp(masterPath)
    .composite([
      { input: barcodeResized, top: 575, left: (1200 - 870) / 2 },
      { input: serialSvg, top: 0, left: 0 }
    ])
    .png()
    .toBuffer();

  const outputPath = path.resolve(__dirname, '../../storage/test_final_rendered_label.png');
  await sharp(compositeResult).toFile(outputPath);
  console.log('✓ Successfully rendered final complete label to:', outputPath);
}

testFinalRenderedLabel().catch(console.error);
