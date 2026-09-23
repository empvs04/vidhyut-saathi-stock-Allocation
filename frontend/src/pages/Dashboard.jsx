import React, { useState, useEffect } from 'react';
import {
  FileText,
  Barcode,
  Layers,
  HardDrive,
  Sparkles,
  ArrowRight,
  CheckCircle,
  Clock,
  Printer,
  ShieldCheck,
} from 'lucide-react';
import { StatsAPI } from '../services/api';
import CardPreview from '../components/CardPreview';

export default function Dashboard({ onNavigate, onPreviewBatch }) {
  const [stats, setStats] = useState({
    totalBatches: 0,
    totalLabelsGenerated: 0,
    totalSheetsPages: 0,
    totalStorageBytes: 0,
    totalActiveRecords: 0,
    activeTemplatesCount: 1,
    recentBatches: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    StatsAPI.getDashboardStats()
      .then((res) => {
        if (res.data.success) {
          setStats(res.data.stats);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const formatBytes = (bytes) => {
    if (!bytes) return '0 KB';
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    return `${(kb / 1024).toFixed(1)} MB`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0066cc 0%, #0284c7 100%)',
          borderRadius: '16px',
          padding: '28px 32px',
          color: '#ffffff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 10px 20px -5px rgba(0, 102, 204, 0.3)',
        }}
      >
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: 'rgba(255,255,255,0.18)', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '700', marginBottom: '10px' }}>
            <Sparkles size={14} />
            <span>Vidhyut Saathi Energy Savers Pvt. Ltd.</span>
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', letterSpacing: '-0.5px', marginBottom: '6px' }}>
            Barcode Generation & 12" × 18" PDF Sheet Management System
          </h1>
          <p style={{ fontSize: '14px', opacity: 0.9, maxWidth: '650px', lineHeight: '1.5' }}>
            Generate thousands of unique, scannable Code 128 barcode labels arranged in standard 55-label print sheets (5 cols × 11 rows) while preserving approved corporate card artwork.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            className="btn"
            style={{ backgroundColor: '#ffffff', color: '#0066cc', padding: '10px 18px', fontWeight: '700' }}
            onClick={() => onNavigate('generator')}
          >
            <Barcode size={18} />
            New Barcode Batch
          </button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '18px' }}>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '18px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#e0effe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FileText size={24} color="#0066cc" />
          </div>
          <div>
            <div style={{ fontSize: '12px', fontWeight: '600', color: '#64748b' }}>TOTAL BATCHES</div>
            <div style={{ fontSize: '22px', fontWeight: '800', color: '#0f172a' }}>{stats.totalBatches}</div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '18px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Barcode size={24} color="#10b981" />
          </div>
          <div>
            <div style={{ fontSize: '12px', fontWeight: '600', color: '#64748b' }}>LABELS GENERATED</div>
            <div style={{ fontSize: '22px', fontWeight: '800', color: '#0f172a' }}>{stats.totalLabelsGenerated.toLocaleString()}</div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '18px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Printer size={24} color="#f97316" />
          </div>
          <div>
            <div style={{ fontSize: '12px', fontWeight: '600', color: '#64748b' }}>SHEET PAGES (12"×18")</div>
            <div style={{ fontSize: '22px', fontWeight: '800', color: '#0f172a' }}>{stats.totalSheetsPages}</div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '18px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#f5f3ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <HardDrive size={24} color="#8b5cf6" />
          </div>
          <div>
            <div style={{ fontSize: '12px', fontWeight: '600', color: '#64748b' }}>PDF STORAGE USED</div>
            <div style={{ fontSize: '22px', fontWeight: '800', color: '#0f172a' }}>{formatBytes(stats.totalStorageBytes)}</div>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Recent Batches & Approved Label Artwork Preview */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '20px' }}>
        {/* Recent Batches Table */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>Recent Generated Batches</h3>
            <button
              className="btn btn-outline"
              style={{ fontSize: '12px', padding: '5px 10px' }}
              onClick={() => onNavigate('batches')}
            >
              View All Batches
              <ArrowRight size={14} />
            </button>
          </div>

          {stats.recentBatches.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '36px 0', color: '#94a3b8' }}>
              <Barcode size={36} style={{ margin: '0 auto 10px', opacity: 0.5 }} />
              <div>No batches generated yet. Click "New Barcode Batch" to start!</div>
            </div>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Batch Name</th>
                    <th>Series</th>
                    <th>Serials Range</th>
                    <th>Qty</th>
                    <th>Pages</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentBatches.map((b) => (
                    <tr key={b._id}>
                      <td>
                        <div style={{ fontWeight: '600', color: '#0f172a' }}>{b.batchName}</div>
                        <div style={{ fontSize: '11px', color: '#94a3b8' }}>{b.batchId}</div>
                      </td>
                      <td>
                        <span className="badge badge-primary">{b.cardSeries}</span>
                      </td>
                      <td className="font-mono" style={{ fontSize: '12px' }}>
                        {b.startSerialNumber.slice(-6)}...{b.endSerialNumber.slice(-6)}
                      </td>
                      <td style={{ fontWeight: '700' }}>{b.quantity}</td>
                      <td>{b.totalPages}</td>
                      <td>
                        <span className={`badge badge-${b.status === 'completed' ? 'success' : b.status === 'failed' ? 'danger' : 'warning'}`}>
                          {b.status}
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn btn-secondary"
                          style={{ padding: '4px 8px', fontSize: '12px' }}
                          onClick={() => onPreviewBatch(b)}
                        >
                          View PDF
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Approved Label Artwork Showcase */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div style={{ fontSize: '15px', fontWeight: '700', color: '#0f172a' }}>
                Approved Master Label Artwork
              </div>
              <span className="badge badge-success">
                <CheckCircle size={12} />
                Immutable Source
              </span>
            </div>
            <p style={{ fontSize: '12.5px', color: '#64748b', marginBottom: '14px' }}>
              Official 2" × 1.5" Vidhyut Saathi 10-Year Card Label design. All branding, MRP, and warranties remain preserved.
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', padding: '8px 0' }}>
              <CardPreview serialNumber="0020231501" width={320} showCropGuides />
            </div>
          </div>

          {/* Quick Specifications Checklist */}
          <div
            style={{
              marginTop: '16px',
              padding: '12px',
              backgroundColor: '#f8fafc',
              borderRadius: '10px',
              border: '1px solid #e2e8f0',
              fontSize: '12px',
              color: '#475569',
              lineHeight: '1.6',
            }}
          >
            <div style={{ fontWeight: '700', color: '#0f172a', marginBottom: '4px' }}>
              Print Specifications Summary:
            </div>
            <div>• <strong>Sheet Size:</strong> 12" × 18" (864 × 1296 pt)</div>
            <div>• <strong>Label Size:</strong> 2" × 1.5" (144 × 108 pt)</div>
            <div>• <strong>Labels Per Sheet:</strong> 55 labels (5 cols × 11 rows)</div>
            <div>• <strong>Margins:</strong> 0.4" Horizontal, 0.3" Vertical, ~2mm Gutters</div>
          </div>
        </div>
      </div>
    </div>
  );
}
