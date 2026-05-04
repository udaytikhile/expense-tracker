import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { fetchIncome, addIncome, deleteIncome, fetchIncomeSummary, fetchMonthly } from './api';
import { Wallet, Plus, Trash2, TrendingUp, TrendingDown, DollarSign, PiggyBank } from 'lucide-react';

const INCOME_SOURCES = ['💼 Salary', '🏢 Freelance', '📈 Investment', '🎁 Gift', '💰 Business', '📦 Other'];

export default function IncomeTracker() {
    const [incomes, setIncomes] = useState([]);
    const [summary, setSummary] = useState({ total_income: 0, total_expense: 0, net_savings: 0 });
    const [monthlyExpenses, setMonthlyExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        source: INCOME_SOURCES[0],
        amount: '',
        note: ''
    });

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        try {
            const [incRes, sumRes, monRes] = await Promise.all([
                fetchIncome(), fetchIncomeSummary(), fetchMonthly()
            ]);
            setIncomes(incRes);
            setSummary(sumRes);
            setMonthlyExpenses(monRes);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async () => {
        if (!formData.amount || parseFloat(formData.amount) <= 0) return;
        try {
            await addIncome({ ...formData, amount: parseFloat(formData.amount) });
            setFormData({ ...formData, amount: '', note: '' });
            setShowForm(false);
            await loadData();
        } catch (err) { console.error(err); }
    };

    const handleDelete = async (id) => {
        await deleteIncome(id);
        await loadData();
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: '110px', borderRadius: 'var(--rounded)' }}></div>)}
            </div>
        );
    }

    const savingsRate = summary.total_income > 0 ? ((summary.net_savings / summary.total_income) * 100).toFixed(1) : 0;

    const summaryCards = [
        { label: 'Total Income', value: `₹ ${summary.total_income.toLocaleString()}`, icon: <Wallet size={18} />, color: '#059669', bgColor: 'rgba(5, 150, 105, 0.1)' },
        { label: 'Total Expense', value: `₹ ${summary.total_expense.toLocaleString()}`, icon: <DollarSign size={18} />, color: '#ea580c', bgColor: 'rgba(234, 88, 12, 0.1)' },
        { label: 'Net Savings', value: `₹ ${summary.net_savings.toLocaleString()}`, icon: summary.net_savings >= 0 ? <TrendingUp size={18} /> : <TrendingDown size={18} />, color: summary.net_savings >= 0 ? '#059669' : '#dc2626', bgColor: summary.net_savings >= 0 ? 'rgba(5, 150, 105, 0.1)' : 'rgba(220, 38, 38, 0.1)' },
        { label: 'Savings Rate', value: `${savingsRate}%`, icon: <PiggyBank size={18} />, color: '#7c3aed', bgColor: 'rgba(124, 58, 237, 0.1)' },
    ];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem' }}>
                {summaryCards.map((card, idx) => (
                    <div key={idx} className="glass-panel stat-card" style={{ padding: '1.15rem' }}>
                        <div className="flex-between">
                            <span className="stat-label">{card.label}</span>
                            <div className="stat-icon" style={{ background: card.bgColor, color: card.color, width: '36px', height: '36px', borderRadius: '10px' }}>{card.icon}</div>
                        </div>
                        <div className="stat-value" style={{ fontSize: '1.4rem', marginTop: '0.4rem', color: card.color }}>{card.value}</div>
                    </div>
                ))}
            </div>

            {/* Savings Gauge Bar */}
            <div className="glass-panel" style={{ padding: '1.15rem' }}>
                <div className="flex-between" style={{ marginBottom: '0.6rem' }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>Income vs Expense</span>
                    <span style={{ fontSize: '0.82rem', fontWeight: 700, color: summary.net_savings >= 0 ? '#059669' : '#dc2626' }}>
                        {summary.net_savings >= 0 ? '✅' : '⚠️'} {savingsRate}% saved
                    </span>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <div style={{ flex: 1, height: '10px', borderRadius: '5px', background: 'rgba(5, 150, 105, 0.12)', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${Math.min(100, summary.total_income > 0 ? (summary.total_income / (summary.total_income + summary.total_expense)) * 100 : 50)}%`, background: 'linear-gradient(90deg, #059669, #0d9488)', borderRadius: '5px', transition: 'width 0.8s ease' }}></div>
                    </div>
                    <div style={{ flex: 1, height: '10px', borderRadius: '5px', background: 'rgba(234, 88, 12, 0.12)', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${Math.min(100, summary.total_expense > 0 ? (summary.total_expense / (summary.total_income + summary.total_expense)) * 100 : 50)}%`, background: 'linear-gradient(90deg, #ea580c, #f97316)', borderRadius: '5px', transition: 'width 0.8s ease' }}></div>
                    </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.35rem', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    <span>💚 Income: ₹{summary.total_income.toLocaleString()}</span>
                    <span>🔥 Expense: ₹{summary.total_expense.toLocaleString()}</span>
                </div>
            </div>

            {/* Add Income */}
            <div className="glass-panel" style={{ padding: '1.35rem' }}>
                <div className="flex-between" style={{ marginBottom: showForm ? '0.85rem' : 0 }}>
                    <h4 style={{ fontSize: '1.05rem', fontWeight: 700, fontFamily: "'Outfit', sans-serif" }}>Income Entries</h4>
                    <button className="btn-primary" onClick={() => setShowForm(!showForm)} style={{ padding: '0.55rem 0.9rem' }}>
                        <Plus size={14} /> Add Income
                    </button>
                </div>

                {showForm && (
                    <div style={{ padding: '1.15rem', background: 'var(--primary-surface)', borderRadius: 'var(--rounded-sm)', marginBottom: '0.85rem', animation: 'slideDown 0.3s ease' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.85rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.35rem', letterSpacing: '0.4px' }}>Date</label>
                                <input type="date" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.35rem', letterSpacing: '0.4px' }}>Source</label>
                                <select value={formData.source} onChange={e => setFormData({ ...formData, source: e.target.value })}>
                                    {INCOME_SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.35rem', letterSpacing: '0.4px' }}>Amount (₹)</label>
                                <input type="number" placeholder="0.00" value={formData.amount} onChange={e => setFormData({ ...formData, amount: e.target.value })} />
                            </div>
                            <div style={{ gridColumn: '1 / -1' }}>
                                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.35rem', letterSpacing: '0.4px' }}>Note</label>
                                <input type="text" placeholder="Optional note" value={formData.note} onChange={e => setFormData({ ...formData, note: e.target.value })} style={{ width: '100%' }} />
                            </div>
                        </div>
                        <button className="btn-primary" onClick={handleAdd} style={{ marginTop: '0.85rem', width: '100%' }}>Save Income</button>
                    </div>
                )}

                {/* Income List */}
                {incomes.length > 0 ? (
                    <div style={{ overflowX: 'auto' }}>
                        <table>
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Source</th>
                                    <th>Amount</th>
                                    <th>Note</th>
                                    <th style={{ width: '45px' }}></th>
                                </tr>
                            </thead>
                            <tbody>
                                {incomes.slice(0, 15).map((inc, idx) => (
                                    <tr key={inc.id} style={{ animation: `slideInRow 0.3s ease ${idx * 0.04}s backwards` }}>
                                        <td style={{ fontWeight: 500 }}>{inc.date}</td>
                                        <td><span className="badge" style={{ backgroundColor: 'rgba(5, 150, 105, 0.08)', color: '#059669', border: '1px solid rgba(5, 150, 105, 0.12)' }}>{inc.source}</span></td>
                                        <td style={{ fontWeight: 700, color: '#059669' }}>+ ₹ {inc.amount.toLocaleString()}</td>
                                        <td style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>{inc.note || '—'}</td>
                                        <td>
                                            <button onClick={() => handleDelete(inc.id)} className="action-btn action-btn-delete">
                                                <Trash2 size={13} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="empty-state" style={{ padding: '1.75rem' }}>
                        <div className="empty-state-icon"><Wallet size={26} color="#059669" /></div>
                        <h4>No income recorded</h4>
                        <p>Add your income to track net savings</p>
                    </div>
                )}
            </div>
        </div>
    );
}
