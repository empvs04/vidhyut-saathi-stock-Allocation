import { calculateLayout } from '../services/layoutEngine.js';
import { generateBarcodeBuffer, generateSerialNumbers } from '../services/barcodeService.js';
import { verifyBarcodeScan } from '../services/scanValidator.js';
import { renderBatchPDF } from '../services/pdfRenderService.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runTests() {
  console.log('--- TEST 1: Layout Calculation Engine ---');
  const layout = calculateLayout();
  console.log(`Sheet Size: ${layout.sheetWidth} x ${layout.sheetHeight} pt (12" x 18")`);
  console.log(`Label Size: ${layout.labelWidth} x ${layout.labelHeight} pt (2" x 1.5")`);
  console.log(`Grid: ${layout.cols} cols x ${layout.rows} rows = ${layout.labelsPerSheet} labels/sheet`);
  console.log(`Margins: Left=${layout.leftMargin}pt, Top=${layout.topMargin}pt`);
  console.log(`Gutters: Column=${layout.colGutter}pt (${layout.colGutterMm}mm), Row=${layout.rowGutter}pt (${layout.rowGutterMm}mm)`);
  console.log(`Positions calculated: ${layout.positions.length}`);

  if (layout.positions.length !== 55) {
    throw new Error(`Expected 55 positions, got ${layout.positions.length}`);
  }
  console.log(' Layout calculation PASSED');

  console.log('\n--- TEST 2: Serial Numbers with Leading Zeros ---');
  const startSerial = '0020231501';
  const count = 55;
  const serials = generateSerialNumbers(startSerial, count);
  console.log(`First serial: ${serials[0]} (length: ${serials[0].length})`);
  console.log(`Last serial:  ${serials[count - 1]} (length: ${serials[count - 1].length})`);

  if (serials[0] !== '0020231501' || serials[count - 1] !== '0020231555') {
    throw new Error('Serial numbering or leading zeros failed!');
  }
  console.log(' Leading zero preservation PASSED');

  console.log('\n--- TEST 3: Barcode Generation & ZXing Scan Validation ---');
  const testBarcodeBuf = await generateBarcodeBuffer(serials[0]);
  console.log(`Barcode buffer generated: ${testBarcodeBuf.length} bytes`);
  const scanResult = await verifyBarcodeScan(testBarcodeBuf);
  console.log(`ZXing scan result: Scannable=${scanResult.scannable}, Decoded="${scanResult.text}", Format=${scanResult.format}`);

  if (!scanResult.scannable || scanResult.text !== serials[0]) {
    throw new Error(`Barcode scan mismatch! Expected "${serials[0]}", got "${scanResult.text}"`);
  }
  console.log(' Barcode generation and 100% scan decode PASSED');

  console.log('\n--- TEST 4: Render 55-Label (1 Full Sheet) PDF ---');
  const testPdfPath = path.resolve(__dirname, '../../storage/pdfs/TEST-BATCH-55.pdf');
  const renderResult = await renderBatchPDF({
    batchId: 'TEST-BATCH-55',
    serialNumbers: serials,
    outputPath: testPdfPath,
    onProgress: (p) => {
      console.log(`Progress: ${p.percentage}% (page ${p.currentPage}/${p.totalPages})`);
    },
  });

  console.log(`PDF created successfully: ${renderResult.outputPath}`);
  console.log(`Total Pages: ${renderResult.totalPages}, File Size: ${(renderResult.fileSize / 1024).toFixed(1)} KB`);

  if (!fs.existsSync(testPdfPath) || renderResult.totalPages !== 1) {
    throw new Error('PDF generation verification failed!');
  }
  console.log(' 55-label PDF sheet generation PASSED');
  console.log('\n ALL CORE SERVICE TESTS COMPLETED SUCCESSFULLY!');
}

runTests().catch((err) => {
  console.error('Test failed with error:', err);
  process.exit(1);
});
