/**
 * Layout Calculation Engine for Vidhyut Saathi Barcode Sheets
 * 
 * Supports Multiple Sheet Formats:
 * 1. 12 × 18 inch (Default) — 55 labels (5 cols × 11 rows, 2" × 1.5" labels)
 * 2. A4 — 2 × 1.5 inch labels — 21 labels (3 cols × 7 rows, 2" × 1.5" labels)
 * 3. 12 × 18 inch — 2 × 1.5 inch labels — 55 labels (5 cols × 11 rows, 2" × 1.5" labels)
 * 4. A3 — Custom label layout — 50 labels (5 cols × 10 rows, customizable)
 */

export const PT_PER_INCH = 72;
export const MM_TO_PT = 72 / 25.4; // ~2.8346 pt per mm

export const SHEET_PRESETS = {
  '12x18_default': {
    id: '12x18_default',
    name: '12 × 18 inch (Default)',
    displayName: '12 × 18 inch (Default) — 55 Labels',
    sheetWidthInches: 12.0,
    sheetHeightInches: 18.0,
    labelWidthInches: 2.0,
    labelHeightInches: 1.5,
    columns: 5,
    rows: 11,
    labelsPerSheet: 55,
    marginHorizontalInches: 0.4,
    marginVerticalInches: 0.3,
    isCustom: false,
    description: 'Standard 12" × 18" Print Press (5 cols × 11 rows = 55 labels)',
  },
  'a4_2x1_5': {
    id: 'a4_2x1_5',
    name: 'A4 — 2 × 1.5 inch labels',
    displayName: 'A4 — 2 × 1.5 inch labels (21 Labels)',
    sheetWidthInches: 8.27, // 210 mm
    sheetHeightInches: 11.69, // 297 mm
    labelWidthInches: 2.0,
    labelHeightInches: 1.5,
    columns: 3,
    rows: 7,
    labelsPerSheet: 21,
    marginHorizontalInches: 0.45,
    marginVerticalInches: 0.40,
    isCustom: false,
    description: 'Standard A4 Office Paper (3 cols × 7 rows = 21 labels)',
  },
  '12x18_2x1_5': {
    id: '12x18_2x1_5',
    name: '12 × 18 inch — 2 × 1.5 inch labels',
    displayName: '12 × 18 inch — 2 × 1.5 inch labels (55 Labels)',
    sheetWidthInches: 12.0,
    sheetHeightInches: 18.0,
    labelWidthInches: 2.0,
    labelHeightInches: 1.5,
    columns: 5,
    rows: 11,
    labelsPerSheet: 55,
    marginHorizontalInches: 0.4,
    marginVerticalInches: 0.3,
    isCustom: false,
    description: 'Commercial 12" × 18" Sheet (5 cols × 11 rows = 55 labels)',
  },
  'a3_custom': {
    id: 'a3_custom',
    name: 'A3 — Custom label layout',
    displayName: 'A3 — Custom label layout (Configurable / Default 50 Labels)',
    sheetWidthInches: 11.69, // 297 mm
    sheetHeightInches: 16.54, // 420 mm
    labelWidthInches: 2.0,
    labelHeightInches: 1.5,
    columns: 5,
    rows: 10,
    labelsPerSheet: 50,
    marginHorizontalInches: 0.45,
    marginVerticalInches: 0.40,
    isCustom: true,
    description: 'A3 Sheet (11.69 × 16.54 in) — Fully customizable grid & dimensions',
  },
};

export const DEFAULT_LAYOUT_CONFIG = SHEET_PRESETS['12x18_default'];

export function getSheetPresetsList() {
  return Object.values(SHEET_PRESETS);
}

export function calculateLayout(customConfig = {}) {
  let basePreset = SHEET_PRESETS['12x18_default'];

  if (typeof customConfig === 'string') {
    basePreset = SHEET_PRESETS[customConfig] || SHEET_PRESETS['12x18_default'];
    customConfig = {};
  } else if (customConfig && customConfig.preset && SHEET_PRESETS[customConfig.preset]) {
    basePreset = SHEET_PRESETS[customConfig.preset];
  } else if (customConfig && customConfig.sheetSize && SHEET_PRESETS[customConfig.sheetSize]) {
    basePreset = SHEET_PRESETS[customConfig.sheetSize];
  }

  const config = {
    ...basePreset,
    ...customConfig,
  };

  const sheetWidth = Number((config.sheetWidthInches * PT_PER_INCH).toFixed(2));
  const sheetHeight = Number((config.sheetHeightInches * PT_PER_INCH).toFixed(2));
  const labelWidth = Number((config.labelWidthInches * PT_PER_INCH).toFixed(2));
  const labelHeight = Number((config.labelHeightInches * PT_PER_INCH).toFixed(2));

  const cols = parseInt(config.columns, 10);
  const rows = parseInt(config.rows, 10);
  const labelsPerSheet = cols * rows;

  const leftMargin = Number((config.marginHorizontalInches * PT_PER_INCH).toFixed(2));
  const rightMargin = Number((config.marginHorizontalInches * PT_PER_INCH).toFixed(2));
  const topMargin = Number((config.marginVerticalInches * PT_PER_INCH).toFixed(2));
  const bottomMargin = Number((config.marginVerticalInches * PT_PER_INCH).toFixed(2));

  // Available space for gutters
  const totalLabelsWidth = cols * labelWidth;
  const totalLabelsHeight = rows * labelHeight;

  const availWidthForGutters = sheetWidth - (leftMargin + rightMargin + totalLabelsWidth);
  const availHeightForGutters = sheetHeight - (topMargin + bottomMargin + totalLabelsHeight);

  if (availWidthForGutters < -0.1) {
    throw new Error(
      `Layout Overflow: Label columns (${cols} × ${labelWidth}pt) plus margins exceed sheet width (${sheetWidth}pt) by ${Math.abs(availWidthForGutters).toFixed(1)}pt.`
    );
  }

  if (availHeightForGutters < -0.1) {
    throw new Error(
      `Layout Overflow: Label rows (${rows} × ${labelHeight}pt) plus margins exceed sheet height (${sheetHeight}pt) by ${Math.abs(availHeightForGutters).toFixed(1)}pt.`
    );
  }

  // Inter-label gutters
  const colGutter = cols > 1 ? Math.max(0, availWidthForGutters / (cols - 1)) : 0;
  const rowGutter = rows > 1 ? Math.max(0, availHeightForGutters / (rows - 1)) : 0;

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
    presetId: config.id || 'custom',
    presetName: config.name || 'Custom Layout',
    sheetWidth,
    sheetHeight,
    sheetWidthInches: config.sheetWidthInches,
    sheetHeightInches: config.sheetHeightInches,
    labelWidth,
    labelHeight,
    labelWidthInches: config.labelWidthInches,
    labelHeightInches: config.labelHeightInches,
    cols,
    rows,
    labelsPerSheet,
    leftMargin,
    rightMargin,
    topMargin,
    bottomMargin,
    marginHorizontalInches: config.marginHorizontalInches,
    marginVerticalInches: config.marginVerticalInches,
    colGutter: Number(colGutter.toFixed(2)),
    rowGutter: Number(rowGutter.toFixed(2)),
    colGutterMm: Number((colGutter / MM_TO_PT).toFixed(2)),
    rowGutterMm: Number((rowGutter / MM_TO_PT).toFixed(2)),
    positions,
  };
}
