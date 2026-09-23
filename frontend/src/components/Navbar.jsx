import React, { useState, useEffect } from 'react';
import { ShieldCheck, Activity, Printer, Database, Sparkles } from 'lucide-react';
import { StatsAPI } from '../services/api';

export default function Navbar({ onNavigate, activeTab }) {
  const [serverStatus, setServerStatus] = useState('checking');

  useEffect(() => {
    StatsAPI.getHealth()
      .then(() => setServerStatus('online'))
      .catch(() => setServerStatus('offline'));
    const interval = setInterval(() => {
      StatsAPI.getHealth()
        .then(() => setServerStatus('online'))
        .catch(() => setServerStatus('offline'));
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header style={{
      height: '64px',
      backgroundColor: '#ffffff',
      borderBottom: '1px solid #e2e8f0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      position: 'sticky',
      top: 0,
      zIndex: 40,
      boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
    }}>
      {/* Brand & Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          cursor: 'pointer'
        }} onClick={() => onNavigate('dashboard')}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '8px',
            backgroundColor: '#0066cc',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            fontWeight: '800',
            fontSize: '18px',
            letterSpacing: '0.5px'
          }}>
            VS
          </div>
          <div>
            <div style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.3px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              VIDHYUT SAATHI
              <span style={{ fontSize: '11px', fontWeight: '700', padding: '1px 6px', backgroundColor: '#e0effe', color: '#0369a1', borderRadius: '4px' }}>
                PRINT ENGINE
              </span>
            </div>
            <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '500' }}>
              Barcode Generator & 12" × 18" PDF Sheet Management System
            </div>
          </div>
        </div>
      </div>

      {/* Center Status Indicators */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', color: '#475569' }}>
          <span style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: serverStatus === 'online' ? '#10b981' : '#ef4444',
            display: 'inline-block',
            boxShadow: serverStatus === 'online' ? '0 0 6px #10b981' : 'none'
          }} />
          <span style={{ fontWeight: '600' }}>Engine:</span>
          <span style={{ textTransform: 'capitalize' }}>{serverStatus}</span>
        </div>

        <div style={{ height: '18px', width: '1px', backgroundColor: '#e2e8f0' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', color: '#475569' }}>
          <Printer size={15} color="#0284c7" />
          <span>Sheet: <strong style={{ color: '#0f172a' }}>12" × 18"</strong> (55 Labels)</span>
        </div>

        <div style={{ height: '18px', width: '1px', backgroundColor: '#e2e8f0' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', color: '#475569' }}>
          <Database size={15} color="#10b981" />
          <span>Symbology: <strong style={{ color: '#0f172a' }}>Code 128</strong></span>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <button
          className="btn btn-outline"
          style={{ fontSize: '13px', padding: '7px 12px' }}
          onClick={() => onNavigate('scanner')}
        >
          <ShieldCheck size={16} />
          Scan Verify
        </button>

        <button
          className="btn btn-primary"
          style={{ fontSize: '13px', padding: '7px 14px' }}
          onClick={() => onNavigate('generator')}
        >
          <Sparkles size={16} />
          Generate Batch
        </button>
      </div>
    </header>
  );
}
