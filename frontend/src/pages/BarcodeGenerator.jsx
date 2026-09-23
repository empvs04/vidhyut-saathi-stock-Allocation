import React, { useState, useEffect, useRef } from 'react';
import * as XLSX from 'xlsx';
import {
  Barcode,
  Printer,
  Sparkles,
  AlertTriangle,
  CheckCircle,
  FileCheck,
  Download,
  Eye,
  Sliders,
  RefreshCw,
  FileSpreadsheet,
  UploadCloud,
  FileText,
  Table,
  X,
} from 'lucide-react';
import { BatchesAPI, TemplatesAPI, RecordsAPI } from '../services/api';
import SheetPreview from '../components/SheetPreview';
import CardPreview from '../components/CardPreview';

export const SHEET_PRESETS_OPTIONS = [
  {
    id: '12x18_default',
    name: '12 × 18 inch (Default)',
    label: '12 × 18 inch (Default) — 55 Labels',
    sheetWidthInches: 12.0,
    sheetHeightInches: 18.0,
    labelWidthInches: 2.0,
    labelHeightInches: 1.5,
    columns: 5,
    rows: 11,
    labelsPerSheet: 55,
    marginHorizontalInches: 0.4,
    marginVerticalInches: 0.3,
    badge: 'Commercial Press',
    isCustom: false,
  },
  {
    id: 'a4_2x1_5',
    name: '1:- A4 — 2 × 1.5 inch labels',
    label: '1:- A4 — 2 × 1.5 inch labels (21 Labels)',
    sheetWidthInches: 8.27,
    sheetHeightInches: 11.69,
    labelWidthInches: 2.0,
    labelHeightInches: 1.5,
    columns: 3,
    rows: 7,
    labelsPerSheet: 21,
    marginHorizontalInches: 0.45,
    marginVerticalInches: 0.40,
    badge: 'A4 Office Sheet',
    isCustom: false,
  },
  {
    id: '12x18_2x1_5',
    name: '2:- 12 × 18 inch — 2 × 1.5 inch labels',
    label: '2:- 12 × 18 inch — 2 × 1.5 inch labels (55 Labels)',
    sheetWidthInches: 12.0,
    sheetHeightInches: 18.0,
    labelWidthInches: 2.0,
    labelHeightInches: 1.5,
    columns: 5,
    rows: 11,
    labelsPerSheet: 55,
    marginHorizontalInches: 0.4,
    marginVerticalInches: 0.3,
    badge: '12×18 Sheet',
    isCustom: false,
  },
  {
    id: 'a3_custom',
    name: '3:- A3 — Custom label layout',
    label: '3:- A3 — Custom label layout (Configurable / Default 50 Labels)',
    sheetWidthInches: 11.69,
    sheetHeightInches: 16.54,
    labelWidthInches: 2.0,
    labelHeightInches: 1.5,
    columns: 5,
    rows: 10,
    labelsPerSheet: 50,
    marginHorizontalInches: 0.45,
    marginVerticalInches: 0.40,
    badge: 'A3 Custom Layout',
    isCustom: true,
  },
];

