import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Dimensions & Constants
const W = 1200;
const H = 900;

// Band Y geometry
const BADGE_TOP = 332;
const BADGE_H = 148;
const BADGE_BOTTOM = BADGE_TOP + BADGE_H; // 480
const BADGE_CY = BADGE_TOP + BADGE_H / 2; // 406

// Symmetric Closed Boxes (Left Margin: 24px, Right Margin: 24px, Gap: 12px)
const BOX_W = 570;
const BOX_RX = 20;
const STROKE_COLOR = '#111111';
const STROKE_W = 3.5;

// Left Box: x: 24, width: 570, right edge: 594
const L_X = 24;
const L_ICON_W = 170;
const L_DIV = L_X + L_ICON_W; // 194
const CX = L_X + L_ICON_W / 2; // 109
const CY = BADGE_CY;

// Right Box: x: 606, width: 570, right edge: 1176
const R_X = 606;
const R_ICON_W = 170;
const R_DIV = R_X + R_ICON_W; // 776
const SX = R_X + R_ICON_W / 2; // 691
const SY = BADGE_CY;

// Icon Radius
const IR = 50;

// Left Box Text Coordinates
const LT_X = L_DIV + 18;
const LT_Y1 = BADGE_CY - 10;
const LT_Y2 = BADGE_CY + 46;

// Right Box Text Coordinates
const RT_X = R_DIV + 18;
const RT_Y1 = BADGE_CY - 14;
const RT_Y2 = BADGE_CY + 46;

// Calendar Icon Geometry (Centered at CX, CY)
const CAL_W = 66;
const CAL_H = 58;
const CAL_L = CX - CAL_W / 2;
const CAL_T = CY - CAL_H / 2;

// Hooks
const HK_W = 7;
const HK_H = 13;
const HK_Y = CAL_T - 4;
const HK_L1 = CX - 18;
const HK_L2 = CX + 11;

// Shelf/Header bar
const SHELF_Y = CAL_T + 5;
const SHELF_H = 11;

