import { renderBatchPDF } from '../services/pdfRenderService.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testPdfGeneration() {
  const outputPath = path.resolve(__dirname, '../../storage/test_output_batch.pdf');
  const serialNumbers = ['VS000001', 'VS000002', 'VS000003', 'VS000004'];

  console.log('Rendering test PDF batch with 4 labels...');
  const result = await renderBatchPDF({
    batchId: 'TEST-BATCH-001',
    serialNumbers,
    outputPath,
    layoutConfig: {
      labelsPerSheet: 4,
    },
    onProgress: (p) => {
      console.log(`Progress: ${p.percentage}% (${p.processed}/${p.total})`);
    },
  });

  console.log('PDF Result:', result);
  console.log('File size:', fs.statSync(outputPath).size, 'bytes');
  console.log('✓ Successfully generated PDF at:', outputPath);
}

testPdfGeneration().catch(console.error);
