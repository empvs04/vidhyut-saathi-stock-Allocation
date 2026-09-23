import { DataStore } from '../services/dataStore.js';
import { verifyBarcodeScan } from '../services/scanValidator.js';

export async function getRecords(req, res) {
  try {
    const { batchId, serialNumber, status, page = 1, limit = 50 } = req.query;

    const filter = {};
    if (batchId) filter.batchId = batchId;
    if (status && status !== 'all') filter.status = status;

    const { records, total } = await DataStore.findRecords(filter, {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      serialNumber,
    });

    return res.status(200).json({
      success: true,
      records,
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

export async function verifyScan(req, res) {
  try {
    const { scannedText, imageBase64 } = req.body;

    let decodedValue = scannedText;
    let format = 'MANUAL_ENTRY';

    if (imageBase64) {
      const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');
      const scanResult = await verifyBarcodeScan(buffer);

      if (!scanResult.scannable) {
        return res.status(400).json({
          success: false,
          scannable: false,
          message: 'Unable to detect a valid barcode in the supplied image.',
          error: scanResult.error,
        });
      }

      decodedValue = scanResult.text;
      format = scanResult.format;
    }

    if (!decodedValue) {
      return res.status(400).json({
        success: false,
        message: 'No barcode text or image was supplied for verification.',
      });
    }

    const record = await DataStore.findRecordBySerial(decodedValue);

    return res.status(200).json({
      success: true,
      scannable: true,
      decodedValue,
      format,
      foundInDatabase: !!record,
      record: record || null,
      message: record
        ? `Verified: Serial "${decodedValue}" is active in batch "${record.batchId?.batchName || record.batchId}".`
        : `Decoded "${decodedValue}", but not registered in system records.`,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
}

/**
 * Stream a single 2" x 1.5" physical barcode label PDF as a download
 */
export async function downloadSingleLabelPdf(req, res) {
  try {
    const { serial = '0020231501', series = 'VS' } = req.query;
    const cleanSerial = String(serial).trim();
    const cleanSeries = String(series).trim().toUpperCase();

    const { renderSingleLabelPDF } = await import('../services/pdfRenderService.js');
    const doc = await renderSingleLabelPDF(cleanSerial, cleanSeries);

    const filename = `VidhyutSaathi_${cleanSeries}_${cleanSerial}_2x1.5.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    doc.pipe(res);
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
}

/**
 * Stream a single 2" x 1.5" physical barcode label PDF inline for in-browser preview / printing
 */
export async function previewSingleLabelPdf(req, res) {
  try {
    const { serial = '0020231501', series = 'VS' } = req.query;
    const cleanSerial = String(serial).trim();
    const cleanSeries = String(series).trim().toUpperCase();

    const { renderSingleLabelPDF } = await import('../services/pdfRenderService.js');
    const doc = await renderSingleLabelPDF(cleanSerial, cleanSeries);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline');

    doc.pipe(res);
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
}

/**
 * Register a single label record into the database
 */
export async function registerSingleLabel(req, res) {
  try {
    const { serialNumber, cardSeries = 'VS', labelDescription = 'Single Label' } = req.body;

    if (!serialNumber) {
      return res.status(400).json({ success: false, message: 'Serial number is required.' });
    }

    const cleanSerial = String(serialNumber).trim();

    // Check collision
    const existing = await DataStore.findRecordBySerial(cleanSerial);
    if (existing) {
      return res.status(409).json({
        success: false,
        conflict: true,
        message: `Serial number "${cleanSerial}" is already registered in the system.`,
      });
    }

    // Insert record
    await DataStore.insertRecords([
      {
        batchId: null,
        serialNumber: cleanSerial,
        barcodeValue: cleanSerial,
        cardSeries,
        status: 'active',
        isScanned: false,
        scanCount: 0,
      },
    ]);

    return res.status(201).json({
      success: true,
      message: `Single label "${cleanSerial}" registered successfully in database.`,
      serialNumber: cleanSerial,
      cardSeries,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
}
