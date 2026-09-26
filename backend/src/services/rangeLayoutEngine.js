/**
 * Range Layout Engine for 10-Serial Range Label System
 * 
 * Completely separate from single-serial layoutEngine.js.
 * Implements 3:2 aspect ratio labels, true-scale PDF positioning,
 * and automatic grid calculation for 12x18 and custom sheets.
 */

export const PT_PER_INCH = 72;
export const MM_TO_PT = 72 / 25.4; // ~2.83464567 pt per mm

export const RANGE_SHEET_PRESETS = {
  '12x18_range_44': {
    id: '12x18_range_44',
    name: '12 × 18 inch — 44 Range Labels (2.25" × 1.5")',
    displayName: '12 × 18 inch — 44 Labels (4 cols × 11 rows)',
    sheetWidthInches: 12.0,
    sheetHeightInches: 18.0,
    sheetWidthPt: 864,
    sheetHeightPt: 1296,
    labelWidthInches: 2.25,
    labelHeightInches: 1.50,
    labelWidthPt: 162,
    labelHeightPt: 108,
    columns: 4,
    rows: 11,
    labelsPerSheet: 44,
    marginLeftInches: 0.4,
    marginRightInches: 0.4,
    marginTopInches: 0.3,
    marginBottomInches: 0.3,
    gapHorizontalMm: 2.0,
    gapVerticalMm: 2.0,
    gapHorizontalPt: Number((2.0 * MM_TO_PT).toFixed(3)),
    gapVerticalPt: Number((2.0 * MM_TO_PT).toFixed(3)),
    aspectRatio: '3:2',
    description: '12" × 18" Press Sheet: 4 cols × 11 rows = 44 labels, 2.25" × 1.5" (3:2 ratio), 2 mm gap',
  },
  '12x18_range_60': {
    id: '12x18_range_60',
    name: '12 × 18 inch — 60 Range Labels (2.0" × 1.333")',
    displayName: '12 × 18 inch — 60 Labels (5 cols × 12 rows)',
    sheetWidthInches: 12.0,
    sheetHeightInches: 18.0,
    sheetWidthPt: 864,
    sheetHeightPt: 1296,
    labelWidthInches: 2.0,
    labelHeightInches: 1.333333,
    labelWidthPt: 144,
    labelHeightPt: 96,
    columns: 5,
    rows: 12,
    labelsPerSheet: 60,
    marginLeftInches: 0.4,
    marginRightInches: 0.4,
    marginTopInches: 0.3,
    marginBottomInches: 0.3,
    gapHorizontalMm: 2.0,
    gapVerticalMm: 2.0,
    gapHorizontalPt: Number((2.0 * MM_TO_PT).toFixed(3)),
    gapVerticalPt: Number((2.0 * MM_TO_PT).toFixed(3)),
    aspectRatio: '3:2',
    description: '12" × 18" Press Sheet: 5 cols × 12 rows = 60 labels, 2.0" × 1.333" (3:2 ratio), 2 mm gap',
  },
  'a4_range_18': {
    id: 'a4_range_18',
    name: 'A4 — 18 Range Labels (2.25" × 1.5")',
    displayName: 'A4 — 18 Labels (3 cols × 6 rows)',
    sheetWidthInches: 8.2677,
    sheetHeightInches: 11.6929,
    sheetWidthPt: 595.28,
    sheetHeightPt: 841.89,
    labelWidthInches: 2.25,
    labelHeightInches: 1.50,
    labelWidthPt: 162,
    labelHeightPt: 108,
    columns: 3,
    rows: 6,
    labelsPerSheet: 18,
    marginLeftInches: 0.4,
    marginRightInches: 0.4,
    marginTopInches: 0.3,
    marginBottomInches: 0.3,
    gapHorizontalMm: 2.0,
    gapVerticalMm: 2.0,
    gapHorizontalPt: Number((2.0 * MM_TO_PT).toFixed(3)),
    gapVerticalPt: Number((2.0 * MM_TO_PT).toFixed(3)),
    aspectRatio: '3:2',
    description: 'A4 Sheet: 3 cols × 6 rows = 18 labels, 2.25" × 1.5" (3:2 ratio), 2 mm gap',
  },
};

