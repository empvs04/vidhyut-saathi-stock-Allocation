import React, { useState, useEffect } from 'react';
import { Sliders, CheckCircle2, Shield, Eye, Info, Sparkles } from 'lucide-react';
import { TemplatesAPI } from '../services/api';
import CardPreview from '../components/CardPreview';

export default function TemplateManagement() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [testSerial, setTestSerial] = useState('0020231501');

  useEffect(() => {
    TemplatesAPI.getTemplates()
      .then((res) => {
        if (res.data.success) {
          setTemplates(res.data.templates);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const template = templates[0] || {};

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
            <Sliders size={22} color="#0066cc" />
            <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>
              Label Template & Artwork Manager
            </h2>
          </div>
          <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
            Controlled coordinate mappings for dynamic barcode and serial number overlay on approved artwork.
          </div>
        </div>

        <span className="badge badge-success" style={{ padding: '6px 12px' }}>
          <Shield size={14} />
          Artwork Preserved (Immutable)
        </span>
      </div>

      {/* Two-Column: Template Details & Visual Calibrator */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px', alignItems: 'start' }}>
        {/* Left Column: Template Information & Calibration Ratios */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>
              {template.templateName || 'Official Vidhyut Saathi 10-Year Saver Card Label'}
            </h3>
            <p style={{ fontSize: '12.5px', color: '#64748b', marginTop: '4px' }}>
              {template.description || 'Standard corporate label with MRP ₹3,498/-, 10 Years Life, 3 Years Warranty, and footer.'}
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid #f1f5f9' }}>
              <span style={{ color: '#64748b' }}>Artwork Version:</span>
              <strong>v{template.artworkVersion || '1.0'}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid #f1f5f9' }}>
              <span style={{ color: '#64748b' }}>Master Label Size:</span>
              <strong>2.0" × 1.5" (144 × 108 pt)</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid #f1f5f9' }}>
              <span style={{ color: '#64748b' }}>Aspect Ratio:</span>
              <strong>4 : 3 (Pixel-Perfect 1024 × 768 px)</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid #f1f5f9' }}>
              <span style={{ color: '#64748b' }}>Barcode Box Overlay:</span>
              <strong className="font-mono">x: 9%, y: 61%, w: 82%, h: 17%</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid #f1f5f9' }}>
              <span style={{ color: '#64748b' }}>Serial Text Overlay:</span>
              <strong className="font-mono">Centered, y: 80%, 7.5pt Bold</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748b' }}>Print Resolution:</span>
              <strong>High-DPI Vector Barcode (Code 128)</strong>
            </div>
          </div>

          {/* Artwork Preservation Rules Alert */}
          <div
            style={{
              padding: '14px',
              backgroundColor: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: '10px',
              fontSize: '12.5px',
              color: '#166534',
              lineHeight: '1.6',
            }}
          >
            <div style={{ fontWeight: '800', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle2 size={16} color="#16a34a" />
              Company Artwork Preservation Mandate:
            </div>
            <div>• Logo, chip symbol, and Hindi slogan remain untouched.</div>
            <div>• MRP ₹3,498/- and warranty boxes are 100% original.</div>
            <div>• Barcode area is updated strictly in the designated white rectangle.</div>
            <div>• Zero distortion, stretching, or pixel compression.</div>
          </div>
        </div>

        {/* Right Column: Live Interactive Preview */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a' }}>
            Live Calibration Preview
          </h3>

          <div className="form-group">
            <label className="form-label">Test Serial Number</label>
            <input
              type="text"
              className="form-input font-mono"
              value={testSerial}
              onChange={(e) => setTestSerial(e.target.value)}
              placeholder="0020231501"
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0' }}>
            <CardPreview serialNumber={testSerial || '0020231501'} width={340} showCropGuides />
          </div>

          <div style={{ fontSize: '12px', color: '#64748b', textAlign: 'center' }}>
            Preview rendered using the exact master template asset from Vidhyut Saathi documents.
          </div>
        </div>
      </div>
    </div>
  );
}
