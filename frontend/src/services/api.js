import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const BatchesAPI = {
  validateRange: (data) => api.post('/batches/validate-range', data),
  validateSerials: (data) => api.post('/batches/validate-serials', data),
  generateBatch: (data) => api.post('/batches/generate', data),
  getBatches: (params) => api.get('/batches', { params }),
  getBatchById: (id) => api.get(`/batches/${id}`),
  deleteBatch: (id) => api.delete(`/batches/${id}`),
  getPdfDownloadUrl: (id) => `/api/batches/${id}/download`,
  getPdfPreviewUrl: (id) => `/api/batches/${id}/preview`,
};

export const RecordsAPI = {
  getRecords: (params) => api.get('/records', { params }),
  verifyScan: (data) => api.post('/records/verify-scan', data),
  registerSingleLabel: (data) => api.post('/records/single-label', data),
  getSingleLabelPdfUrl: (serial, series = 'VS') => `/api/records/single-pdf?serial=${encodeURIComponent(serial)}&series=${encodeURIComponent(series)}`,
  getSingleLabelPreviewUrl: (serial, series = 'VS') => `/api/records/single-preview?serial=${encodeURIComponent(serial)}&series=${encodeURIComponent(series)}`,
};

export const TemplatesAPI = {
  getTemplates: () => api.get('/templates'),
  updateTemplate: (id, data) => api.put(`/templates/${id}`, data),
};

export const StatsAPI = {
  getDashboardStats: () => api.get('/stats'),
  getHealth: () => api.get('/health'),
};

export default api;
