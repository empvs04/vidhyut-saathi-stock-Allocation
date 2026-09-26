import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { calculateRangeAutoLayout, RANGE_SHEET_PRESETS } from './rangeLayoutEngine.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Get master artwork template path for range labels
 */
export function getRangeMasterArtworkPath() {
  const cleanPath = path.resolve(__dirname, '../assets/range_label_clean_template.png');
  if (fs.existsSync(cleanPath)) return cleanPath;
  const standardPath = path.resolve(__dirname, '../assets/range_label_template.png');
  if (fs.existsSync(standardPath)) return standardPath;
  throw new Error('Range label master template not found in backend/src/assets');
}

/**
 * Render a complete Multi-Page 12x18 Sheet PDF for 10-Serial Range Labels
 * 
 * @param {Object} options
 * @param {string} options.batchId - Unique batch identifier
 * @param {string} options.batchName - Human-readable batch title
 * @param {string} options.startSerialNumber - Starting serial number (e.g. "0020231501")
 * @param {number} options.totalPhysicalLabels - Number of physical labels to generate
 * @param {string} options.outputPath - Destination PDF file path
 * @param {Object} options.layoutConfig - Layout overrides (sheet size, margins, gaps, etc.)
 * @param {Function} options.onProgress - Progress callback
 * @returns {Promise<{ totalPages: number, fileSize: number, totalLabels: number, totalSerials: number }>}
 */
