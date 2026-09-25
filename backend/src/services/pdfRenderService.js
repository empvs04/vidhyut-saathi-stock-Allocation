import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { calculateLayout } from './layoutEngine.js';
import { generateBarcodeBuffer } from './barcodeService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Approved Master Artwork Aspect Ratio (1200 x 900 px = 4:3 = 1.333333)
const MASTER_ARTWORK_ASPECT = 4 / 3;

/**
 * Get the master approved label image path
 */
function getMasterArtworkPath() {
  const candidates = [
    path.resolve(__dirname, '../assets/VidhyutSaathi_Label_2x1.5in.png'),
    path.resolve(__dirname, '../assets/clean_label_template.png'),
    path.resolve(__dirname, '../assets/clean_label_template.jpg'),
  ];
  for (const p of candidates) {
    if (fs.existsSync(p)) return p;
  }
  throw new Error(`Master approved label template not found in ${path.resolve(__dirname, '../assets')}`);
}

/**
 * Calculate proportional fit (Contain mode) for the master artwork layer inside
 * the physical label cutting container. Never independently stretches width and height.
 * 
 * @param {number} containerX - Container X in PDF points
 * @param {number} containerY - Container Y in PDF points
 * @param {number} containerW - Container width in PDF points (e.g. 144 pt for 2")
 * @param {number} containerH - Container height in PDF points (e.g. 108 pt for 1.5")
 * @param {number} artAspect - Aspect ratio of source artwork (width / height)
 * @returns {{ renderX: number, renderY: number, renderW: number, renderH: number }}
 */
