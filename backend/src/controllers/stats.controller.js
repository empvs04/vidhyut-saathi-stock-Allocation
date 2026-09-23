import { DataStore } from '../services/dataStore.js';

export async function getDashboardStats(req, res) {
  try {
    const stats = await DataStore.getStats();
    return res.status(200).json({
      success: true,
      stats,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
}
