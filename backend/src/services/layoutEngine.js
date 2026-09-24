/**
 * Layout Calculation Engine for Vidhyut Saathi Barcode Sheets
 * 
 * Supports 4 Standardized Sheet Formats:
 * 1. 12 × 18 inch (Default) — 55 Labels (5 cols × 11 rows, 2" × 1.5" labels)
 * 2. A4 — 2 × 1.5 inch Labels — 21 Labels (3 cols × 7 rows, 2" × 1.5" labels, 2 mm gaps)
 * 3. 12 × 18 inch — 2 × 1.5 inch Labels — 55 Labels (5 cols × 11 rows, 2" × 1.5" labels, 2 mm gaps)
 * 4. A3 — Custom Layout (Configurable cols, rows, dimensions, margins & gaps with validation)
 */

export const PT_PER_INCH = 72;
export const MM_TO_PT = 72 / 25.4; // ~2.83464567 pt per mm
export const DEFAULT_CUTTING_GAP_MM = 2.0;
export const DEFAULT_CUTTING_GAP_PT = Number((DEFAULT_CUTTING_GAP_MM * MM_TO_PT).toFixed(3)); // 5.669 pt

export const SHEET_PRESETS = {
  '12x18_default': {
    id: '12x18_default',
    name: '12 × 18 inch (Default)',
    displayName: '12 × 18 inch (Default) — 55 Labels',
    sheetWidthInches: 12.0,
    sheetHeightInches: 18.0,
    sheetWidthPt: 864,
    sheetHeightPt: 1296,
    labelWidthInches: 2.0,
    labelHeightInches: 1.5,
    columns: 5,
    rows: 11,
    labelsPerSheet: 55,
    marginHorizontalInches: 0.4,
    marginVerticalInches: 0.3,
    gapHorizontalMm: 2.0,
    gapVerticalMm: 2.0,
    isCustom: false,
    description: 'Commercial 12" × 18" Press (5 cols × 11 rows = 55 labels, 2" × 1.5")',
  },
  'a4_2x1_5': {
    id: 'a4_2x1_5',
    name: 'A4 — 2 × 1.5 inch Labels — 21 Labels',
    displayName: 'A4 — 2 × 1.5 inch Labels — 21 Labels',
    sheetWidthInches: 8.2677, // 210 mm
    sheetHeightInches: 11.6929, // 297 mm
    sheetWidthPt: 595.28,
    sheetHeightPt: 841.89,
    labelWidthInches: 2.0,    // MUST be exactly 2.00 inches = 144 pt
    labelHeightInches: 1.5,  // MUST be exactly 1.50 inches = 108 pt
    columns: 3,
    rows: 7,
    labelsPerSheet: 21,
    marginHorizontalInches: 0.4,  // 0.4" = 28.8 pt each side
    marginVerticalInches: 0.3,   // 0.3" = 21.6 pt each side
    gapHorizontalMm: 2.0,  // 2 mm cutting gap
    gapVerticalMm: 2.0,    // 2 mm cutting gap
    isCustom: false,
    // Verified layout math:
    // W = 28.8 + (3×144) + (2×5.669) + 28.8 = 500.94 pt < 595.28 ✓
    // H = 21.6 + (7×108) + (6×5.669) + 21.6 = 833.21 pt < 841.89 ✓
    // Label size: 144×108 pt = 2.000×1.500 inches EXACT
    description: 'A4 Paper (210 × 297 mm, 3 cols × 7 rows = 21 labels, 0.4"/0.3" margins, 2 mm cutting gap)',
  },
  '12x18_2x1_5': {
    id: '12x18_2x1_5',
    name: '12 × 18 inch — 2 × 1.5 inch Labels — 55 Labels',
    displayName: '12 × 18 inch — 2 × 1.5 inch Labels — 55 Labels',
    sheetWidthInches: 12.0,
    sheetHeightInches: 18.0,
    sheetWidthPt: 864,
    sheetHeightPt: 1296,
    labelWidthInches: 2.0,
    labelHeightInches: 1.5,
    columns: 5,
    rows: 11,
    labelsPerSheet: 55,
    marginHorizontalInches: 0.4,
    marginVerticalInches: 0.3,
    gapHorizontalMm: 2.0,
    gapVerticalMm: 2.0,
    isCustom: false,
    description: '12" × 18" Sheet (5 cols × 11 rows = 55 labels, 2 mm cutting gap)',
  },
  'a3_custom': {
    id: 'a3_custom',
    name: 'A3 — Custom Layout',
    displayName: 'A3 — Custom Layout',
    sheetWidthInches: 11.6929, // 297 mm
    sheetHeightInches: 16.5354, // 420 mm
    sheetWidthPt: 841.89,
    sheetHeightPt: 1190.55,
    labelWidthInches: 2.0,
    labelHeightInches: 1.5,
    columns: 5,
    rows: 10,
    labelsPerSheet: 50,
    marginHorizontalInches: 0.45,
    marginVerticalInches: 0.40,
    gapHorizontalMm: 2.0,
    gapVerticalMm: 2.0,
    isCustom: true,
    description: 'A3 Sheet (297 × 420 mm) — Fully configurable grid & dimensions',
  },
};

