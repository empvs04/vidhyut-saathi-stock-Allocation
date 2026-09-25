import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const W = 1200;
const H = 900;

function buildSingleBorderCardsSvg() {
  const BADGE_CY = 411;
  const boxH = 146;
  const boxY = BADGE_CY - boxH / 2; // 338
  const boxW = 566;
  const rx = 16;
  const strokeColor = '#111111';
  const strokeW = 2.5;

  const leftX = 24;
  const rightX = 610;

  // Icons: center Y = BADGE_CY (411)
  const CX = 109; // Left icon center X
  const SX = 695; // Right icon center X
  const IR = 52;  // Circle radius (104px diameter)

  // Divider lines: height 120px (from 351 to 471)
  const divY1 = 351;
  const divY2 = 471;
  const leftDivX = 194;
  const rightDivX = 780;
  const midDivX = 600;

  // Text Centers:
  // Left text section: x: 194 to 590 -> center = 392
  // Right text section: x: 780 to 1176 -> center = 978
  const L_TEXT_CENTER = 392;
  const R_TEXT_CENTER = 978;

  // Calendar Icon Geometry (Centered at CX, CY)
  const CAL_W = 60;
  const CAL_H = 54;
  const CAL_L = CX - CAL_W / 2;
  const CAL_T = BADGE_CY - CAL_H / 2;
  const HK_W = 7;
  const HK_H = 12;
  const HK_Y = CAL_T - 4;
  const HK_L1 = CX - 17;
  const HK_L2 = CX + 10;
  const SHELF_Y = CAL_T + 4;
  const SHELF_H = 10;
  const GW = 15;
  const GH = 11;
  const G_GAP = 5;
  const GX1 = CX - (GW * 1.5 + G_GAP);
  const GX2 = CX - GW / 2;
  const GX3 = CX + GW / 2 + G_GAP;
  const GY1 = SHELF_Y + SHELF_H + 5;
  const GY2 = GY1 + GH + 4;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <style>
    .font-heavy {
      font-family: 'Arial Black', Arial, 'Segoe UI Black', sans-serif;
      font-weight: 900;
      fill: #111111;
      text-anchor: middle;
    }
    .font-bold {
      font-family: 'Arial Black', Arial, 'Segoe UI Black', sans-serif;
      font-weight: 900;
      fill: #111111;
      text-anchor: middle;
    }
  </style>

  <!-- 1. Deep Erase: Pure white from Y=322 to Y=538. Completely obliterates all old ghost/double border lines! -->
  <rect x="18" y="322" width="1164" height="216" fill="#FFFFFF"/>

  <!-- 2. Left Card: SINGLE clean stroke rounded rectangle (NO double border!) -->
  <rect x="${leftX}" y="${boxY}" width="${boxW}" height="${boxH}" rx="${rx}"
        fill="#FFFFFF" stroke="${strokeColor}" stroke-width="${strokeW}"/>

  <!-- 3. Right Card: SINGLE clean stroke rounded rectangle (NO double border!) -->
  <rect x="${rightX}" y="${boxY}" width="${boxW}" height="${boxH}" rx="${rx}"
        fill="#FFFFFF" stroke="${strokeColor}" stroke-width="${strokeW}"/>

  <!-- 4. Middle Divider line between both cards -->
  <line x1="${midDivX}" y1="${divY1}" x2="${midDivX}" y2="${divY2}" stroke="${strokeColor}" stroke-width="${strokeW}"/>

  <!-- 5. Left Card Divider line -->
  <line x1="${leftDivX}" y1="${divY1}" x2="${leftDivX}" y2="${divY2}" stroke="${strokeColor}" stroke-width="${strokeW}"/>

  <!-- 6. Right Card Divider line -->
  <line x1="${rightDivX}" y1="${divY1}" x2="${rightDivX}" y2="${divY2}" stroke="${strokeColor}" stroke-width="${strokeW}"/>

  <!-- 7. Left Icon: Black Circle + Calendar -->
  <circle cx="${CX}" cy="${BADGE_CY}" r="${IR}" fill="#000000"/>
  <rect x="${HK_L1}" y="${HK_Y}" width="${HK_W}" height="${HK_H}" rx="3.5" fill="#FFFFFF"/>
  <rect x="${HK_L2}" y="${HK_Y}" width="${HK_W}" height="${HK_H}" rx="3.5" fill="#FFFFFF"/>
  <rect x="${CAL_L}" y="${SHELF_Y}" width="${CAL_W}" height="${SHELF_H}" rx="2" fill="#FFFFFF"/>
  <rect x="${GX1}" y="${GY1}" width="${GW}" height="${GH}" rx="2" fill="#FFFFFF"/>
  <rect x="${GX2}" y="${GY1}" width="${GW}" height="${GH}" rx="2" fill="#FFFFFF"/>
  <rect x="${GX3}" y="${GY1}" width="${GW}" height="${GH}" rx="2" fill="#FFFFFF"/>
  <rect x="${GX1}" y="${GY2}" width="${GW}" height="${GH}" rx="2" fill="#FFFFFF"/>
  <rect x="${GX2}" y="${GY2}" width="${GW}" height="${GH}" rx="2" fill="#FFFFFF"/>
  <rect x="${GX3}" y="${GY2}" width="${GW}" height="${GH}" rx="2" fill="#FFFFFF"/>

  <!-- 8. Right Icon: Black Circle + Shield & Checkmark -->
  <circle cx="${SX}" cy="${BADGE_CY}" r="${IR}" fill="#000000"/>
  <path d="
    M ${SX},${BADGE_CY - 34}
    L ${SX + 26},${BADGE_CY - 20}
    L ${SX + 26},${BADGE_CY + 4}
    Q ${SX + 26},${BADGE_CY + 24} ${SX},${BADGE_CY + 36}
    Q ${SX - 24},${BADGE_CY + 24} ${SX - 26},${BADGE_CY + 4}
    L ${SX - 26},${BADGE_CY - 20}
    Z
  " fill="#FFFFFF"/>
  <path d="
    M ${SX},${BADGE_CY - 24}
    L ${SX + 17},${BADGE_CY - 13}
    L ${SX + 17},${BADGE_CY + 4}
    Q ${SX + 17},${BADGE_CY + 19} ${SX},${BADGE_CY + 28}
    Q ${SX - 17},${BADGE_CY + 19} ${SX - 17},${BADGE_CY + 4}
    L ${SX - 17},${BADGE_CY - 13}
    Z
  " fill="#000000"/>
  <polyline
    points="${SX - 9},${BADGE_CY + 4} ${SX - 2},${BADGE_CY + 12} ${SX + 13},${BADGE_CY - 8}"
    stroke="#FFFFFF" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>

  <!-- 9. Left Card Typography: 10 YEARS & LONG LIFE -->
  <g transform="translate(${L_TEXT_CENTER}, ${BADGE_CY - 5}) scale(0.96, 1.15)">
    <text x="0" y="0" class="font-heavy" font-size="64" letter-spacing="-0.5">10 YEARS</text>
  </g>
  <text x="${L_TEXT_CENTER}" y="${BADGE_CY + 43}" class="font-heavy" font-size="34" letter-spacing="3.5">LONG LIFE</text>

  <!-- 10. Right Card Typography: CARD WARRANTY & 3 YEARS -->
  <text x="${R_TEXT_CENTER}" y="${BADGE_CY - 22}" class="font-bold" font-size="33" letter-spacing="1.5">CARD WARRANTY</text>
  <g transform="translate(${R_TEXT_CENTER}, ${BADGE_CY + 44}) scale(0.96, 1.15)">
    <text x="0" y="0" class="font-heavy" font-size="65" letter-spacing="-0.5">3 YEARS</text>
  </g>

</svg>`;
}

async function finalizeAndDeploy() {
  const baseTemplatePath = path.resolve(__dirname, '../../storage/clean_single_dark_border_template.png');
  const userMasterPath = path.resolve(__dirname, '../../storage/new_master_user_label.png');

  // Extract the exact barcode box outline from userMaster
  const boxOutlineCrop = await sharp(userMasterPath)
    .extract({ left: 24, top: 540, width: 1152, height: 232 })
    .toBuffer();

  const svgStr = buildSingleBorderCardsSvg();

  // Composite: Clean base + barcode container box + clean single-border cards
  const finalMasterBuffer = await sharp(baseTemplatePath)
    .composite([
      { input: boxOutlineCrop, top: 540, left: 24 },
      { input: Buffer.from(svgStr), top: 0, left: 0 }
    ])
    .png()
    .toBuffer();

  // 1. Deploy PNGs
  const pngDestinations = [
    path.resolve(__dirname, '../assets/clean_label_template.png'),
    path.resolve(__dirname, '../assets/VidhyutSaathi_Label_2x1.5in.png'),
    path.resolve(__dirname, '../../../frontend/public/clean_label_template.png'),
    path.resolve(__dirname, '../../../frontend/public/VidhyutSaathi_Label_2x1.5in.png'),
    path.resolve(__dirname, '../../../VidhyutSaathi_Label_2x1.5in.png'),
  ];

  if (fs.existsSync(path.resolve(__dirname, '../../../frontend/dist'))) {
    pngDestinations.push(
      path.resolve(__dirname, '../../../frontend/dist/clean_label_template.png'),
      path.resolve(__dirname, '../../../frontend/dist/VidhyutSaathi_Label_2x1.5in.png')
    );
  }

  for (const dest of pngDestinations) {
    await sharp(finalMasterBuffer).png().toFile(dest);
    console.log('✓ Deployed PNG:', dest);
  }

  // 2. Deploy JPEGs
  const jpegBuffer = await sharp(finalMasterBuffer)
    .jpeg({ quality: 98, chromaSubsampling: '4:4:4' })
    .toBuffer();

  const jpegDestinations = [
    path.resolve(__dirname, '../assets/clean_label_template.jpg'),
    path.resolve(__dirname, '../assets/master_label.jpg'),
    path.resolve(__dirname, '../../../frontend/public/master_label.jpg'),
  ];

  if (fs.existsSync(path.resolve(__dirname, '../../../frontend/dist'))) {
    jpegDestinations.push(
      path.resolve(__dirname, '../../../frontend/dist/master_label.jpg')
    );
  }

  for (const dest of jpegDestinations) {
    await sharp(jpegBuffer).toFile(dest);
    console.log('✓ Deployed JPEG:', dest);
  }

  // 3. Save reference preview
  await sharp(finalMasterBuffer)
    .extract({ left: 15, top: 320, width: 1170, height: 180 })
    .png()
    .toFile(path.resolve(__dirname, '../../storage/final_single_border_crop.png'));

  console.log('\n✅ Single-border cards master successfully created and deployed at 2x1.5 inch ratio!');
}

finalizeAndDeploy().catch(console.error);
