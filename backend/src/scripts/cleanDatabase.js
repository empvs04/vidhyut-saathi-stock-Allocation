import dotenv from 'dotenv';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function cleanAll() {
  console.log('--- Starting Complete Backend Data Cleanup ---');

  // 1. Clean MongoDB Atlas
  if (process.env.MONGODB_URI) {
    try {
      console.log('Connecting to MongoDB Atlas to clean...');
      await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
      const db = mongoose.connection.db;
      const collections = await db.listCollections().toArray();
      console.log('Collections in Atlas:', collections.map((c) => c.name));

      const batchRes = await db.collection('barcodebatches').deleteMany({});
      const recRes = await db.collection('barcoderecords').deleteMany({});
      console.log(`MongoDB Atlas: Deleted ${batchRes.deletedCount} batches and ${recRes.deletedCount} records.`);

      await mongoose.disconnect();
    } catch (err) {
      console.error('Atlas cleanup error:', err.message);
    }
  }

  // 2. Clean Fallback MongoDB if running
  if (process.env.FALLBACK_MONGODB_URI) {
    try {
      console.log('Checking local MongoDB fallback...');
      await mongoose.connect(process.env.FALLBACK_MONGODB_URI, { serverSelectionTimeoutMS: 3000 });
      const db = mongoose.connection.db;
      const collections = await db.listCollections().toArray();
      if (collections.some(c => c.name === 'barcodebatches')) {
        const batchRes = await db.collection('barcodebatches').deleteMany({});
        console.log(`Local MongoDB: Deleted ${batchRes.deletedCount} batches.`);
      }
      if (collections.some(c => c.name === 'barcoderecords')) {
        const recRes = await db.collection('barcoderecords').deleteMany({});
        console.log(`Local MongoDB: Deleted ${recRes.deletedCount} records.`);
      }
      await mongoose.disconnect();
    } catch (err) {
      console.log('Local MongoDB not reachable or not running (skipping fallback clean):', err.message);
    }
  }

  // 3. Reset local db_store.json
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
    console.log('Local db_store.json: Successfully reset to fresh empty state (0 batches, 0 records).');
  } catch (err) {
    console.error('Local store cleanup error:', err.message);
  }

  // 4. Clean old PDFs
  try {
    const pdfDir = path.resolve(__dirname, '../../storage/pdfs');
    if (fs.existsSync(pdfDir)) {
      const files = fs.readdirSync(pdfDir);
      let count = 0;
      for (const f of files) {
        if (f.endsWith('.pdf')) {
          fs.unlinkSync(path.join(pdfDir, f));
          count++;
        }
      }
      console.log(`Deleted ${count} old PDF files from storage/pdfs.`);
    }
  } catch (err) {
    console.error('PDF cleanup error:', err.message);
  }

  console.log('\n--- Cleanup Complete! Database and local cache are 100% fresh and clean ---');
}

cleanAll();