export const DEFAULT_LAYOUT_CONFIG = SHEET_PRESETS['12x18_default'];

export function getSheetPresetsList() {
  return Object.values(SHEET_PRESETS);
}

/**
 * Calculate precise physical positions for all labels on a sheet.
 * Validates that all items fit without overflowing or scaling down labels.
 */
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

  const cols = parseInt(config.columns, 10) || 5;
  const rows = parseInt(config.rows, 10) || 11;
  const labelsPerSheet = cols * rows;

  // Margin in points
  const marginLeft = Number(((config.marginLeftInches ?? config.marginHorizontalInches ?? 0.4) * PT_PER_INCH).toFixed(2));
  const marginRight = Number(((config.marginRightInches ?? config.marginHorizontalInches ?? 0.4) * PT_PER_INCH).toFixed(2));
  const marginTop = Number(((config.marginTopInches ?? config.marginVerticalInches ?? 0.3) * PT_PER_INCH).toFixed(2));
  const marginBottom = Number(((config.marginBottomInches ?? config.marginVerticalInches ?? 0.3) * PT_PER_INCH).toFixed(2));

  // Gaps in points
  let horizontalGapPt;
  if (config.gapHorizontalPt !== undefined) {
    horizontalGapPt = Number(config.gapHorizontalPt);
  } else if (config.gapHorizontalMm !== undefined) {
    horizontalGapPt = Number((config.gapHorizontalMm * MM_TO_PT).toFixed(2));
  } else if (config.horizontalGap !== undefined) {
    horizontalGapPt = Number(config.horizontalGap);
  } else {
    horizontalGapPt = DEFAULT_CUTTING_GAP_PT;
  }

  let verticalGapPt;
  if (config.gapVerticalPt !== undefined) {
    verticalGapPt = Number(config.gapVerticalPt);
  } else if (config.gapVerticalMm !== undefined) {
    verticalGapPt = Number((config.gapVerticalMm * MM_TO_PT).toFixed(2));
  } else if (config.verticalGap !== undefined) {
    verticalGapPt = Number(config.verticalGap);
  } else {
    verticalGapPt = DEFAULT_CUTTING_GAP_PT;
  }

  // Calculate required dimensions according to engineering specifications:
  // requiredWidth = marginLeft + (columns * labelWidth) + ((columns - 1) * horizontalGap) + marginRight
  // requiredHeight = marginTop + (rows * labelHeight) + ((rows - 1) * verticalGap) + marginBottom
  const totalLabelsWidth = cols * labelWidth;
  const totalGapsWidth = (cols - 1) * horizontalGapPt;
  const totalLabelsHeight = rows * labelHeight;
  const totalGapsHeight = (rows - 1) * verticalGapPt;

  let requiredWidth = marginLeft + totalLabelsWidth + totalGapsWidth + marginRight;
  let requiredHeight = marginTop + totalLabelsHeight + totalGapsHeight + marginBottom;

  // If fixed margins were provided that exceed the sheet, check if standard centering fits
  if (requiredWidth > sheetWidth + 0.1 || requiredHeight > sheetHeight + 0.1) {
    // If user didn't specify strict custom margins, compute auto-centered margins for standard presets
    const rawContentW = totalLabelsWidth + totalGapsWidth;
    const rawContentH = totalLabelsHeight + totalGapsHeight;
    
    if (rawContentW <= sheetWidth && rawContentH <= sheetHeight && !config.strictMargins) {
      // Auto-center on sheet
      const autoMarginX = (sheetWidth - rawContentW) / 2;
      const autoMarginY = (sheetHeight - rawContentH) / 2;
      return buildPositions({
        ...config,
        sheetWidth,
        sheetHeight,
        labelWidth,
        labelHeight,
        cols,
        rows,
        labelsPerSheet,
        leftMargin: autoMarginX,
        rightMargin: autoMarginX,
        topMargin: autoMarginY,
        bottomMargin: autoMarginY,
        colGutter: horizontalGapPt,
        rowGutter: verticalGapPt,
        requiredWidth: sheetWidth,
        requiredHeight: sheetHeight,
      });
    }

    throw new Error(
      `Selected label dimensions, margins and gaps do not fit this sheet. Required: ${requiredWidth.toFixed(1)}pt (${(requiredWidth/72).toFixed(2)}") × ${requiredHeight.toFixed(1)}pt (${(requiredHeight/72).toFixed(2)}"), Sheet: ${sheetWidth.toFixed(1)}pt (${(sheetWidth/72).toFixed(2)}") × ${sheetHeight.toFixed(1)}pt (${(sheetHeight/72).toFixed(2)}").`
    );
  }

  // Use the exact configured margins from the preset — do NOT auto-center/override them.
  // Auto-centering was causing margins to balloon (e.g., 0.4" → 1.055"), which causes
  // PDF viewers/printers to scale the page and distort physical label dimensions.
  // The preset margins are calibrated to produce physically correct 2"×1.5" labels.
  const actualLeftMargin = marginLeft;
  const actualTopMargin = marginTop;

  return buildPositions({
    ...config,
    sheetWidth,
    sheetHeight,
    labelWidth,
    labelHeight,
    cols,
    rows,
    labelsPerSheet,
    leftMargin: actualLeftMargin,
    rightMargin: marginRight,
    topMargin: actualTopMargin,
    bottomMargin: marginBottom,
    colGutter: horizontalGapPt,
    rowGutter: verticalGapPt,
    requiredWidth,
    requiredHeight,
  });
}

