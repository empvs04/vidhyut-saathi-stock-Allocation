import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { DataStore } from '../services/dataStore.js';
import {
  RANGE_SHEET_PRESETS,
  calculateRangeAutoLayout,
} from '../services/rangeLayoutEngine.js';
import {
  renderRangeBatchPDF,
  renderSingleRangeLabelPDF,
} from '../services/rangePdfRenderService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Get sheet presets and configuration for 10-Serial Range Labels
 */
export function getRangeSheetPresets(req, res) {
  try {
    return res.status(200).json({
      success: true,
      presets: RANGE_SHEET_PRESETS,
      defaultPreset: '12x18_range_44',
      defaultConfig: {
        sheetSize: '12x18',
        sheetWidthInches: 12.0,
        sheetHeightInches: 18.0,
        labelWidthInches: 2.25,
        labelHeightInches: 1.50,
        aspectRatio: '3:2',
        marginLeftInches: 0.4,
        marginRightInches: 0.4,
        marginTopInches: 0.3,
        marginBottomInches: 0.3,
        gapMm: 2.0,
        rangeSize: 10,
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * Automatically calculate grid layout for custom sheet / label sizes
 */
export function calculateRangeLayout(req, res) {
  try {
    const layout = calculateRangeAutoLayout(req.body);
    return res.status(200).json({
      success: true,
      layout,
    });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
}

/**
 * Get next sequential starting serial number for range labels
 */
export async function getNextRangeSerial(req, res) {
  try {
    const { cardSeries = 'VS' } = req.query;
    const nextSerialData = await DataStore.getNextSerialNumber(cardSeries);
    return res.status(200).json({
      success: true,
      cardSeries: nextSerialData.cardSeries,
      nextSerialNumber: nextSerialData.nextSerialNumber,
      totalBatches: nextSerialData.totalBatches,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * Create a new 10-Serial Range Label Batch & PDF
 */
export async function createRangeBatch(req, res) {
  try {
    const {
      batchName,
      cardSeries = 'VS',
      startSerialNumber = '0020231501',
      physicalLabelQuantity = 44, // Number of physical labels (each represents 10 serials)
      presetId = '12x18_range_44',
      layoutConfig = {},
    } = req.body;

    if (!batchName) {
      return res.status(400).json({
        success: false,
        message: 'Batch Name is required.',
      });
    }

    const qty = parseInt(physicalLabelQuantity, 10);
    if (isNaN(qty) || qty < 1 || qty > 10000) {
      return res.status(400).json({
        success: false,
        message: 'Physical label quantity must be between 1 and 10,000.',
      });
    }

    // Clean starting serial number
    const cleanStart = String(startSerialNumber).trim();
    const match = cleanStart.match(/^(0*)(\d+)$/);
    if (!match) {
      return res.status(400).json({
        success: false,
        message: 'Starting serial number must be numeric (e.g. 0020231501).',
      });
    }

    const totalLen = cleanStart.length;
    const startNumBig = BigInt(match[2]);
    const totalSerials = qty * 10;
    const endNumBig = startNumBig + BigInt(totalSerials - 1);
    const endSerialNumber = String(endNumBig).padStart(totalLen, '0');

    // Generate unique batch ID
    const batchId = `RANGE-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    // Layout configuration
    const mergedLayoutConfig = {
      ...(RANGE_SHEET_PRESETS[presetId] || RANGE_SHEET_PRESETS['12x18_range_44']),
      ...layoutConfig,
    };
    const layout = calculateRangeAutoLayout(mergedLayoutConfig);

    const pdfDir = path.resolve(__dirname, '../../storage/pdfs');
    if (!fs.existsSync(pdfDir)) {
      fs.mkdirSync(pdfDir, { recursive: true });
    }
    const pdfFileName = `Vidhyut_Saathi_RangeBatch_${batchId}.pdf`;
    const pdfFilePath = path.join(pdfDir, pdfFileName);
    const relativePdfPath = `storage/pdfs/${pdfFileName}`;

    // Render true-size PDF
    const renderResult = await renderRangeBatchPDF({
      batchId,
      batchName,
      startSerialNumber: cleanStart,
      totalPhysicalLabels: qty,
      outputPath: pdfFilePath,
      layoutConfig: mergedLayoutConfig,
    });

    // Save batch record to DataStore
    const batchRecord = {
      batchId,
      batchName,
      cardSeries,
      startSerialNumber: cleanStart,
      endSerialNumber,
      quantity: qty,
      totalPhysicalLabels: qty,
      totalSerials,
      rangeSize: 10,
      batchType: 'range',
      sheetWidth: layout.sheetWidthPt,
      sheetHeight: layout.sheetHeightPt,
      labelWidth: layout.labelWidthPt,
      labelHeight: layout.labelHeightPt,
      columns: layout.columns,
      rows: layout.rows,
      labelsPerSheet: layout.labelsPerSheet,
      totalPages: renderResult.totalPages,
      pdfFilePath: relativePdfPath,
      pdfFileSize: renderResult.fileSize,
      status: 'completed',
      createdAt: new Date().toISOString(),
    };

    const savedBatch = await DataStore.createBatch(batchRecord);

    return res.status(201).json({
      success: true,
      message: `Successfully created Range Batch "${batchName}" with ${qty} physical labels (${totalSerials} serials).`,
      batch: savedBatch,
      pdfDownloadUrl: `/api/range-batches/${batchId}/download`,
      pdfPreviewUrl: `/api/range-batches/${batchId}/preview`,
      totalPages: renderResult.totalPages,
      totalPhysicalLabels: qty,
      totalSerials,
      startSerialNumber: cleanStart,
      endSerialNumber,
    });
  } catch (err) {
    console.error('Error creating range batch:', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'Failed to create range batch.',
    });
  }
}

/**
 * Get all range batches
 */
export async function getRangeBatches(req, res) {
  try {
    const result = await DataStore.findBatches({});
    const allBatches = result.batches || [];
    const rangeBatches = allBatches.filter(b => b.batchType === 'range' || (b.batchId && b.batchId.startsWith('RANGE-')));
    return res.status(200).json({
      success: true,
      batches: rangeBatches,
      total: rangeBatches.length,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * Get range batch by ID
 */
export async function getRangeBatchById(req, res) {
  try {
    const { id } = req.params;
    const batch = await DataStore.findBatchById(id);
    if (!batch) {
      return res.status(404).json({ success: false, message: 'Range batch not found.' });
    }
    return res.status(200).json({ success: true, batch });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * Download range batch PDF
 */
export async function downloadRangePdf(req, res) {
  try {
    const { id } = req.params;
    const batch = await DataStore.findBatchById(id);
    if (!batch) {
      return res.status(404).json({ success: false, message: 'Batch not found.' });
    }

    const fullPath = path.resolve(__dirname, '../../', batch.pdfFilePath);
    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({ success: false, message: 'PDF file not found on disk.' });
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${path.basename(fullPath)}"`);
    return fs.createReadStream(fullPath).pipe(res);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * Preview range batch PDF inline
 */
export async function previewRangePdf(req, res) {
  try {
    const { id } = req.params;
    const batch = await DataStore.findBatchById(id);
    if (!batch) {
      return res.status(404).json({ success: false, message: 'Batch not found.' });
    }

    const fullPath = path.resolve(__dirname, '../../', batch.pdfFilePath);
    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({ success: false, message: 'PDF file not found on disk.' });
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline');
    return fs.createReadStream(fullPath).pipe(res);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * Generate a single 3:2 Range Label PDF for instant test print
 */
export async function getSingleRangeLabelPdf(req, res) {
  try {
    const startSerial = req.query.start || '0020231501';
    const endSerial = req.query.end || '0020231510';

    const tempPdf = path.resolve(__dirname, '../../storage/test_outputs', `single_range_${startSerial}.pdf`);
    await renderSingleRangeLabelPDF({
      startSerialNumber: startSerial,
      endSerialNumber: endSerial,
      outputPath: tempPdf,
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="range_label_${startSerial}.pdf"`);
    return fs.createReadStream(tempPdf).pipe(res);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}
