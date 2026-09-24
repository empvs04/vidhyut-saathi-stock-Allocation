import React from 'react';
import { X, Download, Printer, ExternalLink, FileCheck } from 'lucide-react';
import { BatchesAPI } from '../services/api';

export default function PDFModal({ batch, onClose }) {
  if (!batch) return null;

  const previewUrl = BatchesAPI.getPdfPreviewUrl(batch.batchId || batch._id);
  const downloadUrl = BatchesAPI.getPdfDownloadUrl(batch.batchId || batch._id);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(3px)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '94%',
          maxWidth: '1100px',
          height: '92vh',
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px 24px',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            backgroundColor: '#f8fafc',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h3 style={{ fontSize: '17px', fontWeight: '800', color: '#0f172a' }}>
                  {batch.batchName}
                </h3>
                <span className="badge badge-success">
                  <FileCheck size={12} />
                  PDF Ready
                </span>
              </div>
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                Batch ID: <strong>{batch.batchId}</strong> • Total Labels: <strong>{batch.quantity}</strong> ({batch.totalPages} Pages) • Serials: <strong>{batch.startSerialNumber}</strong> → <strong>{batch.endSerialNumber}</strong>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <a
                href={downloadUrl}
                className="btn btn-primary"
                style={{ fontSize: '13px', padding: '8px 14px', textDecoration: 'none' }}
                download
              >
                <Download size={15} />
                Download PDF
              </a>

              <a
                href={previewUrl}
                target="_blank"
                rel="noreferrer"
                className="btn btn-secondary"
                style={{ fontSize: '13px', padding: '8px 14px', textDecoration: 'none' }}
              >
                <ExternalLink size={15} />
                Open New Tab
              </a>

              <button
                onClick={onClose}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#64748b',
                  padding: '6px',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Critical Print Settings Info Banner */}
          <div
            style={{
              backgroundColor: '#fffbeb',
              border: '1px solid #fde68a',
              borderRadius: '6px',
              padding: '6px 12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '11.5px',
              color: '#92400e',
              flexWrap: 'wrap',
              gap: '6px',
            }}
          >
            <div>
              <strong>IMPORTANT PRINT SETTINGS:</strong> Print Scale: <strong>100% (Actual Size)</strong> • Disable: <strong>"Fit to Page"</strong> & <strong>"Shrink Oversized Pages"</strong> • Use correct paper size
            </div>
            <a
              href="/api/batches/calibration-test"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#b45309', fontWeight: '700', textDecoration: 'underline' }}
            >
              Print Ruler Calibration Test Page →
            </a>
          </div>
        </div>

        {/* PDF Viewer Frame */}
        <div style={{ flex: 1, backgroundColor: '#334155', position: 'relative' }}>
          <iframe
            src={`${previewUrl}#toolbar=1&navpanes=0&scrollbar=1`}
            title="Batch PDF Preview"
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
            }}
          />
        </div>
      </div>
    </div>
  );
}
