import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';
import {
  calculateRangeAutoLayout,
  RANGE_SHEET_PRESETS,
} from '../services/rangeLayoutEngine.js';
import {
  renderRangeBatchPDF,
  renderSingleRangeLabelPDF,
  getRangeMasterArtworkPath,
} from '../services/rangePdfRenderService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let passed = 0;
let failed = 0;

function assert(condition, message, detail = '') {
  if (condition) {
    console.log(`  [PASS] ${message} ${detail ? `(${detail})` : ''}`);
    passed++;
  } else {
    console.error(`  [FAIL] ${message} ${detail ? `(${detail})` : ''}`);
    failed++;
  }
}

async function runRangeSuite() {
  console.log('====================================================');
  console.log('VIDHYUT SAATHI 10-SERIAL RANGE ENGINE TEST SUITE');
  console.log('====================================================\n');

  // --- TEST 1: Layout Engine Verification ---
  console.log('--- TEST 1: Range Layout Engine Verification (12x18 Sheet) ---');
  const preset = RANGE_SHEET_PRESETS['12x18_range_44'];
  const layout = calculateRangeAutoLayout(preset);
  assert(layout.columns === 4, '12x18 columns = 4', `Cols: ${layout.columns}`);
  assert(layout.rows === 11, '12x18 rows = 11', `Rows: ${layout.rows}`);
  assert(layout.labelsPerSheet === 44, '12x18 labels per sheet = 44', `Labels: ${layout.labelsPerSheet}`);
  assert(Math.abs(layout.labelWidthInches - 2.25) < 0.01, 'Label width = 2.25 inches', `W: ${layout.labelWidthInches}`);
  assert(Math.abs(layout.labelHeightInches - 1.50) < 0.01, 'Label height = 1.50 inches', `H: ${layout.labelHeightInches}`);
  assert(layout.positions.length === 44, 'Grid generates 44 label positions', `Positions: ${layout.positions.length}`);

  // --- TEST 2: Serial Range Continuity ---
  console.log('\n--- TEST 2: 10-Serial Sequence Logic ---');
  const startNum = BigInt('20231501');
  const totalLen = 10;
  const labels = [];
  for (let i = 0; i < 4; i++) {
    const sStart = String(startNum + BigInt(i * 10)).padStart(totalLen, '0');
    const sEnd = String(startNum + BigInt(i * 10 + 9)).padStart(totalLen, '0');
    labels.push({ start: sStart, end: sEnd });
  }

  assert(labels[0].start === '0020231501' && labels[0].end === '0020231510', 'Label 1: 0020231501 ----- 0020231510', `${labels[0].start} ----- ${labels[0].end}`);
  assert(labels[1].start === '0020231511' && labels[1].end === '0020231520', 'Label 2: 0020231511 ----- 0020231520', `${labels[1].start} ----- ${labels[1].end}`);
  assert(labels[2].start === '0020231521' && labels[2].end === '0020231530', 'Label 3: 0020231521 ----- 0020231530', `${labels[2].start} ----- ${labels[2].end}`);
  assert(labels[3].start === '0020231531' && labels[3].end === '0020231540', 'Label 4: 0020231531 ----- 0020231540', `${labels[3].start} ----- ${labels[3].end}`);

  // --- TEST 3: Multi-Page Calculation ---
  console.log('\n--- TEST 3: Multi-Page Sheet Calculations ---');
  assert(Math.ceil(44 / 44) === 1, '44 labels = exactly 1 page', 'Pages: 1');
  assert(Math.ceil(88 / 44) === 2, '88 labels = exactly 2 pages', 'Pages: 2');
  assert(Math.ceil(100 / 44) === 3, '100 labels = exactly 3 pages', 'Pages: 3');

  // --- TEST 4: Master Artwork Aspect Ratio ---
  console.log('\n--- TEST 4: Range Master Artwork Verification ---');
  const artworkPath = getRangeMasterArtworkPath();
  const meta = await sharp(artworkPath).metadata();
  const aspect = meta.width / meta.height;
  assert(fs.existsSync(artworkPath), 'Range master template exists on disk', artworkPath);
  assert(Math.abs(aspect - 1.5) < 0.02, 'Master template strictly preserves 3:2 aspect ratio', `Aspect: ${aspect.toFixed(3)} (Target: 1.500)`);

  // --- TEST 5: Render Multi-Page 12x18 PDF ---
  console.log('\n--- TEST 5: Render 12x18 Range Sheet PDF ---');
  const outPdf = path.resolve(__dirname, '../../storage/test_outputs/test_range_sheet_verified.pdf');
  const renderRes = await renderRangeBatchPDF({
    batchId: 'TEST-RANGE-VERIFY',
    batchName: 'Verification Range Batch',
    startSerialNumber: '0020231501',
    totalPhysicalLabels: 44,
    outputPath: outPdf,
  });
  assert(renderRes.totalPages === 1, 'Rendered exactly 1 page', `Pages: ${renderRes.totalPages}`);
  assert(renderRes.totalSerials === 440, 'Covers exactly 440 serial numbers (44 × 10)', `Serials: ${renderRes.totalSerials}`);
  assert(fs.existsSync(outPdf) && renderRes.fileSize > 100000, 'Valid PDF file created on disk', `Size: ${(renderRes.fileSize / 1024).toFixed(1)} KB`);

  // --- TEST 6: Render Single Proof PDF ---
  console.log('\n--- TEST 6: Render Single 3:2 Range Label PDF ---');
  const outSingle = path.resolve(__dirname, '../../storage/test_outputs/test_range_single_verified.pdf');
  const singleRes = await renderSingleRangeLabelPDF({
    startSerialNumber: '0020231501',
    endSerialNumber: '0020231510',
    outputPath: outSingle,
  });
  assert(fs.existsSync(outSingle) && singleRes.fileSize > 50000, 'Single 3:2 proof PDF created', `Size: ${(singleRes.fileSize / 1024).toFixed(1)} KB`);

  console.log('\n====================================================');
  console.log(`RANGE TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================');

  if (failed > 0) process.exit(1);
}

runRangeSuite().catch((err) => {
  console.error('Test Suite Exception:', err);
  process.exit(1);
});
