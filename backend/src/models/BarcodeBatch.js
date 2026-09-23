import mongoose from 'mongoose';

const barcodeBatchSchema = new mongoose.Schema(
  {
    batchId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    batchName: {
      type: String,
      required: true,
      trim: true,
    },
    cardSeries: {
      type: String,
      required: true,
      default: 'VS',
      uppercase: true,
      trim: true,
    },
    startSerialNumber: {
      type: String,
      required: true,
      trim: true,
    },
    endSerialNumber: {
      type: String,
      required: true,
      trim: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    barcodeType: {
      type: String,
      required: true,
      default: 'CODE128',
      enum: ['CODE128', 'CODE39', 'EAN13', 'QR'],
    },
    templateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LabelTemplate',
    },
    sheetWidth: {
      type: Number,
      default: 864, // 12 inches * 72 pt/in
    },
    sheetHeight: {
      type: Number,
      default: 1296, // 18 inches * 72 pt/in
    },
    labelWidth: {
      type: Number,
      default: 144, // 2 inches * 72 pt/in
    },
    labelHeight: {
      type: Number,
      default: 108, // 1.5 inches * 72 pt/in
    },
    columns: {
      type: Number,
      default: 5,
    },
    rows: {
      type: Number,
      default: 11,
    },
    labelsPerSheet: {
      type: Number,
      default: 55,
    },
    totalPages: {
      type: Number,
      required: true,
    },
    pdfFilePath: {
      type: String,
      required: true,
    },
    pdfFileSize: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending',
      index: true,
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    errorMessage: {
      type: String,
    },
    createdBy: {
      type: String,
      default: 'Admin',
    },
  },
  {
    timestamps: true,
  }
);

export const BarcodeBatch = mongoose.model('BarcodeBatch', barcodeBatchSchema);
