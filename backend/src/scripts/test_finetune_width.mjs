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

// Calendar Icon
const CAL_W = 66;
const CAL_H = 58;
const CAL_L = CX - CAL_W / 2;
const CAL_T = CY - CAL_H / 2;
const HK_W = 7;
const HK_H = 13;
const HK_Y = CAL_T - 4;
const HK_L1 = CX - 18;
const HK_L2 = CX + 11;
const SHELF_Y = CAL_T + 5;
const SHELF_H = 11;
const GW = 17;
const GH = 12;
const G_GAP = 6;
const GX1 = CX - (GW * 1.5 + G_GAP);
const GX2 = CX - GW / 2;
const GX3 = CX + GW / 2 + G_GAP;
const GY1 = SHELF_Y + SHELF_H + 6;
const GY2 = GY1 + GH + 5;

const fineTuneConfigs = [
  {
    name: 'FineTune_1',
    svg: `
      <style>
        .bold-heading {
          font-family: 'Arial Black', 'Impact', sans-serif;
          font-weight: 900;
          fill: #111111;
          stroke: none;
          text-anchor: middle;
        }
        .regular-sub {
          font-family: 'Arial', 'Helvetica', 'Segoe UI', sans-serif;
          font-weight: bold;
          fill: #111111;
          stroke: none;
          text-anchor: middle;
        }
      </style>
      <!-- Left Card: 10 YEARS & LONG LIFE spanning full width -->
      <text x="${L_TEXT_CENTER}" y="400" class="bold-heading" font-size="64" letter-spacing="1.5">10 YEARS</text>
      <text x="${L_TEXT_CENTER}" y="446" class="regular-sub" font-size="36" letter-spacing="6">LONG LIFE</text>

      <!-- Right Card: CARD WARRANTY & 3 YEARS spanning full width -->
      <text x="${R_TEXT_CENTER}" y="378" class="regular-sub" font-size="34" letter-spacing="4">CARD WARRANTY</text>
      <text x="${R_TEXT_CENTER}" y="446" class="bold-heading" font-size="64" letter-spacing="1.5">3 YEARS</text>
    `
  },
  {
    name: 'FineTune_2',
    svg: `
      <style>
        .bold-heading {
          font-family: 'Arial Black', 'Impact', sans-serif;
          font-weight: 900;
          fill: #111111;
          stroke: none;
          text-anchor: middle;
        }
        .regular-sub {
          font-family: 'Arial', 'Helvetica', 'Segoe UI', sans-serif;
          font-weight: bold;
          fill: #111111;
          stroke: none;
          text-anchor: middle;
        }
      </style>
      <text x="${L_TEXT_CENTER}" y="400" class="bold-heading" font-size="68" letter-spacing="2">10 YEARS</text>
      <text x="${L_TEXT_CENTER}" y="446" class="regular-sub" font-size="38" letter-spacing="7">LONG LIFE</text>

      <text x="${R_TEXT_CENTER}" y="378" class="regular-sub" font-size="36" letter-spacing="4.5">CARD WARRANTY</text>
      <text x="${R_TEXT_CENTER}" y="446" class="bold-heading" font-size="68" letter-spacing="2">3 YEARS</text>
    `
  },
  {
    name: 'FineTune_3_FullSpan',
    svg: `
      <style>
        .bold-heading {
          font-family: 'Arial Black', 'Impact', sans-serif;
          font-weight: 900;
          fill: #111111;
          stroke: none;
          text-anchor: middle;
        }
        .regular-sub {
          font-family: 'Arial', 'Helvetica', 'Segoe UI', sans-serif;
          font-weight: bold;
          fill: #111111;
          stroke: none;
          text-anchor: middle;
        }
      </style>
      <text x="${L_TEXT_CENTER}" y="400" class="bold-heading" font-size="66" textLength="345" lengthAdjust="spacingAndGlyphs">10 YEARS</text>
      <text x="${L_TEXT_CENTER}" y="446" class="regular-sub" font-size="36" textLength="300" lengthAdjust="spacing">LONG LIFE</text>

      <text x="${R_TEXT_CENTER}" y="378" class="regular-sub" font-size="35" textLength="345" lengthAdjust="spacing">CARD WARRANTY</text>
      <text x="${R_TEXT_CENTER}" y="446" class="bold-heading" font-size="66" textLength="345" lengthAdjust="spacingAndGlyphs">3 YEARS</text>
    `
  }
];

