import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function prepareTemplate() {
  const masterSource = 'C:/Users/USER/.gemini/antigravity-ide/brain/3ae79501-f73b-4c4b-9e6d-4ddec9fb7aef/.user_uploaded/media_1790151917987.png';
  
  // 1. Upscale masterSource (1024x768) to 1200x900 (ultra crisp 600 DPI for 2x1.5in)
  const master1200 = await sharp(masterSource)
    .resize(1200, 900, { kernel: 'lanczos3' })
    .toBuffer();

  // 2. Measure box outline in 1200x900:
  // In 1024x768, box outline was left: 57, right: 968, top: 476, bottom: 635.
  // In 1200x900:
  // left: 57 * 1200 / 1024 = 66.8 -> 67
  // right: 968 * 1200 / 1024 = 1134.4 -> 1134
  // top: 476 * 900 / 768 = 557.8 -> 558
  // bottom: 635 * 900 / 768 = 744.1 -> 744
  // Box Width: 1134 - 67 = 1067
  // Box Height: 744 - 558 = 186

  // We want to clear the interior of this rounded rectangle with pure white #FFFFFF
  // We leave a 3px stroke margin so the outline is 100% untouched and sharp.
  const innerLeft = 71;
  const innerTop = 560;
  const innerWidth = 1058;
  const innerHeight = 186;
  const rx = 10;

  const clearMaskSvg = `
    <svg width="1200" height="900" xmlns="http://www.w3.org/2000/svg">
      <rect x="${innerLeft}" y="${innerTop}" width="${innerWidth}" height="${innerHeight}" rx="${rx}" fill="#FFFFFF"/>
    </svg>
  `;

  const cleanTemplate = await sharp(master1200)
    .composite([
      { input: Buffer.from(clearMaskSvg), top: 0, left: 0 }
    ])
    .png()
    .toBuffer();

  // Save for inspection
  const outPath = 'C:/Users/USER/.gemini/antigravity-ide/brain/90614fe4-6c73-492e-b82c-0606b444be32/scratch/inspect_clean_template.png';
  await sharp(cleanTemplate).toFile(outPath);
  console.log('Saved inspect_clean_template.png');
}

prepareTemplate().catch(console.error);
