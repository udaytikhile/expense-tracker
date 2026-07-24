import React, { useState } from 'react';
import { exportCSV, fetchExpenses } from '../services/api';
import { useToast } from '../context/ToastContext';
import PageHeader from '../components/layout/PageHeader';
import { Download, Calendar, FileSpreadsheet, CheckCircle, File } from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/formatters';

export default function ExportPage() {
  const { addToast } = useToast();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [preview, setPreview] = useState([]);
  const [loading, setLoading] = useState(false);
  const [exported, setExported] = useState(false);

  const handlePreview = async () => {
    setLoading(true);
    try {
      const data = await fetchExpenses(startDate || undefined, endDate || undefined);
      setPreview(data.slice(0, 10));
      addToast(`Loaded ${Math.min(data.length, 10)} preview rows`, 'info');
    } catch (err) {
      addToast('Failed to fetch preview data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      await exportCSV(startDate || undefined, endDate || undefined);
      setExported(true);
      addToast('CSV Download initiated!', 'success');
      setTimeout(() => setExported(false), 3000);
    } catch (err) {
      addToast('CSV Export failed', 'error');
    }
  };

  return (
    <div className="mobile-page">
      <PageHeader title="Export Data" />

      <div className="export-options-card">
        <h3 className="section-title">Select Format</h3>
        <div className="export-format-grid">
          <div className="format-option-card active">
            <FileSpreadsheet size={24} color="#f97316" />
            <div className="text-wrap">
              <h4>CSV Spreadsheet</h4>
              <span>Excel & sheets compatible</span>
            </div>
          </div>

          <div className="format-option-card disabled">
            <File size={24} color="#64748b" />
            <div className="text-wrap">
              <h4>PDF Statement</h4>
              <span>Printable report (coming soon)</span>
            </div>
          </div>
        </div>
      </div>

      <div className="export-filters-card">
        <h3 className="section-title">Date Filters</h3>
        
        <div className="form-group-row">
          <div className="form-group flex-1">
            <label>From Date</label>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
          </div>
          <div className="form-group flex-1">
            <label>To Date</label>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
          </div>
        </div>

        <div className="form-actions" style={{ marginTop: 16 }}>
          <button className="btn-secondary flex-1" onClick={handlePreview} disabled={loading}>
            {loading ? 'Fetching...' : 'Preview Rows'}
          </button>
          <button className="btn-primary flex-1" onClick={handleExport}>
            <Download size={16} style={{ marginRight: 6 }} /> Export CSV
          </button>
        </div>
      </div>

      {preview.length > 0 && (
        <div className="export-preview-section">
          <h3 className="section-title">Preview (Top 10 Rows)</h3>
          <div className="preview-card-list">
            {preview.map(exp => {
              const categoryEmoji = exp.category.split(' ')[0] || '📦';
              const categoryName = exp.category.replace(/^[^\s]+\s*/, '');
              return (
                <div key={exp.id} className="preview-row-card">
                  <div className="left">
                    <span>{categoryEmoji}</span>
                    <div className="details">
                      <h4>{categoryName}</h4>
                      <span>{exp.note || 'No note'}</span>
                    </div>
                  </div>
                  <div className="right">
                    <span className="amt">{formatCurrency(exp.amount)}</span>
                    <span className="date">{formatDate(exp.date)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
