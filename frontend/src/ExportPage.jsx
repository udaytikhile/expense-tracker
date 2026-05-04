import React, { useState } from 'react';
import { exportCSV, fetchExpenses } from './api';
import { Download, Calendar, FileText, CheckCircle, FileSpreadsheet, File } from 'lucide-react';

export default function ExportPage() {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [preview, setPreview] = useState([]);
    const [loading, setLoading] = useState(false);
    const [exported, setExported] = useState(false);

    const handlePreview = async () => {
        setLoading(true);
        try {
            const data = await fetchExpenses(startDate || undefined, endDate || undefined);
            setPreview(data.slice(0, 20));
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async () => {
        await exportCSV(startDate || undefined, endDate || undefined);
        setExported(true);
        setTimeout(() => setExported(false), 3000);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: '880px', margin: '0 auto' }}>
            <div className="glass-panel" style={{ padding: '1.75rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.35rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: "'Outfit', sans-serif" }}>
                    <Download size={20} color="var(--primary)" />
                    Export Your Data
                </h3>

                {/* Format Selection */}
                <div style={{ display: 'flex', gap: '0.85rem', marginBottom: '1.35rem' }}>
                    <div style={{
                        flex: 1,
                        padding: '1rem 1.15rem',
                        borderRadius: 'var(--rounded-sm)',
                        border: '2px solid var(--primary)',
                        background: 'var(--primary-light)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.65rem',
                        transition: 'var(--transition)',
                    }}>
                        <FileSpreadsheet size={20} color="var(--primary)" />
                        <div>
                            <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--primary)' }}>CSV File</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Spreadsheet compatible</div>
                        </div>
                    </div>
                    <div style={{
                        flex: 1,
                        padding: '1rem 1.15rem',
                        borderRadius: 'var(--rounded-sm)',
                        border: '1.5px solid var(--border-color)',
                        background: 'rgba(0,0,0,0.02)',
                        cursor: 'not-allowed',
                        opacity: 0.45,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.65rem',
                    }}>
                        <File size={20} color="var(--text-muted)" />
                        <div>
                            <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-muted)' }}>PDF Report</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Coming soon</div>
                        </div>
                    </div>
                </div>

                {/* Date Filters */}
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: '180px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.4rem', letterSpacing: '0.4px' }}>
                            <Calendar size={13} color="var(--primary)" /> From Date
                        </label>
                        <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
                    </div>
                    <div style={{ flex: 1, minWidth: '180px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.4rem', letterSpacing: '0.4px' }}>
                            <Calendar size={13} color="var(--primary)" /> To Date
                        </label>
                        <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button className="btn-secondary" onClick={handlePreview} disabled={loading}>
                        <FileText size={15} /> {loading ? 'Loading...' : 'Preview Data'}
                    </button>
                    <button className="btn-primary" onClick={handleExport}>
                        <Download size={15} /> Download CSV
                    </button>
                </div>

                {exported && (
                    <div className="success-toast" style={{ marginTop: '0.85rem' }}>
                        <CheckCircle size={17} /> CSV downloaded successfully! 📊
                    </div>
                )}
            </div>

            {preview.length > 0 && (
                <div className="glass-panel" style={{ padding: '1.35rem' }}>
                    <h4 style={{ color: 'var(--text-muted)', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.85rem' }}>
                        Preview (first 20 rows)
                    </h4>
                    <div style={{ overflowX: 'auto' }}>
                        <table>
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Category</th>
                                    <th>Amount</th>
                                    <th>Note</th>
                                </tr>
                            </thead>
                            <tbody>
                                {preview.map((exp, idx) => (
                                    <tr key={exp.id} style={{ animation: `slideInRow 0.3s ease ${idx * 0.03}s backwards` }}>
                                        <td style={{ fontWeight: 500 }}>{exp.date}</td>
                                        <td><span className="badge" style={{ backgroundColor: 'var(--primary-light)', color: '#ea580c', border: '1px solid rgba(249, 115, 22, 0.1)' }}>{exp.category}</span></td>
                                        <td style={{ fontWeight: 700, color: '#ea580c' }}>₹ {exp.amount.toLocaleString()}</td>
                                        <td style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>{exp.note || '—'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
