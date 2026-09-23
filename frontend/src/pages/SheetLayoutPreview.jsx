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

export default function SheetLayoutPreview() {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedSerial, setSelectedSerial] = useState('0020231501');
  const [testStartSerial, setTestStartSerial] = useState('0020231501');
  const [testQuantity, setTestQuantity] = useState(550); // 10 pages test

  const totalPages = Math.ceil(testQuantity / 55);

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
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Grid size={20} color="#0066cc" />
            <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>
              Sheet Layout & Physical Dimensions Inspector
            </h2>
          </div>
          <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
            Accurate physical print preview for 12" × 18" sheets with 55 labels (5 cols × 11 rows) at 100% scale.
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
              Physical Print Dimensions (Verified)
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '6px', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ color: '#64748b' }}>Sheet Dimensions:</span>
                <strong>12" × 18" (864 × 1296 pt)</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '6px', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ color: '#64748b' }}>Individual Label Size:</span>
                <strong>2" × 1.5" (144 × 108 pt)</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '6px', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ color: '#64748b' }}>Grid Matrix:</span>
                <strong>5 Columns × 11 Rows (55 Labels)</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '6px', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ color: '#64748b' }}>Horizontal Outer Margin:</span>
                <strong>0.40" (28.8 pt / 10.16 mm)</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '6px', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ color: '#64748b' }}>Vertical Outer Margin:</span>
                <strong>0.30" (21.6 pt / 7.62 mm)</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '6px', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ color: '#64748b' }}>Column Gutters:</span>
                <strong>0.30" (21.6 pt / 7.62 mm)</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Row Gutters (Cutting):</span>
                <strong style={{ color: '#0066cc' }}>6.48 pt (~2.28 mm)</strong>
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
          />
        </div>
      </div>
    </div>
  );
}
