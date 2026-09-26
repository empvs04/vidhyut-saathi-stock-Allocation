import React, { useState, useEffect, useMemo } from 'react';
import {
  Layers,
  Printer,
  Download,
  Eye,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Sparkles,
  FileText,
  Sliders,
  Maximize2,
} from 'lucide-react';
import RangeCardPreview from '../components/RangeCardPreview';
import RangeSheetPreview from '../components/RangeSheetPreview';

export default function RangeLabelGenerator({ onPreviewBatch }) {
  // Dedicated state for 10-Serial Range Labels
  const [batchName, setBatchName] = useState('Range Batch ' + new Date().toLocaleDateString('en-GB').replace(/\//g, ''));
  const [cardSeries, setCardSeries] = useState('VS');
  const [startSerialNumber, setStartSerialNumber] = useState('0020231501');
  const [physicalQuantity, setPhysicalQuantity] = useState(44); // 44 physical labels = 1 full 12x18 sheet
  const [presetId, setPresetId] = useState('12x18_range_44');
  const [previewLabelIndex, setPreviewLabelIndex] = useState(1);
  const [viewMode, setViewMode] = useState('label'); // 'label' or 'sheet'
  const [loading, setLoading] = useState(false);
  const [successResult, setSuccessResult] = useState(null);
  const [error, setError] = useState(null);

  // Layout presets
  const [presets, setPresets] = useState({
    '12x18_range_44': {
      id: '12x18_range_44',
      name: '12 × 18 inch — 44 Labels (2.25" × 1.50")',
      labelsPerSheet: 44,
      columns: 4,
      rows: 11,
      aspectRatio: '3:2',
    },
    '12x18_range_60': {
      id: '12x18_range_60',
      name: '12 × 18 inch — 60 Labels (2.00" × 1.333")',
      labelsPerSheet: 60,
      columns: 5,
      rows: 12,
      aspectRatio: '3:2',
    },
    'a4_range_18': {
      id: 'a4_range_18',
      name: 'A4 — 18 Labels (2.25" × 1.50")',
      labelsPerSheet: 18,
      columns: 3,
      rows: 6,
      aspectRatio: '3:2',
    },
  });

  // Fetch presets and initial next serial
  useEffect(() => {
    fetch('/api/range-batches/presets')
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.presets) {
          setPresets(data.presets);
        }
      })
      .catch((err) => console.error('Failed to load range presets:', err));

    fetch('/api/range-batches/next-serial')
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.nextSerialNumber) {
          // If starting clean, default to 0020231501
          setStartSerialNumber(data.nextSerialNumber || '0020231501');
        }
      })
      .catch((err) => console.error('Failed to load next serial:', err));
  }, []);

  const currentPreset = presets[presetId] || presets['12x18_range_44'];
  const labelsPerSheet = currentPreset.labelsPerSheet || 44;
  const totalPhysicalLabels = Math.max(1, parseInt(physicalQuantity, 10) || 1);
  const totalSerials = totalPhysicalLabels * 10;
  const totalPages = Math.ceil(totalPhysicalLabels / labelsPerSheet);

  // Serial Range Calculation
  const startNumBig = useMemo(() => {
    const clean = String(startSerialNumber).replace(/\D/g, '') || '20231501';
    return BigInt(clean);
  }, [startSerialNumber]);

  const totalLen = String(startSerialNumber).length || 10;

  const batchEndSerial = useMemo(() => {
    const endNum = startNumBig + BigInt(totalSerials - 1);
    return String(endNum).padStart(totalLen, '0');
  }, [startNumBig, totalSerials, totalLen]);

  // Current preview label's serial range
  const currentPreviewRange = useMemo(() => {
    const idx = Math.max(0, previewLabelIndex - 1);
    const sStart = String(startNumBig + BigInt(idx * 10)).padStart(totalLen, '0');
    const sEnd = String(startNumBig + BigInt(idx * 10 + 9)).padStart(totalLen, '0');
    return { sStart, sEnd };
  }, [startNumBig, previewLabelIndex, totalLen]);

  // Handle Generate PDF
  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    setSuccessResult(null);

    try {
      const response = await fetch('/api/range-batches/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          batchName,
          cardSeries,
          startSerialNumber,
          physicalLabelQuantity: totalPhysicalLabels,
          presetId,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to generate range batch');
      }

      setSuccessResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle single test print
  const handleTestPrintSingle = () => {
    const url = `/api/range-batches/single-label-pdf?start=${currentPreviewRange.sStart}&end=${currentPreviewRange.sEnd}`;
    window.open(url, '_blank');
  };

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header Banner */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '16px',
          borderBottom: '1px solid #e2e8f0',
          paddingBottom: '18px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                backgroundColor: '#0284c7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
              }}
            >
              <Layers size={22} />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '800', color: '#0f172a' }}>
                Range Label Generator
              </h1>
              <p style={{ margin: '2px 0 0 0', fontSize: '13.5px', color: '#64748b' }}>
                1 Physical Label = 10 Consecutive Serial Numbers (3:2 Aspect Ratio • 12 × 18 Commercial Press)
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span
            style={{
              fontSize: '11px',
              fontWeight: '700',
              padding: '4px 10px',
              borderRadius: '6px',
              backgroundColor: '#e0f2fe',
              color: '#0369a1',
              border: '1px solid #bae6fd',
              letterSpacing: '0.4px',
            }}
          >
            3:2 RATIO
          </span>
          <span
            style={{
              fontSize: '11px',
              fontWeight: '700',
              padding: '4px 10px',
              borderRadius: '6px',
              backgroundColor: '#f1f5f9',
              color: '#475569',
              border: '1px solid #cbd5e1',
            }}
          >
            12 × 18 SHEET
          </span>
          <span
            style={{
              fontSize: '11px',
              fontWeight: '700',
              padding: '4px 10px',
              borderRadius: '6px',
              backgroundColor: '#ecfdf5',
              color: '#047857',
              border: '1px solid #a7f3d0',
            }}
          >
            10-SERIAL PACK
          </span>
        </div>
      </div>

      {/* Main Grid: Form Left, Preview Right */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(380px, 480px) 1fr', gap: '28px', alignItems: 'start' }}>
        {/* LEFT COLUMN: Controls & Settings */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Card 1: Batch & Serial Setup */}
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '14px',
              border: '1px solid #e2e8f0',
              padding: '22px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            <h2 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: '#1e293b' }}>
              Batch Configuration
            </h2>

            {/* Batch Name */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>
                Batch Name
              </label>
              <input
                type="text"
                value={batchName}
                onChange={(e) => setBatchName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13.5px',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Starting Serial Number */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>
                Starting Serial Number (10 Digits)
              </label>
              <input
                type="text"
                value={startSerialNumber}
                onChange={(e) => setStartSerialNumber(e.target.value)}
                placeholder="0020231501"
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '15px',
                  fontWeight: '700',
                  letterSpacing: '0.8px',
                  boxSizing: 'border-box',
                  fontFamily: 'monospace',
                }}
              />
              <span style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px', display: 'block' }}>
                Preserves leading zeros strictly. Label 1 will be {startSerialNumber} ----- {currentPreviewRange.sEnd}
              </span>
            </div>

            {/* Physical Label Quantity */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#475569' }}>
                  Number of Physical Labels
                </label>
                <span style={{ fontSize: '11px', fontWeight: '700', color: '#0284c7' }}>
                  {totalPages} {totalPages === 1 ? 'Page' : 'Pages'} on 12×18
                </span>
              </div>
              <input
                type="number"
                min="1"
                max="10000"
                value={physicalQuantity}
                onChange={(e) => setPhysicalQuantity(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '15px',
                  fontWeight: '700',
                  boxSizing: 'border-box',
                }}
              />

              {/* Quick Preset Buttons */}
              <div style={{ display: 'flex', gap: '6px', marginTop: '8px', flexWrap: 'wrap' }}>
                {[
                  { label: '44 (1 Sheet)', qty: 44 },
                  { label: '88 (2 Sheets)', qty: 88 },
                  { label: '132 (3 Sheets)', qty: 132 },
                  { label: '220 (5 Sheets)', qty: 220 },
                  { label: '440 (10 Sheets)', qty: 440 },
                ].map((item) => (
                  <button
                    key={item.qty}
                    type="button"
                    onClick={() => setPhysicalQuantity(item.qty)}
                    style={{
                      padding: '4px 8px',
                      borderRadius: '6px',
                      border: totalPhysicalLabels === item.qty ? '1px solid #0284c7' : '1px solid #e2e8f0',
                      backgroundColor: totalPhysicalLabels === item.qty ? '#e0f2fe' : '#f8fafc',
                      color: totalPhysicalLabels === item.qty ? '#0369a1' : '#475569',
                      fontSize: '11px',
                      fontWeight: '600',
                      cursor: 'pointer',
                    }}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Sheet & Grid Preset Selector */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>
                Sheet Format & Grid
              </label>
              <select
                value={presetId}
                onChange={(e) => setPresetId(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  backgroundColor: '#ffffff',
                  boxSizing: 'border-box',
                }}
              >
                {Object.values(presets).map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.displayName || p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Card 2: Automatic Calculations Summary Card */}
          <div
            style={{
              backgroundColor: '#0f172a',
              borderRadius: '14px',
              padding: '20px',
              color: '#ffffff',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              boxShadow: '0 4px 14px rgba(15,23,42,0.15)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                Live Calculation Summary
              </span>
              <span
                style={{
                  fontSize: '10.5px',
                  fontWeight: '700',
                  color: '#38bdf8',
                  backgroundColor: 'rgba(56,189,248,0.15)',
                  padding: '2px 8px',
                  borderRadius: '4px',
                }}
              >
                AUTO-CALCULATED
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={{ backgroundColor: 'rgba(255,255,255,0.06)', padding: '10px 12px', borderRadius: '8px' }}>
                <span style={{ fontSize: '11px', color: '#94a3b8', display: 'block' }}>Physical Labels</span>
                <span style={{ fontSize: '18px', fontWeight: '800', color: '#ffffff' }}>{totalPhysicalLabels}</span>
              </div>
              <div style={{ backgroundColor: 'rgba(255,255,255,0.06)', padding: '10px 12px', borderRadius: '8px' }}>
                <span style={{ fontSize: '11px', color: '#94a3b8', display: 'block' }}>Serials Covered</span>
                <span style={{ fontSize: '18px', fontWeight: '800', color: '#38bdf8' }}>{totalSerials}</span>
              </div>
              <div style={{ backgroundColor: 'rgba(255,255,255,0.06)', padding: '10px 12px', borderRadius: '8px' }}>
                <span style={{ fontSize: '11px', color: '#94a3b8', display: 'block' }}>Total 12×18 Pages</span>
                <span style={{ fontSize: '18px', fontWeight: '800', color: '#ffffff' }}>{totalPages}</span>
              </div>
              <div style={{ backgroundColor: 'rgba(255,255,255,0.06)', padding: '10px 12px', borderRadius: '8px' }}>
                <span style={{ fontSize: '11px', color: '#94a3b8', display: 'block' }}>Aspect Ratio</span>
                <span style={{ fontSize: '18px', fontWeight: '800', color: '#4ade80' }}>3:2</span>
              </div>
            </div>

            <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '12px' }}>
              <span style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '2px' }}>
                Complete Batch Range:
              </span>
              <div style={{ fontSize: '13px', fontWeight: '700', color: '#f8fafc', fontFamily: 'monospace' }}>
                {startSerialNumber} <span style={{ color: '#38bdf8' }}>-----</span> {batchEndSerial}
              </div>
            </div>
          </div>

          {/* Primary Action Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button
              onClick={handleGenerate}
              disabled={loading}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '10px',
                border: 'none',
                backgroundColor: loading ? '#94a3b8' : '#0284c7',
                color: '#ffffff',
                fontSize: '15px',
                fontWeight: '800',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 12px rgba(2,132,199,0.3)',
                transition: 'all 0.15s ease',
              }}
            >
              {loading ? (
                <>
                  <RefreshCw size={18} className="animate-spin" />
                  Generating True-Scale 12×18 PDF...
                </>
              ) : (
                <>
                  <Printer size={18} />
                  Generate Range Batch PDF ({totalPhysicalLabels} Labels • {totalPages} {totalPages === 1 ? 'Page' : 'Pages'})
                </>
              )}
            </button>

            <button
              onClick={handleTestPrintSingle}
              type="button"
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                backgroundColor: '#ffffff',
                color: '#334155',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
              }}
            >
              <Eye size={16} color="#64748b" />
              Print Single Proof Label (3:2 Actual Size)
            </button>
          </div>

          {/* Error Banner */}
          {error && (
            <div
              style={{
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '10px',
                padding: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                color: '#b91c1c',
                fontSize: '13px',
              }}
            >
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          {/* Success Banner */}
          {successResult && (
            <div
              style={{
                backgroundColor: '#f0fdf4',
                border: '1px solid #bbf7d0',
                borderRadius: '10px',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#15803d', fontWeight: '700', fontSize: '14px' }}>
                <CheckCircle size={18} />
                <span>PDF Successfully Generated!</span>
              </div>
              <div style={{ fontSize: '12.5px', color: '#334155' }}>
                {successResult.totalPhysicalLabels} physical labels ({successResult.totalSerials} serials) across {successResult.totalPages} pages.
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <a
                  href={successResult.pdfDownloadUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    flex: 1,
                    padding: '8px',
                    backgroundColor: '#16a34a',
                    color: '#ffffff',
                    borderRadius: '6px',
                    textAlign: 'center',
                    textDecoration: 'none',
                    fontWeight: '700',
                    fontSize: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                  }}
                >
                  <Download size={14} /> Download PDF
                </a>
                <button
                  type="button"
                  onClick={() => onPreviewBatch && onPreviewBatch(successResult.batch)}
                  style={{
                    flex: 1,
                    padding: '8px',
                    backgroundColor: '#ffffff',
                    color: '#16a34a',
                    border: '1px solid #16a34a',
                    borderRadius: '6px',
                    fontWeight: '700',
                    fontSize: '12px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                  }}
                >
                  <Eye size={14} /> Preview PDF
                </button>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Live Interactive 3:2 Preview */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* View Mode Toggle: Label Preview vs Sheet Grid */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '6px', backgroundColor: '#f1f5f9', padding: '3px', borderRadius: '8px' }}>
              <button
                type="button"
                onClick={() => setViewMode('label')}
                style={{
                  padding: '6px 14px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: viewMode === 'label' ? '#ffffff' : 'transparent',
                  color: viewMode === 'label' ? '#0f172a' : '#64748b',
                  fontWeight: viewMode === 'label' ? '700' : '500',
                  fontSize: '12.5px',
                  cursor: 'pointer',
                  boxShadow: viewMode === 'label' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                }}
              >
                Physical Label (3:2)
              </button>
              <button
                type="button"
                onClick={() => setViewMode('sheet')}
                style={{
                  padding: '6px 14px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: viewMode === 'sheet' ? '#ffffff' : 'transparent',
                  color: viewMode === 'sheet' ? '#0f172a' : '#64748b',
                  fontWeight: viewMode === 'sheet' ? '700' : '500',
                  fontSize: '12.5px',
                  cursor: 'pointer',
                  boxShadow: viewMode === 'sheet' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                }}
              >
                12×18 Sheet Grid ({labelsPerSheet}/Page)
              </button>
            </div>

            <span style={{ fontSize: '12px', color: '#64748b' }}>
              Previewing Label <strong>{previewLabelIndex}</strong> of {totalPhysicalLabels}
            </span>
          </div>

          {/* Interactive Preview Container */}
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              padding: '28px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '480px',
            }}
          >
            {viewMode === 'label' ? (
              <RangeCardPreview
                startSerial={currentPreviewRange.sStart}
                endSerial={currentPreviewRange.sEnd}
                width={460}
                labelIndex={previewLabelIndex}
                totalLabels={totalPhysicalLabels}
                onPrevLabel={() => setPreviewLabelIndex((prev) => Math.max(1, prev - 1))}
                onNextLabel={() => setPreviewLabelIndex((prev) => Math.min(totalPhysicalLabels, prev + 1))}
              />
            ) : (
              <RangeSheetPreview
                layout={currentPreset}
                startSerial={startSerialNumber}
                totalPhysicalLabels={totalPhysicalLabels}
              />
            )}
          </div>

          {/* Specifications Footer */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '12px',
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
              padding: '12px 16px',
              fontSize: '12px',
              color: '#64748b',
            }}
          >
            <div>
              <span style={{ display: 'block', fontSize: '10.5px', color: '#94a3b8' }}>Sheet Outer Margins</span>
              <strong style={{ color: '#334155' }}>L: 0.4" • R: 0.4" • T: 0.3" • B: 0.3"</strong>
            </div>
            <div>
              <span style={{ display: 'block', fontSize: '10.5px', color: '#94a3b8' }}>Cutting Gap</span>
              <strong style={{ color: '#334155' }}>2.0 mm (Exact)</strong>
            </div>
            <div>
              <span style={{ display: 'block', fontSize: '10.5px', color: '#94a3b8' }}>Print Scale</span>
              <strong style={{ color: '#0284c7' }}>100% Actual Size</strong>
            </div>
            <div>
              <span style={{ display: 'block', fontSize: '10.5px', color: '#94a3b8' }}>System Status</span>
              <strong style={{ color: '#16a34a' }}>Isolated Independent Engine</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