function buildFullSvg(textSvg) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
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

  <!-- Left Icon: Calendar -->
  <circle cx="${CX}" cy="${CY}" r="${IR}" fill="#111111"/>
  <rect x="${HK_L1}" y="${HK_Y}" width="${HK_W}" height="${HK_H}" rx="3.5" fill="#FFFFFF"/>
  <rect x="${HK_L2}" y="${HK_Y}" width="${HK_W}" height="${HK_H}" rx="3.5" fill="#FFFFFF"/>
  <rect x="${CAL_L}" y="${SHELF_Y}" width="${CAL_W}" height="${SHELF_H}" rx="2" fill="#FFFFFF"/>
  <rect x="${GX1}" y="${GY1}" width="${GW}" height="${GH}" rx="2" fill="#FFFFFF"/>
  <rect x="${GX2}" y="${GY1}" width="${GW}" height="${GH}" rx="2" fill="#FFFFFF"/>
  <rect x="${GX3}" y="${GY1}" width="${GW}" height="${GH}" rx="2" fill="#FFFFFF"/>
  <rect x="${GX1}" y="${GY2}" width="${GW}" height="${GH}" rx="2" fill="#FFFFFF"/>
  <rect x="${GX2}" y="${GY2}" width="${GW}" height="${GH}" rx="2" fill="#FFFFFF"/>
  <rect x="${GX3}" y="${GY2}" width="${GW}" height="${GH}" rx="2" fill="#FFFFFF"/>

  <!-- Right Icon: Shield -->
  <circle cx="${SX}" cy="${SY}" r="${IR}" fill="#111111"/>
  <path d="
    M ${SX},${SY - 36}
    L ${SX + 28},${SY - 21}
    L ${SX + 28},${SY + 4}
    Q ${SX + 28},${SY + 26} ${SX},${SY + 39}
    Q ${SX - 28},${SY + 26} ${SX - 28},${SY + 4}
    L ${SX - 28},${SY - 21}
    Z
  " fill="#FFFFFF"/>
  <path d="
    M ${SX},${SY - 26}
    L ${SX + 19},${SY - 14}
    L ${SX + 19},${SY + 4}
    Q ${SX + 19},${SY + 20} ${SX},${SY + 30}
    Q ${SX - 19},${SY + 20} ${SX - 19},${SY + 4}
    L ${SX - 19},${SY - 14}
    Z
  " fill="#111111"/>
  <polyline
    points="${SX - 10},${SY + 4} ${SX - 2},${SY + 13} ${SX + 14},${SY - 9}"
    stroke="#FFFFFF" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" fill="none"/>

  ${textSvg}
</svg>`;
}

async function run() {
  const baseTemplate = 'C:/Users/USER/Desktop/barcode/VidhyutSaathi_Label_2x1.5in.png';
  const baseBuf = fs.readFileSync(baseTemplate);

  const crops = [];
  for (const cfg of fineTuneConfigs) {
    const svgStr = buildFullSvg(cfg.svg);
    const img = await sharp(baseBuf).composite([{ input: Buffer.from(svgStr), top: 0, left: 0 }]).png().toBuffer();
    const crop = await sharp(img).extract({ left: 0, top: 320, width: 1200, height: 170 }).png().toBuffer();
    crops.push(crop);
  }

  const origBand = await sharp('backend/storage/orig_badges_full_band.png').resize(1200, 170).toBuffer();

  const totalH = 170 * 4 + 30;
  await sharp({
    create: {
      width: 1200,
      height: totalH,
      channels: 4,
      background: { r: 240, g: 240, b: 240, alpha: 1 }
    }
  })
  .composite([
    { input: origBand, top: 0, left: 0 },
    { input: crops[0], top: 180, left: 0 },
    { input: crops[1], top: 360, left: 0 },
    { input: crops[2], top: 540, left: 0 },
  ])
  .png()
  .toFile('backend/storage/finetune_full_width.png');

  console.log('Saved finetune full width comparison');
}

run().catch(console.error);
