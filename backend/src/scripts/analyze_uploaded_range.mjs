import sharp from 'sharp';

async function inspectText() {
  const inputPath = 'C:/Users/USER/.gemini/antigravity-ide/brain/90614fe4-6c73-492e-b82c-0606b444be32/.user_uploaded/media_1790416810186.png';
  const img = sharp(inputPath);
  const meta = await img.metadata();
  console.log('Uploaded Meta:', meta.width, 'x', meta.height);

  // Extract around the barcode and serial text
  await sharp(inputPath)
    .extract({ left: 20, top: 400, width: 984, height: 200 })
    .toFile('C:/Users/USER/.gemini/antigravity-ide/brain/90614fe4-6c73-492e-b82c-0606b444be32/scratch/range_uploaded_box.png');

  console.log('Saved range_uploaded_box.png');
}

inspectText().catch(console.error);
