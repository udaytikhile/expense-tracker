import React, { useState } from 'react';
import { addExpense } from './api';
import { CheckCircle, Calendar, DollarSign, FileText, AlertCircle, Sparkles } from 'lucide-react';

const CATEGORIES = [
    { label: "Food & Dining", emoji: "🍔" },
    { label: "Transport", emoji: "🚗" },
    { label: "Housing & Rent", emoji: "🏠" },
    { label: "Health", emoji: "💊" },
    { label: "Shopping", emoji: "🛍️" },
    { label: "Entertainment", emoji: "🎬" },
    { label: "Education", emoji: "📚" },
    { label: "Travel", emoji: "✈️" },
    { label: "Utilities", emoji: "💡" },
    { label: "Business", emoji: "💼" },
    { label: "Gifts", emoji: "🎁" },
    { label: "Other", emoji: "📦" },
];

const getCategoryValue = (cat) => `${cat.emoji} ${cat.label}`;

export default function AddExpense({ onSuccess }) {
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        amount: '',
        category: getCategoryValue(CATEGORIES[0]),
        note: ''
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const selectCategory = (cat) => {
        setFormData({ ...formData, category: getCategoryValue(cat) });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const amount = parseFloat(formData.amount);
            if (isNaN(amount) || amount <= 0) throw new Error("Amount must be a positive number.");

            await addExpense({ ...formData, amount });
            setSuccess(true);
            setFormData({ ...formData, amount: '', note: '' });
            setTimeout(() => setSuccess(false), 3000);
            if (onSuccess) onSuccess();
        } catch (err) {
            setError(err.message || "Failed to add expense");
        } finally {
            setLoading(false);
        }
    };

    const displayAmount = formData.amount ? parseFloat(formData.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00';

    return (
        <div className="glass-panel form-card" style={{ padding: '2.25rem', maxWidth: '640px', margin: '0 auto', width: '100%' }}>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 700, fontFamily: "'Outfit', sans-serif" }}>
                Create New Expense
            </h3>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {/* Amount Display */}
                <div className="amount-display">
                    <span className="currency">₹ </span>
                    <span className={`amount-value ${formData.amount ? 'has-value' : ''}`}>{displayAmount}</span>
                </div>

                {/* Date & Amount Row */}
                <div style={{ display: 'flex', gap: '1.25rem' }}>
                    <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', flex: 1 }}>
                        <label>
                            <Calendar size={13} color="var(--primary)" />
                            Date
                        </label>
                        <input
                            type="date"
                            name="date"
                            value={formData.date}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', flex: 1 }}>
                        <label>
                            <DollarSign size={13} color="var(--primary)" />
                            Amount (₹)
                        </label>
                        <input
                            type="number"
                            step="0.01"
                            name="amount"
                            placeholder="0.00"
                            value={formData.amount}
                            onChange={handleChange}
                            required
                            style={{ fontSize: '1.05rem', fontWeight: 600 }}
                        />
                    </div>
                </div>

                {/* Category Grid */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.4px', textTransform: 'uppercase' }}>
                        <Sparkles size={13} color="var(--primary)" />
                        Category
                    </label>
                    <div className="category-grid">
                        {CATEGORIES.map(cat => (
                            <div
                                key={cat.label}
                                className={`category-chip ${formData.category === getCategoryValue(cat) ? 'selected' : ''}`}
                                onClick={() => selectCategory(cat)}
                            >
                                <span className="category-emoji">{cat.emoji}</span>
                                <span>{cat.label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Note */}
                <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <label>
                        <FileText size={13} color="var(--primary)" />
                        Note / Description
                    </label>
                    <textarea
                        name="note"
                        placeholder="What was this expense for?"
                        rows={3}
                        value={formData.note}
                        onChange={handleChange}
                        style={{ resize: 'vertical' }}
                    />
                </div>

                {error && (
                    <div className="error-toast">
                        <AlertCircle size={15} style={{ marginRight: '0.4rem', flexShrink: 0 }} />
                        {error}
                    </div>
                )}

                {success && (
                    <div className="success-toast">
                        <CheckCircle size={17} />
                        Expense added successfully! ✨
                    </div>
                )}

                <button
                    type="submit"
                    className="btn-primary"
                    disabled={loading}
                    style={{
                        marginTop: '0.25rem',
                        opacity: loading ? 0.7 : 1,
                        fontSize: '0.95rem',
                        padding: '0.9rem 1.5rem',
                    }}
                >
                    {loading ? (
                        <>
                            <span style={{
                                width: '16px',
                                height: '16px',
                                border: '2px solid rgba(255,255,255,0.3)',
                                borderTopColor: 'white',
                                borderRadius: '50%',
                                animation: 'spin 0.6s linear infinite',
                                display: 'inline-block',
                            }}></span>
                            Saving...
                        </>
                    ) : 'Save Expense'}
                </button>
            </form>
        </div>
    );
}
