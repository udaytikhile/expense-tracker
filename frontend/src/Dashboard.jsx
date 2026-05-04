import React, { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { fetchExpenses, fetchSummary, fetchMonthly, deleteExpense, updateExpense, fetchIncomeSummary } from './api';
import { Wallet, TrendingUp, Tag, Receipt, CreditCard, Clock, Search, Trash2, Edit3, X, Check, Filter, Lightbulb, PlusCircle, BarChart3 } from 'lucide-react';

const COLORS = ['#f97316', '#ea580c', '#fb923c', '#0d9488', '#7c3aed', '#d97706'];

const CATEGORIES = [
    "🍔 Food & Dining", "🚗 Transport", "🏠 Housing & Rent", "💊 Health",
    "🛍️ Shopping", "🎬 Entertainment", "📚 Education", "✈️ Travel",
    "💡 Utilities", "💼 Business", "🎁 Gifts", "📦 Other",
];

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="chart-tooltip">
                <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '0.2rem' }}>{label}</p>
                <p style={{ color: '#f97316', fontWeight: 700, fontSize: '1.05rem' }}>₹ {payload[0].value?.toLocaleString()}</p>
            </div>
        );
    }
    return null;
};

export default function Dashboard() {
    const [expenses, setExpenses] = useState([]);
    const [summary, setSummary] = useState([]);
    const [monthly, setMonthly] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterCategory, setFilterCategory] = useState('All');
    const [filterStart, setFilterStart] = useState('');
    const [filterEnd, setFilterEnd] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [editData, setEditData] = useState({});
    const [incomeSummary, setIncomeSummary] = useState({ total_income: 0, total_expense: 0, net_savings: 0 });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [expRes, sumRes, monRes, incRes] = await Promise.all([
                fetchExpenses(filterStart || undefined, filterEnd || undefined, filterCategory, searchQuery || undefined),
                fetchSummary(),
                fetchMonthly(),
                fetchIncomeSummary()
            ]);
            setExpenses(expRes);
            setSummary(sumRes);
            setMonthly(monRes.map(m => ({ name: m.month, Total: m.total })));
            setIncomeSummary(incRes);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => loadData();
    const handleClearFilters = () => {
        setSearchQuery('');
        setFilterCategory('All');
        setFilterStart('');
        setFilterEnd('');
        setTimeout(() => loadData(), 50);
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this expense?')) return;
        await deleteExpense(id);
        await loadData();
    };

    const startEdit = (exp) => {
        setEditingId(exp.id);
        setEditData({ date: exp.date, category: exp.category, amount: exp.amount, note: exp.note || '' });
    };

    const cancelEdit = () => { setEditingId(null); setEditData({}); };

    const saveEdit = async (id) => {
        await updateExpense(id, editData);
        setEditingId(null);
        setEditData({});
        await loadData();
    };

    const totalSpent = summary.reduce((acc, curr) => acc + curr.total, 0);
    const expenseCount = expenses.length;

    if (loading) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="skeleton" style={{ height: '120px', borderRadius: 'var(--rounded)' }}></div>
                    ))}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.25rem' }}>
                    <div className="skeleton" style={{ height: '340px', borderRadius: 'var(--rounded)' }}></div>
                    <div className="skeleton" style={{ height: '340px', borderRadius: 'var(--rounded)' }}></div>
                </div>
            </div>
        );
    }

    const statCards = [
        { label: 'Total Spent', value: `₹ ${totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, icon: <Wallet size={20} />, color: '#f97316', bgColor: 'rgba(249, 115, 22, 0.1)' },
        { label: 'Net Savings', value: `₹ ${incomeSummary.net_savings.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, icon: <TrendingUp size={20} />, color: incomeSummary.net_savings >= 0 ? '#059669' : '#dc2626', bgColor: incomeSummary.net_savings >= 0 ? 'rgba(5, 150, 105, 0.1)' : 'rgba(220, 38, 38, 0.1)' },
        { label: 'Transactions', value: expenseCount, icon: <Receipt size={20} />, color: '#0d9488', bgColor: 'rgba(13, 148, 136, 0.1)' },
        ...(summary.slice(0, 1).map((cat) => ({
            label: `Top: ${cat.category.split(' ').slice(1).join(' ')}`,
            value: `₹ ${cat.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
            icon: <Tag size={20} />,
            color: '#7c3aed',
            bgColor: 'rgba(124, 58, 237, 0.1)',
        }))),
    ];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Search & Filter Bar */}
            <div className="glass-panel" style={{ padding: '0.9rem 1.15rem' }}>
                <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center' }}>
                    <div className="search-input-wrapper" style={{ flex: 1, position: 'relative' }}>
                        <Search size={15} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input
                            type="text"
                            placeholder="Search expenses..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleSearch()}
                            style={{ paddingLeft: '2.4rem', width: '100%' }}
                        />
                    </div>
                    <button className="btn-secondary" onClick={() => setShowFilters(!showFilters)} style={{ padding: '0.7rem 0.9rem' }}>
                        <Filter size={14} /> Filters
                    </button>
                    <button className="btn-primary" onClick={handleSearch} style={{ padding: '0.7rem 1.1rem' }}>
                        <Search size={14} /> Search
                    </button>
                </div>

                {showFilters && (
                    <div style={{ display: 'flex', gap: '0.85rem', marginTop: '0.85rem', flexWrap: 'wrap', animation: 'slideDown 0.3s ease' }}>
                        <div style={{ flex: 1, minWidth: '130px' }}>
                            <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>From</label>
                            <input type="date" value={filterStart} onChange={e => setFilterStart(e.target.value)} style={{ marginTop: '0.25rem' }} />
                        </div>
                        <div style={{ flex: 1, minWidth: '130px' }}>
                            <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>To</label>
                            <input type="date" value={filterEnd} onChange={e => setFilterEnd(e.target.value)} style={{ marginTop: '0.25rem' }} />
                        </div>
                        <div style={{ flex: 1, minWidth: '160px' }}>
                            <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>Category</label>
                            <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} style={{ marginTop: '0.25rem' }}>
                                <option value="All">All Categories</option>
                                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                            <button onClick={handleClearFilters} style={{ background: 'transparent', padding: '0.65rem', color: 'var(--text-muted)' }}>
                                <X size={15} /> Clear
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                {statCards.map((card, idx) => (
                    <div key={idx} className="glass-panel stat-card" style={{ padding: '1.35rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                        <div className="flex-between">
                            <span className="stat-label">{card.label}</span>
                            <div className="stat-icon" style={{ background: card.bgColor, color: card.color }}>{card.icon}</div>
                        </div>
                        <div className="stat-value" style={{ fontSize: typeof card.value === 'number' ? '2.1rem' : '1.6rem', color: card.color }}>{card.value}</div>
                        <div style={{ height: '3px', borderRadius: '2px', background: `linear-gradient(to right, ${card.color}, transparent)`, opacity: 0.25 }}></div>
                    </div>
                ))}
            </div>

            {/* Spending Insight */}
            {summary.length > 1 && (
                <div className="insight-card" style={{ animation: 'fadeInUp 0.5s ease 0.2s backwards' }}>
                    <div className="insight-icon"><Lightbulb size={16} /></div>
                    <div>
                        <strong style={{ color: 'var(--text-main)', fontSize: '0.9rem' }}>Spending Insight:</strong>{' '}
                        Your top category is <strong>{summary[0].category}</strong> at ₹{summary[0].total.toLocaleString()}.
                        {summary.length > 1 && ` That's ${((summary[0].total / totalSpent) * 100).toFixed(0)}% of your total spending.`}
                    </div>
                </div>
            )}

            {/* Charts Section */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
                <div className="glass-panel chart-card" style={{ padding: '1.35rem' }}>
                    <div className="flex-between" style={{ marginBottom: '1.25rem' }}>
                        <h4 className="chart-card" style={{ margin: 0 }}>Monthly Trend</h4>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', background: 'var(--primary-surface)', padding: '0.25rem 0.65rem', borderRadius: 'var(--rounded-full)', fontWeight: 600 }}>
                            <Clock size={11} style={{ marginRight: '3px', verticalAlign: 'middle' }} /> Last 12 months
                        </span>
                    </div>
                    <div style={{ height: '280px' }}>
                        {monthly.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={monthly}>
                                    <defs>
                                        <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#f97316" stopOpacity={0.25} />
                                            <stop offset="95%" stopColor="#f97316" stopOpacity={0.02} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="name" stroke="transparent" tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'Inter' }} axisLine={false} tickLine={false} />
                                    <YAxis stroke="transparent" tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'Inter' }} axisLine={false} tickLine={false} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Area type="monotone" dataKey="Total" stroke="#f97316" strokeWidth={2.5} fillOpacity={1} fill="url(#colorTotal)" dot={{ fill: '#f97316', strokeWidth: 0, r: 0 }} activeDot={{ fill: '#f97316', strokeWidth: 3, stroke: 'white', r: 5 }} />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="empty-state">
                                <div className="empty-state-icon"><TrendingUp size={26} color="var(--primary)" /></div>
                                <h4>No trend data yet</h4><p>Add some expenses to see your monthly trends</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="glass-panel chart-card" style={{ padding: '1.35rem' }}>
                    <h4 style={{ marginBottom: '1.25rem' }}>Category Breakdown</h4>
                    <div style={{ height: '250px' }}>
                        {summary.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={summary} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="total" nameKey="category" cornerRadius={4}>
                                        {summary.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                    </Pie>
                                    <Tooltip contentStyle={{ background: 'var(--bg-card-solid)', border: '1px solid rgba(249, 115, 22, 0.12)', borderRadius: '12px', boxShadow: '0 8px 24px rgba(0,0,0,0.06)', fontFamily: 'Inter' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="empty-state">
                                <div className="empty-state-icon"><Tag size={26} color="var(--primary)" /></div>
                                <h4>No categories yet</h4><p>Your spending breakdown will appear here</p>
                            </div>
                        )}
                    </div>
                    {summary.length > 0 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.85rem' }}>
                            {summary.map((cat, idx) => (
                                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.78rem' }}>
                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: COLORS[idx % COLORS.length], flexShrink: 0 }}></div>
                                    <span style={{ color: 'var(--text-muted)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cat.category}</span>
                                    <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>₹ {cat.total.toLocaleString()}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Recent Transactions Table */}
            <div className="glass-panel table-card" style={{ padding: '1.35rem' }}>
                <div className="flex-between" style={{ marginBottom: '1.25rem' }}>
                    <h4 style={{ color: 'var(--text-muted)', fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                        Recent Transactions
                    </h4>
                    {expenses.length > 0 && (
                        <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 700, background: 'var(--primary-light)', padding: '0.2rem 0.65rem', borderRadius: 'var(--rounded-full)' }}>
                            {expenses.length} total
                        </span>
                    )}
                </div>

                {expenses.length > 0 ? (
                    <div style={{ overflowX: 'auto' }}>
                        <table>
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Category</th>
                                    <th>Amount</th>
                                    <th>Note</th>
                                    <th style={{ width: '90px', textAlign: 'center' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {expenses.slice(0, 15).map((exp, idx) => (
                                    <tr key={exp.id} style={{ animation: `slideInRow 0.3s ease ${idx * 0.04}s backwards` }}>
                                        {editingId === exp.id ? (
                                            <>
                                                <td><input type="date" value={editData.date} onChange={e => setEditData({ ...editData, date: e.target.value })} style={{ padding: '0.35rem', fontSize: '0.82rem' }} /></td>
                                                <td>
                                                    <select value={editData.category} onChange={e => setEditData({ ...editData, category: e.target.value })} style={{ padding: '0.35rem', fontSize: '0.82rem' }}>
                                                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                                    </select>
                                                </td>
                                                <td><input type="number" value={editData.amount} onChange={e => setEditData({ ...editData, amount: parseFloat(e.target.value) })} style={{ padding: '0.35rem', fontSize: '0.82rem', width: '90px' }} /></td>
                                                <td><input type="text" value={editData.note} onChange={e => setEditData({ ...editData, note: e.target.value })} style={{ padding: '0.35rem', fontSize: '0.82rem' }} /></td>
                                                <td style={{ textAlign: 'center' }}>
                                                    <div style={{ display: 'flex', gap: '0.2rem', justifyContent: 'center' }}>
                                                        <button onClick={() => saveEdit(exp.id)} className="action-btn action-btn-save"><Check size={13} /></button>
                                                        <button onClick={cancelEdit} className="action-btn action-btn-cancel"><X size={13} /></button>
                                                    </div>
                                                </td>
                                            </>
                                        ) : (
                                            <>
                                                <td>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                                                        <CreditCard size={14} color="var(--text-muted)" />
                                                        <span style={{ fontWeight: 500 }}>{exp.date}</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className="badge" style={{ backgroundColor: 'var(--primary-light)', color: '#ea580c', border: '1px solid rgba(249, 115, 22, 0.1)' }}>
                                                        {exp.category}
                                                    </span>
                                                </td>
                                                <td style={{ fontWeight: 700, color: '#ea580c' }}>₹ {exp.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                                <td style={{ color: 'var(--text-muted)', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.88rem' }}>{exp.note || '—'}</td>
                                                <td style={{ textAlign: 'center' }}>
                                                    <div style={{ display: 'flex', gap: '0.2rem', justifyContent: 'center' }}>
                                                        <button onClick={() => startEdit(exp)} className="action-btn action-btn-edit"><Edit3 size={13} /></button>
                                                        <button onClick={() => handleDelete(exp.id)} className="action-btn action-btn-delete"><Trash2 size={13} /></button>
                                                    </div>
                                                </td>
                                            </>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="empty-state">
                        <div className="empty-state-icon"><Receipt size={28} color="var(--primary)" /></div>
                        <h4>No transactions yet</h4>
                        <p>Add your first expense to start tracking your spending</p>
                    </div>
                )}
            </div>
        </div>
    );
}
