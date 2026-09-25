import sharp from 'sharp';
import fs from 'fs';

const svg = `<svg width="800" height="400" xmlns="http://www.w3.org/2000/svg">
  <rect width="800" height="400" fill="white"/>
  <!-- Original weight -->
  <text x="20" y="80" font-family="Impact" font-size="56" fill="#111111">10 YEARS (Original)</text>
  <!-- Slightly bolder weight (stroke 1.2px) -->
  <text x="20" y="160" font-family="Impact" font-size="56" fill="#111111" stroke="#111111" stroke-width="1.2" stroke-linejoin="round">10 YEARS (Bold 1.2)</text>
  <!-- Medium bolder weight (stroke 1.6px) -->
  <text x="20" y="240" font-family="Impact" font-size="56" fill="#111111" stroke="#111111" stroke-width="1.6" stroke-linejoin="round">10 YEARS (Bold 1.6)</text>
  <!-- CARD WARRANTY (stroke 1.2px) -->
  <text x="20" y="320" font-family="Impact" font-size="34" fill="#111111" stroke="#111111" stroke-width="1.2" stroke-linejoin="round">CARD WARRANTY (Bold 1.2)</text>
</svg>`;

await sharp(Buffer.from(svg)).png().toFile('src/assets/font_test.png');
console.log('Tested font weights in font_test.png');
