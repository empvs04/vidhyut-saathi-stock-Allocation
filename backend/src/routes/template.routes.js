import express from 'express';
import { getTemplates, updateTemplate } from '../controllers/template.controller.js';

const router = express.Router();

router.get('/', getTemplates);
router.put('/:id', updateTemplate);

export default router;
