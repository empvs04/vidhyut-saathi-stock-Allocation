import { DataStore } from '../services/dataStore.js';

export async function getTemplates(req, res) {
  try {
    const templates = await DataStore.getTemplates();
    return res.status(200).json({
      success: true,
      templates,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
}

export async function updateTemplate(req, res) {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const template = await DataStore.updateTemplate(id, updateData);
    if (!template) {
      return res.status(404).json({ success: false, message: 'Template not found' });
    }

    return res.status(200).json({
      success: true,
      template,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
}
