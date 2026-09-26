import sharp from 'sharp';

async function checkSimilarity() {
  const m1 = await sharp('C:/Users/USER/.gemini/antigravity-ide/brain/90614fe4-6c73-492e-b82c-0606b444be32/.user_uploaded/media_1790416810186.png').raw().toBuffer({ resolveWithObject: true });
  const m2Resized = await sharp('C:/Users/USER/Downloads/ChatGPT Image Sep 26, 2026, 01_48_52 PM.png')
    .resize(1024, 682, { fit: 'fill' })
    .raw()
    .toBuffer({ resolveWithObject: true });

  let diff = 0;
  for (let i = 0; i < m1.data.length; i += m1.info.channels) {
    if (Math.abs(m1.data[i] - m2Resized.data[i]) > 30) diff++;
  }
  console.log('Diff pixel count between uploaded and resized 1536x1024:', diff);
}

checkSimilarity().catch(console.error);
