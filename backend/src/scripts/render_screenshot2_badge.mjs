import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const W = 1200;
const H = 900;

// .box: height: 114px; border: 2px solid #222; border-radius: 16px; background: #fff;
const BADGE_H = 114;
const BADGE_CY = 406;
const BADGE_TOP = BADGE_CY - BADGE_H / 2; // 349
const BADGE_BOTTOM = BADGE_TOP + BADGE_H; // 463

const BOX_W = 570;
const BOX_RX = 16;
const STROKE_COLOR = '#222222';
const STROKE_W = 2;

// Left Box: x: 24, width: 570
const L_X = 24;
const L_ICON_W = 170;
const L_DIV = L_X + L_ICON_W; // 194
const CX = L_X + L_ICON_W / 2; // 109
const CY = BADGE_CY;

// Right Box: x: 606, width: 570
const R_X = 606;
const R_ICON_W = 170;
const R_DIV = R_X + R_ICON_W; // 776
const SX = R_X + R_ICON_W / 2; // 691
const SY = BADGE_CY;

// .icon-circle: width: 104px; height: 104px; border-radius: 50%; (r = 52)
const IR = 52;

// .divider: width: 2px; height: 84px; background: #222;
const DIV_H = 84;
const DIV_TOP = BADGE_CY - DIV_H / 2; // 364
const DIV_BOTTOM = BADGE_CY + DIV_H / 2; // 448

// Middle separator between both cards
const MID_DIV_X = 600;
const MID_DIV_TOP = DIV_TOP;
const MID_DIV_BOTTOM = DIV_BOTTOM;

// Text Centers
const L_TEXT_CENTER = 394;
const R_TEXT_CENTER = 976;

// Calendar Icon Geometry (Centered at CX, CY)
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

export function buildBadgeSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs>
    <style>
      .main-text {
        font-family: Arial, Helvetica, sans-serif;
        font-weight: 900;
        font-size: 60px;
        line-height: 0.9;
        fill: #111111;
        text-anchor: middle;
      }
      .secondary-text {
        font-family: Arial, Helvetica, sans-serif;
        font-weight: 900;
        font-size: 31px;
        line-height: 1;
        fill: #111111;
        text-anchor: middle;
      }
      .warranty-heading {
        font-family: Arial, Helvetica, sans-serif;
        font-weight: 700;
        font-size: 29px;
        line-height: 1;
        fill: #111111;
        text-anchor: middle;
      }
      .warranty-main {
        font-family: Arial, Helvetica, sans-serif;
        font-weight: 900;
        font-size: 60px;
        line-height: 0.9;
        fill: #111111;
        text-anchor: middle;
      }
    </style>
  </defs>

  <!-- 1. Erase entire Inner Badge Band cleanly -->
  <rect x="12" y="328" width="${W - 24}" height="156" fill="#FFFFFF"/>

  <!-- 2. Keep outer border intact -->
  <rect x="0" y="320" width="12" height="170" fill="#000000"/>
  <rect x="${W - 12}" y="320" width="12" height="170" fill="#000000"/>

  <!-- 3. Left .box -->
  <rect x="${L_X}" y="${BADGE_TOP}" width="${BOX_W}" height="${BADGE_H}" rx="${BOX_RX}"
        fill="#FFFFFF" stroke="${STROKE_COLOR}" stroke-width="${STROKE_W}"/>
  
  <!-- 4. Right .box -->
  <rect x="${R_X}" y="${BADGE_TOP}" width="${BOX_W}" height="${BADGE_H}" rx="${BOX_RX}"
        fill="#FFFFFF" stroke="${STROKE_COLOR}" stroke-width="${STROKE_W}"/>

  <!-- 5. Middle .divider between the two boxes -->
  <line x1="${MID_DIV_X}" y1="${MID_DIV_TOP}" x2="${MID_DIV_X}" y2="${MID_DIV_BOTTOM}" stroke="${STROKE_COLOR}" stroke-width="${STROKE_W}"/>

  <!-- 6. Left .divider (width: 2px; height: 84px) -->
  <line x1="${L_DIV}" y1="${DIV_TOP}" x2="${L_DIV}" y2="${DIV_BOTTOM}" stroke="${STROKE_COLOR}" stroke-width="${STROKE_W}"/>

  <!-- 7. Right .divider (width: 2px; height: 84px) -->
  <line x1="${R_DIV}" y1="${DIV_TOP}" x2="${R_DIV}" y2="${DIV_BOTTOM}" stroke="${STROKE_COLOR}" stroke-width="${STROKE_W}"/>

  <!-- 8. Left .icon-circle (width: 104px; height: 104px; border-radius: 50%; background: #000;) with Calendar -->
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

  <!-- 9. Right .icon-circle (width: 104px; height: 104px; border-radius: 50%; background: #000;) with Shield -->
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

  <!-- 10. Left Box: .main-text (10 YEARS) & .secondary-text (LONG LIFE) -->
  <text x="${L_TEXT_CENTER}" y="${BADGE_CY - 4}" class="main-text">10 YEARS</text>
  <text x="${L_TEXT_CENTER}" y="${BADGE_CY + 36}" class="secondary-text">LONG LIFE</text>

  <!-- 11. Right Box: .warranty-heading (CARD WARRANTY) & .warranty-main (3 YEARS) -->
  <text x="${R_TEXT_CENTER}" y="${BADGE_CY - 22}" class="warranty-heading">CARD WARRANTY</text>
  <text x="${R_TEXT_CENTER}" y="${BADGE_CY + 36}" class="warranty-main">3 YEARS</text>

</svg>`;
}

async function run() {
  const baseTemplate = path.resolve(__dirname, '../../../VidhyutSaathi_Label_2x1.5in.png');
  const baseBuf = fs.readFileSync(baseTemplate);

  const svgStr = buildBadgeSvg();
  const resultBuf = await sharp(baseBuf)
    .composite([{ input: Buffer.from(svgStr), top: 0, left: 0 }])
    .png()
    .toBuffer();

  const previewCrop = await sharp(resultBuf)
    .extract({ left: 0, top: 300, width: 1200, height: 200 })
    .png()
    .toFile(path.resolve(__dirname, '../assets/screenshot2_preview_crop.png'));

  console.log('✓ Created preview crop at backend/src/assets/screenshot2_preview_crop.png');
}

run().catch(console.error);
