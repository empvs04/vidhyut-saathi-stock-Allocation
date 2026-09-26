import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

async function testMatch() {
  const masterPath = 'C:/Users/USER/.gemini/antigravity-ide/brain/90614fe4-6c73-492e-b82c-0606b444be32/.user_uploaded/media_1790416810186.png';
  const masterImg = sharp(masterPath);
  const meta = await masterImg.metadata();
  console.log('Master dims:', meta.width, 'x', meta.height);

  // 1. Create clean template by whitening the text area:
  // Text is between x = 75 and x = 950, y = 496 and y = 565.
  // The box borders are at x=20..22 and x=1002..1004, top border at y=412, bottom border at y=576.
  // So a white patch from x=50, y=494 with width=924, height=76 is 100% safe inside the box!
  const whitePatchSvg = `
    <svg width="${meta.width}" height="${meta.height}" xmlns="http://www.w3.org/2000/svg">
      <rect x="50" y="494" width="924" height="76" fill="#ffffff" />
    </svg>
  `;

  const cleanTemplate = await sharp(masterPath)
    .composite([{ input: Buffer.from(whitePatchSvg), top: 0, left: 0 }])
    .png()
    .toBuffer();

  await sharp(cleanTemplate).toFile('C:/Users/USER/.gemini/antigravity-ide/brain/90614fe4-6c73-492e-b82c-0606b444be32/scratch/range_clean_template.png');

  // Let's test font rendering for "0020231501 ----- 0020231510"
  // Let's test a few font sizes and weights
  for (const fontSize of [44, 46, 48, 50, 52]) {
    for (const letterSpacing of [0, 0.5, 1, 1.5, 2]) {
      const textSvg = `
        <svg width="${meta.width}" height="${meta.height}" xmlns="http://www.w3.org/2000/svg">
          <style>
            .serial-range {
              font-family: Arial, Helvetica, 'Segoe UI', sans-serif;
              font-weight: 800;
              font-size: ${fontSize}px;
              fill: #000000;
              text-anchor: middle;
              letter-spacing: ${letterSpacing}px;
            }
          </style>
          <text x="512" y="546" class="serial-range">0020231501 ----- 0020231510</text>
        </svg>
      `;

      const rendered = await sharp(cleanTemplate)
        .composite([{ input: Buffer.from(textSvg), top: 0, left: 0 }])
        .png()
        .toBuffer();

      const outName = `C:/Users/USER/.gemini/antigravity-ide/brain/90614fe4-6c73-492e-b82c-0606b444be32/scratch/font_test_s${fontSize}_ls${letterSpacing}.png`;
      await sharp(rendered)
        .extract({ left: 150, top: 490, width: 724, height: 80 })
        .toFile(outName);
    }
  }

  // Also crop the original master text for direct comparison
  await sharp(masterPath)
    .extract({ left: 150, top: 490, width: 724, height: 80 })
    .toFile('C:/Users/USER/.gemini/antigravity-ide/brain/90614fe4-6c73-492e-b82c-0606b444be32/scratch/original_master_text_crop.png');

  console.log('Saved test images.');
}

testMatch().catch(console.error);