export function calculateProportionalArtworkBounds(
  containerX,
  containerY,
  containerW,
  containerH,
  artAspect = MASTER_ARTWORK_ASPECT
) {
  const containerAspect = containerW / containerH;
  let renderW, renderH;

  if (containerAspect > artAspect) {
    // Container is wider than artwork -> fit to height, center horizontally
    renderH = containerH;
    renderW = containerH * artAspect;
  } else {
    // Container is taller than artwork -> fit to width, center vertically
    renderW = containerW;
    renderH = containerW / artAspect;
  }

  const renderX = containerX + (containerW - renderW) / 2;
  const renderY = containerY + (containerH - renderH) / 2;

  return {
    renderX: Number(renderX.toFixed(2)),
    renderY: Number(renderY.toFixed(2)),
    renderW: Number(renderW.toFixed(2)),
    renderH: Number(renderH.toFixed(2)),
  };
}

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
  const labelsPerPage = layout.labelsPerSheet;
  const totalPages = Math.ceil(totalLabels / labelsPerPage);

  const templateImagePath = getMasterArtworkPath();

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
        size: [layout.sheetWidth, layout.sheetHeight],
        margins: { top: 0, bottom: 0, left: 0, right: 0 },
        info: {
          Title: `Vidhyut Saathi Barcode Labels - Batch ${batchId}`,
          Author: 'Vidhyut Saathi Energy Savers Pvt. Ltd.',
          Subject: '10-Year Saver Card Official Barcode Sheet',
          Keywords: 'Barcode, Code128, Vidhyut Saathi, Print Sheet, 2x1.5',
        },
      });

      doc.pipe(writeStream);

      // Pre-read template buffer once and register reusable XObject
      const templateBuffer = fs.readFileSync(templateImagePath);
      const masterImage = doc.openImage(templateBuffer);

      let processedCount = 0;

      for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
        doc.addPage({
          size: [layout.sheetWidth, layout.sheetHeight],
          margins: { top: 0, bottom: 0, left: 0, right: 0 },
        });

        // Discrete header in top margin for print shop operators
        doc
          .font('Helvetica-Bold')
          .fontSize(6.5)
          .fillColor('#64748B')
          .text(
            `VIDHYUT SAATHI ENERGY SAVERS PVT. LTD. | Batch: ${batchId} | Page ${pageNum} of ${totalPages} | ${layout.presetName || 'Print Sheet'} (${layout.labelsPerSheet} Labels/Page) | Print at 100% Actual Size`,
            layout.leftMargin,
            Math.max(4, layout.topMargin - 12),
            { lineBreak: false }
          );

        const pageStartIndex = (pageNum - 1) * labelsPerPage;
        const pageEndIndex = Math.min(pageStartIndex + labelsPerPage, totalLabels);
        const pageLabels = serialNumbers.slice(pageStartIndex, pageEndIndex);

        for (let i = 0; i < pageLabels.length; i++) {
          const serial = String(pageLabels[i]);
          const pos = layout.positions[i];

          let barcodeRenderCount = 0;
          let serialRenderCount = 0;

          // 1. Draw Master Card Artwork filling the EXACT physical label box (2.00" x 1.50")
          //    No outer border stroke — the artwork has its own built-in dark rounded border.
          //    Artwork is 4:3, label is 4:3 — perfect fill, zero letterboxing, zero stretch.
          doc.image(masterImage, pos.x, pos.y, {
            width: pos.width,   // Exactly 144 pt = 2.000 inches
            height: pos.height, // Exactly 108 pt = 1.500 inches
          });

          // 2. Generate high-resolution Code 128 Barcode for this serial
          const barcodePng = await generateBarcodeBuffer(serial, {
            scale: 4,
            height: 12,
            includetext: false,
            paddingwidth: 0,
            paddingheight: 0,
            backgroundcolor: 'ffffff',
          });

          // 3. Barcode section geometry — matching unstretched master template (1200x900 -> 144x108 pt)
          //    Scale factor: 144 / 1200 = 0.12 pt/px.
          //    Master template barcode box: boxY = 489 px (58.68 pt), boxH = 265 px (31.8 pt)
          //    Barcode width: 980 px * 0.12 = 117.60 pt (centered: pos.x + 13.20 pt)
          //    Barcode height: 165 px * 0.12 = 19.80 pt
          //    Barcode Y: 507 px * 0.12 = 60.84 pt
          const bcW = 117.60;
          const bcH = 19.80;
          const bcX = pos.x + 13.20;
          const bcY = pos.y + 60.84;

          // 4. Draw barcode image (Code 128)
          doc.image(barcodePng, bcX, bcY, {
            width: bcW,
            height: bcH,
          });
          barcodeRenderCount++;

          // 5. Draw bold serial number below barcode matching uploaded image font & alignment
          const serialFontSize = 7.2;
          const textY = pos.y + 82.8;
          doc
            .font('Helvetica-Bold')
            .fontSize(serialFontSize)
            .fillColor('#000000');

          const textWidth = doc.widthOfString(serial, { characterSpacing: 0.6 });
          const textX = pos.x + (pos.width - textWidth) / 2;

          doc.text(serial, textX, textY, {
            lineBreak: false,
            characterSpacing: 0.6,
          });
          serialRenderCount++;

          // Duplicate rendering safety assertion
          if (barcodeRenderCount !== 1 || serialRenderCount !== 1) {
            throw new Error(`Duplicate barcode/serial rendering detected. PDF generation stopped.`);
          }

          processedCount++;
        }

        // Notify generation progress
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
 * @param {string} cardSeries - Optional card series prefix
 * @returns {Promise<PDFDocument>} - The PDFKit document instance ready to pipe
 */
