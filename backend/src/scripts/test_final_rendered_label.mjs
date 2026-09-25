import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateBarcodeBuffer } from '../services/barcodeService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testFinalRenderedLabel() {
  const masterPath = path.resolve(__dirname, '../../../VidhyutSaathi_Label_2x1.5in.png');
  const serial = 'VS000001';

  // 1. Generate high-resolution Code 128 barcode buffer
  const barcodePng = await generateBarcodeBuffer(serial, {
    scale: 4,
    height: 12,
    includetext: false,
    paddingwidth: 0,
    paddingheight: 0,
    backgroundcolor: 'ffffff',
  });

  // 2. Barcode geometry in 1200x900 pixel coordinates:
  //    Matches user uploaded master image proportions
  const barcodeResized = await sharp(barcodePng)
    .resize(976, 122, { fit: 'fill' })
    .toBuffer();

  const serialSvg = Buffer.from(`
    <svg width="1200" height="900" xmlns="http://www.w3.org/2000/svg">
      <style>
        .serial-text {
          font-family: Arial, Helvetica, 'Segoe UI', sans-serif;
          font-weight: 800;
          font-size: 43px;
          fill: #000000;
          text-anchor: middle;
          letter-spacing: 0.8px;
        }
      </style>
      <text x="600" y="731" class="serial-text">${serial}</text>
    </svg>
  `);

  const compositeResult = await sharp(masterPath)
    .composite([
      { input: barcodeResized, top: 568, left: 112 },
      { input: serialSvg, top: 0, left: 0 }
    ])
    .png()
    .toBuffer();

  const outputPath = path.resolve(__dirname, '../../storage/test_final_rendered_label.png');
  await sharp(compositeResult).toFile(outputPath);
  console.log('✓ Successfully rendered final complete label to:', outputPath);
}

testFinalRenderedLabel().catch(console.error);
