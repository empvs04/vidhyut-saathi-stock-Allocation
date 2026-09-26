import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import BarcodeGenerator from './pages/BarcodeGenerator';
import RangeLabelGenerator from './pages/RangeLabelGenerator';
import SheetLayoutPreview from './pages/SheetLayoutPreview';
import SavedBatches from './pages/SavedBatches';
import BarcodeRecords from './pages/BarcodeRecords';
import TemplateManagement from './pages/TemplateManagement';
import Settings from './pages/Settings';
import PDFModal from './components/PDFModal';
import ScannerModal from './components/ScannerModal';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [previewBatch, setPreviewBatch] = useState(null);
  const [scannerOpen, setScannerOpen] = useState(false);

  const handleNavigate = (tab) => {
    if (tab === 'scanner') {
      setScannerOpen(true);
    } else {
      setActiveTab(tab);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Navbar */}
      <Navbar onNavigate={handleNavigate} activeTab={activeTab} />

      {/* Main Body with Sidebar + Content */}
      <div style={{ display: 'flex', flex: 1 }}>
        <Sidebar activeTab={activeTab} onSelectTab={handleNavigate} />

        <main style={{ flex: 1, padding: '24px 28px', overflowY: 'auto' }}>
          {activeTab === 'dashboard' && (
            <Dashboard
              onNavigate={handleNavigate}
              onPreviewBatch={(b) => setPreviewBatch(b)}
            />
          )}

          {activeTab === 'generator' && (
            <BarcodeGenerator
              onBatchCompleted={(b) => {}}
              onPreviewBatch={(b) => setPreviewBatch(b)}
            />
          )}

          {activeTab === 'range_generator' && (
            <RangeLabelGenerator
              onPreviewBatch={(b) => setPreviewBatch(b)}
            />
          )}

          {activeTab === 'layout' && <SheetLayoutPreview />}

          {activeTab === 'batches' && (
            <SavedBatches
              onPreviewBatch={(b) => setPreviewBatch(b)}
              onNavigate={handleNavigate}
            />
          )}

          {activeTab === 'records' && (
            <BarcodeRecords onOpenScanner={() => setScannerOpen(true)} />
          )}

          {activeTab === 'templates' && <TemplateManagement />}

          {activeTab === 'settings' && <Settings />}
        </main>
      </div>

      {/* PDF Preview Modal */}
      {previewBatch && (
        <PDFModal
          batch={previewBatch}
          onClose={() => setPreviewBatch(null)}
        />
      )}

      {/* Barcode Scanner Modal */}
      {scannerOpen && (
        <ScannerModal onClose={() => setScannerOpen(false)} />
      )}
    </div>
  );
}
