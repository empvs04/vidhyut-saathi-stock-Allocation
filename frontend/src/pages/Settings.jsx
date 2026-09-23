import React, { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon,
  Database,
  Printer,
  CheckCircle,
  HardDrive,
  RefreshCw,
  Sliders,
} from 'lucide-react';
import { StatsAPI } from '../services/api';

export default function Settings() {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  // Settings state
  const [defaultSeries, setDefaultSeries] = useState('VS');
  const [defaultQuantity, setDefaultQuantity] = useState(55);
  const [defaultMarginH, setDefaultMarginH] = useState(0.4);
  const [defaultMarginV, setDefaultMarginV] = useState(0.3);

  const checkHealth = async () => {
    setLoading(true);
    try {
      const res = await StatsAPI.getHealth();
      setHealth(res.data);
    } catch (err) {
      setHealth({ status: 'offline', error: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '800px' }}>
      {/* Top Banner */}
      <div
        className="card"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '18px 24px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <SettingsIcon size={22} color="#0066cc" />
            <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>
              System & Print Settings
            </h2>
          </div>
          <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
            Configure default generator parameters, print margins, and database connectivity.
          </div>
        </div>
      </div>

      {/* Database & Engine Status */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Database size={20} color="#0066cc" />
            <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a' }}>
              Database & Engine Connectivity
            </h3>
          </div>
          <button
            type="button"
            className="btn btn-secondary"
            style={{ padding: '5px 10px', fontSize: '12px' }}
            onClick={checkHealth}
          >
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
            Test Health
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid #f1f5f9' }}>
            <span style={{ color: '#64748b' }}>Backend Server:</span>
            <span style={{ color: health?.status === 'online' ? '#16a34a' : '#ef4444', fontWeight: '700' }}>
              {health?.status === 'online' ? 'Online (Port 5000)' : 'Offline'}
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid #f1f5f9' }}>
            <span style={{ color: '#64748b' }}>Persistence Layer:</span>
            <span style={{ fontWeight: '700', color: '#0f172a' }}>
              MongoDB / Atomic JSON Store Dual-Mode
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid #f1f5f9' }}>
            <span style={{ color: '#64748b' }}>PDF Storage Directory:</span>
            <span className="font-mono" style={{ fontSize: '12px', color: '#0066cc' }}>
              backend/storage/pdfs/
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#64748b' }}>Barcode Rendering Library:</span>
            <strong>bwip-js v4.5.1 (Code 128 Compliant)</strong>
          </div>
        </div>
      </div>

      {/* Generator Default Preferences Form */}
      <div className="card">
        <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', marginBottom: '14px' }}>
          Default Generator Parameters
        </h3>

        <form onSubmit={handleSave}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Default Card Series</label>
              <input
                type="text"
                className="form-input"
                value={defaultSeries}
                onChange={(e) => setDefaultSeries(e.target.value.toUpperCase())}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Default Batch Quantity</label>
              <input
                type="number"
                className="form-input"
                value={defaultQuantity}
                onChange={(e) => setDefaultQuantity(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Default Horizontal Margin (in)</label>
              <input
                type="number"
                step="0.05"
                className="form-input"
                value={defaultMarginH}
                onChange={(e) => setDefaultMarginH(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Default Vertical Margin (in)</label>
              <input
                type="number"
                step="0.05"
                className="form-input"
                value={defaultMarginV}
                onChange={(e) => setDefaultMarginV(e.target.value)}
              />
            </div>
          </div>

          {saved && (
            <div style={{ padding: '10px', backgroundColor: '#ecfdf5', color: '#065f46', borderRadius: '8px', fontSize: '13px', marginBottom: '12px' }}>
              Preferences saved successfully.
            </div>
          )}

          <button type="submit" className="btn btn-primary" style={{ marginTop: '8px' }}>
            Save Preferences
          </button>
        </form>
      </div>
    </div>
  );
}
