/**
 * Layout Calculation Engine for Vidhyut Saathi Barcode Sheets
 * 
 * Target Sheet: 12 inches x 18 inches (864 x 1296 points)
 * Target Label: 2 inches x 1.5 inches (144 x 108 points)
 * Grid: 5 columns x 11 rows = 55 labels per sheet
 * Cutting Margins / Gutters: ~2mm (approx 5.67 to 6.48 pt)
 */

export const PT_PER_INCH = 72;
export const MM_TO_PT = 72 / 25.4; // ~2.8346 pt per mm

export const DEFAULT_LAYOUT_CONFIG = {
  sheetWidthInches: 12,
  sheetHeightInches: 18,
  labelWidthInches: 2.0,
  labelHeightInches: 1.5,
  columns: 5,
  rows: 11,
  labelsPerSheet: 55,
  marginHorizontalInches: 0.4, // left & right
  marginVerticalInches: 0.3,   // top & bottom
};

export function calculateLayout(customConfig = {}) {
  const config = { ...DEFAULT_LAYOUT_CONFIG, ...customConfig };

  const sheetWidth = config.sheetWidthInches * PT_PER_INCH;   // 864 pt
  const sheetHeight = config.sheetHeightInches * PT_PER_INCH; // 1296 pt

  const labelWidth = config.labelWidthInches * PT_PER_INCH;   // 144 pt
  const labelHeight = config.labelHeightInches * PT_PER_INCH; // 108 pt

  const cols = config.columns;
  const rows = config.rows;
  const labelsPerSheet = cols * rows;

  const leftMargin = config.marginHorizontalInches * PT_PER_INCH;   // 28.8 pt
  const rightMargin = config.marginHorizontalInches * PT_PER_INCH;  // 28.8 pt
  const topMargin = config.marginVerticalInches * PT_PER_INCH;      // 21.6 pt
  const bottomMargin = config.marginVerticalInches * PT_PER_INCH;   // 21.6 pt

  // Available space for gutters
  const totalLabelsWidth = cols * labelWidth;   // 5 * 144 = 720 pt
  const totalLabelsHeight = rows * labelHeight; // 11 * 108 = 1188 pt

  const availWidthForGutters = sheetWidth - (leftMargin + rightMargin + totalLabelsWidth);
  const availHeightForGutters = sheetHeight - (topMargin + bottomMargin + totalLabelsHeight);

  if (availWidthForGutters < 0) {
    throw new Error(
      `Layout Overflow: Label columns (${cols} x ${labelWidth}pt = ${totalLabelsWidth}pt) plus margins (${leftMargin + rightMargin}pt) exceed sheet width (${sheetWidth}pt) by ${Math.abs(availWidthForGutters).toFixed(1)}pt.`
    );
  }

  if (availHeightForGutters < 0) {
    throw new Error(
      `Layout Overflow: Label rows (${rows} x ${labelHeight}pt = ${totalLabelsHeight}pt) plus margins (${topMargin + bottomMargin}pt) exceed sheet height (${sheetHeight}pt) by ${Math.abs(availHeightForGutters).toFixed(1)}pt.`
    );
  }

  // Inter-label gutters
  const colGutter = cols > 1 ? availWidthForGutters / (cols - 1) : 0; // 86.4 / 4 = 21.6 pt (0.3 in)
  const rowGutter = rows > 1 ? availHeightForGutters / (rows - 1) : 0; // 64.8 / 10 = 6.48 pt (~2.28 mm)

  const positions = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = leftMargin + c * (labelWidth + colGutter);
      const y = topMargin + r * (labelHeight + rowGutter);
      positions.push({
        col: c,
        row: r,
        index: r * cols + c,
        x: Number(x.toFixed(2)),
        y: Number(y.toFixed(2)),
        width: labelWidth,
        height: labelHeight,
      });
    }
  }

  return {
    sheetWidth,
    sheetHeight,
    labelWidth,
    labelHeight,
    cols,
    rows,
    labelsPerSheet,
    leftMargin,
    rightMargin,
    topMargin,
    bottomMargin,
    colGutter: Number(colGutter.toFixed(2)),
    rowGutter: Number(rowGutter.toFixed(2)),
    colGutterMm: Number((colGutter / MM_TO_PT).toFixed(2)),
    rowGutterMm: Number((rowGutter / MM_TO_PT).toFixed(2)),
    positions,
  };
}
