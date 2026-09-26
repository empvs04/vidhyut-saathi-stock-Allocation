import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function applyUploadedLogo() {
  console.log('--- Applying User Uploaded High-Res Logo to Master Label ---');

  const logoUploadPath = 'C:/Users/USER/.gemini/antigravity-ide/brain/90614fe4-6c73-492e-b82c-0606b444be32/.user_uploaded/media_1790411009191.png';
  const masterTemplatePath = path.resolve(__dirname, '../assets/clean_label_template.png');

  if (!fs.existsSync(logoUploadPath)) {
    throw new Error(`Logo upload not found at ${logoUploadPath}`);
  }
  if (!fs.existsSync(masterTemplatePath)) {
    throw new Error(`Master template not found at ${masterTemplatePath}`);
  }

  // 1. Crop tight bounding box of uploaded logo (removes surrounding whitespace)
  // Bounding box: left: 24, top: 26, width: 986, height: 481
  const tightLogoBuffer = await sharp(logoUploadPath)
    .extract({ left: 24, top: 26, width: 986, height: 481 })
    .png()
    .toBuffer();

  // 2. Convert to transparent vector-grade PNG (pure black artwork, transparent background)
  const { data: lData, info: lInfo } = await sharp(tightLogoBuffer).raw().toBuffer({ resolveWithObject: true });
  const rgbaBuffer = Buffer.alloc(lInfo.width * lInfo.height * 4);

  for (let i = 0; i < lInfo.width * lInfo.height; i++) {
    const srcIdx = i * lInfo.channels;
    const dstIdx = i * 4;
    const r = lData[srcIdx], g = lData[srcIdx+1], b = lData[srcIdx+2];
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;

    if (lum >= 245) {
      rgbaBuffer[dstIdx] = 255;
      rgbaBuffer[dstIdx+1] = 255;
      rgbaBuffer[dstIdx+2] = 255;
      rgbaBuffer[dstIdx+3] = 0; // Transparent background
    } else if (lum <= 60) {
      rgbaBuffer[dstIdx] = 0;
      rgbaBuffer[dstIdx+1] = 0;
      rgbaBuffer[dstIdx+2] = 0;
      rgbaBuffer[dstIdx+3] = 255; // Rich deep black
    } else {
      // Smooth anti-aliased edge transition
      const factor = (245 - lum) / (245 - 60);
      rgbaBuffer[dstIdx] = 0;
      rgbaBuffer[dstIdx+1] = 0;
      rgbaBuffer[dstIdx+2] = 0;
      rgbaBuffer[dstIdx+3] = Math.round(255 * Math.pow(factor, 0.9));
    }
  }

  const vectorGradeLogo = await sharp(rgbaBuffer, {
    raw: { width: lInfo.width, height: lInfo.height, channels: 4 }
  }).png().toBuffer();

  // 3. Clear only the old logo on the master template, preserving top-left corner curve & MRP box
  const { data: mData, info: mInfo } = await sharp(masterTemplatePath).raw().toBuffer({ resolveWithObject: true });
  for (let y = 30; y <= 318; y++) {
    for (let x = 25; x <= 585; x++) {
      // Protect the top-left outer border rounded corner
      if (x < 55 && y < 45 && (x + y < 75)) continue;
      const idx = (y * mInfo.width + x) * mInfo.channels;
      mData[idx] = 255;
      mData[idx+1] = 255;
      mData[idx+2] = 255;
      if (mInfo.channels === 4) mData[idx+3] = 255;
    }
  }

  const cleanMasterBase = await sharp(mData, {
    raw: { width: mInfo.width, height: mInfo.height, channels: mInfo.channels }
  }).png().toBuffer();

  // 4. Resize clean vector logo to exact label visual proportion (w: 532, h: 259)
  // Placement: left: 35, top: 40 (perfectly aligned with MRP box and 10 Years card)
  const resizedNewLogo = await sharp(vectorGradeLogo)
    .resize(532, 259, { kernel: 'lanczos3' })
    .toBuffer();

  const finalNewMasterBuffer = await sharp(cleanMasterBase)
    .composite([{ input: resizedNewLogo, top: 40, left: 35 }])
    .png()
    .toBuffer();

  // 5. Deploy to all template locations
  const pngDestinations = [
    path.resolve(__dirname, '../assets/clean_label_template.png'),
    path.resolve(__dirname, '../assets/VidhyutSaathi_Label_2x1.5in.png'),
    path.resolve(__dirname, '../../../frontend/public/clean_label_template.png'),
    path.resolve(__dirname, '../../../frontend/public/VidhyutSaathi_Label_2x1.5in.png'),
    path.resolve(__dirname, '../../../VidhyutSaathi_Label_2x1.5in.png'),
    path.resolve(__dirname, '../../storage/master_approved_exact_label.png'),
  ];

  if (fs.existsSync(path.resolve(__dirname, '../../../frontend/dist'))) {
    pngDestinations.push(
      path.resolve(__dirname, '../../../frontend/dist/clean_label_template.png'),
      path.resolve(__dirname, '../../../frontend/dist/VidhyutSaathi_Label_2x1.5in.png')
    );
  }

  for (const dest of pngDestinations) {
    await sharp(finalNewMasterBuffer).png().toFile(dest);
    console.log('✓ Deployed PNG:', dest);
  }

  // 6. Deploy JPEGs (quality: 98)
  const jpegBuffer = await sharp(finalNewMasterBuffer)
    .jpeg({ quality: 98, chromaSubsampling: '4:4:4' })
    .toBuffer();

  const jpegDestinations = [
    path.resolve(__dirname, '../assets/clean_label_template.jpg'),
    path.resolve(__dirname, '../assets/master_label.jpg'),
    path.resolve(__dirname, '../../../frontend/public/master_label.jpg'),
  ];

  if (fs.existsSync(path.resolve(__dirname, '../../../frontend/dist'))) {
    jpegDestinations.push(
      path.resolve(__dirname, '../../../frontend/dist/master_label.jpg')
    );
  }

  for (const dest of jpegDestinations) {
    await sharp(jpegBuffer).toFile(dest);
    console.log('✓ Deployed JPEG:', dest);
  }

  // Also save preview to scratch for quick visual verification
  const previewOut = 'C:/Users/USER/.gemini/antigravity-ide/brain/90614fe4-6c73-492e-b82c-0606b444be32/scratch/new_master_final.png';
  await sharp(finalNewMasterBuffer).toFile(previewOut);

  console.log('\n✅ High-resolution logo successfully applied to label template everywhere!');
}

applyUploadedLogo().catch(console.error);
