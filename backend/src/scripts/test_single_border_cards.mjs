import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testSingleBorderCards() {
  const masterPath = path.resolve(__dirname, '../../storage/senior_designer_preview.png');
  const baseImg = sharp(masterPath);

  // Card coordinates in 1200x900:
  // Left Box: x: 26, y: 350, width: 566, height: 142, rx: 16
  // Right Box: x: 608, y: 350, width: 566, height: 142, rx: 16
  // Middle Divider at x: 600, y1: 360, y2: 482

  // 1. First extract the inner contents of Left card (excluding borders):
  // x: 34 to 584 (width 550), y: 356 to 486 (height 130)
  const leftInner = await sharp(masterPath)
    .extract({ left: 34, top: 356, width: 550, height: 130 })
    .toBuffer();

  // 2. Extract inner contents of Right card (excluding borders):
  // x: 616 to 1166 (width 550), y: 356 to 486 (height 130)
  const rightInner = await sharp(masterPath)
    .extract({ left: 616, top: 356, width: 550, height: 130 })
    .toBuffer();

  // 3. Clear the entire card band (y: 340 to 500, x: 20 to 1180) to pure white
  // keeping outer black border at x: 0..18 and x: 1182..1200 intact
  const clearBandSvg = Buffer.from(`
    <svg width="1200" height="900" xmlns="http://www.w3.org/2000/svg">
      <rect x="20" y="340" width="1160" height="165" fill="#FFFFFF"/>
    </svg>
  `);

  // 4. Create single-border SVG for both cards + middle divider line
  // Box geometry: single clean 2px outline, rounded corners
  const boxW = 566;
  const boxH = 140;
  const boxY = 352;
  const leftX = 26;
  const rightX = 608;
  const rx = 16;
  const strokeColor = '#111111';
  const strokeWidth = 2.0;

  const singleBorderSvg = Buffer.from(`
    <svg width="1200" height="900" xmlns="http://www.w3.org/2000/svg">
      <!-- Left Card Single Border -->
      <rect x="${leftX}" y="${boxY}" width="${boxW}" height="${boxH}" rx="${rx}"
            fill="none" stroke="${strokeColor}" stroke-width="${strokeWidth}"/>

      <!-- Right Card Single Border -->
      <rect x="${rightX}" y="${boxY}" width="${boxW}" height="${boxH}" rx="${rx}"
            fill="none" stroke="${strokeColor}" stroke-width="${strokeWidth}"/>

      <!-- Middle Divider between the two cards -->
      <line x1="600" y1="362" x2="600" y2="482" stroke="${strokeColor}" stroke-width="${strokeWidth}"/>
    </svg>
  `);

  const resultBuffer = await sharp(masterPath)
    .composite([
      { input: clearBandSvg, top: 0, left: 0 },
      { input: leftInner, top: 356, left: 34 },
      { input: rightInner, top: 356, left: 616 },
      { input: singleBorderSvg, top: 0, left: 0 }
    ])
    .png()
    .toBuffer();

  const previewCrop = await sharp(resultBuffer)
    .extract({ left: 15, top: 340, width: 1170, height: 165 })
    .toFile(path.resolve(__dirname, '../../storage/single_border_crop_preview.png'));

  await sharp(resultBuffer).toFile(path.resolve(__dirname, '../../storage/test_single_border_label.png'));
  console.log('✓ Successfully created clean single-border card test!');
}

testSingleBorderCards().catch(console.error);
