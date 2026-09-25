import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

async function buildMasterTemplateV4() {
  const masterSource = 'C:/Users/USER/.gemini/antigravity-ide/brain/3ae79501-f73b-4c4b-9e6d-4ddec9fb7aef/.user_uploaded/media_1790151917987.png';

  const W = 1200;
  const H = 900;
  const targetW = 1176;
  const leftX = 12;
  const S = targetW / 1008; // 1.166667

  // 1. Top Section (Includes top outer border, Logo, MRP box):
  //    y: 59 to 301 (height: 243)
  const topCrop = await sharp(masterSource)
    .extract({ left: 8, top: 59, width: 1008, height: 243 })
    .toBuffer();

  const topH = Math.round(243 * S); // 283 px
  const resizedTop = await sharp(topCrop)
    .resize(targetW, topH, { kernel: 'lanczos3' })
    .toBuffer();

  // 2. Cards Section (10 YEARS & 3 YEARS with authentic single borders):
  //    y: 323 to 444 (height: 121)
  const cardsCrop = await sharp(masterSource)
    .extract({ left: 8, top: 323, width: 1008, height: 121 })
    .toBuffer();

  const cardsH = Math.round(121 * S); // 141 px
  const resizedCards = await sharp(cardsCrop)
    .resize(targetW, cardsH, { kernel: 'lanczos3' })
    .toBuffer();

  // 3. Footer Section (Black bar with globe, URL, tagline & bottom rounded corners):
  //    y: 655 to 712 (height: 58)
  const footerCrop = await sharp(masterSource)
    .extract({ left: 8, top: 655, width: 1008, height: 58 })
    .toBuffer();

  // Layout positions:
  const topY = 12;
  const gap1 = 25; // Clean gap above cards
  const cardsY = topY + topH + gap1; // 12 + 283 + 25 = 320

  const gap2 = 28; // Clean gap below cards
  const boxY = cardsY + cardsH + gap2; // 320 + 141 + 28 = 489
  const boxH = 265; // Barcode box height
  const boxW = 1144;
  const boxX = (W - boxW) / 2; // 28

  const gap3 = 14;
  const footerY = boxY + boxH + gap3; // 489 + 265 + 14 = 768
  const footerH = 888 - footerY; // 120 px

  const resizedFooter = await sharp(footerCrop)
    .resize(targetW, footerH, { fit: 'fill', kernel: 'lanczos3' })
    .toBuffer();

  // Left & right border coordinates:
  // In resizedTop (width 1176), left border starts at 0, thickness is ~9.5px.
  // With leftX = 12, global x is 12 to 21.5.
  // Right border is at 1176 - 9.5 = 1166.5. With leftX = 12, global x is 1178.5 to 1188.
  // The straight part runs from y = 60 to footerY + 20.
  const vectorSvg = `
    <svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
      <!-- Seamless Left and Right outer border bands matching straight section -->
      <rect x="12" y="60" width="9.5" height="${footerY + 20 - 60}" fill="#000000"/>
      <rect x="1178.5" y="60" width="9.5" height="${footerY + 20 - 60}" fill="#000000"/>

      <!-- Barcode Container Box (Single crisp rounded rectangle with pure white interior) -->
      <rect x="${boxX}" y="${boxY}" width="${boxW}" height="${boxH}" rx="14"
            fill="#FFFFFF" stroke="#000000" stroke-width="2.5"/>
    </svg>
  `;

  // Base canvas: pure white
  const baseCanvas = await sharp({
    create: {
      width: W,
      height: H,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1 }
    }
  }).png().toBuffer();

  const composited = await sharp(baseCanvas)
    .composite([
      // Piece 1: Top section (Logo + MRP)
      { input: resizedTop, top: topY, left: leftX },
      // Piece 2: Cards section (10 YEARS & 3 YEARS)
      { input: resizedCards, top: cardsY, left: leftX },
      // Piece 3: Footer bar (Black footer)
      { input: resizedFooter, top: footerY, left: leftX },
      // Seamless side border lines & Barcode box outline
      { input: Buffer.from(vectorSvg), top: 0, left: 0 },
    ])
    .png()
    .toBuffer();

  const outTest = 'C:/Users/USER/.gemini/antigravity-ide/brain/90614fe4-6c73-492e-b82c-0606b444be32/scratch/inspect_master_v4.png';
  await sharp(composited).toFile(outTest);
  console.log('Saved inspect_master_v4.png');
}

buildMasterTemplateV4().catch(console.error);