/**
 * Automatically calculate grid layout for 3:2 labels on a sheet
 */
export function calculateRangeAutoLayout(config = {}) {
  const sheetWidthInches = config.sheetWidthInches || 12.0;
  const sheetHeightInches = config.sheetHeightInches || 18.0;
  const marginLeftInches = config.marginLeftInches !== undefined ? config.marginLeftInches : 0.4;
  const marginRightInches = config.marginRightInches !== undefined ? config.marginRightInches : 0.4;
  const marginTopInches = config.marginTopInches !== undefined ? config.marginTopInches : 0.3;
  const marginBottomInches = config.marginBottomInches !== undefined ? config.marginBottomInches : 0.3;
  const gapMm = config.gapMm !== undefined ? config.gapMm : 2.0;

  const sheetWidthPt = sheetWidthInches * PT_PER_INCH;
  const sheetHeightPt = sheetHeightInches * PT_PER_INCH;
  const marginLeftPt = marginLeftInches * PT_PER_INCH;
  const marginRightPt = marginRightInches * PT_PER_INCH;
  const marginTopPt = marginTopInches * PT_PER_INCH;
  const marginBottomPt = marginBottomInches * PT_PER_INCH;
  const gapPt = gapMm * MM_TO_PT;

  const availWidthPt = sheetWidthPt - marginLeftPt - marginRightPt;
  const availHeightPt = sheetHeightPt - marginTopPt - marginBottomPt;

  // If label width & height are specified:
  let labelWidthPt = config.labelWidthInches ? config.labelWidthInches * PT_PER_INCH : 162; // 2.25" default
  let labelHeightPt = config.labelHeightInches ? config.labelHeightInches * PT_PER_INCH : 108; // 1.50" default

  // Maintain strict 3:2 ratio: width = 1.5 * height
  if (config.labelWidthInches && !config.labelHeightInches) {
    labelHeightPt = labelWidthPt / 1.5;
  } else if (!config.labelWidthInches && config.labelHeightInches) {
    labelWidthPt = labelHeightPt * 1.5;
  }

  // Calculate maximum columns and rows
  const columns = Math.floor((availWidthPt + gapPt) / (labelWidthPt + gapPt));
  const rows = Math.floor((availHeightPt + gapPt) / (labelHeightPt + gapPt));
  const labelsPerSheet = columns * rows;

  // Center grid within available area
  const totalGridWidth = columns * labelWidthPt + (columns - 1) * gapPt;
  const totalGridHeight = rows * labelHeightPt + (rows - 1) * gapPt;
  const offsetX = marginLeftPt + (availWidthPt - totalGridWidth) / 2;
  const offsetY = marginTopPt + (availHeightPt - totalGridHeight) / 2;

  // Compute all label cell positions (x, y)
  const positions = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < columns; c++) {
      positions.push({
        index: r * columns + c,
        row: r,
        col: c,
        x: Number((offsetX + c * (labelWidthPt + gapPt)).toFixed(3)),
        y: Number((offsetY + r * (labelHeightPt + gapPt)).toFixed(3)),
        width: Number(labelWidthPt.toFixed(3)),
        height: Number(labelHeightPt.toFixed(3)),
      });
    }
  }

  return {
    sheetWidthInches,
    sheetHeightInches,
    sheetWidthPt,
    sheetHeightPt,
    labelWidthInches: Number((labelWidthPt / PT_PER_INCH).toFixed(3)),
    labelHeightInches: Number((labelHeightPt / PT_PER_INCH).toFixed(3)),
    labelWidthPt,
    labelHeightPt,
    columns,
    rows,
    labelsPerSheet,
    totalGridWidth,
    totalGridHeight,
    marginLeftPt,
    marginTopPt,
    gapPt,
    gapMm,
    positions,
  };
}
