import React, { useState } from 'react';
import {
  Grid,
  Printer,
  Scissors,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Sliders,
} from 'lucide-react';
import SheetPreview from '../components/SheetPreview';
import CardPreview from '../components/CardPreview';
import { SHEET_PRESETS_OPTIONS } from './BarcodeGenerator';

export default function SheetLayoutPreview() {
  const [selectedPresetId, setSelectedPresetId] = useState('12x18_default');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedSerial, setSelectedSerial] = useState('0020231501');
  const [testStartSerial, setTestStartSerial] = useState('0020231501');

  const activePreset = SHEET_PRESETS_OPTIONS.find((p) => p.id === selectedPresetId) || SHEET_PRESETS_OPTIONS[0];
  const testQuantity = activePreset.labelsPerSheet * 10;
  const totalPages = Math.ceil(testQuantity / activePreset.labelsPerSheet);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Banner */}
      <div
        className="card"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 22px',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Grid size={20} color="#0066cc" />
              <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>
                Sheet Layout & Physical Dimensions Inspector
              </h2>
            </div>
            <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
              Accurate physical print preview for {activePreset.name} with {activePreset.labelsPerSheet} labels ({activePreset.columns} cols × {activePreset.rows} rows).
            </div>
          </div>

          {/* Sheet Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: '700', color: '#475569' }}>Format:</span>
            <select
              className="form-select"
              value={selectedPresetId}
              onChange={(e) => {
                setSelectedPresetId(e.target.value);
                setCurrentPage(1);
              }}
              style={{
                fontSize: '13px',
                fontWeight: '700',
                color: '#0066cc',
                backgroundColor: '#eff6ff',
                borderColor: '#93c5fd',
                padding: '5px 10px',
              }}
            >
              {SHEET_PRESETS_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Page Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            className="btn btn-secondary"
            style={{ padding: '6px 10px' }}
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          >
            <ChevronLeft size={16} />
            Prev Page
          </button>
          <span style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a' }}>
            Page {currentPage} of {totalPages}
          </span>
          <button
            className="btn btn-secondary"
            style={{ padding: '6px 10px' }}
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          >
            Next Page
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Main Content: Left Inspector & Right Sheet View */}
      <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: '20px', alignItems: 'start' }}>
        {/* Left Column: Physical Dimension Breakdown & Single Label Inspector */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Physical Specifications Table */}
          <div className="card">
            <h3 style={{ fontSize: '14px', fontWeight: '800', color: '#0f172a', marginBottom: '12px' }}>
              Physical Print Dimensions ({activePreset.name})
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '6px', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ color: '#64748b' }}>Sheet Dimensions:</span>
                <strong>{activePreset.sheetWidthInches}" × {activePreset.sheetHeightInches}" ({Math.round(activePreset.sheetWidthInches * 72)} × {Math.round(activePreset.sheetHeightInches * 72)} pt)</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '6px', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ color: '#64748b' }}>Individual Label Size:</span>
                <strong>{activePreset.labelWidthInches}" × {activePreset.labelHeightInches}" ({Math.round(activePreset.labelWidthInches * 72)} × {Math.round(activePreset.labelHeightInches * 72)} pt)</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '6px', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ color: '#64748b' }}>Grid Matrix:</span>
                <strong>{activePreset.columns} Columns × {activePreset.rows} Rows ({activePreset.labelsPerSheet} Labels)</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '6px', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ color: '#64748b' }}>Horizontal Outer Margin:</span>
                <strong>{activePreset.marginHorizontalInches}" ({Number((activePreset.marginHorizontalInches * 72).toFixed(1))} pt)</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '6px', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ color: '#64748b' }}>Vertical Outer Margin:</span>
                <strong>{activePreset.marginVerticalInches}" ({Number((activePreset.marginVerticalInches * 72).toFixed(1))} pt)</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Labels per Page:</span>
                <strong style={{ color: '#0066cc' }}>{activePreset.labelsPerSheet} Labels</strong>
              </div>
            </div>
          </div>

          {/* Selected Label Zoom View */}
          <div className="card">
            <h3 style={{ fontSize: '14px', fontWeight: '800', color: '#0f172a', marginBottom: '8px' }}>
              Selected Label Inspection
            </h3>
            <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '12px' }}>
              Click any slot on the sheet to inspect its barcode and artwork alignment.
            </div>

            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <CardPreview serialNumber={selectedSerial} width={300} showCropGuides />
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Sheet Visualizer */}
        <div className="card">
          <SheetPreview
            startSerialNumber={testStartSerial}
            quantity={testQuantity}
            cardSeries="VS"
            pageNumber={currentPage}
            onSelectLabel={(s) => setSelectedSerial(s)}
            sheetPreset={activePreset}
          />
        </div>
      </div>
    </div>
  );
}
