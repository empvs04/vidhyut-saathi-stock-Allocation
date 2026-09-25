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

// Variations:
// Test 1: stroke: none (pure natural Impact, no artificial thickening)
// Test 2: stroke-width: 0.3px
// Test 3: stroke-width: 0.4px

const testRuns = [
  { name: 'stroke_none', stroke: 'none', strokeW: '0px', ltY1: 400, ltY2: 446, rtY1: 378, rtY2: 444, sizeHead: 64 },
  { name: 'stroke_0_3', stroke: '#111111', strokeW: '0.3px', ltY1: 401, ltY2: 446, rtY1: 378, rtY2: 444, sizeHead: 65 },
  { name: 'stroke_0_4', stroke: '#111111', strokeW: '0.4px', ltY1: 402, ltY2: 446, rtY1: 378, rtY2: 444, sizeHead: 64 },
];

function makeSvg(t) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs>
    <style>
      .badge-bold {
        font-family: 'Impact', 'Haettenschweiler', 'Arial Narrow Bold', sans-serif;
        font-weight: normal;
        fill: #111111;
        ${t.stroke === 'none' ? 'stroke: none;' : `stroke: ${t.stroke}; stroke-width: ${t.strokeW}; stroke-linejoin: round;`}
        text-anchor: middle;
      }
      .badge-regular {
        font-family: 'Arial', 'Helvetica', 'Segoe UI', sans-serif;
        font-weight: bold;
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

  <!-- Left: 10 YEARS & LONG LIFE -->
  <text x="${L_TEXT_CENTER}" y="${t.ltY1}" class="badge-bold" font-size="${t.sizeHead}">10 YEARS</text>
  <text x="${L_TEXT_CENTER}" y="${t.ltY2}" class="badge-regular" font-size="35" letter-spacing="2.5">LONG LIFE</text>

  <!-- Right: CARD WARRANTY & 3 YEARS -->
  <text x="${R_TEXT_CENTER}" y="${t.rtY1}" class="badge-regular" font-size="33" letter-spacing="1.5">CARD WARRANTY</text>
  <text x="${R_TEXT_CENTER}" y="${t.rtY2}" class="badge-bold" font-size="${t.sizeHead}">3 YEARS</text>
</svg>`;
}

async function run() {
  const baseTemplate = 'C:/Users/USER/Desktop/barcode/VidhyutSaathi_Label_2x1.5in.png';
  const baseBuf = fs.readFileSync(baseTemplate);

  const crops = [];
  for (const t of testRuns) {
    const svgStr = makeSvg(t);
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
  .toFile('backend/storage/top_space_and_boldness_test.png');

  console.log('Saved top space and boldness test');
}

run().catch(console.error);
