import express from 'express';
import {
  getRecords,
  verifyScan,
  downloadSingleLabelPdf,
  previewSingleLabelPdf,
  registerSingleLabel,
} from '../controllers/record.controller.js';

const router = express.Router();

router.get('/', getRecords);
router.post('/verify-scan', verifyScan);
router.get('/single-pdf', downloadSingleLabelPdf);
router.get('/single-preview', previewSingleLabelPdf);
router.post('/single-label', registerSingleLabel);

export default router;
