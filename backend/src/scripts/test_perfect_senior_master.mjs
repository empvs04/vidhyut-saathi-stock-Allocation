import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function createPerfectSeniorMaster() {
  const baseTemplatePath = path.resolve(__dirname, '../../storage/clean_single_dark_border_template.png');
  const userMasterPath = path.resolve(__dirname, '../../storage/new_master_user_label.png');

  // Extract the exact barcode box outline from userMaster
  // In userMaster (1200x900): top: 540, left: 24, width: 1152, height: 232
  const boxOutlineCrop = await sharp(userMasterPath)
    .extract({ left: 24, top: 540, width: 1152, height: 232 })
    .toBuffer();

  // Clean composite onto the clean_single_dark_border_template
  const finalMasterBuffer = await sharp(baseTemplatePath)
    .composite([
      { input: boxOutlineCrop, top: 540, left: 24 }
    ])
    .png()
    .toBuffer();

  const previewPath = path.resolve(__dirname, '../../storage/senior_designer_preview.png');
  await sharp(finalMasterBuffer).toFile(previewPath);
  console.log('✓ Created senior designer preview at:', previewPath);
}

createPerfectSeniorMaster().catch(console.error);
