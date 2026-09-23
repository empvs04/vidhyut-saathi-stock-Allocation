import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import { BarcodeBatch } from '../models/BarcodeBatch.js';
import { BarcodeRecord } from '../models/BarcodeRecord.js';
import { LabelTemplate } from '../models/LabelTemplate.js';
import { getIsConnected } from '../config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const STORE_PATH = path.resolve(__dirname, '../../storage/db_store.json');

// Initialize local JSON store structure
function getInitialStore() {
  return {
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
}

function readStore() {
  try {
    if (!fs.existsSync(STORE_PATH)) {
      const init = getInitialStore();
      fs.mkdirSync(path.dirname(STORE_PATH), { recursive: true });
      fs.writeFileSync(STORE_PATH, JSON.stringify(init, null, 2), 'utf-8');
      return init;
    }
    const raw = fs.readFileSync(STORE_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading local db_store:', err);
    return getInitialStore();
  }
}

function writeStore(data) {
  try {
    fs.mkdirSync(path.dirname(STORE_PATH), { recursive: true });
    const tempPath = `${STORE_PATH}.tmp`;
    fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tempPath, STORE_PATH);
  } catch (err) {
    console.error('Error writing local db_store:', err);
  }
}

export const DataStore = {
  isMongo() {
    return getIsConnected();
  },

  async findBatches(filter = {}, { page = 1, limit = 20, search } = {}) {
    if (this.isMongo()) {
      try {
        const query = { ...filter };
        if (search) {
          query.$or = [
            { batchName: { $regex: search, $options: 'i' } },
            { batchId: { $regex: search, $options: 'i' } },
            { cardSeries: { $regex: search, $options: 'i' } },
            { startSerialNumber: { $regex: search, $options: 'i' } },
            { endSerialNumber: { $regex: search, $options: 'i' } },
          ];
        }
        const skip = (page - 1) * limit;
        const [batches, total] = await Promise.all([
          BarcodeBatch.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
          BarcodeBatch.countDocuments(query),
        ]);
        return { batches, total };
      } catch (e) {
        console.warn('Mongo findBatches failed, using local store:', e.message);
      }
    }

    const store = readStore();
    let list = [...store.batches];
    if (filter.status && filter.status !== 'all') {
      list = list.filter((b) => b.status === filter.status);
    }
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (b) =>
          b.batchName.toLowerCase().includes(q) ||
          b.batchId.toLowerCase().includes(q) ||
          b.startSerialNumber.toLowerCase().includes(q) ||
          b.endSerialNumber.toLowerCase().includes(q)
      );
    }
    list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const total = list.length;
    const skip = (page - 1) * limit;
    return { batches: list.slice(skip, skip + limit), total };
  },

  async findBatchById(id) {
    if (this.isMongo()) {
      try {
        const batch = id.startsWith('VS-')
          ? await BarcodeBatch.findOne({ batchId: id }).lean()
          : await BarcodeBatch.findById(id).lean();
        if (batch) return batch;
      } catch (e) {}
    }
    const store = readStore();
    return store.batches.find((b) => b.batchId === id || b._id === id) || null;
  },

  async createBatch(batchData) {
    const _id = new mongoose.Types.ObjectId().toString();
    const now = new Date();
    const fullData = { _id, ...batchData, createdAt: now, updatedAt: now };

    // Write to local store
    const store = readStore();
    store.batches.unshift(fullData);
    writeStore(store);

    if (this.isMongo()) {
      try {
        const batch = new BarcodeBatch(fullData);
        await batch.save();
      } catch (e) {
        console.warn('Mongo createBatch failed:', e.message);
      }
    }
    return fullData;
  },

  async updateBatch(id, updates) {
    const store = readStore();
    const idx = store.batches.findIndex((b) => b.batchId === id || b._id === id);
    if (idx !== -1) {
      store.batches[idx] = { ...store.batches[idx], ...updates, updatedAt: new Date() };
      writeStore(store);
    }

    if (this.isMongo()) {
      try {
        if (id.startsWith('VS-')) {
          await BarcodeBatch.findOneAndUpdate({ batchId: id }, updates);
        } else {
          await BarcodeBatch.findByIdAndUpdate(id, updates);
        }
      } catch (e) {}
    }
    return idx !== -1 ? store.batches[idx] : null;
  },

  async deleteBatch(id) {
    const store = readStore();
    const batch = store.batches.find((b) => b.batchId === id || b._id === id);
    if (!batch) return null;

    // Delete PDF file from physical disk storage to free disk space
    if (batch.pdfFilePath) {
      try {
        const fullPath = path.resolve(__dirname, '../../', batch.pdfFilePath);
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
        }
      } catch (err) {
        console.warn('Error deleting PDF file:', err.message);
      }
    }

    // Remove batch from local storage
    store.batches = store.batches.filter((b) => b.batchId !== id && b._id !== id);

    // Remove associated records from local storage to free memory
    store.records = store.records.filter((r) => r.batchId !== batch._id && r.batchId !== batch.batchId);
    writeStore(store);

    // Remove from MongoDB
    if (this.isMongo()) {
      try {
        const isObjId = mongoose.Types.ObjectId.isValid(id);
        const batchQuery = isObjId ? { $or: [{ _id: id }, { batchId: id }] } : { batchId: id };
        await BarcodeBatch.deleteOne(batchQuery);

        const recConditions = [{ batchId: batch.batchId }];
        if (batch._id && mongoose.Types.ObjectId.isValid(batch._id)) {
          recConditions.push({ batchId: batch._id });
        }
        await BarcodeRecord.deleteMany({ $or: recConditions });
      } catch (e) {
        console.warn('Mongo deleteBatch error:', e.message);
      }
    }

    return batch;
  },

  async findRecordBySerial(serial) {
    if (this.isMongo()) {
      try {
        const record = await BarcodeRecord.findOne({ serialNumber: serial })
          .populate('batchId', 'batchName batchId createdAt totalPages')
          .lean();
        if (record) return record;
      } catch (e) {}
    }
    const store = readStore();
    const rec = store.records.find((r) => r.serialNumber === serial);
    if (!rec) return null;
    const batch = store.batches.find((b) => b._id === rec.batchId || b.batchId === rec.batchId);
    return { ...rec, batchId: batch || rec.batchId };
  },

  async checkSerialConflict(serialsArray) {
    if (this.isMongo()) {
      try {
        const conflict = await BarcodeRecord.findOne({
          serialNumber: { $in: serialsArray },
        }).lean();
        if (conflict) return conflict;
      } catch (e) {}
    }
    const store = readStore();
    const set = new Set(serialsArray);
    return store.records.find((r) => set.has(r.serialNumber)) || null;
  },

  async getNextSerialNumber(cardSeries = 'VS') {
    const MIN_START_SERIAL_STR = '0020231501';
    const MIN_NUMERIC = 20231501n;
    const DIGITS = 10;

    let maxNumeric = null;
    let lastEndSerial = null;

    if (this.isMongo()) {
      try {
        const query = cardSeries ? { cardSeries } : {};
        const [recentBatches, recentRecords, highestBatch, highestRecord] = await Promise.all([
          BarcodeBatch.find(query).sort({ createdAt: -1 }).limit(100).lean(),
          BarcodeRecord.find(query).sort({ createdAt: -1 }).limit(200).lean(),
          BarcodeBatch.findOne(query).sort({ endSerialNumber: -1 }).lean(),
          BarcodeRecord.findOne(query).sort({ serialNumber: -1 }).lean(),
        ]);

        const candidates = [];
        if (highestBatch?.endSerialNumber) candidates.push(highestBatch.endSerialNumber);
        if (highestBatch?.startSerialNumber) candidates.push(highestBatch.startSerialNumber);
        if (highestRecord?.serialNumber) candidates.push(highestRecord.serialNumber);
        
        for (const b of recentBatches || []) {
          if (b.endSerialNumber) candidates.push(b.endSerialNumber);
          if (b.startSerialNumber) candidates.push(b.startSerialNumber);
        }
        for (const r of recentRecords || []) {
          if (r.serialNumber) candidates.push(r.serialNumber);
        }

        for (const cand of candidates) {
          const m = String(cand).trim().match(/\d+$/);
          if (m) {
            const val = BigInt(m[0]);
            if (maxNumeric === null || val > maxNumeric) {
              maxNumeric = val;
              lastEndSerial = cand;
            }
          }
        }
      } catch (e) {
        console.warn('Mongo getNextSerialNumber fallback:', e.message);
      }
    }

    // Also scan local store
    const store = readStore();
    for (const b of store.batches || []) {
      if (!cardSeries || b.cardSeries === cardSeries) {
        const target = b.endSerialNumber || b.startSerialNumber;
        if (target) {
          const m = String(target).trim().match(/\d+$/);
          if (m) {
            const val = BigInt(m[0]);
            if (maxNumeric === null || val > maxNumeric) {
              maxNumeric = val;
              lastEndSerial = target;
            }
          }
        }
      }
    }
    for (const r of store.records || []) {
      if (!cardSeries || r.cardSeries === cardSeries) {
        if (r.serialNumber) {
          const m = String(r.serialNumber).trim().match(/\d+$/);
          if (m) {
            const val = BigInt(m[0]);
            if (maxNumeric === null || val > maxNumeric) {
              maxNumeric = val;
              lastEndSerial = r.serialNumber;
            }
          }
        }
      }
    }

    if (maxNumeric === null || maxNumeric < MIN_NUMERIC) {
      return {
        nextSerialNumber: MIN_START_SERIAL_STR,
        minSerialNumber: MIN_START_SERIAL_STR,
        lastEndSerialNumber: null,
      };
    }

    const nextNumeric = maxNumeric + 1n;
    const nextSerialNumber = nextNumeric.toString().padStart(DIGITS, '0');

    return {
      nextSerialNumber,
      minSerialNumber: MIN_START_SERIAL_STR,
      lastEndSerialNumber: lastEndSerial,
    };
  },

  async insertRecords(recordsArray) {
    const now = new Date();
    const prepared = recordsArray.map((r) => ({
      _id: new mongoose.Types.ObjectId().toString(),
      ...r,
      createdAt: now,
    }));

    const store = readStore();
    store.records.push(...prepared);
    writeStore(store);

    if (this.isMongo()) {
      try {
        await BarcodeRecord.insertMany(prepared, { ordered: false });
      } catch (e) {
        console.warn('Mongo insertRecords notice:', e.message);
      }
    }
  },

  async findRecords(filter = {}, { page = 1, limit = 50, serialNumber } = {}) {
    if (this.isMongo()) {
      try {
        const query = { ...filter };
        if (serialNumber) {
          query.serialNumber = { $regex: serialNumber, $options: 'i' };
        }
        const skip = (page - 1) * limit;
        const [records, total] = await Promise.all([
          BarcodeRecord.find(query)
            .populate('batchId', 'batchName batchId createdAt')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
          BarcodeRecord.countDocuments(query),
        ]);
        return { records, total };
      } catch (e) {}
    }

    const store = readStore();
    let list = [...store.records];
    if (filter.batchId) {
      list = list.filter((r) => r.batchId === filter.batchId);
    }
    if (filter.status && filter.status !== 'all') {
      list = list.filter((r) => r.status === filter.status);
    }
    if (serialNumber) {
      const q = serialNumber.toLowerCase();
      list = list.filter((r) => r.serialNumber.toLowerCase().includes(q));
    }
    list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const total = list.length;
    const skip = (page - 1) * limit;

    // Attach batch reference
    const paged = list.slice(skip, skip + limit).map((r) => {
      const batch = store.batches.find((b) => b._id === r.batchId || b.batchId === r.batchId);
      return { ...r, batchId: batch || { batchName: 'Batch', batchId: r.batchId } };
    });

    return { records: paged, total };
  },

  async getTemplates() {
    if (this.isMongo()) {
      try {
        const templates = await LabelTemplate.find().lean();
        if (templates && templates.length > 0) return templates;
      } catch (e) {}
    }
    const store = readStore();
    return store.templates;
  },

  async updateTemplate(id, data) {
    const store = readStore();
    const idx = store.templates.findIndex((t) => t._id === id);
    if (idx !== -1) {
      store.templates[idx] = { ...store.templates[idx], ...data };
      writeStore(store);
      return store.templates[idx];
    }
    return null;
  },

  async getStats() {
    const store = readStore();
    const completedBatches = store.batches.filter((b) => b.status === 'completed');
    const totalLabels = completedBatches.reduce((acc, b) => acc + (b.quantity || 0), 0);
    const totalPages = completedBatches.reduce((acc, b) => acc + (b.totalPages || 0), 0);
    const totalSize = completedBatches.reduce((acc, b) => acc + (b.pdfFileSize || 0), 0);

    return {
      totalBatches: store.batches.length,
      totalLabelsGenerated: totalLabels,
      totalSheetsPages: totalPages,
      totalStorageBytes: totalSize,
      totalActiveRecords: store.records.length,
      activeTemplatesCount: store.templates.length,
      recentBatches: store.batches.slice(0, 5),
    };
  },
};
