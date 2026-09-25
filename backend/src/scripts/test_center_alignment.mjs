import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const W = 1200;
const H = 900;

// Test different horizontal centers (e.g. 387, 390, 392, etc.)
// and ensure text-anchor="middle" without any offset issues
async function testCenterAlignment() {
  const baseTemplate = path.resolve(__dirname, '../../../VidhyutSaathi_Label_2x1.5in.png');
  const baseBuf = fs.readFileSync(baseTemplate);

  const boxW = 556;
  const boxH = 128;
  const leftMargin = 32;
  const cornerRadius = 18;
  const divH = 94;

  const BADGE_CY = 406;
  const BADGE_TOP = BADGE_CY - boxH / 2;
  const BADGE_BOTTOM = BADGE_TOP + boxH;

  const STROKE_COLOR = '#222222';
  const STROKE_W = 2;

  const L_X = leftMargin; // 32
  const L_RIGHT = L_X + boxW; // 588
  
  const R_X = W - leftMargin - boxW; // 612
  const R_RIGHT = R_X + boxW; // 1168

  const ICON_COL_W = 154;
  const L_DIV = L_X + ICON_COL_W; // 186
  const CX = L_X + ICON_COL_W / 2; // 109
  const CY = BADGE_CY;

  const R_DIV = R_X + ICON_COL_W; // 766
  const SX = R_X + ICON_COL_W / 2; // 689
  const SY = BADGE_CY;

  const IR = 52;

  const DIV_TOP = BADGE_CY - divH / 2; // 359
  const DIV_BOTTOM = BADGE_CY + divH / 2; // 453

  const MID_DIV_X = 600;
  const MID_DIV_TOP = DIV_TOP;
  const MID_DIV_BOTTOM = DIV_BOTTOM;

  // Exact centers:
  // Left text area: 186 to 588 -> Center is 387
  // Right text area: 766 to 1168 -> Center is 967
  const L_TEXT_CENTER = (L_DIV + L_RIGHT) / 2; // 387
  const R_TEXT_CENTER = (R_DIV + R_RIGHT) / 2; // 967

  // Calendar Icon Geometry
  const CAL_W = 60;
  const CAL_H = 54;
  const CAL_L = CX - CAL_W / 2;
  const CAL_T = CY - CAL_H / 2;
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

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <style>
    .font-heavy {
      font-family: 'Arial Black', Arial, 'Segoe UI Black', sans-serif;
      font-weight: 900;
      fill: #111111;
      text-anchor: middle;
      dominant-baseline: alphabetic;
    }
    .font-bold {
      font-family: Arial, 'Segoe UI', sans-serif;
      font-weight: 800;
      fill: #111111;
      text-anchor: middle;
      dominant-baseline: alphabetic;
    }
  </style>

  <!-- 1. Erase entire Inner Badge Band cleanly -->
  <rect x="12" y="324" width="${W - 24}" height="164" fill="#FFFFFF"/>

  <!-- 2. Keep outer border intact -->
  <rect x="0" y="320" width="12" height="170" fill="#000000"/>
  <rect x="${W - 12}" y="320" width="12" height="170" fill="#000000"/>

  <!-- 3. Left .box -->
  <rect x="${L_X}" y="${BADGE_TOP}" width="${boxW}" height="${boxH}" rx="${cornerRadius}"
        fill="#FFFFFF" stroke="${STROKE_COLOR}" stroke-width="${STROKE_W}"/>
  
  <!-- 4. Right .box -->
  <rect x="${R_X}" y="${BADGE_TOP}" width="${boxW}" height="${boxH}" rx="${cornerRadius}"
        fill="#FFFFFF" stroke="${STROKE_COLOR}" stroke-width="${STROKE_W}"/>

  <!-- 5. Middle .divider between the two boxes -->
  <line x1="${MID_DIV_X}" y1="${MID_DIV_TOP}" x2="${MID_DIV_X}" y2="${MID_DIV_BOTTOM}" stroke="${STROKE_COLOR}" stroke-width="${STROKE_W}"/>

  <!-- 6. Left .divider -->
  <line x1="${L_DIV}" y1="${DIV_TOP}" x2="${L_DIV}" y2="${DIV_BOTTOM}" stroke="${STROKE_COLOR}" stroke-width="${STROKE_W}"/>

  <!-- 7. Right .divider -->
  <line x1="${R_DIV}" y1="${DIV_TOP}" x2="${R_DIV}" y2="${DIV_BOTTOM}" stroke="${STROKE_COLOR}" stroke-width="${STROKE_W}"/>

  <!-- 8. Left .icon-circle with Calendar -->
  <circle cx="${CX}" cy="${CY}" r="${IR}" fill="#000000"/>
  <rect x="${HK_L1}" y="${HK_Y}" width="${HK_W}" height="${HK_H}" rx="3.5" fill="#FFFFFF"/>
  <rect x="${HK_L2}" y="${HK_Y}" width="${HK_W}" height="${HK_H}" rx="3.5" fill="#FFFFFF"/>
  <rect x="${CAL_L}" y="${SHELF_Y}" width="${CAL_W}" height="${SHELF_H}" rx="2" fill="#FFFFFF"/>
  <rect x="${GX1}" y="${GY1}" width="${GW}" height="${GH}" rx="2" fill="#FFFFFF"/>
  <rect x="${GX2}" y="${GY1}" width="${GW}" height="${GH}" rx="2" fill="#FFFFFF"/>
  <rect x="${GX3}" y="${GY1}" width="${GW}" height="${GH}" rx="2" fill="#FFFFFF"/>
  <rect x="${GX1}" y="${GY2}" width="${GW}" height="${GH}" rx="2" fill="#FFFFFF"/>
  <rect x="${GX2}" y="${GY2}" width="${GW}" height="${GH}" rx="2" fill="#FFFFFF"/>
  <rect x="${GX3}" y="${GY2}" width="${GW}" height="${GH}" rx="2" fill="#FFFFFF"/>

  <!-- 9. Right .icon-circle with Shield -->
  <circle cx="${SX}" cy="${SY}" r="${IR}" fill="#000000"/>
  <path d="
    M ${SX},${SY - 34}
    L ${SX + 26},${SY - 20}
    L ${SX + 26},${SY + 4}
    Q ${SX + 26},${SY + 24} ${SX},${SY + 36}
    Q ${SX - 24},${SY + 24} ${SX - 26},${SY + 4}
    L ${SX - 26},${SY - 20}
    Z
  " fill="#FFFFFF"/>
  <path d="
    M ${SX},${SY - 24}
    L ${SX + 17},${SY - 13}
    L ${SX + 17},${SY + 4}
    Q ${SX + 17},${SY + 19} ${SX},${SY + 28}
    Q ${SX - 17},${SY + 19} ${SX - 17},${SY + 4}
    L ${SX - 17},${SY - 13}
    Z
  " fill="#000000"/>
  <polyline
    points="${SX - 9},${SY + 4} ${SX - 2},${SY + 12} ${SX + 13},${SY - 8}"
    stroke="#FFFFFF" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>

  <!-- Left Box: Exactly Centered 10 YEARS & LONG LIFE -->
  <text x="${L_TEXT_CENTER}" y="${BADGE_CY - 2}" class="font-heavy" font-size="62" letter-spacing="-0.5">10 YEARS</text>
  <text x="${L_TEXT_CENTER}" y="${BADGE_CY + 40}" class="font-heavy" font-size="33" letter-spacing="3.5">LONG LIFE</text>

  <!-- Right Box: Exactly Centered CARD WARRANTY & 3 YEARS -->
  <text x="${R_TEXT_CENTER}" y="${BADGE_CY - 20}" class="font-bold" font-size="30" letter-spacing="1.5">CARD WARRANTY</text>
  <text x="${R_TEXT_CENTER}" y="${BADGE_CY + 42}" class="font-heavy" font-size="64" letter-spacing="-0.5">3 YEARS</text>

</svg>`;

  const resultBuf = await sharp(baseBuf)
    .composite([{ input: Buffer.from(svg), top: 0, left: 0 }])
    .png()
    .toBuffer();

  const previewCrop = await sharp(resultBuf)
    .extract({ left: 0, top: 310, width: 1200, height: 190 })
    .png()
    .toFile(path.resolve(__dirname, '../assets/exact_center_preview.png'));

  console.log('✓ Created exact_center_preview.png');
}

testCenterAlignment().catch(console.error);