export async function renderSingleLabelPDF(serialNumber, cardSeries = '') {
  const templateImagePath = getMasterArtworkPath();

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

  // 1. Draw Master Card Artwork — exact fill at 2.00" x 1.50" (144 x 108 pt)
  //    No border stroke — artwork has its own built-in dark rounded border.
  doc.image(templateBuffer, 0, 0, {
    width: 144,   // Exactly 2.000 inches
    height: 108,  // Exactly 1.500 inches
  });

  // 2. Generate crisp Code 128 barcode
  const barcodePng = await generateBarcodeBuffer(String(serialNumber), {
    scale: 3,
    height: 8,
    includetext: false,
    paddingwidth: 0,
    paddingheight: 0,
  });

  // 3. Barcode section geometry (label is 144 x 108 pt = 2.00" x 1.50")
  //    Template already contains the single crisp rounded rectangle barcode box.
  const bcW = 117.60;
  const bcH = 19.80;
  const bcX = (144 - bcW) / 2; // 13.20 pt
  const bcY = 60.84;

  // 4. Draw barcode
  doc.image(barcodePng, bcX, bcY, {
    width: bcW,
    height: bcH,
  });

  // 5. Draw bold serial number below barcode
  const textY = 82.8;
  doc
    .font('Helvetica-Bold')
    .fontSize(7.2)
    .fillColor('#000000');

  const textWidth = doc.widthOfString(String(serialNumber), { characterSpacing: 0.6 });
  const textX = (144 - textWidth) / 2;

  doc.text(String(serialNumber), textX, textY, {
    lineBreak: false,
    characterSpacing: 0.6,
  });

  doc.end();
  return doc;
}

/**
 * Render a Print Calibration / Ruler Test Page on standard A4 (595.28 x 841.89 pt)
 * Includes:
 * 1. Exactly one 2.00" x 1.50" (144 x 108 pt) physical label
 * 2. 1-inch (25.4 mm / 72 pt) & 2-inch (50.8 mm / 144 pt) physical ruler calibration marks
 * 3. Clear print instruction guide (Print at 100% / Actual Size)
 */
