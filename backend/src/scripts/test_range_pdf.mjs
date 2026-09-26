import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { calculateRangeAutoLayout, RANGE_SHEET_PRESETS } from '../services/rangeLayoutEngine.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testRangePdf() {
  const cleanTemplatePath = path.resolve(__dirname, '../assets/range_label_clean_template.png');
  const templateBuffer = fs.readFileSync(cleanTemplatePath);

  const preset = RANGE_SHEET_PRESETS['12x18_range_44'];
  const layout = calculateRangeAutoLayout({
    sheetWidthInches: preset.sheetWidthInches,
    sheetHeightInches: preset.sheetHeightInches,
    labelWidthInches: preset.labelWidthInches,
    labelHeightInches: preset.labelHeightInches,
    marginLeftInches: preset.marginLeftInches,
    marginRightInches: preset.marginRightInches,
    marginTopInches: preset.marginTopInches,
    marginBottomInches: preset.marginBottomInches,
    gapMm: preset.gapHorizontalMm,
  });

  const outDir = 'C:/Users/USER/.gemini/antigravity-ide/brain/90614fe4-6c73-492e-b82c-0606b444be32/scratch';
  const outPdf = path.join(outDir, 'test_range_sheet_44.pdf');
  const writeStream = fs.createWriteStream(outPdf);

  const doc = new PDFDocument({
    autoFirstPage: false,
    size: [layout.sheetWidthPt, layout.sheetHeightPt],
    margins: { top: 0, bottom: 0, left: 0, right: 0 },
  });

  doc.pipe(writeStream);
  doc.addPage({
    size: [layout.sheetWidthPt, layout.sheetHeightPt],
    margins: { top: 0, bottom: 0, left: 0, right: 0 },
  });

  const masterImage = doc.openImage(templateBuffer);

  // Discrete header in margin
  doc
    .font('Helvetica-Bold')
    .fontSize(7)
    .fillColor('#64748B')
    .text(
      `VIDHYUT SAATHI ENERGY SAVERS PVT. LTD. | 10-Serial Range Sheet | 44 Labels/Sheet (2.25" × 1.50") | Print at 100% Actual Size`,
      layout.marginLeftPt,
      Math.max(4, layout.marginTopPt - 12),
      { lineBreak: false }
    );

  let startNum = 20231501;

  for (let i = 0; i < layout.positions.length; i++) {
    const pos = layout.positions[i];
    const sStart = String(startNum).padStart(10, '0');
    const sEnd = String(startNum + 9).padStart(10, '0');
    const rangeText = `${sStart} ----- ${sEnd}`;
    startNum += 10;

    // 1. Draw Master Template
    doc.image(masterImage, pos.x, pos.y, {
      width: pos.width,
      height: pos.height,
    });

    // 2. Draw Range Text centered
    // Template 1024x682: text baseline is at y=546.
    // 546 / 682 = 0.800586
    // Top of text: 508 / 682 = 0.744868
    const fontSize = 44 * (pos.width / 1024); // ~6.96 pt for 162 pt width
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
  }

  doc.end();

  await new Promise((resolve) => writeStream.on('finish', resolve));
  console.log(`Rendered PDF: ${outPdf} (${fs.statSync(outPdf).size} bytes)`);
}

testRangePdf().catch(console.error);
