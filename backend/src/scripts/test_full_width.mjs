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

// Left text area: x=194 to x=594 (width = 400px, usable width = 360px, center = 394)
// Right text area: x=776 to x=1176 (width = 400px, usable width = 360px, center = 976)

const testConfigs = [
  // Config 1: Arial Black font (wide bold letters that naturally fill the width)
  {
    name: 'Arial_Black_Full_Width',
    svg: `
      <style>
        .head-ab {
          font-family: 'Arial Black', 'Impact', sans-serif;
          font-weight: 900;
          fill: #111111;
          text-anchor: middle;
        }
        .sub-ab {
          font-family: 'Arial Black', 'Impact', sans-serif;
          font-weight: 900;
          fill: #111111;
          text-anchor: middle;
        }
      </style>
      <text x="${L_TEXT_CENTER}" y="398" class="head-ab" font-size="62" letter-spacing="1">10 YEARS</text>
      <text x="${L_TEXT_CENTER}" y="446" class="sub-ab" font-size="38" letter-spacing="3">LONG LIFE</text>

      <text x="${R_TEXT_CENTER}" y="378" class="sub-ab" font-size="32" letter-spacing="2">CARD WARRANTY</text>
      <text x="${R_TEXT_CENTER}" y="446" class="head-ab" font-size="62" letter-spacing="1">3 YEARS</text>
    `
  },
  // Config 2: Impact font with textLength stretching to fill full width
  {
    name: 'Impact_Full_Width_TextLength',
    svg: `
      <style>
        .head-imp {
          font-family: 'Impact', 'Haettenschweiler', sans-serif;
          font-weight: normal;
          fill: #111111;
          text-anchor: middle;
        }
        .sub-reg {
          font-family: 'Arial', 'Helvetica', sans-serif;
          font-weight: bold;
          fill: #111111;
          text-anchor: middle;
        }
      </style>
      <text x="${L_TEXT_CENTER}" y="398" class="head-imp" font-size="70" textLength="340" lengthAdjust="spacingAndGlyphs">10 YEARS</text>
      <text x="${L_TEXT_CENTER}" y="446" class="sub-reg" font-size="36" textLength="280" lengthAdjust="spacing">LONG LIFE</text>

      <text x="${R_TEXT_CENTER}" y="378" class="sub-reg" font-size="34" textLength="330" lengthAdjust="spacing">CARD WARRANTY</text>
      <text x="${R_TEXT_CENTER}" y="446" class="head-imp" font-size="70" textLength="340" lengthAdjust="spacingAndGlyphs">3 YEARS</text>
    `
  },
  // Config 3: Letter-spaced wide Impact (spacing only, natural glyphs)
  {
    name: 'Impact_Wide_LetterSpacing',
    svg: `
      <style>
        .head-imp {
          font-family: 'Impact', 'Haettenschweiler', sans-serif;
          font-weight: normal;
          fill: #111111;
          text-anchor: middle;
        }
        .sub-reg {
          font-family: 'Arial', 'Helvetica', sans-serif;
          font-weight: bold;
          fill: #111111;
          text-anchor: middle;
        }
      </style>
      <text x="${L_TEXT_CENTER}" y="398" class="head-imp" font-size="72" letter-spacing="8">10 YEARS</text>
      <text x="${L_TEXT_CENTER}" y="446" class="sub-reg" font-size="36" letter-spacing="6">LONG LIFE</text>

      <text x="${R_TEXT_CENTER}" y="378" class="sub-reg" font-size="34" letter-spacing="3.5">CARD WARRANTY</text>
      <text x="${R_TEXT_CENTER}" y="446" class="head-imp" font-size="72" letter-spacing="8">3 YEARS</text>
    `
  },
  // Config 4: Balanced Hybrid (Arial Black headings for natural wide box-filling + bold clean subheadings)
  {
    name: 'Hybrid_ArialBlack_CleanSub',
    svg: `
      <style>
        .head-ab {
          font-family: 'Arial Black', 'Impact', sans-serif;
          font-weight: 900;
          fill: #111111;
          text-anchor: middle;
        }
        .sub-reg {
          font-family: 'Arial', 'Helvetica', sans-serif;
          font-weight: bold;
          fill: #111111;
          text-anchor: middle;
        }
      </style>
      <text x="${L_TEXT_CENTER}" y="398" class="head-ab" font-size="64" letter-spacing="1">10 YEARS</text>
      <text x="${L_TEXT_CENTER}" y="446" class="sub-reg" font-size="36" letter-spacing="5">LONG LIFE</text>

      <text x="${R_TEXT_CENTER}" y="378" class="sub-reg" font-size="34" letter-spacing="3">CARD WARRANTY</text>
      <text x="${R_TEXT_CENTER}" y="446" class="head-ab" font-size="64" letter-spacing="1">3 YEARS</text>
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

  <!-- Left Icon Placeholder -->
  <circle cx="${CX}" cy="${CY}" r="${IR}" fill="#111111"/>

  <!-- Right Icon Placeholder -->
  <circle cx="${SX}" cy="${SY}" r="${IR}" fill="#111111"/>

  ${textSvg}
</svg>`;
}

async function run() {
  const baseTemplate = 'C:/Users/USER/Desktop/barcode/VidhyutSaathi_Label_2x1.5in.png';
  const baseBuf = fs.readFileSync(baseTemplate);

  const crops = [];
  for (const cfg of testConfigs) {
    const svgStr = buildFullSvg(cfg.svg);
    const img = await sharp(baseBuf).composite([{ input: Buffer.from(svgStr), top: 0, left: 0 }]).png().toBuffer();
    const crop = await sharp(img).extract({ left: 0, top: 320, width: 1200, height: 170 }).png().toBuffer();
    crops.push(crop);
  }

  const origBand = await sharp('backend/storage/orig_badges_full_band.png').resize(1200, 170).toBuffer();

  const totalH = 170 * 5 + 30;
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
    { input: crops[3], top: 720, left: 0 },
  ])
  .png()
  .toFile('backend/storage/full_width_comparison.png');

  console.log('Saved full width comparison');
}

run().catch(console.error);