export async function renderRangeBatchPDF({
  batchId,
  batchName = 'Range Batch',
  startSerialNumber = '0020231501',
  totalPhysicalLabels = 44,
  outputPath,
  layoutConfig = {},
  onProgress = () => {},
}) {
  const layout = calculateRangeAutoLayout(layoutConfig);
  const labelsPerPage = layout.labelsPerSheet;
  const totalPages = Math.ceil(totalPhysicalLabels / labelsPerPage);

  const templateImagePath = getRangeMasterArtworkPath();

  // Ensure output directory exists
  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  return new Promise(async (resolve, reject) => {
    try {
      const writeStream = fs.createWriteStream(outputPath);

      const doc = new PDFDocument({
        autoFirstPage: false,
        size: [layout.sheetWidthPt, layout.sheetHeightPt],
        margins: { top: 0, bottom: 0, left: 0, right: 0 },
        info: {
          Title: `Vidhyut Saathi 10-Serial Range Labels - Batch ${batchId}`,
          Author: 'Vidhyut Saathi Energy Savers Pvt. Ltd.',
          Subject: '10-Serial Range Card Official Label Sheet (12x18)',
          Keywords: 'Range Labels, 10-Pack, Vidhyut Saathi, Print Sheet, 3:2',
        },
      });

      doc.pipe(writeStream);

      const templateBuffer = fs.readFileSync(templateImagePath);
      const masterImage = doc.openImage(templateBuffer);

      // Parse starting serial number preserving leading zeros
      const match = String(startSerialNumber).match(/^(0*)(\d+)$/);
      const prefixZeros = match ? match[1] : '';
      const startNumBig = BigInt(match ? match[2] : '0');
      const totalLen = String(startSerialNumber).length;

      let currentPhysicalIndex = 0;

      for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
        doc.addPage({
          size: [layout.sheetWidthPt, layout.sheetHeightPt],
          margins: { top: 0, bottom: 0, left: 0, right: 0 },
        });

        // Discrete header in margin for print press operators
        doc
          .font('Helvetica-Bold')
          .fontSize(6.5)
          .fillColor('#64748B')
          .text(
            `VIDHYUT SAATHI ENERGY SAVERS PVT. LTD. | Batch: ${batchId} (${batchName}) | Page ${pageNum} of ${totalPages} | 10-Serial Range Labels (${layout.labelsPerSheet}/Sheet) | Print at 100% Actual Size`,
            layout.marginLeftPt,
            Math.max(4, layout.marginTopPt - 12),
            { lineBreak: false }
          );

        const pageStartIndex = (pageNum - 1) * labelsPerPage;
        const pageEndIndex = Math.min(pageStartIndex + labelsPerPage, totalPhysicalLabels);
        const labelsOnThisPage = pageEndIndex - pageStartIndex;

        for (let i = 0; i < labelsOnThisPage; i++) {
          const globalLabelIndex = pageStartIndex + i;
          const pos = layout.positions[i];

          // Calculate 10-serial range for this physical label
          const labelStartNum = startNumBig + BigInt(globalLabelIndex * 10);
          const labelEndNum = labelStartNum + BigInt(9);

          const sStart = String(labelStartNum).padStart(totalLen, '0');
          const sEnd = String(labelEndNum).padStart(totalLen, '0');
          const rangeText = `${sStart} ----- ${sEnd}`;

          // 1. Draw Master Template Image (maintaining 3:2 aspect ratio exactly)
          doc.image(masterImage, pos.x, pos.y, {
            width: pos.width,
            height: pos.height,
          });

          // 2. Draw Dynamic Range Text
          // Template is 1024x682. Text baseline is at y = 546.
          // In points: pos.height * 0.748 with font size scaled to cell width.
          const fontSize = 44 * (pos.width / 1024);
          const textY = pos.y + pos.height * 0.748;

          doc
            .font('Helvetica-Bold')
            .fontSize(fontSize)
            .fillColor('#000000')
            .text(rangeText, pos.x, textY, {
              width: pos.width,
              align: 'center',
              characterSpacing: 0.8,
              lineBreak: false,
            });

          currentPhysicalIndex++;
        }

        onProgress({
          processedLabels: currentPhysicalIndex,
          totalLabels: totalPhysicalLabels,
          currentPage: pageNum,
          totalPages,
          percentage: Math.round((pageNum / totalPages) * 100),
        });
      }

      doc.end();

      writeStream.on('finish', () => {
        const stats = fs.statSync(outputPath);
        resolve({
          totalPages,
          fileSize: stats.size,
          totalPhysicalLabels,
          totalSerials: totalPhysicalLabels * 10,
          outputPath,
        });
      });

      writeStream.on('error', reject);
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Render a Single 3:2 Range Label PDF for proofing & calibration (e.g. 2.25" × 1.50")
 */
export async function renderSingleRangeLabelPDF({
  startSerialNumber = '0020231501',
  endSerialNumber = '0020231510',
  widthInches = 2.25,
  heightInches = 1.50,
  outputPath,
}) {
  const widthPt = widthInches * 72;
  const heightPt = heightInches * 72;
  const templateImagePath = getRangeMasterArtworkPath();

  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  return new Promise((resolve, reject) => {
    try {
      const writeStream = fs.createWriteStream(outputPath);
      const doc = new PDFDocument({
        autoFirstPage: false,
        size: [widthPt, heightPt],
        margins: { top: 0, bottom: 0, left: 0, right: 0 },
      });

      doc.pipe(writeStream);
      doc.addPage({
        size: [widthPt, heightPt],
        margins: { top: 0, bottom: 0, left: 0, right: 0 },
      });

      const templateBuffer = fs.readFileSync(templateImagePath);
      const masterImage = doc.openImage(templateBuffer);

      // Draw artwork
      doc.image(masterImage, 0, 0, { width: widthPt, height: heightPt });

      // Draw text
      const rangeText = `${startSerialNumber} ----- ${endSerialNumber}`;
      const fontSize = 44 * (widthPt / 1024);
      const textY = heightPt * 0.748;

      doc
        .font('Helvetica-Bold')
        .fontSize(fontSize)
        .fillColor('#000000')
        .text(rangeText, 0, textY, {
          width: widthPt,
          align: 'center',
          characterSpacing: 0.8,
          lineBreak: false,
        });

      doc.end();

      writeStream.on('finish', () => {
        resolve({
          widthInches,
          heightInches,
          outputPath,
          fileSize: fs.statSync(outputPath).size,
        });
      });

      writeStream.on('error', reject);
    } catch (err) {
      reject(err);
    }
  });
}
