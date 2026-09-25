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

// Let's test bottom baseline positions: 442, 444, 446
const yTests = [
  { name: 'y2_442', ltY1: 388, ltY2: 442, rtY1: 370, rtY2: 442, sizeL1: 70, sizeL2: 44, sizeR1: 45, sizeR2: 68 },
  { name: 'y2_444', ltY1: 390, ltY2: 444, rtY1: 370, rtY2: 444, sizeL1: 70, sizeL2: 44, sizeR1: 45, sizeR2: 68 },
  { name: 'y2_446', ltY1: 392, ltY2: 446, rtY1: 372, rtY2: 446, sizeL1: 70, sizeL2: 44, sizeR1: 45, sizeR2: 68 },
];

function buildBadgeSvg(t) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs>
    <style>
      .badge-heading {
        font-family: 'Impact', 'Haettenschweiler', 'Arial Narrow Bold', sans-serif;
        font-weight: normal;
        fill: #111111;
        stroke: #111111;
        stroke-width: 0.8px;
        stroke-linejoin: round;
        text-anchor: middle;
      }
      .badge-sub {
        font-family: 'Impact', 'Haettenschweiler', 'Arial Narrow Bold', sans-serif;
        font-weight: normal;
        fill: #111111;
        stroke: #111111;
        stroke-width: 0.6px;
        stroke-linejoin: round;
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

  <!-- 8. LEFT BADGE TEXT -->
  <text x="${L_TEXT_CENTER}" y="${t.ltY1}" class="badge-heading" font-size="${t.sizeL1}">10 YEARS</text>
  <text x="${L_TEXT_CENTER}" y="${t.ltY2}" class="badge-sub" font-size="${t.sizeL2}" letter-spacing="2.5">LONG LIFE</text>

  <!-- 9. RIGHT BADGE TEXT -->
  <text x="${R_TEXT_CENTER}" y="${t.rtY1}" class="badge-sub" font-size="${t.sizeR1}" letter-spacing="1.2">CARD WARRANTY</text>
  <text x="${R_TEXT_CENTER}" y="${t.rtY2}" class="badge-heading" font-size="${t.sizeR2}">3 YEARS</text>
</svg>`;
}

async function run() {
  const baseTemplate = 'C:/Users/USER/Desktop/barcode/VidhyutSaathi_Label_2x1.5in.png';
  const baseBuf = fs.readFileSync(baseTemplate);

  const crops = [];
  for (const t of yTests) {
    const svgStr = buildBadgeSvg(t);
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
  .toFile('backend/storage/bottom_clearance_comparison.png');

  console.log('Saved bottom clearance comparison');
}

run().catch(console.error);
