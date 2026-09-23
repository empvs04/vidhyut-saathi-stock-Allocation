import React, { useState, useEffect } from 'react';
import {
  FileText,
  Search,
  Filter,
  Download,
  Eye,
  Calendar,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  Clock,
  AlertCircle,
  Trash2,
  AlertTriangle,
  X,
} from 'lucide-react';
import { BatchesAPI } from '../services/api';

export default function SavedBatches({ onPreviewBatch, onNavigate }) {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [deleteModalBatch, setDeleteModalBatch] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteNotification, setDeleteNotification] = useState(null);

  const fetchBatches = async () => {
    setLoading(true);
    try {
      const res = await BatchesAPI.getBatches({
        search: search || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
      });
      if (res.data.success) {
        setBatches(res.data.batches);
      }
    } catch (err) {
      console.error('Error fetching batches:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBatches();
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchBatches();
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModalBatch) return;
    setDeleting(true);
    try {
      const res = await BatchesAPI.deleteBatch(deleteModalBatch.batchId);
      if (res.data.success) {
        setDeleteNotification({
          type: 'success',
          message: `Batch "${deleteModalBatch.batchName}" (${deleteModalBatch.batchId}) and its PDF were successfully deleted. Memory and storage freed!`,
        });
        setDeleteModalBatch(null);
        fetchBatches();
      }
    } catch (err) {
      setDeleteNotification({
        type: 'error',
        message: err.response?.data?.message || 'Failed to delete batch.',
      });
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatBytes = (bytes) => {
    if (!bytes) return '-';
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(0)} KB`;
    return `${(kb / 1024).toFixed(1)} MB`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
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
            <FileText size={22} color="#0066cc" />
            <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>
              Saved Batches & PDF Management
            </h2>
          </div>
          <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
            Browse, preview, and download 12" × 18" print sheets saved in persistent storage.
          </div>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => onNavigate('generator')}
        >
          <Sparkles size={16} />
          Create New Batch
        </button>
      </div>

      {/* Delete Feedback Banner */}
      {deleteNotification && (
        <div
          style={{
            padding: '12px 16px',
            borderRadius: '10px',
            backgroundColor: deleteNotification.type === 'success' ? '#f0fdf4' : '#fef2f2',
            border: `1px solid ${deleteNotification.type === 'success' ? '#bbf7d0' : '#fecaca'}`,
            color: deleteNotification.type === 'success' ? '#166534' : '#991b1b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '13.5px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {deleteNotification.type === 'success' ? (
              <CheckCircle2 size={18} color="#16a34a" />
            ) : (
              <AlertCircle size={18} color="#dc2626" />
            )}
            <span>{deleteNotification.message}</span>
          </div>
          <button
            onClick={() => setDeleteNotification(null)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: '2px' }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div
        className="card"
        style={{
          padding: '14px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
        }}
      >
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '10px', flex: 1, maxWidth: '500px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '12px' }} />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '36px', width: '100%' }}
              placeholder="Search by Batch Name, Batch ID, or Serial Number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-secondary">
            Search
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#64748b' }}>
            <Filter size={15} />
            <span>Status:</span>
            <select
              className="form-select"
              style={{ padding: '6px 10px', fontSize: '13px' }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Batches</option>
              <option value="completed">Completed</option>
              <option value="processing">Processing</option>
              <option value="failed">Failed</option>
            </select>
          </div>

          <button
            className="btn btn-secondary"
            style={{ padding: '7px 10px' }}
            onClick={fetchBatches}
            title="Refresh Batches"
          >
            <RefreshCw size={15} className={loading ? 'spin' : ''} />
          </button>
        </div>
      </div>

      {/* Batches Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-container" style={{ border: 'none' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Batch Information</th>
                <th>Series</th>
                <th>Serial Numbers Range</th>
                <th>Quantity</th>
                <th>Pages</th>
                <th>File Size</th>
                <th>Generated Date</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '36px', color: '#64748b' }}>
                    <RefreshCw size={24} className="spin" style={{ margin: '0 auto 8px' }} />
                    <div>Loading saved batches...</div>
                  </td>
                </tr>
              ) : batches.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '48px', color: '#94a3b8' }}>
                    <FileText size={36} style={{ margin: '0 auto 10px', opacity: 0.5 }} />
                    <div style={{ fontSize: '15px', fontWeight: '600', color: '#334155' }}>No Batches Found</div>
                    <div style={{ fontSize: '13px', marginTop: '4px' }}>
                      {search ? 'Try adjusting your search criteria.' : 'Generate your first batch of barcode labels!'}
                    </div>
                  </td>
                </tr>
              ) : (
                batches.map((b) => (
                  <tr key={b._id}>
                    <td>
                      <div style={{ fontWeight: '700', color: '#0f172a' }}>{b.batchName}</div>
                      <div style={{ fontSize: '11.5px', color: '#64748b', fontFamily: 'monospace' }}>
                        {b.batchId}
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-primary">{b.cardSeries}</span>
                    </td>
                    <td>
                      <div className="font-mono" style={{ fontSize: '12.5px', color: '#0066cc', fontWeight: '600' }}>
                        {b.startSerialNumber}
                      </div>
                      <div className="font-mono" style={{ fontSize: '11.5px', color: '#64748b' }}>
                        to {b.endSerialNumber}
                      </div>
                    </td>
                    <td style={{ fontWeight: '700', fontSize: '14px' }}>
                      {b.quantity?.toLocaleString()}
                    </td>
                    <td>
                      <span style={{ fontWeight: '600', color: '#334155' }}>{b.totalPages}</span>
                      <span style={{ fontSize: '11px', color: '#94a3b8', display: 'block' }}>
                        (55/page)
                      </span>
                    </td>
                    <td style={{ fontSize: '12.5px', color: '#64748b' }}>
                      {formatBytes(b.pdfFileSize)}
                    </td>
                    <td style={{ fontSize: '12px', color: '#475569' }}>
                      {formatDate(b.createdAt)}
                    </td>
                    <td>
                      <span
                        className={`badge badge-${
                          b.status === 'completed'
                            ? 'success'
                            : b.status === 'failed'
                            ? 'danger'
                            : 'warning'
                        }`}
                      >
                        {b.status === 'completed' ? (
                          <CheckCircle2 size={12} />
                        ) : b.status === 'failed' ? (
                          <AlertCircle size={12} />
                        ) : (
                          <Clock size={12} />
                        )}
                        {b.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        <button
                          className="btn btn-secondary"
                          style={{ padding: '5px 9px', fontSize: '12px' }}
                          onClick={() => onPreviewBatch(b)}
                          title="Preview in Browser"
                        >
                          <Eye size={14} />
                          Preview
                        </button>
                        <a
                          href={BatchesAPI.getPdfDownloadUrl(b.batchId)}
                          className="btn btn-primary"
                          style={{ padding: '5px 9px', fontSize: '12px', textDecoration: 'none' }}
                          download
                          title="Download 12x18 PDF"
                        >
                          <Download size={14} />
                          PDF
                        </a>
                        <button
                          type="button"
                          className="btn btn-secondary"
                          style={{
                            padding: '5px 9px',
                            fontSize: '12px',
                            color: '#dc2626',
                            borderColor: '#fecaca',
                            backgroundColor: '#fff5f5',
                          }}
                          onClick={() => setDeleteModalBatch(b)}
                          title="Delete Batch & Free Memory"
                        >
                          <Trash2 size={14} />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Modal to Delete Batch & Free Storage */}
      {deleteModalBatch && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(3px)',
            zIndex: 110,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
          onClick={() => !deleting && setDeleteModalBatch(null)}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              maxWidth: '480px',
              width: '100%',
              padding: '24px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '10px',
                  backgroundColor: '#fee2e2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <AlertTriangle size={24} color="#dc2626" />
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '17px', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                  Delete Batch & Free Memory?
                </h3>
                <p style={{ fontSize: '13px', color: '#64748b', marginTop: '6px', lineHeight: 1.5 }}>
                  Are you sure you want to permanently delete{' '}
                  <strong style={{ color: '#0f172a' }}>"{deleteModalBatch.batchName}"</strong> (
                  <span className="font-mono">{deleteModalBatch.batchId}</span>)?
                </p>
              </div>
            </div>

            <div
              style={{
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '12px',
                fontSize: '12.5px',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                color: '#475569',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Storage Space Freed:</span>
                <strong style={{ color: '#dc2626' }}>{formatBytes(deleteModalBatch.pdfFileSize)}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Labels Removed:</span>
                <strong style={{ color: '#0f172a' }}>{deleteModalBatch.quantity} labels</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Serial Range:</span>
                <strong className="font-mono" style={{ color: '#0066cc' }}>
                  {deleteModalBatch.startSerialNumber} – {deleteModalBatch.endSerialNumber}
                </strong>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '4px' }}>
              <button
                type="button"
                className="btn btn-secondary"
                disabled={deleting}
                onClick={() => setDeleteModalBatch(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn"
                disabled={deleting}
                onClick={handleDeleteConfirm}
                style={{
                  backgroundColor: '#dc2626',
                  color: '#ffffff',
                  boxShadow: '0 1px 3px rgba(220, 38, 38, 0.3)',
                }}
              >
                {deleting ? (
                  <>
                    <RefreshCw size={15} className="spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 size={15} />
                    Delete & Free Memory
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
