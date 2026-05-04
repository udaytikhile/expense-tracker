import React, { useEffect, useState } from 'react';
import { fetchRecurring, addRecurring, deleteRecurring, toggleRecurring, processRecurring } from './api';
import { Repeat, Plus, Trash2, Play, Pause, Zap, Calendar } from 'lucide-react';

const CATEGORIES = [
    "🍔 Food & Dining", "🚗 Transport", "🏠 Housing & Rent", "💊 Health",
    "🛍️ Shopping", "🎬 Entertainment", "📚 Education", "✈️ Travel",
    "💡 Utilities", "💼 Business", "🎁 Gifts", "📦 Other",
];

export default function RecurringExpenses() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [processResult, setProcessResult] = useState('');
    const [formData, setFormData] = useState({
        category: CATEGORIES[0],
        amount: '',
        note: '',
        frequency: 'monthly',
        next_date: new Date().toISOString().split('T')[0]
    });

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        try {
            const data = await fetchRecurring();
            setItems(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async () => {
        if (!formData.amount || parseFloat(formData.amount) <= 0) return;
        try {
            await addRecurring({ ...formData, amount: parseFloat(formData.amount) });
            setFormData({ category: CATEGORIES[0], amount: '', note: '', frequency: 'monthly', next_date: new Date().toISOString().split('T')[0] });
            setShowForm(false);
            await loadData();
        } catch (err) { console.error(err); }
    };

    const handleDelete = async (id) => {
        await deleteRecurring(id);
        await loadData();
    };

    const handleToggle = async (id) => {
        await toggleRecurring(id);
        await loadData();
    };

    const handleProcess = async () => {
        setProcessing(true);
        try {
            const res = await processRecurring();
            setProcessResult(res.message);
            setTimeout(() => setProcessResult(''), 3000);
            await loadData();
        } finally {
            setProcessing(false);
        }
    };

    const freqLabel = { daily: 'Daily', weekly: 'Weekly', monthly: 'Monthly' };
    const freqColor = { daily: '#0d9488', weekly: '#7c3aed', monthly: '#f97316' };

    if (loading) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: '75px', borderRadius: 'var(--rounded)' }}></div>)}
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Header */}
            <div className="glass-panel" style={{ padding: '1.35rem' }}>
                <div className="flex-between">
                    <div>
                        <h4 style={{ fontSize: '1.05rem', fontWeight: 700, fontFamily: "'Outfit', sans-serif" }}>Recurring Expenses</h4>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: '0.2rem' }}>{items.filter(i => i.active).length} active subscriptions</p>
                    </div>
                    <div style={{ display: 'flex', gap: '0.6rem' }}>
                        <button className="btn-secondary" onClick={handleProcess} disabled={processing} style={{ padding: '0.55rem 0.9rem' }}>
                            <Zap size={14} /> {processing ? 'Processing...' : 'Process Due'}
                        </button>
                        <button className="btn-primary" onClick={() => setShowForm(!showForm)} style={{ padding: '0.55rem 0.9rem' }}>
                            <Plus size={14} /> Add
                        </button>
                    </div>
                </div>
                {processResult && (
                    <div className="success-toast" style={{ marginTop: '0.85rem' }}>{processResult}</div>
                )}
            </div>

            {/* Add Form */}
            {showForm && (
                <div className="glass-panel" style={{ padding: '1.35rem', animation: 'slideDown 0.3s ease' }}>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.85rem', fontFamily: "'Outfit', sans-serif" }}>New Recurring Expense</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.35rem', letterSpacing: '0.4px' }}>Category</label>
                            <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
                                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.35rem', letterSpacing: '0.4px' }}>Amount (₹)</label>
                            <input type="number" placeholder="0.00" value={formData.amount} onChange={e => setFormData({ ...formData, amount: e.target.value })} />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.35rem', letterSpacing: '0.4px' }}>Frequency</label>
                            <select value={formData.frequency} onChange={e => setFormData({ ...formData, frequency: e.target.value })}>
                                <option value="daily">Daily</option>
                                <option value="weekly">Weekly</option>
                                <option value="monthly">Monthly</option>
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.35rem', letterSpacing: '0.4px' }}>Next Date</label>
                            <input type="date" value={formData.next_date} onChange={e => setFormData({ ...formData, next_date: e.target.value })} />
                        </div>
                        <div style={{ gridColumn: '1 / -1' }}>
                            <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.35rem', letterSpacing: '0.4px' }}>Note</label>
                            <input type="text" placeholder="e.g. Netflix subscription" value={formData.note} onChange={e => setFormData({ ...formData, note: e.target.value })} />
                        </div>
                    </div>
                    <button className="btn-primary" onClick={handleAdd} style={{ marginTop: '0.85rem', width: '100%' }}>Save Recurring Expense</button>
                </div>
            )}

            {/* Items List */}
            {items.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    {items.map((item, idx) => (
                        <div key={item.id} className="glass-panel" style={{
                            padding: '1.1rem 1.25rem',
                            opacity: item.active ? 1 : 0.45,
                            animation: `fadeInUp 0.35s ease ${idx * 0.04}s backwards`,
                            borderLeft: `3px solid ${item.active ? freqColor[item.frequency] : '#94a3b8'}`,
                            transition: 'opacity 0.3s ease',
                        }}>
                            <div className="flex-between">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                                    <div style={{
                                        width: '40px', height: '40px', borderRadius: '11px',
                                        background: item.active ? `${freqColor[item.frequency]}15` : 'rgba(0,0,0,0.04)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        transition: 'var(--transition)',
                                    }}>
                                        <Repeat size={18} color={item.active ? freqColor[item.frequency] : '#94a3b8'} />
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 600, fontSize: '0.92rem' }}>{item.category}</div>
                                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                            {item.note || 'No description'}
                                            <span style={{ width: '3px', height: '3px', borderRadius: '50%', background: 'var(--text-muted)', display: 'inline-block' }}></span>
                                            <span className="badge" style={{
                                                background: `${freqColor[item.frequency]}12`,
                                                color: freqColor[item.frequency],
                                                border: `1px solid ${freqColor[item.frequency]}25`,
                                                padding: '0.1rem 0.5rem',
                                                fontSize: '0.68rem',
                                            }}>{freqLabel[item.frequency]}</span>
                                        </div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontWeight: 700, fontSize: '1.05rem', color: item.active ? '#ea580c' : 'var(--text-muted)' }}>₹ {item.amount.toLocaleString()}</div>
                                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.2rem', justifyContent: 'flex-end' }}>
                                            <Calendar size={10} /> Next: {item.next_date}
                                        </div>
                                    </div>
                                    <button onClick={() => handleToggle(item.id)} style={{
                                        background: item.active ? 'rgba(5, 150, 105, 0.08)' : 'rgba(0,0,0,0.04)',
                                        padding: '0.35rem',
                                        color: item.active ? '#059669' : '#94a3b8',
                                        borderRadius: '8px',
                                        border: `1px solid ${item.active ? 'rgba(5, 150, 105, 0.15)' : 'transparent'}`,
                                    }}>
                                        {item.active ? <Pause size={15} /> : <Play size={15} />}
                                    </button>
                                    <button onClick={() => handleDelete(item.id)} style={{
                                        background: 'transparent',
                                        padding: '0.35rem',
                                        color: '#dc2626',
                                        borderRadius: '8px',
                                    }}>
                                        <Trash2 size={15} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="glass-panel" style={{ padding: '2.5rem', textAlign: 'center' }}>
                    <div className="empty-state">
                        <div className="empty-state-icon"><Repeat size={28} color="var(--primary)" /></div>
                        <h4>No recurring expenses</h4>
                        <p>Set up auto-repeating expenses like rent, subscriptions, etc.</p>
                    </div>
                </div>
            )}
        </div>
    );
}
