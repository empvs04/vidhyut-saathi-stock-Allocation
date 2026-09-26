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

  // 3. Footer Section (100% UNSTRETCHED natural 1:1 ratio, globe and text in natural proportions):
  //    y: 654 to 712 (height: 58)
  const footerCrop = await sharp(masterSource)
    .extract({ left: 8, top: 654, width: 1008, height: 58 })
    .toBuffer();
  const footerH = Math.round(58 * S); // 68 px
  const resizedFooter = await sharp(footerCrop)
    .resize(targetW, footerH, { kernel: 'lanczos3' }) // 1:1 unstretched
    .toBuffer();

  const footerY = 888 - footerH; // 820 px

  // Positions:
  const topY = 12;
  const gap1 = 12; // Gap between Top header and Cards
  const cardsY = topY + topH + gap1; // 12 + 300 + 12 = 324
  const cardsBottom = cardsY + cardsH; // 324 + 155 = 479

  // Company Name (Centered between cardsBottom 479 and boxY 540)
  const companyNameY = 516;

  // Barcode Box (Left & Right margins exactly matching the cards above: x = 42 to 1158)
  const boxY = 540;
  const gap3 = 14;
  const boxH = footerY - gap3 - boxY; // 820 - 14 - 540 = 266 px
  const boxX = 42;
  const boxW = 1116; // 1200 - 42 - 42 = 1116 px

  // SVG for border bands, barcode box, and company name text (BOLDER)
  const vectorSvg = `
    <svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
      <style>
        .company-name {
          font-family: Arial, Helvetica, 'Segoe UI', sans-serif;
          font-weight: 900;
          font-size: 27px;
          fill: #000000;
          stroke: #000000;
          stroke-width: 0.6px;
          text-anchor: middle;
          letter-spacing: 1.8px;
        }
      </style>

      <!-- Clean gutters to eliminate any jagged/cut scan artifacts along straight borders -->
      <rect x="0" y="65" width="12" height="${footerY - 65}" fill="#FFFFFF"/>
      <rect x="22" y="65" width="19" height="${footerY - 65}" fill="#FFFFFF"/>
      <rect x="1162" y="65" width="13.5" height="${footerY - 65}" fill="#FFFFFF"/>
      <rect x="1187.5" y="65" width="12.5" height="${footerY - 65}" fill="#FFFFFF"/>

      <!-- 100% Solid, uniform Left and Right outer borders with zero notches or cuts -->
      <rect x="12" y="65" width="10" height="${footerY - 65}" fill="#000000"/>
      <rect x="1176" y="65" width="11.5" height="${footerY - 65}" fill="#000000"/>

      <!-- Company Name Text Line below cards (BOLDER) -->
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
      // Piece 3: Footer bar (Unstretched natural footer)
      { input: resizedFooter, top: footerY, left: leftX },
      // Seamless side border lines, Company Name, and Barcode box outline
      { input: Buffer.from(vectorSvg), top: 0, left: 0 },
    ])
    .png()
    .toBuffer();

  // Darken MRP right border to match the darkness, curvature, and weight of the other 3 borders
  let { data, info } = await sharp(composited).raw().toBuffer({ resolveWithObject: true });
  for (let y = 44; y <= 308; y++) {
    for (let x = 1145; x <= 1161; x++) {
      const idx = (y * W + x) * info.channels;
      const avg = (data[idx] + data[idx+1] + data[idx+2]) / 3;
      if (avg > 0 && avg < 150) {
        const factor = Math.pow(avg / 150, 2.0);
        const newV = Math.round(avg * factor);
        data[idx] = newV;
        data[idx+1] = newV;
        data[idx+2] = newV;
      }
    }
  }
  for (let y = 68; y <= 286; y++) {
    for (let x = 1157; x <= 1159; x++) {
      const idx = (y * W + x) * info.channels;
      if (data[idx] < 180) {
        data[idx] = 0;
        data[idx+1] = 0;
        data[idx+2] = 0;
      }
    }
  }

  const finalTemplate = await sharp(data, { raw: { width: info.width, height: info.height, channels: info.channels } })
    .png()
    .toBuffer();

  const outTest = 'C:/Users/USER/.gemini/antigravity-ide/brain/90614fe4-6c73-492e-b82c-0606b444be32/scratch/inspect_master_v4.png';
  await sharp(finalTemplate).toFile(outTest);
  console.log('Saved inspect_master_v4.png with bold company name & unstretched footer');
}

buildMasterTemplateV4().catch(console.error);
