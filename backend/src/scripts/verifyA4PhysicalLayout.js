import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { calculateLayout } from '../services/layoutEngine.js';
import { renderBatchPDF } from '../services/pdfRenderService.js';
import { generateSerialNumbers } from '../services/barcodeService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testA4PhysicalLayout() {
  console.log('================================================================');
  console.log('PROGRAMMATIC A4 PHYSICAL LABEL SIZE & LAYOUT VERIFICATION');
  console.log('================================================================\n');

  const layout = calculateLayout({ preset: 'a4_2x1_5' });

  let passed = 0;
  let failed = 0;

  function assert(condition, name, details = '') {
    if (condition) {
      console.log(`  [PASS] ${name} ${details ? '--> ' + details : ''}`);
      passed++;
    } else {
      console.error(`  [FAIL] ${name} ${details ? '--> ' + details : ''}`);
      failed++;
    }
  }

  // 1. Sheet Dimensions
  assert(
    Math.abs(layout.sheetWidth - 595.28) < 0.1,
    'A4 Sheet Width = 595.28 pt (210 mm / 8.27")',
    `Actual: ${layout.sheetWidth} pt`
  );
  assert(
    Math.abs(layout.sheetHeight - 841.89) < 0.1,
    'A4 Sheet Height = 841.89 pt (297 mm / 11.69")',
    `Actual: ${layout.sheetHeight} pt`
  );

  // 2. Grid configuration
  assert(layout.cols === 3, 'A4 Columns = 3', `Cols: ${layout.cols}`);
  assert(layout.rows === 7, 'A4 Rows = 7', `Rows: ${layout.rows}`);
  assert(layout.labelsPerSheet === 21, 'A4 Total Labels = 21', `Labels: ${layout.labelsPerSheet}`);

  // 3. Physical Label Dimensions (144 pt x 108 pt = 2.00" x 1.50")
  assert(layout.labelWidth === 144, 'Label Physical Cutting Width = 144 pt (2.00 in / 50.8 mm)', `Width: ${layout.labelWidth} pt`);
  assert(layout.labelHeight === 108, 'Label Physical Cutting Height = 108 pt (1.50 in / 38.1 mm)', `Height: ${layout.labelHeight} pt`);

  // 4. Cutting Gaps (2 mm = 5.67 pt)
  assert(
    Math.abs(layout.colGutterMm - 2.0) < 0.05,
    'Horizontal Cutting Gap = 2.0 mm (5.67 pt)',
    `Col Gutter: ${layout.colGutterMm} mm (${layout.colGutter} pt)`
  );
  assert(
    Math.abs(layout.rowGutterMm - 2.0) < 0.05,
    'Vertical Cutting Gap = 2.0 mm (5.67 pt)',
    `Row Gutter: ${layout.rowGutterMm} mm (${layout.rowGutter} pt)`
  );

  // 5. Verify every single one of the 21 label positions has exact 144 x 108 dimensions
  let all21Exact = true;
  for (let i = 0; i < layout.positions.length; i++) {
    const p = layout.positions[i];
    if (p.width !== 144 || p.height !== 108) {
      all21Exact = false;
      console.error(`Slot ${i} has non-standard dimensions: ${p.width}x${p.height}`);
    }
  }
  assert(all21Exact, 'All 21 label positions have EXACT 144 pt x 108 pt (2.00" x 1.50") cutting box');

  // 6. Mathematical fit check
  const totalW = layout.leftMargin + 3 * 144 + 2 * layout.colGutter + layout.rightMargin;
  const totalH = layout.topMargin + 7 * 108 + 6 * layout.rowGutter + layout.bottomMargin;
  assert(totalW <= layout.sheetWidth + 0.1, 'Mathematical Width Fit: totalW <= sheetWidth', `${totalW.toFixed(2)} pt <= ${layout.sheetWidth} pt`);
  assert(totalH <= layout.sheetHeight + 0.1, 'Mathematical Height Fit: totalH <= sheetHeight', `${totalH.toFixed(2)} pt <= ${layout.sheetHeight} pt`);

  // 7. Render complete A4 batch PDF to disk
  const outputPath = path.resolve(__dirname, '../../storage/test_outputs/A4_21_Labels_Verified_2x1.5in.pdf');
  const serials = generateSerialNumbers('0020231501', 21, '');
  const renderResult = await renderBatchPDF({
    batchId: 'A4-PHYSICAL-TEST',
    serialNumbers: serials,
    outputPath,
    layoutConfig: { preset: 'a4_2x1_5' },
  });

  assert(renderResult.totalPages === 1, 'Rendered 1 complete A4 PDF page for 21 labels');
  assert(fs.existsSync(outputPath), 'Physical A4 PDF written to disk successfully', `File: ${outputPath}`);
  assert(renderResult.fileSize > 100000, `PDF file size valid (${(renderResult.fileSize/1024).toFixed(1)} KB)`);

  console.log('\n================================================================');
  console.log(`SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('================================================================');

  if (failed > 0) process.exit(1);
}

testA4PhysicalLayout().catch(console.error);
