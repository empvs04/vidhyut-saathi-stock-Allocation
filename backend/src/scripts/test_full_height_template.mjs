import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

async function testFullHeightTemplate() {
  const croppedSource = 'C:/Users/USER/.gemini/antigravity-ide/brain/90614fe4-6c73-492e-b82c-0606b444be32/scratch/cropped_exact_label.png';

  // 1. Resize cropped label to exactly 1200x900 (filling 2"x1.5" completely, no top/bottom dead space)
  const full1200 = await sharp(croppedSource)
    .resize(1200, 900, { fit: 'fill' })
    .toBuffer();

  // 2. Clear interior of barcode box:
  // Box outline is: left ~32, right ~1168, top ~562, bottom ~806
  // White interior mask:
  const innerLeft = 36;
  const innerTop = 565;
  const innerWidth = 1128;
  const innerHeight = 237;
  const rx = 10;

  const clearMaskSvg = `
    <svg width="1200" height="900" xmlns="http://www.w3.org/2000/svg">
      <rect x="${innerLeft}" y="${innerTop}" width="${innerWidth}" height="${innerHeight}" rx="${rx}" fill="#FFFFFF"/>
    </svg>
  `;

  const cleanFullTemplate = await sharp(full1200)
    .composite([
      { input: Buffer.from(clearMaskSvg), top: 0, left: 0 }
    ])
    .png()
    .toBuffer();

  const outPath = 'C:/Users/USER/.gemini/antigravity-ide/brain/90614fe4-6c73-492e-b82c-0606b444be32/scratch/inspect_full_height_template.png';
  await sharp(cleanFullTemplate).toFile(outPath);
  console.log('Saved inspect_full_height_template.png');
}

testFullHeightTemplate().catch(console.error);
