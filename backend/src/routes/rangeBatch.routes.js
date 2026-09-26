import express from 'express';
import {
  getRangeSheetPresets,
  calculateRangeLayout,
  getNextRangeSerial,
  createRangeBatch,
  getRangeBatches,
  getRangeBatchById,
  downloadRangePdf,
  previewRangePdf,
  getSingleRangeLabelPdf,
} from '../controllers/rangeBatch.controller.js';

const router = express.Router();

router.get('/presets', getRangeSheetPresets);
router.get('/next-serial', getNextRangeSerial);
router.get('/single-label-pdf', getSingleRangeLabelPdf);
router.post('/calculate-layout', calculateRangeLayout);
router.post('/generate', createRangeBatch);
router.get('/', getRangeBatches);
router.get('/:id', getRangeBatchById);
router.get('/:id/download', downloadRangePdf);
router.get('/:id/preview', previewRangePdf);

export default router;
