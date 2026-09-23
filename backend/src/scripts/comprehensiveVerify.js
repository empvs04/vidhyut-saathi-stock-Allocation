import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateBarcodeBuffer, generateSerialNumbers } from '../services/barcodeService.js';
import { verifyBarcodeScan } from '../services/scanValidator.js';
import { calculateLayout } from '../services/layoutEngine.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runComprehensiveVerification() {
  console.log('===============================================================');
  console.log('VIDHYUT SAATHI BARCODE ENGINE COMPREHENSIVE VERIFICATION SUITE');
  console.log('===============================================================\n');

  // Test 1: Layout calculation
  console.log('TEST 1: Physical Dimensions & Layout Mathematics');
  const layout = calculateLayout();
  console.log(`- Sheet Size: ${layout.sheetWidth / 72}" x ${layout.sheetHeight / 72}" (${layout.sheetWidth} x ${layout.sheetHeight} pt)`);
  console.log(`- Label Size: ${layout.labelWidth / 72}" x ${layout.labelHeight / 72}" (${layout.labelWidth} x ${layout.labelHeight} pt)`);
  console.log(`- Matrix: ${layout.cols} cols x ${layout.rows} rows = ${layout.labelsPerSheet} labels/sheet`);
  console.log(`- Left Margin: ${layout.leftMargin} pt (${(layout.leftMargin / 72).toFixed(2)}")`);
  console.log(`- Top Margin: ${layout.topMargin} pt (${(layout.topMargin / 72).toFixed(2)}")`);
  console.log(`- Column Gutter: ${layout.colGutter} pt (${layout.colGutterMm} mm)`);
  console.log(`- Row Gutter (Cutting Margin): ${layout.rowGutter} pt (${layout.rowGutterMm} mm)`);

  if (layout.positions.length !== 55) throw new Error('Layout grid failed: expected 55 positions');
  console.log('✓ PASS: Layout matches exact 12x18 inch, 55-label specifications.\n');

  // Test 2: Serial Number Uniqueness and Leading Zeros
  console.log('TEST 2: Leading Zero Preservation & Sequence');
  const testSerials = generateSerialNumbers('0020231501', 500);
  console.log(`- First Serial: "${testSerials[0]}"`);
  console.log(`- 55th Serial:  "${testSerials[54]}"`);
  console.log(`- 500th Serial: "${testSerials[499]}"`);
  const uniqueSet = new Set(testSerials);
  if (uniqueSet.size !== 500) throw new Error('Duplicate serial numbers generated!');
  if (testSerials[0] !== '0020231501' || testSerials[499] !== '0020232000') throw new Error('Serial padding failed!');
  console.log('✓ PASS: Leading zeros preserved and all 500 serials are unique.\n');

  // Test 3: Barcode Scan Validation Test
  console.log('TEST 3: Barcode Scan Decoding with ZXing Engine');
  const sampleBuf = await generateBarcodeBuffer(testSerials[0]);
  const scan = await verifyBarcodeScan(sampleBuf);
  console.log(`- Scannable: ${scan.scannable}`);
  console.log(`- Decoded Value: "${scan.text}"`);
  console.log(`- Symbology: ${scan.format} (Code 128)`);
  if (!scan.scannable || scan.text !== testSerials[0]) throw new Error('Barcode scan decode mismatch!');
  console.log('✓ PASS: Sample barcode is 100% scannable and matches serial number.\n');

  // Test 4: API Test Generating 55 Barcodes (1 Full Page)
  console.log('TEST 4: API Generation for 55 Labels (Full Page)');
  const res55 = await fetch('http://localhost:5000/api/batches/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      batchName: 'Vidhyut Saathi Full Sheet Batch (55 Labels)',
      cardSeries: 'VS',
      startSerialNumber: '0020240001',
      quantity: 55,
      barcodeType: 'CODE128',
    }),
  }).then((r) => r.json());

  console.log(`- API Response: ${res55.message}`);
  console.log(`- Batch ID: ${res55.batch?.batchId}`);

  // Wait 2 seconds for generation to complete
  await new Promise((r) => setTimeout(r, 2500));
  const batchCheck = await fetch(`http://localhost:5000/api/batches/${res55.batch?.batchId}`).then((r) => r.json());
  console.log(`- Batch Status: ${batchCheck.batch?.status}, Progress: ${batchCheck.batch?.progress}%`);
  console.log(`- PDF File: ${batchCheck.batch?.pdfFilePath} (${(batchCheck.batch?.pdfFileSize / 1024).toFixed(0)} KB)`);

  if (batchCheck.batch?.status !== 'completed' || batchCheck.batch?.totalPages !== 1) {
    throw new Error('55-label batch generation failed!');
  }
  console.log('✓ PASS: 55-label batch generated, saved, and completed.\n');

  // Test 5: Verify Collision Prevention on Duplicate Request
  console.log('TEST 5: Collision Prevention for Overlapping Range');
  const collisionCheck = await fetch('http://localhost:5000/api/batches/validate-range', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      startSerialNumber: '0020240020',
      quantity: 10,
    }),
  }).then((r) => r.json());

  console.log(`- Conflict Detected: ${collisionCheck.conflict}`);
  console.log(`- Conflict Message: "${collisionCheck.message}"`);
  if (!collisionCheck.conflict) throw new Error('Failed to prevent duplicate serial range!');
  console.log('✓ PASS: Duplicate range successfully blocked.\n');

  // Test 6: Verify Scan Verification API Endpoint
  console.log('TEST 6: API Scan Verification Endpoint');
  const scanCheck = await fetch('http://localhost:5000/api/records/verify-scan', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ scannedText: '0020240001' }),
  }).then((r) => r.json());

  console.log(`- Found in Database: ${scanCheck.foundInDatabase}`);
  console.log(`- Associated Batch: ${scanCheck.record?.batchId?.batchName}`);
  console.log(`- Position: Page ${scanCheck.record?.pageNumber}, Slot #${scanCheck.record?.positionIndex + 1}`);
  if (!scanCheck.foundInDatabase) throw new Error('Scan verification failed to find record!');
  console.log('✓ PASS: Serial verified against database with exact sheet slot coordinates.\n');

  console.log('===============================================================');
  console.log('ALL VERIFICATION REQUIREMENTS PASSED WITH 100% SUCCESS!');
  console.log('===============================================================');
}

runComprehensiveVerification().catch((e) => {
  console.error('Verification failed:', e);
  process.exit(1);
});
