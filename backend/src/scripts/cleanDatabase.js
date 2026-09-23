import dotenv from 'dotenv';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function cleanAll() {
  // 1. Clean MongoDB Atlas
  try {
    console.log('Connecting to MongoDB Atlas to clean...');
    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;
    await db.collection('barcodebatches').deleteMany({});
    await db.collection('barcoderecords').deleteMany({});
    console.log('MongoDB Atlas: Successfully cleared all test batches and records.');
    await mongoose.disconnect();
  } catch (err) {
    console.error('Atlas cleanup error:', err.message);
  }

  // 2. Reset local db_store.json
  try {
    const storePath = path.resolve(__dirname, '../../storage/db_store.json');
    const initialData = {
      batches: [],
      records: [],
      templates: [
        {
          _id: 'template-default-01',
          templateName: 'Official Vidhyut Saathi 10-Year Saver Card Label',
          description: 'Standard 2" x 1.5" corporate label with MRP ₹3,498/-, 10 Years Life, 3 Years Warranty, and footer.',
          artworkAsset: 'master_label.jpg',
          cleanArtworkAsset: 'clean_label_template.png',
          artworkVersion: '1.0',
          labelWidthInches: 2.0,
          labelHeightInches: 1.5,
          labelWidthPt: 144,
          labelHeightPt: 108,
          barcodeBox: {
            xRatio: 0.09,
            yRatio: 0.61,
            widthRatio: 0.82,
            heightRatio: 0.17,
          },
          serialBox: {
            xRatio: 0.50,
            yRatio: 0.80,
            fontSizePt: 7.5,
            fontColor: '#000000',
            letterSpacing: 0.8,
          },
          isActive: true,
          createdAt: new Date().toISOString(),
        },
      ],
    };
    fs.writeFileSync(storePath, JSON.stringify(initialData, null, 2), 'utf-8');
    console.log('Local store: Successfully reset to fresh empty state.');
  } catch (err) {
    console.error('Local store cleanup error:', err.message);
  }

  // 3. Clean old PDFs
  try {
    const pdfDir = path.resolve(__dirname, '../../storage/pdfs');
    if (fs.existsSync(pdfDir)) {
      const files = fs.readdirSync(pdfDir);
      for (const f of files) {
        if (f.endsWith('.pdf')) {
          fs.unlinkSync(path.join(pdfDir, f));
          console.log('Deleted old PDF:', f);
        }
      }
    }
  } catch (err) {
    console.error('PDF cleanup error:', err.message);
  }

  console.log('Database and local cache are 100% fresh and clean!');
}

cleanAll();
