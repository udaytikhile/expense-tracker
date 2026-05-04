import React, { useEffect, useState } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
    LineChart, Line, PieChart, Pie, Cell, CartesianGrid, Legend
} from 'recharts';
import { fetchSummary, fetchMonthly, fetchDaily, fetchIncomeSummary } from './api';
import { TrendingUp, TrendingDown, DollarSign, Calendar, Target, Zap, Lightbulb, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const COLORS = ['#f97316', '#ea580c', '#fb923c', '#0d9488', '#7c3aed', '#d97706', '#059669', '#0284c7'];

const ChartTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="chart-tooltip">
                <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '0.2rem' }}>{label}</p>
                {payload.map((p, i) => (
                    <p key={i} style={{ color: p.color || '#f97316', fontWeight: 700, fontSize: '0.95rem' }}>
                        {p.name}: ₹ {p.value?.toLocaleString()}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

export default function Analytics() {
    const [summary, setSummary] = useState([]);
    const [monthly, setMonthly] = useState([]);
    const [daily, setDaily] = useState([]);
    const [incomeSummary, setIncomeSummary] = useState({ total_income: 0, total_expense: 0, net_savings: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [sumRes, monRes, dailyRes, incRes] = await Promise.all([
                fetchSummary(), fetchMonthly(), fetchDaily(30), fetchIncomeSummary()
            ]);
            setSummary(sumRes);
            setMonthly(monRes.map(m => ({ name: m.month, Total: m.total })));
            setDaily(dailyRes.map(d => ({ name: d.date.slice(5), Amount: d.total })));
            setIncomeSummary(incRes);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const totalSpent = summary.reduce((a, c) => a + c.total, 0);
    const avgDaily = daily.length > 0 ? totalSpent / Math.max(daily.length, 1) : 0;
    const topCategory = summary.length > 0 ? summary[0] : null;

    if (loading) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {[1, 2, 3].map(i => (
                    <div key={i} className="skeleton" style={{ height: '180px', borderRadius: 'var(--rounded)' }}></div>
                ))}
            </div>
        );
    }

    const insightCards = [
        { label: 'Total Spent', value: `₹ ${totalSpent.toLocaleString()}`, icon: <DollarSign size={18} />, color: '#f97316', bgColor: 'rgba(249, 115, 22, 0.1)' },
        { label: 'Avg Daily Spend', value: `₹ ${avgDaily.toFixed(0)}`, icon: <Calendar size={18} />, color: '#0d9488', bgColor: 'rgba(13, 148, 136, 0.1)' },
        { label: 'Top Category', value: topCategory ? topCategory.category.split(' ').slice(1).join(' ') : 'N/A', icon: <Target size={18} />, color: '#7c3aed', bgColor: 'rgba(124, 58, 237, 0.1)' },
        { label: 'Net Savings', value: `₹ ${incomeSummary.net_savings.toLocaleString()}`, icon: incomeSummary.net_savings >= 0 ? <TrendingUp size={18} /> : <TrendingDown size={18} />, color: incomeSummary.net_savings >= 0 ? '#059669' : '#dc2626', bgColor: incomeSummary.net_savings >= 0 ? 'rgba(5, 150, 105, 0.1)' : 'rgba(220, 38, 38, 0.1)' },
    ];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Insight Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '0.85rem' }}>
                {insightCards.map((card, idx) => (
                    <div key={idx} className="glass-panel stat-card" style={{ padding: '1.15rem' }}>
                        <div className="flex-between">
                            <span className="stat-label">{card.label}</span>
                            <div className="stat-icon" style={{ background: card.bgColor, color: card.color, width: '36px', height: '36px', borderRadius: '10px' }}>{card.icon}</div>
                        </div>
                        <div className="stat-value" style={{ fontSize: '1.4rem', marginTop: '0.4rem', color: card.color }}>{card.value}</div>
                    </div>
                ))}
            </div>

            {/* Spending Insights */}
            {topCategory && (
                <div className="insight-card" style={{ animation: 'fadeInUp 0.4s ease 0.15s backwards' }}>
                    <div className="insight-icon"><Lightbulb size={15} /></div>
                    <div style={{ fontSize: '0.86rem' }}>
                        <strong style={{ color: 'var(--text-main)' }}>Insight:</strong> You spend the most on {topCategory.category}
                        {totalSpent > 0 && ` — that's ${((topCategory.total / totalSpent) * 100).toFixed(0)}% of your total.`}
                        {avgDaily > 0 && ` Your average daily spend is ₹${avgDaily.toFixed(0)}.`}
                    </div>
                </div>
            )}

            {/* Daily Spending Trend */}
            <div className="glass-panel" style={{ padding: '1.35rem' }}>
                <h4 className="chart-card" style={{ marginBottom: '1rem', margin: 0, paddingBottom: '0.85rem' }}>Daily Spending (Last 30 Days)</h4>
                <div style={{ height: '260px' }}>
                    {daily.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={daily}>
                                <defs>
                                    <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                                        <stop offset="0%" stopColor="#f97316" />
                                        <stop offset="100%" stopColor="#ea580c" />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" />
                                <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'Inter' }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'Inter' }} axisLine={false} tickLine={false} />
                                <Tooltip content={<ChartTooltip />} />
                                <Line type="monotone" dataKey="Amount" stroke="url(#lineGrad)" strokeWidth={2.5} dot={{ fill: '#f97316', r: 2.5, strokeWidth: 0 }} activeDot={{ r: 5, stroke: 'white', strokeWidth: 2.5, fill: '#f97316' }} />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="empty-state">
                            <div className="empty-state-icon"><Zap size={26} color="var(--primary)" /></div>
                            <h4>No daily data yet</h4><p>Add expenses to see daily trends</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Category Spending + Distribution */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="glass-panel" style={{ padding: '1.35rem' }}>
                    <h4 className="chart-card" style={{ marginBottom: '1rem', margin: 0, paddingBottom: '0.85rem' }}>Spending by Category</h4>
                    <div style={{ height: '280px' }}>
                        {summary.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={summary.map(s => ({ name: s.category.split(' ').slice(1).join(' ').slice(0, 12), total: s.total }))} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" />
                                    <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'Inter' }} axisLine={false} />
                                    <YAxis type="category" dataKey="name" width={95} tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'Inter' }} axisLine={false} />
                                    <Tooltip content={<ChartTooltip />} />
                                    <Bar dataKey="total" radius={[0, 6, 6, 0]}>
                                        {summary.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="empty-state"><h4>No category data</h4></div>
                        )}
                    </div>
                </div>

                <div className="glass-panel" style={{ padding: '1.35rem' }}>
                    <h4 className="chart-card" style={{ marginBottom: '1rem', margin: 0, paddingBottom: '0.85rem' }}>Category Distribution</h4>
                    <div style={{ height: '280px' }}>
                        {summary.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={summary} cx="50%" cy="50%" innerRadius={50} outerRadius={85} paddingAngle={3} dataKey="total" nameKey="category" cornerRadius={4}>
                                        {summary.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                    </Pie>
                                    <Tooltip />
                                    <Legend formatter={(v) => v.split(' ').slice(1).join(' ')} wrapperStyle={{ fontSize: '0.75rem', fontFamily: 'Inter' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="empty-state"><h4>No data yet</h4></div>
                        )}
                    </div>
                </div>
            </div>

            {/* Monthly Trend */}
            <div className="glass-panel" style={{ padding: '1.35rem' }}>
                <h4 className="chart-card" style={{ marginBottom: '1rem', margin: 0, paddingBottom: '0.85rem' }}>Monthly Spending Trend</h4>
                <div style={{ height: '260px' }}>
                    {monthly.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={monthly}>
                                <defs>
                                    <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#f97316" stopOpacity={0.9} />
                                        <stop offset="100%" stopColor="#f97316" stopOpacity={0.4} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" />
                                <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'Inter' }} axisLine={false} />
                                <YAxis tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'Inter' }} axisLine={false} />
                                <Tooltip content={<ChartTooltip />} />
                                <Bar dataKey="Total" fill="url(#barGrad)" radius={[6, 6, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="empty-state"><h4>No monthly data</h4></div>
                    )}
                </div>
            </div>
        </div>
    );
}
