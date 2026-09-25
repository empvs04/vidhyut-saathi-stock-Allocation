import sharp from 'sharp';
import fs from 'fs';

const W = 1200;
const H = 900;
const BADGE_TOP = 332;
const BADGE_H = 148;
const BADGE_CY = BADGE_TOP + BADGE_H / 2; // 406
const R_TEXT_CENTER = 976;

// Let's test different font sizes for "3 YEARS" and Y positions
const tests = [
  { size: 62, y1: BADGE_CY - 18, y2: BADGE_CY + 48, subSize: 38 },
  { size: 60, y1: BADGE_CY - 18, y2: BADGE_CY + 48, subSize: 38 },
  { size: 58, y1: BADGE_CY - 18, y2: BADGE_CY + 48, subSize: 36 },
];

for (let i = 0; i < tests.length; i++) {
  const t = tests[i];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="570" height="148">
    <rect width="570" height="148" fill="white" stroke="black" stroke-width="3.5" rx="20"/>
    <line x1="170" y1="0" x2="170" y2="148" stroke="black" stroke-width="3.5"/>
    <text x="${370}" y="${148/2 - 18}" font-family="Impact" font-size="${t.subSize}" letter-spacing="1.5" text-anchor="middle" fill="#111111" stroke="#111111" stroke-width="0.6px">CARD WARRANTY</text>
    <text x="${370}" y="${148/2 + 48}" font-family="Impact" font-size="${t.size}" text-anchor="middle" fill="#111111" stroke="#111111" stroke-width="0.8px">3 YEARS</text>
  </svg>`;

  await sharp(Buffer.from(svg)).png().toFile(`backend/storage/warranty_test_${i}.png`);
}

console.log('Tested warranty sizes');
