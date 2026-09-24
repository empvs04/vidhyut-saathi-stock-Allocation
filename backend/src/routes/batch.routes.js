import express from 'express';
import {
  getSheetPresets,
  validateRange,
  validateImportedSerials,
  createBatch,
  getBatches,
  getBatchById,
  downloadPdf,
  previewPdf,
  deleteBatch,
  getNextSerial,
  getCalibrationTestPdf,
  getSingleLabelPdf,
} from '../controllers/batch.controller.js';

const router = express.Router();

router.get('/sheet-presets', getSheetPresets);
router.get('/next-serial', getNextSerial);
router.get('/calibration-test', getCalibrationTestPdf);
router.get('/single-label/:serial', getSingleLabelPdf);
router.post('/validate-range', validateRange);
router.post('/validate-serials', validateImportedSerials);
router.post('/generate', createBatch);
router.get('/', getBatches);
router.get('/:id', getBatchById);
router.get('/:id/download', downloadPdf);
router.get('/:id/preview', previewPdf);
router.delete('/:id', deleteBatch);

export default router;

