import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import bwipjs from 'bwip-js';

import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testBarcodeRenderFine() {
  const serial = '0020231501';
  const templatePath = path.resolve(__dirname, '../assets/clean_label_template.png');

  const barcodePng = await new Promise((resolve, reject) => {
    bwipjs.toBuffer({
      bcid: 'code128',
      text: serial,
      scale: 4,
      height: 12,
      includetext: false,
      paddingwidth: 0,
      paddingheight: 0,
      backgroundcolor: 'ffffff',
    }, (err, png) => {
      if (err) reject(err);
      else resolve(png);
    });
  });

  const serialSvg = `
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
  `;

  // Barcode dimensions in 1200x900:
  // left: 112, top: 568, width: 976, height: 122
  const resizedBarcode = await sharp(barcodePng)
    .resize(976, 122, { fit: 'fill' })
    .toBuffer();

  const renderedCard = await sharp(templatePath)
    .composite([
      { input: resizedBarcode, top: 568, left: 112 },
      { input: Buffer.from(serialSvg), top: 0, left: 0 }
    ])
    .png()
    .toBuffer();

  const outTest = 'C:/Users/USER/.gemini/antigravity-ide/brain/90614fe4-6c73-492e-b82c-0606b444be32/scratch/test_final_comparison_fine.png';
  await sharp(renderedCard).toFile(outTest);
  console.log('Saved test_final_comparison_fine.png');
}

testBarcodeRenderFine().catch(console.error);
