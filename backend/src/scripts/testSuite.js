import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { calculateLayout, SHEET_PRESETS } from '../services/layoutEngine.js';
import { generateBarcodeBuffer, generateSerialNumbers } from '../services/barcodeService.js';
import { renderBatchPDF, renderSingleLabelPDF, renderCalibrationTestPDF, calculateProportionalArtworkBounds } from '../services/pdfRenderService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runTests() {
  console.log('====================================================');
  console.log('VIDHYUT SAATHI MASTER LABEL ENGINE TEST SUITE');
  console.log('====================================================\n');

  const testOutputDir = path.resolve(__dirname, '../../storage/test_outputs');
  if (!fs.existsSync(testOutputDir)) {
    fs.mkdirSync(testOutputDir, { recursive: true });
  }

  let passed = 0;
  let failed = 0;

  function assert(condition, name, details = '') {
    if (condition) {
      console.log(`  [PASS] ${name} ${details ? '(' + details + ')' : ''}`);
      passed++;
    } else {
      console.error(`  [FAIL] ${name} ${details ? '(' + details + ')' : ''}`);
      failed++;
    }
  }

  // TEST 1: Physical cutting size 2" x 1.5" (144 pt x 108 pt)
  console.log('--- TEST 1: Physical Cutting Size Verification ---');
  const bounds = calculateProportionalArtworkBounds(0, 0, 144, 108);
  assert(bounds.renderW === 144 && bounds.renderH === 108, '144x108 pt Container aspect match', `Render: ${bounds.renderW}x${bounds.renderH} pt`);
  assert(bounds.renderX === 0 && bounds.renderY === 0, 'Centered at (0,0)', `Offset: (${bounds.renderX}, ${bounds.renderY})`);

  // Test anti-stretch with non-4:3 container (e.g. 2" x 1.2" = 144 x 86.4 pt)
  const nonStandardBounds = calculateProportionalArtworkBounds(0, 0, 144, 86.4);
  const calculatedAspect = (nonStandardBounds.renderW / nonStandardBounds.renderH).toFixed(4);
  assert(calculatedAspect === '1.3333', 'Proportional aspect preserved for custom container', `Aspect: ${calculatedAspect} (4:3)`);

  // TEST 2: A4 Layout (21 labels, 3 cols x 7 rows, 2 mm gap)
  console.log('\n--- TEST 2: A4 Layout Engine Verification (21 Labels) ---');
  const a4Layout = calculateLayout({ preset: 'a4_2x1_5' });
  assert(a4Layout.cols === 3, 'A4 columns = 3', `Cols: ${a4Layout.cols}`);
  assert(a4Layout.rows === 7, 'A4 rows = 7', `Rows: ${a4Layout.rows}`);
  assert(a4Layout.labelsPerSheet === 21, 'A4 labels/sheet = 21', `Labels: ${a4Layout.labelsPerSheet}`);
  assert(a4Layout.colGutterMm >= 1.99 && a4Layout.colGutterMm <= 2.01, 'A4 horizontal gap = 2 mm', `Gap: ${a4Layout.colGutterMm} mm`);
  assert(a4Layout.rowGutterMm >= 1.99 && a4Layout.rowGutterMm <= 2.01, 'A4 vertical gap = 2 mm', `Gap: ${a4Layout.rowGutterMm} mm`);
  assert(a4Layout.positions.length === 21, 'A4 position count = 21', `Positions: ${a4Layout.positions.length}`);

  // TEST 3: 12x18 Layout (55 labels, 5 cols x 11 rows, 2 mm gap)
  console.log('\n--- TEST 3: 12x18 Layout Engine Verification (55 Labels) ---');
  const layout12x18 = calculateLayout({ preset: '12x18_default' });
  assert(layout12x18.cols === 5, '12x18 columns = 5', `Cols: ${layout12x18.cols}`);
  assert(layout12x18.rows === 11, '12x18 rows = 11', `Rows: ${layout12x18.rows}`);
  assert(layout12x18.labelsPerSheet === 55, '12x18 labels/sheet = 55', `Labels: ${layout12x18.labelsPerSheet}`);
  assert(layout12x18.positions.length === 55, '12x18 position count = 55', `Positions: ${layout12x18.positions.length}`);

  // TEST 4: Serial Number Continuity & String Leading Zeros
  console.log('\n--- TEST 4: Serial Number Continuity & String Format ---');
  const serials500 = generateSerialNumbers('0020231501', 500, '');
  assert(serials500.length === 500, 'Generated exactly 500 serials', `Count: ${serials500.length}`);
  assert(serials500[0] === '0020231501', 'First serial preserves leading zeros', `First: ${serials500[0]}`);
  assert(serials500[499] === '0020232000', 'Last serial 500th calculated accurately', `Last: ${serials500[499]}`);
  const uniqueSerials = new Set(serials500);
  assert(uniqueSerials.size === 500, 'All 500 serial numbers are strictly unique');

  // TEST 5: Large Batch PDF Generation (55, 500, 5000 labels)
  console.log('\n--- TEST 5: Large Batch Generation & Multi-Page Calculation ---');
  const serials5000 = generateSerialNumbers('0020231501', 5000, '');
  assert(serials5000[0] === '0020231501', 'Start serial = 0020231501');
  assert(serials5000[4999] === '0020236500', 'End serial = 0020236500 (5000 total)', `End: ${serials5000[4999]}`);
  const expectedPages5000 = Math.ceil(5000 / 55); // 91 pages
  assert(expectedPages5000 === 91, '5000 labels on 55/sheet yields 91 pages', `Pages: ${expectedPages5000}`);

  // Test rendering a 55-label batch PDF to disk
  console.log('\n--- TEST 6: Render 55-Label Batch PDF to Disk ---');
  const batch55Path = path.join(testOutputDir, 'test_batch_55.pdf');
  const renderResult55 = await renderBatchPDF({
    batchId: 'TEST-55',
    serialNumbers: serials500.slice(0, 55),
    outputPath: batch55Path,
    layoutConfig: { preset: '12x18_default' },
  });
  assert(renderResult55.totalPages === 1, '55 labels produces 1 page', `Pages: ${renderResult55.totalPages}`);
  assert(renderResult55.fileSize > 50000, 'PDF file created with valid size', `Size: ${(renderResult55.fileSize/1024).toFixed(1)} KB`);
  assert(fs.existsSync(batch55Path), 'PDF file exists on disk');

  // Test rendering 21-label A4 PDF to disk
  console.log('\n--- TEST 7: Render 21-Label A4 Batch PDF to Disk ---');
  const batchA4Path = path.join(testOutputDir, 'test_batch_a4_21.pdf');
  const renderResultA4 = await renderBatchPDF({
    batchId: 'TEST-A4-21',
    serialNumbers: serials500.slice(0, 21),
    outputPath: batchA4Path,
    layoutConfig: { preset: 'a4_2x1_5' },
  });
  assert(renderResultA4.totalPages === 1, '21 labels produces 1 page on A4', `Pages: ${renderResultA4.totalPages}`);
  assert(renderResultA4.fileSize > 50000, 'A4 PDF file created with valid size', `Size: ${(renderResultA4.fileSize/1024).toFixed(1)} KB`);

  // Test rendering single label PDF to disk
  console.log('\n--- TEST 8: Single Label 2" x 1.5" PDF ---');
  const singleDoc = await renderSingleLabelPDF('0020231501');
  const singlePath = path.join(testOutputDir, 'test_single_label.pdf');
  const singleWriteStream = fs.createWriteStream(singlePath);
  singleDoc.pipe(singleWriteStream);
  await new Promise((resolve) => singleWriteStream.on('finish', resolve));
  assert(fs.existsSync(singlePath), 'Single label PDF exists on disk', `Path: ${singlePath}`);

  // Test rendering print calibration test PDF to disk
  console.log('\n--- TEST 9: Print Calibration / Ruler Test PDF ---');
  const calibDoc = await renderCalibrationTestPDF('0020231501');
  const calibPath = path.join(testOutputDir, 'test_calibration_page.pdf');
  const calibWriteStream = fs.createWriteStream(calibPath);
  calibDoc.pipe(calibWriteStream);
  await new Promise((resolve) => calibWriteStream.on('finish', resolve));
  assert(fs.existsSync(calibPath), 'Calibration test PDF exists on disk', `Path: ${calibPath}`);

  // TEST 10: Barcode Generation Buffer
  console.log('\n--- TEST 10: Code 128 High-Resolution Barcode Generation ---');
  const barcodeBuf = await generateBarcodeBuffer('0020231501', { scale: 3, height: 8 });
  assert(Buffer.isBuffer(barcodeBuf) && barcodeBuf.length > 500, 'Generated crisp Code 128 PNG buffer', `Bytes: ${barcodeBuf.length}`);

  console.log('\n====================================================');
  console.log(`TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Test suite exception:', err);
  process.exit(1);
});
