import bwipjs from 'bwip-js';

/**
 * Generate a high-resolution Code 128 barcode buffer
 * 
 * @param {string} text - Serial number / barcode value (e.g. "0020231501")
 * @param {object} options - Custom generation parameters
 * @returns {Promise<Buffer>} - PNG buffer of the barcode
 */
export async function generateBarcodeBuffer(text, options = {}) {
  if (!text || typeof text !== 'string') {
    throw new Error('Barcode text must be a non-empty string');
  }

  const {
    bcid = 'code128',
    scale = 3,          // high resolution for print sharpness
    height = 10,        // bar height in mm
    includetext = false,// we render high-precision vector text directly in PDFKit
    textxalign = 'center',
    backgroundcolor = 'ffffff',
    paddingwidth = 0,
    paddingheight = 0,
  } = options;

  return new Promise((resolve, reject) => {
    bwipjs.toBuffer(
      {
        bcid,
        text,
        scale,
        height,
        includetext,
        textxalign,
        backgroundcolor,
        paddingwidth,
        paddingheight,
      },
      (err, png) => {
        if (err) {
          return reject(new Error(`Failed to generate barcode for "${text}": ${err.message}`));
        }
        resolve(png);
      }
    );
  });
}

/**
 * Generate a series of unique serial numbers preserving leading zeros
 * 
 * @param {string} startSerial - e.g. "0020231501"
 * @param {number} count - e.g. 5000
 * @param {string} prefix - e.g. "VS" (optional prefix handling)
 * @returns {Array<string>} - Array of serial number strings
 */
export function generateSerialNumbers(startSerial, count, prefix = '') {
  const cleanStart = String(startSerial).trim();
  const length = cleanStart.length;

  // Extract numeric portion and any embedded prefix
  const match = cleanStart.match(/^([A-Za-z_-]*)(\d+)$/);
  if (!match) {
    throw new Error(`Invalid starting serial number format: "${startSerial}". Must end with digits.`);
  }

  const extractedPrefix = match[1] || '';
  const numStr = match[2];
  const totalDigits = numStr.length;
  let currentNum = BigInt(numStr);

  const serials = [];
  for (let i = 0; i < count; i++) {
    const padded = currentNum.toString().padStart(totalDigits, '0');
    serials.push(`${extractedPrefix}${padded}`);
    currentNum++;
  }

  return serials;
}

/**
 * Format serial number with user prefix
 */
export function formatFullCardCode(prefix, serial) {
  const cleanPrefix = (prefix || '').trim();
  if (!cleanPrefix) return serial;
  return `${cleanPrefix}-${serial}`;
}
