import mongoose from 'mongoose';

const labelTemplateSchema = new mongoose.Schema(
  {
    templateName: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      default: 'Official Vidhyut Saathi 10-Year Saver Card Label',
    },
    artworkAsset: {
      type: String,
      required: true,
    },
    cleanArtworkAsset: {
      type: String,
      required: true,
    },
    artworkVersion: {
      type: String,
      default: '1.0',
    },
    // Dimensions in physical inches and points
    labelWidthInches: {
      type: Number,
      default: 2.0,
    },
    labelHeightInches: {
      type: Number,
      default: 1.5,
    },
    labelWidthPt: {
      type: Number,
      default: 144, // 2 * 72
    },
    labelHeightPt: {
      type: Number,
      default: 108, // 1.5 * 72
    },
    // Coordinates within the label (proportional ratios from 0.0 to 1.0)
    barcodeBox: {
      xRatio: { type: Number, default: 0.09 }, // starts at ~9% of label width
      yRatio: { type: Number, default: 0.61 }, // starts at ~61% of label height
      widthRatio: { type: Number, default: 0.82 }, // spans ~82% of label width
      heightRatio: { type: Number, default: 0.17 }, // bars height
    },
    serialBox: {
      xRatio: { type: Number, default: 0.50 }, // centered
      yRatio: { type: Number, default: 0.80 }, // below barcode bars
      fontSizePt: { type: Number, default: 7.5 },
      fontColor: { type: String, default: '#000000' },
      letterSpacing: { type: Number, default: 1.2 },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export const LabelTemplate = mongoose.model('LabelTemplate', labelTemplateSchema);
