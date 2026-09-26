import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function prepareTemplates() {
  const userUploadPath = 'C:/Users/USER/.gemini/antigravity-ide/brain/90614fe4-6c73-492e-b82c-0606b444be32/.user_uploaded/media_1790416810186.png';
  const backendAssetsDir = path.resolve(__dirname, '../assets');
  const frontendPublicDir = path.resolve(__dirname, '../../../frontend/public');
  const frontendDistDir = path.resolve(__dirname, '../../../frontend/dist');

  // Verify source image
  const img = sharp(userUploadPath);
  const meta = await img.metadata();
  console.log(`Source Image: ${meta.width} x ${meta.height}`);

  // 1. Master visual reference template (with original 0020231501 ----- 0020231510)
  const masterBuffer = await sharp(userUploadPath).png().toBuffer();

  // 2. Clean template (whitened text area so any range can be dynamically rendered)
  const whitePatchSvg = `
    <svg width="${meta.width}" height="${meta.height}" xmlns="http://www.w3.org/2000/svg">
      <rect x="50" y="494" width="924" height="76" fill="#ffffff" />
    </svg>
  `;

  const cleanBuffer = await sharp(masterBuffer)
    .composite([{ input: Buffer.from(whitePatchSvg), top: 0, left: 0 }])
    .png()
    .toBuffer();

  // Write files
  const targets = [
    { dir: backendAssetsDir, name: 'range_label_template.png', buf: masterBuffer },
    { dir: backendAssetsDir, name: 'range_label_clean_template.png', buf: cleanBuffer },
    { dir: frontendPublicDir, name: 'range_label_template.png', buf: masterBuffer },
    { dir: frontendPublicDir, name: 'range_label_clean_template.png', buf: cleanBuffer },
  ];

  if (fs.existsSync(frontendDistDir)) {
    targets.push(
      { dir: frontendDistDir, name: 'range_label_template.png', buf: masterBuffer },
      { dir: frontendDistDir, name: 'range_label_clean_template.png', buf: cleanBuffer }
    );
  }

  for (const t of targets) {
    const fullPath = path.join(t.dir, t.name);
    fs.writeFileSync(fullPath, t.buf);
    console.log(`Wrote: ${fullPath} (${t.buf.length} bytes)`);
  }

  console.log('Range label templates successfully created!');
}

prepareTemplates().catch(console.error);
