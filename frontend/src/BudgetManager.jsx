import React, { useEffect, useState } from 'react';
import { fetchBudgets, saveBudget, deleteBudget } from './api';
import { Target, Plus, Trash2, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react';

const CATEGORIES = [
    "🍔 Food & Dining", "🚗 Transport", "🏠 Housing & Rent", "💊 Health",
    "🛍️ Shopping", "🎬 Entertainment", "📚 Education", "✈️ Travel",
    "💡 Utilities", "💼 Business", "🎁 Gifts", "📦 Other",
];

export default function BudgetManager({ onAlert }) {
    const [budgets, setBudgets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({ category: CATEGORIES[0], limit_amount: '' });
    const [saving, setSaving] = useState(false);

    const currentMonth = new Date().toISOString().slice(0, 7);

    useEffect(() => {
        loadBudgets();
    }, []);

    const loadBudgets = async () => {
        try {
            const data = await fetchBudgets(currentMonth);
            setBudgets(data);
            data.forEach(b => {
                if (b.percentage >= 90 && onAlert) {
                    onAlert({
                        type: b.percentage >= 100 ? 'danger' : 'warning',
                        message: b.percentage >= 100
                            ? `🚨 Over budget on ${b.category}! (${b.percentage}%)`
                            : `⚠️ Near limit on ${b.category} (${b.percentage}%)`
                    });
                }
            });
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!formData.limit_amount || parseFloat(formData.limit_amount) <= 0) return;
        setSaving(true);
        try {
            await saveBudget({ ...formData, limit_amount: parseFloat(formData.limit_amount), month: currentMonth });
            setFormData({ category: CATEGORIES[0], limit_amount: '' });
            setShowForm(false);
            await loadBudgets();
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        await deleteBudget(id);
        await loadBudgets();
    };

    const getBarColor = (pct) => {
        if (pct >= 100) return '#dc2626';
        if (pct >= 75) return '#d97706';
        return '#059669';
    };

    const getStatusGlow = (pct) => {
        if (pct >= 100) return '0 0 8px rgba(220, 38, 38, 0.2)';
        if (pct >= 75) return '0 0 8px rgba(217, 119, 6, 0.2)';
        return '0 0 8px rgba(5, 150, 105, 0.15)';
    };

    const totalBudget = budgets.reduce((a, b) => a + b.limit_amount, 0);
    const totalSpent = budgets.reduce((a, b) => a + b.spent, 0);
    const overallPct = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

    if (loading) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: '90px', borderRadius: 'var(--rounded)' }}></div>)}
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Overview Card */}
            <div className="glass-panel" style={{ padding: '1.35rem' }}>
                <div className="flex-between" style={{ marginBottom: '0.85rem' }}>
                    <div>
                        <h4 style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Overall Budget</h4>
                        <div style={{ fontSize: '1.6rem', fontWeight: 800, marginTop: '0.2rem', fontFamily: "'Outfit', sans-serif" }}>
                            ₹ {totalSpent.toLocaleString()} <span style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-muted)' }}>/ ₹ {totalBudget.toLocaleString()}</span>
                        </div>
                    </div>
                    <button className="btn-primary" onClick={() => setShowForm(!showForm)} style={{ padding: '0.6rem 1.1rem' }}>
                        <Plus size={15} /> Set Budget
                    </button>
                </div>
                <div className="budget-bar-track" style={{ height: '8px' }}>
                    <div className="budget-bar-fill" style={{ width: `${Math.min(overallPct, 100)}%`, background: `linear-gradient(90deg, ${getBarColor(overallPct)}, ${getBarColor(overallPct)}aa)`, boxShadow: getStatusGlow(overallPct) }}></div>
                </div>
                <div style={{ textAlign: 'right', fontSize: '0.75rem', color: getBarColor(overallPct), fontWeight: 700, marginTop: '0.3rem' }}>
                    {overallPct.toFixed(1)}% used
                </div>
            </div>

            {/* Add Budget Form */}
            {showForm && (
                <div className="glass-panel" style={{ padding: '1.35rem', animation: 'slideDown 0.3s ease' }}>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.85rem', fontFamily: "'Outfit', sans-serif" }}>Set Category Budget for {currentMonth}</h4>
                    <div style={{ display: 'flex', gap: '0.85rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                        <div style={{ flex: 2, minWidth: '180px' }}>
                            <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.35rem', letterSpacing: '0.4px' }}>Category</label>
                            <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
                                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div style={{ flex: 1, minWidth: '130px' }}>
                            <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.35rem', letterSpacing: '0.4px' }}>Limit (₹)</label>
                            <input type="number" placeholder="5000" value={formData.limit_amount} onChange={e => setFormData({ ...formData, limit_amount: e.target.value })} />
                        </div>
                        <button className="btn-primary" onClick={handleSave} disabled={saving} style={{ padding: '0.8rem 1.35rem' }}>
                            {saving ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                </div>
            )}

            {/* Budget List */}
            {budgets.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '0.85rem' }}>
                    {budgets.map((b, idx) => (
                        <div key={b.id} className="glass-panel" style={{
                            padding: '1.15rem',
                            animation: `fadeInUp 0.35s ease ${idx * 0.04}s backwards`,
                            borderLeft: `3px solid ${getBarColor(b.percentage)}`,
                        }}>
                            <div className="flex-between" style={{ marginBottom: '0.65rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                                    <div style={{
                                        width: '8px', height: '8px', borderRadius: '50%',
                                        background: getBarColor(b.percentage),
                                        boxShadow: getStatusGlow(b.percentage),
                                    }}></div>
                                    <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{b.category}</span>
                                </div>
                                <button onClick={() => handleDelete(b.id)} style={{ background: 'transparent', padding: '0.3rem', color: 'var(--text-muted)' }}>
                                    <Trash2 size={14} />
                                </button>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '0.45rem' }}>
                                <span style={{ color: 'var(--text-muted)' }}>₹ {b.spent.toLocaleString()} spent</span>
                                <span style={{ fontWeight: 600 }}>₹ {b.limit_amount.toLocaleString()} limit</span>
                            </div>
                            <div className="budget-bar-track">
                                <div className="budget-bar-fill" style={{ width: `${Math.min(b.percentage, 100)}%`, background: `linear-gradient(90deg, ${getBarColor(b.percentage)}, ${getBarColor(b.percentage)}bb)` }}></div>
                            </div>
                            <div style={{ textAlign: 'right', fontSize: '0.72rem', color: getBarColor(b.percentage), fontWeight: 700, marginTop: '0.2rem' }}>
                                {b.percentage}%
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="glass-panel" style={{ padding: '2.5rem', textAlign: 'center' }}>
                    <div className="empty-state">
                        <div className="empty-state-icon"><Target size={28} color="var(--primary)" /></div>
                        <h4>No budgets set</h4>
                        <p>Set monthly budgets to track your spending limits per category.</p>
                    </div>
                </div>
            )}
        </div>
    );
}