export default function BarcodeGenerator({ onBatchCompleted, onPreviewBatch }) {
  // Mode State: 'sequential' | 'excel' | 'single'
  const [inputMode, setInputMode] = useState('sequential');

  // Sheet Size Presets State
  const [selectedSheetPresetId, setSelectedSheetPresetId] = useState('12x18_default');
  const [customCols, setCustomCols] = useState(5);
  const [customRows, setCustomRows] = useState(10);
  const [customLabelW, setCustomLabelW] = useState(2.0);
  const [customLabelH, setCustomLabelH] = useState(1.5);

  // Form State (Sequential)
  const [batchName, setBatchName] = useState('Vidhyut Saathi Batch A');
  const [cardSeries, setCardSeries] = useState('VS');
  const [startSerialNumber, setStartSerialNumber] = useState('0020231501');
  const [quantity, setQuantity] = useState(55);
  const [barcodeType, setBarcodeType] = useState('CODE128');
  const [templateId, setTemplateId] = useState('');
  const [templates, setTemplates] = useState([]);

  // Single Label State
  const [singleSerial, setSingleSerial] = useState('0020231501');
  const [singleRegistered, setSingleRegistered] = useState(false);
  const [registeringSingle, setRegisteringSingle] = useState(false);
  const [singleStatus, setSingleStatus] = useState(null);

  // Excel Import State
  const [excelFileName, setExcelFileName] = useState('');
  const [importedSerials, setImportedSerials] = useState([]);
  const [excelPreviewRows, setExcelPreviewRows] = useState([]);
  const [excelColumns, setExcelColumns] = useState([]);
  const [selectedSerialColumn, setSelectedSerialColumn] = useState('');
  const [selectedSeriesColumn, setSelectedSeriesColumn] = useState('');
  const [rawExcelRows, setRawExcelRows] = useState([]);
  const [parsingExcel, setParsingExcel] = useState(false);
  const [excelError, setExcelError] = useState(null);
  const fileInputRef = useRef(null);

  // Layout Settings (Margins)
  const [marginH, setMarginH] = useState(0.4);
  const [marginV, setMarginV] = useState(0.3);

  // Derived current layout preset
  const basePreset = SHEET_PRESETS_OPTIONS.find((p) => p.id === selectedSheetPresetId) || SHEET_PRESETS_OPTIONS[0];
  const currentPreset = {
    ...basePreset,
    columns: selectedSheetPresetId === 'a3_custom' ? (parseInt(customCols, 10) || 5) : basePreset.columns,
    rows: selectedSheetPresetId === 'a3_custom' ? (parseInt(customRows, 10) || 10) : basePreset.rows,
    labelWidthInches: selectedSheetPresetId === 'a3_custom' ? (parseFloat(customLabelW) || 2.0) : basePreset.labelWidthInches,
    labelHeightInches: selectedSheetPresetId === 'a3_custom' ? (parseFloat(customLabelH) || 1.5) : basePreset.labelHeightInches,
    labelsPerSheet:
      selectedSheetPresetId === 'a3_custom'
        ? (parseInt(customCols, 10) || 5) * (parseInt(customRows, 10) || 10)
        : basePreset.labelsPerSheet,
    marginHorizontalInches: parseFloat(marginH) || basePreset.marginHorizontalInches,
    marginVerticalInches: parseFloat(marginV) || basePreset.marginVerticalInches,
  };

  const handleSheetPresetChange = (presetId) => {
    setSelectedSheetPresetId(presetId);
    const target = SHEET_PRESETS_OPTIONS.find((p) => p.id === presetId) || SHEET_PRESETS_OPTIONS[0];
    setMarginH(target.marginHorizontalInches);
    setMarginV(target.marginVerticalInches);
    if (presetId === 'a3_custom') {
      setCustomCols(5);
      setCustomRows(10);
      setCustomLabelW(2.0);
      setCustomLabelH(1.5);
    }
    // Update default quantity if current is default sheet count
    if (quantity === 55 || quantity === 21 || quantity === 50) {
      setQuantity(target.labelsPerSheet);
    }
  };

  // Validation & Live Status State
  const [validating, setValidating] = useState(false);
  const [validationResult, setValidationResult] = useState(null);
  const [validationError, setValidationError] = useState(null);

  // Generation & Progress State
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentBatch, setCurrentBatch] = useState(null);
  const [generationError, setGenerationError] = useState(null);

  // Minimum Series Constants
  const MIN_START_SERIAL = '0020231501';
  const MIN_START_NUMERIC = 20231501n;

  // Check if serial is below 0020231501
  const isSerialBelowMin = (serialStr) => {
    if (!serialStr) return false;
    const match = String(serialStr).trim().match(/^([A-Za-z_-]*)(\d+)$/);
    if (!match) return false;
    try {
      return BigInt(match[2]) < MIN_START_NUMERIC;
    } catch {
      return false;
    }
  };

  // Fetch next available serial number from MongoDB / database
  const fetchNextSerial = async (series = cardSeries, updateSingle = false) => {
    try {
      const res = await BatchesAPI.getNextSerial(series);
      if (res.data?.success && res.data.nextSerialNumber) {
        setStartSerialNumber(res.data.nextSerialNumber);
        if (updateSingle || singleSerial === '0020231501' || isSerialBelowMin(singleSerial)) {
          setSingleSerial(res.data.nextSerialNumber);
        }
      }
    } catch (err) {
      console.warn('Failed to fetch next serial from DB:', err.message);
    }
  };

  // Load templates and fetch next serial on mount or series change
  useEffect(() => {
    TemplatesAPI.getTemplates()
      .then((res) => {
        if (res.data.success && res.data.templates.length > 0) {
          setTemplates(res.data.templates);
          setTemplateId(res.data.templates[0]._id);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    fetchNextSerial(cardSeries, false);
  }, [cardSeries]);

  // Pre-flight validate sequential range when inputs change
  useEffect(() => {
    if (inputMode !== 'sequential') return;
    if (!startSerialNumber || !quantity || quantity < 1) return;

    const timer = setTimeout(() => {
      setValidating(true);
      setValidationError(null);
      BatchesAPI.validateRange({
        startSerialNumber,
        quantity: parseInt(quantity, 10),
        cardSeries,
        sheetSize: selectedSheetPresetId,
        layoutConfig: {
          preset: selectedSheetPresetId,
          columns: currentPreset.columns,
          rows: currentPreset.rows,
          labelWidthInches: currentPreset.labelWidthInches,
          labelHeightInches: currentPreset.labelHeightInches,
          marginHorizontalInches: parseFloat(marginH),
          marginVerticalInches: parseFloat(marginV),
        },
      })
        .then((res) => {
          if (res.data.success) {
            setValidationResult(res.data);
          }
        })
        .catch((err) => {
          setValidationResult(null);
          setValidationError(err.response?.data?.message || err.message);
        })
        .finally(() => setValidating(false));
    }, 400);

    return () => clearTimeout(timer);
  }, [inputMode, startSerialNumber, quantity, cardSeries, selectedSheetPresetId, marginH, marginV, customCols, customRows, customLabelW, customLabelH]);

  // Pre-flight validate single serial when in single mode
  useEffect(() => {
    if (inputMode !== 'single') return;
    if (!singleSerial || !singleSerial.trim()) return;

    const timer = setTimeout(() => {
      setValidating(true);
      BatchesAPI.validateRange({
        startSerialNumber: singleSerial.trim(),
        quantity: 1,
        cardSeries,
      })
        .then((res) => {
          if (res.data.success) {
            setSingleStatus({ valid: true, message: `Serial ${singleSerial.trim()} is available.` });
            setValidationError(null);
          }
        })
        .catch((err) => {
          setSingleStatus({ valid: false, message: err.response?.data?.message || 'Conflict detected.' });
          setValidationError(err.response?.data?.message || 'Conflict detected.');
        })
        .finally(() => setValidating(false));
    }, 350);

    return () => clearTimeout(timer);
  }, [inputMode, singleSerial, cardSeries]);

  // Quick increment for single serial (+1)
  const handleIncrementSingleSerial = () => {
    const match = singleSerial.match(/^([A-Za-z_-]*)(\d+)$/);
    if (match) {
      const prefix = match[1];
      const numStr = match[2];
      const curNum = BigInt(numStr);
      const nextNum = curNum < MIN_START_NUMERIC ? MIN_START_NUMERIC : curNum + 1n;
      const padded = nextNum.toString().padStart(Math.max(10, numStr.length), '0');
      setSingleSerial(`${prefix}${padded}`);
      setSingleRegistered(false);
    } else {
      setSingleSerial(MIN_START_SERIAL);
      setSingleRegistered(false);
    }
  };

  // Register single label into database records
  const handleRegisterSingleLabel = async () => {
    setRegisteringSingle(true);
    try {
      const res = await RecordsAPI.registerSingleLabel({
        serialNumber: singleSerial.trim(),
        cardSeries,
      });
      if (res.data.success) {
        setSingleRegistered(true);
        setSingleStatus({ valid: true, message: `"${singleSerial.trim()}" registered in database records!` });
      }
    } catch (err) {
      setValidationError(err.response?.data?.message || 'Failed to register record.');
    } finally {
      setRegisteringSingle(false);
    }
  };

  // Direct print single label via browser print
  const handlePrintSingleLabel = () => {
    const previewUrl = RecordsAPI.getSingleLabelPreviewUrl(singleSerial.trim(), cardSeries);
    const printWindow = window.open(previewUrl, '_blank');
    if (printWindow) {
      printWindow.focus();
    }
  };

  // Download Sample Excel Template (.xlsx) with leading zeros preserved
  const handleDownloadSampleTemplate = () => {
    const wb = XLSX.utils.book_new();
    const headers = ['Series', 'Serial Number', 'Description'];
    const sampleRows = [
      ['VS', '0020231501', '10-Year Energy Saver Card'],
      ['VS', '0020231502', '10-Year Energy Saver Card'],
      ['VS', '0020231503', '10-Year Energy Saver Card'],
      ['VS', '0020231504', '10-Year Energy Saver Card'],
      ['VS', '0020231505', '10-Year Energy Saver Card'],
      ['VS', '0020231506', '10-Year Energy Saver Card'],
      ['VS', '0020231507', '10-Year Energy Saver Card'],
      ['VS', '0020231508', '10-Year Energy Saver Card'],
      ['VS', '0020231509', '10-Year Energy Saver Card'],
      ['VS', '0020231510', '10-Year Energy Saver Card'],
    ];

    const wsData = [headers, ...sampleRows];
    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // Format serial column as text (type 's') to guarantee leading zeros are preserved in Excel
    const range = XLSX.utils.decode_range(ws['!ref'] || 'A1:C11');
    for (let R = range.s.r + 1; R <= range.e.r; ++R) {
      const serialCellAddress = XLSX.utils.encode_cell({ r: R, c: 1 });
      if (ws[serialCellAddress]) {
        ws[serialCellAddress].t = 's';
      }
    }

    ws['!cols'] = [{ wch: 10 }, { wch: 22 }, { wch: 30 }];
    XLSX.utils.book_append_sheet(wb, ws, 'Sample Serials');
    XLSX.writeFile(wb, 'Vidhyut_Saathi_Sample_Serials.xlsx');
  };

  // Handle Excel / CSV File Upload
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setExcelFileName(file.name);
    setParsingExcel(true);
    setExcelError(null);
    setValidationError(null);
    setValidationResult(null);

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target.result;
        // raw: false ensures cell.w formatted text with leading zeros is read
        const wb = XLSX.read(bstr, { type: 'binary', raw: false, cellText: true });
        const firstSheetName = wb.SheetNames[0];
        const ws = wb.Sheets[firstSheetName];

        const data = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '', raw: false });
        if (!data || data.length < 2) {
          throw new Error('The uploaded file has no data rows. Please ensure it has a header and serial rows.');
        }

        const headers = data[0].map((h, i) => (h ? String(h).trim() : `Column ${i + 1}`));
        setExcelColumns(headers);

        // Auto-detect Serial Number column
        let serialColIdx = headers.findIndex((h) =>
          /serial|sr|barcode|number|code|id/i.test(h)
        );
        if (serialColIdx === -1) serialColIdx = headers.length > 1 ? 1 : 0;

        // Auto-detect Series column
        let seriesColIdx = headers.findIndex((h) => /series|prefix|type/i.test(h));

        const rows = data.slice(1);
        setRawExcelRows(rows);

        processExtractedRows(rows, headers, serialColIdx, seriesColIdx);
      } catch (err) {
        setParsingExcel(false);
        setExcelError(err.message || 'Failed to read file.');
      }
    };
    reader.readAsBinaryString(file);
  };

  // Extract and validate serial numbers based on selected column indices
  const processExtractedRows = async (rows, headers, serialIdx, seriesIdx) => {
    try {
      const extracted = [];
      const previews = [];

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const rawVal = row[serialIdx];
        if (rawVal !== undefined && rawVal !== null && String(rawVal).trim() !== '') {
          const serial = String(rawVal).trim();
          const series = seriesIdx !== -1 && row[seriesIdx] ? String(row[seriesIdx]).trim() : cardSeries;
          extracted.push(serial);
          if (previews.length < 6) {
            previews.push({ rowNum: i + 2, serial, series });
          }
        }
      }

      if (extracted.length === 0) {
        throw new Error(`No serial numbers found under column "${headers[serialIdx]}".`);
      }

      setImportedSerials(extracted);
      setExcelPreviewRows(previews);
      setSelectedSerialColumn(headers[serialIdx]);
      if (seriesIdx !== -1) {
        setSelectedSeriesColumn(headers[seriesIdx]);
      }

      // Check duplicates inside the Excel file
      const seen = new Set();
      const duplicates = [];
      for (const s of extracted) {
        if (seen.has(s)) duplicates.push(s);
        else seen.add(s);
      }

      if (duplicates.length > 0) {
        setValidationError(`File contains ${duplicates.length} duplicate serial numbers (e.g. ${duplicates.slice(0, 3).join(', ')}). All serials must be unique.`);
        setParsingExcel(false);
        return;
      }

      // Pre-flight validate with backend
      setValidating(true);
      const res = await BatchesAPI.validateSerials({
        serials: extracted,
        cardSeries,
        sheetSize: selectedSheetPresetId,
        layoutConfig: {
          preset: selectedSheetPresetId,
          columns: currentPreset.columns,
          rows: currentPreset.rows,
          labelWidthInches: currentPreset.labelWidthInches,
          labelHeightInches: currentPreset.labelHeightInches,
          marginHorizontalInches: parseFloat(marginH),
          marginVerticalInches: parseFloat(marginV),
        },
      });
      setValidating(false);

      if (res.data.success) {
        setValidationResult({
          startSerialNumber: res.data.startSerialNumber,
          endSerialNumber: res.data.endSerialNumber,
          quantity: res.data.count,
          totalPages: res.data.totalPages,
        });
        setValidationError(null);
      }
    } catch (err) {
      setValidating(false);
      setValidationError(err.response?.data?.message || err.message);
      setValidationResult(null);
    } finally {
      setParsingExcel(false);
    }
  };

  // Handle user changing column selection
  const handleColumnChange = (newSerialColName) => {
    setSelectedSerialColumn(newSerialColName);
    const sIdx = excelColumns.indexOf(newSerialColName);
    const serIdx = selectedSeriesColumn ? excelColumns.indexOf(selectedSeriesColumn) : -1;
    if (sIdx !== -1 && rawExcelRows.length > 0) {
      setParsingExcel(true);
      processExtractedRows(rawExcelRows, excelColumns, sIdx, serIdx);
    }
  };

  // Clear uploaded file
  const handleClearFile = () => {
    setExcelFileName('');
    setImportedSerials([]);
    setExcelPreviewRows([]);
    setExcelColumns([]);
    setRawExcelRows([]);
    setExcelError(null);
    setValidationError(null);
    setValidationResult(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Handle Generate PDF
  const handleGenerate = async (e) => {
    e.preventDefault();
    if (validationError) return;

    if (inputMode === 'excel' && importedSerials.length === 0) {
      setGenerationError('Please upload a valid Excel or CSV file with serial numbers first.');
      return;
    }

    setGenerating(true);
    setGenerationError(null);
    setProgress(5);

    try {
      const payload = {
        batchName,
        cardSeries,
        barcodeType,
        templateId,
        sheetSize: selectedSheetPresetId,
        layoutConfig: {
          preset: selectedSheetPresetId,
          columns: currentPreset.columns,
          rows: currentPreset.rows,
          labelWidthInches: currentPreset.labelWidthInches,
          labelHeightInches: currentPreset.labelHeightInches,
          marginHorizontalInches: parseFloat(marginH),
          marginVerticalInches: parseFloat(marginV),
        },
      };

      if (inputMode === 'excel') {
        payload.customSerials = importedSerials;
      } else {
        payload.startSerialNumber = startSerialNumber;
        payload.quantity = parseInt(quantity, 10);
      }

      const res = await BatchesAPI.generateBatch(payload);

      const batch = res.data.batch;
      setCurrentBatch(batch);

      // Poll for progress until 100%
      const pollInterval = setInterval(async () => {
        try {
          const checkRes = await BatchesAPI.getBatchById(batch.batchId);
          const updatedBatch = checkRes.data.batch;
          const liveProg = updatedBatch.liveProgress;

          if (liveProg) {
            setProgress(liveProg.percentage || 10);
            if (liveProg.status === 'completed' || updatedBatch.status === 'completed') {
              clearInterval(pollInterval);
              setGenerating(false);
              setProgress(100);
              setCurrentBatch(updatedBatch);
              if (onBatchCompleted) onBatchCompleted(updatedBatch);
              fetchNextSerial(cardSeries, true);
            } else if (liveProg.status === 'failed') {
              clearInterval(pollInterval);
              setGenerating(false);
              setGenerationError(liveProg.errorMessage || 'Batch generation failed.');
            }
          } else if (updatedBatch.status === 'completed') {
            clearInterval(pollInterval);
            setGenerating(false);
            setProgress(100);
            setCurrentBatch(updatedBatch);
            if (onBatchCompleted) onBatchCompleted(updatedBatch);
            fetchNextSerial(cardSeries, true);
          }
        } catch (pollErr) {
          console.error('Error polling batch status:', pollErr);
        }
      }, 800);
    } catch (err) {
      setGenerating(false);
      setGenerationError(err.response?.data?.message || err.message || 'Generation failed.');
    }
  };

  const calculatedPages =
    inputMode === 'excel'
      ? Math.ceil((importedSerials.length || 0) / currentPreset.labelsPerSheet)
      : Math.ceil(parseInt(quantity || 0, 10) / currentPreset.labelsPerSheet);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      {/* Top Layout Dimensions & Sheet Size Selector Bar */}
      <div
        className="card"
        style={{
          padding: '14px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          backgroundColor: '#ffffff',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          {/* Sheet Selector Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#0066cc' }}>
              <Printer size={18} />
              <span style={{ fontSize: '13px', fontWeight: '800', color: '#0f172a' }}>
                Sheet Size:
              </span>
            </div>
            <select
              className="form-select"
              value={selectedSheetPresetId}
              onChange={(e) => handleSheetPresetChange(e.target.value)}
              style={{
                fontWeight: '700',
                color: '#0066cc',
                borderColor: '#93c5fd',
                backgroundColor: '#eff6ff',
                padding: '6px 12px',
                fontSize: '13px',
                minWidth: '290px',
              }}
            >
              {SHEET_PRESETS_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>
            <span className="badge badge-primary">{currentPreset.badge}</span>
          </div>

          {/* Quick Metrics Breakdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <div style={{ fontSize: '12.5px', color: '#475569' }}>
              Sheet: <strong style={{ color: '#0f172a' }}>{currentPreset.sheetWidthInches}" × {currentPreset.sheetHeightInches}"</strong> ({Math.round(currentPreset.sheetWidthInches * 72)} × {Math.round(currentPreset.sheetHeightInches * 72)} pt)
            </div>

            <div style={{ height: '16px', width: '1px', backgroundColor: '#e2e8f0' }} />

            <div style={{ fontSize: '12.5px', color: '#475569' }}>
              Label: <strong style={{ color: '#0f172a' }}>{currentPreset.labelWidthInches}" × {currentPreset.labelHeightInches}"</strong> ({Math.round(currentPreset.labelWidthInches * 72)} × {Math.round(currentPreset.labelHeightInches * 72)} pt)
            </div>

            <div style={{ height: '16px', width: '1px', backgroundColor: '#e2e8f0' }} />

            <div style={{ fontSize: '12.5px', color: '#475569' }}>
              Grid: <strong style={{ color: '#0f172a' }}>{currentPreset.columns} cols × {currentPreset.rows} rows</strong> = <strong style={{ color: '#0066cc' }}>{currentPreset.labelsPerSheet} Labels/Sheet</strong>
            </div>

            <div style={{ height: '16px', width: '1px', backgroundColor: '#e2e8f0' }} />

            {/* Margin Controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}>
                <span style={{ color: '#64748b' }}>H-Margin:</span>
                <input
                  type="number"
                  step="0.05"
                  min="0.1"
                  max="1.5"
                  value={marginH}
                  onChange={(e) => setMarginH(e.target.value)}
                  className="form-input"
                  style={{ width: '58px', padding: '3px 6px', fontSize: '12px', height: '26px' }}
                />
                <span style={{ color: '#94a3b8' }}>in</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}>
                <span style={{ color: '#64748b' }}>V-Margin:</span>
                <input
                  type="number"
                  step="0.05"
                  min="0.1"
                  max="1.5"
                  value={marginV}
                  onChange={(e) => setMarginV(e.target.value)}
                  className="form-input"
                  style={{ width: '58px', padding: '3px 6px', fontSize: '12px', height: '26px' }}
                />
                <span style={{ color: '#94a3b8' }}>in</span>
              </div>
            </div>
          </div>
        </div>

        {/* Custom Layout Bar for A3 Custom Option */}
        {selectedSheetPresetId === 'a3_custom' && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 14px',
              backgroundColor: '#fffbeb',
              border: '1px solid #fde68a',
              borderRadius: '8px',
              fontSize: '12.5px',
              gap: '12px',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#92400e', fontWeight: '700' }}>
              <Sliders size={15} />
              <span>A3 Custom Grid & Label Setup:</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ color: '#78350f' }}>Columns:</span>
                <input
                  type="number"
                  min="1"
                  max="8"
                  value={customCols}
                  onChange={(e) => setCustomCols(e.target.value)}
                  className="form-input"
                  style={{ width: '52px', padding: '3px 6px', fontSize: '12px', height: '26px' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ color: '#78350f' }}>Rows:</span>
                <input
                  type="number"
                  min="1"
                  max="15"
                  value={customRows}
                  onChange={(e) => setCustomRows(e.target.value)}
                  className="form-input"
                  style={{ width: '52px', padding: '3px 6px', fontSize: '12px', height: '26px' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ color: '#78350f' }}>Label Width:</span>
                <input
                  type="number"
                  step="0.1"
                  min="1.0"
                  max="6.0"
                  value={customLabelW}
                  onChange={(e) => setCustomLabelW(e.target.value)}
                  className="form-input"
                  style={{ width: '58px', padding: '3px 6px', fontSize: '12px', height: '26px' }}
                />
                <span style={{ color: '#92400e' }}>in</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ color: '#78350f' }}>Label Height:</span>
                <input
                  type="number"
                  step="0.1"
                  min="1.0"
                  max="5.0"
                  value={customLabelH}
                  onChange={(e) => setCustomLabelH(e.target.value)}
                  className="form-input"
                  style={{ width: '58px', padding: '3px 6px', fontSize: '12px', height: '26px' }}
                />
                <span style={{ color: '#92400e' }}>in</span>
              </div>

              <div style={{ fontWeight: '700', color: '#b45309' }}>
                Yield: {currentPreset.labelsPerSheet} Labels / Sheet
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Two-Column Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '430px 1fr', gap: '20px', alignItems: 'start' }}>
        {/* Left Column: Form Controls */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '14px', width: '100%', boxSizing: 'border-box' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>
              {inputMode === 'single' ? 'Single Label Generator' : 'Batch Configuration'}
            </h2>
            <span className="badge badge-primary">
              {inputMode === 'single' ? '2" × 1.5" Direct' : 'PDFKit Ready'}
            </span>
          </div>

          {/* 3-Way Mode Switcher */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              backgroundColor: '#f1f5f9',
              padding: '3px',
              borderRadius: '8px',
              gap: '4px',
            }}
          >
            <button
              type="button"
              onClick={() => {
                setInputMode('sequential');
                setValidationError(null);
                setValidationResult(null);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '5px',
                padding: '7px 4px',
                fontSize: '12px',
                fontWeight: '700',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: inputMode === 'sequential' ? '#ffffff' : 'transparent',
                color: inputMode === 'sequential' ? '#0066cc' : '#64748b',
                boxShadow: inputMode === 'sequential' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              <Sliders size={13} />
              Sequential
            </button>
            <button
              type="button"
              onClick={() => {
                setInputMode('excel');
                setValidationError(null);
                setValidationResult(null);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '5px',
                padding: '7px 4px',
                fontSize: '12px',
                fontWeight: '700',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: inputMode === 'excel' ? '#ffffff' : 'transparent',
                color: inputMode === 'excel' ? '#0066cc' : '#64748b',
                boxShadow: inputMode === 'excel' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              <FileSpreadsheet size={13} />
              Excel Import
            </button>
            <button
              type="button"
              onClick={() => {
                setInputMode('single');
                setValidationError(null);
                setValidationResult(null);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '5px',
                padding: '7px 4px',
                fontSize: '12px',
                fontWeight: '700',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: inputMode === 'single' ? '#ffffff' : 'transparent',
                color: inputMode === 'single' ? '#0066cc' : '#64748b',
                boxShadow: inputMode === 'single' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              <Printer size={13} />
              Single Label
            </button>
          </div>

          {/* SINGLE LABEL MODE FORM */}
          {inputMode === 'single' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '84px minmax(0, 1fr)', gap: '10px' }}>
                <div className="form-group" style={{ minWidth: 0, margin: 0 }}>
                  <label className="form-label">Series</label>
                  <input
                    type="text"
                    className="form-input"
                    value={cardSeries}
                    onChange={(e) => setCardSeries(e.target.value.toUpperCase())}
                    placeholder="VS"
                    style={{ textAlign: 'center', fontWeight: '700' }}
                  />
                  <div style={{ marginTop: '4px', fontSize: '11px', color: '#64748b', textAlign: 'center' }}>
                    Prefix
                  </div>
                </div>

                <div className="form-group" style={{ minWidth: 0, margin: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                    <label className="form-label" style={{ margin: 0, whiteSpace: 'nowrap' }}>
                      Serial Number
                    </label>
                    <button
                      type="button"
                      onClick={handleIncrementSingleSerial}
                      className="btn btn-secondary"
                      style={{
                        padding: '2px 7px',
                        fontSize: '11px',
                        minHeight: '22px',
                        whiteSpace: 'nowrap',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '3px',
                      }}
                      title="Generate Next Serial (+1)"
                    >
                      +1 Next
                    </button>
                  </div>
                  <input
                    type="text"
                    className="form-input font-mono"
                    required
                    value={singleSerial}
                    onChange={(e) => {
                      setSingleSerial(e.target.value.trim());
                      setSingleRegistered(false);
                    }}
                    placeholder="0020231501"
                    style={isSerialBelowMin(singleSerial) ? { borderColor: '#ef4444', backgroundColor: '#fef2f2' } : {}}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px', fontSize: '11px', color: '#64748b' }}>
                    <span>
                      Min Start: <strong style={{ color: '#16a34a', fontFamily: 'monospace' }}>0020231501</strong>
                    </span>
                    <span style={{ color: '#0066cc', fontWeight: '600' }}>Preserves 0s</span>
                  </div>
                  {isSerialBelowMin(singleSerial) && (
                    <div style={{ color: '#dc2626', fontSize: '11.5px', marginTop: '4px', fontWeight: '600' }}>
                      ⚠️ Series 0020231501 se start hoti hai. Isse kam number allowed nahi hai.
                    </div>
                  )}
                </div>
              </div>

              {/* Barcode Type & Template */}
              <div style={{ display: 'grid', gridTemplateColumns: '135px minmax(0, 1fr)', gap: '10px' }}>
                <div className="form-group" style={{ minWidth: 0, margin: 0 }}>
                  <label className="form-label">Barcode Type</label>
                  <select
                    className="form-select"
                    value={barcodeType}
                    onChange={(e) => setBarcodeType(e.target.value)}
                  >
                    <option value="CODE128">Code 128</option>
                    <option value="CODE39">Code 39</option>
                    <option value="EAN13">EAN-13</option>
                  </select>
                </div>

                <div className="form-group" style={{ minWidth: 0, margin: 0 }}>
                  <label className="form-label">Label Template</label>
                  <select
                    className="form-select"
                    value={templateId}
                    onChange={(e) => setTemplateId(e.target.value)}
                    style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', width: '100%', minWidth: 0 }}
                  >
                    {templates.map((t) => (
                      <option key={t._id} value={t._id}>
                        {t.templateName.length > 24 ? `${t.templateName.slice(0, 22)}...` : t.templateName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Status / Availability feedback */}
              {validating ? (
                <div style={{ padding: '8px 12px', fontSize: '12px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <RefreshCw size={14} className="spin" />
                  Checking serial availability...
                </div>
              ) : validationError ? (
                <div
                  style={{
                    padding: '8px 12px',
                    backgroundColor: '#fef2f2',
                    border: '1px solid #fecaca',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: '#991b1b',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <AlertTriangle size={15} style={{ flexShrink: 0 }} />
                  <span>{validationError}</span>
                </div>
              ) : singleStatus?.valid ? (
                <div
                  style={{
                    padding: '8px 12px',
                    backgroundColor: '#f0fdf4',
                    border: '1px solid #bbf7d0',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: '#166534',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <CheckCircle size={15} color="#16a34a" />
                  <span>
                    Serial <strong>{singleSerial}</strong> is ready for instant print & PDF export.
                  </span>
                </div>
              ) : null}

              {/* Action Buttons for Single Label */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '6px' }}>
                <button
                  type="button"
                  onClick={handlePrintSingleLabel}
                  disabled={!singleSerial || isSerialBelowMin(singleSerial)}
                  className="btn btn-primary"
                  style={{ padding: '12px', fontSize: '14.5px', width: '100%' }}
                >
                  <Printer size={17} />
                  Print Single Label (2" × 1.5")
                </button>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <a
                    href={isSerialBelowMin(singleSerial) ? '#' : RecordsAPI.getSingleLabelPdfUrl(singleSerial.trim(), cardSeries)}
                    onClick={(e) => {
                      if (isSerialBelowMin(singleSerial)) e.preventDefault();
                    }}
                    className={`btn btn-secondary ${isSerialBelowMin(singleSerial) ? 'disabled' : ''}`}
                    style={{
                      padding: '10px',
                      fontSize: '13px',
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      opacity: isSerialBelowMin(singleSerial) ? 0.5 : 1,
                      pointerEvents: isSerialBelowMin(singleSerial) ? 'none' : 'auto',
                    }}
                    download
                  >
                    <Download size={15} />
                    Download 2"×1.5" PDF
                  </a>

                  <button
                    type="button"
                    onClick={handleRegisterSingleLabel}
                    disabled={registeringSingle || singleRegistered || isSerialBelowMin(singleSerial)}
                    className="btn btn-secondary"
                    style={{
                      padding: '10px',
                      fontSize: '13px',
                      color: singleRegistered ? '#16a34a' : '#0f172a',
                      borderColor: singleRegistered ? '#86efac' : '#cbd5e1',
                      backgroundColor: singleRegistered ? '#f0fdf4' : '#ffffff',
                    }}
                  >
                    {registeringSingle ? (
                      <>
                        <RefreshCw size={14} className="spin" />
                        Saving...
                      </>
                    ) : singleRegistered ? (
                      <>
                        <CheckCircle size={14} color="#16a34a" />
                        Registered in DB
                      </>
                    ) : (
                      <>
                        <FileCheck size={14} />
                        Save in Records
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* SEQUENTIAL & EXCEL IMPORT FORMS */
            <form onSubmit={handleGenerate} style={{ width: '100%' }}>
              {/* 1. Batch Name */}
              <div className="form-group">
                <label className="form-label">
                  Batch Name
                  <span style={{ fontSize: '11px', color: '#94a3b8' }}>Required</span>
                </label>
                <input
                  type="text"
                  className="form-input"
                  required
                  value={batchName}
                  onChange={(e) => setBatchName(e.target.value)}
                  placeholder={inputMode === 'excel' ? 'e.g. Vidhyut Saathi Excel Batch #1' : 'e.g. Vidhyut Saathi Lot #101'}
                />
              </div>

              {/* SEQUENTIAL MODE FIELDS */}
              {inputMode === 'sequential' && (
                <>
                  {/* 2. Card Series & 3. Starting Serial Number */}
                  <div style={{ display: 'grid', gridTemplateColumns: '84px minmax(0, 1fr)', gap: '10px' }}>
                    <div className="form-group" style={{ minWidth: 0 }}>
                      <label className="form-label">Series</label>
                      <input
                        type="text"
                        className="form-input"
                        required
                        value={cardSeries}
                        onChange={(e) => setCardSeries(e.target.value.toUpperCase())}
                        placeholder="VS"
                        style={{ textAlign: 'center', fontWeight: '700' }}
                      />
                      <div style={{ marginTop: '4px', fontSize: '11px', color: '#64748b', textAlign: 'center' }}>
                        Prefix
                      </div>
                    </div>

                    <div className="form-group" style={{ minWidth: 0 }}>
                      <label className="form-label" style={{ marginBottom: '5px' }}>
                        Starting Serial Number
                      </label>
                      <input
                        type="text"
                        className="form-input font-mono"
                        required
                        value={startSerialNumber}
                        onChange={(e) => setStartSerialNumber(e.target.value.trim())}
                        placeholder="0020231501"
                        style={isSerialBelowMin(startSerialNumber) ? { borderColor: '#ef4444', backgroundColor: '#fef2f2' } : {}}
                      />
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px', fontSize: '11px', color: '#64748b' }}>
                        <span>
                          Min Start: <strong style={{ color: '#16a34a', fontFamily: 'monospace' }}>0020231501</strong>
                        </span>
                        <span style={{ color: '#0066cc', fontWeight: '600' }}>Preserves 0s</span>
                      </div>
                      {isSerialBelowMin(startSerialNumber) && (
                        <div style={{ color: '#dc2626', fontSize: '11.5px', marginTop: '4px', fontWeight: '600' }}>
                          ⚠️ Series 0020231501 se start hoti hai. Isse kam number allowed nahi hai.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 4. Quantity */}
                  <div className="form-group">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <label className="form-label" style={{ margin: 0 }}>
                        Quantity (Labels)
                      </label>
                      <div style={{ display: 'flex', gap: '5px' }}>
                        {[
                          currentPreset.labelsPerSheet,
                          currentPreset.labelsPerSheet * 2,
                          currentPreset.labelsPerSheet * 10,
                          currentPreset.labelsPerSheet * 50,
                        ].map((preset) => (
                          <button
                            key={preset}
                            type="button"
                            className={`btn ${quantity === preset ? 'btn-primary' : 'btn-secondary'}`}
                            style={{ padding: '2px 8px', fontSize: '11px', minHeight: '24px' }}
                            onClick={() => setQuantity(preset)}
                          >
                            {preset}
                          </button>
                        ))}
                      </div>
                    </div>
                    <input
                      type="number"
                      min="1"
                      max="10000"
                      className="form-input"
                      required
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                    />
                    <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '3px' }}>
                      Will create <strong>{calculatedPages} PDF Page{calculatedPages > 1 ? 's' : ''}</strong> ({currentPreset.labelsPerSheet} labels/sheet • {currentPreset.name}).
                    </div>
                  </div>
                </>
              )}

              {/* EXCEL / CSV IMPORT MODE FIELDS */}
              {inputMode === 'excel' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '14px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '84px minmax(0, 1fr)', gap: '10px' }}>
                    <div className="form-group" style={{ minWidth: 0, margin: 0 }}>
                      <label className="form-label">Series</label>
                      <input
                        type="text"
                        className="form-input"
                        required
                        value={cardSeries}
                        onChange={(e) => setCardSeries(e.target.value.toUpperCase())}
                        placeholder="VS"
                      />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end' }}>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={handleDownloadSampleTemplate}
                        style={{ padding: '8px 12px', fontSize: '12px', width: '100%', height: '38px', color: '#0066cc', borderColor: '#bae0fd', backgroundColor: '#f0f7ff' }}
                      >
                        <Download size={14} />
                        Download Sample Excel
                      </button>
                    </div>
                  </div>

                  {/* Upload Area */}
                  <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    accept=".xlsx,.xls,.csv"
                    onChange={handleFileUpload}
                  />

                  {!excelFileName ? (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      style={{
                        border: '2px dashed #cbd5e1',
                        borderRadius: '10px',
                        padding: '24px 16px',
                        textAlign: 'center',
                        cursor: 'pointer',
                        backgroundColor: '#f8fafc',
                        transition: 'border-color 0.15s, background-color 0.15s',
                      }}
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.currentTarget.style.borderColor = '#0066cc';
                        e.currentTarget.style.backgroundColor = '#f0f7ff';
                      }}
                      onDragLeave={(e) => {
                        e.preventDefault();
                        e.currentTarget.style.borderColor = '#cbd5e1';
                        e.currentTarget.style.backgroundColor = '#f8fafc';
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        e.currentTarget.style.borderColor = '#cbd5e1';
                        e.currentTarget.style.backgroundColor = '#f8fafc';
                        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                          handleFileUpload({ target: { files: e.dataTransfer.files } });
                        }
                      }}
                    >
                      <UploadCloud size={32} color="#0066cc" style={{ margin: '0 auto 8px' }} />
                      <div style={{ fontSize: '13.5px', fontWeight: '700', color: '#0f172a' }}>
                        Click or drag Excel / CSV file here
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                        Supports .xlsx, .xls, .csv with preserved leading zeros
                      </div>
                    </div>
                  ) : (
                    <div
                      style={{
                        border: '1px solid #bbf7d0',
                        backgroundColor: '#f0fdf4',
                        borderRadius: '10px',
                        padding: '12px 14px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <FileSpreadsheet size={18} color="#16a34a" />
                          <div>
                            <strong style={{ fontSize: '13px', color: '#166534' }}>{excelFileName}</strong>
                            <div style={{ fontSize: '11.5px', color: '#15803d' }}>
                              {importedSerials.length} serial numbers loaded ({calculatedPages} PDF page{calculatedPages > 1 ? 's' : ''})
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={handleClearFile}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', padding: '4px' }}
                          title="Remove file"
                        >
                          <X size={16} />
                        </button>
                      </div>

                      {/* Column Selection if multiple headers exist */}
                      {excelColumns.length > 1 && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
                          <span style={{ color: '#475569', fontWeight: '600' }}>Serial Column:</span>
                          <select
                            className="form-select"
                            style={{ padding: '4px 8px', fontSize: '12px', height: '28px', flex: 1 }}
                            value={selectedSerialColumn}
                            onChange={(e) => handleColumnChange(e.target.value)}
                          >
                            {excelColumns.map((col) => (
                              <option key={col} value={col}>
                                {col}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      {/* Preview of first few rows */}
                      {excelPreviewRows.length > 0 && (
                        <div style={{ borderTop: '1px solid #dcfce7', paddingTop: '8px' }}>
                          <div style={{ fontSize: '11px', fontWeight: '700', color: '#166534', marginBottom: '4px', textTransform: 'uppercase' }}>
                            First {excelPreviewRows.length} Serial Numbers Preview:
                          </div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                            {excelPreviewRows.map((r, idx) => (
                              <span
                                key={idx}
                                className="font-mono"
                                style={{
                                  fontSize: '11px',
                                  backgroundColor: '#ffffff',
                                  border: '1px solid #86efac',
                                  padding: '2px 6px',
                                  borderRadius: '4px',
                                  color: '#14532d',
                                }}
                              >
                                {r.serial}
                              </span>
                            ))}
                            {importedSerials.length > excelPreviewRows.length && (
                              <span style={{ fontSize: '11px', color: '#15803d', alignSelf: 'center', paddingLeft: '4px' }}>
                                +{importedSerials.length - excelPreviewRows.length} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {excelError && (
                    <div style={{ padding: '8px 12px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#991b1b', fontSize: '12px' }}>
                      {excelError}
                    </div>
                  )}
                </div>
              )}

              {/* 5. Barcode Type & 6. Label Template (Clean Full-Width Alignment) */}
              <div style={{ display: 'grid', gridTemplateColumns: '135px minmax(0, 1fr)', gap: '10px' }}>
                <div className="form-group" style={{ minWidth: 0 }}>
                  <label className="form-label">Barcode Type</label>
                  <select
                    className="form-select"
                    value={barcodeType}
                    onChange={(e) => setBarcodeType(e.target.value)}
                  >
                    <option value="CODE128">Code 128</option>
                    <option value="CODE39">Code 39</option>
                    <option value="EAN13">EAN-13</option>
                  </select>
                </div>

                <div className="form-group" style={{ minWidth: 0 }}>
                  <label className="form-label">Label Template</label>
                  <select
                    className="form-select"
                    value={templateId}
                    onChange={(e) => setTemplateId(e.target.value)}
                    style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', width: '100%', minWidth: 0 }}
                    title="Official Vidhyut Saathi 10-Year Saver Card Label (2x1.5)"
                  >
                    {templates.map((t) => (
                      <option key={t._id} value={t._id}>
                        {t.templateName.length > 24 ? `${t.templateName.slice(0, 22)}...` : t.templateName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Pre-flight Range Validation Feedback */}
              {validating || parsingExcel ? (
                <div style={{ padding: '10px', fontSize: '12px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <RefreshCw size={14} className="spin" />
                  {parsingExcel ? 'Parsing Excel file...' : 'Validating serial numbers against database...'}
                </div>
              ) : validationError ? (
                <div
                  style={{
                    padding: '10px 12px',
                    backgroundColor: '#fef2f2',
                    border: '1px solid #fecaca',
                    borderRadius: '8px',
                    fontSize: '12.5px',
                    color: '#991b1b',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '8px',
                    marginBottom: '12px',
                  }}
                >
                  <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span>{validationError}</span>
                </div>
              ) : validationResult ? (
                <div
                  style={{
                    padding: '10px 12px',
                    backgroundColor: '#f0fdf4',
                    border: '1px solid #bbf7d0',
                    borderRadius: '8px',
                    fontSize: '12.5px',
                    color: '#166534',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '12px',
                  }}
                >
                  <CheckCircle size={16} color="#16a34a" />
                  <div>
                    {inputMode === 'excel' ? (
                      <span>
                        <strong>{validationResult.quantity} Serials Valid:</strong> <strong className="font-mono">{validationResult.startSerialNumber}</strong> to <strong className="font-mono">{validationResult.endSerialNumber}</strong>
                      </span>
                    ) : (
                      <span>
                        Range Available: <strong className="font-mono">{validationResult.startSerialNumber}</strong> to <strong className="font-mono">{validationResult.endSerialNumber}</strong>
                      </span>
                    )}
                  </div>
                </div>
              ) : null}

              {/* Progress Bar during generation */}
              {generating && (
                <div style={{ margin: '14px 0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: '600', marginBottom: '6px' }}>
                    <span>Rendering {currentPreset.name} PDF Sheets...</span>
                    <span style={{ color: '#0066cc' }}>{progress}%</span>
                  </div>
                  <div className="progress-bar-container">
                    <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
                  </div>
                </div>
              )}

              {/* Error Message */}
              {generationError && (
                <div
                  style={{
                    padding: '10px',
                    backgroundColor: '#fef2f2',
                    border: '1px solid #fecaca',
                    borderRadius: '8px',
                    color: '#991b1b',
                    fontSize: '13px',
                    marginBottom: '12px',
                  }}
                >
                  {generationError}
                </div>
              )}

              {/* 7. Generate PDF Button */}
              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', padding: '12px', fontSize: '15px' }}
                disabled={
                  generating ||
                  !!validationError ||
                  !batchName ||
                  (inputMode === 'sequential' && isSerialBelowMin(startSerialNumber)) ||
                  (inputMode === 'excel' && importedSerials.length === 0)
                }
              >
                <Sparkles size={18} />
                {generating
                  ? `Generating PDF (${progress}%)...`
                  : inputMode === 'excel'
                  ? `Generate ${currentPreset.name} PDF (${importedSerials.length} labels)`
                  : `Generate ${currentPreset.name} PDF Batch`}
              </button>
            </form>
          )}

          {/* Success Banner if batch completed */}
          {currentBatch && currentBatch.status === 'completed' && (
            <div
              style={{
                marginTop: '12px',
                padding: '14px',
                backgroundColor: '#ecfdf5',
                border: '1px solid #a7f3d0',
                borderRadius: '10px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <FileCheck size={20} color="#10b981" />
                <span style={{ fontWeight: '800', color: '#065f46', fontSize: '14px' }}>
                  PDF Generated Successfully!
                </span>
              </div>
              <div style={{ fontSize: '12px', color: '#047857', marginBottom: '12px' }}>
                Batch <strong>{currentBatch.batchId}</strong> ({currentBatch.quantity} labels, {currentBatch.totalPages} pages) is saved and ready.
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  className="btn btn-primary"
                  style={{ flex: 1, padding: '7px 10px', fontSize: '12px' }}
                  onClick={() => onPreviewBatch(currentBatch)}
                >
                  <Eye size={14} />
                  Preview PDF
                </button>
                <a
                  href={BatchesAPI.getPdfDownloadUrl(currentBatch.batchId)}
                  className="btn btn-secondary"
                  style={{ flex: 1, padding: '7px 10px', fontSize: '12px', textDecoration: 'none' }}
                  download
                >
                  <Download size={14} />
                  Download
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Live Sheet & Single Label Preview */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Live Single Label Preview Card */}
          <div className="card" style={{ padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div>
                <h3 style={{ fontSize: '14px', fontWeight: '800', color: '#0f172a' }}>
                  {inputMode === 'single'
                    ? 'Single Label Live Artwork & Barcode'
                    : 'Live Label Artwork & Barcode Overlay Preview'}
                </h3>
                <div style={{ fontSize: '12px', color: '#64748b' }}>
                  {inputMode === 'single'
                    ? `Exact physical 2" × 1.5" label with barcode and serial "${singleSerial}"`
                    : inputMode === 'excel' && importedSerials.length > 0
                    ? `Showing first label from uploaded file: ${importedSerials[0]}`
                    : 'Designated barcode area overlays code & serial dynamically while preserving 100% of master artwork.'}
                </div>
              </div>
              <span className="badge badge-success">Actual 2" × 1.5" Aspect</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0' }}>
              <CardPreview
                serialNumber={
                  inputMode === 'single'
                    ? singleSerial || '0020231501'
                    : inputMode === 'excel' && importedSerials.length > 0
                    ? importedSerials[0]
                    : startSerialNumber || '0020231501'
                }
                width={inputMode === 'single' ? 380 : 340}
                showCropGuides
              />
            </div>

            {inputMode === 'single' && (
              <div
                style={{
                  marginTop: '12px',
                  padding: '12px',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '8px',
                  fontSize: '12px',
                  textAlign: 'center',
                }}
              >
                <div>
                  <span style={{ color: '#64748b', display: 'block' }}>Physical Size:</span>
                  <strong style={{ color: '#0f172a' }}>2" × 1.5" (144×108 pt)</strong>
                </div>
                <div>
                  <span style={{ color: '#64748b', display: 'block' }}>Symbology:</span>
                  <strong style={{ color: '#0f172a' }}>Code 128 (Standard)</strong>
                </div>
                <div>
                  <span style={{ color: '#64748b', display: 'block' }}>Identifier:</span>
                  <strong className="font-mono" style={{ color: '#0066cc' }}>
                    {cardSeries}{singleSerial}
                  </strong>
                </div>
              </div>
            )}
          </div>

          {/* Live Sheet Preview (Shown in sequential & excel modes) */}
          {inputMode !== 'single' ? (
            <div className="card">
              <SheetPreview
                startSerialNumber={
                  inputMode === 'excel' && importedSerials.length > 0
                    ? importedSerials[0]
                    : startSerialNumber
                }
                quantity={
                  inputMode === 'excel'
                    ? importedSerials.length
                    : parseInt(quantity || 0, 10)
                }
                cardSeries={cardSeries}
                pageNumber={1}
                customSerials={
                  inputMode === 'excel' && importedSerials.length > 0
                    ? importedSerials
                    : null
                }
                sheetPreset={currentPreset}
              />
            </div>
          ) : (
            <div
              className="card"
              style={{
                padding: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: '#ffffff',
              }}
            >
              <div>
                <h4 style={{ fontSize: '13.5px', fontWeight: '700', color: '#0f172a' }}>
                  Need this single label on a 12" × 18" Sheet?
                </h4>
                <p style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                  You can also switch to Sequential mode with Quantity = 1 to generate a 12" × 18" printing plate.
                </p>
              </div>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ fontSize: '12px', padding: '6px 12px' }}
                onClick={() => {
                  setStartSerialNumber(singleSerial);
                  setQuantity(1);
                  setInputMode('sequential');
                }}
              >
                Generate on 12" × 18" Sheet
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
