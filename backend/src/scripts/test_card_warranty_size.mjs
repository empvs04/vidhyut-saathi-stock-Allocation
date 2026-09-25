import sharp from 'sharp';
import fs from 'fs';

const W = 1200;
const H = 900;
const BADGE_TOP = 332;
const BADGE_H = 148;
const BADGE_BOTTOM = BADGE_TOP + BADGE_H;
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

const sizes = [43, 45, 47];

for (const s of sizes) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="570" height="148">
    <rect width="570" height="148" fill="white" stroke="black" stroke-width="3.5" rx="20"/>
    <line x1="170" y1="0" x2="170" y2="148" stroke="black" stroke-width="3.5"/>
    <!-- Shield Icon Placeholder -->
    <circle cx="85" cy="74" r="50" fill="#111111"/>
    <!-- Text -->
    <text x="370" y="${372 - 332}" font-family="Impact" font-size="${s}" letter-spacing="1.2" text-anchor="middle" fill="#111111" stroke="#111111" stroke-width="0.6px">CARD WARRANTY</text>
    <text x="370" y="${452 - 332}" font-family="Impact" font-size="70" text-anchor="middle" fill="#111111" stroke="#111111" stroke-width="0.8px">3 YEARS</text>
  </svg>`;

  await sharp(Buffer.from(svg)).png().toFile(`backend/storage/warranty_size_${s}.png`);
}

console.log('Generated warranty size tests');
