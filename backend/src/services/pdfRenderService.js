import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { calculateLayout } from './layoutEngine.js';
import { generateBarcodeBuffer } from './barcodeService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Render a complete multi-page PDF sheet for a batch of barcode labels
 * 
 * @param {object} params
 * @param {string} params.batchId - Unique batch identifier
 * @param {Array<string>} params.serialNumbers - List of all unique serial numbers
 * @param {string} params.outputPath - Output file path on disk
 * @param {object} params.layoutConfig - Custom layout configuration (margins, dimensions)
 * @param {function} params.onProgress - Callback for generation progress
 * @returns {Promise<{ totalPages: number, fileSize: number, totalLabels: number }>}
 */
export async function renderBatchPDF({
  batchId,
  serialNumbers,
  outputPath,
  layoutConfig = {},
  onProgress = () => {},
}) {
  const layout = calculateLayout(layoutConfig);
  const totalLabels = serialNumbers.length;
  const labelsPerPage = layout.labelsPerSheet; // 55
  const totalPages = Math.ceil(totalLabels / labelsPerPage);

  let templateImagePath = path.resolve(__dirname, '../assets/clean_label_template.jpg');
  if (!fs.existsSync(templateImagePath)) {
    templateImagePath = path.resolve(__dirname, '../assets/clean_label_template.png');
  }
  if (!fs.existsSync(templateImagePath)) {
    throw new Error(`Master template image not found at ${templateImagePath}`);
  }

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
        size: [layout.sheetWidth, layout.sheetHeight], // 864 x 1296 pt (12 x 18 inches)
        margins: { top: 0, bottom: 0, left: 0, right: 0 },
        info: {
          Title: `Vidhyut Saathi Barcode Labels - Batch ${batchId}`,
          Author: 'Vidhyut Saathi Energy Savers Pvt. Ltd.',
          Subject: '10-Year Saver Card Official Barcode Sheet',
          Keywords: 'Barcode, Code128, Vidhyut Saathi, Print Sheet, 12x18',
        },
      });

      doc.pipe(writeStream);

      // Pre-read template buffer once to avoid repeated disk reads
      const templateBuffer = fs.readFileSync(templateImagePath);

      let processedCount = 0;

      for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
        doc.addPage({
          size: [layout.sheetWidth, layout.sheetHeight],
          margins: { top: 0, bottom: 0, left: 0, right: 0 },
        });

        // Optional page header for print operators (in top margin, discrete)
        doc
          .font('Helvetica-Bold')
          .fontSize(6.5)
          .fillColor('#64748B')
          .text(
            `VIDHYUT SAATHI ENERGY SAVERS PVT. LTD. | Batch: ${batchId} | Page ${pageNum} of ${totalPages} | 12" x 18" (55 Labels)`,
            layout.leftMargin,
            layout.topMargin - 12,
            { lineBreak: false }
          );

        const pageStartIndex = (pageNum - 1) * labelsPerPage;
        const pageEndIndex = Math.min(pageStartIndex + labelsPerPage, totalLabels);
        const pageLabels = serialNumbers.slice(pageStartIndex, pageEndIndex);

        for (let i = 0; i < pageLabels.length; i++) {
          const serial = pageLabels[i];
          const pos = layout.positions[i];

          // 1. Draw Master Card Artwork (fills 144 pt x 108 pt = exact 2" x 1.5" box edge-to-edge)
          doc.image(templateBuffer, pos.x, pos.y, {
            width: pos.width,
            height: pos.height,
          });

          // 2. Generate crisp Code 128 Barcode for this serial
          const barcodePng = await generateBarcodeBuffer(serial, {
            scale: 3,
            height: 8,
            includetext: false,
            paddingwidth: 0,
            paddingheight: 0,
          });

          // 3. Draw Barcode inside the white barcode container
          // Container top border is at pos.y + 63.85pt, bottom is at pos.y + 92.11pt (inner height 28.26pt)
          // Layout: 7.65pt top gap | 10pt barcode | 1.55pt gap | ~6pt text | ~2.9pt bottom gap
          const bcW = 96;
          const bcX = pos.x + (pos.width - bcW) / 2; // centered horizontally
          const bcY = pos.y + 71.5; // ~7.65pt top breathing room below border
          const bcH = 10.0; // taller barcode for premium look

          doc.image(barcodePng, bcX, bcY, {
            width: bcW,
            height: bcH,
          });

          // 4. Draw Human-Readable Serial Number below the barcode inside the same box
          // Font: Courier-Bold (monospace OCR-style), Black color
          const textY = pos.y + 83.2;
          doc
            .font('Courier-Bold')
            .fontSize(5.8)
            .fillColor('#000000')
            .text(serial, pos.x, textY, {
              width: pos.width,
              align: 'center',
              characterSpacing: 0.5,
            });

          processedCount++;
        }

        // Notify progress
        const percent = Math.round((processedCount / totalLabels) * 100);
        onProgress({
          processed: processedCount,
          total: totalLabels,
          percentage: percent,
          currentPage: pageNum,
          totalPages,
        });
      }

      doc.end();

      writeStream.on('finish', () => {
        let fileSize = 0;
        try {
          if (fs.existsSync(outputPath)) {
            const stats = fs.statSync(outputPath);
            fileSize = stats.size;
          }
        } catch (e) {}
        resolve({
          totalPages,
          fileSize,
          totalLabels,
          outputPath,
        });
      });

      writeStream.on('error', (err) => {
        reject(err);
      });
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Render a single 2" x 1.5" physical barcode label PDF (144 pt x 108 pt)
 * 
 * @param {string} serialNumber - The exact serial number to render
 * @param {string} cardSeries - Optional card series prefix (defaults to 'VS')
 * @returns {Promise<PDFDocument>} - The PDFKit document instance ready to pipe
 */
