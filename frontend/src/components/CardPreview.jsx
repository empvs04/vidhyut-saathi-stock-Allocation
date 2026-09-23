import React, { useMemo } from 'react';

/**
 * Generate simulated Code 128 bar pattern SVG for live browser preview
 */
function generateCode128SvgPattern(text) {
  // Simple deterministic bar generation based on character codes to provide accurate visual density
  const clean = String(text || '0020231501');
  const bars = [];
  let currentX = 0;

  // Quiet zone at start
  currentX += 8;

  // Start pattern
  bars.push({ x: currentX, width: 2 });
  currentX += 4;
  bars.push({ x: currentX, width: 1 });
  currentX += 3;

  for (let i = 0; i < clean.length; i++) {
    const charCode = clean.charCodeAt(i);
    const pattern = [
      (charCode % 3) + 1,
      ((charCode * 2) % 3) + 1,
      ((charCode * 3) % 2) + 1,
      ((charCode + 1) % 3) + 1,
    ];

    for (let p = 0; p < pattern.length; p++) {
      if (p % 2 === 0) {
        bars.push({ x: currentX, width: pattern[p] });
      }
      currentX += pattern[p] + 1;
    }
  }

  // Stop pattern
  bars.push({ x: currentX, width: 2 });
  currentX += 4;
  bars.push({ x: currentX, width: 3 });
  currentX += 5;

  return { bars, totalWidth: currentX + 8 };
}

export default function CardPreview({
  serialNumber = '0020231501',
  width = 360, // visual width in px (maintains 4:3 aspect ratio)
  showCropGuides = false,
}) {
  const height = (width * 3) / 4; // exact 4:3 aspect ratio (1.5" / 2" = 3/4)
  const pattern = useMemo(() => generateCode128SvgPattern(serialNumber), [serialNumber]);

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      {/* Outer Card Container */}
      <div
        style={{
          width: `${width}px`,
          height: `${height}px`,
          position: 'relative',
          borderRadius: '12px',
          overflow: 'hidden',
          backgroundColor: '#ffffff',
          boxShadow: '0 8px 20px rgba(0,0,0,0.12), 0 2px 6px rgba(0,0,0,0.06)',
          border: '1px solid #cbd5e1',
          userSelect: 'none',
        }}
      >
        {/* Approved Background Template Artwork (Immutable) */}
        <img
          src="/clean_label_template.png"
          alt="Vidhyut Saathi Approved Label Template"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            display: 'block',
            pointerEvents: 'none',
          }}
          onError={(e) => {
            // Fallback placeholder if public image loading has delay
            e.target.style.display = 'none';
          }}
        />

        {/* Dynamic Barcode Overlay in Designated Area */}
        <div
          style={{
            position: 'absolute',
            top: '60.5%',
            left: '3%',
            width: '94%',
            height: '29.5%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-start',
            paddingTop: '6px',
            gap: '3px',
            pointerEvents: 'none',
          }}
        >
          {/* Barcode Bars SVG */}
          <svg
            viewBox={`0 0 ${pattern.totalWidth} 40`}
            style={{
              width: '68%',
              height: '36%',
              shapeRendering: 'crispEdges',
            }}
          >
            {pattern.bars.map((bar, idx) => (
              <rect
                key={idx}
                x={bar.x}
                y={0}
                width={bar.width}
                height={40}
                fill="#000000"
              />
            ))}
          </svg>

          {/* Human Readable Serial Number below barcode inside the same box */}
          <div
            style={{
              fontSize: `${Math.max(8.5, width * 0.028)}px`,
              fontWeight: '700',
              fontFamily: "'Courier New', 'Courier', monospace",
              color: '#000000',
              letterSpacing: '0.6px',
              lineHeight: '1',
              textAlign: 'center',
            }}
          >
            {serialNumber}
          </div>
        </div>

        {/* Optional Crop Guides overlay */}
        {showCropGuides && (
          <div
            style={{
              position: 'absolute',
              inset: '4px',
              border: '1px dashed #f97316',
              pointerEvents: 'none',
              borderRadius: '8px',
            }}
          >
            <span
              style={{
                position: 'absolute',
                top: '2px',
                right: '4px',
                fontSize: '9px',
                fontWeight: '700',
                color: '#f97316',
                backgroundColor: 'rgba(255,255,255,0.85)',
                padding: '1px 4px',
                borderRadius: '3px',
              }}
            >
              2" × 1.5"
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
