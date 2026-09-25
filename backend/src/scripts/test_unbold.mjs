import sharp from 'sharp';
import fs from 'fs';

const W = 1200;
const H = 900;
const BADGE_TOP = 332;
const BADGE_H = 148;
const BADGE_BOTTOM = BADGE_TOP + BADGE_H; // 480
const BADGE_CY = BADGE_TOP + BADGE_H / 2; // 406

const BOX_W = 570;
const BOX_RX = 20;
const STROKE_COLOR = '#111111';
const STROKE_W = 3.5;

const L_X = 24;
const L_ICON_W = 170;
const L_DIV = L_X + L_ICON_W; // 194
const CX = L_X + L_ICON_W / 2; // 109
const CY = BADGE_CY;

const R_X = 606;
const R_ICON_W = 170;
const R_DIV = R_X + R_ICON_W; // 776
const SX = R_X + R_ICON_W / 2; // 691
const SY = BADGE_CY;

const IR = 50;

const L_TEXT_CENTER = 394;
const R_TEXT_CENTER = 976;

// Let's test non-bold styles for LONG LIFE and CARD WARRANTY
// Option A: Arial / Helvetica with medium weight
// Option B: Arial Bold / semi-bold (clean, un-stroked, natural)
// Option C: Arial Narrow regular

const variants = [
  {
    name: 'Var_A_Arial_Clean',
    subFont: "'Arial', 'Helvetica', sans-serif",
    subWeight: '600',
    ltY1: 394, ltY2: 444, rtY1: 380, rtY2: 444,
    sizeHead: 66, sizeSubL: 34, sizeSubR: 30,
    letterSpacingSubL: 3, letterSpacingSubR: 1.5
  },
  {
    name: 'Var_B_Arial_Bold_Clean',
    subFont: "'Arial', 'Helvetica', sans-serif",
    subWeight: 'bold',
    ltY1: 394, ltY2: 444, rtY1: 378, rtY2: 444,
    sizeHead: 68, sizeSubL: 36, sizeSubR: 32,
    letterSpacingSubL: 2.5, letterSpacingSubR: 1.5
  },
  {
    name: 'Var_C_Impact_NoStroke',
    subFont: "'Impact', 'Arial Narrow', sans-serif",
    subWeight: 'normal',
    ltY1: 394, ltY2: 444, rtY1: 380, rtY2: 444,
    sizeHead: 68, sizeSubL: 38, sizeSubR: 34,
    letterSpacingSubL: 2.5, letterSpacingSubR: 1.5
  }
];

function generateTestSvg(v) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs>
    <style>
      .badge-bold {
        font-family: 'Impact', 'Haettenschweiler', 'Arial Narrow Bold', sans-serif;
        font-weight: normal;
        fill: #111111;
        stroke: #111111;
        stroke-width: 0.8px;
        stroke-linejoin: round;
        text-anchor: middle;
      }
      .badge-regular {
        font-family: ${v.subFont};
        font-weight: ${v.subWeight};
        fill: #111111;
        stroke: none;
        text-anchor: middle;
      }
    </style>
  </defs>

  <rect x="25" y="16" width="32" height="20" fill="#FFFFFF"/>
  <rect x="1143" y="16" width="32" height="20" fill="#FFFFFF"/>

  <rect x="12" y="${BADGE_TOP - 4}" width="${W - 24}" height="${BADGE_H + 8}" fill="#FFFFFF"/>
  <rect x="0" y="${BADGE_TOP - 10}" width="12" height="${BADGE_H + 20}" fill="#000000"/>
  <rect x="${W - 12}" y="${BADGE_TOP - 10}" width="12" height="${BADGE_H + 20}" fill="#000000"/>

  <rect x="${L_X}" y="${BADGE_TOP}" width="${BOX_W}" height="${BADGE_H}" rx="${BOX_RX}"
        fill="#FFFFFF" stroke="${STROKE_COLOR}" stroke-width="${STROKE_W}"/>
  <rect x="${R_X}" y="${BADGE_TOP}" width="${BOX_W}" height="${BADGE_H}" rx="${BOX_RX}"
        fill="#FFFFFF" stroke="${STROKE_COLOR}" stroke-width="${STROKE_W}"/>

  <line x1="${L_DIV}" y1="${BADGE_TOP + 1}" x2="${L_DIV}" y2="${BADGE_BOTTOM - 1}" stroke="${STROKE_COLOR}" stroke-width="${STROKE_W}"/>
  <line x1="${R_DIV}" y1="${BADGE_TOP + 1}" x2="${R_DIV}" y2="${BADGE_BOTTOM - 1}" stroke="${STROKE_COLOR}" stroke-width="${STROKE_W}"/>

  <!-- Left Icon Placeholder -->
  <circle cx="${CX}" cy="${CY}" r="${IR}" fill="#111111"/>

  <!-- Right Icon Placeholder -->
  <circle cx="${SX}" cy="${SY}" r="${IR}" fill="#111111"/>

  <!-- Left Badge Text -->
  <text x="${L_TEXT_CENTER}" y="${v.ltY1}" class="badge-bold" font-size="${v.sizeHead}">10 YEARS</text>
  <text x="${L_TEXT_CENTER}" y="${v.ltY2}" class="badge-regular" font-size="${v.sizeSubL}" letter-spacing="${v.letterSpacingSubL}">LONG LIFE</text>

  <!-- Right Badge Text -->
  <text x="${R_TEXT_CENTER}" y="${v.rtY1}" class="badge-regular" font-size="${v.sizeSubR}" letter-spacing="${v.letterSpacingSubR}">CARD WARRANTY</text>
  <text x="${R_TEXT_CENTER}" y="${v.rtY2}" class="badge-bold" font-size="${v.sizeHead}">3 YEARS</text>
</svg>`;
}

async function run() {
  const baseTemplate = 'C:/Users/USER/Desktop/barcode/VidhyutSaathi_Label_2x1.5in.png';
  const baseBuf = fs.readFileSync(baseTemplate);

  const crops = [];
  for (const v of variants) {
    const svgStr = generateTestSvg(v);
    const img = await sharp(baseBuf).composite([{ input: Buffer.from(svgStr), top: 0, left: 0 }]).png().toBuffer();
    const crop = await sharp(img).extract({ left: 0, top: 320, width: 1200, height: 170 }).png().toBuffer();
    crops.push(crop);
  }

  const totalH = 170 * 3 + 20;
  await sharp({
    create: {
      width: 1200,
      height: totalH,
      channels: 4,
      background: { r: 240, g: 240, b: 240, alpha: 1 }
    }
  })
  .composite([
    { input: crops[0], top: 0, left: 0 },
    { input: crops[1], top: 180, left: 0 },
    { input: crops[2], top: 360, left: 0 },
  ])
  .png()
  .toFile('backend/storage/unbold_test_comparison.png');

  console.log('Generated unbold test comparison');
}

run().catch(console.error);