// Grid 3 cols x 2 rows
const GW = 17;
const GH = 12;
const G_GAP = 6;
const GX1 = CX - (GW * 1.5 + G_GAP);
const GX2 = CX - GW / 2;
const GX3 = CX + GW / 2 + G_GAP;
const GY1 = SHELF_Y + SHELF_H + 6;
const GY2 = GY1 + GH + 5;

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs>
    <style>
      .badge-heading {
        font-family: 'Impact', 'Haettenschweiler', 'Arial Narrow Bold', sans-serif;
        font-weight: normal;
        fill: #111111;
        stroke: #111111;
        stroke-width: 1.3px;
        stroke-linejoin: round;
        text-anchor: start;
      }
      .badge-sub {
        font-family: 'Impact', 'Haettenschweiler', 'Arial Narrow Bold', sans-serif;
        font-weight: normal;
        fill: #111111;
        stroke: #111111;
        stroke-width: 1.0px;
        stroke-linejoin: round;
        text-anchor: start;
      }
    </style>
  </defs>

  <!-- 1. REMOVE TOP CORNER UNWANTED ARROW/TRIANGULAR MARKS -->
  <rect x="25" y="16" width="32" height="20" fill="#FFFFFF"/>
  <rect x="1143" y="16" width="32" height="20" fill="#FFFFFF"/>

  <!-- 2. ERASE ONLY INNER BADGE BAND (Preserve outer main label border at x=0..12 and x=1188..1200) -->
  <rect x="12" y="${BADGE_TOP - 4}" width="${W - 24}" height="${BADGE_H + 8}" fill="#FFFFFF"/>

  <!-- 3. RESTORE / ENSURE MAIN LABEL OUTER BORDERS ARE CONTINUOUS AND COMPLETE -->
  <rect x="0" y="${BADGE_TOP - 10}" width="12" height="${BADGE_H + 20}" fill="#000000"/>
  <rect x="${W - 12}" y="${BADGE_TOP - 10}" width="12" height="${BADGE_H + 20}" fill="#000000"/>

  <!-- 4. ALL 4 BORDERS: COMPLETE CLOSED ROUNDED RECTANGLES (TOP + BOTTOM + LEFT + RIGHT) -->
  <!-- Left Box -->
  <rect x="${L_X}" y="${BADGE_TOP}" width="${BOX_W}" height="${BADGE_H}" rx="${BOX_RX}"
        fill="#FFFFFF" stroke="${STROKE_COLOR}" stroke-width="${STROKE_W}"/>
  
  <!-- Right Box -->
  <rect x="${R_X}" y="${BADGE_TOP}" width="${BOX_W}" height="${BADGE_H}" rx="${BOX_RX}"
        fill="#FFFFFF" stroke="${STROKE_COLOR}" stroke-width="${STROKE_W}"/>

  <!-- 5. VERTICAL DIVIDERS -->
  <line x1="${L_DIV}" y1="${BADGE_TOP + 1}" x2="${L_DIV}" y2="${BADGE_BOTTOM - 1}" stroke="${STROKE_COLOR}" stroke-width="${STROKE_W}"/>
  <line x1="${R_DIV}" y1="${BADGE_TOP + 1}" x2="${R_DIV}" y2="${BADGE_BOTTOM - 1}" stroke="${STROKE_COLOR}" stroke-width="${STROKE_W}"/>

  <!-- 6. LEFT ICON: CALENDAR -->
  <circle cx="${CX}" cy="${CY}" r="${IR}" fill="#111111"/>
  
  <!-- Hooks -->
  <rect x="${HK_L1}" y="${HK_Y}" width="${HK_W}" height="${HK_H}" rx="3.5" fill="#FFFFFF"/>
  <rect x="${HK_L2}" y="${HK_Y}" width="${HK_W}" height="${HK_H}" rx="3.5" fill="#FFFFFF"/>
  
  <!-- Calendar Header Shelf -->
  <rect x="${CAL_L}" y="${SHELF_Y}" width="${CAL_W}" height="${SHELF_H}" rx="2" fill="#FFFFFF"/>
  
  <!-- Calendar Grid (3x2) -->
  <rect x="${GX1}" y="${GY1}" width="${GW}" height="${GH}" rx="2" fill="#FFFFFF"/>
  <rect x="${GX2}" y="${GY1}" width="${GW}" height="${GH}" rx="2" fill="#FFFFFF"/>
  <rect x="${GX3}" y="${GY1}" width="${GW}" height="${GH}" rx="2" fill="#FFFFFF"/>
  <rect x="${GX1}" y="${GY2}" width="${GW}" height="${GH}" rx="2" fill="#FFFFFF"/>
  <rect x="${GX2}" y="${GY2}" width="${GW}" height="${GH}" rx="2" fill="#FFFFFF"/>
  <rect x="${GX3}" y="${GY2}" width="${GW}" height="${GH}" rx="2" fill="#FFFFFF"/>

  <!-- 7. RIGHT ICON: SHIELD WITH CHECK -->
  <circle cx="${SX}" cy="${SY}" r="${IR}" fill="#111111"/>
  
  <!-- Outer Shield -->
  <path d="
    M ${SX},${SY - 36}
    L ${SX + 28},${SY - 21}
    L ${SX + 28},${SY + 4}
    Q ${SX + 28},${SY + 26} ${SX},${SY + 39}
    Q ${SX - 28},${SY + 26} ${SX - 28},${SY + 4}
    L ${SX - 28},${SY - 21}
    Z
  " fill="#FFFFFF"/>

  <!-- Inner Shield Cutout -->
  <path d="
    M ${SX},${SY - 26}
    L ${SX + 19},${SY - 14}
    L ${SX + 19},${SY + 4}
    Q ${SX + 19},${SY + 20} ${SX},${SY + 30}
    Q ${SX - 19},${SY + 20} ${SX - 19},${SY + 4}
    L ${SX - 19},${SY - 14}
    Z
  " fill="#111111"/>

  <!-- Checkmark -->
  <polyline
    points="${SX - 10},${SY + 4} ${SX - 2},${SY + 13} ${SX + 14},${SY - 9}"
    stroke="#FFFFFF" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" fill="none"/>

  <!-- 8. LEFT BADGE TEXT (SLIGHTLY BOLDER / HEAVIER WEIGHT) -->
  <text x="${LT_X}" y="${LT_Y1}" class="badge-heading" font-size="64" letter-spacing="0">10 YEARS</text>
  <text x="${LT_X}" y="${LT_Y2}" class="badge-sub" font-size="44" letter-spacing="1">LONG LIFE</text>

  <!-- 9. RIGHT BADGE TEXT (SLIGHTLY BOLDER / HEAVIER WEIGHT) -->
  <text x="${RT_X}" y="${RT_Y1}" class="badge-sub" font-size="38" letter-spacing="0.5">CARD WARRANTY</text>
  <text x="${RT_X}" y="${RT_Y2}" class="badge-heading" font-size="64" letter-spacing="0">3 YEARS</text>

</svg>`;

async function render() {
  const baseTemplate = path.resolve(__dirname, '../assets/clean_label_template.png');
  const previewOut = path.resolve(__dirname, '../assets/badge_fix_preview.png');

  await sharp(baseTemplate)
    .composite([{ input: Buffer.from(svg), top: 0, left: 0 }])
    .png()
    .toFile(previewOut);

  console.log('✅ Generated preview at:', previewOut);
}

render().catch(console.error);
