import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import bwipjs from 'bwip-js';

async function testFullHeightRendered() {
  const templatePath = 'C:/Users/USER/.gemini/antigravity-ide/brain/90614fe4-6c73-492e-b82c-0606b444be32/scratch/inspect_full_height_template.png';
  const serial = 'VS000001';

  // 1. Generate barcode
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

  // Barcode bars size in 1200x900:
  // width: 976 px, height: 160 px
  // left: 112 px, top: 576 px
  const resizedBarcode = await sharp(barcodePng)
    .resize(976, 160, { fit: 'fill' })
    .toBuffer();

  const serialSvg = `
    <svg width="1200" height="900" xmlns="http://www.w3.org/2000/svg">
      <style>
        .serial-text {
          font-family: Arial, Helvetica, 'Segoe UI', sans-serif;
          font-weight: 800;
          font-size: 46px;
          fill: #000000;
          text-anchor: middle;
          letter-spacing: 0.8px;
        }
      </style>
      <text x="600" y="792" class="serial-text">${serial}</text>
    </svg>
  `;

  const renderedCard = await sharp(templatePath)
    .composite([
      { input: resizedBarcode, top: 576, left: 112 },
      { input: Buffer.from(serialSvg), top: 0, left: 0 }
    ])
    .png()
    .toBuffer();

  const outTest = 'C:/Users/USER/.gemini/antigravity-ide/brain/90614fe4-6c73-492e-b82c-0606b444be32/scratch/test_full_height_rendered.png';
  await sharp(renderedCard).toFile(outTest);
  console.log('Saved test_full_height_rendered.png');
}

testFullHeightRendered().catch(console.error);
