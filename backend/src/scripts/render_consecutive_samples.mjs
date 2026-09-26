import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function renderConsecutiveSamples() {
  const cleanTemplatePath = path.resolve(__dirname, '../assets/range_label_clean_template.png');
  const outDir = 'C:/Users/USER/.gemini/antigravity-ide/brain/90614fe4-6c73-492e-b82c-0606b444be32/scratch';

  const samples = [
    { start: '0020231501', end: '0020231510', name: 'range_sample_label_1.png' },
    { start: '0020231511', end: '0020231520', name: 'range_sample_label_2.png' },
    { start: '0020231521', end: '0020231530', name: 'range_sample_label_3.png' },
    { start: '0020231531', end: '0020231540', name: 'range_sample_label_4.png' },
  ];

  for (const s of samples) {
    const textSvg = `
      <svg width="1024" height="682" xmlns="http://www.w3.org/2000/svg">
        <style>
          .serial-range {
            font-family: Arial, Helvetica, 'Segoe UI', sans-serif;
            font-weight: 800;
            font-size: 44px;
            fill: #000000;
            text-anchor: middle;
            letter-spacing: 0.8px;
          }
        </style>
        <text x="512" y="546" class="serial-range">${s.start} ----- ${s.end}</text>
      </svg>
    `;

    const outPath = path.join(outDir, s.name);
    await sharp(cleanTemplatePath)
      .composite([{ input: Buffer.from(textSvg), top: 0, left: 0 }])
      .png()
      .toFile(outPath);

    console.log(`Rendered: ${s.name}`);
  }
}

renderConsecutiveSamples().catch(console.error);
