import sharp from 'sharp';

async function analyzeCoords() {
  const origPath = 'C:/Users/USER/.gemini/antigravity-ide/brain/3ae79501-f73b-4c4b-9e6d-4ddec9fb7aef/.user_uploaded/media_1790151917987.png';
  
  // Resize original to 1200x900 to get exact equivalent coordinates
  const { data, info } = await sharp(origPath)
    .resize(1200, 900, { fit: 'fill' })
    .raw()
    .toBuffer({ resolveWithObject: true });

  const w = info.width;
  const h = info.height;
  const ch = info.channels;

  // Let's find:
  // 1. Left badge divider line: x and y range
  // 2. Left badge "10 YEARS" bounding box: minX, maxX, minY, maxY
  // 3. Left badge "LONG LIFE" bounding box: minX, maxX, minY, maxY
  // 4. Right badge divider line: x and y range
  // 5. Right badge "CARD WARRANTY" bounding box: minX, maxX, minY, maxY
  // 6. Right badge "3 YEARS" bounding box: minX, maxX, minY, maxY

  function isBlack(x, y) {
    if (x < 0 || x >= w || y < 0 || y >= h) return false;
    const idx = (y * w + x) * ch;
    // Greyscale value
    const val = (data[idx] + data[idx+1] + data[idx+2]) / 3;
    return val < 100;
  }

  // Divider lines scan around y=350..460
  // Left divider is around x=170..210
  let lDivX = 0;
  let lDivCount = 0;
  for (let x = 150; x < 230; x++) {
    let count = 0;
    for (let y = 350; y < 460; y++) {
      if (isBlack(x, y)) count++;
    }
    if (count > lDivCount) {
      lDivCount = count;
      lDivX = x;
    }
  }

  // Right divider is around x=740..800
  let rDivX = 0;
  let rDivCount = 0;
  for (let x = 720; x < 810; x++) {
    let count = 0;
    for (let y = 350; y < 460; y++) {
      if (isBlack(x, y)) count++;
    }
    if (count > rDivCount) {
      rDivCount = count;
      rDivX = x;
    }
  }

  console.log(`Left divider at x=${lDivX}, Right divider at x=${rDivX}`);

  // Left card "10 YEARS" (y between 335 and 420, x from lDivX+5 to 585)
  // Let's find bounding boxes of connected components or row/col profiles
  console.log('\n--- Left Card ---');
  // Row profile of Left Card text area (x: lDivX + 5 .. 585, y: 335 .. 475)
  for (let y = 335; y <= 475; y += 5) {
    let blackCols = [];
    for (let x = lDivX + 3; x < 585; x++) {
      if (isBlack(x, y)) blackCols.push(x);
    }
    if (blackCols.length > 0) {
      console.log(`y=${y}: minX=${Math.min(...blackCols)}, maxX=${Math.max(...blackCols)}, count=${blackCols.length}`);
    }
  }

  console.log('\n--- Right Card ---');
  // Row profile of Right Card text area (x: rDivX + 3 .. 1165, y: 335 .. 475)
  for (let y = 335; y <= 475; y += 5) {
    let blackCols = [];
    for (let x = rDivX + 3; x < 1165; x++) {
      if (isBlack(x, y)) blackCols.push(x);
    }
    if (blackCols.length > 0) {
      console.log(`y=${y}: minX=${Math.min(...blackCols)}, maxX=${Math.max(...blackCols)}, count=${blackCols.length}`);
    }
  }
}

analyzeCoords().catch(console.error);
