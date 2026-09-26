import sharp from 'sharp';

async function findContainer() {
  const inputPath = 'C:/Users/USER/.gemini/antigravity-ide/brain/90614fe4-6c73-492e-b82c-0606b444be32/.user_uploaded/media_1790416810186.png';
  const img = sharp(inputPath);
  const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });

  // Let's crop just the text row between y = 510 and y = 560
  // And inspect column-wise black pixel counts
  console.log('Inspecting column projections between y=515 and y=555:');
  const cols = [];
  for (let x = 0; x < 1024; x++) {
    let count = 0;
    for (let y = 515; y <= 555; y++) {
      const idx = (y * 1024 + x) * info.channels;
      if (data[idx] < 80) count++;
    }
    if (count > 0) cols.push({ x, count });
  }
  const minTextX = Math.min(...cols.filter(c => c.x > 50 && c.x < 980).map(c => c.x));
  const maxTextX = Math.max(...cols.filter(c => c.x > 50 && c.x < 980).map(c => c.x));
  console.log(`Text column range: [${minTextX}, ${maxTextX}], width: ${maxTextX - minTextX + 1}`);

  // Let's also check vertical projection of text
  const rows = [];
  for (let y = 500; y <= 570; y++) {
    let count = 0;
    for (let x = minTextX; x <= maxTextX; x++) {
      const idx = (y * 1024 + x) * info.channels;
      if (data[idx] < 80) count++;
    }
    if (count > 0) rows.push({ y, count });
  }
  const minTextY = Math.min(...rows.map(r => r.y));
  const maxTextY = Math.max(...rows.map(r => r.y));
  console.log(`Text row range: [${minTextY}, ${maxTextY}], height: ${maxTextY - minTextY + 1}`);
  console.log(`Center X of text: ${(minTextX + maxTextX) / 2}`);
  console.log(`Center Y of text: ${(minTextY + maxTextY) / 2}`);
}

findContainer().catch(console.error);
