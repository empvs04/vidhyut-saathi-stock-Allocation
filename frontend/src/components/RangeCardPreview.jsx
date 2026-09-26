import React from 'react';

/**
 * RangeCardPreview: Live preview for 10-Serial Range Labels
 * Dedicated 3:2 aspect ratio preview component.
 * Uses the exact master template with dynamic serial-number range overlay.
 */
export default function RangeCardPreview({
  startSerial = '0020231501',
  endSerial = '0020231510',
  width = 420, // Visual width in px (maintains 3:2 ratio)
  labelIndex = 1,
  totalLabels = 1,
  onPrevLabel,
  onNextLabel,
}) {
  const height = (width * 2) / 3; // Exact 3:2 aspect ratio (1.5" / 2.25" = 2/3)
  const rangeText = `${startSerial} ----- ${endSerial}`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
      {/* Outer Card Container */}
      <div
        style={{
          width: `${width}px`,
          height: `${height}px`,
          position: 'relative',
          borderRadius: '12px',
          overflow: 'hidden',
          backgroundColor: '#ffffff',
          boxShadow: '0 10px 25px rgba(0,0,0,0.12), 0 3px 8px rgba(0,0,0,0.06)',
          border: '1px solid #cbd5e1',
          userSelect: 'none',
        }}
      >
        {/* Approved Clean Background Template Artwork */}
        <img
          src="/range_label_clean_template.png"
          alt="Vidhyut Saathi 10-Serial Range Label Master Template"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            display: 'block',
            pointerEvents: 'none',
          }}
          onError={(e) => {
            // Fallback to standard master if clean template loading delayed
            e.target.src = '/range_label_template.png';
          }}
        />

        {/* Dynamic Range Text Overlay in designated position */}
        <div
          style={{
            position: 'absolute',
            top: '74.2%',
            left: '5%',
            width: '90%',
            textAlign: 'center',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            pointerEvents: 'none',
          }}
        >
          <span
            style={{
              fontFamily: "Arial, Helvetica, 'Segoe UI', sans-serif",
              fontWeight: 800,
              fontSize: `${Math.round(44 * (width / 1024))}px`,
              color: '#000000',
              letterSpacing: '0.8px',
              whiteSpace: 'nowrap',
            }}
          >
            {rangeText}
          </span>
        </div>

        {/* 3:2 Aspect Ratio Badge */}
        <div
          style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            backgroundColor: 'rgba(15, 23, 42, 0.75)',
            color: '#38bdf8',
            fontSize: '9.5px',
            fontWeight: '700',
            padding: '2px 6px',
            borderRadius: '4px',
            letterSpacing: '0.5px',
            backdropFilter: 'blur(4px)',
          }}
        >
          3:2 RATIO
        </div>
      </div>

      {/* Interactive Label Stepper Controls */}
      {totalLabels > 1 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            backgroundColor: '#f8fafc',
            padding: '6px 14px',
            borderRadius: '20px',
            border: '1px solid #e2e8f0',
            fontSize: '12.5px',
            color: '#475569',
            fontWeight: '600',
          }}
        >
          <button
            onClick={onPrevLabel}
            disabled={labelIndex <= 1}
            style={{
              border: 'none',
              backgroundColor: labelIndex <= 1 ? '#e2e8f0' : '#0284c7',
              color: labelIndex <= 1 ? '#94a3b8' : '#ffffff',
              borderRadius: '50%',
              width: '24px',
              height: '24px',
              cursor: labelIndex <= 1 ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '700',
              fontSize: '13px',
              transition: 'all 0.15s ease',
            }}
          >
            ‹
          </button>
          <span>
            Preview Label {labelIndex} of {totalLabels}
          </span>
          <button
            onClick={onNextLabel}
            disabled={labelIndex >= totalLabels}
            style={{
              border: 'none',
              backgroundColor: labelIndex >= totalLabels ? '#e2e8f0' : '#0284c7',
              color: labelIndex >= totalLabels ? '#94a3b8' : '#ffffff',
              borderRadius: '50%',
              width: '24px',
              height: '24px',
              cursor: labelIndex >= totalLabels ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '700',
              fontSize: '13px',
              transition: 'all 0.15s ease',
            }}
          >
            ›
          </button>
        </div>
      )}
    </div>
  );
}