export async function renderSingleLabelPDF(serialNumber, cardSeries = 'VS') {
  let templateImagePath = path.resolve(__dirname, '../assets/clean_label_template.jpg');
  if (!fs.existsSync(templateImagePath)) {
    templateImagePath = path.resolve(__dirname, '../assets/clean_label_template.png');
  }

  // Exact 2" x 1.5" physical dimensions (144 x 108 pt)
  const doc = new PDFDocument({
    autoFirstPage: true,
    size: [144, 108],
    margins: { top: 0, bottom: 0, left: 0, right: 0 },
    info: {
      Title: `Vidhyut Saathi Single Label - ${serialNumber}`,
      Author: 'Vidhyut Saathi Energy Savers Pvt. Ltd.',
      Subject: 'Official 10-Year Saver Card Label (2" x 1.5")',
    },
  });

  const templateBuffer = fs.readFileSync(templateImagePath);

  // 1. Draw edge-to-edge label template
  doc.image(templateBuffer, 0, 0, { width: 144, height: 108 });

  // 2. Generate crisp Code 128 barcode
  const barcodePng = await generateBarcodeBuffer(serialNumber, {
    scale: 3,
    height: 8,
    includetext: false,
    paddingwidth: 0,
    paddingheight: 0,
  });

  // 3. Draw barcode inside the white box with generous top breathing room
  // Layout: 7.65pt top gap | 10pt barcode | 1.55pt gap | ~6pt text | ~2.9pt bottom gap
  const barcodeWidth = 96;
  const barcodeHeight = 10.0;
  const barcodeX = (144 - barcodeWidth) / 2;
  const barcodeY = 71.5; // ~7.65pt below box top border (63.85pt)

  doc.image(barcodePng, barcodeX, barcodeY, {
    width: barcodeWidth,
    height: barcodeHeight,
  });

  // 4. Draw serial number text cleanly inside the box
  // Font: Courier-Bold (monospace OCR-style), Black color
  const textY = 83.2;
  doc
    .font('Courier-Bold')
    .fontSize(5.8)
    .fillColor('#000000')
    .text(serialNumber, 0, textY, {
      width: 144,
      align: 'center',
      characterSpacing: 0.5,
    });

  doc.end();
  return doc;
}