export async function renderCalibrationTestPDF(sampleSerial = '0020231501') {
  const templateImagePath = getMasterArtworkPath();

  const doc = new PDFDocument({
    autoFirstPage: true,
    size: [595.28, 841.89], // A4 standard
    margins: { top: 36, bottom: 36, left: 36, right: 36 },
    info: {
      Title: 'Vidhyut Saathi Print Calibration & Ruler Test Page',
      Author: 'Vidhyut Saathi Energy Savers Pvt. Ltd.',
      Subject: 'Physical Print Calibration & 100% Scale Verification',
    },
  });

  const templateBuffer = fs.readFileSync(templateImagePath);

  // Title & Header
  doc
    .font('Helvetica-Bold')
    .fontSize(16)
    .fillColor('#0F172A')
    .text('VIDHYUT SAATHI PRINT CALIBRATION & RULER TEST', 36, 40, { align: 'center' });

  doc
    .font('Helvetica')
    .fontSize(9.5)
    .fillColor('#475569')
    .text('Measure with a physical ruler after printing to verify 100% unscaled print output.', 36, 62, { align: 'center' });

  // Critical Warning Box
  doc
    .rect(46, 85, 503, 50)
    .fillAndStroke('#FEF3C7', '#F59E0B');

  doc
    .font('Helvetica-Bold')
    .fontSize(9.5)
    .fillColor('#92400E')
    .text('CRITICAL PRINTER DRIVER SETTINGS:', 56, 93);

  doc
    .font('Helvetica')
    .fontSize(8.5)
    .fillColor('#78350F')
    .text('• Print Scale: 100% | Select: "Actual Size" | Disable: "Fit to Page" / "Shrink Oversized Pages"', 56, 107)
    .text('• Verify physical paper size matches document (A4 / 12x18) before printing.', 56, 120);

  // SECTION 1: 2" x 1.5" PHYSICAL LABEL
  const labelX = (595.28 - 144) / 2;
  const labelY = 160;

  doc
    .font('Helvetica-Bold')
    .fontSize(11)
    .fillColor('#0F172A')
    .text('1. Physical Label Cutting Box (Exact 2.00" × 1.50" / 50.8 × 38.1 mm)', 36, labelY - 18, { align: 'center' });

  // Draw cutting boundary guide
  doc
    .rect(labelX - 1, labelY - 1, 146, 110)
    .lineWidth(0.5)
    .dash(3, { space: 2 })
    .stroke('#DC2626')
    .undash();

  // Draw master artwork — exact fill inside 144 x 108 pt label box
  doc.image(templateBuffer, labelX, labelY, {
    width: 144,   // Exactly 2.000 inches
    height: 108,  // Exactly 1.500 inches
  });

  // Dynamic barcode
  const barcodePng = await generateBarcodeBuffer(String(sampleSerial), {
    scale: 3,
    height: 8,
    includetext: false,
    paddingwidth: 0,
    paddingheight: 0,
  });

  const bcW = 117.60;
  const bcH = 19.80;
  const bcX = labelX + 13.20;
  const bcY = labelY + 60.84;

  doc.image(barcodePng, bcX, bcY, {
    width: bcW,
    height: bcH,
  });

  // Serial text below barcode
  const textY = labelY + 82.8;
  doc
    .font('Helvetica-Bold')
    .fontSize(7.2)
    .fillColor('#000000');

  const textWidth = doc.widthOfString(String(sampleSerial), { characterSpacing: 0.6 });
  const textX = labelX + (144 - textWidth) / 2;

  doc.text(String(sampleSerial), textX, textY, {
    lineBreak: false,
    characterSpacing: 0.6,
  });

  // Dimension Callouts for Label
  doc
    .font('Helvetica')
    .fontSize(8)
    .fillColor('#DC2626')
    .text('← Width: Exactly 2.00 in (50.8 mm / 144 pt) →', labelX, labelY + 114, { width: 144, align: 'center' });

  doc
    .save()
    .translate(labelX - 8, labelY + 54)
    .rotate(-90)
    .text('Height: 1.50 in (38.1 mm / 108 pt)', -54, 0, { align: 'center' })
    .restore();

  // SECTION 2: PHYSICAL RULER CALIBRATION TARGETS
  const rulerStartY = 320;

  doc
    .font('Helvetica-Bold')
    .fontSize(11)
    .fillColor('#0F172A')
    .text('2. Physical Ruler Calibration Bars', 36, rulerStartY, { align: 'center' });

  // 1-Inch Ruler Target (72 pt / 25.4 mm)
  const r1X = (595.28 - 72) / 2;
  const r1Y = rulerStartY + 25;
  doc
    .rect(r1X, r1Y, 72, 14)
    .fillAndStroke('#E2E8F0', '#0F172A');
  doc
    .font('Helvetica-Bold')
    .fontSize(7.5)
    .fillColor('#0F172A')
    .text('1.00 INCH (25.4 mm / 72 pt)', r1X, r1Y + 3.5, { width: 72, align: 'center' });

  // 2-Inch Ruler Target (144 pt / 50.8 mm)
  const r2X = (595.28 - 144) / 2;
  const r2Y = rulerStartY + 55;
  doc
    .rect(r2X, r2Y, 144, 14)
    .fillAndStroke('#E2E8F0', '#0F172A');
  doc
    .font('Helvetica-Bold')
    .fontSize(7.5)
    .fillColor('#0F172A')
    .text('2.00 INCHES (50.8 mm / 144 pt)', r2X, r2Y + 3.5, { width: 144, align: 'center' });

  // 50 mm Metric Ruler Target (50 mm = 141.73 pt)
  const r3X = (595.28 - 141.73) / 2;
  const r3Y = rulerStartY + 85;
  doc
    .rect(r3X, r3Y, 141.73, 14)
    .fillAndStroke('#E2E8F0', '#0F172A');
  doc
    .font('Helvetica-Bold')
    .fontSize(7.5)
    .fillColor('#0F172A')
    .text('50.0 MILLIMETERS (5.00 cm / 141.73 pt)', r3X, r3Y + 3.5, { width: 141.73, align: 'center' });

  // Footer Instructions
  doc
    .font('Helvetica')
    .fontSize(8)
    .fillColor('#64748B')
    .text(
      'Vidhyut Saathi Barcode Systems Engineering • PDF Output Dimension Verification • 1 in = 72 PDF pt',
      36,
      800,
      { align: 'center' }
    );

  doc.end();
  return doc;
}

