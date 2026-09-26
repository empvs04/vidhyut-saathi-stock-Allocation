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

  // 1. Top Section (Includes top outer border, Logo, Hindi tagline, MRP box with full bottom border):
  //    y: 59 to 316 (height: 257)
  const topCrop = await sharp(masterSource)
    .extract({ left: 8, top: 59, width: 1008, height: 257 })
    .toBuffer();
  const topH = Math.round(257 * S); // 300 px
  const resizedTop = await sharp(topCrop)
    .resize(targetW, topH, { kernel: 'lanczos3' })
    .toBuffer();

  // 2. Cards Section (10 YEARS & 3 YEARS with full top AND bottom single borders intact):
  //    y: 323 to 456 (height: 133)
  const cardsCrop = await sharp(masterSource)
    .extract({ left: 8, top: 323, width: 1008, height: 133 })
    .toBuffer();
  const cardsH = Math.round(133 * S); // 155 px
  const resizedCards = await sharp(cardsCrop)
    .resize(targetW, cardsH, { kernel: 'lanczos3' })
    .toBuffer();

  // 3. Footer Section (Black bar with globe, URL, tagline & bottom rounded corners):
  //    y: 654 to 712 (height: 58)
  const footerCrop = await sharp(masterSource)
    .extract({ left: 8, top: 654, width: 1008, height: 58 })
    .toBuffer();

  // Positions:
  const topY = 12;
  const gap1 = 12; // Gap between Top header and Cards
  const cardsY = topY + topH + gap1; // 12 + 300 + 12 = 324
  const cardsBottom = cardsY + cardsH; // 324 + 155 = 479

  // Company Name & Barcode Box:
  const companyNameY = 516; // Perfectly centered between cardsBottom (479) and boxY (540)
  const boxY = 540;
  const boxH = 216;
  const boxW = 1144;
  const boxX = (W - boxW) / 2; // 28

  const gap3 = 12;
  const footerY = boxY + boxH + gap3; // 540 + 216 + 12 = 768
  const footerH = 888 - footerY; // 120 px

  const resizedFooter = await sharp(footerCrop)
    .resize(targetW, footerH, { fit: 'fill', kernel: 'lanczos3' })
    .toBuffer();

  // SVG for border bands, barcode box, and company name text
  const vectorSvg = `
    <svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
      <style>
        .company-name {
          font-family: Arial, Helvetica, 'Segoe UI', sans-serif;
          font-weight: 800;
          font-size: 27px;
          fill: #000000;
          text-anchor: middle;
          letter-spacing: 1.8px;
        }
      </style>

      <!-- Seamless Left and Right outer border bands matching straight section -->
      <rect x="12" y="60" width="9.5" height="${footerY + 20 - 60}" fill="#000000"/>
      <rect x="1178.5" y="60" width="9.5" height="${footerY + 20 - 60}" fill="#000000"/>

      <!-- Company Name Text Line below cards -->
      <text x="${W / 2}" y="${companyNameY}" class="company-name">VIDHYUT SAATHI ENERGY SAVERS PVT. LTD.</text>

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
      // Seamless side border lines, Company Name, and Barcode box outline
      { input: Buffer.from(vectorSvg), top: 0, left: 0 },
    ])
    .png()
    .toBuffer();

  const outTest = 'C:/Users/USER/.gemini/antigravity-ide/brain/90614fe4-6c73-492e-b82c-0606b444be32/scratch/inspect_master_v4.png';
  await sharp(composited).toFile(outTest);
  console.log('Saved inspect_master_v4.png with Company Name line');
}

buildMasterTemplateV4().catch(console.error);
