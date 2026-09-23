import React from 'react';
import {
  LayoutDashboard,
  Barcode,
  Grid,
  FileText,
  ListOrdered,
  Sliders,
  Settings as SettingsIcon,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';

const MENU_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'generator', label: 'Barcode Generator', icon: Barcode, badge: 'Core' },
  { id: 'layout', label: 'Sheet Layout Preview', icon: Grid },
  { id: 'batches', label: 'Saved Batches', icon: FileText },
  { id: 'records', label: 'Barcode Records', icon: ListOrdered },
  { id: 'templates', label: 'Template Manager', icon: Sliders },
  { id: 'settings', label: 'Settings', icon: SettingsIcon },
];

export default function Sidebar({ activeTab, onSelectTab }) {
  return (
    <aside
      style={{
        width: '240px',
        backgroundColor: '#ffffff',
        borderRight: '1px solid #e2e8f0',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '16px 12px',
        minHeight: 'calc(100vh - 64px)',
      }}
    >
      <div>
        <div style={{ padding: '0 8px 12px 8px', fontSize: '11px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
          Main Navigation
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {MENU_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: isActive ? '#e0effe' : 'transparent',
                  color: isActive ? '#0284c7' : '#475569',
                  fontWeight: isActive ? '700' : '500',
                  fontSize: '13.5px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease',
                  width: '100%',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Icon size={18} color={isActive ? '#0284c7' : '#64748b'} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    style={{
                      fontSize: '10px',
                      fontWeight: '700',
                      padding: '1px 5px',
                      borderRadius: '4px',
                      backgroundColor: isActive ? '#0284c7' : '#f1f5f9',
                      color: isActive ? '#ffffff' : '#64748b',
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Info Box */}
      <div
        style={{
          padding: '14px',
          backgroundColor: '#f8fafc',
          borderRadius: '10px',
          border: '1px solid #e2e8f0',
          fontSize: '12px',
          color: '#64748b',
        }}
      >
        <div style={{ fontWeight: '700', color: '#0f172a', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '5px' }}>
          Vidhyut Saathi
        </div>
        <div style={{ lineHeight: '1.4', fontSize: '11.5px' }}>
          Official 10-Year Saver Card Print Layout Engine.
        </div>
        <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '11px', fontWeight: '600', color: '#0284c7' }}>v1.0.0 Production</span>
          <a
            href="https://www.vidhyutsaathi.com"
            target="_blank"
            rel="noreferrer"
            style={{ color: '#64748b', display: 'flex', alignItems: 'center' }}
          >
            <ExternalLink size={12} />
          </a>
        </div>
      </div>
    </aside>
  );
}