function buildPositions(params) {
  const {
    presetId = 'custom',
    name = 'Layout',
    sheetWidth,
    sheetHeight,
    sheetWidthInches,
    sheetHeightInches,
    labelWidth,
    labelHeight,
    labelWidthInches,
    labelHeightInches,
    cols,
    rows,
    labelsPerSheet,
    leftMargin,
    rightMargin,
    topMargin,
    bottomMargin,
    colGutter,
    rowGutter,
  } = params;

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
    presetId: params.id || presetId,
    presetName: params.displayName || name,
    sheetWidth,
    sheetHeight,
    sheetWidthInches,
    sheetHeightInches,
    labelWidth,
    labelHeight,
    labelWidthInches,
    labelHeightInches,
    cols,
    rows,
    labelsPerSheet,
    leftMargin: Number(leftMargin.toFixed(2)),
    rightMargin: Number(rightMargin.toFixed(2)),
    topMargin: Number(topMargin.toFixed(2)),
    bottomMargin: Number(bottomMargin.toFixed(2)),
    marginHorizontalInches: Number((leftMargin / PT_PER_INCH).toFixed(3)),
    marginVerticalInches: Number((topMargin / PT_PER_INCH).toFixed(3)),
    colGutter: Number(colGutter.toFixed(2)),
    rowGutter: Number(rowGutter.toFixed(2)),
    colGutterMm: Number((colGutter / MM_TO_PT).toFixed(2)),
    rowGutterMm: Number((rowGutter / MM_TO_PT).toFixed(2)),
    positions,
  };
}

