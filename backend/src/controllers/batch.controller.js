import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { DataStore } from '../services/dataStore.js';
import { generateSerialNumbers } from '../services/barcodeService.js';
import { renderBatchPDF } from '../services/pdfRenderService.js';
import { calculateLayout } from '../services/layoutEngine.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// In-memory progress tracking for real-time polling during generation
const activeJobs = new Map();

/**
 * Pre-flight validation of serial number range against existing records
 */
export async function validateRange(req, res) {
  try {
    const { startSerialNumber, quantity, cardSeries = 'VS' } = req.body;

    if (!startSerialNumber || !quantity || Number(quantity) < 1) {
      return res.status(400).json({
        success: false,
        message: 'Starting serial number and valid quantity (>0) are required.',
      });
    }

    const count = parseInt(quantity, 10);
    const serials = generateSerialNumbers(startSerialNumber, count, cardSeries);
    const endSerialNumber = serials[serials.length - 1];

    // Check collision with first and last serial
    const conflict = await DataStore.checkSerialConflict([serials[0], endSerialNumber]);
    if (conflict) {
      return res.status(409).json({
        success: false,
        conflict: true,
        message: `Serial range conflict: Serial number "${conflict.serialNumber}" already exists in the system.`,
      });
    }

    // Sample check intermediate serials
    const checkCount = Math.min(10, count);
    const samples = [];
    for (let i = 0; i < checkCount; i++) {
      const idx = Math.floor((i / checkCount) * count);
      samples.push(serials[idx]);
    }

    const sampleConflict = await DataStore.checkSerialConflict(samples);
    if (sampleConflict) {
      return res.status(409).json({
        success: false,
        conflict: true,
        message: `Serial range conflict: Serial number "${sampleConflict.serialNumber}" already exists.`,
      });
    }

    const layout = calculateLayout();
    const totalPages = Math.ceil(count / layout.labelsPerSheet);

    return res.status(200).json({
      success: true,
      valid: true,
      startSerialNumber: serials[0],
      endSerialNumber,
      quantity: count,
      totalPages,
      labelsPerSheet: layout.labelsPerSheet,
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
}

/**
 * Validate imported serial numbers (from Excel / CSV) against duplicates and DB collisions
 */
export async function validateImportedSerials(req, res) {
  try {
    const { serials, cardSeries = 'VS' } = req.body;

    if (!Array.isArray(serials) || serials.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No serial numbers found in import data.',
      });
    }

    const cleanSerials = serials.map((s) => String(s).trim()).filter(Boolean);
    const count = cleanSerials.length;

    if (count > 10000) {
      return res.status(400).json({
        success: false,
        message: 'Excel file contains too many labels. Maximum allowed is 10,000 per batch.',
      });
    }

    // Check internal duplicates in Excel
    const seen = new Set();
    const duplicates = [];
    for (const s of cleanSerials) {
      if (seen.has(s)) {
        duplicates.push(s);
      } else {
        seen.add(s);
      }
    }

    if (duplicates.length > 0) {
      return res.status(400).json({
        success: false,
        hasDuplicates: true,
        duplicates: duplicates.slice(0, 10),
        message: `Excel file contains ${duplicates.length} duplicate serial numbers (e.g. ${duplicates.slice(0, 3).join(', ')}). All serials must be unique.`,
      });
    }

    // Check DB conflict with existing registered serials
    const conflict = await DataStore.checkSerialConflict(cleanSerials);
    if (conflict) {
      return res.status(409).json({
        success: false,
        conflict: true,
        conflictingSerial: conflict.serialNumber,
        message: `Conflict detected: Serial number "${conflict.serialNumber}" is already registered in the database.`,
      });
    }

    const layout = calculateLayout();
    const totalPages = Math.ceil(count / layout.labelsPerSheet);

    return res.status(200).json({
      success: true,
      valid: true,
      count,
      startSerialNumber: cleanSerials[0],
      endSerialNumber: cleanSerials[count - 1],
      totalPages,
      labelsPerSheet: layout.labelsPerSheet,
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
}

/**
 * Generate a new barcode batch and PDF document (supports sequential or imported custom serials)
 */
export async function createBatch(req, res) {
  try {
    const {
      batchName,
      cardSeries = 'VS',
      startSerialNumber,
      quantity,
      customSerials,
      barcodeType = 'CODE128',
      templateId,
      layoutConfig,
    } = req.body;

    if (!batchName) {
      return res.status(400).json({
        success: false,
        message: 'Batch Name is required.',
      });
    }

    let serials = [];
    let count = 0;
    let startSerial = '';
    let endSerial = '';

    if (Array.isArray(customSerials) && customSerials.length > 0) {
      // Custom serials from Excel / CSV import
      serials = customSerials.map((s) => String(s).trim()).filter(Boolean);
      count = serials.length;

      if (count < 1 || count > 10000) {
        return res.status(400).json({
          success: false,
          message: 'Imported Excel file must contain between 1 and 10,000 serial numbers.',
        });
      }

      // Check duplicates in custom serials
      const uniqueSet = new Set(serials);
      if (uniqueSet.size !== serials.length) {
        return res.status(400).json({
          success: false,
          message: `The imported file contains ${serials.length - uniqueSet.size} duplicate serial numbers. Please ensure all serials are unique.`,
        });
      }

      startSerial = serials[0];
      endSerial = serials[count - 1];

      // Check conflict in database
      const collision = await DataStore.checkSerialConflict(serials);
      if (collision) {
        return res.status(409).json({
          success: false,
          message: `Serial number conflict: ${collision.serialNumber} is already registered.`,
        });
      }
    } else {
      // Standard sequential generation
      if (!startSerialNumber || !quantity) {
        return res.status(400).json({
          success: false,
          message: 'Starting Serial Number and Quantity are required for sequential batches.',
        });
      }

      count = parseInt(quantity, 10);
      if (count < 1 || count > 10000) {
        return res.status(400).json({
          success: false,
          message: 'Quantity must be between 1 and 10,000 labels per batch.',
        });
      }

      serials = generateSerialNumbers(startSerialNumber, count, cardSeries);
      startSerial = serials[0];
      endSerial = serials[serials.length - 1];

      // Check collision
      const collision = await DataStore.checkSerialConflict([startSerial, endSerial]);
      if (collision) {
        return res.status(409).json({
          success: false,
          message: `Serial number conflict: ${collision.serialNumber} is already registered.`,
        });
      }
    }

    const layout = calculateLayout(layoutConfig);
    const totalPages = Math.ceil(count / layout.labelsPerSheet);

    // Create unique batch ID
    const timestamp = Date.now().toString(36).toUpperCase();
    const batchId = `VS-${cardSeries}-${timestamp}`;

    const pdfFileName = `${batchId}.pdf`;
    const pdfFilePath = path.resolve(__dirname, '../../storage/pdfs', pdfFileName);

    // Create initial batch record
    const batch = await DataStore.createBatch({
      batchId,
      batchName,
      cardSeries,
      startSerialNumber: startSerial,
      endSerialNumber: endSerial,
      quantity: count,
      barcodeType,
      templateId: templateId || null,
      sheetWidth: layout.sheetWidth,
      sheetHeight: layout.sheetHeight,
      labelWidth: layout.labelWidth,
      labelHeight: layout.labelHeight,
      labelsPerSheet: layout.labelsPerSheet,
      totalPages,
      pdfFilePath: `storage/pdfs/${pdfFileName}`,
      status: 'processing',
      progress: 0,
    });

    // Register active job for progress updates
    activeJobs.set(batchId, {
      status: 'processing',
      processed: 0,
      total: count,
      percentage: 0,
      currentPage: 0,
      totalPages,
    });

    // Respond immediately with batch info
    res.status(202).json({
      success: true,
      message: 'Batch generation started.',
      batch: {
        _id: batch._id,
        batchId: batch.batchId,
        batchName: batch.batchName,
        cardSeries: batch.cardSeries,
        startSerialNumber: batch.startSerialNumber,
        endSerialNumber: batch.endSerialNumber,
        quantity: batch.quantity,
        totalPages: batch.totalPages,
        status: batch.status,
      },
    });

    // Execute PDF rendering asynchronously
    (async () => {
      try {
        const renderResult = await renderBatchPDF({
          batchId,
          serialNumbers: serials,
          outputPath: pdfFilePath,
          layoutConfig,
          onProgress: async (p) => {
            activeJobs.set(batchId, {
              status: 'processing',
              processed: p.processed,
              total: p.total,
              percentage: p.percentage,
              currentPage: p.currentPage,
              totalPages: p.totalPages,
            });
            if (p.processed % 110 === 0 || p.processed === count) {
              await DataStore.updateBatch(batchId, { progress: p.percentage });
            }
          },
        });

        // Insert BarcodeRecords
        const recordsToInsert = [];
        for (let i = 0; i < serials.length; i++) {
          const serial = serials[i];
          const pageNum = Math.floor(i / layout.labelsPerSheet) + 1;
          const posIdx = i % layout.labelsPerSheet;
          const pos = layout.positions[posIdx];

          recordsToInsert.push({
            batchId: batch._id,
            serialNumber: serial,
            barcodeValue: serial,
            cardSeries,
            numericIndex: i,
            pageNumber: pageNum,
            positionIndex: posIdx,
            column: pos ? pos.col : 0,
            row: pos ? pos.row : 0,
            status: 'generated',
            verifiedScannable: true,
          });
        }

        await DataStore.insertRecords(recordsToInsert);

        // Update batch status to completed
        await DataStore.updateBatch(batchId, {
          status: 'completed',
          progress: 100,
          pdfFileSize: renderResult.fileSize,
        });

        activeJobs.set(batchId, {
          status: 'completed',
          processed: count,
          total: count,
          percentage: 100,
          currentPage: totalPages,
          totalPages,
          fileSize: renderResult.fileSize,
        });
      } catch (err) {
        console.error(`Batch generation error for ${batchId}:`, err);
        await DataStore.updateBatch(batchId, {
          status: 'failed',
          errorMessage: err.message,
        });
        activeJobs.set(batchId, {
          status: 'failed',
          errorMessage: err.message,
        });
      }
    })();
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
}

/**
 * Get all batches with search and filters
 */
export async function getBatches(req, res) {
  try {
    const { search, status, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status && status !== 'all') filter.status = status;

    const { batches, total } = await DataStore.findBatches(filter, {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      search,
    });

    return res.status(200).json({
      success: true,
      batches,
      total,
      page: parseInt(page, 10),
      totalPages: Math.ceil(total / parseInt(limit, 10)),
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
}

/**
 * Get single batch details and active progress
 */
export async function getBatchById(req, res) {
  try {
    const { id } = req.params;
    const batch = await DataStore.findBatchById(id);

    if (!batch) {
      return res.status(404).json({ success: false, message: 'Batch not found' });
    }

    const activeJob = activeJobs.get(batch.batchId);
    const result = { ...batch };
    if (activeJob) {
      result.liveProgress = activeJob;
    }

    return res.status(200).json({
      success: true,
      batch: result,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
}

/**
 * Download generated PDF file
 */
export async function downloadPdf(req, res) {
  try {
    const { id } = req.params;
    const batch = await DataStore.findBatchById(id);

    if (!batch) {
      return res.status(404).json({ success: false, message: 'Batch not found' });
    }

    const fullPath = path.resolve(__dirname, '../../', batch.pdfFilePath);
    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({ success: false, message: 'PDF file not found on disk.' });
    }

    const filename = `${batch.batchName.replace(/[^a-zA-Z0-9_-]/g, '_')}_${batch.batchId}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return fs.createReadStream(fullPath).pipe(res);
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
}

/**
 * Stream PDF inline for in-browser PDF preview
 */
export async function previewPdf(req, res) {
  try {
    const { id } = req.params;
    const batch = await DataStore.findBatchById(id);

    if (!batch) {
      return res.status(404).json({ success: false, message: 'Batch not found' });
    }

    const fullPath = path.resolve(__dirname, '../../', batch.pdfFilePath);
    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({ success: false, message: 'PDF file not found on disk.' });
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline');
    return fs.createReadStream(fullPath).pipe(res);
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
}

/**
 * Delete batch, physical PDF file, and barcode records to free up disk storage and memory
 */
export async function deleteBatch(req, res) {
  try {
    const { id } = req.params;
    const deleted = await DataStore.deleteBatch(id);

    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Batch not found.' });
    }

    return res.status(200).json({
      success: true,
      message: `Batch "${deleted.batchName}" (${deleted.batchId}) and its PDF were successfully deleted. Memory and disk space cleared.`,
      batchId: deleted.batchId,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || 'Failed to delete batch.',
    });
  }
}
