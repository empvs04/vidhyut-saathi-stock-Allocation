import React, { useState, useEffect } from 'react';
import {
  ListOrdered,
  Search,
  CheckCircle,
  Filter,
  RefreshCw,
  Barcode,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { RecordsAPI } from '../services/api';

export default function BarcodeRecords({ onOpenScanner }) {
  const [records, setRecords] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const res = await RecordsAPI.getRecords({
        page,
        limit,
        serialNumber: search || undefined,
      });
      if (res.data.success) {
        setRecords(res.data.records);
        setTotal(res.data.total);
      }
    } catch (err) {
      console.error('Error fetching records:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [page, limit]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchRecords();
  };

  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Banner */}
      <div
        className="card"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '18px 24px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ListOrdered size={22} color="#0066cc" />
            <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>
              Barcode Records & Serial Registry
            </h2>
          </div>
          <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
            Registry of all individual serial numbers, print coordinates, and batch relationships.
          </div>
        </div>

        <button
          className="btn btn-primary"
          onClick={onOpenScanner}
        >
          <ShieldCheck size={16} />
          Scan Validation Tester
        </button>
      </div>

      {/* Search & Pagination Controls */}
      <div
        className="card"
        style={{
          padding: '14px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
        }}
      >
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px', flex: 1, maxWidth: '440px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '12px' }} />
            <input
              type="text"
              className="form-input font-mono"
              style={{ paddingLeft: '36px', width: '100%' }}
              placeholder="Search serial number (e.g. 0020231501)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-secondary">
            Search
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ fontSize: '13px', color: '#64748b' }}>
            Showing <strong>{records.length}</strong> of <strong>{total}</strong> records
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              className="btn btn-secondary"
              style={{ padding: '6px 10px' }}
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft size={16} />
            </button>
            <span style={{ fontSize: '13px', fontWeight: '700' }}>
              {page} / {totalPages}
            </span>
            <button
              className="btn btn-secondary"
              style={{ padding: '6px 10px' }}
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Records Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="table-container" style={{ border: 'none' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Serial Number</th>
                <th>Series</th>
                <th>Associated Batch</th>
                <th>Sheet Page</th>
                <th>Position (Col, Row)</th>
                <th>Symbology</th>
                <th>Scannable</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '36px', color: '#64748b' }}>
                    <RefreshCw size={24} className="spin" style={{ margin: '0 auto 8px' }} />
                    <div>Loading records...</div>
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '48px', color: '#94a3b8' }}>
                    <Barcode size={36} style={{ margin: '0 auto 10px', opacity: 0.5 }} />
                    <div style={{ fontSize: '15px', fontWeight: '600', color: '#334155' }}>No Barcode Records</div>
                    <div style={{ fontSize: '13px', marginTop: '4px' }}>
                      Generate a batch to populate individual barcode records.
                    </div>
                  </td>
                </tr>
              ) : (
                records.map((r) => (
                  <tr key={r._id}>
                    <td>
                      <span
                        className="font-mono"
                        style={{
                          fontWeight: '800',
                          color: '#0066cc',
                          fontSize: '13.5px',
                          backgroundColor: '#f0f7ff',
                          padding: '3px 8px',
                          borderRadius: '4px',
                          border: '1px solid #bae0fd',
                        }}
                      >
                        {r.serialNumber}
                      </span>
                    </td>
                    <td>
                      <span className="badge badge-primary">{r.cardSeries}</span>
                    </td>
                    <td>
                      <div style={{ fontWeight: '600', color: '#0f172a' }}>
                        {r.batchId?.batchName || 'Batch'}
                      </div>
                      <div style={{ fontSize: '11px', color: '#94a3b8', fontFamily: 'monospace' }}>
                        {r.batchId?.batchId || r.batchId}
                      </div>
                    </td>
                    <td>
                      <strong>Page {r.pageNumber}</strong>
                    </td>
                    <td>
                      Slot #{r.positionIndex + 1} (Col {r.column + 1}, Row {r.row + 1})
                    </td>
                    <td>
                      <span style={{ fontSize: '12px', color: '#475569' }}>Code 128</span>
                    </td>
                    <td>
                      <span className="badge badge-success">
                        <CheckCircle size={12} />
                        100% Valid
                      </span>
                    </td>
                    <td>
                      <span className="badge badge-success">{r.status}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
