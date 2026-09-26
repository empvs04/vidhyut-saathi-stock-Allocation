import sharp from 'sharp';
import fs from 'fs';

async function analyze() {
  const masterPath = 'C:/Users/USER/.gemini/antigravity-ide/brain/90614fe4-6c73-492e-b82c-0606b444be32/scratch/chatgpt_48_52.png';
  const img = sharp(masterPath);
  const meta = await img.metadata();
  console.log('Metadata:', meta.width, 'x', meta.height);

  // Extract around the barcode box and text
  await sharp(masterPath)
    .extract({ left: 40, top: 620, width: 1456, height: 240 })
    .toFile('C:/Users/USER/.gemini/antigravity-ide/brain/90614fe4-6c73-492e-b82c-0606b444be32/scratch/range_box_crop.png');

  console.log('Saved range_box_crop.png');
}

analyze().catch(console.error);
