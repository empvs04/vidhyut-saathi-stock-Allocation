import { MultiFormatReader, BarcodeFormat, DecodeHintType, RGBLuminanceSource, BinaryBitmap, HybridBinarizer } from '@zxing/library';
import sharp from 'sharp';

/**
 * Scan and decode a barcode from an image Buffer
 * 
 * @param {Buffer} imageBuffer - PNG/JPEG buffer of the barcode or label
 * @returns {Promise<{ scannable: boolean, text: string, format: string }>}
 */
export async function verifyBarcodeScan(imageBuffer) {
  try {
    const image = sharp(imageBuffer);
    const { data, info } = await image.raw().ensureAlpha().toBuffer({ resolveWithObject: true });

    // Convert RGBA buffer to luminances
    const luminances = new Uint8ClampedArray(info.width * info.height);
    for (let i = 0; i < luminances.length; i++) {
      const offset = i * 4;
      // Standard luminance formula
      luminances[i] = (data[offset] * 299 + data[offset + 1] * 587 + data[offset + 2] * 114) / 1000;
    }

    const luminanceSource = new RGBLuminanceSource(luminances, info.width, info.height);
    const binaryBitmap = new BinaryBitmap(new HybridBinarizer(luminanceSource));

    const hints = new Map();
    hints.set(DecodeHintType.POSSIBLE_FORMATS, [
      BarcodeFormat.CODE_128,
      BarcodeFormat.CODE_39,
      BarcodeFormat.EAN_13,
      BarcodeFormat.QR_CODE,
    ]);
    hints.set(DecodeHintType.TRY_HARDER, true);

    const reader = new MultiFormatReader();
    reader.setHints(hints);

    const result = reader.decode(binaryBitmap);
    return {
      scannable: true,
      text: result.getText(),
      format: result.getBarcodeFormat().toString(),
    };
  } catch (err) {
    return {
      scannable: false,
      text: null,
      error: err.message,
    };
  }
}
