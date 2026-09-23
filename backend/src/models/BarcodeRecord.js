import mongoose from 'mongoose';

const barcodeRecordSchema = new mongoose.Schema(
  {
    batchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BarcodeBatch',
      required: true,
      index: true,
    },
    serialNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    barcodeValue: {
      type: String,
      required: true,
      trim: true,
    },
    cardSeries: {
      type: String,
      required: true,
      default: 'VS',
    },
    numericIndex: {
      type: Number,
      required: true,
    },
    pageNumber: {
      type: Number,
      required: true,
    },
    positionIndex: {
      type: Number, // 0 to 54 within the page
      required: true,
    },
    column: {
      type: Number, // 0 to 4
    },
    row: {
      type: Number, // 0 to 10
    },
    status: {
      type: String,
      enum: ['generated', 'printed', 'allocated', 'active', 'revoked'],
      default: 'generated',
      index: true,
    },
    verifiedScannable: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for fast queries by batch and serial
barcodeRecordSchema.index({ batchId: 1, numericIndex: 1 });

export const BarcodeRecord = mongoose.model('BarcodeRecord', barcodeRecordSchema);
