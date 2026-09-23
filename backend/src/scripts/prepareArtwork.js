import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function prepareArtwork() {
  const masterPath = path.resolve(__dirname, '../assets/master_label.jpg');
  const cleanOutputPath = path.resolve(__dirname, '../assets/clean_label_template.png');
  const cleanJpgPath = path.resolve(__dirname, '../assets/clean_label_template.jpg');

  // 1. Crop the card to its EXACT outer border: left: 8, top: 60, width: 1007, height: 653
  // This completely eliminates the outer white canvas margin and drop shadow!
  const croppedCard = await sharp(masterPath)
    .extract({ left: 8, top: 60, width: 1007, height: 653 })
    .resize(1024, 768, { fit: 'fill' }) // exact 4:3 aspect ratio matching 2" x 1.5"
    .toBuffer();

  // In the 1024x768 edge-to-edge card:
  // Box top border is at y ≈ 463
  // Box bottom border is at y ≈ 698
  // Old barcode bars & serial: y ≈ 490 to 670, x ≈ 80 to 944
  const whiteRectSvg = Buffer.from(
    `<svg width="1024" height="768">
      <rect x="75" y="488" width="874" height="208" fill="#FFFFFF" />
    </svg>`
  );

  await sharp(croppedCard)
    .composite([
      {
        input: whiteRectSvg,
        top: 0,
        left: 0,
      },
    ])
    .png()
    .toFile(cleanOutputPath);

  await sharp(cleanOutputPath)
    .jpeg({ quality: 95, chromaSubsampling: '4:4:4' })
    .toFile(cleanJpgPath);

  console.log('Edge-to-edge clean label template generated successfully (1024x768, 4:3)!');
}

prepareArtwork().catch(console.error);
