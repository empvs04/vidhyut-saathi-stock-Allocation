import React, { useState } from 'react';
import { X, Search, CheckCircle, AlertTriangle, Upload, Barcode, ShieldAlert } from 'lucide-react';
import { RecordsAPI } from '../services/api';

export default function ScannerModal({ onClose }) {
  const [inputSerial, setInputSerial] = useState('0020231501');
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleVerify = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      let payload = {};
      if (imageFile) {
        payload.imageBase64 = imageFile;
      } else {
        payload.scannedText = inputSerial.trim();
      }

      const res = await RecordsAPI.verifyScan(payload);
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Scan verification failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImageFile(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

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
          width: '100%',
          maxWidth: '560px',
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#f8fafc',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Barcode size={20} color="#0066cc" />
            <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>
              Barcode Scan Validation Tester
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#64748b',
              padding: '4px',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '20px' }}>
          <form onSubmit={handleVerify}>
            <div className="form-group">
              <label className="form-label">
                Test Serial Number (or Scanned Value)
              </label>
              <input
                type="text"
                className="form-input font-mono"
                placeholder="e.g. 0020231501"
                value={inputSerial}
                onChange={(e) => {
                  setInputSerial(e.target.value);
                  setImageFile(null);
                }}
              />
            </div>

            <div style={{ margin: '14px 0', textAlign: 'center', position: 'relative' }}>
              <div style={{ height: '1px', backgroundColor: '#e2e8f0', width: '100%' }} />
              <span
                style={{
                  position: 'absolute',
                  top: '-10px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  backgroundColor: '#ffffff',
                  padding: '0 10px',
                  fontSize: '11px',
                  fontWeight: '700',
                  color: '#94a3b8',
                }}
              >
                OR UPLOAD BARCODE IMAGE
              </span>
            </div>

            <div className="form-group">
              <label
                style={{
                  border: '2px dashed #cbd5e1',
                  borderRadius: '10px',
                  padding: '14px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  backgroundColor: imageFile ? '#f0fdf4' : '#f8fafc',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Upload size={20} color={imageFile ? '#16a34a' : '#64748b'} />
                <span style={{ fontSize: '13px', fontWeight: '600', color: '#334155' }}>
                  {imageFile ? 'Barcode Image Loaded (Click to change)' : 'Upload Barcode Image for Auto-Decode'}
                </span>
                <span style={{ fontSize: '11px', color: '#94a3b8' }}>Supports PNG, JPEG</span>
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleImageUpload}
                />
              </label>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '8px' }}
              disabled={loading || (!inputSerial && !imageFile)}
            >
              <Search size={16} />
              {loading ? 'Verifying with Scanner Engine...' : 'Run Scan Validation'}
            </button>
          </form>

          {/* Error Message */}
          {error && (
            <div
              style={{
                marginTop: '16px',
                padding: '12px',
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '8px',
                fontSize: '13px',
                color: '#991b1b',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <AlertTriangle size={16} />
              <span>{error}</span>
            </div>
          )}

          {/* Result Card */}
          {result && (
            <div
              style={{
                marginTop: '16px',
                padding: '16px',
                backgroundColor: result.foundInDatabase ? '#f0fdf4' : '#fffbeb',
                border: `1px solid ${result.foundInDatabase ? '#bbf7d0' : '#fef08a'}`,
                borderRadius: '10px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                {result.foundInDatabase ? (
                  <CheckCircle size={20} color="#16a34a" />
                ) : (
                  <ShieldAlert size={20} color="#ca8a04" />
                )}
                <span
                  style={{
                    fontSize: '14px',
                    fontWeight: '700',
                    color: result.foundInDatabase ? '#15803d' : '#854d0e',
                  }}
                >
                  {result.foundInDatabase
                    ? '100% Scan Decoded & Verified Active in Database'
                    : 'Barcode Decoded, but not in Database'}
                </span>
              </div>

              <div style={{ fontSize: '13px', color: '#334155', lineHeight: '1.6' }}>
                <div>
                  <strong>Decoded Serial Value:</strong>{' '}
                  <span className="font-mono" style={{ color: '#0066cc', fontWeight: '700' }}>
                    {result.decodedValue}
                  </span>
                </div>
                <div>
                  <strong>Format:</strong> {result.format} (Code 128 Compliant)
                </div>
                {result.record && (
                  <>
                    <div>
                      <strong>Associated Batch:</strong>{' '}
                      {result.record.batchId?.batchName || result.record.batchId}
                    </div>
                    <div>
                      <strong>Sheet Position:</strong> Page {result.record.pageNumber} • Slot #{result.record.positionIndex + 1}
                    </div>
                    <div>
                      <strong>Status:</strong>{' '}
                      <span className="badge badge-success">{result.record.status}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
