import React, { useState } from 'react';
import { ZoomIn, ZoomOut, Eye, CheckCircle2, Scissors } from 'lucide-react';
import CardPreview from './CardPreview';

export default function SheetPreview({
  startSerialNumber = '0020231501',
  quantity = 55,
  cardSeries = 'VS',
  pageNumber = 1,
  onSelectLabel,
  customSerials = null,
}) {
  const [zoom, setZoom] = useState(1);
  const [showCutLines, setShowCutLines] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState(0);

  // Compute 55 labels for this page
  const totalSlots = 55;
  const pageStartIndex = (pageNumber - 1) * 55;

  const slots = [];

  if (Array.isArray(customSerials) && customSerials.length > 0) {
    for (let i = 0; i < totalSlots; i++) {
      const idx = pageStartIndex + i;
      const isWithinQuantity = idx < customSerials.length;
      const serial = isWithinQuantity ? customSerials[idx] : null;
      slots.push({
        index: i,
        serial,
        col: i % 5,
        row: Math.floor(i / 5),
        active: isWithinQuantity,
      });
    }
  } else {
    // Parse numeric portion of startSerialNumber
    const match = String(startSerialNumber).trim().match(/^([A-Za-z_-]*)(\d+)$/);
    const prefix = match ? match[1] : '';
    const numStr = match ? match[2] : '0';
    const totalDigits = numStr.length;
    let startBig = BigInt(numStr) + BigInt(pageStartIndex);

    for (let i = 0; i < totalSlots; i++) {
      const isWithinQuantity = pageStartIndex + i < quantity;
      const serial = isWithinQuantity
        ? `${prefix}${startBig.toString().padStart(totalDigits, '0')}`
        : null;
      slots.push({
        index: i,
        serial,
        col: i % 5,
        row: Math.floor(i / 5),
        active: isWithinQuantity,
      });
      if (isWithinQuantity) startBig++;
    }
  }

  // Base dimensions of the preview sheet in px (aspect ratio 12:18 = 2:3)
  const baseWidth = 440;
  const baseHeight = (baseWidth * 18) / 12; // 660px

  const currentSelectedSerial = slots[selectedSlot]?.serial || startSerialNumber;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {/* Control bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#f8fafc',
          padding: '8px 12px',
          borderRadius: '8px',
          border: '1px solid #e2e8f0',
        }}
      >
        <div style={{ fontSize: '13px', fontWeight: '600', color: '#334155', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>12" × 18" Sheet Preview</span>
          <span className="badge badge-primary">Page {pageNumber} (55 Labels)</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            className="btn btn-secondary"
            style={{ padding: '5px 10px', fontSize: '12px' }}
            onClick={() => setShowCutLines(!showCutLines)}
          >
            <Scissors size={14} color={showCutLines ? '#f97316' : '#64748b'} />
            {showCutLines ? 'Hide Cut Lines' : 'Show Cut Lines'}
          </button>

          <button
            type="button"
            className="btn btn-secondary"
            style={{ padding: '5px 8px' }}
            onClick={() => setZoom((z) => Math.max(0.7, Number((z - 0.1).toFixed(1))))}
            disabled={zoom <= 0.7}
          >
            <ZoomOut size={14} />
          </button>
          <span style={{ fontSize: '12px', fontWeight: '600', minWidth: '40px', textAlign: 'center' }}>
            {Math.round(zoom * 100)}%
          </span>
          <button
            type="button"
            className="btn btn-secondary"
            style={{ padding: '5px 8px' }}
            onClick={() => setZoom((z) => Math.min(1.5, Number((z + 0.1).toFixed(1))))}
            disabled={zoom >= 1.5}
          >
            <ZoomIn size={14} />
          </button>
        </div>
      </div>

      {/* Main Sheet Container */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          padding: '16px',
          backgroundColor: '#e2e8f0',
          borderRadius: '12px',
          overflowX: 'auto',
          maxHeight: '620px',
        }}
      >
        <div
          style={{
            width: `${baseWidth * zoom}px`,
            height: `${baseHeight * zoom}px`,
            backgroundColor: '#ffffff',
            boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
            position: 'relative',
            border: '1px solid #cbd5e1',
            padding: `${(baseHeight * zoom * 0.3) / 18}px ${(baseWidth * zoom * 0.4) / 12}px`, // 0.3" V, 0.4" H margins
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            transformOrigin: 'top center',
            transition: 'all 0.15s ease',
          }}
        >
          {/* Header Title on Sheet Margin */}
          <div
            style={{
              position: 'absolute',
              top: '4px',
              left: '12px',
              fontSize: `${Math.max(7, 8 * zoom)}px`,
              fontWeight: '700',
              color: '#94a3b8',
              letterSpacing: '0.4px',
            }}
          >
            VIDHYUT SAATHI PRINT SHEET • 12" × 18" (55 LABELS)
          </div>

          {/* 5 cols x 11 rows Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(5, 1fr)',
              gridTemplateRows: 'repeat(11, 1fr)',
              gap: `${2.8 * zoom}px ${4.5 * zoom}px`, // Gutters: ~2mm
              width: '100%',
              height: '100%',
            }}
          >
            {slots.map((slot) => {
              const isSelected = selectedSlot === slot.index;
              return (
                <div
                  key={slot.index}
                  onClick={() => {
                    setSelectedSlot(slot.index);
                    if (onSelectLabel && slot.serial) {
                      onSelectLabel(slot.serial);
                    }
                  }}
                  style={{
                    backgroundColor: slot.active ? '#ffffff' : '#f8fafc',
                    border: isSelected
                      ? '2px solid #0066cc'
                      : showCutLines
                      ? '1px dashed #cbd5e1'
                      : '1px solid #e2e8f0',
                    borderRadius: `${4 * zoom}px`,
                    position: 'relative',
                    cursor: slot.active ? 'pointer' : 'default',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    padding: `${2 * zoom}px`,
                    boxShadow: isSelected ? '0 0 0 2px rgba(0,102,204,0.2)' : 'none',
                    transition: 'all 0.1s ease',
                  }}
                  title={slot.serial ? `Slot #${slot.index + 1}: ${slot.serial}` : 'Empty Slot'}
                >
                  {slot.active ? (
                    <>
                      {/* Mini Thumbnail Artwork */}
                      <img
                        src="/clean_label_template.png"
                        alt="label"
                        style={{
                          width: '100%',
                          height: '62%',
                          objectFit: 'contain',
                          pointerEvents: 'none',
                        }}
                      />
                      {/* Mini Barcode Bars */}
                      <div
                        style={{
                          height: `${4 * zoom}px`,
                          backgroundColor: '#000000',
                          width: '85%',
                          margin: '0 auto',
                          opacity: 0.9,
                        }}
                      />
                      {/* Serial Text */}
                      <div
                        style={{
                          fontSize: `${Math.max(5, 6 * zoom)}px`,
                          fontWeight: '800',
                          textAlign: 'center',
                          fontFamily: 'monospace',
                          color: '#0f172a',
                          lineHeight: 1,
                        }}
                      >
                        {slot.serial ? slot.serial.slice(-6) : ''}
                      </div>
                    </>
                  ) : (
                    <div
                      style={{
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '9px',
                        color: '#cbd5e1',
                      }}
                    >
                      -
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Footer note on sheet */}
          <div
            style={{
              position: 'absolute',
              bottom: '3px',
              right: '12px',
              fontSize: `${Math.max(7, 7.5 * zoom)}px`,
              fontWeight: '600',
              color: '#94a3b8',
            }}
          >
            Actual Print Dimensions: 864 × 1296 pt (100% Scale)
          </div>
        </div>
      </div>

      {/* Selected Slot Inspector */}
      {slots[selectedSlot] && slots[selectedSlot].serial && (
        <div
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '10px',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: '#e0effe',
                color: '#0284c7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '700',
                fontSize: '13px',
              }}
            >
              #{selectedSlot + 1}
            </div>
            <div>
              <div style={{ fontSize: '13.5px', fontWeight: '700', color: '#0f172a' }}>
                Serial: <span style={{ fontFamily: 'monospace', color: '#0066cc' }}>{slots[selectedSlot].serial}</span>
              </div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>
                Column {slots[selectedSlot].col + 1} of 5 • Row {slots[selectedSlot].row + 1} of 11 • Target Size: 2" × 1.5"
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="badge badge-success">
              <CheckCircle2 size={12} />
              Code 128 Valid
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
