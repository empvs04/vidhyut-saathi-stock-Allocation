import express from 'express';
import {
  validateRange,
  validateImportedSerials,
  createBatch,
  getBatches,
  getBatchById,
  downloadPdf,
  previewPdf,
  deleteBatch,
} from '../controllers/batch.controller.js';

const router = express.Router();

router.post('/validate-range', validateRange);
router.post('/validate-serials', validateImportedSerials);
router.post('/generate', createBatch);
router.get('/', getBatches);
router.get('/:id', getBatchById);
router.get('/:id/download', downloadPdf);
router.get('/:id/preview', previewPdf);
router.delete('/:id', deleteBatch);

export default router;
