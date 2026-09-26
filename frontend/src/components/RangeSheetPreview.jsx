import React from 'react';

/**
 * RangeSheetPreview: Visual representation of 12x18 sheet for 3:2 Range Labels
 */
export default function RangeSheetPreview({
  layout = {},
  startSerial = '0020231501',
  totalPhysicalLabels = 44,
}) {
  const columns = layout.columns || 4;
  const rows = layout.rows || 11;
  const labelsPerSheet = columns * rows;

  const startNumBig = BigInt(String(startSerial).replace(/\D/g, '') || '20231501');
  const totalLen = String(startSerial).length || 10;

  // Render first page cells
  const cells = [];
  const countToShow = Math.min(labelsPerSheet, totalPhysicalLabels);

  for (let i = 0; i < countToShow; i++) {
    const sStart = String(startNumBig + BigInt(i * 10)).padStart(totalLen, '0');
    const sEnd = String(startNumBig + BigInt(i * 10 + 9)).padStart(totalLen, '0');
    cells.push({ index: i + 1, sStart, sEnd });
  }

  return (
    <div
      style={{
        backgroundColor: '#f8fafc',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '12px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', fontSize: '12px', color: '#64748b' }}>
        <span><strong>12" × 18" Press Sheet</strong> ({columns} cols × {rows} rows)</span>
        <span><strong>{labelsPerSheet} Labels / Page</strong> • 2 mm Cutting Gap</span>
      </div>

      {/* Simulated 12x18 Page (Scaled to fit viewport) */}
      <div
        style={{
          width: '320px',
          height: '480px', // 12x18 aspect ratio (2:3)
          backgroundColor: '#ffffff',
          boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
          border: '1px solid #cbd5e1',
          position: 'relative',
          padding: '12px 14px', // represents margins: top/bottom 0.3", left/right 0.4"
          display: 'grid',
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          gridTemplateRows: `repeat(${rows}, 1fr)`,
          gap: '2px', // represents 2mm cutting gap
          boxSizing: 'border-box',
        }}
      >
        {cells.map((cell) => (
          <div
            key={cell.index}
            style={{
              border: '1px solid #e2e8f0',
              borderRadius: '2px',
              backgroundColor: '#f1f5f9',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '5.5px',
              fontWeight: '700',
              color: '#334155',
              overflow: 'hidden',
              padding: '1px',
              textAlign: 'center',
            }}
            title={`Label ${cell.index}: ${cell.sStart} ----- ${cell.sEnd}`}
          >
            <span>{cell.sStart.slice(-4)}</span>
            <span style={{ fontSize: '4.5px', color: '#94a3b8' }}>to</span>
            <span>{cell.sEnd.slice(-4)}</span>
          </div>
        ))}
      </div>

      <div style={{ fontSize: '11px', color: '#94a3b8', textAlign: 'center' }}>
        Page 1 shows first {countToShow} labels (each label = 10 consecutive serials).
      </div>
    </div>
  );
}
